# Brainstorm — Broad Web Discovery + Unattended End-to-End Loop

**Date:** 2026-07-14
**Trigger:** Head-to-head against `Kurt-Chan/ai-job-scraper` showed career-ops leads on cost, verification, evaluation depth, CV output, tracking, and ethics — but loses on exactly two axes: (1) **broad web discovery** beyond configured portals, and (2) an **unattended end-to-end loop**. This brainstorm scopes closing both without importing the reinventions (FastAPI, SSE dashboard, JSON persistence, resume parsing) we already have better versions of.
**Follows:** `2026-07-13-freshness-vs-elevate-brainstorm.md` (which deferred these as B.1 / B.2).

## What We're Building

Two capabilities plus one supporting piece:

1. **Broad discovery mode (opt-in, config-toggled).** A search-based discovery path (Firecrawl free tier) that finds roles on portals *not* in `portals.yml`. Off by default; flipped on/off by a variable in `config/profile.yml` — not auto-gated on portal freshness. `scan.mjs` stays the free, zero-token primary.

2. **Unattended loop — checkpoint at draft.** `scan → liveness → score` runs unattended. It **stops** and surfaces high-score verdicts for the user's review. Only on approval does it draft CV + cover letter. It **always** stops again before submit. (Ethics rule: never auto-submit — unchanged.)

3. **Cover-letter mode (new).** career-ops generates CVs/PDFs but has no cover-letter generator. Add one that reuses `cv.md` + `article-digest.md` proof points + the role's eval report. Surface it in the tracker's **Preparations** view (drafting stage), promoting to the existing **Applications** `coverLetter` column once applied.

## Why This Approach

- **Discovery as a toggle, not a gate.** The prior brainstorm gated Firecrawl on portal freshness; the user prefers an explicit on/off variable — activate broad search deliberately (e.g. when hunting a niche role), not via a heuristic that guesses. Keeps the new dependency dormant and zero-cost until wanted.
- **Checkpoint at draft** keeps a human in the loop at the two moments that matter (which verdicts to pursue, and submit), while automating the tedious, cost-heavy middle (scan, liveness re-check, scoring). Matches the existing "quality over quantity / never auto-submit" ethic.
- **Cover letters are the one genuinely new thing** the external repo does that we don't. Storage is half-built already (`application.coverLetter` field + Applications column exist), so the real new work is the *generator* + a Preparations column — small surface, high value.

## Key Decisions

1. **Discovery activation:** config variable in `config/profile.yml` (e.g. `discovery.firecrawl.enabled: false`), manually toggled. NOT freshness-gated. `scan.mjs` remains primary; Firecrawl is supplementary reach.
2. **Loop autonomy:** checkpoint-at-draft. Unattended through scoring; human gate before drafting and before submit.
3. **Cover letters:** new generator mode, in scope. Reuses existing CV/proof-point/report sources.
4. **Tracker integration:** add a cover-letter column to the **Preparations** schema/view (mirroring `cvPath`); the **Applications** `coverLetter` column already exists and needs no change.
5. **Explicitly NOT building (YAGNI / already have it):** FastAPI backend, SSE live dashboard, separate JSON persistence, resume parser, standalone scoring engine, "headless Claude" runner. All are reinventions of existing career-ops parts.

## Resolved Questions

- *Auto-gate discovery on freshness?* No — explicit config toggle instead.
- *How autonomous is the loop?* Checkpoint at draft (stops before drafting and before submit).
- *Include cover letters?* Yes, new mode.
- *Where does the cover letter show in the tracker?* Preparations view gets a new column; Applications view already has one.
- *Cover-letter output format?* Markdown only → `output/cover-letters/{slug}.md`. No PDF render (portals paste plain text); add PDF later only if a portal demands an attachment.
- *Checkpoint threshold?* Default `4.0/5` (configurable via `config/profile.yml`), matching the "discourage <4.0" ethics line — BUT **any user-added role always enters the review/draft queue regardless of score**. The threshold gates only loop-discovered roles.
- *Loop invocation?* On-demand mode/script (e.g. `/career-ops loop`) — user decides when it runs. Not scheduled for now.
