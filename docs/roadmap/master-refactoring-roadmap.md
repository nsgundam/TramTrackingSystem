# Master Refactoring Roadmap

Audit metadata:
- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Evidence scope: `docs/project-knowledge-base.md`, all current domain audits under `docs/audits/`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, and this roadmap.
- Reviewed at: `2026-07-22T22:01:33+07:00`
- Validation state: **Validated**
- Predecessor baselines: all validated domain audits and `docs/project-knowledge-base.md` @ `847a18cce9bc27c82b2622dbc176b3a89bc4d037`; approved decisions D-001 through D-004.

Last reviewed: 2026-07-22

Validation state: **Validated**. T1–T5 remain complete, all required audits now have current
evidence-baseline metadata, and the approved decision queue is current. T6 is the next eligible
roadmap task; implementation still requires the Level 2/Level 3 task handoff contract.

## 1. Executive Summary

This roadmap supersedes the earlier task list. It uses all completed re-audits and the approved decisions:

- D-001 = A: the next release is a supervised controlled demonstration/pilot, not daily operations or a public launch.
- D-002 = B: retain bounded raw diagnostics to compare mobile, LoRaWAN, and ESP32 senders for research.
- D-003 = A: define the deployment topology and origin contract first, then align REST and Socket configuration.
- D-004: compare separate Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and
  LoRaWAN/Gateway/TTN/Webhook sources in an authenticated Dev Dashboard.

The production determination remains No-Go. D-001 reduces the immediate product scope but does not make public/daily risks acceptable. Phase 1 improves controlled-MVP safety and repeatability. Phase 2 creates the reusable technical contracts. Phase 3 stays deferred until D-001 is upgraded. Do not add playback, microservices, a second ingestion pipeline, or an operations suite early.

## 2. Input Coverage

| Input | Date | Status | Use |
|---|---:|---|---|
| Knowledge Base | 2026-07-22 | Complete / Validated | Current Discovery evidence at the stated baseline; external deployment/device facts remain unknown. |
| Product, Architecture, Backend, Frontend, Database, Infrastructure & Device, Dashboard & UX, Security/DevOps/Observability audits | 2026-07-22 | Complete / Validated | All required domain reports passed ordered predecessor and freshness gates at the stated baseline. |
| Production Readiness Audit | 2026-07-22 | Complete / Validated | Controlled demo is conditionally allowed under D-001=A; research, internal, and public production remain No-Go. |
| Decision Queue | 2026-07-22 | Approved | D-001=A, D-002=B, D-003=A, and D-004 research scope |

No required repository input is missing or stale under the current audit contract. Hosting, TLS,
production recovery, browser/runtime behavior, physical devices, and TTN console state remain
external unknowns and continue to gate the tasks that depend on them.

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
| T10 | Route-stop operations and cache invalidation | Critical for daily operations | Production 3.1, 3.7; Product 7; Frontend 4, 13; Backend 9, 12 | Phase 3, deferred by D-001=A |
| T11 | Supported sender operations, trip history, and exception view | Critical/High for daily operations | Production 3.1, 3.3; Product 7–9; Dashboard 7, 10 | Phase 3, deferred by D-001=A |
| T12 | Feedback triage and device/source operations views | High for broad public support | Product 7, 11; Frontend 12; Dashboard 10; Database 12 | Phase 3, deferred by D-001=A |
| T13 | Production deployment/recovery drill and monitoring | High before production | Production 3.5, 3.8, 7; Infrastructure 5, 12; Security 12–16 | Phase 4 |
| T14 | Map maintainability, onboarding/accessibility, and measured scale improvements | Medium/High maintainability | Frontend 4, 13–14; Dashboard 5, 11–12; Architecture 5, 10 | Phase 4 |
| T15 | Physical senders, research dashboard, playback/reports, scale extensions | Deferred | Product 11; Architecture 9–10, 12; Infrastructure 7–9; D-002 | Phase 5 |

Every Critical/High finding is represented. T10–T12 are carried forward because the approved controlled-MVP scope does not include daily/public operating workflows.

### Revalidated task state

| Task | Current state | Gate or evidence |
|---|---|---|
| T1 | Complete | Secret-hash/config URL exposure controls validated. |
| T2 | Complete | Shared validation, safe errors, and main boundary abuse controls validated; legacy admin writes remain outside scope. |
| T3 | Complete | Simulator fixtures and repeatable pipeline evidence validated; no physical-device claim. |
| T4 | Complete | CI checks and redacted process-local signals validated; no production alerting claim. |
| T5 | Complete | Transactional/idempotent Operations/Trip owner and migration evidence validated. |
| T6 | Partially Complete — implementation validated; runtime evidence pending | Level 3 implementation and safe/static checks are complete. Disposable Postgres/Redis, Socket.IO, browser/manual, and provider/runtime evidence remain unavailable or require an explicitly approved target. |
| T7 | Pending | Blocked on accepted T6 contract plus retention, deletion, and research-access parameters. |
| T8 | Pending | Blocked on accepted T6 canonical-state contract; route mutation portion also depends on T10. |
| T9 | Blocked | D-003 ordering is approved, but hosting, domain, TLS, Redis/DB placement, and operations-owner facts are missing. |
| T10 | Deferred | Requires T8 and D-001 upgrade from controlled demo to B/C. |
| T11 | Deferred | Requires T5, T6, supported sender/operator choice, and D-001=B/C. |
| T12 | Deferred | Requires D-001=C plus feedback ownership, privacy, and retention policy. |
| T13 | Pending | Requires T4/T5 plus T6 and T9, then deployment/recovery/alert evidence. |
| T14 | Pending | Requires T8 and browser/runtime evidence; no scale work without measurement. |
| T15 | Deferred | Requires T7, physical sender/provider facts, and T13 for public-operation claims. |

## 4. Dependency Map

| Task | Depends on | Blocks |
|---|---|---|
| T1 | None | T3, T4, safe device administration |
| T2 | T1 conventions | T3, T5, T6, T10 |
| T3 | T1, T2 | T7 and device-pipeline claims |
| T4 | T1 | T13 and reliable release evidence |
| T5 | T2 and current partial unique index | T6, T11, T13 |
| T6 | T2, T5 lifecycle vocabulary | T7, T8, T11, T15 |
| T7 | T3, T6, retention parameter record | Research comparison |
| T8 | T6; T10 for final route invalidation | Truthful tracking claims |
| T9 | D-003=A and topology facts | T13/public deployment |
| T10 | T2, T8, D-001=B/C | Operator-managed routes |
| T11 | T5, T6, D-001=B/C | Daily service accountability |
| T12 | D-001=C, T6 | Public support/device operations |
| T13 | T4, T5, T6, T9 | Production readiness reassessment |
| T14 | T8 and browser evidence | None |
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

**Entry criteria:** all audits complete; D-001=A, D-002=B, and D-003=A approved; no daily/public claim.

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

**Exit criteria:** one lifecycle owner and one versioned canonical contract exist; maps consume canonical truth; D-002 research diagnostics has a bounded policy; D-003 topology/origin contract is written. Daily/public workflows remain deferred by D-001=A.

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

Partially Complete — implementation and safe contract checks passed on 2026-07-22. Runtime
integration against a disposable Postgres/Redis target, browser/manual stale/reconnect/route checks,
and the Next.js production build remain pending because no disposable target was approved and the
build could not fetch Google Fonts in the restricted environment.

### Evidence

The exact-path task spec is `docs/tasks/T6-canonical-vehicle-state.md` and the immutable Level 2
brief is `docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md`. Changed paths are
the canonical backend publisher/read/route-authority services and boundaries, T6 boundary tests,
checked-in pipeline assertions, shared frontend canonical types/API, public `ShuttleTracker`, and
admin `LiveMap`. `shuttle-tracking-backend`: `npm run check`, `npx prisma validate`,
`node test_t6_canonical_state.js`, `node test_t6_realtime.js`, and `git diff --check` passed on
2026-07-22. `shuttle-tracking-web`: `npx tsc --noEmit` and `npm run lint` passed with existing
warnings. Compose config validation and `node scripts/validate-agent-workflow.js` passed. The
required `bash scripts/ci-checks.sh` reached frontend build but failed because `next/font` could
not fetch Google Fonts; T5 integration and socket/pipeline runtime checks were not counted because
no explicitly approved disposable target was available.

### T7 — Implement D-002=B bounded raw diagnostics for research

### Source Audit(s)

Production Readiness 3.3, 3.6; Database 4, 8–9, 12; Architecture 5, 9; Infrastructure 9; D-002=B.

### Phase

2.

### Depends On

T3, T6, and documented retention/deletion parameters.

### Decision Gates

D-002=B is approved; retention duration, deletion owner, and research-access policy remain required.

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

Pending — blocked on T6 and retention/access parameters.

### Evidence

None.

### T8 — Make maps truthful and repair route/cache behavior

### Source Audit(s)

Production Readiness 3.2, 3.7; Frontend 4, 7, 9, 13; Dashboard 5, 10–11; Backend 9, 12.

### Phase

2.

### Depends On

T6; T10 for final route mutation invalidation.

### Decision Gates

None for truthful-state UI; D-001=B/C is required before the T10-dependent route-management portion.

### Blocks

Truthful public/admin tracking and T14.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

Level 3 Refactoring Agent (direct).

### Execution Mode

Antigravity Implementation Ready after T6 acceptance.

### Task Brief

Use canonical route/state instead of UI-selected route. Show connect/reconnect/last-update/fresh/stale/offline/no-service meaning and degrade ETA when state is stale. Repair local geometry cache keys to include ordered stop data or backend revision; discard corrupt cache safely.

### Related Files

Public tracker/cards, admin LiveMap/dashboard, realtime/public API types, route cache helpers.

### Acceptance Criteria and Verification

An R02 event remains R02 even while R01 is selected; stale/no-service is visible in both surfaces; ETA is not current when stale; cache updates after route revision. Run lint, production build, and browser/socket interruption checks.

### Status

Pending — blocked on T6.

### Evidence

None.

### T9 — Define topology/origin contract, then align configuration

### Source Audit(s)

Production Readiness 3.5; Infrastructure 4–5, 10–12; Security 7, 9–11; Frontend evidence; D-003=A.

### Phase

2.

### Depends On

D-003=A plus hosting/domain/TLS facts.

### Decision Gates

Hosting provider, domains, TLS terminator, database/Redis placement, and operations owners require confirmation.

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

Blocked — hosting, domain, TLS, and operations-owner facts are missing. D-003 resolves sequencing,
not the required deployment choices.

### Evidence

D-003 resolves ordering only; deployment facts remain unconfirmed.

## 7. Phase 3 — Feature Completion

**Entry criteria:** Phase 2 contracts are accepted and D-001 is upgraded to B or C.

**Exit criteria:** operators can manage route stops, perform supported sender/trip workflows, inspect history, and see exceptions. Under C, public feedback has accountable triage.

### T10 — Add route-stop management and invalidation

### Source Audit(s)

Production Readiness 3.1, 3.7; Product 7; Frontend 4, 13; Backend 9, 12; Dashboard 7.

### Phase

3.

### Depends On

T2, T8, D-001=B/C.

### Decision Gates

D-001 must be upgraded from A to B or C.

### Blocks

Operator-managed routes.

### Priority

Critical.

### Difficulty

Medium.

### Suggested Agent

Level 3 Refactoring Agent (direct).

### Execution Mode

Antigravity Implementation Ready after D-001 upgrade.

### Task Brief

Add authenticated route-detail add/remove/reorder operations, validate membership/order, invalidate backend/public caches, and refresh geometry/versioned route data.

### Related Files

Admin route/sidebar UI, route-stop controller/cache service, public route cache/types, tests.

### Acceptance Criteria and Verification

Admins can publish ordered stops without manual/API work; invalid ordering fails; next public read uses revised geometry. Run backend cache tests, frontend lint/build, and browser route-change smoke test.

### Status

Deferred — blocked on T8 and D-001 upgrade to B/C.

### Evidence

None.

### T11 — Add sender operations, trip history, and exceptions

### Source Audit(s)

Production Readiness 3.1, 3.3; Product 7–9; Backend 7, 12; Dashboard 7, 10.

### Phase

3.

### Depends On

T5, T6, D-001=B/C.

### Decision Gates

D-001 must be upgraded from A to B or C; the supported sender/operator workflow must be confirmed.

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

Build a minimum driver-facing start/send/end/recovery workflow or formally integrate/audit an external sender client. Add protected trip history list/detail and a compact exception view for stale/silent vehicles, no active trip, and source freshness. Do not add playback.

### Related Files

Trip/history APIs, admin navigation/pages, sender client/external contract, canonical-state reads.

### Acceptance Criteria and Verification

A non-developer operator can complete the approved flow; admins can find active/completed trips; exceptions use canonical state. Run authorization, lifecycle, frontend, and operator acceptance checks.

### Status

Deferred — blocked on T6 and D-001 upgrade to B/C.

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

D-001=C plus feedback ownership, privacy, and retention policy approval.

### Blocks

Accountable public support/device operations.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

Level 3 Refactoring Agent (direct).

### Execution Mode

Codex Only until owner/policy exists; Antigravity Implementation Ready afterward.

### Task Brief

Add feedback case status/owner/resolution and an admin inbox only after ownership/retention are agreed. Add safe device/source health views using canonical freshness and never exposing credentials.

### Related Files

Feedback schema/API, safe device DTOs, admin pages/navigation, source-health reads.

### Acceptance Criteria and Verification

Staff can manage feedback under the agreed policy; device/source views reveal safe facts only; unauthorized users are denied. Run migration, authorization, and UI workflow tests.

### Status

Deferred — blocked on D-001=C and feedback ownership/privacy policy.

### Evidence

None.

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

Pending — blocked on T6 and T9.

### Evidence

T4 and T5 are complete; remaining dependencies and deployment facts are unresolved.

### T14 — Improve map maintainability and measured scale quality

### Source Audit(s)

Frontend 4, 13–14; Dashboard 5, 11–12; Architecture 5, 10.

### Phase

4.

### Depends On

T8 and browser/runtime evidence.

### Decision Gates

None; measured evidence is required before scale-specific work.

### Blocks

None.

### Priority

Medium, with High maintainability value.

### Difficulty

Medium.

### Suggested Agent

Level 3 Refactoring Agent (direct).

### Execution Mode

Antigravity Implementation Ready after T8 acceptance.

### Task Brief

Split the public tracker into focused data, socket, marker, and ETA hooks; remove/merge the unused duplicate map; repair tour selectors, route labels, keyboard semantics, and recoverable admin errors. Add rooms/backend ETA only after measurement supports it.

### Related Files

Public tracker/map/helpers/tour/cards, admin dashboard/CRUD feedback, frontend tests.

### Acceptance Criteria and Verification

One maintained public realtime map path remains; extracted units clean up correctly; tour/accessibility/error behavior is browser-verified; no scale work occurs without captured measurement. Run lint, production build, browser/mobile smoke test.

### Status

Pending — blocked on T8 and browser/runtime evidence.

### Evidence

None.

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

D-004 fixes the three transport boundaries and initial Dev Dashboard scope. TTN identifiers,
physical hardware/firmware/provisioning, retention/access parameters, clock/reference protocol, and
any playback/public-report scope still require confirmation.

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

Each device has mapping, payload, cadence, offline, credential, and test metadata; research data never changes public canonical state; fidelity claims match retention. Document physical failure/reconnect and provider webhook tests.

### Status

Deferred — blocked on T7, physical sender/provider facts, and T13 for public operation.

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
| Route-stop, driver, trip-history, and exception workflows are absent | D-001=A limits release to a controlled MVP. | Approve D-001=B/C and complete T10–T11. |
| Feedback triage is absent | No wider public support owner/policy exists. | Approve C and complete T12. |
| Deployment/TLS/backup/recovery evidence is absent | No topology/domain/owner facts are supplied. | Supply facts, complete T9/T13. |
| Physical device/TTN evidence is absent | Provider/hardware/provisioning facts are unknown. | Record facts and execute T15. |
| Playback/reports are absent | D-002=B authorizes bounded diagnostics, not unbounded fidelity claims. | Approve query/fidelity scope after T7 evidence. |

These are accepted only inside the controlled-MVP boundary; none are accepted for daily/public production.

## 12. Blocking Decisions Required From User

The Decision Queue is approved. Remaining implementation parameters are:

| Needed information | Blocks | Reason |
|---|---|---|
| Hosting/topology, domains, TLS terminator, and operations owner | T9, T13 | D-003 resolves order, not provider/domain/recovery choice. |
| Raw-diagnostic retention duration, deletion owner, and research access policy | T7 | D-002=B chooses bounded diagnostics but not the bound. |
| TTN application/device IDs; physical device/module models; firmware/provisioning; clock/reference and field protocol | T15 | D-004 fixes transport roles and dashboard scope, but repository evidence cannot establish physical behavior or absolute accuracy. |
| Feedback triage owner and privacy/retention policy | T12 | Needed only if scope becomes C. |

## 13. Recommended Level 2/3 Agent Usage

Route every focused technical question through `agents/level-2-specialist/AGENT.md` with
`tram-specialist-consultation`. Route every implementation through
`agents/level-3-refactor/AGENT.md` with `tram-refactoring-workflow`.

- Direct Level 3 tasks: T1, T3, T8 after T6, T10 after D-001 upgrade, and T14 after T8. Before handing any Antigravity-ready task to an implementation agent, create `docs/tasks/<task-id>-<topic>.md` from the task template with exact allowed file paths, approved decisions, invariants, checks, rollout limits, and stop conditions.
- Specialist-led: T2 security/abuse; T4, T9, T13 observability/deployment; T5 database transactions; T6/T7 realtime and time-series; T11 operations/mobile; T15 device/LoRaWAN.
- T12 requires product-owner/privacy input before implementation.

## 14. Roadmap Limitations

This review does not implement or runtime-test code. It does not choose provider, domain, retention duration, hardware, or protocol. The monolith remains the supported architecture for the current target; this roadmap does not authorize a microservice split.

## 15. Handoff

T1–T5 are complete and the roadmap is validated against the current audit baseline. T6 is the next
eligible task. Before implementation, create its immutable Level 2 specialist brief and
`docs/tasks/<task-id>-<topic>.md` with exact repository-relative write paths, invariants,
acceptance checks, rollout limits, and stop conditions. Do not start T7/T8 in parallel until the T6
canonical-state contract is accepted. T9 remains blocked until the owner supplies topology facts.

Validate each completed task against its originating audit finding before advancing. Re-run Production Readiness only after the production-bar tasks applicable to the desired release scope are complete.

## Roadmap Impact, Assumptions and Unknowns, Confidence, and Deferred Decisions

**Roadmap impact:** D-001=A defers daily/public workflows to Phase 3; D-002=B creates T7 research
diagnostics; D-003=A removes the configuration cycle by sequencing T9 before alignment. The current
validated readiness gate confirms that T6, not historical T1, is the next implementation-planning
target.

**Assumptions and unknowns:** the next release is supervised and does not claim daily/public service; diagnostics are bounded/protected; no topology/provider/device fact is assumed.

**Confidence:** High for the evidence-based task ordering. Medium for later execution because topology, retention parameters, and device facts are external inputs.

**Deferred decisions:** topology details, raw-diagnostic retention/access parameters, physical sender facts, feedback ownership, playback/report scope, and scale-triggered features.
