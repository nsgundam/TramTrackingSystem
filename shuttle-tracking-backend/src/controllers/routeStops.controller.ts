import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getAllRouteStops = async (req: Request, res: Response) => {
    try {
        const routeStops = await prisma.routeStop.findMany({
            include: {
                stop: true,
                route: true,
            },
        });
        res.json(routeStops);
    } catch (error) {
        console.error('Error fetching route stops:', error);
        res.status(500).json({ error: 'Failed to fetch route stops' });
    }
};

export const getStopsByRoute = async (req: Request, res: Response) => {
    try{
        const routeId = req.params.routeId as string;
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
            WHERE rs.route_id = ${routeId}
            ORDER BY rs.stop_order ASC
        `;
        res.json(routeStops);
    } catch (error) {
        console.error('Error fetching stops for route:', error);
        res.status(500).json({ error: 'Failed to fetch stops for route' });
    }
};

export const createRouteStop = async (req: Request, res: Response) => {
    try {
        const { routeId, stopId, stopOrder } = req.body;
        const newRouteStop = await prisma.routeStop.create({
            data: {
                routeId,
                stopId,
                stopOrder,
            },
        });
        res.status(201).json(newRouteStop);
    } catch (error) {
        console.error('Error creating route stop:', error);
        res.status(500).json({ error: 'Failed to create route stop' });
    }
};

export const deleteRouteStop = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.routeStop.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting route stop:', error);
        res.status(500).json({ error: 'Failed to delete route stop' });
    }
};