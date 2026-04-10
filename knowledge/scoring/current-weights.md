---
type: scoring-current
version: 1
committed_at: 2026-04-09T21:08:09+00:00
proposed_by: initial
---

# Current Scoring Weights — v1

The active accumulation score is a weighted sum of five signals, with weights
summing to 100. The score determines a token's grade (S/A/B/C/D) which gates
whether it enters the discovery funnel.

| Signal                | Weight | What it measures                                              |
| --------------------- | -----: | ------------------------------------------------------------- |
| `buy_sell_ratio`      |     25 | Smart money buying more than selling                          |
| `buyer_diversity`     |     25 | Buying spread across many wallets (low HHI concentration)     |
| `sm_presence`         |     20 | % of buyers that Nansen labels as Smart Money                 |
| `volume_consistency`  |     15 | Steady accumulation over time, not a single volume spike      |
| `buyer_count`         |     15 | Raw count of distinct SM wallets participating                |

**Total: 100**

## Reasoning for v1

<!-- manual -->

These weights are hand-chosen priors, not yet evaluated against forward
returns. The rationale:

- **Ratio and diversity are equally weighted (25 each)** because one without
  the other is a lie. A 10x buy/sell ratio concentrated in one wallet is
  wash trading. A diverse buyer pool with no ratio edge is just noise.
  Both together is a genuine accumulation signal.
- **Smart money presence gets 20** because Nansen's labelling is good but
  not perfect — we don't want to double-count it with `buyer_count`.
- **Volume consistency (15)** catches drip-buys that are often deliberate.
  A single whale dumping $500k in one minute scores low here; the same
  whale accumulating $50k every hour for ten hours scores high.
- **Buyer count (15)** is deliberately low. Anyone can fake a lot of
  buyers with sybil wallets; the diversity + ratio signals catch that
  better than a raw count.

These weights will be re-evaluated once we have at least 50 tracked tokens
with forward prices at 48h and 7d. The curator runs the evaluation every
time a new discovery snapshot lands; if high-score tokens consistently
underperform low-score tokens, the curator will propose a new weight
version and commit it with reasoning in [changelog.md](./changelog.md).

## How this page stays current

<!-- auto -->

The curator reads the latest row from `weight_versions` in SQLite on every
run. When a new version is committed, this page is rewritten with the new
numbers, and the old page is preserved in git history. The reasoning section
above is `manual` — curator updates leave it alone.
