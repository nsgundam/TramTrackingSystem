import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';
import { conflict, logBoundaryFailure, notFound, unprocessableRequest } from '../middleware/boundary-errors.js';

export const ACTIVE_ASSIGNMENT_WHERE = { unassignedAt: null } as const;

export type AssignmentMethod = 'admin' | 'mobile_qr' | 'migration';

export type ActiveAssignment = Prisma.TrackingAssignmentGetPayload<{
  include: { source: true; vehicle: true };
}>;

type TransactionClient = Prisma.TransactionClient;

const activeAssignmentInclude = {
  source: true,
  vehicle: true,
} as const;

export const lockTrackingSource = async (tx: TransactionClient, sourceId: string): Promise<void> => {
  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM tracking_sources
    WHERE id = ${sourceId}
    FOR UPDATE
  `;
  if (!rows[0]) throw notFound('Tracking source not found');
};

export const invalidateTrackingSourceCache = async (sourceId: string): Promise<void> => {
  await redisClient.del(`source:last_location:${sourceId}`).catch((error: unknown) => {
    // Assignment state is durable and canonical selection also checks the
    // assignment ID carried by each cached snapshot. A Redis outage must not
    // turn a committed assignment into a misleading HTTP 500.
    logBoundaryFailure('Tracking source cache invalidation', error);
  });
};

const ensureVehicleExists = async (tx: TransactionClient, vehicleId: string): Promise<void> => {
  const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } });
  if (!vehicle) throw notFound('Vehicle not found');
};

export const findActiveAssignment = async (
  sourceId: string,
): Promise<ActiveAssignment | null> => prisma.trackingAssignment.findFirst({
  where: { trackingSourceId: sourceId, ...ACTIVE_ASSIGNMENT_WHERE },
  include: activeAssignmentInclude,
});

export const findActiveAssignmentsForVehicle = async (
  vehicleId: string,
): Promise<ActiveAssignment[]> => prisma.trackingAssignment.findMany({
  where: {
    vehicleId,
    ...ACTIVE_ASSIGNMENT_WHERE,
    source: { status: 'active' },
  },
  include: activeAssignmentInclude,
  orderBy: [
    { source: { priority: 'asc' } },
    { trackingSourceId: 'asc' },
  ],
});

export const assignTrackingSourceInTransaction = async (
  tx: TransactionClient,
  input: {
    sourceId: string;
    vehicleId: string;
    assignedById?: string | null;
    method: AssignmentMethod;
  },
): Promise<{ assignment: ActiveAssignment; previousVehicleId: string | null }> => {
  await lockTrackingSource(tx, input.sourceId);
  await ensureVehicleExists(tx, input.vehicleId);

  const source = await tx.trackingSource.findUnique({
    where: { id: input.sourceId },
    select: { id: true, status: true },
  });
  if (!source) throw notFound('Tracking source not found');
  if (source.status === 'retired') {
    throw unprocessableRequest('Retired tracking sources cannot be assigned');
  }

  const current = await tx.trackingAssignment.findFirst({
    where: { trackingSourceId: input.sourceId, ...ACTIVE_ASSIGNMENT_WHERE },
    select: { id: true, vehicleId: true },
  });

  if (current?.vehicleId === input.vehicleId) {
    const assignment = await tx.trackingAssignment.findUniqueOrThrow({
      where: { id: current.id },
      include: activeAssignmentInclude,
    });
    return { assignment, previousVehicleId: current.vehicleId };
  }

  if (current) {
    await tx.trackingAssignment.update({
      where: { id: current.id },
      data: {
        unassignedAt: new Date(),
        unassignedById: input.assignedById ?? null,
      },
    });
  }

  const assignment = await tx.trackingAssignment.create({
    data: {
      trackingSourceId: input.sourceId,
      vehicleId: input.vehicleId,
      assignedById: input.assignedById ?? null,
      method: input.method,
    },
    include: activeAssignmentInclude,
  });

  return {
    assignment,
    previousVehicleId: current?.vehicleId ?? null,
  };
};

export const assignTrackingSource = async (input: {
  sourceId: string;
  vehicleId: string;
  assignedById?: string | null;
  method: AssignmentMethod;
}): Promise<{ assignment: ActiveAssignment; previousVehicleId: string | null }> => {
  const result = await prisma.$transaction((tx) => assignTrackingSourceInTransaction(tx, input));
  // A source's last position is not allowed to follow it to another vehicle.
  await invalidateTrackingSourceCache(input.sourceId);
  return result;
};

export const unassignTrackingSourceInTransaction = async (
  tx: TransactionClient,
  input: {
    sourceId: string;
    assignedById?: string | null;
  },
): Promise<{ previousVehicleId: string | null }> => {
  await lockTrackingSource(tx, input.sourceId);
  const current = await tx.trackingAssignment.findFirst({
    where: { trackingSourceId: input.sourceId, ...ACTIVE_ASSIGNMENT_WHERE },
    select: { id: true, vehicleId: true },
  });
  if (!current) return { previousVehicleId: null };

  await tx.trackingAssignment.update({
    where: { id: current.id },
    data: {
      unassignedAt: new Date(),
      unassignedById: input.assignedById ?? null,
    },
  });
  return { previousVehicleId: current.vehicleId };
};

export const unassignTrackingSource = async (input: {
  sourceId: string;
  assignedById?: string | null;
}): Promise<{ previousVehicleId: string | null }> => {
  const result = await prisma.$transaction((tx) => unassignTrackingSourceInTransaction(tx, input));
  await invalidateTrackingSourceCache(input.sourceId);
  return result;
};

export const assignMobileSourceToVehicle = async (input: {
  sourceId: string;
  vehicleId: string;
  expectedAssignmentId?: string | null;
}): Promise<{ assignment: ActiveAssignment; previousVehicleId: string | null }> => {
  const result = await prisma.$transaction(async (tx) => {
    await lockTrackingSource(tx, input.sourceId);
    await ensureVehicleExists(tx, input.vehicleId);

    const source = await tx.trackingSource.findUnique({
      where: { id: input.sourceId },
      select: { id: true, type: true, status: true },
    });
    if (!source) throw notFound('Tracking source not found');
    if (source.type !== 'mobile') {
      throw unprocessableRequest('Vehicle QR assignment is only available to mobile sources');
    }
    if (source.status === 'retired') {
      throw unprocessableRequest('Retired tracking sources cannot be assigned');
    }

    const current = await tx.trackingAssignment.findFirst({
      where: { trackingSourceId: input.sourceId, ...ACTIVE_ASSIGNMENT_WHERE },
      select: { id: true, vehicleId: true },
    });
    if (
      input.expectedAssignmentId !== undefined
      && (current?.id ?? null) !== input.expectedAssignmentId
    ) {
      throw conflict('Sender assignment changed; sign in again before switching vehicles');
    }
    if (current?.vehicleId === input.vehicleId) {
      const assignment = await tx.trackingAssignment.findUniqueOrThrow({
        where: { id: current.id },
        include: activeAssignmentInclude,
      });
      return { assignment, previousVehicleId: current.vehicleId };
    }

    if (current) {
      // Serialize the active-trip check with Trip start/end/timeout. The
      // source lock alone cannot prevent a Trip from starting concurrently on
      // the vehicle being switched away from.
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM vehicles
        WHERE id = ${current.vehicleId}
        FOR UPDATE
      `;
      const activeTrip = await tx.trip.findFirst({
        where: { vehicleId: current.vehicleId, status: 'in_progress' },
        select: { id: true },
      });
      if (activeTrip) {
        throw conflict('End the active service before switching the mobile source');
      }
      await tx.trackingAssignment.update({
        where: { id: current.id },
        data: { unassignedAt: new Date() },
      });
    }

    const assignment = await tx.trackingAssignment.create({
      data: {
        trackingSourceId: input.sourceId,
        vehicleId: input.vehicleId,
        method: 'mobile_qr',
      },
      include: activeAssignmentInclude,
    });
    return { assignment, previousVehicleId: current?.vehicleId ?? null };
  });

  await invalidateTrackingSourceCache(input.sourceId);
  return result;
};

export const getTrackingAssignmentHistory = async (
  sourceId: string,
) => prisma.trackingAssignment.findMany({
  where: { trackingSourceId: sourceId },
  include: {
    vehicle: true,
    assignedBy: { select: { id: true, username: true } },
    unassignedBy: { select: { id: true, username: true } },
  },
  orderBy: [
    { assignedAt: 'desc' },
    { id: 'desc' },
  ],
});
