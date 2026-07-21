import { randomUUID } from 'node:crypto';

export type OperationalEvent =
  | 'startup.outcome'
  | 'readiness.outcome'
  | 'ingestion.outcome'
  | 'tracking.canonical_selected'
  | 'tracking.source_stale'
  | 'history.persisted'
  | 'history.persistence_failed'
  | 'dependency.redis_connected'
  | 'dependency.redis_failed';

export type OperationalLevel = 'info' | 'warn' | 'error';
export type OperationalOutcome =
  | 'started'
  | 'failed'
  | 'ready'
  | 'not_ready'
  | 'accepted'
  | 'rejected'
  | 'ignored'
  | 'selected'
  | 'stale'
  | 'recovered'
  | 'persisted'
  | 'connected';

export type OperationalTransport = 'http' | 'socket' | 'ttn' | 'system';
export type OperationalDependency = 'redis' | 'postgres' | 'socket_adapter' | 'listener';
export type OperationalSourceType = 'mobile' | 'lorawan' | 'esp32' | 'simulator';
export type OperationalRoute =
  | '/ready'
  | '/api/ingest/http'
  | '/api/ingest/ttn'
  | 'socket:send-location';

export interface OperationalSignal {
  event: OperationalEvent;
  level: OperationalLevel;
  outcome: OperationalOutcome;
  correlationId?: string;
  transport?: OperationalTransport;
  route?: OperationalRoute;
  sourceId?: string;
  vehicleId?: string;
  tripId?: string;
  sourceType?: OperationalSourceType;
  reasonCode?: string;
  dependency?: OperationalDependency;
  operation?: string;
  responseStatus?: number;
  durationMs?: number;
  activeSourceCount?: number;
  staleSourceCount?: number;
  freshnessBucket?: 'missing' | 'under_30s' | '30_to_60s' | 'over_60s';
  canonicalEmitted?: boolean;
  suppressedCount?: number;
}

const SAFE_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,49}$/;
const SAFE_CODE = /^[A-Z0-9_.-]{1,64}$/;
const SAFE_OPERATION = /^[a-z][a-z0-9_.-]{0,63}$/;

const lastEmittedAt = new Map<string, number>();
const suppressedCounts = new Map<string, number>();
const selectedSources = new Map<string, string>();

const safeIdentifier = (value: string | undefined): string | undefined =>
  value && SAFE_IDENTIFIER.test(value) ? value : undefined;

const safeCode = (value: string | undefined): string | undefined =>
  value && SAFE_CODE.test(value) ? value : undefined;

const safeOperation = (value: string | undefined): string | undefined =>
  value && SAFE_OPERATION.test(value) ? value : undefined;

const safeInteger = (value: number | undefined, max: number): number | undefined =>
  value !== undefined && Number.isSafeInteger(value) && value >= 0 && value <= max
    ? value
    : undefined;

/** Returns a bounded correlation identifier; invalid caller input is replaced. */
export const getRequestId = (candidate?: string): string =>
  safeIdentifier(candidate) ?? randomUUID();

const signalKey = (signal: OperationalSignal): string => [
  signal.event,
  signal.transport ?? 'system',
  signal.route ?? '',
  signal.sourceId ?? '',
  signal.vehicleId ?? '',
  signal.reasonCode ?? '',
].join('|');

const cooldownFor = (event: OperationalEvent, outcome: OperationalOutcome): number => {
  if (event === 'ingestion.outcome' && outcome === 'accepted') return 60_000;
  if (event === 'ingestion.outcome' && outcome === 'rejected') return 10_000;
  if (event === 'tracking.source_stale' || event === 'tracking.canonical_selected') return 60_000;
  if (event === 'dependency.redis_failed') return 60_000;
  return 0;
};

const isSuppressed = (signal: OperationalSignal, now: number): boolean => {
  const cooldownMs = cooldownFor(signal.event, signal.outcome);
  if (!cooldownMs) return false;

  const key = signalKey(signal);
  const previous = lastEmittedAt.get(key);
  if (previous === undefined || now - previous >= cooldownMs) {
    lastEmittedAt.set(key, now);
    return false;
  }

  suppressedCounts.set(key, (suppressedCounts.get(key) ?? 0) + 1);
  return true;
};

const isRepeatedCanonicalSelection = (signal: OperationalSignal): boolean => {
  if (signal.event !== 'tracking.canonical_selected' || !signal.vehicleId || !signal.sourceId) {
    return false;
  }

  const previousSource = selectedSources.get(signal.vehicleId);
  if (previousSource !== signal.sourceId) {
    selectedSources.set(signal.vehicleId, signal.sourceId);
    return false;
  }

  return true;
};

/**
 * Emits one best-effort, allowlisted JSON line. It intentionally drops
 * arbitrary metadata, exception messages, URLs, bodies, headers, coordinates,
 * and credentials. Logging can never change request or ingestion behavior.
 */
export const emitOperationalSignal = (signal: OperationalSignal): void => {
  try {
    const now = Date.now();
    let suppressionChecked = false;
    if (isRepeatedCanonicalSelection(signal)) {
      if (isSuppressed(signal, now)) return;
      suppressionChecked = true;
    }
    if (!suppressionChecked && isSuppressed(signal, now)) return;

    const key = signalKey(signal);
    const suppressedCount = suppressedCounts.get(key);
    suppressedCounts.delete(key);

    const payload: Record<string, string | number | boolean> = {
      event: signal.event,
      schemaVersion: 1,
      occurredAt: new Date(now).toISOString(),
      level: signal.level,
      outcome: signal.outcome,
      correlationId: getRequestId(signal.correlationId),
    };

    const optionalFields: Array<[string, string | number | boolean | undefined]> = [
      ['transport', signal.transport],
      ['route', signal.route],
      ['sourceId', safeIdentifier(signal.sourceId)],
      ['vehicleId', safeIdentifier(signal.vehicleId)],
      ['tripId', safeIdentifier(signal.tripId)],
      ['sourceType', signal.sourceType],
      ['reasonCode', safeCode(signal.reasonCode)],
      ['dependency', signal.dependency],
      ['operation', safeOperation(signal.operation)],
      ['responseStatus', safeInteger(signal.responseStatus, 599)],
      ['durationMs', safeInteger(signal.durationMs, 86_400_000)],
      ['activeSourceCount', safeInteger(signal.activeSourceCount, 10_000)],
      ['staleSourceCount', safeInteger(signal.staleSourceCount, 10_000)],
      ['freshnessBucket', signal.freshnessBucket],
      ['canonicalEmitted', signal.canonicalEmitted],
      ['suppressedCount', safeInteger(suppressedCount ?? signal.suppressedCount, 1_000_000)],
    ];

    for (const [keyName, value] of optionalFields) {
      if (value !== undefined) payload[keyName] = value;
    }

    console.log(JSON.stringify(payload));
  } catch {
    // Observability is best effort and must not become an application failure.
    try {
      console.log('{"event":"observability.failure","schemaVersion":1,"level":"error","outcome":"failed"}');
    } catch {
      // Ignore a broken log destination.
    }
  }
};
