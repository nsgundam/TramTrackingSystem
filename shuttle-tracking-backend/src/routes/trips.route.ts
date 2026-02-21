import { Router } from 'express';
import { startTrip, endTrip } from '../controllers/trips.controller.js';

const router = Router();

// Mobile API
router.post('/start', startTrip);
router.put('/:id/end', endTrip);

export default router;