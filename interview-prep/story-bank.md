# Story Bank — Master STAR+R Stories

This file accumulates your best interview stories over time. Each evaluation (Block F) adds new stories here. Instead of memorizing 100 answers, maintain 5-10 deep stories that you can bend to answer almost any behavioral question.

## How it works

1. Every time `/career-ops oferta` generates Block F (Interview Plan), new STAR+R stories get appended here
2. Before your next interview, review this file — your stories are already organized by theme
3. The "Big Three" questions can be answered with stories from this bank:
   - "Tell me about yourself" → combine 2-3 stories into a narrative
   - "Tell me about your most impactful project" → pick your highest-impact story
   - "Tell me about a conflict you resolved" → find a story with a Reflection

## Stories

<!-- Stories will be added here as you evaluate offers -->
<!-- Format:
### [Theme] Story Title
**Source:** Report #NNN — Company — Role
**S (Situation):** ...
**T (Task):** ...
**A (Action):** ...
**R (Result):** ...
**Reflection:** What I learned / what I'd do differently
**Best for questions about:** [list of question types this story answers]
-->

### [Systems / Reliability] The multi-chain block indexer (relay service)
**Source:** Report #016 — Remote.com — Senior Backend Engineer (Elixir)
**S:** A B2B crypto payments backend needed a service to watch the chain and tell other services when a transaction had been paid. The first version tried to store everything it scanned, and PostgreSQL kept bloating with data we didn't need.
**T:** Relay on-chain payment data reliably, recover from gaps and outages, and stay cheap to run without hoarding data.
**A:** The service already existed in Go when I picked it up, and I took it over and extended it with the team, reshaping it around what it actually needs: a forward indexer for real-time block scanning, a configurable backward indexer that fills gaps and can re-scan more than a week back after an outage, and a periodic cleanup job that prunes data older than a few days. Redis dedup so each transaction only reports once (the backward indexer re-scans overlapping ranges on purpose). A separate NestJS backend consumes its webhooks and powers the dashboard.
**R:** A lean relay that does one job well, recovers from outages via configurable backfill, and keeps the database healthy.
**Reflection:** The win was scoping it down. It only needs to relay and forget, not store forever, and designing to that kept it simple and cheap.
**Best for:** systems thinking, reliability, worker/job design, resource-conscious design, "keep it simple on purpose", outage recovery.
**Do NOT say:** settlement, chain finality, confirmation worker, reorgs, "moves real money" — that framing is inaccurate. Indexer = **Go**; the consumer backend = NestJS (don't tag the indexer as Node/Nest). See memory `nespay-indexer-architecture`.
**Credit (important):** she did NOT start this service. Someone else wrote the first version; she took it over, extended it, and operates it. Say "contributed to", "took over and extended", "the team's indexer" — never "I built it from scratch" or "I designed it". If asked directly who started it, say plainly that it predates her and describe what she added. See memory `nespay-indexer-architecture`.

### [Debugging / Third-party APIs] The TRON signature that would not verify
**Source:** Report #023 — Privy — Developer Support Engineer
**S:** At Nespay our TRON transfers started failing in production with SIGERROR. We signed through Privy's wallet API, which for TRON only offers `raw_sign` (hash-only signing) because TRON is Tier 2 on their chain support, so it builds and broadcasts nothing for you.
**T:** Find out whether the bug was ours, TronWeb's, or Privy's, and stop broadcasting transactions that could not settle.
**A:** Two separate causes. First, the transaction hash was not normalised the way Privy expects, so I fixed the byte-array conversion before signing. Second, and more interesting: **TRON requires a 65-byte signature with a recovery ID appended, and `raw_sign` — correctly, since it is a generic hash signer — returns the 64-byte `r`/`s` pair and stops.** The gap is a TRON-side requirement, not a Privy defect. So I implemented recovery resolution: append `1b`, run `ecRecover`, compare the recovered address to the sender; if it does not match, try `1c`; if neither matches, throw rather than broadcast.
**R:** TRON signing became reliable, and the failure mode changed from silently broadcasting a bad transaction to refusing to broadcast with a message naming both recovered addresses and the expected sender.
**Reflection:** The lasting lesson is the last part. The fix was worth less than the guard. Failing loudly with the evidence in the error message is what makes the next incident quick, and it is the difference between a bug you fix once and a bug someone else can diagnose without you.
**Best for:** debugging across a vendor boundary, cryptography/signing depth, "tell me about a hard bug", root-cause vs symptom, defensive design, reading someone else's API honestly, why chain-tier support levels matter in practice.
**Detail if pushed:** commits `cd8318dc` (hash normalisation / SIGERROR) and `5a33c51b`. EVM was the easy path by contrast: Privy's `eth_sendTransaction` signs *and* broadcasts.
**Do NOT say:** "SDK". She did not use Privy's SDK. `@privy-io/server-auth` is in `package.json` but is dead code (one type import, one never-registered client class, zero call sites). Everything is a hand-written NestJS/axios REST client. Say **REST API**. See memory `nespay-wallet-architecture`.

**Plain-English walkthrough (use this to explain it out loud, or to a non-specialist interviewer):**

*What a signature actually is.* When you sign something with ECDSA you get two numbers, `r` and `s`, 64 bytes together. The problem: given only `r` and `s` and the message, there are **two** public keys that could mathematically have produced that signature. The maths doesn't narrow it to one.

*Why that matters.* Some chains hand the verifier the public key separately, so the ambiguity never comes up. Others — TRON and Ethereum among them — don't. They *recover* the signer's address from the signature itself. For that to work the signature needs a third value telling the verifier which of the two candidates is the real one: the **recovery ID**, appended as a 65th byte, either `1b` or `1c`.

*Where Privy fits.* Privy's `raw_sign` is a generic "sign this hash" primitive. It doesn't know it's signing a TRON transaction, so it returns the 64 bytes and stops. TRON receives a signature that is one byte short of usable and rejects it with `SIGERROR`. Nobody is wrong here — it's a gap between a general-purpose signer and a chain-specific requirement, which is exactly the kind of seam integration bugs live in.

*The fix.* Rather than guess which byte, resolve it by experiment. Append `1b`, run `ecRecover` (the standard "given a signature, tell me which address signed it" function), and compare the result to the wallet you *know* sent it. Match → correct byte, use it. No match → try `1c`. Neither matches → something else is wrong upstream, so throw instead of broadcasting, with both recovered addresses and the expected sender in the error message.

*Why the throw is the good part.* Broadcasting a bad signature means the failure surfaces later, on-chain, with no context about why. Failing at signing time with the evidence attached turns a multi-hour investigation into a readable error line. The fix made it work; the guard made the next one cheap.

*The other cause, briefly.* Separately, the hash wasn't converted to the byte-array format Privy expects before signing. Wrong bytes in, wrong signature out. Two bugs wearing one symptom, which is why the first fix alone didn't make `SIGERROR` go away.

### [Automation] HRIS→platform integration sync
**Source:** Report #016 — Remote.com — Senior Backend Engineer (Elixir)
**S:** An HRIS and our work-management platform drifted; people reconciled data by hand.
**T:** Keep both in sync automatically without duplicating or corrupting records.
**A:** Built an idempotent sync pipeline — pull, diff against current state, apply only real changes — and iterated as edge cases (partial records, field mismatches, ordering) surfaced.
**R:** Manual, error-prone reconciliation became a background process that stayed correct.
**Reflection:** Same pattern I reused on the indexer: automate a fragile critical flow, then improve it through measured iteration.
**Best for:** automation workflows, integrations, idempotency, "designing/adopting automation and improving via iteration".

### [Concurrency / Correctness] The find-then-lock race in wallet assignment
**Source:** Report #023 — Privy — Developer Support Engineer
**S:** At Nespay, incoming invoices are matched to a hot wallet from a pool. The original selection logic found a free wallet, then locked it. Under concurrent invoices those two steps are not atomic, so two invoices could pass the find step against the same wallet before either lock landed.
**T:** Make wallet assignment safe under concurrency without serialising the whole pool behind one global lock, which would have capped throughput on the busiest path in the system.
**A:** Replaced find-then-lock with **amount-range locking** per invoice, so the lock is taken on the range being claimed rather than acquired after the fact, plus LRU selection to spread load across the pool instead of repeatedly contending on the same wallet. The reasoning is recorded as a comment in `active-wallet-selection.service.ts` so the next person does not "simplify" it back into the race.
**R:** Assignment became correct under concurrent invoices while keeping selection parallel across the pool.
**Reflection:** Find-then-lock reads as correct in review because each line is correct. The bug only exists in the gap between them. It taught me to look at check-then-act pairs as a shape, not as two statements, and to leave the *why* in a comment since the fixed version looks more complicated than the broken one.
**Best for:** concurrency, race conditions, "tell me about a subtle bug", correctness under load, code that must survive future maintainers, database/locking design, trade-offs between safety and throughput.
**Careful:** do not claim a measured throughput or incident number for this — none was recorded. Describe the failure mode and the fix, not an impact metric. Wallet pool context in memory `nespay-wallet-architecture`.

### [Automation / Ops] Self-managed gas funding for a hot wallet pool
**Source:** Nespay wallet infrastructure (surfaced while preparing the Privy application, July 2026)
**S:** Every hot wallet in the pool that received a customer payment needed native gas before the balance could be moved out. Two chains, two completely different resource models: EVM needs a token balance for fees, TRON needs energy and bandwidth obtained by staking.
**T:** Keep a pool of wallets continuously able to transact without a person watching balances, and without refills firing at the worst possible moment.
**A:** Built the funding loop in house. Per-wallet balance thresholds, refill amounts, a funding wallet to top up from, and fee-spike protection so a refill does not go out during a gas spike. On TRON that also meant wallet activation and batched energy rental under Redis locks. Several hundred lines of infrastructure plus a standing operational surface to watch.
**R:** Gas stopped being a manual chore and the pool stayed transactable across both chains.
**Reflection:** The honest reflection is that we chose to build it rather than buy it, on cost grounds, and then never revisited that decision as the vendor's offering changed underneath us. Toil does not raise an alarm the way an outage does, so nothing ever prompted a re-evaluation. If I ran it again I would put a calendar reminder on "re-check what the provider ships now" for anything we deliberately built around.
**Best for:** automation, operational toil, build-vs-buy, multi-chain differences (EVM fees vs TRON energy/bandwidth), designing around a vendor gap, "what would you do differently".
**Careful:** no measured metrics were recorded for this — do not invent a cost saving, uptime figure, or refill count. The reason sponsorship was ruled out was cost; the exact plan or pricing detail is not confirmed, so describe it as "we priced it and it did not make sense for us at the time" and do not name a plan or tier. Wallet pool context in memory `nespay-wallet-architecture`.
