# Decision Queue

## Pending

## D-008 — Production hosting topology and operational ownership

Related reports: `docs/audits/infrastructure-device-audit.md`,
`docs/audits/security-devops-observability-audit.md`,
`docs/audits/production-readiness-audit.md`,
`docs/roadmap/master-refactoring-roadmap.md`

Owner direction recorded on **2026-08-01**: keep frontend/backend/data hosting separated as required
by the final topology; the production server will be either university-operated infrastructure,
AWS, or a VPS. Register and bind the public domain only after the selected server deployment is
working.

Still pending before T9 can close: select the actual provider/host and region/network boundary;
name the frontend, backend, PostgreSQL, and Redis placement; choose the TLS terminator and certificate
owner; identify the secret source, log/alert destination, backup/restore owner, migration/rollback
owner, and incident/on-call owner. The post-deploy domain sequence does not authorize an IP-only
public release or plaintext production traffic.

Roadmap effect: narrows the T9 hosting direction but leaves T9 and T13 blocked on exact topology,
security, and operational-owner facts.

## Approved

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

Recommendation: A for the current controlled MVP. Keep freshness and Trip closure independent;
provide a protected stale/in-progress exception and explicit/manual close path in the next
operations task. Do not implement an automatic close from the 30-second freshness threshold.

Owner decision: Approved A on 2026-07-24 — `stale`, `no_service`, and `unknown` are observability
states, not Trip completion commands. Any future automatic closure must use a separately approved
grace period, close reason, audit record, recovery/override behavior, and notification policy.

Roadmap effect: T6 remains a canonical-state task and does not auto-close Trips. T11 must include
stale/silent active-Trip exceptions and a protected explicit close workflow when its D-001 scope
gate is opened. A concrete auto-close timeout remains a future decision rather than an implicit
implementation default.

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
  observations to the Backend; it is not embedded in the Admin Web UI.
- No application role, including `DEV`, may create or remove a `DEV` account through the product UI
  or API. Only the project owner/creator or an explicitly authorized project-creator team member may
  provision or deprovision `DEV` out of band through a separately controlled bootstrap/operations
  procedure.

Security gate before implementation: define who may provision, promote, demote, disable, or remove
`SUPER_ADMIN` and `ADMIN`; Sender credential display/rotation/revocation; approval,
re-authentication, reason, and audit requirements for privileged deletion/backup/export; backup-
before-delete and restore/rollback behavior; and the owner/team-member allowlist plus recovery
procedure for out-of-band `DEV` provisioning. Until that matrix is approved and migrated, the repository's current
`OPERATOR`/`DEV`/`SUPER_ADMIN` checks and D-006 export contract remain evidence of current behavior,
not proof of the new hierarchy.

Roadmap effect: the next roadmap re-audit must add an explicit RBAC/migration handoff before or with
T10–T12 and preserve separation between the T15 Dev research surface and ordinary operations UI.

## Postponed

## Rejected
