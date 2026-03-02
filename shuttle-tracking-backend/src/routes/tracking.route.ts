import { Router } from 'express';
import { updateLocation } from '../controllers/tracking.controller.js';

const router = Router();

// POST /api/tracking/location
router.post('/location', updateLocation);

export default router;