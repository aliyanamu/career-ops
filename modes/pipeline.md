# Mode: pipeline — Evaluate pending leads

Scores the unevaluated leads that `scripts/scan.mjs` auto-imported into the tracker. Run `/career-ops pipeline` to process them all.

## Where the pending leads live

**Source of truth: `data/jobs.json`.** Scan appends new roles here as unevaluated leads — identified by `fitScore: ""` **and** `decision: "pending"`, with `preparation`/`application` still `null`. Those are your queue.

`data/pipeline.md` is now just a greppable log of what scan found; it is NOT the work queue. Don't drive evaluation off it — drive it off the pending leads in `jobs.json`. (URLs a user pasted by hand still work too: add them to `jobs.json` as a pending lead, or evaluate directly.)

## Workflow

1. **Read** `data/jobs.json` → collect jobs where `fitScore === ""` and `decision === "pending"`.
2. **For each pending lead** (match the existing job by `url` — never create a second row):
   a. Compute the next sequential `REPORT_NUM` (read `reports/`, take highest prefix + 1).
   b. **Extract the JD** via Playwright (`browser_navigate` + `browser_snapshot`) → WebFetch → WebSearch.
   c. If the URL is dead/inaccessible → set `decision: "skip"` with a note in `notes` and continue.
   d. **Run the full auto-pipeline**: A–F evaluation → report `.md` → PDF (if score ≥ 3.0).
   e. **Update the SAME job in `jobs.json` in place**: set `fitScore`, `decision`, `report` (path), `appNum` (next integer), and `notes`. Set the `application` sub-object only once actually applied.
3. **If 3+ leads are pending**, launch parallel agents (Agent tool with `run_in_background`) to evaluate concurrently. Each agent edits its own job by URL — no shared-row collisions.
4. **When done**, run `node scripts/gen-applications-md.mjs` to refresh `applications.md`, then show a summary table:

```
| # | Company | Role | Score | PDF | Recommended action |
```

## Smart JD detection from a URL

1. **Playwright (preferred):** `browser_navigate` + `browser_snapshot`. Works with SPAs.
2. **WebFetch (fallback):** Static pages, or when Playwright isn't available.
3. **WebSearch (last resort):** Secondary portals that index the JD.

**Special cases:**
- **LinkedIn:** may require login → set `decision: "skip"` with a note and ask the user to paste the text.
- **PDF:** if the URL points to a PDF, read it directly with the Read tool.
- **`local:` prefix:** read the local file. Example: `local:jds/linkedin-pm-ai.md` → read `jds/linkedin-pm-ai.md`.

## Automatic numbering

- **Report number** (`REPORT_NUM`, the `reports/{NNN}-...` prefix): list `reports/`, extract each prefix (e.g. `142-medispend...` → 142), new number = max + 1.
- **`appNum`** (tracker number in `jobs.json`): separate sequence — next integer above the current max `appNum`.

## Source sync

Before processing, verify setup sync:
```bash
node scripts/cv-sync-check.mjs
```
If out of sync, warn the user before continuing.
