import { Router, Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { processObservation } from '../services/tracking.service.js';
import { authenticateSenderToken } from '../middleware/auth.js';
import {
  BoundaryError,
  logBoundaryFailure,
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

/**
 * Ingest location from ESP32 or Mobile fallback via HTTP POST.
 * Path: POST /api/ingest/http
 */
router.post(
  '/http',
  validateBody(parseObservation),
  authenticateSenderToken,
  sourceLimit,
  async (req: Request, res: Response) => {
    try {
      const observation = req.body as ObservationInput;
      const sender = req.sender;

      if (!sender || sender.sourceId !== observation.sourceId) {
        throw new BoundaryError(403, 'SENDER_OWNERSHIP_MISMATCH', 'Sender cannot submit for this source');
      }

      const canonicalLocation = await processObservation({
        ...observation,
        sender,
      });

      if (canonicalLocation) {
        const io = req.app.get('socketio');
        if (io) io.emit('location-update', canonicalLocation);
      }

      res.status(200).json({
        success: true,
        message: 'Location observation processed successfully',
        canonicalLocation,
      });
    } catch (error) {
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

      const canonicalLocation = await processObservation({
        ...observation,
        expectedSourceType: 'lorawan',
      });

      if (canonicalLocation) {
        const io = req.app.get('socketio');
        if (io) io.emit('location-update', canonicalLocation);
      }

      res.status(200).json({
        success: true,
        message: 'TTN Webhook processed successfully',
        canonicalLocation,
      });
    } catch (error) {
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
