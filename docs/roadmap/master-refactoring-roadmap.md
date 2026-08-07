# Master Refactoring Roadmap

Audit metadata:
- Evidence baseline: `acada7f618ca74d32e7b5b76f3c75e69e4aa3354`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/README.md`, `docs/audits/lead-audit-summary.md`, every validated domain and production-readiness audit, `docs/decision-queue.md`, `docs/tasks/`, the current roadmap, and the repository evidence cited by the revalidated reports.
- Reviewed at: `2026-08-07T15:48:28+07:00`
- Validation state: **Validated**
- Predecessor baselines: Discovery through Database at their recorded `6697acbd62c740039722769588b1c464231e5ce1` plus T12 addenda committed at `4e0dfaa9faa1ca3e3b490d310ecf5dad54b913ba`; Infrastructure & Device, Dashboard & UX, Security/DevOps/Observability, and Production Readiness revalidated on 2026-08-07; D-001 through D-007, D-009, and D-010:A are approved at their stated scope; only D-008 remains pending.

Last reviewed: 2026-08-07

Validation state: **Validated**. T10 and T12 are complete for their exact bounded source/test
scopes. T12 applies D-009/D-010:A through a reviewed migration, persisted server RBAC/fresh-auth,
feedback lifecycle/retention/audit code, a public notice, and safe read-only operations UI. T9 remains
topology-blocked and T11 remains technical/external-Android-evidence blocked. M-20260807-01 resolves
SEC-01 at source/test level; M-20260807-02/03 repair simulator credential/output and generated-artifact
boundaries. These maintenance results do not establish deployment, credential rotation, provider,
device, or field evidence. The current Dashboard & UX audit supplies T14 technical evidence, but the
owner's exact screen/action priority and an exact-path task handoff remain required before implementation.

## 1. Executive Summary

This roadmap supersedes the earlier task list. It uses all completed re-audits and the approved decisions:

- D-001 = C: target a wider public rider release; B-level daily operations and accountable feedback
  triage are required before claiming that scope.
- D-002 = B: retain bounded raw diagnostics to compare mobile, LoRaWAN, and ESP32 senders for research.
- D-003 = A: define the deployment topology and origin contract first, then align REST and Socket configuration.
- D-004: compare separate Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and
  LoRaWAN/Gateway/TTN/Webhook sources in an authenticated Dev Dashboard.
- D-005 = B: keep the 30-second stale state separate from lifecycle, then auto-close an active Trip
  after a distinct 10-minute no-GPS grace period for Mobile, ESP32, and LoRaWAN. Close with
  `gps_timeout`, end at `lastAcceptedAt`, record detection separately, never reopen, and require a
  new Trip. `lastAcceptedAt` is the Backend receipt time of the latest accepted GPS observation;
  remaining audit/recovery controls remain open.
- D-006: use the isolated `t7-disposable` target and safer bounded research export controls; record
  the exact Redis image/digest and target execution evidence before and during stateful validation.
- D-007: adopt hierarchical `DEV` > `SUPER_ADMIN` > `ADMIN` tiers; `DEV` can perform every action,
  while exact provisioning, deletion, backup/restore, and audit controls still require definition.
- D-008: hosting will use university infrastructure, AWS, or a VPS and the domain follows working
  server deployment; exact provider/topology/TLS/operations ownership remains pending.
- D-009: `SUPER_ADMIN` owns anonymous, one-way business-day feedback triage; feedback/case data is
  retained for 180 days, IP only for 30 days of rate limiting, protected deletion/restore is bounded,
  and source/device visibility is read-only and safe-field-only.
- D-010:A: map every legacy `OPERATOR` to `ADMIN`, make `ADMIN` the ordinary-user default, retain
  `SUPER_ADMIN`/`DEV`, and reject unknown roles at every server authorization boundary.

The production determination remains No-Go. Selecting C increases the required completion bar; it
does not prove public readiness. T10/T12 are complete only for their exact source/test scopes; T9/T11
retain their independent blocks and runtime rollout still requires its own evidence. Do not add
playback, microservices, a second ingestion pipeline, or unbounded operations/research access early.

## 2. Input Coverage

| Input | Date | Status | Use |
|---|---:|---|---|
| Knowledge Base | 2026-08-01 | Complete / Validated | Discovery is current at `6697acb...` plus D-009/D-010 working decisions; external deployment/device facts remain unknown. |
| Product | 2026-08-01 | Complete / Validated | T10 is delivered; D-009/D-010:A now make the bounded T12 handoff eligible. |
| Architecture, Backend, and Database audits | 2026-08-01 | Complete / Validated | T10/T12 code evidence is current; runtime and external evidence limits remain recorded. |
| Infrastructure & Device and Security/DevOps/Observability audits | 2026-08-07 | Complete / Validated | M-20260807-01/02/03 source/test evidence is current; D-008, credential rotation, durable operations, and physical/deployment evidence remain gates. |
| Frontend audit | 2026-08-01 | Complete / Validated | T8/T10/T12 bounded surfaces are current; human browser acceptance remains unavailable. |
| Dashboard & UX audit | 2026-08-07 | Complete / Validated | Impeccable technical audit scores 9/20 (Poor), with no P0 and open truthful-state, accessibility, feedback-integrity, responsive, and maintainability findings for T14 scoping. |
| Production Readiness Audit | 2026-08-07 | Complete / Validated / No-Go | D-001=C remains No-Go due D-008, T11, T12 runtime, 9/20 UX, operations, credential, device/provider, and field evidence. |
| Decision Queue and owner/task evidence | 2026-08-07 | D-001–D-007, D-009, and D-010:A approved; D-008 pending | M-20260807-01/02/03 are complete maintenance units outside roadmap ordering; T9/T11/T14 remain gated. |

Level 1 has revalidated the maintenance-affected profiles. Hosting, TLS, production recovery, browser/runtime
behavior, physical devices, and TTN console state remain external unknowns.

## 3. Consolidated Recommendation List

| ID | Consolidated recommendation | Priority | Source audit sections | Disposition |
|---|---|---|---|---|
| T1 | Remove secret-hash/config URL exposure | High | Production 3.4; Security 4, 13; Backend 5 | Phase 1 |
| T2 | Shared validation, safe errors, and abuse controls | High | Production 3.4; Security 4, 6, 16; Backend 6 | Phase 1 |
| T3 | Align simulator fixtures and add repeatable pipeline evidence | High | Production 3.6; Infrastructure 4, 6–9, 12 | Phase 1 |
| T4 | CI gates and redacted operational signals | High | Production 3.8; Security 9–16; Infrastructure 5 | Phase 1 |
| T5 | Transactional/idempotent Operations/Trip owner | High | Production 3.3; Architecture 5; Backend 5, 7; Database 4, 13 | Phase 2 |
| T6 | Versioned canonical state, ordering, freshness, and route authority | High | Production 3.2; Architecture 5, 7; Backend 8–10; Frontend 4, 7 | Phase 2 |
| T7 | D-002 bounded raw diagnostics and research reads | High for approved research | Production 3.3, 3.6; Database 4, 8–9; Architecture 5, 9 | Phase 2 |
| T8 | Truthful maps: canonical state, stale/no-service UI, correct route, cache safety | High | Production 3.2, 3.7; Frontend 4, 7, 9; Dashboard 5, 10 | Phase 2 |
| T9 | Topology/origin contract, then deployment configuration alignment | High | Production 3.5; Infrastructure 4–5, 12; Security 7, 9–11; D-003 | Phase 2 |
| T10 | Route-stop operations and cache invalidation | Critical for daily operations | Production 3.1, 3.7; Product 7; Frontend 4, 13; Backend 9, 12 | Phase 3; complete for the exact handoff scope; affected audits revalidated |
| T11 | Supported sender operations, trip history, and exception view | Critical/High for daily operations | Production 3.1, 3.3; Product 7–9; Dashboard 7, 10 | Phase 3; policy/acceptance contract set, but external Android artifact and exact handoff pending |
| T12 | Feedback triage and device/source operations views | High for broad public support | Product 7, 11; Frontend 12; Dashboard 10; Database 12 | Phase 3; complete for the D-009/D-010:A exact handoff; runtime rollout remains unverified |
| T13 | Production deployment/recovery drill and monitoring | High before production | Production 3.5, 3.8, 7; Infrastructure 5, 12; Security 12–16 | Phase 4 |
| T14 | Dashboard/public-theme UX, map maintainability, accessibility, and measured scale improvements | Medium/High maintainability | Frontend 4, 13–14; Dashboard 5, 11–12; Architecture 5, 10 | Phase 4 |
| T15 | Physical senders, research dashboard, playback/reports, scale extensions | Deferred | Product 11; Architecture 9–10, 12; Infrastructure 7–9; D-002 | Phase 5 |

Every Critical/High finding remains represented. D-001=C opens T10–T12's release-scope gate, but
fresh audits and their independent policy/evidence gates are still mandatory.

### Revalidated task state

| Task | Current state | Gate or evidence |
|---|---|---|
| T1 | Complete for its exact scope | Secret-hash/config URL exposure controls validated. The later SEC-01 Socket.IO logging defect was resolved separately by M-20260807-01 with source/test guards; deployment-log inspection remains unavailable. |
| T2 | Complete | Shared validation, safe errors, and main boundary abuse controls validated; legacy admin writes remain outside scope. |
| T3 | Complete | Simulator fixtures and repeatable pipeline evidence validated; no physical-device claim. |
| T4 | Complete | CI checks and redacted process-local signals validated; no production alerting claim. |
| T5 | Complete | Transactional/idempotent Operations/Trip owner and migration evidence validated. |
| T6 | Complete | Re-audited canonical REST/Socket parity, version/route/freshness semantics, frontend guards, admin state surface, and public neutral presentation remain current; T8's focused and isolated browser evidence validates its local-expiry and route-switch boundary. |
| T7 | Complete for approved disposable scope | Additive implementation, migration, protected export/lifecycle checks, Redis failure/recovery, retention, backup/restore, canonical-boundary, and query-plan evidence passed on 2026-07-29 using the exact D-006 target. Do not promote research capability to production/public operation without the still-missing external operational evidence. |
| T8 | Complete for approved truthful public-state scope | Local expiry updates Marker/live-count/ETA together and non-live updates remove only the vehicle Marker. Native and isolated Playwright tests cover local expiry, route switching, and a newer canonical `live` restore; D-001=C opens T10's separately scoped route-mutation/cache work after re-audit. |
| T9 | Blocked | D-008 confirms candidate hosting families and domain sequencing; exact host/topology/TLS/data placement and operations owners are missing. |
| T10 | Complete | The exact-path handoff delivered authenticated route-stop management, transactional replacement, and public-cache invalidation with deterministic backend and repository-CI evidence. No ambient browser/database smoke ran; this re-audit carries its changed evidence. |
| T11 | Blocked — technical/external evidence | The policy and v2 acceptance contract are current, but the external Android report/artifact and an exact lifecycle/schema handoff remain. No repository test can prove Android runtime coverage. |
| T12 | Complete — exact handoff | Reviewed migration, persisted role/fresh-auth enforcement, feedback lifecycle/audit/retention source, public notice, inbox, safe health UI, deterministic tests, and CI pass. No runtime target was operated. |
| T13 | Pending | Requires T4/T5 plus T6 and T9, then deployment/recovery/alert evidence. |
| T14 | Pending owner priority/exact task handoff | The 2026-08-07 Dashboard & UX technical re-audit is current (9/20, Poor). The owner must still select the exact screens/actions and acceptance priority before an exact-path Level 3 handoff. |
| T15 | Deferred | T7 is complete for disposable scope; physical sender/provider/protocol facts and T13 remain open. |

## 4. Dependency Map

| Task | Depends on | Blocks |
|---|---|---|
| T1 | None | T3, T4, safe device administration |
| T2 | T1 conventions | T3, T5, T6, T10 |
| T3 | T1, T2 | T7 and device-pipeline claims |
| T4 | T1 | T13 and reliable release evidence |
| T5 | T2 and current partial unique index | T6, T11, T13 |
| T6 | T2, T5 lifecycle vocabulary | T7, T8, T11, T15 |
| T7 | T3, T6, D-006 policy, and exact disposable-target evidence | Research comparison |
| T8 | T6; T10 for final route invalidation | Truthful tracking claims |
| T9 | D-003=A and topology facts | T13/public deployment |
| T10 | T2, T8, D-001=B/C | Operator-managed routes |
| T11 | T5, T6, D-001=B/C | Daily service accountability |
| T12 | D-001=C, T6 | Public support/device operations |
| T13 | T4, T5, T6, T9 | Production readiness reassessment |
| T14 | T8 plus the current Dashboard & UX audit; exact owner-approved handoff is a decision gate | None |
| T15 | T7 and physical provider/device facts | None |

Cycle check: the previous topology/frontend configuration cycle is resolved by D-003=A. T9 defines topology and origins before configuration alignment. No technical cycle remains.

Safe parallel work: T1 and the planning portion of T4. After Phase 1, T5 and the planning portion of T9 may run in parallel. Do not modify raw telemetry, canonical selection, and map consumers concurrently without accepting the T6 contract first.

### 4.1 Task Contract

Every task must expose Source Audits, Phase, Depends On, Blocks, Decision Gates, Priority,
Difficulty, Suggested Agent, Execution Mode, Task Brief, Related Files, Acceptance Criteria and
Verification, Status, and Evidence. `Related Files` are planning candidates only. Before worker
execution, resolve them to exact repository-relative files in
`docs/tasks/<task-id>-<topic>.md`; that task spec is the authoritative write allowlist.

## 5. Phase 1 — Controlled MVP Safety and Production Blockers

**Original entry criteria (satisfied before D-001=C):** all audits complete and current; the former
D-001=A, D-002=B, D-003=A, and D-006 approved; no daily/public claim.

**Exit criteria:** no secret/config leakage; validated and bounded writes; fixture-aligned pipeline smoke evidence; repeatable CI/local gates and redacted operational signals. This makes the pilot safer but does not change the production No-Go.

### T1 — Remove sensitive response and logging exposure

### Source Audit(s)

Production Readiness 3.4; Security 4, 13, 16; Backend 5.

### Phase

1.

### Depends On

None.

### Decision Gates

None.

### Blocks

T3, T4, safe device operations.

### Priority

High.

### Difficulty

Easy.

### Suggested Agent

Level 3 Refactoring Agent (direct).

### Execution Mode

Antigravity Implementation Ready.

### Task Brief

Create safe device response DTOs for list/get/create/update, never return secretHash, and replace Redis connection URL logs with redacted/static events. Preserve sender credential rotation without returning credential material. Allowed scope is device response/test and Redis logging paths only.

### Related Files

Device controller/routes/types, Redis configuration, backend route tests.

### Acceptance Criteria and Verification

No secretHash appears in device responses and no credential-bearing URL appears in logs. Device CRUD/rotation remains functional. Add absence tests; run backend test/build and a repository search for unsafe output.

### Status

Complete.

### Evidence

`shuttle-tracking-backend`: `npm run build`, `npm test`, `node test_devices_boundary.js`, `node test_redis_logging.js`, and unsafe-output search passed on 2026-07-20.

Roadmap re-audit note (2026-08-07): SEC-01 was outside T1's exact device/Redis logging scope and was
resolved by bounded maintenance M-20260807-01. The invalid Socket.IO branch now retains a stable safe
response and allowlisted rejection signal without writing `rawData`; focused and repository-level
guards passed. No deployed-log inspection was performed, and this does not broaden T1's scope.

### T2 — Add validated, bounded public and sender write boundaries

### Source Audit(s)

Production Readiness 3.4; Security 4, 6, 16; Backend 6, 13.

### Phase

1.

### Depends On

T1 response/error conventions.

### Decision Gates

None; security/abuse details must remain within the approved controlled-MVP scope.

### Blocks

T3, T5, T6, T10, public release.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

Level 2 Security/Abuse specialist, then Level 3 Refactoring Agent.

### Execution Mode

Codex + Specialist.

### Task Brief

Add shared schemas and safe error mapping for login, feedback, device, route-stop, trip, and observation writes. Add configurable request-size/rate limits, separating public/auth limits from authenticated source quotas. Keep sender acknowledgements and avoid logging secrets.

### Related Files

Server middleware, auth/public/ingest/trip/device/route-stop controllers, tracking service, tests.

### Acceptance Criteria and Verification

Malformed writes receive stable 4xx/429 responses and never reach Prisma/broadcast; source-aware limits work; authenticated sender behavior remains valid. Run backend tests and configured integration smoke tests.

### Status

Complete.

### Evidence

`shuttle-tracking-backend`: `npm test`, `node test_devices_boundary.js`, `node test_redis_logging.js`, `npx prisma validate`, `node test_pipeline.js`, `node test_socket_boundary.js`, and `git diff --check` passed on 2026-07-20. Docker Compose `db` and `redis` were healthy; the smoke used the built `dist/server.js` because the local `npm run dev` command references `tsx`, which is not installed in the backend package.

### T3 — Align device fixtures and document pipeline smoke tests

### Source Audit(s)

Production Readiness 3.6; Infrastructure & Device 4, 6–9, 12.

### Phase

1.

### Depends On

T1, T2.

### Decision Gates

None.

### Dependency Note

T1 completed on 2026-07-20, and T2 completed with configured Postgres/Redis integration and Socket.IO smoke evidence on 2026-07-20.

### Blocks

T7 and all device-pipeline validation claims.

### Priority

High.

### Difficulty

Easy.

### Suggested Agent

Level 3 Refactoring Agent (direct).

### Execution Mode

Antigravity Implementation Ready.

### Task Brief

Make simulator source/vehicle IDs and credentials environment-driven and consistent with development seed fixtures. Document mobile and TTN smoke commands that exercise authentication, ingestion, canonical selection, and safe acknowledgement. Do not add MQTT or another pipeline.

### Related Files

Frontend simulator scripts, backend TTN simulator/pipeline test, seed data, environment examples, test documentation.

### Acceptance Criteria and Verification

Checked-in defaults match seed fixtures; documented mobile and TTN smoke commands pass on a disposable configured stack; failures reveal no secrets. Run Compose configuration validation and the smoke commands.

### Status

Complete.

### Evidence

Aligned environment-driven mobile/TTN simulators and pipeline fixtures; `docker compose --env-file env.example config --quiet` (development and production), backend build/tests, one-shot mobile Socket.IO smoke, one-shot TTN `sensor-c4`/`sensor-f2` smoke, full `test_pipeline.js`, and `git diff --check` passed on 2026-07-21. Smoke documentation: `docs/testing/pipeline-smoke-tests.md`.

### T4 — Automate current checks and emit minimum redacted signals

### Source Audit(s)

Production Readiness 3.8; Security 9–16; Infrastructure 5, 12; Backend 11.

### Phase

1.

### Depends On

T1 and existing commands.

### Decision Gates

None; external monitoring providers remain out of scope.

### Dependency Note

T1 completed on 2026-07-20; CI and operational-signal work can use the established no-secret output checks.

### Blocks

T13 and credible release evidence.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

Level 2 Observability/DevOps specialist, then Level 3 Refactoring Agent.

### Execution Mode

Codex + Specialist.

### Task Brief

Automate backend test, frontend lint/build, Prisma validation, and Compose configuration validation. Add redacted structured events for startup/readiness, accepted/rejected ingestion, source staleness, and history persistence failure. Do not select a monitoring vendor until T9.

### Related Files

Package scripts, CI workflow, server/tracking logging paths, Compose, documentation.

### Acceptance Criteria and Verification

CI runs all listed checks and blocks failures; logs/metrics contain no secrets and distinguish operational outcomes. Run every local equivalent and inspect sample output.

### Status

Complete.

### Evidence

`bash scripts/ci-checks.sh` passed on 2026-07-21: backend build/boundary-redaction tests, Prisma validation, frontend lint/build, development/production Compose config, and unsafe dynamic-logging check. Signal contract/sample: `docs/testing/ci-checks.md` and `test_operational_signals.js`.

## 6. Phase 2 — Structural Foundations and Approved Research

**Entry criteria:** Phase 1 exit criteria pass and the required audit profiles are validated.

**Original exit criteria:** one lifecycle owner and one versioned canonical contract exist; maps
consume canonical truth; D-002 research diagnostics has a bounded policy; D-003 topology/origin
contract is written. Daily/public workflows were deferred by the then-current D-001=A and are now
required by D-001=C through T10–T12.

### T5 — Create one transactional, idempotent Operations/Trip boundary

### Source Audit(s)

Production Readiness 3.3; Architecture 5, 8; Backend 5, 7, 11, 13; Database 4, 10, 13.

### Phase

2.

### Depends On

T2 and the existing partial active-trip index.

### Decision Gates

Duplicate start/end and virtual-trip policy recorded in this task brief.

### Blocks

T6, T11, T13.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

Level 2 Database/transaction specialist, then Level 3 Refactoring Agent.

### Execution Mode

Codex + Specialist.

### Task Brief

Move start/end/virtual-trip policy into one Operations/Trip service. Preserve the partial unique active-trip index, make trip/vehicle/history changes atomic, define duplicate start/end behavior, then add status/time integrity checks. The controlled-MVP policy keeps virtual trips: the first routed observation creates one active trip when none exists; explicit duplicate start returns that active trip, and duplicate end returns the completed trip without mutating a newer active trip.

### Related Files

Trip controller/routes, tracking service, Prisma schema/migrations, lifecycle integration tests.

### Acceptance Criteria and Verification

Duplicate start/end behavior is documented and deterministic; foreign/non-active writes fail safely; vehicle and active-trip state remain consistent under retry/race tests. Run Prisma validation, backend tests, and disposable Postgres/Redis integration tests.

### Status

Complete.

### Current Evidence

`operations.service.ts` now owns explicit start, virtual-trip creation, active-trip validation, end, and sampled-history writes. Vehicle row locks serialize all lifecycle writers; duplicate start/end are deterministic and trip/vehicle/history database changes use transactions. The T5 migration adds trip status/time checks while preserving the existing partial unique index. `npx prisma migrate deploy`, `npm run check`, `npm run test:operations`, `git diff --check`, and the temporary-fixture cleanup verification passed on 2026-07-22. The current Backend, Architecture, Database, and Production Readiness audits revalidated this evidence; remaining gaps are protected history reads, richer ordering/raw evidence, and production operations.

### T6 — Publish a versioned, route-aware canonical vehicle-state contract

### Source Audit(s)

Production Readiness 3.2; Architecture 5, 7, 11; Backend 8–10; Frontend 4, 7, 9; Dashboard 5, 10.

### Phase

2.

### Depends On

T2 and T5 lifecycle vocabulary.

### Decision Gates

None beyond validated T5 behavior; cross-domain specialist decisions must be recorded before implementation.

### Blocks

T7, T8, T11, T15.

### Priority

High.

### Difficulty

Hard.

### Suggested Agent

Level 2 Realtime/telemetry specialist, then Level 3 Refactoring Agent.

### Execution Mode

Codex + Specialist.

### Task Brief

Implement one backend-owned event/read contract containing authoritative vehicle route, source, event/receive times, monotonic version, freshness/no-service state, and selection reason. Define duplicate/late/out-of-order disposition; broadcast only canonical state and retain the monolith/one ingestion path.

### Related Files

Tracking service, Socket.IO events, public reads/types, simulator payload types, frontend realtime types.

### Acceptance Criteria and Verification

Late data cannot move a marker backward; all-stale emits explicit state; UI can ignore lower versions and never infer route from selected UI route. Test priority, stale fallback, duplicate, late, and reconnect cases.

### Status

Complete — implementation, consolidated test checks, font fallback, admin service-state summary,
disposable runtime verification, and owner-confirmed browser verification passed on 2026-07-24.
Contract-level and disposable-runtime REST/Socket parity passed: epoch/version/route/location
semantics matched and public `sourceId` was omitted from both projections; only dynamic
`freshness.ageMs` differed by read time. Disposable REST checks also passed for `unknown`,
`no_service`, `stale`, and live recovery. Frontend guards for unknown-state rendering, initial
hydration, and non-live ETA suppression pass. Public presentation now intentionally exposes only
the live vehicle count in `Active Trams`; connection, stale, no-service, and unknown-state panels
remain hidden from the public surface while the underlying marker/ETA guards stay active. The owner
confirmed that the latest public UI shows the live-only `Active Trams` count, hides the requested
status panels, preserves live ETA, and suppresses ETA for non-live state. The full CI run passes in
an escalated build runner, while the restricted runner still blocks the default Turbopack build on
port binding.

### Evidence

The exact-path task spec is `docs/tasks/T6-canonical-vehicle-state.md` and the immutable Level 2
brief is `docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md`. Changed paths are
the canonical backend publisher/read/route-authority services and boundaries, the consolidated
`shuttle-tracking-backend/tests/` boundary suite, checked-in pipeline assertions, shared frontend
canonical types/API, public `ShuttleTracker`, admin `LiveMap`, and system font fallback stacks in
the root layout/styles. `shuttle-tracking-backend`: `npm run check`, `npm run test:t6`,
`npx prisma validate`, and `git diff --check` passed on 2026-07-23. `shuttle-tracking-web`:
`npx tsc --noEmit`, `npm run lint`, and `npx next build --webpack` passed with existing lint
warnings. Compose config validation and `node scripts/validate-agent-workflow.js` passed. The
required `bash scripts/ci-checks.sh` passed all checks in the escalated runner on 2026-07-24; the
restricted runner still fails at the default Turbopack build because it disallows the internal
port binding. The Google Fonts fetch failure is resolved by removing the build-time remote font
dependency. On the explicitly isolated
`t6-disposable` target, migrations and development seed completed, `tests/test_socket_boundary.js`,
`tests/test_pipeline.js`, and `npm run test:operations` passed, and the project containers and
volumes were removed afterward. The ambient `shuttle-*` stack was left untouched. The manual
verification report for the isolated target recorded PASS for initial `no_service` with
`SOURCE_NEVER_SEEN`, live recovery with fresh freshness, the `ALL_SOURCES_STALE` transition,
backend stop/start recovery, and route-authority filtering behavior. The route item was supported
by source/logic inspection rather than a direct browser interaction. The T6 realtime boundary now
also asserts public projection parity and the frontend source-level state/ETA guards. A disposable
runtime on isolated ports `13000/13001/15432/16379` confirmed initial `no_service`, injected
`unknown` with `DEPENDENCY_UNAVAILABLE`, `ALL_SOURCES_STALE` with last-known-only state, live
recovery, and structural REST/Socket parity with matching state version/epoch and omitted public
source identity. The public `ShuttleTracker` source contract now asserts the live-only `Active Trams`
count and absence of public connection/source-health labels. Owner-confirmed direct browser
verification on 2026-07-24 passed for the latest public rendering and live versus non-live ETA
behavior. T6 frontend lint retained seven non-blocking warnings.

The T8 re-audits at `4d5a456...` confirmed that local public freshness expiry updates Marker,
live-only Active Trams count, and ETA together, then identified a route-switch path that could re-add
a stored stale/expired Marker. The corrective slice now gates route-switch Marker addition on the
latest accepted canonical `live` state, its authoritative route, and the local-expiry flag. Native
and isolated Playwright evidence now validate that accepted scope; this does not invalidate T6 or
authorize T10's separately deferred route-mutation/cache work.

### T7 — Implement D-002=B bounded raw diagnostics for research

### Source Audit(s)

Production Readiness 3.3, 3.6; Database 4, 8–9; Architecture 5, 9; Infrastructure 9; Security 8–9; D-002=B; D-006.

### Phase

2.

### Depends On

T3, T6, and documented retention/deletion parameters.

### Decision Gates

D-002=B and D-006 are approved. Raw retention is 90 days from backend receive time; aggregate
deletion, protected `DEV`/`SUPER_ADMIN` access, safer bounded default exports, break-glass full
exports, manifests, and temporary-artifact cleanup are documented. The exact Redis image/digest,
credentials/data scope, expected mutations, cleanup, rollback, approval, and disposable stateful
evidence are recorded in the T7 task spec; affected-audit revalidation remains required before
promotion.

### Dependency Note

T3 completed on 2026-07-21; seed-aligned mobile/ESP32/LoRaWAN fixture IDs and repeatable mobile/TTN pipeline smoke commands are documented. No schema or migration change was introduced.

### Blocks

Research dashboard and any source-comparison/playback claim.

### Priority

High for approved research scope.

### Difficulty

Hard.

### Suggested Agent

Level 2 Database/time-series and telemetry specialist, then Level 3 Refactoring Agent.

### Execution Mode

Codex + Specialist.

### Task Brief

Add append-only bounded raw observations separate from canonical current state. Retain
source/vehicle/trip/experiment identity, event/receive times, sequence/transport facts, reported
accuracy, validation outcome, canonical-selection disposition, and allowlisted transport metadata
to compare Mobile, ESP32, and LoRaWAN behavior under D-004 metric definitions.

### Related Files

Prisma schema/migrations, tracking service, protected research reads, retention job, fixtures.

### Acceptance Criteria and Verification

Raw observations do not alter canonical state merely because they are retained; research reads
compute latency, cadence/jitter, availability, acceptance/rejection/duplicate/late rate, route
conformance, pairwise/reference error where valid, selection and fallback; retention and indexes are
tested; secrets are absent from data/response paths.

### Status

Complete for approved disposable scope — implementation, migration, runtime, and stateful validation
passed on 2026-07-29 against the recorded `t7-disposable` target. The re-audit has validated the
changed evidence; do not use the ambient `shuttle-*` stack or promote the research capability to
production/public operation.

### Evidence

The current T6/T7 contract and Level 1 freshness baseline are recorded at
`d94abb3a4d80c2174d87df4d006dfbe7c814a6bc`. D-006, the pinned official Redis image/index digest,
and the target execution record are attached in `docs/tasks/T7-raw-research-observations.md`.
Safe T7 implementation, build, contract tests, Prisma validation, repository CI, and diff checks
passed on 2026-07-29. The approved disposable migration, runtime smoke, backup/restore,
retention/deletion, Redis failure/recovery, export, canonical-boundary, and query-plan checks also
passed using synthetic/redacted data. Level 1 has validated affected audit rows; production/public
promotion is not implied.

### T8 — Make maps truthful and repair route/cache behavior

### Source Audit(s)

Production Readiness 3.2, 3.7; Frontend 4, 7, 9, 13; Dashboard 5, 10–11; Backend 9, 12.

### Phase

2.

### Depends On

T6; T10 for final route mutation invalidation.

### Decision Gates

None for the completed truthful-state UI. D-001=C now satisfies the product-scope gate for the
T10-dependent route-management portion; T10's own re-audit and handoff gates remain.

### Blocks

Truthful public/admin tracking and T14.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

Level 3 Refactoring Agent (direct).

### Execution Mode

Level 3 Refactoring Agent after the current audit handoff and exact task-spec verification.

### Task Brief

Use canonical route/state instead of UI-selected route. Keep detailed connection, last-update, and
fresh/stale/no-service/unknown meaning on the admin/operations surface; keep the public surface
neutral with the live-only Active Trams count while preserving truthful marker and ETA behavior.
Ensure local freshness expiry updates marker visibility, live count, and ETA together.
Repair local geometry cache keys to include ordered stop data or backend revision; discard corrupt
cache safely.

### Related Files

Public tracker/cards, admin LiveMap/dashboard, realtime/public API types, route cache helpers.

### Acceptance Criteria and Verification

An R02 event remains R02 even while R01 is selected; admin state meaning remains visible and public
marker behavior stays truthful without exposing operational labels; local expiry changes marker/count/
ETA consistently; stale or locally expired Markers are not restored by route selection and return only
after a newer canonical `live` event; ETA is not current when stale; cache updates after route
revision. Run lint, production build, focused state-transition checks, and browser/socket interruption
checks.

### Status

Complete for the approved truthful public-state scope — the corrective `handleRouteChange` guard adds a vehicle Marker only for the
latest accepted canonical `live` state whose authoritative route matches the selected route and which
has not locally expired. It removes only the vehicle Marker for stale/no-service/unknown, locally
expired, missing, or unknown-route state, preserving route and stop layers. The existing epoch/version
guard remains the only path by which a newer canonical `live` event can restore the Marker. Frontend,
Dashboard & UX, and Production Readiness have been re-audited and validated with the native and
isolated Playwright evidence. The route-mutation portion remains blocked on T10 and is excluded from
this handoff.

### Evidence

The 2026-07-29 corrective implementation updates `useShuttleTracker.ts` so `handleRouteChange`
consults the latest accepted canonical state before adding a stored Marker. It requires `live`, known
authoritative route equality, and no local-expiry flag; otherwise it removes only that vehicle Marker.
The existing local-expiry Marker/live-count/ETA transition, non-live Marker removal, epoch/version
rejection, route layers, and stop layers are unchanged. Frontend lint/build and repository CI passed;
lint retains the pre-existing warnings in `app/layout.tsx` and `utils/IconHelpers.ts`, and build emits
Node's `DEP0205` deprecation warning. Browser/socket interruption and focused timer/route-switch
evidence were unavailable. The focused deterministic test and isolated Playwright public-page test
added on 2026-08-01 now cover the projection, local expiry, route switch, and newer-live restore using
only synthetic localhost state; the affected audits are validated for this approved scope.

### T9 — Define topology/origin contract, then align configuration

### Source Audit(s)

Production Readiness 3.5; Infrastructure 4–5, 10–12; Security 7, 9–11; Frontend evidence; D-003=A.

### Phase

2.

### Depends On

D-003=A plus hosting/domain/TLS facts.

### Decision Gates

D-008 records university infrastructure/AWS/VPS as the candidate hosting set and domain creation
after a working server deployment. The exact provider/region/network boundary, frontend/backend and
database/Redis placement, TLS terminator/certificate owner, secret source, log/alert destination,
backup/restore owner, migration/rollback owner, and incident owner still require confirmation.

### Blocks

T13 and public deployment.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

User Decision Required for topology facts, then Level 2 Deployment specialist.

### Execution Mode

Codex Only until facts exist; Codex + Specialist afterward.

### Task Brief

Write one topology/origin record covering host/provider, public origins, TLS terminator, database/Redis placement, secret source, backup/restore owner, Redis policy, migration/rollback owner, and log destination. Then align REST and Socket.IO to this one contract and verify in staging.

### Related Files

Production Compose/Dockerfiles, environment templates, frontend configuration, backend CORS/Socket settings, deployment runbook.

### Acceptance Criteria and Verification

No configuration cycle remains; REST and Socket.IO resolve the documented backend origin; TLS, secret, backup/restore, migration/rollback, and log ownership are assigned. Run staging/production Compose readiness and origin smoke tests.

### Status

Blocked — hosting direction and domain sequencing are recorded, but exact provider/topology, TLS,
data placement, and operations-owner facts are missing. D-003 resolves sequencing and D-008 narrows
the candidates; neither completes the deployment contract.

### Evidence

D-003 resolves ordering. D-008 records separate hosting with university infrastructure, AWS, or a
VPS and domain binding after server deployment; the remaining exact facts are still unconfirmed.

## 7. Phase 3 — Feature Completion

**Entry criteria:** the selected task's direct dependencies and decision gates are accepted, D-001=C
is recorded, affected audits are fresh, and the D-007 role/action matrix is explicit where the
selected task changes authorization. T9 remains a deployment-specific Phase 2 blocker for T13/public
deployment; it is not an implicit dependency of T10–T12 unless their own task gate says so.

**Exit criteria:** operators can manage route stops, perform supported sender/trip workflows, inspect history, and see exceptions. Under C, public feedback has accountable triage.

### T10 — Add route-stop management and invalidation

### Source Audit(s)

Production Readiness 3.1, 3.7; Product 7; Frontend 4, 13; Backend 9, 12; Dashboard 7.

### Phase

3.

### Depends On

T2, T8, D-001=C.

### Decision Gates

D-001=C is approved. Fresh Product/Architecture/Backend/Frontend/Database/Dashboard/Security evidence
and an exact-path task handoff remain required before implementation.

### Blocks

Operator-managed routes.

### Priority

Critical.

### Difficulty

Medium.

### Suggested Agent

Level 3 Refactoring Agent (direct).

### Execution Mode

Antigravity Implementation Ready only after the affected re-audits and exact-path task handoff.

### Task Brief

Add authenticated route-detail add/remove/reorder operations, validate membership/order, invalidate backend/public caches, and refresh geometry/versioned route data.

### Related Files

Admin route/sidebar UI, route-stop controller/cache service, public route cache/types, tests.

### Acceptance Criteria and Verification

Admins can publish ordered stops without manual/API work; invalid ordering fails; next public read uses revised geometry. Run backend cache tests, frontend lint/build, and browser route-change smoke test.

### Status

Complete for the exact handoff scope — T2, T8, and D-001=C were complete when the approved
exact-path task was started. The implementation adds authenticated route-stop management, validated
transactional replacement, and public-cache invalidation without a schema migration or runtime target.
Its changed backend and admin/public-route evidence downgraded the affected audit-register rows at
implementation completion; those rows were later revalidated. This does not unblock T11 or T12.

### Evidence

The exact-path handoff is `docs/tasks/T10-route-stop-management-and-invalidation.md`. It adds a
bounded `PUT /api/admin/route-stops/:routeId` path that verifies active stop membership, replaces the
ordered rows in one transaction, and invalidates public cache after success; legacy create/delete now
use the same invalidator. The authenticated Routes page opens a management modal for loading, adding,
removing, and reordering active stops. `npm --prefix shuttle-tracking-backend run check`, frontend
lint/build, and `bash scripts/ci-checks.sh` passed on 2026-08-01; the two frontend lint warnings are
pre-existing. No ambient browser/database smoke was authorized or run.

### T11 — Add sender operations, trip history, and exceptions

### Source Audit(s)

Production Readiness 3.1, 3.3; Product 7–9; Backend 7, 12; Dashboard 7, 10.

### Phase

3.

### Depends On

T5, T6, D-001=C.

### Decision Gates

D-001=C is approved. `ADMIN` or higher provisions device Sender identities/credentials in the Admin
UI. A separately built Android Native GPS Sender Application, installed internally at the
university, performs the driver start/send/reconnect/end runtime against the Backend. One phone may
switch among multiple vehicles, but the driver must end the active Trip before changing profile or
vehicle. Routine vehicle changes must not require Admin contact or driver entry of `SOURCE_ID`; the
owner selects scanning the chosen vehicle's non-secret QR. A printed code or NFC selector remains an
optional later fallback rather than approved T11 scope. Mobile drivers start their own Trips, while
Admin controls Trip start for LoRaWAN/IoT sources. Offline GPS
observations are discarded, and an active Trip continues sending through a location foreground/
background path while the screen is locked. No application role may create or remove `DEV`;
owner/authorized creator-team provisioning is out of band.

D-005=B selects a distinct 10-minute no-GPS auto-close grace period for Mobile, ESP32, and LoRaWAN.
The confirmed transition sets `closeReason=gps_timeout`, `endTime=lastAcceptedAt`, and `closedAt` to
detection time; later GPS never reopens the Trip, and operation resumes only through a new Trip.
`lastAcceptedAt` is Backend receipt time of the latest GPS observation accepted for the active Trip,
not device time or sampled `GPSTrack` persistence.

The selected Mobile identity is a shared university phone enrolled once. Routine vehicle changes use
an authenticated installation session plus a static non-secret vehicle QR; one vehicle may have at
most one active Mobile claim. The Backend also enforces one active vehicle claim per installation to
match the pre-switch Trip-end rule. `ADMIN` or higher may disable/revoke and re-enroll a lost or
replaced shared phone. When it cannot end an active Trip normally, `ADMIN` or higher may atomically
emergency-force-close it with `closeReason=admin_force_close`, Backend execution-time
`endTime`/`closedAt`, preserved `lastAcceptedAt`, explicit reason/actor audit, old-token invalidation,
and claim release. This is lifecycle recovery, not deletion.

The v2 acceptance contract permits broad-device intent without a universal compatibility claim: it
requires a versioned external Android report with the actual device/OS/build/signing and test results.
It retains the 15-minute access JWT with revocable refresh credentials and makes `gps_timeout` visible
only in the authenticated Admin exception/log surface. Notification/restart/late-packet/concurrent
timeout handling and exact schema/API placement remain implementation constraints. The binding Level 2
briefs are `docs/audits/specialized/T11-identity-mobile-sender-enrollment.md` and
`docs/audits/specialized/T11-identity-mobile-sender-enrollment-v2.md`.

### Blocks

Daily service accountability.

### Priority

Critical for daily operations.

### Difficulty

Hard.

### Suggested Agent

Level 2 Operations/mobile specialist, then Level 3 Refactoring Agent.

### Execution Mode

Codex + Specialist.

### Task Brief

Build Admin-side Sender identity/credential provisioning and one-time shared-phone enrollment for
`ADMIN` and higher without granting user-role creation. Add an authenticated installation session
and exclusive, short-lived
vehicle-claim contract: the vehicle QR contains only a versioned non-secret selector, the Backend
binds a server-generated internal source/installation identity to the vehicle/claim/Trip, and no
routine switch requires typing `SOURCE_ID` or exposing a reusable Sender secret. Deliver a versioned
interface specification to the separate Android Native Mobile team for its driver start/send/
reconnect/end workflow against the
existing authenticated Socket.IO boundary. Continue to provision ESP32/Wi-Fi/HTTP and LoRaWAN/TTN/
webhook identities through their respective Backend contracts rather than pretending they run the
Mobile UI. Discard offline location observations and send a newly sampled point after reconnect;
keep start/end control operations idempotent. Add the D-005=B 10-minute auto-close lifecycle with
the approved close fields/no-reopen rule, protected trip history list/detail, and a compact
exception view for stale/silent vehicles, no active trip, auto-closed Trip, and source freshness.
Do not add playback.

Add Admin Mobile installation disable/revoke/re-enrollment and one atomic emergency operation that
force-closes the active Mobile Trip, releases the claim, invalidates the old credential/claim
version, and records the actor/reason without deleting evidence. Keep this separate from normal
Trip end and `gps_timeout`.

### Related Files

Trip/history APIs, Admin Sender/shared-phone installation provisioning, vehicle QR/claim contracts,
canonical-state reads, Android external-team interface/evidence, and
`docs/audits/specialized/T11-identity-mobile-sender-enrollment.md`.

### Acceptance Criteria and Verification

An `ADMIN` can create a Sender and enroll a shared phone once without developer tooling or elevating
an administrative user. An enrolled phone can scan a non-secret vehicle QR and receive an
exclusive, short-lived Backend claim without entering `SOURCE_ID` or a reusable Sender secret. One
phone can switch authorized vehicles only after its active Trip has ended, without cross-vehicle
writes or two active publishing claims. A Mobile driver can start, send current GPS while locked,
discard offline points, reconnect with a newly
sampled point, and end a Trip; Admin can start the approved LoRaWAN/IoT Trip workflow. A 30-second
stale transition does not close the Trip, while the approved 10-minute trigger closes every source
type exactly once with `gps_timeout`, `endTime=lastAcceptedAt`, detection-time `closedAt`, and no
reopen; `lastAcceptedAt` advances only from Backend receipt of an accepted GPS observation, and
later data requires a new Trip. Admins can find active/completed/auto-closed Trips;
exceptions use canonical state. Run role/authorization, QR-copy/claim race/takeover, credential
enrollment/lifecycle, external Android locked-screen/interruption/recovery, auto-close clock/restart/
race tests, Trip lifecycle, frontend, and operator acceptance checks.

An `ADMIN` can disable/revoke and re-enroll a lost/replaced phone. Emergency recovery closes once
with `admin_force_close`, Backend execution-time `endTime`/`closedAt`, preserved `lastAcceptedAt`,
actor/reason audit, released claim, and invalid old credentials; it never deletes Trip or telemetry
evidence. Concurrent old-phone GPS, normal end, timeout, and repeated Admin requests produce one
terminal state.

### Status

Blocked — the shared-phone, QR, claim, offline, locked-screen, receipt-time timeout, and recovery
policy is confirmed; affected audits are fresh. T11 still needs an additive lifecycle/schema/API
handoff and the v2 versioned external Android acceptance artifact. The owner-reported locked-screen
test is not substituted for an artifact containing actual device/OS/build coverage and the required
failure/recovery cases.

### Evidence

T5 lifecycle boundary is complete; remaining dependencies are unresolved.

### T12 — Add feedback triage and source/device operations views

### Source Audit(s)

Product 7, 11; Frontend 12; Dashboard 10; Database 12; Production 3.1.

### Phase

3.

### Depends On

D-001=C, T6, feedback owner/privacy policy.

### Decision Gates

D-001=C and D-009 are approved. `SUPER_ADMIN` owns anonymous, one-way business-day feedback triage;
the case lifecycle is `new → acknowledged → investigating → resolved`, with `duplicate`/`rejected`
terminal. Feedback/case data retains for 180 days and raw IP only for rate limiting for 30 days.
`SUPER_ADMIN`/`DEV` deletion requires recent re-authentication, reason, immutable audit, and a 30-day
restore window. `ADMIN`/`SUPER_ADMIN`/`DEV` receive only the approved read-only safe source fields.
D-010:A maps the legacy `OPERATOR` transition to `ADMIN`; implementation must enforce the persisted
allowlist and recent re-authentication rather than trusting a token role claim.

### Blocks

Accountable public support/device operations.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

Level 3 Refactoring Agent (direct).

### Execution Mode

Level 3 direct implementation under the exact-path T12 handoff.

### Task Brief

Add feedback case status/owner/resolution and an admin inbox only after ownership/retention are agreed. Add safe device/source health views using canonical freshness and never exposing credentials.

### Related Files

Feedback schema/API, safe device DTOs, admin pages/navigation, source-health reads.

### Acceptance Criteria and Verification

Staff can manage feedback under the agreed policy; device/source views reveal safe facts only; unauthorized users are denied. Run migration, authorization, and UI workflow tests.

### Status

Complete for the exact handoff — D-009/D-010:A are implemented through a reviewed migration, current
persisted-role enforcement, 15-minute fresh authentication for privileged Feedback delete/restore,
an additive triage/audit/retention model, a public notice, Super Admin inbox, and safe read-only
source-health view. The implementation remains distinct from deployment, account management, T11
recovery, and runtime migration/retention evidence.

### Evidence

D-009/D-010:A are recorded in `docs/decision-queue.md`; immutable focused briefs are
`docs/audits/specialized/T12-identity-feedback-triage-policy.md` and
`docs/audits/specialized/T12-identity-role-reauth-retention.md`. The complete exact-path evidence is
`docs/tasks/T12-feedback-triage-safe-source-views.md`. `bash scripts/ci-checks.sh`, backend check,
Prisma validation, frontend lint/build, `git diff --check`, and workflow validation pass; no migration
or external runtime target was operated.

## 8. Phase 4 — Hardening & Scale

**Entry criteria:** Phase 2 is complete; T9 is complete for deployment work.

**Exit criteria:** disposable production exercise, recovery evidence, alerts, browser verification, and maintainable map boundaries exist.

### T13 — Validate deployment, recovery, and alerts

### Source Audit(s)

Production Readiness 3.5, 3.8, 7; Infrastructure 5, 12; Security 12–16.

### Phase

4.

### Depends On

T4, T5, T6, T9.

### Decision Gates

Approved disposable deployment target, recovery owners, and alert destinations are required.

### Dependency Note

T4 completed on 2026-07-21; repeatable CI/local gates and the redacted operational-signal contract are available. T13 still requires T5, T6, and T9 before the production drill.

### Blocks

Any change from controlled pilot to daily/public production.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

Level 2 Deployment/observability specialist, then Level 3 Refactoring Agent.

### Execution Mode

Codex + Specialist.

### Task Brief

Build and document a disposable production-mode exercise: build, migrate, start, readiness, restart, source staleness, alerts, and backup/restore. Monitor readiness, startup/migration failures, ingestion rejections, history failures, and stale sources.

### Related Files

Deployment definitions, entrypoint, server/tracking logs/metrics, runbook, CI artifacts.

### Acceptance Criteria and Verification

Clean production build completes; simulated dependency/source failures change readiness/alerts; backup restore and migration recovery have owners and evidence. Run the documented drill.

### Status

Pending — T4, T5, and T6 evidence are current; deployment/recovery/alert validation remains blocked
on T9 topology facts and an approved disposable production-mode target.

### Evidence

T4 and T5 are complete; remaining dependencies and deployment facts are unresolved.

### T14 — Improve Dashboard UX, map maintainability, and measured scale quality

### Source Audit(s)

Frontend 4, 13–14; Dashboard 5, 11–12; Architecture 5, 10.

### Phase

4.

### Depends On

T8 completion evidence.

### Decision Gates

The 2026-08-07 Dashboard & UX re-audit is current. Before implementation, the owner must select and
order an exact subset of its P1 surfaces: root language/zoom behavior; public/admin modal, focus, and
form semantics; the mobile admin sidebar; truthful public/admin live and freshness states; Feedback
vehicle association; and the selected responsive role views. The exact-path task handoff must bind
those screens, actions, copy/language, visual acceptance, and browser journeys. Use the existing
public UI theme tokens and visual language as the product baseline. Measured evidence is required
before scale-specific work.

### Blocks

None.

### Priority

Medium, with High maintainability value.

### Difficulty

Medium.

### Suggested Agent

Level 2 Dashboard/UX specialist only for a remaining focused information-hierarchy decision, then
Level 3 Refactoring Agent for the exact approved implementation.

### Execution Mode

Codex + Specialist where a focused decision remains. Follow `tram-refactoring-workflow` for the
exact implementation, invoke `frontend-design` before an identity-preserving UI refactor, and use an
`impeccable` audit before and after the approved UI work. Verification is governed by the acceptance
contract, not tool availability.

### Task Brief

First define the admin Dashboard's information hierarchy and data layout around service truth,
exceptions, required actions, and role-appropriate navigation. Then apply visual polish and element
styling using the existing public UI design tokens/visual language, with reusable components rather
than parallel hard-coded themes. Keep the Dev research Dashboard visually coherent but separated by
route, authorization, vocabulary, and data contract. Repair the owner-selected truthful-state,
modal/focus/form, sidebar, feedback-association, keyboard, responsive, and recoverable-error P1s.
Only after those exact journeys are bounded, split the public tracker into focused data, socket,
marker, and ETA hooks and remove/merge the unused duplicate map with behavior-preserving regression
evidence. Add rooms/backend ETA only after measurement supports it.

### Related Files

Public tracker/map/helpers/tour/cards, admin dashboard/CRUD feedback, frontend tests.

### Acceptance Criteria and Verification

The selected admin Dashboard screens expose a documented priority order for service status,
exceptions, actions, and supporting metrics; every element uses shared public-theme tokens or a
documented semantic extension; loading/empty/error/stale/unauthorized/destructive states are clear;
responsive layout, keyboard order, focus, contrast, Thai/English text, and role-specific navigation
are browser-verified. One maintained public realtime map path remains; extracted units clean up
correctly; no scale work occurs without captured measurement. Run lint, production build, focused
component/accessibility checks, and desktop/mobile browser smoke tests.

### Status

Pending owner priority/exact task handoff — T8 completion and the 2026-08-07 Dashboard & UX technical
audit are current. Exact screens/actions, data priority, D-007 role views, visual acceptance, and
browser journeys still require owner selection and an exact-path Level 3 task before implementation.

### Evidence

`docs/audits/dashboard-ux-audit.md` records the required Impeccable audit (9/20, Poor; no P0; nine P1,
ten P2, and one P3), detector limitations, source evidence, and the bounded T14 recommendation set.
No T14 implementation or human browser acceptance was performed.

## 9. Phase 5 — Future Enhancements

**Entry criteria:** Phase 2 is complete and physical provider/device facts are documented.

**Exit criteria:** only approved future scope is delivered; research/public claims match available evidence.

### T15 — Physical senders, research comparison, playback, and scale extensions

### Source Audit(s)

Production Readiness 3.6, 3.7; Product 11; Architecture 9–10, 12; Infrastructure 7–9; D-002=B.

### Phase

5.

### Depends On

T7, physical sender/provider facts, and T13 for public operation.

### Decision Gates

D-004 fixes the three transport boundaries and initial Dev Dashboard scope. D-006 fixes the safer T7
disposable/export policy. D-007 makes `DEV` the highest role with all permissions, including D-006
bounded export; the exact endpoint/action and destructive-operation safeguards still require an
implementation matrix. TTN identifiers, physical hardware/firmware/provisioning, clock/reference
protocol, and any playback/public-report scope also require confirmation.

### Blocks

None.

### Priority

Deferred.

### Difficulty

Hard.

### Suggested Agent

User Decision Required for hardware/provider facts; Level 2 Device/LoRaWAN specialist; then Level 3 Refactoring Agent.

### Execution Mode

Codex Only until facts exist; Codex + Specialist afterward.

### Task Brief

Use the existing Socket.IO, HTTP, and TTN webhook boundaries to test the three physical sources.
Build the protected D-004 Dev Dashboard from T7 with live/historical comparison, health, delivery,
accuracy definitions, selection/failover, filters, and bounded export. Add public reports, playback,
rooms, or backend ETA only when a product question and telemetry/query evidence justify them.

### Related Files

External device contracts/firmware, TTN configuration, ingest/tracking/research APIs, research UI, history reads.

### Acceptance Criteria and Verification

Each device has mapping, payload, cadence, offline, credential, and test metadata; server-side D-007
authorization separates Dev research from ordinary administration; research data never changes public
canonical state; fidelity claims match retention. Document physical failure/reconnect, authorization,
bounded export, and provider webhook tests.

### Status

Deferred — T7 is complete for its approved disposable scope; physical sender/provider/protocol facts
and T13 remain blockers for field/public operation.

### Evidence

Repository simulators exist; physical/provider evidence is unavailable.

## 10. Research Queue

1. Safe DTOs, redaction, validation, and rate limits.
2. Reproducible integration fixtures and pipeline smoke tests.
3. Transactions, partial unique indexes, and idempotent lifecycle state machines.
4. Canonical state, versioning, freshness, and out-of-order telemetry.
5. Bounded raw-diagnostic retention, event/receive time, and research indexes.
6. Browser realtime trust, cache invalidation, and map lifecycle hooks.
7. Topology, origins, TLS, backups, Redis durability, and recovery drills.
8. Operational dashboards, feedback privacy, device provisioning, TTN webhooks, and measured scale triggers.

## 11. Accepted Risks (Carried Forward)

| Risk | Why carried | What changes it |
|---|---|---|
| Driver, trip-history, and exception workflows are absent | D-001=C now requires them, so this is no longer an accepted release omission. T10 route-stop operations are complete for their bounded scope. | Complete T11 with external Android evidence before release. |
| Feedback runtime rollout is unverified | T12 source/test scope is complete, but no migration, retention run, staff/rider acceptance, backup, or deployed scheduling evidence exists. | Execute an approved disposable/staging rollout and retention/role acceptance before release. |
| Dashboard/public UX is not release-ready | The current technical audit scores 9/20 (Poor): truthful live/freshness state, dialog/focus/form semantics, Feedback association, mobile navigation, responsive behavior, and other P1/P2 evidence remain open. | Owner-select the exact T14 priority surfaces, create an exact-path handoff, implement with browser/accessibility evidence, and re-audit. |
| Deployment/TLS/backup/recovery evidence is absent | No topology/domain/owner facts are supplied. | Supply facts, complete T9/T13. |
| Physical device/TTN evidence is absent | Provider/hardware/provisioning facts are unknown. | Record facts and execute T15. |
| Playback/reports are absent | D-002=B authorizes bounded diagnostics, not unbounded fidelity claims. | Approve query/fidelity scope after T7 evidence. |

These are recorded residual risks, not accepted exceptions for the selected C release target.

## 12. Blocking Decisions Required From User

The owner directions are recorded; only D-008 remains open. T11 has technical/external-evidence
gates but no focused owner-policy blocker:

| Needed information | Blocks | Reason |
|---|---|---|
| Exact host/provider, service/data placement, TLS/certificate, secret/log/alert destination, backup/recovery/migration/incident owners, and eventual domain | T9, T13 | D-008 narrows candidates and sequence but does not define an operable topology. |
| General `SUPER_ADMIN`/`ADMIN` provisioning/demotion, general Sender credential lifecycle, backup/rollback, and out-of-band `DEV` allowlist/recovery | T15 and later role-management work | These are intentionally outside T11/T12's Sender/re-auth scoped surfaces. |
| TTN application/device IDs; physical device/module models; firmware/provisioning; clock/reference and field protocol | T15 | D-004 fixes transport roles and dashboard scope, but repository evidence cannot establish physical behavior or absolute accuracy. |
| None for feedback policy | — | D-009 approves owner, anonymous/no-reply scope, business-day lifecycle, retention, deletion/restore, and safe read-only source fields. |
| Exact T14 screen/action order and acceptance journeys from the current P1 set | T14 | The technical audit is current, but owner priority is required to bound truthful-state, accessibility, Feedback integrity, mobile navigation, responsive, and role-view work before styling or structural refactoring. |

## 13. Recommended Level 2/3 Agent Usage

Route every focused technical question through `agents/level-2-specialist/AGENT.md` with
`tram-specialist-consultation`. Route every implementation through
`agents/level-3-refactor/AGENT.md` with `tram-refactoring-workflow`.

- Direct Level 3 tasks completed: T1, T3, T8 after T6, T10 after its refreshed audits/task handoff, and T12 under its D-010:A-constrained exact handoff. Maintenance M-20260807-01/02/03 is also complete without adding or reordering roadmap tasks. T14 has current technical audit evidence but still needs owner-selected priority and an exact Level 3 handoff; use Level 2 only if that selection exposes one focused cross-domain question. Before handing any task to an implementation agent, create `docs/tasks/<task-id>-<topic>.md` from the task template with exact allowed file paths, approved decisions, invariants, checks, rollout limits, and stop conditions.
- Specialist-led: T2 security/abuse; T4, T9, T13 observability/deployment; T5 database transactions; T6/T7 realtime and time-series; T11 operations/mobile; T15 device/LoRaWAN.
- T12's D-010:A account-transition choice and all exact source/test acceptance evidence are complete; runtime rollout remains separately gated.

## 14. Roadmap Limitations

This synchronization records the completed T12 source/test implementation, M-20260807-01/02/03, and
the affected 2026-08-07 re-audits. It does not run a migration, retention job, simulator journey,
deployment, or credential rotation; choose the exact provider/domain/hardware/field protocol; infer
human UX acceptance; or invent security-sensitive account-lifecycle details outside D-007/D-010:A.
The monolith remains the supported architecture; this roadmap does not authorize a microservice split.

## 15. Handoff

T1–T8, T10, and T12 are complete for their recorded scopes; M-20260807-01/02/03 are complete corrective
maintenance outside roadmap ordering. T9 remains blocked until exact topology and ownership facts
exist. T11 remains blocked until its external Android acceptance artifact and exact lifecycle handoff
exist. T14 has current technical audit evidence but remains blocked on owner-selected priority and an
exact-path handoff. T12 runtime rollout is not authorization to start deployment/public-release work.
No broader roadmap implementation or deployment/public-release work is currently eligible.

Validate each completed task against its originating audit finding before advancing. Re-run Production Readiness only after the production-bar tasks applicable to the desired release scope are complete.

## Roadmap Impact, Assumptions and Unknowns, Confidence, and Deferred Decisions

**Roadmap impact:** D-001=C makes T10–T12 required for the selected release target; D-002=B creates T7
research diagnostics; D-003=A removes the configuration cycle by sequencing T9 before alignment;
D-005=B keeps the 30-second stale state separate but adds an all-source 10-minute no-GPS auto-close
with fixed close fields/no-reopen to T11;
D-006 resolves T7's safer target/export
policy; D-007 introduces a three-tier role direction; D-008 narrows hosting candidates/domain
sequencing; D-009 binds feedback/privacy/read-only device policy; and D-010:A maps legacy roles while
requiring unknown roles to fail closed. T14 now includes admin Dashboard information hierarchy and
public-theme visual polish, bounded by the 2026-08-07 9/20 technical audit and a still-required owner
priority decision. M-20260807-01/02/03 correct logging, simulator, and generated-artifact boundaries
without changing roadmap order. The affected audits and roadmap were revalidated after those units.

**Assumptions and unknowns:** the target is C but no daily/public readiness claim is made before the
required work passes. Diagnostics remain bounded/protected; no exact topology/provider/device or
unapproved role permission is assumed.

**Confidence:** High for the recorded owner directions and source/test maintenance evidence. Medium
for provisional task/gate mapping and low for deployment, human UX outcomes, credential rotation,
and device/field claims until external evidence exists.

**Deferred decisions:** exact topology/ownership, remaining D-007 safeguards outside the selected
T11/T12 scopes, Dashboard priority screens, physical sender/provider facts,
playback/report scope, and scale-triggered features. D-006 retention/access/export parameters and T7
disposable evidence remain documented.
