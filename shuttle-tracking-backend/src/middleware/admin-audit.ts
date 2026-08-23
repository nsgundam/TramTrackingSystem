import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { AdminAuditAction, AdminAuditOutcome, AdminAuditTargetType } from './validation.js';
import {
  persistAdminAuditEvent,
  type AdminAuditEventInput,
} from '../services/admin-audit.service.js';

export interface AdminMutationClassification {
  action: AdminAuditAction;
  targetType: AdminAuditTargetType;
  targetId: string | null;
}

interface ClassificationInput {
  baseUrl: string;
  method: string;
  path: string;
  body: unknown;
}

const SAFE_TARGET_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,49}$/;
const SAFE_REQUEST_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,49}$/;

const boundedIdentifier = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const candidate = value.trim();
  return SAFE_TARGET_ID.test(candidate) ? candidate : null;
};

const bodyIdentifier = (body: unknown, field: 'id' | 'routeId'): string | null => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  return boundedIdentifier((body as Record<string, unknown>)[field]);
};

const pathIdentifier = (value: string): string | null => {
  try {
    return boundedIdentifier(decodeURIComponent(value));
  } catch {
    return null;
  }
};

const classified = (
  action: AdminAuditAction,
  targetType: AdminAuditTargetType,
  targetId: string | null,
): AdminMutationClassification => ({ action, targetType, targetId });

export const classifyAdminMutation = (
  input: ClassificationInput,
): AdminMutationClassification | null => {
  const method = input.method.toUpperCase();
  const path = input.path.length > 1 ? input.path.replace(/\/$/, '') : input.path;
  const singleId = /^\/([^/]+)$/.exec(path)?.[1];
  const assignmentId = /^\/([^/]+)\/assignment$/.exec(path)?.[1];
  const feedbackAction = /^\/([^/]+)\/(delete|restore)$/.exec(path);

  switch (input.baseUrl) {
    case '/api/admin/vehicles':
      if (method === 'POST' && path === '/') return classified('vehicle.create', 'vehicle', bodyIdentifier(input.body, 'id'));
      if (singleId && method === 'PUT') return classified('vehicle.update', 'vehicle', pathIdentifier(singleId));
      if (singleId && method === 'DELETE') return classified('vehicle.delete', 'vehicle', pathIdentifier(singleId));
      return null;
    case '/api/admin/routes':
      if (method === 'POST' && path === '/') return classified('route.create', 'route', bodyIdentifier(input.body, 'id'));
      if (singleId && method === 'PUT') return classified('route.update', 'route', pathIdentifier(singleId));
      if (singleId && method === 'DELETE') return classified('route.delete', 'route', pathIdentifier(singleId));
      return null;
    case '/api/admin/stops':
      if (method === 'POST' && path === '/') return classified('stop.create', 'stop', bodyIdentifier(input.body, 'id'));
      if (singleId && method === 'PUT') return classified('stop.update', 'stop', pathIdentifier(singleId));
      if (singleId && method === 'DELETE') return classified('stop.delete', 'stop', pathIdentifier(singleId));
      return null;
    case '/api/admin/route-stops':
      if (method === 'POST' && path === '/') {
        return classified('route_stop.create', 'route_stop', bodyIdentifier(input.body, 'routeId'));
      }
      if (singleId && method === 'PUT') return classified('route_stop.replace', 'route_stop', pathIdentifier(singleId));
      if (singleId && method === 'DELETE') return classified('route_stop.delete', 'route_stop', pathIdentifier(singleId));
      return null;
    case '/api/admin/devices':
      if (method === 'POST' && path === '/') {
        return classified('device.create', 'tracking_source', bodyIdentifier(input.body, 'id'));
      }
      if (assignmentId && method === 'PUT') {
        return classified('device.assign', 'tracking_source', pathIdentifier(assignmentId));
      }
      if (assignmentId && method === 'DELETE') {
        return classified('device.unassign', 'tracking_source', pathIdentifier(assignmentId));
      }
      if (singleId && method === 'PUT') return classified('device.update', 'tracking_source', pathIdentifier(singleId));
      if (singleId && method === 'DELETE') return classified('device.delete', 'tracking_source', pathIdentifier(singleId));
      return null;
    case '/api/admin/feedback':
      if (singleId && method === 'PATCH') return classified('feedback.update', 'feedback', pathIdentifier(singleId));
      if (feedbackAction && method === 'POST') {
        const targetId = pathIdentifier(feedbackAction[1]!);
        return feedbackAction[2] === 'delete'
          ? classified('feedback.delete', 'feedback', targetId)
          : classified('feedback.restore', 'feedback', targetId);
      }
      return null;
    default:
      return null;
  }
};

export const adminAuditOutcome = (responseStatus: number): AdminAuditOutcome => {
  if (responseStatus >= 200 && responseStatus < 300) return 'success';
  if (responseStatus === 401 || responseStatus === 403) return 'denied';
  return 'failure';
};

const safeRequestId = (value: string | undefined): string =>
  value && SAFE_REQUEST_ID.test(value) ? value : randomUUID();

export const logAdminAuditPersistenceFailure = (requestId: string): void => {
  const correlationId = safeRequestId(requestId);
  try {
    console.error(`[Admin audit persistence] request failed (PERSISTENCE_FAILED) correlation=${correlationId}`);
  } catch {
    // Audit persistence and its safe diagnostic are both best effort.
  }
};

type AuditPersist = (event: AdminAuditEventInput) => Promise<void>;
type AuditFailureLog = (requestId: string) => void;

export const createAdminAuditCapture = (
  persist: AuditPersist = persistAdminAuditEvent,
  logFailure: AuditFailureLog = logAdminAuditPersistenceFailure,
): RequestHandler => (req: Request, res: Response, next: NextFunction): void => {
  const actor = req.admin;
  const mutation = actor
    ? classifyAdminMutation({ baseUrl: req.baseUrl, method: req.method, path: req.path, body: req.body })
    : null;
  if (!actor || !mutation) {
    next();
    return;
  }

  const requestId = safeRequestId(req.requestId);
  res.once('finish', () => {
    const event: AdminAuditEventInput = {
      actorUserId: actor.id,
      actorUsername: actor.username,
      actorRole: actor.role,
      action: mutation.action,
      targetType: mutation.targetType,
      targetId: mutation.targetId,
      outcome: adminAuditOutcome(res.statusCode),
      responseStatus: res.statusCode,
      requestId,
      occurredAt: new Date(),
    };
    void Promise.resolve()
      .then(() => persist(event))
      .catch(() => {
        try {
          logFailure(requestId);
        } catch {
          // A broken diagnostic sink must not create an unhandled rejection.
        }
      });
  });
  next();
};

export const captureAdminAudit = createAdminAuditCapture();
