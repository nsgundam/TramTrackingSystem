# Decision Queue

## Pending

None.

## Approved

## D-008 — Production hosting topology and operational ownership

Related reports: `docs/audits/infrastructure-device-audit.md`,
`docs/audits/security-devops-observability-audit.md`,
`docs/audits/production-readiness-audit.md`,
`docs/roadmap/master-refactoring-roadmap.md`

Owner decision: **Approved recommended handoff on 2026-08-07.** Production starts on one
university-managed server behind one TLS reverse proxy at the preferred origin
`https://tram-tracking.rsu.ac.th`: `/` routes to the frontend and `/api/*` plus `/socket.io/*` route
to the backend. Only `443` and an HTTP-to-HTTPS redirect on `80` are public; administrative SSH is
restricted, and application/PostgreSQL/Redis ports have no public host binding. The single host is
an accepted zero-budget single point of failure, not high availability.

The application team owns versioned application artifacts, the non-secret environment schema,
migration procedure, readiness contract, and deployment/rollback runbook. The University
Server/Network Team is the designated operational owner for host/OS/network/firewall, DNS/TLS,
production secret generation/storage/rotation, off-host backup/restore, log/metric retention,
alerts, and incident response. Initial targets are maintenance outside vehicle-service hours, RPO
at most 24 hours, and RTO before the next service period and at most 24 hours. An external VPS is a
manual cold-recovery option only; Vercel/Render/Neon and any AWS learning environment are isolated
non-production profiles with separate credentials, data, and sender registrations.

The application developer is not required to invent the final host values. Before a production
claim, the University Server/Network Team must name primary/backup contacts and supply the actual
host/resources, DNS/certificate, firewall, secret location, off-host backup/restore, log/alert,
restart and capacity evidence. Ten vehicles and 10,000 concurrent public viewers are load-test
targets, not an accepted capacity result. Precise locations, feedback/IP data and credentials remain
sensitive even though external data placement is allowed.

Binding specialist record:
`docs/audits/specialized/D-008-observability-production-topology-handoff.md`.

Roadmap effect: closes the owner-policy portion of D-008 and authorizes an exact repository-side T9
handoff. It does not complete T9, establish the external team's acceptance, or prove deployment,
TLS, private-port enforcement, restore, alert delivery, capacity, failover, or production readiness.
T13 and public release remain gated on the recorded external checklist.

## D-010 — Legacy administrative-role migration mapping

Related reports: `docs/audits/security-devops-observability-audit.md`,
`docs/audits/database-audit.md`, `docs/audits/specialized/T12-identity-feedback-triage-policy.md`,
and `docs/roadmap/master-refactoring-roadmap.md`.

Current evidence: `users.role` is a free string whose default and existing ordinary role are
`OPERATOR`; current admin JWTs contain only identity. D-007 instead names the target hierarchy
`DEV` > `SUPER_ADMIN` > `ADMIN`. T12 cannot safely grant the approved read-only device view or
restrict feedback deletion/re-authentication until the existing ordinary accounts have a defined,
least-privilege transition.

Owner decision: **Approved A on 2026-08-01.** Convert every existing `OPERATOR` role to `ADMIN`;
make the ordinary-user default `ADMIN`; retain `SUPER_ADMIN` and `DEV`; reject unknown roles at every
server authorization boundary. Do not silently elevate any legacy account to `SUPER_ADMIN` or `DEV`.

Roadmap effect: resolves the T12 role-migration policy gate. The implementation must use an additive,
reviewed migration plus deterministic role/re-authentication tests; it does not change T9, T11, T13,
or D-009's feedback policy.

## D-001 — Operational MVP release scope

Related reports: `docs/audits/product-audit.md`, `docs/audits/backend-audit.md`,
`docs/audits/database-audit.md`, `docs/audits/dashboard-ux-audit.md`,
`docs/audits/security-devops-observability-audit.md`, `docs/audits/frontend-audit.md`,
`docs/audits/production-readiness-audit.md`

Current approach: the repository provides public tracking, basic admin CRUD, authenticated sender
contracts, simulators, and public feedback submission. It does not provide route-stop management,
a supported driver workflow, trip history, feedback triage, or actionable stale/offline operations
visibility.

Problem: the required work and acceptable risk differ materially between a controlled demonstration,
daily campus operations, and a wider public rider release. The roadmap must not treat these scopes
as interchangeable.

| Option | Benefits | Costs/risks | Effort | Learning value | Upgrade trigger |
|---|---|---|---|---|---|
| A — Minimal controlled demonstration | Preserves the current focused tracker MVP; fastest path to supervised testing. | No claim of daily operations; requires a known operator and supported external sender. | Low | Public tracking and controlled feedback capture. | Daily recurring service or independent operators. |
| B — Balanced daily campus operations | Adds route-stop operations, supported sender workflow, trip history, and service freshness for accountable daily use. | More cross-domain implementation and validation before operation. | Medium | Operational workflow, history, and freshness design. | Public launch, multiple operators, or reliance on feedback. |
| C — Wider public rider release | Adds B plus feedback triage and clearer public no-service/stale-service communication. | Requires support ownership, privacy/retention choices, and stronger operational readiness. | Medium-High | Service operations and rider support. | Higher rider volume or formal service commitments. |

Pre-decision recommendation: A — keep the current release limited to a controlled demonstration or
pilot until the owner explicitly chooses B or C. This matched the repository evidence before the
2026-08-01 scope upgrade.

Owner decision: **Approved C on 2026-08-01 — Wider public rider release.** This supersedes the
earlier A decision. B-level route/stop operations, supported sender/trip history and exceptions,
plus accountable feedback triage and public-service readiness are now required before claiming the
selected release scope.

Roadmap effect: Opens the product-scope gate for T10–T12, but does not make them implementation-ready
by itself. The affected Product-through-Production-Readiness evidence and the roadmap require
re-audit against C; T9/T13 hosting and recovery gates, T11 sender workflow, T12 feedback policy, and
the role/access matrix remain independent blockers.

## D-002 — Telemetry retention and canonical-history fidelity

Related reports: `docs/audits/architecture-audit.md`, `docs/audits/product-audit.md`,
`docs/audits/backend-audit.md`, `docs/audits/database-audit.md`,
`docs/audits/infrastructure-device-audit.md`, `docs/audits/dashboard-ux-audit.md`,
`docs/audits/production-readiness-audit.md`

Current approach: Redis keeps only the latest observation per source. PostgreSQL stores sampled
canonical GPS history, rather than each source observation or an ordered event stream.

Problem: device comparison, incident investigation, and playback need different data than ordinary
live tracking. The project must choose a bounded retention/fidelity policy before promising those
capabilities.

| Option | Benefits | Costs/risks | Effort | Learning value | Upgrade trigger |
|---|---|---|---|---|---|
| A — Minimal canonical samples | Keeps the current sampled canonical history as the only durable record. | Cannot explain lower-priority/rejected observations or promise detailed playback. | Low | Canonical state and sampling basics. | Device comparison, incident forensics, or playback becomes required. |
| B — Bounded raw diagnostics | Retains selected raw observation facts for a short configured period alongside canonical history. | Adds privacy, storage, deletion, and query responsibilities. | Medium | Telemetry retention and diagnostic design. | Frequent source disputes or a research comparison phase. |
| C — High-fidelity raw history | Enables richer playback and detailed source analysis. | Highest storage, privacy, operational, and data-quality burden. | High | Time-series and event-stream operations. | Evidence shows the product needs detailed replay or analysis. |

Recommendation: A — keep canonical sampled history for the controlled MVP. Revisit B only when
the owner selects a scope that needs device comparison or incident diagnostics.

Owner decision: Approved B — Bounded raw diagnostics (Retain raw observation facts to compare 3 senders—mobile, LoRaWAN, ESP32—measuring latency, accuracy, etc. for research analysis)

Roadmap effect: Unblocks current-roadmap T7 and the research portion of T15. References to T14,
T26, and T29 belonged to superseded roadmap numbering.

## D-003 — Topology/origin dependency order (legacy T6/T16 numbering)

Related reports: `docs/audits/architecture-audit.md`,
`docs/audits/infrastructure-device-audit.md`,
`docs/audits/security-devops-observability-audit.md`,
`docs/audits/frontend-audit.md`,
`docs/audits/production-readiness-audit.md`,
`docs/roadmap/master-refactoring-roadmap.md`

Historical context: the superseded roadmap made its former T6 and T16 depend on each other. The
current roadmap carries the approved policy into current T9: establish topology and origin facts
before client/server configuration alignment.

Problem: deployable production configuration and unified REST/Socket origin behaviour are both
required, but the roadmap must define their sequence without a circular prerequisite.

| Option | Benefits | Costs/risks | Effort | Learning value | Upgrade trigger |
|---|---|---|---|---|---|
| A — T6 first, T16 follows | T6 defines provider/configuration and one backend-origin model; T16 then verifies client REST/Socket alignment. | T6 must specify the shared origin model clearly enough for T16. | Low-Medium | Environment contract design. | No upgrade; this is the minimal dependency repair. |
| B — Merge T6 and T16 | Produces one end-to-end configuration task. | Larger task and more cross-file coupling. | Medium | Full-stack configuration ownership. | Use only if the team prefers one integrated delivery. |
| C — Keep current cycle | No roadmap-edit effort. | Blocks Phase 1 sequencing indefinitely. | None | None. | Not recommended. |

Recommendation: A — make T6 the provider/configuration prerequisite, then make T16 validate and
enforce REST/Socket alignment against that contract.

Owner decision: Approved A — T6 first, T16 follows

Roadmap effect: The historical cycle is closed. Current T9 owns topology/origin definition and
configuration alignment; there is no current T16.

## D-004 — Three-device research and Dev Dashboard scope

Related artifact: `docs/research/device-comparison-scope.md`

Current approach: D-002 approves bounded raw diagnostics, but it did not define the physical source
boundaries, dashboard audience, or accuracy vocabulary.

Owner decision: Approved on 2026-07-22. Compare three separate sources: Mobile GPS through
Socket.IO, ESP32 with a GPS module through Wi-Fi/HTTP, and a separate LoRaWAN device through
Gateway/TTN/Webhook. Start with an authenticated Dev Dashboard containing live and historical
comparison, health/freshness, latency, cadence, delivery quality, accuracy proxies/reference error,
selection/failover, available signal/power metadata, filters, and bounded CSV/JSON export.

Guardrail: distance from a point to the known route is route-conformance evidence and a
device-reported accuracy value is reported uncertainty. Neither alone proves absolute accuracy.
Add surveyed checkpoints or a higher-quality synchronized reference when an absolute accuracy claim
is required.

Roadmap effect: Refines the research handoff for T7 and T15 without bypassing audit revalidation,
retention/access decisions, physical-device facts, or task specifications.

## D-005 — Stale trip closure policy

Related reports: `docs/audits/specialized/T6-backend-realtime-canonical-vehicle-state.md`,
`docs/audits/backend-audit.md`, `docs/audits/dashboard-ux-audit.md`,
`docs/roadmap/master-refactoring-roadmap.md`

Current approach: canonical source freshness and Trip lifecycle are separate concerns. A source
becomes `stale` after the 30-second freshness window, but the Trip remains `in_progress` until an
authenticated sender explicitly ends it. A stale or unavailable vehicle may therefore stop being
shown as a live marker while its database Trip remains active.

Problem: a driver who forgets to end a Trip can leave an active-trip record indefinitely. The record
can continue to provide route authority and later observations may be associated with the same
Trip. Closing it after the 30-second freshness window would incorrectly interpret a network,
device, or power failure as a confirmed operational end.

| Option | Benefits | Costs/risks | Effort | Upgrade trigger |
|---|---|---|---|---|
| A — Separate stale exception and explicit/manual close | Preserves the distinction between telemetry failure and operational end; safest for the controlled MVP. | Requires an operator or sender to resolve the exception; needs a protected trip/exception surface. | Medium | Daily operations or repeated unresolved stale Trips. |
| B — Auto-close after a separate grace period | Reduces forgotten active Trips and can preserve an auditable close reason. | May close a Trip during a prolonged outage; requires timeout, clock, recovery, notification, and override rules. | Medium-High | Owner selects a concrete grace period and accepts false-close risk. |
| C — Hybrid confirmation then hard-cap auto-close | Gives operators a recovery window while preventing indefinite active Trips. | Most complex policy and state machine; still has false-close risk at the hard cap. | High | Formal daily-service operations with an accountable on-call owner. |

Pre-decision recommendation: A for the former controlled MVP. Keep freshness and Trip closure
independent and do not close from the 30-second stale threshold. D-001=C and the owner decision below
now supersede the no-auto-close release assumption.

Owner decision: **Approved B on 2026-08-01 — auto-close an active Trip after 10 consecutive minutes
without new GPS tracking input.** This supersedes Approved A from 2026-07-24. The 30-second
`stale`/`no_service`/`unknown` transition remains only an observability change and must not close the
Trip. The owner accepts a separate 10-minute grace period for forgotten/disconnected senders and
confirms that it applies uniformly to Mobile, ESP32, and LoRaWAN sources.

Confirmed close semantics: `closeReason = gps_timeout`, `endTime = lastAcceptedAt`, and `closedAt`
is the time the timeout is detected. A later GPS observation must not reopen the closed Trip; the
sender must start a new Trip. The Mobile App also locks driver/profile/vehicle switching until its
active Trip has ended, and the Backend must enforce the equivalent state transition rather than
trusting only the client.

Confirmed clock: `lastAcceptedAt` is the Backend receive time of the latest GPS observation accepted
for the active Trip. It is not device event time and is not derived from persisted sampled
`GPSTrack`, because sampling may intentionally omit valid accepted observations. Rejected, replayed,
wrong-claim, wrong-vehicle, or post-close observations must not advance the clock.

Emergency handling is also approved: `ADMIN` or higher may atomically force-close an active Mobile
Trip and release its claim when the enrolled shared phone is lost or broken. This uses the distinct
`admin_force_close` reason, Backend execution time for `endTime`/`closedAt`, preserves
`lastAcceptedAt`, invalidates the old claim/token, requires an explicit reason and immutable actor
audit, and does not delete Trip or telemetry evidence.

Remaining implementation gate: re-audit and specify notification, durable restart/idempotency,
atomic late-packet and concurrent timeout/Admin handling, schema/constraint placement, and external
Android acceptance evidence. The owner policy is complete, but it is not implementation
authorization until those evidence and exact-handoff gates pass.

Roadmap effect: T6 remains a canonical-state task. T11 owns the supervised auto-close lifecycle,
stale/silent exception UI, Android/IoT recovery behavior, and protected manual handling.

## D-006 — T7 disposable validation target and safer research export controls

Related artifacts: `docs/tasks/T7-raw-research-observations.md`,
`docs/audits/specialized/T7-data-lifecycle-access.md`,
`docs/audits/specialized/T7-product-research-accuracy-protocol.md`

Owner decision: Approved on **2026-07-29**. Use the Level 2 safer alternatives where the original
owner answers were less restrictive:

- Use a fresh isolated Compose project named `t7-disposable`, never the ambient `shuttle-*` stack.
- Use `postgis/postgis:16-3.4-alpine`, non-ambient PostgreSQL/Redis/backend ports `15433`, `16380`,
  and `13002`, and pin/record the exact Redis server image and digest before stateful validation.
- Use synthetic/redacted fixtures only and a separate empty `t7-backup-restore-disposable` target for
  restore verification. No production credentials, live data, or ambient volumes are permitted.
- Keep raw retention at 90 days from backend receive time and destroy temporary raw backup/export
  artifacts within seven days after successful verification unless a later owner decision changes it.
- Default research exports are server-side, session/time-scoped, fixed-field, CSV-only, streamed, and
  protected by backpressure/concurrency controls. A full export is a controlled break-glass action
  for `DEV`/`SUPER_ADMIN`, not an unrestricted arbitrary query or public endpoint.
- Record a minimal export manifest (actor role, scope, timestamp, result status, row/count/hash where
  available) for accountability. This is not a raw payload/read-content audit log; no raw read audit
  trail is added by T7 unless separately approved.

The target is approved for disposable schema/migration, query-plan, retention/deletion,
backup/restore, Redis-failure, and T7 contract testing only. It does not authorize production,
provider, hardware, public-dashboard, or absolute-accuracy claims. Numeric default export limits and
the exact Redis digest must be recorded in the task evidence before stateful validation.

Roadmap effect: resolves the T7 disposable-target gate and supersedes the less restrictive owner
export/temporary-artifact choices for T7 implementation. Re-audit freshness and Level 1 evidence
validation remain required before implementation promotion.

## D-007 — Administrative role tiers and sensitive data authority

Related reports: `docs/audits/product-audit.md`, `docs/audits/database-audit.md`,
`docs/audits/dashboard-ux-audit.md`, `docs/audits/security-devops-observability-audit.md`,
`docs/roadmap/master-refactoring-roadmap.md`

Owner decision: **Approved on 2026-08-01.** Use three named administrative roles in descending
authority order: `DEV`, `SUPER_ADMIN`, and `ADMIN`, with hierarchical permission inheritance.

- `DEV` is the highest role and may perform every `DEV`, `SUPER_ADMIN`, and `ADMIN` action. It owns
  research data collection and the protected developer/research surface and retains the bounded
  backup/export authority approved by D-006.
- `SUPER_ADMIN` may perform ordinary `ADMIN` operations plus privileged deletion of
  `Trip`, `GPSTrack`, and `Feedback` records and controlled backup/export operations. It cannot
  delete raw-research observations, research aggregates, lifecycle/audit records, users, routes,
  stops, vehicles, or other data under this decision.
- `ADMIN` manages ordinary operational resources, but cannot create, edit, delete, assign, or
  otherwise manage accounts/roles at the higher `SUPER_ADMIN` or `DEV` tiers. `ADMIN` and both
  higher roles may create device Sender identities/credentials through the Admin UI; this is device
  credential provisioning, not administrative user/role creation. The Driver/GPS Sender runtime is
  a separately built Mobile Application that uses its provisioned Sender credential to transmit GPS
  observations to the Backend; it is not embedded in the Admin Web UI. For shared Mobile phones,
  `ADMIN` or higher may also disable/revoke an installation, issue a replacement one-time
  enrollment, and emergency-force-close its active Trip plus release its Mobile claim with an
  explicit reason and immutable audit.
- No application role, including `DEV`, may create or remove a `DEV` account through the product UI
  or API. Only the project owner/creator or an explicitly authorized project-creator team member may
  provision or deprovision `DEV` out of band through a separately controlled bootstrap/operations
  procedure.

Security gate before implementation: define who may provision, promote, demote, disable, or remove
`SUPER_ADMIN` and `ADMIN`; general/non-Mobile Sender credential display/rotation/revocation beyond
the approved T11 shared-phone recovery path; approval,
re-authentication, reason, and audit requirements for privileged deletion/backup/export; backup-
before-delete and restore/rollback behavior; and the owner/team-member allowlist plus recovery
procedure for out-of-band `DEV` provisioning. Until that matrix is approved and migrated, the
repository's current `OPERATOR`/`DEV`/`SUPER_ADMIN` checks and D-006 export contract remain evidence
of current behavior, not proof of the new hierarchy.

T11 refinement: the owner selects shared university phones enrolled once as the Mobile identity.
Routine vehicle changes use a static, non-secret QR selector on each vehicle and an exclusive
Backend-issued claim, without contacting an Admin or entering human-facing `SOURCE_ID`. A short
printed vehicle code may expose the same non-secret selector as a camera/damaged-QR fallback;
neither form authenticates a Sender. One vehicle may have at most one active Mobile claim.
`SOURCE_ID` remains an internal stable provenance/revocation identifier rather than being removed
from research or canonical evidence. `ADMIN` or higher owns lost/replaced-phone disable, revoke,
re-enrollment, and audited emergency `admin_force_close` plus claim release. The binding technical
constraints are recorded in
`docs/audits/specialized/T11-identity-mobile-sender-enrollment.md`.

T11 acceptance refinement (2026-08-01): the owner requires broad-device intent rather than a fixed
Android model/OS promise, confirms locked-screen sending was tested in the field, accepts the
existing 15-minute access JWT with a revocable refresh credential, and selects authenticated
Admin-log-only visibility for `gps_timeout`. This does not claim universal Android compatibility:
the Android team must provide the versioned, redacted device/OS acceptance artifact defined in
`docs/audits/specialized/T11-identity-mobile-sender-enrollment-v2.md` before T11 completion.

Roadmap effect: the next roadmap re-audit must add an explicit RBAC/migration handoff before or with
T10–T12 and preserve separation between the T15 Dev research surface and ordinary operations UI.

## D-009 — Anonymous feedback triage and safe source/device visibility

Related artifacts: `docs/audits/specialized/T12-identity-feedback-triage-policy.md`,
`docs/audits/product-audit.md`, `docs/audits/database-audit.md`,
`docs/audits/security-devops-observability-audit.md`,
`docs/audits/dashboard-ux-audit.md`, and `docs/roadmap/master-refactoring-roadmap.md`.

Owner decision: **Approved on 2026-08-01.** `SUPER_ADMIN` owns the anonymous, one-way feedback
inbox during business days. The case lifecycle is `new → acknowledged → investigating → resolved`,
with `duplicate` and `rejected` terminal. Do not collect rider contact information or promise a
reply; display a clear non-emergency/business-day privacy notice.

Retain feedback message, type, vehicle reference, case metadata, and action audit for 180 days from
creation. Retain raw client IP only for rate limiting for at most 30 days, then remove it; it is not
triage, analytics, or rider-identification data. `SUPER_ADMIN` and `DEV` may soft-delete feedback
only after re-authentication within 15 minutes, an explicit reason, immutable actor/action audit,
and a 30-day restore window; the later purge retains only non-content action evidence.

`ADMIN`, `SUPER_ADMIN`, and `DEV` may view only source type, assigned vehicle, freshness, last-seen,
status, and allowlisted error category. The view is read-only and must exclude credentials,
credential hashes, tokens, activation/QR values, raw payloads, IP, raw/historical location, research
observations, and arbitrary internal errors. T11 retains shared-phone recovery actions; T12 must not
add device/source writes.

Roadmap effect: resolves T12's feedback/privacy/retention/deletion/SLA and device action policy gate.
It does not bypass the required re-audits, server-side role/re-authentication enforcement, an exact
T12 handoff, retention/deletion verification, or T9/T13 production gates.

## Postponed

## Rejected
