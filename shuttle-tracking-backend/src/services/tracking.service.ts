import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';
import bcrypt from 'bcrypt';

const THROTTLE_SECONDS = 60;

// Bounds representing approximate geographical range of Thailand
const LAT_MIN = 5.0;
const LAT_MAX = 21.0;
const LNG_MIN = 97.0;
const LNG_MAX = 106.0;

export interface ObservationData {
  sourceId: string;
  token?: string;
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
  const { sourceId, token, lat, lng, speed, bearing, accuracy, station } = data;

  if (!sourceId || lat === undefined || lng === undefined) {
    throw new Error('Missing required fields: sourceId, lat, or lng');
  }

  // 1. Basic Coordinate Validation
  const numLat = parseFloat(lat as any);
  const numLng = parseFloat(lng as any);
  if (isNaN(numLat) || isNaN(numLng) || numLat < LAT_MIN || numLat > LAT_MAX || numLng < LNG_MIN || numLng > LNG_MAX) {
    throw new Error(`Coordinates out of bounds: lat ${lat}, lng ${lng}`);
  }

  // 2. Fetch Device from Registry
  const source = await prisma.trackingSource.findUnique({
    where: { id: sourceId },
    include: { vehicle: true }
  });

  if (!source || source.status !== 'active') {
    throw new Error(`Active tracking source with ID "${sourceId}" not found`);
  }

  // 3. Authenticate Device (Skip for LoRaWAN which is authenticated at webhook router level)
  if (source.type !== 'lorawan' && source.secretHash) {
    if (!token) {
      throw new Error(`Authentication token required for device "${sourceId}"`);
    }
    const isMatch = await bcrypt.compare(token, source.secretHash);
    if (!isMatch) {
      throw new Error(`Invalid authentication token for device "${sourceId}"`);
    }
  }

  // 4. Save Raw Observation to Redis Cache
  const observation = {
    lat: numLat,
    lng: numLng,
    speed: speed !== undefined && speed !== null ? parseFloat(speed as any) : null,
    bearing: bearing !== undefined && bearing !== null ? parseFloat(bearing as any) : null,
    accuracy: accuracy !== undefined && accuracy !== null ? parseFloat(accuracy as any) : null,
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
    }).catch(err => console.error(`Failed to update lastSeenAt in DB for source ${sourceId}:`, err));
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
    orderBy: { priority: 'asc' } // Priority 1 is highest, then 2, 3, etc.
  });

  if (sources.length === 0) return null;

  let selectedObservation: any = null;
  let selectedSourceId: string | null = null;
  const nowMs = Date.now();

  // Evaluate sources in priority order
  for (const src of sources) {
    const rawData = await redisClient.get(`source:last_location:${src.id}`);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      // Freshness check: data must be recorded within the last 30 seconds
      if (nowMs - parsed.timestamp <= 30000) {
        selectedObservation = parsed;
        selectedSourceId = src.id;
        break; // Stop at highest priority fresh source
      }
    }
  }

  if (!selectedObservation) {
    console.warn(`[Pipeline] All location sources for vehicle ${vehicleId} are stale or offline.`);
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

        console.log(`[Auto-Trip] Created daily virtual trip ${activeTrip.id} for vehicle ${vehicleId}`);
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
          ST_SetSRID(ST_MakePoint(${parseFloat(canonicalLocation.lng)}, ${parseFloat(canonicalLocation.lat)}), 4326)::geography, 
          ${canonicalLocation.speed ?? null}, 
          ${canonicalLocation.heading ?? null}, 
          ${canonicalLocation.station ?? null}, 
          ${canonicalLocation.sourceId ?? null},
          ${canonicalLocation.recordedAt}
        )
      `;
      console.log(`[DB SAVE] Canonical location saved for trip ${tripId} (source: ${canonicalLocation.sourceType})`);
    }

  } catch (error) {
    console.error(`[DB SAVE] Error persisting history for vehicle ${vehicleId}:`, error);
  }
};