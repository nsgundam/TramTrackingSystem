import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { redisClient } from '../config/redis.js';
import { BoundaryError } from './boundary-errors.js';

export interface RateLimitConfig {
  scope: string;
  max: number;
  windowMs: number;
  key: (req: Request) => string | undefined;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export class RateLimitDependencyError extends Error {
  constructor() {
    super('Rate-limit dependency unavailable');
    this.name = 'RateLimitDependencyError';
  }
}

const DEFAULTS = {
  authMax: 10,
  authWindowMs: 5 * 60 * 1000,
  publicMax: 5,
  publicWindowMs: 10 * 60 * 1000,
  senderMax: 300,
  senderWindowMs: 60 * 1000,
  adminMax: 60,
  adminWindowMs: 60 * 1000,
  ttnMax: 120,
  ttnWindowMs: 60 * 1000,
};

const positiveIntegerEnv = (name: string, fallback: number, max: number): number => {
  const parsed = Number(process.env[name]);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= max ? parsed : fallback;
};

const durationEnv = (name: string, fallback: number): number =>
  positiveIntegerEnv(name, fallback, 60 * 60 * 1000);

export const RATE_LIMITS = {
  auth: {
    max: positiveIntegerEnv('AUTH_RATE_LIMIT_MAX', DEFAULTS.authMax, 10000),
    windowMs: durationEnv('AUTH_RATE_LIMIT_WINDOW_MS', DEFAULTS.authWindowMs),
  },
  public: {
    max: positiveIntegerEnv('PUBLIC_RATE_LIMIT_MAX', DEFAULTS.publicMax, 10000),
    windowMs: durationEnv('PUBLIC_RATE_LIMIT_WINDOW_MS', DEFAULTS.publicWindowMs),
  },
  sender: {
    max: positiveIntegerEnv('SENDER_RATE_LIMIT_MAX', DEFAULTS.senderMax, 100000),
    windowMs: durationEnv('SENDER_RATE_LIMIT_WINDOW_MS', DEFAULTS.senderWindowMs),
  },
  admin: {
    max: positiveIntegerEnv('ADMIN_RATE_LIMIT_MAX', DEFAULTS.adminMax, 10000),
    windowMs: durationEnv('ADMIN_RATE_LIMIT_WINDOW_MS', DEFAULTS.adminWindowMs),
  },
  ttn: {
    max: positiveIntegerEnv('TTN_RATE_LIMIT_MAX', DEFAULTS.ttnMax, 100000),
    windowMs: durationEnv('TTN_RATE_LIMIT_WINDOW_MS', DEFAULTS.ttnWindowMs),
  },
};

const keyPart = (value: string): string => encodeURIComponent(value.slice(0, 100));

const rateLimitKey = (scope: string, key: string): string =>
  `boundary-rate:${keyPart(scope)}:${keyPart(key)}`;

export const consumeRateLimit = async (
  config: Omit<RateLimitConfig, 'key'> & { key: string },
): Promise<RateLimitResult> => {
  if (!redisClient.isReady) {
    throw new RateLimitDependencyError();
  }

  const redisKey = rateLimitKey(config.scope, config.key);
  try {
    const count = await redisClient.incr(redisKey);
    if (count === 1) {
      await redisClient.pExpire(redisKey, config.windowMs);
    }

    const ttl = await redisClient.pTTL(redisKey);
    const retryAfterSeconds = Math.max(1, Math.ceil((ttl > 0 ? ttl : config.windowMs) / 1000));
    return {
      allowed: count <= config.max,
      retryAfterSeconds,
    };
  } catch {
    throw new RateLimitDependencyError();
  }
};

export const rateLimit = (config: RateLimitConfig): RequestHandler => async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const key = config.key(req);
  if (!key) {
    res.locals.ingestionReasonCode = 'DEPENDENCY_UNAVAILABLE';
    next(new BoundaryError(503, 'DEPENDENCY_UNAVAILABLE', 'Rate limiting is temporarily unavailable'));
    return;
  }

  try {
    const result = await consumeRateLimit({
      scope: config.scope,
      max: config.max,
      windowMs: config.windowMs,
      key,
    });

    if (!result.allowed) {
      res.locals.ingestionReasonCode = 'RATE_LIMITED';
      next(new BoundaryError(429, 'RATE_LIMITED', 'Too many requests', result.retryAfterSeconds));
      return;
    }

    next();
  } catch {
    res.locals.ingestionReasonCode = 'DEPENDENCY_UNAVAILABLE';
    next(new BoundaryError(503, 'DEPENDENCY_UNAVAILABLE', 'Rate limiting is temporarily unavailable'));
  }
};

export const clientAddress = (req: Request): string => {
  // Do not trust forwarded headers until the deployment topology explicitly configures a proxy.
  return req.socket.remoteAddress || 'unknown-client';
};

export const senderKey = (req: Request): string | undefined =>
  req.sender?.sourceId;
