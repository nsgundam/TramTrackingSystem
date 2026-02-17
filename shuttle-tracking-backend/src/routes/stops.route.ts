import { Router } from "express";
import { createStop, getStopById, getStops, updateStop , deleteStop} from "../controllers/stops.controller.js";

const router = Router();

// GET api/admin/stops
router.get('/', getStops);

// GET api/admin/stops/:id
router.get('/:id', getStopById);

// POST api/admin/stops
router.post('/', createStop);

// PUT api/admin/stops/:id
router.put('/:id', updateStop);

// DELETE api/admin/stops/:id
router.delete('/:id', deleteStop);

export default router;