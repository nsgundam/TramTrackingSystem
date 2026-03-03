import { prisma } from '../config/prisma.js';

export const lastSavedCache = new Map<string, number>();

export const handleLocationData = async (data: any) => {
    try {
        const { tripId, vehicleId, lat, lng, speed, bearing, accuracy, station } = data;

        if (!tripId || !vehicleId || lat === undefined || lng === undefined) return data;

        let actualStation = station;
        if (speed !== undefined && speed !== null && speed >= 1 && station !== 'En Route') {
            actualStation = 'En Route';
        }

        const now = Date.now();
        const recordedAt = new Date();

        const lastSaved = lastSavedCache.get(tripId) || 0;
        const TIME_LIMIT = 60000;

        if (now - lastSaved >= TIME_LIMIT) {
            await prisma.$executeRaw`
                INSERT INTO gps_tracks (trip_id, vehicle_id, location, speed, heading, station, recorded_at)
                VALUES (
                    ${tripId}::uuid, 
                    ${vehicleId}, 
                    ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)::geography, 
                    ${speed || null}, 
                    ${bearing || null}, 
                    ${actualStation || null}, 
                    ${recordedAt}
                )
            `;
            lastSavedCache.set(tripId, now);
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