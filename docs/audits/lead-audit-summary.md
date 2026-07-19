# Lead Audit Summary

Last updated: 2026-07-20

## 1. Executive Summary and Changes Detected

Discovery is current as of 2026-07-18. Since the prior audit-document refresh, repository changes
include authenticated sender sessions, tracking-source lifecycle work, sender/trip/realtime changes,
production-mode Compose/startup work, feedback submission, and simulator/test additions.

The Product, Architecture, Backend, Database, Infrastructure & Device, Dashboard & UX,
Security/DevOps/Observability, Frontend, and Production Readiness Audits were re-run and validated
on 2026-07-19. The production determination is **Not Ready** for real vehicles, drivers, and public
riders. The product is a usable controlled tracking MVP, not yet a daily operations product. The
architecture remains an appropriate monolith, but needs a backend-owned canonical vehicle-state
contract and one Operations/Trip ownership boundary before it can support reliable operational
workflows.

## 2. Audit Progress, Validated Findings, and Remaining Risks

- Discovery: Complete.
- Product: Complete; prior feedback gap is Partially Resolved. Route-stop management, driver
  workflow, trip history, stale/offline visibility, and reports remain unresolved or incomplete.
- Architecture: Complete; source/vehicle identity is resolved, while source-health visibility,
  canonical-state durability/versioning, trip ownership, and telemetry policy remain open.
- Backend: Complete; prior sender-authentication and unsafe realtime-result findings are resolved.
  Trip ownership/idempotency, device-response hash exposure, validation/error contracts,
  route-stop cache invalidation, and observation ordering remain open.
- Database: Complete; tracking-source constraints and the partial active-trip unique index are
  present. The remaining risk is transactional lifecycle behavior around that guard, canonical GPS
  retention/fidelity, historical source meaning, and timestamp semantics.
- Infrastructure & Device: Complete; production-mode Compose, production images, migrations, and
  source/TTN boundaries are materially improved. Deployed topology, runtime operations, TTN
  registry, physical hardware, and fixture alignment remain open or unverified.
- Dashboard & UX: Complete; public feedback is now usable, but public/admin freshness, connection
  truthfulness, stale/offline visibility, and exception-first operations UX remain open.
- Security/DevOps/Observability: Complete; sender trust boundaries and production secret checks are
  improved. Device secret-hash exposure, Redis URL logging, abuse controls, CI, and minimum
  monitoring remain High risks before public/daily use.
- Frontend: Complete; public feedback capture is resolved. Route-stop operations, visible
  connection/freshness/no-service state, authoritative vehicle-route association, cache
  invalidation, and maintainable public-map boundaries remain open.
- Production Readiness: Complete; **No-Go** for daily/public production. Direct data/configuration
  leakage, abuse controls, operational truth, lifecycle/workflow, deployment, real-device, CI, and
  monitoring blockers must be resolved and validated before a Ready decision.

Remaining product risk: the system may appear suitable for operation while key workflows still
require manual/API-only/external-client work.

## 3. Conflicts, Decisions, and Recommended Next Action

Approved decisions (2026-07-20):
- **D-001 (Approved A)**: Minimal controlled demonstration scope for MVP pilot testing.
- **D-002 (Approved B)**: Bounded raw diagnostics retained to compare 3 senders (Mobile, LoRaWAN, ESP32) for latency and accuracy research.
- **D-003 (Approved A)**: T6 production configuration precedes T16 Socket/REST origin alignment.

All decision records have been moved from Pending to Approved in `docs/decision-queue.md`.

The Database re-audit reconciles the active-trip evidence: the database partial unique index exists;
the unresolved issue is the non-transactional lifecycle code around it. Infrastructure & Device
adds no new decision: D-003 governs production configuration/origin order and D-002 governs
telemetry fidelity. Dashboard & UX and Frontend both confirm that canonical freshness and source
health are not communicated truthfully to users. Frontend also establishes that rider route
selection is incorrectly used as the initial vehicle-route assignment. Production Readiness
consolidates these into a No-Go: the current service is limited to a controlled demonstration, with
security, operational-truth, lifecycle, deployment, and observability blockers before daily/public
use. The Master Refactoring Roadmap has been re-reviewed against the approved decision gates:
D-001=A defers daily/public workflows, D-002=B creates bounded diagnostics research work, and
D-003=A removes the topology/origin ordering cycle. The recommended next action is T1: remove
secret-hash and credential-bearing configuration exposure before any further pilot expansion.

## 4. Confidence and Limitations

Confidence is High for repository-visible product functionality, database boundaries, Compose
configuration, and static UI states; Medium for real-world usability and runtime operations. No
browser session, deployment, real mobile sender, IoT device, or TTN provider behaviour was observed.
