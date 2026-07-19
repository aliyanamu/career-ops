# Full-Stack Engineer — Somnia

Apply at: **https://jobs.ashbyhq.com/somnia/6809fbd3-836a-4a83-9faf-1a075394f0f5** (Ashby form, direct)
Tailored CV: `output/cv-hana-aliyah-mufidah-somnia-2026-07-19.pdf`
Evaluation: [022](../reports/022-somnia-2026-07-19.md) — 4.3/5
Posted 2026-06-11. Remote, "Europe or Asia (preferably)" — Indonesia qualifies.

## Fit snapshot

Every Must Have is covered:

| Must Have | Evidence |
|-----------|----------|
| Strong TypeScript across the full stack (the core) | NestJS backend + React/Next Backoffice at Nespay; 8 yrs JS/TS |
| Some Golang where it fits | Multi-chain block indexer in Go — production, not "some" |
| Production-ready frontends | Backoffice Dashboard, ConnectX people search UI |
| Strong back-end — APIs, services, data layer | NestJS, webhooks, RPC, PostgreSQL/Redis |
| Genuine interest in crypto | Nespay is crypto-to-fiat; wallets, RPC, on/off-ramp, KYC; DeFi hackathon 3rd place |
| Ownership and self-direction | Set up core architecture, AWS auth, CI/CD; led Backoffice end-to-end |
| Prototype fast, then harden | Hackathon build vs. indexer outage-recovery work |

Honest framing on the nice-to-haves:
- **SDK / CLI / library with docs** — no published one. Say so. Pivot to the Go indexer as internal platform tooling the team builds on, with a consumed webhook contract. Same muscle, unpublished.
- **Solidity / EVM contract authoring** — she integrates against contracts and RPC, she has not shipped production Solidity. Check what she actually wrote at the EDU Chain hackathon before claiming or disclaiming.
- **Design-led UI polish** — lead with product reasoning instead (CG Voucher Generator replaced hand-tracked Excel sheets with real status visibility).

## Company signals (scanned 2026-07-19)

- **Mainnet + SOMI token live since Sep 2025.** Chain ID 5031, MultiStream Consensus (validators publish data chains in parallel, finalization on a separate consensus chain).
- **Rebranded to "the Agentic L1" in April 2026.** The 2026 roadmap is three pillars: reactive features, prediction markets, AI integration.
- **Prophecy Social launched 2026-04-29** — prediction markets where AI agents pull evidence and reach consensus on outcomes onchain. 5,000+ users and 2,000+ markets in under a week, all created and resolved without manual intervention. Free-to-play, soulbound PST in-game token, public accuracy leaderboard. They are also hiring a Product Marketing Manager specifically for Prophecy.
- **Recent shipping:** USDso stablecoin with Frax (May 2026), LI.FI integration for cross-chain liquidity across 60+ chains (May 2026), developer docs refresh (June 2026).
- **Backing:** Somnia Foundation, backed by Improbable (UK). Initial funding via MSquared's $150M round (a16z crypto, SoftBank, Mirana, CMT Digital, SIG).
- **SOMI price:** ~$0.098, ~$15.7M market cap, down ~95% from ATH. Affects comp, not legitimacy.

### What the signals mean for her pitch

**Plus points to lead with:**
1. Prophecy is a consumer app on top of an L1 — exactly the "consumer-facing products through developer technologies through internal tooling" spread the JD describes. Her Nespay work is the same shape: consumer-facing dashboard, backend services, and the Go indexer underneath.
2. LI.FI cross-chain and USDso stablecoin mean value movement across chains is a live product concern. That is literally what Nespay does — multi-chain, crypto-to-fiat, settlement in fiat with KYC.
3. Their indexing/data needs are real: markets resolving onchain in seconds requires reliable chain data. Her forward/backward/cleanup indexer with Redis dedup is the most directly relevant thing she has built.

**Gaps they most need filled:** developer technologies (SDK, CLI, starter kits) is the one that shows up in both the JD and their docs-refresh activity. It is the highest-leverage thing to close.

**Optional but high-return:** a small TypeScript client wrapping Somnia RPC — typed client, one CLI command, README. A weekend of work. It closes the only real gap, and building it unprompted *is* the "watch the ecosystem, spot gaps, propose and build" responsibility they list. Mention it in the form if it exists; do not promise it if it does not.

## Application form answers

Ashby form. Adapt to the actual fields — these are the standard ones.

**Why are you interested in this role?**

Most full-stack roles stop at the app layer. This one runs from consumer apps down through SDKs to internal tooling, which is the range I have actually been working in. At Nespay I built the NestJS backend and the React dashboard on top of it, and I work on the Go indexer that feeds both. Same three layers you are describing, smaller chain.

**Why Somnia?**

Prophecy Social is the part that got my attention. Markets created from a prompt and resolved onchain by agents in seconds is a hard data problem underneath a simple product surface, and that gap is where I like working. The LI.FI integration and USDso are also close to home: I spent the last year on multi-chain value movement and fiat settlement at Nespay, so the problems you are solving are ones I have hit.

**Tell us about a relevant project or achievement.**

I work on a multi-chain block indexer in Go that relays on-chain payment data to our backend. It runs a forward indexer for live blocks, a configurable backward indexer that backfills gaps after an outage, and cleanup jobs that prune stale data so PostgreSQL stays lean. Redis dedup guarantees each transaction is reported once. Designing for the outage case rather than the happy path is what made it reliable, and it is the piece the rest of the team builds against.

**What makes you a good fit?**

TypeScript is my core and Go is real for me, not a line on a list. Add wallets, RPC, on/off-ramp, and KYC from a year of crypto-to-fiat payments work, and it covers the must-haves directly. I will be straight about the gap: I have not published an SDK or CLI, and I integrate against contracts rather than writing Solidity. The internal tooling instinct is there, it just has not shipped publicly yet.

**How did you hear about this role?**

Through my own job-search workflow that scans Ashby, Greenhouse, and Lever public APIs. I evaluated it against my criteria and it scored near the top.

**Do you use AI tools?** (if asked)

Yes, daily and as a multiplier. I keep compound-engineering docs so context carries across sessions, use mermaid diagrams to align on design before writing code, and prompt for questions back at me rather than answers, so the model surfaces what I have not thought through. It changes how much I can own end-to-end, which is the point of this role.

## Before submitting

- [ ] Confirm what she built at the EDU Chain hackathon — determines the Solidity answer
- [ ] Decide on the weekend RPC client. If built, add the repo link to the form
- [ ] Ask for the base salary number early. See Block D of the report: request token grants denominated in USD value at grant, not a fixed SOMI count
- [ ] Confirm base is paid in fiat or stablecoin, and to which jurisdiction
- [ ] Attach `cv-hana-aliyah-mufidah-somnia-2026-07-19.pdf`

**Do not submit until Hana reviews.**
