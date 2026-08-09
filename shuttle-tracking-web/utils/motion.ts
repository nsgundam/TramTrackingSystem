export type Coordinate = readonly [number, number];
export type CancelMotion = () => void;

export interface FrameScheduler {
  now: () => number;
  request: (callback: (timestamp: number) => void) => number;
  cancel: (handle: number) => void;
}

interface CoordinateAnimationOptions {
  start: Coordinate;
  end: Coordinate;
  durationMs: number;
  write: (position: [number, number]) => void;
  reducedMotion?: boolean;
  scheduler?: FrameScheduler;
}

export type OwnedMotionRegistry = Record<string, CancelMotion | undefined>;

const browserFrameScheduler = (): FrameScheduler => ({
  now: () => performance.now(),
  request: (callback) => requestAnimationFrame(callback),
  cancel: (handle) => cancelAnimationFrame(handle),
});

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function mapMotionOptions(duration: number, reducedMotion = prefersReducedMotion()) {
  return reducedMotion
    ? { animate: false, duration: 0 }
    : { animate: true, duration };
}

export function motionScrollBehavior(reducedMotion = prefersReducedMotion()): ScrollBehavior {
  return reducedMotion ? "auto" : "smooth";
}

export function startCoordinateAnimation({
  start,
  end,
  durationMs,
  write,
  reducedMotion = false,
  scheduler,
}: CoordinateAnimationOptions): CancelMotion {
  if (reducedMotion || durationMs <= 0) {
    write([end[0], end[1]]);
    return () => undefined;
  }

  const frameScheduler = scheduler ?? browserFrameScheduler();
  const startTime = frameScheduler.now();
  let cancelled = false;
  let frameHandle: number | null = null;

  const step = (currentTime: number) => {
    if (cancelled) return;
    frameHandle = null;
    const progress = Math.min(Math.max((currentTime - startTime) / durationMs, 0), 1);
    write([
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress,
    ]);
    if (progress < 1) frameHandle = frameScheduler.request(step);
  };

  frameHandle = frameScheduler.request(step);

  return () => {
    if (cancelled) return;
    cancelled = true;
    if (frameHandle !== null) frameScheduler.cancel(frameHandle);
    frameHandle = null;
  };
}

export function cancelOwnedMotion(registry: OwnedMotionRegistry, key: string): void {
  const cancel = registry[key];
  delete registry[key];
  cancel?.();
}

export function replaceOwnedMotion(
  registry: OwnedMotionRegistry,
  key: string,
  start: () => CancelMotion,
): void {
  cancelOwnedMotion(registry, key);
  registry[key] = start();
}

export function cancelAllOwnedMotions(registry: OwnedMotionRegistry): void {
  Object.keys(registry).forEach((key) => cancelOwnedMotion(registry, key));
}
