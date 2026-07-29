import type { Request, Response } from 'express';
import { createHash } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import {
  RESEARCH_EXPORT_MAX_ROWS,
  RESEARCH_EXPORT_PAGE_SIZE,
  RESEARCH_EXPORT_SCHEMA_VERSION,
  streamResearchCsv,
  validateExportWindow,
  type ResearchExportRow,
} from '../services/research-export.service.js';
import { recordLifecycleRun } from '../services/research-lifecycle.service.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || value.length === 0) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseBoundedInteger = (value: unknown, fallback: number, max: number): number => {
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

const alias = (kind: string, value: string | null | undefined): string | null => {
  if (!value) return null;
  return `${kind}-${createHash('sha256').update(value).digest('hex').slice(0, 16)}`;
};

const sessionFor = async (sessionId: string) => {
  if (!UUID_PATTERN.test(sessionId)) return null;
  return prisma.researchSession.findUnique({
    where: { id: sessionId },
    select: { id: true, sessionAlias: true },
  });
};

const whereFor = (sessionId: string, from: Date | null, to: Date | null) => ({
  sessionId,
  ...(from || to ? {
    backendReceiveTime: {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    },
  } : {}),
});

const toExportRow = (row: {
  sessionAlias: string;
  sourceUnitKey: string;
  sourceType: string;
  vehicleIdAtReceive: string | null;
  routeId: string | null;
  transport: string;
  backendReceiveTime: Date;
  producerEventTime: Date | null;
  producerClockStatus: string | null;
  sourceSequence: string | null;
  validationOutcome: string;
  canonicalDisposition: string;
  latitude: unknown;
  longitude: unknown;
  speedMps: unknown;
  headingDeg: unknown;
  reportedAccuracyValue: unknown;
  reportedAccuracyUnit: string | null;
  reportedAccuracyKind: string | null;
  batteryPercentage: unknown;
  wifiRssi: unknown;
  lorawanRssi: unknown;
  lorawanSnr: unknown;
}): ResearchExportRow => ({
  schema_version: RESEARCH_EXPORT_SCHEMA_VERSION,
  session_alias: row.sessionAlias,
  source_alias: row.sourceUnitKey,
  source_type: row.sourceType,
  vehicle_alias: alias('vehicle', row.vehicleIdAtReceive),
  route_alias: alias('route', row.routeId),
  transport: row.transport,
  received_at: row.backendReceiveTime,
  producer_event_time: row.producerEventTime,
  event_time_quality: row.producerClockStatus ?? 'unverified',
  source_sequence: row.sourceSequence,
  validation_outcome: row.validationOutcome,
  canonical_disposition: row.canonicalDisposition,
  latitude: row.latitude,
  longitude: row.longitude,
  speed_mps: row.speedMps,
  heading_deg: row.headingDeg,
  reported_accuracy_value: row.reportedAccuracyValue,
  reported_accuracy_unit: row.reportedAccuracyUnit,
  reported_accuracy_kind: row.reportedAccuracyKind,
  battery_percentage: row.batteryPercentage,
  wifi_rssi: row.wifiRssi,
  lorawan_rssi: row.lorawanRssi,
  lorawan_snr: row.lorawanSnr,
});

const rawSelect = {
  sourceUnitKey: true,
  sourceType: true,
  vehicleIdAtReceive: true,
  routeId: true,
  transport: true,
  backendReceiveTime: true,
  producerEventTime: true,
  producerClockStatus: true,
  sourceSequence: true,
  validationOutcome: true,
  canonicalDisposition: true,
  latitude: true,
  longitude: true,
  speedMps: true,
  headingDeg: true,
  reportedAccuracyValue: true,
  reportedAccuracyUnit: true,
  reportedAccuracyKind: true,
  batteryPercentage: true,
  wifiRssi: true,
  lorawanRssi: true,
  lorawanSnr: true,
} as const;

const requestBounds = (req: Request): { from: Date | null; to: Date | null } | null => {
  const from = parseDate(req.query.from);
  const to = parseDate(req.query.to);
  if ((req.query.from && !from) || (req.query.to && !to) || !validateExportWindow(from, to)) return null;
  return { from, to };
};

export const getResearchSessions = async (_req: Request, res: Response): Promise<void> => {
  const sessions = await prisma.researchSession.findMany({
    select: {
      id: true,
      sessionAlias: true,
      experimentId: true,
      protocolVersion: true,
      metricDefinitionVersion: true,
      status: true,
      startedAt: true,
      endedAt: true,
    },
    orderBy: { startedAt: 'desc' },
  });
  res.json(sessions);
};

export const getResearchObservations = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.params.sessionId as string;
  const session = await sessionFor(sessionId);
  const bounds = requestBounds(req);
  if (!session || !bounds) {
    res.status(400).json({ code: 'INVALID_REQUEST', error: 'Research session or time scope is invalid' });
    return;
  }
  const limit = parseBoundedInteger(req.query.limit, RESEARCH_EXPORT_PAGE_SIZE, RESEARCH_EXPORT_MAX_ROWS);
  const offset = parseBoundedInteger(req.query.offset, 1, RESEARCH_EXPORT_MAX_ROWS) - 1;
  const rows = await prisma.researchRawObservation.findMany({
    where: whereFor(sessionId, bounds.from, bounds.to),
    select: rawSelect,
    orderBy: [{ backendReceiveTime: 'asc' }, { id: 'asc' }],
    skip: Math.max(0, offset),
    take: limit,
  });
  res.json({
    schemaVersion: RESEARCH_EXPORT_SCHEMA_VERSION,
    sessionAlias: session.sessionAlias,
    rows: rows.map((row) => toExportRow({ ...row, sessionAlias: session.sessionAlias })),
  });
};

export const exportResearchObservations = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.params.sessionId as string;
  const session = await sessionFor(sessionId);
  const bounds = requestBounds(req);
  if (!session || !bounds) {
    res.status(400).json({ code: 'INVALID_REQUEST', error: 'Research session or time scope is invalid' });
    return;
  }

  const where = whereFor(sessionId, bounds.from, bounds.to);
  const maxRows = parseBoundedInteger(req.query.limit, RESEARCH_EXPORT_MAX_ROWS, RESEARCH_EXPORT_MAX_ROWS);
  const role = typeof res.locals.researchRole === 'string' ? res.locals.researchRole : 'UNKNOWN';
  const rows = async function* (): AsyncGenerator<ResearchExportRow> {
    let offset = 0;
    while (offset < maxRows) {
      const batch = await prisma.researchRawObservation.findMany({
        where,
        select: rawSelect,
        orderBy: [{ backendReceiveTime: 'asc' }, { id: 'asc' }],
        skip: offset,
        take: Math.min(RESEARCH_EXPORT_PAGE_SIZE, maxRows - offset),
      });
      if (batch.length === 0) return;
      for (const row of batch) yield toExportRow({ ...row, sessionAlias: session.sessionAlias });
      offset += batch.length;
      if (batch.length < RESEARCH_EXPORT_PAGE_SIZE) return;
    }
  };

  const result = await streamResearchCsv(res, rows());
  await recordLifecycleRun({
    runId: `${sessionId}:${Date.now()}`,
    sessionId,
    action: 'research_export',
    actorRole: role,
    scope: `session:${session.sessionAlias}`,
    candidateRowCount: result.rowCount,
    verificationStatus: result.complete ? 'verified' : 'failed',
    errorCode: result.complete ? null : 'EXPORT_INCOMPLETE',
  });
};
