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

router.get("/:routeId/path", async (req, res) => {
    const { routeId } = req.params;

    try {
    const stops = await prisma.$queryRaw`
        SELECT s.id,
            ST_Y(s.location::geometry) AS lat,
            ST_X(s.location::geometry) AS lng,
            rs.stop_order
        FROM route_stops rs
        JOIN stops s ON s.id = rs.stop_id
        WHERE rs.route_id = ${routeId}
        ORDER BY rs.stop_order ASC
    `;

    res.json(stops);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch route path" });
    }
});
export default router;