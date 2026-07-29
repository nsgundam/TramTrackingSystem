import { randomUUID } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';
import {
  assertVerificationManifest,
  recordLifecycleRun,
} from './research-lifecycle.service.js';

export const RAW_RETENTION_DAYS = 90;
export const RAW_RETENTION_MS = RAW_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export const rawRetentionCutoff = (now = new Date()): Date =>
  new Date(now.getTime() - RAW_RETENTION_MS);

export interface RetentionVerification {
  candidateRowCount: number;
  backupRowCount: number;
  candidateHash: string;
  backupHash: string;
  verificationStatus: string;
}

export const deleteExpiredRawObservations = async (input: {
  actorRole: 'DEV' | 'SUPER_ADMIN';
  cutoff?: Date;
  verification: RetentionVerification;
  sessionId?: string;
}): Promise<number> => {
  const cutoff = input.cutoff ?? rawRetentionCutoff();
  assertVerificationManifest(input.verification);
  const runId = randomUUID();

  const deleted = await prisma.researchRawObservation.deleteMany({
    where: {
      backendReceiveTime: { lt: cutoff },
      ...(input.sessionId ? { sessionId: input.sessionId } : {}),
    },
  });

  await recordLifecycleRun({
    runId,
    sessionId: input.sessionId,
    action: 'raw_retention_delete',
    actorRole: input.actorRole,
    cutoff,
    candidateRowCount: input.verification.candidateRowCount,
    backupRowCount: input.verification.backupRowCount,
    deletedRowCount: deleted.count,
    verificationStatus: 'deleted',
  });
  return deleted.count;
};

export const deleteAggregateManually = async (input: {
  actorRole: 'DEV' | 'SUPER_ADMIN';
  sessionId: string;
}): Promise<number> => {
  const deleted = await prisma.researchMetricAggregate.deleteMany({
    where: { sessionId: input.sessionId },
  });
  await recordLifecycleRun({
    runId: randomUUID(),
    sessionId: input.sessionId,
    action: 'aggregate_manual_delete',
    actorRole: input.actorRole,
    deletedRowCount: deleted.count,
    verificationStatus: 'deleted',
  });
  return deleted.count;
};

export const researchRedisKeys = async (pattern = 'research:*'): Promise<string[]> => {
  if (!/^research:[a-z0-9:_*-]+$/i.test(pattern)) {
    throw new Error('Redis research scan pattern escaped namespace');
  }
  const keys: string[] = [];
  for await (const batch of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    for (const key of batch) {
      if (typeof key === 'string') keys.push(key);
    }
  }
  return keys;
};

export const researchRedisTtls = async (keys: string[]): Promise<Record<string, number>> => {
  const result: Record<string, number> = {};
  for (const key of keys) {
    if (!key.startsWith('research:')) throw new Error('Redis research scan escaped namespace');
    result[key] = await redisClient.ttl(key);
  }
  return result;
};
