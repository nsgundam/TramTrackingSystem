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

export interface AdminReauthenticationInput {
  password: string;
}

export interface SenderLoginInput {
  sourceId: string;
  secret: string;
  vehicleId?: string;
}

export interface FeedbackInput {
  type: string;
  vehicleId: string | null;
  message: string;
}

export type FeedbackCaseStatus = 'acknowledged' | 'investigating' | 'resolved' | 'duplicate' | 'rejected';

export interface FeedbackCaseUpdateInput {
  status?: FeedbackCaseStatus;
  internalNote?: string;
}

export type FeedbackDeleteReason =
  | 'privacy_request'
  | 'duplicate_submission'
  | 'abusive_content'
  | 'policy_violation'
  | 'administrative_error';

export interface FeedbackDeleteInput {
  reason: FeedbackDeleteReason;
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

export interface DeviceAssignmentInput {
  vehicleId: string;
}

export interface MobileQrAssignmentInput {
  qrToken: string;
}

export interface RouteStopCreateInput {
  routeId: string;
  stopId: string;
  stopOrder: number;
}

export interface RouteStopReplaceInput {
  stopIds: string[];
}

export type VehicleStatus = 'active' | 'inactive' | 'maintenance';

export interface VehicleCreateInput {
  id: string;
  name: string;
  type: string;
  status: VehicleStatus;
  assignedRouteId?: string | null;
}

export interface VehicleUpdateInput {
  name?: string;
  type?: string;
  status?: VehicleStatus;
  assignedRouteId?: string | null;
}

export type RouteStatus = 'active' | 'inactive';

export interface RouteCreateInput {
  id: string;
  name: string;
  color: string;
  status: RouteStatus;
}

export interface RouteUpdateInput {
  name?: string;
  color?: string;
  status?: RouteStatus;
}

export interface StopCreateInput {
  id: string;
  nameTh: string;
  nameEn?: string | null;
  lat: number;
  lng: number;
  imageUrl?: string | null;
}

/** Stop edits are full-form replacements: names and both coordinates are parsed together. */
export type StopUpdateInput = Omit<StopCreateInput, 'id'>;

export interface TripStartInput {
  vehicleId?: string;
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

export type TripHistoryStatus = 'in_progress' | 'completed' | 'aborted';

export const ADMIN_AUDIT_ACTIONS = [
  'vehicle.create', 'vehicle.update', 'vehicle.delete',
  'route.create', 'route.update', 'route.delete',
  'stop.create', 'stop.update', 'stop.delete',
  'route_stop.create', 'route_stop.replace', 'route_stop.delete',
  'device.create', 'device.update', 'device.delete', 'device.assign', 'device.unassign',
  'feedback.update', 'feedback.delete', 'feedback.restore',
] as const;
export type AdminAuditAction = typeof ADMIN_AUDIT_ACTIONS[number];

export const ADMIN_AUDIT_TARGET_TYPES = [
  'vehicle', 'route', 'stop', 'route_stop', 'tracking_source', 'feedback',
] as const;
export type AdminAuditTargetType = typeof ADMIN_AUDIT_TARGET_TYPES[number];

export const ADMIN_AUDIT_OUTCOMES = ['success', 'denied', 'failure'] as const;
export type AdminAuditOutcome = typeof ADMIN_AUDIT_OUTCOMES[number];

export interface BoundedPaginationInput {
  page: number;
  pageSize: number;
}

export interface TripHistoryListInput extends BoundedPaginationInput {
  vehicleId?: string;
  routeId?: string;
  status?: TripHistoryStatus;
  from?: Date;
  to?: Date;
}

export interface AdminHistoryListInput extends BoundedPaginationInput {
  action?: AdminAuditAction;
  targetType?: AdminAuditTargetType;
  outcome?: AdminAuditOutcome;
  actor?: string;
  from?: Date;
  to?: Date;
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

const optionalNullableStringField = (
  value: unknown,
  field: string,
  max = ID_MAX_LENGTH,
): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' && value.trim().length === 0) return null;
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

const utcDateField = (value: unknown, field: string): Date => {
  const candidate = stringField(value, field, { max: 30 });
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(candidate)) {
    throw invalidRequest(`Field "${field}" is invalid`);
  }
  const normalized = candidate.length === 10 ? `${candidate}T00:00:00.000Z` : candidate;
  const parsed = new Date(normalized);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== candidate.slice(0, 10)) {
    throw invalidRequest(`Field "${field}" is invalid`);
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

export const parseAdminReauthentication = (value: unknown): AdminReauthenticationInput => {
  const input = record(value);
  return { password: ensureNoSecretFields(input.password, 'password') };
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
  const vehicleId = input.vehicleId === undefined || input.vehicleId === null
    ? null
    : stringField(input.vehicleId, 'vehicleId', { max: ID_MAX_LENGTH, allowEmpty: true }) || null;
  return {
    type: stringField(input.type, 'type', { max: 50 }),
    vehicleId,
    message: stringField(input.message, 'message', { max: 2000 }),
  };
};

export const parseFeedbackCaseUpdate = (value: unknown): FeedbackCaseUpdateInput => {
  const input = record(value);
  const output: FeedbackCaseUpdateInput = {};
  if (Object.hasOwn(input, 'status')) {
    output.status = enumField(
      input.status,
      'status',
      ['acknowledged', 'investigating', 'resolved', 'duplicate', 'rejected'] as const,
    );
  }
  if (Object.hasOwn(input, 'internalNote')) {
    output.internalNote = stringField(input.internalNote, 'internalNote', { max: 2000 });
  }
  if (Object.keys(output).length === 0) {
    throw invalidRequest('At least one feedback case field is required');
  }
  return output;
};

export const parseFeedbackDelete = (value: unknown): FeedbackDeleteInput => {
  const input = record(value);
  return {
    reason: enumField(
      input.reason,
      'reason',
      ['privacy_request', 'duplicate_submission', 'abusive_content', 'policy_violation', 'administrative_error'] as const,
    ),
  };
};

export const parseFeedbackId = (value: unknown): string => parseTripId(value, 'id');

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

export const parseDeviceAssignment = (value: unknown): DeviceAssignmentInput => {
  const input = record(value);
  return { vehicleId: stringField(input.vehicleId, 'vehicleId') };
};

export const parseMobileQrAssignment = (value: unknown): MobileQrAssignmentInput => {
  const input = record(value);
  return { qrToken: stringField(input.qrToken, 'qrToken', { max: 512 }) };
};

export const parseRouteStopCreate = (value: unknown): RouteStopCreateInput => {
  const input = record(value);
  return {
    routeId: stringField(input.routeId, 'routeId'),
    stopId: stringField(input.stopId, 'stopId'),
    stopOrder: integerField(input.stopOrder, 'stopOrder', { min: 1, max: 1000 }),
  };
};

export const parseRouteStopReplace = (value: unknown): RouteStopReplaceInput => {
  const input = record(value);
  if (!Array.isArray(input.stopIds) || input.stopIds.length > 1000) {
    throw invalidRequest('Field "stopIds" is invalid');
  }

  const stopIds = input.stopIds.map((stopId, index) =>
    stringField(stopId, `stopIds[${index}]`),
  );
  if (new Set(stopIds).size !== stopIds.length) {
    throw invalidRequest('Field "stopIds" must not contain duplicates');
  }

  return { stopIds };
};

const colorField = (value: unknown): string => {
  const color = stringField(value, 'color', { max: 7 });
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw invalidRequest('Field "color" is invalid');
  }
  return color;
};

export const parseVehicleCreate = (value: unknown): VehicleCreateInput => {
  const input = record(value);
  const assignedRouteId = optionalNullableStringField(input.assignedRouteId, 'assignedRouteId');
  return {
    id: stringField(input.id, 'id'),
    name: stringField(input.name, 'name', { max: 255 }),
    type: stringField(input.type, 'type', { max: 50 }),
    status: input.status === undefined
      ? 'inactive'
      : enumField(input.status, 'status', ['active', 'inactive', 'maintenance'] as const),
    ...(assignedRouteId === undefined ? {} : { assignedRouteId }),
  };
};

export const parseVehicleUpdate = (value: unknown): VehicleUpdateInput => {
  const input = record(value);
  const output: VehicleUpdateInput = {};
  if (Object.hasOwn(input, 'name')) output.name = stringField(input.name, 'name', { max: 255 });
  if (Object.hasOwn(input, 'type')) output.type = stringField(input.type, 'type', { max: 50 });
  if (Object.hasOwn(input, 'status')) {
    output.status = enumField(input.status, 'status', ['active', 'inactive', 'maintenance'] as const);
  }
  if (Object.hasOwn(input, 'assignedRouteId')) {
    const assignedRouteId = optionalNullableStringField(input.assignedRouteId, 'assignedRouteId');
    if (assignedRouteId === undefined) throw invalidRequest('Field "assignedRouteId" is invalid');
    output.assignedRouteId = assignedRouteId;
  }
  if (Object.keys(output).length === 0) throw invalidRequest('At least one vehicle field is required');
  return output;
};

export const parseRouteCreate = (value: unknown): RouteCreateInput => {
  const input = record(value);
  return {
    id: stringField(input.id, 'id'),
    name: stringField(input.name, 'name', { max: 255 }),
    color: colorField(input.color),
    status: input.status === undefined
      ? 'inactive'
      : enumField(input.status, 'status', ['active', 'inactive'] as const),
  };
};

export const parseRouteUpdate = (value: unknown): RouteUpdateInput => {
  const input = record(value);
  const output: RouteUpdateInput = {};
  if (Object.hasOwn(input, 'name')) output.name = stringField(input.name, 'name', { max: 255 });
  if (Object.hasOwn(input, 'color')) output.color = colorField(input.color);
  if (Object.hasOwn(input, 'status')) output.status = enumField(input.status, 'status', ['active', 'inactive'] as const);
  if (Object.keys(output).length === 0) throw invalidRequest('At least one route field is required');
  return output;
};

const parseStopFields = (input: Record<string, unknown>): StopUpdateInput => {
  const nameEn = optionalNullableStringField(input.nameEn, 'nameEn', 255);
  const imageUrl = optionalNullableStringField(input.imageUrl, 'imageUrl', 500);
  return {
    nameTh: stringField(input.nameTh, 'nameTh', { max: 255 }),
    ...(nameEn === undefined ? {} : { nameEn }),
    lat: numberField(input.lat, 'lat', { min: -90, max: 90 }),
    lng: numberField(input.lng, 'lng', { min: -180, max: 180 }),
    ...(imageUrl === undefined ? {} : { imageUrl }),
  };
};

export const parseStopCreate = (value: unknown): StopCreateInput => {
  const input = record(value);
  return { id: stringField(input.id, 'id'), ...parseStopFields(input) };
};

export const parseStopUpdate = (value: unknown): StopUpdateInput => parseStopFields(record(value));

export const parseTripStart = (value: unknown): TripStartInput => {
  const input = record(value);
  const vehicleId = optionalStringField(input.vehicleId, 'vehicleId');
  return vehicleId === undefined ? {} : { vehicleId };
};

export const parseTripId = (value: unknown, field = 'id'): string => {
  const parsed = stringField(value, field, { max: 36 });
  if (!UUID_PATTERN.test(parsed)) {
    throw invalidRequest(`Field "${field}" is invalid`);
  }
  return parsed;
};

const parseBoundedPagination = (input: Record<string, unknown>): BoundedPaginationInput => ({
  page: input.page === undefined ? 1 : integerField(input.page, 'page', { min: 1, max: 100000 }),
  pageSize: input.pageSize === undefined
    ? 20
    : integerField(input.pageSize, 'pageSize', { min: 1, max: 100 }),
});

export const parseTripHistoryPagination = (value: unknown): BoundedPaginationInput =>
  parseBoundedPagination(record(value, 'Query parameters are invalid'));

export const parseTripHistoryList = (value: unknown): TripHistoryListInput => {
  const input = record(value, 'Query parameters are invalid');
  const pagination = parseBoundedPagination(input);
  const vehicleId = optionalStringField(input.vehicleId, 'vehicleId');
  const routeId = optionalStringField(input.routeId, 'routeId');
  const status = input.status === undefined
    ? undefined
    : enumField(input.status, 'status', ['in_progress', 'completed', 'aborted'] as const);
  const from = input.from === undefined ? undefined : utcDateField(input.from, 'from');
  const to = input.to === undefined ? undefined : utcDateField(input.to, 'to');
  if (from && to && from > to) throw invalidRequest('Field "from" must not be after "to"');
  return {
    ...pagination,
    ...(vehicleId === undefined ? {} : { vehicleId }),
    ...(routeId === undefined ? {} : { routeId }),
    ...(status === undefined ? {} : { status }),
    ...(from === undefined ? {} : { from }),
    ...(to === undefined ? {} : { to }),
  };
};

export const parseAdminHistoryList = (value: unknown): AdminHistoryListInput => {
  const input = record(value, 'Query parameters are invalid');
  const pagination = parseBoundedPagination(input);
  const action = input.action === undefined
    ? undefined
    : enumField(input.action, 'action', ADMIN_AUDIT_ACTIONS);
  const targetType = input.targetType === undefined
    ? undefined
    : enumField(input.targetType, 'targetType', ADMIN_AUDIT_TARGET_TYPES);
  const outcome = input.outcome === undefined
    ? undefined
    : enumField(input.outcome, 'outcome', ADMIN_AUDIT_OUTCOMES);
  const actor = optionalStringField(input.actor, 'actor', { max: 50 });
  const from = input.from === undefined ? undefined : utcDateField(input.from, 'from');
  const to = input.to === undefined ? undefined : utcDateField(input.to, 'to');
  if (from && to && from > to) throw invalidRequest('Field "from" must not be after "to"');
  return {
    ...pagination,
    ...(action === undefined ? {} : { action }),
    ...(targetType === undefined ? {} : { targetType }),
    ...(outcome === undefined ? {} : { outcome }),
    ...(actor === undefined ? {} : { actor }),
    ...(from === undefined ? {} : { from }),
    ...(to === undefined ? {} : { to }),
  };
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
    ...(input.station === undefined || input.station === null || (typeof input.station === 'string' && input.station.trim().length === 0)
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

export const validateQuery = <T>(schema: BoundarySchema<T>): RequestHandler => (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    res.locals.validatedQuery = schema(req.query);
    next();
  } catch (error) {
    next(error instanceof BoundaryError ? error : invalidRequest());
  }
};
