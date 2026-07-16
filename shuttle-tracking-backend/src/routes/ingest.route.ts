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

    // 2. Extract Device ID — support both top-level and nested (location_solved) formats
    const sourceId =
      payload.end_device_ids?.device_id;

    if (!sourceId) {
      res.status(400).json({ error: 'Missing device_id or dev_eui in TTN payload' });
      return;
    }

    console.log(`[Ingest TTN] sourceId: ${sourceId}, event: ${payload.name || 'uplink'}`);

    // 3. Extract location data — support both uplink_message and location_solved formats
    let lat: number | undefined;
    let lng: number | undefined;
    let speed: number | undefined;
    let bearing: number | undefined;
    let accuracy: number | undefined;
    let station: string | undefined;

    const decoded = payload.uplink_message?.decoded_payload;
    const uplinkLocations = payload.uplink_message?.locations;
    const locationSolved = payload.data?.location_solved?.location;

    if (decoded && (decoded.latitude !== undefined || decoded.longitude !== undefined)) {
      // Standard uplink_message with decoded_payload containing coordinates
      lat = decoded.latitude !== undefined ? decoded.latitude : decoded.lat;
      lng = decoded.longitude !== undefined ? decoded.longitude : decoded.lng;
      speed = decoded.speed;
      bearing = decoded.bearing ?? decoded.heading;
      accuracy = decoded.accuracy ?? decoded.hdop;
      station = decoded.station;
    } else if (uplinkLocations) {
      // Heartbeat / Location Failure — coordinates are in uplink_message.locations
      // e.g. locations: { "frm-payload": { latitude: ..., longitude: ... } }
      const locEntry = uplinkLocations['frm-payload'] || Object.values(uplinkLocations)[0] as any;
      if (locEntry && locEntry.latitude !== undefined && locEntry.longitude !== undefined) {
        lat = locEntry.latitude;
        lng = locEntry.longitude;
        speed = undefined;
        bearing = undefined;
        accuracy = undefined;
        station = undefined;
      }
    } else if (locationSolved && locationSolved.latitude !== undefined && locationSolved.longitude !== undefined) {
      // TTN location_solved event (as.up.location.forward)
      lat = locationSolved.latitude;
      lng = locationSolved.longitude;
      speed = locationSolved.speed;
      bearing = locationSolved.bearing ?? locationSolved.heading;
      accuracy = locationSolved.accuracy;
      station = undefined;
    }

    if (lat === undefined || lng === undefined) {
      // Respond with 200 OK so TTN doesn't mark the webhook as failed,
      // but skip the database insertion.
      console.log('   TTN payload does not contain GPS coordinates (latitude/longitude)');
      return res.status(200).json({
        message: "Tracker status update received. No GPS coordinates present.",
        warnings: ["Missing latitude/longitude in payload"],
        errors: []
      });
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
