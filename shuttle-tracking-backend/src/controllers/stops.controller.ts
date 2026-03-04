import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// Get All Stops
export const getStops = async (req: Request, res: Response) => {
    try {
        const stops = await prisma.$queryRaw`
            SELECT 
                id, 
                name_th as "nameTh", 
                name_en as "nameEn", 
                image_url as "imageUrl",
                ST_Y(location::geometry) as lat, 
                ST_X(location::geometry) as lng
            FROM stops
            ORDER BY id ASC
        `;
        res.json(stops);
    } catch (error) {
        console.error('Error fetching stops:', error);
        res.status(500).json({ error: 'Failed to fetch stops' });
    }
};

// Get Stop by ID
export const getStopById = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string
        const stops: any[] = await prisma.$queryRaw`
            SELECT 
                id, 
                name_th as "nameTh", 
                name_en as "nameEn", 
                image_url as "imageUrl",
                ST_Y(location::geometry) as lat, 
                ST_X(location::geometry) as lng
            FROM stops
            WHERE id = ${id}
        `;
        if (stops.length === 0) {
            res.status(404).json({ error: 'Stop not found' });
            return;
        }
        res.json(stops[0]);
    }catch (error) {
        console.error('Error fetching stop:', error);
        res.status(500).json({ error: 'An error occurred while fetching the stop' });
    }
};

// Create Stop
export const createStop = async (req: Request, res: Response) => {
    try {
        const { id, nameTh, nameEn, lat, lng, imageUrl} = req.body;
        if (!id || !nameTh || !nameEn || !lat || !lng) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        await prisma.$executeRaw`
            INSERT INTO stops (id, name_th, name_en, location, image_url)
            VALUES (${id}, ${nameTh}, ${nameEn},ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)::geography, ${imageUrl})
        `;

        const newStops: any[] = await prisma.$queryRaw`
            SELECT 
                id, 
                name_th as "nameTh", 
                name_en as "nameEn", 
                image_url as "imageUrl",
                ST_Y(location::geometry) as lat, 
                ST_X(location::geometry) as lng
            FROM stops
            WHERE id = ${id}
        `;
        if (newStops.length === 0) {
            res.status(404).json({ error: 'Stop not found' });
            return;
        }
        res.json(newStops[0]);
    }catch (error) {
        console.error('Error creating stop:', error);
        res.status(500).json({ error: 'An error occurred while creating the stop' });
    }
};

// Update Stop
export const updateStop = async (req: Request, res: Response) => {
    try {
        const id  = req.params.id as string;
        const { nameTh, nameEn, lat, lng, imageUrl } = req.body;

        if (lat && lng) {
            await prisma.$executeRaw`
                UPDATE stops
                SET 
                    name_th = ${nameTh},
                    name_en = ${nameEn},
                    image_url = ${imageUrl},
                    location = ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)::geography
                WHERE id = ${id}
            `;
        } else {
            await prisma.stop.update({
                where: { id },
                data: {
                    nameTh, 
                    nameEn,
                    imageUrl
                }
            });
        }

        res.json({ message: 'Stop updated successfully', id });
    } catch (error) {
        console.error('Error updating stop:', error);
        res.status(500).json({ error: 'Failed to update stop' });
    }
};

// Delete Stop
export const deleteStop = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        await prisma.stop.delete({
            where: { id },
        });
        res.json({ message: 'Stop deleted successfully' });
    }catch (error) {
        console.error('Error deleting stop:', error);
        res.status(500).json({ error: 'An error occurred while deleting the stop' });
    }
};