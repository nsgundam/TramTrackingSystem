import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { BoundaryError, invalidRequest } from './boundary-errors.js';

const ID_MAX_LENGTH = 50;
const SECRET_MAX_LENGTH = 256;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STRICT_NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

export type TrackingSourceType = 'mobile' | 'lorawan' | 'esp32' | 'simulator';
export type TrackingSourceStatus = 'provisioning' | 'active' | 'inactive' | 'retired';

export interface AdminLoginInput {
  username: string;
  password: string;
}

export interface SenderLoginInput {
  sourceId: string;
  secret: string;
  vehicleId?: string;
}

export interface FeedbackInput {
  type: string;
  vehicleId: string;
  message: string;
}

export interface DeviceCreateInput {
  id: string;
  name: string;
  type: TrackingSourceType;
  vehicleId?: string | null;
  priority: number;
  status: TrackingSourceStatus;
  secret?: string;
}

export interface DeviceUpdateInput {
  name?: string;
  type?: TrackingSourceType;
  vehicleId?: string | null;
  priority?: number;
  status?: TrackingSourceStatus;
  secret?: string;
}

export interface RouteStopCreateInput {
  routeId: string;
  stopId: string;
  stopOrder: number;
}

export interface TripStartInput {
  vehicleId: string;
}

export interface ObservationInput {
  sourceId: string;
  vehicleId?: string;
  tripId?: string;
  lat: number;
  lng: number;
  speed?: number;
  bearing?: number;
  accuracy?: number;
  station?: string;
}

const record = (value: unknown, message = 'Request payload must be a JSON object'): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw invalidRequest(message);
  }
  return value as Record<string, unknown>;
};

const stringField = (
  value: unknown,
  field: string,
  options: { max: number; trim?: boolean; allowEmpty?: boolean } = { max: ID_MAX_LENGTH },
): string => {
  if (typeof value !== 'string') {
    throw invalidRequest(`Field "${field}" is invalid`);
  }

  const candidate = options.trim === false ? value : value.trim();
  if ((!options.allowEmpty && candidate.length === 0) || candidate.length > options.max) {
    throw invalidRequest(`Field "${field}" is invalid`);
  }

  return options.trim === false ? value : candidate;
};

const optionalStringField = (
  value: unknown,
  field: string,
  options: { max: number; trim?: boolean } = { max: ID_MAX_LENGTH },
): string | undefined => {
  if (value === undefined) return undefined;
  return stringField(value, field, options);
};

const nullableStringField = (
  value: unknown,
  field: string,
  max = ID_MAX_LENGTH,
): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return stringField(value, field, { max });
};

const numberField = (
  value: unknown,
  field: string,
  bounds?: { min?: number; max?: number },
): number => {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && STRICT_NUMBER_PATTERN.test(value.trim())
      ? Number(value)
      : Number.NaN;

  if (!Number.isFinite(parsed)) {
    throw invalidRequest(`Field "${field}" is invalid`);
  }
  if (bounds?.min !== undefined && parsed < bounds.min) {
    throw invalidRequest(`Field "${field}" is invalid`);
  }
  if (bounds?.max !== undefined && parsed > bounds.max) {
    throw invalidRequest(`Field "${field}" is invalid`);
  }

  return parsed;
};

const optionalNumberField = (
  value: unknown,
  field: string,
  bounds?: { min?: number; max?: number },
): number | undefined => value === undefined || value === null
  ? undefined
  : numberField(value, field, bounds);

const integerField = (
  value: unknown,
  field: string,
  bounds: { min?: number; max?: number },
): number => {
  const parsed = numberField(value, field, bounds);
  if (!Number.isInteger(parsed)) {
    throw invalidRequest(`Field "${field}" must be an integer`);
  }
  return parsed;
};

const optionalUuidField = (value: unknown, field: string): string | undefined => {
  const parsed = optionalStringField(value, field, { max: 36 });
  if (parsed !== undefined && !UUID_PATTERN.test(parsed)) {
    throw invalidRequest(`Field "${field}" is invalid`);
  }
  return parsed;
};

const enumField = <T extends string>(value: unknown, field: string, values: readonly T[]): T => {
  const parsed = stringField(value, field, { max: 50 });
  if (!values.includes(parsed as T)) {
    throw invalidRequest(`Field "${field}" is invalid`);
  }
  return parsed as T;
};

const ensureNoSecretFields = (value: unknown, field: string): string =>
  stringField(value, field, { max: SECRET_MAX_LENGTH, trim: false });

export const parseAdminLogin = (value: unknown): AdminLoginInput => {
  const input = record(value);
  return {
    username: stringField(input.username, 'username', { max: 50 }),
    password: ensureNoSecretFields(input.password, 'password'),
  };
};

export const parseSenderLogin = (value: unknown): SenderLoginInput => {
  const input = record(value);
  const vehicleId = optionalStringField(input.vehicleId, 'vehicleId');
  return {
    sourceId: stringField(input.sourceId, 'sourceId'),
    secret: ensureNoSecretFields(input.secret, 'secret'),
    ...(vehicleId === undefined ? {} : { vehicleId }),
  };
};

export const parseFeedback = (value: unknown): FeedbackInput => {
  const input = record(value);
  return {
    type: stringField(input.type, 'type', { max: 50 }),
    vehicleId: stringField(input.vehicleId, 'vehicleId'),
    message: stringField(input.message, 'message', { max: 2000 }),
  };
};

export const parseDeviceCreate = (value: unknown): DeviceCreateInput => {
  const input = record(value);
  const vehicleId = nullableStringField(input.vehicleId, 'vehicleId');
  const secret = input.secret === undefined ? undefined : ensureNoSecretFields(input.secret, 'secret');
  return {
    id: stringField(input.id, 'id'),
    name: stringField(input.name, 'name', { max: 255 }),
    type: enumField(input.type, 'type', ['mobile', 'lorawan', 'esp32', 'simulator'] as const),
    vehicleId,
    priority: input.priority === undefined ? 1 : integerField(input.priority, 'priority', { min: 1, max: 100 }),
    status: input.status === undefined
      ? 'active'
      : enumField(input.status, 'status', ['provisioning', 'active', 'inactive', 'retired'] as const),
    ...(secret === undefined ? {} : { secret }),
  };
};

export const parseDeviceUpdate = (value: unknown): DeviceUpdateInput => {
  const input = record(value);
  const output: DeviceUpdateInput = {};

  if (Object.hasOwn(input, 'name')) output.name = stringField(input.name, 'name', { max: 255 });
  if (Object.hasOwn(input, 'type')) output.type = enumField(input.type, 'type', ['mobile', 'lorawan', 'esp32', 'simulator'] as const);
  if (Object.hasOwn(input, 'vehicleId')) output.vehicleId = nullableStringField(input.vehicleId, 'vehicleId');
  if (Object.hasOwn(input, 'priority')) output.priority = integerField(input.priority, 'priority', { min: 1, max: 100 });
  if (Object.hasOwn(input, 'status')) output.status = enumField(input.status, 'status', ['provisioning', 'active', 'inactive', 'retired'] as const);
  if (Object.hasOwn(input, 'secret')) output.secret = ensureNoSecretFields(input.secret, 'secret');

  if (Object.keys(output).length === 0) {
    throw invalidRequest('At least one device field is required');
  }

  return output;
};

export const parseRouteStopCreate = (value: unknown): RouteStopCreateInput => {
  const input = record(value);
  return {
    routeId: stringField(input.routeId, 'routeId'),
    stopId: stringField(input.stopId, 'stopId'),
    stopOrder: integerField(input.stopOrder, 'stopOrder', { min: 1, max: 1000 }),
  };
};

export const parseTripStart = (value: unknown): TripStartInput => {
  const input = record(value);
  return { vehicleId: stringField(input.vehicleId, 'vehicleId') };
};

export const parseTripId = (value: unknown, field = 'id'): string => {
  const parsed = stringField(value, field, { max: 36 });
  if (!UUID_PATTERN.test(parsed)) {
    throw invalidRequest(`Field "${field}" is invalid`);
  }
  return parsed;
};

export const parseBoundedId = (value: unknown, field = 'id'): string =>
  stringField(value, field);

export const parseObservation = (value: unknown): ObservationInput => {
  const input = record(value);
  const vehicleId = optionalStringField(input.vehicleId, 'vehicleId');
  const tripId = optionalUuidField(input.tripId, 'tripId');
  const bearing = input.bearing !== undefined
    ? optionalNumberField(input.bearing, 'bearing', { min: 0, max: 360 })
    : optionalNumberField(input.heading, 'heading', { min: 0, max: 360 });

  return {
    sourceId: stringField(input.sourceId, 'sourceId'),
    ...(vehicleId === undefined ? {} : { vehicleId }),
    ...(tripId === undefined ? {} : { tripId }),
    lat: numberField(input.lat, 'lat', { min: -90, max: 90 }),
    lng: numberField(input.lng, 'lng', { min: -180, max: 180 }),
    ...(optionalNumberField(input.speed, 'speed', { min: 0, max: 999.99 }) === undefined
      ? {}
      : { speed: optionalNumberField(input.speed, 'speed', { min: 0, max: 999.99 }) }),
    ...(bearing === undefined ? {} : { bearing }),
    ...(optionalNumberField(input.accuracy, 'accuracy', { min: 0, max: 100000 }) === undefined
      ? {}
      : { accuracy: optionalNumberField(input.accuracy, 'accuracy', { min: 0, max: 100000 }) }),
    ...(input.station === undefined || input.station === null
      ? {}
      : { station: stringField(input.station, 'station', { max: 255 }) }),
  };
};

export const parseTtnPayload = (value: unknown): Record<string, unknown> => record(value, 'TTN payload must be a JSON object');

export const parseTtnSourceId = (payload: Record<string, unknown>): string => {
  const endDeviceIds = record(payload.end_device_ids, 'TTN device identity is invalid');
  return stringField(endDeviceIds.device_id, 'device_id');
};

export const parseTtnObservation = (input: Omit<ObservationInput, 'vehicleId' | 'tripId'>): Omit<ObservationInput, 'vehicleId' | 'tripId'> => {
  const parsed = parseObservation(input);
  return {
    sourceId: parsed.sourceId,
    lat: parsed.lat,
    lng: parsed.lng,
    ...(parsed.speed === undefined ? {} : { speed: parsed.speed }),
    ...(parsed.bearing === undefined ? {} : { bearing: parsed.bearing }),
    ...(parsed.accuracy === undefined ? {} : { accuracy: parsed.accuracy }),
    ...(parsed.station === undefined ? {} : { station: parsed.station }),
  };
};

export type BoundarySchema<T> = (value: unknown) => T;

export const validateBody = <T>(schema: BoundarySchema<T>): RequestHandler => (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    req.body = schema(req.body);
    next();
  } catch (error) {
    next(error instanceof BoundaryError ? error : invalidRequest());
  }
};

export const validateParam = (name: string, parser: (value: unknown) => string): RequestHandler => (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    req.params[name] = parser(req.params[name]);
    next();
  } catch (error) {
    next(error instanceof BoundaryError ? error : invalidRequest());
  }
};
