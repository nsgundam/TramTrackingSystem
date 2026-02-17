import { Router } from "express";
import { createVehicle, getVehicleById, getVehicles, updateVehicle , deleteVehicle} from "../controllers/vehicles.controller.js";

const router = Router();

// GET api/admin/vehicles
router.get('/', getVehicles);

// GET api/admin/vehicles/:id
router.get('/:id', getVehicleById);

// POST api/admin/vehicles
router.post('/', createVehicle);

// PUT api/admin/vehicles/:id
router.put('/:id', updateVehicle);

// DELETE api/admin/vehicles/:id
router.delete('/:id', deleteVehicle);

export default router;