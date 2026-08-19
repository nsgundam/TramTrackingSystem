import type { Prisma } from '@prisma/client';
import { getSourceHealth, type SourceHealth } from '../services/tracking.service.js';

export type DeviceRecord = Prisma.TrackingSourceGetPayload<{
  include: { assignments: { include: { vehicle: true } } };
}>;

export type DeviceAssignmentResponse = {
  id: string;
  vehicleId: string;
  assignedAt: Date;
  unassignedAt: Date | null;
  method: string;
  vehicle: { id: string; name: string };
};

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
  lastTelemetryAt: Date | null;
  createdAt: Date;
  vehicle: {
    id: string;
    name: string;
    type: string;
    assignedRouteId: string | null;
    status: string;
    createdAt: Date;
  } | null;
  activeAssignment: DeviceAssignmentResponse | null;
};

export type CredentialAction = {
  action: 'provisioned' | 'rotated' | 'unchanged';
  version: number;
};

export type DeviceMutationResponse = DeviceResponse & {
  credentialAction: CredentialAction;
};

export type DeviceHealthResponse = {
  sourceId: string;
  sourceType: string;
  vehicle: { id: string; name: string } | null;
  freshness: SourceHealth;
  lastTelemetryAt: Date | null;
  status: string;
  errorCategory: 'none' | 'stale' | 'offline' | 'disabled';
};

const activeAssignmentFor = (device: DeviceRecord) =>
  device.assignments.find((assignment) => assignment.unassignedAt === null) ?? null;

const errorCategoryForHealth = (
  freshness: SourceHealth,
): DeviceHealthResponse['errorCategory'] => freshness === 'online' ? 'none' : freshness;

export const toDeviceHealthResponse = (
  device: DeviceRecord,
  now = Date.now(),
): DeviceHealthResponse => {
  const freshness = getSourceHealth(device, now);
  const assignment = activeAssignmentFor(device);
  return {
    sourceId: device.id,
    sourceType: device.type,
    vehicle: assignment ? { id: assignment.vehicle.id, name: assignment.vehicle.name } : null,
    freshness,
    lastTelemetryAt: device.lastTelemetryAt,
    status: device.status,
    errorCategory: errorCategoryForHealth(freshness),
  };
};

export const toDeviceResponse = (device: DeviceRecord): DeviceResponse => {
  const assignment = activeAssignmentFor(device);
  return {
    id: device.id,
    name: device.name,
    type: device.type,
    vehicleId: assignment?.vehicleId ?? null,
    priority: device.priority,
    status: device.status,
    credentialVersion: device.credentialVersion,
    credentialIssuedAt: device.credentialIssuedAt,
    credentialRotatedAt: device.credentialRotatedAt,
    lastTelemetryAt: device.lastTelemetryAt,
    createdAt: device.createdAt,
    vehicle: assignment
      ? {
          id: assignment.vehicle.id,
          name: assignment.vehicle.name,
          type: assignment.vehicle.type,
          assignedRouteId: assignment.vehicle.assignedRouteId,
          status: assignment.vehicle.status,
          createdAt: assignment.vehicle.createdAt,
        }
      : null,
    activeAssignment: assignment
      ? {
          id: assignment.id,
          vehicleId: assignment.vehicleId,
          assignedAt: assignment.assignedAt,
          unassignedAt: assignment.unassignedAt,
          method: assignment.method,
          vehicle: { id: assignment.vehicle.id, name: assignment.vehicle.name },
        }
      : null,
  };
};

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
