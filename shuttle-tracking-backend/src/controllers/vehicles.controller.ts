import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// Get All Vehicles
export const getVehicles = async (req: Request, res: Response) => {
    try{
        const vehicles = await prisma.vehicle.findMany({
            include: { route: true},
            orderBy : { id: 'asc' }
        });
        res.json(vehicles);
    }catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'An error occurred while fetching vehicles' });
    }
};

// Get Vehicle by ID
export const getVehicleById = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: { route: true }
        });
        if (!vehicle) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        res.json(vehicle);
    }catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ error: 'An error occurred while fetching the vehicle' });
    }
};


// Create Vehicle
export const createVehicle = async (req: Request, res: Response) => {
    try{
        const { id, name, type, status, assignedRouteId } = req.body;
        const newVehicle = await prisma.vehicle.create({
            data: {
                id,
                name,
                type,
                status: status || 'inactive',
                assignedRouteId
            }
        });
        res.status(201).json(newVehicle);
    }catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({ error: 'An error occurred while creating the vehicle' });
    }
};

// Update Vehicle
export const updateVehicle = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        const data = req.body;
        const updatedVehicle = await prisma.vehicle.update({
            where: { id },
            data
        });
        res.json(updatedVehicle);
    }catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ error: 'An error occurred while updating the vehicle' });
    }
};

// Delete Vehicle
export const deleteVehicle = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        await prisma.vehicle.delete({
            where: { id }
        });
        res.json({ message: 'Vehicle deleted successfully' });

    }catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ error: 'An error occurred while deleting the vehicle' });
    }
};