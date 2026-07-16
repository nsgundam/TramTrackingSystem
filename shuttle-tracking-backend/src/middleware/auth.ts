import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export interface SenderContext {
  sourceId: string;
  vehicleId: string;
  credentialVersion: number;
}

const getJwtSecret = (): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
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
  const source = await prisma.trackingSource.findUnique({
    where: { id: claims.sourceId },
    select: {
      id: true,
      vehicleId: true,
      type: true,
      status: true,
      credentialVersion: true,
    },
  });

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

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied (No token)' });
    return;
  }
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }

    req.user = user;
    next();
  });
};

export const authenticateSenderToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ error: 'Sender authentication required' });
    return;
  }

  try {
    req.sender = await getSenderFromToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or inactive sender credential' });
  }
};
