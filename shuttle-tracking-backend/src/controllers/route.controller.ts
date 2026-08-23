import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { invalidatePublicCache } from '../services/cache.service.js';
import { BoundaryError, logBoundaryFailure, notFound, sendBoundaryError } from '../middleware/boundary-errors.js';
import type { RouteCreateInput, RouteUpdateInput } from '../middleware/validation.js';

const internalRouteError = (message: string): BoundaryError =>
    new BoundaryError(500, 'INTERNAL_ERROR', message);

// Get All Routes
export const getRoutes = async (req: Request, res: Response) => {
    try{
        const routes = await prisma.route.findMany({
            orderBy : { id: 'asc' }
        });
        res.json(routes);
    }catch (error) {
        logBoundaryFailure('Route list', error);
        sendBoundaryError(res, error, internalRouteError('Failed to fetch routes'));
    }
};

// Get Route by ID
export const getRouteById = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string
        const route = await prisma.route.findUnique({
            where: { id },
        });
        if (!route) {
            throw notFound('Route not found');
        }
        res.json(route);
    }catch (error) {
        logBoundaryFailure('Route read', error);
        sendBoundaryError(res, error, internalRouteError('Failed to fetch route'));
    }
};

// Create Route
export const createRoute = async (req: Request, res: Response) => {
    try {
        const { id, name, color, status } = req.body as RouteCreateInput;
        const newRoute = await prisma.route.create({
            data: {
                id,
                name,
                color,
                status,
            }
        });
        await invalidatePublicCache();
        res.status(201).json(newRoute);
        
    } catch (error) {
        logBoundaryFailure('Route create', error);
        sendBoundaryError(res, error, internalRouteError('Failed to create route'));
    }
};

// Update Route
export const updateRoute = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        const { name, color, status } = req.body as RouteUpdateInput;
        const updatedRoute = await prisma.route.update({
            where: { id },
            data: { name, color, status },
        });
        await invalidatePublicCache();
        res.json(updatedRoute);
    }catch (error) {
        logBoundaryFailure('Route update', error);
        sendBoundaryError(res, error, internalRouteError('Failed to update route'));
    }
};

// Delete Route
export const deleteRoute = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        await prisma.route.delete({
            where: { id },
        });
        await invalidatePublicCache();
        res.json({ message: 'Route deleted successfully' });
    }catch (error) {
        logBoundaryFailure('Route delete', error);
        sendBoundaryError(res, error, internalRouteError('Failed to delete route'));
    }
};

// Get Vehicles assigned to a Route
export const getVehiclesByRouteId = async (req: Request, res: Response) => {
    try{
        const routeId = req.params.id as string;
        const vehicles = await prisma.vehicle.findMany({
            where: { assignedRouteId: routeId },
        });
        if (vehicles.length === 0) {
            throw notFound('No vehicles found for this route');
        }
        res.json(vehicles);
    }catch (error) {
        logBoundaryFailure('Route vehicle list', error);
        sendBoundaryError(res, error, internalRouteError('Failed to fetch vehicles for route'));
    }
};
