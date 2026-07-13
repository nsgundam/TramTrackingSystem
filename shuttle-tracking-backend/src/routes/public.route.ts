import { Router } from "express";
import { getActiveRoutes, getActiveVehicles, getPublicStops, getRouteStops } from "../controllers/public.controller.js"
import { submitFeedback } from "../controllers/feedback.controller.js";

const router = Router();

// GET api/public/active-routes
router.get('/active-routes', getActiveRoutes);

// GET api/public/active-vehicles
router.get('/active-vehicles', getActiveVehicles);

// GET api/public/routes/:id/stops
router.get('/routes/:id/stops', getRouteStops);

// GET api/public/stops
router.get('/stops', getPublicStops);

// POST api/public/feedback
router.post('/feedback', submitFeedback);

export default router;
