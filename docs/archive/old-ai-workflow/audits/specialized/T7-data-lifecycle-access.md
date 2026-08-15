# T7 Specialist Decision Brief — Data Lifecycle, Access, and Export

Status: **Immutable Level 2 decision brief — v1**  
Task/audit ID: **T7**  
Focused question: **What minimum raw-diagnostic and aggregate data-lifecycle, access, and CSV-export contract should PostgreSQL/Redis provide for Mobile Android + LoRaWAN/TTN research without changing T6 canonical-state authority?**  
Primary playbook: `.agents/skills/tram-specialist-consultation/references/postgres-redis-retention.md`  
Supporting playbook: `.agents/skills/tram-specialist-consultation/references/identity-security-privacy.md`  
Research date: **2026-07-29**

This file is immutable. If the focused question or an owner constraint changes, create
`T7-data-lifecycle-access-v2.md` and link this brief as superseded. This consultation changed no
application code, Prisma schema, migration, roadmap, Decision Queue, or agent instruction.

## 1. Trigger and current repository evidence

### Trigger

The roadmap defines T7 as D-002=B bounded raw diagnostics, dependent on T6 and documented
retention/deletion parameters. Its handoff requires append-only raw facts separate from canonical
state, including source/vehicle/trip/session identity, event/receive times, sequence/transport facts,
reported accuracy, validation outcome, canonical disposition, and allowlisted metadata. It explicitly
blocks research-dashboard and source-comparison claims until those facts exist.

The owner has now supplied these constraints:

- Raw observations are retained for **90 days from backend `receiveTime`**.
- Aggregates remain until a Super Admin/Dev manually deletes them.
- Super Admin/Dev owns deletion, normally every Friday or when the 90-day threshold is reached.
- A backup file must be produced and verified before deletion.
- Deletion is hybrid: anonymize retained derived data and hard-delete expiring raw data.
- Research access is only Dev/Super Admin through a dedicated Research UI.
- Read/export audit logging is intentionally declined.
- Privacy basis is university employees, university-owned trams, and explicit consent.
- Research export is CSV-only with no owner-imposed row/time bound.
- Capacity is approximately 30 devices, 10 vehicles, three devices per vehicle, and one-month
  research sessions.
- T7 must select a disposable target for Level 3 handoff but must not run migration/deployment.

### Repository evidence

- `docs/roadmap/master-refactoring-roadmap.md:524-586` makes T7 dependent on T6 and retention/deletion
  parameters, and requires raw facts to remain separate from canonical state.
- `docs/decision-queue.md:37-63` approves bounded raw diagnostics (D-002=B); `:95-114` defines the
  authenticated research scope and the earlier bounded CSV/JSON export direction (D-004).
- `docs/research/device-comparison-scope.md:1-64` defines Mobile/Socket.IO and LoRaWAN/TTN source
  boundaries, route-conformance and pairwise-disagreement semantics, and the prohibition on treating
  them as absolute accuracy.
- `docs/research/T7-owner-input-questionnaire.md:9-61` records the owner constraints and confirms no
  surveyed ground truth or reference receiver is available.
- `docs/audits/database-audit.md:14-22,33-39,62-70` confirms that `gps_tracks` is sampled canonical
  history, not raw history; current schema lacks event/receive time, deduplication, disposition,
  session, retention, deletion, assignment history, and research export.
- `docs/audits/backend-audit.md:12-26,71-94` confirms that observations use a backend-derived time,
  Redis keeps latest state, PostgreSQL stores sampled canonical history, and no protected research
  query/export API exists.
- `docs/audits/architecture-audit.md:60-73,75-87,100-110` identifies PostgreSQL as durable entity/
  history authority, Redis as latest/transient state, and raw diagnostics as a separate authenticated
  product.
- `docs/audits/security-devops-observability-audit.md:57-79,120-150` confirms that current User has
  no role/action-audit model, production Redis/DB isolation is unverified, and no raw export audit
  trail exists.
- `docs/audits/dashboard-ux-audit.md:80-100,112-123` requires a separate authenticated research
  surface and says the public tracker must not expose raw comparison or unrestricted history.
- `docs/audits/production-readiness-audit.md:43-70` treats research as No-Go until raw diagnostics,
  retention/deletion/access, reproducible export, and field evidence are implemented and verified.
- `shuttle-tracking-backend/prisma/schema.prisma` contains only `User`, route/vehicle/trip/source,
  sampled `GPSTrack`, and feedback models. New research data must not repurpose `GPSTrack`.
- `shuttle-tracking-backend/src/services/tracking.service.ts` writes the latest source snapshot to
  `source:last_location:<sourceId>`, timestamps it with `Date.now()`, selects canonical state by
  priority/freshness, and admits sampled canonical history through the existing T5 path.
- `shuttle-tracking-backend/src/config/redis.ts` creates a Redis client from `REDIS_URL`; the current
  Compose definitions use `redis:alpine` without a server-version pin or evidenced Redis auth/TLS.
- T6 (`docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md:40-47,107-126`) makes
  canonical state the only public/realtime authority and leaves raw event/receive time, disposition,
  retention, and research export to T7.

### Repository versions inspected first

| Component | Repository/installed version | Evidence and implication |
|---|---:|---|
| Prisma CLI / `@prisma/client` | 7.3.0 / 7.3.0 | `shuttle-tracking-backend/package.json`, `package-lock.json`, and installed CLI. PostGIS geography remains `Unsupported` in the current schema. |
| npm `redis` client | 6.0.0 | `package.json` and installed package. This is the Node client version, not the Redis server version. |
| PostgreSQL/PostGIS image | `postgis/postgis:16-3.4-alpine` | `docker-compose.yml` and `docker-compose.prod.yml`; actual running server was not inspected. |
| Redis server image | `redis:alpine` | Floating tag in both Compose files; exact server version is unverified and must be pinned for Level 3 runtime validation. |
| Node.js / TypeScript | v26.3.0 / 5.9.3 | Installed/runtime inspection. No claim is made about provider or device runtimes. |

## 2. Recommended decision

Adopt a **PostgreSQL/PostGIS durable research evidence boundary** with three additive products:

1. `research_sessions` stores the experiment protocol, route-geometry version, metric version, and
   consent-basis version.
2. `research_raw_observations` is append-only, receives one normalized fact per accepted/rejected/
   duplicate/late observation, and is hard-deleted after 90 days based only on backend `received_at`.
3. `research_metric_aggregates` stores typed, versioned summaries after session processing. It is
   retained until Super Admin/Dev manually deletes it, but direct identifiers and raw coordinates are
   removed or pseudonymized before indefinite retention.

Redis remains the T6 runtime store for latest source snapshots, canonical current state, freshness,
selection coordination, counters, and Socket.IO coordination. It is **not** the durable raw or
aggregate source of record. A Redis outage must not be converted into a claim that PostgreSQL raw
research data exists, and a raw write must never change canonical source selection, state version,
route authority, or public payload semantics.

### 2.1 Authority and storage boundary

| Data product | PostgreSQL/PostGIS | Redis | Required rule |
|---|---|---|---|
| T6 canonical current vehicle state | No new T7 copy required | Existing canonical key/state contract | T6 remains the only realtime/public authority. T7 may store a reference to canonical disposition/version, never a replacement state. |
| Latest source snapshot/freshness | No | Existing `source:last_location:*` and freshness keys | Transient only; apply an explicit TTL no longer than the documented freshness/recovery policy. Never use it as research history. |
| Raw research observation | Durable append-only table | No raw research stream/key | Insert from the normalized backend boundary with `received_at` captured once. No arbitrary JSON/payload blob. |
| Research aggregate | Durable typed table | Optional short-lived computation/counter cache only | Materialize to PostgreSQL with session and metric versions before raw deletion. |
| Selection counters | Session-scoped durable aggregate after finalization | Existing hashes during live processing | Redis counters alone cannot support historical comparison or export. |
| Lifecycle/backup verification | Minimal non-payload manifest/run record | Optional job lock/heartbeat with TTL | Operational verification is not read/export audit logging; it is required to prevent unsafe deletion. |

T7 must not edit the meaning of `GPSTrack`, `Trip`, `location-update`, or T6 state epochs/versions.
If a raw persistence attempt fails, T6 may continue according to its approved dependency semantics, but
the affected observation/session must be marked as **not valid for a complete research sample** and a
redacted operational signal must be emitted.

### 2.2 Minimum schema contract

All new research timestamps should use PostgreSQL `timestamptz(6)` and be serialized as UTC ISO 8601
in APIs/CSV. Existing `timestamp(6)` columns are not silently rewritten by T7.

#### `research_sessions`

Required fields:

- `id` (UUID), `protocol_version`, `metric_definition_version`, `status`;
- `started_at`, `ended_at`, `created_at`, `updated_at`;
- `route_id` and a versioned `route_geometry_version` snapshot, or a non-identifying route alias;
- planned source types (`mobile`, `lorawan`, and future `esp32`), vehicle aliases, and session scope;
- `consent_basis_version` and a non-PII consent confirmation, never employee names or documents;
- `aggregate_retention_class = manual_delete`.

The session is the primary query/export scope. It gives reproducibility without making a device or
driver identity a public key.

#### `research_raw_observations`

The row is an observation fact, not a copy of a request. Required or conditionally nullable fields:

| Field group | Contract |
|---|---|
| Identity | `id`, `session_id`, internal `source_id` snapshot, `source_type`, `vehicle_id_at_receive`, `route_id_at_receive`, optional `trip_id`, and a session-scoped source/vehicle alias. Do not rely on a live foreign-key join to reconstruct historical assignment. |
| Time | Nullable `producer_event_time`; mandatory backend `received_at`; optional `processed_at` and `selected_at`; `event_time_quality` and `clock-skew/disposition` codes. Retention uses `received_at`, never producer time. |
| Ordering/deduplication | Transport-specific `producer_sequence` or provider message identifier hash when supplied, an idempotency/dedupe key, and a unique partial key on `(session_id, source_id, dedupe_key)`. Missing sequence is a recorded fact, not permission to invent one. |
| Position/measurement | Nullable PostGIS `geography(Point,4326)` for research coordinates, `speed_mps`, `heading_deg`, `reported_accuracy_value`, and `reported_accuracy_kind` such as `radius_m`, `hdop`, or `unknown`. HDOP must never be labelled metres. |
| Transport/schema | `transport` (`socketio` or `ttn_webhook` for current T7), `payload_schema_version`, app/firmware version when allowlisted, and provider/network/radio fields only from the explicit allowlist. |
| Disposition | `validation_disposition` (`accepted`, `rejected`, `duplicate`, `late`, `invalid`), stable allowlisted `rejection_code`, and `canonical_disposition` (`selected`, `eligible_not_selected`, `stale`, `not_evaluated`, `not_applicable`). A rejected row may have no coordinates. |
| Allowlisted metadata | Nullable battery percentage, network type, Wi-Fi RSSI, LoRaWAN RSSI, and LoRaWAN SNR. Store no MAC/IMEI/phone advertising ID, free-form provider payload, bearer token, header, cookie, secret, or arbitrary JSON. |
| Retention | `received_at` is the authoritative cutoff input. An optional `retention_expires_at` may be materialized as `received_at + 90 days`, but it must not override the source timestamp. |

Use SQL/custom migration for the PostGIS column and any partial/functional index that Prisma 7.3.0
cannot model. Prisma's `Unsupported` fields are not available through the generated client, so the
Level 3 service must use reviewed parameterized SQL for geometry insert/query paths and keep all
filters allowlisted.

#### `research_metric_aggregates`

Use typed columns, not a JSON metrics blob. Minimum fields are:

- `id`, `session_id`, `metric_definition_version`, `time_bucket` or session scope;
- session-scoped `source_alias`, `vehicle_alias`, `route_alias`, and `transport`;
- `sample_count`, `valid_count`, `missing_count`, `duplicate_count`, `late_count`, and
  `availability_count`;
- latency/cadence/jitter summaries with explicitly named units and quantile method;
- route-conformance summary and pairwise-disagreement summary only when the metric validity rules
  are satisfied;
- `created_at`, `computed_at`, and a reproducibility/input watermark;
- no raw coordinate, employee identity, direct device ID, secret, or free-text note.

Aggregates must preserve separate metrics. T7 must not compute an overall winner or silently merge
route-conformance, reported uncertainty, pairwise disagreement, and ground-truth error.

#### Lifecycle manifest/run record

A small `research_lifecycle_runs` or equivalent record should store `run_id`, action, cutoff,
candidate/backup/deleted row counts, artifact URI or opaque name, SHA-256, verification status,
actor role, start/end time, and error code. This is an operational safety record, not a payload read
log. It does not contradict the owner's decision to omit read/export audit logging.

### 2.3 Query, index, and capacity contract

Research reads are server-side only. Every raw query must use a session or approved research scope,
an allowlisted source/vehicle filter, and a deterministic order `(received_at, id)`. The owner has
chosen no hard row/time limit for Dev exports; this does not permit arbitrary SQL, unallowlisted
columns, cross-tenant scope, or an in-memory export buffer.

Initial indexes:

- `(session_id, received_at, id)` for the primary session timeline;
- `(source_id, received_at, id)` and `(vehicle_id_at_receive, received_at, id)` for comparison
  filters;
- partial unique `(session_id, source_id, dedupe_key)` where `dedupe_key IS NOT NULL`;
- `(received_at)` or a range-partition boundary to make the 90-day deletion scan deterministic;
- a PostGIS GiST index only if route-conformance/nearest-geometry query plans justify it on the
  representative fixture. Do not add spatial or covering indexes solely because fields exist.

The MVP should start with ordinary PostgreSQL tables and batched, restart-safe deletion. Do not add
TimescaleDB, a broker, or an external analytics store. Evaluate monthly range partitioning when a
measured fixture shows that row count, vacuum/deletion time, or index size makes batched deletion
unsafe. For planning only, 30 devices at one observation per second would be about 233 million raw
rows over 90 days; this is an upper-bound illustration, not measured capacity. The implementation
must record observed cadence and row size before choosing partitioning.

For each representative query, Level 3 must capture `EXPLAIN (ANALYZE, BUFFERS)` on the approved
disposable target, verify the plan after statistics are refreshed, and record query duration, rows,
and memory. Do not run `EXPLAIN ANALYZE` against a non-disposable target.

### 2.4 Access and CSV export contract

Authorization is server-side and role-based. The existing all-admin token is not sufficient as a
research authorization claim. Add explicit `DEV` and `SUPER_ADMIN` roles for the research route;
senders, riders, ordinary operators, and clients that only have UI visibility must receive 403. The
Research UI is a separate authenticated surface and must not be added to the public tracker.

CSV export is the only research export format. It must be UTF-8, have a fixed header/schema version,
UTC timestamps, explicit empty/null representation, stable column order, correct CSV quoting, and
streamed output with backpressure. It must not serialize an object by calling `JSON.stringify` into
a CSV column.

Recommended export fields:

| Class | Fields | Trade-off |
|---|---|---|
| Required | `schema_version`, `session_alias`, `source_alias`, `source_type`, `vehicle_alias`, `route_alias`, `transport`, `received_at`, `producer_event_time`, `event_time_quality`, `producer_sequence`/dedupe status, validation/canonical disposition, metric units, payload schema version | Sufficient to reproduce timing, delivery, acceptance, and source comparison without exposing direct identifiers. |
| Restricted research fields | `latitude`, `longitude`, speed, heading, reported accuracy/value/kind, station code, allowlisted app/firmware version, battery, Wi-Fi RSSI, LoRaWAN RSSI/SNR | Precise location and signal metadata are sensitive and can reveal route/working patterns. They are permitted only to the two owner-selected roles and only for the research route. |
| Never export | `secretHash`, JWT/bearer token, request headers/cookies, raw TTN payload, arbitrary JSON, IP address, MAC/IMEI/phone advertising ID, driver name/employee ID, credentials, free text, database connection values, or internal stack traces | Prevents credential leakage, direct re-identification, payload-based injection, and accidental expansion of the purpose. |

All string fields, including station/provider labels, must be checked for CSV formula injection and
log/control-character injection. Export filenames must be generated by the server, not copied from
user input. A full export that is interrupted must be marked incomplete and must not be advertised as
a verified artifact.

### 2.5 Retention, anonymization, deletion, and backup verification

The following is the binding operational sequence for the owner-selected 90-day raw policy:

1. Capture backend `received_at` once at the trusted ingestion boundary. Do not recalculate it from
   Redis, producer time, or a client clock.
2. Materialize or finalize aggregates with a metric-definition version and input watermark before
   raw deletion. Aggregates must contain no raw coordinates or direct device/employee identifiers.
3. On Friday or when due, select rows with `received_at < cutoff` in deterministic batches. Use a
   stable cutoff for the run so late-arriving rows are handled by their actual receive time.
4. Before deleting, create a restricted, encrypted backup artifact. A PostgreSQL custom-format
   `pg_dump` of the research tables is the recommended restore-capable backup; a CSV is an analysis
   export, not a complete relational backup. If the owner requires CSV-only, record that restore of
   constraints/indexes/types cannot be claimed.
5. Verify the backup and export artifacts, then hard-delete expiring raw rows. If verification fails,
   stop deletion and retain the raw rows for the next controlled run.
6. Anonymize retained aggregate identifiers before or during finalization: replace source/device/
   vehicle identifiers with session-scoped aliases, remove free text and personal identity, and
   keep only typed metric summaries. Do not keep precise raw points under a new alias after the
   90-day deadline.
7. Remove any temporary backup, export, Redis research key, local staging file, WAL/archive copy, or
   AOF/RDB artifact that would extend raw retention beyond the approved verification window. A
   temporary backup should be destroyed within **seven days of successful verification** unless the
   owner approves a different documented backup-retention policy.
8. Record counts, hashes, verification outcome, and deletion outcome in the lifecycle run record.
   The job must be idempotent and restart-safe; a failure must not cause a second deletion of newer
   rows or delete `Trip`, `GPSTrack`, `TrackingSource`, or T6 Redis state.

#### Verification checklist

**PostgreSQL**

- Freeze and record the exact cutoff, candidate count, minimum/maximum `received_at`, and a stable
  manifest/hash of candidate IDs or ordered row fingerprints.
- Create the encrypted `pg_dump` (or explicitly labelled CSV-only artifact), record bytes and SHA-256,
  and verify the header/schema/row count for any CSV.
- Restore the dump to `t7-backup-restore-disposable`, run `prisma validate` against the code schema,
  compare counts and ordered fingerprints, sample geometry/timestamp/disposition values, and scan
  restored data for secrets/forbidden fields. Do not restore to an ambient or production database.
- Only after a successful restore verification, delete in batches and verify that no row at or before
  the cutoff remains while a protected recent sample is unchanged.
- Verify aggregates were computed before raw deletion and that no cascade touched canonical
  `gps_tracks`, trips, source registry, route, or vehicle rows.

**Redis**

- Do not treat Redis as a raw backup. Before deletion, inventory only the namespaced `research:*`
  keys with `SCAN`, record type/TTL/count, and ensure no raw research key is created by the new path.
- After deletion, `SCAN` must find no expired research raw/staging keys. T6 keys such as
  `source:last_location:*` and `vehicle:current_location:*` must remain under T6 semantics and must
  not be deleted by the T7 job.
- If a test creates a Redis backup, verify its SHA-256 and restore it only into an isolated Redis
  disposable target; compare key names/types/TTL and confirm that no credentials or raw payloads are
  present. The current floating `redis:alpine` tag must be pinned before this test is run.

**Exports and backup files**

- Verify file size, SHA-256, schema version, fixed header, row count, UTC timestamp parseability,
  deterministic ordering, CSV quoting, and no formula cells or forbidden fields.
- Keep backup/export permissions restricted to the owner-selected roles, encrypt at rest and in
  transit, and never place secrets in the filename, manifest, logs, or response body.
- Confirm deletion of temporary artifacts and check backup/WAL/AOF retention; a successful SQL delete
  alone cannot prove erasure from an older backup.

### 2.6 Explicit analysis of owner choices

The brief accepts the owner choices and does not silently replace them, but records these risks:

1. **No read/export audit logging — high accountability risk.** A compromised Dev/Super Admin token
   can read or export precise historical locations without a user-visible trail. The safer alternative
   is a minimal immutable event record containing actor role, scope, count, timestamp, result, and
   artifact hash while excluding payload data. The owner declined that feature; therefore it remains
   an explicit security exception and a blocker for any broader/multi-operator release.
2. **Unrestricted export bounds — high confidentiality and availability risk.** It conflicts with
   D-004's earlier “bounded export” wording and permits large precise-location extraction, memory/
   disk amplification, long locks, and accidental sharing. The MVP must preserve the owner choice of
   no hard row/time bound, but still enforce role authorization, fixed session/field allowlists,
   streaming/backpressure, limited concurrent exports, statement cancellation, and no arbitrary SQL.
   Safer alternative: bounded session/time defaults plus an explicit break-glass full-export action,
   with the minimal export event record described above.
3. **Aggregates retained until manual deletion — medium/high purpose-drift risk.** Repeated sessions
   can accumulate sensitive route-performance history indefinitely. The owner constraint is retained;
   the safer alternative is a periodic review or fixed aggregate TTL with minimum-cell suppression
   (for example, do not export a group with fewer than 10 valid observations) and a documented owner
   delete decision.
4. **Consent basis — medium evidence gap.** The owner states explicit consent, but the repository has
   no consent record or expiry workflow. Store only a consent-basis/version confirmation, not names or
   consent documents in telemetry, and require the owner to retain the authoritative consent evidence
   outside raw telemetry.
5. **Hybrid anonymization plus hard-delete — requires a precise distinction.** Anonymizing a precise
   raw point does not make it non-sensitive. The safe interpretation is anonymize typed aggregates and
   hard-delete raw points and temporary backups at the deadline.

## 3. Alternatives, MVP rationale, and trade-offs

### Alternative A — PostgreSQL raw + PostgreSQL aggregate, Redis transient (**recommended**)

Pros: preserves T6 authority, supports SQL/PostGIS metrics, typed allowlists, transactionally visible
retention, restore-capable backups, and existing Prisma/PostgreSQL operations. It is additive and
compatible with the current monolith. Cons: deletion/vacuum, spatial query planning, role enforcement,
backup lifecycle, and potential large-row management become explicit responsibilities.

### Alternative B — Redis Stream as the raw research store

Pros: convenient append/read ordering and low-latency ingestion. Cons: current Redis is unpinned and
treated as transient; eviction, restart, persistence mode, TTL, backup, and recovery behavior are not
an evidence-backed research guarantee. It would also duplicate the T6 coordination boundary and make
90-day deletion/export harder to verify. Not recommended.

### Alternative C — Partitioned PostgreSQL or a time-series/external analytics store now

Pros: potentially easier large-window deletion and high-rate scans. Cons: no measured cadence, row
size, query plan, or failure evidence justifies the additional extension/operational dependency;
Prisma partition details require custom SQL and extra rollout risk. Keep the ordinary PostgreSQL MVP,
measure it, and introduce monthly range partitions only when the stated thresholds are exceeded.

### Alternative D — Keep canonical samples only

Pros: lowest implementation and privacy cost. Cons: cannot compare rejected/lower-priority Mobile and
LoRaWAN observations, latency, duplicates, missingness, or pairwise disagreement. It no longer meets
the owner-approved T7 research objective.

### MVP rationale

For approximately 30 devices and 10 vehicles over one-month sessions, a typed, append-only PostgreSQL
boundary is the smallest design that can support the approved research metrics without inventing a
second authority. It supports Mobile and LoRaWAN now and leaves transport-specific allowlisted fields
for future ESP32 without a payload blob. The design deliberately avoids microservices, TimescaleDB,
unbounded history, and public raw-data exposure. It remains a research pilot, not production readiness
or absolute GPS-accuracy evidence.

## 4. Exact Level 3 handoff and acceptance tests

Level 3 may modify only the following repository-relative paths for this T7 implementation. It must
not edit this brief, the Decision Queue, the roadmap, agent instructions, T6 brief, or public canonical
payload semantics.

### Allowed implementation paths

- `shuttle-tracking-backend/prisma/schema.prisma`
- `shuttle-tracking-backend/prisma/migrations/20260729170000_add_t7_research_diagnostics/migration.sql`
- `shuttle-tracking-backend/prisma/seed.js`
- `shuttle-tracking-backend/src/middleware/auth.ts`
- `shuttle-tracking-backend/src/middleware/research-access.ts`
- `shuttle-tracking-backend/src/routes/ingest.route.ts`
- `shuttle-tracking-backend/src/routes/research.route.ts`
- `shuttle-tracking-backend/src/server.ts`
- `shuttle-tracking-backend/src/controllers/research.controller.ts`
- `shuttle-tracking-backend/src/services/tracking.service.ts`
- `shuttle-tracking-backend/src/services/research-diagnostics.service.ts`
- `shuttle-tracking-backend/src/services/research-export.service.ts`
- `shuttle-tracking-backend/src/services/research-retention.service.ts`
- `shuttle-tracking-backend/src/services/research-lifecycle.service.ts`
- `shuttle-tracking-backend/src/config/redis.ts`
- `shuttle-tracking-backend/package.json`
- `shuttle-tracking-backend/tests/test_t7_data_lifecycle.js`
- `shuttle-tracking-backend/tests/test_t7_export.js`
- `shuttle-tracking-backend/tests/test_t7_retention.js`
- `shuttle-tracking-backend/tests/test_t7_backup_verification.js`
- `shuttle-tracking-backend/tests/test_t7_canonical_boundary.js`

### Implementation constraints

1. The migration is additive. Preserve the existing partial active-trip index, all T5 constraints,
   `GPSTrack` semantics, current source ownership, and T6 canonical state/version authority.
2. Add explicit `DEV`/`SUPER_ADMIN` server-side authorization. UI hiding is not authorization. Do not
   expose the raw endpoint through public routes or sender credentials.
3. Pass one backend receive timestamp through the ingest-to-research path; do not use client time as
   the 90-day clock. Keep raw insertion independent of canonical selection and never broadcast a raw
   observation.
4. Keep raw and aggregate tables typed and allowlisted. Use parameterized SQL for PostGIS geometry and
   any custom indexes; never accept table/column/order names directly from a request.
5. Implement backup verification as a fail-closed precondition for deletion. A failed backup, restore,
   hash, count, or Redis-key verification leaves raw rows intact and marks the lifecycle run failed.
6. Treat a full owner-authorized export as a streaming operation even though row/time bounds are not
   imposed. Never buffer the full result set in application memory.
7. Do not run any migration, deployment, reset, backup restore, or destructive deletion during Level 3
   implementation until the disposable target is explicitly approved.

### Required tests

- **Schema/migration:** additive migration review; Prisma validation; existing T5/active-trip partial
  index remains; no cascade from research deletion reaches `Trip`, `GPSTrack`, `Vehicle`, or source
  registry.
- **T6 boundary:** the same input produces the same canonical state/version whether research insert
  succeeds, is delayed, or fails; rejected/lower-priority observations never become canonical merely
  because they are stored; public/realtime responses contain no raw payload or research identifiers.
- **Time:** producer event time may be absent or skewed; `received_at` is always backend-owned and
  retention uses it; UTC serialization and late/future disposition are deterministic.
- **Duplicate/order:** repeated source/sequence or provider message records as duplicate without a
  second valid sample; delayed observations are classified without regressing T6 state.
- **Mobile/TTN boundaries:** Socket.IO and TTN normalized facts carry transport/schema/source binding,
  and no request body, token, header, or arbitrary JSON enters the durable table.
- **Authorization:** rider, sender, ordinary operator, invalid token, revoked/rotated credential,
  `DEV`, and `SUPER_ADMIN` cases; server rejects unauthorized reads/exports with no data enumeration.
- **Query/export:** fixed field allowlist, deterministic ordering, CSV quoting/UTF-8/nulls, formula-
  injection sanitization, forbidden-field scan, streaming/backpressure, disconnect/partial-artifact
  handling, and one concurrent export policy.
- **Retention/deletion:** exact 90-day receive cutoff, Friday/manual trigger, batches, restart and
  idempotency, backup/restore/hash/count precondition, recent-row preservation, aggregate
  anonymization, temporary artifact cleanup, and no T6/canonical cascade.
- **Redis:** `research:*` namespacing/TTL, `SCAN` verification, Redis loss, no raw research source of
  record, and preservation of T6 current-state keys.
- **Failure injection:** PostgreSQL unavailable, Redis unavailable, export storage failure, restore
  mismatch, deletion interrupted, duplicate/out-of-order input, oversized query, and CSV writer
  failure. Each case must emit a redacted operational signal and fail closed where specified.
- **Representative performance:** on the approved disposable target, fixture 30 devices/10 vehicles,
  at least one one-month session, observed cadence, raw/aggregate query shapes, `EXPLAIN (ANALYZE,
  BUFFERS)`, batch-delete duration, and memory/backpressure observations. Record whether partitioning
  is justified; do not assume the upper-bound illustration is measured load.

## 5. Failure modes, compatibility, and rollout risks

| Failure/risk | Required behavior |
|---|---|
| PostgreSQL raw insert fails | Do not alter T6 state; mark the observation/session research-incomplete, emit a redacted signal, and do not count it as a valid research sample. |
| Redis fails | Follow T6 dependency semantics; never reconstruct durable raw evidence from Redis or claim a Redis snapshot is the PostgreSQL research backup. |
| Duplicate/out-of-order input | Preserve an allowlisted disposition and dedupe evidence; never let retention or storage cause a canonical version regression. |
| Backup/restore/hash mismatch | Stop deletion, keep raw rows, mark the lifecycle run failed, and require owner/operator remediation. |
| Deletion job crashes mid-batch | Resume from the stable cutoff; already deleted rows remain deleted, newer rows remain protected, and no cascade is permitted. |
| Indefinite aggregate growth | Keep the owner policy but expose capacity/cleanup signals and request a future aggregate-retention decision before research scope expands. |
| Unrestricted precise export | Stream with strict field/role allowlists and operational concurrency/backpressure; no audit trail exists under the owner choice, so broader release remains unsafe. |
| Schema/migration drift | Use the checked-in additive migration and Prisma migration history; do not hot-edit a target or use `migrate reset`. |
| Existing clients/T6 consumers | Keep existing transport names and canonical payload authority; T7 adds a protected research route and does not add raw fields to public DTOs. |
| Prisma/PostGIS client mismatch | Keep geography operations in reviewed parameterized SQL and test generated client behavior; do not pretend `Unsupported` fields are normal Prisma scalar fields. |
| Floating Redis server image | Pin and record the disposable Redis server image/digest before runtime tests; current repository version evidence covers only the npm client. |

### Rollout and migration order

1. Complete/verify T6 canonical authority first.
2. Apply the additive T7 migration only to the approved disposable target.
3. Run schema, boundary, export, backup/restore, deletion, and representative-volume tests.
4. Enable raw capture behind an explicit research-session flag; do not backfill historical Redis or
   `gps_tracks` rows as if they were raw observations.
5. Finalize aggregates and verify backup before enabling the scheduled/manual deletion job.
6. Promote only after Level 1 validates the evidence and the owner accepts the explicit no-audit-log
   and unrestricted-export risks. No production/public-release claim follows from these tests.

### Disposable target selection

Use a fresh, isolated Compose project named **`t7-disposable`**, never the ambient `shuttle-*` stack.
Use the repository PostGIS image `postgis/postgis:16-3.4-alpine`, pin and record the exact Redis
server image/digest before execution, and use non-ambient ports such as PostgreSQL `15433`, Redis
`16380`, and backend `13002`. Use a separate empty database/volume for
**`t7-backup-restore-disposable`** when verifying backup restoration. The target is selected for
handoff only; this brief does not run migrations, deploy services, create volumes, or restore data.

## 6. Open owner questions and proposed safer alternatives

These are not pause gates for this brief because the owner explicitly delegated the decision analysis:

1. Will the owner accept a seven-day maximum for temporary raw backup artifacts, including WAL/AOF/
   RDB copies, or specify a different approved backup-retention window?
2. Will the owner later approve minimal read/export event metadata despite the current no-audit choice?
3. Should aggregate retention remain manual-delete indefinitely, or should a future decision add a
   fixed TTL/minimum-cell suppression policy?
4. Before any research result is published, who verifies consent-basis version and the validity of
   source/vehicle aliases without storing employee identity in telemetry?
5. What exact Mobile/TTN producer sequence/message identifier and payload schema version will field
   adapters provide? Until observed, missing sequence/provider guarantees remain unverified.

## 7. Evidence class, date, confidence, and validation plan

### Evidence classification

| Evidence | Class | Date | Confidence | Limitation |
|---|---|---:|---|---|
| Current source/schema/migrations/audits | Validated repository evidence | 2026-07-29 review of current worktree and prior validated baseline `847a18cce9bc27c82b2622dbc176b3a89bc4d037` | High for current data flow and missing capabilities | No live target/query plan/backup restore was run in this consultation. |
| Owner answers | Owner-controlled requirement | 2026-07-29 | High as a product constraint | Consent evidence, role assignments, and operational backup policy were not independently inspected. |
| Mobile/LoRaWAN provider/device behavior | Unverified field evidence | 2026-07-29 | Low | No Android device, firmware, TTN account, gateway, provider delivery trace, synchronized clock, or ground truth was observed. |
| PostgreSQL/Prisma/Redis/security documentation | Current primary external source | 2026-07-29 | High for documented feature semantics; medium for this deployment until versions are pinned | Redis server tag is floating; PostGIS/runtime extensions and production topology were not observed. |

### Current primary sources consulted

| Source/version | URL | Access date | Evidence class | Confidence/use |
|---|---|---:|---|---|
| PostgreSQL 16.14 documentation, date/time types | https://www.postgresql.org/docs/16/datatype-datetime.html | 2026-07-29 | Official primary documentation | High: new T7 timestamps should be timezone-aware; PostgreSQL stores timezone-aware values internally as UTC. |
| PostgreSQL 16.14 documentation, `EXPLAIN` | https://www.postgresql.org/docs/16/sql-explain.html | 2026-07-29 | Official primary documentation | High: representative plans and actual row/time evidence are required before index/partition claims. |
| PostgreSQL 16.14 documentation, multicolumn indexes | https://www.postgresql.org/docs/16/indexes-multicolumn.html | 2026-07-29 | Official primary documentation | High: leading-column query shapes justify the proposed session/source/vehicle indexes. |
| PostgreSQL 16.14 documentation, SQL dump/restore | https://www.postgresql.org/docs/16/backup-dump.html | 2026-07-29 | Official primary documentation | High: `pg_dump` is the restore-capable backup recommendation; CSV alone is not a relational backup. |
| PostgreSQL 16.14 documentation, table partitioning | https://www.postgresql.org/docs/16/ddl-partitioning.html | 2026-07-29 | Official primary documentation | High: partitioning is a measured scale/deletion option, not an unverified default. |
| Prisma ORM 7.3.0 schema reference, `Unsupported` | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#unsupported | 2026-07-29 | Official primary documentation | High: geography fields represented as `Unsupported` are not generated-client scalar fields. |
| Prisma ORM database features | https://www.prisma.io/docs/orm/reference/database-features | 2026-07-29 | Official primary documentation | High: custom PostgreSQL features/indexes may require SQL migration review. |
| Prisma ORM migration patching/hotfixing | https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing | 2026-07-29 | Official primary documentation | High: keep migration history and schema synchronized; do not apply untracked target edits. |
| Redis command `EXPIRE` | https://redis.io/docs/latest/commands/expire/ | 2026-07-29 | Official primary documentation; command semantics available since Redis 1.0.0 | High for TTL behavior; actual server version is not pinned in Compose. |
| Redis persistence | https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/ | 2026-07-29 | Official primary documentation | High: Redis RDB/AOF persistence has explicit durability trade-offs and cannot replace PostgreSQL research backup without restore evidence. |
| Redis data types/Streams | https://redis.io/docs/latest/develop/data-types/streams/ | 2026-07-29 | Official primary documentation | High: Streams are append-only structures, but their operational durability/retention still requires a measured deployment contract. |
| OWASP CSV Injection, current web guidance (no numbered version published) | https://owasp.org/www-community/attacks/CSV_Injection | 2026-07-29 | OWASP primary security guidance | High: CSV formula-injection handling is required for spreadsheet-facing exports. |
| OWASP Logging Cheat Sheet, current web guidance (no numbered version published) | https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html | 2026-07-29 | OWASP primary security guidance | High: sensitive data minimization and protection of security-relevant logs support the risk analysis of declined export audit logging. |

### Validation plan

Level 3 must execute the handoff only after explicit disposable-target approval. Validation consists of
the exact migration/schema tests, T6 authority tests, role/field/export tests, backup restore and
hash/count verification, Redis key/TTL verification, retention/deletion failure injection, and
representative-volume `EXPLAIN (ANALYZE, BUFFERS)` listed above. Then run the repository-required
implementation checks, including `bash scripts/ci-checks.sh`, and hand the immutable evidence back to
Level 1 for audit/roadmap synchronization. T7 itself does not mark an audit complete or edit shared
state.
