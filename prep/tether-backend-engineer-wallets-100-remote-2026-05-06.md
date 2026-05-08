# Tether — Backend Engineer (Wallets) — 100% Remote

**Job URL:** https://careers.tether.io/o/backend-engineer-wallets-100-remote-29
**Application URL:** https://careers.tether.io/o/backend-engineer-wallets-100-remote-29/c/new

> **Scaffold only — Tether bans AI tools in applications. All free-text answers must be rewritten in your own voice from memory before submitting. Video answer must be recorded yourself — use bullet points below as talking points only.**

---

## Form Fields

| Field | Answer |
|-------|--------|
| Full name | Hana Aliyah Mufidah |
| Email | aliyanamu@gmail.com |
| Phone | +62 858-1099-4772 |
| CV | `output/cv-hana-aliyah-mufidah-tether-backend-wallets-2026-05-06.pdf` |
| Cover letter | see below |
| Country (working from) | Indonesia |
| LinkedIn | linkedin.com/in/hana-aliyah-mufidah |
| Useful links | *(add GitHub or portfolio link)* |
| Location | Yogyakarta, Indonesia |
| Expected annual salary (USD) | *(TBD — research Tether market rate; profile target ~IDR 25–40M/mo ≈ $18–25K/yr, but Tether is global — consider $60–90K USD range for remote roles)* |

---

## Q1 (Video — 120 sec max): Why are you interested in working at Tether?

> **Video response — do NOT write a script. Record in your own words. Aim for 60–75 sec. Talking points:**

- **Hook (concrete, not generic):** You've spent the last year building wallet transaction infrastructure for a B2B crypto-to-fiat platform — multi-chain signing, RPC, settlement. That work lives on top of USDT. You want to build inside it.
- **USDT as strategic asset:** Tether isn't just a stablecoin company — USDT gives people in countries with weak currencies or restricted banking access a stable, USD-denominated store of value. The wallet layer you're applying to is the pipe that makes that real. Say this like you mean it — one sentence.
- **Lean / high-leverage signal:** At Nespay you set up the entire backend architecture, AWS infra, and CI/CD solo — end-to-end ownership with no handoffs. That's the mode you work best in.
- **Close:** One question — e.g. "What does the on-call model look like for the wallet team, and how do you handle incident response at Tether's transaction volume?"

---

## Q2 (Radio): Node.js experience level

**Select: "I have more than 5 years of professional hands-on experience working with Nodejs."**

*(Node.js since Hacktiv8/Ultra Voucher 2018 → ION 2020–2024 → Nespay 2025–present = ~7 years)*

---

## Q3 (Text): Do you have experience with Peer to peer technologies?

> **Rewrite in your own voice.**

My P2P experience is indirect — it comes through blockchain work rather than building P2P systems from scratch. At Appreal (Nespay) I integrated multi-chain RPC services: connecting to blockchain nodes, broadcasting transactions, subscribing to on-chain events, and handling reorgs. The underlying network is P2P, but my work was at the RPC and application layer, not the protocol layer.

I've also worked with smart contracts (EDU Chain hackathon, 2025), which eliminate intermediaries — but again, that's application-level, not protocol-level P2P.

I haven't built or maintained P2P layers like libp2p or Hypercore directly. I'm comfortable picking up new infrastructure quickly — our team integrated non-custodial signing with AWS Nitro Enclave and I worked across that codebase, so I understand the approach even though I didn't build it solo — but P2P at the protocol level would still be new territory for me.

---

## Q4 (Text, optional): Do you have experience working with crypto or digital wallets?

> **Rewrite in your own voice.**

Yes — wallet integration is the core of my current work. At Appreal (Nespay) I built the backend for a B2B multi-chain crypto-to-fiat platform:

- Non-custodial wallet key management via Privy + AWS Nitro Enclave (secure signing without exposing private keys)
- Multi-chain transaction flows across EVM-compatible chains and TRON (Ethers.js, Viem, TronWeb)
- Wallet-linked invoice and payment state machines — tracking deposits, confirmations, and settlement
- RPC service integration for broadcasting transactions and listening to on-chain events

I also built DeFi smart contract interactions for the EDU Chain hackathon (3rd place, DeFi Track, 2025).

---

## Cover Letter

> **Scaffold only — rewrite in your own voice before submitting.**

---

Dear Tether Team,

My current role at Appreal (Nespay) is building the backend for a B2B multi-chain crypto-to-fiat payment platform — wallet transactions, invoice lifecycle, KYC compliance, and multi-chain signing via Privy + AWS Nitro Enclave. When I came across this role, it read like a description of work I am already doing, at a company operating the infrastructure layer beneath it.

The technical fit is direct. I work daily in Node.js and TypeScript on NestJS microservices, with PostgreSQL, MySQL, MongoDB, and Redis as data layers, and RabbitMQ handling async event processing. I set up the AWS infrastructure and CI/CD pipelines from scratch and own security across the stack — authentication, authorization, key management, and KYC integration (Sumsub, Kredibel). Before Nespay, I spent five years at ION building and stabilizing a large-scale work-management platform, which gave me a strong foundation in maintaining complex, high-traffic systems without regressions.

On the Web3 side: I have hands-on experience integrating non-custodial wallets, working with RPC services, and shipped a DeFi project to a 3rd-place finish at the EDU Chain Hackathon in 2025. I understand what it means to handle user assets at the protocol level, not just at the API surface.

I am a fully remote engineer based in Yogyakarta, Indonesia (GMT+7), with no timezone blockers for a globally distributed team. I am interested in the wallet infrastructure problem specifically — not just the company — and this role is one of the few where the scope matches my current depth.

I would welcome the chance to discuss the team's architecture challenges.

Hana Aliyah Mufidah
aliyanamu@gmail.com | linkedin.com/in/hana-aliyah-mufidah
