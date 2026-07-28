import assert from 'node:assert/strict';
import 'dotenv/config';

if (!process.env.DATABASE_URL || !process.env.REDIS_URL) {
  throw new Error('Set DATABASE_URL and REDIS_URL before running the T5 operations integration test');
}

const { prisma } = await import('../dist/config/prisma.js');
const { connectRedis, redisClient } = await import('../dist/config/redis.js');
const {
  endOperationalTrip,
  recordCanonicalHistory,
  startOperationalTrip,
  validateActiveTripForVehicle,
} = await import('../dist/services/operations.service.js');

const suffix = Date.now().toString(36);
const routeId = `T5_ROUTE_${suffix}`;
const vehicleId = `T5_VEHICLE_${suffix}`;
const otherVehicleId = `T5_OTHER_${suffix}`;
let firstTripId;
let secondTripId;

const isTripOwnershipError = (error) => error?.code === 'TRIP_OWNERSHIP_MISMATCH';

try {
  await connectRedis();
  assert.equal(await redisClient.ping(), 'PONG');

  await prisma.route.create({
    data: { id: routeId, name: 'T5 integration route', color: '#123456', status: 'active' },
  });
  await prisma.vehicle.createMany({
    data: [
      { id: vehicleId, name: 'T5 integration vehicle', type: 'test', assignedRouteId: routeId },
      { id: otherVehicleId, name: 'T5 other vehicle', type: 'test', assignedRouteId: routeId },
    ],
  });

  const startTime = new Date();
  const starts = await Promise.all(
    Array.from({ length: 8 }, () => startOperationalTrip(vehicleId, startTime)),
  );
  assert.equal(new Set(starts.map(({ trip }) => trip.id)).size, 1);
  assert.equal(starts.filter(({ created }) => created).length, 1);
  firstTripId = starts[0].trip.id;
  assert.equal(starts[0].trip.status, 'in_progress');

  const history = await recordCanonicalHistory({
    vehicleId,
    tripId: firstTripId,
    lat: 13.964139,
    lng: 100.58752,
    speed: 4.5,
    heading: 90,
    station: 'T5 test station',
    recordedAt: new Date(startTime.getTime() + 1000),
  });
  assert.deepEqual(history, { tripId: firstTripId, createdTrip: false });
  assert.equal(
    await prisma.gPSTrack.count({ where: { tripId: firstTripId, vehicleId } }),
    1,
  );

  const endTime = new Date(startTime.getTime() + 2000);
  const ends = await Promise.all(
    Array.from({ length: 8 }, () => endOperationalTrip(firstTripId, vehicleId, endTime)),
  );
  assert.equal(new Set(ends.map(({ trip }) => trip.id)).size, 1);
  assert.equal(ends.filter(({ idempotent }) => !idempotent).length, 1);
  assert.ok(ends.every(({ trip }) => trip.status === 'completed'));

  const afterFirstEnd = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  assert.equal(afterFirstEnd?.status, 'inactive');

  const secondStart = await startOperationalTrip(vehicleId, new Date(endTime.getTime() + 1000));
  assert.equal(secondStart.created, true);
  secondTripId = secondStart.trip.id;
  assert.notEqual(secondTripId, firstTripId);
  assert.equal(
    (await prisma.vehicle.findUnique({ where: { id: vehicleId } }))?.status,
    'active',
  );

  const staleEnd = await endOperationalTrip(firstTripId, vehicleId, endTime);
  assert.equal(staleEnd.idempotent, true);
  assert.equal(
    (await prisma.vehicle.findUnique({ where: { id: vehicleId } }))?.status,
    'active',
  );
  assert.equal(
    (await prisma.trip.findFirst({ where: { vehicleId, status: 'in_progress' } }))?.id,
    secondTripId,
  );

  await assert.rejects(
    () => endOperationalTrip(secondTripId, otherVehicleId),
    isTripOwnershipError,
  );
  await assert.rejects(
    () => validateActiveTripForVehicle(firstTripId, vehicleId),
    isTripOwnershipError,
  );
  await assert.rejects(
    () => validateActiveTripForVehicle(secondTripId, otherVehicleId),
    isTripOwnershipError,
  );

  const activeCount = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM trips
    WHERE vehicle_id = ${vehicleId} AND status = 'in_progress'
  `;
  assert.equal(Number(activeCount[0].count), 1);

  const activeTripIndex = await prisma.$queryRaw`
    SELECT indexdef
    FROM pg_indexes
    WHERE tablename = 'trips' AND indexname = 'unique_active_trip_per_vehicle'
  `;
  assert.match(activeTripIndex[0]?.indexdef ?? '', /WHERE.*status.*in_progress/i);

  const redisKey = `t5:test:${vehicleId}`;
  assert.equal(await redisClient.set(redisKey, '1', { NX: true, EX: 30 }), 'OK');
  assert.equal(await redisClient.set(redisKey, '1', { NX: true, EX: 30 }), null);
  await redisClient.del(redisKey);

  await endOperationalTrip(secondTripId, vehicleId, new Date(endTime.getTime() + 3000));
  console.log('T5 Operations/Trip transaction and race integration tests passed.');
} finally {
  try {
    const activeTrip = await prisma.trip.findFirst({
      where: { vehicleId, status: 'in_progress' },
      select: { id: true },
    });
    if (activeTrip) {
      await endOperationalTrip(activeTrip.id, vehicleId).catch(() => undefined);
    }
    await prisma.gPSTrack.deleteMany({ where: { vehicleId } });
    await prisma.trip.deleteMany({ where: { vehicleId } });
    await prisma.vehicle.deleteMany({ where: { id: { in: [vehicleId, otherVehicleId] } } });
    await prisma.route.deleteMany({ where: { id: routeId } });
  } finally {
    await prisma.$disconnect();
    if (redisClient.isOpen) await redisClient.quit();
  }
}
