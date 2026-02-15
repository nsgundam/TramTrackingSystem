import { Router } from "express";
import { getRoutes, getRouteById, updateRoute, deleteRoute, getVehiclesByRouteId, createRoute} from "../controllers/route.controller.js";

const router = Router();

// GET api/routes
router.get('/', getRoutes);

// GET api/routes/:id
router.get('/:id', getRouteById);

// POST api/routes
router.post('/', createRoute);

// PUT api/routes/:id
router.put('/:id', updateRoute);

// DELETE api/routes/:id
router.delete('/:id', deleteRoute);

// GET api/routes/:id/vehicles
router.get('/:id/vehicles', getVehiclesByRouteId);

export default router;