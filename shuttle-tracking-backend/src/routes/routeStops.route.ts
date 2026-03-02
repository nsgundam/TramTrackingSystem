import { Router } from "express";
import { getAllRouteStops, getStopsByRoute, createRouteStop, deleteRouteStop } from "../controllers/routeStops.controller.js";

const router = Router();

// GET api/admin/rpute-stops
router.get('/', getAllRouteStops);

// GET api/admin/route-stops/:routeId
router.get('/:routeId', getStopsByRoute);

// POST api/admin/route-stops
router.post('/', createRouteStop);

// DELETE api/admin/route-stops/:id
router.delete('/:id', deleteRouteStop);

export default router;