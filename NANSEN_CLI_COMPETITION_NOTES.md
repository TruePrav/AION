# Nansen CLI Competition - Winner Analysis

## Week 1 Winner: @HeavyOT (GiftedFingers)
**Project:** Autonomous Polymarket Copy-Trading Bot
**Date:** Mar 17, 2026 | **Views:** 7K | **Reposts:** 28

### Key Features
- **Syndicate Mapper** - Runs every 24h, queries Nansen for counterparties of top whales to map "Shadow Syndicates" (found 31 nodes + a $2M PnL desk)
- **Reverse-Funnel** - Uses Nansen's smart money dex-trades to match Polygon Smart Money with Polymarket whales
- **NANSEN_VERIFIED tagging** - Verified funds bypass standard risk models for max leverage trades
- **Pulse Check** - Pings Gamma API to filter 72% of non-Polymarket noise before DB insertion
- **Async Python CLI wrapper** - Scales autonomously

### Why It Won
- Novel use case: Polymarket copy-trading (not just token scanning)
- Graph analysis + syndicate mapping is unique - goes beyond surface-level wallet tracking
- Multi-wallet detection (top traders use many wallets)
- Combines Nansen CLI with external APIs (Gamma) for cross-platform intelligence
- Fully autonomous pipeline

---

## Week 2 Winner: @rien_nft (rienn)
**Project:** Alpha Radar - Multi-Chain Smart Money Scanner
**Date:** Mar 29, 2026 | **Views:** 8.8K | **Reposts:** 8

### Key Features
- **24/7 VPS deployment** - Always-on monitoring, not manual
- **Multi-chain support** - Tracks Solana, ETH, BNB simultaneously
- **5 Nansen CLI endpoints combined** into single automated pipeline
- **5-stage pipeline:** Nansen SM Scan (21 tokens) -> Quality Filter (21 passed) -> Narrative Analysis (scored & ranked) -> Volume Monitor (28M spikes) -> Signal (1 passed)
- **Dashboard UI** with tabs: Overview, Signals, Intelligence, Architecture
- **Watchlist** with real-time data: Token, Chain, Source, Price 24h, SM Holders, Netflow, MCap
- **Market Context indicator** (NEUTRAL/BULL/BEAR) + BTC 24h correlation

### Why It Won
- Production-grade UI/dashboard (not just a CLI script)
- Multi-chain scanning in single view
- Narrative Analysis layer (scored & ranked) - goes beyond pure on-chain
- Volume spike detection as a filtering gate
- Infrastructure mindset: built for "the next meme bubble"
- Clean presentation with video demo

---

## Week 3 Winner: @GH2012Telefe (The Matthew K)
**Project:** Smart Money 4-Gate Filtration System
**Date:** Mar 30, 2026 | **Views:** 7.1K | **Reposts:** 6

### Key Features
- **4-Gate funnel system:**
  - ALL TOKENS: 9,567 total tracked
  - ACTIVE: 1,620 (live use) - 7,947 dropped
  - GATE 2: 176 enriched - 1,444 filtered
  - GATE 3: 107 deep selection - 69 filtered
  - CRITICAL: 18 tokens (83.3% win rate)
- **CLI as verification layer** - "Pipeline flags the WHAT. CLI confirms the WHY."
- **30-second verification** - Uses Nansen CLI to verify every signal in 30 seconds
- **Massive data reduction** - 9,567 -> 18 tokens (99.8% noise elimination)

### Why It Won
- Incredible win rate proof: 83.3% on CRITICAL tokens
- Clear quantitative results (not just architecture diagrams)
- Practical for full-time workers (built because he has no time for chart-watching)
- Separation of concerns: automated pipeline for detection, CLI for manual verification
- The funnel visualization was extremely compelling
- AI Researcher + Data Strategist background = credibility in data methodology

---

## Pattern Analysis: What Judges Reward

| Factor | W1 | W2 | W3 |
|--------|----|----|-----|
| Autonomous/automated | Yes | Yes | Semi (CLI verify) |
| Novel use case | Polymarket | Multi-chain | Multi-gate filter |
| Quantitative results | $2M desk found | 21 tokens tracked | 83.3% win rate |
| Visual/demo | Thread | Video + Dashboard | Infographic |
| Multiple Nansen endpoints | Yes | 5 endpoints | Yes + CLI verify |
| External API integration | Gamma API | No | No |
| Unique naming/branding | Shadow Syndicates | Alpha Radar | 4-Gate System |
| Production-ready | Python CLI | VPS 24/7 | Pipeline + CLI |

### Common Winning Traits
1. **Clear pipeline/architecture** - Every winner showed a defined multi-step process
2. **Quantitative proof** - Numbers that show the system works
3. **Compelling presentation** - Thread, video, or infographic (not just text)
4. **Uses multiple Nansen CLI endpoints** - Not just one command
5. **Solves a real problem** - Copy-trading, meme detection, noise filtering
6. **Has a catchy name/brand** - Syndicate Mapper, Alpha Radar, 4-Gate System

---

## AION (Our Build) - Week 4 Suggestions

### Must-Have (proven winning features)
- Multi-step pipeline with clear stages (like all 3 winners)
- Multiple Nansen CLI endpoints integrated
- Quantitative results / backtested proof
- Strong visual presentation (dashboard, infographic, or video)
- Catchy branding / system name

### Differentiation Ideas (what NO winner has done yet)

1. **Cross-Market Intelligence** - Combine on-chain smart money signals with off-chain data (news sentiment, social signals, governance votes) for a holistic alpha score. W1 did Polymarket, W2 did multi-chain, W3 did filtering. Nobody combined on-chain + off-chain.

2. **AI-Powered Signal Reasoning** - Use an LLM to explain WHY a signal matters in natural language. W3 said "CLI confirms the WHY" but manually. AION could automate the WHY with AI narration of each signal.

3. **Real-Time Alert System with Confidence Scoring** - Not just detection but a confidence score (0-100) per signal based on multiple Nansen data points. Telegram/Discord alerts with context. Nobody showed alerting.

4. **Wallet Cluster + Behavior Prediction** - Go beyond W1's syndicate mapping. Use time-series analysis on wallet clusters to PREDICT next moves, not just detect current positions.

5. **Multi-Timeframe Analysis** - Scan across 1h, 4h, 24h, 7d windows simultaneously. Show convergence signals (when all timeframes align = highest conviction).

6. **Live Portfolio Simulation** - Show a simulated portfolio that would have been built following AION's signals. Track PnL over competition week. Proves value better than any metric.

7. **Nansen CLI as MCP Tool** - Build AION as an AI agent that uses Nansen CLI as a tool, making it conversational. Ask AION questions and it queries Nansen in real-time. None of the winners made it interactive/conversational.

### Recommended AION Stack
- **Backend:** Python (async) with Nansen CLI integration
- **AI Layer:** Claude/LLM for signal reasoning and natural language explanations
- **Frontend:** Next.js dashboard (already have oracle-v3)
- **Alerts:** Telegram bot for real-time notifications
- **Data:** Multi-chain support (SOL, ETH, BNB minimum)
- **Presentation:** Video demo + live dashboard + infographic for tweet thread

### Winning Thread Formula (based on analysis)
1. Lead with a shocking stat or result
2. Show the architecture/pipeline visually
3. Explain each stage briefly
4. Show real results/data
5. End with the unique differentiator
6. Tag @nansen_ai + #NansenCLI

---

## Phase 2 Roadmap (post-competition)

### Auto-execution of Stop Loss / Take Profit via Nansen wallet
- 80% of plumbing already exists:
  - `executor.py` has working `execute_buy()` / `execute_sell()` via `nansen trade quote` + `nansen trade execute`
  - `check_trailing_stop()` already fetches Jupiter prices and detects exit conditions
  - Wallet password loaded from `~/.nansen/.env`
- **What's needed:**
  1. Background monitor loop (30s tick) in gunicorn thread that walks `get_open()` and calls `check_position_targets(pos)`
  2. Refactor `check_trailing_stop()` → `check_position_targets(pos)` that reads per-position `stop_loss_pct` / `take_profit_pct` instead of global CONFIG
  3. Per-position dry_run override (so existing sim positions stay sim, new live ones can swap)
  4. Kill-switch endpoint `/api/monitor/enabled` + UI toggle for demo safety
  5. Slippage guard — reject quote if estimated fill deviates >10% from DexScreener price
  6. Liquidity gate — refuse auto-exit if pool liquidity < $10k (would eat spread)
  7. UI: green "AUTO" badge on positions page when monitor is live, shows next-check countdown
- **Rollout order:** refactor → simulation mode (auto-close dry_runs only) → kill-switch + badge → live mode behind `LIVE_TRADING=1` env flag

### Non-Custodial Copy Trade (killer demo upgrade)
- **Zero custody, zero trust** — AION generates signals, users sign swaps with their own wallets
- **Stack:**
  - `@solana/wallet-adapter-react` + `@solana/wallet-adapter-react-ui` for Phantom / Solflare / Backpack connection
  - Jupiter v6 `/quote` + `/swap` endpoints for routing and tx construction
  - Frontend builds the swap transaction, wallet pops up, user signs + broadcasts
  - AION never touches private keys — runs purely on the user's client
- **UI flow:**
  1. User sees signal on discovery page → clicks "Copy Trade" button
  2. Modal opens with token info, size slider ($10–$500), slippage dropdown (0.5/1/3%)
  3. "Connect Wallet" if not connected → Phantom popup → approved
  4. Frontend: `POST jup.ag/v6/quote` → show expected output → user confirms
  5. Frontend: `POST jup.ag/v6/swap` → receives serialized tx → wallet signs → broadcasts
  6. Tx hash recorded in localStorage against the signal ID for later P/L tracking
- **Implementation effort:** ~1-2 days (WalletAdapter boilerplate is the main time sink)
- **Why it matters:** Transforms AION from "passive viewer" into "actionable alpha terminal" without any multi-tenant backend complexity

### Secure Admin Control Panel
- Public `/` site stays pure read-only (no mutation surface exposed)
- Admin features live at `/admin` behind a password-gated HttpOnly session cookie
- No API keys in browser bundles — all mutations go through Next.js server-side proxy route (`/api/admin/[...path]`) which holds the key in `AION_API_KEY` env
- Flask-Limiter rate limiting on mutation endpoints
- Optional IP allowlist for extra lockdown
- Audit log at `/data/audit.jsonl` for every admin action
- Toggle via `NEXT_PUBLIC_READONLY_MODE=1` on public Vercel, unset locally for full control

### Public Telegram Signal Channel
- Convert `telegram_bot.py` to post every high-conviction discovery to `@AIONAlphaSignals`
- Rich embeds with graph screenshot, AI reasoning, copy-paste `nansen` commands
- `/subscribe` slash command optional — channel is public

### Multi-tenant SaaS (long-term)
- Supabase auth + per-user state
- Encrypted wallet connection storage
- Per-user Nansen CLI credit pools
- Personal P/L tracking from on-chain history
