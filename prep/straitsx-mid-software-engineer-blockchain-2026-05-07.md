# StraitsX: Mid Software Engineer, Blockchain

**Job URL:** https://job-boards.eu.greenhouse.io/straitsx/jobs/4839243101
**LinkedIn equivalent:** https://www.linkedin.com/jobs/view/4401055938 (Taipei entry-level: different listing)
**Posted:** 2026-04-12 (~3 weeks fresh)
**Location:** Jakarta, Indonesia (home country, no relocation)
**Stack:** Go (Fiber v2, GORM, Asynq) backend, Postgres, Redis, Datadog, GitHub Actions, Docker, K8s; Solidity contributions when needed
**Years:** 2–4 years professional SWE (you have 6+: strong fit on the upper end)
**Why "Apply" despite the Go-default rule:** Go is **preferred, not required** (per JD: *"Strong proficiency in at least one backend programming language (Go preferred)"*). Node.js / TypeScript primary backgrounds are accepted; Go can be picked up on the job.

---

## Application form (Greenhouse: confirmed via API)

The form is **light**, no essay questions. Just standard contact fields plus:

| Field | Required | Pre-filled value |
|---|---|---|
| First Name | ✓ | Hana |
| Last Name | ✓ | Aliyah Mufidah |
| Email | ✓ | aliyanamu@gmail.com |
| Phone | ✓ | +62 858-1099-4772 |
| Resume/CV | ✓ | `cv-default.pdf` (or generate tailored version: see notes) |
| Cover Letter | optional | **Recommended**: see draft below |
| LinkedIn Profile | ✓ | https://linkedin.com/in/hana-aliyah-mufidah |
| GitHub URL | optional | _(your call: github.com/aliyanamu)_ |
| Current salary (Net) | ✓ | _(your real number, IDR/month net)_ |
| Salary expectation (Net) | ✓ | _(see salary discussion below)_ |
| English proficiency | ✓ | **C1/C2 (per EFSET): pick the closest dropdown option, likely "Fluent" or "Professional working proficiency"** |
| Notice period | ✓ | _(your real notice: typically 1 month for Indonesian contracts)_ |
| PDPA Notice | ✓ | Accept |

## Cover Letter draft (optional but recommended given Go gap)

> Hi StraitsX team,
>
> I'm applying for the Mid Software Engineer, Blockchain role in Jakarta. Quick note up front: my primary backend language has been Node.js / Nest.js for 6+ years, not Go. The JD lists Go as preferred, not required, and I want to be transparent that I'd be picking up Go on the job. Everything else in your stack. Postgres, Redis, Docker, K8s, GitHub Actions, Datadog. I've worked with in production.
>
> What's directly transferable: at Nespay (April 2025–present) I'm building backend infrastructure for a crypto-to-fiat on/off-ramp platform. I own the GitHub Actions CI/CD pipeline (self-hosted runners on EC2 with IAM-bound roles), the wallet-transactions service (Node.js/Nest.js with idempotency keys, provider failover across Xellar and Privy), and KYC integration (Sumsub, Kredibel). The mental model: sync at the API edge, async at the chain edge, idempotency from day one: is exactly the shape your Go microservices need.
>
> On Web3 specifically: I placed 3rd on the DeFi Track at EDU Chain Hackathon (May 2025) and have shipped EVM wallet integration in production at Nespay. Solidity is something I've reviewed but not authored at scale: fits the "contribute to or review" framing in the JD.
>
> Why StraitsX in particular: stablecoin infrastructure across multiple chains is the part of Web3 I find most interesting, it's the boring-but-foundational layer the rest of the ecosystem depends on. Being able to do this from Jakarta without relocation is also a real factor.
>
> Happy to chat further. Resume attached.
>
>. Hana Aliyah Mufidah

## Salary discussion notes

- **Indonesian Web3/fintech mid-engineer market range (Jakarta, 2026):** IDR 25–45M/month gross is typical; net depends on PTKP/tax bracket. Crypto-native companies often pay USD-pegged, which lifts the range. _Verify with your own market sources before locking a number._
- **Strategy:**
  - For "current salary": be honest with your real number. Recruiters often verify.
  - For "expectations": anchor on a range slightly above current, e.g. *"IDR 35–45M/month net, flexible based on full package."* This signals you're realistic without leaving money on the table.
  - If they pay USD: ask about the equivalent USD band before committing IDR numbers.

## Notes for follow-up

- **Go ramp story** is your single biggest interview risk. Prepare a concrete answer: "I haven't shipped Go to production but my model of typed-language microservices comes from TypeScript+Nest. My plan to ramp would be: read the existing Go services in your repo for a week, then own a small bug-fix or non-critical feature as my first PR. I learn by shipping, not by reading."
- **Datadog observability:** if you don't have direct Datadog experience, frame around the **pino + Grafana** logging-enrichment work at Nespay. Same problem (structured logs + dashboards for self-service debugging), different tools.
- **Distributed system fundamentals:** they'll likely test idempotency, retry semantics, ordering. Your wallet-transactions backend story covers all three.

## Submission checklist

- [ ] Verify LinkedIn URL renders correctly
- [ ] Decide whether to attach cover letter (above) or skip
- [ ] Plug in real net salary numbers
- [ ] Plug in real notice period
- [ ] Pick English proficiency dropdown (highest available, you're C1/C2)
- [ ] Accept PDPA
- [ ] Submit
- [ ] After submitting, set Preparations Submission status → "Submitted" so the Applications row auto-creates
