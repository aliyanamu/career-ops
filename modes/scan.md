# Mode: scan — Portal Scanner (Offer Discovery)

Scans the configured job portals, filters by title relevance, and adds new offers to the pipeline for later evaluation.

> **Note (v1.5+):** The default scanner (`scripts/scan.mjs` / `npm run scan`) is **zero-token** and only queries the public Greenhouse, Ashby, and Lever APIs directly. The Playwright/WebSearch levels described below are the **agent** flow (run by Claude/Codex), not what `scripts/scan.mjs` does. If a company has no Greenhouse/Ashby/Lever API, `scripts/scan.mjs` will skip it; for those cases, the agent should manually complete Level 1 (Playwright) or Level 3 (WebSearch).

## Recommended execution

Run as a subagent so it doesn't consume the main context:

```
Agent(
    subagent_type="general-purpose",
    prompt="[contents of this file + specific data]",
    run_in_background=True
)
```

## Configuration

Read `portals.yml`, which contains:
- `search_queries`: List of WebSearch queries with `site:` filters per portal (broad discovery)
- `tracked_companies`: Specific companies with `careers_url` for direct navigation
- `title_filter`: positive/negative/seniority_boost keywords for title filtering

## Discovery strategy (3 levels)

### Level 1 — Direct Playwright (PRIMARY)

**For each company in `tracked_companies`:** Navigate to its `careers_url` with Playwright (`browser_navigate` + `browser_snapshot`), read ALL visible job listings, and extract the title + URL of each one. This is the most reliable method because:
- It sees the page in real time (not cached Google results)
- It works with SPAs (Ashby, Lever, Workday)
- It detects new offers instantly
- It doesn't depend on Google indexing

**Every company MUST have a `careers_url` in portals.yml.** If it doesn't, look it up once, save it, and use it in future scans.

### Level 2 — ATS APIs / Feeds (COMPLEMENTARY)

For companies with a public API or structured feed, use the JSON/XML response as a fast complement to Level 1. It's faster than Playwright and reduces visual scraping errors.

**Current support (variables between `{}`):**
- **Greenhouse**: `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`
- **Ashby**: `https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams`
- **BambooHR**: list `https://{company}.bamboohr.com/careers/list`; detail of a single offer `https://{company}.bamboohr.com/careers/{id}/detail`
- **Lever**: `https://api.lever.co/v0/postings/{company}?mode=json`
- **Teamtailor**: `https://{company}.teamtailor.com/jobs.rss`
- **Workday**: `https://{company}.{shard}.myworkdayjobs.com/wday/cxs/{company}/{site}/jobs`

**Parsing convention per provider:**
- `greenhouse`: `jobs[]` → `title`, `absolute_url`
- `ashby`: GraphQL `ApiJobBoardWithTeams` with `organizationHostedJobsPageName={company}` → `jobBoard.jobPostings[]` (`title`, `id`; build the public URL if it isn't in the payload)
- `bamboohr`: list `result[]` → `jobOpeningName`, `id`; build the detail URL `https://{company}.bamboohr.com/careers/{id}/detail`; to read the full JD, GET the detail and use `result.jobOpening` (`jobOpeningName`, `description`, `datePosted`, `minimumExperience`, `compensation`, `jobOpeningShareUrl`)
- `lever`: root array `[]` → `text`, `hostedUrl` (fallback: `applyUrl`)
- `teamtailor`: RSS items → `title`, `link`
- `workday`: `jobPostings[]`/`jobPostings` (depending on tenant) → `title`, `externalPath` or a URL built from the host

### Level 3 — WebSearch queries (BROAD DISCOVERY)

The `search_queries` with `site:` filters cover portals across the board (all of Ashby, all of Greenhouse, etc.). Useful for discovering NEW companies not yet in `tracked_companies`, but the results may be stale.

**Execution priority:**
1. Level 1: Playwright → all `tracked_companies` with a `careers_url`
2. Level 2: API → all `tracked_companies` with an `api:`
3. Level 3: WebSearch → all `search_queries` with `enabled: true`

The levels are additive: they all run, and the results are merged and deduplicated.

## Workflow

1. **Read configuration**: `portals.yml`
2. **Read history**: `data/scan-history.tsv` → URLs already seen
3. **Read dedup sources**: `data/applications.md` + `data/pipeline.md` + `data/jobs.json`

4. **Level 1 — Playwright scan** (parallel in batches of 3-5):
   For each company in `tracked_companies` with `enabled: true` and a defined `careers_url`:
   a. `browser_navigate` to the `careers_url`
   b. `browser_snapshot` to read all job listings
   c. If the page has filters/departments, navigate the relevant sections
   d. For each job listing extract: `{title, url, company}`
   e. If the page paginates results, navigate additional pages
   f. Accumulate into the candidate list
   g. If `careers_url` fails (404, redirect), try `scan_query` as a fallback and note it to update the URL

5. **Level 2 — ATS APIs / feeds** (parallel):
   For each company in `tracked_companies` with a defined `api:` and `enabled: true`:
   a. WebFetch the API/feed URL
   b. If `api_provider` is defined, use its parser; if not defined, infer it from the domain (`boards-api.greenhouse.io`, `jobs.ashbyhq.com`, `api.lever.co`, `*.bamboohr.com`, `*.teamtailor.com`, `*.myworkdayjobs.com`)
   c. For **Ashby**, send a POST with:
      - `operationName: ApiJobBoardWithTeams`
      - `variables.organizationHostedJobsPageName: {company}`
      - GraphQL query for `jobBoardWithTeams` + `jobPostings { id title locationName employmentType compensationTierSummary }`
   d. For **BambooHR**, the list only carries basic metadata. For each relevant item, read `id`, GET `https://{company}.bamboohr.com/careers/{id}/detail`, and extract the full JD from `result.jobOpening`. Use `jobOpeningShareUrl` as the public URL if present; if not, use the detail URL.
   e. For **Workday**, send a JSON POST with at least `{"appliedFacets":{},"limit":20,"offset":0,"searchText":""}` and paginate by `offset` until results are exhausted
   f. For each job extract and normalize: `{title, url, company}`
   g. Accumulate into the candidate list (dedup with Level 1)

6. **Level 3 — WebSearch queries** (parallel if possible):
   For each query in `search_queries` with `enabled: true`:
   a. Run WebSearch with the defined `query`
   b. From each result extract: `{title, url, company}`
      - **title**: from the result title (before the " @ " or " | ")
      - **url**: the result URL
      - **company**: after the " @ " in the title, or extract it from the domain/path
   c. Accumulate into the candidate list (dedup with Level 1+2)

6. **Filter by title** using `title_filter` from `portals.yml`:
   - At least 1 keyword from `positive` must appear in the title (case-insensitive)
   - 0 keywords from `negative` may appear
   - `seniority_boost` keywords give priority but are not required

7. **Deduplicate** against 4 sources:
   - `scan-history.tsv` → exact URL already seen
   - `applications.md` → company + normalized role already evaluated
   - `pipeline.md` → exact URL already pending or processed
   - `data/jobs.json` → URLs already tracked

7.5. **Verify liveness of WebSearch (Level 3) results** — BEFORE adding to the pipeline:

   WebSearch results can be stale (Google caches results for weeks or months). To avoid evaluating expired offers, verify each new URL from Level 3 with Playwright. Levels 1 and 2 are inherently real-time and don't need this verification.

   For each new Level 3 URL (sequential — NEVER run Playwright in parallel):
   a. `browser_navigate` to the URL
   b. `browser_snapshot` to read the content
   c. Classify:
      - **Active**: job title visible + role description + a visible Apply/Submit/Solicitar control inside the main content. Don't count generic header/navbar/footer text.
      - **Expired** (any of these signals):
        - Final URL contains `?error=true` (Greenhouse redirects like this when the offer is closed)
        - Page contains: "job no longer available" / "no longer open" / "position has been filled" / "this job has expired" / "page not found"
        - Only navbar and footer visible, no JD content (content < ~300 chars)
   d. If expired: log it in `scan-history.tsv` with status `skipped_expired` and discard it
   e. If active: continue to step 8

   **Don't halt the entire scan if one URL fails.** If `browser_navigate` errors out (timeout, 403, etc.), mark it as `skipped_expired` and continue with the next one.

8. **For each new verified offer that passes the filters**:
   a. Append to the `pipeline.md` "Pending" section (a greppable log): `- [ ] {url} | {company} | {title}`
   b. Also append the same new offer to `data/jobs.json` (the tracker source of truth) as an unevaluated lead: `fitScore: ""`, `decision: "pending"`, deduped by URL
   c. Log it in `scan-history.tsv`: `{url}\t{date}\t{query_name}\t{title}\t{company}\tadded`

9. **Offers filtered out by title**: log in `scan-history.tsv` with status `skipped_title`
10. **Duplicate offers**: log with status `skipped_dup`
11. **Expired offers (Level 3)**: log with status `skipped_expired`

## Extracting title and company from WebSearch results

WebSearch results come in the format: `"Job Title @ Company"` or `"Job Title | Company"` or `"Job Title — Company"`.

Extraction patterns per portal:
- **Ashby**: `"Senior AI PM (Remote) @ EverAI"` → title: `Senior AI PM`, company: `EverAI`
- **Greenhouse**: `"AI Engineer at Anthropic"` → title: `AI Engineer`, company: `Anthropic`
- **Lever**: `"Product Manager - AI @ Temporal"` → title: `Product Manager - AI`, company: `Temporal`

Generic regex: `(.+?)(?:\s*[@|—–-]\s*|\s+at\s+)(.+?)$`

## Private URLs

If you find a URL that isn't publicly accessible:
1. Save the JD in `jds/{company}-{role-slug}.md`
2. Add it to pipeline.md as: `- [ ] local:jds/{company}-{role-slug}.md | {company} | {title}`

## Scan History

`data/scan-history.tsv` tracks ALL seen URLs:

```
url	first_seen	portal	title	company	status
https://...	2026-02-10	Ashby — AI PM	PM AI	Acme	added
https://...	2026-02-10	Greenhouse — SA	Junior Dev	BigCo	skipped_title
https://...	2026-02-10	Ashby — AI PM	SA AI	OldCo	skipped_dup
https://...	2026-02-10	WebSearch — AI PM	PM AI	ClosedCo	skipped_expired
```

## Output summary

```
Portal Scan — {YYYY-MM-DD}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Queries run: N
Offers found: N total
Filtered by title: N relevant
Duplicates: N (already evaluated or in pipeline)
Expired discarded: N (dead links, Level 3)
New added to pipeline.md: N

  + {company} | {title} | {query_name}
  ...

→ Run /career-ops pipeline to evaluate the new offers.
```

## Managing careers_url

Every company in `tracked_companies` should have a `careers_url`, the direct URL to its jobs page. This avoids looking it up every time.

**RULE: Always use the company's corporate URL; fall back to the ATS endpoint only if the company has no corporate page of its own.**

The `careers_url` should point to the company's own jobs page whenever it's available. Many companies use Workday, Greenhouse, or Lever under the hood but only expose the job IDs through their corporate domain. Using the direct ATS URL when a corporate page exists can cause false 410 errors because the job IDs don't match.

| ✅ Correct (corporate) | ❌ Wrong as first choice (direct ATS) |
|---|---|
| `https://careers.mastercard.com` | `https://mastercard.wd1.myworkdayjobs.com` |
| `https://openai.com/careers` | `https://job-boards.greenhouse.io/openai` |
| `https://stripe.com/jobs` | `https://jobs.lever.co/stripe` |

Fallback: if you only have the direct ATS URL, first navigate to the company's website and locate its corporate jobs page. Use the direct ATS URL only if the company has no corporate page of its own.

**Known patterns per platform:**
- **Ashby:** `https://jobs.ashbyhq.com/{slug}`
- **Greenhouse:** `https://job-boards.greenhouse.io/{slug}` or `https://job-boards.eu.greenhouse.io/{slug}`
- **Lever:** `https://jobs.lever.co/{slug}`
- **BambooHR:** list `https://{company}.bamboohr.com/careers/list`; detail `https://{company}.bamboohr.com/careers/{id}/detail`
- **Teamtailor:** `https://{company}.teamtailor.com/jobs`
- **Workday:** `https://{company}.{shard}.myworkdayjobs.com/{site}`
- **Custom:** The company's own URL (e.g., `https://openai.com/careers`)

**API/feed patterns per platform:**
- **Ashby API:** `https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams`
- **BambooHR API:** list `https://{company}.bamboohr.com/careers/list`; detail `https://{company}.bamboohr.com/careers/{id}/detail` (`result.jobOpening`)
- **Lever API:** `https://api.lever.co/v0/postings/{company}?mode=json`
- **Teamtailor RSS:** `https://{company}.teamtailor.com/jobs.rss`
- **Workday API:** `https://{company}.{shard}.myworkdayjobs.com/wday/cxs/{company}/{site}/jobs`

**If `careers_url` doesn't exist** for a company:
1. Try the pattern for its known platform
2. If that fails, do a quick WebSearch: `"{company}" careers jobs`
3. Navigate with Playwright to confirm it works
4. **Save the found URL in portals.yml** for future scans

**If `careers_url` returns a 404 or redirect:**
1. Note it in the output summary
2. Try scan_query as a fallback
3. Flag it for manual update

## Maintaining portals.yml

- **ALWAYS save `careers_url`** when adding a new company
- Add new queries as you discover interesting portals or roles
- Disable queries with `enabled: false` if they generate too much noise
- Adjust the filtering keywords as the target roles evolve
- Add companies to `tracked_companies` when you want to follow them closely
- Verify `careers_url` periodically, since companies change ATS platform
