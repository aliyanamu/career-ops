# Evaluation: StraitsX — Software Engineer, Treasury

**Fecha:** 2026-07-13
**Arquetipo:** Payments / Fintech Engineer (secondary: Web3 Full-Stack / Blockchain Backend)
**Score:** 3.6/5
**Legitimacy:** High Confidence
**URL:** https://job-boards.eu.greenhouse.io/straitsx/jobs/4919950101
**PDF:** pending

---

## A) Role Summary

| Field | Value |
|-------|-------|
| Archetype | Payments / Fintech Engineer (+ Web3 Backend) |
| Domain | Treasury & Financial Systems — reconciliation, liquidity, reporting, ledger automation |
| Function | Build (end-to-end ownership of internal financial infra) |
| Seniority stated | Entry / Junior — "1 year of software engineering experience, fresh graduated are welcome" |
| Remote | On-site, Jakarta, Indonesia (LOCAL — no visa gate) |
| Team | STX - Engineering, Treasury & Financial Systems; partners with Ops, Finance, Compliance |
| Stack signals | Ruby on Rails **or** Golang, BigQuery/SQL/dbt, REST + microservices, CI/CD, Git |
| TL;DR | Build reconciliation, reporting and ledger-automation systems for a MAS-licensed stablecoin issuer — the domain matches Hana's Nespay payments work almost 1:1, but the role is posted at entry level. |

StraitsX is the payments infrastructure behind XSGD/XUSD stablecoins, a Major Payment Institution licensed by the Monetary Authority of Singapore. This role is the "unseen plumbing": assets-vs-liabilities dashboards, automated reconciliation across internal/external systems, journal/ledger entries into ERP and treasury platforms, and real-time anomaly detection.

## B) CV Match

| JD Requirement | CV Evidence | Verdict |
|----------------|-------------|---------|
| Ruby on Rails **or** Golang | "multi-chain block indexer in Go" (cv.md L21); `_profile.md` L12 confirms real Go production experience, not basic | Strong (Go side) |
| Build/consume RESTful APIs, microservices | Nespay backend + block indexer relaying webhooks to NestJS consumer (L21); wallet/invoice/KYC service integrations (L19–20) | Strong |
| SQL & database design; OLTP/OLAP tradeoffs | PostgreSQL, MySQL, MongoDB, Elasticsearch, Redis, Neo4j (L41); indexer schema design + Redis dedup + cleanup jobs to keep Postgres lean (L21) | Strong on SQL/schema; BigQuery/dbt not shown |
| Reconciliation / assets-vs-liabilities / ledger automation | Wallet transactions, invoice management, on/off-ramp (L19); on-chain payment relay feeding backend (L21) — payments-reconciliation adjacent | Strong-adjacent |
| CI/CD pipelines + Git workflows | "set up AWS authorization and CI/CD pipelines (GitHub Actions on EC2)" (L17); peer code reviews (L22) | Strong |
| Strong English communication | English (Professional) (L51) | Meets |
| Bonus: fintech / financial systems | 6+ yrs incl. B2B payments (Web 2.5), crypto-to-fiat on/off-ramp (L8–11) | Strong |
| Nice-to-have: digital wallets, bank rails, blockchain | Xellar/Privy wallet integrations, RPC, on/off-ramp, KYC Sumsub, DeFi hackathon 3rd (L19–20, L44, L48) | Strong — differentiator |
| Nice-to-have: ERP finance modules | Not present | Gap (minor) |
| Nice-to-have: financial audit/reporting principles | Not present | Gap (minor) |

**Gaps + mitigation:**
1. **BigQuery / dbt** — nice-to-have, not a hard blocker. Adjacent: heavy SQL + multi-DB experience (Postgres/Elasticsearch/Redis). Mitigation: one line noting analytics-warehouse work is a short ramp from strong SQL; dbt is a thin layer over SQL she already writes.
2. **ERP integration + financial audit principles** — nice-to-haves. Adjacent: invoice management and payment-ledger relay at Nespay. Mitigation: frame the invoicing + on/off-ramp reconciliation work as the same problem shape (matching internal records to external money movement).
3. **Seniority mismatch (the real gap, see Block C)** — the role asks for 1 year; Hana has 6.5. Not a skills gap; a level/comp gap.

## C) Level & Strategy

**Level detected:** Entry / Junior. The JD literally says "1 year of software engineering experience, fresh graduated are welcome to apply," and the "What You Will Gain" section is framed as learning ("You'll learn how financial systems really work under the hood").

**Candidate's natural level for this archetype:** Mid-to-senior (6.5 yrs, real payments + Web3 production depth).

This is the core issue. Per `_profile.md` seniority policy, entry-level / fresh-grad roles are normally excluded. Hana is overqualified on paper, and the posted band will almost certainly reflect a 1-year hire, not a 6.5-year one. The domain fit is genuinely excellent, which is why this is not an automatic skip, but the level is wrong as written.

**"Sell senior without lying" plan (only if pursuing):**
- Do not compete as a junior. Lead with the block indexer and on/off-ramp reconciliation as evidence she can own the treasury systems end-to-end from day one, not learn them.
- Position for a title/band above the posted level: ask directly whether the team hires the same role at mid level for candidates who already have payments-reconciliation depth. Many "1 yr, fresh grads welcome" posts are a single req that also absorbs stronger candidates at a higher band.

**"If down-leveled" plan:**
- Only accept if comp lands at true mid-level Jakarta fintech numbers (see Block D), not the entry band. A 1-year band would be a real pay cut for her experience.
- If they insist on the junior band, decline unless there is a concrete 6-month review with a defined promotion path in writing.

## D) Comp & Demand

No StraitsX-specific salary data is public (Glassdoor/Levels have no StraitsX Jakarta entries). Market context for Jakarta software engineers:

| Source | Figure (annual, IDR) | Note |
|--------|----------------------|------|
| Levels.fyi (Jakarta SWE) | ~247M median total comp | All-level blend |
| ERI SalaryExpert (Jakarta SWE) | ~179M – 381M range | Base range |
| Market blend (search result) | entry (1–3 yrs) ~402M avg; senior (8+ yrs) ~656M avg | Wide, source-dependent |
| Grab (top-paying Jakarta) | ~657M total comp | Ceiling reference |

Reading: a role scoped to "1 year / fresh grad" will most likely be banded in the entry range (rough ~150M–400M depending on how the req flexes), well below what a 6.5-yr payments engineer commands. Fintech/e-commerce sits at the upper end of the market, and StraitsX is a MAS-licensed issuer (reputable), so there is upside if they band her to actual experience — but the posting does not signal that.

**Demand:** SWE demand in Jakarta is healthy, driven by fintech/AI/cloud. StraitsX is actively hiring across engineering (scan history shows 3 open eng roles same day: Treasury, Card Issuing, Engineering Excellence). Treasury/reconciliation engineering is a durable niche.

Sources: [Levels.fyi Jakarta SWE](https://www.levels.fyi/t/software-engineer/locations/jakarta-idn), [Glassdoor Jakarta SWE](https://www.glassdoor.com/Salaries/jakarta-indonesia-software-engineer-salary-SRCH_IL.0,17_IM1045_KO18,35.htm), [ERI SalaryExpert](https://www.salaryexpert.com/salary/job/software-engineer/indonesia/jakarta), [Jobstreet Indonesia SWE](https://id.jobstreet.com/career-advice/role/software-engineer/salary), [Nodeflair StraitsX](https://nodeflair.com/companies/straitsx).

## E) Personalization Plan

| # | Section | Current | Proposed change | Why |
|---|---------|---------|-----------------|-----|
| 1 | Summary | "Full-stack developer... B2B payment systems" | Lead with payments-reconciliation + treasury-adjacent framing: "builds the payment-data plumbing that keeps ledgers accurate" | Mirror JD's reconciliation/accuracy language |
| 2 | Nespay bullet | Indexer described as relay | Add the reconciliation angle: relaying on-chain payment data so downstream ledgers stay in sync + Redis dedup so each tx is counted once | "counted once / no mismatches" is exactly treasury reconciliation |
| 3 | Skills | Go listed among many | Surface Go + SQL/PostgreSQL + CI/CD together near the top | These are the three hard requirements |
| 4 | Invoicing/on-off-ramp | Listed factually | Reframe as "matching internal records against external money movement" | Direct map to assets-vs-liabilities reconciliation |
| 5 | Add line | — | Note comfort turning finance/compliance requirements into services (Nespay KYC: Sumsub/Kredibel) | JD stresses partnering with Finance/Compliance |

**Top 5 LinkedIn tweaks:** headline to include "Payments / Fintech Engineer"; add "reconciliation" and "ledger" keywords; pin the DeFi hackathon; surface Go + PostgreSQL in skills; About section to open with payments-infra framing.

## F) Interview Plan

| # | JD Requirement | STAR+R Story | S | T | A | R | Reflection |
|---|----------------|--------------|---|---|---|---|------------|
| 1 | Reconciliation / accuracy | Multi-chain block indexer | Backend needed to know reliably when a tx was paid; v1 hoarded data and bloated Postgres | Relay on-chain payment data reliably, recover from gaps, stay lean | Go: forward indexer, configurable backward indexer for backfill/outage recovery, cleanup jobs, Redis dedup | Lean relay that counts each tx once and recovers from outages | Win was scoping down: relay and forget, not store forever |
| 2 | Detect/investigate mismatches | Redis dedup design | Backward indexer re-scans overlapping ranges on purpose | Ensure each transaction reports exactly once | Redis dedup keyed per tx across forward+backward paths | No double-counting despite deliberate overlap | Idempotency at the boundary beats cleanup after the fact |
| 3 | Partner with Finance/Compliance | KYC integration | Nespay needed compliant onboarding | Wire KYC into onboarding without blocking UX | Integrated Sumsub + Kredibel into the flow | Compliant onboarding shipped | Compliance is a requirement source, not a blocker — translate it early |
| 4 | End-to-end ownership | Backoffice dashboard + backend | User/admin surfaces needed building from scratch | Own front and back end | Built React/Next dashboard + backend for wallet, invoicing, external wallet integrations | Shipped the operational surface end-to-end | Owning both ends removes handoff friction |
| 5 | CI/CD + Git | AWS + GitHub Actions pipeline | New project, no delivery pipeline | Stand up auth + CI/CD | Set up AWS authorization and GitHub Actions on EC2 | Repeatable deploys from day one | Early pipeline pays for itself fast |
| 6 | Manual work automation | Ultra Voucher voucher generator | Affiliate voucher codes tracked by hand in Excel | Replace manual, untracked process | Built a web app to generate codes, track status, generate reports | Killed the manual Excel process | Same shape as JD's "take manual accounting off the table" |

**Recommended case study:** the Nespay block indexer — it is the closest analog to treasury reconciliation infra (accuracy, dedup, outage recovery, keeping the DB lean). Frame around correctness and idempotency, not "moves real money" (see indexer memory: it is a relay, not settlement/finality).

**Red-flag questions to expect:** "This role is posted at 1 year — why are you interested with 6.5?" Answer honestly: the domain is exactly what she has been building, and she is asking whether they band the req to experience. "Rails or Go?" — Go is the real production language; Rails is not on the CV, be straight about that and lean Go.

Story-bank: stories 1 and 5 already exist in `interview-prep/story-bank.md` (from report #016). No new master stories needed; the KYC and voucher-automation angles are variants of existing entries.

## G) Posting Legitimacy

**Assessment: High Confidence**

| Signal | Finding | Weight |
|--------|---------|--------|
| Posting freshness | First published 2026-07-06, updated 2026-07-06; ~7 days old | Positive |
| Apply state | Live Greenhouse EU board req (id 4919950101), active | Positive |
| Tech specificity | Names Rails/Go, BigQuery, dbt, microservices, CI/CD, specific treasury workflows | Positive |
| Requirements realism | Coherent; the only oddity is entry-level YoE against a domain-heavy scope | Neutral |
| Scope clarity | Clear 6–12 month scope (reporting, reconciliation, ledger automation, monitoring) | Positive |
| Company hiring signals | 3 StraitsX eng reqs opened same day (Treasury, Card Issuing, Engineering Excellence) — active build-out, no layoff/freeze signals found | Positive |
| Reposting | First appearance in scan-history (2026-07-13); no prior reposts | Neutral |
| Salary transparency | Not stated (normal for Indonesia) | Neutral/Low |

**Context notes:** MAS-licensed, real product (XSGD/XUSD), actively expanding its Jakarta engineering org. No ghost-job indicators. The one thing to weigh is not legitimacy but level: the posting is genuinely entry-scoped.

---

## Keywords extraídas

treasury, reconciliation, ledger, journal entries, ERP, liquidity, assets vs liabilities, reporting platform, anomaly detection, Golang, Ruby on Rails, BigQuery, dbt, SQL optimization, OLTP, OLAP, RESTful APIs, microservices, CI/CD, Git, fintech, stablecoin
