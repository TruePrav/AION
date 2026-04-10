---
type: schema
owner: curator
version: 1
---

# AION Knowledge Wiki — Schema & Conventions

This file defines the structure and conventions of AION's self-maintained
knowledge base. The curator agent (`curator.py`) reads this file before every
run and uses it to decide where new pages go, how to format them, and how to
cross-link entities.

**Humans read the wiki. The LLM curator writes and maintains it.**
Hand-edits are allowed but will be preserved across curator runs — the
curator only touches sections it marks as `auto` in the frontmatter.

## Architecture

This wiki sits in the *warm layer* of AION's three-layer data stack:

1. **Hot / telemetry** — `data/aion.db` (SQLite). Raw discovery snapshots,
   forward prices, wallet history, evaluations. Machine-queryable.
2. **Warm / wiki** — this folder. Markdown entity + concept pages.
   LLM-maintained, human-readable, git-tracked. The *understanding* layer.
3. **Cold / exports** — presentations, weekly digests in `weeks/`, eventually
   external reports.

The curator reads from (1), writes to (2). The frontend `/knowledge` page
reads from (2) and renders it.

Inspired by Karpathy's LLM Wiki pattern. The point is: **knowledge compiles
once and stays current**, instead of being re-derived on every query.

## Folder layout

```
knowledge/
├── CLAUDE.md          ← this file
├── README.md          ← human entry point
├── index.md           ← catalog of every page, auto-regenerated
├── log.md             ← append-only action timeline, grep-parseable
│
├── wallets/           ← one entity page per notable wallet
├── tokens/            ← one entity page per notable token
├── markets/           ← one entity page per notable Polymarket event
├── clusters/          ← named wallet clusters ("geopolitics syndicate")
├── concepts/          ← evolving concept pages (convergence, accumulation)
├── scoring/           ← current weights + changelog with reasoning
└── weeks/             ← weekly digest pages (YYYY-WNN.md)
```

## Page types

Every page starts with YAML frontmatter. The curator uses `type` to pick a
template; everything else is metadata.

### Wallet page (`wallets/{address}.md`)

```yaml
---
type: wallet
address: 0xabc...
chain: ethereum
first_seen: 2026-04-09T...
last_seen: 2026-04-10T...
appearances: 3
current_grade: A
current_score: 82.5
tags: [smart-money, memecoin]
---
```

Created when a wallet first appears in a discovery run with grade ≥ B.
Updated on every subsequent appearance. Sections:

- **Summary** — one-paragraph narrative about who this wallet is
- **Grade history** — table of grade + score over time
- **Tokens bought** — list of hot tokens this wallet was seen buying
- **Cluster membership** — links to `clusters/*.md` if this wallet has been
  flagged as part of a named cluster
- **Notable observations** — free-form notes from the curator

### Token page (`tokens/{chain}_{address}.md`)

```yaml
---
type: token
address: So11...
symbol: SOL
chain: solana
discovered: 2026-04-09T...
accum_score: 73
accum_grade: A
tier_passed: true
forward_returns: {24h: 12.5, 48h: 18.2, 7d: null}
---
```

Created when a token passes the tier filter. Sections:

- **Why it passed** — the signals that triggered it
- **Who bought it** — list of smart-money wallets, linked to `wallets/*.md`
- **Convergence** — other tokens these wallets are also holding
- **Forward performance** — entry price → 24h / 48h / 7d returns
- **Post-mortem** — if it won or lost, why (added later)

### Market page (`markets/{market_id}.md`)

Polymarket equivalent of a token page.

### Cluster page (`clusters/{slug}.md`)

Hand-named or auto-named group of wallets with correlated behavior.
Cross-links to member wallet pages.

### Concept page (`concepts/{slug}.md`)

An evolving explanation of a signal, pattern, or heuristic. These are
edited, not appended. Every edit should bump `version` in frontmatter and
leave a one-line changelog at the bottom.

### Scoring pages (`scoring/current-weights.md`, `scoring/changelog.md`)

`current-weights.md` always reflects the active weight version from
`weight_versions` in the DB. `changelog.md` is append-only; every weight
change gets a dated entry with the reasoning that was committed to the DB.

### Weekly digest (`weeks/YYYY-WNN.md`)

Written every Monday by the curator. Summarises the previous week:
market regime, best signals, lessons learned, weight changes, notable
wallets and tokens that appeared.

## Conventions

- **Addresses**: full lowercase. Example: `0xba325e7069ad57592e81b6069c59181af38d7afc`.
- **File names for wallets**: `wallets/{address}.md`. Full address, no
  truncation, no chain prefix (checksummed addresses across chains are unique enough).
- **File names for tokens**: `tokens/{chain}_{address}.md` (chain prefix
  because the same address can exist on multiple chains).
- **Internal links**: use Obsidian-style wiki links: `[[wallets/0xabc]]`.
  The frontend `/knowledge` page resolves these to hyperlinks.
- **Dates**: ISO-8601 UTC, e.g. `2026-04-09T21:08:09+00:00`.
- **Numbers**: keep raw values in frontmatter, format for display in body.
- **Prose ownership**: sections tagged `<!-- auto -->` are curator-owned and
  will be regenerated. Sections tagged `<!-- manual -->` are preserved.

## Curator operations

The curator (`curator.py`) runs after each discovery in these phases:

1. **Ingest** — read the new snapshot from SQLite
2. **Entity update** — upsert affected wallet/token pages
3. **Log append** — add a line to `log.md` and a row to `curator_log` in the DB
4. **Index rebuild** — regenerate `index.md` by walking the folder tree
5. **Lint** *(weekly)* — check for stale claims, contradictions, dead links

The curator never deletes files. If an entity becomes irrelevant (e.g. wallet
dropped below grade B), its page stays but gets a `status: archived` tag in
frontmatter.

## Why this exists

The alternative is: every time you want to know what AION understands about
a wallet, you re-query Nansen, re-grade it, re-check its history, and re-derive
the same answer. The wiki approach compiles that understanding **once**,
stores it in human-readable form, and lets both the AI chat panel and the
user read it directly.

> "The tedious part of maintaining a knowledge base is not the reading or
> the thinking — it's the bookkeeping." — Karpathy

LLMs are now good at bookkeeping. This wiki is the bet that those savings
compound into a real knowledge advantage over time.
