# Oracle v3

Oracle v3 is a self-hosted smart money intelligence dashboard for discovering wallets, grading trader quality, validating tokens, and reviewing trade activity through a clean web interface.

This repository contains the **dashboard frontend** for Oracle v3. It is designed to connect to an Oracle API running separately on your own infrastructure.

## What this repo is

This repo contains:
- Next.js dashboard frontend
- Discovery, wallets, grading, trades, and settings pages
- Shared UI components for Oracle v3
- Static sample data used for local/demo rendering

This repo does **not** contain:
- Private keys
- Wallet secrets
- Production API keys
- Telegram bot credentials
- Live trading credentials

## Core features

### 1. Discovery dashboard
Review tokens and wallet activity surfaced by the Oracle pipeline.

Includes:
- token discovery tables
- smart money inflow and accumulation context
- graded wallet summaries
- blocklist/community moderation UI

### 2. Wallet grading views
Inspect wallet quality using Oracle’s scoring system.

Typical grading signals include:
- win rate
- realized PnL / ROI
- activity consistency
- diversification
- convergence strength

### 3. Trade visibility
Track historical and open trade information through dashboard pages.

Includes:
- recent trade history
- open positions views
- live PnL style display
- execution mode visibility

### 4. Settings UI
The dashboard exposes controls for configurable Oracle parameters such as:
- trailing stop percentage
- take-profit tiers
- position sizing
- convergence thresholds
- scan interval
- run mode

### 5. Professional terminal-style interface
The UI is designed to feel like a serious trading/intelligence terminal rather than a generic AI landing page.

## Product architecture

Oracle v3 is split into two layers:

1. **Backend / Oracle API**
   - runs on your VPS or server
   - gathers smart money intelligence
   - exposes API endpoints
   - handles execution logic separately

2. **Dashboard frontend**
   - this repository
   - renders the Oracle data visually
   - talks to the Oracle API via HTTP

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- React

## Repository structure

```text
src/
  app/
    page.tsx                Dashboard home
    discovery/              Discovery view
    grading/                Methodology / grading page
    how-it-works/           Product explanation page
    trades/                 Trade history view
    wallets/                Wallet listing page
    wallet/[address]/       Individual wallet page
  components/               Reusable UI components
  lib/                      Utilities and API helpers

public/
  data/                     Demo/sample JSON data
```

## Local development

### Requirements
- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

### Build production bundle

```bash
npm run build
```

### Start production server

```bash
npm start
```

## Connecting to your Oracle API

The dashboard expects an Oracle API to be available separately.

Review and update the API helper in:

```text
src/lib/api.ts
```

If you deploy frontend and backend separately, configure the correct base URL for your environment.

## Deployment notes

Recommended minimum for smooth builds:
- 4 GB RAM
- 2 vCPU

Why:
- Next.js production builds can be memory-hungry
- lower-memory VPS instances may fail during `npm run build`
- 4 GB makes deploys and rebuilds much more stable

## Security and privacy

Before making this repo public or pushing updates:

### Safe to include
- frontend source code
- static demo/sample JSON
- generic setup docs
- UI components
- public architecture notes

### Do not include
- `.env` files
- API keys
- wallet passwords
- session tokens
- private RPC endpoints if sensitive
- internal-only ops docs
- personal notes or contracts

### Current hygiene choices in this repo
- local env files are gitignored
- build output is gitignored
- personal/internal workflow files are excluded from public source control

## Suggested production setup

A clean production setup is:

- **frontend repo**: public or private UI repo
- **backend repo**: separate private repo for Oracle API, execution, bots, and automation
- **server secrets**: stored only in environment variables on the VPS

That split keeps the public-facing dashboard safe while protecting trading logic and credentials.

## Recommended README policy

For public repositories:
- document architecture clearly
- explain setup in detail
- avoid publishing live server IPs unless intentional
- avoid personal/private operational details
- avoid linking to internal-only tools unless they are meant to be public

## GitHub repo

Target repo:
- https://github.com/TruePrav/oracle-v3

## Push checklist

Before push:

1. verify `.gitignore`
2. verify no `.env` files are tracked
3. verify no secrets appear in tracked files
4. remove internal-only files
5. confirm README is public-safe
6. push to the correct repo

## Next recommended step

If you want, I can do this next:
1. run a tighter final secret audit on tracked files
2. inspect git status
3. set the remote to `https://github.com/TruePrav/oracle-v3`
4. prepare the exact push command sequence

Then you can approve the final push if everything looks clean.
