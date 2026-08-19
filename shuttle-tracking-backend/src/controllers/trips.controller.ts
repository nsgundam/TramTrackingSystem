import { Request, Response } from 'express';
import { redisClient } from '../config/redis.js';
import {
  BoundaryError,
  logBoundaryFailure,
  sendBoundaryError,
} from '../middleware/boundary-errors.js';
import type { TripStartInput } from '../middleware/validation.js';
import { endOperationalTrip, recordTripActivity, startOperationalTrip } from '../services/operations.service.js';
import { publishVehicleStateTransition } from '../services/canonical-state.service.js';

export const startTrip = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.body as TripStartInput;
        const sender = req.sender;

        if (!sender) {
            throw new BoundaryError(401, 'SENDER_AUTH_REQUIRED', 'Sender authentication required');
        }

        if (vehicleId && vehicleId !== sender.vehicleId) {
            throw new BoundaryError(403, 'SENDER_OWNERSHIP_MISMATCH', 'Sender cannot operate this vehicle');
        }

        const result = await startOperationalTrip(sender.vehicleId, new Date(), sender.sourceId);

        res.status(result.created ? 201 : 200).json({
            message: result.created ? 'Trip started successfully' : 'Trip already started',
            idempotent: !result.created,
            trip: result.trip,
        });

    } catch (error) {
        logBoundaryFailure('Trip start', error);
        sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to start trip'));
    }
};

export const heartbeatTrip = async (req: Request, res: Response) => {
    try {
        const sender = req.sender;
        if (!sender) {
            throw new BoundaryError(401, 'SENDER_AUTH_REQUIRED', 'Sender authentication required');
        }

        const result = await recordTripActivity(req.params.id as string, sender.vehicleId);
        if (result.trip.status !== 'in_progress') {
            await Promise.allSettled([
                redisClient.del(`trip:last_saved:${req.params.id as string}`),
                redisClient.del(`trip:last_saved:vehicle:${sender.vehicleId}`),
                publishVehicleStateTransition({
                    vehicleId: sender.vehicleId,
                    serviceState: 'no_service',
                    reasonCode: 'NO_ACTIVE_TRIP',
                }),
            ]);
            throw new BoundaryError(409, 'CONFLICT', 'Trip exceeded the inactivity timeout');
        }
        res.json({
            message: result.updated ? 'Trip activity recorded' : 'Trip activity already current',
            trip: result.trip,
        });
    } catch (error) {
        logBoundaryFailure('Trip heartbeat', error);
        sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to record trip activity'));
    }
};

export const endTrip = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const sender = req.sender;

        if (!sender) {
            throw new BoundaryError(401, 'SENDER_AUTH_REQUIRED', 'Sender authentication required');
        }

        const result = await endOperationalTrip(id, sender.vehicleId);

        await Promise.allSettled([
            redisClient.del(`trip:last_saved:${id}`),
            redisClient.del(`trip:last_saved:vehicle:${sender.vehicleId}`),
            publishVehicleStateTransition({
                vehicleId: sender.vehicleId,
                serviceState: 'no_service',
                reasonCode: 'NO_ACTIVE_TRIP',
            }),
        ]);

        res.json({
            message: result.idempotent ? 'Trip already ended' : 'Trip ended successfully',
            idempotent: result.idempotent,
            trip: result.trip,
        });

    } catch (error) {
        logBoundaryFailure('Trip end', error);
        sendBoundaryError(res, error, new BoundaryError(500, 'INTERNAL_ERROR', 'Failed to end trip'));
    }
};
