import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import type {
  AdminAuditAction,
  AdminAuditOutcome,
  AdminAuditTargetType,
  AdminHistoryListInput,
} from '../middleware/validation.js';

export interface AdminAuditEventInput {
  actorUserId: string | null;
  actorUsername: string;
  actorRole: string;
  action: AdminAuditAction;
  targetType: AdminAuditTargetType;
  targetId: string | null;
  outcome: AdminAuditOutcome;
  responseStatus: number;
  requestId: string;
  occurredAt: Date;
}

const auditEventSelect = {
  id: true,
  actorUserId: true,
  actorUsername: true,
  actorRole: true,
  action: true,
  targetType: true,
  targetId: true,
  outcome: true,
  responseStatus: true,
  requestId: true,
  occurredAt: true,
} as const;

export const persistAdminAuditEvent = async (event: AdminAuditEventInput): Promise<void> => {
  await prisma.adminAuditEvent.create({ data: event, select: { id: true } });
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const buildAdminHistoryWhere = (input: AdminHistoryListInput): Prisma.AdminAuditEventWhereInput => ({
  ...(input.action === undefined ? {} : { action: input.action }),
  ...(input.targetType === undefined ? {} : { targetType: input.targetType }),
  ...(input.outcome === undefined ? {} : { outcome: input.outcome }),
  ...(input.actor === undefined
    ? {}
    : {
        OR: [
          { actorUsername: input.actor },
          ...(UUID_PATTERN.test(input.actor) ? [{ actorUserId: input.actor }] : []),
        ],
      }),
  ...(input.from === undefined && input.to === undefined
    ? {}
    : {
        occurredAt: {
          ...(input.from === undefined ? {} : { gte: input.from }),
          ...(input.to === undefined ? {} : { lte: input.to }),
        },
      }),
});

export const buildAdminHistoryListQuery = (input: AdminHistoryListInput) => ({
  where: buildAdminHistoryWhere(input),
  select: auditEventSelect,
  orderBy: [{ occurredAt: 'desc' as const }, { id: 'desc' as const }],
  skip: (input.page - 1) * input.pageSize,
  take: input.pageSize,
});

export const listAdminHistory = async (input: AdminHistoryListInput) => {
  const query = buildAdminHistoryListQuery(input);
  const [total, events] = await Promise.all([
    prisma.adminAuditEvent.count({ where: query.where }),
    prisma.adminAuditEvent.findMany(query),
  ]);
  return {
    data: events,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
  };
};
