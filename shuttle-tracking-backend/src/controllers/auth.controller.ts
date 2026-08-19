import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import {
  BoundaryError,
  logBoundaryFailure,
  sendBoundaryError,
} from '../middleware/boundary-errors.js';
import type { AdminLoginInput, SenderLoginInput } from '../middleware/validation.js';
import type { AdminReauthenticationInput } from '../middleware/validation.js';
import { isAdminRole, type AdminRole } from '../services/admin-role.service.js';
import type { AdminPrincipal } from '../middleware/auth.js';
import { findActiveAssignment } from '../services/tracking-assignment.service.js';

const SENDER_JWT_EXPIRES_IN = (
  process.env.SENDER_JWT_EXPIRES_IN || '15m'
) as SignOptions['expiresIn'];

const ADMIN_JWT_EXPIRES_IN = '1d' as SignOptions['expiresIn'];

const createAdminToken = (user: { id: string; username: string }, reauthenticatedAt: number): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(
    { userId: user.id, username: user.username, reauthenticatedAt },
    process.env.JWT_SECRET,
    { expiresIn: ADMIN_JWT_EXPIRES_IN },
  );
};

const publicAdminUser = (user: { id: string; username: string; role: AdminRole }) => ({
  id: user.id,
  username: user.username,
  role: user.role,
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as AdminLoginInput;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Invalid credentials');
    }

    const role = user.role;
    if (!isAdminRole(role)) {
      throw new BoundaryError(403, 'AUTHORIZATION_FAILED', 'Authorization denied');
    }

    const token = createAdminToken(user, Math.floor(Date.now() / 1000));

    res.json({ token, user: publicAdminUser({ id: user.id, username: user.username, role }) });


  } catch (error) {
    logBoundaryFailure('Admin login', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Login failed'));
  }
};

export const getme = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = req.admin;
    if (!admin) {
      res.status(401).json({ code: 'AUTHENTICATION_FAILED', error: 'Authentication required' });
      return;
    }

    res.json({ user: publicAdminUser(admin) });
  } catch (error) {
    logBoundaryFailure('Auth me', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch user data'));
  }
}

export const reauthenticate = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = req.admin as AdminPrincipal | undefined;
    const { password } = req.body as AdminReauthenticationInput;
    if (!admin) {
      throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: admin.id },
      select: { id: true, username: true, passwordHash: true, role: true },
    });
    const role = user?.role;
    if (!user || !isAdminRole(role) || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Invalid credentials');
    }

    const token = createAdminToken(user, Math.floor(Date.now() / 1000));
    res.json({ token, user: publicAdminUser({ id: user.id, username: user.username, role }) });
  } catch (error) {
    logBoundaryFailure('Admin reauthentication', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Reauthentication failed'));
  }
};

export const loginVehicle = async (req: Request, res: Response) => {
  try {
    const { sourceId, secret, vehicleId } = req.body as SenderLoginInput;

    const source = await prisma.trackingSource.findUnique({
      where: { id: sourceId },
    });
    const assignment = await findActiveAssignment(sourceId);

    if (!source || source.status !== 'active' || source.type === 'lorawan') {
      throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Invalid sender credentials');
    }

    if (!source.secretHash || !(await bcrypt.compare(secret, source.secretHash))) {
      throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Invalid sender credentials');
    }

    if (vehicleId && (!assignment || vehicleId !== assignment.vehicleId)) {
      throw new BoundaryError(403, 'SENDER_OWNERSHIP_MISMATCH', 'Sender is not assigned to this vehicle');
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ success: false, message: 'Authentication is not configured' });
      return;
    }

    const token = jwt.sign(
      {
        kind: 'sender',
        sourceId: source.id,
        credentialVersion: source.credentialVersion,
        assignmentId: assignment?.id ?? null,
      },
      process.env.JWT_SECRET,
      { expiresIn: SENDER_JWT_EXPIRES_IN },
    );

    res.json({
      success: true,
      message: 'Sender authenticated',
      token,
      expiresIn: SENDER_JWT_EXPIRES_IN,
      source: {
        id: source.id,
        type: source.type,
        vehicleId: assignment?.vehicleId ?? null,
      },
    });

  } catch (error) {
    logBoundaryFailure('Sender login', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Authentication failed'));
  }
};
