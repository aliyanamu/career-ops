# Mode: cover — Tailored Cover Letter

Drafts a cover letter for a specific role, grounded in the candidate's real evidence. Markdown only — no PDF render (portals paste plain text). Regeneration is an **agent action**: there is no tracker button. To (re)generate, ask the agent (or re-run the loop) for any role with an empty `coverLetterPath`.

## Inputs (sources of truth — never invent)

1. `cv.md` — canonical CV. Pull real roles, metrics, scope.
2. `article-digest.md` — compact proof points (if present). **NEVER hardcode metrics; read them here.**
3. The role's evaluation report `reports/{num}-{company-slug}-{YYYY-MM-DD}.md` — archetype fit, matched strengths, gaps, the "why this role" angle. **Required.** If the role has no report yet, evaluate it first (`oferta` / `auto-pipeline`), then draft.
4. `modes/_profile.md` — targeting narrative, superpower, framing. This is the user-layer voice; follow it.
5. The JD (from context, the report, or the URL).

## Pipeline

1. Read the eval report → extract the 2-3 strongest matched strengths and the role's core need.
2. Read `cv.md` + `article-digest.md` → pick the real proof points that back those strengths (specific builds, outcomes).
3. Detect JD language → write in that language (English default). Detect company → align to its known values only when real (e.g. Remote.com: Care / Innovation / Intensity / Excellence — see memory `remotecom-values`).
4. Draft 3-4 short paragraphs:
   - **Open** — the role + one sentence on why this candidate fits *this* need (no generic "I am excited to apply").
   - **Proof** — 1-2 concrete builds from cv.md/digest that map to the JD's top requirement. Show, don't claim.
   - **Angle** — the unique fit from `_profile.md` (the superpower / narrative bridge).
   - **Close** — brief, direct, forward.
5. Write to `output/cover-letters/{company-slug}-{role-slug}.md` (create the dir; `output/` is gitignored).
6. If the role is tracked, set `preparation.coverLetterPath` to that path in `data/jobs.json` and run `node scripts/gen-applications-md.mjs`. On submit, the tracker carries it into `application.coverLetter` automatically.

## Hard rules (memory-backed)

- **No dashes, natural voice.** No `—` or ` - ` connectors, no AI-tell phrasing ("delve", "moreover", "I am thrilled"). Write how Hana actually writes. See memory `no-dashes-natural-voice`.
- **No fabricated claims.** Never state the candidate is learning/ramping a tech she hasn't said she is. Never invent metrics, titles, or outcomes. Only reframe real experience in the JD's vocabulary. See `no-fabricated-learning-claims`.
- **Grounded in the report.** Every strength claimed must trace to cv.md, article-digest.md, or the eval report.
- **Short.** One page, ~200-300 words. Recruiters skim.
- **No Upwork framing.** Use the company's real careers/ATS context, never a marketplace angle. See `no-upwork-in-repo`.

## Post-generation

Report: the file path, word count, and the 2-3 proof points used (so the user can sanity-check the grounding).
