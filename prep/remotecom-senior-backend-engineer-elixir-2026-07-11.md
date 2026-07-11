# Remote.com: Senior Backend Engineer (Elixir)

**Job URL:** https://job-boards.greenhouse.io/remotecom/jobs/7774669003
**Location:** Remote — Southeast Asia (applying from Indonesia — eligible, no visa)
**Stack:** Elixir/Phoenix + Postgres backend; React/Next.js frontend; GitLab CI/CD; AWS
**Fit:** 4.0/5 — see reports/016-remotecom-2026-07-11.md
**Status:** In prep (submissionStatus: pending)

> Contact PII (phone, email) intentionally kept out of this file — it lives in `config/profile.yml` (this repo is public).

---

## Strategy (read first)

Remote's **must-haves gate on transferable strengths, not Elixir.** Their asks map cleanly to real work:

| Remote must-have | Your proof |
|------------------|------------|
| Ship secure/reliable/scalable production systems | B2B crypto payments backend (NestJS/TS) + multi-chain USDT indexer, real money |
| Design/adopt automation workflows, improve via iteration | **HRIS→platform integration sync** (centerpiece) + indexer's forward→backfill→confirmation worker evolution |
| Think in systems: specs, break down plans, instrument verification, close the loop | Indexer: confirmation worker = verification; invoice reconciliation by amount = closing the loop |
| Postgres | Indexer crash-recovery on PostgreSQL; app DBs |
| CI/CD (GitLab/GitHub/Jenkins) | GitHub Actions on EC2 |
| AI fluency / automation capabilities | AI-assisted dev workflow day-to-day |
| *(nice-to-have)* K8s, Docker, Next.js, React/Vue | Docker; React + Next.js are core |

**Elixir is NOT in the must-haves.** Handle it with a learning-plan angle (below), not avoidance.

---

## Contact / standard fields

- **First name:** Hana
- **Last name:** Aliyah Mufidah
- **Email / Phone:** _(private — see config/profile.yml)_
- **Resume/CV:** ⚠️ TODO — generate tailored `output/cv-hana-aliyah-mufidah-remotecom-2026-07-11.pdf` (see PDF step)
- **GitHub URL:** ⚠️ TODO — required, provide it
- **City:** Yogyakarta, Indonesia

## Pre-screen selects

- **Years of professional backend/full-stack experience:** 6+ years
- **Years of Elixir:** 0 — learning (see plan). Frame: functional paradigm transferable from JS/TS.
- **Base salary expectation (USD):** ⚠️ TODO — decide a number/range before submitting
- **Availability to start:** ~1 month (confirm Nespay notice period)
- **Legally authorized to work where domiciled?** Yes (Indonesian citizen, working remotely)
- **Require visa sponsorship?** No (fully remote from Indonesia)

---

## Free-text answers (draft — rewrite in your own voice before pasting)

### "Why you / what makes you a strong fit"

I'm a full-stack engineer with 6+ years shipping production systems, and I work the way Remote does: async, high-ownership, automation-first. In my current role I own the backend of a B2B crypto-to-fiat payments platform — NestJS/TypeScript APIs for wallet transactions and invoicing on Postgres, on AWS with GitHub Actions CI/CD. The part most relevant to this role is the on-chain indexer I built to drive settlement: three coordinated workers — a forward worker polling recent blocks every 5s for real-time detection, a backfill worker closing gaps, and a confirmation worker that waits for chain-specific finality before a payment settles — behind an RPC layer, using Redis for dedup and Postgres for crash recovery, firing webhooks that reconcile each transfer against the open invoice by amount. That's systems thinking end to end: clear specs, separated workers, verification built in, and the loop closed on correctness while moving real money. I'm comfortable owning that kind of reliability. Elixir/Phoenix is new to me, but the functional, correctness-first mindset it rewards is exactly how I already build — and I'm actively ramping on it.

### "Experience designing or adopting automation workflows" (must-have)

The clearest example is an integration app I built to sync data from an HRIS into our work-management platform. Before it, the two systems drifted and people reconciled by hand. I designed the sync as an idempotent pipeline — pull, diff against current state, apply only real changes — so it could run repeatedly without duplicating or corrupting data, and I iterated on it as edge cases surfaced (partial records, field mismatches, ordering). It turned a manual, error-prone process into something that just stayed correct in the background. I applied the same instinct to the payments indexer: it started as a single detection loop and evolved into the forward/backfill/confirmation worker separation once I instrumented where detection was slow or gappy and closed those gaps deliberately. Both are the same pattern — automate a fragile manual/critical flow, then improve it through measured iteration.

### "Anything else"

I work fully async and self-directed (no daily standups needed) and I lean on AI tooling to move faster while staying the quality gatekeeper — which lines up with Remote's automation-and-AI-in-every-role expectation.

---

## Elixir learning-plan angle (if asked)

- **Honest framing:** "I haven't shipped Elixir yet. I've shipped a lot of correctness-critical backend, and functional/immutable thinking is already how I reason about reliable systems."
- **Concrete plan:** working through Elixir + Phoenix basics (pattern matching, GenServer/supervision trees, Ecto for Postgres); the OTP worker/supervision model maps directly to the forward/backfill/confirmation worker design I already built imperatively.
- **Bridge:** JS→Elixir transfer — I already reason in pipelines, immutability, and message-passing (webhooks, workers); Phoenix + Ecto + Postgres overlaps with my current Postgres/API work.
- **Ask for it:** happy to do a take-home or pairing in Elixir to show ramp speed.

---

## Proof points (from CV + Nespay codebase)

- **Nespay (Apr 2025–present):** NestJS/TS backend for B2B crypto payments; wallet transactions, invoicing, Xellar/Privy; KYC (Sumsub, Kredibel); AWS (EC2, IAM) + GitHub Actions CI/CD; core architecture ownership.
- **Multi-chain USDT indexer:** forward + backfill + confirmation workers; 5s polling; RPC layer; Redis dedup; **PostgreSQL** crash recovery; webhook-driven invoice reconciliation by amount.
- **HRIS→platform integration sync (ION):** idempotent data-sync automation replacing manual reconciliation.
- **Ultra Voucher automation:** replaced manual Excel voucher process with generation + status tracking + reporting.
- **AWS Certified Cloud Practitioner** (2024). **EDU Chain Hackathon** — 3rd, DeFi track (2025).

## Before submitting — you must provide
- **GitHub URL** · **base salary expectation (USD)** · confirm **availability** · tailored **CV PDF** (next step)
- Rewrite the free-text drafts in your own voice (Remote values authentic, non-AI-pasted answers).
