import { Router } from 'express';
import { getme, login } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginVehicle } from '../controllers/auth.controller.js';

const router = Router();

// POST api/auth/login
router.post('/login', login);
router.post('/vehicle-login', loginVehicle);

// GET api/auth/me
router.get('/me', authenticateToken, getme);

export default router;