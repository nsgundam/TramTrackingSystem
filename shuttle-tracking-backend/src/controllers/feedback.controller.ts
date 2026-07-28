import { Request, Response } from 'express';
import { createFeedback } from '../services/feedback.service.js';
import { BoundaryError, logBoundaryFailure, sendBoundaryError } from '../middleware/boundary-errors.js';
import type { FeedbackInput } from '../middleware/validation.js';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { type, vehicleId, message } = req.body as FeedbackInput;

    // ดึง IP ของ client
    const ipAddress = req.ip || undefined;

    const feedback = await createFeedback(
      { type: type.trim(), vehicleId: vehicleId.trim(), message: message.trim() },
      ipAddress
    );

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error: unknown) {
    logBoundaryFailure('Feedback', error);
    sendBoundaryError(
      res,
      error,
      new BoundaryError(500, 'INTERNAL_ERROR', 'An error occurred while submitting feedback'),
    );
  }
};
