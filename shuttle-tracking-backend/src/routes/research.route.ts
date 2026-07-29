import { Router } from 'express';
import {
  exportResearchObservations,
  getResearchObservations,
  getResearchSessions,
} from '../controllers/research.controller.js';
import { requireResearchAccess } from '../middleware/research-access.js';

const router = Router();

router.use(requireResearchAccess);
router.get('/sessions', getResearchSessions);
router.get('/sessions/:sessionId/observations', getResearchObservations);
router.get('/sessions/:sessionId/export.csv', exportResearchObservations);

export default router;
