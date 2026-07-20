import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js'; 
import { redisClient } from '../config/redis.js';
import {
    BoundaryError,
    conflict,
    logBoundaryFailure,
    notFound,
    sendBoundaryError,
} from '../middleware/boundary-errors.js';
import type { TripStartInput } from '../middleware/validation.js';

export const startTrip = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.body as TripStartInput;
        const sender = req.sender;

        if (!sender) {
            throw new BoundaryError(401, 'SENDER_AUTH_REQUIRED', 'Sender authentication required');
        }

        if (!vehicleId) {
            throw new BoundaryError(400, 'INVALID_REQUEST', 'Vehicle is required');
        }

        if (vehicleId !== sender.vehicleId) {
            throw new BoundaryError(403, 'SENDER_OWNERSHIP_MISMATCH', 'Sender cannot operate this vehicle');
        }

        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId }
        });

        if (!vehicle) {
            throw notFound('Vehicle not found');
        }

        if (!vehicle.assignedRouteId) {
            throw conflict('Vehicle has no assigned route');
        }

        const newTrip = await prisma.trip.create({
            data: {
                vehicleId: vehicle.id,
                routeId: vehicle.assignedRouteId, 
                startTime: new Date(),
                status: 'in_progress'
            }
        });

        await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { status: 'active' }
        });

        res.status(201).json({ 
            message: 'Trip started successfully', 
            trip: newTrip 
        });

    } catch (error) {
        logBoundaryFailure('Trip start', error);
        sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to start trip'));
    }
};

export const endTrip = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const sender = req.sender;

        if (!sender) {
            throw new BoundaryError(401, 'SENDER_AUTH_REQUIRED', 'Sender authentication required');
        }

        const existingTrip = await prisma.trip.findUnique({
            where: { id },
            select: { vehicleId: true, status: true },
        });

        if (!existingTrip) {
            throw notFound('Trip not found');
        }

        if (existingTrip.vehicleId !== sender.vehicleId) {
            throw new BoundaryError(403, 'TRIP_OWNERSHIP_MISMATCH', 'Sender cannot operate this trip');
        }

        if (existingTrip.status !== 'in_progress') {
            throw conflict('Trip is not in progress');
        }

        const endedTrip = await prisma.trip.update({
            where: { id },
            data: {
                endTime: new Date(),
                status: 'completed'
            }
        });

        await prisma.vehicle.update({
            where: { id: endedTrip.vehicleId },
            data: { 
                status: 'inactive' 
            }
        });

        await redisClient.del(`trip:last_saved:${id}`);

        res.json({ 
            message: 'Trip ended successfully', 
            trip: endedTrip 
        });

    } catch (error) {
        logBoundaryFailure('Trip end', error);
        sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to end trip'));
    }
};
