# Decision Queue

## Pending

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

Recommendation: A — keep the current release limited to a controlled demonstration or pilot until
the owner explicitly chooses B or C. This matches the repository evidence without presenting
API-only or external-client workflows as daily operational capability.

Owner decision: Approved A — Minimal controlled demonstration (Develop MVP scope for pilot testing prior to potential future expansions)

Roadmap effect: Governs MVP release scope; focus remains on controlled demonstration.

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

## Postponed

## Rejected
