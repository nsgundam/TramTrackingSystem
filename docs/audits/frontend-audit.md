# Frontend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 671b71209ad3ba3341de78f836b6ec057813280c
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture/Backend audits, docs/decision-queue.md, docs/roadmap/master-refactoring-roadmap.md, docs/tasks/, shuttle-tracking-web/app/, shuttle-tracking-web/components/, shuttle-tracking-web/contexts/, shuttle-tracking-web/hooks/, shuttle-tracking-web/services/, shuttle-tracking-web/types/, shuttle-tracking-web/utils/, shuttle-tracking-web/package.json, and shuttle-tracking-web/tests/
- Reviewed at: 2026-08-01T13:00:00+07:00
- Validation state: Validated
- Predecessor baselines: Discovery, Product, Architecture, and Backend @ 671b71209ad3ba3341de78f836b6ec057813280c

## 1. Executive Summary

The public tracker consumes the canonical state contract and T8 is resolved for its approved projection: native and isolated Playwright tests cover an initial live Marker/count, local expiry removal, route switch non-restoration, and restoration only after a newer authoritative live state. Raw research data and credentials are not exposed to riders.

D-001=C changes the release expectation, not the existing frontend behavior. There is still no public service-state/recovery explanation, route-stop management UI, sender/claim/trip-history/exception UI, feedback triage UI, source/device operations UI, or authenticated research dashboard. The current dashboard has useful Socket.IO connection and service-state summaries, but its static Live System Active label and master-data count do not make it an accountable operations surface.

D-007 provides a future role direction, while the UI currently has a single admin token experience. UI hiding is not a substitute for server authorization. The requested public-theme Dashboard redesign belongs to the later T14 scope after Dashboard & UX produces its information hierarchy; it does not authorize broad styling work in T10-T12.

## 2. Scope and Freshness

This re-audit covers public/admin state ownership, REST/Socket lifecycle, loading/failure/permission behavior, configuration, route/geometry/ETA presentation, and relevant tests. It does not certify accessibility, load, browser/device/runtime, deployed origin, or provider behavior.

The preceding Frontend report contains T8 evidence through 2e499df. The profile is revalidated against 671b712 because Product/Architecture/Backend conclusions and D-001=C, D-005=B, D-007, D-008, and T11 constraints alter future scope. No source change after T8 implements C-scope frontend capabilities.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public canonical state/version ownership was missing | Resolved | Hydration and Socket.IO updates accept V1 canonical state with epoch/version ordering and backend route authority. |
| Locally expired live state could leave a Marker/count/ETA visible | Resolved | T8 projects local expiry consistently and its deterministic plus isolated-browser tests cover expiry and newer-live restoration. |
| Route switching could restore stale/expired Marker | Resolved | Marker eligibility requires current live state, known matching route authority, and no local expiry; T8 tests cover R01 to R02 to R01. |
| Public connection/service failure is explained to riders | Still Present | The public socket hook silently reconnects/hydrates; route/API failure has no persistent rider recovery state or C-scope no-service explanation. |
| Route-stop management UI existed | Still Present | Sidebar and admin pages expose only dashboard, vehicle, route, and stop master data; no ordered route-stop composition/reorder/publish view exists. |
| Admin sender/trip/history/exception operations existed | Still Present | No pages/components exist for device/source status, Mobile claim/revocation, active/timeout trips, history, or force-close. |
| Feedback had accountable triage | Still Present | The public form has local states but no staff inbox, status, assignment, resolution, privacy notice, receipt, or deletion controls. |
| Admin role-specific UX enforced D-007 | Still Present | Cookie/token UI does not implement DEV, SUPER_ADMIN, ADMIN capability rendering; backend authorization must remain authoritative. |
| Public/backend origin contract was settled | Partially Resolved | Hooks derive configured backend origin and strip API suffix, but duplicated localhost fallback remains until T9 topology/origin facts are approved. |
| Research dashboard exposed raw diagnostic work appropriately | Still Present | No Dev Dashboard exists; this correctly avoids exposing raw telemetry but leaves D-004 research UI incomplete. |

## 4. Surface Assessment

| Surface | Current behavior | C-scope gap |
|---|---|---|
| Public tracker | Canonical REST hydration, Socket.IO updates, route filtering, local expiry, Marker/count/ETA projection, route/stop map and feedback capture. | Explicit fresh/no-service/stale/recovery messaging and resilient retry states. |
| Public feedback | Validation, submit/error/success and vehicle fallback. | Privacy/IP notice, receipt, accountability/triage status; T12 waits for policy. |
| Admin shell/dashboard | Cookie-presence routing, API token, master-data counts, live map with connection/service-state summary. | Server-authorized role-specific navigation and accountable operations truth. |
| Admin routes/stops | Basic CRUD UI. | Ordered route-stop management, invalid-order feedback, published-read confirmation; T10. |
| Admin operations | None. | Device/source, claim, active/timeout exception, history and recovery paths; T11 and policy-gated T12. |
| Research/Dev | None. | Separate authenticated comparison dashboard, reproducible filters and metric labels; not part of T9-T12 unless a future task says so. |

## 5. Task Placement

- T9 remains blocked by D-008. Do not consolidate origins or change production fallback behavior without the topology contract.
- T10 needs a narrow route-detail composition UI connected to the new ordered server command. It must expose invalid order/membership failures and refresh the public route data after a successful save.
- T11 needs an operations UI only after backend authorization/lifecycle APIs and the external Android acceptance contract are specified. It must not embed an Android driver runtime or expose sender secrets/source identifiers.
- T12 is blocked by owner decisions. Future triage/device views require explicit role checks, privacy wording, retention/deletion controls, and action matrix rather than generic admin CRUD.

## 6. Usability and Technical Risks

Public tracker state remains broadly coordinated in useShuttleTracker, though supporting hooks isolate map/realtime pieces. Admin and public Socket lifecycles are independently implemented, so they can drift. Admin cookie-presence protection and static dashboard language are UI resilience/truthfulness issues; they are not authorization evidence. OSRM, Leaflet, geolocation, reconnect timing, accessibility, responsive behavior, marker density, and external tiles are unverified runtime dependencies.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is blocked; T10 may proceed after all required dependent audits and its exact-path contract. T11 requires fresh downstream evidence, backend contract/role gates, and external Android acceptance evidence. T12 is owner-policy blocked. T14 owns the public-theme Dashboard redesign after its own re-audit/brief; this audit does not merge it into the requested T9-T12 batch.

Confidence is High for source-visible canonical projection and missing UI surfaces, Medium for T8 synthetic test coverage, and Low for accessibility, production configuration, real Socket.IO failures, hardware, Android, and actual operator/rider outcomes.

## 8. Handoff

Frontend is validated at 671b712. Database is the remaining peer profile before Infrastructure & Device; Dashboard & UX must wait for Frontend and Infrastructure & Device.
