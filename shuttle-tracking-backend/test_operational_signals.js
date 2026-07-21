import assert from 'node:assert/strict';

const { emitOperationalSignal, getRequestId } = await import('./dist/services/operational-signals.js');

const logs = [];
const originalLog = console.log;
console.log = (...args) => logs.push(args.join(' '));

try {
  emitOperationalSignal({
    event: 'ingestion.outcome',
    level: 'info',
    outcome: 'accepted',
    transport: 'http',
    correlationId: 'req-123',
    sourceId: 'TS_MOB_01',
    sourceType: 'mobile',
    vehicleId: 'VH001',
  });
  emitOperationalSignal({
    event: 'history.persistence_failed',
    level: 'error',
    outcome: 'failed',
    reasonCode: 'PERSISTENCE_FAILED',
    vehicleId: 'VH001',
  });
} finally {
  console.log = originalLog;
}

assert.equal(logs.length, 2);
const accepted = JSON.parse(logs[0]);
assert.deepEqual(
  {
    schemaVersion: accepted.schemaVersion,
    event: accepted.event,
    outcome: accepted.outcome,
    sourceId: accepted.sourceId,
    sourceType: accepted.sourceType,
    vehicleId: accepted.vehicleId,
  },
  {
    schemaVersion: 1,
    event: 'ingestion.outcome',
    outcome: 'accepted',
    sourceId: 'TS_MOB_01',
    sourceType: 'mobile',
    vehicleId: 'VH001',
  },
);

const failed = JSON.parse(logs[1]);
assert.equal(failed.reasonCode, 'PERSISTENCE_FAILED');
assert.equal(Object.hasOwn(failed, 'message'), false);
assert.equal(Object.hasOwn(failed, 'error'), false);
assert.equal(Object.hasOwn(failed, 'secret'), false);
assert.equal(JSON.stringify(failed).includes('password'), false);
assert.notEqual(getRequestId('bad request id with spaces'), 'bad request id with spaces');
assert.match(getRequestId('req-456'), /^req-456$/);

console.log('Operational signal redaction tests passed.');
