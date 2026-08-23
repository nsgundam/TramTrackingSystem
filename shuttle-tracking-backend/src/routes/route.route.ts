import { Router } from "express";
import { getRoutes, getRouteById, updateRoute, deleteRoute, getVehiclesByRouteId, createRoute} from "../controllers/route.controller.js";
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import {
  parseBoundedId,
  parseRouteCreate,
  parseRouteUpdate,
  validateBody,
  validateParam,
} from '../middleware/validation.js';

const router = Router();
const adminWriteLimit = rateLimit({ scope: 'admin:route-write', ...RATE_LIMITS.admin, key: clientAddress });

// GET api/admin/routes
router.get('/', getRoutes);

// GET api/admin/routes/:id
router.get('/:id', validateParam('id', (value) => parseBoundedId(value)), getRouteById);

// POST api/admin/routes
router.post('/', adminWriteLimit, validateBody(parseRouteCreate), createRoute);

// PUT api/admin/routes/:id
router.put('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), validateBody(parseRouteUpdate), updateRoute);

// DELETE api/admin/routes/:id
router.delete('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), deleteRoute);

// GET api/admin/routes/:id/vehicles
router.get('/:id/vehicles', validateParam('id', (value) => parseBoundedId(value)), getVehiclesByRouteId);

export default router;
