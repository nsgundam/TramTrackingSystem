import assert from 'node:assert/strict';
import {
  csvHeader,
  rowToCsv,
  RESEARCH_EXPORT_FIELDS,
  RESEARCH_EXPORT_MAX_ROWS,
  RESEARCH_EXPORT_MAX_WINDOW_MS,
  validateExportWindow,
} from '../dist/services/research-export.service.js';

assert.equal(csvHeader().trim(), RESEARCH_EXPORT_FIELDS.join(','));
const csv = rowToCsv({
  schema_version: 't7-csv-v1',
  session_alias: '=FORMULA',
  source_alias: 'unit-1',
  source_type: 'mobile',
  received_at: new Date('2026-07-29T03:00:00.000Z'),
  reported_accuracy_unit: 'm, quoted',
});
assert.match(csv, /'=?FORMULA|''?=FORMULA/);
assert.match(csv, /"m, quoted"/);
assert.ok(RESEARCH_EXPORT_MAX_ROWS > 0);
assert.equal(RESEARCH_EXPORT_MAX_WINDOW_MS, 31 * 24 * 60 * 60 * 1000);
assert.equal(validateExportWindow(new Date('2026-07-01T00:00:00Z'), new Date('2026-07-10T00:00:00Z')), true);
assert.equal(validateExportWindow(new Date('2026-07-01T00:00:00Z'), new Date('2026-08-10T00:00:00Z')), false);

console.log('T7 fixed-field CSV, formula safety, quoting, and bounded export checks passed.');
