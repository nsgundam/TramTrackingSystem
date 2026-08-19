import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { invalidatePublicCache } from '../services/cache.service.js';
import {
    BoundaryError,
    conflict,
    logBoundaryFailure,
    sendBoundaryError,
} from '../middleware/boundary-errors.js';
import { createVehicleQrToken, vehicleQrUri } from '../services/vehicle-qr.service.js';

// Get All Vehicles
export const getVehicles = async (req: Request, res: Response) => {
    try{
        const vehicles = await prisma.vehicle.findMany({
            include: { route: true},
            orderBy : { id: 'asc' }
        });
        res.json(vehicles);
    }catch (error) {
        logBoundaryFailure('Vehicle list', error);
        res.status(500).json({ error: 'An error occurred while fetching vehicles' });
    }
};

// Get Vehicle by ID
export const getVehicleById = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: { route: true }
        });
        if (!vehicle) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        res.json(vehicle);
    }catch (error) {
        logBoundaryFailure('Vehicle read', error);
        res.status(500).json({ error: 'An error occurred while fetching the vehicle' });
    }
};

export const getVehicleAssignmentQr = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { id: true, name: true } });
        if (!vehicle) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        const token = createVehicleQrToken(vehicle.id);
        res.json({ vehicle, token, uri: vehicleQrUri(token) });
    } catch (error) {
        logBoundaryFailure('Vehicle QR', error);
        res.status(500).json({ error: 'An error occurred while creating the vehicle QR contract' });
    }
};


// Create Vehicle
export const createVehicle = async (req: Request, res: Response) => {
    try{
        const { id, name, type, status, assignedRouteId } = req.body;
        const newVehicle = await prisma.vehicle.create({
            data: {
                id,
                name,
                type,
                status: status || 'inactive',
                assignedRouteId
            }
        });
        await invalidatePublicCache();
        res.status(201).json(newVehicle);
    }catch (error) {
        logBoundaryFailure('Vehicle create', error);
        res.status(500).json({ error: 'An error occurred while creating the vehicle' });
    }
};

// Update Vehicle
export const updateVehicle = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        const data = req.body;
        const updatedVehicle = await prisma.vehicle.update({
            where: { id },
            data
        });
        await invalidatePublicCache();
        res.json(updatedVehicle);
    }catch (error) {
        logBoundaryFailure('Vehicle update', error);
        res.status(500).json({ error: 'An error occurred while updating the vehicle' });
    }
};

// Delete Vehicle
export const deleteVehicle = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        const assignmentCount = await prisma.trackingAssignment.count({ where: { vehicleId: id } });
        if (assignmentCount > 0) {
            throw conflict('Vehicles with tracking assignment history cannot be deleted');
        }
        await prisma.vehicle.delete({
            where: { id }
        });
        await invalidatePublicCache();
        res.json({ message: 'Vehicle deleted successfully' });

    }catch (error) {
        logBoundaryFailure('Vehicle delete', error);
        if (error instanceof BoundaryError) {
            sendBoundaryError(res, error);
            return;
        }
        res.status(500).json({ error: 'An error occurred while deleting the vehicle' });
    }
};
