# Implementation Task Specification: T6 — canonical vehicle state

## Source Task

- Roadmap task: `T6`
- Approved decisions: `D-001`, `D-002`, `D-003`, `D-004`
- Specialist briefs: `docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md`

## Allowed Writes

- `docs/tasks/T6-canonical-vehicle-state.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-backend/src/services/canonical-state.service.ts`
- `shuttle-tracking-backend/src/services/tracking.service.ts`
- `shuttle-tracking-backend/src/services/operations.service.ts`
- `shuttle-tracking-backend/src/server.ts`
- `shuttle-tracking-backend/src/routes/ingest.route.ts`
- `shuttle-tracking-backend/src/controllers/public.controller.ts`
- `shuttle-tracking-backend/test_t6_canonical_state.js`
- `shuttle-tracking-backend/test_t6_realtime.js`
- `shuttle-tracking-backend/test_socket_boundary.js`
- `shuttle-tracking-backend/test_pipeline.js`
- `shuttle-tracking-web/types/canonical-state.ts`
- `shuttle-tracking-web/types/index.ts`
- `shuttle-tracking-web/services/publicApi.ts`
- `shuttle-tracking-web/components/public/ShuttleTracker.tsx`
- `shuttle-tracking-web/components/admin/LiveMap.tsx`

## Read-only Context

- `AGENTS.md`
- `agents/level-3-refactor/AGENT.md`
- `.agents/skills/tram-refactoring-workflow/SKILL.md`
- `docs/project-knowledge-base.md`
- `docs/decision-queue.md`
- `docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md`
- `docs/audits/architecture-audit.md`
- `docs/audits/backend-audit.md`
- `docs/audits/frontend-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- `docs/audits/production-readiness-audit.md`
- `shuttle-tracking-backend/prisma/schema.prisma`
- `shuttle-tracking-backend/src/config/redis.ts`
- `shuttle-tracking-backend/src/middleware/auth.ts`
- `shuttle-tracking-backend/src/middleware/validation.ts`

## Invariants

- Keep the monolith, existing REST/Socket.IO/TTN transport boundaries, `location-update` event name, T5 lifecycle ownership, and current best-effort sampled history behavior.
- Preserve D-001=A controlled-demo limits and D-002/D-004 research boundaries; do not add raw observation storage, event-time claims, retention, export, or a Prisma migration.
- Public projections never expose `sourceId`, credentials, or raw payload data. Viewer transport state remains separate from vehicle service state.
- Active trip route authority takes precedence over vehicle assignment; the selected UI route is only a filter.
- Only accepted canonical state is published, and state ordering uses `(stateEpoch, stateVersion)`, never timestamps.
- Preserve existing authentication, validation, rate-limit, TTN decoding, sender acknowledgements, and T5 transaction/idempotency behavior.

## Required Changes

1. Add the backend-owned `CanonicalVehicleStateV1` envelope with server-receive freshness, explicit live/stale/no-service/unknown states, reason codes, route authority, safe projections, Redis-backed epoch/version allocation, and one publication boundary.
2. Route HTTP, Socket.IO, TTN, source-health transitions, and `GET /api/public/active-vehicles` through the same canonical state service. Remove direct canonical `io.emit` calls from transport handlers.
3. Preserve canonical publication ahead of sampled-history persistence; history failures remain operational signals and do not block live publication.
4. Add backend boundary/realtime tests and update only checked-in socket/pipeline assertions needed for the versioned envelope.
5. Add shared frontend canonical/viewer-state types, typed initial REST loading, epoch/version guards, route-authority filtering, local freshness expiry, reconnect state, and truthful live/stale/no-service/unknown rendering in public and admin maps. Do not let selected-route state populate a vehicle route.

## Acceptance Criteria

- Every emitted and initial REST state has the required schema, identity, route, service, reason, freshness, and timing fields; public state omits internal source identity.
- Concurrent publications for one vehicle cannot publish a lower version after a higher version in one epoch; a new epoch resets client comparison.
- Fresh source is `live`; all configured sources stale emits one `stale` transition; no active/never-seen source is `no_service`; dependency/state-evaluation failure is `unknown`.
- Active-trip route wins, vehicle assignment is explicitly labelled as fallback, and absent route is `unknown`; changing the UI-selected route cannot reassign a vehicle.
- HTTP, Socket.IO, and TTN converge on one canonical semantics and no direct `location-update` emission remains outside the publisher.
- Initial REST state and Socket.IO state are the same versioned projection, and stale cached entries are not returned as `live`.
- T5 operations behavior remains intact; sampled history failure remains distinct from live-state publication.
- Frontend ignores lower versions in the same epoch, accepts a new epoch, keeps stale/no-service/unknown distinct, disables ETA when not live, seeds from REST, and re-reads REST after reconnect.

## Validation Commands

- `npm run build` in `shuttle-tracking-backend`
- `node test_t6_canonical_state.js` in `shuttle-tracking-backend`
- `node test_t6_realtime.js` in `shuttle-tracking-backend`
- `node test_socket_boundary.js` in `shuttle-tracking-backend` against an explicitly approved disposable target
- `node test_pipeline.js` in `shuttle-tracking-backend` against an explicitly approved disposable target
- `npm run lint` and `npm run build` in `shuttle-tracking-web`
- `bash scripts/ci-checks.sh`
- `git diff --check`

## Rollout and Migration Limits

- No migration, seed, deployment, provider, hardware, runtime smoke, or recovery check may run against ambient configuration. Stateful checks require an explicitly approved disposable Postgres/Redis target, credentials/data scope, expected mutations, and cleanup/rollback plan.
- Keep `location-update` as the transport event. `canonicalLocation`, where retained for checked-in sender compatibility, is the same `CanonicalVehicleStateV1` object and not a legacy second shape.

## Stop Conditions

- Stop if another write path is required.
- Stop if an owner decision, migration target, secret, provider, or hardware fact is unresolved.
- Stop rather than changing architecture or adding dependencies outside this specification.
