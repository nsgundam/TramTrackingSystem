import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// Get All Stops
export const getStops = async (req: Request, res: Response) => {
    try{
        const stops = await prisma.stop.findMany({
            orderBy : { id: 'asc' }
        });
        res.json(stops);
    }catch (error) {
        console.error('Error fetching stops:', error);
        res.status(500).json({ error: 'An error occurred while fetching stops' });
    }
};

// Get Stop by ID
export const getStopById = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string
        const stop = await prisma.stop.findUnique({
            where: { id },
        });
        if (!stop) {
            res.status(404).json({ error: 'Stop not found' });
            return;
        }
        res.json(stop);
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
            INSERT INTO "Stop" (id, name_th, name_en, lat, lng, image_url)
            VALUES (${id}, ${nameTh}, ${nameEn},ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${imageUrl})
        `;

        const newStop = await prisma.stop.findUnique({ where: { id } });
        res.status(201).json(newStop);
    }catch (error) {
        console.error('Error creating stop:', error);
        res.status(500).json({ error: 'An error occurred while creating the stop' });
    }
};

// Update Stop
export const updateStop = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        const data = req.body;
        if (data.lat && data.lng) {
            await prisma.$executeRaw`
                UPDATE "Stop"
                SET name_th = ${data.nameTh},
                    name_en = ${data.nameEn},
                    lat = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)::geography,
                    image_url = ${data.imageUrl}
                WHERE id = ${id}
            `;
        } else {
            await prisma.stop.update({
                where: { id },
                data: {
                    nameTh: data.nameTh,
                    nameEn: data.nameEn,
                    imageUrl: data.imageUrl
                }
            });
        }
        const updatedStop = await prisma.stop.findUnique({ where: { id } });
        res.json(updatedStop);
    }catch (error) {
        console.error('Error updating stop:', error);
        res.status(500).json({ error: 'An error occurred while updating the stop' });
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