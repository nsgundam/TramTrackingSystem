import type { Prisma } from '@prisma/client';

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
