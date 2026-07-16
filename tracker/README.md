# Career Ops Tracker

[![Build & deploy tracker](https://github.com/aliyanamu/career-ops/actions/workflows/build-tracker.yml/badge.svg)](https://github.com/aliyanamu/career-ops/actions/workflows/build-tracker.yml)

A spreadsheet-style dashboard for a job-search pipeline — jobs, preparations, applications, and companies — that runs entirely in the browser with **no backend**. GitHub is the database: the app reads and writes `data/jobs.json` and `data/companies.json` in this repo directly through the GitHub Contents API using a personal access token you store locally.

**[▶ Live demo](https://aliyanamu.github.io/career-ops/?demo=1)** — loads bundled sample data, no token, read-only.

## Why it's interesting

- **No server, no hosting bill.** The SPA is served from GitHub Pages and talks to the GitHub API for persistence. The "backend" is a JSON file in the repo.
- **Optimistic concurrency done right.** Writes carry the file's SHA; a `409` (the file changed under us) triggers a fresh-SHA fetch and one retry, so a scan or a script committing between load and save doesn't clobber data.
- **One nested model, four flat views.** `jobs.json` holds jobs with embedded `company`, `preparation`, and `application` sub-objects. The grid flattens them into per-tab rows and folds edits back into the nested shape.
- **Decision side-effects.** Setting a job's decision to `apply` auto-creates a preparation record; `easy_apply`, or submitting a preparation, auto-creates an application. The pipeline advances itself.

## Features

- **AG Grid Community** table per tab: sort, resize, reorder, per-column filters, floating filter row, quick search, column show/hide + pin, CSV export. Column layout persists to `localStorage`.
- **Editability policy** — identity and provenance columns (`url`, `company`, `role`, `dateAdded`, mirrored `jobUrl`) are locked and marked with a 🔒 header so hand-edits can't detach a job from its scanned identity.
- **Theming** — light / dark / system (follows OS), plus comfortable / compact density. MUI chrome and the AG Grid grid switch together; persisted.
- **i18n** — English and Bahasa Indonesia for the app chrome, extensible to more locales by dropping in a JSON file.
- **Demo mode** (`?demo=1`) — bundled fictional sample data, no token prompt, no GitHub calls, read-only.

## Screenshots

<!-- Capture with `npm run dev` + `?demo=1`, save to ../docs/assets/, then uncomment:
| Light | Dark |
|-------|------|
| ![Light theme](../docs/assets/tracker-light.png) | ![Dark theme](../docs/assets/tracker-dark.png) |
-->

_To add: light theme, dark theme, and filtering/column-control views (drop PNGs in `docs/assets/`)._

## Local development

```bash
cd tracker
npm install
npm run dev        # open the printed URL; append ?demo=1 for no-token demo data
```

Working against the real data needs a GitHub personal access token with repo read/write scope (prompted on first load, stored in `localStorage`). The demo needs nothing.

```bash
npm test           # vitest unit tests (row/editability/update-reducer logic)
npm run build      # production build to dist/ (deployed to Pages by CI)
npm run lint
```

## Architecture

See **[`docs/TRACKER.md`](../docs/TRACKER.md)** for the GitHub-as-database design, SHA-based optimistic concurrency, and the decision side-effects. Repo-wide architecture is in [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).

## Deploy

`.github/workflows/build-tracker.yml` runs the tests, builds, and deploys `dist/` to GitHub Pages on every push to `main` that touches `tracker/`. One-time setup: repo **Settings → Pages → Source = GitHub Actions**.

## Stack

React 19 · Vite · MUI · AG Grid Community · React Router · Vitest. Data contract and pipeline rules live in the repo root (`AGENTS.md`, `DATA_CONTRACT.md`).
