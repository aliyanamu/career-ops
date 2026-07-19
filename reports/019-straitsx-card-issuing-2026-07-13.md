# Evaluation: StraitsX — Backend Engineer, Card Issuing Team

**Date:** 2026-07-13
**Archetype:** Payments / Fintech Engineer (primary) + Web3 Full-Stack / Blockchain Backend (secondary)
**Score:** 4.3/5
**Legitimacy:** High Confidence
**URL:** https://job-boards.eu.greenhouse.io/straitsx/jobs/4925745101
**PDF:** pending

---

## A) Role Summary

| Field | Value |
|-------|-------|
| Archetype | Payments / Fintech Engineer (+ Blockchain Backend secondary) |
| Domain | Payments infrastructure — zero-to-one card issuing platform across SE Asia |
| Function | Build (backend services + APIs, third-party payment integrations) |
| Seniority | Mid-level (min 3 yrs stated) |
| Remote | On-site / hybrid, Jakarta, Indonesia (LOCAL — no visa gate) |
| Team size | Card Issuing Team (cross-functional: Product, Design, QA, Ops); size not stated |
| TL;DR | Build the APIs and backend for a new card-issuing product at a MAS-licensed stablecoin/payments company, in Hana's home city, with heavy payment-provider integration work that maps directly to her Nespay experience. |

StraitsX is a Singapore-headquartered digital payment infrastructure provider, a Major Payment Institution licensed by the Monetary Authority of Singapore, and issuer of the XSGD and XIDR stablecoins. This role sits on a new Card Issuing team building the platform that lets businesses launch and run their own card programs.

## B) CV Match

| JD requirement | CV evidence | Verdict |
|----------------|-------------|---------|
| Min 3 yrs backend engineering | 6.5 yrs full-stack, backend-heavy at Nespay + ION (`cv.md` L16, L24) | Strong (exceeds) |
| Build/maintain RESTful APIs | Nespay backend server for user + admin interfaces; wallet/invoice APIs (L18–L19) | Strong |
| Third-party APIs + payment integrations (local + global) | External wallet integrations Xellar, Privy; RPC services; KYC Sumsub, Kredibel (L19–L20) | Strong — this is her core differentiator |
| Card issuance / payment processing systems | B2B payment systems, wallet transactions, invoice management, crypto-to-fiat on/off-ramp (L8–L11, L19) | Adjacent-strong (payments yes, card rails new) |
| SQL databases (MariaDB / MySQL) | MySQL + PostgreSQL in Key Skills (L41) | Strong (MySQL direct; MariaDB is MySQL-compatible) |
| Docker + CI/CD pipelines | AWS CI/CD, GitHub Actions on EC2, Docker (L17, L43) | Strong |
| Git / GitHub workflows | GitHub Actions pipelines, peer code reviews (L17, L22) | Strong |
| Microservices architecture | Nespay: separate Go indexer relay + NestJS consumer backend, webhook-driven (L21) | Moderate-strong (service separation, event-driven) |
| Debugging / troubleshooting / scalability | Multi-chain indexer with gap backfill, outage recovery, Redis dedup, DB pruning (L21) | Strong |
| Familiar with AI (Claude/Codex) | AI-assisted workflow (`_profile.md` L11; memory: ai-workflow) | Strong |
| **Strong proficiency in Golang** | Real production Go: the Nespay multi-chain block indexer relay service (L21; `_profile.md` L12) | **Moderate — the main gap** |

### Gaps + mitigation

1. **Golang as the primary language (main gap).** The JD asks for "strong proficiency in Golang." Hana's day-to-day primary is TypeScript/NestJS; her Go is real production work but scoped to one service (the indexer relay). Not a hard blocker — she has shipped and operates Go in production, which clears "familiarity" and lands credibly at "proficient" for a mid-level bar. Mitigation: lead with the indexer as a full Go case study (forward + backward indexer, Redis dedup, cleanup jobs). Frame it as "I built and operate a production Go service" and be honest it is her growing language, not her longest. Do not claim she is "learning" it (memory: no-fabricated-learning-claims) — she already ships it.
2. **Card rails specifically (issuing, processors, PCI, network flows) is new.** Nice-to-have depth, not a stated hard requirement. Mitigation: map card issuing to what she already does — integrating external payment providers and third-party APIs is the exact muscle. Her on/off-ramp and wallet-integration work is the closest adjacent proof.
3. **MariaDB (vs her MySQL/Postgres).** Effectively zero gap; MariaDB is a MySQL drop-in. No action needed beyond naming MySQL.

No hard blockers. Location is a clean match (local Jakarta, no visa).

## C) Level & Strategy

- **JD level:** mid-level, minimum 3 years. Hana at 6.5 years is comfortably at or above the bar — this is a match per `_profile.md` seniority policy (accept 3+ yrs), not a stretch.
- **Sell without overselling:** Position as a payments engineer who has already lived the integration-heavy, reliability-sensitive side of fintech. Concrete anchors: the multi-chain indexer (systems + reliability), Xellar/Privy/RPC/Sumsub integrations (third-party payment + KYC plumbing), AWS CI/CD ownership. The zero-to-one framing of the role rewards someone who has built from the ground up — her Nespay core architecture and Ultra Voucher greenfield voucher-generation app both show that.
- **On Golang:** be direct. "My primary is TypeScript/NestJS. My production Go is the indexer relay I extended and run — forward and backward scanning, Redis dedup, cleanup jobs. I'm effective in Go and ready to make it my main language here." Honest, and it matches the real record.
- **If down-leveled or comp is light:** accept mid-level title, negotiate a written 6-month review with clear criteria, given she exceeds the stated YoE.

## D) Comp & Demand

Local Jakarta role, paid in IDR. No StraitsX-specific figures are public (Glassdoor has no StraitsX/StratX Indonesia salary entries).

| Data point | Figure (IDR, monthly unless noted) | Source |
|------------|-----------------------------------|--------|
| Golang backend, mid-level (3–5 yrs) | Rp 22,000,000 – 38,000,000 /mo | Masoem University 2026 Go vs Node vs Python breakdown |
| Golang backend role, Jakarta Selatan (IT consulting) | Rp 10,000,000 – 15,000,000 gross /mo | Glassdoor Jakarta listing (lower-end consulting) |
| Backend developer, Jakarta (general) | ~Rp 9,000,000 avg; 75th pct ~Rp 13,600,000 | Glassdoor Jakarta backend developer |
| Go/Python premium vs PHP | +20–30% | Masoem / PayScale ID |
| Backend range, experienced, top cities | Rp 6M – 45M /mo | Jobstreet / Second Talent 2026 |

**Read:** For a 6.5-yr engineer with fintech + Go + AWS at a well-funded, MAS-licensed payments company, the credible target is the upper mid band, roughly **Rp 28,000,000 – 40,000,000/mo**, above the generic Jakarta average because of the Go premium, the fintech domain, and StraitsX's funding/regulatory profile. Anchor at the top of the mid-level Go band, not the consulting-shop floor.

**Demand:** Golang backend is a standard, high-demand requirement across Indonesian fintech and high-volume platforms. Card issuing is an active growth area in SE Asia payments. Healthy demand, real role.

Sources: [Glassdoor Jakarta backend engineer](https://www.glassdoor.com/Salaries/jakarta-indonesia-back-end-engineer-salary-SRCH_IL.0,17_IM1045_KO18,35.htm), [Masoem 2026 Go/Node/Python](https://masoemuniversity.ac.id/artikel/gaji-backend-developer-node-js-vs-python-vs-go-di-indonesia-2026-data-yang-langsung-bisa-dipakai/), [Glassdoor Jakarta Golang jobs](https://www.glassdoor.com/Job/jakarta-backend-developers-golang-jobs-SRCH_IL.0,7_IC2709872_KO8,33.htm), [PayScale Indonesia Go](https://www.payscale.com/research/ID/Job=Software_Engineer/Salary/a9392d91/Go-Golang-Programming-Language), [Jobstreet backend salary](https://id.jobstreet.com/id/career-advice/role/backend-developer/salary).

## E) Personalization Plan

| # | Section | Current state | Proposed change | Why |
|---|---------|---------------|-----------------|-----|
| 1 | Summary | "Full-stack developer... work management and B2B payment systems" | Lead with payments/fintech backend + card-adjacent integration work; name Go alongside Node | Match the card-issuing, integration-heavy framing |
| 2 | Nespay bullet (indexer) | Detailed but reads as one service | Foreground it as a **Go** production service with reliability design | Directly answers the Golang requirement |
| 3 | Nespay bullet (integrations) | Xellar/Privy/RPC/Sumsub listed | Reframe as "third-party payment + KYC provider integrations" | Mirror JD wording "payment providers and third-party systems" |
| 4 | Key Skills | Web3-forward | Surface Golang, MySQL, Docker, CI/CD, microservices near the top | ATS + recruiter skim alignment |
| 5 | Skills order | JS-first | Keep TS/Node honest but pull Go up as a named production language | The role is Go-primary |

**Top 5 LinkedIn tweaks:** (1) headline to "Backend / Payments Engineer — Go, Node, AWS"; (2) add Golang and MySQL to skills; (3) About section: one line on the Go indexer; (4) one line on payment-provider + KYC integrations; (5) tag fintech/payments interest for SE Asia recruiters.

## F) Interview Plan

| # | JD requirement | STAR+R story | S | T | A | R | Reflection |
|---|----------------|--------------|---|---|---|---|------------|
| 1 | Strong Golang + scalable systems | Multi-chain block indexer (Go) | Payments backend needed reliable on-chain event relay; v1 hoarded data and bloated Postgres | Relay reliably, recover from gaps/outages, stay cheap | Built forward + backward indexer in Go, Redis dedup, periodic cleanup pruning stale data | Lean relay that recovers via configurable backfill and keeps DB healthy | Win was scoping it down to relay-and-forget; simple on purpose |
| 2 | Third-party + payment integrations | Xellar/Privy/RPC/KYC integrations | Nespay needed external wallets, on-chain RPC, and KYC to work together | Integrate multiple third-party providers into one payment flow | Wired Xellar/Privy wallets, RPC services, Sumsub/Kredibel KYC into the backend | Working crypto-to-fiat on/off-ramp with compliant onboarding | Provider APIs drift; build thin adapters and validate at the boundary |
| 3 | Debugging + reliability under load | Indexer outage recovery | Chain scanning could miss blocks during outages | Guarantee no missed transactions, no double-reports | Configurable backward re-scan of overlapping ranges + Redis dedup | Recoverable, exactly-once reporting | Idempotency is the cheapest insurance in a payments system |
| 4 | Microservices / service separation | Indexer (Go) + NestJS consumer | One monolith mixed scanning and business logic | Separate concerns cleanly | Split into Go relay emitting webhooks + NestJS backend consuming them | Independent, event-driven services | Clear service boundaries made both sides simpler to reason about |
| 5 | CI/CD + infra ownership | AWS + GitHub Actions on EC2 | Nespay needed repeatable deploys from scratch | Stand up auth + CI/CD | Set up AWS authorization and GitHub Actions pipelines on EC2 | Automated, repeatable deploys | Owning the pipeline early paid back on every release |
| 6 | Automation / operational tooling | HRIS→platform sync (ION) | HRIS and platform drifted, reconciled by hand | Keep both in sync automatically | Built idempotent pull-diff-apply sync, iterated on edge cases | Manual reconciliation became a correct background process | Same pattern reused on the indexer: automate the fragile flow, iterate |
| 7 | Zero-to-one / greenfield build | Voucher-generation app (Ultra Voucher) | Affiliate voucher codes tracked manually in Excel | Replace with a tracked system | Built web app to generate codes, track status, generate reports | Removed an untracked manual process end to end | Greenfield done right is about nailing the one workflow that matters |

**Recommended case study:** the Go indexer relay. It is the single strongest artifact for this role — it is Go, it is a payments-adjacent reliability system, and it shows scoping judgment. Present the architecture diagram and the three components.

**Red-flag questions to expect + handling:**
- *"Is Go your main language?"* → Honest: "TypeScript/NestJS is my longest, but I extend and operate a production Go service. I'm effective in Go and want it as my primary here." (Do not say she is "learning" it — she ships it.)
- *"Have you worked on card issuing specifically?"* → "Not card rails yet, but integrating third-party payment providers and KYC into live flows is exactly what I do. Card issuing is the same integration muscle on new rails."
- *"On-call comfort?"* → Yes; she operates the indexer's outage-recovery path in production already.

**Story bank:** stories 1, 2, and 6 already exist in `interview-prep/story-bank.md` (from report #016). Stories 3, 4, 5, 7 are new and worth appending under Systems/Reliability, Payments, and Greenfield themes.

## G) Posting Legitimacy

**Assessment: High Confidence**

| Signal | Finding | Weight |
|--------|---------|--------|
| Posting freshness | First published AND updated 2026-07-13 (today) via Greenhouse API | Positive |
| Apply channel | Live Greenhouse board (job-boards.eu.greenhouse.io), active job ID | Positive |
| Tech specificity | Names Golang, MariaDB/MySQL, Docker, CI/CD, microservices, RESTful APIs, Claude/Codex — concrete stack | Positive |
| Requirements realism | 3 yrs + realistic stack, no entry-level/staff contradiction | Positive |
| Scope clarity | Clear zero-to-one card issuing mandate, defined responsibilities | Positive |
| Company legitimacy | StraitsX = MAS-licensed Major Payment Institution, XSGD/XIDR issuer, real funded fintech | Positive |
| Salary transparency | Not stated (normal for Indonesia market) | Neutral |
| Reposting pattern | First seen today in scan-history; sibling StraitsX roles (Treasury, Eng Excellence) also posted today — active hiring wave, not a repost | Positive |
| Layoff/freeze signals | None surfaced | Neutral |

**Context notes:** StraitsX is posting multiple engineering roles simultaneously today (Card Issuing, Treasury, Engineering Excellence), consistent with a genuine hiring push on a growing team. No ghost-job indicators. Verification is via Greenhouse API (structured source with today's timestamps); a Playwright confirm of the live Apply button is a nice-to-have but the API freshness is strong on its own.

---

## Keywords extracted

Golang, backend engineer, RESTful API, microservices, card issuing, payment processing, payment providers, third-party API integration, MariaDB, MySQL, SQL, Docker, CI/CD, Git, GitHub, debugging, scalability, system reliability, incident response, on-call, fintech, StraitsX, South East Asia, Claude, Codex
