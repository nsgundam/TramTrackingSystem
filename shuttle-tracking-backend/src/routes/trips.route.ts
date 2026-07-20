import { Router } from 'express';
import { startTrip, endTrip } from '../controllers/trips.controller.js';
import { authenticateSenderToken } from '../middleware/auth.js';
import { RATE_LIMITS, rateLimit, senderKey } from '../middleware/rate-limit.js';
import { parseTripId, parseTripStart, validateBody, validateParam } from '../middleware/validation.js';

const router = Router();

// Mobile API
const senderTripLimit = rateLimit({ scope: 'sender:trip-write', ...RATE_LIMITS.sender, key: senderKey });

router.post('/start', validateBody(parseTripStart), authenticateSenderToken, senderTripLimit, startTrip);
router.put(
  '/:id/end',
  validateParam('id', (value) => parseTripId(value)),
  authenticateSenderToken,
  senderTripLimit,
  endTrip,
);

export default router;
