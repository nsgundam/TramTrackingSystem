import { Router } from 'express';
import { getme, login, reauthenticate } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginVehicle } from '../controllers/auth.controller.js';
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import { parseAdminLogin, parseAdminReauthentication, parseSenderLogin, validateBody } from '../middleware/validation.js';

const router = Router();

// POST api/auth/login
router.post(
  '/login',
  validateBody(parseAdminLogin),
  rateLimit({ scope: 'auth:admin', ...RATE_LIMITS.auth, key: clientAddress }),
  login,
);

router.post(
  '/reauthenticate',
  authenticateToken,
  validateBody(parseAdminReauthentication),
  rateLimit({ scope: 'auth:admin-reauthenticate', ...RATE_LIMITS.auth, key: clientAddress }),
  reauthenticate,
);
router.post(
  '/vehicle-login',
  validateBody(parseSenderLogin),
  rateLimit({
    scope: 'auth:sender',
    ...RATE_LIMITS.auth,
    key: (req) => `source:${req.body.sourceId}:ip:${clientAddress(req)}`,
  }),
  loginVehicle,
);

// GET api/auth/me
router.get('/me', authenticateToken, getme);

export default router;
