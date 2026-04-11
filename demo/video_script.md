# AION Demo Video Script
### Target: ~2-3 minutes | Nansen CLI Competition Week 4

---

## INTRO (15s)
**[Screen: AION landing page]**

"This is AION — an autonomous smart money intelligence platform built entirely on the Nansen CLI. It scans chains, finds what smart money is buying, grades wallets, and can execute trades — all automatically."

---

## DISCOVERY PIPELINE (30s)
**[Screen: Click into Discovery page, show token cards]**

"Every 4 hours, AION runs a full discovery cycle. It pulls smart money netflow data across Solana and Base using `nansen research smart-money netflow`, identifies the hottest tokens, then deep-dives each one."

**[Scroll through tokens, point at SM trader counts and accumulation grades]**

"For every token, it checks who's buying using `token who-bought-sold`, scores accumulation patterns, and grades them S through F. Right now we're running in degen mode — minimum $100K market cap, at least one smart money trader."

---

## WALLET GRADING (20s)
**[Screen: Click into Wallets page, show graded wallets]**

"It doesn't stop at tokens. AION grades every wallet it finds using `profiler pnl` and `related-wallets` — looking at win rate, PnL, and how wallets cluster together. S-tier wallets get tracked for convergence signals."

---

## CONVERGENCE + AI REASONING (20s)
**[Screen: Show a token detail with convergence data and AI summary]**

"When multiple high-grade wallets converge on the same token, that's our strongest signal. AION uses Claude as its reasoning layer to synthesize all this data and explain WHY a token is interesting — not just that it is."

---

## POLYMARKET WHALES (20s)
**[Screen: Click into Polymarket page]**

"We also built a full Polymarket intelligence module using Nansen's new prediction market endpoints — `market-screener`, `top-holders`, `trades-by-market`, `pnl-by-address`. It finds the sharpest bettors and shows you exactly what they're positioned on."

---

## LIVE TRADING (20s)
**[Screen: Go to Discovery, expand a token, show Quick Buy UI]**

"When you see a signal you like, you can buy directly from the dashboard using Nansen's `trade quote` and `trade execute` — the purchase skill. Set your amount, hit buy, and AION handles the execution on-chain."

**[Screen: Show Positions page with open trades and P&L]**

"All positions are tracked with live P&L, and you can view charts directly on DexScreener."

---

## SETTINGS + CONTROL (15s)
**[Screen: Settings page — show risk tier, scan controls, credit tracking]**

"Everything is configurable — risk tier, how many wallets to grade, scan frequency. You can trigger scans manually and watch them run in real-time. Credit usage is tracked so you always know your burn rate."

---

## TELEGRAM + SELF-EVOLVING (15s)
**[Screen: Show Telegram bot notification on phone or desktop]**

"Signals get pushed to Telegram instantly with one-tap buy buttons. And the system self-evolves — it tracks which scoring weights produce winning trades and adjusts automatically over time."

---

## CLOSE (15s)
**[Screen: Back to landing page or roadmap]**

"AION uses 12 Nansen CLI endpoints, Claude AI for reasoning, and runs fully autonomously. It's built to scale to all 18 chains Nansen supports. Everything is open source — link in the description."

---

### NANSEN CLI COMMANDS USED (reference for video overlay/text)
1. `nansen research smart-money netflow`
2. `nansen research smart-money dex-trades`
3. `nansen research token info`
4. `nansen research token pnl`
5. `nansen research token who-bought-sold`
6. `nansen research profiler pnl`
7. `nansen research profiler related-wallets`
8. `nansen research prediction-market market-screener`
9. `nansen research prediction-market top-holders`
10. `nansen research prediction-market trades-by-market`
11. `nansen research prediction-market pnl-by-address`
12. `nansen trade quote` + `nansen trade execute`
13. `nansen account` (credit tracking)
