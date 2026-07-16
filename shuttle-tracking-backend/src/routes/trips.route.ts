import { Router } from 'express';
import { startTrip, endTrip } from '../controllers/trips.controller.js';
import { authenticateSenderToken } from '../middleware/auth.js';

const router = Router();

// Mobile API
router.post('/start', authenticateSenderToken, startTrip);
router.put('/:id/end', authenticateSenderToken, endTrip);

export default router;
