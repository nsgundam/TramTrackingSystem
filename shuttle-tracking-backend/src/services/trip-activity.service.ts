export interface MovementSnapshot {
  lat: number;
  lng: number;
  speed: number | null;
  timestamp: number;
  assignmentId?: string | null;
}

export const TRIP_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const isTripInactive = (
  lastTripActivityAt: Date,
  now = new Date(),
): boolean => now.getTime() - lastTripActivityAt.getTime() >= TRIP_INACTIVITY_TIMEOUT_MS;

const configuredPositiveNumber = (
  name: string,
  fallback: number,
  maximum: number,
): number => {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= maximum ? parsed : fallback;
};

export const TRIP_ACTIVITY_MIN_DISPLACEMENT_METERS = configuredPositiveNumber(
  'TRIP_ACTIVITY_MIN_DISPLACEMENT_METERS',
  25,
  10_000,
);

export const TRIP_ACTIVITY_MIN_SPEED_MPS = configuredPositiveNumber(
  'TRIP_ACTIVITY_MIN_SPEED_MPS',
  2,
  100,
);

const EARTH_RADIUS_METERS = 6_371_000;
const toRadians = (degrees: number): number => degrees * Math.PI / 180;

export const displacementMeters = (
  previous: Pick<MovementSnapshot, 'lat' | 'lng'>,
  current: Pick<MovementSnapshot, 'lat' | 'lng'>,
): number => {
  const latitudeDelta = toRadians(current.lat - previous.lat);
  const longitudeDelta = toRadians(current.lng - previous.lng);
  const previousLatitude = toRadians(previous.lat);
  const currentLatitude = toRadians(current.lat);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(previousLatitude) * Math.cos(currentLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, haversine)));
};

export const isMeaningfulMovement = (
  previous: MovementSnapshot | null,
  current: MovementSnapshot,
): boolean => {
  if (current.speed !== null && current.speed >= TRIP_ACTIVITY_MIN_SPEED_MPS) return true;
  if (!previous) return false;
  return displacementMeters(previous, current) >= TRIP_ACTIVITY_MIN_DISPLACEMENT_METERS;
};
