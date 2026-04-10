---
type: concept
slug: accumulation-patterns
version: 1
tags: [token-scoring, composite-signal]
---

# Accumulation Patterns

What does *real* smart-money accumulation look like on-chain, vs. what's
just volatile noise dressed up in volume?

## The composite score

AION's `accumulation_score` is a weighted sum of five signals. See
[scoring/current-weights.md](../scoring/current-weights.md) for the active
weights. Each signal is normalized to 0–1 before being weighted, so the
final score is always in `[0, 100]`.

## Signal 1 — `buy_sell_ratio`

The 24h dollar-weighted ratio of smart-money buys to sells. Values:

| Ratio    | Interpretation                                    |
| -------- | ------------------------------------------------- |
| ≥ 3.0    | Strong one-sided accumulation                     |
| 1.5–3.0  | Moderate buy pressure                             |
| 0.8–1.5  | Neutral / choppy                                  |
| < 0.8    | Net selling pressure                              |

**Failure mode**: a single whale round-tripping can produce a fake high
ratio. The diversity signal is the check on this.

## Signal 2 — `buyer_diversity`

Herfindahl-Hirschman Index (HHI) of buyer dollar volumes, inverted and
scaled so higher = more diverse.

- **HHI < 0.15** → very distributed (many small buyers)
- **HHI 0.15–0.35** → healthy spread
- **HHI > 0.35** → concentrated in a few wallets (risk signal)

A token with 10x buy/sell ratio and HHI 0.9 is wash-trading. A token
with 3x ratio and HHI 0.1 is genuine accumulation.

## Signal 3 — `sm_presence`

Percentage of unique buyer addresses that Nansen has labelled as Smart
Money, Fund, or Whale. Computed as `sm_buyer_count / total_buyer_count`.

**Why this isn't the only signal**: Nansen's labels lag. A wallet that has
been grinding since 2023 might not yet be labelled. We use this as
confirmation, not as a gate.

## Signal 4 — `volume_consistency`

Measures whether accumulation happened as a steady drip or a single spike.

Implementation: divide the 24h volume into hourly buckets. Compute the
coefficient of variation (std/mean) across the non-zero buckets. Lower =
more consistent = higher score.

**Why it matters**: a single whale dumping $500k in one minute and then
disappearing scores very differently from the same whale drip-buying $20k
every hour across the day. The second pattern is deliberate accumulation;
the first is often news-driven FOMO or an exit liquidity trap.

## Signal 5 — `buyer_count`

Raw count of distinct SM buyer addresses. Capped at 50 in the normalizer
to avoid sybil inflation.

**Intentionally low weight (15)**. Sybils are cheap. A bot network with
200 wallets looks great on `buyer_count` but will fail `buyer_diversity`
and `volume_consistency`. The count is a weak corroborator, not a driver.

## Empirical notes

<!-- auto — curator appends learnings here -->

*Insufficient data. Curator will populate this section after ≥20 tokens
have hit their 48h price check.*

## Open questions

<!-- manual -->

- Should `volume_consistency` use hourly buckets or finer (15-min)?
  Finer buckets might catch bot patterns better but add noise.
- Is there a smart-money *selling* signal worth adding? Right now we only
  score accumulation, but SM wallets *exiting* is arguably a stronger
  short-term signal than SM wallets entering.
