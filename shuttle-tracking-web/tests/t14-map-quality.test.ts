import assert from "node:assert/strict";
import test from "node:test";
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
