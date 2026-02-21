import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const updateLocation = async (req: Request, res: Response) => {
    try {
        const { tripId, vehicleId, lat, lng, speed} = req.body;

        if (!tripId || !vehicleId || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Missing required fields (tripId, vehicleId, lat, lng)' });
        }

        const recordedAt = new Date();

        await prisma.$executeRaw`
            INSERT INTO gps_tracks (trip_id, vehicle_id, location, speed, recorded_at)
            VALUES (
                ${tripId}::uuid, 
                ${vehicleId}, 
                ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)::geography, 
                ${speed || null}, 
                ${recordedAt}
            )
        `;

        const io = req.app.get('io');
        if (io) {
            io.emit('location-update', {
                tripId,
                vehicleId,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                speed,
                recordedAt
            });
        }

        res.status(200).json({ success: true, message: 'Location saved and broadcasted' });

    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Failed to update location' });
    }
};