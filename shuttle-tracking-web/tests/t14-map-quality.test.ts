import assert from "node:assert/strict";
import test from "node:test";
import {
  getDirectionalPointIndex,
  getNearestPointIndex,
  shouldMove,
} from "../utils/MapHelpers";
import {
  cancelAllOwnedMotions,
  cancelOwnedMotion,
  mapMotionOptions,
  motionScrollBehavior,
  replaceOwnedMotion,
  startCoordinateAnimation,
  type FrameScheduler,
  type OwnedMotionRegistry,
} from "../utils/motion";

class FakeFrameScheduler implements FrameScheduler {
  private nextHandle = 1;
  private callbacks = new Map<number, (timestamp: number) => void>();
  currentTime = 0;

  now() {
    return this.currentTime;
  }

  request(callback: (timestamp: number) => void) {
    const handle = this.nextHandle++;
    this.callbacks.set(handle, callback);
    return handle;
  }

  cancel(handle: number) {
    this.callbacks.delete(handle);
  }

  flushAt(timestamp: number) {
    this.currentTime = timestamp;
    const pending = [...this.callbacks.values()];
    this.callbacks.clear();
    pending.forEach((callback) => callback(timestamp));
  }

  get pendingCount() {
    return this.callbacks.size;
  }
}

test("coordinate animation reaches the same destination and stops scheduling", () => {
  const scheduler = new FakeFrameScheduler();
  const writes: Array<[number, number]> = [];

  startCoordinateAnimation({
    start: [0, 0],
    end: [10, 20],
    durationMs: 100,
    scheduler,
    write: (position) => writes.push(position),
  });

  assert.equal(scheduler.pendingCount, 1);
  scheduler.flushAt(50);
  assert.deepEqual(writes.at(-1), [5, 10]);
  assert.equal(scheduler.pendingCount, 1);
  scheduler.flushAt(100);
  assert.deepEqual(writes.at(-1), [10, 20]);
  assert.equal(scheduler.pendingCount, 0);
});

test("explicit cancellation prevents every later marker write", () => {
  const scheduler = new FakeFrameScheduler();
  const writes: Array<[number, number]> = [];
  const cancel = startCoordinateAnimation({
    start: [0, 0],
    end: [10, 10],
    durationMs: 100,
    scheduler,
    write: (position) => writes.push(position),
  });

  cancel();
  scheduler.flushAt(100);
  assert.deepEqual(writes, []);
  assert.equal(scheduler.pendingCount, 0);
});

test("replacement and cleanup cancel the previously owned animation", () => {
  const scheduler = new FakeFrameScheduler();
  const registry: OwnedMotionRegistry = {};
  const firstWrites: Array<[number, number]> = [];
  const secondWrites: Array<[number, number]> = [];

  replaceOwnedMotion(registry, "vehicle-1", () => startCoordinateAnimation({
    start: [0, 0],
    end: [10, 10],
    durationMs: 100,
    scheduler,
    write: (position) => firstWrites.push(position),
  }));
  scheduler.flushAt(25);
  assert.deepEqual(firstWrites.at(-1), [2.5, 2.5]);

  replaceOwnedMotion(registry, "vehicle-1", () => startCoordinateAnimation({
    start: [10, 10],
    end: [20, 30],
    durationMs: 100,
    scheduler,
    write: (position) => secondWrites.push(position),
  }));
  scheduler.flushAt(75);
  assert.equal(firstWrites.length, 1);
  assert.deepEqual(secondWrites.at(-1), [15, 20]);

  cancelOwnedMotion(registry, "vehicle-1");
  scheduler.flushAt(125);
  assert.equal(secondWrites.length, 1);

  replaceOwnedMotion(registry, "vehicle-2", () => startCoordinateAnimation({
    start: [0, 0],
    end: [1, 1],
    durationMs: 100,
    scheduler,
    write: () => undefined,
  }));
  cancelAllOwnedMotions(registry);
  assert.deepEqual(registry, {});
  assert.equal(scheduler.pendingCount, 0);
});

test("reduced motion writes the destination without requesting a frame", () => {
  const scheduler = new FakeFrameScheduler();
  const writes: Array<[number, number]> = [];

  startCoordinateAnimation({
    start: [0, 0],
    end: [3, 4],
    durationMs: 100,
    reducedMotion: true,
    scheduler,
    write: (position) => writes.push(position),
  });

  assert.deepEqual(writes, [[3, 4]]);
  assert.equal(scheduler.pendingCount, 0);
  assert.deepEqual(mapMotionOptions(0.8, true), { animate: false, duration: 0 });
  assert.deepEqual(mapMotionOptions(0.8, false), { animate: true, duration: 0.8 });
  assert.equal(motionScrollBehavior(true), "auto");
  assert.equal(motionScrollBehavior(false), "smooth");
});

test("getNearestPointIndex is total and returns 0 for empty, single, or invalid inputs", () => {
  assert.equal(getNearestPointIndex([13.98, 100.58], []), 0);
  assert.equal(getNearestPointIndex([13.98, 100.58], undefined as unknown as Array<[number, number]>), 0);
  assert.equal(getNearestPointIndex([NaN, 100.58], [[13.98, 100.58]]), 0);
  assert.equal(getNearestPointIndex([13.98, 100.58], [[13.98, 100.58]]), 0);
  assert.equal(getNearestPointIndex([13.98, 100.58], [[13.0, 100.0], [13.98, 100.58]]), 1);
});

test("getDirectionalPointIndex is total and safe for empty, 1-point, 2-point, and short geometries", () => {
  // Empty geometry
  assert.equal(getDirectionalPointIndex([13.98, 100.58], [], 0), 0);
  assert.equal(getDirectionalPointIndex([13.98, 100.58], [], -1), 0);

  // 1-point geometry
  const singlePoint: Array<[number, number]> = [[13.98, 100.58]];
  assert.equal(getDirectionalPointIndex([13.98, 100.58], singlePoint, 0), 0);
  assert.equal(getDirectionalPointIndex([13.98, 100.58], singlePoint, -1), 0);

  // 2-point short geometry (reproducing short mock/OSRM geometry)
  const twoPoints: Array<[number, number]> = [
    [13.98, 100.58],
    [13.981, 100.581],
  ];
  // Must return valid in-bound non-negative indexes (0 or 1), never negative or undefined dereference
  assert.equal(getDirectionalPointIndex([13.98, 100.58], twoPoints, 0), 0);
  assert.equal(getDirectionalPointIndex([13.981, 100.581], twoPoints, 0), 1);
  assert.equal(getDirectionalPointIndex([13.981, 100.581], twoPoints, 1), 1);
  assert.equal(getDirectionalPointIndex([13.98, 100.58], twoPoints, 1), 0);

  // Short geometry with 3 to 5 points
  const fivePoints: Array<[number, number]> = [
    [13.980, 100.580],
    [13.981, 100.581],
    [13.982, 100.582],
    [13.983, 100.583],
    [13.984, 100.584],
  ];
  for (let idx = 0; idx < fivePoints.length; idx++) {
    const result = getDirectionalPointIndex(fivePoints[idx], fivePoints, idx);
    assert.equal(result >= 0 && result < fivePoints.length, true);
    assert.equal(result, idx);
  }
});

test("getDirectionalPointIndex safely handles negative, non-finite, stale, and out-of-range indexes", () => {
  const coords: Array<[number, number]> = [
    [13.980, 100.580],
    [13.981, 100.581],
    [13.982, 100.582],
  ];

  // Negative indexes
  assert.equal(getDirectionalPointIndex([13.981, 100.581], coords, -1), 1);
  assert.equal(getDirectionalPointIndex([13.981, 100.581], coords, -5), 1);
  assert.equal(getDirectionalPointIndex([13.981, 100.581], coords, -100), 1);

  // Non-finite or non-integer indexes
  assert.equal(getDirectionalPointIndex([13.982, 100.582], coords, NaN), 2);
  assert.equal(getDirectionalPointIndex([13.982, 100.582], coords, Infinity), 2);
  assert.equal(getDirectionalPointIndex([13.982, 100.582], coords, 1.5), 2);
  assert.equal(getDirectionalPointIndex([13.982, 100.582], coords, undefined as unknown as number), 2);
  assert.equal(getDirectionalPointIndex([13.982, 100.582], coords, null as unknown as number), 2);

  // Out-of-range / stale indexes
  assert.equal(getDirectionalPointIndex([13.980, 100.580], coords, 999), 0);
  assert.equal(getDirectionalPointIndex([13.980, 100.580], coords, 3), 0);

  // Invalid pos
  assert.equal(getDirectionalPointIndex([NaN, NaN], coords, 1), 0);
});

test("getDirectionalPointIndex preserves normal forward route progression and handles jump resets", () => {
  // Generate a route with 30 consecutive points ~10 meters apart
  const route: Array<[number, number]> = Array.from({ length: 30 }, (_, i) => [
    13.980 + i * 0.0001,
    100.580 + i * 0.0001,
  ]);

  // Normal directional tracking: moving from index 10 to point 11
  const nextIdx = getDirectionalPointIndex(route[11], route, 10);
  assert.equal(nextIdx, 11);

  // Normal directional tracking: slight backward drift within window (-5 to +15)
  const driftIdx = getDirectionalPointIndex(route[8], route, 10);
  assert.equal(driftIdx, 8);

  // Large jump / warp (> 100m away, e.g. jumping to start of route from index 28)
  const resetIdx = getDirectionalPointIndex(route[0], route, 28);
  assert.equal(resetIdx, 0);
});

test("shouldMove handles missing, non-finite, and identical positions defensively", () => {
  assert.equal(shouldMove(undefined, [13.98, 100.58]), true);
  assert.equal(shouldMove([NaN, NaN], [13.98, 100.58]), true);
  assert.equal(shouldMove([13.98, 100.58], [NaN, NaN]), false);
  assert.equal(shouldMove([13.98, 100.58], [13.98, 100.58]), false);
  assert.equal(shouldMove([13.98, 100.58], [13.981, 100.581]), true);
});
