@AGENTS.md

<!-- Claude Code specific notes for this user's setup. Read AGENTS.md first. -->

## What we built together (workflow history)

The user runs **two coexisting trackers** on top of what this repo ships:

1. **The repo's built-in artifacts** (from `santifer/career-ops`): `cv.md`, `config/profile.yml`, `modes/_profile.md`, `data/applications.md`, `data/pipeline.md`, `reports/`, `output/`. These work as the upstream system intends — markdown + yml as source of truth.
2. **`Job_Hunting_Progress.xlsx`** — the user's own spreadsheet, kept alongside the repo files (now committed inside the repo as the single source of truth, symlinked path removed). It existed before we connected career-ops, and the user wants to keep using it in addition to the markdown trackers, not instead of them. Treat it as a mandatory output, not optional.

**Why both:** the user reads/edits the xlsx daily (Wishlist, Preparations, Applications, Dashboard sheets); the markdown tracker is what career-ops scripts (`merge-tracker.mjs`, `dedup-tracker.mjs`, `verify-pipeline.mjs`) operate on. Every auto-pipeline run must update **both**.

### Custom `Preparations` sheet (we added this)

We extended the xlsx with a new `Preparations` sheet because the user needs a per-application prep workspace that the upstream system doesn't provide. Columns:

`#`, `Date`, `Company`, `Role`, `Job URL`, `Tailored CV Path`, `Tailored CV Status`, `Q1: Why this role?`, `Q2: Why this company?`, `Q3: Relevant experience`, `Q4: Why a good fit?`, `Q5: How did you hear?`, `Other custom Qs`, `Video required?`, `Video script notes`, `Video status`, `AI disclaimer?`, `Submission status`, `Notes`.

Header style: solid fill `#1F4E78`, white bold, centered, wrap. Body: top-aligned, wrap. Frozen at `C2`. When adding rows, mirror this styling.

### Sessions so far

- **2026-05-06** — Evaluated two Tether roles (Backend Wallets, Senior Frontend KYC). Both flagged with the "no AI tools" application disclaimer. Both committed to `reports/001-tether-2026-05-06.md` and `reports/002-tether-2026-05-06.md`. Tailored CVs in `output/`. Tracker rows in both `data/applications.md` and the `Preparations` sheet.
- Set up the private fork `aliyanamu/career-ops`, rewired remotes, committed `Job_Hunting_Progress.xlsx` into the repo, added this CLAUDE.md.

## Repo state

- This is a private fork of `santifer/career-ops` owned by `aliyanamu`.
- `origin` → `aliyanamu/career-ops` (private, push here)
- `upstream` → `santifer/career-ops` (pull updates from here, never push)
- Default branch: `main`. Local `main` tracks `origin/main`.

## Personal data layout

The user has completed onboarding. These files exist and are gitignored — do NOT recreate or overwrite without asking:

- `cv.md` — canonical CV
- `config/profile.yml` — name, email, target roles, archetypes, timezone rules
- `modes/_profile.md` — user customizations (copied from template)
- `data/applications.md` — application tracker (markdown)
- `Job_Hunting_Progress.xlsx` — **the user's primary tracker** (committed to repo, single source of truth)

`Job_Hunting_Progress.xlsx` lives in the repo root. Sheets: `CV Summary`, `Dashboard`, `Wishlist`, `Preparations`, `Applications`, `Companies`, `Status Legend`. The `Preparations` sheet is custom: Tailored CV path, form-question drafts (Q1–Q5), Other custom Qs, Video plan, AI-disclaimer flag, Submission status. After every auto-pipeline run, update both `data/applications.md` AND the `Preparations` sheet.

## User preferences (also in Claude Code memory)

- **One JD at a time.** Do not suggest `/career-ops pipeline` batch runs or seeding `data/pipeline.md` with multiple URLs. The user is still building their fit-signal example set.
- **"No AI tools" disclaimer → no auto-pipeline.** If a JD or company (e.g. Tether) bans AI tools in applications, run the evaluation report and tailored CV but flag form-answer drafts as scaffolds only — the user must rewrite from memory in their own voice. Do not draft a video script verbatim; give bullet points.
- **Mid–Senior IC roles only.** Skip Staff / Principal / Distinguished titles unless the user explicitly asks.
- **Timezone gate:** GMT+2 to GMT+12 only. Reject US, Canada, LATAM, UK, Ireland, Portugal, Israel.
- **Hard skill exclusions:** Skip roles requiring Rust or Go. OK if listed as "preferred / nice-to-have".
- **Email split:** `aliyanamu@gmail.com` on CV and applications. `mufidah.hanaaliyah@gmail.com` is Claude-account only — never on CV.

## Auto-pipeline behavior for this user

When the user pastes a JD URL:

1. Fetch the JD (curl + python regex strip works for Recruitee SPAs; Playwright as fallback).
2. Run blocks A–G. Save report to `reports/{NNN}-{slug}-{YYYY-MM-DD}.md`.
3. Generate tailored CV PDF to `output/cv-hana-aliyah-mufidah-{slug}-{YYYY-MM-DD}.pdf` (A4, `cv.output_format: html` in profile.yml).
4. Update `data/applications.md` directly (not via TSV merge — `merge-tracker.mjs` mishandles `%` and em-dashes in role titles).
5. Update the `Preparations` sheet in `Job_Hunting_Progress.xlsx` via `openpyxl` — add a new row, fill all columns including AI-disclaimer flag.
6. If JD bans AI tools: include block H drafts in the report under a clear "scaffold only" warning. Do NOT add them verbatim to the Preparations sheet form-answer columns; instead write a one-line "Rewrite in own voice — see report H" note.

## Conventions specific to this repo

- Reports start at `001`; check the highest existing number before writing a new one.
- Slugs: lowercase, hyphenated company name. For multiple roles at the same company in one day, append a role qualifier (e.g. `tether-fe-kyc`).
- The `Preparations` sheet's row 1 column headers are styled (dark blue header, white bold). When adding rows via openpyxl, set `Alignment(vertical="top", wrap_text=True)` on every cell so the layout stays readable.
- `cv-template.html` references `./fonts/...` relative paths. When generating ad-hoc HTML for a tailored CV, use absolute paths to `/Users/hana/Documents/personal/career-ops/fonts/` so Playwright can resolve them.
