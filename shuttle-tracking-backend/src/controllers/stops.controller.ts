import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { invalidatePublicCache } from '../services/cache.service.js';
import { BoundaryError, conflict, logBoundaryFailure, notFound, sendBoundaryError } from '../middleware/boundary-errors.js';
import type { StopCreateInput, StopUpdateInput } from '../middleware/validation.js';

interface StopRow {
    id: string;
    nameTh: string;
    nameEn: string | null;
    imageUrl: string | null;
    lat: number | null;
    lng: number | null;
}

const internalStopError = (message: string): BoundaryError =>
    new BoundaryError(500, 'INTERNAL_ERROR', message);

const objectValue = (value: unknown): Record<string, unknown> | undefined =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value as Record<string, unknown>
        : undefined;

/** Raw Prisma writes use P2010; translate only PostgreSQL's unique-violation signal. */
export const mapStopRawCreateError = (error: unknown): unknown => {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2010') {
        return error;
    }

    const metadata = objectValue(error.meta);
    const driverAdapterError = objectValue(metadata?.driverAdapterError);
    const cause = objectValue(driverAdapterError?.cause);
    return cause?.originalCode === '23505'
        ? conflict('Stop ID already exists')
        : error;
};

// Get All Stops
export const getStops = async (req: Request, res: Response) => {
    try {
        const stops = await prisma.$queryRaw<StopRow[]>`
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
        logBoundaryFailure('Stop list', error);
        sendBoundaryError(res, error, internalStopError('Failed to fetch stops'));
    }
};

// Get Stop by ID
export const getStopById = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string
        const stops = await prisma.$queryRaw<StopRow[]>`
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
            throw notFound('Stop not found');
        }
        res.json(stops[0]);
    }catch (error) {
        logBoundaryFailure('Stop read', error);
        sendBoundaryError(res, error, internalStopError('Failed to fetch stop'));
    }
};

// Create Stop
export const createStop = async (req: Request, res: Response) => {
    try {
        const { id, nameTh, nameEn, lat, lng, imageUrl } = req.body as StopCreateInput;

        await prisma.$executeRaw`
            INSERT INTO stops (id, name_th, name_en, location, image_url)
            VALUES (${id}, ${nameTh}, ${nameEn ?? null},ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${imageUrl ?? null})
        `;

        const newStops = await prisma.$queryRaw<StopRow[]>`
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
            throw notFound('Stop not found');
        }
        await invalidatePublicCache();
        res.json(newStops[0]);
    }catch (error) {
        logBoundaryFailure('Stop create', error);
        sendBoundaryError(res, mapStopRawCreateError(error), internalStopError('Failed to create stop'));
    }
};

// Update Stop
export const updateStop = async (req: Request, res: Response) => {
    try {
        const id  = req.params.id as string;
        const { nameTh, nameEn, lat, lng, imageUrl } = req.body as StopUpdateInput;

        const updatedCount = await prisma.$executeRaw`
            UPDATE stops
            SET
                name_th = ${nameTh},
                name_en = ${nameEn ?? null},
                image_url = ${imageUrl ?? null},
                location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
            WHERE id = ${id}
        `;
        if (updatedCount === 0) throw notFound('Stop not found');

        await invalidatePublicCache();
        res.json({ message: 'Stop updated successfully', id });
    } catch (error) {
        logBoundaryFailure('Stop update', error);
        sendBoundaryError(res, error, internalStopError('Failed to update stop'));
    }
};

// Delete Stop
export const deleteStop = async (req: Request, res: Response) => {
    try{
        const id = req.params.id as string;
        await prisma.stop.delete({
            where: { id },
        });
        await invalidatePublicCache();
        res.json({ message: 'Stop deleted successfully' });
    }catch (error) {
        logBoundaryFailure('Stop delete', error);
        sendBoundaryError(res, error, internalStopError('Failed to delete stop'));
    }
};
