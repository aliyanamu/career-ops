# Tracker Architecture (`tracker/`)

The React SPA in `tracker/` is a spreadsheet-style dashboard over the job-search pipeline. It has **no server**: GitHub is the database and GitHub Pages is the host. This doc covers the decisions worth understanding before changing it.

> Source of truth is `data/jobs.json` (see [`../AGENTS.md`](../AGENTS.md) "Pipeline Integrity" and [`ARCHITECTURE.md`](ARCHITECTURE.md)). `data/applications.md` is generated from it; the tracker reads/writes the JSON directly.

## GitHub-API-as-database

There is no application server. The SPA persists by reading and writing files in this repo through the GitHub Contents API:

- **Read:** `GET /repos/{owner}/{repo}/contents/{path}` → base64 content + a `sha`. `data/jobs.json` and `data/companies.json` are fetched on load.
- **Write:** `PUT` the same path with new base64 content, a commit message, the branch, and the file's `sha`.
- **Auth:** a personal access token (repo read/write scope) entered on first load and kept in `localStorage`. A `401` clears it. Demo mode uses no token at all.

Config (owner/repo/branch) is in `src/constants.js`. All network + persistence logic is in `src/useTracker.js`.

## SHA-based optimistic concurrency

GitHub requires the current file `sha` to update a file, which gives us optimistic concurrency for free. The SPA is not the only writer — scans and scripts also commit `jobs.json` — so a stale write must not clobber a concurrent change:

1. On load, the response `sha` for each file is stashed in `shaRef`.
2. On save, `PUT` with that stashed `sha`.
3. If GitHub returns **`409`** (the file changed since we loaded), fetch the fresh `sha` and retry the `PUT` once.

See `pushJsonFile` in `src/useTracker.js`. The retry is single-shot: it resolves the common "something committed between load and save" race without turning into an unbounded loop.

## One nested model, four flat views

`jobs.json` is a list of jobs, each with embedded sub-objects:

```
job = {
  role, url, source, dateAdded, fitScore, decision, notes, …,
  company:     { company, careersUrl, … },   // always present
  preparation: { date, cvPath, submissionStatus, … } | absent,
  application: { dateApplied, status, salary, … }    | absent,
}
```

The **Jobs / Preparations / Applications** tabs are three flat views of the same job list; **Companies** is a separate list. `src/rows.js` holds the pure builders (`jobToRow`, `prepToRow`, `appToRow`, `companyToRow`) that flatten a job into grid rows, and `applyFieldUpdate` folds a cell edit back into the nested shape. Preparations/Applications rows only exist for jobs that have that sub-object, so those tabs are naturally filtered.

## Editability policy

Not every column is safe to hand-edit. `isFieldEditable(field, sheet)` in `src/rows.js` locks:

- **Identity/derived everywhere:** `num` (derived), `url` (the dedup / update-in-place key scans match on), `company`, `role`.
- **Provenance on Jobs:** `dateAdded`, `source` (set at scan time). Eval outputs `fitScore`/`decision` stay editable — you may want to override them.
- **Mirrors on Preparations/Applications:** `jobUrl` is a copy of `job.url`; editing it only desyncs from the canonical URL.

Locked columns render with a 🔒 header and are never persisted even if AG Grid emits a change.

## Decision side-effects

The pipeline advances itself when you set a decision. `applyFieldUpdate` (pure, in `src/rows.js`) creates sub-records on first promotion:

- `decision = apply` and no `preparation` → create a preparation (dated today, `submissionStatus: pending`).
- `decision = easy_apply` and no `application` → create an application (`status: applied`).
- On Preparations, `submissionStatus = submitted` and no `application` → promote to an application (`notes: "Promoted from Preparations"`, carrying the CV/cover-letter paths).

These are the data-loss-adjacent branches, so they live in a pure reducer with an injectable `today` and are unit-tested in `src/rows.test.js` (`npm test`).

## Client state & persistence

- **Workbook data** (jobs/companies, dirty count, status) — `useTracker` hook, exposed via `WorkbookContext`.
- **Settings** (theme/density/language) — `SettingsContext` in `src/settings.jsx`, persisted to `localStorage` key `career-ops-settings`; theme also stamps `data-theme` on `<html>` for the CSS row-tint variables.
- **Column layout** — per-sheet AG Grid column state to `localStorage` key `career-ops-col-state-{sheet}`.
- **i18n** — flat `t(lang, key, params)` in `src/i18n.js` over `src/locales/*.json`; add a locale with one JSON + one registry entry, no component edits.

## Demo mode

`?demo=1` (flag in `src/demo.js`) loads bundled `public/sample-*.json` (hand-authored fictional data) with `import.meta.env.BASE_URL`, prompts for no token, makes no GitHub calls, and short-circuits `saveWorkbook` so the read-only sample can never be written. A vitest smoke test runs the sample through the row builders to catch shape drift.

## Deploy

`.github/workflows/build-tracker.yml`: on push to `main` touching `tracker/**`, run `npm test`, then build, then deploy `dist/` to Pages. One-time: repo **Settings → Pages → Source = GitHub Actions**. `vite.config.js` sets `base: '/career-ops/'` so assets resolve under the project Pages path.
