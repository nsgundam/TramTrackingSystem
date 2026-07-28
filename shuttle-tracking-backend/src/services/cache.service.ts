import { redisClient } from '../config/redis.js';
import { logBoundaryFailure } from '../middleware/boundary-errors.js';

/**
 * Invalidate all cached public-facing API data.
 * Called after any admin mutation (create/update/delete) on
 * routes, stops, or vehicles so the next public read fetches fresh data.
 */
export const invalidatePublicCache = async (): Promise<void> => {
    try {
        // Delete the fixed keys
        await redisClient.del([
            'public:active_routes',
            'public:active_vehicles',
            'public:stops',
        ]);

        // Delete all per-route stop caches (public:route_stops:*)
        const routeStopsKeys = await redisClient.keys('public:route_stops:*');
        if (routeStopsKeys.length > 0) {
            await redisClient.del(routeStopsKeys);
        }

        console.log('[Cache] Public cache invalidated');
    } catch (error) {
        // Cache invalidation is best-effort – never break the admin mutation
        logBoundaryFailure('Public cache invalidation', error);
    }
};
