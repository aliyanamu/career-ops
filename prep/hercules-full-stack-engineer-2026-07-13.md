# Hercules (Zeus AI Labs): Full-Stack Engineer

**Job URL:** [https://hercules.app/careers/full-stack-engineer](https://hercules.app/careers/full-stack-engineer)
**Location:** San Francisco (Kearny & Bush), in-office. Strong in-office preference. Remote only for exceptional candidates willing to (1) work US time zones and (2) travel to the office regularly.
**Stack:** TypeScript, React, containers, Postgres, Redis, Temporal. Cloud: Cloudflare, AWS. AI: OpenAI, Anthropic, Google.
**Level:** Senior or Staff.
**Fit:** ~3.5/5 on stack, capped by location. Core stack (TS/React/Postgres/Redis) is hers. Real gate is SF in-office + US time zone + travel.

> Contact PII kept out of this file; it lives in `config/profile.yml` (this repo is public).

---

## Reality check (read first)

This is an SF in-office role. The remote door is open only for "exceptional" candidates who commit to US hours and regular travel to San Francisco. From Indonesia that means a 15 hour offset and no work visa on the table unless they sponsor. Going for it anyway means leading hard on the AI-native builder angle and being upfront that you would work US hours and travel.

## Company signals (X @usehercules + web, checked 2026-07-13)

- **Founder: Brendan Falk, ex-Fig** (terminal autocomplete, acquired by AWS). This is a developer-experience and dev-tools team at heart. a16z-backed. 100,000+ users, small agile SF team. Founded 2025.
- **Product thesis: AI-native building.** They run an "internal AI coding harness to 100x output" and expect engineers to be "on the frontier of AI coding." This is the single most important signal.
- **Realtime by default.** Their X demos show apps that are realtime out of the box (chat rooms, live preview). They added backend, database, and auth as built-in primitives (Aug 2025), plus an SDK: Hercules Commerce, Auth, CMS, Files & Media.
- **Hosting at scale.** They host hundreds of thousands of apps, so reliability and lean infra matter.

### Plus points to lead with (what she built that maps directly)
1. **She built her own AI agent pipeline** (this career-ops system: scans job boards, scores roles, drafts tailored applications). This is direct proof of "frontier of AI coding / 10x your workflow", which is Hercules's whole thesis and the founder's DX background. Lead with this.
2. **Realtime, reliable backend at scale**: the Go multi-chain indexer scans blocks in real time and relays paid transactions over webhooks, Redis dedup so each transaction reports once, cleanup jobs to keep Postgres lean. Maps to "realtime by default" + hosting reliability.
3. **Auth + integrations**: Privy and Xellar wallet/auth, Sumsub KYC. Maps to their Auth SDK surface.
4. **Core stack is an exact match**: TypeScript, React/Next, Node/Nest, Postgres, Redis.

### Gaps they need filled (be honest, ramp-fast framing)
- **SaaS depth**: subscription billing, entitlements, SSO/SAML, RBAC, feature flags, A/B, i18n for large user bases. Her payments/KYC/invoicing work is adjacent, not seat-based billing or enterprise SSO. This is the real gap.
- **Temporal**: new on paper; the indexer's durable backfill + crash recovery is the same durable-workflow idea.
- **Consumer scale / multi-tenant hosting**: her work is B2B payments, not 100k-app hosting.

### Tailored answer drafts
**Why Hercules?**
> I build with AI every day as my actual workflow, not as a novelty. I wrote an agent pipeline that scans job boards, scores roles against my background, and drafts tailored applications end to end. Hercules is the product version of how I already work, letting anyone build a real full stack app by chatting with an AI. Coming from Brendan's Fig background, this team clearly cares about developer experience and shipping fast, and that is exactly where I want to build.

**Most relevant thing you have built?**
> At Nespay I built a multi chain block indexer in Go that scans blocks in real time and relays paid transactions to the backend over webhooks, with Redis dedup so each transaction reports once and cleanup jobs that keep Postgres lean. Realtime by default and reliable at scale is the same problem Hercules solves for hosted apps. I also wired up wallet and auth providers like Privy and Xellar plus KYC with Sumsub, which maps onto your Auth and SDK surface.

**Where are you weaker?**
> Subscription billing, entitlements, and SSO or SAML are adjacent for me rather than direct. I have shipped invoicing, wallet flows, and KYC, but not seat based billing or enterprise SSO, so that is the first thing I would close. Temporal is new to me on paper, though the durable backfill and crash recovery in my indexer is the same durable workflow idea.

## Strategy: map Hercules asks to real work

| Hercules expectation | Hana's proof |
|---|---|
| Software fundamentals: system design, data modeling, API design | Nespay payments backend architecture; multi-chain block indexer design (forward, backward, cleanup relay) |
| Clean maintainable code, monorepos | Nespay backend + backoffice dashboard; peer code review culture |
| Product sense: independently ship lots of features | ION praise/endorsement features, leaderboards, time-off system; voucher generator at Ultra Voucher |
| SaaS: billing, identity (OAuth/RBAC), analytics, i18n | Partial. Wallet + KYC (Sumsub) + invoicing at Nespay. Billing/entitlements and SSO/SAML are a gap to frame honestly |
| Core stack TypeScript, React, Postgres, Redis | Direct match: Nest.js/Next.js/React/Node, PostgreSQL, Redis (indexer dedup) |
| Temporal | Gap. Adjacent: her indexer already does durable, resumable workflows (backward backfill, crash recovery) which is the same problem Temporal solves |
| AI: 10x workflow, frontier of AI coding | Strong. Daily AI-assisted workflow, compound-engineering docs, this whole job-search pipeline |

## Gaps to handle in the application
1. **Location / US timezone / travel.** Address head-on: state willingness to work US hours and travel if they consider remote.
2. **SaaS billing + SSO/SAML depth.** Frame the payments/KYC/wallet work as adjacent, be honest it is not subscription billing.
3. **Temporal.** Position the indexer's durable backfill + crash recovery as the same class of problem.

## Contact / standard fields
- **Name:** Hana Aliyah Mufidah
- **Email / Phone:** *(private, see config/profile.yml)*
- **Resume/CV:** pending tailoring (target: output/cv-hana-aliyah-mufidah-hercules-fullstack-2026-07-13.pdf)
- **GitHub:** [https://github.com/aliyanamu](https://github.com/aliyanamu)
- **City:** Yogyakarta, Indonesia
- **How to apply:** Apply button on the posting, or hello@hercules.app
