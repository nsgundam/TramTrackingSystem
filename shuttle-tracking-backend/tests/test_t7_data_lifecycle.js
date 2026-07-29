import assert from 'node:assert/strict';
import {
  assertResearchRedisKey,
  assertTemporaryArtifactAge,
  assertVerificationManifest,
  createLifecycleManifest,
  sha256,
} from '../dist/services/research-lifecycle.service.js';

const manifest = createLifecycleManifest({
  runId: 'run-1',
  action: 'research_export',
  actorRole: 'DEV',
  scope: 'session:synthetic',
  verificationStatus: 'verified',
});
assert.equal(manifest.actorRole, 'DEV');
assert.equal(manifest.scope, 'session:synthetic');
assert.equal(sha256('fixture'), 'f16d05ec6b29248d2c61adb1e9263f78e4f7bace1b955014a2d17872cfe4064d');

assert.doesNotThrow(() => assertVerificationManifest({
  candidateRowCount: 2,
  backupRowCount: 2,
  candidateHash: 'abc',
  backupHash: 'abc',
  verificationStatus: 'verified',
}));
assert.throws(() => assertVerificationManifest({
  candidateRowCount: 2,
  backupRowCount: 1,
  candidateHash: 'abc',
  backupHash: 'abc',
  verificationStatus: 'verified',
}), /row count mismatch/);
assert.throws(() => assertVerificationManifest({
  candidateRowCount: 1,
  backupRowCount: 1,
  candidateHash: 'abc',
  backupHash: 'def',
  verificationStatus: 'verified',
}), /hash mismatch/);
assert.doesNotThrow(() => assertResearchRedisKey('research:session:1'));
assert.throws(() => assertResearchRedisKey('canonical:state:vehicle:VH001'), /namespace/);
assert.doesNotThrow(() => assertTemporaryArtifactAge(new Date('2026-07-25T00:00:00Z'), new Date('2026-07-29T00:00:00Z')));
assert.throws(() => assertTemporaryArtifactAge(new Date('2026-07-20T00:00:00Z'), new Date('2026-07-29T00:00:00Z')), /seven-day/);

console.log('T7 lifecycle manifest, fail-closed verification, namespace, and cleanup checks passed.');
