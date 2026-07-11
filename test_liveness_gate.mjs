// Self-check for the scan liveness drop decision. Run: node test_liveness_gate.mjs
import assert from 'assert';
import { classifyLiveness, isDeadLink } from './liveness-core.mjs';

// 404 public page (the Fireblocks case) → dead, drop it
assert.equal(isDeadLink(classifyLiveness({ status: 404 })), true, '404 must drop');
assert.equal(isDeadLink(classifyLiveness({ status: 410 })), true, '410 must drop');

// Expired body text → drop
assert.equal(
  isDeadLink(classifyLiveness({ status: 200, bodyText: 'This job is no longer available. '.repeat(20) })),
  true, 'expired body must drop',
);

// Healthy job page with apply control → keep
assert.equal(
  isDeadLink(classifyLiveness({ status: 200, bodyText: 'x'.repeat(500), applyControls: ['Apply now'] })),
  false, 'active page must keep',
);

// Thin-content SPA (nav only) → uncertain-ish; must NOT drop (avoid false positives)
assert.equal(
  isDeadLink(classifyLiveness({ status: 200, bodyText: 'Home Careers' })),
  false, 'thin content must NOT drop',
);

// Our own fetch failure → uncertain → keep
assert.equal(isDeadLink({ result: 'uncertain', reason: 'fetch failed: timeout' }), false, 'fetch failure must keep');

console.log('✓ liveness gate drop logic OK');
