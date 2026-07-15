import { Router, Request, Response } from 'express';
import { processObservation } from '../services/tracking.service.js';

const router = Router();

/**
 * Ingest location from ESP32 or Mobile fallback via HTTP POST.
 * Path: POST /api/ingest/http
 */
router.post('/http', async (req: Request, res: Response) => {
  try {
    const { sourceId, token: bodyToken, lat, lng, speed, bearing, accuracy, station } = req.body;
    
    // Extract token from either body or Authorization Bearer header
    let token = bodyToken;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!sourceId) {
       res.status(400).json({ error: 'Missing sourceId' });
       return;
    }

    const canonicalLocation = await processObservation({
      sourceId,
      token,
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
    console.error('[Ingest HTTP] Error processing location:', error.message);
    if (error.message.includes('not found') || error.message.includes('Invalid authentication')) {
      res.status(401).json({ error: error.message });
    } else if (error.message.includes('required') || error.message.includes('bounds')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error during HTTP ingestion' });
    }
  }
});

/**
 * Ingest location from TTN (The Things Network) Webhook.
 * Path: POST /api/ingest/ttn
 */
router.post('/ttn', async (req: Request, res: Response) => {
  try {
    // 1. Verify TTN Webhook Authorization Header (Optional during local dev, enforced if secret exists)
    const authHeader = req.headers.authorization;
    const expectedSecret = process.env.TTN_WEBHOOK_SECRET;

    if (expectedSecret && (!authHeader || authHeader !== `Bearer ${expectedSecret}`)) {
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

    // 3. Extract Decoded Payload fields
    const decoded = payload.uplink_message?.decoded_payload;
    if (!decoded) {
      res.status(400).json({ error: 'Missing decoded_payload in TTN uplink' });
      return;
    }

    // Support standard keys for coordinates
    const lat = decoded.latitude !== undefined ? decoded.latitude : decoded.lat;
    const lng = decoded.longitude !== undefined ? decoded.longitude : decoded.lng;
    const speed = decoded.speed;
    const bearing = decoded.bearing || decoded.heading;
    const accuracy = decoded.accuracy || decoded.hdop;
    const station = decoded.station;

    if (lat === undefined || lng === undefined) {
      res.status(400).json({ error: 'Decoded payload does not contain coordinates (latitude/longitude)' });
      return;
    }

    // 4. Send to Observation Pipeline
    const canonicalLocation = await processObservation({
      sourceId,
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
    console.error('[Ingest TTN] Error processing TTN Webhook:', error.message);
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('bounds')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error during TTN ingestion' });
    }
  }
});

export default router;
