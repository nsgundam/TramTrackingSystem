# Implementation Task Specification: T8 — truthful public live-count expiry

## Source Task

- Roadmap task: `T8`
- Approved decisions: `D-001=A`, `D-005=A`; no new decision required
- Specialist briefs: `None`
- Status: **Complete — approved truthful public-state scope is verified; route-mutation/cache work
  remains separately deferred to T10 and D-001=B/C.**

## Allowed Writes

- `shuttle-tracking-web/hooks/useShuttleTracker.ts`
- `shuttle-tracking-web/utils/canonical-public-state.ts`
- `shuttle-tracking-web/tests/t8-public-state.test.ts`
- `shuttle-tracking-web/tests/t8-local-server.mjs`
- `shuttle-tracking-web/tests/t8-route-switch.spec.ts`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`
- `shuttle-tracking-web/package-lock.json`
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
6. Extract the canonical public-state projection used by the hook into one typed, dependency-free
   utility and cover it with Node's built-in TypeScript test runner. Do not add a dependency or a
   second state authority.
7. Add a Playwright test using an in-process localhost mock of the public API and Socket.IO server.
   It must exercise actual public-page Marker/count behavior across live expiry, route switching, and
   a newer canonical live event. The mock is test-only and must never accept credentials or contact
   application data stores.

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
- A deterministic test covers live count projection through local expiry and the route-switch display
  gate for `live`, expired, `stale`, `no_service`, `unknown`, missing-state, and unknown-route cases.
- A Playwright browser test proves the public page does not restore an expired Marker on route return,
  then restores it only after a newer canonical `live` event.

## Validation Commands

- `npm run lint` (working directory: `shuttle-tracking-web`)
- `npm run test:t8` (working directory: `shuttle-tracking-web`)
- `npm run test:e2e:t8` (working directory: `shuttle-tracking-web`)
- `npm run build` (working directory: `shuttle-tracking-web`)
- `bash scripts/ci-checks.sh` (repository root)
- `git diff --check` (repository root)
- `node scripts/validate-agent-workflow.js` (repository root)

## Rollout and Migration Limits

- No migration, API, Socket.IO contract, dependency, environment, provider, device, or deployment
  change is authorized.
- The native test runs only pure frontend state projection. It starts no service, uses no network,
  credentials, browser profile, database, Redis instance, or ambient runtime state.
- The Playwright test starts only a disposable `127.0.0.1:13000` Next server and
  `127.0.0.1:13001` mock API/Socket.IO server. It uses synthetic vehicle/route/stop state, has no
  credentials, database, Redis, provider, production key, or external OSRM access, and both child
  processes are shut down by the test runner.
- Do not include the route-mutation/local-geometry-cache portion of T8; it remains blocked on T10 and
  D-001=B/C.

## Stop Conditions

- Stop if another write path is required.
- Stop if a browser/runtime assertion cannot be made from the available local development environment;
  record the missing evidence rather than broadening the task.
- Stop rather than changing public vocabulary, canonical-state ownership, or any research/export
  behavior.

## Impact Triage

- Product: preserves the D-001=A neutral rider presentation; no new user-visible vocabulary.
- Architecture: keeps canonical state and local-expiry projection authoritative in the existing
  frontend path; the utility is a pure extraction, not a new store or API boundary.
- Security/privacy: no credential, raw telemetry, authorization, or logging behavior changes.
- Data/migration: no schema, persistence, retention, or migration changes.
- Operations/research: tests use synthetic in-memory state only. The local test servers contact no
  provider/device or application data store and make no research or production claim.

## Execution Record

- Status: **Complete — approved truthful public-state scope verified on 2026-08-01.** The
  route-mutation/local-geometry-cache portion remains excluded and blocked on T10 and D-001=B/C.
- Changed files for this evidence slice: `shuttle-tracking-web/utils/canonical-public-state.ts`,
  `shuttle-tracking-web/tests/t8-public-state.test.ts`, `shuttle-tracking-web/package.json`,
  `shuttle-tracking-web/hooks/useShuttleTracker.ts`, this task record,
  `docs/roadmap/master-refactoring-roadmap.md`, and `docs/audits/README.md`.
- Behavior: local expiry continues to remove a live vehicle from the public live count, Marker, and
  ETA in one transition; canonical non-live updates remove only their vehicle Marker. On route
  change, the hook now adds a stored Marker only for the latest accepted canonical `live` state whose
  authoritative route matches the selected route and which is not locally expired. Every other
  current/missing state removes only that vehicle Marker, leaving route and stop layers intact. A
  stale/expired Marker can therefore return only after a newer canonical `live` event is accepted by
  the existing epoch/version guard.
- Verification: `npm run test:t8` passes two deterministic tests: local expiry projects a live
  vehicle out of `Active Trams`, and route selection displays a Marker only for current, unexpired,
  authoritative live state. `bash scripts/ci-checks.sh` passes outside the sandbox, including the
  new test, frontend lint/build, backend checks, Compose parsing, and workflow validation. Lint
  retains two pre-existing warnings in `app/layout.tsx` and `utils/IconHelpers.ts`; Node emits a
  module-type warning for the standalone TypeScript test and the build emits `DEP0205`.
- Browser evidence: `npm run test:e2e:t8` starts an isolated Next public page at
  `127.0.0.1:13000` and a synthetic public API/Socket.IO mock at `127.0.0.1:13001`. It blocks the
  ambient backend fallback, verifies the Socket.IO request reaches the mock, and proves live → local
  expiry → route R02 → route R01 does not restore the Marker/count until the mock sends canonical
  `live` version 3. The test was run twice directly and again through CI. No deployment, provider,
  physical-device, database, Redis, or real credential/data test was run.
- Re-audit handoff: Level 1 must validate Frontend → Dashboard & UX → Production Readiness against
  this working-tree evidence before the shared audit state is finalized.
