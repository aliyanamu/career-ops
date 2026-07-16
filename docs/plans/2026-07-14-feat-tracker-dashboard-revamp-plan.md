---
title: Tracker Dashboard Revamp — table UX, theming, i18n, export, portfolio polish
type: feat
status: active
date: 2026-07-14
---

# ✨ Tracker Dashboard Revamp

Polish-and-extend pass on the `tracker/` SPA (React 19 + Vite + MUI + AG Grid Community, GitHub API as backend). Keep all current functionality; add filtering/search/column control, light/dark theming, EN/ID i18n, CSV export, a zero-setup demo mode, and portfolio packaging.

Brainstorm: [`docs/brainstorms/2026-07-14-tracker-revamp-brainstorm.md`](../brainstorms/2026-07-14-tracker-revamp-brainstorm.md)

## Overview

The tracker already runs on **AG Grid Community** with column-state persistence and status-based row coloring. Most table asks are **configuration, not new code**. The genuinely new work is theming, i18n, a demo mode, and test/doc packaging. Deploy is **already wired** and mostly needs verification.

**Guiding principle (ponytail): enhance, don't rebuild. No new table dependency; remove the unused one.**

## Problem Statement

Current limitations (from user):
1. No easy filter/search, no column show-hide/pin control.
2. Visual design feels unpolished; single hardcoded light theme.
3. No personalization: no theme choice, no language, no density.
4. No way to export the data (CSV/XLSX).
5. Repo is a personal tool, not packaged as a portfolio piece (default Vite README, no demo, no tracker-specific tests/docs).

## Proposed Solution

Seven phases, ordered cheapest-first so value ships incrementally. Phases 1–2 are near-zero-risk config/deletion; 3–5 are the real features; 6–7 are packaging.

---

## What Already Exists (do NOT rebuild)

| Item | Status | Evidence |
|---|---|---|
| AG Grid Community table | ✅ in use | `tracker/src/SheetDataGrid.jsx` |
| Sort / resize / reorder / **column-state persistence** | ✅ working | `onColumnResized`/`onColumnMoved`/`onSortChanged` → `localStorage` `career-ops-col-state-{sheet}` |
| Status-based row coloring | ✅ working | `rowClassRules` in `SheetDataGrid.jsx` |
| Read-only column policy + 🔒 headers | ✅ working | `isFieldEditable()` |
| GitHub Pages **deploy** | ✅ wired | `.github/workflows/build-tracker.yml`, `vite.config.js` `base:'/career-ops/'` |
| `@mui/x-data-grid` dependency | ❌ **unused** → delete | no imports (grep confirms only AG Grid used) |
| `data/jobs.json` (114 jobs) / `companies.json` (119) | source of truth | embedded `company`/`preparation`/`application` sub-objects |

---

## Technical Approach

### Phase 1: Table UX — filters, quick search, column control, CSV export

**Files:** `tracker/src/SheetDataGrid.jsx` (primary), `tracker/src/GridToolbar.jsx` (new, small)

- **Filters:** add to `defaultColDef`: `filter: true, floatingFilter: true`. Community text/number filters cover all fields. (Set Filter is Enterprise — not used.)
- **Quick search:** a `TextField` in a per-sheet toolbar → `gridApi.setGridOption('quickFilterText', value)`. Per-sheet is correct (each tab is its own grid instance).
- **Column show/hide + pin:** the packaged Columns Tool Panel is Enterprise, but the **state APIs are Community**. Build a small `<ColumnsMenu>` popover (checkbox list of columns → `api.setColumnsVisible(cols, visible)`; pin toggle → `api.applyColumnState({ state:[{ colId, pinned }] })`). Reuse existing `saveColState` so visibility/pin persist to the same localStorage key.
- **CSV export:** toolbar button → `gridApi.exportDataAsCsv({ fileName: \`${sheetName}-${today}.csv\` })`. Built-in, exports current filtered+sorted view. No new dep. (XLSX deferred — YAGNI.)

```jsx
// tracker/src/GridToolbar.jsx (new)
// <TextField> quick search  +  <ColumnsMenu>  +  <Button> Export CSV
// receives gridRef; calls api.setGridOption / setColumnsVisible / applyColumnState / exportDataAsCsv
```

**Acceptance:**
- [x] Every sheet has working per-column filters + floating filter row.
- [x] Quick-search box filters visible rows live.
- [x] Columns popover toggles visibility and pin; choices persist across reloads.
- [x] Export CSV downloads the current (filtered) view with a dated filename.

### Phase 2: Remove dead dependency

**Files:** `tracker/package.json`

- Remove `@mui/x-data-grid` (unused). Run `npm install` to update lockfile. Net dependency reduction; smaller bundle.

**Acceptance:**
- [x] `@mui/x-data-grid` gone from `package.json` + lockfile; `npm run build` still green.

### Phase 3: Theming — light/dark + density + Settings drawer

**Files:** `tracker/src/settings.jsx` (new — hook + theme constants + drawer, one file), `tracker/src/main.jsx`, `tracker/src/App.jsx`, `tracker/src/SheetDataGrid.jsx`, **`tracker/src/index.css`** (critical — see below)

- **`useSettings` + `SettingsContext`** — one small file holds `{ theme, lang, density }` (3 `useState` + one `localStorage` effect, key `career-ops-settings`) plus the static theme constants. First load defaults `theme` from `window.matchMedia('(prefers-color-scheme: dark)')`. (Collapsed from 3 files to 1 per review — the theme objects are static data; no need for separate `theme.js`/context/drawer files. A minimal context is still justified because the grid needs `theme` deep in the tree.)
- **MUI:** wrap app in `ThemeProvider` with light/dark `createTheme` palettes. Replaces today's implicit default light theme → consistent surfaces, dividers, chips.
- **AG Grid v35 Theming API:** build two theme objects from the existing `themeQuartz.withParams(...)`, composing `colorSchemeDark` / `colorSchemeLight` parts; pass the active one to `<AgGridReact theme={...}>`. Density = grid `spacing` param + MUI `Toolbar` density. (`ponytail:` density is the fiddliest knob and lowest-value — cut it if it fights the v35 spacing API; theme is the requested part.)
- **⚠️ Hardcoded colors that dark mode MUST also fix** (found in architecture review — without these, "dark mode" ships with invisible cells):
  - `index.css` `rowClassRules` tints (`.row-recommended/.row-skip/.row-rejected/…`) are alpha-over-**white** RGBAs, and `.row-skip`/`.row-rejected` hardcode `color: rgba(0,0,0,0.38)` → near-black text on dark rows. Convert these to CSS custom properties with per-theme overrides (`:root[data-theme="dark"] { --row-skip-bg: …; --row-skip-fg: … }`), and stamp `data-theme` on the root when the theme toggles.
  - `SheetDataGrid.jsx` `DropdownCellEditor` hardcodes `background: 'white'` → white popover on dark grid. Use theme surface color.
  - `LinkCellRenderer` / `GithubPathCellRenderer` hardcode link color `#1976d2` → verify dark-mode contrast; drive from palette.
- **Settings drawer:** MUI `Drawer` from a gear icon in the AppBar; controls Theme (Light/Dark/System), Language (EN/ID), Density (Comfortable/Compact).

**Acceptance:**
- [x] Gear → Settings drawer with Theme/**Density**. (Language row deferred to Phase 4 — the `lang` state ships now but the selector waits for i18n so it isn't dead UI.)
- [x] Toggling theme restyles **MUI chrome, the AG Grid grid, the row-tint colors, the dropdown editor, and links** together; choice persists; System follows OS.
- [ ] Row tints + all cell text meet contrast in **both** modes (the non-functional "theme contrast" gate). *Code-complete (per-theme alphas in `index.css`); needs a browser eyeball via `npm run dev` → `?demo=1` → toggle Dark.*

### Phase 4: i18n — EN + ID (extensible)

**Files:** `tracker/src/i18n.js` (new), `tracker/src/locales/en.json`, `tracker/src/locales/id.json` (new), `tracker/src/App.jsx`, toolbar/drawer components

- Tiny `t(key)` reading the active `lang` from `SettingsContext` against JSON maps. (No `react-i18next` unless it grows — a flat key→string map + `t()` is enough for app chrome. `ponytail:` swap to react-i18next only if pluralization/interpolation gets heavy.)
- **Scope:** app chrome only — tab labels, buttons (Save/Logout/Export), status messages, Settings drawer labels, dropdown option labels.
- **Out of scope v1:** column headers (domain/schema terms, keep English + 🔒 convention) and cell data. Structure `locales/` so JA/KO/ZH drop in later with no code change.

**Acceptance:**
- [ ] Switching to ID translates tabs, buttons, status chips, and Settings labels.
- [ ] Adding a new locale file requires no component edits (only registering the key).

### Phase 5: Demo mode — zero-setup live app

**Files:** `tracker/src/useTracker.js`, `tracker/src/App.jsx`, `tracker/public/sample-jobs.json` + `sample-companies.json` (new, hand-authored fake data)

- **Single source of truth for the flag** (per review — three files need it; deriving `?demo=1` independently drifts):
  ```js
  // module-level, imported by useTracker.js AND App.jsx
  export const DEMO = new URLSearchParams(location.search).has('demo')
  ```
- **`loadWorkbook`:** if `DEMO` → `fetch(import.meta.env.BASE_URL + 'sample-jobs.json')` (BASE_URL matters — app is served under `/career-ops/` with client routes; a bare relative path resolves against the current route and breaks). **No PAT prompt, no GitHub calls.**
- **`saveWorkbook`:** guard at the very top — `if (DEMO) return` — so the "skip rows permanently deleted on save" confirm is unreachable in demo.
- **Also handle (review caught these leaks):** in demo, freeze edits or suppress `dirtyCount` (else the AppBar shows "N unsaved changes" that can never be saved); hide the **Logout** button (clears a PAT that doesn't exist).
- **Banner:** App bar shows a "Demo — read-only sample data" chip.
- **Data safety (critical, trust boundary):** **hand-author** ~10–15 rows of obviously-fake data directly in the JSON files — do NOT ship or subset the real 114-row `jobs.json`. Hand-authored fake data is safer against PII leakage than scrubbing real rows, and there's no generator script to rot. Match the exact embedded shape: `company` as a nested object (`job.company.company`), plus optional `preparation`/`application` sub-objects (the row builders read `job.company?.company` etc.). **Shape fidelity is verified by a smoke test** (Phase 7): `jobToRow`/`prepToRow`/`appToRow` run over `sample-jobs.json` without throwing.

**Acceptance:**
- [x] `?demo=1` loads bundled sample with no PAT prompt and no network call to GitHub.
- [x] Save + Logout hidden/disabled, no phantom dirty count, demo banner visible.
- [x] Sample data contains zero real personal/company data (hand-authored fictional); shape validated. (Formal Vitest smoke test lands in Phase 7.)

### Phase 6: Portfolio packaging — README, screenshots, deploy verify

**Files:** `tracker/README.md` (rewrite), `docs/assets/tracker-*.png` (screenshots/GIF), repo Settings → Pages

- Rewrite `tracker/README.md` (currently default Vite boilerplate): problem → architecture (GitHub-as-backend, no server) → features → **live demo link** (`https://aliyanamu.github.io/career-ops/?demo=1`) → screenshots/GIF → local dev.
- **Deploy:** already wired (`build-tracker.yml`). Only action: confirm repo **Settings → Pages → Source = GitHub Actions** is enabled (noted in the workflow comment). No new workflow.
- Add screenshots/GIF of light + dark + filtering.

**Acceptance:**
- [ ] `tracker/README.md` sells the project with a working demo link + screenshots.
- [ ] Pages live at the demo URL after next push to main.

### Phase 7: Tests + CI badge + architecture doc

**Files:** `tracker/src/rows.js` (new — extracted), `tracker/src/rows.test.js` (new), `tracker/package.json` (add vitest), `.github/workflows/build-tracker.yml` (add test step), `docs/TRACKER.md` (new)

- **Refactor for testability:** extract the pure functions currently inlined in `SheetDataGrid.jsx` — `jobToRow`, `prepToRow`, `appToRow`, `companyToRow`, `normalizeSubmissionStatus`, `toHideBool`, `isFieldEditable` — into `tracker/src/rows.js`; import back. **Move the read-only Sets with it** (`READONLY_ALWAYS`/`READONLY_ON_JOBS`/`READONLY_MIRRORS`/`MIRROR_SHEETS` — `isFieldEditable` closes over them).
- **Also extract the risky logic** (per review — the dumb field-mappers barely need tests; the real bug surface is elsewhere): pull the decision side-effects out of `updateField` (`useTracker.js` — auto-creating `preparation`/`application` sub-records on `apply`/`easy_apply`/prep-submitted, guarded on `!job.preparation`) into a pure `applyFieldUpdate(jobs, entity, idx, field, value)` reducer. This makes the data-loss-adjacent path testable.
- **Vitest** unit tests pointed at the branching logic that can actually break: `isFieldEditable` (editability/read-only policy), `normalizeSubmissionStatus`, and `applyFieldUpdate` (the auto-record side-effects). Plus one **smoke test** that the Phase-5 `sample-jobs.json` passes through the row builders without throwing (catches demo-data shape drift). No React rendering, no fixtures — fast.
- **CI:** add a `test` job to `build-tracker.yml` (gate `build` on it) running `npm test`; add a green badge to README.
- **Architecture write-up:** `docs/TRACKER.md` — GitHub-API-as-database, no-server SPA, SHA-based optimistic concurrency (the `409 → refetch sha → retry` path in `useTracker.js`), decision side-effects (auto-creating preparation/application records). Link from repo `docs/ARCHITECTURE.md`.

**Acceptance:**
- [ ] `npm test` runs Vitest green locally and in CI; badge in README.
- [ ] `docs/TRACKER.md` explains the interesting decisions; linked from `docs/ARCHITECTURE.md`.

---

## Alternative Approaches Considered

- **Rebuild table with TanStack Table** — rejected: weeks re-implementing sort/filter/pin/persistence AG Grid gives free; "configured a real grid" is a fine portfolio story.
- **AG Grid Enterprise (sidebar/tool panel/Excel export)** — rejected: license cost; Community + a small custom popover + CSV covers every requirement.
- **XLSX via SheetJS** — deferred: CSV opens in Excel/Sheets; add only on concrete need.
- **react-i18next from day one** — deferred: flat `t()` map suffices for app chrome; upgrade if interpolation/pluralization grows.
- **Custom design system** — rejected: MUI ThemeProvider + density gets "neat" without a restyle project.

## Acceptance Criteria (rollup)

### Functional
- [ ] Filter, quick-search, column show/hide/pin, CSV export on every sheet.
- [x] Light/dark/system theme + density, persisted; MUI + AG Grid switch together.
- [ ] EN/ID UI language, persisted; extensible to more locales.
- [ ] `?demo=1` runs read-only with bundled anonymized data, no PAT.

### Non-Functional
- [ ] No new runtime table dependency; `@mui/x-data-grid` removed.
- [ ] All persistence via `localStorage` (no backend); existing GitHub sync + SHA-conflict retry untouched.
- [ ] Demo data contains zero real PII (manually verified — trust boundary).
- [ ] Accessibility: theme contrast in both modes; controls keyboard-reachable.

### Quality Gates
- [ ] `npm run build` + `npm run lint` green.
- [ ] Vitest suite green in CI; badge in README.
- [ ] Live demo link works from README.

## Success Metrics
- Zero-setup demo: a visitor reaches a working grid in one click (no PAT).
- Table power-user tasks (find a company, hide noise columns, export) doable without leaving the app.
- Repo reads as a portfolio piece: clear README, live demo, tests, architecture doc.

## Dependencies & Risks
- **AG Grid v35 Theming API** for dark mode composes `colorSchemeDark`/`colorSchemeLight` parts — verify exact import names against installed `ag-grid-community@35` at implementation.
- **Pages must be enabled** in repo Settings (manual, one-time) for the live demo.
- **Demo-data leakage** is the one real risk — scrub and eyeball before commit.
- Column show/hide/pin popover uses **Community core APIs only** — confirm `setColumnsVisible`/`applyColumnState({pinned})` behave as expected on v35 (they are core, not Enterprise).

## Edge Cases (SpecFlow)
- Demo mode must bypass **both** `loadWorkbook` (no PAT prompt / no GitHub fetch) **and** `saveWorkbook` (top-level `if (DEMO) return`) — the "skip rows permanently deleted on save" confirm must never fire in demo. Also: no phantom `dirtyCount`, Logout hidden.
- Demo fetch uses `import.meta.env.BASE_URL` (served under `/career-ops/` with client routes — a bare relative path breaks).
- **Dark mode must restyle the hardcoded colors too** — `index.css` row tints (bg + `.row-skip`/`.row-rejected` text), `DropdownCellEditor` white bg, renderer link colors. Missing any = invisible/low-contrast cells.
- Theme first-load with no stored setting → follow `prefers-color-scheme`.
- Quick-search + column filters + `showHidden` toggle must compose (all client-side over the same row set).
- i18n missing-key → fall back to English string, never render the raw key.
- CSV export respects current filters/sort and read-only columns export as plain values.
- Extracting `rows.js` / `applyFieldUpdate` must not change runtime behavior — same output (covered by the new tests).

## References
### Internal
- Table + editability policy: `tracker/src/SheetDataGrid.jsx` (`isFieldEditable`, `rowClassRules`, `onGridReady`/`saveColState`)
- GitHub-as-backend + SHA conflict retry: `tracker/src/useTracker.js:52` (`pushJsonFile`, `409` retry)
- Schema / headers / dropdowns: `tracker/src/constants.js`
- Deploy: `.github/workflows/build-tracker.yml`, `tracker/vite.config.js`
- Repo architecture: `docs/ARCHITECTURE.md`
- Data contract (jobs.json is source of truth): `AGENTS.md` "Pipeline Integrity"
### External
- AG Grid Theming API (dark mode / `colorScheme*` parts) — verify against `ag-grid-community@35`
- AG Grid Community feature set (filters, quick filter, CSV export are free; tool panel / Set Filter / Excel export are Enterprise)
- Vitest docs (unit testing pure modules)
