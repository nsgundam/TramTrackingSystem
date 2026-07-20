import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', () => {
    console.error('[Redis] Client error');
});

redisClient.on('connect', () => {
    console.log('[Redis] Connected');
});

/**
 * Opens the Redis connection.
 * Call once at server startup before any Redis operations.
 */
export const connectRedis = async (): Promise<void> => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};
