import { randomUUID } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { redisClient } from '../config/redis.js';
import {
  resolveCanonicalRouteAuthority,
  type CanonicalRouteAuthority,
} from './operations.service.js';

export const CANONICAL_SCHEMA_VERSION = 1 as const;
export const CANONICAL_EVENT_TYPE = 'canonical_vehicle_state' as const;
export const CANONICAL_SOURCE_FRESHNESS_WINDOW_MS = 30_000;

export const CANONICAL_REASON_CODES = [
  'CANONICAL_SELECTED',
  'FALLBACK_SOURCE_SELECTED',
  'ALL_SOURCES_STALE',
  'SOURCE_NEVER_SEEN',
  'NO_ACTIVE_SOURCE',
  'DEPENDENCY_UNAVAILABLE',
  'RECOVERED',
] as const;

export type CanonicalReasonCode = typeof CANONICAL_REASON_CODES[number];
export type CanonicalServiceState = 'live' | 'stale' | 'no_service' | 'unknown';
export type CanonicalSourceType = 'mobile' | 'esp32' | 'lorawan' | 'simulator';
export type CanonicalFreshnessBucket = 'fresh' | 'stale' | 'none';

export interface CanonicalLocation {
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  station: string | null;
}

export interface CanonicalVehicleStateV1 {
  schemaVersion: typeof CANONICAL_SCHEMA_VERSION;
  eventType: typeof CANONICAL_EVENT_TYPE;
  stateEpoch: string;
  stateVersion: number;
  vehicleId: string;
  tripId: string | null;
  routeId: string | null;
  routeAuthority: CanonicalRouteAuthority['routeAuthority'];
  serviceState: CanonicalServiceState;
  reasonCode: CanonicalReasonCode;
  liveLocation: CanonicalLocation | null;
  lastKnownLocation: CanonicalLocation | null;
  timing: {
    observedAt: string | null;
    receivedAt: string;
    selectedAt: string;
    freshnessClock: 'server_receive';
  };
  freshness: {
    ageMs: number | null;
    thresholdMs: number;
    bucket: CanonicalFreshnessBucket;
  };
  sourceType: CanonicalSourceType | null;
  sourceId?: string | null;
}

export type CanonicalVehicleStatePublic = Omit<CanonicalVehicleStateV1, 'sourceId'>;

export interface CanonicalLocationInput extends CanonicalLocation {
  vehicleId: string;
  sourceId: string;
  sourceType: CanonicalSourceType;
  recordedAt: Date;
  tripId?: string | null;
  selection: 'canonical' | 'fallback';
}

export interface CanonicalStateTransitionInput {
  vehicleId: string;
  serviceState: Exclude<CanonicalServiceState, 'live'> | 'live';
  reasonCode: CanonicalReasonCode;
  sourceType?: CanonicalSourceType | null;
  sourceId?: string | null;
  location?: CanonicalLocation | null;
  receivedAt?: Date;
}

type CanonicalStatePublisher = (state: CanonicalVehicleStateV1) => void | Promise<void>;

const CANONICAL_EPOCH_KEY = 'canonical:state:epoch';
const CANONICAL_VERSION_PREFIX = 'canonical:state:version:';
const CANONICAL_STATE_PREFIX = 'canonical:state:vehicle:';

const ATOMIC_STORE_SCRIPT = `
local current = redis.call('GET', KEYS[2])
local currentVersion = 0
if current then
  local currentState = cjson.decode(current)
  currentVersion = tonumber(currentState.stateVersion) or 0
end

local nextVersion = redis.call('INCR', KEYS[1])
if nextVersion <= currentVersion then
  nextVersion = currentVersion + 1
  redis.call('SET', KEYS[1], nextVersion)
end

local state = cjson.decode(ARGV[2])
state.stateEpoch = ARGV[1]
state.stateVersion = nextVersion
local encoded = cjson.encode(state)
redis.call('SET', KEYS[2], encoded)
return { ARGV[1], tostring(nextVersion), encoded }
`;

let statePublisher: CanonicalStatePublisher | null = null;

export const configureCanonicalStatePublisher = (publisher: CanonicalStatePublisher): void => {
  statePublisher = publisher;
};

export const createSocketCanonicalPublisher = (socketServer: {
  emit: (event: string, state: CanonicalVehicleStatePublic) => void;
}): CanonicalStatePublisher => (state) => {
  socketServer.emit('location-update', toPublicCanonicalState(state));
};

export const toPublicCanonicalState = (
  state: CanonicalVehicleStateV1,
): CanonicalVehicleStatePublic => {
  const { sourceId: _sourceId, ...publicState } = state;
  return publicState;
};

export const compareCanonicalStateVersion = (
  left: Pick<CanonicalVehicleStateV1, 'stateEpoch' | 'stateVersion'>,
  right: Pick<CanonicalVehicleStateV1, 'stateEpoch' | 'stateVersion'>,
): number => {
  if (left.stateEpoch !== right.stateEpoch) return 1;
  return Math.sign(left.stateVersion - right.stateVersion);
};

const stateKey = (vehicleId: string): string => `${CANONICAL_STATE_PREFIX}${vehicleId}`;
const versionKey = (vehicleId: string): string => `${CANONICAL_VERSION_PREFIX}${vehicleId}`;

const asSourceType = (value: unknown): CanonicalSourceType | null => {
  if (value === 'mobile' || value === 'esp32' || value === 'lorawan' || value === 'simulator') {
    return value;
  }
  return null;
};

const parseState = (value: string | null): CanonicalVehicleStateV1 | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<CanonicalVehicleStateV1>;
    if (
      parsed.schemaVersion !== CANONICAL_SCHEMA_VERSION ||
      parsed.eventType !== CANONICAL_EVENT_TYPE ||
      typeof parsed.vehicleId !== 'string' ||
      typeof parsed.stateEpoch !== 'string' ||
      typeof parsed.stateVersion !== 'number'
    ) {
      return null;
    }
    return parsed as CanonicalVehicleStateV1;
  } catch {
    return null;
  }
};

const readCurrentState = async (vehicleId: string): Promise<CanonicalVehicleStateV1 | null> =>
  parseState(await redisClient.get(stateKey(vehicleId)));

export const getCurrentCanonicalState = async (
  vehicleId: string,
): Promise<CanonicalVehicleStateV1 | null> => readCurrentState(vehicleId);

const ensureEpoch = async (): Promise<string> => {
  const existing = await redisClient.get(CANONICAL_EPOCH_KEY);
  if (existing) return existing;

  const proposed = randomUUID();
  await redisClient.set(CANONICAL_EPOCH_KEY, proposed, { NX: true });
  return (await redisClient.get(CANONICAL_EPOCH_KEY)) ?? proposed;
};

const allocateAndStore = async (
  state: Omit<CanonicalVehicleStateV1, 'stateEpoch' | 'stateVersion'>,
): Promise<CanonicalVehicleStateV1> => {
  const current = await readCurrentState(state.vehicleId);
  let epoch = await ensureEpoch();
  const versionNamespaceExists = await redisClient.exists(versionKey(state.vehicleId));
  if (current && !versionNamespaceExists) {
    // A lost per-vehicle version namespace must not reuse the old comparator.
    epoch = randomUUID();
    await redisClient.set(CANONICAL_EPOCH_KEY, epoch);
  }
  const baseState = JSON.stringify({ ...state, stateEpoch: epoch, stateVersion: 0 });
  const result = await redisClient.eval(ATOMIC_STORE_SCRIPT, {
    keys: [versionKey(state.vehicleId), stateKey(state.vehicleId)],
    arguments: [epoch, baseState],
  });

  if (!Array.isArray(result) || typeof result[2] !== 'string') {
    throw new Error('Canonical state version allocation returned an invalid result');
  }

  return JSON.parse(result[2]) as CanonicalVehicleStateV1;
};

const emitPublishedState = async (state: CanonicalVehicleStateV1): Promise<void> => {
  if (!statePublisher) return;
  const latest = await readCurrentState(state.vehicleId);
  if (
    !latest ||
    compareCanonicalStateVersion(latest, state) !== 0
  ) {
    return;
  }
  await statePublisher(state);
};

const iso = (date: Date): string => date.toISOString();

const ageFor = (receivedAt: Date, now = Date.now()): number =>
  Math.max(0, now - receivedAt.getTime());

const freshnessFor = (
  serviceState: CanonicalServiceState,
  receivedAt: Date | null,
  now = Date.now(),
): CanonicalVehicleStateV1['freshness'] => {
  if (!receivedAt || serviceState !== 'live') {
    return {
      ageMs: receivedAt ? ageFor(receivedAt, now) : null,
      thresholdMs: CANONICAL_SOURCE_FRESHNESS_WINDOW_MS,
      bucket: serviceState === 'unknown' || serviceState === 'no_service' ? 'none' : 'stale',
    };
  }

  const ageMs = ageFor(receivedAt, now);
  return {
    ageMs,
    thresholdMs: CANONICAL_SOURCE_FRESHNESS_WINDOW_MS,
    bucket: ageMs <= CANONICAL_SOURCE_FRESHNESS_WINDOW_MS ? 'fresh' : 'stale',
  };
};

const refreshFreshness = (state: CanonicalVehicleStateV1): CanonicalVehicleStateV1 => {
  const receivedAt = new Date(state.timing.receivedAt);
  return {
    ...state,
    freshness: freshnessFor(state.serviceState, Number.isNaN(receivedAt.getTime()) ? null : receivedAt),
  };
};

const routeOrUnknown = async (vehicleId: string): Promise<CanonicalRouteAuthority> =>
  resolveCanonicalRouteAuthority(vehicleId);

const makeState = async (
  input: CanonicalLocationInput,
  current: CanonicalVehicleStateV1 | null,
): Promise<Omit<CanonicalVehicleStateV1, 'stateEpoch' | 'stateVersion'>> => {
  const selectedAt = new Date();
  const receivedAt = input.recordedAt;
  const route = await routeOrUnknown(input.vehicleId);
  const reasonCode: CanonicalReasonCode = current && current.serviceState !== 'live'
    ? 'RECOVERED'
    : input.selection === 'fallback'
      ? 'FALLBACK_SOURCE_SELECTED'
      : 'CANONICAL_SELECTED';
  const liveLocation: CanonicalLocation = {
    lat: input.lat,
    lng: input.lng,
    speed: input.speed,
    heading: input.heading,
    accuracy: input.accuracy,
    station: input.station,
  };

  return {
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    eventType: CANONICAL_EVENT_TYPE,
    vehicleId: input.vehicleId,
    tripId: route.tripId ?? input.tripId ?? null,
    routeId: route.routeId,
    routeAuthority: route.routeAuthority,
    serviceState: 'live',
    reasonCode,
    liveLocation,
    lastKnownLocation: liveLocation,
    timing: {
      observedAt: null,
      receivedAt: iso(receivedAt),
      selectedAt: iso(selectedAt),
      freshnessClock: 'server_receive',
    },
    freshness: freshnessFor('live', receivedAt, selectedAt.getTime()),
    sourceType: input.sourceType,
    sourceId: input.sourceId,
  };
};

const makeTransitionState = async (
  input: CanonicalStateTransitionInput,
  current: CanonicalVehicleStateV1 | null,
): Promise<Omit<CanonicalVehicleStateV1, 'stateEpoch' | 'stateVersion'>> => {
  const selectedAt = new Date();
  let route: CanonicalRouteAuthority = {
    tripId: null,
    routeId: null,
    routeAuthority: 'unknown',
  };

  try {
    route = await routeOrUnknown(input.vehicleId);
  } catch {
    input.serviceState = 'unknown';
    input.reasonCode = 'DEPENDENCY_UNAVAILABLE';
  }

  const serviceState = input.serviceState;
  const receivedAt = input.receivedAt ?? selectedAt;
  const lastKnownLocation = serviceState === 'stale'
    ? input.location ?? current?.liveLocation ?? current?.lastKnownLocation ?? null
    : null;

  return {
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    eventType: CANONICAL_EVENT_TYPE,
    vehicleId: input.vehicleId,
    tripId: route.tripId,
    routeId: route.routeId,
    routeAuthority: route.routeAuthority,
    serviceState,
    reasonCode: input.reasonCode,
    liveLocation: null,
    lastKnownLocation,
    timing: {
      observedAt: current?.timing.observedAt ?? null,
      receivedAt: iso(receivedAt),
      selectedAt: iso(selectedAt),
      freshnessClock: 'server_receive',
    },
    freshness: freshnessFor(serviceState, serviceState === 'stale' ? receivedAt : null, selectedAt.getTime()),
    sourceType: input.sourceType ?? current?.sourceType ?? null,
    ...(input.sourceId === undefined
      ? (current?.sourceId === undefined ? {} : { sourceId: current.sourceId })
      : { sourceId: input.sourceId }),
  };
};

export const publishCanonicalState = async (
  input: CanonicalLocationInput,
): Promise<CanonicalVehicleStateV1> => {
  const current = await readCurrentState(input.vehicleId);
  let state: Omit<CanonicalVehicleStateV1, 'stateEpoch' | 'stateVersion'>;

  try {
    state = await makeState(input, current);
  } catch {
    state = await makeTransitionState({
      vehicleId: input.vehicleId,
      serviceState: 'unknown',
      reasonCode: 'DEPENDENCY_UNAVAILABLE',
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      location: null,
      receivedAt: input.recordedAt,
    }, current);
  }

  const published = await allocateAndStore(state);
  await emitPublishedState(published);
  return published;
};

export const publishVehicleStateTransition = async (
  input: CanonicalStateTransitionInput,
): Promise<CanonicalVehicleStateV1> => {
  const current = await readCurrentState(input.vehicleId);
  if (current && current.serviceState === input.serviceState && current.reasonCode === input.reasonCode) {
    return refreshFreshness(current);
  }

  const state = await makeTransitionState(input, current);
  const published = await allocateAndStore(state);
  await emitPublishedState(published);
  return published;
};

type SourceRecord = {
  id: string;
  type: string;
  priority: number;
};

type SourceCandidate = SourceRecord & {
  rank: number;
  observation: {
    lat: number;
    lng: number;
    speed: number | null;
    bearing: number | null;
    accuracy: number | null;
    station: string | null;
    timestamp: number;
    sourceType: string;
  };
};

const readSourceCandidate = async (
  vehicleId: string,
): Promise<{ selected: SourceCandidate | null; hasSnapshot: boolean; sourceCount: number }> => {
  const sources = await prisma.trackingSource.findMany({
    where: { vehicleId, status: 'active' },
    select: { id: true, type: true, priority: true },
    orderBy: [
      { priority: 'asc' },
      { id: 'asc' },
    ],
  }) as SourceRecord[];
  let selected: SourceCandidate | null = null;
  let hasSnapshot = false;
  const now = Date.now();

  for (const [rank, source] of sources.entries()) {
    const raw = await redisClient.get(`source:last_location:${source.id}`);
    if (!raw) continue;
    hasSnapshot = true;
    try {
      const observation = JSON.parse(raw) as SourceCandidate['observation'];
      if (now - observation.timestamp <= CANONICAL_SOURCE_FRESHNESS_WINDOW_MS && !selected) {
        selected = { ...source, rank, observation };
      }
    } catch {
      // An invalid cached snapshot is treated as unavailable, never as live.
    }
  }

  return { selected, hasSnapshot, sourceCount: sources.length };
};

export const refreshCanonicalState = async (
  vehicleId: string,
): Promise<CanonicalVehicleStateV1> => {
  const { selected, hasSnapshot, sourceCount } = await readSourceCandidate(vehicleId);
  if (selected) {
    const sourceType = asSourceType(selected.observation.sourceType) ?? asSourceType(selected.type);
    if (!sourceType) {
      return publishVehicleStateTransition({
        vehicleId,
        serviceState: 'unknown',
        reasonCode: 'DEPENDENCY_UNAVAILABLE',
      });
    }
    return publishCanonicalState({
      vehicleId,
      sourceId: selected.id,
      sourceType,
      lat: selected.observation.lat,
      lng: selected.observation.lng,
      speed: selected.observation.speed,
      heading: selected.observation.bearing,
      accuracy: selected.observation.accuracy,
      station: selected.observation.station,
      recordedAt: new Date(selected.observation.timestamp),
      selection: selected.rank === 0 ? 'canonical' : 'fallback',
    });
  }

  return publishVehicleStateTransition({
    vehicleId,
    serviceState: sourceCount === 0 ? 'no_service' : hasSnapshot ? 'stale' : 'no_service',
    reasonCode: sourceCount === 0
      ? 'NO_ACTIVE_SOURCE'
      : hasSnapshot
        ? 'ALL_SOURCES_STALE'
        : 'SOURCE_NEVER_SEEN',
  });
};

export const getCanonicalStateForVehicle = async (
  vehicleId: string,
): Promise<CanonicalVehicleStateV1> => {
  const current = await readCurrentState(vehicleId);
  if (current) {
    const refreshed = refreshFreshness(current);
    if (refreshed.serviceState === 'live' && refreshed.freshness.bucket === 'stale') {
      return refreshCanonicalState(vehicleId);
    }
    return refreshed;
  }
  return refreshCanonicalState(vehicleId);
};
