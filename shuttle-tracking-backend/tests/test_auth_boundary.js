import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-only-sender-secret';

const { parseSenderClaims, isAdminClaims } = await import('../dist/middleware/auth.js');

const validToken = jwt.sign(
  {
    kind: 'sender',
    sourceId: 'TS_TEST_01',
    credentialVersion: 1,
    assignmentId: 'assignment-1',
  },
  process.env.JWT_SECRET,
  { expiresIn: '5m' },
);

assert.deepEqual(parseSenderClaims(validToken), {
  sourceId: 'TS_TEST_01',
  credentialVersion: 1,
  assignmentId: 'assignment-1',
});

const unassignedToken = jwt.sign(
  {
    kind: 'sender',
    sourceId: 'TS_TEST_01',
    credentialVersion: 1,
    assignmentId: null,
  },
  process.env.JWT_SECRET,
  { expiresIn: '5m' },
);
assert.equal(parseSenderClaims(unassignedToken).assignmentId, null);

const legacyToken = jwt.sign(
  {
    kind: 'sender',
    sourceId: 'TS_TEST_01',
    credentialVersion: 1,
  },
  process.env.JWT_SECRET,
  { expiresIn: '5m' },
);
assert.throws(() => parseSenderClaims(legacyToken), /Invalid sender assignment claim/);

const adminToken = jwt.sign(
  { userId: 'admin-user', username: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '5m' },
);

assert.throws(() => parseSenderClaims(adminToken), /Invalid sender token type/);

const mismatchedClaimsToken = jwt.sign(
  {
    kind: 'sender',
    sourceId: 'TS_TEST_01',
    credentialVersion: '1',
    assignmentId: 'assignment-1',
  },
  process.env.JWT_SECRET,
  { expiresIn: '5m' },
);

assert.throws(() => parseSenderClaims(mismatchedClaimsToken), /Invalid sender token claims/);

const expiredToken = jwt.sign(
  {
    kind: 'sender',
    sourceId: 'TS_TEST_01',
    credentialVersion: 1,
    assignmentId: 'assignment-1',
  },
  process.env.JWT_SECRET,
  { expiresIn: -1 },
);

assert.throws(() => parseSenderClaims(expiredToken), /jwt expired/);

const invalidSignatureToken = jwt.sign(
  {
    kind: 'sender',
    sourceId: 'TS_TEST_01',
    credentialVersion: 1,
    assignmentId: 'assignment-1',
  },
  'different-test-secret',
  { expiresIn: '5m' },
);

assert.throws(() => parseSenderClaims(invalidSignatureToken), /invalid signature/);

assert.equal(isAdminClaims({ userId: 'admin-user', username: 'admin' }), true);
assert.equal(isAdminClaims({ kind: 'sender', sourceId: 'TS_TEST_01' }), false);

console.log('Sender JWT boundary tests passed.');
