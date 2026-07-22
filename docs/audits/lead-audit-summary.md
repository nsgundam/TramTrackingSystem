# Lead Audit Summary

Last updated: 2026-07-22

Coordination status: **Discovery, Product, Architecture, Backend, Frontend, Database,
Infrastructure & Device, Dashboard & UX, Security, DevOps & Observability, and Production
Readiness validated; Roadmap next**.
These profiles have current evidence-baseline metadata. All later reports remain `Needs Re-audit`
until their predecessor and freshness gates pass; do not use their historical completion claims as
current sign-off.

## 1. Executive Summary and Changes Detected

Discovery is validated as of `2026-07-22` at baseline
`847a18cce9bc27c82b2622dbc176b3a89bc4d037`. It confirms the current public/admin/sender/provider
boundaries, T5's transactional Operations/Trip service, aligned simulator/seed fixtures, and the
remaining repository-visible gaps around raw history, health truth, API-only workflows, and missing
external deployment/device evidence.

Product is now validated at the same baseline. It confirms the approved D-001=A controlled-demo
boundary: public tracking and feedback capture are present, but route-stop operations, a supported
sender surface, trip history, feedback triage, source health, truthful stale/offline states, and the
D-004 research dashboard are absent or incomplete.

Architecture is now validated at the same baseline with both predecessors current. It confirms that
T5 now centralizes transactional trip lifecycle/history ownership, while canonical current state is
still Redis-only, raw/event-time research evidence is absent, public stale/offline semantics are
incomplete, and the client still supplies route/ETA intelligence. T6 is the next architectural
contract; it must precede map truthfulness and approved research implementation.

Backend, Frontend, and Database are now validated at the same baseline. Backend confirms T5
integration, transport-specific authentication, and shared ingest convergence while ordering/raw
diagnostics, operational reads, and route-stop cache invalidation remain open. Frontend confirms the
route-geometry cache improvement but still finds no realtime freshness/reconnect model, authoritative
route assignment, or research/operations surfaces. Database confirms T5 lifecycle constraints while
sampled-only history, timestamp semantics, retention, and source-assignment history remain open.

Infrastructure & Device is now validated at the same baseline. It confirms the self-hosted Compose
and compiled production image foundation plus seed-aligned simulator/pipeline evidence, but no
deployed topology, TLS/origin contract, backup/recovery operation, TTN account, mobile app, ESP32
firmware, or physical/provider behavior. Production Compose still needs explicit health-gated
operations and protection of host-published data services before any broader release claim.

Dashboard & UX is now validated at the same baseline. It confirms a useful controlled-demo rider
tracker, basic admin master-data UI, improved current tour selectors, and feedback capture. It also
confirms that live/stale/offline state, evidence-based admin health, source/trip/feedback operations,
and the separate D-004 research dashboard are still absent or incomplete.

Security, DevOps & Observability is now validated at the same baseline. Sender and TTN trust
boundaries, device-response redaction, bounded inputs, Redis-backed rate limits, and repository CI
are evidenced. Production data-service isolation, durable alertable observability, admin session
policy, complete legacy admin-write protection, and deployed/provider/physical security evidence
remain open. The report introduces no new owner decision and keeps D-003's topology-before-origin
alignment order.

The prior Architecture, Backend, Database, Infrastructure & Device, Dashboard & UX, Frontend, and
Production Readiness conclusions remain historical evidence only. The current Security/DevOps/
Observability and Production Readiness reports are now validated; their controlled-MVP boundary,
stage-specific gates, and open production risks are current evidence. Roadmap Revalidation is next.

## 2. Audit Progress, Validated Findings, and Remaining Risks

- Discovery: **Complete / Validated** at the current baseline.
- Product: **Complete / Validated** at the current baseline; D-001=A remains the release boundary.
- Architecture: **Complete / Validated** at the current baseline; T5 lifecycle ownership is resolved,
  while canonical state, ordering, freshness, route authority, and research evidence remain gated by
  T6/T7.
- Backend: **Complete / Validated** at the current baseline; T5 and transport boundaries are current,
  while T6 ordering/state and protected operational reads remain open.
- Frontend: **Complete / Validated** at the current baseline; geometry-cache correctness improved,
  while freshness/reconnect, route authority, and missing operations/research surfaces remain open.
- Database: **Complete / Validated** at the current baseline; T5 integrity checks are current, while
  sampled history, retention, timestamps, and raw research data remain open.
- Infrastructure & Device: **Complete / Validated** at the current baseline; Compose/startup and
  simulator boundaries are current, while deployment, recovery, and physical/provider evidence are
  unavailable.
- Dashboard & UX: **Complete / Validated** at the current baseline; controlled-demo journeys and
  current gaps in freshness, exception-first operations, accessibility, and research separation are
  current.
- Security/DevOps/Observability: **Complete / Validated** at the current baseline; sender/TTN
  boundaries and redacted local signals are current, while production isolation, session policy,
  legacy admin writes, durable monitoring, and external deployment/device evidence remain open.
- Production Readiness: **Complete / Validated** at the current baseline; controlled demonstration is
  conditionally allowed under D-001=A, while research field trial, internal operations, and public
  rider service remain No-Go.
- Roadmap: **Needs Revalidation** after validated audits and approved decisions.

Remaining product risk: the system may appear suitable for operation while key workflows still
require manual/API-only/external-client work.

## 3. Conflicts, Decisions, and Recommended Next Action

Approved decisions carried forward:
- **D-001 (Approved A)**: Minimal controlled demonstration scope for MVP pilot testing.
- **D-002 (Approved B)**: Bounded raw diagnostics are approved for comparing 3 senders (Mobile, LoRaWAN, ESP32) for latency and accuracy research; parameters and implementation remain gated.
- **D-003 (Approved A)**: define topology/origin facts before configuration alignment; the historical
  T6/T16 cycle is closed and current roadmap T9 carries this order.
- **D-004**: Three-device research boundaries and authenticated Dev Dashboard scope.

All decision records have been moved from Pending to Approved in `docs/decision-queue.md`.

Discovery, Product, Architecture, Backend, Frontend, Database, Infrastructure & Device, Dashboard
& UX, Security/DevOps/Observability, and Production Readiness introduced no new owner decision. The
next action is Roadmap Revalidation/Synthesis, which must preserve the controlled-demo boundary unless
the owner changes D-001.

## 4. Confidence and Limitations

Confidence is High for repository-visible functionality, schema/configuration, and static UI states;
Medium for runtime lifecycle and integration because no database/Redis integration target was run in
this refresh; Low for real-world usability, deployment, physical devices, and TTN provider behavior.
