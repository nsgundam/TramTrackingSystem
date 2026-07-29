import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const RESEARCH_ROLES = ['DEV', 'SUPER_ADMIN'] as const;
export type ResearchRole = typeof RESEARCH_ROLES[number];

export const requireResearchAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = typeof req.user === 'object' && req.user !== null && 'userId' in req.user
    ? (req.user as { userId?: unknown }).userId
    : undefined;

  if (typeof userId !== 'string') {
    res.status(403).json({ code: 'RESEARCH_ACCESS_FORBIDDEN', error: 'Research access is restricted' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || !RESEARCH_ROLES.includes(user.role as ResearchRole)) {
      res.status(403).json({ code: 'RESEARCH_ACCESS_FORBIDDEN', error: 'Research access is restricted' });
      return;
    }
    res.locals.researchRole = user.role as ResearchRole;
    next();
  } catch {
    res.status(503).json({ code: 'DEPENDENCY_UNAVAILABLE', error: 'Research authorization is temporarily unavailable' });
  }
};
