import assert from 'node:assert/strict';
import 'dotenv/config';

if (!process.env.DATABASE_URL || !process.env.REDIS_URL) {
  throw new Error('Set DATABASE_URL and REDIS_URL before running the tracking lifecycle integration test');
}

const { prisma } = await import('../dist/config/prisma.js');
const { connectRedis, redisClient } = await import('../dist/config/redis.js');
const { processObservation } = await import('../dist/services/tracking.service.js');
const {
  autoCloseInactiveTrips,
  endOperationalTrip,
  startOperationalTrip,
} = await import('../dist/services/operations.service.js');
const {
  assignMobileSourceToVehicle,
  assignTrackingSource,
} = await import('../dist/services/tracking-assignment.service.js');
const { getCanonicalStateForVehicle } = await import('../dist/services/canonical-state.service.js');
const { TRIP_INACTIVITY_TIMEOUT_MS } = await import('../dist/services/trip-activity.service.js');

const suffix = Date.now().toString(36);
const routeId = `T15_ROUTE_${suffix}`;
const vehicleA = `T15_VEH_A_${suffix}`;
const vehicleB = `T15_VEH_B_${suffix}`;
const mobileSource = `T15_MOB_${suffix}`;
const movingSource = `T15_IOT_${suffix}`;
const stationarySource = `T15_STA_${suffix}`;
const assignmentIds = new Map();
const senderFor = (sourceId, vehicleId) => ({
  sourceId,
  vehicleId,
  credentialVersion: 1,
  assignmentId: assignmentIds.get(sourceId) ?? null,
});
const deleteSourceCache = async (sourceId) => {
  await redisClient.del(`source:last_location:${sourceId}`);
  await redisClient.del(`source:last_telemetry_time:${sourceId}`);
};

let activeTripA;
let activeTripB;

try {
  await connectRedis();
  assert.equal(await redisClient.ping(), 'PONG');

  await prisma.route.create({
    data: { id: routeId, name: 'T15 lifecycle route', color: '#123456', status: 'active' },
  });
  await prisma.vehicle.createMany({
    data: [
      { id: vehicleA, name: 'T15 vehicle A', type: 'test', assignedRouteId: routeId },
      { id: vehicleB, name: 'T15 vehicle B', type: 'test', assignedRouteId: routeId },
    ],
  });
  await prisma.trackingSource.createMany({
    data: [
      { id: mobileSource, name: 'T15 mobile', type: 'mobile', status: 'active', secretHash: 'test' },
      { id: movingSource, name: 'T15 moving IoT', type: 'esp32', status: 'active', secretHash: 'test' },
      { id: stationarySource, name: 'T15 stationary IoT', type: 'esp32', status: 'active', secretHash: 'test' },
    ],
  });
  for (const [sourceId, vehicleId] of [[mobileSource, vehicleA], [movingSource, vehicleA], [stationarySource, vehicleB]]) {
    const result = await assignTrackingSource({ sourceId, vehicleId, method: 'admin' });
    assignmentIds.set(sourceId, result.assignment.id);
  }
  await Promise.all([mobileSource, movingSource, stationarySource].map(deleteSourceCache));

  // Telemetry without an explicit Trip is diagnostic only.
  const noTripState = await processObservation({
    sourceId: mobileSource,
    sender: senderFor(mobileSource, vehicleA),
    lat: 13.964139,
    lng: 100.58752,
    speed: 0,
  });
  assert.equal(noTripState?.serviceState, 'no_service');
  assert.equal(await prisma.trip.count({ where: { vehicleId: vehicleA } }), 0);
  assert.equal((await prisma.vehicle.findUnique({ where: { id: vehicleA } }))?.status, 'inactive');

  activeTripA = (await startOperationalTrip(vehicleA)).trip;
  const startA = activeTripA.startTime;

  // A missing mobile source does not close the Trip while another source moves.
  const movingObservation = await processObservation({
    sourceId: movingSource,
    sender: senderFor(movingSource, vehicleA),
    lat: 13.965,
    lng: 100.588,
    speed: 3,
  });
  assert.equal(movingObservation?.serviceState, 'live');
  const activeAfterMovement = await prisma.trip.findUnique({ where: { id: activeTripA.id } });
  assert.ok(activeAfterMovement);
  assert.ok(activeAfterMovement.lastTripActivityAt.getTime() > startA.getTime());
  assert.equal(
    await autoCloseInactiveTrips(new Date(activeAfterMovement.lastTripActivityAt.getTime() + TRIP_INACTIVITY_TIMEOUT_MS - 1)),
    [],
  );
  assert.equal((await prisma.trip.findUnique({ where: { id: activeTripA.id } }))?.status, 'in_progress');

  // Reassignment is independent of the Trip lifecycle.
  const movedAssignment = await assignTrackingSource({ sourceId: movingSource, vehicleId: vehicleB, method: 'admin' });
  assignmentIds.set(movingSource, movedAssignment.assignment.id);
  assert.equal((await prisma.trip.findUnique({ where: { id: activeTripA.id } }))?.status, 'in_progress');

  // A stationary IoT source can send continuously without keeping a Trip alive.
  activeTripB = (await startOperationalTrip(vehicleB)).trip;
  await processObservation({
    sourceId: stationarySource,
    sender: senderFor(stationarySource, vehicleB),
    lat: 13.97,
    lng: 100.59,
    speed: 0,
  });
  await processObservation({
    sourceId: stationarySource,
    sender: senderFor(stationarySource, vehicleB),
    lat: 13.970001,
    lng: 100.590001,
    speed: 0,
  });
  await processObservation({
    sourceId: stationarySource,
    sender: senderFor(stationarySource, vehicleB),
    lat: 13.97,
    lng: 100.59,
    speed: 0,
  });
  const stationaryBeforeTimeout = new Date(activeTripB.lastTripActivityAt.getTime() + TRIP_INACTIVITY_TIMEOUT_MS - 1);
  assert.equal(await autoCloseInactiveTrips(stationaryBeforeTimeout), []);
  const closedB = await autoCloseInactiveTrips(
    new Date(activeTripB.lastTripActivityAt.getTime() + TRIP_INACTIVITY_TIMEOUT_MS),
  );
  assert.deepEqual(closedB, [{ tripId: activeTripB.id, vehicleId: vehicleB }]);
  const closedTripB = await prisma.trip.findUnique({ where: { id: activeTripB.id } });
  assert.equal(closedTripB?.status, 'aborted');
  assert.equal(closedTripB?.endReason, 'inactivity_timeout');
  assert.ok(closedTripB?.closedAt);
  assert.equal((await prisma.vehicle.findUnique({ where: { id: vehicleB } }))?.status, 'inactive');

  // Telemetry after auto-close remains diagnostic and never reactivates the vehicle.
  const postCloseState = await processObservation({
    sourceId: stationarySource,
    sender: senderFor(stationarySource, vehicleB),
    lat: 13.971,
    lng: 100.591,
    speed: 4,
  });
  assert.equal(postCloseState?.serviceState, 'no_service');
  assert.equal(await prisma.trip.count({ where: { vehicleId: vehicleB, status: 'in_progress' } }), 0);
  assert.equal((await prisma.vehicle.findUnique({ where: { id: vehicleB } }))?.status, 'inactive');

  // A mobile QR switch is rejected until the old Vehicle explicitly ends service.
  await assert.rejects(
    () => assignMobileSourceToVehicle({ sourceId: mobileSource, vehicleId: vehicleB }),
    /End the active service before switching/,
  );
  await endOperationalTrip(activeTripA.id, vehicleA);
  const endedStateA = await getCanonicalStateForVehicle(vehicleA);
  assert.equal(endedStateA.serviceState, 'no_service');
  assert.equal(endedStateA.reasonCode, 'NO_ACTIVE_TRIP');
  activeTripA = undefined;
  const switched = await assignMobileSourceToVehicle({
    sourceId: mobileSource,
    vehicleId: vehicleB,
    expectedAssignmentId: assignmentIds.get(mobileSource),
  });
  assert.equal(switched.assignment.vehicleId, vehicleB);

  console.log('T15 tracking identity, assignment, and lifecycle integration tests passed.');
} finally {
  try {
    if (activeTripA) await endOperationalTrip(activeTripA.id, vehicleA).catch(() => undefined);
    if (activeTripB) await endOperationalTrip(activeTripB.id, vehicleB).catch(() => undefined);
    await prisma.gPSTrack.deleteMany({ where: { vehicleId: { in: [vehicleA, vehicleB] } } });
    await prisma.trip.deleteMany({ where: { vehicleId: { in: [vehicleA, vehicleB] } } });
    await prisma.trackingAssignment.deleteMany({
      where: { trackingSourceId: { in: [mobileSource, movingSource, stationarySource] } },
    });
    await prisma.trackingSource.deleteMany({ where: { id: { in: [mobileSource, movingSource, stationarySource] } } });
    await prisma.vehicle.deleteMany({ where: { id: { in: [vehicleA, vehicleB] } } });
    await prisma.route.deleteMany({ where: { id: routeId } });
  } finally {
    await prisma.$disconnect();
    if (redisClient.isOpen) await redisClient.quit();
  }
}
