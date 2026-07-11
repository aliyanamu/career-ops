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

### [Systems / Reliability] The multi-chain settlement indexer
**Source:** Report #016 — Remote.com — Senior Backend Engineer (Elixir)
**S:** B2B crypto payments needed to settle invoices from on-chain USDT deposits across 5 chains; a naive single loop missed and mis-timed detections.
**T:** Detect deposits reliably in real time and only settle when truly final, without double-counting or losing state on crashes.
**A:** Split into three coordinated workers — forward (5s polling of recent blocks), backfill (gap closing), confirmation (chain-specific finality) — behind an RPC layer, Redis for dedup, PostgreSQL for crash recovery, webhooks reconciling each transfer to the open invoice by amount.
**R:** Correct, real-time settlement moving real money; verification and recovery built in.
**Reflection:** Started as one loop; the worker separation came from instrumenting where detection was slow/gappy and closing those gaps deliberately.
**Best for:** systems thinking, reliability, worker/queue design, "close the loop on quality", handling scale/correctness tradeoffs.

### [Automation] HRIS→platform integration sync
**Source:** Report #016 — Remote.com — Senior Backend Engineer (Elixir)
**S:** An HRIS and our work-management platform drifted; people reconciled data by hand.
**T:** Keep both in sync automatically without duplicating or corrupting records.
**A:** Built an idempotent sync pipeline — pull, diff against current state, apply only real changes — and iterated as edge cases (partial records, field mismatches, ordering) surfaced.
**R:** Manual, error-prone reconciliation became a background process that stayed correct.
**Reflection:** Same pattern I reused on the indexer: automate a fragile critical flow, then improve it through measured iteration.
**Best for:** automation workflows, integrations, idempotency, "designing/adopting automation and improving via iteration".
