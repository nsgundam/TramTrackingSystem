import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

const lastSavedCache = new Map<string, number>();
export { lastSavedCache };

export const updateLocation = async (req: Request, res: Response) => {
    try {
        const { tripId, vehicleId, lat, lng, speed, bearing, station } = req.body;

        if (!tripId || !vehicleId || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const now = Date.now();
        const recordedAt = new Date();

        const lastSaved = lastSavedCache.get(tripId) || 0;
        const TIME_LIMIT = 60000;

        if (now - lastSaved >= TIME_LIMIT) {
            await prisma.$executeRaw`
                INSERT INTO gps_tracks (trip_id, vehicle_id, location, speed, bearing, station, recorded_at)
                VALUES (
                    ${tripId}::uuid, 
                    ${vehicleId}, 
                    ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)::geography, 
                    ${speed ?? null},
                    ${bearing ?? null},
                    ${station ?? null},
                    ${recordedAt}
                )
            `;
            
            lastSavedCache.set(tripId, now);
            console.log(`[DB SAVE] Trip ${tripId} location saved.`);
        }

        res.status(200).json({ success: true, message: 'Location saved to database' });

    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Failed to update location' });
    }
};