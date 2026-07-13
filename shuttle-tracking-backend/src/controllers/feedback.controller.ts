import { Request, Response } from 'express';
import { createFeedback } from '../services/feedback.service.js';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { type, vehicleId, message } = req.body;

    // ---- Validation ----
    if (!type || typeof type !== 'string' || type.trim() === '') {
      res.status(400).json({ error: 'Field "type" is required and must be a non-empty string.' });
      return;
    }

    if (!vehicleId || typeof vehicleId !== 'string' || vehicleId.trim() === '') {
      res.status(400).json({ error: 'Field "vehicleId" is required and must be a non-empty string.' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ error: 'Field "message" is required and must be a non-empty string.' });
      return;
    }

    // ดึง IP ของ client (รองรับ proxy/load balancer)
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      undefined;

    const feedback = await createFeedback(
      { type: type.trim(), vehicleId: vehicleId.trim(), message: message.trim() },
      ipAddress
    );

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error: unknown) {
    // vehicleId ไม่พบในระบบ
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }

    console.error('[Feedback] Error submitting feedback:', error);
    res.status(500).json({ error: 'An error occurred while submitting feedback.' });
  }
};
