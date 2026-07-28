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

const SENDER_JWT_EXPIRES_IN = (
  process.env.SENDER_JWT_EXPIRES_IN || '15m'
) as SignOptions['expiresIn'];

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

    if (!process.env.JWT_SECRET) {
      throw new Error("FATAL: JWT_SECRET environment variable is not defined");
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });


  } catch (error) {
    logBoundaryFailure('Admin login', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Login failed'));
  }
};

export const getme = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.user;

    const user = await prisma.user.findUnique({
      where: { id: (userData as any).userId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    logBoundaryFailure('Auth me', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch user data'));
  }
}

export const loginVehicle = async (req: Request, res: Response) => {
  try {
    const { sourceId, secret, vehicleId } = req.body as SenderLoginInput;

    const source = await prisma.trackingSource.findUnique({
      where: { id: sourceId },
      include: { vehicle: true },
    });

    if (!source || source.status !== 'active' || source.type === 'lorawan' || !source.vehicle) {
      throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Invalid sender credentials');
    }

    if (!source.secretHash || !(await bcrypt.compare(secret, source.secretHash))) {
      throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Invalid sender credentials');
    }

    if (vehicleId && vehicleId !== source.vehicle.id) {
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
        vehicleId: source.vehicle.id,
        credentialVersion: source.credentialVersion,
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
        vehicleId: source.vehicle.id,
      },
    });

  } catch (error) {
    logBoundaryFailure('Sender login', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Authentication failed'));
  }
};
