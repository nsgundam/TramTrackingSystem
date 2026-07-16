import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

const SENDER_JWT_EXPIRES_IN = (
  process.env.SENDER_JWT_EXPIRES_IN || '15m'
) as SignOptions['expiresIn'];

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid password' });
      return;
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
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
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
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}

export const loginVehicle = async (req: Request, res: Response) => {
  try {
    const { sourceId, secret, vehicleId } = req.body;

    if (!sourceId || !secret) {
      return res.status(400).json({
        success: false,
        message: 'sourceId and secret are required',
      });
    }

    const source = await prisma.trackingSource.findUnique({
      where: { id: sourceId },
      include: { vehicle: true },
    });

    if (!source || source.status !== 'active' || source.type === 'lorawan' || !source.vehicle) {
      return res.status(401).json({ success: false, message: 'Invalid sender credentials' });
    }

    if (!source.secretHash || !(await bcrypt.compare(secret, source.secretHash))) {
      return res.status(401).json({ success: false, message: 'Invalid sender credentials' });
    }

    if (vehicleId && vehicleId !== source.vehicle.id) {
      return res.status(403).json({ success: false, message: 'Sender is not assigned to this vehicle' });
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
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
