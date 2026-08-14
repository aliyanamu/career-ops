# LinkedIn AI-Powered Conversation (AI Trainer) — Prep

_Created 2026-08-14._

**Start here:** [AI projects checklist / waiting list](https://www.linkedin.com/jobs/ai-projects-checklist/)
Sources: [Become an AI trainer](https://www.linkedin.com/help/linkedin/answer/a9306168) · [AI-powered conversation](https://www.linkedin.com/help/linkedin/answer/a10346037)

## What this actually is

Not a job interview. It is the screening step for LinkedIn's **AI Trainer** program (paid data-annotation projects). The conversation output feeds project matching, not a hiring manager.

Mechanics, per the help pages:

- Voice-based. AI asks, you speak, it responds and follows up. Asynchronous, do it when you want.
- **Minimum 3 questions** for it to count as complete. Start with "Start conversation", finish with "End conversation".
- Questions are **generated from your LinkedIn profile**, not from your CV. Whatever is not on the profile will not be asked about.
- Scored on **relevance, clarity, and alignment with your experience and the project requirements**.
- If you apply to an AI Trainer project, the matching team gets the **full transcript, the audio recording, and AI-generated insights**. Assume a human reads it.
- It may also suggest profile edits afterward.

Separate track in the same program (do not confuse them): an **AI trainer skills assessment** covering five annotation task types — Evaluation, Preference Ranking, Rubric Work, Supervised Fine Tuning, Agentic Work. Plus government-ID profile verification. Those three (verify → conversation → assessment) are the checklist.

Reported feel of the voice flow: roughly 30 seconds between your answer ending and the next question, similar to a voice-mode chat assistant. You can pause and think before speaking.

---

## Yes, update LinkedIn first

The questions are built from the profile. Your profile is currently a thinner and partly stale version of `cv.md`, so the AI will generate shallower questions than you can answer, and the domain match will be worse.

### Stale / wrong right now

| Field | LinkedIn says | `cv.md` says |
|---|---|---|
| ION title | Full Stack Engineer | **Productivity Engineer** (corrected 2026-08-13) |
| Nespay title | Full Stack Engineer | Mid-level Software Developer |
| Ultra Voucher start | Dec 2018 | Nov 2018 |

Pick one and make both files agree. The transcript gets compared against the profile.

### Missing, and each one is a question you are giving up

- **Go.** The indexer is your only Go work and it is your best systems story. Absent from the profile.
- **Korean (conversational).** Biggest single gap for *this* program. Annotation work is heavily language- and locale-segmented. Native Indonesian + professional English + conversational Korean is a rarer profile than another JS engineer. No TOPIK, so list it as conversational only.
- **Testing:** Playwright (3+ yrs), Selenium, Mocha. Evaluation work is adjacent to test design.
- **AWS Certified Cloud Practitioner** (Sep 2024). Certifications are explicitly named as a matching signal.
- **3rd place, DeFi Track — EDU Chain Hackathon (May 2025).**
- **Data stores beyond PostgreSQL:** MySQL, MongoDB, Neo4j, Elasticsearch, Redis.
- **Code review.** You do peer review at both Nespay and ION. Review-against-a-standard is literally what Rubric Work and Preference Ranking are. Say it on the profile.

### One line worth adding to About

That you work daily with AI coding assistants and have opinions about where they fail. It is the single most on-target signal for this program and it is currently invisible.

---

## Likely question bank

Grouped by what on your profile would trigger them. The AI follows up, so each entry has the obvious second question underneath.

### A. Domain depth (it will probe whether you actually did the thing)

1. Walk me through the crypto-to-fiat payment platform you worked on. What was your part of it?
   - ↳ What was the hardest technical problem in it?
2. You mention wallet integrations. What does integrating a wallet provider actually involve?
   - ↳ What broke, and how did you find out?
3. Tell me about a distributed systems problem you solved.
   - ↳ How did you verify the fix held under load?
4. What does your CI/CD setup look like, and what did you change about it?
5. How do you decide between PostgreSQL and something else for a given workload?
6. Describe the architecture of a system you own end to end.

### B. Judgment and quality (closest to the actual annotation work)

7. How do you evaluate whether code is good? What is your standard?
8. Describe a time you reviewed someone's work and disagreed with it.
9. How do you handle ambiguous requirements?
10. Tell me about a time you were wrong about a technical decision.
11. When you have two working solutions, how do you pick?

### C. AI-specific (this is an AI trainer screen, expect at least one)

12. How do you use AI tools in your own engineering work?
13. Where do AI coding assistants fail you? Be specific.
14. If you had to grade two AI-generated answers to the same question, what would you look at?
15. What would make you trust an AI-generated code change enough to merge it?

### D. Background and communication

16. Tell me about your professional background.
17. You studied geophysical engineering. How did you get to software?
18. What kind of work do you want more of?
19. You have worked remotely for years. How do you communicate across time zones?
20. What are you an expert in that most engineers in your field are not?

---

## Your anchors (facts only — build the sentences yourself, out loud)

Do not memorise scripts. These are the true things to reach for. Full versions live in `interview-prep/story-bank.md`.

**TRON signature bug** — best answer to "hardest bug", "debugging across a vendor boundary", "tell me about being wrong".

Say it in plain words. The interviewer is not a blockchain person.

- Our crypto transfers started failing in production. The blockchain kept rejecting them with a signing error
- A signature is proof that the wallet owner approved the transfer. Most systems get told who signed. TRON is not told. It works out who signed by reading the signature itself
- The catch is that the maths leaves two possible answers, so TRON needs one extra byte on the end saying which of the two it is
- We signed through a wallet provider whose signing service is general purpose. It does not know it is signing for TRON, so it hands back the signature and stops. That extra byte is TRON's requirement, not something the provider got wrong
- Fix: try the first option, ask the signature which wallet it says signed, compare that to the wallet we know sent the money. Match, use it. No match, try the second. Neither matches, stop and refuse to send
- There was a second cause underneath: we were handing the provider the data in the wrong format, so it was signing the wrong thing. Two bugs behind one error message, which is why the first fix alone did not make it go away
- The point you want to land: the fix made it work, the refusal to send made the next one cheap. Before, a bad transfer went out and failed later with no clue why. After, it stops at signing time and the error says exactly what did not line up
- **If they push for detail**, then reach for the terms: ECDSA `r`/`s` = 64 bytes, recovery byte `1b`/`1c` = the 65th, resolved with `ecRecover`, the provider call is `raw_sign`
- Say **REST API**, never SDK. She hand-wrote the NestJS client

**Find-then-lock race** — best answer to "subtle bug", "correctness under load", "code that survives maintainers".
- Invoices matched to a hot wallet from a pool; find-then-lock is not atomic
- Replaced with amount-range locking plus LRU selection, so the pool stays parallel
- Reasoning left as a comment in `active-wallet-selection.service.ts` so nobody "simplifies" it back
- No measured metric exists. Describe the failure mode, do not invent a number

**Go block indexer** — best answer to "distributed systems", "architecture", "keep it simple".
- Forward indexer (real-time), configurable backward indexer (gap backfill, re-scan a week+ after outage), periodic cleanup pruning to a few days
- Redis dedup, because backward re-scans overlap on purpose
- NestJS backend consumes its webhooks
- **Credit:** she did not start it. "Contributed to", "took over and extended", "the team's indexer". Never "built from scratch"
- Do not say: settlement, finality, reorgs, confirmation worker

**Gas funding automation** — best answer to "build vs buy", "what would you do differently".
- Per-wallet thresholds, refill amounts, funding wallet, fee-spike protection; TRON activation and batched energy rental under Redis locks
- Built rather than bought on cost grounds, then never revisited as the vendor changed underneath
- The reflection: toil never raises an alarm the way an outage does
- No metrics recorded. Do not invent a saving

**CI/CD** — only real number you have.
- GitHub Actions on EC2, split into parallel jobs ordered by priority, **15 min → 8 min**
- The "1–2 deploys/week → 10+/day" claim is **not** accurate. Do not use it

**Multi-tenant rebuild (ConnectX)** — architecture and authorization.
- Tiered permissions at app, company, and user level
- Permission tiers are cheap up front, brutal to retrofit

**Natural-language people search (ConnectX)** — product and ranking.
- Free text like "who excels in web design with Framer and Base44 in London", relevance-ranked
- Signal came from praise tied to skills, so ranking reflected real endorsement not self-reported tags
- ⚠️ Confirm before you say it out loud whether this was semantic/embedding or keyword ranking. Do not imply LLM or vector search unless it was

**Xellar → Privy migration** — disagree and commit.
- Decision was made above her; the implementation was hers
- Xellar: slow wallet creation, intermittent errors, no TRON

**AI workflow** — for section C.
- Compound-engineering style docs, mermaid diagrams for alignment, prompts that instruct the assistant to ask rather than assume
- Where they fail: assistants inventing details rather than asking. That is a real, specific, credible answer

**Guardrails**
- ION had no QA team. Bugs came from user reports
- No team sizes, no reporting lines
- IELTS 7.5 is a past score, the certificate has expired
- Korean is conversational, no TOPIK. No Japanese, no JLPT
- Nespay is Apr 2025 – Jul 2026, never "Present"

---

## Delivery notes

- Quiet room, mic permissions on. It records audio, and the audio goes to the matching team.
- Three questions is the floor, not the target. Answer more if it keeps going.
- Situation → action → result, spoken. Aim for 60 to 90 seconds per answer, then stop. The one piece of feedback testers report getting is to stop rambling.
- Say "I don't know" or "that predates me" where true. The transcript is read by a human and inconsistency with your profile is the thing that sinks it.
- Name specifics: TRON, `ecRecover`, Redis locks, GitHub Actions, 15 to 8 minutes. Specificity is one of the three scoring axes.
