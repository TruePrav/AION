---
type: concept
slug: convergence-signal
version: 1
tags: [core-signal, cross-entity]
---

# Convergence Signal

> The single most important thing AION does that you can't get from reading
> Nansen's UI directly.

## Definition

**Convergence** = the same wallet (or cluster of wallets) appearing as a
top buyer in multiple hot tokens within the same discovery window.

Formally: given a discovery run that surfaces N tokens, for each wallet we
count how many of those N tokens it appears as a top-K buyer in. Wallets
with count ≥ 2 are flagged as "converged." Wallets with count ≥ 3 are
flagged as "strong convergence."

## Why it matters

One wallet buying one token is noise. Anyone can be a degen. The same
wallet buying *three* specific tokens in the same week is a decision, not
a coincidence — someone has a thesis and they're expressing it across
multiple positions.

Nansen's UI is siloed per-token or per-wallet. There is no screen on
nansen.ai that shows you "wallets appearing across ≥2 hot tokens right
now." To get that answer from raw Nansen, you would need to:

1. Open every hot token's page
2. Copy down the top N buyers for each
3. Compute the intersection by hand
4. Cross-reference against wallet grades

AION does this automatically on every discovery run. It's the join that
turns per-token noise into cross-token signal.

## Current implementation

1. For each discovered token, pull top-K buyers via Nansen smart-money
   dex-trades (K is currently 25)
2. Union all buyer addresses across all tokens in the run
3. For each address, count distinct tokens it appeared in → convergence_count
4. Filter to `convergence_count >= 2`
5. Rank by the product of `convergence_count × wallet_grade_score`

## Same pattern applied to Polymarket

The Polymarket pipeline (`polymarket_pipeline.py`) applies the same idea to
prediction markets: for each hot market, pull the top holders; union across
markets; find wallets holding positions in ≥2 hot markets. A wallet with
positions in the Iran ceasefire market *and* the Russia/Ukraine ceasefire
market is a geopolitics trader, not a gambler.

## Empirical notes

<!-- auto — curator appends observations here over time -->

*Curator has not yet recorded enough runs to evaluate convergence
predictive power. This section will populate automatically once
`evaluations` accumulates ≥5 entries with forward returns.*

## Open questions

<!-- manual -->

- **How long is "the same window"?** Right now we compute per-discovery-run
  (every 6h). But some syndicates accumulate over days. Do we need a
  rolling 48h convergence metric too?
- **What's the false-positive floor?** If a wallet appears in 10 tokens, is
  that a genius multi-thesis trader or a market-making bot? We need to
  filter out MM behavior before counting convergence.
- **Cross-chain convergence** is probably stronger signal than single-chain
  — a wallet buying SOL memecoin AND ETH memecoin in the same week is
  making a big-picture call. Not yet implemented.
