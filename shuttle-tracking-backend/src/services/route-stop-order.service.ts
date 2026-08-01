import { unprocessableRequest } from '../middleware/boundary-errors.js';

export interface OrderedRouteStop {
  routeId: string;
  stopId: string;
  stopOrder: number;
}

/**
 * The route-detail replacement command is the authority for publishing a
 * contiguous route-stop sequence. The validation parser also rejects
 * duplicates; retaining this defensive check keeps the domain invariant true
 * if another typed caller is added later.
 */
export const buildOrderedRouteStops = (
  routeId: string,
  stopIds: readonly string[],
): OrderedRouteStop[] => {
  const seen = new Set<string>();
  for (const stopId of stopIds) {
    if (seen.has(stopId)) {
      throw unprocessableRequest('A route cannot contain the same stop more than once');
    }
    seen.add(stopId);
  }

  return stopIds.map((stopId, index) => ({
    routeId,
    stopId,
    stopOrder: index + 1,
  }));
};

export const assertActiveRouteStopMembership = (
  stopIds: readonly string[],
  activeStopIds: readonly string[],
): void => {
  const activeStops = new Set(activeStopIds);
  if (stopIds.some((stopId) => !activeStops.has(stopId))) {
    throw unprocessableRequest('Every route stop must exist and be active');
  }
};
