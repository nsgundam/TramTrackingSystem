# Backend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 671b71209ad3ba3341de78f836b6ec057813280c
- Evidence scope: docs/project-knowledge-base.md, Product and Architecture audits, docs/decision-queue.md, docs/research/, roadmap/task records, shuttle-tracking-backend/package.json, shuttle-tracking-backend/src/, shuttle-tracking-backend/prisma/, shuttle-tracking-backend/tests/, and scripts/ci-checks.sh
- Reviewed at: 2026-08-01T12:45:00+07:00
- Validation state: Validated
- Predecessor baselines: Discovery, Product, and Architecture @ 671b71209ad3ba3341de78f836b6ec057813280c

## 1. Executive Summary

The backend has coherent bounded ingestion for Mobile Socket.IO, ESP32 HTTP, and LoRaWAN/TTN webhook traffic. Each retains its own authentication boundary and converges on validation, source ownership, canonical selection, and Operations/Trip services. Sender JWTs bind source, vehicle, and credential version; Socket.IO revalidates writes. The public projection omits internal source identity.

T5/T6/T7 remain distinct: Operations owns transactional trip lifecycle and sampled canonical history; canonical-state owns versioned transient public/realtime state; research services record and query bounded raw diagnostic evidence. T8 changes only the frontend consumer, so it leaves these backend authorities unchanged.

D-001=C makes T10/T11/T12 product requirements but does not add their server capabilities. Current admin authentication validates a user identifier only; it does not enforce the D-007 role hierarchy. Current Trip and TrackingSource models lack Mobile installation/claim state, receipt-time lastAcceptedAt, close reason/closed-at, force-close audit, protected history reads, or feedback triage. These are separate implementation and owner-policy gates.

## 2. Scope and Freshness

This profile reviews routes, controllers, middleware, Socket.IO, validation, canonical/operations/research services, schema, errors, rate limits, and backend tests. It is not a running-service, penetration, provider, hardware, Android, or production topology test.

Architecture is validated at 671b712. There is no backend source change after the previous code baseline; the current re-audit is required because D-001=C, D-005=B, D-007, D-008, T11 constraints, and T8 consumer evidence change the required capability and acceptance interpretation. No policy document is counted as a code implementation.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Sender/trip identity was weak | Resolved | Sender claims bind source, vehicle, and credential version; HTTP/trip routes authenticate sender and Socket.IO revalidates on each write. |
| Three transports had divergent canonical paths | Resolved | Mobile Socket.IO, ESP32 HTTP, and TTN webhook enter transport-specific validation then shared observation/canonical processing. |
| Trip lifecycle had competing writers | Resolved | Operations owns start, virtual start, active-trip validation, end, vehicle repair, and sampled history transactions. |
| Raw research diagnostics were absent | Resolved | T7 stores bounded raw observations and exposes protected research/metric/export/lifecycle services separately from canonical public state. |
| Public state could be stale/consumer-owned | Partially Resolved | Canonical state has server receive-time freshness and explicit service states; T8 corrects frontend expiry projection. A C-scope public service-state explanation and operational exception surface remain absent. |
| Route-stop mutation does not invalidate public cache | Still Present | The shared cache invalidator covers route-stop keys, but route-stop create/delete do not call it and there is no validated reorder transaction. T10 owns the repair. |
| Role and least-privilege enforcement existed | Still Present | authenticateToken checks a non-sender userId; routes/controllers do not enforce the D-007 DEV, SUPER_ADMIN, ADMIN hierarchy. |
| Protected trip history and exception reads existed | Still Present | No route/controller offers filtered trip list/detail, timeout exception, or source freshness operations views. |
| Mobile enrollment/claim and D-005 lifecycle existed | Still Present | No installation identity, claim, receipt-time lastAcceptedAt, timeout scheduler/worker, close reason, closedAt, atomic force-close, or audit records exist. |
| Feedback triage lifecycle existed | Still Present | Public feedback capture has no authenticated list, assignment, status, resolution, retention, privacy notice, or deletion-control boundary. |
| TTN duplicate/identity compatibility is verified | Unable to Verify | The webhook handles documented payload shapes and secret validation; provider aliases, duplicate delivery, gateway behavior, and field delivery remain unavailable. |

## 4. Boundary Assessment

| Boundary | Current controls | Remaining C-scope requirement |
|---|---|---|
| Mobile Socket.IO | JWT handshake, per-write source/vehicle/version revalidation, acknowledgement and rate limit. | Separate Android acceptance contract, installation session/claim, reconnect/no-offline semantics, new lifecycle fields. |
| ESP32 HTTP | Sender JWT, parser, ownership and coordinate validation, shared processing. | Physical firmware/provisioning evidence and D-005 timeout behavior. |
| LoRaWAN/TTN webhook | Bearer secret, source-type check, decoded-payload parsing, shared processing. | Provider delivery/duplicate evidence and owner-controlled operations path. |
| Admin REST | JWT identity check, newer parsers/rate limits on selected routes. | Reusable D-007 authorization; approved account/credential/deletion/re-authentication policy before enforcement. |
| Research reads/export | Research access middleware, bounded/session-scoped fixed-field API and lifecycle records. | Preserve research-only access; do not reuse as public/admin operations views. |

## 5. Required Task Placement

- T9 is blocked: do not change origins, proxy trust, CORS, Socket.IO, secrets, or production readiness without D-008 topology/ownership facts.
- T10 should add a validated ordered route-stop command and invalidate public cache after the successful transaction. It must test the next public read and rejected invalid order.
- T11 must extend Operations and schema atomically. Timeout, sender observation, normal end, and emergency force-close must share lock/order and idempotency rules; only accepted observations may update backend receipt-time lastAcceptedAt. Existing sender routes cannot be relabelled as the approved Mobile product.
- T12 is blocked pending feedback/support/privacy/deletion and device-action policy. Its future endpoint authorization must use the approved role matrix and keep raw research data isolated.

## 6. Reliability, Security, and Observability

Canonical state and latest source snapshots remain Redis-backed and transient. Source-health and canonical freshness use related but distinct stored facts; process-local sweeps and global Socket.IO publication lack distributed ownership, replay, and capacity evidence. Boundary errors are typed in key paths, rate limits cover key sender/admin/feedback routes, and logs are designed to avoid secrets/continuous coordinates. Legacy CRUD validation/error consistency remains uneven. No conclusion about proxy address trust, TLS, backups, Redis recovery, external alerts, or production incidents is possible before T9/D-008.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 remains blocked by D-008. T10 has a bounded backend implementation path after the exact-path task contract. T11 needs its technical lifecycle parameters, fresh affected audits, external Android acceptance evidence, and any role-policy constraints that touch its paths; it is not implementation-ready from this audit alone. T12 remains owner-policy blocked. No new owner decision is proposed.

Confidence is High for code-visible backend boundaries and missing server models, Medium for checked-in test evidence, and Low for running infrastructure, concurrency under load, Redis recovery, devices, TTN, Android, and production operations.

## 8. Handoff

Backend is validated at 671b712. Frontend and Database remain independently eligible re-audits; Infrastructure & Device must wait until all three are validated.
