import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { conflict, notFound, unprocessableRequest } from '../middleware/boundary-errors.js';
import type { FeedbackDeleteReason } from '../middleware/validation.js';

export const FEEDBACK_CASE_STATUSES = [
  'new',
  'acknowledged',
  'investigating',
  'resolved',
  'duplicate',
  'rejected',
] as const;

export type FeedbackCaseStatus = typeof FEEDBACK_CASE_STATUSES[number];
export type FeedbackMutableStatus = Exclude<FeedbackCaseStatus, 'new'>;

const allowedTransitions: Record<FeedbackCaseStatus, readonly FeedbackMutableStatus[]> = {
  new: ['acknowledged', 'duplicate', 'rejected'],
  acknowledged: ['investigating'],
  investigating: ['resolved'],
  resolved: [],
  duplicate: [],
  rejected: [],
};

export const canTransitionFeedback = (
  from: FeedbackCaseStatus,
  to: FeedbackMutableStatus,
): boolean => allowedTransitions[from].includes(to);

export const isFeedbackCaseStatus = (value: string): value is FeedbackCaseStatus =>
  FEEDBACK_CASE_STATUSES.includes(value as FeedbackCaseStatus);

export interface CreateFeedbackInput {
  type: string;
  vehicleId: string;
  message: string;
}

export interface FeedbackActor {
  id: string;
}

export interface FeedbackCaseUpdate {
  status?: FeedbackMutableStatus;
  internalNote?: string;
}

export const FEEDBACK_RESTORE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export const feedbackRestoreExpiry = (now = new Date()): Date =>
  new Date(now.getTime() + FEEDBACK_RESTORE_WINDOW_MS);

const feedbackCaseSelect = {
  id: true,
  type: true,
  vehicleId: true,
  message: true,
  status: true,
  assignedAt: true,
  acknowledgedAt: true,
  investigatingAt: true,
  resolvedAt: true,
  internalNote: true,
  deletedAt: true,
  deletionReason: true,
  restoreExpiresAt: true,
  createdAt: true,
  vehicle: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, username: true, role: true } },
  deletedBy: { select: { id: true, username: true, role: true } },
} satisfies Prisma.FeedbackSelect;

const publicFeedbackReceiptSelect = {
  id: true,
  createdAt: true,
} satisfies Prisma.FeedbackSelect;

type FeedbackAuditAction =
  | 'created'
  | 'status_changed'
  | 'note_updated'
  | 'soft_deleted'
  | 'restored'
  | 'retention_purged';

export const feedbackAuditRecord = (input: {
  feedbackId: string;
  action: FeedbackAuditAction;
  actorUserId?: string | null;
  eventKey?: string | null;
  fromStatus?: FeedbackCaseStatus | null;
  toStatus?: FeedbackCaseStatus | null;
  reason?: string | null;
  occurredAt?: Date;
}): Prisma.FeedbackAuditEventCreateManyInput => ({
  feedbackId: input.feedbackId,
  actorUserId: input.actorUserId ?? null,
  action: input.action,
  eventKey: input.eventKey ?? null,
  fromStatus: input.fromStatus ?? null,
  toStatus: input.toStatus ?? null,
  reason: input.reason ?? null,
  occurredAt: input.occurredAt ?? new Date(),
});

/**
 * Creates the anonymous record and a content-free lifecycle event. The route-level Redis rate limiter
 * consumes the source address before this service; new feedback never persists an IP address.
 */
export const createFeedback = async (input: CreateFeedbackInput) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: input.vehicleId },
    select: { id: true },
  });
  if (!vehicle) throw notFound('Vehicle not found');

  return prisma.$transaction(async (tx) => {
    const feedback = await tx.feedback.create({
      data: {
        type: input.type,
        vehicleId: input.vehicleId,
        message: input.message,
        ipAddress: null,
      },
      select: publicFeedbackReceiptSelect,
    });
    await tx.feedbackAuditEvent.create({
      data: feedbackAuditRecord({ feedbackId: feedback.id, action: 'created' }),
    });
    return feedback;
  });
};

export const listFeedbackCases = async (includeDeleted = false) =>
  prisma.feedback.findMany({
    where: includeDeleted ? { deletedAt: { not: null } } : { deletedAt: null },
    select: feedbackCaseSelect,
    orderBy: { createdAt: 'desc' },
  });

export const updateFeedbackCase = async (
  feedbackId: string,
  update: FeedbackCaseUpdate,
  actor: FeedbackActor,
  now = new Date(),
) => prisma.$transaction(async (tx) => {
  const current = await tx.feedback.findUnique({
    where: { id: feedbackId },
    select: { id: true, status: true, deletedAt: true },
  });
  if (!current) throw notFound('Feedback not found');
  if (current.deletedAt) throw conflict('Deleted feedback cannot be updated');
  if (!isFeedbackCaseStatus(current.status)) {
    throw unprocessableRequest('Feedback status is invalid');
  }
  if (update.status && !canTransitionFeedback(current.status, update.status)) {
    throw conflict('Feedback status transition is not allowed');
  }

  const data: Prisma.FeedbackUpdateInput = {
    assignedTo: { connect: { id: actor.id } },
    assignedAt: now,
  };
  if (update.internalNote !== undefined) data.internalNote = update.internalNote;
  if (update.status) {
    data.status = update.status;
    if (update.status === 'acknowledged') data.acknowledgedAt = now;
    if (update.status === 'investigating') data.investigatingAt = now;
    if (update.status === 'resolved') data.resolvedAt = now;
  }

  const updated = await tx.feedback.update({
    where: { id: feedbackId },
    data,
    select: feedbackCaseSelect,
  });
  await tx.feedbackAuditEvent.create({
    data: feedbackAuditRecord({
      feedbackId,
      actorUserId: actor.id,
      action: update.status ? 'status_changed' : 'note_updated',
      fromStatus: current.status,
      toStatus: update.status ?? current.status,
      occurredAt: now,
    }),
  });
  return updated;
});

export const softDeleteFeedback = async (
  feedbackId: string,
  reason: FeedbackDeleteReason,
  actor: FeedbackActor,
  now = new Date(),
) => prisma.$transaction(async (tx) => {
  const current = await tx.feedback.findUnique({
    where: { id: feedbackId },
    select: { id: true, deletedAt: true, status: true },
  });
  if (!current) throw notFound('Feedback not found');
  if (current.deletedAt) throw conflict('Feedback is already deleted');
  if (!isFeedbackCaseStatus(current.status)) throw unprocessableRequest('Feedback status is invalid');

  const updated = await tx.feedback.update({
    where: { id: feedbackId },
    data: {
      deletedAt: now,
      deletedBy: { connect: { id: actor.id } },
      deletionReason: reason,
      restoreExpiresAt: feedbackRestoreExpiry(now),
    },
    select: feedbackCaseSelect,
  });
  await tx.feedbackAuditEvent.create({
    data: feedbackAuditRecord({
      feedbackId,
      actorUserId: actor.id,
      action: 'soft_deleted',
      fromStatus: current.status,
      toStatus: current.status,
      reason,
      occurredAt: now,
    }),
  });
  return updated;
});

export const restoreFeedback = async (
  feedbackId: string,
  actor: FeedbackActor,
  now = new Date(),
) => prisma.$transaction(async (tx) => {
  const current = await tx.feedback.findUnique({
    where: { id: feedbackId },
    select: { id: true, deletedAt: true, restoreExpiresAt: true, status: true },
  });
  if (!current) throw notFound('Feedback not found');
  if (!current.deletedAt || !current.restoreExpiresAt) throw conflict('Feedback is not deleted');
  if (current.restoreExpiresAt.getTime() < now.getTime()) {
    throw conflict('Feedback restore window has expired');
  }
  if (!isFeedbackCaseStatus(current.status)) throw unprocessableRequest('Feedback status is invalid');

  const updated = await tx.feedback.update({
    where: { id: feedbackId },
    data: {
      deletedAt: null,
      deletedBy: { disconnect: true },
      deletionReason: null,
      restoreExpiresAt: null,
    },
    select: feedbackCaseSelect,
  });
  await tx.feedbackAuditEvent.create({
    data: feedbackAuditRecord({
      feedbackId,
      actorUserId: actor.id,
      action: 'restored',
      fromStatus: current.status,
      toStatus: current.status,
      occurredAt: now,
    }),
  });
  return updated;
});
