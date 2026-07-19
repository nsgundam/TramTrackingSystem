# Decision Queue

## Pending

## D-001 — Operational MVP release scope

Related reports: `docs/audits/product-audit.md`

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

Owner decision: Pending

Roadmap effect: Wait for decision

## Approved

## Postponed

## Rejected
