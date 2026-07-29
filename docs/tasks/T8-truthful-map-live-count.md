# Implementation Task Specification: T8 — truthful public live-count expiry

## Source Task

- Roadmap task: `T8`
- Approved decisions: `D-001=A`, `D-005=A`; no new decision required
- Specialist briefs: `None`
- Status: **Partially Complete — corrective route-switch guard implemented; focused/runtime evidence
  and the required re-audits remain pending.**

## Allowed Writes

- `shuttle-tracking-web/hooks/useShuttleTracker.ts`
- `docs/tasks/T8-truthful-map-live-count.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`

## Read-only Context

- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/frontend-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- `shuttle-tracking-web/components/public/ShuttleTracker.tsx`
- `shuttle-tracking-web/hooks/useVehicleTracking.ts`
- `shuttle-tracking-web/types/canonical-state.ts`

## Invariants

- Public UI consumes only `CanonicalVehicleStateV1`; never expose raw source IDs, diagnostics,
  connection wording, or operational labels.
- `live` is counted only while the locally held canonical state has not expired. `stale`,
  `no_service`, and `unknown` do not count as active trams.
- Local expiry must not accept an older state, mutate backend state, close a Trip, or alter the T7
  raw-research path.
- Public ETA must remain absent once its vehicle is locally expired.

## Required Changes

1. In the existing local-expiry callback, recompute `vehicleStateCounts` and `availableCount` from
   the canonical state registry while treating the just-expired live vehicle as non-live.
2. Keep the existing marker removal and ETA recalculation, so marker visibility, live count, and ETA
   transition together from the same expiry event.
3. Ensure a newer canonical event clears the local-expiry flag and restores its count only according
   to the backend-provided `serviceState`.
4. When a canonical vehicle changes to `stale`, remove only its vehicle Marker from the public map.
   Preserve the route and stop layers, and restore the Marker only after a newer canonical `live`
   event.
5. In `handleRouteChange`, add a vehicle Marker only when the latest accepted canonical state is
   `live`, its authoritative route matches the selected route, and the vehicle is not locally
   expired. For `stale`, `no_service`, `unknown`, locally expired, missing, or unknown-route state,
   remove only that vehicle Marker if present; never remove route or stop layers.

## Acceptance Criteria

- A canonical live vehicle initially contributes one to `Active Trams`.
- When its local freshness timer expires without a newer event, its marker is removed, its ETA is not
  current, and `Active Trams` decreases in the same UI transition.
- A newer canonical `live` event restores the marker/count path; stale/no-service/unknown events do
  not inflate the count.
- A `stale` state hides its vehicle Marker without removing the selected route or its stop markers.
- Switching away from and back to a route cannot restore a stale, locally expired, `no_service`,
  `unknown`, missing-state, or unknown-route vehicle Marker; only a newer accepted canonical `live`
  state restores it.
- Route authority and state epoch/version rejection behavior are unchanged.

## Validation Commands

- `npm run lint` (working directory: `shuttle-tracking-web`)
- `npm run build` (working directory: `shuttle-tracking-web`)
- `bash scripts/ci-checks.sh` (repository root)
- `git diff --check` (repository root)
- `node scripts/validate-agent-workflow.js` (repository root)

## Rollout and Migration Limits

- No migration, API, Socket.IO contract, dependency, environment, provider, device, or deployment
  change is authorized.
- Do not include the route-mutation/local-geometry-cache portion of T8; it remains blocked on T10 and
  D-001=B/C.

## Stop Conditions

- Stop if another write path is required.
- Stop if a browser/runtime assertion cannot be made from the available local development environment;
  record the missing evidence rather than broadening the task.
- Stop rather than changing public vocabulary, canonical-state ownership, or any research/export
  behavior.

## Execution Record

- Status: **Partially Complete — corrective route-switch slice implemented on 2026-07-29.** The
  route-mutation/local-geometry-cache portion remains blocked on T10 and D-001=B/C; this task cannot
  be marked Complete without focused/runtime acceptance evidence and re-audit.
- Changed files for this corrective slice: `shuttle-tracking-web/hooks/useShuttleTracker.ts`, this
  task record, `docs/roadmap/master-refactoring-roadmap.md`, and `docs/audits/README.md`.
- Behavior: local expiry continues to remove a live vehicle from the public live count, Marker, and
  ETA in one transition; canonical non-live updates remove only their vehicle Marker. On route
  change, the hook now adds a stored Marker only for the latest accepted canonical `live` state whose
  authoritative route matches the selected route and which is not locally expired. Every other
  current/missing state removes only that vehicle Marker, leaving route and stop layers intact. A
  stale/expired Marker can therefore return only after a newer canonical `live` event is accepted by
  the existing epoch/version guard.
- Verification: `npm run lint` passed with two pre-existing warnings in `app/layout.tsx` and
  `utils/IconHelpers.ts`; `npm run build` and `bash scripts/ci-checks.sh` passed outside the sandbox
  because Turbopack requires a local helper process/port. Build also emitted Node's
  `DEP0205` deprecation warning. `git diff --check` and
  `node scripts/validate-agent-workflow.js` passed after final state synchronization.
- Unavailable evidence: no frontend test harness exists and none was added. No focused
  live → expiry/stale → route switch → newer-live runtime test, browser/socket interruption session,
  or deployment test was run.
- Next handoff: Level 1 must re-audit Frontend → Dashboard & UX → Production Readiness for the
  route-switch Marker visibility change before any T8 closure claim.
