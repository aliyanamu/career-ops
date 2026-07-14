# Data Contract

> **Keep in sync** — these files describe overlapping facts; change one, check the others:
> - [`docs/SCAN-WORKFLOW.md`](docs/SCAN-WORKFLOW.md) — its "Sources of truth" table is a subset of the file lists below
> - [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — data-flow diagram over these same files
> - [`AGENTS.md`](AGENTS.md) — "Data Contract (CRITICAL)" + "Pipeline Integrity" sections restate the user/system split and source-of-truth rule

This document defines which files belong to the **system** (auto-updatable) and which belong to the **user** (never touched by updates).

## User Layer (NEVER auto-updated)

These files contain your personal data, customizations, and work product. Updates will NEVER modify them.

| File | Purpose |
|------|---------|
| `cv.md` | Your CV in markdown |
| `config/profile.yml` | Your identity, targets, comp range |
| `modes/_profile.md` | Your archetypes, narrative, negotiation scripts |
| `career-direction/*` | Your active direction + requirements log (biases scan/scoring) |
| `article-digest.md` | Your proof points from portfolio |
| `interview-prep/story-bank.md` | Your accumulated STAR+R stories |
| `portals.yml` | Your customized company list |
| `data/jobs.json` | Tracker **source of truth** (nested: each job embeds its `preparation` + `application`) |
| `data/applications.md` | Generated view of `jobs.json` (via `gen-applications-md.mjs`) — do not hand-edit |
| `data/companies.json` | React dashboard company list |
| `data/discovered-companies.json` | Companies found via Firecrawl discovery (source of truth for the expansion loop; merge by slug, `status`: new/tracked/dismissed) |
| `data/pipeline.md` | Your URL inbox |
| `data/scan-history.tsv` | Your scan history |
| `data/follow-ups.md` | Your follow-up history |
| `writing-samples/*` | Your personal writing samples for style calibration |
| `reports/*` | Your evaluation reports |
| `output/*` | Your generated PDFs |
| `jds/*` | Your saved job descriptions |

## System Layer (safe to auto-update)

These files contain system logic, scripts, templates, and instructions that improve with each release.

| File | Purpose |
|------|---------|
| `modes/_shared.md` | Scoring system, global rules, tools |
| `modes/oferta.md` | Evaluation mode instructions |
| `modes/pdf.md` | PDF generation instructions |
| `modes/scan.md` | Portal scanner instructions |
| `modes/batch.md` | Batch processing instructions |
| `modes/apply.md` | Application assistant instructions |
| `modes/auto-pipeline.md` | Auto-pipeline instructions |
| `modes/contacto.md` | LinkedIn outreach instructions |
| `modes/deep.md` | Research prompt instructions |
| `modes/ofertas.md` | Comparison instructions |
| `modes/pipeline.md` | Pipeline processing instructions |
| `modes/project.md` | Project evaluation instructions |
| `modes/tracker.md` | Tracker instructions |
| `modes/training.md` | Training evaluation instructions |
| `modes/patterns.md` | Pattern analysis instructions |
| `modes/followup.md` | Follow-up cadence instructions |
| `modes/ja/*` | Japanese language modes |
| `CLAUDE.md` | Agent instructions |
| `AGENTS.md` | Codex instructions |
| `*.mjs` | Utility scripts |
| `batch/batch-prompt.md` | Batch worker prompt |
| `batch/batch-runner.sh` | Batch orchestrator |
| `tracker/*` | React web tracker source |
| `templates/*` | Base templates |
| `fonts/*` | Self-hosted fonts |
| `.claude/skills/*` | Skill definitions |
| `docs/*` | Documentation |
| `VERSION` | Current version number |
| `DATA_CONTRACT.md` | This file |

## Note — tracker storage (this fork)

The React tracker in `tracker/` reads and writes `data/jobs.json` + `data/companies.json` directly via the GitHub API. `Job_Hunting_Progress.xlsx` and the xlsx-derived scripts (`extract-to-json.mjs`, `sync-tracker.mjs`) were removed; `data/jobs.json` is the tracker's source of truth. `data/applications.md` is now **generated** from `jobs.json` by `scripts/gen-applications-md.mjs` (`npm run gen-tracker`) — do not hand-edit it. The legacy batch TSV → `scripts/merge-tracker.mjs` flow still exists but writes into that generated file.

## The Rule

**If a file is in the User Layer, no update process may read, modify, or delete it.**

**If a file is in the System Layer, it can be safely replaced with the latest version from the upstream repo.**
