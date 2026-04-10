"""
accumulation.py -- Token accumulation quality scoring.
Uses who-bought-sold data we already pull. 0 extra credits.

Scores whether a token is being genuinely accumulated vs pump-and-dump rotation.

Scoring sub-maxes are pulled from the evolving weight version in the SQLite DB
(see db.get_current_weights), so the self-learning loop in run_evaluation() can
nudge the importance of each signal between discovery runs. If the DB is
unreachable, we fall back to the static 25/25/20/15/15 priors so the pipeline
never hard-fails on infra glitches.
"""

# Hand-picked priors. Must sum to 100 so the total score stays in 0-100.
DEFAULT_WEIGHTS = {
    "buy_sell_ratio":     25,
    "buyer_diversity":    25,
    "sm_presence":        20,
    "volume_consistency": 15,
    "buyer_count":        15,
}


def _current_weights() -> dict:
    """Fetch the latest weight version from SQLite with a safe fallback."""
    try:
        from db import get_current_weights
        w = get_current_weights()
        # Ensure all expected keys are present; fill missing from defaults.
        return {k: float(w.get(k, DEFAULT_WEIGHTS[k])) for k in DEFAULT_WEIGHTS}
    except Exception:
        return {k: float(v) for k, v in DEFAULT_WEIGHTS.items()}


def score_accumulation(buyers: list, sellers: list = None) -> dict:
    """
    Score accumulation quality from who-bought-sold data.

    buyers: list of buyer dicts from token who-bought-sold (BUY)
    sellers: list of seller dicts from token who-bought-sold (SELL), optional

    Returns: {score: 0-100, grade: str, signals: list, metrics: dict}
    """
    if not buyers:
        return {"score": 0, "grade": "F", "signals": ["No buyer data"], "metrics": {}}

    # Evolving weights (sub-score maxes). Must sum to 100.
    w = _current_weights()
    w_bs   = w["buy_sell_ratio"]
    w_div  = w["buyer_diversity"]
    w_sm   = w["sm_presence"]
    w_vol  = w["volume_consistency"]
    w_cnt  = w["buyer_count"]
    
    # ── Metrics ──
    n_buyers = len(buyers)
    n_sellers = len(sellers) if sellers else 0
    
    # Buy volumes
    buy_volumes = []
    sm_buyers = 0
    total_buy_vol = 0
    for b in buyers:
        vol = float(b.get("bought_volume_usd") or b.get("value_usd") or b.get("volume_usd") or 0)
        label = b.get("address_label") or b.get("label") or ""
        buy_volumes.append(vol)
        total_buy_vol += vol
        if "Smart" in label or "Fund" in label or "Whale" in label:
            sm_buyers += 1
    
    # Sell volumes
    sell_volumes = []
    total_sell_vol = 0
    if sellers:
        for s in sellers:
            vol = float(s.get("sold_volume_usd") or s.get("value_usd") or s.get("volume_usd") or 0)
            sell_volumes.append(vol)
            total_sell_vol += vol
    
    # ── Signal 1: Buy/Sell Ratio (0 .. w_bs pts) ──
    # High buy vs sell = accumulation. 4:1 ratio = max score.
    if total_sell_vol > 0:
        bs_ratio = total_buy_vol / total_sell_vol
    else:
        bs_ratio = 10.0 if total_buy_vol > 0 else 0

    bs_score = min(w_bs, (bs_ratio / 4.0) * w_bs)

    # ── Signal 2: Buyer Diversity (0 .. w_div pts) ──
    # Many unique buyers = organic accumulation. 1-2 buyers = whale pump
    if buy_volumes and total_buy_vol > 0:
        # Herfindahl index: lower = more diverse
        shares = [v / total_buy_vol for v in buy_volumes if total_buy_vol > 0]
        hhi = sum(s ** 2 for s in shares)
        diversity = max(0, 1 - hhi)
        div_score = diversity * w_div
    else:
        div_score = 0
        hhi = 1.0

    # ── Signal 3: SM Presence (0 .. w_sm pts) ──
    # More SM wallets buying = stronger signal. 4+ SM buyers = max
    sm_pct = sm_buyers / n_buyers if n_buyers > 0 else 0
    sm_score = min(w_sm, (sm_buyers / 4.0) * w_sm)

    # ── Signal 4: Volume Consistency (0 .. w_vol pts) ──
    # Steady buy sizes = planned accumulation. Wildly varying = chaotic
    if len(buy_volumes) >= 3:
        avg_vol = total_buy_vol / len(buy_volumes)
        if avg_vol > 0:
            cv = (sum((v - avg_vol) ** 2 for v in buy_volumes) / len(buy_volumes)) ** 0.5 / avg_vol
            consistency = max(0, 1 - cv)
            vol_score = consistency * w_vol
        else:
            vol_score = 0
    else:
        vol_score = w_vol * 0.5  # Neutral with few data points

    # ── Signal 5: Buyer Count (0 .. w_cnt pts) ──
    # More unique buyers = better. 20+ buyers = max
    count_score = min(w_cnt, (n_buyers / 20.0) * w_cnt)
    
    # ── Total ──
    total = round(bs_score + div_score + sm_score + vol_score + count_score)
    total = max(0, min(100, total))
    
    grade = ("S" if total >= 85 else "A" if total >= 70 else "B" if total >= 50
             else "C" if total >= 30 else "D")
    
    # Build signal descriptions
    signals = []
    if bs_ratio >= 3:
        signals.append(f"Strong accumulation (buy/sell {bs_ratio:.1f}x)")
    elif bs_ratio >= 1.5:
        signals.append(f"Moderate accumulation (buy/sell {bs_ratio:.1f}x)")
    elif bs_ratio < 0.5 and n_sellers > 0:
        signals.append(f"Distribution phase (buy/sell {bs_ratio:.1f}x)")
    
    if hhi < 0.15:
        signals.append(f"Highly distributed buying ({n_buyers} unique buyers)")
    elif hhi > 0.5:
        signals.append(f"Concentrated buying (dominated by few wallets)")
    
    if sm_buyers >= 3:
        signals.append(f"Strong SM consensus ({sm_buyers} SM wallets buying)")
    elif sm_buyers == 0:
        signals.append("No SM wallets among top buyers")
    
    return {
        "score": total,
        "grade": grade,
        "signals": signals,
        "metrics": {
            "n_buyers": n_buyers,
            "n_sellers": n_sellers,
            "total_buy_volume": round(total_buy_vol, 2),
            "total_sell_volume": round(total_sell_vol, 2),
            "buy_sell_ratio": round(bs_ratio, 2),
            "buyer_concentration_hhi": round(hhi, 4),
            "sm_buyer_count": sm_buyers,
            "sm_buyer_pct": round(sm_pct, 3),
        },
    }


def apply_risk_tier(token: dict, accum: dict, tier: str = "balanced") -> dict:
    """
    Apply risk tier filtering.
    
    tier: 'degen' | 'balanced' | 'conservative'
    token: dict with symbol, market_cap, token_age_days, trader_count, net_flow_7d
    accum: accumulation score dict
    
    Returns: {passed: bool, tier: str, reasons: list}
    """
    reasons = []
    mcap = float(token.get("market_cap") or 0)
    age = int(token.get("token_age_days") or 0)
    traders = int(token.get("trader_count") or 0)
    accum_score = accum.get("score", 0)
    sm_buyers = accum.get("metrics", {}).get("sm_buyer_count", 0)
    
    if tier == "degen":
        # Minimal filtering - just basic safety
        if mcap < 10000:
            reasons.append(f"MCap too low (${mcap:,.0f} < $10K)")
        passed = len(reasons) == 0
        
    elif tier == "balanced":
        if age < 7:
            reasons.append(f"Too new ({age}d < 7d)")
        if mcap < 1_000_000:
            reasons.append(f"MCap too low (${mcap:,.0f} < $1M)")
        if traders < 3:
            reasons.append(f"Too few SM traders ({traders} < 3)")
        if accum_score < 40:
            reasons.append(f"Weak accumulation (score {accum_score} < 40)")
        passed = len(reasons) == 0
        
    elif tier == "conservative":
        if age < 30:
            reasons.append(f"Too new ({age}d < 30d)")
        if mcap < 10_000_000:
            reasons.append(f"MCap too low (${mcap:,.0f} < $10M)")
        if traders < 5:
            reasons.append(f"Too few SM traders ({traders} < 5)")
        if accum_score < 60:
            reasons.append(f"Weak accumulation (score {accum_score} < 60)")
        if sm_buyers < 3:
            reasons.append(f"Too few SM buyers ({sm_buyers} < 3)")
        passed = len(reasons) == 0
        
    else:
        passed = True
    
    return {
        "passed": passed,
        "tier": tier,
        "reasons": reasons,
        "accum_score": accum_score,
        "accum_grade": accum.get("grade", "?"),
    }
