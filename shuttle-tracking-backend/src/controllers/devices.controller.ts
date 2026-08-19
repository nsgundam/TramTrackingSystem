import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';
import {
  toDeviceMutationResponse,
  toDeviceHealthResponse,
  toDeviceResponse,
  type DeviceRecord,
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
import {
  assignTrackingSource,
  assignTrackingSourceInTransaction,
  getTrackingAssignmentHistory,
  invalidateTrackingSourceCache,
  unassignTrackingSource,
  unassignTrackingSourceInTransaction,
} from '../services/tracking-assignment.service.js';
import { refreshCanonicalState } from '../services/canonical-state.service.js';

const deviceInclude = {
  assignments: { include: { vehicle: true } },
} as const;

const toAssignmentResponse = (assignment: {
  id: string;
  trackingSourceId: string;
  vehicleId: string;
  assignedAt: Date;
  unassignedAt: Date | null;
  assignedById: string | null;
  unassignedById: string | null;
  method: string;
  vehicle: { id: string; name: string };
}) => ({
  id: assignment.id,
  trackingSourceId: assignment.trackingSourceId,
  vehicleId: assignment.vehicleId,
  assignedAt: assignment.assignedAt,
  unassignedAt: assignment.unassignedAt,
  assignedById: assignment.assignedById,
  unassignedById: assignment.unassignedById,
  method: assignment.method,
  vehicle: { id: assignment.vehicle.id, name: assignment.vehicle.name },
});

const loadDevice = async (id: string): Promise<DeviceRecord> => {
  const device = await prisma.trackingSource.findUnique({
    where: { id },
    include: deviceInclude,
  });
  if (!device) throw notFound('Device not found');
  return device;
};

export const getDevices = async (_req: Request, res: Response) => {
  try {
    const devices = await prisma.trackingSource.findMany({
      include: deviceInclude,
      orderBy: { id: 'asc' },
    });
    res.json(devices.map(toDeviceResponse));
  } catch (error) {
    logBoundaryFailure('Device list', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch devices'));
  }
};

export const getDeviceById = async (req: Request, res: Response) => {
  try {
    res.json(toDeviceResponse(await loadDevice(req.params.id as string)));
  } catch (error) {
    logBoundaryFailure('Device read', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch device'));
  }
};

export const getDeviceHealth = async (_req: Request, res: Response) => {
  try {
    const devices = await prisma.trackingSource.findMany({
      include: deviceInclude,
      orderBy: { id: 'asc' },
    });
    res.json(devices.map(toDeviceHealthResponse));
  } catch (error) {
    logBoundaryFailure('Device health list', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch device health'));
  }
};

export const createDevice = async (req: Request, res: Response) => {
  try {
    const { id, name, type, vehicleId, priority, status, secret } = req.body as DeviceCreateInput;
    if (status === 'active' && type !== 'lorawan' && !secret) {
      throw unprocessableRequest('Active sender sources require a credential');
    }
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } });
      if (!vehicle) throw notFound('Vehicle not found');
    }
    if (await prisma.trackingSource.findUnique({ where: { id } })) {
      throw conflict('Device ID already exists');
    }

    const now = new Date();
    const secretHash = secret ? await bcrypt.hash(secret, 12) : null;
    await prisma.$transaction(async (tx) => {
      await tx.trackingSource.create({
        data: {
          id,
          name,
          type,
          priority,
          status,
          secretHash,
          credentialIssuedAt: secret ? now : null,
        },
      });

      if (vehicleId) {
        await assignTrackingSourceInTransaction(tx, {
          sourceId: id,
          vehicleId,
          assignedById: req.admin?.id ?? null,
          method: 'admin',
        });
      }
    });
    await invalidateTrackingSourceCache(id);
    if (vehicleId) {
      await refreshCanonicalState(vehicleId).catch((error: unknown) => {
        logBoundaryFailure('Device assignment canonical refresh', error);
      });
    }

    const device = await loadDevice(id);
    res.status(201).json(toDeviceMutationResponse(device, secret ? 'provisioned' : 'unchanged'));
  } catch (error) {
    logBoundaryFailure('Device create', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to create device'));
  }
};

export const updateDevice = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, type, vehicleId, priority, status, secret } = req.body as DeviceUpdateInput;
    const existing = await prisma.trackingSource.findUnique({ where: { id } });
    if (!existing) throw notFound('Device not found');

    const effectiveType = type ?? existing.type;
    const effectiveStatus = status ?? existing.status;
    const effectiveHasCredential = secret !== undefined || Boolean(existing.secretHash);
    if (effectiveStatus === 'active' && effectiveType !== 'lorawan' && !effectiveHasCredential) {
      throw unprocessableRequest('Active sender sources require a credential');
    }

    const data: Prisma.TrackingSourceUpdateInput = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) data.status = status;
    if (secret) {
      data.secretHash = await bcrypt.hash(secret, 12);
      data.credentialVersion = { increment: 1 };
      data.credentialRotatedAt = new Date();
      if (!existing.credentialIssuedAt) data.credentialIssuedAt = new Date();
    }

    let previousVehicleId: string | null = null;
    await prisma.$transaction(async (tx) => {
      await tx.trackingSource.update({ where: { id }, data });
      if (vehicleId !== undefined) {
        if (vehicleId === null) {
          const result = await unassignTrackingSourceInTransaction(tx, {
            sourceId: id,
            assignedById: req.admin?.id ?? null,
          });
          previousVehicleId = result.previousVehicleId;
        } else {
          const result = await assignTrackingSourceInTransaction(tx, {
            sourceId: id,
            vehicleId,
            assignedById: req.admin?.id ?? null,
            method: 'admin',
          });
          previousVehicleId = result.previousVehicleId;
        }
      }
    });
    if (vehicleId !== undefined) {
      await invalidateTrackingSourceCache(id);
      await Promise.allSettled([
        previousVehicleId
          ? refreshCanonicalState(previousVehicleId)
          : Promise.resolve(),
        typeof vehicleId === 'string'
          ? refreshCanonicalState(vehicleId)
          : Promise.resolve(),
      ]);
    }

    const device = await loadDevice(id);
    res.json(toDeviceMutationResponse(device, secret ? 'rotated' : 'unchanged'));
  } catch (error) {
    logBoundaryFailure('Device update', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to update device'));
  }
};

export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const device = await loadDevice(id);
    if (device.assignments.length > 0) {
      throw conflict('Tracking sources with assignment history cannot be deleted; retire the source instead');
    }
    await prisma.trackingSource.delete({ where: { id } });
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    logBoundaryFailure('Device delete', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to delete device'));
  }
};

export const getDeviceAnalytics = async (_req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ select: { id: true, name: true } });
    const analytics = await Promise.all(vehicles.map(async (vehicle) => ({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      selectionCounts: await redisClient.hGetAll(`analytics:vehicle:${vehicle.id}:source_selection`),
    })));
    res.json(analytics);
  } catch (error) {
    logBoundaryFailure('Device analytics', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch device analytics'));
  }
};

export const getDeviceAssignments = async (req: Request, res: Response) => {
  try {
    const sourceId = req.params.id as string;
    await loadDevice(sourceId);
    const assignments = await getTrackingAssignmentHistory(sourceId);
    res.json(assignments.map((assignment) => ({
      id: assignment.id,
      vehicleId: assignment.vehicleId,
      assignedAt: assignment.assignedAt,
      unassignedAt: assignment.unassignedAt,
      method: assignment.method,
      assignedBy: assignment.assignedBy
        ? { id: assignment.assignedBy.id, username: assignment.assignedBy.username }
        : null,
      unassignedBy: assignment.unassignedBy
        ? { id: assignment.unassignedBy.id, username: assignment.unassignedBy.username }
        : null,
      vehicle: { id: assignment.vehicle.id, name: assignment.vehicle.name },
    })));
  } catch (error) {
    logBoundaryFailure('Device assignment history', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch assignment history'));
  }
};

export const assignDevice = async (req: Request, res: Response) => {
  try {
    const sourceId = req.params.id as string;
    const result = await assignTrackingSource({
      sourceId,
      vehicleId: req.body.vehicleId as string,
      assignedById: req.admin?.id ?? null,
      method: 'admin',
    });
    await Promise.allSettled([
      result.previousVehicleId
        ? refreshCanonicalState(result.previousVehicleId)
        : Promise.resolve(),
      refreshCanonicalState(result.assignment.vehicleId),
    ]);
    res.json({
      source: toDeviceResponse(await loadDevice(sourceId)),
      assignment: toAssignmentResponse(result.assignment),
    });
  } catch (error) {
    logBoundaryFailure('Device assignment', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to assign tracking source'));
  }
};

export const unassignDevice = async (req: Request, res: Response) => {
  try {
    const sourceId = req.params.id as string;
    const result = await unassignTrackingSource({ sourceId, assignedById: req.admin?.id ?? null });
    if (result.previousVehicleId) await refreshCanonicalState(result.previousVehicleId);
    res.json({ source: toDeviceResponse(await loadDevice(sourceId)), previousVehicleId: result.previousVehicleId });
  } catch (error) {
    logBoundaryFailure('Device unassignment', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to unassign tracking source'));
  }
};
