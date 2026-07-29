import { createHash } from 'node:crypto';
import { prisma } from '../config/prisma.js';

export type LifecycleVerificationStatus = 'started' | 'verified' | 'failed' | 'deleted';

export interface LifecycleManifestInput {
  runId: string;
  action: string;
  actorRole: string;
  sessionId?: string | null;
  scope?: string | null;
  cutoff?: Date | null;
  candidateRowCount?: number | null;
  backupRowCount?: number | null;
  deletedRowCount?: number | null;
  artifactName?: string | null;
  artifactSha256?: string | null;
  verificationStatus: LifecycleVerificationStatus;
  errorCode?: string | null;
}

export const sha256 = (value: string | Uint8Array): string =>
  createHash('sha256').update(value).digest('hex');

export const createLifecycleManifest = (input: LifecycleManifestInput) => ({
  runId: input.runId,
  action: input.action,
  actorRole: input.actorRole,
  scope: input.scope ?? null,
  cutoff: input.cutoff?.toISOString() ?? null,
  candidateRowCount: input.candidateRowCount ?? null,
  backupRowCount: input.backupRowCount ?? null,
  deletedRowCount: input.deletedRowCount ?? null,
  artifactName: input.artifactName ?? null,
  artifactSha256: input.artifactSha256 ?? null,
  verificationStatus: input.verificationStatus,
  errorCode: input.errorCode ?? null,
});

export const recordLifecycleRun = async (input: LifecycleManifestInput) =>
  prisma.researchLifecycleRun.create({
    data: {
      runId: input.runId,
      action: input.action,
      actorRole: input.actorRole,
      sessionId: input.sessionId ?? null,
      scope: input.scope ?? null,
      cutoff: input.cutoff ?? null,
      candidateRowCount: input.candidateRowCount ?? null,
      backupRowCount: input.backupRowCount ?? null,
      deletedRowCount: input.deletedRowCount ?? null,
      artifactName: input.artifactName ?? null,
      artifactSha256: input.artifactSha256 ?? null,
      verificationStatus: input.verificationStatus,
      startedAt: new Date(),
      errorCode: input.errorCode ?? null,
    },
  });

export const assertVerificationManifest = (input: {
  candidateRowCount: number;
  backupRowCount: number;
  candidateHash: string;
  backupHash: string;
  verificationStatus: string;
}): void => {
  if (input.verificationStatus !== 'verified') throw new Error('Backup verification is incomplete');
  if (input.candidateRowCount !== input.backupRowCount) throw new Error('Backup row count mismatch');
  if (!input.candidateHash || input.candidateHash !== input.backupHash) {
    throw new Error('Backup hash mismatch');
  }
};

export const assertResearchRedisKey = (key: string): void => {
  if (!key.startsWith('research:')) throw new Error('Redis key is outside the research namespace');
};

export const assertTemporaryArtifactAge = (
  verifiedAt: Date,
  now = new Date(),
): void => {
  if (now.getTime() - verifiedAt.getTime() > 7 * 24 * 60 * 60 * 1000) {
    throw new Error('Temporary raw artifact exceeded the seven-day cleanup window');
  }
};
