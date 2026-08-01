import { prisma } from '../config/prisma.js';
import { feedbackAuditRecord, isFeedbackCaseStatus } from './feedback.service.js';

export const FEEDBACK_IP_RETENTION_DAYS = 30;
export const FEEDBACK_CONTENT_RETENTION_DAYS = 180;
export const FEEDBACK_RETENTION_SWEEP_INTERVAL_MS = 12 * 60 * 60 * 1000;

const daysToMs = (days: number): number => days * 24 * 60 * 60 * 1000;

export const feedbackIpRetentionCutoff = (now = new Date()): Date =>
  new Date(now.getTime() - daysToMs(FEEDBACK_IP_RETENTION_DAYS));

export const feedbackContentRetentionCutoff = (now = new Date()): Date =>
  new Date(now.getTime() - daysToMs(FEEDBACK_CONTENT_RETENTION_DAYS));

export const feedbackPurgeFilter = (now = new Date()) => ({
  OR: [
    { createdAt: { lt: feedbackContentRetentionCutoff(now) } },
    {
      deletedAt: { not: null },
      restoreExpiresAt: { lt: now },
    },
  ],
});

export interface FeedbackRetentionResult {
  ipAddressCleared: number;
  feedbackPurged: number;
}

/**
 * This operation is safe to repeat. The unique non-content `retention_purge` event prevents
 * duplicate evidence if multiple service processes overlap, and a second delete becomes a no-op.
 */
export const runFeedbackRetention = async (now = new Date()): Promise<FeedbackRetentionResult> => {
  const ipResult = await prisma.feedback.updateMany({
    where: {
      ipAddress: { not: null },
      createdAt: { lt: feedbackIpRetentionCutoff(now) },
    },
    data: { ipAddress: null },
  });

  const candidates = await prisma.feedback.findMany({
    where: feedbackPurgeFilter(now),
    select: { id: true, status: true },
  });
  if (candidates.length === 0) {
    return { ipAddressCleared: ipResult.count, feedbackPurged: 0 };
  }

  const candidateIds = candidates.map((candidate) => candidate.id);
  await prisma.$transaction(async (tx) => {
    await tx.feedbackAuditEvent.createMany({
      data: candidates.map((candidate) => {
        const status = isFeedbackCaseStatus(candidate.status) ? candidate.status : null;
        return feedbackAuditRecord({
          feedbackId: candidate.id,
          action: 'retention_purged',
          eventKey: 'retention_purge',
          fromStatus: status,
          toStatus: status,
          occurredAt: now,
        });
      }),
      skipDuplicates: true,
    });
  });
  const deleted = await prisma.feedback.deleteMany({ where: { id: { in: candidateIds } } });
  return { ipAddressCleared: ipResult.count, feedbackPurged: deleted.count };
};

const runFeedbackRetentionSweep = async (): Promise<void> => {
  try {
    const result = await runFeedbackRetention();
    console.info(`[Feedback retention] completed (ip_cleared=${result.ipAddressCleared}, feedback_purged=${result.feedbackPurged})`);
  } catch {
    console.error('[Feedback retention] failed');
  }
};

export const startFeedbackRetentionSweep = (): void => {
  const timer = setInterval(() => {
    void runFeedbackRetentionSweep();
  }, FEEDBACK_RETENTION_SWEEP_INTERVAL_MS);
  timer.unref();
  void runFeedbackRetentionSweep();
};
