import { Request, Response } from 'express';
import {
  createFeedback,
  listFeedbackCases,
  restoreFeedback,
  softDeleteFeedback,
  updateFeedbackCase,
} from '../services/feedback.service.js';
import { BoundaryError, logBoundaryFailure, sendBoundaryError } from '../middleware/boundary-errors.js';
import type { FeedbackCaseUpdateInput, FeedbackDeleteInput, FeedbackInput } from '../middleware/validation.js';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { type, vehicleId, message } = req.body as FeedbackInput;

    // The public route's Redis rate-limit middleware consumes the client address before this
    // controller. Do not persist it with anonymous feedback.
    const feedback = await createFeedback({
      type: type.trim(),
      vehicleId: vehicleId === null ? null : vehicleId.trim(),
      message: message.trim(),
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error: unknown) {
    logBoundaryFailure('Feedback', error);
    sendBoundaryError(
      res,
      error,
      new BoundaryError(500, 'INTERNAL_ERROR', 'An error occurred while submitting feedback'),
    );
  }
};

const currentAdmin = (req: Request) => {
  if (!req.admin) {
    throw new BoundaryError(401, 'AUTHENTICATION_FAILED', 'Authentication required');
  }
  return req.admin;
};

export const getFeedbackInbox = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await listFeedbackCases(false);
    res.json(feedback);
  } catch (error) {
    logBoundaryFailure('Feedback inbox', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch feedback'));
  }
};

export const getDeletedFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await listFeedbackCases(true);
    res.json(feedback);
  } catch (error) {
    logBoundaryFailure('Deleted feedback inbox', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch feedback'));
  }
};

export const updateFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await updateFeedbackCase(
      req.params.id as string,
      req.body as FeedbackCaseUpdateInput,
      currentAdmin(req),
    );
    res.json(feedback);
  } catch (error) {
    logBoundaryFailure('Feedback update', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to update feedback'));
  }
};

export const deleteFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body as FeedbackDeleteInput;
    const feedback = await softDeleteFeedback(req.params.id as string, reason, currentAdmin(req));
    res.json(feedback);
  } catch (error) {
    logBoundaryFailure('Feedback delete', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to delete feedback'));
  }
};

export const restoreDeletedFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await restoreFeedback(req.params.id as string, currentAdmin(req));
    res.json(feedback);
  } catch (error) {
    logBoundaryFailure('Feedback restore', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to restore feedback'));
  }
};
