import { createClient } from 'redis';
import { emitOperationalSignal } from '../services/operational-signals.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', () => {
    emitOperationalSignal({
        event: 'dependency.redis_failed',
        level: 'error',
        outcome: 'failed',
        transport: 'system',
        dependency: 'redis',
        operation: 'connect',
        reasonCode: 'REDIS_ERROR',
    });
});

redisClient.on('connect', () => {
    console.log('[Redis] Connected');
    emitOperationalSignal({
        event: 'dependency.redis_connected',
        level: 'info',
        outcome: 'connected',
        transport: 'system',
        dependency: 'redis',
        operation: 'connect',
        reasonCode: 'REDIS_CONNECTED',
    });
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
