import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { BoundaryError, conflict, notFound } from '../middleware/boundary-errors.js';
import { isTripInactive, TRIP_INACTIVITY_TIMEOUT_MS } from './trip-activity.service.js';
import { lockTrackingSource } from './tracking-assignment.service.js';

export const TRIP_IN_PROGRESS = 'in_progress' as const;
export const TRIP_COMPLETED = 'completed' as const;
export const TRIP_ABORTED = 'aborted' as const;
export const TRIP_END_REASON_EXPLICIT = 'explicit_end' as const;
export const TRIP_END_REASON_INACTIVITY = 'inactivity_timeout' as const;
export const VEHICLE_ACTIVE = 'active' as const;
export const VEHICLE_INACTIVE = 'inactive' as const;

type TransactionClient = Prisma.TransactionClient;

export interface OperationalTripResult {
  trip: Prisma.TripGetPayload<{}>;
  created: boolean;
}

export interface EndedTripResult {
  trip: Prisma.TripGetPayload<{}>;
  idempotent: boolean;
}

export interface TripActivityResult {
  trip: Prisma.TripGetPayload<{}>;
  updated: boolean;
}

export interface CanonicalHistoryInput {
  vehicleId: string;
  tripId?: string;
  lat: number;
  lng: number;
  speed?: number | null;
  heading?: number | null;
  station?: string | null;
  sourceId?: string | null;
  recordedAt: Date;
}

export interface CanonicalHistoryResult {
  tripId: string;
  createdTrip: boolean;
}

/**
 * Locking every lifecycle transition by vehicle gives explicit start, activity,
 * end, timeout, and history writes one deterministic ordering. The partial
 * unique index remains the final database guard if a future writer bypasses
 * this service.
 */
const lockVehicle = async (
  tx: TransactionClient,
  vehicleId: string,
) => {
  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM vehicles
    WHERE id = ${vehicleId}
    FOR UPDATE
  `;

  if (!rows[0]) {
    throw notFound('Vehicle not found');
  }

  return tx.vehicle.findUnique({ where: { id: vehicleId } });
};

const findActiveTrip = async (tx: TransactionClient, vehicleId: string) => tx.trip.findFirst({
  where: { vehicleId, status: TRIP_IN_PROGRESS },
  orderBy: [
    { createdAt: 'asc' },
    { id: 'asc' },
  ],
});

const ensureSourceAssignedToVehicle = async (
  tx: TransactionClient,
  sourceId: string | undefined,
  vehicleId: string,
): Promise<void> => {
  if (!sourceId) return;
  await lockTrackingSource(tx, sourceId);
  const assignment = await tx.trackingAssignment.findFirst({
    where: {
      trackingSourceId: sourceId,
      vehicleId,
      unassignedAt: null,
    },
    select: { id: true },
  });
  if (!assignment) {
    throw new BoundaryError(
      403,
      'SENDER_OWNERSHIP_MISMATCH',
      'Sender is no longer assigned to this vehicle',
    );
  }
};

const closeTripAsInactive = async (
  tx: TransactionClient,
  trip: Prisma.TripGetPayload<{}>,
  closedAt: Date,
): Promise<Prisma.TripGetPayload<{}>> => {
  const closedTrip = await tx.trip.update({
    where: { id: trip.id },
    data: {
      status: TRIP_ABORTED,
      endTime: trip.lastTripActivityAt,
      closedAt,
      endReason: TRIP_END_REASON_INACTIVITY,
    },
  });
  await tx.vehicle.update({
    where: { id: trip.vehicleId },
    data: { status: VEHICLE_INACTIVE },
  });
  return closedTrip;
};

export type CanonicalRouteAuthority = {
  tripId: string | null;
  routeId: string | null;
  routeAuthority: 'active_trip' | 'vehicle_assignment' | 'unknown';
};

/**
 * Resolve the route that is authoritative for a canonical vehicle state.
 * Lifecycle ownership remains in this service; canonical-state only consumes
 * this read model and never invents route identity from a viewer filter.
 */
export const resolveCanonicalRouteAuthority = async (
  vehicleId: string,
): Promise<CanonicalRouteAuthority> => {
  const activeTrip = await prisma.trip.findFirst({
    where: { vehicleId, status: TRIP_IN_PROGRESS },
    select: { id: true, routeId: true },
    orderBy: [
      { createdAt: 'asc' },
      { id: 'asc' },
    ],
  });

  if (activeTrip?.routeId) {
    return {
      tripId: activeTrip.id,
      routeId: activeTrip.routeId,
      routeAuthority: 'active_trip',
    };
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { assignedRouteId: true },
  });

  if (vehicle?.assignedRouteId) {
    return {
      tripId: activeTrip?.id ?? null,
      routeId: vehicle.assignedRouteId,
      routeAuthority: 'vehicle_assignment',
    };
  }

  return {
    tripId: activeTrip?.id ?? null,
    routeId: null,
    routeAuthority: 'unknown',
  };
};

const ensureVehicleActive = async (tx: TransactionClient, vehicleId: string): Promise<void> => {
  await tx.vehicle.update({
    where: { id: vehicleId },
    data: { status: VEHICLE_ACTIVE },
  });
};

/** Explicit sender start is idempotent by vehicle and is the only trip creator. */
export const startOperationalTrip = async (
  vehicleId: string,
  startTime = new Date(),
  sourceId?: string,
): Promise<OperationalTripResult> => prisma.$transaction(async (tx) => {
  await ensureSourceAssignedToVehicle(tx, sourceId, vehicleId);
  const vehicle = await lockVehicle(tx, vehicleId);
  if (!vehicle) throw notFound('Vehicle not found');

  let activeTrip = await findActiveTrip(tx, vehicleId);
  if (activeTrip && isTripInactive(activeTrip.lastTripActivityAt, startTime)) {
    await closeTripAsInactive(tx, activeTrip, startTime);
    activeTrip = null;
  }
  if (activeTrip) {
    if (vehicle.status !== VEHICLE_ACTIVE) await ensureVehicleActive(tx, vehicleId);
    return { trip: activeTrip, created: false };
  }

  if (!vehicle.assignedRouteId) {
    throw conflict('Vehicle has no assigned route');
  }

  const trip = await tx.trip.create({
    data: {
      vehicleId,
      routeId: vehicle.assignedRouteId,
      startTime,
      lastTripActivityAt: startTime,
      status: TRIP_IN_PROGRESS,
    },
  });

  await ensureVehicleActive(tx, vehicleId);
  return { trip, created: true };
});

export const ensureActiveTripForVehicle = async (
  vehicleId: string,
): Promise<OperationalTripResult | null> => prisma.$transaction(async (tx) => {
  const vehicle = await lockVehicle(tx, vehicleId);
  if (!vehicle) throw notFound('Vehicle not found');
  const activeTrip = await findActiveTrip(tx, vehicleId);
  if (!activeTrip) return null;
  if (vehicle.status !== VEHICLE_ACTIVE) await ensureVehicleActive(tx, vehicleId);
  return { trip: activeTrip, created: false };
});

/**
 * Shared ownership check for ingestion and other sender-bound writes. A
 * non-active or foreign trip is rejected before the caller mutates state.
 */
export const validateActiveTripForVehicle = async (
  tripId: string,
  vehicleId: string,
): Promise<Prisma.TripGetPayload<{}>> => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.vehicleId !== vehicleId || trip.status !== TRIP_IN_PROGRESS) {
    throw new BoundaryError(
      403,
      'TRIP_OWNERSHIP_MISMATCH',
      'Trip is invalid or does not belong to the sender vehicle',
    );
  }
  return trip;
};

export const recordTripActivity = async (
  tripId: string,
  vehicleId: string,
  activityAt = new Date(),
): Promise<TripActivityResult> => prisma.$transaction(async (tx) => {
  const initialTrip = await tx.trip.findUnique({ where: { id: tripId } });
  if (!initialTrip || initialTrip.vehicleId !== vehicleId) {
    throw new BoundaryError(
      403,
      'TRIP_OWNERSHIP_MISMATCH',
      'Trip is invalid or does not belong to the sender vehicle',
    );
  }

  await lockVehicle(tx, vehicleId);
  const trip = await tx.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.vehicleId !== vehicleId) {
    throw new BoundaryError(
      403,
      'TRIP_OWNERSHIP_MISMATCH',
      'Trip is invalid or does not belong to the sender vehicle',
    );
  }
  if (trip.status !== TRIP_IN_PROGRESS) {
    throw conflict('Trip is no longer in progress');
  }
  if (activityAt < trip.startTime) {
    throw conflict('Trip activity cannot precede its start time');
  }

  if (isTripInactive(trip.lastTripActivityAt, activityAt)) {
    const closedTrip = await closeTripAsInactive(tx, trip, activityAt);
    return { trip: closedTrip, updated: false };
  }

  if (activityAt <= trip.lastTripActivityAt) {
    return { trip, updated: false };
  }

  const updatedTrip = await tx.trip.update({
    where: { id: tripId },
    data: { lastTripActivityAt: activityAt },
  });
  return { trip: updatedTrip, updated: true };
});

/** Movement activity is best effort: telemetry with no active trip is diagnostic only. */
export const recordMeaningfulTripActivity = async (
  vehicleId: string,
  activityAt = new Date(),
  sourceId?: string,
  assignmentId?: string | null,
): Promise<TripActivityResult | null> => prisma.$transaction(async (tx) => {
  if (sourceId) {
    await lockTrackingSource(tx, sourceId);
    const assignment = await tx.trackingAssignment.findFirst({
      where: {
        id: assignmentId ?? undefined,
        trackingSourceId: sourceId,
        vehicleId,
        unassignedAt: null,
      },
      select: { id: true },
    });
    if (!assignment) return null;
  }
  await lockVehicle(tx, vehicleId);
  const trip = await findActiveTrip(tx, vehicleId);
  if (!trip) return null;
  if (isTripInactive(trip.lastTripActivityAt, activityAt)) {
    const closedTrip = await closeTripAsInactive(tx, trip, activityAt);
    return { trip: closedTrip, updated: false };
  }
  if (activityAt <= trip.lastTripActivityAt) return { trip, updated: false };

  const updatedTrip = await tx.trip.update({
    where: { id: trip.id },
    data: { lastTripActivityAt: activityAt },
  });
  return { trip: updatedTrip, updated: true };
});

/**
 * End is idempotent for an already completed trip. It locks the vehicle first
 * (the same lock order as start/history), then re-reads the trip so a retry of
 * an old end can never mark a newer active trip's vehicle inactive.
 */
export const endOperationalTrip = async (
  tripId: string,
  vehicleId: string,
  endTime = new Date(),
): Promise<EndedTripResult> => prisma.$transaction(async (tx) => {
  const initialTrip = await tx.trip.findUnique({ where: { id: tripId } });
  if (!initialTrip) {
    throw notFound('Trip not found');
  }

  if (initialTrip.vehicleId !== vehicleId) {
    throw new BoundaryError(
      403,
      'TRIP_OWNERSHIP_MISMATCH',
      'Sender cannot operate this trip',
    );
  }

  await lockVehicle(tx, vehicleId);
  const trip = await tx.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw notFound('Trip not found');
  }

  if (trip.vehicleId !== vehicleId) {
    throw new BoundaryError(
      403,
      'TRIP_OWNERSHIP_MISMATCH',
      'Sender cannot operate this trip',
    );
  }

  if (
    (trip.status === TRIP_COMPLETED || trip.status === TRIP_ABORTED)
    && trip.endTime
    && trip.closedAt
  ) {
    return { trip, idempotent: true };
  }

  if (trip.status !== TRIP_IN_PROGRESS) {
    throw conflict('Trip is not in progress');
  }

  if (endTime < trip.startTime) {
    throw conflict('Trip end time cannot precede its start time');
  }

  const endedTrip = await tx.trip.update({
    where: { id: tripId },
    data: {
      endTime,
      closedAt: endTime,
      endReason: TRIP_END_REASON_EXPLICIT,
      status: TRIP_COMPLETED,
    },
  });

  await tx.vehicle.update({
    where: { id: vehicleId },
    data: { status: VEHICLE_INACTIVE },
  });

  return { trip: endedTrip, idempotent: false };
});

export const autoCloseInactiveTrips = async (
  now = new Date(),
): Promise<Array<{ tripId: string; vehicleId: string }>> => {
  const cutoff = new Date(now.getTime() - TRIP_INACTIVITY_TIMEOUT_MS);
  const candidates = await prisma.trip.findMany({
    where: {
      status: TRIP_IN_PROGRESS,
      lastTripActivityAt: { lte: cutoff },
    },
    select: { id: true, vehicleId: true },
  });

  const closed: Array<{ tripId: string; vehicleId: string }> = [];
  for (const candidate of candidates) {
    const result = await prisma.$transaction(async (tx) => {
      await lockVehicle(tx, candidate.vehicleId);
      const trip = await tx.trip.findUnique({ where: { id: candidate.id } });
      if (
        !trip
        || trip.status !== TRIP_IN_PROGRESS
        || trip.lastTripActivityAt.getTime() > cutoff.getTime()
      ) {
        return null;
      }

      await closeTripAsInactive(tx, trip, now);
      return { tripId: trip.id, vehicleId: candidate.vehicleId };
    });

    if (result) closed.push(result);
  }

  return closed;
};

/**
 * Persist a sampled canonical point only when an active Trip exists. The
 * caller controls the Redis sampling admission; every durable PostgreSQL
 * mutation is atomic here.
 */
export const recordCanonicalHistory = async (
  input: CanonicalHistoryInput,
  persist = true,
): Promise<CanonicalHistoryResult | null> => prisma.$transaction(async (tx) => {
  let activeTrip: Prisma.TripGetPayload<{}> | null;
  let createdTrip = false;

  if (input.tripId) {
    const vehicle = await lockVehicle(tx, input.vehicleId);
    activeTrip = await tx.trip.findUnique({ where: { id: input.tripId } });
    if (
      !activeTrip ||
      activeTrip.vehicleId !== input.vehicleId ||
      activeTrip.status !== TRIP_IN_PROGRESS
    ) {
      throw new BoundaryError(
        403,
        'TRIP_OWNERSHIP_MISMATCH',
        'Trip is invalid or does not belong to the sender vehicle',
      );
    }
    if (vehicle && vehicle.status !== VEHICLE_ACTIVE) {
      await ensureVehicleActive(tx, input.vehicleId);
    }
  } else {
    const vehicle = await lockVehicle(tx, input.vehicleId);
    activeTrip = await findActiveTrip(tx, input.vehicleId);
    if (!activeTrip) return null;
    if (vehicle && vehicle.status !== VEHICLE_ACTIVE) {
      await ensureVehicleActive(tx, input.vehicleId);
    }
  }

  if (!persist) {
    return { tripId: activeTrip.id, createdTrip };
  }

  await tx.$executeRaw`
    INSERT INTO gps_tracks (
      trip_id,
      vehicle_id,
      location,
      speed,
      heading,
      station,
      source_id,
      recorded_at
    )
    VALUES (
      ${activeTrip.id}::uuid,
      ${input.vehicleId},
      ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography,
      ${input.speed ?? null},
      ${input.heading ?? null},
      ${input.station ?? null},
      ${input.sourceId ?? null},
      ${input.recordedAt}
    )
  `;

  return { tripId: activeTrip.id, createdTrip };
});
