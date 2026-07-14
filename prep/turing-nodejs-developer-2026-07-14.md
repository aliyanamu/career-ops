# Turing: Node.js Developer (Backend)

**Job URL:** none (application lives inside the Turing platform)
**Location / eligibility:** Fully remote contractor. Location list: India, Brazil, Pakistan, Nigeria, Kenya, Egypt, Ghana, Bangladesh, Turkey, Mexico. **Indonesia is not on the list — check eligibility before investing.**
**Commitment:** Contractor, 5-week duration. 20/30/40 hrs/week options, min 4 hrs/day, 4 hrs PST overlap. No medical/paid leave.
**Evaluation:** ~75 min — 60 min technical + 15 min cultural.
**Stack fit:** Strong. Node.js backend, REST APIs, real-time systems, SQL/NoSQL (Postgres/MySQL/Mongo/Redis), auth, containers, Git. All hers.

> Contact PII kept out of this file; it lives in `config/profile.yml` (this repo is public).

---

## Requirements → her proof

- **3+ years Node.js backend** → 6+ years full-stack JS/TS, NestJS backend at Nespay.
- **Scalable services, APIs, real-time systems** → Nespay backend consuming webhooks from a Go multi-chain indexer scanning blocks in real time.
- **Async / event-driven / REST** → webhook-driven indexer→backend flow, Redis dedup.
- **SQL/NoSQL (Postgres/MySQL/Mongo/Redis)** → all used in production.
- **Containers + deployment** → Docker, GitHub Actions CI/CD on AWS EC2.
- **Security, error handling, logging** → AWS auth/access control, KYC + payment data handling, dedup for exactly-once processing.

---

## Prep questions (answers grounded in cv.md)

**Q: Hands-on experience on Node.js**
6+ years building production backends in Node.js, most recently the Nespay backend (NestJS) powering wallet transactions, invoice management, and admin/user interfaces. Built REST services that consume webhooks from a Go block indexer, and earlier work-management backends at ION. Comfortable across the stack from routing and business logic to deployment on AWS EC2.

**Q: SQL / NoSQL and API integration**
Worked with PostgreSQL and MySQL (relational modeling, queries) plus MongoDB, Redis, Elasticsearch, and Neo4j on the NoSQL side. Heavy third-party API integration: wallet providers (Xellar, Privy), blockchain RPC services, and KYC providers (Sumsub, Kredibel), including consuming and exposing webhooks between services.

**Q: Authentication, authorization, and data handling in Node.js**
Set up AWS-based auth and access control for Nespay, and built user/admin interfaces with role-based access. Handle sensitive payment and KYC data with a focus on secure, reliable delivery. Use Redis-backed dedup so each transaction is processed exactly once, and keep the database lean with scheduled cleanup of stale data.

**Q: Proficiency — Node.js, database design & optimization, performance tuning & scalability**
- Node.js: Advanced. Daily driver for 6+ years across payments and work-management systems.
- Database design & optimization: Proficient. Schema design in PostgreSQL/MySQL, plus data-retention pruning to keep Postgres lean.
- Performance tuning & scalability: Proficient. Redis dedup, forward/backward indexing for outage recovery, and cleanup jobs to control data growth on a live payment system.
