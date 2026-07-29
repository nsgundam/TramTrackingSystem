import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import type { CanonicalVehicleStateV1 } from './canonical-state.service.js';

export const RESEARCH_PROTOCOL_VERSION = 'ResearchObservationV1';
export const RESEARCH_METRIC_DEFINITION_VERSION = 't7-metrics-v1';
export const RESEARCH_PAYLOAD_SCHEMA_VERSION = 't7-observation-v1';
export const RESEARCH_PROVIDER_METADATA_ALLOWLIST_VERSION = 't7-provider-metadata-v1';

export type ResearchSourceType = 'mobile' | 'lorawan' | 'esp32' | 'simulator';
export type ResearchTransport = 'socketio' | 'http' | 'ttn_webhook' | 'fixture';
export type ValidationOutcome = 'accepted' | 'rejected' | 'duplicate' | 'late' | 'invalid';
export type CanonicalDisposition =
  | 'selected'
  | 'fallback'
  | 'eligible_not_selected'
  | 'rejected'
  | 'not_evaluated'
  | 'not_applicable';

export interface ResearchObservationMetadata {
  producerEventTime?: Date | null;
  producerEventTimeKind?: string | null;
  producerMonotonicTime?: number | null;
  producerClockId?: string | null;
  producerClockStatus?: string | null;
  providerReceiveTime?: Date | null;
  providerNetworkReceiveTime?: Date | null;
  sourceSequence?: string | null;
  sourceSequenceKind?: string | null;
  traceId?: string | null;
  deviceModel?: string | null;
  deviceOsOrAppVersion?: string | null;
  firmwareVersion?: string | null;
  codecVersion?: string | null;
  mountingProfile?: string | null;
  powerProfile?: string | null;
  fieldNotes?: string | null;
  ttnFramePort?: number | null;
  ttnFrameCounter?: number | null;
  gatewayCount?: number | null;
  rssi?: number | null;
  snr?: number | null;
  batteryPercentage?: number | null;
  networkType?: string | null;
  wifiRssi?: number | null;
  lorawanRssi?: number | null;
  lorawanSnr?: number | null;
}

export interface ResearchObservationCapture {
  sessionId: string;
  runId: string;
  sourceId: string;
  sourceType: ResearchSourceType;
  vehicleId?: string | null;
  tripId?: string | null;
  routeId?: string | null;
  routeGeometryVersion?: string | null;
  sourceUnitKey?: string;
  transport: ResearchTransport;
  latitude?: number | null;
  longitude?: number | null;
  speedMps?: number | null;
  headingDeg?: number | null;
  accuracy?: number | null;
  accuracyUnit?: string | null;
  accuracyKind?: string | null;
  accuracySource?: string | null;
  validationOutcome?: ValidationOutcome;
  canonicalDisposition?: CanonicalDisposition;
  rejectReason?: string | null;
  lateReason?: string | null;
  duplicateOf?: string | null;
  pairingWindowMs?: number | null;
  canonicalState?: CanonicalVehicleStateV1 | null;
  metadata?: ResearchObservationMetadata;
  backendReceiveTime?: Date;
}

const MAX_STRING = 100;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const text = (value: unknown, max = MAX_STRING): string | null => {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  return clean.length > 0 ? clean.slice(0, max) : null;
};

const number = (value: unknown, min?: number, max?: number): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (min !== undefined && parsed < min) return null;
  if (max !== undefined && parsed > max) return null;
  return parsed;
};

const date = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const nested = (value: Record<string, unknown>, key: string): Record<string, unknown> =>
  record(value[key]);

const pick = (value: Record<string, unknown>, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (value[key] !== undefined) return value[key];
  }
  return undefined;
};

export const toResearchSourceUnitKey = (sourceId: string): string =>
  `unit-${createHash('sha256').update(sourceId).digest('hex').slice(0, 24)}`;

/** Extracts only allowlisted metadata. It never returns the incoming payload. */
export const extractResearchMetadata = (
  value: unknown,
  transport: ResearchTransport,
): ResearchObservationMetadata => {
  const input = record(value);
  const metadata = nested(input, 'metadata');

  if (transport === 'ttn_webhook') {
    const uplink = nested(input, 'uplink_message');
    const settings = nested(uplink, 'settings');
    const network = nested(uplink, 'network_ids');
    const rxMetadata = Array.isArray(uplink.rx_metadata) ? uplink.rx_metadata : [];
    const firstGateway = record(rxMetadata[0]);
    const frameCounter = number(pick(uplink, 'f_cnt', 'frame_counter'), 0);
    return {
      providerReceiveTime: date(pick(uplink, 'received_at') ?? input.received_at),
      providerNetworkReceiveTime: date(pick(settings, 'time') ?? pick(network, 'received_at')),
      sourceSequence: frameCounter === null ? null : String(frameCounter),
      sourceSequenceKind: frameCounter === null ? null : 'ttn_f_cnt',
      ttnFrameCounter: frameCounter,
      ttnFramePort: number(pick(uplink, 'f_port', 'frame_port'), 0, 255),
      gatewayCount: rxMetadata.length || null,
      rssi: number(firstGateway.rssi),
      snr: number(firstGateway.snr),
      lorawanRssi: number(firstGateway.rssi),
      lorawanSnr: number(firstGateway.snr),
      codecVersion: text(pick(input, 'codecVersion', 'codec_version')),
      fieldNotes: text(pick(metadata, 'fieldNotes', 'field_notes'), 500),
    };
  }

  const producerEventTime = date(pick(input, 'producerEventTime', 'producer_event_time'));
  const producerMonotonicTime = number(
    pick(input, 'producerMonotonicTime', 'producer_monotonic_time'),
    0,
  );
  return {
    producerEventTime,
    producerEventTimeKind: text(pick(input, 'producerEventTimeKind', 'producer_event_time_kind'), 40),
    producerMonotonicTime,
    producerClockId: text(pick(input, 'producerClockId', 'producer_clock_id')),
    producerClockStatus: text(pick(input, 'producerClockStatus', 'producer_clock_status'), 40),
    sourceSequence: text(pick(input, 'sourceSequence', 'source_sequence')),
    sourceSequenceKind: text(pick(input, 'sourceSequenceKind', 'source_sequence_kind'), 40),
    traceId: text(pick(input, 'traceId', 'trace_id')),
    deviceModel: text(pick(metadata, 'deviceModel', 'device_model')),
    deviceOsOrAppVersion: text(pick(metadata, 'deviceOsOrAppVersion', 'device_os_or_app_version')),
    firmwareVersion: text(pick(metadata, 'firmwareVersion', 'firmware_version')),
    mountingProfile: text(pick(metadata, 'mountingProfile', 'mounting_profile')),
    powerProfile: text(pick(metadata, 'powerProfile', 'power_profile')),
    networkType: text(pick(metadata, 'networkType', 'network_type'), 40),
    wifiRssi: number(pick(metadata, 'wifiRssi', 'wifi_rssi')),
    batteryPercentage: number(pick(metadata, 'batteryPercentage', 'battery_percentage'), 0, 100),
    fieldNotes: text(pick(metadata, 'fieldNotes', 'field_notes'), 500),
  };
};

const observedDifference = (
  producerEventTime: Date | null,
  backendReceiveTime: Date,
  clockStatus: string | null,
): number | null => {
  if (!producerEventTime || clockStatus !== 'synchronized') return null;
  return backendReceiveTime.getTime() - producerEventTime.getTime();
};

const dedupeKeyFor = (input: ResearchObservationCapture, receivedAt: Date): string =>
  createHash('sha256')
    .update([
      input.sessionId,
      input.sourceId,
      input.metadata?.sourceSequence ?? '',
      input.metadata?.traceId ?? '',
      receivedAt.toISOString(),
      input.latitude ?? '',
      input.longitude ?? '',
    ].join('|'))
    .digest('hex');

const isSupportedSource = (value: string): value is ResearchSourceType =>
  value === 'mobile' || value === 'lorawan' || value === 'esp32' || value === 'simulator';

export const normalizeResearchObservation = (input: ResearchObservationCapture) => {
  if (!UUID_PATTERN.test(input.sessionId)) throw new Error('Invalid research session ID');
  if (!isSupportedSource(input.sourceType)) throw new Error('Invalid research source type');

  const backendReceiveTime = input.backendReceiveTime ?? new Date();
  const processTime = new Date();
  const metadata = input.metadata ?? {};
  const producerEventTime = metadata.producerEventTime ?? null;
  const clockStatus = metadata.producerClockStatus ?? null;
  const normalizedLatitude = number(input.latitude, -90, 90);
  const normalizedLongitude = number(input.longitude, -180, 180);
  const validCoordinates = normalizedLatitude !== null && normalizedLongitude !== null;
  const validationOutcome = input.validationOutcome ?? (validCoordinates ? 'accepted' : 'invalid');
  const canonicalDisposition = input.canonicalDisposition
    ?? (validationOutcome === 'accepted' ? 'not_evaluated' : 'rejected');
  const canonicalState = input.canonicalState;
  const selectedTime = canonicalState?.sourceId === input.sourceId
    ? new Date(canonicalState.timing.selectedAt)
    : null;

  return {
    sessionId: input.sessionId,
    runId: text(input.runId, 100) ?? 'unassigned',
    vehicleIdAtReceive: text(input.vehicleId),
    tripId: input.tripId ?? null,
    sourceId: text(input.sourceId, 50) ?? 'unknown',
    sourceType: input.sourceType,
    sourceUnitKey: input.sourceUnitKey ?? toResearchSourceUnitKey(input.sourceId),
    routeId: text(input.routeId, 50),
    routeGeometryVersion: text(input.routeGeometryVersion),
    metricDefinitionVersion: RESEARCH_METRIC_DEFINITION_VERSION,
    transport: input.transport,
    payloadSchemaVersion: RESEARCH_PAYLOAD_SCHEMA_VERSION,
    deviceModel: text(metadata.deviceModel),
    deviceOsOrAppVersion: text(metadata.deviceOsOrAppVersion),
    firmwareVersion: text(metadata.firmwareVersion),
    codecVersion: text(metadata.codecVersion),
    mountingProfile: text(metadata.mountingProfile),
    powerProfile: text(metadata.powerProfile),
    fieldNotes: text(metadata.fieldNotes, 500),
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
    speedMps: number(input.speedMps, 0, 999.99),
    headingDeg: number(input.headingDeg, 0, 360),
    producerEventTime,
    producerEventTimeKind: text(metadata.producerEventTimeKind, 40),
    producerMonotonicTime: metadata.producerMonotonicTime ?? null,
    producerClockId: text(metadata.producerClockId),
    producerClockStatus: clockStatus,
    providerReceiveTime: metadata.providerReceiveTime ?? null,
    providerNetworkReceiveTime: metadata.providerNetworkReceiveTime ?? null,
    backendReceiveTime,
    processTime,
    selectedTime,
    sourceSequence: text(metadata.sourceSequence),
    sourceSequenceKind: text(metadata.sourceSequenceKind, 40),
    traceId: text(metadata.traceId),
    clockUncertaintyMs: null,
    clockOffsetMs: null,
    validationOutcome,
    duplicateOf: input.duplicateOf ?? null,
    rejectReason: text(input.rejectReason),
    lateReason: text(input.lateReason),
    canonicalDisposition,
    reportedAccuracyValue: number(input.accuracy, 0, 100000),
    reportedAccuracyUnit: text(input.accuracyUnit, 30),
    reportedAccuracyKind: text(input.accuracyKind, 40),
    reportedAccuracySource: text(input.accuracySource, 40),
    observedTimestampDifferenceMs: observedDifference(producerEventTime, backendReceiveTime, clockStatus),
    clockBasis: producerEventTime && clockStatus !== 'synchronized' ? 'unverified' : producerEventTime ? 'synchronized' : null,
    latencyClaim: producerEventTime ? 'timestamp_difference_only' : null,
    pairingWindowMs: input.pairingWindowMs ?? 5_000,
    ttnFramePort: metadata.ttnFramePort ?? null,
    ttnFrameCounter: metadata.ttnFrameCounter ?? null,
    gatewayCount: metadata.gatewayCount ?? null,
    rssi: metadata.rssi ?? null,
    snr: metadata.snr ?? null,
    providerMetadataAllowlistVersion: input.transport === 'ttn_webhook'
      ? RESEARCH_PROVIDER_METADATA_ALLOWLIST_VERSION
      : null,
    batteryPercentage: metadata.batteryPercentage ?? null,
    networkType: text(metadata.networkType, 40),
    wifiRssi: metadata.wifiRssi ?? null,
    lorawanRssi: metadata.lorawanRssi ?? null,
    lorawanSnr: metadata.lorawanSnr ?? null,
    dedupeKey: dedupeKeyFor(input, backendReceiveTime),
  };
};

/**
 * Appends one typed research fact. This function has no canonical publication path.
 * Callers should catch failures so research persistence cannot reject or alter ingestion.
 */
export const recordResearchObservation = async (
  input: ResearchObservationCapture,
): Promise<{ id: string; validationOutcome: ValidationOutcome } | null> => {
  const normalized = normalizeResearchObservation(input);
  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.researchRawObservation.create({
      data: normalized as never,
      select: { id: true, validationOutcome: true },
    });

    if (normalized.latitude !== null && normalized.longitude !== null) {
      await tx.$executeRaw`
        UPDATE "research_raw_observations"
        SET "location" = ST_SetSRID(ST_MakePoint(${normalized.longitude}, ${normalized.latitude}), 4326)::geography
        WHERE "id" = ${created.id}::uuid
      `;
    }
    return created;
  });

  return {
    id: row.id,
    validationOutcome: row.validationOutcome as ValidationOutcome,
  };
};

export const researchCaptureEnabled = (): boolean =>
  typeof process.env.T7_RESEARCH_SESSION_ID === 'string' && UUID_PATTERN.test(process.env.T7_RESEARCH_SESSION_ID);

export const activeResearchSessionId = (): string | null =>
  researchCaptureEnabled() ? process.env.T7_RESEARCH_SESSION_ID ?? null : null;

export const researchDispositionFor = (
  sourceId: string,
  canonicalState: CanonicalVehicleStateV1 | null | undefined,
): CanonicalDisposition => {
  if (!canonicalState) return 'eligible_not_selected';
  if (canonicalState.sourceId !== sourceId) return 'eligible_not_selected';
  return canonicalState.reasonCode === 'FALLBACK_SOURCE_SELECTED' ? 'fallback' : 'selected';
};
