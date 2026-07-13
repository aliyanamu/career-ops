# Brainstorm — JSON-backed dashboard (retire xlsx as source of truth)

**Date:** 2026-07-13
**Trigger:** The xlsx is the current source of truth, but Hana lives in the React dashboard and rarely opens Excel. This session's data drift (agent edited derived `jobs.json`, hides never reached the xlsx-backed dashboard) exposed the root problem. Also `extract-to-json.mjs` needs python/openpyxl, which is not installed, so xlsx→json sync is already broken.

## What We're Building

Flip the source of truth from `Job_Hunting_Progress.xlsx` to JSON. The React tracker reads and writes JSON directly. The xlsx becomes an export-only convenience. A new Import button on the Jobs view pulls freshly scanned jobs into the store.

## Why This Approach

- The agent edits JSON in a single write. No exceljs, no python, no round-trip, no drift.
- The scanner already emits JSON; git diffs on JSON are readable, xlsx diffs are binary.
- Hana rarely opens the xlsx, so spreadsheet ergonomics are near-zero loss (kept as export).

## Key Decisions (resolved)

1. **Scope:** all four sheets she uses become JSON: Jobs, Applications, Preparations, Companies.
2. **Import button:** pulls newly scanned jobs (scanner output / `pipeline.md`) into Jobs JSON, deduped by URL, one click.
3. **xlsx fate:** dropped as SoT; kept as a "Download as xlsx" export button.
4. **Storage:** tracker reads/writes the JSON files via the same GitHub contents API + PAT flow it uses for the xlsx today. Data stays in-repo.
5. **JSON shape:** one file per collection: `data/jobs.json`, `data/applications.json`, `data/preparations.json`, `data/companies.json`. Each a flat array of records. Independent saves, clean diffs.

## Scope-out / already handled

- **Non-data sheets:** `Dashboard` becomes computed in-app; `Status Legend` already lives in `constants.js` (DROPDOWN_OPTIONS); `CV Summary` can read `cv.md`. No JSON collection needed for these.
- **Go dashboard + `extract-to-json.mjs` + `sync-tracker.mjs`:** retire or repoint; the Go binary is already deleted.
- **Legacy `data/jobs.json` nested shape** (job embeds prep + application) gets flattened into the per-collection model during migration.

## Resolved Questions

1. **Record identity + linking:** each record has a stable `id`; the job `url` is the dedup key and the link across Jobs/Applications/Preparations. Records without a URL fall back to `id` + company+role.
2. **Migration source:** seed the four JSON files from the reconciled xlsx as it stands now (98 visible / 44 hidden, includes today's 39 hides + 14 viable scanner jobs). One-time migration.
3. **Import-from-scan conflict rule:** preserve existing `hide`, `decision`, `fitScore`, and notes for a URL already present. Import only adds genuinely new jobs, never clobbers manual edits.
4. **Applications numbering:** drop the manual `#` column (it collided during this session's merge); use stable `id`s, UI shows row order. Removes the overwrite-by-number footgun.

## Migration / build outline (for the plan)

1. One-time migrate script: read reconciled xlsx (via exceljs, in `tracker/node_modules`) → write flat `data/{jobs,applications,preparations,companies}.json` with `id` + `url` keys.
2. Rework tracker data layer (`useWorkbook.js` → a JSON equivalent): read/write the four JSON files via GitHub contents API + PAT. One save touches one file.
3. Jobs view: add Import button that reads scanner output (`pipeline.md` / scan) and upserts into `jobs.json` (preserve-my-edits rule).
4. Add "Download as xlsx" export (exceljs write) for the occasional spreadsheet.
5. Retire `extract-to-json.mjs`, `sync-tracker.mjs`, and the xlsx-write path. Repoint or delete the Go dashboard + `data/tracker.json`.
6. Keep `applications.md` optional: regenerate from `applications.json` if still wanted, else drop.
