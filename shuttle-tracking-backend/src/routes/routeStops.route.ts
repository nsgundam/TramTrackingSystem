import { Router } from "express";
import { getAllRouteStops, getStopsByRoute, createRouteStop, deleteRouteStop } from "../controllers/routeStops.controller.js";
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import { parseRouteStopCreate, parseTripId, validateBody, validateParam } from '../middleware/validation.js';

const router = Router();

// GET api/admin/rpute-stops
router.get('/', getAllRouteStops);

// GET api/admin/route-stops/:routeId
router.get('/:routeId', getStopsByRoute);

// POST api/admin/route-stops
const adminWriteLimit = rateLimit({ scope: 'admin:route-stop-write', ...RATE_LIMITS.admin, key: clientAddress });

router.post('/', adminWriteLimit, validateBody(parseRouteStopCreate), createRouteStop);

// DELETE api/admin/route-stops/:id
router.delete('/:id', adminWriteLimit, validateParam('id', (value) => parseTripId(value)), deleteRouteStop);

export default router;
