import { Router } from 'express';
import {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceAnalytics
} from '../controllers/devices.controller.js';
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import { parseBoundedId, parseDeviceCreate, parseDeviceUpdate, validateBody, validateParam } from '../middleware/validation.js';

const router = Router();

// Developer Analytics Endpoint
router.get('/analytics', getDeviceAnalytics);

// CRUD Endpoints
router.get('/', getDevices);
router.get('/:id', getDeviceById);
const adminWriteLimit = rateLimit({ scope: 'admin:device-write', ...RATE_LIMITS.admin, key: clientAddress });

router.post('/', adminWriteLimit, validateBody(parseDeviceCreate), createDevice);
router.put('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), validateBody(parseDeviceUpdate), updateDevice);
router.delete('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), deleteDevice);

export default router;
