import { Router } from "express";
import { getRoutes, getRouteById, updateRoute, deleteRoute, getVehiclesByRouteId, createRoute} from "../controllers/route.controller.js";
import { prisma } from "../config/prisma.js";

const router = Router();

// GET api/admin/routes
router.get('/', getRoutes);

// GET api/admin/routes/:id
router.get('/:id', getRouteById);

// POST api/admin/routes
router.post('/', createRoute);

// PUT api/admin/routes/:id
router.put('/:id', updateRoute);

// DELETE api/admin/routes/:id
router.delete('/:id', deleteRoute);

// GET api/admin/routes/:id/vehicles
router.get('/:id/vehicles', getVehiclesByRouteId);

export default router;