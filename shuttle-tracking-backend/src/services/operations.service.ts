import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { BoundaryError, conflict, notFound } from '../middleware/boundary-errors.js';

export const TRIP_IN_PROGRESS = 'in_progress' as const;
export const TRIP_COMPLETED = 'completed' as const;
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
 * Locking every lifecycle transition by vehicle gives explicit start, virtual
 * start, end, and history writes one deterministic ordering. The partial
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

const ensureVehicleActive = async (tx: TransactionClient, vehicleId: string): Promise<void> => {
  await tx.vehicle.update({
    where: { id: vehicleId },
    data: { status: VEHICLE_ACTIVE },
  });
};

/**
 * Must be called inside a transaction. It locks the vehicle, reuses the one
 * active trip when present, or creates a virtual trip when a route is
 * assigned. This is the only virtual-trip policy in the backend.
 */
const ensureActiveTripInTransaction = async (
  tx: TransactionClient,
  vehicleId: string,
  startTime: Date,
): Promise<OperationalTripResult | null> => {
  const vehicle = await lockVehicle(tx, vehicleId);
  if (!vehicle) {
    throw notFound('Vehicle not found');
  }

  const activeTrip = await findActiveTrip(tx, vehicleId);
  if (activeTrip) {
    if (vehicle.status !== VEHICLE_ACTIVE) {
      await ensureVehicleActive(tx, vehicleId);
    }
    return { trip: activeTrip, created: false };
  }

  if (!vehicle.assignedRouteId) {
    return null;
  }

  const trip = await tx.trip.create({
    data: {
      vehicleId,
      routeId: vehicle.assignedRouteId,
      startTime,
      status: TRIP_IN_PROGRESS,
    },
  });

  await ensureVehicleActive(tx, vehicleId);
  return { trip, created: true };
};

/**
 * Explicit sender start is idempotent by vehicle: a retry returns the current
 * active trip instead of creating a second lifecycle record. An existing
 * virtual trip is intentionally adopted by the explicit start request; the
 * schema has one active-trip invariant and does not expose origin as a second
 * product state.
 */
export const startOperationalTrip = async (
  vehicleId: string,
  startTime = new Date(),
): Promise<OperationalTripResult> => prisma.$transaction(async (tx) => {
  const result = await ensureActiveTripInTransaction(tx, vehicleId, startTime);
  if (!result) {
    throw conflict('Vehicle has no assigned route');
  }
  return result;
});

export const ensureActiveTripForVehicle = async (
  vehicleId: string,
  startTime = new Date(),
): Promise<OperationalTripResult | null> => prisma.$transaction(
  (tx) => ensureActiveTripInTransaction(tx, vehicleId, startTime),
);

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

  if (trip.status === TRIP_COMPLETED && trip.endTime) {
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
      status: TRIP_COMPLETED,
    },
  });

  await tx.vehicle.update({
    where: { id: vehicleId },
    data: { status: VEHICLE_INACTIVE },
  });

  return { trip: endedTrip, idempotent: false };
});

/**
 * Persist a sampled canonical point together with the active-trip lookup or
 * virtual-trip creation and vehicle-state repair. The caller controls the
 * Redis sampling admission; every durable PostgreSQL mutation is atomic here.
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
    const ensured = await ensureActiveTripInTransaction(tx, input.vehicleId, input.recordedAt);
    if (!ensured) {
      return null;
    }
    activeTrip = ensured.trip;
    createdTrip = ensured.created;
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
