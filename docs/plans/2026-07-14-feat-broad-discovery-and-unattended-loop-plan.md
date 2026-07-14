---
title: Broad Web Discovery + Unattended End-to-End Loop + Cover Letters
type: feat
status: active
date: 2026-07-14
---

# ✨ Broad Web Discovery + Unattended Loop + Cover Letters

## Enhancement Summary

**Deepened:** 2026-07-14 · 3 focused agents (Firecrawl API research, simplicity review, agent-native parity review). Fan-out deliberately kept small for a mode-doc/script feature in a personal repo.

### Key improvements folded in
1. **Reuse `decision` field for the checkpoint** instead of an ephemeral chat queue → the loop's review gate and both STOP invariants become durable, tracker-visible data preconditions with zero new state.
2. **Tracker column change is ~4 lines, no reindex** — `SCHEMA` numbers are never read as numbers (grid renders by key order + field name). The "column index shift" risk was imaginary; dropped.
3. **Firecrawl is `v2`** (`POST /v2/search`), plain `fetch`, no SDK. Corrected endpoint/body/response; added recency filter and rate-limit handling.
4. **Discovery must not bypass the title filter** — Firecrawl links have no company and pull aggregators/blogs; route them through the existing `titleFilter` + host-derived company + `source:'firecrawl'` before appending, or the expensive scoring step gets polluted.
5. **Dropped as YAGNI:** the `loop.mjs` helper and the `loop.draft_threshold` config knob (hardcode 4.0 — it's already the ethics line).
6. **`loop.md` is a thin composition** over existing `modes/pipeline.md`, not a re-spec of JD extraction / report numbering / PDF.

---

## Overview

Close the only two axes where `Kurt-Chan/ai-job-scraper` beats career-ops — **broad web discovery** and an **unattended end-to-end loop** — plus the one new capability it has that we don't: **cover-letter generation**. Everything else it does (FastAPI, SSE dashboard, JSON persistence, resume parser, standalone scorer) reinvents what career-ops already has and is out of scope.

Basis: `docs/brainstorms/2026-07-14-broad-discovery-and-unattended-loop-brainstorm.md`.

## Problem Statement / Motivation

- **Discovery is config-bound**: `scan.mjs` only sees companies in `portals.yml`. A role at an unlisted company is invisible. We want optional, *deliberately-activated* broad reach — not an always-on scraper.
- **The pipeline is manual**: scan, evaluate, generate CV are separate hand-run steps. We want one unattended pass (`scan → liveness → score`) that stops for human review before drafting, and always before submit.
- **No cover letters**: we generate CVs/PDFs but nothing drafts a cover letter.

## Proposed Solution

Three independently-shippable deliverables, ordered so each builds on the last:

1. **Cover-letter mode** (`modes/cover.md`) → markdown to `output/cover-letters/{slug}.md`, reusing `cv.md` + `article-digest.md` + the role's eval report. Add a `coverLetterPath` column to the tracker **Preparations** view (Applications already has `coverLetter`).
2. **Unattended loop mode** (`modes/loop.md`) → checkpoint-at-draft orchestration built on the `decision` field. Runs `scan → liveness → score` unattended, stops with a durable review queue, drafts on approval, never submits.
3. **Broad discovery** → opt-in Firecrawl web search inside `scan.mjs`, gated by a `portals.yml` flag, routed through the existing filter+dedup+pipeline sink. Dependency-free (`fetch`, Node 18+).

## Technical Approach

### Config (portals.yml)

`config/profile.yml` doesn't exist in this repo, so discovery settings live in `portals.yml` (already the scanner's config home, user-layer per DATA_CONTRACT). **Deviation from brainstorm noted.** The draft threshold is **not** a config knob — 4.0 is hardcoded in `modes/loop.md` prose (it already equals the "discourage <4.0" ethics line; a second knob invites drift).

```yaml
# portals.yml (append)
discovery:
  enabled: false            # opt-in — user flips ON for a broad-reach run
  queries:                  # Firecrawl web-search seeds
    - "site:boards.greenhouse.io head of applied AI remote"
    - "remote AI automation engineer job"
  max_results: 20           # total per run (free-tier guard), split across queries
```

`FIRECRAWL_API_KEY` from env, never committed.

### Phase 1 — Cover-letter mode + tracker column

**`modes/cover.md`** (new): draft a cover letter from `cv.md`, `article-digest.md` (proof points — NEVER hardcode metrics), the role's eval report `reports/{num}-{slug}-{date}.md` (must exist; if not, evaluate first), and `modes/_profile.md` narrative. Obey memory constraints: no dashes / natural voice, no fabricated learning claims, company-values alignment where known. Output markdown to `output/cover-letters/{slug}.md` (create dir; `output/` gitignored). Markdown only — portals paste plain text; add PDF later only if one demands an attachment. State that (re)generation is an **agent action** (like CV/scoring): regen = ask the agent, or re-run the loop, for any role with empty `coverLetterPath` — there is no tracker button (the tracker is a static GitHub-API SPA with no backend).

**Tracker changes** — `SCHEMA` index numbers are dead (grid uses `Object.keys()` order + field name; `SheetDataGrid.jsx:195,201`). So: add the key, no reindex.

```js
// tracker/src/constants.js
// SCHEMA.Preparations: insert the key between cvPath and qa (numbers left as-is)
cvPath: 6, coverLetterPath: 6.5, qa: 7, /* ...unchanged... */
// HEADER_NAMES: coverLetterPath: 'Cover Letter'
```

```jsx
// tracker/src/SheetDataGrid.jsx
GITHUB_PATH_FIELDS.add('coverLetterPath')      // renders as repo file link like cvPath (:24)
// width map (:93): coverLetterPath: 200
// prepToRow (~:140): coverLetterPath: p.coverLetterPath ?? ''
```

```js
// tracker/src/useTracker.js — prep→application auto-create (~:216-231)
coverLetter: job.preparation?.coverLetterPath || '',   // carry draft into Applications on submit
```

Backward-compat: absent field → `''` via `?? ''`. No jobs.json migration. **Before coding, grep `test-all.mjs` for any hardcoded Preparations column count/snapshot** and update it if present.

### Phase 2 — Unattended loop mode (checkpoint via `decision`)

**`modes/loop.md`** (new) — a thin composition, not a re-spec. It leans entirely on three fields already in `jobs.json`: `report` (durable "already scored"), `decision` (the review queue), `preparation.coverLetterPath` (durable "already drafted").

```
1. node scan.mjs                       # appends fresh URLs to pipeline.md (+ discovery if enabled)
2. Inline: pipeline URLs with no matching jobs.json `report` = the work list
3. node check-liveness.mjs <urls>      # drop expired
4. For each LIVE url: apply modes/pipeline.md evaluation (report + PDF + tracker) →
   writes fitScore + report + appNum to jobs.json. Set decision:'pending' ONLY when
   (fitScore >= 4.0) OR (source starts with "User-added"). Leave others undecided.
   The loop NEVER writes decision:'apply'. (report present → skip re-scoring, idempotent)
5. node gen-applications-md.mjs        # refresh applications.md
6. STOP. The review queue IS a query, not a chat artifact:
     jobs where decision === 'pending'  →  present these to the human.
   Human acts in chat OR the tracker Jobs dropdown:
     approve → decision:'apply' (auto-creates preparation, useTracker.js:187-197)
     reject  → decision:'skip'
7. For each job with decision === 'apply' AND empty preparation.coverLetterPath:
     run modes/cover.md + modes/pdf.md → write coverLetterPath + cvPath into Preparations.
   (coverLetterPath already set → skip; idempotent re-run)
8. STOP. The loop has NO submit capability — it never sets submissionStatus and never
   hits a portal. Submission stays a manual human tracker action.
```

Why this is the lazy-correct shape:
- **Durable + resumable**: an interrupted run re-derives the queue from `decision==='pending'` and skips already-scored (`report`) and already-drafted (`coverLetterPath`) roles. No checkpoint file, no `loop.mjs`.
- **STOP-before-draft is enforced by data**: the loop only ever writes `pending`; the human is the *sole writer* of `apply`; drafting is gated on `apply`. The agent can't skip the gate.
- **STOP-before-submit holds by construction**: the loop has no code path that submits.
- **Full parity**: the human sees/edits the exact same `decision` field in the tracker Jobs view that the agent reads. Approving in chat or in the grid is identical.

Invocation: on-demand via `modes/loop.md`; add one row to the AGENTS.md skill-modes table ("Runs unattended scan→score, stops for review → `loop`"). Not scheduled. **No `loop.mjs`.**

### Phase 3 — Broad discovery (Firecrawl v2, opt-in, in scan.mjs)

Extend `scan.mjs`: after the ATS scan, if `discovery.enabled`, run Firecrawl search and route results **through the same `titleFilter` + dedup (`scan-history.tsv`) + `pipeline.md` append** already in `main()`. Firecrawl v2, plain `fetch`, no SDK (Node 18+ global fetch).

```js
// scan.mjs — Firecrawl v2 search. Returns link-only results (2 credits / 10 results).
async function firecrawlSearch(query, { limit, key = process.env.FIRECRAWL_API_KEY }) {
  const res = await fetch('https://api.firecrawl.dev/v2/search', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit, sources: [{ type: 'web' }], tbs: 'qdr:w' }), // qdr:w = past week
  });
  if (res.status === 429) { console.warn(`firecrawl 429 (rate/credit): ${query}`); return []; }
  if (!res.ok) { console.warn(`firecrawl ${res.status}: ${query}`); return []; }
  const { data } = await res.json();
  return (data?.web ?? []).map(r => ({
    url: r.url,
    title: r.title ?? '',
    company: deriveCompanyFromHost(r.url), // greenhouse/ashby/lever host slug, else ''
    source: 'firecrawl',
  }));
}
```

Integration rules (the make-or-break for signal quality):
- **Budget**: loop over `discovery.queries`, cap total results at `discovery.max_results` across the run (not per-query). Firecrawl search = 5 req/min — fine for a handful of queries.
- **Filter**: every result passes `titleFilter` (`scan.mjs:338`) before dedup/append — search returns aggregators, listicles, blog posts, not just JDs.
- **Shape**: set `source:'firecrawl'` and default `company:''` gracefully so `appendToPipeline`/`appendToScanHistory` (`scan.mjs:239`) never write `undefined`.
- **Guards**: `discovery.enabled:false` (default) → block skipped, output byte-identical to today. Enabled but no `FIRECRAWL_API_KEY` → warn + skip. 429 / HTTP error → warn + skip, scan still completes. All results flow through existing dedup so re-runs don't re-add.
- Search returns links only (what we want — cheapest); the downstream loop scrapes/evaluates the ones that survive. Do **not** pass `scrapeOptions`.

## Acceptance Criteria

### Phase 1 — Cover letters
- [x] `modes/cover.md` drafts `output/cover-letters/{slug}.md` from cv + digest + report; obeys no-dashes/natural-voice; no fabricated metrics *(mode spec written; end-to-end drafting exercised on next real evaluation)*
- [x] Refuses (or auto-evaluates) when the role has no eval report yet *(specified in mode)*
- [x] Preparations view shows a "Cover Letter" column linking the draft file; existing rows render blank *(tracker builds, renders via `?? ''`)*
- [x] Submitting a prep prefills `application.coverLetter` from the prep draft *(wired in useTracker.js)*
- [x] `test-all.mjs` grepped for Preparations column assertions (none) and updated if needed; suite green (68/68)

### Phase 2 — Loop
- [ ] `modes/loop.md` runs scan → liveness → score unattended and updates jobs.json + applications.md
- [ ] Already-scored roles (`report` present) skipped; already-drafted roles (`coverLetterPath` present) skipped
- [ ] Review queue = `decision==='pending'`; loop sets `pending` only for fitScore≥4.0 OR source starts with "User-added"; loop never writes `apply`
- [ ] Drafting gated on human-set `decision:'apply'`; loop never sets `submissionStatus` / never submits
- [ ] Queue survives session restart (re-derived from `decision`), no checkpoint file, no `loop.mjs`
- [ ] `loop.md` composes `modes/pipeline.md` rather than re-specifying JD extraction / report numbering / PDF

### Phase 3 — Discovery
- [ ] `discovery.enabled:false` → `scan.mjs` output byte-identical to today (no new npm dependency in package.json)
- [ ] Enabled → Firecrawl `v2` results pass `titleFilter`, get `source:'firecrawl'` + host-derived company, appended to pipeline.md, deduped via scan-history.tsv
- [ ] Total results capped at `discovery.max_results` across all queries
- [ ] Missing key / 429 / HTTP error → warn + skip, scan completes

## Testing

- Phase 1: run cover mode on one evaluated role → assert file created, non-empty, no `—`/` - ` connectors. Load tracker → Preparations shows the column.
- Phase 2: dry-run loop on a small pipeline → assert-based check of queue selection (fitScore≥4.0 OR source^="User-added", and `report`→skip) and that no path writes `apply`/`submitted`.
- Phase 3: `node scan.mjs` with `discovery.enabled:false` → diff vs baseline (unchanged); with a fake key → asserts graceful 429/skip; confirm filtered/junk links don't reach pipeline.md. `test-all.mjs` green.

## Dependencies & Risks

- **Firecrawl free-tier (5 req/min, 429 on cap)** — opt-in, `max_results` budget, graceful skip, isolated to one function.
- **Discovery signal quality** — the real risk. Mitigated by `titleFilter` + recency `tbs:qdr:w` + host-derived company + liveness + the 4.0 gate before the LLM ever scores.
- **`test-all.mjs` pinning Preparations shape** — grep before coding (acceptance criterion).
- **Scope creep** — the "NOT building" list is a hard boundary.

## Explicitly NOT Building (YAGNI)

FastAPI backend · SSE dashboard · separate JSON persistence · resume parser · standalone scorer · "headless Claude" runner · cover-letter PDF rendering · scheduled/cron loop · `loop.mjs` helper · `draft_threshold` config knob · tracker-side "Generate" button · any new npm dependency.

## References

### Internal
- Brainstorm: `docs/brainstorms/2026-07-14-broad-discovery-and-unattended-loop-brainstorm.md`
- Prior brainstorm (B.1/B.2 deferral): `docs/brainstorms/2026-07-13-freshness-vs-elevate-brainstorm.md`
- Scanner + filter + pipeline sink + fetch: `scan.mjs:168,239,338`
- Liveness: `check-liveness.mjs`, `liveness-core.mjs`
- Tracker schema/headers (indices are dead): `tracker/src/constants.js:10,28`; render-by-name: `tracker/src/SheetDataGrid.jsx:24,93,140,195,201`
- `decision` dropdown (queue field) + prep→application auto-create: `tracker/src/constants.js:65-72`, `tracker/src/useTracker.js:187-231`
- Import dedup (pipeline↔jobs): `tracker/src/useTracker.js:259,270`
- Tracker generation: `gen-applications-md.mjs`
- Reuse (don't re-spec): `modes/pipeline.md`, `modes/auto-pipeline.md`, `modes/oferta.md`, `modes/pdf.md`, `modes/scan.md`
- "User-added" marker already in data: jobs carry `source: "User-added (…)"`
- Memory constraints: no-dashes-natural-voice, no-fabricated-learning-claims, remotecom-values, no-upwork-in-repo

### External
- Comparison target: https://github.com/Kurt-Chan/ai-job-scraper
- Firecrawl v2 search: https://docs.firecrawl.dev/api-reference/endpoint/search · rate limits: https://docs.firecrawl.dev/rate-limits · v1→v2: https://docs.firecrawl.dev/migrate-to-v2
