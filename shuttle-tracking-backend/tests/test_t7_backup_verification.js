import assert from 'node:assert/strict';
import {
  assertVerificationManifest,
  createLifecycleManifest,
} from '../dist/services/research-lifecycle.service.js';

assert.equal(createLifecycleManifest({
  runId: 'backup-run',
  action: 'backup_restore_verify',
  actorRole: 'SUPER_ADMIN',
  candidateRowCount: 3,
  backupRowCount: 3,
  artifactName: 'synthetic-backup.dump',
  artifactSha256: 'a'.repeat(64),
  verificationStatus: 'verified',
}).verificationStatus, 'verified');

assert.throws(() => assertVerificationManifest({
  candidateRowCount: 3,
  backupRowCount: 3,
  candidateHash: 'a'.repeat(64),
  backupHash: 'b'.repeat(64),
  verificationStatus: 'verified',
}), /hash mismatch/);
assert.throws(() => assertVerificationManifest({
  candidateRowCount: 3,
  backupRowCount: 3,
  candidateHash: 'a'.repeat(64),
  backupHash: 'a'.repeat(64),
  verificationStatus: 'started',
}), /incomplete/);

console.log('T7 backup/restore manifest fail-closed checks passed; restore was not run.');
