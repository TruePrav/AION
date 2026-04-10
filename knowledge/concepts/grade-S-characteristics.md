---
type: concept
slug: grade-S-characteristics
version: 1
tags: [wallet-grading, tier-definition]
---

# S-Tier Wallet Characteristics

What does a real S-tier wallet actually look like, empirically, across
AION's dataset? This page evolves as we see more of them.

## Definition (from the grader)

S-tier = score 90–100. A wallet earns this score by being in the top ~1%
of tracked wallets on the composite factor model:

| Factor        | Weight | What it takes                                         |
| ------------- | -----: | ----------------------------------------------------- |
| Win rate      |     30 | Consistently ≥ 65% on closed positions                |
| Realized PnL  |     30 | Top-decile total $ made over rolling window           |
| Trade count   |     15 | ≥ 30 closed trades in window (sample size gate)       |
| Consistency   |     15 | Low variance across months, not one lucky hit         |
| Nansen label  |     10 | Smart Money / Fund / Whale label bonus                |

A wallet must hit strong marks across **all five** to reach S — it is
mathematically impossible to get S from one factor alone.

## What we've seen so far

<!-- auto — curator appends observations -->

*No S-tier wallets have been tracked across enough snapshots yet for a
reliable pattern to emerge. The curator will populate this section as
S-tier wallets recur and their behavior can be profiled.*

## Expected patterns (hypotheses to test)

<!-- manual -->

These are priors we'll validate once we have real S-tier wallets
accumulating in the dataset:

1. **S-tier wallets size up gradually.** First position is small
   ($5-20k), subsequent buys grow as conviction builds. Rarely go
   max size on entry.
2. **They rotate sectors.** An S-tier wallet farming memecoins in April
   is probably in restaking or L2 tokens by August. Flexibility is a
   feature, not a sign of lack of thesis.
3. **They sell into strength, not weakness.** Exit positions on price
   rips, not on consolidations. This is the opposite of the retail
   pattern.
4. **They are convergence-positive.** S-tier wallets should appear in
   the convergence set more often than chance would predict — they
   tend to cluster with other smart money.
5. **They do not overtrade.** Despite needing ≥30 trades to qualify,
   the best wallets probably cluster near that floor. Wallets with
   500+ trades are usually market makers or MEV bots, not alpha
   generators.

## Known failure modes (how an S-tier grade can mislead)

- **Lookback bias**: a wallet that caught one massive cycle can still
  look S-tier six months later even after it has stopped working. The
  rolling 90-day window helps but isn't perfect.
- **Copy-trader bleed**: once a wallet is public and copy-trade bots
  front-run it, its effective edge drops. We don't currently detect
  this; it shows up as slow alpha decay.
- **Regime shift**: a wallet that is S-tier in a memecoin regime may be
  C-tier in a macro regime. Grades are **unconditional** by design, which
  is a limitation.
