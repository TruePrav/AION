# AION — Smart Money Intelligence Platform

Multi-chain smart money tracking, Polymarket whale analysis, wallet grading, and automated token discovery. Built with the Nansen CLI.

**Live site:** [aion-plum.vercel.app](https://aion-plum.vercel.app)

---

## What it does

AION monitors smart money wallets across **Solana, Base, and Ethereum**, profiles **Polymarket whales** by historical win rate, and surfaces actionable trading signals — all powered by the Nansen CLI. Every 4 hours it runs a full discovery pipeline, grades wallets, scores token accumulation patterns, and pushes alerts to Telegram.

### Key features

**Token Discovery (EVM)**
- Multi-chain scanning — Solana, Base, Ethereum with per-chain token caps at Nansen SM-netflow ceilings
- Wallet grading — S/A/B/C/D system based on win rate, PnL, ROI, consistency, convergence
- Accumulation scoring — buy/sell ratio, buyer concentration, SM buyer percentage
- Risk tier filtering — degen / balanced / conservative presets by mcap, age, trader count
- Auto-buy — dry-run or live position entry on top-scoring tokens per chain

**Polymarket Intelligence**
- Market screener — top 100 markets by 24h volume, deep-dived for whale positions
- Whale profiling — historical win rate, realized PnL, resolved record via `prediction-market pnl-by-address`
- Convergence detection — wallets appearing as top holders across multiple markets
- Contrarian edge signals — markets where whale positioning diverges from market price
- Early mover detection — whales entering markets before major price moves
- Paper betting engine — AION's own model bets tracked for performance

**Platform**
- Ask AION — AI chat (Claude) that answers questions about live discovery data
- Telegram bot — real-time alerts with AI reasoning for each signal
- Copy trading — one-click trade execution via Nansen wallet
- Wallet graph mapping — related-wallet discovery to detect clusters and syndicates
- Self-learning weights — scoring parameters evolve based on realized trade outcomes
- Wiki/Knowledge base — auto-generated Karpathy-style entity pages for wallets, tokens, markets

---

## Quick start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+** (for the backend)
- **Nansen CLI** installed and authenticated (`nansen auth login`)
- A VPS or local machine for the backend API

### 1. Clone the repo

```bash
git clone https://github.com/TruePrav/AION.git
cd AION
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required — points to your backend API
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:5001

# Required for trade execution and settings changes
NEXT_PUBLIC_ORACLE_API_KEY=your-api-key-here

# Optional — enables "Ask AION" AI chat
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Run the dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Set up the backend

The backend is a Python Flask API that wraps the Nansen CLI. You can run it **locally** or on a **VPS** — the setup is the same.

#### Option A: Run everything locally

```bash
cd vps-snapshot
pip3 install flask gunicorn requests python-dotenv

# Create .env with your keys
cat > .env << 'EOF'
NANSEN_API_KEY=your-nansen-key
NANSEN_WALLET_PASSWORD=your-wallet-password
ORACLE_API_KEY=your-api-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
EXECUTION_MODE=dryrun          # change to 'live' for real trades
ANTHROPIC_API_KEY=sk-ant-...   # for AI features
EOF

# Make sure Nansen CLI is installed and authenticated
nansen auth login

# Start the API server
python3 webhook_server.py
# or with gunicorn:
gunicorn webhook_server:app -b 0.0.0.0:5001 --workers 2 --timeout 120
```

Then set your frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

#### Option B: Run backend on a VPS

```bash
scp -r vps-snapshot/* root@YOUR_VPS_IP:/root/aion/v3/
ssh root@YOUR_VPS_IP
cd /root/aion/v3
pip3 install flask gunicorn requests python-dotenv
# Create .env same as above
gunicorn webhook_server:app -b 0.0.0.0:5001 --workers 2 --timeout 120
```

Then set your frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:5001
```

### 6. Run your first discovery

```bash
cd vps-snapshot   # or /root/aion/v3 on VPS

# EVM token discovery (Solana + Base)
python3 run_discovery_cron.py evm

# Polymarket market scan + whale positions
python3 run_discovery_cron.py polymarket

# Both at once
python3 run_discovery_cron.py ceiling
```

The dashboard will populate with data after the first run. Each run takes 2-5 minutes.

### 7. (Optional) Set up cron jobs for automated discovery

```bash
# Every 4 hours — EVM token discovery + auto-buy
0 */4 * * * cd /path/to/vps-snapshot && python3 run_discovery_cron.py evm >> /tmp/evm_cron.log 2>&1

# Every 6 hours — Polymarket market scanning + whale analysis
0 */6 * * * cd /path/to/vps-snapshot && python3 run_discovery_cron.py polymarket >> /tmp/pm_cron.log 2>&1

# Every hour — check stop-loss / take-profit on open positions
0 * * * * cd /path/to/vps-snapshot && python3 run_discovery_cron.py auto_exit >> /tmp/exit_cron.log 2>&1
```

### 8. (Optional) Profile Polymarket whales

```bash
cd vps-snapshot   # or /root/aion/v3 on VPS

# Profile top 350 whales (costs ~1-10 Nansen credits per whale)
python3 pm_whale_profiler.py 350

# Or only profile whales with positions/PnL > $5K to save credits
python3 pm_whale_profiler.py 350 5000
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (`http://localhost:5001` for local, or `http://your-vps:5001`) |
| `NEXT_PUBLIC_ORACLE_API_KEY` | Yes | API key for write operations (trading, settings). Without this, dashboard is read-only. |
| `ANTHROPIC_API_KEY` | No | Enables "Ask AION" AI chat. Server-side only. |
| `NANSEN_API_KEY` | Yes (backend) | Your Nansen API key for CLI calls |
| `NANSEN_WALLET_PASSWORD` | For trading | Nansen wallet password for trade execution |
| `TELEGRAM_BOT_TOKEN` | For alerts | Telegram bot token for push notifications |
| `TELEGRAM_CHAT_ID` | For alerts | Telegram chat ID for alert delivery |
| `EXECUTION_MODE` | No | `dryrun` (default) or `live` for real trades |

---

## Architecture

```
┌──────────────────────────────┐      ┌──────────────────────────────┐
│    Frontend (this repo)      │      │   Backend (local or VPS)     │
│                              │      │                              │
│  Next.js 14 + TypeScript     │─────>│  Flask API + Gunicorn        │
│  Tailwind CSS (Ocean theme)  │      │  Nansen CLI integration      │
│  Deployed on Vercel          │      │  SQLite telemetry DB         │
│                              │      │  Trade execution engine      │
│  Pages:                      │      │  Telegram bot                │
│  - Discovery (tokens)        │      │  Cron-based pipelines        │
│  - Polymarket (markets)      │      │  Self-learning weights       │
│  - Wallets (grid + list)     │      │  Wiki/knowledge curator      │
│  - Positions / Trades        │      │                              │
│  - Settings / Alerts         │      │  Key files:                  │
│  - How It Works              │      │  - webhook_server.py (API)   │
│  - Ask AION (AI chat)        │      │  - pipeline.py (EVM)         │
│                              │      │  - polymarket_pipeline.py    │
│                              │      │  - pm_whale_profiler.py      │
│                              │      │  - run_discovery_cron.py     │
│                              │      │  - smart_alerts.py           │
│                              │      │  - executor.py (trades)      │
└──────────────────────────────┘      └──────────────────────────────┘
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard home with stats, quick actions |
| `/discovery` | Token table — SM inflow, accumulation grades, sortable columns, community voting |
| `/wallets` | Smart money wallet directory — grid and list views, grade/sort/filter |
| `/wallet/[address]` | Wallet detail — top tokens, copy trade, wallet graph |
| `/polymarket` | Polymarket intelligence — markets, whales, convergence, contrarian, early movers |
| `/positions` | Open positions with live PnL tracking |
| `/trades` | Trade history with status/side/type filters |
| `/grading` | Scoring methodology, accumulation signals, risk tier explainer |
| `/settings` | Pipeline config — stop loss, take profit, scan interval, alert controls |
| `/knowledge` | Auto-generated wiki pages for wallets, tokens, markets |
| `/how-it-works` | Visual pipeline walkthrough |
| `/roadmap` | Feature roadmap with phase tracking |

---

## Trading

AION supports both **dry-run** and **live** trading modes:

- **Dry run** (default): all trades are simulated and tracked for performance. No real money moves. Set `EXECUTION_MODE=dryrun` in backend `.env`.
- **Live**: real trades execute through the Nansen wallet. Set `EXECUTION_MODE=live` and ensure `NANSEN_WALLET_PASSWORD` is set.

To execute a trade from the dashboard:
1. Go to `/wallet/[address]` for any smart money wallet
2. Click "Copy Trade" on any token they hold
3. Confirm the trade parameters
4. The trade routes through the admin proxy to the backend executor

Auto-exit (stop-loss / take-profit) runs hourly via cron and manages all open positions.

---

## Security

- API keys are **server-side only** — the admin proxy at `/api/admin/[...path]` keeps credentials off the client
- Write endpoints (`POST /api/alerts/settings`, trade execution, etc.) require `@require_api_key` authentication
- Admin proxy uses a `PATH_ALLOWLIST` — only approved backend paths are reachable from the frontend
- `ANTHROPIC_API_KEY` is server-side only (no `NEXT_PUBLIC_` prefix)
- `.env.local` files are gitignored
- No private keys, wallet secrets, or credentials in this repo

---

## Deployment

### Vercel (frontend)

1. Push to GitHub
2. Import in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy — automatic on every push

### Self-hosted (frontend)

```bash
npm run build
npm start
# or with PM2:
pm2 start npm --name "aion" -- start
```

### Backend (VPS)

```bash
# Start API
gunicorn webhook_server:app -b 0.0.0.0:5001 --workers 2 --timeout 120

# Or with systemd for auto-restart
# Create /etc/systemd/system/aion.service and enable it
```

Minimum specs: 2 GB RAM, 1 vCPU, Ubuntu 22.04+.

---

## Nansen CLI credit usage

| Pipeline | Credits per run | Frequency |
|----------|----------------|-----------|
| EVM discovery (sol+base) | ~150-300 | Every 4h |
| EVM ceiling (sol+base+eth) | ~700 | On demand |
| Polymarket scan (100 markets) | ~601 | Every 6h |
| Whale profiler (per whale) | 1-10 | On demand |
| Auto-exit price checks | 0 (Jupiter API) | Hourly |

---

## License

Private. All rights reserved.
