import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const { isTransportAllowedForSource } = await import('../dist/services/ingestion-transport.js');

const cases = [
  ['esp32', 'socket', true],
  ['esp32', 'http', false],
  ['esp32', 'ttn', false],
  ['mobile', 'socket', true],
  ['mobile', 'http', true],
  ['simulator', 'socket', true],
  ['simulator', 'http', true],
  ['lorawan', 'ttn', true],
];
for (const [sourceType, transport, expected] of cases) {
  assert.equal(
    isTransportAllowedForSource(sourceType, transport),
    expected,
    `${sourceType} over ${transport} should be ${expected ? 'allowed' : 'rejected'}`,
  );
}

// Every adapter must declare its transport, and the rule must run before the first telemetry write.
const [tracking, ingest, server] = await Promise.all([
  readFile('src/services/tracking.service.ts', 'utf8'),
  readFile('src/routes/ingest.route.ts', 'utf8'),
  readFile('src/server.ts', 'utf8'),
]);
assert.match(ingest, /transport: 'http'/);
assert.match(ingest, /transport: 'ttn'/);
assert.match(server, /transport: 'socket'/);
const ruleIndex = tracking.indexOf('isTransportAllowedForSource(source.type, data.transport)');
const firstWriteIndex = tracking.indexOf('await redisClient.set(cacheKey');
assert.ok(ruleIndex > 0 && firstWriteIndex > 0 && ruleIndex < firstWriteIndex);

console.log('Ingestion transport policy checks passed.');
