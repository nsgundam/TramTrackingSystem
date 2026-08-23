import { Router } from 'express';
import {
  exportAdminTripHistory,
  getAdminTripHistory,
  listAdminTripHistory,
} from '../controllers/adminTripHistory.controller.js';
import { requireMinimumRole } from '../middleware/auth.js';
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import {
  parseTripHistoryList,
  parseTripHistoryPagination,
  parseTripId,
  validateParam,
  validateQuery,
} from '../middleware/validation.js';

const router = Router();
const tripHistoryReadLimit = rateLimit({
  scope: 'admin:trip-history-read',
  ...RATE_LIMITS.admin,
  key: clientAddress,
});

router.get('/', tripHistoryReadLimit, validateQuery(parseTripHistoryList), listAdminTripHistory);
router.get(
  '/:id/export',
  requireMinimumRole('SUPER_ADMIN'),
  tripHistoryReadLimit,
  validateParam('id', (value) => parseTripId(value)),
  exportAdminTripHistory,
);
router.get(
  '/:id',
  requireMinimumRole('SUPER_ADMIN'),
  tripHistoryReadLimit,
  validateParam('id', (value) => parseTripId(value)),
  validateQuery(parseTripHistoryPagination),
  getAdminTripHistory,
);

export default router;
