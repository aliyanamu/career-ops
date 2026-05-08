# Zapier — Software Engineer, Release Engineering

**Job URL:** https://jobs.ashbyhq.com/zapier/6948a0e6-a580-4e9d-b109-20652d9a1507
**Posted:** 2026-04-27 (10 days fresh)
**Location:** India (Indonesia confirmed permitted; GMT+7 vs India team GMT+5:30 — 1.5h offset)
**AI tool policy:** Welcomed and encouraged ("transparent and responsible use")
**Level:** L3 or L4 — final leveling determined in interview

---

## Standard contact fields

- **Legal first name:** Hana
- **Legal last name:** Aliyah Mufidah  _(verify against gov ID)_
- **Preferred first name:** Hana
- **Preferred last name:** Aliyah
- **Email:** aliyanamu@gmail.com
- **Phone:** +62 858-1099-4772
- **LinkedIn:** https://linkedin.com/in/hana-aliyah-mufidah
- **City/Country:** Yogyakarta, Indonesia
- **Work auth:** "I am authorized to work in the country due to my nationality."
- **How did you hear:** Online Job Ad or Job Board
- **Specifics:** "Through my own job-search workflow that scans Ashby/Greenhouse/Lever boards. Zapier surfaced via the Ashby aggregator (jobs.ashbyhq.com/zapier)."

## Pre-screen toggles

- **CI/CD experience (Yes/No):** **Yes**
- **AI policy acknowledgement:** **Yes**
- **Zapier core values count:** **5**
  (Default to action; Default to transparency; Grow through feedback; Empathy over ego; Build the robot)

---

## Essay drafts

### AI-1: Pick one AI workflow you've built. Walk us through what triggers it, what it does, and what you had to iterate on.

I extended an open-source job-search CLI called career-ops (by Santiago Ferreira) into a private workflow that fits my specific search. The base tool handles JD evaluation, scoring, and tailored CV generation; what I built on top is a stateful tracking layer the original doesn't have.

**Trigger:** A scheduled scanner crawls Ashby / Greenhouse / Lever public APIs nightly, or I paste a JD URL directly. The pipeline fetches the JD, scores it against my profile (stack fit, work eligibility, timezone, comp band), runs a Playwright liveness check to filter dead postings, generates a tailored CV PDF, and writes a Markdown evaluation report.

**What I added:** The base tool is markdown-file-centric. I read and edit a spreadsheet daily, so I built a synchronisation layer: an openpyxl script writes evaluation results into an Excel tracker (Jobs, Preparations, Applications sheets), and a lightweight web editor (plain HTML + JS served from GitHub Pages) lets me update decisions without touching the CLI. Every save commits back to git so state is versioned and auditable.

**What I iterated on:**

1. **Source quality.** The initial setup trusted any aggregator. After two scan batches where most listings were 2+ years stale, I added a Playwright liveness check before ingesting and a rule to sample posting dates before bulk-adding. Disabled two aggregators outright.
2. **State sync conflicts.** The web editor and the CLI scanner both wrote to the same xlsx. Concurrent edits caused silent overwrites. I built a resolution protocol: snapshot dirty cells on save, reload the latest xlsx from git, re-anchor by `(Company, Role)` as the composite key, re-apply only the changed cells. Effectively a two-way merge.
3. **Status semantics.** A single "Apply" status conflated "I want to prep this" with "I already submitted." Split into `Apply` (creates a Preparations row for form-drafting) and `Easy Apply` (goes straight to Applications as submitted), gated by save-time confirmation dialogs so nothing is accidentally marked submitted.

### AI-2: Share a specific example where AI changed quality or stakeholder experience — not just speed — and explain what you did to get there.

At Nespay, when a customer raised a complaint about a failed transfer or a missing balance update, the ops team had to come to engineering first before they could say anything back. Not because they weren't capable — but because our logs were inconsistent across services: some used `console.log`, some structured JSON, some had no request context at all. Ops couldn't stitch together what actually happened to a transaction without an engineer doing it for them. Their first response to customers was always "let me check with the team," which eroded trust and slowed resolution.

I led a logging-enrichment project: standardise on **pino** across every Node.js service with a shared schema (request ID, user ID, trace ID, service name, event type), and route everything into **Grafana** instead of CloudWatch.

Where AI helped:

1. **Schema design.** I drafted the log-field convention with Claude — what fields are mandatory, which optional per service, what naming gives the best Grafana ergonomics. The model pushed back on a few choices ("don't make `userId` optional even on auth endpoints — you'll regret it") that I'd have gotten wrong, and the schema would have been inconsistent across services.

2. **Migration plan.** Each service had its own logging quirks. I asked Claude to walk through each service file and generate a per-service checklist (what to replace, what context fields to inject at which middleware layer). It caught edge cases I'd have missed — the queue-worker entry point had no HTTP middleware and needed a different injection pattern entirely.

The experience change wasn't speed. Ops already had access to Grafana and the backoffice dashboard — the problem was that the logs they could see were too inconsistent to be readable without an engineer interpreting them. Once every service emitted the same fields with a consistent transaction ID, ops could trace what actually happened to a complaint themselves and give customers a meaningful first response before ever reaching engineering. Escalations dropped to the cases that genuinely needed code context.

What I learned: AI was useful at two specific leverage points — getting the schema right upfront (a decision that would have been expensive to fix later) and not missing services during migration. I rewrote every log line myself, but the AI made sure the structure held across the whole codebase.

### AI-3: What's one way you've expanded your impact at work with AI — what problem were you trying to solve, why did you approach it that way, and how has your approach evolved?

The problem was that ad-hoc AI use was unreliable. I'd paste a problem, get an answer, move on — and the output quality varied widely. Sometimes it accelerated me; sometimes it confidently led me somewhere wrong. I had no systematic way to tell the difference before shipping, so I'd either over-trust it or distrust it entirely. Neither was useful.

What changed was adopting a structured development cycle: **brainstorm → plan → work → review → compound**. Each phase has a defined role for AI — not as an answer machine, but as a structured challenge.

- **Brainstorm:** Before writing any code, use AI to surface edge cases and alternatives I haven't considered — to widen the option space, not pick the solution.
- **Plan:** Draft the implementation plan, then ask AI to pressure-test it: "What would break this? What am I assuming?" Structural mismatches surface here, when they cost discussion rather than rewrite time.
- **Work:** Write the code. AI is a pair, not the author.
- **Review:** Use AI to interrogate my own thinking, not describe the code (more below).
- **Compound:** After finishing, note what was non-obvious — the constraint I nearly missed, the tradeoff I made and why. Builds a reference that makes future AI interactions more grounded.

The review phase is where I iterated most. My first instinct was to ask Claude to summarise the diff — what changed, what the risks were. It saved reading time, but occasionally the model mis-described code and I'd nearly comment on a wrong premise. A confident wrong summary is worse than no summary: it stops you reading carefully.

I switched from asking AI to *describe* the diff to asking it to *generate questions* — "What invariants might this break? What edge cases aren't covered?" Those questions held up even when the AI got specifics wrong, because I answered them by reading the code myself. The model gave me a checklist, not a verdict.

The approach I landed on: write my review comment first, then ask the model to push back as the PR author. It surfaces the weakest parts of my argument before the human author does. More than once I rewrote a comment after this step.

**The impact:** Rework rate dropped because structural problems surface in the plan phase rather than during review. My review comments became more specific. A few teammates picked up the rubber-duck approach. The compound step means non-obvious insights accumulate somewhere a teammate can use, rather than staying locked in my head.

The through-line across all of it: each phase needs a different kind of AI engagement. The mistake I started with was treating them the same — asking for outputs everywhere, when most phases needed challenges instead.

### CI/CD-1 (200-400w): 5+ yrs SWE incl. meaningful CI/CD work? Describe systems and ownership.

**Yes** — 6+ years total, with the most CI/CD-intensive ownership concentrated in the last 12 months at Nespay.

At **Nespay** (April 2025 – present), I own the deployment pipeline end-to-end. We run self-hosted GitHub Actions runners on EC2 to build and deploy a Node.js + Next.js stack. I made the call to self-host rather than use GitHub-hosted runners after we hit two friction points: (a) IAM-scoped tasks needing AWS credentials kept hitting GitHub-hosted runner network constraints, and (b) cold-start overhead on every job was costing minutes that mattered for the 10–15 deploys per day we were doing during product build-out. I provisioned the runner EC2 instances, wrote the IAM role binding, and built the workflow YAMLs (lint → typecheck → unit → build → staging → manual gate → production with rolling restart). Ownership is end-to-end including outage response when runners get stuck.

At **ION** (February 2020 – December 2024, ~5 years), the testing infrastructure was a major part of my work even though I didn't own deploy pipelines directly. I worked extensively with Nightwatch, Selenium, and Mocha test suites for a B2B work-management platform. I owned stabilizing flaky input-component tests across the application, debugged race conditions between filter state and async data loads, and contributed to team testing patterns through code review. I also built an HRIS sync integration that needed its own integration test harness — that taught me a lot about testing async data flows without making tests inherently flaky.

Earlier roles (Ultra Voucher, Sosial Bisnis Indonesia) are part of the 6+ year total but were lighter on dedicated CI/CD ownership — they were where I learned shipping discipline rather than where I built pipeline tooling.

### CI/CD-2 (200-400w): Describe a CI/CD pipeline / release system / internal tool you designed or significantly improved. Tradeoffs and measurable impact.

When I joined Nespay in April 2025, the team was deploying by SSH'ing into the EC2 instance and running `git pull && npm install && pm2 restart`. Fine at 1–2 deploys/week. As we ramped up wallet integrations and KYC providers we hit 10+ deploys/day, and the manual flow broke down: bad deploys took minutes to roll back, no record of what was deployed when, and people forgot to run migrations.

I designed a GitHub Actions pipeline running on **self-hosted EC2 runners**. The non-obvious tradeoff was self-hosted vs GitHub-hosted runners. GitHub-hosted is simpler and free for our org tier, but: (a) every cold start was paying a 30–60 second setup tax, and (b) the deploy step needs an IAM-bound role to push artifacts to S3 and update an EC2-hosted service. With GitHub-hosted runners we'd have to either embed long-lived AWS keys in GitHub secrets (security smell) or wire OIDC federation. I chose self-hosted runners on EC2 with an attached IAM role — the runner inherits AWS permissions naturally, no secrets in GitHub, and warm runners eliminated the cold-start penalty.

Pipeline structure: lint → typecheck → unit tests → build → deploy to staging → tag → automated smoke test → manual approval gate → production deploy with rolling restart. Migrations gated behind a separate `db:migrate` job that requires explicit approval.

Impact (best estimates from memory — happy to verify): deploy time dropped from a 5–10 minute manual procedure to ~3 minutes hands-off. Failed-deploy recovery went from "SSH and figure out what we broke" to "rollback by retag" in under 2 minutes. Most importantly, two teammates who had been deploy-shy started shipping their own changes. Bus factor went from 2 to 4 in the first month.

> **TODO:** verify the deploy time numbers if you have CloudWatch metrics.

### CI/CD-3 (200-400w): Describe a backend service or API you built from scratch. Key technical decisions and tradeoffs.

At Nespay I built the wallet-transactions backend service from the ground up. It's a Node.js (Nest.js) HTTP API that orchestrates user-facing wallet operations: deposits, withdrawals, internal transfers, and the on/off-ramp legs going through Xellar and Privy.

**Key decisions:**

1. **Sync at the API edge, async at the chain edge.** A user submitting a withdrawal expects an immediate response — request validation, balance check, KYC-tier gate, idempotency-key recording — all sync. The actual chain interaction (RPC call to fund the transaction) is async via a job queue. This decoupling let me handle RPC slowness and provider failover without holding HTTP connections open.

2. **Idempotency from day one.** Every state-changing endpoint takes an `Idempotency-Key`. The key is hashed with the request body and stored with the response. Replays return the cached response. This was non-negotiable: mobile clients retry aggressively on flaky networks, and double-charging a user is the worst possible bug.

3. **Provider failover, not provider redundancy.** I considered running every transaction through both Xellar and Privy in parallel for redundancy. Rejected because of cost and reconciliation complexity. The service has a primary provider per asset class and falls back to secondary on configurable error classes (5xx, timeout, rate-limit). The fallback path is logged as a structured event so finance can audit.

4. **Database choice.** PostgreSQL over Mongo (which other Nespay services use) specifically for the transaction ledger — I needed transactional guarantees and JOINs across user, wallet, and ledger tables. Running two databases is real maintenance overhead; I justified it in a one-pager arguing financial state needs ACID more than the rest of the platform does.

The biggest reliability win was idempotency. The biggest maintainability lesson: the second database was worth the operational overhead — anyone touching the ledger now has the right primitives to reason about correctness.

### CI/CD-4 (200-400w): Time you identified a systemic problem in how your team built/tested/shipped software. What you did and the measurable outcome.

At ION (the work-management platform), our input components — text fields, date pickers, multi-selects — were a source of bug churn far out of proportion to their complexity. Every sprint we'd ship a fix for one input and break another. The systemic problem: our inputs had inconsistent validation behavior, inconsistent disabled-state styling, and inconsistent `onChange` semantics (some emitted strings, some emitted events, some emitted both). Each new feature team patched around the inconsistency, compounding the problem.

I did three things:

1. **Audit.** I went through every input component in the app and catalogued the inconsistencies in a one-page doc — about 14 distinct patterns where two components disagreed on what should have been the same thing.

2. **Convergence plan.** I proposed a small, opinionated `<Input>` primitive that owned validation, disabled state, and `onChange` shape, plus migration steps for each existing component. Deliberately not a rewrite — incremental, with old and new components coexisting and call sites migrating one at a time.

3. **Migration runway.** I personally migrated the three highest-traffic call sites (employee time-off, praise/endorsement, and people-search filters), wrote a short migration guide, and reviewed migrations from teammates over the next few sprints.

**Measurable outcome:** input-related bug reports in the next two quarters dropped meaningfully (I'd estimate 50–70% based on what I remember from sprint-review notes — happy to verify if you want the actual count). More importantly, new feature teams stopped writing bespoke input components — they reached for the primitive. The systemic part wasn't the code; it was establishing that consistency in a foundational primitive was worth investing in over piecemeal fixes.

> **TODO:** if you have access to the ION bug tracker, pull the actual % drop.

### E2E pipeline troubleshooting: Describe a time you troubleshot a failing end-to-end test pipeline. Root cause, tools, resolution.

At ION, our Nightwatch end-to-end suite started flaking on a single test — the time-off bulk-approval flow — in roughly 30% of CI runs. Locally it always passed.

**Diagnostic steps:**

1. **Confirm it's not the code.** Reverted the suspected commit; flake persisted. Ruled out a real product bug.
2. **Local vs CI.** Ran the suite locally 50 times: 0 failures. Ran on CI 50 times: ~15 failures. Either CI environment differed, or timing was the issue.
3. **Read the failure mode.** Failures were always at the same step: clicking "Approve All" and then asserting rows had updated. The DOM assertion ran before all rows had re-rendered. But why only in CI?
4. **Instrument.** Added screenshot capture and `document.readyState` logging on the failing step. Saw that on CI runs, the page sometimes had a queued network request still in flight when the assertion ran. Nightwatch's `waitForElementVisible` wasn't waiting for the data to actually update — only for the row container to exist (which it always did, even with stale data).
5. **Root cause.** CI runners had higher network latency and ran tests against a shared backend, so the time-off-update API call took longer than locally. The test was *timing-coupled to the backend response* without an explicit wait for data state.
6. **Fix.** Replaced `waitForElementVisible` on the container with a polling assertion on the actual cell value (e.g., wait for the Status cell to read "Approved"). Also added a `data-test-id` attribute on the row's loading spinner so we could explicitly wait for it to disappear.

After the fix, the test passed 100/100 CI runs over the next two weeks. The broader lesson I pushed: every E2E test that asserts data should wait for the *data*, not the *layout*.

---

## Submission notes

- **AI disclaimer:** Not required (Zapier welcomes responsible AI use). Mention transparently in answers if useful, no scaffold-only constraint.
- **Tailored CV:** Generate a Release-Engineering-leaning version emphasizing GitHub Actions on EC2, AWS IAM roles, Nightwatch/Selenium E2E experience, AWS Cloud Practitioner cert. De-emphasize Web3 wallet specifics (this role is platform/release, not Web3).
- **Final review pass:** read every answer aloud once. Replace any vague metric I wrote with a real one if you have it.
