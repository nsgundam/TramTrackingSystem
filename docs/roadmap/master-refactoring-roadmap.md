# Master Refactoring Roadmap

## Input Coverage

All required inputs are available and must be treated as the evidence base:

- `docs/project-knowledge-base.md`
- `docs/audits/product-audit.md`
- `docs/audits/architecture-audit.md`
- `docs/audits/backend-audit.md`
- `docs/audits/frontend-audit.md`
- `docs/audits/database-audit.md`
- `docs/audits/infrastructure-device-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- `docs/audits/security-devops-observability-audit.md`
- `docs/audits/production-readiness-audit.md`

## Execution Rules

1. Execute phases in order. Parallelize only tasks with no shared files or dependency.
2. For every task: preserve existing behavior, add/update tests, run the relevant checks, and update migrations/types/config together.
3. Do not implement ESP32, high-fidelity playback, reports, roles, audit log, or announcements until the decision gates below are resolved. Implement TTN only after its confirmed topology prerequisites pass.
4. A task is complete only when its acceptance criteria pass and no Critical/High audit finding covered by the task remains unresolved.
5. Do not introduce new product scope. Every change must map to the cited audit sections.

## Phase Gates

### Phase 1 - Production Blockers

Entry: current MVP codebase and all audits available.

Exit: authenticated sender flow, safe trip lifecycle, validation, safe defaults, deployable production runtime/config, health/readiness, freshness visibility, route-stop operations, minimum trip history, and abuse controls are implemented and verified.

### Phase 2 - Structural Foundations

Entry: Phase 1 exit criteria pass.

Exit: canonical location selection, GPS policy, service-layer boundaries, admin session security, cache/config consistency, and structured logging are stable.

### Phase 3 - Feature Completion

Entry: Phase 2 exit criteria pass.

Exit: driver/mobile workflow, feedback workflow, operations dashboard, and public trust/empty-state UX are usable.

### Phase 4 - Hardening and Scale

Entry: Phase 3 exit criteria pass and pilot usage data exists.

Exit: automated release gates, focused frontend modules, stronger operational monitoring, and scale-related database/runtime improvements are verified.

### Phase 5 - Decisions and Deferred Scope

Entry: user decisions are recorded for ESP32, retention/fidelity, and extended product scope; TTN prerequisites are complete.

Exit: only the explicitly approved deferred capabilities are implemented.

## Consolidated Tasks

### T1 - Authenticate all trip and GPS senders

- Source: Production Readiness Finding 1; Security/DevOps Recommendation 1; Backend Critical Issue 1 and Recommendation 1.
- Phase: 1
- Depends on: T2 source registry exists; migrate legacy vehicle-only clients before removing fallback behavior.
- Blocks: T3, T13, T19, T27
- Priority: Critical
- Difficulty: Medium
- Agent: Level 2 Auth/Security Agent, then Level 3 Refactoring Agent
- Files: `shuttle-tracking-backend/src/controllers/auth.controller.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`
- Implement: require credentials for every active non-public source and TTN webhook; issue short-lived sender credentials; authenticate trip start/end and Socket.IO handshake/events; bind sender to vehicle/source; reject spoofed vehicle/trip IDs; retire `vehicleId -> sourceId` fallback after client migration; never log secrets.
- Accept when: an active source cannot exist without a credential; missing production `TTN_WEBHOOK_SECRET` fails closed; unauthenticated REST, webhook, and socket writes fail; authenticated sender can operate only its own source/trip; tests cover the trust boundary.

### T2 - Operationalize `TrackingSource` and device identity

- Source: Production Readiness Finding 2; Architecture Strength 6 and remaining risks; Backend Critical Issue 2 and Recommendation 4; Database Critical Issue 1 and Recommendation 1; Infrastructure Critical Issue 4 and Recommendation 4; Security/DevOps Recommendations 1 and 3.
- Phase: 1
- Depends on: none for schema/API design; T1 for sender enforcement.
- Blocks: T13, T19, T26, T27
- Priority: High; Critical only for multi-device production
- Difficulty: Medium
- Agent: Level 2 Device Registry Agent, then Level 3 Refactoring Agent
- Files: `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/server.ts`
- Implement: complete the existing registry integration and provisioning flow; require registered source IDs for non-legacy clients; expose safe source fields only (never `secretHash`); add rotation without returning secrets; document priority/failover and admin source health.
- Accept when: source-to-vehicle ownership is enforced; active sources require credentials; device list/detail/create/update responses exclude `secretHash`; source health/last-seen/analytics are queryable; migrations and fixtures remain valid.

### T3 - Make trip lifecycle idempotent and transactional

- Source: Production Readiness Finding 3; Backend Critical Issue 3 and Recommendation 2; Database Critical Issue 2 and Recommendation 2; Architecture trip lifecycle finding.
- Phase: 1
- Depends on: T1, T2
- Blocks: T11, T13, T19, T21
- Priority: High/Critical
- Difficulty: Medium
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-backend/src/controllers/trips.controller.ts`, `shuttle-tracking-backend/prisma/schema.prisma`
- Implement: move lifecycle rules into one service; use Prisma transactions; return the existing active trip or explicit 409 on duplicate start; end only an owned `in_progress` trip; update vehicle state atomically.
- Accept when: duplicate start is deterministic; invalid/foreign/end-twice requests return safe 4xx; database constraint and service logic agree; unit/integration tests cover concurrent starts and end behavior.

### T4 - Add central validation and safe API errors

- Source: Production Readiness Finding 10; Backend Recommendation 3; Security/DevOps Recommendation 3; Database Recommendation 5.
- Phase: 1
- Depends on: T1, T2, T3
- Blocks: T12, T19, T26, T27
- Priority: High
- Difficulty: Easy-Medium
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-backend/src/controllers/*.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`
- Implement: add schemas/DTOs for auth, vehicle, route, stop, route-stop, trip, and GPS payloads; validate coordinates, IDs, enums, ownership, and required fields; add one error-to-response mapping.
- Accept when: malformed payloads never reach Prisma or broadcast; invalid coordinates and mismatched trip/vehicle are rejected; responses use stable status/code/message fields; tests cover every write endpoint.

### T5 - Remove unsafe defaults and enforce secret configuration

- Source: Production Readiness Finding 4; Security/DevOps Recommendation 4.
- Phase: 1
- Depends on: none
- Blocks: T6, T7
- Priority: Critical
- Difficulty: Easy
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-backend/.env.example`, `docker-compose.yml`, `shuttle-tracking-backend/prisma/seed.ts`, `shuttle-tracking-backend/docker-entrypoint.sh`
- Implement: remove concrete JWT, TTN webhook, and password defaults; fail startup when production secrets are missing/weak; make seed admin credentials explicit and dev-only; provision the first production admin through a one-time secure setup; never log full Redis URLs.
- Accept when: production startup fails closed with missing/unsafe secrets; no default admin credential is usable; env examples contain placeholders only; repository search finds no production-capable hard-coded secret or full credential-bearing URL.
- Status: Complete
- Evidence: `npm run build`, `npm test`, Prisma validation, Compose config checks, and controlled entrypoint/seed fail-closed smoke tests passed on 2026-07-17; scoped production-capable files contain placeholders or explicit required variables only.

### T6 - Define deployable production configuration

- Source: Production Readiness Finding 5; Infrastructure Critical Issue 2 and Recommendation 1.
- Phase: 1
- Depends on: T5, T16
- Note: T5 unblocked on 2026-07-17 after secret/default enforcement and production Compose required-variable checks landed.
- Blocks: T7, T8
- Priority: Critical
- Difficulty: Medium
- Agent: Level 2 Deployment/Cloud Agent, then Level 3 Refactoring Agent
- Files: `docker-compose.yml`, `env.example`, `shuttle-tracking-backend/.env.example`, `shuttle-tracking-web/.env.example`
- Implement: add provider env templates and a deployment runbook for Vercel frontend, Render backend/Redis, and Neon database; document build/start/migration commands, `/health` and `/ready` probes, CORS/Socket.IO origins, Neon migration policy, Redis eviction/persistence, backup/restore ownership, and log destination.
- Accept when: staging configuration is reproducible from environment variables; frontend REST and Socket.IO resolve the same backend; Render uses health/readiness probes; CORS/WebSocket origins are explicit; no local-only URL is required.

### T7 - Use production build and runtime commands

- Source: Production Readiness Finding 13; Infrastructure Critical Issue 1 and Recommendation 2; Security/DevOps Recommendation 5.
- Phase: 1
- Depends on: T5, T6
- Note: T5 unblocked on 2026-07-17 after production startup secret validation and seed disablement landed.
- Blocks: production release
- Priority: High
- Difficulty: Medium
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-backend/Dockerfile`, `shuttle-tracking-web/Dockerfile`, `shuttle-tracking-backend/package.json`, `shuttle-tracking-web/package.json`, `docker-compose.yml`
- Implement: create production backend build/start and frontend build/start paths; remove dev server/source mounts from production path; set production runtime explicitly; keep a separate local-dev path.
- Accept when: clean build succeeds; production containers do not run `nodemon` or `next dev`; health checks can start against the production command.

### T8 - Add health/readiness and minimum monitoring

- Source: Production Readiness Finding 12; Infrastructure Critical Issue 3 and Recommendation 3; Security/DevOps Recommendation 7.
- Phase: 1
- Depends on: T6, T7
- Blocks: production release, T21
- Priority: High
- Difficulty: Easy-Medium
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/config/prisma.ts`, `shuttle-tracking-backend/src/config/redis.ts`, `docker-compose.yml`
- Implement: keep the existing `/health` and `/ready` contracts; configure deployment probes; check DB/Redis readiness without leaking internals; add metrics/log fields for accepted/rejected observations, stale sources, source selection, dependency errors, and broadcasts.
- Accept when: liveness works without dependencies; readiness fails when DB/Redis is unavailable; Render/staging health checks use the endpoints; operators can query the minimum counters without secrets or raw tokens.

### T9 - Add realtime freshness and stale-state handling

- Source: Production Readiness Finding 11; Frontend Recommendation 1; Dashboard/UX Recommendation 1; Product Phase 1 stale/offline gap; Security/DevOps Recommendation 8.
- Phase: 1
- Depends on: T2, T8
- Blocks: T21, T22
- Priority: High
- Difficulty: Medium
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- Implement: track socket lifecycle and per-vehicle `lastSeenAt`; define Live/Stale/Offline thresholds; show connection state, last update, stale markers, and recoverable errors in public/admin views.
- Accept when: stale vehicles are not presented as live; disconnect/reconnect is visible; thresholds are centralized; public and admin views render the same state semantics.

### T10 - Add route-stop management and invalidate caches

- Source: Production Readiness Findings 6 and 17; Product Feature Gap 1; Frontend Recommendations 2 and 4; Dashboard/UX Recommendation 8; Backend Recommendation 5; Architecture cache finding.
- Phase: 1
- Depends on: T4, T6
- Blocks: T22
- Priority: Critical
- Difficulty: Medium
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/components/admin/RouteModal.tsx`, `shuttle-tracking-web/components/admin/Sidebar.tsx`, `shuttle-tracking-backend/src/routes/routeStops.route.ts`, `shuttle-tracking-backend/src/controllers/routeStops.controller.ts`, `shuttle-tracking-backend/src/services/cache.service.ts`
- Implement: add route detail/manage-stops UI with add/remove/reorder and save validation; invalidate public route-stop and geometry caches after every membership/order/coordinate mutation; replace broad Redis `KEYS` when touching cache logic.
- Accept when: admin can create the ordered route-stop list without API/manual work; invalid order/membership is rejected; next public read sees the new order/geometry; tests cover create/delete/reorder invalidation.

### T11 - Add minimum admin trip history

- Source: Production Readiness Finding 8; Product Feature Gap 3; Backend Recommendation 7; Database GPS history review.
- Phase: 1
- Depends on: T3, T4
- Blocks: T21, advanced playback
- Priority: Critical for list/history; Medium for playback
- Difficulty: Medium
- Agent: Level 3 Refactoring Agent
- Files: trip/GPS controllers and routes, `shuttle-tracking-backend/prisma/schema.prisma`, admin navigation/pages
- Implement: add protected admin list/detail APIs with date, route, vehicle, and status filters; add a scan-friendly admin history page; keep high-fidelity playback deferred to T14.
- Accept when: admins can find completed/active trips and inspect metadata; unauthorized users cannot access history; pagination/filter tests pass.

### T12 - Add rate limiting and abuse controls

- Source: Production Readiness Finding 16; Security/DevOps Recommendation 10.
- Phase: 1
- Depends on: T1, T4, T6
- Blocks: public production release
- Priority: High
- Difficulty: Medium
- Agent: Level 2 Security/Abuse Agent, then Level 3 Refactoring Agent
- Files: `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/routes/public.route.ts`, `shuttle-tracking-backend/src/routes/trips.route.ts`
- Implement: rate-limit admin/vehicle login, feedback, trip writes, HTTP ingestion, TTN webhook, and Socket.IO events; rate by authenticated `sourceId` for GPS; reject impossible frequencies; add brute-force/backoff behavior and Redis-backed limits where required.
- Accept when: limits are configurable; excess requests receive safe 429 responses; authenticated source limits are separated from public limits; tests cover login, HTTP/TTN ingestion, socket flooding, and GPS abuse.

### T13 - Separate ingestion from canonical current location

- Source: Production Readiness Finding 9; Architecture location-ingestion finding; Backend Recommendation 6; Security/DevOps Recommendation 8.
- Phase: 2
- Depends on: T1, T2, T3, T4
- Blocks: T21, T26, T27
- Priority: High
- Difficulty: Medium
- Agent: Level 2 Realtime/Location Agent, then Level 3 Refactoring Agent
- Files: `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/src/server.ts`
- Implement: normalize and persist accepted observations separately from canonical vehicle state; select canonical location by source priority, freshness, validity, and ownership; broadcast only the canonical validated result; return typed accepted/rejected results.
- Accept when: rejected observations are never broadcast; canonical state is deterministic with multiple sources; source failover is observable; sender receives ack/error state.

### T14 - Define GPS sampling, retention, and index policy

- Source: Production Readiness Finding 14; Database Critical Issues 3/4 and Recommendations 3/4; Infrastructure TTN sampling note.
- Phase: 2
- Depends on: T2, T11, T13
- Blocks: high-fidelity playback, reports, scale work
- Priority: High; Critical if high-fidelity history is promised
- Difficulty: Medium
- Agent: User Decision Required, then Level 2 Database/Time-Series Agent
- Files: `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/services/tracking.service.ts`
- Decide only: retention period, archive/delete ownership, and whether high-fidelity playback is in scope. The current TTN history sampling target is 60 seconds and may be implemented as the MVP policy. Add indexes/migration for the approved query policy.
- Accept when: 60-second sampled history is documented and enforced for MVP; retention/archiving behavior is testable; indexes match list/history queries; product copy does not promise unsupported fidelity.

### T15 - Create a trip/operations domain service

- Source: Architecture trip lifecycle finding; Backend trip lifecycle review; Product active-trip/stale dashboard gaps.
- Phase: 2
- Depends on: T3, T4, T13
- Blocks: T19, T21, future reports
- Priority: High
- Difficulty: Medium
- Agent: Level 3 Refactoring Agent
- Files: trip controllers/services, `shuttle-tracking-backend/src/services/tracking.service.ts`
- Implement: centralize start/end/current-trip/source-health rules behind typed service APIs; keep controllers thin; prevent frontend from becoming the source of operational truth.
- Accept when: lifecycle and canonical-state rules have one owner; controllers only translate HTTP/socket input/output; service tests cover state transitions.

### T16 - Align REST and Socket.IO environment configuration

- Source: Frontend Recommendation 6; Infrastructure production configuration analysis; Production Readiness Finding 5.
- Phase: 2
- Depends on: T6
- Blocks: reliable T9 and production deployment
- Priority: Medium
- Difficulty: Easy
- Agent: Level 3 Refactoring Agent
- Files: frontend env/API/socket config, backend CORS/socket config
- Implement: use one explicit backend origin model for REST and Socket.IO; validate required client/server variables at startup/build; remove divergent defaults.
- Accept when: local/staging/prod each use the intended origin; browser REST and socket requests target the same environment; missing config fails clearly.

### T17 - Harden admin session handling

- Source: Production Readiness Finding 15; Security/DevOps Recommendation 2; Frontend Issue 4 and Recommendation 7.
- Phase: 2
- Depends on: T5, T6
- Blocks: public admin deployment
- Priority: High
- Difficulty: Medium
- Agent: Level 2 Auth/Security Agent, then Level 3 Refactoring Agent
- Files: `shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/services/api.ts`, `shuttle-tracking-backend/src/controllers/auth.controller.ts`
- Implement: use server-managed `httpOnly`, `secure`, `sameSite` cookies where compatible; validate token claims/expiry/role in backend and route protection; define logout/expiry behavior.
- Accept when: JS cannot read the session token; invalid/expired/non-admin sessions are rejected server-side and redirected client-side; cookie behavior is tested over HTTPS/staging.

### T18 - Split public tracker into focused modules

- Source: Production Readiness Finding 18; Frontend Issue 3 and Recommendation 3; Architecture frontend-intelligence finding.
- Phase: 4
- Depends on: T9, T13, T22
- Blocks: lower-risk future frontend changes
- Priority: High
- Difficulty: Medium
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/hooks/useLeafletMap.ts`, `shuttle-tracking-web/utils/MapHelpers.ts`
- Implement: extract socket/freshness state, route/stop loading, marker lifecycle, location/ETA calculation, geolocation, and presentation into focused hooks/modules; preserve behavior.
- Accept when: component responsibilities are separated; unit tests cover extracted calculations/state; public behavior and performance do not regress.

### T19 - Build the minimum driver/mobile workflow

- Source: Production Readiness Finding 7; Product Feature Gap 2 and Phase 1 Critical roadmap; Infrastructure mobile readiness review.
- Phase: 3
- Depends on: T1, T2, T3, T4, T13, T16
- Blocks: production operations if no external sender is supplied
- Priority: Critical for real driver operations
- Difficulty: Medium
- Agent: Level 2 Mobile/Product Agent, then Level 3 Refactoring Agent
- Files: sender client replacing/extending `shuttle-tracking-web/simulate.js`, trip/GPS API integration
- Implement: provide vehicle login, assigned vehicle/route confirmation, start trip, permission/error handling, live send status, reconnect behavior, and end trip.
- Accept when: a driver can complete the full lifecycle without simulator/manual API calls; auth and retry behavior are safe; device state is visible to operations.

### T20 - Add feedback workflow

- Source: Product Feature Gap 4 and Phase 2 roadmap; Database Recommendation 6; Dashboard/UX operational visibility gap.
- Phase: 3
- Depends on: T4, T12, T17
- Blocks: rider incident triage
- Priority: Medium
- Difficulty: Easy-Medium
- Agent: Level 3 Refactoring Agent
- Files: feedback schema/controllers/routes and public/admin pages
- Implement: add public feedback submission with validation/rate limits and admin review/status workflow; extend schema only as needed by the audit-defined workflow.
- Accept when: rider can submit safely; admin can filter/review/resolve; abuse controls and error states are present.

### T21 - Build an operations dashboard around exceptions

- Source: Production Readiness Finding 19; Dashboard/UX Issue 2 and Recommendations 2/9; Product active-trip/offline gaps; Security/DevOps Recommendation 8.
- Phase: 3
- Depends on: T8, T9, T11, T13, T15
- Blocks: operational readiness sign-off
- Priority: High
- Difficulty: Medium
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-web/app/admin/dashboard/page.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, admin API/dashboard data modules
- Implement: add Attention Needed view for stale/silent vehicles, uncovered routes, active trip problems, source health, socket/API health, and recent failures; add a scan-friendly vehicle list beside the map.
- Accept when: an admin can identify exceptions without clicking map markers; list and map share freshness state; loading/error/empty states are recoverable.

### T22 - Improve public trust, labels, ETA confidence, and tour anchors

- Source: Production Readiness Finding 20; Dashboard/UX Recommendations 3-6; Frontend error/empty-state review.
- Phase: 3
- Depends on: T9, T10, T13
- Blocks: trustworthy rider-facing release
- Priority: High for no-data states; Medium for labels/ETA/tour
- Difficulty: Easy
- Agent: Level 3 Refactoring Agent
- Files: `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `AvailabilityCard.tsx`, `StopInfoCard.tsx`, `AppTour.tsx`
- Implement: distinguish no service/no assignment/no GPS/socket failure; show route meaning, freshness, and approximate/ranged ETA; add stable `data-tour` anchors; add route-load retry UI.
- Accept when: zero/no-data states explain cause and next action; ETA does not imply unsupported precision; tour selectors match rendered controls; mobile layout remains usable.

### T23 - Improve admin CRUD feedback and client validation

- Source: Frontend Recommendation 5; Dashboard/UX Recommendation 7.
- Phase: 3
- Depends on: T4, T17
- Blocks: admin workflow polish
- Priority: Medium
- Difficulty: Easy
- Agent: Level 3 Refactoring Agent
- Files: admin vehicle/route/stop pages and forms
- Implement: replace browser `alert`/console-only failures with inline banners/toasts and retry actions; add client validation aligned with backend schemas.
- Accept when: every mutation has pending/success/error states; failures are recoverable; client/server validation messages are consistent.

### T24 - Add structured redacted logging

- Source: Security/DevOps Recommendations 3, 9, 11, and 12; Production Readiness monitoring requirements.
- Phase: 2
- Depends on: T1, T4, T8
- Blocks: dependable incident diagnosis
- Priority: Medium
- Difficulty: Easy-Medium
- Agent: Level 3 Refactoring Agent
- Files: backend server/services/config modules
- Implement: standardize structured logs with request/event IDs, source/vehicle IDs, status, latency, and error codes; redact tokens, passwords, `secretHash`, secrets, and credential-bearing URLs; remove high-volume frontend live-location logs; add lightweight frontend/backend error tracking with environment and release tags.
- Accept when: auth failures, rejected GPS, lifecycle failures, dependency failures, and stale sources produce searchable fields; device APIs never expose `secretHash`; Redis URLs are redacted; error events are correlated to environment/release; redaction tests pass.

### T25 - Add automated tests and release gates

- Source: Backend Recommendation 8; Security/DevOps Recommendations 5, 6, and 8; all production-readiness verification requirements.
- Phase: 4
- Depends on: T1-T24 as applicable
- Blocks: release sign-off
- Priority: Medium
- Difficulty: Medium
- Agent: Level 3 Refactoring Agent
- Files: package scripts, test directories, CI/deploy configuration
- Implement: add CI/CD that installs from lockfiles, runs backend build/test, frontend lint/build, migration checks, vulnerability scan, and the converted `test_pipeline.js` smoke/integration test; gate Vercel/Render deployment on required checks.
- Accept when: CI/build/test/migration/smoke commands are documented and reproducible; `npm test` is no longer a placeholder; production deployment cannot pass with failing required checks.

### T26 - Implement TTN realtime and sampled history paths

- Source: Infrastructure Recommendation 5 and LoRaWAN readiness; Production Readiness Finding 21.
- Phase: 4
- Depends on: T1, T2, T4, T13, T14
- Blocks: TTN-backed production scope
- Priority: High
- Difficulty: Hard
- Agent: Level 2 LoRaWAN/TTN Agent, then Level 3 Refactoring Agent
- Implement the confirmed topology: secured TTN MQTT-to-frontend realtime delivery, plus server-side TTN history ingestion using the existing webhook or a Render worker MQTT subscriber; normalize decoded uplinks, authenticate, deduplicate, sample history at 60 seconds, retry safely, and expose source health.
- Accept when: TTN realtime and history paths are separately testable; missing webhook/MQTT credentials fail closed; duplicate/delayed/malformed uplinks are safe; source-to-vehicle assignment and sampled history are observable.

### T27 - ESP32 ingestion [DECISION GATE]

- Source: Infrastructure ESP32 readiness and Recommendation 6; Architecture multi-source readiness.
- Phase: 5
- Depends on: T2, T4, T13, T16
- Blocks: ESP32-backed production scope
- Priority: Medium unless ESP32 is selected as a production source
- Difficulty: Medium-Hard
- Agent: User Decision Required, then Level 2 ESP32/IoT Agent
- Decide protocol and provisioning model first. Then implement the smallest authenticated ESP32 adapter that emits the normalized observation contract.
- Accept when: protocol, transport, payload, provisioning, retry, and offline behavior are approved; integration tests cover auth and duplicate/out-of-order observations.

### T28 - Deferred product capabilities

- Source: Product Reports/Analytics/Announcements roadmap; Database feedback expansion; Security/DevOps admin roles/audit log; Database playback indexes.
- Phase: 5
- Depends on: T11, T14, T17, T20, T21, T25 and explicit product decisions
- Blocks: none
- Priority: Low-Medium
- Difficulty: Medium
- Agent: User Decision Required, then specialized Level 2 agent as needed
- Scope: high-fidelity playback, reports/analytics, announcements, admin roles, audit log, and expanded feedback/reporting.
- Accept when: each capability has an approved product definition, data-retention/security requirements, and a separate implementation task. Do not bundle these into production-blocker work.

## Dependency Map

```text
T2 -> T1 -> T3 -> T13 -> T19/T21/T26/T27
T4 depends on T1/T2/T3 -> T10/T12/T19/T20
T5 -> T6 -> T7/T8 -> T9/T21
T10 -> T22
T11 + T14 -> playback/reports
T17 -> admin production access
T8 + T9 + T13 + T15 -> T21
T9 + T13 -> T18/T22
T24 -> T25
```

Safe parallel work after prerequisites: T5 with T2/T3; T6 with T10 backend preparation; T8 with T10 UI/API work; T17 with T14; T22 with T23. Avoid parallel edits to `schema.prisma`, `tracking.service.ts`, and `ShuttleTracker.tsx` unless ownership is explicitly assigned.

## Research Queue

1. Request validation/DTOs and safe error contracts.
2. Authentication, JWT claims, httpOnly cookies, Socket.IO handshake auth.
3. Idempotency, transactions, unique/partial database constraints.
4. Device registry and source provisioning/rotation.
5. Realtime freshness, reconnect, stale/offline state, and canonical-source selection.
6. Redis rate limiting, abuse controls, and cache invalidation without `KEYS`.
7. Production Docker/build/runtime and Vercel/Render/Neon configuration.
8. Health/readiness endpoints and structured redacted logging.
9. Ordered many-to-many route-stop management.
10. GPS sampling, retention, partitioning, spatial/time-series indexes.
11. Map-plus-list operations dashboards and ETA confidence framing.
12. Mobile sender workflow and offline/retry behavior.
13. TTN/LoRaWAN webhook/history ingestion.
14. ESP32 protocol/provisioning.

## Risk Carry-Forward

- Sender spoofing: accepted until T1 passes; no real production vehicle data.
- Multi-source failover: accepted until T2/T13 pass; no claim of reliable TTN/ESP32/mobile arbitration.
- GPS history fidelity/cost: accepted until the T14 decision; document sampled-history limits.
- Driver operations: accepted only if an external authenticated sender is supplied and audited; otherwise T19 blocks production.
- TTN: topology is confirmed; implementation remains blocked only by T1/T2/T4/T13/T14 and provider credentials.
- ESP32: explicitly deferred until the protocol decision in T27.
- Reports, roles, audit log, announcements, and advanced playback: explicitly deferred under T28.

## Agent Routing

- Direct Level 3: T3, T4, T5, T7, T8, T9, T10, T11, T13, T15, T16, T18, T20, T21, T22, T23, T24, T25.
- Level 2 first: T1/T17 (Auth/Security), T2 (Device Registry), T6/T7 (Deployment), T12 (Security/Abuse), T13 (Realtime/Location), T14 (Database/Time-Series), T19 (Mobile/Product), T26 (LoRaWAN/TTN), T27 (ESP32/IoT).
- User decision required: T14 retention/archive scope, T27, T28.

## Production Go/No-Go Checklist

- [ ] T1-T12 complete, or every exception is explicitly accepted by the user.
- [ ] No unsafe production secret/admin defaults.
- [ ] Production build/runtime and target deployment configuration verified.
- [ ] Health/readiness checks pass against real DB/Redis configuration.
- [ ] Public/admin freshness and stale-state behavior verified.
- [ ] Route-stop changes invalidate public data and geometry.
- [ ] Admin can inspect minimum trip history.
- [ ] Rate limits and safe error responses verified.
- [ ] Real sender workflow is authenticated and tested, either via T19 or an approved external client.
- [ ] Follow-up audit/test evidence changes readiness from Not Ready to Ready.
