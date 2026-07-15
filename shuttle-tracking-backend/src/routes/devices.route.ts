import { Router } from 'express';
import {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceAnalytics
} from '../controllers/devices.controller.js';

const router = Router();

// Developer Analytics Endpoint
router.get('/analytics', getDeviceAnalytics);

// CRUD Endpoints
router.get('/', getDevices);
router.get('/:id', getDeviceById);
router.post('/', createDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);

export default router;
