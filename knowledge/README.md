---
type: readme
---

# AION Knowledge Wiki

This folder is AION's brain.

Every time the discovery pipeline runs, a curator agent reads the new data
and updates the markdown files in here. The wiki **compounds** — every run
makes it a little smarter, not just a little bigger.

## Where to start

- **[index.md](./index.md)** — catalog of every page in the wiki, organised
  by type
- **[log.md](./log.md)** — chronological timeline of everything the curator
  has done
- **[concepts/](./concepts/)** — evolving explanations of AION's signals:
  convergence, accumulation, wallet grading
- **[scoring/current-weights.md](./scoring/current-weights.md)** — the
  current scoring weights with the reasoning for why they are what they are
- **[scoring/changelog.md](./scoring/changelog.md)** — every weight change
  ever committed, with its justification

## For humans

You can read these files:

- **On the AION website** at `/knowledge` (rendered with tree view + search)
- **In your code editor** (VS Code, Sublime, anything that renders markdown)
- **On GitHub** (when pushed)
- **In Obsidian** — open this folder as a vault. Zero config. The wiki links
  (`[[wallets/0xabc]]`) will automatically resolve and you get the graph view
  for free.

## For the curator

The schema this wiki follows is defined in **[CLAUDE.md](./CLAUDE.md)**.
The curator reads that file before every run and writes new pages to match
its conventions.

## Why markdown, not a database?

Because the knowledge we're accumulating is *narrative*, not just numeric.
"Wallet 0xabc is a geopolitics-focused prediction market whale" is a
sentence, not a row. Rows live in `data/aion.db` (SQLite) on the backend.
Sentences live here.

Both coexist — see [CLAUDE.md](./CLAUDE.md) for the full three-layer
architecture.
