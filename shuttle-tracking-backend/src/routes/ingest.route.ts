import { Router, Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { processObservation } from '../services/tracking.service.js';
import { authenticateSenderToken } from '../middleware/auth.js';
import {
  BoundaryError,
  logBoundaryFailure,
  mapBoundaryError,
  sendBoundaryError,
} from '../middleware/boundary-errors.js';
import {
  parseObservation,
  parseTtnObservation,
  parseTtnPayload,
  parseTtnSourceId,
  validateBody,
} from '../middleware/validation.js';
import {
  RATE_LIMITS,
  clientAddress,
  consumeRateLimit,
  rateLimit,
  RateLimitDependencyError,
  senderKey,
} from '../middleware/rate-limit.js';
import type { ObservationInput } from '../middleware/validation.js';
import {
  emitOperationalSignal,
  getRequestId,
  type OperationalRoute,
  type OperationalSourceType,
  type OperationalTransport,
} from '../services/operational-signals.js';

const router = Router();

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;

const coordinateValue = (value: Record<string, unknown> | undefined, keys: string[]): unknown => {
  if (!value) return undefined;
  for (const key of keys) {
    if (value[key] !== undefined) return value[key];
  }
  return undefined;
};

const hasCoordinateField = (value: Record<string, unknown> | undefined): boolean =>
  Boolean(value && ['latitude', 'longitude', 'lat', 'lng'].some((key) => value[key] !== undefined));

const sourceLimit = rateLimit({ scope: 'sender:observation', ...RATE_LIMITS.sender, key: senderKey });

const ingestionSignal = (
  transport: OperationalTransport,
  route: OperationalRoute,
) => (req: Request, res: Response, next: () => void): void => {
  const body = req.body as Record<string, unknown> | undefined;
  const sourceId = typeof body?.sourceId === 'string' ? body.sourceId : undefined;

  res.locals.ingestionSourceId = sourceId;
  res.locals.ingestionTransport = transport;
  res.locals.ingestionRoute = route;
  res.locals.ingestionCorrelationId = req.requestId ?? getRequestId();

  res.once('finish', () => {
    const statusCode = res.statusCode;
    const outcome = res.locals.ingestionOutcome
      ?? (statusCode >= 400 ? 'rejected' : 'accepted') as 'accepted' | 'rejected' | 'ignored';
    const reasonCode = res.locals.ingestionReasonCode
      ?? (outcome === 'ignored' ? 'NO_COORDINATES' : statusCode >= 400 ? 'HTTP_REJECTED' : 'PROCESSED');

    emitOperationalSignal({
      event: 'ingestion.outcome',
      level: outcome === 'accepted' || outcome === 'ignored' ? 'info' : statusCode >= 500 ? 'error' : 'warn',
      outcome,
      transport,
      route,
      correlationId: res.locals.ingestionCorrelationId,
      sourceId: res.locals.ingestionSourceId,
      vehicleId: res.locals.ingestionVehicleId,
      tripId: res.locals.ingestionTripId,
      sourceType: res.locals.ingestionSourceType as OperationalSourceType | undefined,
      reasonCode,
      responseStatus: statusCode,
      canonicalEmitted: res.locals.canonicalEmitted,
    });
  });

  next();
};

/**
 * Ingest location from ESP32 or Mobile fallback via HTTP POST.
 * Path: POST /api/ingest/http
 */
router.post(
  '/http',
  ingestionSignal('http', '/api/ingest/http'),
  validateBody(parseObservation),
  authenticateSenderToken,
  sourceLimit,
  async (req: Request, res: Response) => {
    try {
      const observation = req.body as ObservationInput;
      const sender = req.sender;

      res.locals.ingestionVehicleId = sender?.vehicleId;
      res.locals.ingestionTripId = observation.tripId;

      if (!sender || sender.sourceId !== observation.sourceId) {
        throw new BoundaryError(403, 'SENDER_OWNERSHIP_MISMATCH', 'Sender cannot submit for this source');
      }

      const canonicalState = await processObservation({
        ...observation,
        sender,
      });

      res.locals.canonicalEmitted = Boolean(canonicalState);
      res.locals.ingestionSourceType = canonicalState?.sourceType;

      res.status(200).json({
        success: true,
        message: 'Location observation processed successfully',
        canonicalState,
        canonicalLocation: canonicalState,
      });
    } catch (error) {
      const mapped = mapBoundaryError(
        error,
        new BoundaryError(500, 'INTERNAL_ERROR', 'Internal server error during HTTP ingestion'),
      );
      res.locals.ingestionReasonCode = mapped.code;
      logBoundaryFailure('Ingest HTTP', error);
      sendBoundaryError(
        res,
        error,
        new BoundaryError(500, 'INTERNAL_ERROR', 'Internal server error during HTTP ingestion'),
      );
    }
  },
);

/**
 * Ingest location from TTN (The Things Network) Webhook.
 * Path: POST /api/ingest/ttn
 */
router.post(
  '/ttn',
  ingestionSignal('ttn', '/api/ingest/ttn'),
  validateBody(parseTtnPayload),
  rateLimit({ scope: 'ingest:ttn:ip', ...RATE_LIMITS.ttn, key: clientAddress }),
  async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const expectedSecret = process.env.TTN_WEBHOOK_SECRET;

      if (!expectedSecret) {
        throw new BoundaryError(503, 'DEPENDENCY_UNAVAILABLE', 'TTN webhook authentication is not configured');
      }

      const expectedHeader = `Bearer ${expectedSecret}`;
      const provided = Buffer.from(authHeader || '');
      const expected = Buffer.from(expectedHeader);
      const validSecret = provided.length === expected.length && timingSafeEqual(provided, expected);

      if (!validSecret) {
        throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Unauthorized TTN webhook call');
      }

      const payload = req.body as Record<string, unknown>;
      const sourceId = parseTtnSourceId(payload);
      res.locals.ingestionSourceId = sourceId;
      let sourceQuota;
      try {
        sourceQuota = await consumeRateLimit({
          scope: 'ingest:ttn:source',
          ...RATE_LIMITS.ttn,
          key: sourceId,
        });
      } catch (error) {
        if (error instanceof RateLimitDependencyError) {
          throw new BoundaryError(503, 'DEPENDENCY_UNAVAILABLE', 'Rate limiting is temporarily unavailable');
        }
        throw error;
      }
      if (!sourceQuota.allowed) {
        throw new BoundaryError(429, 'RATE_LIMITED', 'Too many requests', sourceQuota.retryAfterSeconds);
      }

      const uplinkMessage = asRecord(payload.uplink_message);
      const decoded = asRecord(uplinkMessage?.decoded_payload);
      const uplinkLocations = asRecord(uplinkMessage?.locations);
      const locationSolvedEnvelope = asRecord(payload.data);
      const locationSolved = asRecord(locationSolvedEnvelope?.location_solved)?.location;
      const solvedLocation = asRecord(locationSolved);

      let location: Record<string, unknown> | undefined;
      let speed: unknown;
      let bearing: unknown;
      let accuracy: unknown;
      let station: unknown;

      if (decoded && hasCoordinateField(decoded)) {
        location = decoded;
        speed = decoded.speed;
        bearing = decoded.bearing ?? decoded.heading;
        accuracy = decoded.accuracy ?? decoded.hdop;
        station = decoded.station;
      } else if (uplinkLocations) {
        const locationEntry = asRecord(uplinkLocations['frm-payload'])
          ?? asRecord(Object.values(uplinkLocations)[0]);
        if (hasCoordinateField(locationEntry)) location = locationEntry;
      }
      if (!location && solvedLocation && hasCoordinateField(solvedLocation)) {
        location = solvedLocation;
        speed = solvedLocation.speed;
        bearing = solvedLocation.bearing ?? solvedLocation.heading;
        accuracy = solvedLocation.accuracy;
      }

      const lat = coordinateValue(location, ['latitude', 'lat']);
      const lng = coordinateValue(location, ['longitude', 'lng']);
      if (lat === undefined && lng === undefined) {
        res.locals.ingestionOutcome = 'ignored';
        res.locals.ingestionReasonCode = 'NO_COORDINATES';
        return res.status(200).json({
          message: 'Tracker status update received. No GPS coordinates present.',
          warnings: ['Missing latitude/longitude in payload'],
          errors: [],
        });
      }
      if (lat === undefined || lng === undefined) {
        throw new BoundaryError(400, 'INVALID_REQUEST', 'TTN coordinates are incomplete');
      }

      const observation = parseTtnObservation({
        sourceId,
        lat: lat as number,
        lng: lng as number,
        speed: speed as number | undefined,
        bearing: bearing as number | undefined,
        accuracy: accuracy as number | undefined,
        station: station as string | undefined,
      });

      const canonicalState = await processObservation({
        ...observation,
        expectedSourceType: 'lorawan',
      });

      res.locals.canonicalEmitted = Boolean(canonicalState);
      res.locals.ingestionVehicleId = canonicalState?.vehicleId;
      res.locals.ingestionSourceType = canonicalState?.sourceType ?? 'lorawan';

      res.status(200).json({
        success: true,
        message: 'TTN Webhook processed successfully',
        canonicalState,
        canonicalLocation: canonicalState,
      });
    } catch (error) {
      const mapped = mapBoundaryError(
        error,
        new BoundaryError(500, 'INTERNAL_ERROR', 'Internal server error during TTN ingestion'),
      );
      res.locals.ingestionReasonCode = mapped.code;
      logBoundaryFailure('Ingest TTN', error);
      sendBoundaryError(
        res,
        error,
        new BoundaryError(500, 'INTERNAL_ERROR', 'Internal server error during TTN ingestion'),
      );
    }
  },
);

export default router;
