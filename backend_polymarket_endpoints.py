

# ══════════════════════════════════════════════════════
# POLYMARKET DISCOVERY
# ══════════════════════════════════════════════════════

@app.route("/api/polymarket/discovery/latest", methods=["GET"])
def api_polymarket_latest():
    """Latest Polymarket discovery results (markets, whales, convergence)."""
    data = _load_json("polymarket_latest.json")
    if not data:
        return jsonify({"error": "No Polymarket data yet. Run /api/polymarket/discovery/run first."}), 404
    return jsonify(data)


@app.route("/api/polymarket/discovery/run", methods=["POST"])
def api_polymarket_run():
    """Trigger a Polymarket discovery run. Costs ~31 credits."""
    try:
        from polymarket_pipeline import polymarket_discovery
    except Exception as e:
        return jsonify({"success": False, "error": f"import failed: {e}"}), 500

    payload = request.get_json(silent=True) or {}
    top_n = int(payload.get("top_n_markets", 20))
    deep_dive = int(payload.get("deep_dive_top", 5))

    try:
        result = polymarket_discovery(
            top_n_markets=top_n,
            deep_dive_top=deep_dive,
            notify_fn=None,
            save=True,
        )
    except Exception as e:
        import traceback
        return jsonify({
            "success": False,
            "error": str(e),
            "trace": traceback.format_exc().splitlines()[-5:],
        }), 500

    return jsonify({
        "success": True,
        "funnel": result.get("funnel", {}),
        "credits": result.get("credits", {}),
        "timestamp": result.get("timestamp"),
    })


@app.route("/api/polymarket/markets", methods=["GET"])
def api_polymarket_markets():
    """Just the markets from latest Polymarket discovery."""
    data = _load_json("polymarket_latest.json")
    if not data:
        return jsonify({"error": "No Polymarket data yet."}), 404
    return jsonify({
        "markets": data.get("markets", []),
        "hot_markets": data.get("hot_markets", []),
        "timestamp": data.get("timestamp"),
    })


@app.route("/api/polymarket/whales", methods=["GET"])
def api_polymarket_whales():
    """Graded whales from latest Polymarket discovery."""
    data = _load_json("polymarket_latest.json")
    if not data:
        return jsonify({"error": "No Polymarket data yet."}), 404
    return jsonify({
        "whales": data.get("whales", []),
        "convergence": data.get("convergence", []),
        "timestamp": data.get("timestamp"),
    })
