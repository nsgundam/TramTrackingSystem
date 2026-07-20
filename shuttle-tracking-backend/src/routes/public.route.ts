import { Router } from "express";
import { getActiveRoutes, getActiveVehicles, getPublicStops, getRouteStops } from "../controllers/public.controller.js"
import { submitFeedback } from "../controllers/feedback.controller.js";
import { RATE_LIMITS, clientAddress, rateLimit } from "../middleware/rate-limit.js";
import { parseFeedback, validateBody } from "../middleware/validation.js";

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
router.post(
  '/feedback',
  validateBody(parseFeedback),
  rateLimit({ scope: 'public:feedback', ...RATE_LIMITS.public, key: clientAddress }),
  submitFeedback,
);

export default router;
