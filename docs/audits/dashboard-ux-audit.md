# Dashboard & UX Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 671b71209ad3ba3341de78f836b6ec057813280c
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture/Backend/Frontend/Infrastructure & Device audits, docs/decision-queue.md, docs/research/, roadmap/task records, shuttle-tracking-web/app/, shuttle-tracking-web/components/, shuttle-tracking-web/hooks/, shuttle-tracking-web/services/, shuttle-tracking-web/types/, shuttle-tracking-web/utils/, and shuttle-tracking-web/tests/
- Reviewed at: 2026-08-01T13:45:00+07:00
- Validation state: Validated
- Predecessor baselines: Product, Frontend, and Infrastructure & Device @ 671b71209ad3ba3341de78f836b6ec057813280c

## 1. Executive Summary

The repository has three deliberately separate UI audiences: a canonical-only public rider map, an authenticated but limited admin/master-data dashboard, and no current research dashboard. T8 is resolved for the limited rider projection: the map will not present a locally expired/non-live vehicle as live, and tests cover expiry, route switch, and newer-live restoration.

D-001=C requires more than that projection. Riders still do not receive a clear service/no-service/recovery explanation. Admins lack route-stop composition, source/device health, trip/history/timeout exceptions, Mobile recovery, feedback triage, and role-specific actions. The research scope remains a future authenticated developer surface and must not be exposed through public/admin operations pages.

The owner has requested a public-theme Dashboard redesign, but its information hierarchy and visual acceptance belong to T14 after a bounded dashboard brief. T10-T12 must first deliver their respective operations/data-policy contracts; this audit does not authorize an unbounded redesign.

## 2. Scope and Freshness

This profile reviews information architecture, truthfulness, separation of public/operations/research surfaces, loading/error/accessibility states, and task placement. It is not a browser usability study, accessibility certification, user research, device/pilot, or production service test.

Product, Frontend, and Infrastructure & Device are validated at 671b712. The prior UI implementation is reinterpreted under D-001=C, D-005=B, D-007, D-008 and the Dashboard direction. No new UI source implements these C-scope capabilities.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public expired/non-live Marker could overstate service | Resolved | T8 canonical projection and synthetic tests remove Marker/count/ETA at expiry and prevent route-switch recurrence until newer live state. |
| Public rider state was fully explanatory | Still Present | Neutral marker/count/ETA behavior does not identify disconnected, stale, no service, dependency failure, last update age, or recovery. |
| Admin live map had no state visibility | Partially Resolved | LiveMap displays connection and live/stale/no-service/unknown counts, including stale last-known visualization. It is not exception-first and has no readiness/action path. |
| Admin dashboard was an accountable operations surface | Still Present | Static green label and master-data counts coexist with no source health, trip exceptions/history, route publishing, feedback queue, or recovery actions. |
| Route-stop management journey existed | Still Present | Admin navigation contains dashboard, vehicles, routes and stops only; ordered composition/reorder/publish is absent. |
| Feedback capture had staff triage/privacy journey | Still Present | Rider form has local loading/validation/error/success, but no receipt, notice, triage, assignment, resolution, SLA or deletion controls. |
| Research data had an appropriate dashboard | Still Present | No research route/UI has session/source/time filters, metric definitions, sample counts, uncertainty labels, drill-down or bounded export. Existing absence preserves the no-raw-public invariant. |
| Role-specific UX enforced the new hierarchy | Still Present | Current admin UI has no DEV/SUPER_ADMIN/ADMIN capability rendering. It must follow server authorization rather than duplicate policy client-side. |
| Dashboard public-theme direction had a bounded specification | Still Present | Direction is recorded, but exact target screens, priority questions/actions, shared tokens and accessible visual acceptance remain unbounded. T14 owns it. |

## 4. Audience and Information Boundary

| Audience | Allowed present/future information | Prohibited/required separation |
|---|---|---|
| Public rider | Canonical route/stops/live state, neutral ETA, feedback and truthful service messaging. | No source identity, raw telemetry, credentials, research comparison, unrestricted history or admin actions. |
| ADMIN operations | Authorized route publishing, source/device/trip exception and feedback workflow data. | Must be server-authorized; not raw research diagnostic data or higher-privilege deletion/export by default. |
| SUPER_ADMIN/DEV | Approved privileged actions and separate research surfaces. | Controls depend on D-007 pending lifecycle/re-auth/audit/restore policy; no implicit UI authority. |
| Research developer | Session-scoped metrics/aggregates, data definitions, limitations, bounded exports. | Separate route/auth; displayed route conformance and reported accuracy must not be labeled ground truth. |

## 5. Required UX Task Placement

- T10 needs a route-detail operations journey: ordered stops, add/remove/reorder, invalid-order feedback and a post-save public-read confirmation. It should remain narrower than T14 styling.
- T11 needs compact authenticated operations paths for active/auto-closed trips, protected history/detail, stale/silent exception, Mobile claim/revoke and audited emergency recovery only after backend APIs and Android acceptance evidence exist. Do not place driver runtime or sender secret entry in Admin UI.
- T12 is blocked by policy. Its feedback inbox/status/assignment and source/device operations views must render only approved role actions and clear privacy/retention/deletion/restore controls.
- T14 owns the public-theme Dashboard visual system and hierarchy: its brief must identify questions/actions, system/error states, responsive/accessibility criteria, and research/operations separation before styling work.

## 6. UX Risks and Recommendations

Public map error/retry remains implicit; route/geolocation failures mostly log or alert. The admin dashboard's Live System Active badge is not coupled to readiness or socket health. Admin/public realtime code is duplicated, so their state models may drift. Browser accessibility is not verified; map interaction, icon-only controls, modal focus, colour alone, responsive density, external tiles, and dynamic error announcements need targeted testing before a C-scope claim. Any future research view must show sample count, missingness, p50/p95 definition, units/timezone, retention, excluded data, provenance and uncertainty near aggregates.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 remains blocked by D-008. T10 can proceed only after final prerequisite audits/roadmap and exact task handoff. T11 needs backend/role/lifecycle and external Android evidence; T12 remains owner-policy blocked. T14 remains a separate later task, not a substitute for the required C-scope operations. No new owner decision is proposed.

Confidence is High for source-visible UI separation and missing journeys, Medium for T8 synthetic journey evidence, and Low for accessibility, user comprehension, real operations, devices, and deployed service behavior.

## 8. Handoff

Dashboard & UX is validated at 671b712. Security, DevOps & Observability is now eligible; it must consume every validated domain report before Production Readiness.
