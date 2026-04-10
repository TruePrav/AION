"""
price_tracker.py — forward-price updater for AION's evolution loop.

Runs on cron (hourly). Walks tokens_tracked for rows whose forward prices
are still empty, pulls current price from DexScreener (free, public API),
and fills in price_24h / price_48h / price_7d + their return_*_pct columns
based on how long it's been since the snapshot.

DexScreener supports a batched endpoint: /latest/dex/tokens/{comma-list},
up to 30 addresses per call. We batch aggressively to keep API load low.

Usage:
    python3 price_tracker.py           # one pass
    python3 price_tracker.py --loop    # run forever, sleeping 1h between passes
"""

from __future__ import annotations

import os
import sys
import time
import json
from typing import Iterable
import urllib.request
import urllib.error

from db import (
    init_db,
    tokens_needing_price_update,
    update_token_price,
    log_curator_action,
)

DEXSCREENER_BATCH = 30
DEXSCREENER_URL = "https://api.dexscreener.com/latest/dex/tokens/{addrs}"
HTTP_TIMEOUT = 15


def _fetch(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "aion-price-tracker/1.0"})
    with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_prices(addresses: Iterable[str]) -> dict[str, float]:
    """Return {address_lower: price_usd} for the given addresses."""
    out: dict[str, float] = {}
    addrs = [a for a in addresses if a]
    for i in range(0, len(addrs), DEXSCREENER_BATCH):
        batch = addrs[i : i + DEXSCREENER_BATCH]
        url = DEXSCREENER_URL.format(addrs=",".join(batch))
        try:
            data = _fetch(url)
        except (urllib.error.URLError, json.JSONDecodeError) as e:
            print(f"  ! dexscreener batch failed: {e}")
            continue
        for pair in data.get("pairs") or []:
            base = (pair.get("baseToken") or {}).get("address", "").lower()
            price = pair.get("priceUsd")
            if not base or price is None:
                continue
            try:
                price_f = float(price)
            except (TypeError, ValueError):
                continue
            # Keep the highest-liquidity pair for each token
            if base not in out:
                out[base] = price_f
    return out


def run_once() -> dict:
    init_db()
    rows = tokens_needing_price_update(max_age_days=10)
    if not rows:
        print("No tokens need price updates.")
        return {"checked": 0, "updated": 0}

    # Map from lowercase address back to list of token row ids (a token can
    # appear in multiple snapshots — same address, different snapshot_id)
    addr_to_rows: dict[str, list] = {}
    for r in rows:
        key = (r["address"] or "").lower()
        if not key:
            continue
        addr_to_rows.setdefault(key, []).append(r)

    prices = fetch_prices(addr_to_rows.keys())
    print(f"Fetched prices for {len(prices)}/{len(addr_to_rows)} unique tokens")

    updated = 0
    for addr, price in prices.items():
        for r in addr_to_rows.get(addr, []):
            update_token_price(r["id"], price, r["snap_ts"])
            updated += 1

    log_curator_action(
        "price_tracker_ran",
        "price_tracker.py",
        {"checked": len(rows), "unique_tokens": len(addr_to_rows), "updated": updated},
    )
    print(f"✓ Updated {updated} token rows")
    return {"checked": len(rows), "updated": updated}


if __name__ == "__main__":
    if "--loop" in sys.argv:
        interval = int(os.environ.get("AION_PRICE_INTERVAL_S", "3600"))
        print(f"Entering loop (every {interval}s)")
        while True:
            try:
                run_once()
            except Exception as e:
                print(f"  ! pass failed: {e}")
            time.sleep(interval)
    else:
        run_once()
