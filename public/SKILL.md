# ORACLE v3 — Smart Money Intelligence Skill

**For OpenClaw agents (and humans).** Gives any AI agent the ability to discover, grade, and copy-trade smart money wallets using Nansen data.

---

## Quick Setup (for agents)

Tell your agent:
```
Read https://oracle.trueprav.com/SKILL.md and follow the setup instructions.
```

---

## What ORACLE Does

1. **Discover** — Find hot tokens and grade the Smart Money wallets buying them
2. **Scout** — Find 1 top wallet and their 3 most recent buys (cheap, 6 credits)
3. **Lookup** — Research any token's top traders by address
4. **Copy-Trade** — Execute trades from the Oracle VPS wallet via Telegram buttons
5. **Alert** — Get notified when top wallets accumulate a new token

---

## Setup

### 1. Requirements
- VPS (or any server) with:
  - Node.js 18+ and Python 3.10+
  - Nansen CLI (`npm install -g nansen-cli`)
  - `nansen login` with your Nansen API key
  - Screen or systemd to keep Oracle running
- Telegram bot (create via @BotFather)
- OpenClaw agent (optional, for AI agent control)

### 2. Install

```bash
# Clone
git clone https://github.com/TruePrav/oracle-v3.git
cd oracle-v3

# Install Python deps
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your credentials (see below)

# Start
python oracle_main.py --serve
```

### 3. Environment Variables

Create a `.env` file:

```env
NANSEN_API_KEY=your_nansen_api_key_here
ORACLE_TG_TOKEN=your_telegram_bot_token
ORACLE_TG_CHAT=your_telegram_chat_id
EXECUTION_MODE=dryrun          # or "live" for real trading
```

Get your Nansen API key: https://app.nansen.ai/settings/api
Get Telegram bot token: Message @BotFather on Telegram
Get your chat ID: Send a message to your bot, then check https://api.telegram.org/bot<TOKEN>/getUpdates

---

## Commands

### Discovery (`/discover`)
```
/discover
/discover degen        # Degen mode: new tokens, high risk, $10K+ MCap
/discover balanced      # Default: established tokens, $1M+ MCap, 7d+ age
/discover conservative # Blue chips: $10M+ MCap, 30d+ age
```

**What it does:**
1. Pulls top tokens by 7-day Smart Money inflow (5 credits)
2. Finds active SM wallets from recent dex-trades (5 credits)
3. Scores each token's accumulation quality (0 credits)
4. Grades top wallets 0-100 based on their trading history (1 credit each)
5. Maps wallet networks to detect syndicates and alt-wallets (1 credit each)
6. Validates token contracts for honeypots and tax (0 credits, GoPlus API)

**Full run: ~50 credits**

**Output:** Telegram message with:
- Top tokens ranked by SM inflow
- Graded wallet cards (S/A/B/C/D) with scores
- Accumulation quality grade per token
- Copy-Trade buttons ($0.50 / $10 / $25) on each signal

---

### Scout (`/scout`)
```
/scout
/scout solana
/scout base
/scout bnb
```

**What it does:**
1. Finds the most active Smart Money buyer from recent dex-trades (5 credits)
2. Grades their wallet (1 credit)
3. Shows their 3 most recent buys with timestamps

**Cost: ~6 credits** — cheap for quick alpha

**Output:** Wallet grade card + 3 recent buy cards, each with:
- Token name, contract address, USD value, timestamp
- Copy $0.50 / $10 / $25 buttons
- Nansen live chart link

---

### Lookup (`/lookup`)
```
/lookup <token_contract_address>
/lookup <token_contract_address> base
```

Example:
```
/lookup 7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr solana
```

**What it does:**
1. Fetches token info (1 credit)
2. Finds top buyers and sellers (1 credit)
3. Pulls PnL leaderboard for the token (5 credits)
4. Grades top traders (1 credit each)

**Cost: ~10-25 credits depending on trader count**

**Output:** Token info card + ranked list of traders with grades

---

### Status (`/status`)
```
/status
```
Shows: Credits remaining, trading mode, open positions, total PnL.

---

### Credits (`/credits`)
```
/credits
```
Checks your Nansen credit balance.

---

### Positions (`/positions`)
```
/positions
```
Lists open positions with hold duration.

---

### History (`/history`)
```
/history
```
Last 10 trades with PnL.

---

### Mode (`/mode`)
```
/mode approval    # You confirm each trade manually
/mode autonomous  # Bot executes automatically
```

---

### Dry Run (`/dryrun`)
```
/dryrun on    # Simulate trades (default)
/dryrun off   # Real trades on live wallet
```

---

## Credit Costs

| Command | Credits | Notes |
|---------|---------|-------|
| `/discover` | ~50 | 10 tokens, 30 wallets, 5 graph maps |
| `/scout` | ~6 | 1 wallet, 3 buys |
| `/lookup` | ~10-25 | Token + traders |
| `/status`, `/credits`, `/positions` | 0 | Free |
| GoPlus validation | 0 | Free external API |

**ORACLE uses 30-56 credits per full discovery run. Competitors burn 100+ credits for the same data.**

---

## How Wallet Grading Works

Each wallet is scored 0-100 using Nansen's `profiler pnl` endpoint (1 credit per wallet):

| Factor | Points | Description |
|--------|--------|-------------|
| Win Rate | 0-30 | % of positions with positive realized PnL |
| Total PnL | 0-25 | Realized profit in USD |
| Activity | 0-15 | Total buy/sell count |
| ROI | 0-15 | Realized PnL / amount invested |
| Diversification | 0-15 | Unique tokens traded |

**Grades:** S (90+) | A (75+) | B (50+) | C (30+) | D (<30)

---

## How Accumulation Scoring Works

Distinguishes genuine accumulation from pump-and-dump rotation (0 extra credits):

| Signal | Points | What It Measures |
|--------|--------|------------------|
| Buy/Sell Ratio | 0-25 | Total buy volume / sell volume. 4:1+ = accumulation |
| Buyer Diversity | 0-25 | Many small buyers = organic. One whale = risky |
| SM Presence | 0-20 | Count of labeled Smart Money among buyers |
| Volume Consistency | 0-15 | Steady buy sizes = planned accumulation |
| Buyer Count | 0-15 | More unique buyers = stronger signal |

---

## API (for integrations)

The bot serves a JSON API at `http://your-vps:5001`:

```bash
# Status
curl http://localhost:5001/api/status

# Latest discovery
curl http://localhost:5001/api/discovery/latest

# Open positions with hold duration
curl http://localhost:5001/api/trades/open

# Grading methodology
curl http://localhost:5001/api/methodology

# Credit usage log
curl http://localhost:5001/api/credits/log
```

---

## For AI Agents

When ORACLE is running on a VPS, your OpenClaw agent can control it via:

```bash
# SSH to VPS and run discovery
ssh user@vps "cd /root/oracle/v3 && python oracle_main.py --discover"

# Check results
ssh user@vps "cat /root/oracle/v3/data/discovery_latest.json"

# Or via the REST API
curl http://vps:5001/api/discovery/latest
```

---

## Project Structure

```
oracle-v3/
  oracle_main.py      # Entry: Telegram bot + CLI + API server
  pipeline.py         # Discovery / Lookup / Scout logic
  grader.py           # Wallet scoring (profiler pnl -> 0-100 score)
  accumulation.py     # Accumulation quality scoring
  graph_mapper.py     # Wallet network mapping
  validator.py        # Token safety (GoPlus, free)
  executor.py         # Trade execution (Nansen CLI quote/execute)
  telegram_bot.py      # Telegram UI with Buy buttons
  address_cache.py    # Resolves truncated addresses in callbacks
  pnl.py              # Trade P&L tracking
  config.py           # Environment config
  data/               # Runtime data (gitignored)
    discovery_latest.json
    scout_latest.json
    trades.json
```

---

## Competition Edge

| | ORACLE v3 | Typical Competitors |
|--|-----------|---------------------|
| Credits per discovery | ~50 | 100+ |
| Wallet grading | ✅ 0-100 score | ❌ |
| Accumulation scoring | ✅ 5 signals | ❌ |
| Wallet graph mapping | ✅ | ❌ |
| Risk tiers | ✅ 3 modes | ❌ |
| Telegram copy-trade | ✅ 1-tap | ❌ |
| GoPlus validation | ✅ Free | ❌ |
| x402 pay-per-call | ❌ | ✅ |
| Multi-agent discussion | ❌ | ✅ (AI-Trader) |

---

## License

MIT — Clone it, customize it, make it yours.

**GitHub:** https://github.com/TruePrav/oracle-v3
**Demo:** [@OracleAITradingBot](https://t.me/OracleAITradingBot)
