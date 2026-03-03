import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js'; 
import { lastSavedCache } from '../services/tracking.service.js';

export const startTrip = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.body;

        if (!vehicleId) {
            return res.status(400).json({ error: 'Missing vehicleId' });
        }

        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId }
        });

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        if (!vehicle.assignedRouteId) {
            return res.status(400).json({ 
                error: 'This vehicle has no assigned route. Please contact the Head of Drivers to assign a route via Admin Dashboard.' 
            });
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
        console.error('Error starting trip:', error);
        res.status(500).json({ error: 'Failed to start trip' });
    }
};

export const endTrip = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

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

        lastSavedCache.delete(id);

        res.json({ 
            message: 'Trip ended successfully', 
            trip: endedTrip 
        });

    } catch (error) {
        console.error('Error ending trip:', error);
        res.status(500).json({ error: 'Failed to end trip' });
    }
};