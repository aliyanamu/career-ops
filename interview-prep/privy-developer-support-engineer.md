# Privy — Developer Support Engineer (contractor)

**Report:** `reports/023-privy-2026-07-21.md` (4.6/5) · **Contact:** John Dempsey, john.dempsey@privy.io
**Applied with:** CV only. A friction log was drafted and deliberately dropped, see "Why the friction log was pulled" below.

---

## Docs research, verified against the live site on 21 July 2026

Kept because it is genuinely useful interview material. Every number below was checked directly that day. **The docs ship constantly, so re-check before repeating any of it out loud.**

### Changelog and feed discoverability

- `sitemap.xml` carries **647 URLs**. Exactly **one** is a changelog (`/changelogs/product-updates`), and it is also the only changelog page that does **not** carry `noindex`.
- **15 of 16** changelog pages carry `<meta name="robots" content="noindex">`.
- **15 working RSS feeds** exist (`/changelogs/{slug}/rss.xml`). Only `product-updates` returns 404.
- The feeds are **not declared** in `<link rel="alternate" type="application/rss+xml">` on their pages. Only `sitemap.xml` and `.md` alternates are declared.
- **Every item in a feed shares one identical `pubDate`** equal to build time. A reader cannot answer "what is new since I last looked."
- Changelog entries carry version numbers but **no dates**.
- **No page shows a last-updated date**, although `sitemap.xml` carries real `lastmod` values spread across **60 distinct days**.
- `privy.io/blog/rss.xml` returns HTTP 200 but serves the marketing homepage, not a feed.

### Agent-facing indexes

- `llms.txt` lists **151** doc pages out of 647. Curation at that ratio is normal practice (Stripe, Cloudflare and Anthropic all curate).
- `llms-full.txt`, which is presented as the complete index, is **missing 67 pages** that are in the sitemap. All 67 were modified on or after **14 May 2026**; **61** are from June 2026 or later. Most likely generation lag rather than neglect.
- Privy shipped **MCP support for the docs in February 2026**, so assistant-discoverability is clearly an active investment. Mention this before criticising the index.

### Gas sponsorship: three routes, and they are hard to tell apart

This is the sharpest observation to come out of the research, and it is a question rather than an accusation.

| Route | What the docs say | Dated? |
|---|---|---|
| **App pays**, `sponsor: true` | Requires TEE execution. Underlying mechanism never explained. | no date found |
| **EIP-7702 (Type 4)** | "transaction bundling and gas sponsorship via the RPC endpoint" | **Feb 2026** changelog |
| **User pays** | Alchemy ERC-20 paymaster, approval bundled atomically with the transfer | **Jun 2026** changelog |

- The setup page states: *"This flow does not use EIP-7702 wallet upgrades, ERC-4337 user operations, or EVM paymasters"* — though that line sits in a Tempo React section, so its scope is unclear.
- `/wallets/gas-and-asset-management/gas/ethereum` is the **smart wallet + Kernel + Pimlico paymaster** page. It opens *"Privy makes it easy to create smart wallets for your users to sponsor gas fees…"* and **links to no alternative**.
- `llms.txt` lists that page as "Gas sponsorship — EVM." The current `/gas/overview` and `/gas/setup` pages are **not in the index at all**.
- `sponsor: true` **is** reachable from the index, but on "EVM — send a transaction," not under sponsorship.
- **Never found stated:** whether server-created (API) wallets are eligible for native sponsorship. The overview says "embedded wallets"; the Node example passes a wallet ID with `sponsor: true`.

### Other dated changelog entries worth knowing

- **Feb 2026:** custodial wallets; stateful policies (spending limits, allow-lists, time windows, multi-sig escalation); hCaptcha in login; `GET /balance` covering ERC-20 and SPL.
- **May 2026:** Tron gas sponsorship recipe via Transatron (`/recipes/tron/transatron`), works with server wallets signing via `raw_sign`.
- **Jun 2026:** token gas sponsorship, users pay gas in USDC/USDT.

### Pricing, as listed 21 July 2026

Developer plan: Core free, Scale $299/mo (500–2,499 MAU), Scale+ $499/mo (2,500–9,999 MAU). Enterprise custom. **Native gas sponsorship is listed inside the Developer plan.** No tier structure matching the reason Nespay ruled it out was found, so **do not raise pricing tiers in the interview** unless Hana can confirm the specifics from her own records.

---

## Why the friction log was pulled

A five-page friction log was drafted and then dropped before sending. Recording why, so it is not rebuilt on the same foundation:

1. Three of the five original friction points were **generated narratives written in first person about things Hana never did**. Cut on 2026-07-21.
2. The surviving gas sponsorship finding rested on the premise "I never found out this shipped." The **actual reason Nespay did not use sponsorship was cost.** That makes the whole discoverability framing false.
3. Smaller errors caught along the way: an unverifiable launch date, a false "TRON has no sponsorship" claim, a claim that an assistant had "no way to discover" `sponsor: true` when it is documented on an indexed page, and an invented detail about Hana's CTO.

**The lesson, if it ever gets rebuilt:** anchor it on the TRON `raw_sign` recovery byte bug, which is real, hers, technically deep, and already written up in the story bank. Not on the gas sponsorship story.

---

## If interviewed

- **Lead with:** the TRON `raw_sign` recovery byte story (story bank), and the find-then-lock race (story bank). Both are hers, both are verified.
- **On the support-title gap:** eight years engineering, never held a support title; the process side, ticket queue and community, is what she would need to learn. State once, then move on.
- **On timezone:** can commit 14:00–23:00 GMT+7, which is 09:00–18:00 CEST. Precedent: five years at ION on a distributed team with meetings regularly running 20:00–23:00 her time.
- **Availability:** immediate. A paid trial on live tickets was offered in the email.
- **Current status:** laid off from Nespay 1 July 2026; freelancing on an AI annotation platform.
- **If the docs research comes up:** frame it as one customer's view, acknowledge the MCP investment first, and re-verify any number before stating it.
