#!/usr/bin/env node

/**
 * scan.mjs — Zero-token portal scanner
 *
 * Fetches Greenhouse, Ashby, and Lever APIs directly, applies title
 * filters from portals.yml, deduplicates against existing history,
 * and appends new offers to pipeline.md + scan-history.tsv.
 *
 * Zero Claude API tokens — pure HTTP + JSON.
 *
 * Usage:
 *   node scan.mjs                  # scan all enabled companies
 *   node scan.mjs --dry-run        # preview without writing files
 *   node scan.mjs --company Cohere # scan a single company
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import yaml from 'js-yaml';
import { classifyLiveness, isDeadLink } from './liveness-core.mjs';
const parseYaml = yaml.load;

// ── Config ──────────────────────────────────────────────────────────

const PORTALS_PATH = 'portals.yml';
const SCAN_HISTORY_PATH = 'data/scan-history.tsv';
const PIPELINE_PATH = 'data/pipeline.md';
const APPLICATIONS_PATH = 'data/applications.md';

// Ensure required directories exist (fresh setup)
mkdirSync('data', { recursive: true });

const CONCURRENCY = 10;
const FETCH_TIMEOUT_MS = 10_000;

// ── API detection ───────────────────────────────────────────────────

function detectApi(company) {
  // Greenhouse: explicit api field
  if (company.api && company.api.includes('greenhouse')) {
    return { type: 'greenhouse', url: company.api };
  }

  const url = company.careers_url || '';

  // Ashby
  const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)/);
  if (ashbyMatch) {
    return {
      type: 'ashby',
      url: `https://api.ashbyhq.com/posting-api/job-board/${ashbyMatch[1]}?includeCompensation=true`,
    };
  }

  // Lever
  const leverMatch = url.match(/jobs\.lever\.co\/([^/?#]+)/);
  if (leverMatch) {
    return {
      type: 'lever',
      url: `https://api.lever.co/v0/postings/${leverMatch[1]}`,
    };
  }

  // Greenhouse EU boards
  const ghEuMatch = url.match(/job-boards(?:\.eu)?\.greenhouse\.io\/([^/?#]+)/);
  if (ghEuMatch && !company.api) {
    return {
      type: 'greenhouse',
      url: `https://boards-api.greenhouse.io/v1/boards/${ghEuMatch[1]}/jobs`,
    };
  }

  return null;
}

// ── API parsers ─────────────────────────────────────────────────────

function parseGreenhouse(json, companyName) {
  const jobs = json.jobs || [];
  return jobs.map(j => ({
    title: j.title || '',
    url: j.absolute_url || '',
    company: companyName,
    location: j.location?.name || '',
    posted: j.first_published || null,
  }));
}

function parseAshby(json, companyName) {
  const jobs = json.jobs || [];
  return jobs.map(j => ({
    title: j.title || '',
    url: j.jobUrl || '',
    company: companyName,
    location: j.location || '',
    posted: j.publishedAt || null,
  }));
}

function parseLever(json, companyName) {
  if (!Array.isArray(json)) return [];
  return json.map(j => ({
    title: j.text || '',
    url: j.hostedUrl || '',
    company: companyName,
    location: j.categories?.location || '',
    posted: j.createdAt ? new Date(j.createdAt).toISOString() : null,
  }));
}

const PARSERS = { greenhouse: parseGreenhouse, ashby: parseAshby, lever: parseLever };

// ── Fetch with timeout ──────────────────────────────────────────────

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── Title filter ────────────────────────────────────────────────────

function buildTitleFilter(titleFilter) {
  const positive = (titleFilter?.positive || []).map(k => k.toLowerCase());
  const negative = (titleFilter?.negative || []).map(k => k.toLowerCase());

  return (title) => {
    const lower = title.toLowerCase();
    const hasPositive = positive.length === 0 || positive.some(k => lower.includes(k));
    const hasNegative = negative.some(k => lower.includes(k));
    return hasPositive && !hasNegative;
  };
}

// Location pre-filter: drop on-site-elsewhere and region-locked-remote roles
// before they reach the pipeline. A job passes if its location matches an
// `allow` term (remote / APAC / the active career-direction market) AND matches
// no `block` term (region-locked remote not open from Indonesia). Empty/unknown
// location is KEPT — the API often omits it; let evaluation decide.
// Returns null when location_filter is absent (no filtering, backward-compatible).
// ponytail: keyword heuristic, not geocoding. Evaluation still scores location
// finely; this just cuts the obvious noise. Tune the lists in portals.yml.
function buildLocationFilter(locationFilter) {
  if (!locationFilter) return null;
  const allow = (locationFilter.allow || []).map(k => k.toLowerCase());
  const block = (locationFilter.block || []).map(k => k.toLowerCase());
  if (allow.length === 0 && block.length === 0) return null;

  return (location) => {
    const lower = (location || '').toLowerCase().trim();
    if (!lower) return true; // unknown location — keep, evaluation decides
    if (block.some(k => lower.includes(k))) return false;
    return allow.length === 0 || allow.some(k => lower.includes(k));
  };
}

// ── Liveness gate ───────────────────────────────────────────────────
// Greenhouse/Ashby/Lever APIs can list roles whose PUBLIC posting was
// already pulled (404 / redirect-to-dead). Fetch the real URL and drop
// hard-dead ones. Only run on new offers (the small final set), not all jobs.

async function checkLive(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (career-ops liveness check)' },
    });
    const html = await res.text().catch(() => '');
    const bodyText = html.replace(/<[^>]+>/g, ' ');
    return classifyLiveness({ status: res.status, finalUrl: res.url, bodyText });
  } catch (err) {
    // Our own timeout/network failure — never drop the offer on that.
    return { result: 'uncertain', reason: `fetch failed: ${err.message}` };
  } finally {
    clearTimeout(timer);
  }
}

// ── Broad discovery (opt-in Firecrawl web search) ───────────────────
// Off by default. Enable with `discovery.enabled: true` in portals.yml + a
// FIRECRAWL_API_KEY env var. Finds roles on portals NOT in tracked_companies.
// Results are dependency-free REST (Firecrawl v2) and flow through the same
// title filter + dedup + liveness gate as ATS results.

async function firecrawlSearch(query, limit, key) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.firecrawl.dev/v2/search', {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit, sources: [{ type: 'web' }], tbs: 'qdr:w' }), // qdr:w = past week
    });
    if (!res.ok) {
      console.warn(`  Firecrawl "${query}": HTTP ${res.status}${res.status === 429 ? ' (rate/credit limit)' : ''}`);
      return [];
    }
    const { data } = await res.json();
    return data?.web ?? [];
  } catch (err) {
    console.warn(`  Firecrawl "${query}": ${err.message}`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// Firecrawl gives no company field — derive it from the ATS host slug, else the hostname.
function deriveCompanyFromHost(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    let m;
    if ((m = url.match(/(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/([^/?#]+)/))) return m[1];
    if ((m = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)/))) return m[1];
    if ((m = host.match(/^([^.]+)\.ashbyhq\.com$/))) return m[1];
    if ((m = url.match(/jobs\.lever\.co\/([^/?#]+)/))) return m[1];
    return host;
  } catch {
    return '';
  }
}

async function discoverViaFirecrawl(discovery, { titleFilter, seenUrls, seenCompanyRoles }) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    console.warn('Discovery enabled but FIRECRAWL_API_KEY is not set — skipping broad discovery.');
    return [];
  }
  const queries = discovery.queries || [];
  const maxResults = discovery.max_results ?? 20;
  if (queries.length === 0) return [];

  const perQuery = Math.max(1, Math.floor(maxResults / queries.length));
  const offers = [];

  for (const query of queries) {
    if (offers.length >= maxResults) break;
    const results = await firecrawlSearch(query, perQuery, key);
    for (const r of results) {
      if (offers.length >= maxResults) break;
      const url = r.url;
      const title = r.title || '';
      if (!url || !title) continue;
      if (!titleFilter(title)) continue;         // search surfaces aggregators/blogs — filter hard
      if (seenUrls.has(url)) continue;
      const company = deriveCompanyFromHost(url);
      const roleKey = `${company.toLowerCase()}::${title.toLowerCase()}`;
      if (seenCompanyRoles.has(roleKey)) continue;
      seenUrls.add(url);
      seenCompanyRoles.add(roleKey);
      offers.push({ title, url, company, location: '', posted: null, source: 'firecrawl' });
    }
  }
  return offers;
}

// ── Dedup ───────────────────────────────────────────────────────────

function loadSeenUrls() {
  const seen = new Set();

  // scan-history.tsv
  if (existsSync(SCAN_HISTORY_PATH)) {
    const lines = readFileSync(SCAN_HISTORY_PATH, 'utf-8').split('\n');
    for (const line of lines.slice(1)) { // skip header
      const url = line.split('\t')[0];
      if (url) seen.add(url);
    }
  }

  // pipeline.md — extract URLs from checkbox lines
  if (existsSync(PIPELINE_PATH)) {
    const text = readFileSync(PIPELINE_PATH, 'utf-8');
    for (const match of text.matchAll(/- \[[ x]\] (https?:\/\/\S+)/g)) {
      seen.add(match[1]);
    }
  }

  // applications.md — extract URLs from report links and any inline URLs
  if (existsSync(APPLICATIONS_PATH)) {
    const text = readFileSync(APPLICATIONS_PATH, 'utf-8');
    for (const match of text.matchAll(/https?:\/\/[^\s|)]+/g)) {
      seen.add(match[0]);
    }
  }

  return seen;
}

function loadSeenCompanyRoles() {
  const seen = new Set();
  if (existsSync(APPLICATIONS_PATH)) {
    const text = readFileSync(APPLICATIONS_PATH, 'utf-8');
    // Parse markdown table rows: | # | Date | Company | Role | ...
    for (const match of text.matchAll(/\|[^|]+\|[^|]+\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g)) {
      const company = match[1].trim().toLowerCase();
      const role = match[2].trim().toLowerCase();
      if (company && role && company !== 'company') {
        seen.add(`${company}::${role}`);
      }
    }
  }
  return seen;
}

// ── Pipeline writer ─────────────────────────────────────────────────

function appendToPipeline(offers) {
  if (offers.length === 0) return;

  let text = readFileSync(PIPELINE_PATH, 'utf-8');

  // Find "## Pendientes" section and append after it
  const marker = '## Pendientes';
  const idx = text.indexOf(marker);
  if (idx === -1) {
    // No Pendientes section — append at end before Procesadas
    const procIdx = text.indexOf('## Procesadas');
    const insertAt = procIdx === -1 ? text.length : procIdx;
    const block = `\n${marker}\n\n` + offers.map(o =>
      `- [ ] ${o.url} | ${o.company} | ${o.title}`
    ).join('\n') + '\n\n';
    text = text.slice(0, insertAt) + block + text.slice(insertAt);
  } else {
    // Find the end of existing Pendientes content (next ## or end)
    const afterMarker = idx + marker.length;
    const nextSection = text.indexOf('\n## ', afterMarker);
    const insertAt = nextSection === -1 ? text.length : nextSection;

    const block = '\n' + offers.map(o =>
      `- [ ] ${o.url} | ${o.company} | ${o.title}`
    ).join('\n') + '\n';
    text = text.slice(0, insertAt) + block + text.slice(insertAt);
  }

  writeFileSync(PIPELINE_PATH, text, 'utf-8');
}

function appendToScanHistory(offers, date) {
  // Ensure file + header exist
  if (!existsSync(SCAN_HISTORY_PATH)) {
    writeFileSync(SCAN_HISTORY_PATH, 'url\tfirst_seen\tportal\ttitle\tcompany\tstatus\n', 'utf-8');
  }

  const lines = offers.map(o =>
    `${o.url}\t${date}\t${o.source}\t${o.title}\t${o.company}\tadded`
  ).join('\n') + '\n';

  appendFileSync(SCAN_HISTORY_PATH, lines, 'utf-8');
}

// ── Parallel fetch with concurrency limit ───────────────────────────

async function parallelFetch(tasks, limit) {
  const results = [];
  let i = 0;

  async function next() {
    while (i < tasks.length) {
      const task = tasks[i++];
      results.push(await task());
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => next());
  await Promise.all(workers);
  return results;
}

// ── Main ────────────────────────────────────────────────────────────

function runSelfCheck() {
  const cases = [
    ['https://boards.greenhouse.io/acme/jobs/123', 'acme'],
    ['https://job-boards.eu.greenhouse.io/beta/jobs/9', 'beta'],
    ['https://jobs.ashbyhq.com/gamma/abc-def', 'gamma'],
    ['https://delta.ashbyhq.com/careers', 'delta'],
    ['https://jobs.lever.co/epsilon/xyz', 'epsilon'],
    ['https://careers.zeta.com/roles/1', 'careers.zeta.com'],
    ['not-a-url', ''],
  ];
  const filter = buildTitleFilter({ positive: ['engineer'], negative: ['intern'] });
  const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exit(1); } };
  for (const [url, want] of cases) {
    const got = deriveCompanyFromHost(url);
    assert(got === want, `deriveCompanyFromHost(${url}) → ${got}, want ${want}`);
  }
  assert(filter('Senior Engineer') && !filter('Engineer Intern') && !filter('Designer'),
    'title filter applies to discovery results');

  const locFilter = buildLocationFilter({
    allow: ['remote', 'japan', 'tokyo', 'apac'],
    block: ['remote - us', 'remote - canada', 'us only'],
  });
  assert(buildLocationFilter(null) === null, 'no location_filter → null (disabled)');
  assert(locFilter('Remote'), 'plain remote passes');
  assert(locFilter('Tokyo, Japan'), 'Japan location passes');
  assert(locFilter(''), 'unknown/empty location kept');
  assert(!locFilter('San Francisco, CA'), 'on-site elsewhere dropped');
  assert(!locFilter('Berlin, Germany'), 'on-site elsewhere dropped (2)');
  assert(!locFilter('Remote - Canada'), 'region-locked remote dropped');
  assert(!locFilter('Remote - US'), 'US-region-locked remote dropped despite "remote"');
  console.log('scan.mjs self-check ok');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--self-check')) { runSelfCheck(); return; }
  const dryRun = args.includes('--dry-run');
  const companyFlag = args.indexOf('--company');
  const filterCompany = companyFlag !== -1 ? args[companyFlag + 1]?.toLowerCase() : null;

  // 1. Read portals.yml
  if (!existsSync(PORTALS_PATH)) {
    console.error('Error: portals.yml not found. Run onboarding first.');
    process.exit(1);
  }

  const config = parseYaml(readFileSync(PORTALS_PATH, 'utf-8'));
  const companies = config.tracked_companies || [];
  const titleFilter = buildTitleFilter(config.title_filter);
  const locationFilter = buildLocationFilter(config.location_filter);

  // Age gate: only keep jobs posted within max_age_days (default 30).
  // Jobs with no posted date are kept (can't age-check them).
  const maxAgeDays = config.max_age_days ?? 30;
  const cutoffMs = Date.now() - maxAgeDays * 86_400_000;

  // Liveness gate on by default; set check_liveness: false in portals.yml to skip.
  const checkLiveness = config.check_liveness !== false;

  // 2. Filter to enabled companies with detectable APIs
  const targets = companies
    .filter(c => c.enabled !== false)
    .filter(c => !filterCompany || c.name.toLowerCase().includes(filterCompany))
    .map(c => ({ ...c, _api: detectApi(c) }))
    .filter(c => c._api !== null);

  const skippedCount = companies.filter(c => c.enabled !== false).length - targets.length;

  console.log(`Scanning ${targets.length} companies via API (${skippedCount} skipped — no API detected)`);
  if (dryRun) console.log('(dry run — no files will be written)\n');

  // 3. Load dedup sets
  const seenUrls = loadSeenUrls();
  const seenCompanyRoles = loadSeenCompanyRoles();

  // 4. Fetch all APIs
  const date = new Date().toISOString().slice(0, 10);
  let totalFound = 0;
  let totalFiltered = 0;
  let totalLocationFiltered = 0;
  let totalStale = 0;
  let totalDupes = 0;
  const newOffers = [];
  const errors = [];

  const tasks = targets.map(company => async () => {
    const { type, url } = company._api;
    try {
      const json = await fetchJson(url);
      const jobs = PARSERS[type](json, company.name);
      totalFound += jobs.length;

      for (const job of jobs) {
        if (!titleFilter(job.title)) {
          totalFiltered++;
          continue;
        }
        if (locationFilter && !locationFilter(job.location)) {
          totalLocationFiltered++;
          continue;
        }
        if (job.posted && new Date(job.posted).getTime() < cutoffMs) {
          totalStale++;
          continue;
        }
        if (seenUrls.has(job.url)) {
          totalDupes++;
          continue;
        }
        const key = `${job.company.toLowerCase()}::${job.title.toLowerCase()}`;
        if (seenCompanyRoles.has(key)) {
          totalDupes++;
          continue;
        }
        // Mark as seen to avoid intra-scan dupes
        seenUrls.add(job.url);
        seenCompanyRoles.add(key);
        newOffers.push({ ...job, source: `${type}-api` });
      }
    } catch (err) {
      errors.push({ company: company.name, error: err.message });
    }
  });

  await parallelFetch(tasks, CONCURRENCY);

  // 4a2. Broad discovery (opt-in) — feed into the same liveness gate + writers below
  let totalDiscovered = 0;
  if (config.discovery?.enabled) {
    const discovered = await discoverViaFirecrawl(config.discovery, { titleFilter, seenUrls, seenCompanyRoles });
    totalDiscovered = discovered.length;
    newOffers.push(...discovered);
  }

  // 4b. Liveness gate — drop offers whose public posting is dead (404/redirect/expired)
  let totalDead = 0;
  if (checkLiveness && newOffers.length > 0) {
    const checks = await parallelFetch(
      newOffers.map(o => async () => ({ o, live: await checkLive(o.url) })),
      CONCURRENCY,
    );
    const alive = [];
    for (const { o, live } of checks) {
      if (isDeadLink(live)) {
        totalDead++;
        continue;
      }
      alive.push(o);
    }
    newOffers.length = 0;
    newOffers.push(...alive);
  }

  // 5. Write results
  if (!dryRun && newOffers.length > 0) {
    appendToPipeline(newOffers);
    appendToScanHistory(newOffers, date);
  }

  // 6. Print summary
  console.log(`\n${'━'.repeat(45)}`);
  console.log(`Portal Scan — ${date}`);
  console.log(`${'━'.repeat(45)}`);
  console.log(`Companies scanned:     ${targets.length}`);
  console.log(`Total jobs found:      ${totalFound}`);
  console.log(`Filtered by title:     ${totalFiltered} removed`);
  if (locationFilter) console.log(`Filtered by location:  ${totalLocationFiltered} removed`);
  console.log(`Older than ${maxAgeDays}d:         ${totalStale} skipped`);
  console.log(`Duplicates:            ${totalDupes} skipped`);
  if (config.discovery?.enabled) console.log(`Broad discovery:       ${totalDiscovered} found (Firecrawl)`);
  if (checkLiveness) console.log(`Dead postings:         ${totalDead} dropped`);
  console.log(`New offers added:      ${newOffers.length}`);

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    for (const e of errors) {
      console.log(`  ✗ ${e.company}: ${e.error}`);
    }
  }

  if (newOffers.length > 0) {
    console.log('\nNew offers:');
    for (const o of newOffers) {
      console.log(`  + ${o.company} | ${o.title} | ${o.location || 'N/A'}`);
    }
    if (dryRun) {
      console.log('\n(dry run — run without --dry-run to save results)');
    } else {
      console.log(`\nResults saved to ${PIPELINE_PATH} and ${SCAN_HISTORY_PATH}`);
    }
  }

  console.log(`\n→ Run /career-ops pipeline to evaluate new offers.`);
  console.log('→ Share results and get help: https://discord.gg/8pRpHETxa4');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
