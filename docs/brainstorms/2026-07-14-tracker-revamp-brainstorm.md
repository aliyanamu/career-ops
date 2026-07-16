# Tracker Dashboard Revamp — Brainstorm

**Date:** 2026-07-14
**Topic:** Revamp the React web tracker (`tracker/`) — better table UX, theming, i18n, export, and make it portfolio-worthy
**Status:** Ready for planning

## What We're Building

A polish-and-extend pass on the existing `tracker/` SPA (React 19 + Vite + MUI + AG Grid, GitHub API as backend). Keep all current functionality; add the interaction and personalization features the current UI lacks, and package the repo so it reads as a portfolio piece.

Concretely:
1. **Table UX** — enable AG Grid features already available but switched off: column filters + floating filters, a quick-search box, and column menu (pin / hide / reorder). Add a CSV export button.
2. **Personalization / Settings** — a Settings drawer with light/dark theme, language (EN/ID), and grid density. All persisted to `localStorage`.
3. **Visual polish** — MUI `ThemeProvider` with light/dark tokens, matching AG Grid `themeQuartz` light+dark variants, tighter/consistent spacing, aligned toolbar.
4. **Demo mode** — `?demo=1` loads a bundled anonymized `sample-jobs.json`, disables Save, shows a Demo banner. Lets anyone try it with zero PAT setup.
5. **Portfolio packaging** — README (problem → architecture → demo) + screenshots/GIF, live deploy (GitHub Pages or Vercel), a few Vitest tests on the data-transform logic + CI badge, and a short `docs/architecture.md`.

## Why This Approach

**Reframe:** the tracker already runs on **AG Grid Community**, which natively does filter, search, column show/hide, pinning, reorder, and CSV export — most asks are configuration, not new code. So the lazy, correct path is *enhance*, not *rebuild*. (TanStack rebuild was considered and rejected: weeks of re-implementing what AG Grid gives free; "configured a real grid" is a fine portfolio story.)

- **No new table dep**, and `@mui/x-data-grid` (installed but unused) gets **deleted** — net dependency reduction.
- **CSV via built-in** `gridApi.exportDataAsCsv()` — no SheetJS. XLSX deferred (YAGNI; CSV opens in Excel/Sheets).
- **Settings in localStorage** — no backend, consistent with the current no-server design. Database explicitly out of scope for now.
- **Demo mode** is the highest-leverage portfolio move: a recruiter clicks a link and sees it work instead of a PAT prompt.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Table strategy | Enhance AG Grid | Features already present; least code, no risk |
| Remove dead dep | Delete `@mui/x-data-grid` | Unused; smaller surface |
| Export | CSV only (built-in) | Free, covers ~95%; XLSX deferred |
| Theme | MUI ThemeProvider + AG Grid dark variant | Light/dark, persisted |
| i18n | UI strings, EN + ID | Smallest real i18n; data untouched; more langs later |
| Settings storage | localStorage | No backend, matches current design |
| Demo mode | Yes, `?demo=1` + bundled mock data | Zero-setup live demo for portfolio |
| Portfolio depth | README + demo + deploy + tests/CI + architecture doc | All four selected |
| Cache / DB | Out of scope | User deferred; loads fresh from GitHub today |

## Scope Boundaries (out for now)

- Real database / caching layer — deferred to a future iteration.
- XLSX export — CSV only until a concrete need appears.
- Languages beyond EN/ID — structure i18n so JA/KO/ZH can be added later without rework.
- Server-side anything — stays a client-only SPA against the GitHub API.

## Resolved Questions

- **Replace the table?** No — enhance AG Grid.
- **XLSX needed?** No — CSV only.
- **Which languages?** EN + ID (extensible).
- **Demo without PAT?** Yes — bundled mock data + read-only demo mode.
- **Visual direction?** Polish current MUI (ThemeProvider + density + Settings), not a custom design system.
- **Portfolio depth?** All of: README+screenshots+live demo, deploy, tests+CI, architecture write-up.

## Open Questions

None — all decisions resolved. Ready for `/workflows:plan`.

## Suggested Build Order (for planning)

1. Enable AG Grid filter/search/column-menu + CSV export button (1 file, no deps).
2. Delete `@mui/x-data-grid`.
3. MUI ThemeProvider + AG Grid dark theme + Settings drawer (theme/density) with localStorage.
4. i18n (EN/ID) via a small `t()` map or react-i18next; wire language picker into Settings.
5. Demo mode (`?demo=1`, bundled `sample-jobs.json`, disable Save, banner).
6. Deploy (GitHub Pages/Vercel) + README + screenshots.
7. Vitest tests on row builders / status derivation + CI badge; `docs/architecture.md`.
