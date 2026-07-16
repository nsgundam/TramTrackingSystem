import { Router, Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { processObservation } from '../services/tracking.service.js';
import { authenticateSenderToken } from '../middleware/auth.js';

const router = Router();

/**
 * Ingest location from ESP32 or Mobile fallback via HTTP POST.
 * Path: POST /api/ingest/http
 */
router.post('/http', authenticateSenderToken, async (req: Request, res: Response) => {
  try {
    const { sourceId, lat, lng, speed, bearing, accuracy, station, tripId } = req.body;
    const sender = req.sender;

    if (!sourceId) {
       res.status(400).json({ error: 'Missing sourceId' });
       return;
    }

    if (!sender || sender.sourceId !== sourceId) {
      res.status(403).json({ error: 'Sender cannot submit for this source' });
      return;
    }

    const canonicalLocation = await processObservation({
      sourceId,
      sender,
      tripId,
      lat,
      lng,
      speed,
      bearing,
      accuracy,
      station
    });

    // Broadcast live high-fidelity update via Socket.IO
    if (canonicalLocation) {
      const io = req.app.get('socketio');
      if (io) {
        io.emit('location-update', canonicalLocation);
      }
    }

      res.status(200).json({
        success: true,
        message: 'Location observation processed successfully',
        canonicalLocation
      });

  } catch (error: any) {
    const message = error instanceof Error ? error.message : '';
    console.error('[Ingest HTTP] Location observation rejected:', message);
    if (message.includes('source') || message.includes('credential')) {
      res.status(403).json({ code: 'SOURCE_CREDENTIAL_INVALID', error: 'Sender cannot submit for this source' });
    } else if (message.includes('Trip')) {
      res.status(403).json({ code: 'TRIP_OWNERSHIP_MISMATCH', error: 'Trip is invalid or does not belong to the sender vehicle' });
    } else if (message.includes('required') || message.includes('bounds')) {
      res.status(400).json({ code: 'INVALID_LOCATION', error: 'Location payload is invalid' });
    } else {
      res.status(500).json({ code: 'INGESTION_ERROR', error: 'Internal server error during HTTP ingestion' });
    }
  }
});

/**
 * Ingest location from TTN (The Things Network) Webhook.
 * Path: POST /api/ingest/ttn
 */
router.post('/ttn', async (req: Request, res: Response) => {
  try {
    // TTN is a server-to-server boundary. It must always have an explicit secret.
    const authHeader = req.headers.authorization;
    const expectedSecret = process.env.TTN_WEBHOOK_SECRET;

    if (!expectedSecret) {
      res.status(503).json({ error: 'TTN webhook authentication is not configured' });
      return;
    }

    const expectedHeader = `Bearer ${expectedSecret}`;
    const provided = Buffer.from(authHeader || '');
    const expected = Buffer.from(expectedHeader);
    const validSecret = provided.length === expected.length && timingSafeEqual(provided, expected);

    if (!validSecret) {
      res.status(401).json({ error: 'Unauthorized TTN Webhook call' });
      return;
    }

    const payload = req.body;

    // 2. Extract Device ID mapping to sourceId
    const sourceId = payload.end_device_ids?.device_id || payload.end_device_ids?.dev_eui;
    if (!sourceId) {
      res.status(400).json({ error: 'Missing device_id or dev_eui in TTN payload' });
      return;
    }
    
    console.log(sourceId);

    // 3. Extract Decoded Payload fields
    const decoded = payload.uplink_message?.decoded_payload;

    if (!decoded || !decoded.latitude || !decoded.longitude) {
      // Respond with 200 OK so TTN doesn't mark the webhook as failed, 
      // but skip the Prisma database insertion.
      console.log('   TTN payload does not contain GPS coordinates (latitude/longitude)');
      return res.status(200).json({
        message: "Tracker status update received. No GPS coordinates present.",
        warnings: ["Missing latitude/longitude in payload"],
        errors: []
      });
    }

    // Support standard keys for coordinates
    const lat = decoded.latitude !== undefined ? decoded.latitude : decoded.lat;
    const lng = decoded.longitude !== undefined ? decoded.longitude : decoded.lng;
    const speed = decoded.speed;
    const bearing = decoded.bearing ?? decoded.heading;
    const accuracy = decoded.accuracy ?? decoded.hdop;
    const station = decoded.station;

    if (lat === undefined || lng === undefined) {
      res.status(400).json({ error: 'Decoded payload does not contain coordinates (latitude/longitude)' });
      return;
    }

    // 4. Send to Observation Pipeline
    const canonicalLocation = await processObservation({
      sourceId,
      expectedSourceType: 'lorawan',
      lat,
      lng,
      speed,
      bearing,
      accuracy,
      station
    });

    // 5. Broadcast live high-fidelity update via Socket.IO
    if (canonicalLocation) {
      const io = req.app.get('socketio');
      if (io) {
        io.emit('location-update', canonicalLocation);
      }
    }

    res.status(200).json({
      success: true,
      message: 'TTN Webhook processed successfully',
      canonicalLocation
    });

  } catch (error: any) {
    const message = error instanceof Error ? error.message : '';
    console.error('[Ingest TTN] TTN webhook rejected:', message);
    if (message.includes('not found')) {
      res.status(404).json({ code: 'SOURCE_NOT_FOUND', error: 'TTN source is not registered' });
    } else if (message.includes('not a lorawan')) {
      res.status(400).json({ code: 'SOURCE_TYPE_MISMATCH', error: 'TTN source type is invalid' });
    } else if (message.includes('bounds')) {
      res.status(400).json({ code: 'INVALID_COORDINATES', error: 'Coordinates are invalid' });
    } else {
      res.status(500).json({ code: 'INGESTION_ERROR', error: 'Internal server error during TTN ingestion' });
    }
  }
});

export default router;
