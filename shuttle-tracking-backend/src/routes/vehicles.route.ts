import { Router } from "express";
import { createVehicle, getVehicleById, getVehicles, updateVehicle , deleteVehicle} from "../controllers/vehicles.controller.js";

const router = Router();

// GET api/vehicles
router.get('/', getVehicles);

// GET api/vehicles/:id
router.get('/:id', getVehicleById);

// POST api/vehicles
router.post('/', createVehicle);

// PUT api/vehicles/:id
router.put('/:id', updateVehicle);

// DELETE api/vehicles/:id
router.delete('/id', deleteVehicle);

export default router;