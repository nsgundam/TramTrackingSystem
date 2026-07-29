import assert from 'node:assert/strict';
import {
  RAW_RETENTION_DAYS,
  rawRetentionCutoff,
} from '../dist/services/research-retention.service.js';

const now = new Date('2026-07-29T00:00:00.000Z');
assert.equal(RAW_RETENTION_DAYS, 90);
assert.equal(rawRetentionCutoff(now).toISOString(), '2026-04-30T00:00:00.000Z');

console.log('T7 receive-time 90-day retention boundary checks passed; database deletion was not run.');
