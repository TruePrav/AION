#!/usr/bin/env python3
"""run_discovery_cron.py — hourly/6h cron entry point.

Calls pipeline.discovery_multi (solana + base) and polymarket_pipeline.polymarket_discovery
with safe defaults. Logs output via print so stdout can be captured by cron's
>> logfile redirect. Never re-raises: we always exit(0) so cron doesn't spam
email alerts if Nansen has a transient blip.

Usage:
    python3 run_discovery_cron.py evm         # solana + base discovery
    python3 run_discovery_cron.py polymarket  # polymarket discovery

Both paths fire the curator_hook at the end of the pipeline (already wired
inside discovery_multi / polymarket_discovery), which records the snapshot,
regenerates the wiki, and runs the self-learning weight adaptation loop.
"""

import sys
import traceback
from datetime import datetime, timezone


def _stamp() -> str:
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


def _run_evm() -> None:
    try:
        import config  # loads .env
    except Exception:
        pass
    from pipeline import discovery_multi
    print(f'[{_stamp()}] cron: discovery_multi(chains=[solana, base]) start')
    result = discovery_multi(
        chains=['solana', 'base'],
        top_n_tokens=10,
        max_wallets=30,
        risk_tier='balanced',
        graph_top_n=5,
    )
    n_tok = len(result.get('tokens', []) or [])
    n_wal = len(result.get('wallets', []) or [])
    credits = result.get('credits', {}) or {}
    print(
        f'[{_stamp()}] cron: discovery_multi done — '
        f'{n_tok} tokens, {n_wal} wallets, '
        f'credits used={credits.get("used")}/{credits.get("before")}'
    )


def _run_polymarket() -> None:
    try:
        import config
    except Exception:
        pass
    from polymarket_pipeline import polymarket_discovery
    print(f'[{_stamp()}] cron: polymarket_discovery() start')
    result = polymarket_discovery(top_n_markets=20, deep_dive_top=5)
    n_mkt = len(result.get('markets', []) or [])
    n_whale = len(result.get('whales', []) or [])
    print(
        f'[{_stamp()}] cron: polymarket_discovery done — '
        f'{n_mkt} markets, {n_whale} whales'
    )


def main() -> int:
    if len(sys.argv) < 2:
        print('usage: run_discovery_cron.py [evm|polymarket]')
        return 0
    mode = sys.argv[1].strip().lower()
    try:
        if mode == 'evm':
            _run_evm()
        elif mode == 'polymarket':
            _run_polymarket()
        else:
            print(f'unknown mode: {mode}')
            return 0
    except Exception as e:
        print(f'[{_stamp()}] cron: {mode} FAILED: {e}')
        traceback.print_exc()
    return 0


if __name__ == '__main__':
    sys.exit(main())
