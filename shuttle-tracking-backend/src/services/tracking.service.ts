import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';

/**
 * Time window (seconds) for GPS write-throttle.
 * Only one INSERT per trip within this window, enforced via Redis TTL key.
 */
const THROTTLE_SECONDS = 60;

export const handleLocationData = async (data: any) => {
    try {
        const { tripId, vehicleId, lat, lng, speed, bearing, accuracy, station } = data;

        if (!tripId || !vehicleId || lat === undefined || lng === undefined) return data;

        let actualStation = station;
        if (speed !== undefined && speed !== null && speed >= 2 && station !== 'En Route') {
            actualStation = 'En Route';
        }

        const recordedAt = new Date();

        // Distributed write-throttle via Redis SET NX + EX
        // If the key already exists the SET returns null → skip DB write
        const cacheKey = `trip:last_saved:${tripId}`;
        const wasSet = await redisClient.set(cacheKey, '1', {
            NX: true,   // only set if key does NOT exist
            EX: THROTTLE_SECONDS,
        });

        if (wasSet) {
            await prisma.$executeRaw`
                INSERT INTO gps_tracks (trip_id, vehicle_id, location, speed, heading, station, recorded_at)
                VALUES (
                    ${tripId}::uuid, 
                    ${vehicleId}, 
                    ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)::geography, 
                    ${speed ?? null}, 
                    ${bearing ?? null}, 
                    ${actualStation ?? null}, 
                    ${recordedAt}
                )
            `;
            console.log(`[DB SAVE] Socket location saved for trip ${tripId}`);
        }

        return {
            tripId, vehicleId, lat, lng, speed, 
            heading: bearing, accuracy, station: actualStation, recordedAt
        };

    } catch (error) {
        console.error('Error handling location data in service:', error);
        return data;
    }
};