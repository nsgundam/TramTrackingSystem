import { Router } from 'express';
import { scanVehicleQr } from '../controllers/assignment.controller.js';
import { authenticateSenderIdentityToken } from '../middleware/auth.js';
import { RATE_LIMITS, rateLimit, senderIdentityKey } from '../middleware/rate-limit.js';
import { parseMobileQrAssignment, validateBody } from '../middleware/validation.js';

const router = Router();

router.post(
  '/mobile/scan',
  validateBody(parseMobileQrAssignment),
  authenticateSenderIdentityToken,
  rateLimit({ scope: 'sender:assignment', ...RATE_LIMITS.sender, key: senderIdentityKey }),
  scanVehicleQr,
);

export default router;
