import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';
import type { SenderContext } from '../middleware/auth.js';
import { BoundaryError, logBoundaryFailure } from '../middleware/boundary-errors.js';
import { emitOperationalSignal, type OperationalSourceType } from './operational-signals.js';
import {
  recordCanonicalHistory,
  autoCloseInactiveTrips,
  recordMeaningfulTripActivity,
  validateActiveTripForVehicle,
} from './operations.service.js';
import {
  findActiveAssignmentsForVehicle,
} from './tracking-assignment.service.js';
import {
  isMeaningfulMovement,
  type MovementSnapshot,
} from './trip-activity.service.js';
import {
  publishCanonicalState,
  publishVehicleStateTransition,
  refreshCanonicalState,
  getCurrentCanonicalState,
  type CanonicalSourceType,
  type CanonicalVehicleStateV1,
} from './canonical-state.service.js';
import {
  activeResearchSessionId,
  recordResearchObservation,
  researchDispositionFor,
  type ResearchObservationMetadata,
  type ResearchTransport,
  type ResearchSourceType,
} from './research-diagnostics.service.js';

const THROTTLE_SECONDS = 60;
export const SOURCE_FRESHNESS_WINDOW_MS = 30_000;
export const SOURCE_OFFLINE_THRESHOLD_MS = 5 * 60_000;

export const TRACKING_SOURCE_TYPES = ['mobile', 'lorawan', 'esp32', 'simulator'] as const;
export const TRACKING_SOURCE_STATUSES = ['provisioning', 'active', 'inactive', 'retired'] as const;

export type SourceHealth = 'online' | 'stale' | 'offline' | 'disabled';

export interface SourceHealthInput {
  status: string;
  lastTelemetryAt: Date | null;
}

export const getSourceHealth = (
  source: SourceHealthInput,
  now = Date.now()
): SourceHealth => {
  if (source.status !== 'active') {
    return 'disabled';
  }

  if (!source.lastTelemetryAt) return 'offline';

  const age = now - source.lastTelemetryAt.getTime();
  if (age <= SOURCE_FRESHNESS_WINDOW_MS) return 'online';
  return age <= SOURCE_OFFLINE_THRESHOLD_MS ? 'stale' : 'offline';
};

export const sourceRequiresCredential = (sourceType: string): boolean => sourceType !== 'lorawan';

const sourceHealthStates = new Map<string, SourceHealth>();
const vehicleStaleStates = new Map<string, boolean>();
const SOURCE_HEALTH_SWEEP_INTERVAL_MS = 10_000;

type SourceHealthRecord = SourceHealthInput & {
  id: string;
  assignments: Array<{ vehicleId: string; id: string }>;
  vehicleId?: string;
};

export const sweepSourceHealth = async (): Promise<void> => {
  try {
    const sources = await prisma.trackingSource.findMany({
      select: {
        id: true,
        status: true,
        lastTelemetryAt: true,
        assignments: {
          where: { unassignedAt: null },
          select: { id: true, vehicleId: true },
          take: 1,
        },
      },
    }) as SourceHealthRecord[];

    const activeByVehicle = new Map<string, SourceHealthRecord[]>();
    for (const source of sources) {
      const health = getSourceHealth(source);
      const previous = sourceHealthStates.get(source.id);
      sourceHealthStates.set(source.id, health);

      if (health === 'stale' || health === 'offline') {
        if (previous !== health) {
          emitOperationalSignal({
            event: 'tracking.source_stale',
            level: 'warn',
            outcome: 'stale',
            transport: 'system',
            sourceId: source.id,
            reasonCode: health === 'offline' ? 'SOURCE_OFFLINE' : 'SOURCE_STALE',
          });
        }
      } else if (previous && previous !== 'online' && health === 'online') {
        emitOperationalSignal({
          event: 'tracking.source_stale',
          level: 'info',
          outcome: 'recovered',
          transport: 'system',
          sourceId: source.id,
          reasonCode: 'SOURCE_RECOVERED',
        });
      }

      const vehicleId = source.assignments[0]?.vehicleId ?? null;
      if (source.status === 'active' && vehicleId) {
        const vehicleSources = activeByVehicle.get(vehicleId) ?? [];
        vehicleSources.push({ ...source, vehicleId });
        activeByVehicle.set(vehicleId, vehicleSources);
      }
    }

    for (const [vehicleId, vehicleSources] of activeByVehicle) {
      const activeTrip = await prisma.trip.findFirst({
        where: { vehicleId, status: 'in_progress' },
        select: { id: true },
      });
      if (!activeTrip) {
        vehicleStaleStates.set(vehicleId, false);
        await publishVehicleStateTransition({
          vehicleId,
          serviceState: 'no_service',
          reasonCode: 'NO_ACTIVE_TRIP',
        });
        continue;
      }
      const allStale = vehicleSources.every((source) => sourceHealthStates.get(source.id) !== 'online');
      const allOffline = vehicleSources.every((source) => sourceHealthStates.get(source.id) === 'offline');
      const previous = vehicleStaleStates.get(vehicleId);
      vehicleStaleStates.set(vehicleId, allStale);

      if (allStale && previous !== true) {
        emitOperationalSignal({
          event: 'tracking.source_stale',
          level: 'warn',
          outcome: 'stale',
          transport: 'system',
          vehicleId,
          reasonCode: allOffline ? 'SOURCE_OFFLINE' : 'ALL_SOURCES_STALE',
          activeSourceCount: vehicleSources.length,
          staleSourceCount: vehicleSources.length,
        });
        await publishVehicleStateTransition({
          vehicleId,
          serviceState: allOffline ? 'no_service' : 'stale',
          reasonCode: allOffline ? 'SOURCE_OFFLINE' : 'ALL_SOURCES_STALE',
        });
      } else if (!allStale && previous === true) {
        emitOperationalSignal({
          event: 'tracking.source_stale',
          level: 'info',
          outcome: 'recovered',
          transport: 'system',
          vehicleId,
          reasonCode: 'SOURCE_RECOVERED',
          activeSourceCount: vehicleSources.length,
        });
        await refreshCanonicalState(vehicleId);
      }
    }

    const closedTrips = await autoCloseInactiveTrips();
    for (const closedTrip of closedTrips) {
      await refreshCanonicalState(closedTrip.vehicleId);
    }

    const activeVehicles = await prisma.vehicle.findMany({
      where: { status: 'active' },
      select: { id: true },
    });
    for (const vehicle of activeVehicles) {
      if (!activeByVehicle.has(vehicle.id)) {
        const activeTrip = await prisma.trip.findFirst({
          where: { vehicleId: vehicle.id, status: 'in_progress' },
          select: { id: true },
        });
        await publishVehicleStateTransition({
          vehicleId: vehicle.id,
          serviceState: 'no_service',
          reasonCode: activeTrip ? 'NO_ACTIVE_SOURCE' : 'NO_ACTIVE_TRIP',
        });
      }
    }
  } catch (error) {
    logBoundaryFailure('Source health sweep', error);
  }
};

export const startSourceHealthSweep = (): void => {
  const timer = setInterval(() => {
    void sweepSourceHealth();
  }, SOURCE_HEALTH_SWEEP_INTERVAL_MS);
  timer.unref();
  void sweepSourceHealth();
};

// GPS coordinates are global. Do not constrain observations to Thailand here:
// a source may be tested elsewhere, and the transport layer must validate the
// coordinate format rather than impose a business/geofence rule.
const LAT_MIN = -90;
const LAT_MAX = 90;
const LNG_MIN = -180;
const LNG_MAX = 180;

export interface ObservationData {
  sourceId: string;
  sender?: SenderContext;
  expectedSourceType?: 'lorawan';
  tripId?: string;
  lat: number;
  lng: number;
  speed?: number;
  bearing?: number;
  accuracy?: number;
  station?: string;
  transport?: ResearchTransport;
  researchMetadata?: ResearchObservationMetadata;
  accuracyUnit?: string;
  accuracyKind?: string;
  accuracySource?: string;
}

interface CachedObservation extends MovementSnapshot {
  assignmentId: string | null;
  bearing: number | null;
  accuracy: number | null;
  station: string | null;
  sourceType: string;
}

const readCachedObservation = async (sourceId: string): Promise<CachedObservation | null> => {
  const raw = await redisClient.get(`source:last_location:${sourceId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CachedObservation>;
    if (
      typeof parsed.lat !== 'number'
      || typeof parsed.lng !== 'number'
      || typeof parsed.timestamp !== 'number'
      || (parsed.speed !== null && typeof parsed.speed !== 'number')
    ) return null;
    return {
      lat: parsed.lat,
      lng: parsed.lng,
      speed: parsed.speed ?? null,
      timestamp: parsed.timestamp,
      assignmentId: typeof parsed.assignmentId === 'string' ? parsed.assignmentId : null,
      bearing: parsed.bearing ?? null,
      accuracy: parsed.accuracy ?? null,
      station: parsed.station ?? null,
      sourceType: typeof parsed.sourceType === 'string' ? parsed.sourceType : 'unknown',
    };
  } catch {
    return null;
  }
};

/**
 * 1. Ingest Raw Location Observation
 * Validates, authenticates, and records the raw observation from a specific device source.
 */
export const processObservation = async (data: ObservationData) => {
  const { sourceId, lat, lng, speed, bearing, accuracy, station } = data;

  if (!sourceId || lat === undefined || lng === undefined) {
    throw new BoundaryError(400, 'INVALID_REQUEST', 'Location payload is invalid');
  }

  // 1. Basic Coordinate Validation
  const numLat = typeof lat === 'number' ? lat : Number(lat);
  const numLng = typeof lng === 'number' ? lng : Number(lng);
  if (
    !Number.isFinite(numLat) ||
    !Number.isFinite(numLng) ||
    numLat < LAT_MIN ||
    numLat > LAT_MAX ||
    numLng < LNG_MIN ||
    numLng > LNG_MAX
  ) {
    throw new BoundaryError(400, 'INVALID_REQUEST', 'Coordinates are invalid');
  }

  // 2. Fetch Device from Registry
  const source = await prisma.trackingSource.findUnique({
    where: { id: sourceId },
    include: {
      assignments: {
        where: { unassignedAt: null },
        select: { id: true, vehicleId: true },
        take: 1,
      },
    },
  });

  if (!source || source.status !== 'active') {
    throw new BoundaryError(404, 'SOURCE_NOT_FOUND', 'Active tracking source was not found');
  }

  if (data.expectedSourceType && source.type !== data.expectedSourceType) {
    throw new BoundaryError(422, 'SOURCE_TYPE_MISMATCH', 'Tracking source type is invalid');
  }

  // 3. Authenticate the source and bind it to the credential claims.
  if (sourceRequiresCredential(source.type)) {
    if (!data.sender) {
      throw new BoundaryError(401, 'SENDER_AUTH_REQUIRED', 'Sender authentication required');
    }

    if (
      data.sender.sourceId !== source.id ||
      data.sender.vehicleId !== (source.assignments[0]?.vehicleId ?? null) ||
      data.sender.credentialVersion !== source.credentialVersion ||
      data.sender.assignmentId !== (source.assignments[0]?.id ?? null)
    ) {
      throw new BoundaryError(403, 'SENDER_OWNERSHIP_MISMATCH', 'Sender cannot submit for this source');
    }
  }

  const assignment = source.assignments[0] ?? null;
  const vehicleId = assignment?.vehicleId ?? null;
  if (data.tripId) {
    await validateActiveTripForVehicle(data.tripId, vehicleId ?? '');
  }

  // 4. Save the latest telemetry snapshot. It is diagnostic state, not service state.
  const previousObservation = await readCachedObservation(sourceId);
  const now = new Date();
  const observation: CachedObservation = {
    lat: numLat,
    lng: numLng,
    speed: speed !== undefined && speed !== null ? speed : null,
    bearing: bearing !== undefined && bearing !== null ? bearing : null,
    accuracy: accuracy !== undefined && accuracy !== null ? accuracy : null,
    station: station || null,
    timestamp: now.getTime(),
    assignmentId: assignment?.id ?? null,
    sourceType: source.type
  };

  const cacheKey = `source:last_location:${sourceId}`;
  await redisClient.set(cacheKey, JSON.stringify(observation));

  // Throttled lastTelemetryAt updates to database (once every 10 seconds per source).
  const lastTelemetryKey = `source:last_telemetry_time:${sourceId}`;
  const shouldUpdateDB = await redisClient.set(lastTelemetryKey, '1', { NX: true, EX: 10 });
  if (shouldUpdateDB) {
    await prisma.trackingSource.update({
      where: { id: sourceId },
      data: { lastTelemetryAt: now }
    }).catch(err => logBoundaryFailure('Tracking source telemetry update', err));
  }

  // Meaningful movement is trip activity; telemetry alone never starts a Trip.
  const previousForActivity = previousObservation?.assignmentId === (assignment?.id ?? null)
    ? previousObservation
    : null;
  if (vehicleId && isMeaningfulMovement(previousForActivity, observation)) {
    await recordMeaningfulTripActivity(vehicleId, now, sourceId, assignment?.id ?? null).catch((error) => {
      logBoundaryFailure('Trip activity update', error);
    });
  }

  // 5. Evaluate canonical service state if the source has an active assignment.
  let canonicalState: CanonicalVehicleStateV1 | null = null;
  if (vehicleId) {
    canonicalState = await evaluateCanonicalLocation(vehicleId, data.tripId, sourceId);
  }

  // T7 raw capture is explicitly session-gated and is best effort. It runs
  // after canonical publication and cannot reject or alter the T6 result.
  const researchSessionId = activeResearchSessionId();
  if (researchSessionId) {
    await recordResearchObservation({
      sessionId: researchSessionId,
      runId: process.env.T7_RESEARCH_RUN_ID || 'runtime',
      sourceId,
      sourceType: source.type as ResearchSourceType,
      vehicleId,
      tripId: data.tripId,
      routeId: canonicalState?.routeId,
      transport: data.transport || (source.type === 'lorawan' ? 'ttn_webhook' : 'http'),
      latitude: numLat,
      longitude: numLng,
      speedMps: speed,
      headingDeg: bearing,
      accuracy,
      accuracyUnit: data.accuracyUnit,
      accuracyKind: data.accuracyKind,
      accuracySource: data.accuracySource,
      canonicalDisposition: researchDispositionFor(sourceId, canonicalState),
      canonicalState,
      metadata: data.researchMetadata,
    }).catch((error) => {
      logBoundaryFailure('Research observation capture', error);
    });
  }

  return canonicalState;
};

/**
 * 2. Select Canonical Current Vehicle Location
 * Evaluates all device sources assigned to a vehicle, selecting the highest priority active one.
 */
export const evaluateCanonicalLocation = async (
  vehicleId: string,
  tripId?: string,
  triggeringSourceId?: string,
) => {
  const activeTrip = await prisma.trip.findFirst({
    where: { vehicleId, status: 'in_progress' },
    select: { id: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  if (!activeTrip) {
    return publishVehicleStateTransition({
      vehicleId,
      serviceState: 'no_service',
      reasonCode: 'NO_ACTIVE_TRIP',
    });
  }

  const assignments = await findActiveAssignmentsForVehicle(vehicleId);
  const sources = assignments
    .filter((assignment) => assignment.source.status === 'active')
    .map((assignment) => ({ ...assignment.source, assignmentId: assignment.id }));

  if (sources.length === 0) {
    emitOperationalSignal({
      event: 'tracking.source_stale',
      level: 'warn',
      outcome: 'stale',
      transport: 'system',
      vehicleId,
      reasonCode: 'NO_ACTIVE_SOURCE',
    });
    return publishVehicleStateTransition({
      vehicleId,
      serviceState: 'no_service',
      reasonCode: 'NO_ACTIVE_SOURCE',
    });
  }

  let selectedObservation: CachedObservation | null = null;
  let selectedSourceId: string | null = null;
  const nowMs = Date.now();

  // Evaluate sources in priority order
  for (const src of sources) {
    const parsed = await readCachedObservation(src.id);
    if (
      parsed
      && parsed.assignmentId === src.assignmentId
      && nowMs - parsed.timestamp <= SOURCE_FRESHNESS_WINDOW_MS
    ) {
      selectedObservation = parsed;
      selectedSourceId = src.id;
      break;
    }
  }

  if (!selectedObservation || !selectedSourceId) {
    emitOperationalSignal({
      event: 'tracking.source_stale',
      level: 'warn',
      outcome: 'stale',
      transport: 'system',
      vehicleId,
      reasonCode: 'ALL_SOURCES_STALE',
      activeSourceCount: sources.length,
      staleSourceCount: sources.length,
    });
    return publishVehicleStateTransition({
      vehicleId,
      serviceState: 'stale',
      reasonCode: 'ALL_SOURCES_STALE',
      sourceId: sources[0]?.id,
      sourceType: sources[0]?.type as CanonicalSourceType,
    });
  }

  // Normalize station state
  let actualStation = selectedObservation.station;
  if (selectedObservation.speed !== null && selectedObservation.speed >= 2 && selectedObservation.station !== 'En Route') {
    actualStation = 'En Route';
  }

  const canonicalLocation = {
    vehicleId,
    lat: selectedObservation.lat,
    lng: selectedObservation.lng,
    speed: selectedObservation.speed,
    heading: selectedObservation.bearing,
    accuracy: selectedObservation.accuracy,
    station: actualStation,
    sourceId: selectedSourceId,
    sourceType: selectedObservation.sourceType as CanonicalSourceType,
    recordedAt: new Date(selectedObservation.timestamp)
  };

  const currentCanonicalState = await getCurrentCanonicalState(vehicleId);
  const isNonCanonicalObservation = triggeringSourceId !== undefined && triggeringSourceId !== selectedSourceId;
  if (
    isNonCanonicalObservation &&
    currentCanonicalState?.serviceState === 'live' &&
    currentCanonicalState.sourceId === selectedSourceId
  ) {
    return currentCanonicalState;
  }

  // Log Developer Analytics (Device selection count)
  await redisClient.hIncrBy(`analytics:vehicle:${vehicleId}:source_selection`, selectedObservation.sourceType, 1);
  await redisClient.hIncrBy(`analytics:source:${selectedSourceId}:source_selection`, 'selected', 1);

  emitOperationalSignal({
    event: 'tracking.canonical_selected',
    level: 'info',
    outcome: 'selected',
    transport: 'system',
    sourceId: selectedSourceId,
    vehicleId,
    sourceType: selectedObservation.sourceType as OperationalSourceType,
  });

  const canonicalState = await publishCanonicalState({
    vehicleId,
    sourceId: selectedSourceId,
    sourceType: selectedObservation.sourceType as CanonicalSourceType,
    lat: canonicalLocation.lat,
    lng: canonicalLocation.lng,
    speed: canonicalLocation.speed,
    heading: canonicalLocation.heading,
    accuracy: canonicalLocation.accuracy,
    station: canonicalLocation.station,
    recordedAt: canonicalLocation.recordedAt,
    tripId: activeTrip.id,
    selection: sources[0]?.id === selectedSourceId ? 'canonical' : 'fallback',
  });

  // Trigger DB persistence after live publication. T5 history remains best effort.
  await persistSampledHistory(vehicleId, canonicalLocation, activeTrip.id);

  return canonicalState as CanonicalVehicleStateV1;
};

/**
 * 3. Persist Sampled History (60s Write Throttling)
 * Ensures coordinates are written to PostGIS database at most once every 60s per active trip.
 */
interface CanonicalHistoryPoint {
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  station: string | null;
  sourceId: string;
  recordedAt: Date;
}

const persistSampledHistory = async (
  vehicleId: string,
  canonicalLocation: CanonicalHistoryPoint,
  tripId?: string,
) => {
  const cacheKey = `trip:last_saved:vehicle:${vehicleId}`;
  let wasSet: string | null = null;

  try {
    // Apply Redis admission before the persistence transaction. A vehicle key
    // is equivalent to a trip key while the partial index allows only one
    // active trip per vehicle.
    wasSet = await redisClient.set(cacheKey, '1', {
      NX: true,
      EX: THROTTLE_SECONDS
    });

    const persisted = await recordCanonicalHistory({
      vehicleId,
      ...(tripId === undefined ? {} : { tripId }),
      lat: canonicalLocation.lat,
      lng: canonicalLocation.lng,
      speed: canonicalLocation.speed,
      heading: canonicalLocation.heading,
      station: canonicalLocation.station,
      sourceId: canonicalLocation.sourceId,
      recordedAt: canonicalLocation.recordedAt,
    }, Boolean(wasSet));

    if (!persisted) {
      if (wasSet) await redisClient.del(cacheKey);
      return;
    }

    if (wasSet) {
      emitOperationalSignal({
        event: 'history.persisted',
        level: 'info',
        outcome: 'persisted',
        transport: 'system',
        vehicleId,
        tripId: persisted.tripId,
        dependency: 'postgres',
        operation: 'history_insert',
        reasonCode: 'HISTORY_INSERTED',
      });
    }

  } catch (error) {
    logBoundaryFailure('GPS history persistence', error);
    // A failed transaction must not consume the sampling window. If the
    // process dies before this cleanup, the bounded TTL still self-heals.
    if (wasSet) await redisClient.del(cacheKey).catch(() => undefined);
    emitOperationalSignal({
      event: 'history.persistence_failed',
      level: 'error',
      outcome: 'failed',
      transport: 'system',
      vehicleId,
      dependency: 'postgres',
      operation: 'history_insert',
      reasonCode: 'HISTORY_PERSISTENCE_FAILED',
    });
  }
};
