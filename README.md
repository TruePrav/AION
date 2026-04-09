# AION — Smart Money Intelligence

Multi-chain smart money tracking, wallet grading, and automated token discovery. Built for the Nansen CLI competition.

**Live site:** [aionchain.app](https://aionchain.app)

## What it does

AION monitors smart money wallets across Solana, Base, and Ethereum. It grades wallets by performance, scores token accumulation patterns, and surfaces actionable signals — all powered by the Nansen CLI.

### Key features

- **Multi-chain discovery** — scans Solana, Base, and Ethereum for tokens with strong smart money inflows, with automatic fallback across chains
- **Wallet grading** — S/A/B/C/D grade system based on win rate, PnL, ROI, consistency, and convergence
- **Accumulation scoring** — per-token buy/sell ratio, buyer concentration, and SM buyer percentage analysis
- **Risk tier filtering** — degen / balanced / conservative presets filter tokens by mcap, age, SM trader count
- **Ask AION** — AI-powered chat (Claude) that can answer questions about the latest discovery data
- **Telegram alerts** — real-time notifications with AI-generated reasoning for each signal
- **Copy trading** — one-click trade execution via Nansen wallet (approval mode or autonomous)
- **Wallet graph mapping** — related-wallet discovery to detect clusters and syndicates

## Quick start

### Prerequisites

- Node.js 18+
- npm
- An AION backend running (see [Architecture](#architecture))

### Clone and run

```bash
git clone https://github.com/TruePrav/oracle-v3.git
cd oracle-v3
cp .env.example .env.local
# Edit .env.local with your values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment variables

Create a `.env.local` file from the example:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Your AION backend URL (e.g. `http://localhost:5001`) |
| `NEXT_PUBLIC_ORACLE_API_KEY` | No | API key for write operations (trade execution, settings). Without this, the dashboard is read-only. |
| `ANTHROPIC_API_KEY` | No | Enables the "Ask AION" AI chat feature. Server-side only — never exposed to the browser. |

### Build for production

```bash
npm run build
npm start
```

## Architecture

AION is split into two layers:

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│   Dashboard (this repo)     │     │     Backend (separate)       │
│                             │     │                              │
│  Next.js 14 + TypeScript    │────▶│  Python API on your VPS      │
│  Tailwind CSS + shadcn/ui   │     │  Nansen CLI integration      │
│  Deployed on Vercel / VPS   │     │  Trade execution engine      │
│                             │     │  Telegram bot                │
└─────────────────────────────┘     └──────────────────────────────┘
```

**Frontend (this repo):**
- Next.js 14 App Router
- TypeScript
- Tailwind CSS with glass morphism design system
- Dark/light mode with system preference detection
- shadcn/ui components

**Backend (separate private repo):**
- Python API with Nansen CLI
- Discovery pipeline (multi-chain)
- Wallet grading and accumulation scoring
- Trade execution via Nansen wallet
- Telegram bot for alerts

## Project structure

```
src/
  app/
    page.tsx                 Dashboard home
    discovery/               Token discovery with sortable columns
    wallets/                 Graded wallet directory
    wallet/[address]/        Individual wallet detail + copy trade
    positions/               Open positions tracker
    trades/                  Trade history with filters
    grading/                 Methodology explainer
    settings/                Pipeline configuration
    how-it-works/            Product walkthrough
    roadmap/                 Feature roadmap
    api/
      admin/[...path]/       Server-side proxy (keeps API key off client)
      ai/chat/               Claude AI chat endpoint
  components/
    AIChatPanel.tsx          "Ask AION" floating chat
    AIReasoning.tsx          Per-token AI analysis cards
    GradeBadge.tsx           S/A/B/C/D grade badges
    Navbar.tsx               Navigation with AION logo
    WalletGraph.tsx          Wallet relationship graph
    ...
  lib/
    api.ts                   API client + TypeScript interfaces
    utils.ts                 Formatting helpers
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats, recent trades, and CTA |
| `/discovery` | Token table with SM inflow, accumulation grades, sortable columns |
| `/wallets` | Graded wallet directory with win rates and PnL |
| `/wallet/[address]` | Wallet detail view with top tokens and copy trade |
| `/positions` | Open positions with live PnL |
| `/trades` | Trade history with status/side/type filters and sort |
| `/grading` | Scoring methodology, accumulation signals, risk tiers |
| `/settings` | Pipeline config (stop loss, take profit, scan interval) |
| `/how-it-works` | Step-by-step pipeline explanation |
| `/roadmap` | Feature roadmap with phase tracking |

## Security

- API keys are **server-side only** — the admin proxy at `/api/admin/[...path]` keeps `ORACLE_API_KEY` off the client
- `ANTHROPIC_API_KEY` is server-side only (no `NEXT_PUBLIC_` prefix)
- `.env.local` files are gitignored
- Public deployments can set `NEXT_PUBLIC_READONLY_MODE=1` for a read-only showcase
- No private keys, wallet secrets, or credentials in this repo

## Deployment

### Vercel (recommended for frontend)

1. Push to GitHub
2. Import in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Self-hosted

```bash
npm run build
npm start
# or with PM2:
pm2 start npm --name "aion" -- start
```

Minimum: 4 GB RAM, 2 vCPU (Next.js builds are memory-hungry).

## License

Private. All rights reserved.
