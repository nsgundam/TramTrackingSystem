import { Router } from "express";
import { createVehicle, getVehicleById, getVehicleAssignmentQr, getVehicles, updateVehicle , deleteVehicle} from "../controllers/vehicles.controller.js";
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import {
  parseBoundedId,
  parseVehicleCreate,
  parseVehicleUpdate,
  validateBody,
  validateParam,
} from '../middleware/validation.js';

const router = Router();
const adminWriteLimit = rateLimit({ scope: 'admin:vehicle-write', ...RATE_LIMITS.admin, key: clientAddress });

// GET api/admin/vehicles
router.get('/', getVehicles);

// GET api/admin/vehicles/:id
router.get('/:id/assignment-qr', validateParam('id', (value) => parseBoundedId(value)), getVehicleAssignmentQr);
router.get('/:id', validateParam('id', (value) => parseBoundedId(value)), getVehicleById);

// POST api/admin/vehicles
router.post('/', adminWriteLimit, validateBody(parseVehicleCreate), createVehicle);

// PUT api/admin/vehicles/:id
router.put('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), validateBody(parseVehicleUpdate), updateVehicle);

// DELETE api/admin/vehicles/:id
router.delete('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), deleteVehicle);

export default router;
