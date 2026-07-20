import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';
import bcrypt from 'bcrypt';
import {
  toDeviceMutationResponse,
  toDeviceResponse,
} from '../types/device.js';
import {
  BoundaryError,
  conflict,
  logBoundaryFailure,
  notFound,
  sendBoundaryError,
  unprocessableRequest,
} from '../middleware/boundary-errors.js';
import type { DeviceCreateInput, DeviceUpdateInput } from '../middleware/validation.js';

// Get all devices
export const getDevices = async (req: Request, res: Response) => {
  try {
    const devices = await prisma.trackingSource.findMany({
      include: { vehicle: true },
      orderBy: { id: 'asc' }
    });
    res.json(devices.map(toDeviceResponse));
  } catch (error) {
    logBoundaryFailure('Device list', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch devices'));
  }
};

// Get device by ID
export const getDeviceById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const device = await prisma.trackingSource.findUnique({
      where: { id },
      include: { vehicle: true }
    });
    if (!device) {
       throw notFound('Device not found');
    }
    res.json(toDeviceResponse(device));
  } catch (error) {
    logBoundaryFailure('Device read', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch device'));
  }
};

// Create new device
export const createDevice = async (req: Request, res: Response) => {
  try {
    const { id, name, type, vehicleId, priority, status, secret } = req.body as DeviceCreateInput;

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } });
      if (!vehicle) throw notFound('Vehicle not found');
    }

    if (status === 'active' && type !== 'lorawan' && (!vehicleId || !secret)) {
      throw unprocessableRequest('Active sender sources require a vehicle and credential');
    }

    const existing = await prisma.trackingSource.findUnique({ where: { id } });
    if (existing) {
       throw conflict('Device ID already exists');
    }

    let secretHash = null;
    if (secret) {
      secretHash = await bcrypt.hash(secret, 12);
    }

    const device = await prisma.trackingSource.create({
      data: {
        id,
        name,
        type,
        vehicleId: vehicleId || null,
        priority,
        status,
        secretHash,
      },
      include: { vehicle: true },
    });

    res.status(201).json(
      toDeviceMutationResponse(device, secret ? 'provisioned' : 'unchanged'),
    );
  } catch (error) {
    logBoundaryFailure('Device create', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to create device'));
  }
};

// Update device
export const updateDevice = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, type, vehicleId, priority, status, secret } = req.body as DeviceUpdateInput;

    const existing = await prisma.trackingSource.findUnique({ where: { id } });
    if (!existing) {
       throw notFound('Device not found');
    }

    const effectiveType = type ?? existing.type;
    const effectiveVehicleId = vehicleId === undefined ? existing.vehicleId : vehicleId;
    const effectiveStatus = status ?? existing.status;
    const effectiveHasCredential = secret !== undefined || Boolean(existing.secretHash);

    if (effectiveVehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: effectiveVehicleId }, select: { id: true } });
      if (!vehicle) throw notFound('Vehicle not found');
    }

    if (effectiveStatus === 'active' && effectiveType !== 'lorawan' && (!effectiveVehicleId || !effectiveHasCredential)) {
      throw unprocessableRequest('Active sender sources require a vehicle and credential');
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (vehicleId !== undefined) data.vehicleId = vehicleId;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) data.status = status;
    
    if (secret) {
      data.secretHash = await bcrypt.hash(secret, 12);
      data.credentialVersion = { increment: 1 };
      data.credentialRotatedAt = new Date();
      if (!existing.credentialIssuedAt) {
        data.credentialIssuedAt = new Date();
      }
    }

    const updated = await prisma.trackingSource.update({
      where: { id },
      data,
      include: { vehicle: true },
    });

    res.json(toDeviceMutationResponse(updated, secret ? 'rotated' : 'unchanged'));
  } catch (error) {
    logBoundaryFailure('Device update', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to update device'));
  }
};

// Delete device
export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : undefined;
    if (!id) {
      res.status(400).json({ code: 'INVALID_REQUEST', error: 'Invalid or missing device ID' });
      return;
    }
    const existing = await prisma.trackingSource.findUnique({ where: { id } });
    if (!existing) {
       throw notFound('Device not found');
    }

    await prisma.trackingSource.delete({ where: { id } });
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    logBoundaryFailure('Device delete', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to delete device'));
  }
};

// Get device selection analytics for developers
export const getDeviceAnalytics = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: { id: true, name: true }
    });

    const analytics = [];
    for (const vehicle of vehicles) {
      const stats = await redisClient.hGetAll(`analytics:vehicle:${vehicle.id}:source_selection`);
      analytics.push({
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        selectionCounts: stats || {}
      });
    }

    res.json(analytics);
  } catch (error) {
    logBoundaryFailure('Device analytics', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch device analytics'));
  }
};
