# Story Bank — Master STAR+R Stories

This file accumulates your best interview stories over time. Each evaluation (Block F) adds new stories here. Instead of memorizing 100 answers, maintain 5-10 deep stories that you can bend to answer almost any behavioral question.

## How it works

1. Every time `/career-ops oferta` generates Block F (Interview Plan), new STAR+R stories get appended here
2. Before your next interview, review this file — your stories are already organized by theme
3. The "Big Three" questions can be answered with stories from this bank:
   - "Tell me about yourself" → combine 2-3 stories into a narrative
   - "Tell me about your most impactful project" → pick your highest-impact story
   - "Tell me about a conflict you resolved" → find a story with a Reflection

## Stories

<!-- Stories will be added here as you evaluate offers -->
<!-- Format:
### [Theme] Story Title
**Source:** Report #NNN — Company — Role
**S (Situation):** ...
**T (Task):** ...
**A (Action):** ...
**R (Result):** ...
**Reflection:** What I learned / what I'd do differently
**Best for questions about:** [list of question types this story answers]
-->

### [Systems / Reliability] The multi-chain block indexer (relay service)
**Source:** Report #016 — Remote.com — Senior Backend Engineer (Elixir)
**S:** A B2B crypto payments backend needed a service to watch the chain and tell other services when a transaction had been paid. The first version tried to store everything it scanned, and PostgreSQL kept bloating with data we didn't need.
**T:** Relay on-chain payment data reliably, recover from gaps and outages, and stay cheap to run without hoarding data.
**A:** Redesigned it around what the service actually needs: a forward indexer for real-time block scanning, a configurable backward indexer that fills gaps and can re-scan more than a week back after an outage, and a periodic cleanup job that prunes data older than a few days. Redis dedup so each transaction only reports once (the backward indexer re-scans overlapping ranges on purpose).
**R:** A lean relay that does one job well, recovers from outages via configurable backfill, and keeps the database healthy.
**Reflection:** The win was scoping it down. It only needs to relay and forget, not store forever, and designing to that kept it simple and cheap.
**Best for:** systems thinking, reliability, worker/job design, resource-conscious design, "keep it simple on purpose", outage recovery.
**Do NOT say:** settlement, chain finality, confirmation worker, reorgs, "moves real money" — that framing is inaccurate. See memory `nespay-indexer-architecture`.

### [Automation] HRIS→platform integration sync
**Source:** Report #016 — Remote.com — Senior Backend Engineer (Elixir)
**S:** An HRIS and our work-management platform drifted; people reconciled data by hand.
**T:** Keep both in sync automatically without duplicating or corrupting records.
**A:** Built an idempotent sync pipeline — pull, diff against current state, apply only real changes — and iterated as edge cases (partial records, field mismatches, ordering) surfaced.
**R:** Manual, error-prone reconciliation became a background process that stayed correct.
**Reflection:** Same pattern I reused on the indexer: automate a fragile critical flow, then improve it through measured iteration.
**Best for:** automation workflows, integrations, idempotency, "designing/adopting automation and improving via iteration".
