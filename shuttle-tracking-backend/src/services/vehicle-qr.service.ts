import { createHmac, timingSafeEqual } from 'node:crypto';

const QR_VERSION = 'v1';

const qrSecret = (): string => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return process.env.JWT_SECRET;
};

const encode = (value: string): string => Buffer.from(value, 'utf8').toString('base64url');
const decode = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

const signatureFor = (vehicleId: string): string => createHmac('sha256', qrSecret())
  .update(`${QR_VERSION}:${vehicleId}`)
  .digest('base64url');

export const createVehicleQrToken = (vehicleId: string): string =>
  `${QR_VERSION}.${encode(vehicleId)}.${signatureFor(vehicleId)}`;

export const resolveVehicleIdFromQrToken = (token: string): string | null => {
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts[0] !== QR_VERSION) return null;

  let vehicleId: string;
  try {
    vehicleId = decode(parts[1] ?? '');
  } catch {
    return null;
  }
  if (!vehicleId || vehicleId.length > 50 || !/^[A-Za-z0-9_-]+$/.test(vehicleId)) return null;

  const expected = Buffer.from(signatureFor(vehicleId));
  const provided = Buffer.from(parts[2] ?? '');
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  return vehicleId;
};

export const vehicleQrUri = (token: string): string => `tramtracking://vehicle/${token}`;
