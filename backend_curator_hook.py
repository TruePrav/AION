"""
curator_hook.py — non-blocking post-pipeline hook.

Called at the tail of discovery_multi() and polymarket_discovery().
Writes the run into SQLite then fires the curator so the knowledge wiki
stays current. Failures NEVER break the pipeline — they are logged and
swallowed, because a wiki write failure must never cost us a real run.

Usage:
    from curator_hook import after_discovery, after_polymarket
    ...
    result = discovery_multi(...)
    after_discovery(result)
    return result
"""

from __future__ import annotations

import os
import traceback


def _enabled() -> bool:
    # Allow operators to turn the hook off without editing code.
    return os.environ.get("AION_CURATOR_HOOK", "1") != "0"


def after_discovery(result: dict) -> None:
    """Record snapshot + curate wiki + self-evolve scoring after a discovery_multi run."""
    if not _enabled() or not isinstance(result, dict):
        return
    try:
        from db import record_discovery_snapshot
        snap_id = record_discovery_snapshot(result)
        print(f"[curator_hook] discovery snapshot #{snap_id} recorded")
    except Exception as e:
        print(f"[curator_hook] snapshot write failed: {e}")
        traceback.print_exc()
        return  # Can't curate without a snapshot in the DB

    try:
        from curator import curate_discovery, rebuild_index
        out = curate_discovery()
        n_tok = len(out.get("tokens", []))
        n_wal = len(out.get("wallets", []))
        print(f"[curator_hook] wiki updated: {n_tok} token pages, {n_wal} wallet pages")
        rebuild_index()
    except Exception as e:
        print(f"[curator_hook] curate_discovery failed: {e}")
        traceback.print_exc()

    # Self-learning: evaluate forward returns against current weights and
    # nudge weights if scoring isn't predictive. Silently skipped until we
    # have enough tracked tokens with forward prices populated.
    try:
        from db import run_evaluation_and_adapt
        evaluation = run_evaluation_and_adapt()
        status = evaluation.get("status", "?")
        if status == "evaluated":
            new_w = evaluation.get("new_weights")
            if new_w:
                print(
                    f"[curator_hook] evolution: new weight version "
                    f"v{new_w.get('version')} committed "
                    f"(high={evaluation.get('high_score_avg_return')}% vs "
                    f"low={evaluation.get('low_score_avg_return')}%)"
                )
            else:
                print(
                    f"[curator_hook] evolution: evaluation ran, weights held "
                    f"(high={evaluation.get('high_score_avg_return')}% vs "
                    f"low={evaluation.get('low_score_avg_return')}%, "
                    f"tracked={evaluation.get('total_tracked')})"
                )
        else:
            print(f"[curator_hook] evolution: skipped ({status})")
    except Exception as e:
        print(f"[curator_hook] run_evaluation_and_adapt failed: {e}")
        traceback.print_exc()


def after_polymarket(result: dict) -> None:
    """Record snapshot + curate wiki after a polymarket_discovery run."""
    if not _enabled() or not isinstance(result, dict):
        return
    try:
        from db import record_polymarket_snapshot
        snap_id = record_polymarket_snapshot(result)
        print(f"[curator_hook] polymarket snapshot #{snap_id} recorded")
    except Exception as e:
        print(f"[curator_hook] polymarket snapshot write failed: {e}")
        traceback.print_exc()
        return

    try:
        from curator import curate_polymarket, rebuild_index
        out = curate_polymarket()
        n_mkt = len(out.get("markets", []))
        print(f"[curator_hook] polymarket wiki updated: {n_mkt} market pages")
        rebuild_index()
    except Exception as e:
        print(f"[curator_hook] curate_polymarket failed: {e}")
        traceback.print_exc()
