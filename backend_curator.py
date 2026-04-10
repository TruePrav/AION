"""
curator.py — Karpathy-style wiki curator for AION.

Reads the latest discovery + polymarket snapshots from SQLite and upserts
the corresponding wallet/token/market entity pages in /root/oracle/v3/knowledge.

Operates in two modes:
    - template  — pure templated prose. No external calls. Always works.
    - llm       — uses Anthropic API (if ANTHROPIC_API_KEY is set) to write
                  richer narrative sections. Falls back to template on any error.

Usage:
    python3 curator.py                       # curate from latest snapshots
    python3 curator.py --discovery-only      # only memecoin side
    python3 curator.py --polymarket-only     # only prediction-market side
    python3 curator.py --rebuild-index       # just regenerate index.md + log.md
"""

from __future__ import annotations

import argparse
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# Load .env (contains ANTHROPIC_API_KEY, model override, etc.) before any
# os.environ.get() below. Wrapped in try/except so the curator still runs
# in template-only mode if config.py is unavailable.
try:
    import config  # noqa: F401  — side effect: load_dotenv()
except Exception:
    pass

from db import (
    connect,
    get_latest_snapshot,
    list_recurring_wallets,
    log_curator_action,
    get_current_weights,
    record_polymarket_snapshot,
    record_discovery_snapshot,
    init_db,
)

KNOWLEDGE_DIR = Path(os.environ.get("AION_KNOWLEDGE_DIR", "/root/oracle/v3/knowledge"))
DATA_DIR = Path(os.environ.get("AION_DATA_DIR", "/root/oracle/v3/data"))

MIN_GRADE_FOR_PAGE = {"S", "A", "B"}  # only create entity pages for these
LLM_MODEL = os.environ.get("AION_CURATOR_MODEL", "claude-3-5-sonnet-20241022")


# ─────────────────────────────────────────────────────────────────────────────
# LLM adapter — optional
# ─────────────────────────────────────────────────────────────────────────────

def _have_llm() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


def _llm_write(prompt: str, max_tokens: int = 400) -> Optional[str]:
    """Call Claude if available; return None on any failure."""
    if not _have_llm():
        return None
    try:
        import anthropic  # type: ignore
    except ImportError:
        return None
    try:
        client = anthropic.Anthropic()
        resp = client.messages.create(
            model=LLM_MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return "".join(
            block.text for block in resp.content if getattr(block, "type", "") == "text"
        ).strip()
    except Exception as e:
        print(f"  ! llm call failed: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Markdown helpers
# ─────────────────────────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _write_page(relpath: str, content: str) -> Path:
    path = KNOWLEDGE_DIR / relpath
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return path


def _read_page(relpath: str) -> Optional[str]:
    path = KNOWLEDGE_DIR / relpath
    if path.exists():
        return path.read_text(encoding="utf-8")
    return None


def _preserve_manual_sections(old: Optional[str], new: str) -> str:
    """
    If an old version exists, keep any sections marked
        <!-- manual -->  …content…  <!-- /manual -->
    in the old file and splice them into the new file. The curator only
    overwrites `auto` sections. Using a distinct closer tag prevents the
    regex from greedily capturing trailing page content (which otherwise
    caused the "Last curated" footer to get absorbed and compounded on
    each run).
    """
    if not old:
        return new

    # Match a complete manual pair: open tag, content, close tag.
    manual_pattern = re.compile(
        r"<!-- manual -->(.*?)<!-- /manual -->",
        re.DOTALL,
    )
    old_blocks = manual_pattern.findall(old)
    if not old_blocks:
        return new

    # Splice each captured block into the new file in order, replacing the
    # stub placeholder the template wrote. Use a function replacement to
    # avoid re.sub treating backslashes in user content as escape sequences.
    out = new
    remaining = list(old_blocks)

    def _replace(_m: "re.Match[str]") -> str:
        if not remaining:
            return _m.group(0)
        block = remaining.pop(0)
        return f"<!-- manual -->{block}<!-- /manual -->"

    out = manual_pattern.sub(_replace, out)
    return out


def _fmt_pct(v: Optional[float]) -> str:
    if v is None:
        return "—"
    return f"{v:+.1f}%"


def _fmt_usd(v: Optional[float]) -> str:
    if v is None or v == 0:
        return "—"
    if v >= 1_000_000:
        return f"${v/1_000_000:.2f}M"
    if v >= 1_000:
        return f"${v/1_000:.1f}k"
    return f"${v:.2f}"


def _trunc(s: str, n: int = 60) -> str:
    return s if len(s) <= n else s[: n - 1] + "…"


# ─────────────────────────────────────────────────────────────────────────────
# Entity page writers
# ─────────────────────────────────────────────────────────────────────────────

def curate_wallet_page(wallet_row: dict) -> Optional[str]:
    """Upsert knowledge/wallets/{address}.md. Returns the relative path or None."""
    addr = (wallet_row["address"] or "").lower()
    if not addr:
        return None
    grade = wallet_row["current_grade"] or "?"
    if grade not in MIN_GRADE_FOR_PAGE:
        return None

    score = wallet_row["current_score"] or 0
    first_seen = wallet_row["first_seen"]
    last_seen = wallet_row["last_seen"]
    appearances = wallet_row["appearances"]
    label = wallet_row["label"] or ""
    grade_history = json.loads(wallet_row["grade_history_json"] or "[]")
    tokens_bought = json.loads(wallet_row["tokens_bought_json"] or "[]")

    relpath = f"wallets/{addr}.md"
    old = _read_page(relpath)

    # Narrative section
    prompt = (
        f"Write a concise 2-sentence profile of a crypto wallet we're tracking. "
        f"Facts: address {addr}, current grade {grade} (score {score:.1f}/100), "
        f"seen across {appearances} discovery runs since {first_seen[:10]}, "
        f"bought {len(tokens_bought)} distinct tokens. "
        f"Nansen label: '{label}'. "
        f"Be concrete, specific, and avoid hype. Do not include the address in "
        f"the prose. Output only the 2 sentences, no preamble."
    )
    narrative = _llm_write(prompt, max_tokens=200)
    if not narrative:
        # Fallback template
        if appearances == 1:
            narrative = (
                f"First seen on {first_seen[:10]}, graded **{grade}** on the composite "
                f"scoring model. "
            )
            if label:
                narrative += f"Labelled by Nansen as *{label}*."
        else:
            narrative = (
                f"Recurring wallet — has appeared in **{appearances}** separate "
                f"discovery runs since {first_seen[:10]}. Current grade **{grade}** "
                f"(score {score:.1f}/100). "
            )
            if label:
                narrative += f"Nansen label: *{label}*."

    # Grade history table
    if grade_history:
        rows = "\n".join(
            f"| {h.get('timestamp', '')[:16]} | {h.get('grade', '?')} | {h.get('score', 0):.1f} |"
            for h in grade_history[-20:]
        )
        history_table = "| Timestamp | Grade | Score |\n|---|---|---|\n" + rows
    else:
        history_table = "_No history recorded._"

    # Tokens bought section — the shape has evolved over time:
    #   v1 (raw string):          "WTAO"
    #   v2 (flat dict):           {"address": "0x77…", "symbol": "WTAO", "seen_at": "…"}
    #   v3 (legacy nested bug):   {"address": {"token": "WTAO", "token_address": "0x77…",
    #                                           "value": 1999}, "seen_at": "…"}
    # Normalise all three into a single rendering so historical pages don't
    # show raw Python dict reprs.
    def _tok_line(t: Any) -> str:
        if isinstance(t, dict):
            addr_field = t.get("address")
            symbol = t.get("symbol") or ""
            value = t.get("value_usd") or t.get("value")
            seen = str(t.get("seen_at", ""))[:10]
            # Legacy nested shape: address is itself a dict
            if isinstance(addr_field, dict):
                symbol = symbol or addr_field.get("token") or ""
                addr_s = str(addr_field.get("token_address") or "?")
                value = value if value is not None else addr_field.get("value")
            else:
                addr_s = str(addr_field or "?")
            sym = f" **{symbol}**" if symbol else ""
            val = f" ({_fmt_usd(float(value))})" if value is not None else ""
            when = f" — seen {seen}" if seen else ""
            return f"- `{addr_s[:14]}…`{sym}{val}{when}"
        return f"- `{str(t)[:14]}…`"
    if tokens_bought:
        token_lines = "\n".join(_tok_line(t) for t in tokens_bought[-30:])
    else:
        token_lines = "_No tokens recorded yet._"

    content = f"""---
type: wallet
address: {addr}
label: "{label}"
first_seen: {first_seen}
last_seen: {last_seen}
appearances: {appearances}
current_grade: {grade}
current_score: {score:.1f}
---

# Wallet `{addr[:10]}…{addr[-4:]}`

<!-- auto -->
{narrative}
<!-- auto -->

## Grade history

{history_table}

## Tokens bought (hot list)

{token_lines}

## Notes

<!-- manual -->
*Hand-written observations go here. Curator will preserve this section.*
<!-- /manual -->

---
*Last curated: {_now_iso()}*
"""

    content = _preserve_manual_sections(old, content)
    _write_page(relpath, content)
    return relpath


def curate_token_page(snap_timestamp: str, token: dict) -> Optional[str]:
    """Upsert knowledge/tokens/{chain}_{address}.md for a discovered token."""
    addr = (token.get("address") or "").lower()
    if not addr:
        return None
    tier = token.get("tier_filter", {}) or {}
    # Only write pages for tokens that passed the tier filter
    if not tier.get("passed"):
        return None

    chain = (token.get("chain") or "unknown").lower()
    symbol = token.get("symbol", "?")
    accum = token.get("accumulation", {}) or {}
    score = accum.get("score", 0)
    grade = accum.get("grade", "?")
    mcap = token.get("market_cap", 0)
    age = token.get("token_age_days", 0)
    signals = accum.get("signals", [])
    metrics = accum.get("metrics", {}) or {}
    net_flow = token.get("net_flow_7d", 0)

    relpath = f"tokens/{chain}_{addr}.md"
    old = _read_page(relpath)

    prompt = (
        f"Write a concise 2-sentence explanation of why a crypto token named "
        f"{symbol} passed our smart-money discovery filter. "
        f"Metrics: accumulation score {score:.0f}/100 (grade {grade}), "
        f"{metrics.get('sm_buyer_count', 0)} smart-money buyers, "
        f"buy/sell ratio {metrics.get('buy_sell_ratio', 0):.1f}x, "
        f"buyer concentration HHI {metrics.get('buyer_concentration_hhi', 0):.2f}, "
        f"market cap {_fmt_usd(mcap)}, 7d net inflow {_fmt_usd(net_flow)}. "
        f"Be concrete. Do not use the word 'Token'. Output only the 2 sentences, no preamble."
    )
    narrative = _llm_write(prompt, max_tokens=200)
    if not narrative:
        narrative = (
            f"Passed the tier filter on {snap_timestamp[:10]} with grade **{grade}** "
            f"(score {score:.0f}/100). {metrics.get('sm_buyer_count', 0)} smart-money "
            f"wallets were buying, with a {metrics.get('buy_sell_ratio', 0):.1f}x "
            f"buy/sell ratio and HHI {metrics.get('buyer_concentration_hhi', 0):.2f}. "
            f"Market cap {_fmt_usd(mcap)}, 7d net inflow {_fmt_usd(net_flow)}."
        )

    signals_md = (
        "\n".join(f"- {s}" for s in signals) if signals else "_No specific signals captured._"
    )

    content = f"""---
type: token
address: {addr}
symbol: {symbol}
chain: {chain}
discovered: {snap_timestamp}
accum_score: {score}
accum_grade: {grade}
tier_passed: true
market_cap_at_discovery: {mcap}
token_age_days: {age}
---

# `{symbol}` on {chain}

<!-- auto -->
{narrative}
<!-- auto -->

## Why it passed

{signals_md}

## Metrics at discovery

| Metric | Value |
|---|---|
| Accumulation score | {score:.0f}/100 ({grade}) |
| Buy/sell ratio | {metrics.get('buy_sell_ratio', 0):.2f}x |
| Buyer concentration (HHI) | {metrics.get('buyer_concentration_hhi', 0):.3f} |
| SM buyer count | {metrics.get('sm_buyer_count', 0)} |
| Total buy volume | {_fmt_usd(metrics.get('total_buy_volume', 0))} |
| Total sell volume | {_fmt_usd(metrics.get('total_sell_volume', 0))} |
| Market cap | {_fmt_usd(mcap)} |
| Token age | {age:.0f} days |
| 7d net flow | {_fmt_usd(net_flow)} |

## Forward performance

<!-- auto -->
*Filled in by the price tracker as 24h / 48h / 7d forward prices come in.*
<!-- auto -->

## Post-mortem

<!-- manual -->
*If this token wins or loses big, write the explanation here.*
<!-- /manual -->

---
*Last curated: {_now_iso()}*
"""

    content = _preserve_manual_sections(old, content)
    _write_page(relpath, content)
    return relpath


def curate_polymarket_market_page(market: dict, whales_in_market: list[dict]) -> Optional[str]:
    """Upsert knowledge/markets/{market_id}.md for a Polymarket event."""
    market_id = str(market.get("market_id", ""))
    if not market_id:
        return None
    question = market.get("question", "")
    event_title = market.get("event_title", "") or ""
    slug = market.get("slug", "")
    tags = market.get("tags", []) or []
    vol_24h = market.get("volume_24hr", 0)
    liquidity = market.get("liquidity", 0)
    end_date = market.get("end_date", "")
    implied_prob = market.get("implied_prob", 0)

    relpath = f"markets/{market_id}.md"
    old = _read_page(relpath)

    # Whales section
    whale_rows = []
    for w in whales_in_market[:15]:
        addr = (w.get("owner_address") or "")[:12]
        side = w.get("side", "?")
        pos = _fmt_usd(w.get("position_usd", 0))
        pnl = _fmt_pct(
            (w.get("unrealized_pnl_usd") or 0)
            / (w.get("position_usd") or 1)
            * 100
        )
        whale_rows.append(f"| `{addr}…` | {side} | {pos} | {pnl} |")
    whales_table = (
        "| Wallet | Side | Position | Unrealized |\n|---|---|---|---|\n"
        + "\n".join(whale_rows)
    ) if whale_rows else "_No whales recorded._"

    # Ground the prompt with event_title + slug so the model does not
    # hallucinate team names / entities from the question alone. Earlier
    # Sonnet runs guessed "Carolina Panthers" from a question that said
    # "Panthers vs. Senators" because it had no other context; the slug
    # "nhl-fla-ott" makes it unambiguous.
    prompt = (
        "Write a concise 2-sentence description of a Polymarket prediction "
        "market. Use ONLY the facts provided — do not invent team names, "
        "cities, dates, or other details that are not explicitly given.\n\n"
        f"- Question: '{question}'\n"
        f"- Event title: '{event_title}'\n"
        f"- Slug (canonical identifier): '{slug}'\n"
        f"- Tags: {', '.join(tags[:6])}\n"
        f"- 24h volume: {_fmt_usd(vol_24h)}\n"
        f"- Liquidity: {_fmt_usd(liquidity)}\n"
        f"- Implied probability: {implied_prob*100:.0f}%\n"
        f"- Ends: {end_date[:10]}\n\n"
        "Focus on what the market is asking and the current state. If the "
        "question is ambiguous, prefer the slug as the source of truth. "
        "Output only the 2 sentences, no preamble."
    )
    narrative = _llm_write(prompt, max_tokens=200)
    if not narrative:
        narrative = (
            f"Polymarket market \"{question}\" currently sits at **{implied_prob*100:.0f}%** "
            f"implied probability, with {_fmt_usd(vol_24h)} in 24h volume and "
            f"{_fmt_usd(liquidity)} in liquidity. Tags: {', '.join(tags[:4])}."
        )

    content = f"""---
type: market
market_id: {market_id}
slug: {slug}
question: "{question}"
end_date: {end_date}
volume_24hr: {vol_24h}
liquidity: {liquidity}
implied_prob: {implied_prob}
tags: {json.dumps(tags)}
---

# {question}

<!-- auto -->
{narrative}
<!-- auto -->

## Top whales

{whales_table}

## Observations

<!-- manual -->
*Hand-written observations about this market go here.*
<!-- /manual -->

---
*Source: [polymarket.com/event/{slug}](https://polymarket.com/event/{slug})*
*Last curated: {_now_iso()}*
"""

    content = _preserve_manual_sections(old, content)
    _write_page(relpath, content)
    return relpath


# ─────────────────────────────────────────────────────────────────────────────
# Index + log maintenance
# ─────────────────────────────────────────────────────────────────────────────

def _walk_type(type_dir: str) -> list[tuple[str, dict]]:
    """Return [(relpath, frontmatter_dict)] for all pages under type_dir."""
    out = []
    base = KNOWLEDGE_DIR / type_dir
    if not base.exists():
        return out
    for p in sorted(base.glob("*.md")):
        if p.name.startswith("."):
            continue
        text = p.read_text(encoding="utf-8")
        fm = _parse_frontmatter(text)
        out.append((f"{type_dir}/{p.name}", fm))
    return out


def _parse_frontmatter(text: str) -> dict:
    """Minimal YAML frontmatter parser — handles key: value and key: "quoted string"."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 4)
    if end < 0:
        return {}
    block = text[4:end]
    out: dict[str, str] = {}
    for line in block.splitlines():
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        v = v.strip().strip('"').strip("'")
        out[k.strip()] = v
    return out


def rebuild_index() -> None:
    """Walk the knowledge tree and regenerate index.md."""
    sections = []

    def section(title: str, type_dir: str, line_for: callable) -> str:
        pages = _walk_type(type_dir)
        if not pages:
            return f"## {title}\n\n- *(none yet)*\n"
        lines = "\n".join(line_for(rel, fm) for rel, fm in pages)
        return f"## {title}\n\n{lines}\n"

    sections.append(section(
        "Concepts", "concepts",
        lambda rel, fm: f"- [{fm.get('slug', rel)}]({rel}) — v{fm.get('version', '?')}",
    ))
    sections.append(section(
        "Scoring", "scoring",
        lambda rel, fm: f"- [{rel.split('/')[-1].replace('.md', '')}]({rel})",
    ))
    sections.append(section(
        "Wallets", "wallets",
        lambda rel, fm: (
            f"- [`{fm.get('address', '')[:10]}…`]({rel}) — "
            f"grade {fm.get('current_grade', '?')}, "
            f"seen {fm.get('appearances', '?')}×"
        ),
    ))
    sections.append(section(
        "Tokens", "tokens",
        lambda rel, fm: (
            f"- [{fm.get('symbol', '?')} ({fm.get('chain', '?')})]({rel}) — "
            f"score {fm.get('accum_score', '?')}/100 ({fm.get('accum_grade', '?')})"
        ),
    ))
    sections.append(section(
        "Markets", "markets",
        lambda rel, fm: f"- [{_trunc(fm.get('question', rel), 70)}]({rel})",
    ))
    sections.append(section(
        "Clusters", "clusters",
        lambda rel, fm: f"- [{rel.split('/')[-1].replace('.md', '')}]({rel})",
    ))
    sections.append(section(
        "Weekly digests", "weeks",
        lambda rel, fm: f"- [{rel.split('/')[-1].replace('.md', '')}]({rel})",
    ))

    content = f"""---
type: index
auto_regenerated: true
last_rebuilt: {_now_iso()}
---

# AION Wiki Index

> This page is rebuilt by the curator on every run. Do not edit manually.

{chr(10).join(sections)}

---
*Rebuilt: {_now_iso()}*
"""
    _write_page("index.md", content)


def append_log(action: str, summary: str, details: dict | None = None) -> None:
    """Append an entry to knowledge/log.md AND to the curator_log DB table."""
    log_path = KNOWLEDGE_DIR / "log.md"
    ts = _now_iso()
    entry = f"\n## [{ts}] {action}\n\n{summary}\n"
    if details:
        lines = "\n".join(f"- `{k}`: {v}" for k, v in details.items())
        entry += f"\n{lines}\n"
    if log_path.exists():
        log_path.write_text(log_path.read_text(encoding="utf-8") + entry, encoding="utf-8")
    else:
        log_path.write_text(f"# Curator Log\n{entry}", encoding="utf-8")
    log_curator_action(action, "knowledge/log.md", details or {"summary": summary})


# ─────────────────────────────────────────────────────────────────────────────
# Main curation runs
# ─────────────────────────────────────────────────────────────────────────────

def curate_discovery() -> dict:
    """Curate pages from the latest discovery snapshot."""
    snap = get_latest_snapshot()
    if not snap:
        # Nothing ingested yet; ingest from JSON fallback
        jsonp = DATA_DIR / "discovery_latest.json"
        if jsonp.exists():
            with open(jsonp) as f:
                snap_json = json.load(f)
            record_discovery_snapshot(snap_json)
            snap = get_latest_snapshot()
        if not snap:
            return {"error": "no discovery snapshot"}

    raw = json.loads(snap["raw_json"])
    timestamp = snap["timestamp"]

    token_pages: list[str] = []
    for t in raw.get("tokens", []):
        rel = curate_token_page(timestamp, t)
        if rel:
            token_pages.append(rel)

    # Wallet pages — pull recurring from the aggregated table
    wallet_pages: list[str] = []
    for w in list_recurring_wallets(min_appearances=1, limit=100):
        rel = curate_wallet_page(w)
        if rel:
            wallet_pages.append(rel)

    append_log(
        "discovery_curated",
        f"Curated {len(token_pages)} token pages and {len(wallet_pages)} wallet pages "
        f"from discovery snapshot #{snap['id']}.",
        {
            "snapshot_id": snap["id"],
            "tokens_written": len(token_pages),
            "wallets_written": len(wallet_pages),
        },
    )
    return {"tokens": token_pages, "wallets": wallet_pages}


def curate_polymarket() -> dict:
    """Curate pages from the latest polymarket snapshot."""
    with connect() as c:
        row = c.execute(
            "SELECT * FROM polymarket_snapshots ORDER BY id DESC LIMIT 1"
        ).fetchone()
    if not row:
        jsonp = DATA_DIR / "polymarket_latest.json"
        if jsonp.exists():
            with open(jsonp) as f:
                pm_json = json.load(f)
            record_polymarket_snapshot(pm_json)
            with connect() as c:
                row = c.execute(
                    "SELECT * FROM polymarket_snapshots ORDER BY id DESC LIMIT 1"
                ).fetchone()
        if not row:
            return {"error": "no polymarket snapshot"}

    raw = json.loads(row["raw_json"])
    hot_markets = raw.get("hot_markets", [])
    convergence = raw.get("convergence", [])

    # Build a map: market_id → list of whale positions from convergence + direct holders
    market_to_whales: dict[str, list] = {}
    for hm in hot_markets:
        mid = str(hm.get("market_id", ""))
        holders = hm.get("top_holders", []) or []
        market_to_whales.setdefault(mid, []).extend(holders)

    market_pages = []
    for hm in hot_markets[:20]:
        mid = str(hm.get("market_id", ""))
        rel = curate_polymarket_market_page(hm, market_to_whales.get(mid, []))
        if rel:
            market_pages.append(rel)

    append_log(
        "polymarket_curated",
        f"Curated {len(market_pages)} Polymarket market pages. "
        f"Funnel: {raw.get('funnel', {})}",
        {
            "polymarket_snapshot_id": row["id"],
            "markets_written": len(market_pages),
            "convergence_count": len(convergence),
        },
    )
    return {"markets": market_pages}


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--discovery-only", action="store_true")
    parser.add_argument("--polymarket-only", action="store_true")
    parser.add_argument("--rebuild-index", action="store_true")
    args = parser.parse_args()

    init_db()
    KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[curator] knowledge dir = {KNOWLEDGE_DIR}")
    print(f"[curator] llm available = {_have_llm()}")

    if args.rebuild_index:
        rebuild_index()
        print("✓ index.md rebuilt")
        return

    results: dict[str, Any] = {}

    if not args.polymarket_only:
        print("[curator] curating discovery...")
        results["discovery"] = curate_discovery()
        print(f"  → {results['discovery']}")

    if not args.discovery_only:
        print("[curator] curating polymarket...")
        results["polymarket"] = curate_polymarket()
        print(f"  → {results['polymarket']}")

    print("[curator] rebuilding index...")
    rebuild_index()
    print("✓ index.md rebuilt")

    print("[curator] done.")


if __name__ == "__main__":
    main()
