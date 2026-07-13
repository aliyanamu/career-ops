# Brainstorm — Freshness/Cleanup vs. Elevate the Pipeline

**Date:** 2026-07-13
**Trigger:** Stale jobs in `data/jobs.json` (97 total, 80 visible, oldest 2026-05-06) + desire to elevate career-ops using ideas from two external projects, while maintaining the repo and deleting unused parts.

## Context snapshot

- `data/jobs.json`: 97 jobs, 80 visible, 14 with applications, oldest 2026-05-06 → stale backlog.
- `data/pipeline.md`: ~30 Coinbase/OKX/Ripple URLs sitting un-pulled.
- Existing tooling that overlaps the external repos: `scan.mjs` (zero-token Greenhouse/Ashby/Lever), `check-liveness.mjs` (Playwright expiry), evaluation modes, CV/PDF gen, React tracker (`tracker/`).
- External refs:
  - coffee-driven.dev "almost-free" agent: headless Claude CLI + Firecrawl free tier discovery, 4-stage pipeline (resume→discover→score→cover letter), FastAPI+SSE dashboard, JSON persistence.
  - Kurt-Chan/ai-job-scraper: same shape (Firecrawl search + Claude CLI prompts + vanilla JS dashboard).
  - Both are largely reinventions of what career-ops already does.

## Plan A — Freshness & Cleanup (operational hygiene)

**What:** Sweep visible jobs for liveness, hide/purge dead ones, reconcile trackers, delete repo cruft. No new features.

**Scope:**
- Batch `check-liveness.mjs` across visible job URLs → flag expired → `hide: true`.
- Reconcile `jobs.json` ↔ `applications.md` ↔ `pipeline.md` (pull or drop the pipeline inbox URLs).
- Repo cleanup audit: ~19 root `.mjs` scripts, duplicate lockfiles (root + `tracker/` each have npm + pnpm), `Job_Hunting_Progress.xlsx`, `career-ops-dashboard` (4.4MB binary), 8 README translations.

**Pros:** Fast, uses existing tools, fixes the stated pain, low risk, mostly deletion.
**Cons:** No new capability.

## Plan B — Elevate the Pipeline (steal only the good parts)

**What:** Close the two real gaps the external repos expose; build nothing that already exists.

1. Broad discovery — optional search-based mode (Firecrawl free tier) to find jobs on portals not in `portals.yml`.
2. One-command loop — `scan → liveness → score → draft` with auto-drafted cover letters for high-score verdicts.

**Explicitly NOT building (YAGNI / already exists):** FastAPI+SSE dashboard, JSON persistence, resume parsing, separate scoring engine, "almost-free headless Claude" (already the model).

**Pros:** New reach + less manual per-application work.
**Cons:** Firecrawl = new dependency + free-tier cap; broad discovery lowers signal; scope-creep magnet.

## Decision

**Do A first, then a thin slice of B.**

Rationale: A unblocks the stated pain (stale Jobs), is mostly deletion, uses existing tools, and *informs* B — after the liveness sweep we'll know whether configured portals are still producing fresh roles, which decides whether broad discovery (B.1) is worth adding. Then cherry-pick B's auto-draft loop; skip the reinventions.

## Resolved Questions

1. **Sequencing:** Plan A first, then decide on B with fresh data.
2. **Stale jobs:** Hide (`hide: true`), don't hard-delete — reversible, keeps history.
3. **Repo cleanup:** Mildly aggressive. This is a *fork*, so it's fine to diverge from the original — delete fork-inherited cruft that isn't used (xlsx, stray files, and dashboard binary / extra READMEs / duplicate lockfiles are fair game since we don't need parity with upstream). Judgment call per item, lean toward removing what we don't use.
4. **Plan B discovery (Firecrawl):** Deferred — decide after A's liveness sweep shows whether configured portals are still producing fresh roles.
