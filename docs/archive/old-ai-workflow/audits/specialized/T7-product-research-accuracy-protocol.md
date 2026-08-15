# Level 2 Specialist Decision Brief — T7 Product/Research Accuracy Protocol

Status: **Immutable v1 — binding for the focused question below**
Task/audit ID: **T7**
Decision date: **2026-07-29**
Primary playbook: `.agents/skills/tram-specialist-consultation/references/product-research-design.md`
Supporting playbook: `.agents/skills/tram-specialist-consultation/references/telemetry-geospatial-analysis.md`

This brief answers one question: for the first T7 research campaign using Android Mobile and
LoRaWAN through TTN, what is the smallest reproducible protocol and metric/accuracy contract that
does not claim absolute GPS accuracy, device/network latency, or an overall winner beyond the
available evidence?

If the focused question or an owner decision changes the contract, create
`T7-product-research-accuracy-protocol-v2.md` and link this file as superseded. Do not edit this
file in place.

## 1. Trigger and current repository evidence

T7 is the Phase 2 implementation of D-002=B bounded raw diagnostics. The roadmap says T7 depends
on T3, the accepted T6 canonical contract, and documented retention/deletion parameters; its raw
contract must preserve source/vehicle/trip/experiment identity, event/receive times, sequence and
transport facts, reported accuracy, validation outcome, and canonical-selection disposition.

| Evidence | Current fact used by this brief |
|---|---|
| `docs/roadmap/master-refactoring-roadmap.md:524-590` | T7 is pending; it must add raw observations separate from canonical state and must not make raw retention alter canonical selection. |
| `docs/decision-queue.md:D-002,D-004` | Bounded raw diagnostics are approved; the approved comparison boundary is Mobile/Socket.IO, ESP32/HTTP, and LoRaWAN/TTN/Webhook, with separate metrics and no route-distance-as-absolute-accuracy claim. |
| `docs/research/device-comparison-scope.md` | Route-conformance distance, reported accuracy, pairwise disagreement, and ground-truth error have distinct meanings; raw points must not be silently map-snapped. |
| `docs/research/T7-owner-input-questionnaire.md` | T7 starts with Android Mobile and TTN LoRaWAN; raw retention is 90 days from backend receive time; the campaign is approximately one month, about 30 devices/10 vehicles/3 devices per vehicle, and metrics are compared separately with no overall winner. |
| `docs/audits/database-audit.md:16-18,33-39,72-89` | `gps_tracks` is sampled canonical history, not a raw research ledger. Missing fields include producer/receive/process/selection times, sequence, disposition, experiment/session, reported accuracy, route version, and research access/retention model. |
| `docs/audits/backend-audit.md` | Current transports converge on observation processing, but current observations lack producer time, sequence, idempotency, payload version, experiment/session identity, and durable raw disposition. |
| `docs/audits/architecture-audit.md` | Raw diagnostics must remain separate from canonical state and must not become a second public truth source. |
| `docs/audits/dashboard-ux-audit.md` | The research surface is separate from the public tracker and needs truthful freshness, metric definitions, filters, and bounded/redacted export. |
| `docs/audits/production-readiness-audit.md` | Physical/provider behavior, deployment, backups, and public/production readiness are not proven by repository code; T7 remains a controlled research handoff. |
| `docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md:2.1-3.2` | T6 distinguishes `observedAt`, `receivedAt`, and `selectedAt`; server receive time is the freshness clock, while T7 owns raw disposition and event-time semantics. |
| `shuttle-tracking-backend/src/services/tracking.service.ts` | The current `ObservationData` has no producer event time or sequence. The cached observation timestamp is created by backend `Date.now()`, and canonical history is sampled at approximately 60 seconds. |
| `shuttle-tracking-backend/prisma/schema.prisma` | `GPSTrack` stores sampled canonical location and backend-derived `recordedAt`; `TrackingSource.type` already admits `mobile`, `lorawan`, `esp32`, and `simulator`; `User` has no role field. |
| `shuttle-tracking-backend/package.json` | Repository versions include Prisma/`@prisma/client` `^7.3.0`, Socket.IO `^4.8.3`, Redis `^6.0.0`, and TypeScript `^5.9.3`; the repository does not pin a PostGIS server version or Android/TTN runtime. |

The repository therefore supports a common source envelope and source registry, but it does not
yet provide evidence for physical accuracy, gateway coverage, TTN retry behavior in the deployed
application, clock synchronization, device mounting, firmware/codec versions, or a ground-truth
reference.

## 2. Recommended decision

Bind T7 to a **two-treatment research protocol**:

1. `sourceType=mobile`: Android phone location observations sent through the existing authenticated
   Mobile/Socket.IO boundary.
2. `sourceType=lorawan`: a LoRaWAN location device sent through TTN and the authenticated webhook
   boundary.

Use one versioned `ResearchObservationV1` envelope for both adapters. Keep source-specific details
inside typed, allowlisted metadata rather than creating separate metric meanings. `esp32` remains a
valid future `sourceType` and schema value, but no ESP32 device, result, latency, accuracy, or
winner is included in this T7 conclusion. Simulators remain pipeline controls, not physical
research evidence.

The campaign is an approximately one-month session containing explicit route runs. Before the
first run, freeze an `experimentId`, `routeGeometryVersion`, declared cadence per source/device,
device/source assignment, payload/schema versions, mounting/power notes, and the analysis-definition
version. Each run receives a `runId`, start/end time, vehicle, route, active source IDs, route
conditions, operator notes, exclusions, and validity status.

### Minimum repeatable run protocol

- Where physically possible, run the Mobile and LoRaWAN sources on the same vehicle and route in the
  same time window, with mounting and power notes recorded. If runs are not simultaneous or not on
  the same vehicle/route, mark them non-paired; do not manufacture pairwise matches.
- Treat each complete route loop or predeclared route segment as a run. Record moving and stationary
  segments separately; a stationary segment is a repeatability/control segment, not a surveyed
  checkpoint and not ground truth.
- Preserve every accepted, rejected, duplicate, late, and invalid observation disposition in the raw
  ledger. Never delete an observation merely because it is excluded from a derived metric.
- Match pairwise observations only when they share vehicle, experiment, route geometry version, and
  segment and their selected alignment timestamps differ by at most a configurable
  `pairingWindowMs`; use **5,000 ms as the MVP default** and report the window in every result.
- Exclude depots, intentional detours, route geometry defects, and other predeclared exclusions
  from route-conformance summaries. Retain the raw coordinates and exclusion reason. Do not map-snap
  a point before storing it or before calculating a metric.
- Start with the recommended stability floor of **three valid runs per `sourceType × vehicle`**.
  This is a repeatability floor, not a statistical sample-size claim and not a winner rule. Continue
  the owner's iterative campaign until the stability criteria below are met or the report explicitly
  states that they were not met.

### Validity and stability criteria

These are recommended acceptance criteria that Level 3 should encode as configurable protocol
parameters, not hidden constants:

- A valid run has a declared cadence, complete identity/route metadata, and at least 99% of accepted
  rows containing valid coordinates, `sourceType`, `vehicleId`, `runId`, and `backendReceiveTime`.
  Expected slots are computed from the declared cadence; received, rejected, duplicate, late, and
  missing slots must all be counted.
- A metric is reportable only when its denominator is disclosed. Use at least 100 accepted
  observations for a per-source run summary and at least 30 matched pairs for a pairwise summary;
  otherwise report `insufficient_evidence`, not zero.
- After three valid runs, call a source/vehicle metric **stable** only when the newest two valid-run
  summaries remain within 20% relative change for p50 and p95 (or within the predeclared absolute
  floor when the baseline is near zero), and missingness changes by no more than 5 percentage points.
  Report the per-run values and counts; do not pool away instability.
- These criteria assess data usability and repeatability. They do not establish an accuracy
  threshold, rank source types, or authorize an overall score.

## 3. Time and latency contract

Every timestamp is UTC/RFC 3339 when represented as a wall-clock timestamp, with an explicit source
and clock-quality field. Store a monotonic source timestamp only with its clock domain; never compare
Android boot-relative monotonic values across devices or across reboot cycles.

| Field/time | Binding meaning | Permitted calculation |
|---|---|---|
| `producerEventTime` | Source-reported time at which the location fix or payload event was produced. For Android this may be the `Location` epoch time; for LoRaWAN it is present only when the device payload/codec defines it. | Within-source event-time intervals only when `producerClockStatus` supports that use. |
| `producerMonotonicTime` | Optional source-local monotonic reading, such as Android elapsed realtime, plus `producerClockId`/boot identity. | Order and cadence within one device boot; never cross-device or cross-boot latency. |
| `providerReceiveTime` | Optional provider-side time, such as a TTN Application Server or Network Server receive timestamp, with its documented provider field path. | A provider-to-backend **observed timestamp difference** only when both clock domains and field semantics are validated. |
| `backendReceiveTime` | Server time captured at the application ingestion boundary. This is the authoritative T7 freshness/arrival clock. | Availability, arrival cadence/jitter, missingness, duplicate/reject/late disposition, and source-to-source matching when explicitly labelled arrival-aligned. |
| `processTime` | Server time after decode, validation, and raw disposition decision. | `processDurationMs = processTime - backendReceiveTime` only within the same server clock and trace. |
| `selectedTime` | Server time when canonical selection/publication accepts the observation. | `selectionDelayMs = selectedTime - processTime`; this is selection processing, not device/network latency. |
| `displayTime` | Optional client presentation event time, kept separate from the raw source ledger. | A client-observed rendering interval only with a client-local monotonic trace; never presented as source or network latency. |

The owner-requested comparison is stored as:

`observedTimestampDifferenceMs = backendReceiveTime - producerEventTime`

with `clockBasis = unverified` and `latencyClaim = prohibited` for the initial campaign. If the
producer time is absent, malformed, or not known to be a comparable UTC wall clock, the derived value
is `null` and the reason is recorded. A negative value is retained as an observed clock/data-quality
signal, not clamped or relabelled as a fast network.

The report may use terms such as **backend arrival interval**, **server processing duration**, and
**canonical selection delay**. It must not call `observedTimestampDifferenceMs` device latency,
network latency, end-to-end latency, or TTN radio latency until a clock synchronization protocol,
offset estimate, uncertainty bound, timestamp provenance, and field validation have passed.

## 4. Metric and accuracy contract

All metric output carries `metricDefinitionVersion`, `experimentId`, `runId`/aggregation scope,
`sourceType`, sample count, missing count, excluded count, and confidence/uncertainty notes. Report
p50, p95, and p99 where the denominator supports them; include distributions or per-run summaries
for metrics with small samples.

| Metric | Definition and minimum fields | What it may and may not claim |
|---|---|---|
| Availability / missingness | `receivedExpectedSlots / expectedSlots`, with declared cadence, run duration, received, rejected, duplicate, late, and missing counts. | Delivery to this backend during this campaign; not radio coverage or device uptime unless separately observed. |
| Arrival cadence / jitter | Intervals between ordered observations from one source. Prefer source-local monotonic time within one device boot; otherwise use backend receive intervals and label the basis. Jitter is the distribution of deviation from the declared cadence. | Update behavior at the selected clock boundary; not source fix cadence or network latency when receive time is used. |
| Acceptance / rejection / duplicate / late rate | Counts by `validationOutcome`, `duplicateOf`, `lateReason`, and `rejectReason`, divided by all observed input attempts where available. | Pipeline quality and disposition transparency; not physical measurement quality. |
| Observed timestamp difference | `backendReceiveTime - producerEventTime`, with clock basis, null reason, and clock-quality fields. | An observed difference subject to clock offset and timestamp semantics; never true latency in the initial T7 campaign. |
| Route-conformance distance | Shortest geodesic distance from the raw observation to the versioned expected route geometry, in meters, using one documented PostGIS geography method. Compute only on included route segments and retain raw points. | A route-conformance proxy. It is not absolute GPS error because route geometry, detours, lane position, and map error remain. |
| Pairwise disagreement | Distance between two approximately time-aligned raw observations for the same vehicle/segment, with source pair, pairing window, alignment basis, match count, and unmatched count. | Disagreement between sources. It cannot identify which source is correct. |
| Reported accuracy | Preserve `reportedAccuracyValue`, `reportedAccuracyUnit`, `reportedAccuracyKind`, `reportedAccuracySource`, and original field path. Android horizontal accuracy is an uncertainty estimate; a LoRa value is comparable only if the codec declares the same semantics and units. | Device/provider-reported uncertainty. It is not measured error and is not a basis for a winner. HDOP must remain dimensionless and must not be stored as meters. |
| Canonical selection share | Count of `canonicalDisposition=selected` versus eligible accepted observations, by source and vehicle. | The current T6 priority/selection behavior; not source accuracy or quality. |
| Ground-truth error | `null` for this T7 campaign; no surveyed checkpoint or high-precision synchronized reference is available. | No absolute accuracy claim. If reference evidence is added later, require reference method/version, reference event time, clock quality, and `groundTruthErrorM` before reporting it. |

No metric in this brief is combined into an overall score or winner. A report compares each metric
separately and states trade-offs, missingness, uncertainty, and validity limitations.

## 5. Minimum `ResearchObservationV1` contract

The following is the binding field vocabulary for Level 3. Nullable fields are intentional and must
carry a null/reason code where absence affects interpretation.

### Common identity, experiment, and source fields

`observationId`, `experimentId`, `sessionId`, `runId`, `vehicleId`, nullable `tripId`, internal
`sourceId`, `sourceType`, `sourceUnitKey`, `routeId`, `routeGeometryVersion`, nullable `segmentId`,
`metricDefinitionVersion`, `transport`, `payloadSchemaVersion`, `deviceModel`, `deviceOsOrAppVersion`,
`firmwareVersion`, `codecVersion`, `mountingProfile`, `powerProfile`, and sanitized `fieldNotes`.

`sourceType` is an enum-backed value with `mobile` and `lorawan` active in T7. Keep `esp32` and
`simulator` schema-compatible for future adapters; their presence in a schema or fixture is not
physical evidence. Use stable internal IDs for joins and export a role-scoped pseudonymous
`sourceUnitKey`, not credential material or a raw provider/device identifier.

### Observation, timing, and ordering fields

`latitude`, `longitude`, nullable `speedMps`, nullable `headingDeg`, nullable
`producerEventTime`, `producerEventTimeKind`, nullable `producerMonotonicTime`, nullable
`producerClockId`, `producerClockStatus`, nullable `providerReceiveTime`, nullable
`providerNetworkReceiveTime`, `backendReceiveTime`, `processTime`, nullable `selectedTime`,
nullable `sourceSequence`, `sourceSequenceKind`, `traceId`, and `clockUncertaintyMs`/`clockOffsetMs`
when actually measured. `displayTime` belongs to an optional client trace, not to the source event
contract.

Recommended sequence kinds are `android_monotonic`, `ttn_f_cnt`, `device_payload`, and `none`.
Android elapsed-realtime values are useful for one device/boot only. TTN `f_cnt` and provider
correlation identifiers should be captured only as allowlisted, non-secret facts and should not be
assumed to be a universal cross-source ordering key.

### Disposition, quality, and provider metadata

`validationOutcome` (`accepted`, `rejected`, `duplicate`, `late`, `invalid`), nullable
`duplicateOf`, nullable `rejectReason`, nullable `lateReason`, `canonicalDisposition`
(`selected`, `fallback`, `eligible_not_selected`, `rejected`, `not_evaluated`), nullable
`reportedAccuracyValue`, nullable `reportedAccuracyUnit`, nullable `reportedAccuracyKind`,
`reportedAccuracySource`, `observedTimestampDifferenceMs`, `clockBasis`, `latencyClaim`,
`routeConformanceStatus`, nullable `routeConformanceDistanceM`, nullable `pairMatchId`, nullable
`pairingWindowMs`, nullable `pairwiseDisagreementM`, `ttnFramePort`, `ttnFrameCounter`, gateway
count, RSSI/SNR summaries, and a provider metadata allowlist version.

Do not persist credentials, secrets, raw webhook authorization headers, raw payloads, driver names,
usernames, IP addresses, or unrestricted provider identifiers in the research response. The raw
ledger may retain the internal `sourceId` needed for analysis during the 90-day window; role-scoped
CSV export should use a stable pseudonym and omit credential/provider identity fields.

## 6. Accuracy and comparison boundaries

The following labels are mandatory in schema, query, chart, and CSV column definitions:

- **Route-conformance distance**: point-to-versioned-route distance. Keep it as a proxy and report
  route version, included/excluded geometry, coordinate count, and percentile distribution.
- **Pairwise disagreement**: source-to-source distance after declared time matching. Keep both raw
  points and report unmatched/matched counts. Do not call the lower value “more accurate.”
- **Reported accuracy**: the source/provider's own uncertainty field with its original semantic kind
  and unit. Do not compare meters with HDOP or treat the field as validation.
- **Ground-truth error**: distance to a surveyed checkpoint or higher-quality synchronized reference.
  This remains unavailable and null in T7.

No map snapping, route projection, nearest-stop substitution, smoothing, or canonical-source
replacement may occur before raw route or pairwise calculations. Any later visualization may show a
derived route overlay, but it must not overwrite the observation or imply a reference point.

## 7. Retention, access, and export constraints carried into this protocol

- Raw observations are retained for 90 days from `backendReceiveTime`. The Level 3 retention job
  must use that field, not producer time, selected time, or client display time.
- Derived aggregates are retained until Super Admin/Dev manual deletion under the owner answer. The
  implementation must make aggregate definition version, source scope, and deletion status visible;
  indefinite manual retention must not be described as an automatic retention guarantee.
- The allowed audience is Dev/Super Admin through a protected research surface. The current Prisma
  `User` model has no role field, so the role boundary cannot be enforced by UI visibility alone.
- Owner answers specify CSV-only export, unrestricted row/time bounds, and no read/export audit log.
  This conflicts with D-004 and the roadmap, which require bounded, redacted export and server-side
  query/export bounds. This brief does not silently merge the two choices: Level 1/owner must decide
  whether the newer owner answer supersedes the approved bounded-export constraint. Recommended
  resolution: preserve CSV-only, require an explicit experiment/session and route/time scope, stream
  large results with query/runtime protection, keep server authorization, and retain no raw secrets;
  do not expose an unrestricted public or ordinary-operations endpoint. If literal unrestricted
  export is retained, record the accepted operational/privacy risk before implementation.
- Before raw deletion, produce a deterministic verification manifest containing the scoped count and
  min/max `backendReceiveTime` for PostgreSQL raw rows, Redis keys/caches, export artifacts, and
  backups. Verify that post-delete counts and key scans match the manifest. The backup retention and
  destruction schedule is not supplied; deletion cannot be called complete while an undeclared raw
  backup remains accessible.

## 8. Alternatives and trade-offs

### A — Recommended MVP: common envelope, receive-time metrics, two active adapters

This is the smallest design compatible with the owner constraints. It preserves raw evidence without
making canonical state a research store, supports Mobile and TTN immediately, keeps future ESP32
extensible, and reports usable proxies and pipeline metrics honestly. Its cost is that source-time
differences remain unverified and absolute accuracy is unavailable.

### B — Synchronized clocks plus reference receiver

Add a documented NTP/PTP or equivalent synchronization procedure with offset/uncertainty logs, and a
surveyed checkpoint or higher-quality synchronized reference receiver. This would make calibrated
latency and ground-truth error possible, but neither the synchronization evidence nor the physical
reference exists now. It is a future validity upgrade, not a T7 precondition.

### C — Provider-timestamp comparison only

Use TTN Application Server/Network Server/gateway timestamps and webhook arrival times. This can
explain provider stages and is useful as observed provider timing, but without validated clock
domains and deployed field evidence it remains a timestamp-difference report, not end-to-end radio or
device latency. Keep the fields; do not upgrade the label.

### D — Canonical history only or one overall score

Canonical sampled history cannot explain rejected/non-selected observations, while a weighted score
would hide owner trade-offs and require approved weights. Both are rejected for this question.

### E — Activate ESP32 now

This would align with the eventual D-004 three-source scope but conflicts with the owner constraint
that no ESP32 is active. Keep the schema/adapter extension point and make no ESP32 result claim.

## 9. Exact Level 3 handoff and tests

Level 3 must first create the authoritative task specification at
`docs/tasks/T7-raw-research-observations.md`; that file must repeat the allowlist below before any
worker delegation. This Level 2 brief authorizes no code, schema, migration, queue, or roadmap edit.

### Exact proposed write allowlist

- `shuttle-tracking-backend/prisma/schema.prisma` — additive `ResearchObservationV1` raw model,
  aggregate-definition/version model if required, explicit indexes for `(experiment_id, run_id,
  backend_receive_time)`, source/time and vehicle/time reads, and no destructive changes to
  `GPSTrack`/`TrackingSource`.
- `shuttle-tracking-backend/prisma/migrations/20260729120000_t7_raw_research_observations/migration.sql`
  — additive migration only; preserve existing constraints and include a reversible/disposable-target
  verification plan. Do not run it against a non-approved target.
- `shuttle-tracking-backend/src/services/tracking.service.ts` — pass producer time, sequence,
  transport, and disposition facts into the raw boundary without changing T6 canonical selection
  semantics.
- `shuttle-tracking-backend/src/services/research-observations.service.ts` — validate and append the
  common envelope, calculate server-local process/selection timings, record dispositions, and keep
  raw storage separate from canonical publication.
- `shuttle-tracking-backend/src/services/research-metrics.service.ts` — versioned metric queries for
  arrival cadence/jitter, availability, delivery disposition, observed timestamp difference,
  route-conformance, pairwise disagreement, reported accuracy, and canonical selection share; emit
  null/`insufficient_evidence` rather than invented values.
- `shuttle-tracking-backend/src/services/research-retention.service.ts` — 90-day raw deletion based
  on `backendReceiveTime`, aggregate manual-delete handling, and the PostgreSQL/Redis/export/backup
  verification manifest. Do not claim backup destruction until its policy is configured.
- `shuttle-tracking-backend/src/routes/research.route.ts` and
  `shuttle-tracking-backend/src/controllers/research.controller.ts` — protected Dev/Super Admin
  reads and CSV export with server-side field allowlisting; do not create a public research route.
- `shuttle-tracking-backend/src/middleware/auth.ts` — enforce the chosen role boundary at the server
  boundary, or fail the task with an explicit owner decision if the current identity model cannot
  represent Dev/Super Admin roles safely.
- `shuttle-tracking-backend/tests/test_t7_research_contract.js` — common-envelope and source-type
  tests for Mobile and LoRaWAN, nullable producer/provider fields, source metadata allowlist, and
  future `esp32` schema compatibility without physical evidence.
- `shuttle-tracking-backend/tests/test_t7_metrics.js` — deterministic fixtures for all metric
  formulas, time-field labels, route exclusions, no-snap behavior, pair matching, insufficient
  evidence, and no-overall-winner output.
- `shuttle-tracking-backend/tests/test_t7_retention.js` — receive-time 90-day boundary, manual
  aggregate deletion, idempotent deletion, Redis/CSV/backup manifest verification, and no-secret
  export assertions.
- `shuttle-tracking-backend/tests/fixtures/t7-mobile-lorawan.json` — redacted, versioned fixtures
  containing Mobile and TTN-shaped observations; no live provider/device claim.

### Required checks

1. A Mobile observation with Android epoch time and Android monotonic time stores both with their
   clock domains; a LoRaWAN observation with TTN frame counter/provider fields stores them without
   treating any of them as universal cross-source order.
2. Missing or untrusted producer time yields null `observedTimestampDifferenceMs` or the explicit
   `clockBasis=unverified` label; no response field is named `deviceLatency` or `networkLatency`.
3. `processDurationMs` and `selectionDelayMs` use server-local timestamps only; `displayTime` is
   never used for backend freshness or source comparison.
4. Duplicate, late, rejected, and missing observations remain countable and do not mutate canonical
   state merely because raw diagnostics are retained.
5. Route-conformance uses versioned raw coordinates and a documented geography distance method;
   tests fail if a raw point is replaced by a snapped point. Pairwise results include the matching
   window, matched/unmatched counts, and both source identities.
6. Ground-truth error is null and absolute-accuracy charts/exports are unavailable unless a future
   reference-evidence contract is explicitly supplied.
7. Three valid runs per source type/vehicle can be summarized independently; stability is reported
   per metric and never converted into a winner.
8. Research reads/export require the selected server role and cannot return credentials, raw webhook
   authorization, raw payloads, driver/user identity, IP address, or unrestricted provider IDs.
9. Run `bash scripts/ci-checks.sh` and the T7 tests before completing Level 3. Any migration or
   retention run must target only an explicitly approved disposable database/Redis target.

## 10. Failure modes and rollout risks

| Failure/risk | Required handling |
|---|---|
| Android wall clock changes or differs across devices | Keep producer wall time as unverified; use elapsed realtime only within one device/boot; report receive-based cadence separately. |
| TTN webhook retry, buffering, duplicate, or reordering | Preserve provider fields, frame counter/correlation facts, backend receive time, and disposition; never infer radio loss from a missing webhook alone. Validate deployed webhook behavior in field tests. |
| Different Mobile and LoRaWAN cadences | Declare cadence per source/device, analyze each source separately, and only pair within the recorded window. |
| Route geometry, lane position, detour, depot, or map defect | Version geometry, predeclare exclusions, preserve raw points, and label route distance as a proxy. |
| No surveyed/high-quality reference | Keep `groundTruthErrorM=null`; do not use route distance, pairwise disagreement, or reported accuracy as a substitute. |
| Source assignment/mounting/power changes during the month | Start a new run or configuration version and record the change; do not pool across uncontrolled treatments silently. |
| Raw data changes canonical state or public map truth | Use a separate append-only research boundary and test that raw retention has no publication side effect. |
| User model cannot enforce Dev/Super Admin roles | Do not rely on a hidden UI; stop the research read/export implementation at the authorization boundary and return the owner decision. |
| Unrestricted CSV export and no read/export audit log | Surface the D-004 conflict; require the owner resolution and field allowlist before release. |
| Backup contains deleted raw data | Treat deletion as incomplete until backup retention/destruction is verified and recorded. |
| Future ESP32 appears in schema/fixtures | Treat it as extensibility/control only; no field or report may imply an ESP32 physical result. |

Rollout is controlled research only. It does not upgrade the repository's production determination,
does not authorize public historical research reads, and does not authorize absolute accuracy,
device/network latency, radio coverage, battery, or source-winner claims.

## 11. Owner questions and proposed resolutions

These questions are returned to Level 1/owner control; this brief does not edit
`docs/decision-queue.md`.

1. **Export conflict:** does the 2026-07-29 owner answer (CSV-only, unrestricted bounds, no
   read/export audit log) supersede D-004/roadmap bounded, redacted, server-limited export?
   Recommended: keep server authorization, explicit experiment/session/time scope, streaming/query
   protection, and redacted fields even if a row limit is not selected.
2. **Run definition:** accept the recommended three valid runs per `sourceType × vehicle`, 5-second
   pair window, 100 accepted observations per run, and 30 matched-pair reporting floor as stability
   criteria rather than a winner sample size? These values are tunable protocol parameters, not
   blockers to starting data collection.
3. **Clock upgrade:** is the owner willing to add and document NTP or another synchronization method
   plus offset/uncertainty evidence later? Until then, keep timestamp differences unverified.
4. **Reference upgrade:** should a future campaign add surveyed checkpoints or a high-quality
   synchronized reference receiver? Until then, `groundTruthErrorM` remains null.
5. **Backup deletion:** what backup retention/destruction schedule makes the 90-day raw deletion
   verifiable? Without it, the system can verify primary-store deletion only, not complete erasure.
6. **Deployment facts to capture before field runs:** exact Android models/OS/app version, LoRaWAN
   device model/firmware, TTN application/device identifiers, codec/payload version, gateway/region,
   mounting/power arrangement, route geometry version, and declared cadence. These are required
   metadata, but their physical/provider values remain unverified until observed in the field.

The absence of fixed sample size, ground truth, and clock synchronization does not pause this
protocol. It limits the labels and makes the proposed stability/acceptance criteria mandatory.

## 12. Evidence class, research record, confidence, and validation plan

Evidence classes used here are **R** repository evidence, **O** owner constraint, **P** primary
source/standard, **F** field/provider evidence not yet observed, and **I** specialist inference or
recommendation. Access/review date for this brief and all external sources: **2026-07-29**.

### External primary-source register

| Source and URL | Version/date | Class | Confidence and use |
|---|---|---|---|
| Android `Location` API reference — https://developer.android.com/reference/android/location/Location | Current Android API reference accessed 2026-07-29; `getElapsedRealtimeNanos()` API 17+, `getElapsedRealtimeMillis()`/age APIs API 33+, `getTime()`/accuracy semantics documented on page | P | **High** for API semantics: elapsed realtime is monotonic but device/boot-local; epoch time may come from a clock that is not comparable or monotonic. **Low** for the project's actual Android devices until field capture. |
| The Things Stack Webhooks — https://www.thethingsindustries.com/docs/integrations/webhooks/ | Current The Things Stack documentation accessed 2026-07-29; deployed stack version unverified | P/F boundary | **High** for the documented webhook boundary and existence of uplink timestamps/metadata; **Low** for deployed retry, gateway, codec, and delivery behavior until TTN configuration and field evidence are inspected. |
| The Things Stack Data Formats — https://www.thethingsindustries.com/docs/integrations/data-formats/ | Current documentation accessed 2026-07-29; examples document Application Server, Network Server, gateway timestamps, frame counter, RSSI, and SNR; deployed version unverified | P/F boundary | **High** for field meanings in the documented format; **Low** for assuming every field is present or semantically identical in this project's webhook. |
| RFC 5905, Network Time Protocol v4 — https://www.rfc-editor.org/rfc/rfc5905 | Standards Track, June 2010; accessed 2026-07-29 | P | **High** for the distinction between clock offset, delay, dispersion, and jitter and for requiring synchronization evidence before treating wall-clock differences as latency. It does not prove any project host/device is synchronized. |
| PostGIS `ST_Distance` — https://postgis.net/docs/ST_Distance.html | Current PostGIS documentation accessed 2026-07-29; repository does not pin the PostGIS server version | P/R boundary | **High** for documenting geography distance in meters and the spheroid option; **Medium** for implementation compatibility until the approved disposable target reports its PostGIS version. |

### Repository/owner evidence and confidence

- **High:** the T7 scope, owner constraints, D-002/D-004 decision boundaries, T6 timing vocabulary,
  current Prisma models, and current `tracking.service.ts` behavior are directly inspectable in the
  paths listed in Section 1.
- **Medium:** the proposed additive indexes, retention verification, pair matching, and stability
  floors are implementation recommendations that need disposable-target and fixture tests.
- **Low/unverified:** physical Android GPS behavior, device mounting/power, LoRaWAN radio/gateway
  coverage, TTN deployment/retries, codec event-time meaning, clock synchronization, route geometry
  fidelity, and any absolute accuracy or latency value.

### Validation plan

1. Level 3 validates the common envelope and metric formulas with deterministic Mobile/TTN-shaped
   fixtures, then runs repository CI and T7 contract tests.
2. Level 3 validates the additive migration, indexes, retention boundary, deletion manifest, and
   authorization only against an explicitly approved disposable PostgreSQL/Redis target.
3. A supervised field campaign records the required device/provider/configuration metadata, runs the
   repeated route protocol for approximately one month, and reports per-run counts, missingness,
   route-conformance proxies, pairwise disagreement, reported accuracy, and observed timestamp
   differences with their clock labels.
4. A later validity upgrade may add synchronized clocks or a reference receiver. Until that upgrade,
   the final T7 report must keep `groundTruthErrorM` null, use no absolute-accuracy language, avoid
   device/network latency language, and present no overall winner.

Level 2 ownership ends with this immutable brief. Level 1 validates the owner conflict/decision
points; Level 3 owns the exact task spec, bounded implementation, tests, and roadmap synchronization.
