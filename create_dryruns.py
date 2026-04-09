"""Create dry-run trades for all 10 discovered tokens for tracking."""
import json
import time
import uuid

trades_path = "data/trades.json"
try:
    with open(trades_path) as f:
        trades = json.load(f)
except Exception:
    trades = []

with open("data/price_snapshot_apr7.json") as f:
    snap = json.load(f)

ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
new_trades = []

for t in snap["tokens"]:
    sym = t["symbol"]
    price = t["price_usd"]
    rec = t["recommended"]
    size = 100.0 if rec else 0
    tag = "RECOMMENDED" if rec else "tracking"

    trade = {
        "id": str(uuid.uuid4())[:8],
        "token": t["address"],
        "symbol": sym,
        "chain": "solana",
        "side": "buy",
        "entry_price": price,
        "size_usdc": size,
        "timestamp": ts,
        "status": "open",
        "exit_price": None,
        "exit_reason": None,
        "pnl_usd": None,
        "pnl_pct": None,
        "dry_run": True,
        "recommended": rec,
        "grade": t["grade"],
        "score": t["score"],
        "mcap_at_entry": t["mcap_dex"],
    }
    new_trades.append(trade)
    print("  %10s @ $%-14.8f | $%-5s | %s" % (sym, price, str(int(size)), tag))

trades.extend(new_trades)
with open(trades_path, "w") as f:
    json.dump(trades, f, indent=2)

rec_count = sum(1 for t in new_trades if t["recommended"])
track_count = sum(1 for t in new_trades if not t["recommended"])
print()
print("Added %d dry-run trades (%d recommended, %d tracking)" % (len(new_trades), rec_count, track_count))
print("Total trades in file: %d" % len(trades))
