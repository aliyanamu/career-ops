# Senior Full Stack Engineer, Product & Platform — Ottodot

Apply at: **https://airtable.com/appytuR6ewIdKWEFA/paghONUKkNofMGqyJ/form** (Airtable form, direct, no recruiter)
Tailored CV: `output/cv-hana-aliyah-mufidah-ottodot-2026-07-22.pdf` (source: `cv-ottodot.html`)
Evaluation: [024](../reports/024-ottodot-2026-07-22.md) — 4.3/5
Remote, full-time, working hours 10am–6pm GMT+8 = **9am–5pm her time**.
Country check requested: **Singapore. Not blocked.** No Israel tie, no US region lock.

## Fit snapshot

| They want | She has |
|-----------|---------|
| Strong full-stack: frontend, backend, database | React/Next dashboard + NestJS services + PostgreSQL at Nespay; multi-tenant platform at ION |
| Next.js, React, TypeScript | 8 yrs JS/TS, both frameworks in production |
| Postgres | Yes, daily |
| Judgment on auth and permissions | ConnectX multi-tenant: permissions at app, company and user level |
| Judgment on billing | Invoicing, invoice-to-wallet assignment, settlement paths at Nespay |
| Judgment on migrations | Ran the Xellar → Privy wallet provider migration |
| Judgment on data quality | Amount-range locks closing a race; dedup so nothing is counted twice; refuse-to-send on signature mismatch |
| Messy real-world codebase | Five years maintaining a large legacy codebase at ION |
| Cares about product quality | CG Voucher Generator replaced spreadsheet tracking with real status visibility |
| Uses AI coding agents as leverage | Claude daily, with a real method (see Q2) |
| Most senior technical person, 2–3 person team | Architecture, AWS auth, CI/CD, backend and dashboard, all on a small team |
| Interest in education, kids, games | **Honest gap.** No edtech, no games, no child-facing product. Bridge, do not fake. |

**Named-tool gaps: Supabase, Tailwind, Vercel.** None are on cv.md, none are on the tailored CV, and none are hard. Say so plainly if asked. Postgres, Next.js and access-control models are the underlying things and those are daily work.

## Company signals (scanned 2026-07-22)

- **Singapore edtech, founded April 2019** by Khor Le Yi (CEO) and Wong Lei Lei. Iterative accelerator, W22 batch.
- **What they actually sell:** live 75-minute primary Math and Science classes, max 4 students, taught by Singapore tutors on Google Meet, with about 20 minutes of purpose-built Roblox gameplay aligned to the MOE syllabus. The games are the hook; the teaching is the product.
- **200+ Roblox Math & Science games built.** 4,300+ parents per their own site. Learners in 4 countries, expanding into Southeast Asia.
- **Funding:** ~$1.7M total, round reported October 2025 with Iterative joining. Backing/support from Enterprise Singapore, Temasek and IMDA. Seed stage — real money, not deep money.
- **Founder's public stance:** Le Yi Khor has been profiled on the theme that efficiency has its place but never at the cost of a child's wonder. They also publish parent-facing safety content (a guide to Roblox parental controls), so trust and safeguarding are things they care about publicly.
- **Their Medium (ottodot.medium.com) is from 2020 and 2021:** "Ottoworld: Making a Virtual Disneyland for Learning", "We launched our latest Edu game on Roblox! Parkour Rangers" (built in about 6 weeks), "My Love-Hate Relationship with Math" (a critique of rote learning), plus design-sprint and learning-design intern posts. They started as an educational games studio. The tuition-class business came after. Nobody has written there in years, which is itself a signal about where the effort went.
- **Recognised by the Roblox Accelerator Program.** There is also a separate coding product at coding.ottodot.com ("Coding Fundamentals with Roblox"), worth knowing about since the JD never mentions it.
- **What the JD tells you about the codebase:** founder-built, fast-moving, explicitly "messy." Login, account access, dashboards, class data and homework flows all need stabilising. The self-serve booking and enrollment system is the next thing to build.

### What the signals mean for her pitch

**Plus points to lead with:**
1. They are not asking for edtech experience, they are asking for someone who can make a founder-built platform trustworthy. Stabilising login, account access, permissions and data correctness is exactly the last seven years of her work.
2. Money paths. A self-serve enrollment funnel is checkout plus entitlement plus the class actually appearing. She has spent a year on the correctness of money flows, including the specific class of bug where two things claim the same resource. That is the same bug as two parents booking the last seat.
3. Multi-role permissions. Students, parents, teachers, ops is four roles with four views of the same data. ConnectX was exactly that shape, with permissions layered at three levels.
4. AI as leverage is a stated requirement, and she has a genuine method rather than enthusiasm. In a 2–3 person team that is the difference between shipping and not.
5. Remote track record: five fully remote years at ION. And 10am–6pm GMT+8 is 9am–5pm for her, so there is no timezone story to manage.

**Gaps they most need filled:** someone with production judgment who can take over technical decisions from the founder. Not a domain expert. The education-interest question is the only place she is genuinely thin — answer it honestly and briefly, then move.

**Do not:** lead with Web3. It is context for how she thinks about correctness, not the headline. On this application it is a distraction at best.

## Form fields

| Field | Answer |
|-------|--------|
| Full Name | Hana Aliyah Mufidah |
| Email Address | mufidah.hanaaliyah@gmail.com |
| Country | Indonesia |
| Phone Number | +62 858-1099-4772 |
| Expected Salary | **SGD 6,500 per month, negotiable.** |
| LinkedIn Profile URL | https://linkedin.com/in/hana-aliyah-mufidah |
| GitHub / Portfolio URL | https://github.com/aliyanamu/career-ops (the code. The live demo goes in the Q2 answer, so both are covered.) |
| Resume / CV | `output/cv-hana-aliyah-mufidah-ottodot-2026-07-22.pdf` |
| Current / Most Recent Role | Software Developer, Nespay (PT Webtiga Teknologi Utama), Apr 2025 – Jul 2026 |
| Total Years Engineering Experience | 7.5 |
| AI Coding Tools Used | Claude |
| Availability / Notice Period | Available immediately. |

### Note on the salary number

The same posting mirrored on beBee (via TheirStack) shows a band of **SGD 5,000–9,000 per month (SGD 60,000–108,000 annually)**, listing the entity as **Ottodot PTE LTD**, fully remote, applications until **17 Aug 2026**. Treat the band as indicative rather than official — aggregator salary figures are often inferred and this one did not come from Ottodot's own form.

**Going in at SGD 6,500 / month, negotiable.** That is mid-band, not the floor, and it is well supported: 7.5 years, and at Nespay you owned architecture, AWS auth, CI/CD, the backend and the dashboard. A mid-band number leaves room to move in both directions; a floor number only leaves one.

Two things to keep in mind:

1. Write it as **"SGD 6,500 / month, negotiable"**, not as a bare figure. It reads as an opening position rather than a limit.
2. If they push back on budget — likely, at seed stage — the honest framing is that you are remote from Indonesia at GMT+7 and the total cost to them is lower than a Singapore local hire at the same number. That is a reason to discuss, not an apology.

Also worth settling early: **employment or contractor.** A Singapore company hiring in Indonesia usually goes contractor or EOR, and that changes the net figure materially.

## Pre-interview question answers

### 1. Tell us about a project you led or drove end to end, ideally with limited time, people, or budget. What did you cut, what did you protect, and what was the hardest part?

Moving our wallet infrastructure from one provider to another, at a payments company with a small engineering team. The old provider was slow to create wallets, failed intermittently, and had no coverage for one of the chains we needed. I did not make the call to switch providers, but I executed the migration.

What I cut: their SDK. Writing our own REST client looked like more work and turned out to be less, because when a call failed we got the provider's actual message instead of a generic HTTP error.

What I protected: correctness on the money paths, without exception. Every transaction verifies before it goes out, and if the signature does not check out against the sender we refuse to send it rather than trying our luck. Around the same work I fixed a race where two invoices could claim the same wallet, by locking on the amount range instead of checking first and locking after.

The hardest part was a signing failure that only showed up in production on one chain. The provider returned a signature missing a byte that chain requires, so nothing we sent was accepted. Finding it meant working backwards from a failure code through the hash format to the signature itself, then resolving the missing piece by testing each candidate against the sender until one matched. The part I would keep is not the repair itself but the check we put underneath it. If the signature does not recover to the sender, we do not broadcast the transaction at all. The repair only covers the cause I found. The check covers the ones I have not seen yet, and in a payment system a transaction that fails loudly is much easier to recover from than one that goes out wrongly signed.

### 2. What have you built or automated with AI tools in the last month or two? Share a link if you can.

My own job-search pipeline, which is where this application came from. Demo with sample data: https://aliyanamu.github.io/career-ops/?demo=1

It started as a fork and I have been reshaping it. It scans job-board APIs, scores each role against my real profile instead of matching keywords, and generates a CV tailored to the posting. The rule I built it on is that it is not allowed to invent anything about me. If a detail is not in my CV or my config, it asks me or leaves it out. That constraint is why the output is usable.

Two parts I would point at. One is the dashboard: it all used to live in markdown files, and now I can see the pipeline in one place, including which CV went out with which application and what preparation exists for each. The other is cost. Not every source has a clean API, so I use Firecrawl to pull those pages and write the results back into my saved data. After that the scan reads from storage instead of going through a model again. Use the model for the part that needs judgment, then persist the result so the next run does not need it.

On how I work with AI generally: the failure I design around is that it assumes things it was never told and then says them confidently. So I pool context into files before starting, ask for a mermaid diagram of what it thinks it is building so I can see where its picture and mine differ, and end prompts with "if anything is unclear, ask me". That last one changed the most. It is the difference between an agent that produces plausible code and one that stays inside the problem.

### 3. Why are you interested in this role?

Two reasons.

The first is that the job is the work I am best at. Turning something a founder built quickly into something people can trust, meaning login, account access, permissions, dashboards and data that is right the first time, is what I have spent most of seven years doing. I maintained a large legacy codebase for five years and I built a platform from nothing on a small team, so I have seen both ends of that. A self-serve enrollment funnel is also a money path, which is where I have been for the last year. The failure I would worry about first is two parents booking the same seat, and that is a bug I have already fixed once in a different form.

The second is what I find genuinely interesting about it. Students, parents, teachers and ops all want different things from the same product, and the distance between them is wide. I have built dashboards for several roles before, but those were people doing a job inside the same company, so their needs sat much closer together than this. Building for personas this far apart is new to me, and it is what makes this role more interesting than the other full-stack work I am looking at. I do not have edtech on my CV and I am not going to pretend otherwise.

It is also fully remote and your hours are one hour from mine, which is a straightforward yes for me.

### 4. Do you have any questions for us?

What is the most important thing for me to understand about Ottodot that I would not get from the site or the job posting?

You talk about children remembering what they learn, not just finishing a lesson. How do you know that is happening today, and is the platform meant to become the thing that measures it? Parent progress visibility sounds like a UI feature, but it is really a question about what you record and what you can prove.

Your Medium from 2020 and 2021 is about building the games themselves, Ottoworld and Parkour Rangers. Now the game is one part of a taught class. Where does the game sit for you now, the hook that gets a child in or the place the learning actually happens? I ask because I learned AWS through Cloud Quest, so I have been on the user side of this, and the answer changes what the platform has to be good at.

With a team this size, what would be mine to decide outright, and what stays with you?

And practically: is this employment or a contract engagement, and how do you handle hiring outside Singapore?

## Before submitting

- [ ] **Expected salary: SGD 6,500 / month, negotiable.** Confirmed by Hana 2026-07-22. Mid-band against the SGD 5,000–9,000 range on the beBee mirror.
- [ ] Applications close **17 Aug 2026** per the beBee listing.
- [ ] Both links verified live 2026-07-22: demo https://aliyanamu.github.io/career-ops/?demo=1 (sample data, not your real pipeline) in the Q2 answer, repo https://github.com/aliyanamu/career-ops in the GitHub field. Answer says "started as a fork" because it did; do not let that drift into implying you wrote it from scratch.
- [ ] Confirm the AI tools list is only tools you actually use.
- [ ] Consider asking about employment vs contractor in Q4 or waiting for the first call — it is on the list above, cut it if you would rather not raise it this early.
- [ ] Attach `output/cv-hana-aliyah-mufidah-ottodot-2026-07-22.pdf`.
- [ ] Do not mention Supabase, Tailwind or Vercel as things you have used. They are not on the CV and they should not be in the form.

**Do not submit until Hana reviews.**
