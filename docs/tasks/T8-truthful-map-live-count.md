# Implementation Task Specification: T8 — truthful public live-count expiry

## Source Task

- Roadmap task: `T8`
- Approved decisions: `D-001=A`, `D-005=A`; no new decision required
- Specialist briefs: `None`
- Status: **Level 3 implementation ready for this bounded first slice only**

## Allowed Writes

- `shuttle-tracking-web/hooks/useShuttleTracker.ts`
- `shuttle-tracking-web/hooks/useVehicleTracking.ts`

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

## Acceptance Criteria

- A canonical live vehicle initially contributes one to `Active Trams`.
- When its local freshness timer expires without a newer event, its marker is removed, its ETA is not
  current, and `Active Trams` decreases in the same UI transition.
- A newer canonical `live` event restores the marker/count path; stale/no-service/unknown events do
  not inflate the count.
- A `stale` state hides its vehicle Marker without removing the selected route or its stop markers.
- Route authority and state epoch/version rejection behavior are unchanged.

## Validation Commands

- `npm run lint` (working directory: `shuttle-tracking-web`)
- `npm run build` (working directory: `shuttle-tracking-web`)
- `bash scripts/ci-checks.sh` (repository root)

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

- Status: **Partially Complete — bounded public-state slice implemented on 2026-07-29.** The
  route-mutation/local-geometry-cache portion remains blocked on T10 and D-001=B/C.
- Changed files: `shuttle-tracking-web/hooks/useShuttleTracker.ts` and
  `shuttle-tracking-web/hooks/useVehicleTracking.ts`.
- Behavior: local expiry now removes a live vehicle from the public live count as well as its Marker
  and ETA; canonical `stale` now removes only the vehicle Marker while retaining route and stop
  layers. A newer canonical `live` event restores the normal Marker/count path.
- Verification: `npm run lint`, `npm run build`, `bash scripts/ci-checks.sh`,
  `node scripts/validate-agent-workflow.js`, and `git diff --check` passed. Lint retains two
  pre-existing warnings in `app/layout.tsx` and `utils/IconHelpers.ts`.
- Unavailable evidence: no local browser/socket interruption session was run; this task did not
  start a runtime environment.
- Next handoff: Level 1 re-audit of Frontend, Dashboard & UX, and Production Readiness before any
  remaining T8 work is considered eligible.
