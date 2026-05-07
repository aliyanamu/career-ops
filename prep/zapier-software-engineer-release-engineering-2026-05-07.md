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

I built a private "career-ops" workflow on top of Claude Code that turns a job-listing URL into a complete evaluated application packet. Trigger: I paste a JD URL, or a scheduled scan crawls Ashby / Greenhouse / Lever public APIs. The workflow fetches the JD, scores it against my profile (stack, level, work-eligibility, timezone, comp band), generates a tailored CV PDF via a Playwright HTML→PDF pipeline, and writes a Markdown evaluation report. State lives in a single Excel tracker the agent reads and writes — Wishlist, Preparations, Applications — backed by a private GitHub repo for reproducibility.

What I iterated on:

1. **Source quality.** First version trusted any aggregator. After two batches where 8 of 10 listings were 2+ years old, I added a Playwright liveness check and a "sample posting dates before bulk-add" rule. Disabled two stale aggregators outright.
2. **State sync.** The web editor wrote to xlsx; the scanner wrote to a separate markdown inbox. Drift accumulated. Fixed by making xlsx authoritative and adding a 409 conflict auto-rebase: snapshot dirty cells, reload latest, re-anchor by `Company + Role`, retry save.
3. **Status semantics.** A single "Apply" status conflated "I want to prep this" with "I already easy-applied." Split into `1. Apply` (propagates to a Preparations row) and `2. Easy Apply` (propagates directly to Applications, status=Applied). Both gated by save-time confirm dialogs.

Happy to share the repo on request — it's private but I can grant view access.

### AI-2: Share a specific example where AI changed quality or stakeholder experience — not just speed — and explain what you did to get there.

At Nespay, the most-asked operational question from finance was *"why did this user's payout fail?"* The legacy answer was "let me grep CloudWatch for the last hour and stitch the timeline." Slow, error-prone, and the on-call engineer became a permanent bottleneck.

I asked Claude to help me sketch a transaction post-mortem tool: given a transaction ID, scan the relevant log streams, line up Sumsub KYC events, RPC call attempts, and the final wallet provider response. The first AI draft was a single shell script — fragile and impossible to share. I iterated with the model on three rounds:

1. Move the join logic into a Node service so it could be re-run idempotently.
2. Emit a structured Markdown timeline that finance could copy directly into Slack.
3. Add a "likely root cause" section that flags common failure modes (KYC declined, RPC timeout, insufficient gas, provider rate-limit).

The quality change wasn't speed. Finance went from *escalating every failure to engineering* to *triaging with the timeline themselves and only escalating ambiguous cases*. The cross-team relationship improved because we stopped looking like the bottleneck.

What I learned: the AI draft was valuable for *framing* the tool, not for the production code. I rewrote the actual service myself, but the AI got me to a working prototype faster than cold.

### AI-3: What's one way you've expanded your impact at work with AI — what problem were you trying to solve, why did you approach it that way, and how has your approach evolved?

The problem: code review fatigue at Nespay. Small team, slow reviews because each reviewer had to load context fresh.

**Initial approach (mid-2025):** I asked Claude to summarize PR diffs into "what changed / why / risks to watch" before I reviewed. Worked OK, but the AI sometimes confidently *mis-described* code, which is worse than no summary.

**Refinement (late 2025):** I stopped using AI to *describe* the diff and started using it to *generate questions* about the diff: "What invariants might this break? What edge cases isn't covered by the test additions? Where does this assume something the caller might violate?" Those questions were useful even when the AI got specifics wrong, because I could answer them by reading the code.

**Current approach (2026):** I use AI as a "rubber duck for review" — I write my own review comment, then ask the model "play the role of the PR author and push back on this review, what would you say?" It surfaces my weak arguments before the human author does. My review comments became more specific and less hand-wavy. A few teammates noticed and adopted the same workflow.

The evolution: from *AI does the review* (bad) to *AI describes the diff* (mediocre) to *AI questions my own thinking* (genuinely useful).

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
