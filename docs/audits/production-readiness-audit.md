# Production Readiness Re-audit: Tram Tracking System

Re-audited: 2026-07-19

## 1. Executive Summary

**Determination: Not Ready** for production use with real vehicles, real drivers, and public riders.

The repository demonstrates a credible controlled MVP. It has a public map, basic admin CRUD, authenticated source-bound sender sessions, canonical source selection, sampled PostGIS history, and production-mode Compose artifacts. These are meaningful foundations, but they do not yet form a service that can be responsibly relied upon for public transport decisions.

The blockers are systemic rather than cosmetic. The system cannot consistently prove that a displayed vehicle is current, correctly routed, and associated with one operational trip; operators cannot run the required route, driver, history, and exception workflows; sensitive data can escape through device APIs/logs; public write paths lack basic abuse controls; and no deployed topology, recovery process, CI gate, or monitoring path is evidenced. A supervised demonstration is a valid learning milestone. It is not the same release standard as real vehicles, drivers, and public users who may act on incorrect information.

The smallest responsible next release target is a **controlled demonstration or pilot**, not daily service or public launch, unless the owner explicitly selects and funds the broader D-001 scope.

## 2. Audit Coverage

All required inputs are available and marked Complete in the Audit Register. No required audit is missing, stale, blocked, or unvalidated.

| Input | Last reviewed | Validation state | Readiness implication |
|---|---:|---|---|
| Knowledge Base | 2026-07-18 | Current discovery evidence | Describes repository-visible system; deployed/mobile/hardware evidence remains unavailable. |
| Product Audit | 2026-07-19 | Complete | Controlled MVP only; operational workflows remain incomplete. |
| Architecture Audit | 2026-07-19 | Complete | Monolith is appropriate; canonical state and Operations/Trip ownership remain open. |
| Backend Audit | 2026-07-19 | Complete | Sender boundary improved; lifecycle, safe device DTOs, and observation contract remain open. |
| Frontend Audit | 2026-07-19 | Complete | Feedback capture is current; route correctness and truthful realtime state are not. |
| Database Audit | 2026-07-19 | Complete | Partial active-trip index exists; lifecycle transition and history semantics remain incomplete. |
| Infrastructure & Device Audit | 2026-07-19 | Complete | Production Compose is structurally credible; deployment, device, and provider runtime are unverified. |
| Dashboard & UX Audit | 2026-07-19 | Complete | Feedback UX improved; operational visibility and truthful status remain open. |
| Security, DevOps & Observability Audit | 2026-07-19 | Complete | Sender authentication improved; leakage, abuse controls, CI, and monitoring remain High risks. |

Coverage is high for a repository-based release decision. Confidence is deliberately lower for live deployment, mobile/device behavior, load, recovery, and public usability because none was observed.

## 3. Consolidated Critical & High Findings

### 1. Operators cannot run the core daily-service workflow

### Problem

Route-stop management, a supported driver/sender workflow, admin trip history, operational device visibility, and exception handling are missing or API/simulator-only. Public feedback capture exists, but staff feedback triage is absent.

### Source Audit

Product Audit, sections 1, 7, 8, and 9; Frontend Audit, sections 4, 6, and 12; Dashboard & UX Audit, sections 3, 7, and 10.

### Cross-Cutting

Yes — Product, Frontend, Dashboard & UX, Backend, Database, and Infrastructure & Device.

### Priority

Critical for daily operations; High for broader public support workflows.

### Blocking for Production

Yes.

### Related Files

Product and frontend reports identify the route, trip, device, feedback, and dashboard surfaces; Backend Audit section 12 identifies missing history reads.

### 2. Canonical vehicle state is not a trustworthy, end-to-end operational contract

### Problem

Source priority/freshness selection exists, but canonical updates do not provide a versioned fresh/stale/offline state or a selection reason. Clients do not show socket lifecycle, last update age, stale/no-service state, or a truthful dashboard health indicator. The public client can initially assign a vehicle to the selected rider route rather than authoritative route data.

### Source Audit

Architecture Audit, sections 5 and 7; Backend Audit, sections 8 to 10; Frontend Audit, sections 4, 7, and 9; Dashboard & UX Audit, sections 5 and 10.

### Cross-Cutting

Yes — Architecture, Backend, Frontend, Dashboard & UX, Product, Database, and Infrastructure & Device.

### Priority

High.

### Blocking for Production

Yes.

### Related Files

Canonical-state, tracking, public map, and admin live-map paths referenced in the Architecture, Backend, Frontend, and Dashboard & UX reports.

### 3. Trip lifecycle and accountable history are not transactionally owned

### Problem

Trip start/end and tracking logic have competing writers. The database partial unique index prevents duplicate active rows, but application writes are not one atomic transition, retries are not idempotent, and there is no protected trip/history read workflow. Sampled history can fail after a sender acknowledgement and no high-fidelity event/order contract exists.

### Source Audit

Architecture Audit, section 5; Backend Audit, sections 5, 7, and 11; Database Audit, sections 1, 10, 12, and 13; Product Audit, section 7.

### Cross-Cutting

Yes — Architecture, Backend, Database, Product, and Frontend.

### Priority

High, with Product Audit treating operator trip history as Critical for daily operations.

### Blocking for Production

Yes.

### Related Files

Operations/Trip controller/service, trip migration/index, gps_tracks, and future admin history read paths cited by the source audits.

### 4. Device secrets and configuration credentials can leak, and public write paths lack abuse controls

### Problem

Device APIs serialize secretHash, Redis connection logging can expose a credential-bearing URL, and login, feedback, sender-login, and ingestion endpoints have no evidenced rate or request-size limits. Shared validation and safe error mapping are also incomplete.

### Source Audit

Security, DevOps & Observability Audit, sections 4, 6, 7, 13, and 16; Backend Audit, sections 5 and 6.

### Cross-Cutting

Yes — Security, Backend, Infrastructure & Device, and public feedback/product workflows.

### Priority

High.

### Blocking for Production

Yes.

### Related Files

Device controller response paths, Redis configuration logging, server/auth/ingest/feedback routes, as identified in Security and Backend reports.

### 5. The deployment artifact is not an operated production service

### Problem

Production Compose/images, secrets checks, migrations, readiness, and restart policies are present, but no selected host, domain, TLS/reverse proxy, origin matrix, backup/restore policy, Redis durability policy, migration rollback/runbook, log destination, or operational owner is evidenced. Frontend production build was not conclusively verified in the audit round.

### Source Audit

Infrastructure & Device Audit, sections 1, 4, 5, and 11; Security, DevOps & Observability Audit, sections 9 to 15; Frontend Audit, Scope, Evidence, and Re-audit Status.

### Cross-Cutting

Yes — Infrastructure & Device, Security/DevOps/Observability, Frontend, Architecture, and D-003.

### Priority

High.

### Blocking for Production

Yes.

### Related Files

docker-compose.prod.yml, Dockerfiles, entrypoint, environment templates, frontend build configuration, and D-003 references cited by source audits.

### 6. There is no reliable evidence for real-device operation or repeatable integration exercise

### Problem

The mobile and TTN simulator defaults conflict with seeded tracking-source fixtures. No mobile application, ESP32 firmware, TTN provider/application, physical device, provisioning procedure, or live delivery/reconnect evidence exists.

### Source Audit

Infrastructure & Device Audit, sections 1, 4, 6 to 9, and 11; Product Audit, sections 4 and 7; Architecture Audit, section 9.

### Cross-Cutting

Yes — Infrastructure & Device, Product, Architecture, Backend, and Security.

### Priority

High for device validation and Critical for a release that claims real driver/device operation.

### Blocking for Production

Yes.

### Related Files

Simulator, seed, TTN/webhook, and ingestion paths identified by Infrastructure & Device Audit.

### 7. Public map correctness can be stale even when backend data is correct

### Problem

Route geometry cache validity excludes stop order and coordinates; route-stop mutations also lack backend cache invalidation. The public tracker owns geometry, snapping, ETA, and initial route assignment.

### Source Audit

Frontend Audit, sections 4, 5, and 9; Backend Audit, sections 5, 9, and 12; Product Audit, section 7; Architecture Audit, section 5.

### Cross-Cutting

Yes — Frontend, Backend, Product, and Architecture.

### Priority

High.

### Blocking for Production

Yes for route-specific ETA/location claims.

### Related Files

Public tracker/cache paths and route-stop mutation/cache paths cited by Frontend and Backend audits.

### 8. No CI, metrics, alerting, or error-tracking path can detect failure before users do

### Problem

Local build/lint/test commands and readiness endpoints exist, but no automated CI gate, structured/redacted logs, metrics, source-staleness alert, error tracker, deployed monitor, or recovery drill is evidenced.

### Source Audit

Security, DevOps & Observability Audit, sections 9 to 16; Infrastructure & Device Audit, sections 4, 5, and 12; Backend Audit, section 11.

### Cross-Cutting

Yes — Security/DevOps/Observability, Infrastructure & Device, Backend, Dashboard & UX, and Product.

### Priority

High.

### Blocking for Production

Yes.

### Related Files

Package scripts, Docker entrypoint, server readiness/tracking paths, and Compose artifacts identified by source audits.

## 4. Cross-Cutting Risks

1. **Operational truth failure.** Canonical-state ambiguity, socket/UI freshness gaps, static health labels, stale route geometry, and incorrect initial route association can all make a map look authoritative while it is wrong or old. This is more serious than any individual UI defect because it affects rider decisions and operator response.

2. **Incomplete operational ownership.** Split trip writers, missing history reads, absent driver workflow, no route-stop manager, and no exception dashboard mean a developer remains part of the operating model. A system is not operationally ready merely because its APIs exist.

3. **Security and operability blind spot.** Secret-hash exposure, credential-bearing log output, unbounded public writes, no CI, and no monitoring combine into a preventable incident pattern: the team may neither prevent a problem nor discover it promptly.

4. **Unverified edge-to-core pipeline.** Server-side source boundaries and canonical selection are good foundations, but simulator mismatch and absent physical/mobile/TTN evidence mean the true input path is not validated. This compounds the observation-order and freshness gaps.

5. **Configuration drift risk.** Multiple REST/Socket origin derivations, an unresolved D-003 order, unselected topology/TLS, and no deployment runbook create a credible path where images work locally but public traffic does not.

## 5. Contradictions Between Audits

| Topic | Findings | Resolution |
|---|---|---|
| Active-trip database guard | Backend Audit says no database invariant is present; Database Audit identifies migration unique_active_trip_per_vehicle. | The Database Audit is more specific and migration-based: the partial unique index exists. The production risk remains High because it does not make trip/vehicle/history transitions atomic or idempotent. |
| Production readiness of Compose | Infrastructure Audit calls production-mode Compose a credible structural base; Security and Infrastructure both say no deployed topology/monitoring/recovery evidence exists. | Not a conflict: the repository can build a reasonable base while still lacking proof that it is safely operated in production. |
| Sender authentication | The stale prior Production Readiness report featured weak/unauthenticated sender writes; refreshed Backend and Security reports mark sender JWT binding/revalidation and TTN secret boundary resolved. | This re-audit treats sender authentication as resolved for the controlled MVP. It does not remove the separate blockers for device hash exposure, rate limits, real-device evidence, and monitoring. |
| Public availability/no-service state | Dashboard & UX calls selected-stop no-vehicle wording partially improved; Frontend still marks operational freshness/no-service unavailable. | Not a material conflict: a local empty message is not a global canonical freshness or disconnection model. The broader readiness finding remains open. |

No unresolved contradiction requires a new user decision. The active-trip migration should be preserved and covered by the future integration test.

## 6. Readiness Scorecard

| Dimension | Status | Reason |
|---|---|---|
| Product Completeness | Not Ready | Core rider demo works, but route-stop, driver, trip-history, and service-exception workflows are missing for daily/public operation. |
| Architecture Soundness | Partially Ready | The monolith and source pipeline fit the MVP; canonical-state and Operations/Trip ownership are not complete. |
| Backend Reliability | Partially Ready | Authenticated sender boundary and readiness are credible; lifecycle transactionality, ordering/idempotency, validation, safe responses, and operational reads remain open. |
| Frontend Reliability | Not Ready | Public map can misassociate a route and does not communicate stale/disconnected state; route cache correctness is incomplete. |
| Data Layer Readiness | Partially Ready | PostGIS, constraints, and sampled history are sound for MVP; transaction boundary, event semantics, retention, and history read needs remain unresolved. |
| Infrastructure & Device Readiness | Not Ready | Production-mode containers exist, but no operated deployment, real sender/device evidence, or repeatable aligned simulator path is available. |
| User Experience Readiness | Not Ready | Feedback is usable, but ETA/live map/dashboard cannot truthfully communicate freshness, failures, or operational exceptions. |
| Security Readiness | Not Ready | Direct secret-hash/Redis-URL exposure and absent rate limits/validation are unacceptable for public production. |
| Operability | Not Ready | No CI deployment gates, structured redacted logs, monitoring, alerts, runbook, or recovery evidence is available. |

The scorecard intentionally distinguishes “partial” technical foundations from a production “ready” decision. A component can be sound enough for supervised MVP learning while the service as a whole remains unsuitable for people who depend on it.

## 7. Minimum Viable Production Bar

Before the system should be trusted with real vehicles, real drivers, and public users, all of the following must be evidenced as complete:

1. **Remove direct confidentiality and abuse blockers:** never return secretHash, redact Redis/config logging, implement route-specific rate/request-size limits, and apply shared input/error validation.
2. **Establish one accountable operations model:** transactional/idempotent single-active-trip lifecycle, explicit virtual-trip policy, protected trip-history read, and a supported driver/sender workflow or audited external dependency.
3. **Publish and consume canonical operational truth:** versioned route-aware vehicle state with timestamp, freshness/no-service reason, selection source, and event ordering rule; public/admin UI must show it and degrade ETA/markers when stale.
4. **Enable operator-managed service:** route-stop add/remove/reorder, accurate cache invalidation, and a minimal admin exception view for stale/silent vehicles and service health. If public feedback remains available, include a staff triage owner/workflow.
5. **Operate a real deployment safely:** selected topology with TLS/origins, secrets ownership, backups/restore, Redis policy, migrations/rollback/runbook, CI checks, readiness monitoring, error/log redaction, and alerting.
6. **Validate the actual edge-to-core path:** align fixtures, then run documented end-to-end sender/TTN integration checks; before physical rollout, validate the chosen real mobile/device/provider contract and failure/reconnect behavior.

This is a production bar, not a full roadmap. Playback, advanced analytics, broad reporting, partitions, microservices, and high-fidelity telemetry remain unnecessary unless D-001/D-002 expand the product promise.

## 8. Go / No-Go Determination

**No-Go: Not Ready.**

Do not launch as daily campus operations or public tracking with real vehicles/drivers/users on current evidence. The blockers include direct confidentiality exposure, lack of abuse controls, no trusted freshness model, incomplete operational lifecycle/workflows, no operated deployment/recovery evidence, and no monitoring/CI safety net.

A supervised, explicitly limited demonstration can continue only when it is not represented as a reliable transport service, uses known controlled senders, and accepts that current reports do not validate real production operation. That is a risk boundary, not a production exception.

## 9. Conditions for “Ready”

The determination can change to **Ready** only after the Minimum Viable Production Bar is implemented and independently validated with:

- automated CI checks and a passing production build;
- a disposable production-mode deployment/start/restart/readiness/backup-restore smoke exercise;
- sender and TTN/device integration evidence that matches registered fixtures;
- browser verification that public/admin state handles disconnect, stale, no-service, wrong-route prevention, and recovery truthfully;
- release evidence showing no secret hash/config URL disclosure and bounded public write traffic;
- an owner-selected D-001 scope, with D-002/D-003 resolved where their gates are invoked.

## 10. Audit Limitations

This is a synthesis of validated repository audits; it does not perform a new source review. No deployed environment, TLS configuration, backup restoration, load test, browser session, physical device, mobile app, TTN console, live public traffic, penetration test, dependency advisory scan, or production logs/metrics were observed. Frontend lint passed with six warnings; its production build was inconclusive because a retained .next lock prevented confirmation.

## 11. Handoff

The next audit/plan owner is the Master Refactoring Roadmap Agent. It should sequence the Minimum Viable Production Bar before optional scale, playback, analytics, or redesign work, and use D-001/D-002/D-003 as explicit gates.

## Roadmap Impact

Production Readiness confirms that the roadmap must place security leakage/abuse fixes, Operations/Trip ownership, canonical freshness, route-stop management/cache correctness, deployment topology, CI/observability, and real sender validation ahead of any public/daily launch. It does not modify the roadmap or create a new owner decision.

## Assumptions and Unknowns

- D-001 operating scope, D-002 telemetry retention/fidelity, and D-003 configuration sequencing remain pending.
- Controlled demonstration is not treated as public production.
- No runtime evidence confirms a real provider, device, browser, or recovery process.
- The partial active-trip unique index is assumed applied only after migration deployment is verified in the target environment.

## Confidence

**High** for the No-Go determination because independent refreshed audits converge on multiple High/Critical blockers. **Medium** for the exact effort/order to resolve them because deployed topology, owner scope, and real-device behavior are unknown.

## Pending Decisions

- **D-001 — Operational MVP release scope:** determines which operational workflows must be delivered before the next release.
- **D-002 — Telemetry retention and canonical-history fidelity:** required before promising playback, source comparison, or higher-fidelity investigation.
- **D-003 — T6/T16 production configuration dependency order:** required before finalizing the origin/topology implementation sequence.

No new decision is needed to remove leakage, add abuse controls, make lifecycle transitions atomic, publish freshness truthfully, or establish basic CI/monitoring.
