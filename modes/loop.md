# Mode: loop — Unattended Scan → Score, Checkpoint at Draft

One on-demand pass that finds and scores fresh roles unattended, then **stops** for the human to pick which to pursue, drafts CV + cover letter only for approved roles, and **stops again** before submit. This is a thin composition of existing modes and scripts — it does not re-specify JD extraction, report numbering, or PDF generation.

## Invariants (non-negotiable)

- **The loop never writes `decision: 'apply'`.** The human is the sole writer of `apply` (in chat or the tracker Jobs dropdown). Drafting is gated on it, so the "stop before draft" checkpoint is enforced by data, not by the agent remembering to stop.
- **The loop has no submit capability.** It never sets `submissionStatus` and never touches a portal. Submission stays a manual human action. Never auto-submit (see AGENTS.md Ethical Use).

## Pipeline

### 1. Discover (unattended)
Run `node scan.mjs` (zero-token ATS scan; appends fresh URLs to `data/pipeline.md`). If `discovery.enabled` is set in `portals.yml`, the same run adds opt-in Firecrawl broad-discovery results (Phase 3).

### 2. Score unscored live roles (unattended)
For every visible job **without a `report`** (and any new `pipeline.md` URL), apply **`modes/pipeline.md`** — it already does liveness → evaluation → report → PDF → tracker. That writes `fitScore`, `report`, and `appNum` into `data/jobs.json`.
- Already-scored roles (`report` present) are skipped — never re-score (idempotent).
- Then run `node gen-applications-md.mjs` to refresh `applications.md`.

### 3. STOP — review checkpoint
Run `node loop.mjs`. It prints the **review queue**: scored roles with `fitScore ≥ 4.0` **or** any user-added role (any score), that the human hasn't actioned yet. `loop.mjs` owns this selection rule — do not re-derive it here.

Present the queue to the user. They decide, in chat or directly in the tracker Jobs view:
- **Approve** → set `decision: 'apply'` (auto-creates the `preparation` record, `useTracker.js`).
- **Reject** → set `decision: 'skip'`.

The queue is durable: it lives in `jobs.json` fields (`report`, `fitScore`, `decision`), so an interrupted loop re-derives the same queue next session — no checkpoint file.

### 4. Draft on approval (only for `decision: 'apply'`)
Run `node loop.mjs draft` → approved roles with no cover letter yet. For each:
- `modes/cover.md` → writes `output/cover-letters/{slug}.md`, sets `preparation.coverLetterPath`.
- `modes/pdf.md` → tailored CV, sets `preparation.cvPath`.

Roles that already have a `coverLetterPath` are skipped (idempotent re-run).

### 5. STOP — before submit
Drafts now sit in the tracker **Preparations** view. The loop ends here. The human reviews the drafts and submits manually (which promotes the prep to an application and carries the cover letter forward).

## Invocation

On-demand: the user says "run the loop" / `loop`. Not scheduled. The deterministic selection is testable: `node loop.mjs --self-check`.
