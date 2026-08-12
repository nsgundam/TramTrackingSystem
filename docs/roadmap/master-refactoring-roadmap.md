# Master Refactoring Roadmap

Audit metadata:
- Evidence baseline: `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Accepted T14 application-source baseline: `c72feb90e7a35da45d82bac61eb927ab7c55a37c`
- Evidence scope: `PRODUCT.md`, `docs/project-knowledge-base.md`, every validated domain and
  production-readiness audit, `docs/decision-queue.md`, `docs/tasks/`,
  `docs/roadmap/T14-scope-and-closure-ledger.md`, and the repository evidence cited by the
  revalidated reports; the current planning change also adds
  `docs/roadmap/T14-research-and-execution-plan.md`.
- Reviewed at: `2026-08-12T23:15:48+07:00`
- Validation state: **Validated — T14 Research Plan v1 approved; exact handoff required per unit**
- Predecessor baselines: `docs/project-knowledge-base.md`, `docs/audits/product-audit.md`,
  `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`,
  `docs/audits/frontend-audit.md`, `docs/audits/database-audit.md`,
  `docs/audits/infrastructure-device-audit.md`, `docs/audits/dashboard-ux-audit.md`,
  `docs/audits/security-devops-observability-audit.md`, and
  `docs/audits/production-readiness-audit.md`, validated in required R1–R8 order over
  `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`; accepted T14 application behavior remains
  `c72feb90e7a35da45d82bac61eb927ab7c55a37c`.
- Owner-decision overlay: the user's 2026-08-12 approval of S15–S17, move of S14, migration repair,
  and Frontend-team ownership of future OSM licence/attribution work is recorded in the current
  `docs/decision-queue.md` synchronization; it is owner authority, not source evidence at
  `531ec9e`.

Last reviewed: 2026-08-12

Current validated state: T1–T8, T10, and T12 are complete for their recorded repository scopes. T9
is repository-complete but externally incomplete; T11 is blocked on coordinated Backend/Mobile
work and Android evidence; T13 is owner-deferred behind T9 and target authority; T15 remains behind
T13 and physical/provider facts. T14 has 12 accepted outcomes, now registered as `T14-S01` through
`T14-S11` plus `T14-S13`, at application baseline `c72feb9`, with S13 accepted at `a528054`.
R0–R10 research is complete and Plan v1 is owner-approved. S12/OSM is Removed, S14 is Moved outside
T14, and S15–S17 are registered in the approved order; no T14 source may begin without that unit's
separate exact handoff. A newly current role-migration ordering defect is authorized Maintenance
and a release stop condition outside T14. Production remains No-Go. Detailed immutable T14 history
lives in the ledger, task files, and Git; domain audits retain current snapshots rather than
repeated slice journals.

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
- D-008: use an initial university-managed single host behind one TLS origin at the preferred
  `tram-tracking.rsu.ac.th`; keep PostgreSQL/Redis private; assign application artifacts/migrations/
  runbook to the application team and host/network/DNS/TLS/secrets/recovery/alerts/incidents to the
  University Server/Network Team. External VPS is manual cold recovery; Vercel/Render/Neon and AWS
  learning are isolated non-production profiles.
- D-009: `SUPER_ADMIN` owns anonymous, one-way business-day feedback triage; feedback/case data is
  retained for 180 days, IP only for 30 days of rate limiting, protected deletion/restore is bounded,
  and source/device visibility is read-only and safe-field-only.
- D-010:A: map every legacy `OPERATOR` to `ADMIN`, make `ADMIN` the ordinary-user default, retain
  `SUPER_ADMIN`/`DEV`, and reject unknown roles at every server authorization boundary.
- D-011: start T14 with fail-closed Feedback association and truthful Public/Admin state, preserve
  the Public visual identity, then address accessibility/navigation before measured responsive/
  performance/visual-system work; Admin pages may use a separately bounded complementary theme.
- D-012: use the approved least-privilege account/Sender/deletion/backup/recovery matrix, including
  role-target restrictions, 15-minute fresh auth, reason/audit/session invalidation, generated-once
  Sender secrets, recoverable Trip/GPS deletion, and out-of-band `DEV` control.

The production determination remains No-Go. Selecting C increases the required completion bar; it
does not prove public readiness. T10/T12 are complete only for their exact source/test scopes; T9's
repository handoff passes but its external acceptance is incomplete, T11 retains its independent
block, and runtime rollout still requires its own evidence. No remaining task may start without
crossing the explicit dependency, external-evidence, or owner-decision gates below. Do not add
playback, microservices, a second ingestion pipeline, or unbounded operations/research access early.

## 2. Input Coverage

| Input | Date | Status | Use |
|---|---:|---|---|
| Knowledge Base | 2026-08-12 | R1 Validated @ `531ec9e` | Current inventory, accepted Admin entry, migration blocker, credential-doc mismatch, and external evidence limits are recorded. |
| Product and Architecture | 2026-08-12 | R2–R3 Validated @ `531ec9e` | T14 scope is separated from T11/T15/D-012/external work; intentional boundaries are not cleanup tasks. |
| Backend, Frontend, and Database | 2026-08-12 | R4 Validated @ `531ec9e` | Three approved bounded T14 paths are known after OSM removal; backend/schema changes are unnecessary; migration ordering is a High non-T14 blocker. |
| Infrastructure & Device | 2026-08-12 | R5 Validated @ `531ec9e` | Android/ESP32/TTN/provider/deployed/field results remain unavailable external evidence. |
| Dashboard & UX | 2026-08-12 | R6 Validated @ `531ec9e` | 15/20 is normalized: its P1 is T15; approved T14 outcomes, Maintenance, and external proof are separated. |
| Security/DevOps/Observability | 2026-08-12 | R7 Validated @ `531ec9e` | Migration, Mobile credentials, assets, durable signals, CI breadth, and operations retain their proper owners. |
| Production Readiness | 2026-08-12 | R8 Validated / No-Go @ `531ec9e` | Local demo Conditional; research field, internal operations, and public service No-Go. |
| T14 Plan and owner evidence | 2026-08-12 | R9–R10 Complete; owner approved | S12 Removed, S14 Moved, S15–S17 ordered; safety/Maintenance/Roadmap/evidence lanes remain separate. |

Level 1 revalidated the owner-selected Admin direction at `a0a0ce1...`; the outcomes later
registered as S01–S08 culminated in S08 source `06e0291`, Level 3 completion `23b4d6f`, and Level 1
acceptance `9af2c59`. The bright-neutral Admin foundation outcome later registered as S09 has source
`c4fdc3a`, completion `2b49fd8`, and Level 1 acceptance `f526939`. The S10 mutation-feedback chain
has initial source/completion `2ddb835`/`8ebdf9a`, repair source/completion `e6a04ad`/`e5f6422`, and
Level 1 acceptance `95a8de1`. The shared browser Socket.IO lifecycle outcome later registered as
S11 has source `70f42c1`, completion `535ec73`, and Level 1 acceptance `fd527ac`; it preserves valid
Public/Admin observable behavior and server contracts. S13 has source `c72feb9`, completion
`9a9cf5c`, and Level 1 acceptance `a528054`. The canonical ledger records the complete chain for all
17 retrospective/current stable IDs and C01–C16 final research dispositions. Plan v1 now owns the
approved scope, ordering, decisions, exclusions, and per-unit handoff gate. Actual hosting, TLS,
production recovery, Android build/device behavior, browser/runtime behavior, physical
devices, and TTN console state remain external unknowns.

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
| T9 | Topology/origin contract, then deployment configuration alignment | High | Production 3.5; Infrastructure 4–5, 12; Security 7, 9–11; D-003 | Phase 2; repository handoff passed, external acceptance blocked |
| T10 | Route-stop operations and cache invalidation | Critical for daily operations | Production 3.1, 3.7; Product 7; Frontend 4, 13; Backend 9, 12 | Phase 3; complete for the exact handoff scope; affected audits revalidated |
| T11 | Supported sender operations, trip history, and exception view | Critical/High for daily operations | Production 3.1, 3.3; Product 7–9; Dashboard 7, 10 | Phase 3; native source pinned, but coordinated Backend/Mobile handoff, compatible patch, Android target, and acceptance artifact pending |
| T12 | Feedback triage and device/source operations views | High for broad public support | Product 7, 11; Frontend 12; Dashboard 10; Database 12 | Phase 3; complete for the D-009/D-010:A exact handoff; runtime rollout remains unverified |
| T13 | Production deployment/recovery drill and monitoring | High before production | Production 3.5, 3.8, 7; Infrastructure 5, 12; Security 12–16 | Phase 4; blocked on T9 external acceptance and target authority |
| T14 | Dashboard/public-theme UX, map maintainability, accessibility, and measured scale improvements | Medium/High maintainability | T14 Research Plan v1; current Frontend/Dashboard/Architecture audits | Phase 4; 12 accepted outcomes; S12 Removed, S14 Moved, S15–S17 approved for exact-handoff execution |
| T15 | Physical senders, research dashboard, playback/reports, scale extensions | Deferred | Product 11; Architecture 9–10, 12; Infrastructure 7–9; D-002 | Phase 5; blocked on T13 and physical/provider facts |

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
| T9 | Partially Complete — repository handoff validated; external acceptance unavailable | Fail-closed runtime/origin configuration, private/authenticated production template, deterministic checks, full CI, and the Server/Network runbook passed; external deployment acceptance remains a completion gate. |
| T10 | Complete | The exact-path handoff delivered authenticated route-stop management, transactional replacement, and public-cache invalidation with deterministic backend and repository-CI evidence. No ambient browser/database smoke ran; this re-audit carries its changed evidence. |
| T11 | Blocked — cross-repository/external evidence | The v3 brief pins a partially compatible native app. Static-secret storage, backup/cleartext, task-removal and missing enrollment/claim/recovery gaps require a coordinated exact handoff plus writable Mobile/Android target and device acceptance. |
| T12 | Complete — exact handoff | Reviewed migration, persisted role/fresh-auth enforcement, feedback lifecycle/audit/retention source, public notice, inbox, safe health UI, deterministic tests, and CI pass. No runtime target was operated. |
| T13 | Blocked — dependency/external authority | T4/T5/T6 pass, but T9 external acceptance, an approved disposable production-mode target, recovery owners, and alert destinations are absent. |
| T14 | Plan v1 approved — 12 source outcomes accepted | R0–R10 complete; S12 Removed, S14 Moved, S15–S17 approved. One source unit may run only after its committed exact handoff. |
| T15 | Deferred / blocked — dependency/external facts | T7 is complete for disposable scope; T13 plus physical sender/provider/protocol facts remain open. |

### Approved-batch continuation gate

| Candidate | Eligibility result | Stop condition |
|---|---|---|
| T9 continuation | Deferred by owner / not eligible for autonomous repository work | The remaining acceptance actions operate University Server/Network infrastructure and require named operators, actual target facts, and target authority. Deferral does not satisfy them. |
| T11 | Not eligible | The exact additive lifecycle/schema/API handoff and versioned external Android test artifact do not exist. |
| T13 | Deferred by owner / not eligible | T9 is not complete externally, and no disposable production-mode target, recovery owners, or alert destinations are approved. Deferral does not satisfy them. |
| T14 | S15 exact handoff next | Plan v1 is approved. S15 is the first T14 unit; S16 waits for S15 acceptance and S17 waits for S16. RF-18 waits in a parallel Maintenance lane and blocks database rollout, not local T14 source. |
| T15 | Not eligible | T13 and physical sender/provider/protocol evidence are unresolved; the task is explicitly deferred. |

Batch result: 12 T14 source outcomes are accepted: `T14-S01` through `T14-S11` plus `T14-S13`.
S13 is accepted at `a528054`; S12 is Removed, S14 is Moved, and S15–S17 are approved with exact
handoffs still required. T9/T13 remain deferred without
dependency bypass and T11/T15 remain blocked.

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
| T9 | D-003=A and D-008 topology/ownership policy | T13/public deployment |
| T10 | T2, T8, D-001=B/C | Operator-managed routes |
| T11 | T5, T6, D-001=B/C | Daily service accountability |
| T12 | D-001=C, T6 | Public support/device operations |
| T13 | T4, T5, T6, T9 | Production readiness reassessment |
| T14 | T8, the current Dashboard & UX audit, and the D-011-approved Public/Admin direction; an exact Level 3 task contract is the implementation gate | None |
| T15 | T7, T13, and physical provider/device facts | None |

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

D-003=A plus approved D-008 topology/ownership policy.

### Decision Gates

D-008 selects an initial university-managed single host, the preferred one-origin proxy paths,
private data services, application-team deliverables, University Server/Network operational duties,
24-hour initial RPO/RTO ceiling, manual cold-VPS recovery, and isolated demo platforms. Actual host,
DNS/TLS, firewall, secret, backup, log/alert, named-contact and capacity facts remain external
acceptance evidence rather than an application-owner decision.

### Blocks

T13 and public deployment.

### Priority

High.

### Difficulty

Medium.

### Suggested Agent

Level 3 Refactoring Agent under the approved D-008 specialist brief.

### Execution Mode

Codex + Specialist contract followed by the exact Level 3 repository implementation; external
University Server/Network execution remains separate.

### Task Brief

Implement the approved topology/origin record in production configuration: private/authenticated data
services, fail-closed origins/secrets, one REST/Socket origin, proxy/CORS/client-address rules,
healthchecks, non-secret environment contract, and Server/Network migration/recovery/operations
runbook. Verify deterministic repository behavior and stop before external operations without an
approved target and operator.

### Related Files

Production Compose/Dockerfiles, environment templates, frontend configuration, backend CORS/Socket settings, deployment runbook.

### Acceptance Criteria and Verification

Repository acceptance: no configuration cycle remains; production has no localhost/placeholder
fallback or public DB/Redis binding; REST/Socket resolve one documented origin; CORS covers approved
admin methods; health and migration/recovery/owner contracts are explicit; focused tests and full CI
pass. External acceptance: run HTTPS/WSS, port, restart, restore, alert and capacity checks only on an
approved target with the University Server/Network Team.

### Status

Partially Complete — repository handoff validated; external acceptance unavailable. The production
template now keeps data services private,
authenticates non-root Redis, binds app ports to loopback, uses versioned images and health ordering,
fails closed on unsafe runtime/origin/proxy values, and uses one frontend REST/Socket authority.
Focused tests and full CI pass. T9 remains incomplete until the University Server/Network checklist
is executed and accepted.

### Evidence

D-003 resolves ordering. The binding D-008 v1/v2 briefs and
`docs/tasks/T9-production-topology-origin-handoff.md` constrain the delivered source/static scope.
The Server/Network runbook maps release, migration/recovery, proxy, secret, monitoring, incident and
external acceptance duties. Backend/frontend/topology tests, isolated Playwright, builds and full CI
passed. During independent review, an accidental entrypoint invocation reached `prisma migrate
deploy` with a dummy localhost target and failed with `P1001` before connection; this was a
stop-condition breach, caused no migration/data mutation, and is not runtime acceptance. No host,
container stack, provider, deployed secret, connected migration target, restore or deployment target
was operated. HTTPS/WSS, public ports, restart, restore, alerts, contacts and capacity remain
unavailable. Level 1 revalidated the repository evidence at `cdedcc2...`; it did not promote static
checks into external runtime acceptance.

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
briefs are `docs/audits/specialized/T11-identity-mobile-sender-enrollment.md`,
`docs/audits/specialized/T11-identity-mobile-sender-enrollment-v2.md`, and
`docs/audits/specialized/T11-mobile-repository-compatibility-v3.md`. V3 pins the owner-supplied
Android source and records its partial compatibility plus required coordinated migration.

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

Blocked — policy and affected audits are current, and the external Android source is now pinned.
That revision still uses human-entered/persisted static Sender credentials, backup/cleartext, and
task-removal Trip termination and lacks enrollment/QR/claim/recovery. T11 needs a coordinated exact
Backend/Admin/Mobile handoff, writable Mobile authority plus Android SDK/device target, a compatible
patch, and the v2 versioned acceptance artifact. Static source or an owner-reported locked-screen
test does not substitute for device/OS/build/failure/recovery evidence.

### Evidence

T5/T6 lifecycle dependencies are complete. The cross-repository implementation/acceptance gates are
recorded in the v3 brief and remain unresolved.

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

Complete for the exact historical T12 handoff — D-009/D-010:A were implemented through the
then-reviewed migration, current persisted-role enforcement, 15-minute fresh authentication for
privileged Feedback delete/restore,
an additive triage/audit/retention model, a public notice, Super Admin inbox, and safe read-only
source-health view. The implementation remains distinct from deployment, account management, T11
recovery, and runtime migration/retention evidence.

A post-baseline edit to that migration now places the supported-role constraint before legacy
`OPERATOR` conversion. The current SQL therefore has a separate High-severity Maintenance blocker
and is not covered by the historical T12 acceptance.

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

Blocked — T4, T5, and T6 evidence are current, but T9 external acceptance is incomplete and no
approved disposable production-mode target, recovery owners, or alert destinations are available.

### Evidence

T4 and T5 are complete; remaining dependencies and deployment facts are unresolved.

### T14 — Improve Dashboard UX, map maintainability, and measured scale quality

> Current T14 detail is intentionally centralized in
> `docs/roadmap/T14-scope-and-closure-ledger.md`. It is authoritative for stable slice IDs,
> provenance, research inputs, pass criteria, eventual closure, and the sole next action. The
> ordered planning contract is `docs/roadmap/T14-research-and-execution-plan.md`. The detailed
> narrative below is retained as historical implementation context and grants no write authority.

**Current snapshot:** 12 accepted source outcomes (`T14-S01` through `T14-S11` plus `T14-S13`),
application baseline `c72feb9`, S13 Level 1 acceptance `a528054`, S12 Removed, S14 Moved, no Active
slice, R0–R10 complete, and S15–S17 owner-approved pending one exact handoff at a time.

### Source Audit(s)

Frontend 4, 13–14; Dashboard 5, 11–12; Architecture 5, 10.

### Phase

4.

### Depends On

T8 completion evidence.

### Decision Gates

D-011 fixes truthful/fail-closed behavior, Public ownership, and the bright-neutral fixed-light
Admin direction. Twelve source outcomes are accepted; S12/OSM is owner-cancelled/Removed and S14 is
Moved outside T14. The canonical ledger holds the complete decision/provenance map. R0–R10 and Plan
v1 are complete and approved; one committed exact handoff per selected unit is the next gate. No dormant task,
candidate, or generic Related Files list authorizes source work.

### Blocks

None.

### Priority

Medium, with High maintainability value.

### Difficulty

Medium.

### Suggested Agent

Main Agent supervision with one exact Level 3 handoff and acceptance cycle at a time. Route every non-T14 finding
through its recorded Maintenance, Roadmap, or external-evidence lane.

### Execution Mode

Approved-batch execution. Research is complete. Re-audit may not silently add a slice; S15 → S16 →
S17 execute only through individual committed exact handoffs.

### Task Brief

T14 is a sequence of bounded, measurement-first frontend/dashboard outcomes, not an unlimited polish
task. The accepted set covers truthful state/Feedback, accessibility, measured map quality, contrast,
Admin Dashboard and operations convergence, Public recovery, bright Signal Lens Admin/Login,
master-data mutation recovery, shared browser transport ownership, and truthful Admin Feedback
session hydration. Exact ownership, overlap locks, tasks, and evidence for every slice are in the
canonical ledger. T11, Research/T13/T15, D-012, Public redesign, backend/API/schema policy,
deployment, and external runtime remain separate.

### Related Files

The latest completed source handoff is
`docs/tasks/T14-admin-feedback-session-hydration-truth-state.md`. The full slice/task map is in the
canonical ledger. This generic section authorizes no writes; the closed/Removed S12 task and Moved S14
grant no source authority.

### Acceptance Criteria and Verification

Use the ledger's seven-part per-slice pass contract and technical closure contract. A source task
must have a committed exact-path handoff, genuine failing measurement, focused/boundary/regression
proof, relevant frontend quality checks, allowlist integrity, and ordered Level 1 acceptance. T14
technical closure is not Production Readiness, 20/20 UX, or human/AT/deployed acceptance.

### Status

Partially Complete — 12 source slices are accepted: `T14-S01` through `T14-S11` plus `T14-S13`.
The latest application baseline is `c72feb9` and S13 is accepted at `a528054`. S12/OSM is Removed by
owner and has no accepted source delta. S14 is Moved and has no task or source authority. Plan v1
registers S15 Admin mutation integrity, S16 timestamp contract, and S17 Public stop-image resilience;
each is owner-approved but gains source authority only through its own committed task handoff.

### Evidence

The ledger contains the H/S/C/R chain for every registered slice and points to its immutable task.
The latest S13 evidence is handoff `4c33cf0`, source `c72feb9`, completion `9a9cf5c`, and Level 1
acceptance `a528054`. The current R1–R8 reports retain score/finding/evidence limits. Historical
measurements remain in the task files and Git history rather than being repeated here.

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

Deferred / blocked — T7 is complete for its approved disposable scope; physical sender/provider/
protocol facts and T13 remain blockers for field/public operation.

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
| Dashboard/public UX is not release-ready | The validated score remains 15/20 at application baseline `c72feb9`. Its P1 is T15; three approved bounded T14 outcomes, human/AT/device/runtime evidence, T11 exceptions, and other assets remain. Removed S12 leaves an external provider risk. | Execute S15–S17 through their exact gates; obtain missing evidence through its recorded owners without pulling external gates into source slices. |
| Deployment/TLS/backup/recovery evidence is absent | D-008 policy and the T9 repository handoff exist, but University Server/Network acceptance checks are incomplete. | Obtain T9 external acceptance, then complete T13. |
| Physical device/TTN evidence is absent | Provider/hardware/provisioning facts are unknown. | Record facts and execute T15. |
| Playback/reports are absent | D-002=B authorizes bounded diagnostics, not unbounded fidelity claims. | Approve query/fidelity scope after T7 evidence. |

These are recorded residual risks, not accepted exceptions for the selected C release target.

## 12. External Acceptance and Remaining Owner Decisions

D-008, D-011 refinements, D-012, and T14 Plan v1 are approved. T11 has cross-repository/external-
evidence gates but no additional focused owner-policy blocker:

| Needed information | Blocks | Reason |
|---|---|---|
| University Server/Network named contacts plus actual host/resources, DNS/TLS, firewall, secret store, off-host backup/restore, log/alert, restart and capacity evidence | T9 external acceptance, T13 | D-008 defines the operable logical contract; these are external execution facts the application developer must not invent. |
| D-012 implementation paths and external `DEV` allowlist/recovery/backup target facts | T15 and later role-management work | Policy is approved but intentionally outside T11/T12/T14; target facts and exact implementation evidence remain absent. |
| TTN application/device IDs; physical device/module models; firmware/provisioning; clock/reference and field protocol | T15 | D-004 fixes transport roles and dashboard scope, but repository evidence cannot establish physical behavior or absolute accuracy. |
| None for feedback policy | — | D-009 approves owner, anonymous/no-reply scope, business-day lifecycle, retention, deletion/restore, and safe read-only source fields. |
| Optional Public Feedback vehicle-association model | Later roadmap synthesis | S14 is Moved outside T14; choose a Product/Data/Privacy contract only if the owner reopens the capability later. |

## 13. Recommended Level 2/3 Agent Usage

Route every focused technical question through `agents/level-2-specialist/AGENT.md` with
`tram-specialist-consultation`. Route every implementation through
`agents/level-3-refactor/AGENT.md` with `tram-refactoring-workflow`.

- Direct Level 3 tasks completed: T1, T3, T8 after T6, T10 after its refreshed audits/task handoff, T12 under its D-010:A-constrained exact handoff, and the 12 accepted T14 source outcomes (`S01–S11 + S13`). Maintenance M-20260807-01/02/03 and M-20260812-01 are complete without adding or reordering roadmap work. S12 is Removed; S14 Moved; S15 exact handoff is next.
- Specialist-led: T2 security/abuse; T4, T9, T13 observability/deployment; T5 database transactions; T6/T7 realtime and time-series; T11 operations/mobile; T15 device/LoRaWAN.
- T12's D-010:A account-transition choice and all exact source/test acceptance evidence are complete; runtime rollout remains separately gated.

## 14. Roadmap Limitations

This synchronization records approved D-008/D-011/D-012, the validated T9 repository handoff, the
completed T12 source/test implementation, M-20260807-01/02/03, the pinned T11 Mobile revision, and
every affected 2026-08-08 re-audit. It does not
run a migration, retention job, simulator journey, deployment, or credential rotation; establish
external host/domain/runtime
facts; choose hardware/field protocol; infer human UX acceptance; or claim the approved D-012
lifecycle matrix is implemented.
The monolith remains the supported architecture; this roadmap does not authorize a microservice split.

## 15. Handoff

The approved local batch is eligible for supervised continuation. T9/T13 remain owner-deferred
without satisfying their external gates; T11/T15 remain dependency/evidence blocked. T14 has no
Active slice until S15's exact handoff is committed: R0–R10 and Plan v1 are complete/approved, OSM
is owner-removed, and S14 is Moved. Plan approval alone does not authorize source; every
repository outcome still requires its proper lane, a committed exact-path handoff, and passed
dependency/decision gates. Browser Login evidence at the accepted T14 baseline remains limited to
rejected requests and protected redirects rather than a successful-session acceptance.
T14 source acceptance is not deployment or public-release authorization.

Validate each completed task against its originating audit finding before advancing. Re-run Production Readiness only after the production-bar tasks applicable to the desired release scope are complete.

## Roadmap Impact, Assumptions and Unknowns, Confidence, and Deferred Decisions

**Roadmap impact:** D-001=C raises the release target; D-002 through D-010 govern the research,
telemetry, topology, role, and Feedback boundaries recorded in T7–T13. D-011 preserves Public visual
ownership and fixes the bright-neutral Signal Lens Admin direction; D-012 defines later lifecycle
policy without implementing it here. T14's accepted/removed/proposed inventory and immutable
evidence are centralized in `docs/roadmap/T14-scope-and-closure-ledger.md`. Affected audits are
validated in predecessor order at the compatible baselines recorded in each report;
`M-20260812-01` is accepted separately at `cdd69f8` and does not change accepted T14 evidence. No
T14 source change may start before its own committed exact-path handoff.

**Assumptions and unknowns:** the target is C but no daily/public readiness claim is made before the
required work passes. Diagnostics remain bounded/protected; no external host/provider/device fact or
unapproved role permission is assumed.

**Confidence:** High for the recorded owner directions, normalized task/gate mapping, and
source-visible evidence. Medium for later isolated-browser outcomes and low for deployment, human
UX outcomes, credential rotation,
and device/field claims until external evidence exists.

**Deferred work/evidence:** D-012 implementation outside T11/T12/T14, removed S12 with unresolved
provider risk assigned to the Frontend team, moved S14, normalized C01–C16 dispositions, plus human/runtime evidence,
physical sender/provider facts, playback/report scope, and scale-triggered
features. D-006 retention/access/export parameters and T7 disposable evidence remain documented.
