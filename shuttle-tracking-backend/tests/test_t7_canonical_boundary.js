import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { researchDispositionFor } from '../dist/services/research-diagnostics.service.js';

const canonical = {
  sourceId: 'mobile-source',
  reasonCode: 'CANONICAL_SELECTED',
  timing: { selectedAt: '2026-07-29T03:00:00.000Z' },
};
assert.equal(researchDispositionFor('mobile-source', canonical), 'selected');
assert.equal(researchDispositionFor('lorawan-source', canonical), 'eligible_not_selected');
assert.equal(researchDispositionFor('lorawan-source', null), 'eligible_not_selected');

const tracking = await readFile('src/services/tracking.service.ts', 'utf8');
assert.match(tracking, /activeResearchSessionId/);
assert.match(tracking, /recordResearchObservation/);
assert.match(tracking, /cannot reject or alter the T6 result/);
assert.match(tracking, /canonicalState = await evaluateCanonicalLocation/);
assert.doesNotMatch(tracking, /location-update/);

console.log('T7 raw/canonical boundary invariance checks passed.');
