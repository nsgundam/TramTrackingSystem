import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';

/** Cache TTL in seconds (5 minutes) */
const CACHE_TTL = 300;

// 1. Get all Active Routes
export const getActiveRoutes = async (req: Request, res: Response) => {
    try {
        // Check cache first
        const cached = await redisClient.get('public:active_routes');
        if (cached) {
            res.json(JSON.parse(cached));
            return;
        }

        const routes = await prisma.route.findMany({
            where: { status: 'active' },
            orderBy: { id: 'asc' }
        });

        // Store in cache
        await redisClient.set('public:active_routes', JSON.stringify(routes), { EX: CACHE_TTL });

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

        const vehiclesWithLocation = await Promise.all(
            vehicles.map(async (v) => {
                const locData = await redisClient.get(`vehicle:current_location:${v.id}`);
                let location = null;
                if (locData) {
                    const parsed = JSON.parse(locData);
                    location = {
                        lat: parsed.lat,
                        lng: parsed.lng,
                        speed: parsed.speed,
                        heading: parsed.heading,
                        accuracy: parsed.accuracy,
                        station: parsed.station,
                        sourceType: parsed.sourceType,
                        recordedAt: parsed.recordedAt
                    };
                }
                return {
                    ...v,
                    location
                };
            })
        );

        res.json(vehiclesWithLocation);
    } catch (error) {
        console.error('Error fetching active vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch active vehicles' });
    }
};

// 3. Get all Active Stops
export const getPublicStops = async (req: Request, res: Response) => {
    try {
        const cached = await redisClient.get('public:stops');
        if (cached) {
            res.json(JSON.parse(cached));
            return;
        }

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

        await redisClient.set('public:stops', JSON.stringify(stops, (_key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ), { EX: CACHE_TTL });

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
        const cacheKey = `public:route_stops:${routeId}`;

        const cached = await redisClient.get(cacheKey);
        if (cached) {
            res.json(JSON.parse(cached));
            return;
        }

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

        await redisClient.set(cacheKey, JSON.stringify(routeStops, (_key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ), { EX: CACHE_TTL });

        res.json(routeStops);
    } catch (error) {
        console.error('Error fetching stops for route:', error);
        res.status(500).json({ error: 'Failed to fetch stops for route' });
    }
};
