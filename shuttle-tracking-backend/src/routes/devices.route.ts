import { Router } from 'express';
import {
  getDevices,
  getDeviceById,
  getDeviceHealth,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceAnalytics,
  getDeviceAssignments,
  assignDevice,
  unassignDevice,
} from '../controllers/devices.controller.js';
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import {
  parseBoundedId,
  parseDeviceAssignment,
  parseDeviceCreate,
  parseDeviceUpdate,
  validateBody,
  validateParam,
} from '../middleware/validation.js';
import { requireMinimumRole } from '../middleware/auth.js';

const router = Router();
const adminWriteLimit = rateLimit({ scope: 'admin:device-write', ...RATE_LIMITS.admin, key: clientAddress });

// Developer Analytics Endpoint
router.get('/analytics', getDeviceAnalytics);
router.get('/health', requireMinimumRole('ADMIN'), getDeviceHealth);
router.get('/:id/assignments', validateParam('id', (value) => parseBoundedId(value)), getDeviceAssignments);
router.put(
  '/:id/assignment',
  adminWriteLimit,
  validateParam('id', (value) => parseBoundedId(value)),
  validateBody(parseDeviceAssignment),
  assignDevice,
);
router.delete(
  '/:id/assignment',
  adminWriteLimit,
  validateParam('id', (value) => parseBoundedId(value)),
  unassignDevice,
);

// CRUD Endpoints
router.get('/', getDevices);
router.get('/:id', getDeviceById);

router.post('/', adminWriteLimit, validateBody(parseDeviceCreate), createDevice);
router.put('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), validateBody(parseDeviceUpdate), updateDevice);
router.delete('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), deleteDevice);

export default router;
