import type { Prisma } from '@prisma/client';
import { getSourceHealth, type SourceHealth } from '../services/tracking.service.js';

export type DeviceRecord = Prisma.TrackingSourceGetPayload<{
  include: { vehicle: true };
}>;

export type DeviceResponse = {
  id: string;
  name: string;
  type: string;
  vehicleId: string | null;
  priority: number;
  status: string;
  credentialVersion: number;
  credentialIssuedAt: Date | null;
  credentialRotatedAt: Date | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  vehicle: {
    id: string;
    name: string;
    type: string;
    assignedRouteId: string | null;
    status: string;
    createdAt: Date;
  } | null;
};

export type CredentialAction = {
  action: 'provisioned' | 'rotated' | 'unchanged';
  version: number;
};

export type DeviceMutationResponse = DeviceResponse & {
  credentialAction: CredentialAction;
};

export type DeviceHealthResponse = {
  sourceType: string;
  vehicle: { id: string; name: string } | null;
  freshness: SourceHealth;
  lastSeenAt: Date | null;
  status: string;
  errorCategory: 'none' | 'never_seen' | 'stale' | 'disabled';
};

const errorCategoryForHealth = (
  freshness: SourceHealth,
): DeviceHealthResponse['errorCategory'] => freshness === 'online' ? 'none' : freshness;

export const toDeviceHealthResponse = (
  device: DeviceRecord,
  now = Date.now(),
): DeviceHealthResponse => {
  const freshness = getSourceHealth(device, now);
  return {
    sourceType: device.type,
    vehicle: device.vehicle ? { id: device.vehicle.id, name: device.vehicle.name } : null,
    freshness,
    lastSeenAt: device.lastSeenAt,
    status: device.status,
    errorCategory: errorCategoryForHealth(freshness),
  };
};

export const toDeviceResponse = (device: DeviceRecord): DeviceResponse => ({
  id: device.id,
  name: device.name,
  type: device.type,
  vehicleId: device.vehicleId,
  priority: device.priority,
  status: device.status,
  credentialVersion: device.credentialVersion,
  credentialIssuedAt: device.credentialIssuedAt,
  credentialRotatedAt: device.credentialRotatedAt,
  lastSeenAt: device.lastSeenAt,
  createdAt: device.createdAt,
  vehicle: device.vehicle
    ? {
        id: device.vehicle.id,
        name: device.vehicle.name,
        type: device.vehicle.type,
        assignedRouteId: device.vehicle.assignedRouteId,
        status: device.vehicle.status,
        createdAt: device.vehicle.createdAt,
      }
    : null,
});

export const toDeviceMutationResponse = (
  device: DeviceRecord,
  action: CredentialAction['action'],
): DeviceMutationResponse => ({
  ...toDeviceResponse(device),
  credentialAction: {
    action,
    version: device.credentialVersion,
  },
});
