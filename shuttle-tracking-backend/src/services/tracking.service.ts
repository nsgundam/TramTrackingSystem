import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';
import type { SenderContext } from '../middleware/auth.js';
import { BoundaryError, logBoundaryFailure } from '../middleware/boundary-errors.js';
import { emitOperationalSignal } from './operational-signals.js';

const THROTTLE_SECONDS = 60;
export const SOURCE_FRESHNESS_WINDOW_MS = 30_000;

export const TRACKING_SOURCE_TYPES = ['mobile', 'lorawan', 'esp32', 'simulator'] as const;
export const TRACKING_SOURCE_STATUSES = ['provisioning', 'active', 'inactive', 'retired'] as const;

export type SourceHealth = 'never_seen' | 'online' | 'stale' | 'disabled';

export interface SourceHealthInput {
  status: string;
  lastSeenAt: Date | null;
}

export const getSourceHealth = (
  source: SourceHealthInput,
  now = Date.now()
): SourceHealth => {
  if (source.status !== 'active') {
    return 'disabled';
  }

  if (!source.lastSeenAt) {
    return 'never_seen';
  }

  return now - source.lastSeenAt.getTime() <= SOURCE_FRESHNESS_WINDOW_MS
    ? 'online'
    : 'stale';
};

export const sourceRequiresCredential = (sourceType: string): boolean => sourceType !== 'lorawan';

const sourceHealthStates = new Map<string, SourceHealth>();
const vehicleStaleStates = new Map<string, boolean>();
const SOURCE_HEALTH_SWEEP_INTERVAL_MS = 10_000;

type SourceHealthRecord = SourceHealthInput & {
  id: string;
  vehicleId: string | null;
};

export const sweepSourceHealth = async (): Promise<void> => {
  try {
    const sources = await prisma.trackingSource.findMany({
      select: { id: true, vehicleId: true, status: true, lastSeenAt: true },
    }) as SourceHealthRecord[];

    const activeByVehicle = new Map<string, SourceHealthRecord[]>();
    for (const source of sources) {
      const health = getSourceHealth(source);
      const previous = sourceHealthStates.get(source.id);
      sourceHealthStates.set(source.id, health);

      if (health === 'stale' || health === 'never_seen') {
        if (previous !== health) {
          emitOperationalSignal({
            event: 'tracking.source_stale',
            level: 'warn',
            outcome: 'stale',
            transport: 'system',
            sourceId: source.id,
            reasonCode: health === 'never_seen' ? 'SOURCE_NEVER_SEEN' : 'SOURCE_STALE',
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

      if (source.status === 'active' && source.vehicleId) {
        const vehicleSources = activeByVehicle.get(source.vehicleId) ?? [];
        vehicleSources.push(source);
        activeByVehicle.set(source.vehicleId, vehicleSources);
      }
    }

    for (const [vehicleId, vehicleSources] of activeByVehicle) {
      const allStale = vehicleSources.every((source) => sourceHealthStates.get(source.id) !== 'online');
      const previous = vehicleStaleStates.get(vehicleId);
      vehicleStaleStates.set(vehicleId, allStale);

      if (allStale && previous !== true) {
        emitOperationalSignal({
          event: 'tracking.source_stale',
          level: 'warn',
          outcome: 'stale',
          transport: 'system',
          vehicleId,
          reasonCode: 'ALL_SOURCES_STALE',
          activeSourceCount: vehicleSources.length,
          staleSourceCount: vehicleSources.length,
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
}

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
    include: { vehicle: true }
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
      data.sender.vehicleId !== source.vehicleId ||
      data.sender.credentialVersion !== source.credentialVersion
    ) {
      throw new BoundaryError(403, 'SENDER_OWNERSHIP_MISMATCH', 'Sender cannot submit for this source');
    }
  }

  if (data.tripId) {
    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
      select: { vehicleId: true, status: true },
    });

    if (!trip || trip.vehicleId !== source.vehicleId || trip.status !== 'in_progress') {
      throw new BoundaryError(403, 'TRIP_OWNERSHIP_MISMATCH', 'Trip is invalid or does not belong to the sender vehicle');
    }
  }

  // 4. Save Raw Observation to Redis Cache
  const observation = {
    lat: numLat,
    lng: numLng,
    speed: speed !== undefined && speed !== null ? speed : null,
    bearing: bearing !== undefined && bearing !== null ? bearing : null,
    accuracy: accuracy !== undefined && accuracy !== null ? accuracy : null,
    station: station || null,
    timestamp: Date.now(),
    sourceType: source.type
  };

  const cacheKey = `source:last_location:${sourceId}`;
  await redisClient.set(cacheKey, JSON.stringify(observation));

  // Throttled lastSeenAt updates to database (once every 10 seconds per device)
  const now = new Date();
  const lastSeenKey = `source:last_seen_time:${sourceId}`;
  const shouldUpdateDB = await redisClient.set(lastSeenKey, '1', { NX: true, EX: 10 });
  if (shouldUpdateDB) {
    await prisma.trackingSource.update({
      where: { id: sourceId },
      data: { lastSeenAt: now }
    }).catch(err => logBoundaryFailure('Tracking source last-seen update', err));
  }

  // 5. Evaluate Canonical Location if device is assigned to a Vehicle
  if (source.vehicleId) {
    return await evaluateCanonicalLocation(source.vehicleId);
  }

  return null;
};

/**
 * 2. Select Canonical Current Vehicle Location
 * Evaluates all device sources assigned to a vehicle, selecting the highest priority active one.
 */
export const evaluateCanonicalLocation = async (vehicleId: string) => {
  const sources = await prisma.trackingSource.findMany({
    where: { vehicleId, status: 'active' },
    orderBy: [
      { priority: 'asc' },
      { id: 'asc' }
    ] // Priority 1 is highest; ID makes equal priorities deterministic.
  });

  if (sources.length === 0) {
    emitOperationalSignal({
      event: 'tracking.source_stale',
      level: 'warn',
      outcome: 'stale',
      transport: 'system',
      vehicleId,
      reasonCode: 'NO_ACTIVE_SOURCE',
    });
    return null;
  }

  let selectedObservation: any = null;
  let selectedSourceId: string | null = null;
  const nowMs = Date.now();

  // Evaluate sources in priority order
  for (const src of sources) {
    const rawData = await redisClient.get(`source:last_location:${src.id}`);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      // Freshness check: data must be recorded within the last 30 seconds
      if (nowMs - parsed.timestamp <= SOURCE_FRESHNESS_WINDOW_MS) {
        selectedObservation = parsed;
        selectedSourceId = src.id;
        break; // Stop at highest priority fresh source
      }
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
    return null;
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
    sourceType: selectedObservation.sourceType,
    recordedAt: new Date(selectedObservation.timestamp)
  };

  // Save current canonical location to cache
  await redisClient.set(`vehicle:current_location:${vehicleId}`, JSON.stringify(canonicalLocation));

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
    sourceType: selectedObservation.sourceType,
  });

  // Trigger DB persistence
  await persistSampledHistory(vehicleId, canonicalLocation);

  return canonicalLocation;
};

/**
 * 3. Persist Sampled History (60s Write Throttling)
 * Ensures coordinates are written to PostGIS database at most once every 60s per trip session.
 */
const persistSampledHistory = async (vehicleId: string, canonicalLocation: any) => {
  try {
    let activeTrip = await prisma.trip.findFirst({
      where: { vehicleId, status: 'in_progress' }
    });

    // Auto-Trip Session Creator Logic (Virtual Trip)
    if (!activeTrip) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId }
      });

      if (!vehicle || !vehicle.assignedRouteId) {
        // Skip history logging if vehicle is not assigned to a route
        return;
      }

      // Check if a virtual daily trip has been created for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      activeTrip = await prisma.trip.findFirst({
        where: {
          vehicleId,
          status: 'in_progress',
          startTime: { gte: today }
        }
      });

      if (!activeTrip) {
        activeTrip = await prisma.trip.create({
          data: {
            vehicleId,
            routeId: vehicle.assignedRouteId,
            startTime: new Date(),
            status: 'in_progress'
          }
        });

        // Update vehicle status to active
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { status: 'active' }
        });

        console.log('[Auto-Trip] Created daily virtual trip.');
      }
    }

    const tripId = activeTrip.id;

    // Apply DB write-throttling via Redis (60 seconds)
    const cacheKey = `trip:last_saved:${tripId}`;
    const wasSet = await redisClient.set(cacheKey, '1', {
      NX: true,
      EX: THROTTLE_SECONDS
    });

    if (wasSet) {
      await prisma.$executeRaw`
        INSERT INTO gps_tracks (trip_id, vehicle_id, location, speed, heading, station, source_id, recorded_at)
        VALUES (
          ${tripId}::uuid, 
          ${vehicleId}, 
          ST_SetSRID(ST_MakePoint(${canonicalLocation.lng}, ${canonicalLocation.lat}), 4326)::geography,
          ${canonicalLocation.speed ?? null}, 
          ${canonicalLocation.heading ?? null}, 
          ${canonicalLocation.station ?? null}, 
          ${canonicalLocation.sourceId ?? null},
          ${canonicalLocation.recordedAt}
        )
      `;
        emitOperationalSignal({
          event: 'history.persisted',
          level: 'info',
          outcome: 'persisted',
          transport: 'system',
          vehicleId,
          tripId,
          dependency: 'postgres',
          operation: 'history_insert',
          reasonCode: 'HISTORY_INSERTED',
        });
      }

  } catch (error) {
    logBoundaryFailure('GPS history persistence', error);
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
