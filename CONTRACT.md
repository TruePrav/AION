# CONTRACT.md — ORACLE v3 Client-Facing Dashboard (PUBLIC)

## Overview
This is the PUBLIC product dashboard for ORACLE v3. NOT an internal ops tool. Clients use this to find smart money wallets and tokens. Telegram is just a convenience for power users.

## Design
- Dark crypto dashboard aesthetic (bg-gray-950, emerald accents)
- Professional, clean, no internal jargon
- Mobile responsive
- Fast loading with good loading states

## Environment
- API Base: `http://178.128.253.120:5001`
- NEXT_PUBLIC_API_URL set in .env.local

---

## Page 1: Home (`/`)

### Hero
- "Find the Smart Money. Before Everyone Else."
- Sub: "ORACLE tracks Nansen's labeled wallets, grades their performance, and surfaces real alpha before the crowd catches on."
- CTA: "View Discovery" button + "Get Telegram Bot" link

### Stats Bar (PUBLIC metrics only)
Show 3-4 key numbers that demonstrate value:
- "Tokens Tracked" (from discovery - number of tokens in latest run)
- "Wallets Monitored" (number of wallets graded)
- "Win Rate" (from trades - real performance)
- "Total PnL" (from closed trades - real results)
- NO: credits remaining, API call count, uptime, tokens scanned count

### Section A: Hot Tokens
- "Tokens Smart Money Is Buying Now"
- Top 5 tokens from latest discovery, sorted by 7d SM inflow
- Each row: Token symbol, MCap, 7d SM Inflow (highlight green), Accumulation Grade badge, link to Nansen chart
- "View All Discovery" CTA

### Section B: Top Graded Wallets
- "Highest Scoring Wallets This Cycle"
- Top 5 wallets from latest discovery sorted by score
- Each row: Grade badge, Score, Label/address, Win Rate, Total PnL, link to wallet detail
- "View All Wallets" CTA

### Section C: Recent Trades
- "Latest Trade Results"
- Last 5 trades from history with: Token, Side, Amount, Entry, PnL %
- Only show closed trades with real PnL
- "View Trade History" CTA

---

## Page 2: Discovery (`/discovery`)

### Token Table
Full table from `/api/discovery/tokens`:
- Symbol (links to Nansen chart)
- Market Cap
- 7d SM Inflow (green/red)
- 24h Inflow
- SM Trader Count
- Accumulation Grade (badge)
- Accumulation Score (number)
- Risk Tier pass/fail badge
- Expandable row: shows accumulation signals + tier filter reasons + contract address with copy button

### Wallet Leaderboard
Full table from `/api/discovery/wallets`:
- Grade badge
- Score (0-100)
- Address (truncated, links to /wallet/[address])
- Label
- Win Rate
- Realized PnL
- Convergence Score
- Hot Token Buys count
- Expandable row: shows top 5 tokens traded with PnL per token

### Wallet Graph (if data exists)
Simple visual: show clusters of related wallets
- List of nodes with grade badges
- List of connections (from -> to with relationship label)

---

## Page 3: Wallets (`/wallets`)
New dedicated page listing all wallets from discovery and lookup with search/filter:
- Filter by: Grade (S/A/B/C/D), Min Score, Chain
- Sort by: Score, Win Rate, PnL, Convergence
- Table: Grade, Score, Address (link to detail), Label, Win Rate, PnL, Chain
- Pagination or "Load More"

---

## Page 4: Wallet Detail (`/wallet/[address]`)

Already built, just verify it shows:
- Grade badge + score
- Address (with copy)
- Win Rate, Realized PnL, Unrealized PnL
- Total trades, tokens traded, volume
- **Current Holdings** — tokens they're still holding, with holding value, unrealized PnL, ROI
- **Recent Sells** — tokens they've sold with realized PnL, ROI, buy/sell amounts
- **All Traded Tokens** — complete table
- External link to Nansen profiler

---

## Page 5: Trades (`/trades`)

Public trade history:
- Stats at top: Total Trades, Win Rate, Total PnL, Avg Profit, Avg Loss (from /api/trades/stats)
- Filter: All / Open / Closed
- Table: Date, Token (truncated address), Chain, Side, Amount, Entry Price, Exit Price, PnL %, PnL USD, Status
- Open positions show: Token, Chain, Amount, Entry, Hold Duration, Current Price (if available), Unrealized PnL
- Solscan/Basescan link on each trade

---

## Page 6: Grading (`/grading`)

PUBLIC explanation of methodology. Show all data from `/api/methodology`:
- Wallet Grading: 5 factors with visual progress bars showing max points
- Grade thresholds table (S/A/B/C/D with colors and score ranges)
- Accumulation Scoring: 5 signals with visual bars
- Risk Tiers: 3 cards (Degen/Balanced/Conservative) with requirements
- Credit costs: SIMPLIFIED — just show "Efficient: ~50 credits per discovery run" — don't expose internal cost breakdown

---

## Page 7: How It Works (`/how-it-works`)

Simple, visual pipeline:
1. **Discover** — Find tokens with smart money inflow
2. **Grade** — Score wallets 0-100 based on their trading history
3. **Validate** — Check tokens for honeypots and tax (free, instant)
4. **Map** — Find related wallets and syndicates
5. **Alert** — Get notified when top wallets accumulate
6. **Copy** — Tap to follow their trades

Credit comparison callout: "Uses ~50 credits per run. Most tools use 100+."
Architecture section: list modules with one-line descriptions
Competitor comparison table

---

## Layout / Navigation

### Navbar
- Logo: "ORACLE" with emerald accent
- Links: Dashboard | Discovery | Wallets | Trades | Grading | How It Works
- Right side: "Get the Bot" button (links to Telegram)

### Footer
- "Built for The Synthesis 2026 | Nansen CLI Challenge"
- GitHub link
- Telegram bot link

---

## What to NEVER show publicly
- Credits remaining / API call count / uptime
- Internal .env variables or infrastructure
- Credit cost breakdown per endpoint
- Your VPS IP or internal URLs
- Internal scoring details that could help competitors

---

## Done When
- All pages render with real live API data
- `npm run build` succeeds with zero errors
- No internal metrics visible
- Professional client-facing appearance
- Ready for Vercel deploy
