import type { Response } from 'express';
import { Prisma } from '@prisma/client';

export type BoundaryErrorCode =
  | 'INVALID_REQUEST'
  | 'REQUEST_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'AUTHENTICATION_FAILED'
  | 'SENDER_AUTH_REQUIRED'
  | 'SENDER_CREDENTIAL_INVALID'
  | 'SENDER_OWNERSHIP_MISMATCH'
  | 'TRIP_OWNERSHIP_MISMATCH'
  | 'SOURCE_NOT_FOUND'
  | 'SOURCE_TYPE_MISMATCH'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_REQUEST'
  | 'INTERNAL_ERROR';

export class BoundaryError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: BoundaryErrorCode,
    message: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'BoundaryError';
  }
}

export const invalidRequest = (message = 'Request payload is invalid'): BoundaryError =>
  new BoundaryError(400, 'INVALID_REQUEST', message);

export const notFound = (message = 'Requested resource was not found'): BoundaryError =>
  new BoundaryError(404, 'NOT_FOUND', message);

export const conflict = (message = 'Request conflicts with the current state'): BoundaryError =>
  new BoundaryError(409, 'CONFLICT', message);

export const unprocessableRequest = (
  message = 'Request cannot be processed',
): BoundaryError => new BoundaryError(422, 'UNPROCESSABLE_REQUEST', message);

const isPrismaKnownError = (
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError;

export const mapBoundaryError = (
  error: unknown,
  fallback: BoundaryError = new BoundaryError(500, 'INTERNAL_ERROR', 'Internal server error'),
): BoundaryError => {
  if (error instanceof BoundaryError) {
    return error;
  }

  if (isPrismaKnownError(error)) {
    switch (error.code) {
      case 'P2001':
      case 'P2025':
        return notFound();
      case 'P2002':
        return conflict();
      case 'P2003':
      case 'P2000':
      case 'P2004':
      case 'P2005':
      case 'P2006':
      case 'P2011':
      case 'P2012':
      case 'P2013':
        return unprocessableRequest();
      default:
        return fallback;
    }
  }

  return fallback;
};

export const sendBoundaryError = (
  res: Response,
  error: unknown,
  fallback?: BoundaryError,
): void => {
  const mapped = mapBoundaryError(error, fallback);

  if (mapped.code === 'RATE_LIMITED') {
    res.setHeader('Retry-After', String(mapped.retryAfterSeconds ?? 1));
  }

  res.status(mapped.status).json({
    code: mapped.code,
    error: mapped.message,
  });
};

/**
 * Logs only a stable category. Error messages may contain database values, request data,
 * connection details, or other material that must not enter application logs.
 */
export const logBoundaryFailure = (scope: string, error: unknown): void => {
  const category = error instanceof BoundaryError
    ? error.code
    : error instanceof Prisma.PrismaClientKnownRequestError
      ? error.code
      : error instanceof Error
        ? error.name
        : 'UNKNOWN_ERROR';

  console.error(`[${scope}] request failed (${category})`);
};
