import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';
import bcrypt from 'bcrypt';

// Get all devices
export const getDevices = async (req: Request, res: Response) => {
  try {
    const devices = await prisma.trackingSource.findMany({
      include: { vehicle: true },
      orderBy: { id: 'asc' }
    });
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
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
       res.status(404).json({ error: 'Device not found' });
       return;
    }
    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
};

// Create new device
export const createDevice = async (req: Request, res: Response) => {
  try {
    const { id, name, type, vehicleId, priority, status, secret } = req.body;

    if (!id || !name || !type) {
       res.status(400).json({ error: 'Missing required fields: id, name, type' });
       return;
    }

    const existing = await prisma.trackingSource.findUnique({ where: { id } });
    if (existing) {
       res.status(409).json({ error: 'Device ID already exists' });
       return;
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
        priority: priority !== undefined ? parseInt(priority as any) : 1,
        status: status || 'active',
        secretHash
      }
    });

    res.status(201).json(device);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
};

// Update device
export const updateDevice = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, type, vehicleId, priority, status, secret } = req.body;

    const existing = await prisma.trackingSource.findUnique({ where: { id } });
    if (!existing) {
       res.status(404).json({ error: 'Device not found' });
       return;
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (vehicleId !== undefined) data.vehicleId = vehicleId || null;
    if (priority !== undefined) data.priority = parseInt(priority as any);
    if (status !== undefined) data.status = status;
    
    if (secret) {
      data.secretHash = await bcrypt.hash(secret, 12);
    }

    const updated = await prisma.trackingSource.update({
      where: { id },
      data
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
};

// Delete device
export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : undefined;
    if (!id) {
      res.status(400).json({ error: 'Invalid or missing device ID' });
      return;
    }
    const existing = await prisma.trackingSource.findUnique({ where: { id } });
    if (!existing) {
       res.status(404).json({ error: 'Device not found' });
       return;
    }

    await prisma.trackingSource.delete({ where: { id } });
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Failed to delete device' });
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
    console.error('Error fetching device analytics:', error);
    res.status(500).json({ error: 'Failed to fetch device analytics' });
  }
};
