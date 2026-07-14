#!/usr/bin/env node
/**
 * gen-applications-md.mjs
 * Regenerates data/applications.md FROM data/jobs.json (the tracker source of truth).
 *
 * A job appears in applications.md if it has been evaluated (has a `report` field).
 * Status is derived: application.status → capitalized; else decision 'skip' → SKIP;
 * else → Evaluated. This replaces the old xlsx→python sync-tracker.mjs.
 *
 * Run: node gen-applications-md.mjs
 */
import { readFileSync, writeFileSync } from 'fs'

const CANON = { applied: 'Applied', responded: 'Responded', interview: 'Interview', offer: 'Offer', rejected: 'Rejected', discarded: 'Discarded' }

function statusOf(job) {
  if (job.application && job.application.status) return CANON[job.application.status] || 'Applied'
  if (job.decision === 'skip') return 'SKIP'
  return 'Evaluated'
}

function pdfOf(job) {
  const cv = (job.application && job.application.cvUsed) || (job.preparation && job.preparation.cvPath) || ''
  return /output\/|\.pdf$/i.test(cv) && !/cv-default/i.test(cv) ? '✅' : '❌'
}

function reportCell(report) {
  const m = String(report).match(/(\d{3})-/)
  return m ? `[${m[1]}](${report})` : `[report](${report})`
}

const data = JSON.parse(readFileSync('data/jobs.json', 'utf8'))
const evaluated = data.jobs
  .filter(j => j.report)
  .sort((a, b) => (Number(a.appNum) || 0) - (Number(b.appNum) || 0))

const header = `# Applications Tracker

<!-- GENERATED from data/jobs.json by gen-applications-md.mjs — do not hand-edit.
     Edit the job in data/jobs.json (or the tracker UI), then re-run the generator. -->

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
`

const rows = evaluated.map(j => {
  const co = (j.company && j.company.company) || ''
  const date = (j.application && j.application.dateApplied) || j.dateAdded || ''
  const score = j.fitScore ? `${j.fitScore}/5` : ''
  const notes = (j.notes || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
  return `| ${j.appNum || ''} | ${date} | ${co} | ${j.role || ''} | ${score} | ${statusOf(j)} | ${pdfOf(j)} | ${reportCell(j.report)} | ${notes} |`
}).join('\n')

writeFileSync('data/applications.md', header + rows + '\n')
console.log(`Generated data/applications.md — ${evaluated.length} evaluated offers.`)
