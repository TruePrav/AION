---
type: log
append_only: true
---

# Curator Log

Append-only record of everything the curator has done. Entries are formatted
as `## [YYYY-MM-DDTHH:MM:SSZ] {action}` so they can be parsed with simple
grep patterns.

> `git log knowledge/log.md` gives you AION's intellectual history —
> every new wallet profile, every weight change, every lesson committed.

---

## [2026-04-09T21:08:00Z] wiki_initialized

AION knowledge wiki created. Folder structure and schema (`CLAUDE.md`)
committed. No pages yet — waiting for first curator run to populate from
the SQLite snapshots that were just migrated in.

- SQLite DB initialized at `data/aion.db`
- 2 discovery snapshots migrated from legacy JSON
- 1 Polymarket snapshot migrated
- Weight version 1 seeded with default priors (25/25/20/15/15)
- 21 tokens received their first forward-price check from DexScreener
