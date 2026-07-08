# Startale Group: TypeScript Backend Engineer

**Job URL:** https://job-boards.greenhouse.io/startale/jobs/5291409008
**Location:** Japan; Remote; Singapore (applying remote from Indonesia; LinkedIn notes East-Asia-preferred, overridden)
**Stack:** Senior TS backend; APIs, data pipelines, DBs, blockchain indexers; Web3 wallet (Sony/SBI-backed DeFi L1 + Startale super-app)
**Fit:** 5/5 Web3
**Status:** Draft — not yet submitted

> Contact PII (phone, email) intentionally kept out of this file — it lives in `config/profile.yml` (this repo is public).

---

## Contact / standard fields

- **First name:** Hana
- **Last name:** Aliyah Mufidah
- **Email:** _(private — see config/profile.yml)_
- **Phone:** _(private — see config/profile.yml)_
- **Resume/CV:** cv-default.pdf
- **GitHub Account URL:** ⚠️ TODO — required, not yet provided
- **Telegram:** ⚠️ TODO (else "N/A")
- **Which city do you live in?** Yogyakarta
- **Referral name (optional):** N/A

## Pre-screen selects

- **Years of professional TypeScript:** 3-5 Years _(confirm)_
- **Base salary expectation in USD (excluding upside):** ⚠️ TODO — decide number
- **When are you available to start?** In A Month _(confirm Nespay notice)_
- **Legally authorized to work where domiciled?** Yes (Indonesian citizen)
- **Require sponsorship in future?** No (working remotely from Indonesia)

---

## Free-text answers

### Q7 (required): Anything to supplement your application / why you're the best person

I'm a full stack engineer with 6+ years of experience, and in my current role I own the backend of a B2B crypto payments platform end to end: the NestJS/TypeScript APIs for wallet transactions and invoicing, and the on-chain indexer that detects USDT deposits across Ethereum, Polygon, Arbitrum, BSC, and Tron and drives invoice settlement by transfer amount. I set up the AWS infrastructure (EC2, IAM, security groups) and CI/CD (GitHub Actions), and integrated KYC/compliance providers with proper audit trails. Because Startale's core product is a Web3 wallet, my hands-on experience with confirmations, finality, reconciliation, and real user transaction paths means I understand not just the protocol layer but how people actually move funds. I'm looking for exactly this kind of senior, high-ownership backend role in Web3.

### Q11 (required): Experience building a high-load backend API or blockchain data indexing system

In my current role I built and operate the payment backend for a B2B crypto-to-fiat platform, along with the on-chain indexer it depends on. The indexer watches for ERC-20 USDT transfers to per-user deposit addresses across multiple chains (Ethereum, Polygon, Arbitrum, BSC, and Tron). Instead of genesis-syncing, it runs three coordinated workers: a forward worker that polls the most recent blocks every 5 seconds for real-time detection, a backfill worker that closes gaps, and a confirmation worker that waits for chain-specific finality (for example, 12 confirmations on Ethereum) before a payment is treated as settled. It sits behind an ERPC layer in front of the RPC providers, uses Redis for deduplication and speed and PostgreSQL for crash recovery, and fires webhooks to the backend on "detected" and "confirmed". My NestJS/TypeScript backend consumes those webhooks and reconciles each transfer against the open invoice by amount, so an invoice only settles when the on-chain nominal matches what was billed. Volumes are startup-scale rather than millions of TPS, but the system is built for correctness and reliability while moving real money across chains, which is exactly the indexer-heavy, high-ownership backend work this role describes.

---

## Proof points (from CV + Appreal codebase)

- **Nespay / Appreal (Apr 2025–present):** NestJS/TS backend for B2B crypto payments; wallet transactions, invoice management, external wallet integrations (Xellar, Privy); KYC (Sumsub, Kredibel); AWS (EC2, IAM) + CI/CD (GitHub Actions).
- **Multi-chain USDT indexer:** ERC-20 transfer detection across Ethereum/Polygon/Arbitrum/BSC/Tron; forward + backfill + confirmation workers; ERPC + Redis + PostgreSQL; webhook-driven invoice reconciliation by amount.
- **EDU Chain Hackathon (May 2025):** 3rd place, DeFi track.
- **AWS Certified Cloud Practitioner** (2024–2027).

## Still needed before submitting
- GitHub URL (required) · Telegram (or N/A) · salary number · confirm TS years + availability
