---
type: scoring-changelog
append_only: true
---

# Scoring Weight Changelog

Every weight version ever committed to the DB, with the reasoning that was
captured at the moment of change. New versions are appended — history is
never rewritten.

---

## v1 — 2026-04-09 — `initial`

First set of weights. Hand-chosen priors:

```
buy_sell_ratio      25
buyer_diversity     25
sm_presence         20
volume_consistency  15
buyer_count         15
```

**Reasoning**: seeded from `DEFAULT_WEIGHTS`. 25/25/20/15/15 split. These
are priors, not yet evaluated against forward returns. Full justification
lives in [current-weights.md](./current-weights.md).
