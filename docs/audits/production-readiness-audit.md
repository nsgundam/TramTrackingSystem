# Production Readiness Audit

Audit metadata:

- Evidence baseline: `4d5a456a6d73ef5a58d674426ba889f43102a9d2`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/README.md`, `docs/audits/lead-audit-summary.md`, `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`, `docs/audits/frontend-audit.md`, `docs/audits/database-audit.md`, `docs/audits/infrastructure-device-audit.md`, `docs/audits/dashboard-ux-audit.md`, `docs/audits/security-devops-observability-audit.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/research/T7-owner-input-questionnaire.md`, `docs/tasks/T7-raw-research-observations.md`, `docs/tasks/T8-truthful-map-live-count.md`, `docs/audits/specialized/T7-data-lifecycle-access.md`, `docs/audits/specialized/T7-product-research-accuracy-protocol.md`, `docs/roadmap/master-refactoring-roadmap.md`, `scripts/ci-checks.sh`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/public/AvailabilityCard.tsx`, `shuttle-tracking-web/hooks/useShuttleTracker.ts`, `shuttle-tracking-web/hooks/useVehicleTracking.ts`, and `shuttle-tracking-web/types/canonical-state.ts`.
- Reviewed at: `2026-07-29T19:11:00+07:00`
- Validation state: **Validated**
- Predecessor baselines: Discovery, Product, Architecture, Backend, Database, Infrastructure & Device, and Security/DevOps/Observability `@ d94abb3a4d80c2174d87df4d006dfbe7c814a6bc`; Frontend and Dashboard & UX `@ 4d5a456a6d73ef5a58d674426ba889f43102a9d2`

## T7 Re-audit Addendum — 2026-07-29

All required domain reports were revalidated at the current baseline before this synthesis. T7's
disposable migration, backup/restore, retention, Redis recovery, canonical-boundary, contract, and
query-plan evidence supports a **Conditional Go** only for the approved synthetic disposable research
validation scope. The controlled demonstration remains **Conditional Go** under D-001=A; research
field trials, internal daily operations, and public rider service remain **No-Go**. Missing physical
sender/provider evidence, deployment/TLS/topology, monitoring/alerts, operational ownership, and the
T8 public live-count truthfulness gap are release blockers outside the narrow disposable target.
- Previous report baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`

Execution: **Run Next** synthesized the current validated predecessor reports. This profile does not
discover a new subsystem, implement code, deploy anything, or treat simulator/Compose evidence as
proof of production operation.

## T8 Re-audit Addendum — 2026-07-29

Frontend and Dashboard & UX are now re-audited and Validated at
`4d5a456a6d73ef5a58d674426ba889f43102a9d2`; the other required domain reports remain valid because
the T8 change is limited to public client-side state projection and does not change their trusted
backend, data, device, topology, or security evidence. Repository CI and agent-workflow validation
passed. No runtime/browser, Socket.IO interruption, or focused timer/route-switch test was run.

T8's live-count defect is **Partially Resolved**: local expiry now updates the public Marker, ETA, and
live-only count together. A **New Finding** remains: route selection can re-add a stale or locally
expired stored Marker before a newer canonical `live` state. Therefore the bounded T8 acceptance is
not closed, and the controlled-demo condition retains a truthful-map stop condition. This finding
does not change the existing No-Go determinations for research, daily operations, or public service.

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
- T7 raw research storage/access/export/retention is implemented only for the approved disposable
  scope, and no physical/provider field evidence exists;
- production network isolation, session policy, legacy admin-write protection, deployment topology,
  backup/restore, durable monitoring, and incident ownership are not evidenced;
- T8 repairs local-expiry live-count projection, but a route switch can restore a stale/expired public
  Marker; public ETA remains a client estimate and admin readiness/retry is incomplete;
- real mobile, ESP32, TTN provider, physical-device, provisioning, reconnect, and field-coverage
  evidence is absent.

## 2. Validated Predecessor Coverage

| Predecessor | Current state | Readiness implication |
|---|---|---|
| Discovery | Complete / Validated | Repository boundaries and external unknowns are current. |
| Product | Complete / Validated | D-001=A controlled demonstration remains the approved scope; daily/public workflows are incomplete. |
| Architecture | Complete / Validated | T5 lifecycle and T6 canonical boundaries are current; transient Redis state, source-health coordination, route-stop ownership, and scale evidence remain open. |
| Backend | Complete / Validated | Sender/TTN boundaries, T5/T6 canonical publication, and protected T7 research APIs are current; physical timestamp quality and legacy writes remain open. |
| Frontend | Complete / Validated | T8 now aligns local-expiry Marker/count/ETA projection, but stale/expired Marker restoration on route change and runtime evidence remain open. |
| Database | Complete / Validated | Active-trip and T5 constraints are current; T7 adds bounded raw research data with disposable retention/read/export evidence, not production lifecycle proof. |
| Infrastructure & Device | Complete / Validated | Compose/startup and simulator boundaries are evidenced; deployment, recovery, provider, firmware, and physical runtime are unavailable. |
| Dashboard & UX | Complete / Validated | The public surface remains canonical-only and neutral; T8 route-switch Marker truthfulness, exception, triage, and research views remain open. |
| Security, DevOps & Observability | Complete / Validated | Sender/TTN auth, redaction, bounded inputs, rate limits, and CI exist; isolation, session policy, durable monitoring, roles, and external security evidence remain open. |

Coverage is sufficient for a repository-based release decision. Confidence is lower for live
deployment, device behavior, load, recovery, alert delivery, and public usability because none was
observed.

## 3. Release-Stage Gates

| Intended stage | Current decision | Minimum evidence still required |
|---|---|---|
| Controlled demonstration / pilot | **Conditional Go** | D-001=A, known supervised operator, configured sender, bounded audience, disposable or explicitly isolated environment, manual observation, and an immediate stop plan for stale/wrong/no-source behavior. Do not present the route-switch path as truthful until T8 acceptance is repaired and verified. No daily-service, production, or accuracy claim. |
| Research field trial | **No-Go** | T7 additive raw diagnostics, retention/deletion/access policy, authenticated research reads, safe CSV export, metric definitions, reproducible data, and field evidence across the approved source boundary. D-006 target approval exists, but exact Redis digest and stateful validation evidence are missing. |
| Internal daily operations | **No-Go** | Supported sender/device lifecycle, route-stop and trip operations, protected history and exception views, canonical freshness/no-service truth, production topology/TLS/secrets, backups/restore, migration rollback, durable monitoring/alerts, incident owner, and runbook evidence. |
| Public rider service | **No-Go** | All internal-operation gates plus truthful rider stale/offline/no-service behavior across local expiry and route switching, authoritative route/ETA semantics, feedback triage/privacy controls, support ownership, abuse controls, release approval, and real field validation. |

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
| PR-07 | T8 now reprojects the public live count on local expiry, but route switching can restore a stale/expired Marker before a newer canonical `live` state; public ETA remains a client estimate and admin readiness/retry/exception context is incomplete. | **Partially Resolved** | High / misleading-accuracy risk | Research, internal, public |
| PR-08 | CI and allowlisted signals exist, but there is no durable metrics/log sink, alert routing, error tracking, deployment approval, incident owner, runbook, or recovery drill. | **Still Present** | High | Internal, public |
| PR-09 | The D-004 Dev Dashboard and physical comparison evidence are not implemented or independently reproducible. T7 provides protected backend diagnostics, not a research result. | **Partially Resolved** | High for research claims | Research |
| PR-10 | D-006's exact Redis digest, isolated target, expected mutations, cleanup constraints, and stateful evidence are recorded for the disposable target; production rollback/lifecycle operations remain absent. | **Partially Resolved** | High for production research validation | Research |

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
| Frontend reliability | **Partially Ready** | Canonical hydration/version/route/freshness guards and local-expiry count projection exist; non-live Marker restoration on route change, lifecycle retry, and browser evidence remain open. |
| Data layer | **Partially Ready** | PostGIS, constraints, and sampled history support MVP; raw evidence, retention, timestamps, access, and read workflows remain unresolved. |
| Infrastructure/device | **Not Ready** | Production images and simulators exist; operated deployment and real sender/provider/device evidence do not. |
| Security | **Partially Ready** | Direct secret-hash/Redis-log exposure is resolved; production isolation, session policy, legacy writes, roles, and external controls remain open. |
| Operability | **Not Ready** | CI, readiness, request IDs, and redacted signals exist without durable monitoring, alerts, recovery, or ownership. |
| User experience | **Not Ready** | Rider feedback and canonical marker behavior exist, but stale/expired Marker restoration, error, and exception truth are incomplete. |

## 6. Minimum Bar Before Broader Release

1. Define topology and origins under D-003; privately isolate production data services, remove
   unnecessary host ports, define Redis auth/TLS, TLS termination, secret ownership/rotation, and
   firewall rules.
2. Extend shared validation, safe errors, and rate limits to every admin write; align admin JWT
   lifetime and secure session policy; define least-privilege roles and sensitive-action audit before
   multi-operator or T7 research use.
3. Preserve and complete T6/T8: canonical ordering/route/freshness semantics, stale/offline/no-service
   recovery, public live-count/Marker/ETA consistency, and a route-switch guard that restores a Marker
   only after a newer canonical `live` state; verify this with focused and browser/runtime evidence.
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
`bash scripts/ci-checks.sh` passed at this evidence baseline, including backend boundary/redaction,
T6, Prisma, Compose parsing, frontend lint/build, and workflow validation; frontend lint retains two
pre-existing warnings. No focused local-expiry/route-switch fixture, stateful migration, backup
restore, deployment, browser session, physical device, firmware, TTN console, live public traffic,
penetration test, dependency advisory scan, production logs/metrics, or alert delivery was observed.

Confidence is **high** for the No-Go decision and repository-visible readiness gaps because all current
predecessor audits converge on the same blockers. Confidence is **medium** for implementation order
and effort, and **low** for external runtime/device/provider behavior.

## 9. Handoff and Roadmap Impact

Production Readiness is **Complete / Validated** at
`4d5a456a6d73ef5a58d674426ba889f43102a9d2`. This validates the release synthesis, not T8 closure:
the next implementation must repair and verify the route-switch Marker recurrence within T8's approved
public-state scope before any dependent task claims eligibility. This report does not implement code,
modify the roadmap, or change an owner decision.
