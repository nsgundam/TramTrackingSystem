import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { invalidatePublicCache } from '../services/cache.service.js';
import { logBoundaryFailure } from '../middleware/boundary-errors.js';

// Get All Routes
export const getRoutes = async (req: Request, res: Response) => {
    try{
        const routes = await prisma.route.findMany({
            orderBy : { id: 'asc' }
        });
        res.json(routes);
    }catch (error) {
        logBoundaryFailure('Route list', error);
        res.status(500).json({ error: 'An error occurred while fetching routes' });
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
            res.status(404).json({ error: 'Route not found' });
            return;
        }
        res.json(route);
    }catch (error) {
        logBoundaryFailure('Route read', error);
        res.status(500).json({ error: 'An error occurred while fetching the route' });
    }
};

// Create Route
export const createRoute = async (req: Request, res: Response) => {
    try {
        const { id, name, color, status} = req.body;
        const newRoute = await prisma.route.create({
            data: {
                id,
                name,
                color,
                status: status || 'inactive',
            }
        });
        await invalidatePublicCache();
        res.status(201).json(newRoute);
        
    } catch (error) {
        logBoundaryFailure('Route create', error);
        res.status(500).json({ error: 'An error occurred while creating the route' });
    }
};

// Update Route
export const updateRoute = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        const data = req.body;
        const updatedRoute = await prisma.route.update({
            where: { id },
            data
        });
        await invalidatePublicCache();
        res.json(updatedRoute);
    }catch (error) {
        logBoundaryFailure('Route update', error);
        res.status(500).json({ error: 'An error occurred while updating the route' });
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
        res.status(500).json({ error: 'An error occurred while deleting the route' });
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
            res.status(404).json({ error: 'No vehicles found for this route' });
            return;
        }
        res.json(vehicles);
    }catch (error) {
        logBoundaryFailure('Route vehicle list', error);
        res.status(500).json({ error: 'An error occurred while fetching vehicles for the route' });
    }
};
