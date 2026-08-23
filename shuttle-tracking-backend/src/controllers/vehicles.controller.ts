import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { invalidatePublicCache } from '../services/cache.service.js';
import {
    BoundaryError,
    conflict,
    logBoundaryFailure,
    notFound,
    sendBoundaryError,
} from '../middleware/boundary-errors.js';
import { createVehicleQrToken, vehicleQrUri } from '../services/vehicle-qr.service.js';
import type { VehicleCreateInput, VehicleUpdateInput } from '../middleware/validation.js';

const internalVehicleError = (message: string): BoundaryError =>
    new BoundaryError(500, 'INTERNAL_ERROR', message);

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
        sendBoundaryError(res, error, internalVehicleError('Failed to fetch vehicles'));
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
            throw notFound('Vehicle not found');
        }
        res.json(vehicle);
    }catch (error) {
        logBoundaryFailure('Vehicle read', error);
        sendBoundaryError(res, error, internalVehicleError('Failed to fetch vehicle'));
    }
};

export const getVehicleAssignmentQr = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { id: true, name: true } });
        if (!vehicle) {
            throw notFound('Vehicle not found');
        }
        const token = createVehicleQrToken(vehicle.id);
        res.json({ vehicle, token, uri: vehicleQrUri(token) });
    } catch (error) {
        logBoundaryFailure('Vehicle QR', error);
        sendBoundaryError(res, error, internalVehicleError('Failed to create vehicle QR contract'));
    }
};


// Create Vehicle
export const createVehicle = async (req: Request, res: Response) => {
    try{
        const { id, name, type, status, assignedRouteId } = req.body as VehicleCreateInput;
        const newVehicle = await prisma.vehicle.create({
            data: {
                id,
                name,
                type,
                status,
                assignedRouteId
            }
        });
        await invalidatePublicCache();
        res.status(201).json(newVehicle);
    }catch (error) {
        logBoundaryFailure('Vehicle create', error);
        sendBoundaryError(res, error, internalVehicleError('Failed to create vehicle'));
    }
};

// Update Vehicle
export const updateVehicle = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        const { name, type, status, assignedRouteId } = req.body as VehicleUpdateInput;
        const updatedVehicle = await prisma.vehicle.update({
            where: { id },
            data: { name, type, status, assignedRouteId },
        });
        await invalidatePublicCache();
        res.json(updatedVehicle);
    }catch (error) {
        logBoundaryFailure('Vehicle update', error);
        sendBoundaryError(res, error, internalVehicleError('Failed to update vehicle'));
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
        sendBoundaryError(res, error, internalVehicleError('Failed to delete vehicle'));
    }
};
