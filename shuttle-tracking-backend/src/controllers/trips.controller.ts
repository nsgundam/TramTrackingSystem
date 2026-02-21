import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// 1. เริ่มวิ่งรถ (Start Trip) - ฝั่ง Mobile เรียกใช้ตอนเริ่มงาน
export const startTrip = async (req: Request, res: Response) => {
    try {
        const { vehicleId, routeId } = req.body;

        if (!vehicleId || !routeId) {
            return res.status(400).json({ error: 'Missing vehicleId or routeId' });
        }

        // สร้าง Trip ใหม่
        const newTrip = await prisma.trip.create({
            data: {
                vehicleId,
                routeId,
                startTime: new Date(),
                status: 'in_progress' // สถานะกำลังวิ่ง
            }
        });

        // (Optional) อัปเดตสถานะรถว่ากำลังวิ่งอยู่
        await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { status: 'active', assignedRouteId: routeId }
        });

        res.status(201).json({ 
            message: 'Trip started successfully', 
            trip: newTrip 
        });

    } catch (error) {
        console.error('Error starting trip:', error);
        res.status(500).json({ error: 'Failed to start trip' });
    }
};

// 2. จบงาน (End Trip) - ฝั่ง Mobile เรียกใช้ตอนเลิกงาน
export const endTrip = async (req: Request, res: Response) => {
    try {
        const  id  = req.params.id as string; // รับ trip_id มาจาก URL

        const endedTrip = await prisma.trip.update({
            where: { id },
            data: {
                endTime: new Date(),
                status: 'completed' // เปลี่ยนสถานะเป็นวิ่งเสร็จแล้ว
            }
        });

        res.json({ 
            message: 'Trip ended successfully', 
            trip: endedTrip 
        });

    } catch (error) {
        console.error('Error ending trip:', error);
        res.status(500).json({ error: 'Failed to end trip' });
    }
};