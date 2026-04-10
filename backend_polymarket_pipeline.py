"""
polymarket_pipeline.py -- Polymarket discovery pipeline using Nansen prediction-market endpoints.

Mirrors the token discovery flow but for prediction markets. Pulls hot markets,
extracts whale positions, grades their history, and flags convergence signals
(wallets appearing across multiple hot markets).

All calls metered via nansen_client.log_command so they show up in the command
log UI just like token discovery calls.

Runs on-demand via /api/polymarket/discovery/run. Default cadence when
automated: 6 hours (POLYMARKET_SCAN_INTERVAL_MINUTES=360).
"""
import os
import json
from datetime import datetime, timezone
from typing import Optional

from nansen_client import nansen_call, get_credits, clear_command_log, log_command
from config import CONFIG

DATA_DIR = CONFIG["data_dir"]
POLYMARKET_LATEST_FILE = "polymarket_latest.json"


def _extract(data: dict) -> list:
    """Handle nested data.data responses from Nansen CLI."""
    if not data or not data.get("success"):
        return []
    items = data.get("data", {})
    if isinstance(items, dict):
        items = items.get("data", [])
    return items if isinstance(items, list) else []


def _save(data: dict, filename: str):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(os.path.join(DATA_DIR, filename), "w") as f:
        json.dump(data, f, indent=2, default=str)


def _grade_whale(total_volume_usd: float, unrealized_pnl: float, position_count: int) -> str:
    """
    Grade a Polymarket whale by size + profitability.
    Mirrors the token wallet grader structure (S/A/B/C/D).

    Since pnl-by-address often returns empty for Polymarket proxies, we grade
    based on current position size and unrealized PnL performance as a proxy.
    """
    # Size component — bigger position = bigger "smart money" signal
    if total_volume_usd >= 1_000_000:
        size_score = 40
    elif total_volume_usd >= 250_000:
        size_score = 30
    elif total_volume_usd >= 50_000:
        size_score = 20
    elif total_volume_usd >= 10_000:
        size_score = 10
    else:
        size_score = 5

    # PnL component — absolute dollar gain from current positions
    if unrealized_pnl >= 50_000:
        pnl_score = 40
    elif unrealized_pnl >= 10_000:
        pnl_score = 30
    elif unrealized_pnl >= 1_000:
        pnl_score = 20
    elif unrealized_pnl >= 0:
        pnl_score = 10
    else:
        pnl_score = 0

    # Breadth component — wallets holding positions across multiple markets
    # show systematic trading, not just single-market gambling
    breadth_score = min(20, position_count * 5)

    total = size_score + pnl_score + breadth_score

    if total >= 85:
        return "S"
    if total >= 65:
        return "A"
    if total >= 45:
        return "B"
    if total >= 25:
        return "C"
    return "D"


def polymarket_discovery(
    top_n_markets: int = 20,
    deep_dive_top: int = 5,
    notify_fn=None,
    save: bool = True,
) -> dict:
    """
    Polymarket discovery pipeline using the new Nansen prediction-market endpoints.

    Pipeline stages (funnel):
      1. market-screener             → top N hot markets (1 cr)
      2. top-holders × deep_dive_top → whale positions  (5 × 5 = 25 cr)
      3. trades-by-market × deep_dive_top → recent flow (5 × 1 = 5 cr)
      4. Grade whales from positions                    (0 cr, local)
      5. Convergence: wallets across ≥2 hot markets     (0 cr, local)

    Total: ~31 credits per run.

    Returns:
      {
        "timestamp": iso,
        "funnel": {
          "scanned_markets": N,
          "hot_markets": N,
          "deep_dive_markets": deep_dive_top,
          "unique_whales": int,
          "graded_whales": int,
          "convergence_whales": int,
        },
        "markets": [...],         # all scanned markets
        "hot_markets": [...],     # top deep_dive_top with whale data
        "whales": [...],          # all unique whales with grades
        "convergence": [...],     # wallets appearing in ≥2 hot markets
        "credits": {"before": int, "after": int, "used": int},
      }
    """
    c_start = get_credits()
    clear_command_log()
    log = {"steps": [], "start": datetime.now(timezone.utc).isoformat()}

    # ── Step 1: Market Screener (1 credit) ──
    # Request a larger pool so we have headroom after filtering out closed / expired markets.
    raw_pool_size = max(top_n_markets * 3, 50)
    screener_data = nansen_call("research prediction-market market-screener", {
        "sort-by": "volume_24hr",
        "limit": str(raw_pool_size),
    })
    markets_raw = _extract(screener_data)

    # Filter: only LIVE markets (active=true, closed=false, end_date in the future)
    now_iso = datetime.now(timezone.utc).isoformat()
    def _is_live(m: dict) -> bool:
        if m.get("closed") is True:
            return False
        if m.get("active") is False:
            return False
        end = m.get("end_date") or ""
        if end and end < now_iso:
            return False
        # Fully-priced markets (best_bid >= 0.99 or best_ask <= 0.01) are de-facto resolved
        bb = float(m.get("best_bid") or 0)
        ba = float(m.get("best_ask") or 0)
        if bb >= 0.99 or (ba > 0 and ba <= 0.01):
            return False
        return True

    live_markets = [m for m in markets_raw if _is_live(m)]
    # Trim back down to the requested top_n after filtering
    markets_raw = live_markets[:top_n_markets]

    log_command(
        "PM Market Screener",
        f"nansen research prediction-market market-screener --sort-by volume_24hr --limit {raw_pool_size} --json",
        1, 0,
        f"{len(live_markets)} live markets (filtered from {len(_extract(screener_data))} raw), keeping top {len(markets_raw)}",
    )
    log["steps"].append({
        "step": "market_screener",
        "raw": len(_extract(screener_data)),
        "live": len(live_markets),
        "kept": len(markets_raw),
    })

    # Normalise market records
    markets = []
    for m in markets_raw:
        best_bid = float(m.get("best_bid") or 0)
        best_ask = float(m.get("best_ask") or 0)
        implied_prob = (best_bid + best_ask) / 2 if (best_bid or best_ask) else 0
        markets.append({
            "market_id": str(m.get("market_id", "")),
            "question": m.get("question", ""),
            "event_title": m.get("event_title", ""),
            "event_id": str(m.get("event_id", "")),
            "tags": m.get("tags", []),
            "end_date": m.get("end_date", ""),
            "volume": float(m.get("volume") or 0),
            "volume_24hr": float(m.get("volume_24hr") or 0),
            "volume_1wk": float(m.get("volume_1wk") or 0),
            "liquidity": float(m.get("liquidity") or 0),
            "open_interest": float(m.get("open_interest") or 0),
            "volume_change_pct": float(m.get("volume_change_pct") or 0),
            "best_bid": best_bid,
            "best_ask": best_ask,
            "last_trade_price": float(m.get("last_trade_price") or 0),
            "one_day_price_change": float(m.get("one_day_price_change") or 0),
            "implied_prob": implied_prob,
            "unique_traders_24h": int(m.get("unique_traders_24h") or 0),
            "age_hours": int(m.get("age_hours") or 0),
            "slug": m.get("slug", ""),
        })

    # Sort by 24h volume (already sorted by CLI, but be safe)
    markets.sort(key=lambda x: x["volume_24hr"], reverse=True)

    # ── Step 2: Top Holders for top-N markets (5 cr each) ──
    # ── Step 3: Recent trades for same markets (1 cr each) ──
    hot_markets = []
    whale_map: dict[str, dict] = {}  # owner_address -> aggregated whale

    for i, m in enumerate(markets[:deep_dive_top]):
        mid = m["market_id"]

        # Top holders (5 cr)
        holders_data = nansen_call("research prediction-market top-holders", {
            "market-id": mid,
        })
        holders_raw = _extract(holders_data)
        log_command(
            f"PM Top Holders #{i+1}",
            f"nansen research prediction-market top-holders --market-id {mid} --json",
            5, 0,
            f"{len(holders_raw)} holders on '{m['question'][:40]}'",
        )

        # Recent trades (1 cr)
        trades_data = nansen_call("research prediction-market trades-by-market", {
            "market-id": mid,
        })
        trades_raw = _extract(trades_data)
        log_command(
            f"PM Trades #{i+1}",
            f"nansen research prediction-market trades-by-market --market-id {mid} --json",
            1, 0,
            f"{len(trades_raw)} recent trades",
        )

        # Normalise holders
        holders = []
        for h in holders_raw:
            owner = str(h.get("owner_address") or h.get("address") or "").lower()
            if not owner or owner == "0x":
                continue
            size = float(h.get("position_size") or 0)
            entry = float(h.get("avg_entry_price") or 0)
            cur = float(h.get("current_price") or 0)
            # USD value = shares × price. For Polymarket, position_size is in shares
            # and each share is worth $1 at resolution — so position_size ≈ USD notional.
            position_usd = size * (entry if entry > 0 else 1)
            upnl = float(h.get("unrealized_pnl_usd") or 0)

            holder = {
                "address": str(h.get("address", "")),
                "owner_address": owner,
                "side": h.get("side", ""),
                "outcome_index": int(h.get("outcome_index") or 0),
                "position_size": size,
                "position_usd": position_usd,
                "avg_entry_price": entry,
                "current_price": cur,
                "unrealized_pnl_usd": upnl,
            }
            holders.append(holder)

            # Aggregate into whale map
            if owner not in whale_map:
                whale_map[owner] = {
                    "owner_address": owner,
                    "total_position_usd": 0.0,
                    "total_unrealized_pnl": 0.0,
                    "position_count": 0,
                    "markets": [],
                }
            w = whale_map[owner]
            w["total_position_usd"] += position_usd
            w["total_unrealized_pnl"] += upnl
            w["position_count"] += 1
            w["markets"].append({
                "market_id": mid,
                "question": m["question"],
                "side": holder["side"],
                "position_usd": position_usd,
                "unrealized_pnl_usd": upnl,
            })

        # Normalise trades (last 10 for flow display)
        trades = []
        for t in trades_raw[:10]:
            trades.append({
                "timestamp": t.get("timestamp", ""),
                "buyer": str(t.get("buyer", "")),
                "seller": str(t.get("seller", "")),
                "taker_action": t.get("taker_action", ""),
                "side": t.get("side", ""),
                "size": float(t.get("size") or 0),
                "price": float(t.get("price") or 0),
                "usdc_value": float(t.get("usdc_value") or 0),
                "tx_hash": t.get("tx_hash", ""),
            })

        hot_markets.append({
            **m,
            "top_holders": holders[:10],
            "recent_trades": trades,
        })

    # ── Step 4: Grade whales (local, 0 credits) ──
    whales = []
    for owner, w in whale_map.items():
        grade = _grade_whale(
            w["total_position_usd"],
            w["total_unrealized_pnl"],
            w["position_count"],
        )
        whales.append({
            **w,
            "grade": grade,
        })

    # Sort by position size
    whales.sort(key=lambda x: x["total_position_usd"], reverse=True)

    # ── Step 5: Convergence — wallets across ≥2 markets (0 credits) ──
    convergence = [w for w in whales if w["position_count"] >= 2]
    convergence.sort(key=lambda x: (x["position_count"], x["total_position_usd"]), reverse=True)

    graded_whales = len([w for w in whales if w["grade"] in ("S", "A", "B")])

    c_end = get_credits()

    result = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "funnel": {
            "scanned_markets": len(markets),
            "hot_markets": len(hot_markets),
            "deep_dive_markets": deep_dive_top,
            "unique_whales": len(whales),
            "graded_whales": graded_whales,
            "convergence_whales": len(convergence),
        },
        "markets": markets,
        "hot_markets": hot_markets,
        "whales": whales,
        "convergence": convergence,
        "credits": {
            "before": c_start,
            "after": c_end,
            "used": c_start - c_end if c_start >= 0 and c_end >= 0 else -1,
        },
        "steps": log["steps"],
    }

    if save:
        _save(result, POLYMARKET_LATEST_FILE)

    if notify_fn:
        notify_fn(
            f"Polymarket discovery complete: {len(markets)} markets scanned, "
            f"{len(whales)} whales found, {len(convergence)} convergence signals. "
            f"Credits used: {result['credits']['used']}"
        )

    return result


def load_latest() -> Optional[dict]:
    """Return the most recent polymarket discovery result, or None."""
    path = os.path.join(DATA_DIR, POLYMARKET_LATEST_FILE)
    if not os.path.exists(path):
        return None
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return None


if __name__ == "__main__":
    print("Running Polymarket discovery (top 20 markets, deep-dive top 5)...")
    result = polymarket_discovery(top_n_markets=20, deep_dive_top=5)
    print(f"\n✓ Complete")
    print(f"  Funnel: {result['funnel']}")
    print(f"  Credits: {result['credits']}")
    print(f"  Top market: {result['markets'][0]['question']}")
    print(f"  Top whale: {result['whales'][0]['owner_address'] if result['whales'] else 'none'}")
