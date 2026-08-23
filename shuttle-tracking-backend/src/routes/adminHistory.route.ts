import { Router } from 'express';
import { getAdminHistory } from '../controllers/adminHistory.controller.js';
import { requireMinimumRole } from '../middleware/auth.js';
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import { parseAdminHistoryList, validateQuery } from '../middleware/validation.js';

const router = Router();
const adminHistoryReadLimit = rateLimit({
  scope: 'admin:admin-history-read',
  ...RATE_LIMITS.admin,
  key: clientAddress,
});

router.get(
  '/',
  requireMinimumRole('SUPER_ADMIN'),
  adminHistoryReadLimit,
  validateQuery(parseAdminHistoryList),
  getAdminHistory,
);

export default router;
