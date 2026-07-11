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
- **Resume/CV:** output/cv-hana-aliyah-mufidah-remotecom-2026-07-11.pdf
- **GitHub URL:** https://github.com/aliyanamu
- **City:** Yogyakarta, Indonesia

## Pre-screen selects

- **Years of professional backend/full-stack experience:** 6+ years
- **Years of Elixir:** 0 — learning (see plan). Frame: functional paradigm transferable from JS/TS.
- **Base salary expectation (USD):** $75,000
  - Backed by Remote's OWN published band for this role in **Indonesia (Bandung): $51,850–$116,650**. $75k = mid-band, defensible, still easy-approve. Negotiate from here; do NOT anchor at $60k (near floor). Remote policy: pays above in-location rates.
- **Availability to start:** Immediately
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
- ✅ GitHub · ✅ salary ($75k, mid-band) · ✅ available immediately · ✅ CV PDF generated
- Rewrite the free-text drafts in your own voice (Remote values authentic, non-AI-pasted answers).

---

## Values match — Remote's 5 values

Remote is heavily values-driven (expect values-based interview questions). Values: **Kindness, Ownership, Excellence, Transparency, Ambition** — Kindness is #1. Your honest proof for each:

| Value | What Remote means | Your proof (use in interviews) |
|-------|-------------------|-------------------------------|
| **Kindness** (#1 — give benefit of the doubt, ask don't assume) | Assume good intent, clarify instead of accusing | Peer code reviews framed as questions, not verdicts; collaborated across Support/Infra/Eng at ION to ship work-management features. "I default to asking what was intended before assuming a mistake." |
| **Ownership** (invested, take initiative, drive solutions) | Own outcomes, not tickets | Own the Nespay payments backend end-to-end; **noticed the single detection loop was gappy and drove the redesign myself** into forward/backfill/confirmation workers. Set up AWS + CI/CD unprompted; led core architecture. |
| **Excellence** (exceptional quality) | Correctness, reliability, high bar | Indexer built correctness-first: verification (confirmation worker) + crash recovery + reconciliation by amount, moving real money. Stabilized validation across the app. AWS Certified. |
| **Transparency** (open comms, clear info, build trust) | Write things down, share openly | Async, documented, webhook/event-driven observability; and — meta — I'm openly transparent about the Elixir gap and my plan to close it, rather than hiding it. |
| **Ambition** (pursue ambitious goals with energy) | Reach, grow, push | Pivoted from geophysics → software; self-directed learner (Korean to reading-fluency, now Elixir); 3rd place DeFi hackathon; targeting a senior remote role at a global company. |

**Interview tip:** If asked "which value resonates most?", lead with **Ownership** (your indexer redesign story is the cleanest proof) or **Kindness** (their #1 — the code-review-as-questions framing). Avoid claiming all five equally; pick two you can defend with a story.

- **CV enhancement (later):** bullets are descriptive but lack metrics — the one gap vs. reviewed ATS examples. When you have rough numbers (indexer throughput/day, payment volume, automation time saved, uptime/latency), tell me and I'll quantify them. NOT fabricating any.

---

## FULL APPLICATION FORM — all 24 questions (answer key)

> ⚠️ Rewrite every free-text answer in your own voice before pasting. Remote screens hard for authentic, non-AI answers — Q21 is literally a test of that. Q17/Q21/Q20 must reflect YOUR real memory; the drafts below are scaffolding, not final copy. Confirm the ⚠️ selects.

### Contact & basics (Q1–7)
1. **First Name:** Hana
2. **Last Name:** Aliyah Mufidah
3. **Email:** _(config/profile.yml)_
4. **Phone:** _(config/profile.yml)_
5. **Resume/CV:** upload `output/cv-hana-aliyah-mufidah-remotecom-2026-07-11.pdf`
6. **Cover Letter (optional):** skip — Q14/Q15 cover it. (Or paste a 4-line note if you want.)
7. **LinkedIn (optional):** ⚠️ your LinkedIn URL, or leave blank. (Note: form asks LinkedIn, not GitHub — add GitHub in the cover note or Q14 if you want it seen: github.com/aliyanamu)

### Selects (Q8–13)
8. **How did you hear about Remote?** ⚠️ pick truthfully (LinkedIn job posting / Other). 
9. **Non-compete preventing you working for us?** No ⚠️ confirm.
10. **Country located in:** Indonesia
11. **Legally eligible to work where you'll work from?** Yes
12. **Status:** "I am a Citizen/Permanent Resident of the Country where I plan to live and work from"
13. **Pronouns:** she/her/hers ⚠️ confirm.

### Backend experience selects (Q16, Q18)
16. **Delivered production backend professionally?** → **"Yes, with other languages"** (Node.js/NestJS/TypeScript — honest; not Elixir/Ruby/functional).
18. **Non-technical stakeholder conversations?** Yes.

### Compliance (Q22–24)
22. **Consent to brighthire.ai interview recording?** Yes (recommended; declining is allowed and doesn't hurt) ⚠️ your call.
23. **Privacy notice:** Acknowledge/Confirm.
24. **California applicant notice:** "I am not a California resident".

---

### Free-text answers (DRAFTS — make them yours)

**Q14 — What makes you interested in working with Remote?**
Two things. First, the mission: I'm based in Indonesia, and Remote is the reason a company can hire someone like me anywhere, compliantly. I've felt the friction of global employment from the candidate side, so building the platform that removes it is genuinely motivating. Second, how Remote works — fully async, high-ownership, low ceremony. That's already how I operate: I own my payments backend end to end and organize my own work without standups. And the stack lines up with mine (React/Next.js, PostgreSQL, AWS, CI/CD), with Elixir as the one piece I'm excited to grow into. (GitHub: github.com/aliyanamu)

**Q15 — You've seen our values page. What resonates most?**
Yes, I read it. **Ownership** resonates most. My best work happens when I own an outcome, not a ticket — with our payments indexer I noticed the single detection loop was missing and mistiming deposits, and rather than just flagging it I redesigned it into separate forward, backfill, and confirmation workers so settlement was correct and recoverable. **Kindness** (your #1) is a close second: I try to run code reviews as questions rather than verdicts — assuming good intent and asking what someone was going for before assuming a mistake.

**Q17 — Elixir experience / how you'd learn it / what appeals about FP?**
I'll be transparent: I haven't shipped Elixir in production — my backend is Node.js/NestJS/TypeScript. But the way Elixir thinks is already how I build. My payments indexer is essentially independent, message-passing workers with supervision and recovery — which is the OTP/GenServer/supervision-tree model. To learn it I'd start exactly there: Elixir + pattern matching, then Phoenix and Ecto (which map onto my current Postgres/API work), and I'd rebuild a small version of that indexer in idiomatic OTP so I'm learning the paradigm on a problem I already understand. What appeals to me about FP is immutability and explicitness — fewer hidden-state bugs and correctness you can reason about, which matters a lot when you move real money. Happy to do a take-home or pairing in Elixir to show how fast I ramp.

**Q19 — A product/project you led through collaboration with stakeholders, product, design.**
At ION I led improvements to the employee time-off and work-timeline system on our work-management platform. It began as a product problem: managers were drowning in one-by-one approvals, and time-off ignored public holidays and team objectives, so plans clashed. I worked with product to define the real need, with design on how bulk approvals and the timeline should feel, and with HR/managers to validate edge cases — then built bulk approvals and integrated time-off with public holidays and objectives so the timeline reflected reality. It turned a manual, error-prone flow into something managers could act on at a glance. My takeaway: the engineering was the easy part — the value came from getting the spec right with non-technical stakeholders first.

**Q20 — Proudest achievement from your last two years. Why?**
The multi-chain settlement indexer I built at Nespay. Our B2B payments platform settles invoices from on-chain USDT deposits across five chains, and a naive single detection loop was missing deposits and settling at the wrong time. I redesigned it into three coordinated workers — a forward worker polling recent blocks every ~5s, a backfill worker closing gaps, and a confirmation worker that waits for chain-specific finality before anything settles — behind an RPC layer, with Redis for dedup and Postgres for crash recovery, firing webhooks that reconcile each transfer to the open invoice by amount. I'm proud of it because it moves real money and it's correct: verification and recovery are built in, and it went from fragile to something I trust. It's my clearest example of owning a system end to end and improving it through deliberate iteration.

**Q21 — Do you use AI assistants? Describe a time you rejected/rewrote AI output — what did it miss, how did you catch it?**
⚠️ REPLACE with a true incident if this isn't exactly right — but this one fits your indexer work:
Yes, I use AI assistants (Claude/Copilot) daily to move faster. One specific case: while building the settlement indexer, I had an assistant draft the deposit-detection logic and it treated a transaction as settled the moment it appeared in a block. That's wrong for money movement — it ignored chain finality and reorganizations, so a deposit could be "settled" and then disappear in a reorg. I caught it because I know finality semantics: different chains need different confirmation depths, and you can't settle on first sight. I rewrote it to split detection from confirmation — detect on appearance, settle only after chain-specific confirmations — which became the confirmation worker. My rule: AI is great for scaffolding, but I stay the gatekeeper on anything correctness- or money-critical, because it optimizes for plausible code, not for a domain's real failure modes.
