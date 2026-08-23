import type { Request, Response } from 'express';
import { BoundaryError, logBoundaryFailure, sendBoundaryError } from '../middleware/boundary-errors.js';
import type { AdminHistoryListInput } from '../middleware/validation.js';
import { listAdminHistory } from '../services/admin-audit.service.js';

export const getAdminHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = res.locals.validatedQuery as AdminHistoryListInput;
    res.json(await listAdminHistory(query));
  } catch (error) {
    logBoundaryFailure('Admin history list', error);
    sendBoundaryError(
      res,
      error,
      new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to fetch admin history'),
    );
  }
};
