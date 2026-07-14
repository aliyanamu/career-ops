---
title: Finish JSON-backed tracker and retire the xlsx path
type: refactor
status: active
date: 2026-07-14
---

# ♻️ Finish JSON-backed tracker and retire the xlsx path

> Recreated 2026-07-14 after the original was lost to a destructive `emptyOutDir` build before it was committed. Progress checkboxes reflect work already shipped.

## Overview

The React tracker (`tracker/`) is already JSON-backed: `WorkbookContext` → `useTracker.js` reads `data/jobs.json` (nested: each job embeds its 1:1 `preparation` + `application`) and `data/companies.json` via the GitHub contents API. The xlsx workbook was dead. This effort finishes the migration: retire the xlsx path, route all writes to `jobs.json`, add a scan→dashboard Import button, and unify the two trackers (`jobs.json` for the dashboard vs `applications.md` for the batch/eval pipeline).

**Shape decision:** keep the nested 2-file model (`jobs.json` + `companies.json`). `preparation`/`application` are 1:1 with a job; splitting adds join/orphan/multi-file-save cost for no benefit at personal-tracker scale.

## Phases & Progress

### Phase 0 — Port stranded data into jobs.json ✅ DONE
- [x] Add Hercules ×3, StraitsX ×3, The Flex ×4, OKX ×4, Alchemy as job records
- [x] StraitsX Card Issuing `application` = Applied
- [x] Commit + push (`525a24b`)

### Phase 1 — Delete the dead xlsx path ✅ DONE
- [x] Remove `tracker/src/useWorkbook.js`
- [x] Remove `constants.FILE_PATH` / `API_BASE`
- [x] Drop `exceljs` from `tracker/package.json`
- [x] Delete `Job_Hunting_Progress.xlsx`
- [x] Fix build bug: `vite.config.js` `emptyOutDir: true → false` (was wiping `docs/`)

### Phase 2 — Import button on the Jobs view ✅ DONE
- [x] `importFromPipeline()` in `useTracker.js` (parse `pipeline.md`, dedup by url, preserve edits)
- [x] "Import scan" button in `App.jsx` toolbar (Jobs tab)
- [x] Build + CI-deploy (`b604436`)

### Phase 4 — Retire derived tooling + unify trackers (IN PROGRESS)
- [x] Delete `extract-to-json.mjs` + `sync-tracker.mjs` (xlsx-derived, would clobber `jobs.json`)
- [x] Document `jobs.json`/`companies.json` as tracker SoT in `DATA_CONTRACT.md`
- [ ] **applications.md unification** (the untangle): 9 scripts read `data/applications.md` (`merge-tracker`, `verify-pipeline`, `normalize-statuses`, `dedup-tracker`, `analyze-patterns`, `followup-cadence`, `scan`, `gemini-eval`). Choose:
  - **(b) Generate `applications.md` from `jobs.json`** — a new `gen-applications-md.mjs` renders the markdown from each job's `application` sub-object. Batch scripts keep working read-only; `jobs.json` stays SoT. (Recommended — least breakage.)
  - (a) Repoint the batch/eval write-path to `jobs.json` and make `applications.md` fully derived or removed. (Bigger, cleaner long-term.)
- [ ] **Go dashboard (`dashboard/`) + `data/tracker.json`** fate: keep (documented/tested, in 8 READMEs) or retire. Default: keep; it reads `jobs.json` already.
- [ ] Update `AGENTS.md` tracker/data-flow references to name `jobs.json` SoT and the generated `applications.md`.

### Phase 3 — Export fallback (optional)
- [ ] "Download CSV" per sheet (dependency-free). Skip xlsx export (exceljs removed).

### Phase 5 — Verify
- [ ] Reload dashboard: all sheets render ported + imported data; hides correct; one source.
- [ ] `test-all.mjs` 0 failed; `verify-pipeline.mjs` clean.

## Acceptance Criteria
- [x] Dashboard shows ported jobs after reload.
- [x] No live file references xlsx/exceljs; xlsx + `useWorkbook.js` gone.
- [x] Import button adds new `pipeline.md` jobs, deduped, without overwriting edits.
- [ ] `applications.md` regenerates from `jobs.json` (or writers repointed); batch flow not broken.
- [ ] `AGENTS.md`/`DATA_CONTRACT.md` name `jobs.json` SoT.

## Risks
- **applications.md is read by 9 scripts** (the eval pipeline used this session). Do not delete it; make it a generated view or repoint carefully.
- **Go dashboard** is documented + tested + in all READMEs — not a blind delete.
- Two writers (agent + dashboard) on `jobs.json` via git/GitHub: 409-on-stale-sha, reload before editing. No new infra.

## References (file:line)
- Live data layer: `tracker/src/useTracker.js` (`:4-5` paths, `:86-109` load, `:114-143` save, `:155-229` updateField, `importFromPipeline`).
- Grid: `tracker/src/SheetDataGrid.jsx:199-262`; Dashboard: `tracker/src/DashboardView.jsx:43-66`.
- Batch coupling: `merge-tracker.mjs`, `verify-pipeline.mjs`, + 7 others reading `data/applications.md`.
- Scanner output: `scan.mjs:222-245` → `data/pipeline.md`.
