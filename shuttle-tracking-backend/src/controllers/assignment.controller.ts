import { Request, Response } from 'express';
import {
  BoundaryError,
  logBoundaryFailure,
  sendBoundaryError,
} from '../middleware/boundary-errors.js';
import type { MobileQrAssignmentInput } from '../middleware/validation.js';
import { assignMobileSourceToVehicle } from '../services/tracking-assignment.service.js';
import { resolveVehicleIdFromQrToken, vehicleQrUri } from '../services/vehicle-qr.service.js';
import { refreshCanonicalState } from '../services/canonical-state.service.js';

export const scanVehicleQr = async (req: Request, res: Response): Promise<void> => {
  try {
    const sender = req.senderIdentity;
    if (!sender) {
      throw new BoundaryError(401, 'SENDER_AUTH_REQUIRED', 'Sender authentication required');
    }

    const { qrToken } = req.body as MobileQrAssignmentInput;
    const vehicleId = resolveVehicleIdFromQrToken(qrToken);
    if (!vehicleId) {
      throw new BoundaryError(422, 'INVALID_REQUEST', 'Vehicle QR token is invalid');
    }

    const result = await assignMobileSourceToVehicle({
      sourceId: sender.sourceId,
      vehicleId,
      expectedAssignmentId: sender.assignmentId,
    });
    await Promise.allSettled([
      result.previousVehicleId
        ? refreshCanonicalState(result.previousVehicleId)
        : Promise.resolve(),
      refreshCanonicalState(result.assignment.vehicleId),
    ]);

    res.json({
      sourceId: sender.sourceId,
      vehicleId: result.assignment.vehicleId,
      assignmentId: result.assignment.id,
      assignedAt: result.assignment.assignedAt,
      qrUri: vehicleQrUri(qrToken),
    });
  } catch (error) {
    logBoundaryFailure('Mobile QR assignment', error);
    sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Vehicle QR assignment failed'));
  }
};
