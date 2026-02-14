import { Router } from "express";
import { getRoutes, getRouteById, updateRoute, deleteRoute } from "../controllers/route.controller.js";

const router = Router();

// GET api/routes
router.get('/', getRoutes);

// GET api/routes/:id
router.get('/:id', getRouteById);

// PUT api/routes/:id
router.put('/:id', updateRoute);

// DELETE api/routes/:id
router.delete('/:id', deleteRoute);

export default router;