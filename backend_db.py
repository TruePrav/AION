"""
db.py — SQLite-backed telemetry store for AION.

This replaces the scattered JSON files as the source of truth for the
self-evolving scoring loop. The Karpathy-style markdown wiki in /knowledge
is the *understanding* layer; this DB is the *telemetry* layer.

Design rules:
    - One file: /root/oracle/v3/data/aion.db
    - WAL mode so the curator and API can read/write concurrently
    - Full raw snapshots kept as JSON blobs alongside the indexed columns,
      so we can always rehydrate even if the schema evolves
    - Append-only for history tables (weight_versions, evaluations,
      curator_log, discovery_snapshots). We never rewrite history.
    - wallets_seen is the only mutable table — it aggregates across runs.

Everything else reads from these tables instead of re-parsing JSON.
"""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Iterable, Iterator, Optional

DB_PATH = os.environ.get("AION_DB_PATH", "/root/oracle/v3/data/aion.db")

SCHEMA = """
PRAGMA journal_mode = WAL;
PRAGMA synchronous  = NORMAL;
PRAGMA foreign_keys = ON;

-- Every set of scoring weights we've ever used, with reasoning.
-- Append-only. Latest version is the one with the largest version number.
CREATE TABLE IF NOT EXISTS weight_versions (
    version       INTEGER PRIMARY KEY AUTOINCREMENT,
    weights_json  TEXT    NOT NULL,
    committed_at  TEXT    NOT NULL,
    proposed_by   TEXT    NOT NULL,   -- 'initial' | 'manual' | 'curator'
    reasoning     TEXT                 -- why this version exists
);

-- One row per discovery run (memecoin pipeline).
CREATE TABLE IF NOT EXISTS discovery_snapshots (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp       TEXT    NOT NULL,
    chain           TEXT,
    tier            TEXT,
    weights_version INTEGER,
    token_count     INTEGER,
    wallet_count    INTEGER,
    credits_used    INTEGER,
    raw_json        TEXT    NOT NULL,  -- full snapshot blob
    FOREIGN KEY (weights_version) REFERENCES weight_versions(version)
);
CREATE INDEX IF NOT EXISTS idx_snap_ts ON discovery_snapshots(timestamp);

-- One row per (snapshot, token) pair. Forward prices are filled in
-- later by price_tracker.py.
CREATE TABLE IF NOT EXISTS tokens_tracked (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id             INTEGER NOT NULL,
    address                 TEXT    NOT NULL,
    symbol                  TEXT,
    chain                   TEXT,
    accum_score             REAL,
    accum_grade             TEXT,
    tier_passed             INTEGER,   -- 0 / 1
    market_cap_at_discovery REAL,
    entry_price             REAL,
    price_24h               REAL,
    price_48h               REAL,
    price_7d                REAL,
    return_24h_pct          REAL,
    return_48h_pct          REAL,
    return_7d_pct           REAL,
    last_price_check        TEXT,
    FOREIGN KEY (snapshot_id) REFERENCES discovery_snapshots(id)
);
CREATE INDEX IF NOT EXISTS idx_tok_addr ON tokens_tracked(address);
CREATE INDEX IF NOT EXISTS idx_tok_snap ON tokens_tracked(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_tok_check ON tokens_tracked(last_price_check);

-- Aggregated wallet intelligence across all runs.
-- UPSERTed every discovery: if the wallet reappears, bump last_seen + appearances.
CREATE TABLE IF NOT EXISTS wallets_seen (
    address             TEXT PRIMARY KEY,
    chain               TEXT,
    label               TEXT,
    first_seen          TEXT NOT NULL,
    last_seen           TEXT NOT NULL,
    appearances         INTEGER DEFAULT 1,
    current_grade       TEXT,
    current_score       REAL,
    grade_history_json  TEXT,          -- [{"timestamp": "...", "grade": "A", "score": 85}]
    tokens_bought_json  TEXT           -- [{"address": "...", "symbol": "...", "seen_at": "..."}]
);

-- Polymarket run snapshots — mirror of discovery_snapshots for prediction markets.
CREATE TABLE IF NOT EXISTS polymarket_snapshots (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp            TEXT NOT NULL,
    scanned_markets      INTEGER,
    hot_markets          INTEGER,
    unique_whales        INTEGER,
    graded_whales        INTEGER,
    convergence_whales   INTEGER,
    credits_used         INTEGER,
    raw_json             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pm_ts ON polymarket_snapshots(timestamp);

-- Per-run evaluations of how well the current scoring predicts forward returns.
CREATE TABLE IF NOT EXISTS evaluations (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp                TEXT NOT NULL,
    weights_version          INTEGER,
    total_tracked            INTEGER,
    winners                  INTEGER,
    losers                   INTEGER,
    high_score_avg_return    REAL,
    low_score_avg_return     REAL,
    tier_passed_avg_return   REAL,
    tier_failed_avg_return   REAL,
    scoring_effective        INTEGER,     -- 0 / 1
    tier_filter_effective    INTEGER,
    recommendation           TEXT,
    raw_json                 TEXT,
    FOREIGN KEY (weights_version) REFERENCES weight_versions(version)
);

-- What the curator did. This is the grep-parseable timeline that
-- mirrors knowledge/log.md, but queryable.
CREATE TABLE IF NOT EXISTS curator_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp   TEXT NOT NULL,
    action      TEXT NOT NULL,   -- 'snapshot_ingested' | 'wallet_page_written' |
                                 -- 'token_page_written' | 'weight_adjusted' |
                                 -- 'lint_pass' | 'weekly_digest'
    target      TEXT,            -- file path or entity id
    details     TEXT             -- free-form JSON
);
CREATE INDEX IF NOT EXISTS idx_curlog_ts ON curator_log(timestamp);
"""

DEFAULT_WEIGHTS = {
    "buy_sell_ratio":     25,
    "buyer_diversity":    25,
    "sm_presence":        20,
    "volume_consistency": 15,
    "buyer_count":        15,
}


# ─────────────────────────────────────────────────────────────────────────────
# Connection helpers
# ─────────────────────────────────────────────────────────────────────────────

@contextmanager
def connect(path: str = DB_PATH) -> Iterator[sqlite3.Connection]:
    """Yield a sqlite3 connection with row_factory + foreign_keys on."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(path: str = DB_PATH) -> None:
    """Create all tables + seed the initial weight version if empty."""
    with connect(path) as c:
        c.executescript(SCHEMA)
        # Seed the initial weight version if none exists
        row = c.execute("SELECT COUNT(*) AS n FROM weight_versions").fetchone()
        if row["n"] == 0:
            c.execute(
                "INSERT INTO weight_versions (weights_json, committed_at, proposed_by, reasoning) "
                "VALUES (?, ?, ?, ?)",
                (
                    json.dumps(DEFAULT_WEIGHTS),
                    _now(),
                    "initial",
                    "Seeded from DEFAULT_WEIGHTS. 25/25/20/15/15 split across buy_sell_ratio, "
                    "buyer_diversity, sm_presence, volume_consistency, buyer_count. "
                    "These are hand-chosen priors, not yet evaluated against forward returns.",
                ),
            )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ─────────────────────────────────────────────────────────────────────────────
# Weight versions
# ─────────────────────────────────────────────────────────────────────────────

def get_current_weights() -> dict:
    with connect() as c:
        row = c.execute(
            "SELECT version, weights_json, committed_at, reasoning "
            "FROM weight_versions ORDER BY version DESC LIMIT 1"
        ).fetchone()
        if not row:
            return {"version": 0, **DEFAULT_WEIGHTS}
        weights = json.loads(row["weights_json"])
        weights["version"]       = row["version"]
        weights["committed_at"]  = row["committed_at"]
        weights["reasoning"]     = row["reasoning"]
        return weights


def commit_weight_version(weights: dict, reasoning: str, proposed_by: str = "curator") -> int:
    payload = {k: v for k, v in weights.items() if k in DEFAULT_WEIGHTS}
    with connect() as c:
        cur = c.execute(
            "INSERT INTO weight_versions (weights_json, committed_at, proposed_by, reasoning) "
            "VALUES (?, ?, ?, ?)",
            (json.dumps(payload), _now(), proposed_by, reasoning),
        )
        return cur.lastrowid


# ─────────────────────────────────────────────────────────────────────────────
# Discovery snapshots
# ─────────────────────────────────────────────────────────────────────────────

def record_discovery_snapshot(snapshot: dict) -> int:
    """Insert a full discovery snapshot and its tokens_tracked rows."""
    tokens = snapshot.get("tokens", [])
    wallets = snapshot.get("wallets", [])
    weights = get_current_weights()

    with connect() as c:
        cur = c.execute(
            "INSERT INTO discovery_snapshots "
            "(timestamp, chain, tier, weights_version, token_count, wallet_count, credits_used, raw_json) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                snapshot.get("timestamp", _now()),
                snapshot.get("chain", ""),
                snapshot.get("tier", ""),
                weights.get("version", 0),
                len(tokens),
                len(wallets),
                (snapshot.get("credits", {}) or {}).get("used", 0),
                json.dumps(snapshot, default=str),
            ),
        )
        snap_id = cur.lastrowid

        for t in tokens:
            accum = t.get("accumulation", {}) or {}
            tier = t.get("tier_filter", {}) or {}
            c.execute(
                "INSERT INTO tokens_tracked "
                "(snapshot_id, address, symbol, chain, accum_score, accum_grade, tier_passed, "
                " market_cap_at_discovery, entry_price) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    snap_id,
                    t.get("address", ""),
                    t.get("symbol", ""),
                    t.get("chain", ""),
                    float(accum.get("score") or 0),
                    accum.get("grade", "?"),
                    1 if tier.get("passed") else 0,
                    float(t.get("market_cap") or 0),
                    None,  # filled by price_tracker on first run
                ),
            )

        # Upsert every wallet seen
        now = _now()
        for w in wallets:
            addr = w.get("address", "")
            if not addr:
                continue
            grade = w.get("grade", "?")
            score = float(w.get("score") or 0)
            row = c.execute(
                "SELECT grade_history_json, tokens_bought_json, appearances "
                "FROM wallets_seen WHERE address = ?",
                (addr,),
            ).fetchone()
            if row:
                hist = json.loads(row["grade_history_json"] or "[]")
                hist.append({"timestamp": now, "grade": grade, "score": score})
                # Cap history at 200 entries to keep the row small
                hist = hist[-200:]
                tokens_bought = json.loads(row["tokens_bought_json"] or "[]")
                for tok in (w.get("hot_token_buys") or []):
                    # hot_token_buys is a list of dicts from the pipeline:
                    #   {"token": "WTAO", "token_address": "0x...", "value": 1999.89}
                    # Flatten into our canonical shape so the curator does not
                    # have to handle nested dicts.
                    if isinstance(tok, dict):
                        tokens_bought.append({
                            "address": tok.get("token_address") or "",
                            "symbol": tok.get("token") or "",
                            "value_usd": tok.get("value"),
                            "seen_at": now,
                        })
                    else:
                        tokens_bought.append({"address": str(tok), "seen_at": now})
                tokens_bought = tokens_bought[-200:]
                c.execute(
                    "UPDATE wallets_seen SET "
                    "last_seen = ?, appearances = appearances + 1, "
                    "current_grade = ?, current_score = ?, "
                    "grade_history_json = ?, tokens_bought_json = ?, "
                    "label = COALESCE(?, label) "
                    "WHERE address = ?",
                    (now, grade, score, json.dumps(hist), json.dumps(tokens_bought),
                     w.get("label") or None, addr),
                )
            else:
                c.execute(
                    "INSERT INTO wallets_seen "
                    "(address, chain, label, first_seen, last_seen, appearances, "
                    " current_grade, current_score, grade_history_json, tokens_bought_json) "
                    "VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)",
                    (
                        addr,
                        w.get("chain", ""),
                        w.get("label", ""),
                        now,
                        now,
                        grade,
                        score,
                        json.dumps([{"timestamp": now, "grade": grade, "score": score}]),
                        json.dumps([
                            {
                                "address": (tok.get("token_address") or "") if isinstance(tok, dict) else str(tok),
                                "symbol": (tok.get("token") or "") if isinstance(tok, dict) else "",
                                "value_usd": tok.get("value") if isinstance(tok, dict) else None,
                                "seen_at": now,
                            }
                            for tok in (w.get("hot_token_buys") or [])
                        ]),
                    ),
                )

        # Log this ingest
        c.execute(
            "INSERT INTO curator_log (timestamp, action, target, details) VALUES (?, ?, ?, ?)",
            (now, "snapshot_ingested", f"discovery_snapshots/{snap_id}",
             json.dumps({"tokens": len(tokens), "wallets": len(wallets)})),
        )

        return snap_id


def record_polymarket_snapshot(snapshot: dict) -> int:
    with connect() as c:
        funnel = snapshot.get("funnel", {}) or {}
        credits = snapshot.get("credits", {}) or {}
        cur = c.execute(
            "INSERT INTO polymarket_snapshots "
            "(timestamp, scanned_markets, hot_markets, unique_whales, graded_whales, "
            " convergence_whales, credits_used, raw_json) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                snapshot.get("timestamp", _now()),
                funnel.get("scanned_markets", 0),
                funnel.get("hot_markets", 0),
                funnel.get("unique_whales", 0),
                funnel.get("graded_whales", 0),
                funnel.get("convergence_whales", 0),
                credits.get("used", 0),
                json.dumps(snapshot, default=str),
            ),
        )
        pm_id = cur.lastrowid
        c.execute(
            "INSERT INTO curator_log (timestamp, action, target, details) VALUES (?, ?, ?, ?)",
            (_now(), "polymarket_ingested", f"polymarket_snapshots/{pm_id}",
             json.dumps(funnel)),
        )
        return pm_id


# ─────────────────────────────────────────────────────────────────────────────
# Forward price updates (called by price_tracker.py)
# ─────────────────────────────────────────────────────────────────────────────

def tokens_needing_price_update(max_age_days: int = 10) -> list[sqlite3.Row]:
    """Return tokens whose forward prices still need filling in."""
    with connect() as c:
        return c.execute("""
            SELECT t.id, t.snapshot_id, t.address, t.symbol, t.chain,
                   t.entry_price, t.price_24h, t.price_48h, t.price_7d,
                   s.timestamp AS snap_ts
            FROM tokens_tracked t
            JOIN discovery_snapshots s ON s.id = t.snapshot_id
            WHERE (t.price_24h IS NULL OR t.price_48h IS NULL OR t.price_7d IS NULL)
              AND s.timestamp >= datetime('now', ?)
            ORDER BY s.timestamp DESC
        """, (f"-{max_age_days} days",)).fetchall()


def update_token_price(token_id: int, price: float, snap_timestamp: str) -> None:
    """Update whichever forward-price slot is appropriate for the elapsed time."""
    now = datetime.now(timezone.utc)
    try:
        snap_dt = datetime.fromisoformat(snap_timestamp.replace("Z", "+00:00"))
        if snap_dt.tzinfo is None:
            snap_dt = snap_dt.replace(tzinfo=timezone.utc)
    except Exception:
        return
    elapsed_hours = (now - snap_dt).total_seconds() / 3600.0

    with connect() as c:
        row = c.execute(
            "SELECT entry_price, price_24h, price_48h, price_7d FROM tokens_tracked WHERE id = ?",
            (token_id,),
        ).fetchone()
        if not row:
            return

        entry = row["entry_price"]
        # First-ever price check: set entry_price
        if entry is None or entry == 0:
            c.execute(
                "UPDATE tokens_tracked SET entry_price = ?, last_price_check = ? WHERE id = ?",
                (price, _now(), token_id),
            )
            return

        updates: dict[str, Any] = {}
        if row["price_24h"] is None and elapsed_hours >= 24:
            updates["price_24h"]      = price
            updates["return_24h_pct"] = ((price - entry) / entry) * 100 if entry else None
        if row["price_48h"] is None and elapsed_hours >= 48:
            updates["price_48h"]      = price
            updates["return_48h_pct"] = ((price - entry) / entry) * 100 if entry else None
        if row["price_7d"] is None and elapsed_hours >= 168:
            updates["price_7d"]       = price
            updates["return_7d_pct"]  = ((price - entry) / entry) * 100 if entry else None
        if not updates:
            c.execute("UPDATE tokens_tracked SET last_price_check = ? WHERE id = ?",
                      (_now(), token_id))
            return

        updates["last_price_check"] = _now()
        cols = ", ".join(f"{k} = ?" for k in updates)
        c.execute(f"UPDATE tokens_tracked SET {cols} WHERE id = ?",
                  (*updates.values(), token_id))


# ─────────────────────────────────────────────────────────────────────────────
# Evaluation (reads forward prices, writes to evaluations)
# ─────────────────────────────────────────────────────────────────────────────

def run_evaluation() -> dict:
    """Compare high-score vs low-score token forward returns."""
    with connect() as c:
        rows = c.execute("""
            SELECT accum_score, accum_grade, tier_passed,
                   return_24h_pct, return_48h_pct, return_7d_pct,
                   symbol
            FROM tokens_tracked
            WHERE return_24h_pct IS NOT NULL OR return_48h_pct IS NOT NULL
        """).fetchall()

        if len(rows) < 5:
            return {
                "status": "insufficient_data",
                "tracked": len(rows),
                "message": f"Only {len(rows)} tokens have forward prices. Need ≥5."
            }

        def avg(xs: Iterable[float]) -> float:
            xs = [x for x in xs if x is not None]
            return round(sum(xs) / len(xs), 2) if xs else 0.0

        # Use best available return (prefer 48h > 24h)
        def best_return(r) -> Optional[float]:
            return r["return_48h_pct"] if r["return_48h_pct"] is not None else r["return_24h_pct"]

        returns = [(r, best_return(r)) for r in rows]
        returns = [(r, x) for r, x in returns if x is not None]

        high  = [x for r, x in returns if r["accum_score"] >= 60]
        low   = [x for r, x in returns if r["accum_score"] <  60]
        passed = [x for r, x in returns if r["tier_passed"]]
        failed = [x for r, x in returns if not r["tier_passed"]]

        high_avg   = avg(high)
        low_avg    = avg(low)
        passed_avg = avg(passed)
        failed_avg = avg(failed)

        winners = [r for r, x in returns if x > 0]
        losers  = [r for r, x in returns if x <= 0]

        scoring_ok = high_avg > low_avg
        tier_ok    = passed_avg > failed_avg

        if scoring_ok and tier_ok:
            rec = "Scoring and tier filter are both predictive. Hold weights steady."
        elif not scoring_ok:
            rec = ("High-score tokens are underperforming low-score ones. Consider raising "
                   "sm_presence and buyer_diversity weights, or lowering buy_sell_ratio.")
        else:
            rec = "Tier filter is rejecting better performers. Consider loosening tier thresholds."

        weights = get_current_weights()
        evaluation = {
            "timestamp":              _now(),
            "weights_version":        weights.get("version", 0),
            "total_tracked":          len(returns),
            "winners":                len(winners),
            "losers":                 len(losers),
            "high_score_avg_return":  high_avg,
            "low_score_avg_return":   low_avg,
            "tier_passed_avg_return": passed_avg,
            "tier_failed_avg_return": failed_avg,
            "scoring_effective":      scoring_ok,
            "tier_filter_effective":  tier_ok,
            "recommendation":         rec,
        }

        c.execute(
            "INSERT INTO evaluations "
            "(timestamp, weights_version, total_tracked, winners, losers, "
            " high_score_avg_return, low_score_avg_return, "
            " tier_passed_avg_return, tier_failed_avg_return, "
            " scoring_effective, tier_filter_effective, recommendation, raw_json) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                evaluation["timestamp"], evaluation["weights_version"],
                evaluation["total_tracked"], evaluation["winners"], evaluation["losers"],
                high_avg, low_avg, passed_avg, failed_avg,
                1 if scoring_ok else 0, 1 if tier_ok else 0, rec,
                json.dumps(evaluation),
            ),
        )
        return {"status": "evaluated", **evaluation}


def apply_evaluation_feedback(evaluation: dict, *, min_tracked: int = 10,
                              step: float = 0.15) -> Optional[dict]:
    """Nudge scoring weights based on an evaluation result.

    Strategy: if the current weights are *not* predictive (high-score tokens
    underperforming low-score ones), shift `step` fraction of the
    `buy_sell_ratio` weight onto `sm_presence` and `buyer_diversity`, since
    those signals have historically been the strongest predictors of forward
    returns and buy/sell ratio is the easiest to game. If tier filter is
    rejecting better performers, we just note it in the reasoning — tier
    thresholds live in accumulation.apply_risk_tier and aren't weights.

    Only applies adjustments when:
      - evaluation status == "evaluated"
      - total_tracked ≥ `min_tracked` (need enough signal to act on)
      - scoring_effective is False

    Returns the committed weights dict (with version) if a new version was
    written, otherwise None. Never raises — self-learning failures must not
    block discovery.
    """
    try:
        if not isinstance(evaluation, dict):
            return None
        if evaluation.get("status") != "evaluated":
            return None
        if int(evaluation.get("total_tracked", 0)) < min_tracked:
            return None
        if evaluation.get("scoring_effective"):
            return None  # weights are already working — leave them alone

        current = get_current_weights()
        w = {k: float(current.get(k, DEFAULT_WEIGHTS[k])) for k in DEFAULT_WEIGHTS}

        # Don't drain buy_sell_ratio below a floor of 10 — it's still a signal,
        # just an over-weighted one relative to the others.
        drain = min(step * w["buy_sell_ratio"], max(0.0, w["buy_sell_ratio"] - 10.0))
        if drain <= 0.01:
            return None  # nothing meaningful to move

        w["buy_sell_ratio"] -= drain
        w["sm_presence"]    += drain * 0.6
        w["buyer_diversity"] += drain * 0.4

        # Re-normalize to sum=100 so the total score still caps at 100.
        total = sum(w.values())
        if total <= 0:
            return None
        factor = 100.0 / total
        w = {k: round(v * factor, 2) for k, v in w.items()}

        reasoning = (
            f"Auto-adapted after evaluation: high-score avg return "
            f"{evaluation.get('high_score_avg_return'):.2f}% vs low-score "
            f"{evaluation.get('low_score_avg_return'):.2f}% over "
            f"{evaluation.get('total_tracked')} tracked tokens. Shifted "
            f"{drain:.2f} weight points from buy_sell_ratio -> sm_presence + "
            f"buyer_diversity and re-normalized to 100."
        )
        new_version = commit_weight_version(w, reasoning, proposed_by="auto_evolution")
        committed = {**w, "version": new_version, "reasoning": reasoning}
        return committed
    except Exception as e:
        # Never let self-learning break the pipeline.
        print(f"[db.apply_evaluation_feedback] failed: {e}")
        return None


def run_evaluation_and_adapt(**kwargs) -> dict:
    """Run an evaluation and, if the result supports it, nudge weights.

    Returns the evaluation dict with a `new_weights` key populated when a
    new weight version was committed. Safe to call from the discovery hook.
    """
    evaluation = run_evaluation()
    new_w = apply_evaluation_feedback(evaluation, **kwargs)
    if new_w:
        evaluation = dict(evaluation)
        evaluation["new_weights"] = new_w
    return evaluation


# ─────────────────────────────────────────────────────────────────────────────
# Read helpers for the API + curator
# ─────────────────────────────────────────────────────────────────────────────

def get_latest_snapshot() -> Optional[dict]:
    with connect() as c:
        row = c.execute(
            "SELECT * FROM discovery_snapshots ORDER BY id DESC LIMIT 1"
        ).fetchone()
        return dict(row) if row else None


def get_wallet(address: str) -> Optional[dict]:
    with connect() as c:
        row = c.execute(
            "SELECT * FROM wallets_seen WHERE address = ?", (address,)
        ).fetchone()
        return dict(row) if row else None


def list_recurring_wallets(min_appearances: int = 2, limit: int = 50) -> list[dict]:
    with connect() as c:
        rows = c.execute(
            "SELECT * FROM wallets_seen "
            "WHERE appearances >= ? "
            "ORDER BY appearances DESC, current_score DESC LIMIT ?",
            (min_appearances, limit),
        ).fetchall()
        return [dict(r) for r in rows]


def get_curator_log(limit: int = 100) -> list[dict]:
    with connect() as c:
        rows = c.execute(
            "SELECT * FROM curator_log ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def log_curator_action(action: str, target: str, details: dict | None = None) -> None:
    with connect() as c:
        c.execute(
            "INSERT INTO curator_log (timestamp, action, target, details) VALUES (?, ?, ?, ?)",
            (_now(), action, target, json.dumps(details or {})),
        )


def get_evolution_status() -> dict:
    """Shape compatible with the old evolution.py API so the frontend doesn't break."""
    with connect() as c:
        weights = get_current_weights()
        total_snapshots = c.execute(
            "SELECT COUNT(*) AS n FROM discovery_snapshots"
        ).fetchone()["n"]
        total_tracked = c.execute(
            "SELECT COUNT(*) AS n FROM tokens_tracked"
        ).fetchone()["n"]
        with_prices = c.execute(
            "SELECT COUNT(*) AS n FROM tokens_tracked WHERE return_24h_pct IS NOT NULL"
        ).fetchone()["n"]
        latest_eval = c.execute(
            "SELECT * FROM evaluations ORDER BY id DESC LIMIT 1"
        ).fetchone()
        history = c.execute(
            "SELECT * FROM evaluations ORDER BY id DESC LIMIT 5"
        ).fetchall()
        return {
            "weights": weights,
            "total_snapshots":         total_snapshots,
            "total_tracked_tokens":    total_tracked,
            "tokens_with_forward_px":  with_prices,
            "latest_evaluation":       dict(latest_eval) if latest_eval else None,
            "history":                 [dict(h) for h in history],
        }


# ─────────────────────────────────────────────────────────────────────────────
# Migration from legacy JSON files
# ─────────────────────────────────────────────────────────────────────────────

def migrate_from_json(data_dir: str = "/root/oracle/v3/data") -> dict:
    """One-shot migration: pull any existing JSON data into SQLite."""
    init_db()
    result = {"snapshots": 0, "polymarket": 0, "weights": 0}

    # Discovery snapshot
    disc_path = os.path.join(data_dir, "discovery_latest.json")
    if os.path.exists(disc_path):
        with open(disc_path) as f:
            snap = json.load(f)
        record_discovery_snapshot(snap)
        result["snapshots"] += 1

    # Polymarket snapshot
    pm_path = os.path.join(data_dir, "polymarket_latest.json")
    if os.path.exists(pm_path):
        with open(pm_path) as f:
            pm = json.load(f)
        record_polymarket_snapshot(pm)
        result["polymarket"] += 1

    # Legacy evolution.json — pull any historical snapshots in
    ev_path = os.path.join(data_dir, "evolution.json")
    if os.path.exists(ev_path):
        try:
            with open(ev_path) as f:
                ev = json.load(f)
            for snap in ev.get("snapshots", []):
                # Evolution stored a simplified schema, wrap it back into our format
                fake = {
                    "timestamp": snap.get("timestamp", _now()),
                    "tokens":    snap.get("tokens", []),
                    "wallets":   [],
                    "credits":   {"used": 0},
                }
                record_discovery_snapshot(fake)
                result["snapshots"] += 1
        except Exception as e:
            print(f"[migrate] evolution.json skipped: {e}")

    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "migrate":
        print("Initialising + migrating...")
        init_db()
        r = migrate_from_json()
        print(f"✓ Migrated: {r}")
        print(f"✓ Current weights: {get_current_weights()}")
        print(f"✓ Status: {get_evolution_status()}")
    else:
        print("Initialising schema...")
        init_db()
        print(f"✓ DB at {DB_PATH}")
        print(f"✓ Current weights: {get_current_weights()}")
