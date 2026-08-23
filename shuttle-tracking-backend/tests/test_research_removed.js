import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [schema, server, ingest, tracking, packageJson, migration] = await Promise.all([
  read('prisma/schema.prisma'),
  read('src/server.ts'),
  read('src/routes/ingest.route.ts'),
  read('src/services/tracking.service.ts'),
  read('package.json'),
  read('prisma/migrations/20260824120000_remove_research_feature/migration.sql'),
]);

for (const model of [
  'ResearchSession',
  'ResearchRawObservation',
  'ResearchMetricAggregate',
  'ResearchLifecycleRun',
]) {
  assert.doesNotMatch(schema, new RegExp(`model\\s+${model}\\b`));
}

assert.doesNotMatch(server, /\/api\/research|research\.route|research-diagnostics/);
assert.doesNotMatch(ingest, /researchMetadata|extractResearchMetadata|research-diagnostics/);
assert.doesNotMatch(tracking, /Research|research_|T7_RESEARCH/);
assert.doesNotMatch(packageJson, /test:t7|test_t7_/);

const sourceFiles = await readdir(new URL('../src', import.meta.url), { recursive: true });
assert.equal(
  sourceFiles.some((path) => typeof path === 'string' && /(^|\/)research[^/]*\.(ts|js)$/.test(path)),
  false,
  'Research-only runtime source files must remain removed',
);

const testFiles = await readdir(new URL('../tests', import.meta.url), { recursive: true });
const residualResearchArtifacts = testFiles
  .filter((path) => typeof path === 'string')
  .filter((path) => /(^|[/_-])(research|t7)([/_.-]|$)/i.test(path))
  .filter((path) => path !== 'test_research_removed.js');
assert.deepEqual(
  residualResearchArtifacts,
  [],
  'Active Research/T7 tests and fixtures must remain removed',
);

const expectedDropOrder = [
  'research_raw_observations',
  'research_metric_aggregates',
  'research_lifecycle_runs',
  'research_sessions',
];
const droppedTables = [...migration.matchAll(/DROP TABLE IF EXISTS "([^"]+)"/g)]
  .map((match) => match[1]);
assert.deepEqual(droppedTables, expectedDropOrder, 'Migration must drop only Research tables');

let previousIndex = -1;
for (const table of expectedDropOrder) {
  const index = migration.indexOf(`DROP TABLE IF EXISTS "${table}"`);
  assert.ok(index > previousIndex, `${table} must be dropped once and in foreign-key-safe order`);
  previousIndex = index;
}
assert.doesNotMatch(migration, /\b(ALTER|UPDATE|DELETE|TRUNCATE)\b/i);

// Removing diagnostic capture must not remove the canonical ingestion path.
assert.match(ingest, /processObservation\(/);
assert.match(server, /processObservation\(/);
assert.match(tracking, /evaluateCanonicalLocation\(/);
assert.match(tracking, /recordCanonicalHistory\(/);

console.log('Research runtime, schema, configuration, and capture removal checks passed.');
