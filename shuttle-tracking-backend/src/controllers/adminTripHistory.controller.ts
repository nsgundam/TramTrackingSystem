import type { Request, Response } from 'express';
import {
  BoundaryError,
  logBoundaryFailure,
  sendBoundaryError,
} from '../middleware/boundary-errors.js';
import type { BoundedPaginationInput, TripHistoryListInput } from '../middleware/validation.js';
import {
  getTripHistoryDetail,
  getTripHistoryMetadata,
  listTripHistory,
  streamTripHistoryCsv,
} from '../services/trip-history.service.js';

const internalTripHistoryError = (message: string): BoundaryError =>
  new BoundaryError(500, 'INTERNAL_ERROR', message);

interface ExportWritable {
  destroyed?: boolean;
  writableEnded?: boolean;
  write(chunk: string): boolean;
  once(event: 'drain' | 'close' | 'error', listener: (...args: unknown[]) => void): unknown;
  off(event: 'drain' | 'close' | 'error', listener: (...args: unknown[]) => void): unknown;
}

export const writeExportChunk = async (output: ExportWritable, chunk: string): Promise<void> => {
  if (output.destroyed || output.writableEnded) throw new Error('Export response is unavailable');
  if (output.write(chunk)) return;
  if (output.destroyed || output.writableEnded) throw new Error('Export response is unavailable');

  await new Promise<void>((resolve, reject) => {
    const cleanup = (): void => {
      output.off('drain', onDrain);
      output.off('close', onClose);
      output.off('error', onError);
    };
    const onDrain = (): void => {
      cleanup();
      resolve();
    };
    const onClose = (): void => {
      cleanup();
      reject(new Error('Export response closed'));
    };
    const onError = (): void => {
      cleanup();
      reject(new Error('Export response failed'));
    };

    output.once('drain', onDrain);
    output.once('close', onClose);
    output.once('error', onError);
  });
};

export const listAdminTripHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = res.locals.validatedQuery as TripHistoryListInput;
    res.json(await listTripHistory(query));
  } catch (error) {
    logBoundaryFailure('Admin trip history list', error);
    sendBoundaryError(res, error, internalTripHistoryError('Failed to fetch trip history'));
  }
};

export const getAdminTripHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagination = res.locals.validatedQuery as BoundedPaginationInput;
    res.json(await getTripHistoryDetail(req.params.id as string, pagination));
  } catch (error) {
    logBoundaryFailure('Admin trip history detail', error);
    sendBoundaryError(res, error, internalTripHistoryError('Failed to fetch trip history detail'));
  }
};

export const exportAdminTripHistory = async (req: Request, res: Response): Promise<void> => {
  const tripId = req.params.id as string;
  try {
    const trip = await getTripHistoryMetadata(tripId);
    res.status(200);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="trip-history-${tripId}.csv"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    await streamTripHistoryCsv(trip, (chunk) => writeExportChunk(res, chunk));
    res.end();
  } catch (error) {
    logBoundaryFailure('Admin trip history export', error);
    if (res.headersSent) {
      res.destroy();
      return;
    }
    sendBoundaryError(res, error, internalTripHistoryError('Failed to export trip history'));
  }
};
