import { Router } from "express";
import { createStop, getStopById, getStops, updateStop , deleteStop} from "../controllers/stops.controller.js";

const router = Router();

// GET api/stops
router.get('/', getStops);

// GET api/stops/:id
router.get('/:id', getStopById);

// POST api/stops
router.post('/', createStop);

// PUT api/stops/:id
router.put('/:id', updateStop);

// DELETE api/stops/:id
router.delete('/:id', deleteStop);

export default router;