import { Router } from "express";
import { createStop, getStopById, getStops, updateStop , deleteStop} from "../controllers/stops.controller.js";
import { RATE_LIMITS, clientAddress, rateLimit } from '../middleware/rate-limit.js';
import {
  parseBoundedId,
  parseStopCreate,
  parseStopUpdate,
  validateBody,
  validateParam,
} from '../middleware/validation.js';

const router = Router();
const adminWriteLimit = rateLimit({ scope: 'admin:stop-write', ...RATE_LIMITS.admin, key: clientAddress });

// GET api/admin/stops
router.get('/', getStops);

// GET api/admin/stops/:id
router.get('/:id', validateParam('id', (value) => parseBoundedId(value)), getStopById);

// POST api/admin/stops
router.post('/', adminWriteLimit, validateBody(parseStopCreate), createStop);

// PUT api/admin/stops/:id
router.put('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), validateBody(parseStopUpdate), updateStop);

// DELETE api/admin/stops/:id
router.delete('/:id', adminWriteLimit, validateParam('id', (value) => parseBoundedId(value)), deleteStop);

export default router;
