import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// 1. Get all Active Routes
export const getActiveRoutes = async (req: Request, res: Response) => {
    try {
        const routes = await prisma.route.findMany({
            where: { status: 'active' },
            orderBy: { id: 'asc' }
        });
        res.json(routes);
    } catch (error) {
        console.error('Error fetching active routes:', error);
        res.status(500).json({ error: 'Failed to fetch active routes' });
    }
};

// 2. Get all Active Vehicles
export const getActiveVehicles = async (req: Request, res: Response) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { status: 'active' },
            include: { route: true },
            orderBy: { id: 'asc' }
        });
        res.json(vehicles);
    } catch (error) {
        console.error('Error fetching active vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch active vehicles' });
    }
};

// 3. Get all Active Stops
export const getPublicStops = async (req: Request, res: Response) => {
    try {
        const stops = await prisma.$queryRaw`
            SELECT 
                id, 
                name_th as "nameTh", 
                name_en as "nameEn", 
                image_url as "imageUrl",
                ST_Y(location::geometry) as lat, 
                ST_X(location::geometry) as lng
            FROM stops
            WHERE status = 'active'
            ORDER BY id ASC
        `;
        res.json(stops);
    } catch (error) {
        console.error('Error fetching public stops:', error);
        res.status(500).json({ error: 'Failed to fetch stops' });
    }
};

// 4. Get stops for a specific valid route
export const getRouteStops = async (req: Request, res: Response) => {
    try {
        const routeId = req.params.id as string;

        // Ensure this route is actually active, but we can just query the stops.
        const routeStops = await prisma.$queryRaw`
            SELECT 
                s.id, 
                s.name_th as "nameTh", 
                s.name_en as "nameEn", 
                s.image_url as "imageUrl",
                ST_Y(s.location::geometry) as lat, 
                ST_X(s.location::geometry) as lng,
                rs.stop_order as "stopOrder"
            FROM route_stops rs
            JOIN stops s ON rs.stop_id = s.id
            WHERE rs.route_id = ${routeId} AND s.status = 'active'
            ORDER BY rs.stop_order ASC
        `;
        res.json(routeStops);
    } catch (error) {
        console.error('Error fetching stops for route:', error);
        res.status(500).json({ error: 'Failed to fetch stops for route' });
    }
};
