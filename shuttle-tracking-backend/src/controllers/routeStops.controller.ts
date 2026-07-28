import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import {
    BoundaryError,
    logBoundaryFailure,
    notFound,
    sendBoundaryError,
} from '../middleware/boundary-errors.js';
import type { RouteStopCreateInput } from '../middleware/validation.js';

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
        logBoundaryFailure('Route-stop list', error);
        sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch route stops'));
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
        logBoundaryFailure('Route-stop read', error);
        sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch stops for route'));
    }
};

export const createRouteStop = async (req: Request, res: Response) => {
    try {
        const { routeId, stopId, stopOrder } = req.body as RouteStopCreateInput;
        const [route, stop] = await Promise.all([
            prisma.route.findUnique({ where: { id: routeId }, select: { id: true } }),
            prisma.stop.findUnique({ where: { id: stopId }, select: { id: true } }),
        ]);
        if (!route || !stop) throw notFound('Route or stop not found');

        const newRouteStop = await prisma.routeStop.create({
            data: {
                routeId,
                stopId,
                stopOrder,
            },
        });
        res.status(201).json(newRouteStop);
    } catch (error) {
        logBoundaryFailure('Route-stop create', error);
        sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to create route stop'));
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
        logBoundaryFailure('Route-stop delete', error);
        sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to delete route stop'));
    }
};
