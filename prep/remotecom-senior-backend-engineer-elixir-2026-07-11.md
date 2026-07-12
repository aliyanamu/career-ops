# Remote.com: Senior Backend Engineer (Elixir)

**Job URL:** [https://job-boards.greenhouse.io/remotecom/jobs/7774669003](https://job-boards.greenhouse.io/remotecom/jobs/7774669003)
**Location:** Remote — Southeast Asia (applying from Indonesia — eligible, no visa)
**Stack:** Elixir/Phoenix + Postgres backend; React/Next.js frontend; GitLab CI/CD; AWS
**Fit:** 4.0/5 — see reports/016-remotecom-2026-07-11.md
**Status:** In prep (submissionStatus: pending)

> Contact PII (phone, email) intentionally kept out of this file — it lives in `config/profile.yml` (this repo is public).

---

## Strategy (read first)

Remote's **must-haves gate on transferable strengths, not Elixir.** Their asks map cleanly to real work:


| Remote must-have                                                                   | Your proof                                                                                                  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Ship secure/reliable/scalable production systems                                   | B2B crypto on/off-ramp payments backend (NestJS/TS) + block indexer relay service                           |
| Design/adopt automation workflows, improve via iteration                           | **HRIS→platform integration sync** (centerpiece) + indexer redesign: forward + backward + cleanup jobs      |
| Think in systems: specs, break down plans, instrument verification, close the loop | Indexer: dedup so each tx reports once; retention/cleanup so Postgres doesn't bloat; relay tells services a tx is paid |
| Postgres                                                                           | Indexer crash-recovery on PostgreSQL; app DBs                                                               |
| CI/CD (GitLab/GitHub/Jenkins)                                                      | GitHub Actions on EC2                                                                                       |
| AI fluency / automation capabilities                                               | AI-assisted dev workflow day-to-day                                                                         |
| *(nice-to-have)* K8s, Docker, Next.js, React/Vue                                   | Docker; React + Next.js are core                                                                            |


**Elixir is NOT in the must-haves.** Handle it with a learning-plan angle (below), not avoidance.

---

## Contact / standard fields

- **First name:** Hana
- **Last name:** Aliyah Mufidah
- **Email / Phone:** *(private — see config/profile.yml)*
- **Resume/CV:** output/cv-hana-aliyah-mufidah-remotecom-2026-07-11.pdf
- **GitHub URL:** [https://github.com/aliyanamu](https://github.com/aliyanamu)
- **City:** Yogyakarta, Indonesia

## Pre-screen selects

- **Years of professional backend/full-stack experience:** 6+ years
- **Years of Elixir:** 0 — learning (see plan). Frame: functional paradigm transferable from JS/TS.
- **Base salary expectation (USD):** $75,000
  - Backed by Remote's OWN published band for this role in **Indonesia (Bandung): **$51,850–$**116,650**. $75k = mid-band, defensible, still easy-approve. Negotiate from here; do NOT anchor at$60k (near floor). Remote policy: pays above in-location rates.
- **Availability to start:** Immediately
- **Legally authorized to work where domiciled?** Yes (Indonesian citizen, working remotely)
- **Require visa sponsorship?** No (fully remote from Indonesia)

---

## Paste-ready answers

The canonical, paste-ready answers live below under **"Free-text answers — refactored to match the live form."** That is the single source of truth. (An older dash-heavy draft set used to live here and has been removed to avoid pasting the wrong version.)

Backup interview story not asked on the form but worth having ready: the **HRIS to platform sync** at ION. Two systems drifted and got reconciled by hand, so I built an idempotent sync (pull, diff against current state, apply only real changes) that ran repeatedly without duplicating or corrupting data, and hardened it as edge cases showed up (partial records, field mismatches, ordering). Same instinct as the indexer: take a fragile manual flow and make it stay correct on its own.

---

## Elixir learning-plan angle (if asked)

- **Honest framing:** "I haven't shipped Elixir yet. I've shipped a lot of correctness-critical backend, and functional/immutable thinking is already how I reason about reliable systems."
- **Concrete plan:** working through Elixir + Phoenix basics (pattern matching, GenServer/supervision trees, Ecto for Postgres); the OTP worker/supervision model maps to the forward/backward/cleanup job design I already built imperatively.
- **Bridge:** JS→Elixir transfer — I already reason in pipelines, immutability, and message-passing (webhooks, workers); Phoenix + Ecto + Postgres overlaps with my current Postgres/API work.
- **Ask for it:** happy to do a take-home or pairing in Elixir to show ramp speed.

---

## Proof points (from CV + Nespay codebase)

- **Nespay (Apr 2025–present):** NestJS/TS backend for B2B crypto payments; wallet transactions, invoicing, Xellar/Privy; KYC (Sumsub, Kredibel); AWS (EC2, IAM) + GitHub Actions CI/CD; core architecture ownership.
- **Block indexer (relay service):** forward indexer (real-time block scan) + backward indexer (gap fill, configurable to re-scan >7 days after an outage) + periodic cleanup job (prunes data older than ~3 days to keep **PostgreSQL** from bloating); Redis dedup so each tx reports once; notifies other services when a tx is paid. Goal: lean middle service, not long-term storage.
- **HRIS→platform integration sync (ION):** idempotent data-sync automation replacing manual reconciliation.
- **Ultra Voucher automation:** replaced manual Excel voucher process with generation + status tracking + reporting.
- **AWS Certified Cloud Practitioner** (2024). **EDU Chain Hackathon** — 3rd, DeFi track (2025).

## Before submitting — you must provide

- ✅ GitHub · ✅ salary ($75k, mid-band) · ✅ available immediately · ✅ CV PDF generated
- Rewrite the free-text drafts in your own voice (Remote values authentic, non-AI-pasted answers).

---

## Values match — Remote's 4 values (corrected 2026-07-12 from the live values page)

Actual current values: **Care, Innovation, Intensity, Excellence.** Kindness has evolved into **Care**, and **Ownership is folded inside Care** (personal responsibility, accountability, no micro-managing), it is NOT a standalone value anymore. Do not say "Ownership is a value." Your genuine top pick is **Innovation**, with **Care** second.


| Value | What Remote means | Your honest proof |
| ----- | ----------------- | ----------------- |
| **Innovation** (your top pick) | Move fast, take initiative, integrate new tech, no complacency, calculated risk | You like fast-moving tech; your work is adding new capabilities into live systems without breaking what people depend on. Web3/crypto payments, DeFi hackathon 3rd, AI-assisted dev workflow. |
| **Care** (Kindness evolved into this; includes Ownership + recognition) | Assume good intent, no blame culture, own outcomes, recognize others | ION **Praise feature** you built (recognize someone, tag the skill, feeds their rating + shows in feed) = recognition operationalized, like Remote's #thanks channel. Code reviews as questions not verdicts. Owned Nespay backend + drove the indexer redesign (leaner relay, dedup, cleanup) unprompted. |
| **Excellence** (exceptional quality, high bar) | Correctness, reliability, coaching feedback | Indexer built to be correct and lean: dedup so nothing double-reports, cleanup so the DB stays healthy, and configurable backfill so it recovers after an outage. AWS Certified. |
| **Intensity** | _(full description not captured from the page yet — confirm before leaning on it. Likely energy/urgency toward goals.)_ | Pivoted geophysics → software; self-directed learner (Korean, now Elixir); ships and owns outcomes. |


**Interview tip:** If asked "which value resonates most?", lead with **Innovation** (integrating new tech into live systems without breakage) and back it with **Care** (the ION Praise-feature recognition story). Do NOT mention Ownership as if it were a separate value. Pick two you can defend with a story, don't claim all four.

- **CV enhancement (later):** bullets are descriptive but lack metrics — the one gap vs. reviewed ATS examples. When you have rough numbers (indexer throughput/day, payment volume, automation time saved, uptime/latency), tell me and I'll quantify them. NOT fabricating any.

---

## FULL APPLICATION FORM — all 24 questions (answer key)

> ⚠️ Rewrite every free-text answer in your own voice before pasting. Remote screens hard for authentic, non-AI answers — Q21 is literally a test of that. Q17/Q21/Q20 must reflect YOUR real memory; the drafts below are scaffolding, not final copy. Confirm the ⚠️ selects.

### Contact &amp; basics (Q1–7)

1. **First Name:** Hana
2. **Last Name:** Aliyah Mufidah
3. **Email:** *(config/profile.yml)*
4. **Phone:** *(config/profile.yml)*
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
17. **Non-technical stakeholder conversations?** Yes.

### Compliance (Q22–24)

22. **Consent to brighthire.ai interview recording?** Yes (recommended; declining is allowed and doesn't hurt) ⚠️ your call.
23. **Privacy notice:** Acknowledge/Confirm.
24. **California applicant notice:** "I am not a California resident".

---

### Free-text answers, refactored to match the live form (8 questions, in order)

> Rewritten 2026-07-12 in plainer voice, no dashes, AI tells stripped. Still read each aloud once and swap a word or two so it's unmistakably yours. Two of the eight are dropdowns (marked SELECT).

**1. What makes you interested in working with Remote?**  
For me the biggest draw is honestly that Remote lets me actually work remotely. I'm in Indonesia, and Remote is a big reason a company somewhere else can hire someone like me without drowning in compliance paperwork. There's also real overlap with what I've already done. At ION I worked on HR related systems, including a sync from an HRIS into our platform, so I know firsthand how painful integrations between third parties can get. For a platform like Remote that has to stitch a lot of systems together, that kind of work feels familiar. The way you work fits me too. Async, high ownership, not a lot of ceremony. In my current role I already work pretty independently, with just a weekly sync instead of daily standups, so that setup isn't new to me. Most of the stack is already mine: React, Next.js, Postgres, AWS, CI/CD, and Elixir's the one new piece, which honestly is part of the appeal. My background's pretty varied, and I think a lot of it lines up with what you need.

**2. You've seen our values page. What resonates most?**
Yeah, I read it. Innovation is the one that resonates most with me. Tech moves fast and I actually like that part. What I enjoy is taking something new and working it into a system that's already running, without breaking what people depend on. A lot of my work looks exactly like that, adding capabilities to live systems carefully instead of building from a blank slate. Care lands with me too, especially the way you've made it part of the day to day with things like the #thanks channel. At ION the platform I worked on had a Praise feature. You could recognize someone, tag the specific skill you were praising, and it fed into their rating and showed up in the feed so their work actually got seen. Building it taught me how much a small, genuine thank you matters, and how good it feels to know the thing you did mattered to someone. So seeing Remote bake recognition into how the company runs feels familiar to me.

**3. Have you developed, maintained, and delivered production-ready backend code in a professional setting?**
SELECT → **"Yes, with other languages"** (Node.js / NestJS / TypeScript. Honest: not Elixir, not Ruby.)

**4. Our backend is built in Elixir. Could you share your experience with the language and your thoughts on it? If you don't have experience with Elixir, how would you approach learning it, and what do you find appealing about functional programming?**
I want to be upfront that I haven't used Elixir in production. My backend work has mostly been in Node, NestJS, and TypeScript. That said, from what I've read about it, some of it feels familiar. The on/off ramp payments dashboard I work on now leans on a lot of small background processes and message passing to stay reliable, and my understanding is that's fairly close to how processes and OTP work in Elixir, so I don't think the mental model would be a huge jump for me. If I were learning it, I'd start with the language basics and pattern matching, then move to Phoenix and Ecto since those overlap with the Postgres and API work I already do. I'd probably rebuild a small piece of something I've worked on before, just to pick up the language on familiar ground. What appeals to me about functional programming is that it makes state harder to hide. Immutability tends to mean fewer surprise bugs, which matters when the system is handling payments. I'd be glad to do a take home or a pairing session so you can see how I pick it up.

**5. Do you have experience with non-technical conversations with other stakeholders (i.e. product)?**
SELECT → **Yes.**

**6. An example of a product or project you led through collaboration with stakeholders, product, and design.**
At ION I led the rework of the time off and work timeline part of our platform. It really started as a product problem, not an engineering one. Managers were stuck approving requests one at a time, and time off didn't know anything about public holidays or team objectives, so people's plans kept colliding. So I sat with product to work out what people actually needed, with design on how bulk approvals and the timeline should feel, and with HR and a couple of managers to catch the weird edge cases. Then I built bulk approvals and wired time off into public holidays and objectives so the timeline showed reality. Something slow and error prone turned into something a manager could read at a glance. What stuck with me is that the code was the easy half. Getting the spec right with the people who aren't engineers came first, and that's where the value actually was.

**7. Proudest achievement from your last two years. Why?**
The block indexer I built at Nespay. Its job is to sit in the middle, watch the chain, and let our other services know when a transaction has actually been paid. The tricky part was that the first version tried to hold onto everything it scanned, and that got expensive fast. Postgres kept bloating with data we didn't really need. So I redesigned it around what the service actually needs to do. A forward indexer reads new blocks as they come in, a backward indexer fills any gaps and is configurable enough to re-scan more than a week back if we ever have an outage, and a periodic job clears out anything older than a few days since we don't need to keep it around. I'm proud of it because it does one job well and stays cheap to run. It relays what matters, forgets what it doesn't, and holds up even when something upstream goes down. It's the clearest case of me owning a system end to end and keeping it simple on purpose.

**8. Do you use AI coding assistants? A time you rejected or rewrote the output, what it missed, how you caught it.**
⚠️ CONFIRM THIS IS A REAL MEMORY before pasting. Q8 is Remote's authenticity test — it has to be a true incident. The draft below fits the real indexer, but swap in your own if you have a sharper one.
Yeah, every day, mostly Claude and Copilot. Here's one I threw out. While I was working on the indexer, I had an assistant draft part of the logic that notifies our other services a transaction is paid, and the version it gave me could fire that same notification more than once. It didn't account for the backward indexer re-scanning overlapping ranges, which it does on purpose to fill gaps, so the same transaction would come through again on a re-scan and get reported twice. That's a real problem when another service is going to act on "this is paid." I caught it because I knew how the backward indexer works, so duplicates were always going to happen. I added a dedup step so each transaction only ever reports once. The way I see it, AI is good for a first draft, but on anything where a mistake means acting twice, I have to be the one who catches what it misses about how the system actually behaves.