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

Roadmap effect: Unblocks T14, T26, T29, and telemetry retention/diagnostics tasks.

## D-003 — T6/T16 production-configuration dependency order

Related reports: `docs/audits/architecture-audit.md`,
`docs/audits/infrastructure-device-audit.md`,
`docs/audits/security-devops-observability-audit.md`,
`docs/audits/frontend-audit.md`,
`docs/audits/production-readiness-audit.md`,
`docs/roadmap/master-refactoring-roadmap.md`

Current approach: roadmap task T6 depends on T16, while T16 depends on T6. This forms a cycle that
prevents either task from satisfying its dependency order.

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

Roadmap effect: Dependency order updated; T6 precedes T16, unblocking roadmap execution sequence.

## Postponed

## Rejected

