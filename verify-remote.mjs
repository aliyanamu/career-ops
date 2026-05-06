#!/usr/bin/env node

/**
 * verify-remote.mjs — Validate "Remote" job postings against US/UK/IL geofencing
 *
 * Uses Playwright (chromium) so it can read JS-rendered JD bodies on Greenhouse,
 * Ashby, Lever, etc. Falls back to plain fetch() if --no-browser is passed.
 *
 * For each URL in data/pipeline.md whose location contains "Remote" (or is
 * empty/Worldwide/Global), fetches the rendered JD body and looks for red-flag
 * phrases:
 *   - "must overlap with US/PT/ET hours"
 *   - "authorized to work in the United States"
 *   - "located in the US/Canada"
 *   - "this role is US-only" / UK-only / Israel-only
 *
 * Annotates pipeline.md and writes data/verify-remote-report.md.
 *
 * Usage:
 *   node verify-remote.mjs                  # Playwright, all "Remote" entries
 *   node verify-remote.mjs --rewrite        # also rewrite pipeline.md (mark BLOCKED rows)
 *   node verify-remote.mjs --limit 50       # only first 50
 *   node verify-remote.mjs --no-browser     # use plain fetch() (faster but misses JS-rendered)
 *   node verify-remote.mjs --concurrency 4  # number of parallel browser pages (default 4)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

const args = process.argv.slice(2);
const LIMIT = args.includes('--limit')
  ? parseInt(args[args.indexOf('--limit') + 1], 10)
  : Infinity;
const REWRITE = args.includes('--rewrite');
const NO_BROWSER = args.includes('--no-browser');
const CONCURRENCY = args.includes('--concurrency')
  ? parseInt(args[args.indexOf('--concurrency') + 1], 10)
  : 4;

const PIPELINE = 'data/pipeline.md';
const REPORT = 'data/verify-remote-report.md';

const US_ONLY = [
  /\bauthorized to work in the (united states|us)\b/i,
  /\bmust be (located|based|residing|a resident) in the (united states|us|usa)\b/i,
  /\bUS[- ]?based\b/i,
  /\bUS[- ]?only\b/i,
  /\b(remote|located) (anywhere )?in the (united states|us|usa)\b/i,
  /\bremote[- ]?(us|usa|united states|north america|americas)\b/i,
  /\bopen to candidates? (located|based|residing) in the (us|united states)\b/i,
  /\bthis (position|role) is (only )?(open to|available to)? ?(us|united states|north america)\b/i,
  /\bmust (overlap|work) (with )?(us )?(pacific|eastern|pt|et|pst|est) (time|hours|timezone)\b/i,
  /\bcontinental (united states|us)\b/i,
  /\b(must|need to) (be )?eligible to work in the (united states|us)\b/i,
  /\bU\.?S\.? (citizens?|residents?|persons?)\b/i,
];

const UK_ONLY = [
  /\bmust be (located|based|residing|a resident) in (the )?(uk|united kingdom)\b/i,
  /\bUK[- ]?based\b/i,
  /\b(right to work|authorised to work|eligible to work) in (the )?(uk|united kingdom)\b/i,
  /\bremote[- ]?uk\b/i,
];

const IL_ONLY = [
  /\bmust be (located|based|residing) in (israel|tel aviv)\b/i,
  /\bIsrael[- ]?based\b/i,
  /\bremote (in )?israel\b/i,
];

const PRO_GLOBAL = [
  /\bremote (worldwide|globally|anywhere|global)\b/i,
  /\bany time ?zone\b/i,
  /\bfully async\b/i,
  /\bglobally distributed\b/i,
  /\bworldwide remote\b/i,
];

function classify(body) {
  if (!body) return { verdict: 'unknown', matches: [] };
  const matches = [];
  let usHits = 0,
    ukHits = 0,
    ilHits = 0,
    globalHits = 0;
  for (const re of US_ONLY) {
    const m = body.match(re);
    if (m) {
      matches.push(`US-only: "${m[0]}"`);
      usHits++;
    }
  }
  for (const re of UK_ONLY) {
    const m = body.match(re);
    if (m) {
      matches.push(`UK-only: "${m[0]}"`);
      ukHits++;
    }
  }
  for (const re of IL_ONLY) {
    const m = body.match(re);
    if (m) {
      matches.push(`IL-only: "${m[0]}"`);
      ilHits++;
    }
  }
  for (const re of PRO_GLOBAL) {
    const m = body.match(re);
    if (m) {
      matches.push(`GLOBAL: "${m[0]}"`);
      globalHits++;
    }
  }
  let verdict;
  if (usHits || ukHits || ilHits) verdict = 'BLOCKED';
  else if (globalHits) verdict = 'GLOBAL_OK';
  else verdict = 'unclear';
  return { verdict, matches };
}

function parsePipeline(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    if (line.includes('<!-- BLOCKED-TZ -->')) continue;
    const m = line.match(/^-\s*\[\s*\]\s*(\S+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*(?:\|\s*(.+))?$/);
    if (m) {
      rows.push({
        line,
        url: m[1],
        company: m[2].trim(),
        role: m[3].trim(),
        location: (m[4] || '').trim(),
      });
    }
  }
  return rows;
}

async function fetchPlain(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
      redirect: 'follow',
    });
    if (!res.ok) return { ok: false, status: res.status, text: '' };
    return { ok: true, status: res.status, text: await res.text() };
  } catch (err) {
    return { ok: false, status: 0, text: '', error: err.message };
  }
}

async function fetchRendered(browser, url) {
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    // Give JS frameworks (Greenhouse/Ashby/Lever) a moment to render
    await page
      .waitForLoadState('networkidle', { timeout: 8000 })
      .catch(() => {});
    const text = await page.evaluate(() => document.body.innerText || '');
    await ctx.close();
    return { ok: true, text };
  } catch (err) {
    await ctx.close();
    return { ok: false, text: '', error: err.message };
  }
}

async function withConcurrency(items, n, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: n }, run));
  return results;
}

async function main() {
  if (!existsSync(PIPELINE)) {
    console.error(`Pipeline not found: ${PIPELINE}`);
    process.exit(1);
  }
  const text = readFileSync(PIPELINE, 'utf-8');
  const rows = parsePipeline(text);
  const remoteRows = rows.filter((r) => {
    const loc = r.location.toLowerCase().trim();
    return loc.includes('remote') || loc === '' || loc === 'worldwide' || loc === 'global';
  });

  const sample = remoteRows.slice(0, LIMIT);
  console.log(
    `Found ${remoteRows.length} 'Remote' rows; verifying ${sample.length} (browser=${!NO_BROWSER}, concurrency=${CONCURRENCY})`
  );

  let browser = null;
  if (!NO_BROWSER) {
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true });
  }

  let done = 0;
  const results = await withConcurrency(sample, NO_BROWSER ? 8 : CONCURRENCY, async (r) => {
    const t0 = Date.now();
    const fetched = NO_BROWSER ? await fetchPlain(r.url) : await fetchRendered(browser, r.url);
    if (!fetched.ok) {
      done++;
      process.stdout.write(`  [${done}/${sample.length}] ${r.company.slice(0, 22)} fetch-failed (${fetched.error || fetched.status})\n`);
      return { ...r, verdict: 'fetch-failed', matches: [] };
    }
    const body = NO_BROWSER ? fetched.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ') : fetched.text;
    const { verdict, matches } = classify(body);
    done++;
    const ms = Date.now() - t0;
    process.stdout.write(
      `  [${done}/${sample.length}] ${r.company.slice(0, 22).padEnd(22)} ${verdict.padEnd(11)} (${ms}ms)\n`
    );
    return { ...r, verdict, matches };
  });

  if (browser) await browser.close();

  // Build report
  const reportLines = [
    '# Verify-Remote Report',
    `_Generated: ${new Date().toISOString()}_`,
    `_Engine: ${NO_BROWSER ? 'fetch (HTML-only)' : 'Playwright (JS-rendered)'}, concurrency=${CONCURRENCY}_`,
    '',
    `Checked **${sample.length}** "Remote" postings.`,
    '',
    `**Verdict counts:**`,
    '',
  ];
  const counts = {};
  for (const r of results) counts[r.verdict] = (counts[r.verdict] || 0) + 1;
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    reportLines.push(`- ${k}: ${v}`);
  }
  reportLines.push('');
  reportLines.push('| # | Verdict | Company | Role | URL | Evidence |');
  reportLines.push('|---|---|---|---|---|---|');
  results.forEach((r, i) => {
    const ev = (r.matches || []).slice(0, 2).join('; ').replace(/\|/g, '/').slice(0, 200);
    reportLines.push(
      `| ${i + 1} | **${r.verdict}** | ${r.company} | ${r.role} | [link](${r.url}) | ${ev || '—'} |`
    );
  });
  writeFileSync(REPORT, reportLines.join('\n') + '\n');

  const blocked = results.filter((r) => r.verdict === 'BLOCKED');
  console.log(`\nReport: ${REPORT}`);
  console.log(`Verdict counts: ${JSON.stringify(counts)}`);
  console.log(`Blocked (US/UK/IL-only): ${blocked.length}`);

  if (REWRITE && blocked.length) {
    let newText = text;
    for (const b of blocked) {
      const escapedUrl = b.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`^- \\[ \\] ${escapedUrl}.*$`, 'm');
      newText = newText.replace(re, (line) => `<!-- BLOCKED-TZ -->${line}`);
    }
    writeFileSync(PIPELINE, newText);
    console.log(`Rewrote ${PIPELINE} — ${blocked.length} rows commented out.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
