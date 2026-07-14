/**
 * loop.mjs — deterministic selection for the unattended loop (modes/loop.md).
 *
 * The LLM does scoring; this script owns the two decision-path queues and their
 * invariants, so the rule lives in ONE tested place instead of drift-prone mode prose.
 *
 * Usage:
 *   node loop.mjs                 # review queue: scored roles awaiting the human's call
 *   node loop.mjs draft           # draft queue: approved roles with no cover letter yet
 *   node loop.mjs --self-check    # run assertions
 */
import { readFileSync } from 'fs';

const THRESHOLD = 4.0;                                  // ponytail: hardcoded — equals the "discourage <4.0" ethics line
const ACTIONED = new Set(['apply', 'easy_apply', 'skip']); // human already decided → out of review queue

export const isUserAdded = (job) => /user/i.test(job.source || '');       // "User-added", "User pick", "user-submitted"
export const scoreNum    = (job) => parseFloat(String(job.fitScore)) || 0; // "4.4" and "4.2/5" both → 4.x

// Roles the loop just scored that the human should review before anything is drafted.
export function reviewQueue(jobs) {
  return jobs.filter(j =>
    j.report &&                                    // scored: a full eval report was written
    !ACTIONED.has(j.decision) &&                   // not yet approved/dropped
    (scoreNum(j) >= THRESHOLD || isUserAdded(j))); // high fit OR user-added (always queued, any score)
}

// Roles the human approved for drafting that don't have a cover letter yet (idempotent re-run).
export function draftQueue(jobs) {
  return jobs.filter(j => j.decision === 'apply' && !(j.preparation && j.preparation.coverLetterPath));
}

function loadJobs() {
  const d = JSON.parse(readFileSync('data/jobs.json', 'utf-8'));
  return Array.isArray(d) ? d : d.jobs;
}

const co = (j) => (j.company && j.company.company) || j.company || '';
const fmt = (j) => `${j.appNum || ''}\t${j.fitScore || ''}\t${co(j)}\t${j.role || ''}\t${j.url || ''}`;

function selfCheck() {
  const J = [
    { role: 'a', report: 'r', fitScore: '4.2/5', decision: 'pending', source: 'career-ops scan' },        // in review
    { role: 'b', report: 'r', fitScore: '3.5',   decision: 'pending', source: 'career-ops scan' },        // out: low fit
    { role: 'c', report: 'r', fitScore: '2.0',   decision: 'pending', source: 'User-added (Lever)' },     // in: user-added
    { role: 'd', report: 'r', fitScore: '4.9',   decision: 'apply',   source: 'x' },                      // out review, in draft
    { role: 'e',              fitScore: '5',      decision: 'pending', source: 'x' },                      // out: not scored (no report)
    { role: 'f', report: 'r', fitScore: '4.5',   decision: 'skip',    source: 'x' },                      // out: dropped
    { role: 'g',                                   decision: 'apply',   source: 'x', preparation: { coverLetterPath: 'output/g.md' } }, // drafted already
  ];
  const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exit(1); } };
  assert(String(reviewQueue(J).map(j => j.role)) === 'a,c', `reviewQueue → ${reviewQueue(J).map(j => j.role)}`);
  assert(String(draftQueue(J).map(j => j.role)) === 'd', `draftQueue → ${draftQueue(J).map(j => j.role)}`);
  console.log('loop.mjs self-check ok');
}

const cmd = process.argv[2];
if (cmd === '--self-check') selfCheck();
else {
  const q = cmd === 'draft' ? draftQueue(loadJobs()) : reviewQueue(loadJobs());
  console.log(q.length ? q.map(fmt).join('\n') : '(none)');
}
