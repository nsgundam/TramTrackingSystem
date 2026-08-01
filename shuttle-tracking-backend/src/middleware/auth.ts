import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { hasMinimumRole, isAdminRole, type AdminRole } from '../services/admin-role.service.js';

export interface SenderContext {
  sourceId: string;
  vehicleId: string;
  credentialVersion: number;
}

export interface AdminPrincipal {
  id: string;
  username: string;
  role: AdminRole;
  reauthenticatedAt: number;
}

export const RECENT_REAUTHENTICATION_WINDOW_SECONDS = 15 * 60;

export class SenderAuthDependencyError extends Error {
  constructor(message = 'Sender authentication dependency unavailable') {
    super(message);
    this.name = 'SenderAuthDependencyError';
  }
}

const getJwtSecret = (): string => {
  if (!process.env.JWT_SECRET) {
    throw new SenderAuthDependencyError('JWT_SECRET is not configured');
  }

  return process.env.JWT_SECRET;
};

export const extractBearerToken = (authorization?: string): string | null => {
  if (!authorization) return null;

  const [scheme, token] = authorization.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;

  return token;
};

export const parseSenderClaims = (token: string): SenderContext => {
  const decoded = jwt.verify(token, getJwtSecret());

  if (typeof decoded !== 'object' || decoded === null || decoded.kind !== 'sender') {
    throw new Error('Invalid sender token type');
  }

  const { sourceId, vehicleId, credentialVersion } = decoded as jwt.JwtPayload & {
    sourceId?: unknown;
    vehicleId?: unknown;
    credentialVersion?: unknown;
  };

  if (
    typeof sourceId !== 'string' ||
    typeof vehicleId !== 'string' ||
    typeof credentialVersion !== 'number' ||
    !Number.isInteger(credentialVersion) ||
    credentialVersion < 1
  ) {
    throw new Error('Invalid sender token claims');
  }

  return {
    sourceId,
    vehicleId,
    credentialVersion,
  };
};

export const getSenderFromToken = async (token: string): Promise<SenderContext> => {
  const claims = parseSenderClaims(token);
  let source;
  try {
    source = await prisma.trackingSource.findUnique({
      where: { id: claims.sourceId },
      select: {
        id: true,
        vehicleId: true,
        type: true,
        status: true,
        credentialVersion: true,
      },
    });
  } catch {
    throw new SenderAuthDependencyError();
  }

  if (
    !source ||
    source.status !== 'active' ||
    source.type === 'lorawan' ||
    !source.vehicleId ||
    source.vehicleId !== claims.vehicleId ||
    source.credentialVersion !== claims.credentialVersion
  ) {
    throw new Error('Sender credential is inactive or no longer valid');
  }

  return claims;
};

export const isAdminClaims = (
  user: unknown,
): user is jwt.JwtPayload & { userId: string } => {
  if (typeof user !== 'object' || user === null) {
    return false;
  }

  const claims = user as jwt.JwtPayload & { kind?: unknown; userId?: unknown };
  return claims.kind !== 'sender' && typeof claims.userId === 'string' && claims.userId.length > 0;
};

const reauthenticatedAtFromClaims = (claims: jwt.JwtPayload): number | null => {
  const value = claims.reauthenticatedAt;
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
};

export const isRecentReauthentication = (
  reauthenticatedAt: number,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean =>
  Number.isSafeInteger(reauthenticatedAt)
  && reauthenticatedAt > 0
  && reauthenticatedAt <= nowSeconds
  && nowSeconds - reauthenticatedAt <= RECENT_REAUTHENTICATION_WINDOW_SECONDS;

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ code: 'AUTHENTICATION_FAILED', error: 'Authentication required' });
    return;
  }
  if (!process.env.JWT_SECRET) {
    res.status(503).json({ code: 'DEPENDENCY_UNAVAILABLE', error: 'Authentication is temporarily unavailable' });
    return;
  }

  let claims: jwt.JwtPayload;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!isAdminClaims(decoded)) {
      throw new Error('Invalid administrative token');
    }
    claims = decoded;
  } catch {
    res.status(401).json({ code: 'AUTHENTICATION_FAILED', error: 'Invalid authentication' });
    return;
  }

  const reauthenticatedAt = reauthenticatedAtFromClaims(claims);
  if (!reauthenticatedAt) {
    res.status(401).json({ code: 'AUTHENTICATION_FAILED', error: 'Invalid authentication' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: claims.userId },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      res.status(401).json({ code: 'AUTHENTICATION_FAILED', error: 'Invalid authentication' });
      return;
    }
    if (!isAdminRole(user.role)) {
      res.status(403).json({ code: 'AUTHORIZATION_FAILED', error: 'Authorization denied' });
      return;
    }

    req.user = claims;
    req.admin = {
      id: user.id,
      username: user.username,
      role: user.role,
      reauthenticatedAt,
    };
    next();
  } catch {
    res.status(503).json({ code: 'DEPENDENCY_UNAVAILABLE', error: 'Authentication is temporarily unavailable' });
  }
};

export const requireMinimumRole = (minimum: AdminRole) => (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.admin || !hasMinimumRole(req.admin.role, minimum)) {
    res.status(403).json({ code: 'AUTHORIZATION_FAILED', error: 'Authorization denied' });
    return;
  }
  next();
};

export const requireRecentReauthentication = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.admin || !isRecentReauthentication(req.admin.reauthenticatedAt)) {
    res.status(403).json({
      code: 'RECENT_REAUTHENTICATION_REQUIRED',
      error: 'Recent authentication is required',
    });
    return;
  }
  next();
};

export const authenticateSenderToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.locals.ingestionReasonCode = 'SENDER_AUTH_REQUIRED';
    res.status(401).json({ code: 'SENDER_AUTH_REQUIRED', error: 'Sender authentication required' });
    return;
  }

  try {
    req.sender = await getSenderFromToken(token);
    next();
  } catch (error) {
    if (error instanceof SenderAuthDependencyError) {
      res.locals.ingestionReasonCode = 'DEPENDENCY_UNAVAILABLE';
      res.status(503).json({ code: 'DEPENDENCY_UNAVAILABLE', error: 'Sender authentication temporarily unavailable' });
      return;
    }

    res.locals.ingestionReasonCode = 'SENDER_CREDENTIAL_INVALID';
    res.status(401).json({ code: 'SENDER_CREDENTIAL_INVALID', error: 'Invalid or inactive sender credential' });
  }
};
