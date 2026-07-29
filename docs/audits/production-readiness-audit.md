# Production Readiness Audit

Audit metadata:

- Evidence baseline: `fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/README.md`, `docs/audits/lead-audit-summary.md`, `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`, `docs/audits/frontend-audit.md`, `docs/audits/database-audit.md`, `docs/audits/infrastructure-device-audit.md`, `docs/audits/dashboard-ux-audit.md`, `docs/audits/security-devops-observability-audit.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/research/T7-owner-input-questionnaire.md`, `docs/tasks/T7-raw-research-observations.md`, `docs/audits/specialized/T7-data-lifecycle-access.md`, `docs/audits/specialized/T7-product-research-accuracy-protocol.md`, and `docs/roadmap/master-refactoring-roadmap.md`
- Reviewed at: `2026-07-29T11:21:10+07:00`
- Validation state: **Validated**
- Predecessor baselines: all required domain reports and `docs/project-knowledge-base.md`; Discovery/Product `@ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`, Architecture/Backend/Frontend/Database/Infrastructure & Device/Dashboard & UX/Security, DevOps & Observability `@ fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Previous report baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`

Execution: **Run Next** synthesized the current validated predecessor reports. This profile does not
discover a new subsystem, implement code, deploy anything, or treat simulator/Compose evidence as
proof of production operation.

## 1. Executive Summary

Determination: **No-Go for internal daily operations and public rider service.** A **controlled
demonstration/pilot may continue only within D-001=A constraints**: known operators, configured
senders, explicit supervision, bounded audience, and no claim that the map is a reliable transport
service.

The repository has a credible controlled-MVP foundation: source/vehicle/version-bound sender
authentication, TTN webhook authentication, transactional T5 trip lifecycle ownership, T6 canonical
state publication and frontend guards, aligned simulator fixtures, Compose production targets,
readiness endpoints, CI, and redacted operational signals. The current frontend/admin surfaces also
make a bounded distinction between live/stale/no-service/unknown canonical states.

Those foundations do not establish production readiness. The validated audits converge on these
blockers:

- operators cannot run the complete daily workflow or investigate route/source/trip/feedback
  exceptions;
- T7 raw research storage/access/export/retention is not implemented, and no physical/provider field
  evidence exists;
- production network isolation, session policy, legacy admin-write protection, deployment topology,
  backup/restore, durable monitoring, and incident ownership are not evidenced;
- the public live-count expiry path can remain stale, while public ETA remains a client estimate and
  admin readiness/retry is incomplete;
- real mobile, ESP32, TTN provider, physical-device, provisioning, reconnect, and field-coverage
  evidence is absent.

## 2. Validated Predecessor Coverage

| Predecessor | Current state | Readiness implication |
|---|---|---|
| Discovery | Complete / Validated | Repository boundaries and external unknowns are current. |
| Product | Complete / Validated | D-001=A controlled demonstration remains the approved scope; daily/public workflows are incomplete. |
| Architecture | Complete / Validated | T5 lifecycle and T6 canonical boundaries are current; transient Redis state, source-health coordination, route-stop ownership, and scale evidence remain open. |
| Backend | Complete / Validated | Sender/TTN boundaries, T5, T6 canonical publication, and public projection are current; raw research/read APIs, timestamp/order semantics, and legacy writes remain open. |
| Frontend | Complete / Validated | T6 hydration/version/route/freshness/ETA guards are current; public live-count expiry and lifecycle/UI recovery gaps remain. |
| Database | Complete / Validated | Active-trip and T5 constraints are current; sampled history is not raw research data and retention/read/export products remain absent. |
| Infrastructure & Device | Complete / Validated | Compose/startup and simulator boundaries are evidenced; deployment, recovery, provider, firmware, and physical runtime are unavailable. |
| Dashboard & UX | Complete / Validated | Controlled-demo rider flow and admin canonical state summary exist; truthful exception, triage, and research views remain open. |
| Security, DevOps & Observability | Complete / Validated | Sender/TTN auth, redaction, bounded inputs, rate limits, and CI exist; isolation, session policy, durable monitoring, roles, and external security evidence remain open. |

Coverage is sufficient for a repository-based release decision. Confidence is lower for live
deployment, device behavior, load, recovery, alert delivery, and public usability because none was
observed.

## 3. Release-Stage Gates

| Intended stage | Current decision | Minimum evidence still required |
|---|---|---|
| Controlled demonstration / pilot | **Conditional Go** | D-001=A, known supervised operator, configured sender, bounded audience, disposable or explicitly isolated environment, manual observation, and an immediate stop plan for stale/wrong/no-source behavior. No daily-service, production, or accuracy claim. |
| Research field trial | **No-Go** | T7 additive raw diagnostics, retention/deletion/access policy, authenticated research reads, safe CSV export, metric definitions, reproducible data, and field evidence across the approved source boundary. D-006 target approval exists, but exact Redis digest and stateful validation evidence are missing. |
| Internal daily operations | **No-Go** | Supported sender/device lifecycle, route-stop and trip operations, protected history and exception views, canonical freshness/no-service truth, production topology/TLS/secrets, backups/restore, migration rollback, durable monitoring/alerts, incident owner, and runbook evidence. |
| Public rider service | **No-Go** | All internal-operation gates plus truthful rider stale/offline/no-service behavior, correct live-count expiry, authoritative route/ETA semantics, feedback triage/privacy controls, support ownership, abuse controls, release approval, and real field validation. |

The stage split prevents the approved controlled demo from being mistaken for production approval or a
research result.

## 4. Consolidated Blockers

| ID | Finding | State | Priority | Blocks |
|---|---|---|---|---|
| PR-01 | Daily operators lack route-stop management, supported sender operations, trip-history reads, source/device exceptions, and feedback triage. | **Still Present** | Critical for daily operations; High for public support | Internal, public |
| PR-02 | T6 canonical state, ordering, route authority, freshness buckets, and non-live marker/ETA guards are implemented, but operational read contracts, transient-state recovery, and complete exception visibility remain incomplete. | **Partially Resolved** | High / misleading-accuracy risk | Research, internal, public |
| PR-03 | T5 improves transactional trip ownership and sampled history, but protected history reads, complete ordering/idempotency/raw disposition, timestamp semantics, and high-fidelity evidence remain incomplete. | **Partially Resolved** | High / data-loss and accountability risk | Research, internal, public |
| PR-04 | Production Compose publishes PostgreSQL/Redis ports without evidenced private networking, firewall, Redis auth/TLS, backup/restore, or owner-operated topology. | **Still Present** | High security/recovery risk | Internal, public |
| PR-05 | Legacy vehicle/route/stop writes remain outside shared typed validation, rate limits, and safe error handling; admin session lifetime/cookie policy is not aligned with configuration. | **Still Present** | High | Internal, public |
| PR-06 | Real device/provider lifecycle is not evidenced: no mobile app, ESP32 firmware, TTN account/provider runtime, provisioning, field coverage, reconnect, power-cycle, or recovery test. | **Unable to Verify** | Critical for real-device claims | Research, internal, public |
| PR-07 | Public/admin UI has improved canonical state handling, but public live-count expiry can remain stale, public ETA remains a client estimate, and admin readiness/retry/exception context is incomplete. | **Partially Resolved** | High / misleading-accuracy risk | Research, internal, public |
| PR-08 | CI and allowlisted signals exist, but there is no durable metrics/log sink, alert routing, error tracking, deployment approval, incident owner, runbook, or recovery drill. | **Still Present** | High | Internal, public |
| PR-09 | D-002/D-004 research dashboard and comparable raw evidence are not implemented or independently reproducible; no research role/export/retention implementation is evidenced. | **Still Present** | High for research claims | Research |
| PR-10 | D-006 resolves the safer disposable-target/export decision ambiguity, but exact Redis digest, expected mutations, cleanup, rollback, and stateful evidence are still absent. | **Partially Resolved** | High for T7 validation | Research |

### Stop-release conditions

The following conditions stop any stage beyond the controlled demo until resolved and independently
verified: misleading map/ETA state when all sources are stale or disconnected; migration or history
data-loss risk; unbounded sensitive/raw export; unproven credential/provisioning boundary; unresolved
production data-service exposure; or inability to detect and respond to source silence and dependency
failure.

## 5. Cross-Cutting Readiness Scorecard

| Dimension | Status | Basis |
|---|---|---|
| Product completeness | **Not Ready** | Core rider demo exists, but daily operational workflows, exception handling, triage, and research surfaces are absent. |
| Architecture | **Partially Ready** | Monolith, T5, and T6 fit the controlled MVP; Redis/transient health, route-stop ownership, and scale/recovery evidence remain open. |
| Backend reliability | **Partially Ready** | Sender/TTN boundaries, T5, and T6 canonical publication are credible; raw reads, complete disposition/order semantics, and legacy write consistency remain open. |
| Frontend reliability | **Partially Ready** | Canonical hydration/version/route/freshness guards exist; local expiry count correctness, lifecycle retry, and browser evidence remain open. |
| Data layer | **Partially Ready** | PostGIS, constraints, and sampled history support MVP; raw evidence, retention, timestamps, access, and read workflows remain unresolved. |
| Infrastructure/device | **Not Ready** | Production images and simulators exist; operated deployment and real sender/provider/device evidence do not. |
| Security | **Partially Ready** | Direct secret-hash/Redis-log exposure is resolved; production isolation, session policy, legacy writes, roles, and external controls remain open. |
| Operability | **Not Ready** | CI, readiness, request IDs, and redacted signals exist without durable monitoring, alerts, recovery, or ownership. |
| User experience | **Not Ready** | Rider feedback and canonical marker behavior exist, but stale/count/error/exception truth is incomplete. |

## 6. Minimum Bar Before Broader Release

1. Define topology and origins under D-003; privately isolate production data services, remove
   unnecessary host ports, define Redis auth/TLS, TLS termination, secret ownership/rotation, and
   firewall rules.
2. Extend shared validation, safe errors, and rate limits to every admin write; align admin JWT
   lifetime and secure session policy; define least-privilege roles and sensitive-action audit before
   multi-operator or T7 research use.
3. Preserve and complete T6/T8: canonical ordering/route/freshness semantics, stale/offline/no-service
   recovery, public live-count expiry correctness, and truthful public/admin UI.
4. Complete accountable operations: route-stop maintenance/cache invalidation, supported sender
   workflow, protected trip/history reads, exception view, and feedback triage ownership.
5. Implement T7 only after the Level 1 gate: additive raw/session/aggregate/lifecycle products,
   receive-time retention/deletion, protected research reads, bounded CSV export, backup/restore,
   migration rollback, and canonical-boundary invariance tests.
6. Produce field evidence for the actual sender/provider path across representative route sections,
   coverage conditions, mounting, duration, reconnect/power cycles, and failure recovery; record
   sample size and limitations.
7. Connect readiness, source-stale, ingestion rejection, dependency failure, persistence failure,
   and dashboard/export failures to durable logs/metrics, alerts, incident ownership, a runbook, and
   a recovery drill.

Playback, microservices, broad analytics, partitions, and scale redesign are not prerequisites for
D-001=A; they become relevant only if the owner expands the release promise.

## 7. Go / No-Go Determination

**No-Go for production.** Do not launch daily campus operations or public tracking with real vehicles,
drivers, or riders on current evidence. Current evidence supports only a supervised controlled
demonstration/pilot with known senders and an explicit disclaimer that it is not a reliable transport
service.

No new owner decision is required by this synthesis. D-001 through D-006 remain the active scope,
sequencing, stale-state, research, and disposable-target gates. Changing the release stage or
promising a research comparison requires the corresponding approved scope and evidence, not an
inference from this report.

## 8. Verification and Limitations

This is a synthesis of validated predecessor audits; it does not rerun deployment or field tests.
Backend boundary/redaction, T6, Prisma, Compose parsing, frontend lint, TypeScript, and webpack build
evidence are recorded in the current predecessor reports. The default Turbopack build in
`scripts/ci-checks.sh` did not complete in the restricted runner; no stateful migration, backup
restore, deployment, browser session, physical device, firmware, TTN console, live public traffic,
penetration test, dependency advisory scan, production logs/metrics, or alert delivery was observed.

Confidence is **high** for the No-Go decision and repository-visible readiness gaps because all current
predecessor audits converge on the same blockers. Confidence is **medium** for implementation order
and effort, and **low** for external runtime/device/provider behavior.

## 9. Handoff and Roadmap Impact

Production Readiness is **Complete / Validated** at the current evidence baseline. The next eligible
profile is Roadmap Revalidation/Synthesis. It must preserve T1–T6 evidence, rebase task status on this
validated readiness gate, incorporate D-006 accurately, and sequence topology/origin, canonical truth,
operations/history, T7 research controls, and durable deployment monitoring before any internal/public
release claim. This report does not implement code or modify the roadmap.
