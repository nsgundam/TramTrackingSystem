import { Router } from 'express';
import {
  deleteFeedback,
  getDeletedFeedback,
  getFeedbackInbox,
  restoreDeletedFeedback,
  updateFeedback,
} from '../controllers/feedback.controller.js';
import { requireMinimumRole, requireRecentReauthentication } from '../middleware/auth.js';
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import {
  parseFeedbackCaseUpdate,
  parseFeedbackDelete,
  parseFeedbackId,
  validateBody,
  validateParam,
} from '../middleware/validation.js';

const router = Router();
const feedbackWriteLimit = rateLimit({
  scope: 'admin:feedback-write',
  ...RATE_LIMITS.admin,
  key: clientAddress,
});

router.use(requireMinimumRole('SUPER_ADMIN'));
router.get('/deleted', getDeletedFeedback);
router.get('/', getFeedbackInbox);
router.patch(
  '/:id',
  feedbackWriteLimit,
  validateParam('id', parseFeedbackId),
  validateBody(parseFeedbackCaseUpdate),
  updateFeedback,
);
router.post(
  '/:id/delete',
  feedbackWriteLimit,
  requireRecentReauthentication,
  validateParam('id', parseFeedbackId),
  validateBody(parseFeedbackDelete),
  deleteFeedback,
);
router.post(
  '/:id/restore',
  feedbackWriteLimit,
  requireRecentReauthentication,
  validateParam('id', parseFeedbackId),
  restoreDeletedFeedback,
);

export default router;
