# Scan & Data-Expansion Workflow

How career-ops finds roles, how scanning works **with and without Firecrawl**, and how the tracked company list **grows itself** over time.

## 1. The whole system at a glance

```mermaid
flowchart TD
    subgraph CFG["Config & context (you own these)"]
        P[portals.yml<br/>tracked_companies · title_filter · location_filter · discovery]
        PROF[modes/_profile.md<br/>+ career-direction/<br/>+ cv.md]
    end

    SCAN[["scan.mjs<br/>(zero-LLM)"]]
    P --> SCAN

    SCAN --> PIPE[data/pipeline.md<br/>inbox of found roles]
    SCAN --> DISC[data/discovered-companies.json<br/>new companies found]

    PIPE -->|"'Import from scan'<br/>(you click, in the web tracker)"| JOBS[(data/jobs.json<br/>tracker source of truth)]
    JOBS --> DASH["Web dashboard<br/>(tracker/, GitHub-backed)"]

    JOBS -->|"/career-ops pipeline"| EVAL{{Evaluation<br/>reads profile + career-direction}}
    PROF -. context .-> EVAL
    EVAL -->|fitScore · decision · report| JOBS

    DISC -.->|"you review & promote"| P

    classDef sot fill:#1f6feb,stroke:#0b3d91,color:#fff;
    class JOBS,DISC,PIPE sot;
```

**Key idea:** `scan.mjs` never writes to `jobs.json` directly. It fills an **inbox** (`pipeline.md`), and you pull roles into the tracker with **Import from scan**. Evaluation is a separate step that scores them.

## 2. Scan WITHOUT Firecrawl (default — known companies only)

Zero cost, zero LLM. Sweeps only the companies already in `portals.yml`.

```mermaid
flowchart LR
    P[portals.yml<br/>tracked_companies] --> API{ATS type?}
    API -->|greenhouse| GH[boards-api.greenhouse.io]
    API -->|ashby| AS[api.ashbyhq.com]
    API -->|lever| LV[api.lever.co]

    GH & AS & LV --> JOBS[all postings]
    JOBS --> T{title_filter<br/>positive/negative}
    T -->|pass| L{location_filter<br/>remote + Japan, block region-locked}
    T -->|fail| X1[drop]
    L -->|pass| AGE{&lt; max_age_days?}
    L -->|fail| X2[drop]
    AGE -->|yes| D{already seen?}
    AGE -->|no| X3[skip]
    D -->|new| LIVE{posting live?}
    D -->|dupe| X4[skip]
    LIVE -->|yes| OUT[data/pipeline.md]
    LIVE -->|dead| X5[drop]
```

**Limitation:** it can only ever find roles at companies you already listed. To find *new* companies, you need discovery.

## 3. Scan WITH Firecrawl (discovery — the whole internet)

Turn on with `discovery.enabled: true` in `portals.yml` + a `FIRECRAWL_API_KEY`. Runs **in addition to** the ATS scan above, then feeds the same filters.

```mermaid
flowchart TD
    Q[discovery.queries<br/>web3 · wallet/KYC · Japan · remote-global] --> FC[["Firecrawl web search<br/>(api.firecrawl.dev)"]]
    FC --> R[raw results<br/>postings + aggregator index pages]

    R --> AG{aggregator or<br/>listing page?}
    AG -->|"yes: arc.dev, indeed,<br/>'Remote X Jobs 2026'"| X1[drop]
    AG -->|no: single posting| T{title_filter}
    T -->|fail| X2[drop]
    T -->|pass| DEDUP{already seen?}
    DEDUP -->|dupe| X3[skip]
    DEDUP -->|new| LIVE{live?}
    LIVE -->|dead| X4[drop]
    LIVE -->|yes| ROLE[role → data/pipeline.md]

    ROLE --> ATS{on a clean ATS?<br/>greenhouse/ashby/lever}
    ATS -->|yes & not tracked| NEWCO[company → data/discovered-companies.json]
    ATS -->|"no (custom site)"| SKIPCO[role kept, company not harvestable]

    classDef sot fill:#1f6feb,stroke:#0b3d91,color:#fff;
    class ROLE,NEWCO sot;
```

Discovery does two things at once: adds **roles** to the pipeline inbox, and harvests **new companies** to `discovered-companies.json`.

## 4. The data-expansion loop (why discovery compounds)

Each discovery run can grow your tracked set, so the *next* zero-cost ATS scan is wider.

```mermaid
flowchart LR
    FC[Firecrawl discovery] -->|finds a role at a new company| DISC[data/discovered-companies.json<br/>status: new]
    DISC -->|you review| PROMOTE{good fit?}
    PROMOTE -->|yes| ADD[add slug to<br/>portals.yml tracked_companies]
    PROMOTE -->|no| DISMISS[status: dismissed]
    ADD --> SWEEP[next ATS scan sweeps<br/>its FULL board — free, zero-LLM]
    SWEEP -. more roles .-> FC

    classDef sot fill:#1f6feb,stroke:#0b3d91,color:#fff;
    class DISC sot;
```

**The payoff:** Firecrawl finds *one* role at, say, Nametag → the company lands in `discovered-companies.json` → you add it to `portals.yml` → every future scan pulls **all** of Nametag's postings for free. Discovery is the scout; the tracked ATS list is the cheap recurring sweep.

## Sources of truth

| File | What it holds | Written by |
|------|---------------|-----------|
| `portals.yml` | scanner config (companies, filters, discovery) | you (gitignored, local) |
| `data/pipeline.md` | inbox of freshly-scanned roles | `scan.mjs` |
| `data/discovered-companies.json` | new companies found via Firecrawl | `scan.mjs` |
| `data/jobs.json` | the curated tracker | web tracker + evaluation |
| `data/companies.json` | dashboard company list | web tracker |

## Commands

```bash
npm run scan          # ATS scan (+ Firecrawl discovery if enabled in portals.yml)
# then: open the web tracker → "Import from scan" → roles become pending jobs
# then: /career-ops pipeline → evaluate & score the pending jobs
```
