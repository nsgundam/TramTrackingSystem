import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// Get All Routes
export const getRoutes = async (req: Request, res: Response) => {
    try{
        const routes = await prisma.route.findMany({
            orderBy : { id: 'asc' }
        });
        res.json(routes);
    }catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ error: 'An error occurred while fetching routes' });
    }
};

// Get Route by ID
export const getRouteById = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string
        const route = await prisma.route.findUnique({
            where: { id },
        });
        if (!route) {
            res.status(404).json({ error: 'Route not found' });
            return;
        }
        res.json(route);
    }catch (error) {
        console.error('Error fetching route:', error);
        res.status(500).json({ error: 'An error occurred while fetching the route' });
    }
};

// Create Route
export const createRoute = async (req: Request, res: Response) => {
    try {
        const { id, name, color, status} = req.body;
        const newRoute = await prisma.route.create({
            data: {
                id,
                name,
                color,
                status: status || 'inactive',
            }
        });
        res.status(201).json(newRoute);
        
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(500).json({ error: 'An error occurred while creating the route' });
    }
};

// Update Route
export const updateRoute = async (req: Request, res: Response) => {
    try{
        const id = req.query.id as string;
        const data = req.body;
        const updatedRoute = await prisma.route.update({
            where: { id },
            data
        });
        res.json(updatedRoute);
    }catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({ error: 'An error occurred while updating the route' });
    }
};

// Delete Route
export const deleteRoute = async (req: Request, res: Response) => {
    try{
        const id = req.query.id as string;
        await prisma.route.delete({
            where: { id },
        });
        res.json({ message: 'Route deleted successfully' });
    }catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({ error: 'An error occurred while deleting the route' });
    }
};