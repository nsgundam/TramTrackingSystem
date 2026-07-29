# Implementation Task Specification: T7 — raw research observations

## Source Task

- Roadmap task: `T7`
- Phase: `2`
- Priority/difficulty: **High for approved research scope / Hard**
- Status: **Level 3 task spec created — implementation not started**
- Approved decisions: `D-001`, `D-002`, `D-004`, `D-005`
- Specialist briefs:
  - `docs/audits/specialized/T7-product-research-accuracy-protocol.md`
  - `docs/audits/specialized/T7-data-lifecycle-access.md`

## Objective

Implement D-002=B bounded raw diagnostics and protected research reads for the first T7 campaign:
Android Mobile and LoRaWAN through TTN. Store typed, append-only raw observation facts separately
from T6 canonical state; provide reproducible metric queries and CSV export; enforce the owner-approved
90-day raw retention policy; and prove that research persistence cannot change public/realtime
canonical state.

The implementation must remain a controlled research capability. It must not claim absolute GPS
accuracy, device/network latency, ESP32 results, production readiness, or an overall source winner.

## Gate Status and Dependencies

- T3: complete according to the current roadmap.
- T6: accepted canonical-state contract and immutable specialist brief exist; preserve its authority.
- Owner parameters: recorded in `docs/research/T7-owner-input-questionnaire.md` on 2026-07-29.
- Current audit register: predecessor rows affected by T6 are still marked `Needs Re-audit`; Level 3
  implementation must not begin until Level 1 confirms the required audit-freshness gate is satisfied.
- Stateful validation: blocked until the `t7-disposable` PostgreSQL/Redis target is explicitly
  approved with credentials/data scope, expected mutations, cleanup, and rollback plan.
- Dedicated Research UI is an external consumer of the protected backend contract; this task does
  not add frontend UI or public raw-telemetry presentation.

## Consolidated Handoff Resolution

The two immutable T7 briefs proposed different service filenames for the same bounded boundary. To
make this task spec an exact allowlist, use:

- `research-diagnostics.service.ts` as the normalized raw-observation/disposition boundary.
- `research-metrics.service.ts` for versioned metric calculations and validity criteria.
- `research-export.service.ts` for protected CSV streaming.
- `research-retention.service.ts` for 90-day deletion and aggregate handling.
- `research-lifecycle.service.ts` for session/aggregate/lifecycle manifests and backup verification.
- Migration `20260729170000_add_t7_research_diagnostics/migration.sql`.

Do not create parallel `research-observations.service.ts` or a second T7 migration name without
revising this spec first.

## Allowed Writes

Only these exact repository-relative paths may be modified during the bounded T7 implementation and
its required state synchronization:

- `docs/tasks/T7-raw-research-observations.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-backend/prisma/schema.prisma`
- `shuttle-tracking-backend/prisma/migrations/20260729170000_add_t7_research_diagnostics/migration.sql`
- `shuttle-tracking-backend/src/middleware/auth.ts`
- `shuttle-tracking-backend/src/middleware/research-access.ts`
- `shuttle-tracking-backend/src/routes/ingest.route.ts`
- `shuttle-tracking-backend/src/routes/research.route.ts`
- `shuttle-tracking-backend/src/server.ts`
- `shuttle-tracking-backend/src/controllers/research.controller.ts`
- `shuttle-tracking-backend/src/services/tracking.service.ts`
- `shuttle-tracking-backend/src/services/research-diagnostics.service.ts`
- `shuttle-tracking-backend/src/services/research-metrics.service.ts`
- `shuttle-tracking-backend/src/services/research-export.service.ts`
- `shuttle-tracking-backend/src/services/research-retention.service.ts`
- `shuttle-tracking-backend/src/services/research-lifecycle.service.ts`
- `shuttle-tracking-backend/src/config/redis.ts`
- `shuttle-tracking-backend/package.json`
- `shuttle-tracking-backend/tests/test_t7_research_contract.js`
- `shuttle-tracking-backend/tests/test_t7_metrics.js`
- `shuttle-tracking-backend/tests/test_t7_data_lifecycle.js`
- `shuttle-tracking-backend/tests/test_t7_export.js`
- `shuttle-tracking-backend/tests/test_t7_retention.js`
- `shuttle-tracking-backend/tests/test_t7_backup_verification.js`
- `shuttle-tracking-backend/tests/test_t7_canonical_boundary.js`
- `shuttle-tracking-backend/tests/fixtures/t7-mobile-lorawan.json`

State-synchronization limits:

- `docs/tasks/T7-raw-research-observations.md`: update only status, evidence, commands, changed
  behavior, and next handoff after verification.
- `docs/roadmap/master-refactoring-roadmap.md`: update only T7 status/evidence/dependency notes
  after acceptance; do not reorder tasks or change approved decisions.
- `docs/audits/README.md`: downgrade affected audit rows to `Needs Re-audit` with T7 and rationale;
  never mark an audit complete.

No other path is implicitly authorized. The task must stop before expanding this list.

## Read-only Context

- `AGENTS.md`
- `agents/level-3-refactor/AGENT.md`
- `.agents/skills/tram-refactoring-workflow/SKILL.md`
- `docs/project-knowledge-base.md`
- `docs/audits/README.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/decision-queue.md`
- `docs/research/device-comparison-scope.md`
- `docs/research/T7-owner-input-questionnaire.md`
- `docs/audits/database-audit.md`
- `docs/audits/backend-audit.md`
- `docs/audits/architecture-audit.md`
- `docs/audits/infrastructure-device-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- `docs/audits/security-devops-observability-audit.md`
- `docs/audits/production-readiness-audit.md`
- `docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md`
- `docs/audits/specialized/T7-product-research-accuracy-protocol.md`
- `docs/audits/specialized/T7-data-lifecycle-access.md`
- `shuttle-tracking-backend/prisma/schema.prisma`
- `shuttle-tracking-backend/prisma/migrations/`
- `shuttle-tracking-backend/src/config/redis.ts`
- `shuttle-tracking-backend/src/middleware/auth.ts`
- `shuttle-tracking-backend/src/routes/ingest.route.ts`
- `shuttle-tracking-backend/src/server.ts`
- `shuttle-tracking-backend/src/services/tracking.service.ts`
- `shuttle-tracking-backend/package.json`
- `docker-compose.yml`
- `docker-compose.prod.yml`

## Invariants

- T6 `CanonicalVehicleStateV1`, `location-update`, state epoch/version ordering, route authority,
  freshness semantics, public projection, and viewer transport behavior remain unchanged.
- Research raw persistence is independent of canonical selection/publication. A raw insert, delay,
  duplicate, rejection, or deletion must never change T6 state, Trip lifecycle, `GPSTrack`, route
  authority, or public/realtime payloads.
- PostgreSQL/PostGIS is the durable research source of record. Redis remains transient T6 state,
  freshness, coordination, and namespaced lifecycle state; Redis is not the raw research backup.
- The raw cutoff is exactly 90 days from one backend-owned `received_at`/`backendReceiveTime`, never
  producer time, client time, selected time, or display time. Aggregates follow the owner-selected
  manual-delete policy until superseded by a new decision.
- T7 actively binds only `mobile` and `lorawan`/TTN. `esp32` and `simulator` may remain schema-
  compatible, but no physical ESP32 evidence or result is produced.
- `producerEventTime`, `providerReceiveTime`, `backendReceiveTime`, `processTime`, `selectedTime`,
  and optional `displayTime` retain separate meanings. Without synchronized clocks, report only
  `observedTimestampDifferenceMs`; never label it device/network/end-to-end latency.
- With no surveyed checkpoint or synchronized reference receiver, `groundTruthErrorM` remains null.
  Route-conformance distance and pairwise disagreement remain proxies and cannot identify a winner.
- Metrics remain separate; no overall score, weighted winner, or silent combination of route distance,
  reported accuracy, pairwise disagreement, and ground-truth error is permitted.
- Raw and aggregate schemas are typed and allowlisted. No raw request body, arbitrary JSON, token,
  header, cookie, credential, IP address, MAC/IMEI/advertising ID, driver identity, or secret enters
  the research data or CSV response.
- Research reads/exports are server-authorized for `DEV` and `SUPER_ADMIN` only. UI hiding is not an
  authorization mechanism. Current owner choice of no read/export audit logging and unrestricted
  bounds must be retained as an explicit risk; streaming, field allowlists, backpressure, and
  operational concurrency controls are still mandatory.
- The migration is additive. Preserve T5 constraints, the partial active-trip index, existing
  `GPSTrack` semantics, source ownership, and existing transport authentication/validation.
- No dependency, architecture split, time-series extension, broker, public endpoint, or frontend
  application is added by this task without a revised task spec.

## Required Changes

1. Add additive PostgreSQL/PostGIS products for research sessions, append-only raw observations,
   typed metric aggregates, and lifecycle/backup verification records. Use timezone-aware timestamps,
   source/vehicle/trip/session identity at receipt, sequence/dedupe facts, transport/schema fields,
   dispositions, reported accuracy semantics, route geometry version, and allowlisted metadata.
2. Add the exact migration and indexes for deterministic session/source/vehicle/time reads, dedupe,
   receive-time deletion, and conditional PostGIS queries. Use reviewed parameterized SQL where Prisma
   `Unsupported` geography or custom indexes require it. Do not rewrite existing timestamp columns.
3. Normalize Mobile Socket.IO and TTN webhook observations through one research-diagnostics boundary.
   Capture one backend receive timestamp and preserve accepted/rejected/duplicate/late/invalid and
   canonical-selection dispositions without changing T6 behavior.
4. Implement the versioned T7 metric contract: availability/missingness, arrival cadence/jitter,
   acceptance/rejection/duplicate/late rate, observed timestamp difference, route-conformance,
   pairwise disagreement, reported accuracy, and canonical selection share. Support configurable
   `pairingWindowMs` with 5,000 ms MVP default, three valid runs per source-type/vehicle stability
   floor, denominator disclosure, and `insufficient_evidence` rather than invented zeroes.
5. Keep raw coordinates unsnapped and route geometry versioned. Exclude only predeclared depots,
   detours, geometry defects, or other declared exclusions, retaining the raw row and reason.
6. Add server-side `DEV`/`SUPER_ADMIN` research access and a protected research route/controller.
   Do not expose research data through public routes, ordinary operator/sender credentials, or T6
   public DTOs. Do not implement the Research UI in this task.
7. Implement CSV-only export with fixed schema version/header, UTC timestamps, null semantics,
   deterministic ordering, field allowlist, formula-injection handling, streaming/backpressure,
   disconnect/partial-artifact handling, and no full-result in-memory buffering. Preserve the owner’s
   no-hard-bound choice but never permit arbitrary SQL or unrestricted columns.
8. Implement raw retention from backend receive time, aggregate manual deletion, hybrid anonymization/
   hard-delete, and fail-closed backup/deletion verification. Use stable cutoff batches, lifecycle
   manifests, counts/hashes, idempotent restart behavior, and cleanup of temporary raw backup/export
   artifacts according to the approved backup-retention policy.
9. Keep Redis research keys namespaced and ephemeral with explicit TTL/SCAN verification. A Redis
   failure or loss must not be interpreted as a durable raw backup or mutate T6 canonical keys.
10. Add deterministic T7 fixtures/tests for Mobile and TTN and failure-injection coverage for schema,
    authorization, T6 boundary, timestamps/order, metrics, CSV, retention, backup/restore, Redis,
    deletion interruption, export failure, and representative query/backpressure behavior.

## Acceptance Criteria

- Additive migration validates and does not alter/delete existing T5, Trip, `GPSTrack`, source,
  canonical-state, or public transport semantics.
- Every normalized Mobile/TTN raw fact has stable session/source/vehicle identity, transport/schema,
  backend receive time, disposition, and allowlisted metadata. Missing producer time/sequence is
  explicit and never synthesized as trustworthy ordering.
- Raw capture has no canonical-state side effect: identical input yields the same T6 state/version
  whether raw persistence succeeds, is delayed, or fails; rejected/lower-priority data cannot become
  canonical because it was retained.
- The metric API/CSV includes metric definition version, scope, denominator, sample/missing/excluded
  counts, and clock/accuracy labels. It reports `groundTruthErrorM=null` for the current campaign and
  never exposes `deviceLatency`, `networkLatency`, absolute GPS accuracy, or an overall winner.
- Route-conformance uses versioned raw geometry without snapping. Pairwise output includes source pair,
  alignment basis/window, matched/unmatched counts, and does not call either source more accurate.
- `DEV` and `SUPER_ADMIN` are enforced at the server boundary; unauthorized callers receive 403 with
  no data enumeration; secrets, direct identifiers, raw payloads, and credentials never appear in
  research responses or CSV.
- CSV export is UTF-8, fixed-schema, correctly quoted, streamed, formula-safe, deterministic, and
  protected against full-result memory buffering and partial-artifact mislabeling.
- Raw rows older than 90 days by backend receive time are deleted only after backup/restore/hash/count
  verification succeeds. Failed verification keeps rows intact and marks lifecycle failure.
- Aggregate deletion is explicit/manual, anonymizes direct identifiers, and cannot cascade into T6
  tables or Redis canonical state. Temporary raw artifacts are tracked and removed per approved policy.
- Redis keys used by T7 are namespaced/TTL-controlled; Redis is not the durable raw source of record.
- Required tests cover duplicate/out-of-order, missing/invalid time, role boundaries, export fields,
  CSV injection, route exclusions/no-snap, retention cutoff, deletion restart/idempotency, backup
  mismatch, Redis loss, PostgreSQL failure, canonical invariance, and representative query plans.
- Implementation evidence is produced only from the approved disposable targets and synthetic/redacted
  fixtures. No production, public, provider, hardware, or absolute-accuracy claim follows automatically.

## Validation Commands

Safe, non-stateful checks:

- `cd shuttle-tracking-backend && npm run build`
- `cd shuttle-tracking-backend && npx prisma validate`
- `cd shuttle-tracking-backend && node tests/test_t7_research_contract.js`
- `cd shuttle-tracking-backend && node tests/test_t7_metrics.js`
- `cd shuttle-tracking-backend && npm run test`
- `bash scripts/ci-checks.sh`
- `git diff --check`

Stateful checks, only after explicit disposable-target approval:

- `npx prisma migrate deploy` against the isolated T7 PostgreSQL target only.
- T7 data-lifecycle, export, retention, backup-verification, and canonical-boundary tests against
  synthetic/redacted fixtures on `t7-disposable`.
- Redis namespaced-key/TTL/SCAN and failure-injection checks against isolated T7 Redis only.
- `EXPLAIN (ANALYZE, BUFFERS)` for the approved research query shapes after loading the representative
  fixture; never run it against ambient or production data.
- Restore verification on the separate `t7-backup-restore-disposable` target only.

The implementation agent must map each acceptance criterion to command output or test evidence and
report unavailable checks as skipped, never passed.

## Rollout and Migration Limits

- Use a fresh isolated Compose project named `t7-disposable`, never the ambient `shuttle-*` stack.
- Use `postgis/postgis:16-3.4-alpine`; pin and record the exact Redis server image/digest before
  stateful validation because the repository currently uses floating `redis:alpine`.
- Use non-ambient ports such as PostgreSQL `15433`, Redis `16380`, and backend `13002`.
- Use a separate empty `t7-backup-restore-disposable` database/volume for restore checks. Do not use
  live data, production credentials, ambient volumes, or provider credentials in fixtures.
- No migration, seed, reset, deployment, recovery drill, destructive deletion, backup restore, or
  runtime/provider/hardware test may run before target approval, expected mutation, cleanup, and
  rollback are confirmed.
- Enable raw capture only behind an explicit research-session flag. Do not backfill Redis or sampled
  `gps_tracks` data as raw observations.
- Do not enable scheduled/manual deletion until aggregates are finalized and backup verification passes.
- Do not promote to production/public operation until Level 1 validates evidence, affected audits are
  re-audited as required, and the owner accepts the explicit no-audit-log/unrestricted-export risks.
- If physical field testing occurs later, keep it supervised and record that provider/device/clock/
  ground-truth evidence is separate from repository contract tests.

## Stop Conditions

- Stop if any required write path is outside this allowlist or if the two specialist handoffs require
  a third incompatible schema/service/migration design.
- Stop before implementation if Level 1 has not cleared the stale predecessor-audit gate or if the
  exact disposable PostgreSQL/Redis target is not explicitly approved.
- Stop if a migration would be destructive, rewrite existing timestamps, alter T6 canonical state,
  change public DTO authority, bypass T5 operations, or introduce a second public/raw broadcast path.
- Stop if server-side `DEV`/`SUPER_ADMIN` authorization cannot be enforced without relying on UI
  hiding or sender credentials.
- Stop if a proposed metric requires synchronized clocks, a ground-truth receiver, ESP32/TTN runtime
  facts, or physical-device behavior that has not been supplied; record it as unverified/future scope.
- Stop if backup/restore/hash/count/Redis verification fails; keep raw data intact and mark the
  lifecycle run failed.
- Stop if a failed research write changes canonical state, publishes raw fields, exposes a secret or
  direct identifier, or makes a rejected/duplicate/late observation canonical.
- Stop before promotion if the owner/Level 1 has not accepted the documented risk of no read/export
  audit logging and unrestricted export bounds.
- Stop rather than changing architecture, adding dependencies, enabling a time-series store, or
  expanding to a frontend/public research dashboard within this task.

