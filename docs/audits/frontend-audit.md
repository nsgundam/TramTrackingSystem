# Frontend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 6697acbd62c740039722769588b1c464231e5ce1 plus approved D-009/D-010:A and the current T12 implementation working tree
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture/Backend audits, docs/decision-queue.md, docs/roadmap/master-refactoring-roadmap.md, docs/tasks/, shuttle-tracking-web/app/, shuttle-tracking-web/components/, shuttle-tracking-web/contexts/, shuttle-tracking-web/hooks/, shuttle-tracking-web/services/, shuttle-tracking-web/types/, shuttle-tracking-web/utils/, shuttle-tracking-web/package.json, and shuttle-tracking-web/tests/
- Reviewed at: 2026-08-01T14:45:45+07:00
- Validation state: Validated
- Predecessor baselines: Discovery, Product, Architecture, and Backend @ 6697acbd62c740039722769588b1c464231e5ce1 plus their T12 implementation re-audit addenda

## 1. Executive Summary

The public tracker consumes the canonical state contract and T8 is resolved for its approved projection: native and isolated Playwright tests cover an initial live Marker/count, local expiry removal, route switch non-restoration, and restoration only after a newer authoritative live state. Raw research data and credentials are not exposed to riders.

D-001=C changes the release expectation. T10 adds authenticated route-stop management and T12 adds
the bounded feedback inbox and safe read-only source-health page. There is still no public service-
state/recovery explanation, sender/claim/trip-history/exception UI, or authenticated research dashboard.
The current dashboard has useful Socket.IO connection and service-state summaries, but its
static Live System Active label and master-data count do not make it an accountable operations surface.

D-007 provides a future role direction, while the UI currently has a single admin token experience. UI hiding is not a substitute for server authorization. The requested public-theme Dashboard redesign belongs to the later T14 scope after Dashboard & UX produces its information hierarchy; it does not authorize broad styling work in T10-T12.

## 2. Scope and Freshness

This re-audit covers public/admin state ownership, REST/Socket lifecycle, loading/failure/permission behavior, configuration, route/geometry/ETA presentation, and relevant tests. It does not certify accessibility, load, browser/device/runtime, deployed origin, or provider behavior.

The preceding Frontend report contains T8 evidence through 2e499df. T10 adds `RouteStopsModal` and
Routes-page integration, while D-009 sets the future feedback/device-view policy. T10 lint/build/CI
evidence is available, but no admin browser mutation against a database/cache target was authorized.
D-009 is not a UI implementation.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public canonical state/version ownership was missing | Resolved | Hydration and Socket.IO updates accept V1 canonical state with epoch/version ordering and backend route authority. |
| Locally expired live state could leave a Marker/count/ETA visible | Resolved | T8 projects local expiry consistently and its deterministic plus isolated-browser tests cover expiry and newer-live restoration. |
| Route switching could restore stale/expired Marker | Resolved | Marker eligibility requires current live state, known matching route authority, and no local expiry; T8 tests cover R01 to R02 to R01. |
| Public connection/service failure is explained to riders | Still Present | The public socket hook silently reconnects/hydrates; route/API failure has no persistent rider recovery state or C-scope no-service explanation. |
| Route-stop management UI existed | Resolved | The authenticated Routes page launches `RouteStopsModal`, which loads current order and active stops, prevents duplicate local selection, supports add/remove/reorder, reports errors, and publishes the full list. Build/lint/CI passed; no ambient admin browser workflow was run. |
| Admin sender/trip/history/exception operations existed | Still Present | No pages/components exist for device/source status, Mobile claim/revocation, active/timeout trips, history, or force-close. |
| Feedback had accountable triage | Partially Resolved | T12 adds the notice/receipt, Super Admin/Dev inbox, case transitions, password-confirmed delete/restore, and safe health page. Browser staff/rider acceptance remains unavailable. |
| Admin role-specific UX enforced D-007 | Partially Resolved | Session hydration receives the server role and navigation hides the feedback inbox from ADMIN. Backend authorization remains authoritative and general role management is out of scope. |
| Public/backend origin contract was settled | Partially Resolved | Hooks derive configured backend origin and strip API suffix, but duplicated localhost fallback remains until T9 topology/origin facts are approved. |
| Research dashboard exposed raw diagnostic work appropriately | Still Present | No Dev Dashboard exists; this correctly avoids exposing raw telemetry but leaves D-004 research UI incomplete. |

## 4. Surface Assessment

| Surface | Current behavior | C-scope gap |
|---|---|---|
| Public tracker | Canonical REST hydration, Socket.IO updates, route filtering, local expiry, Marker/count/ETA projection, route/stop map and feedback capture. | Explicit fresh/no-service/stale/recovery messaging and resilient retry states. |
| Public feedback | Validation, submit/error/success, vehicle fallback, privacy notice, and no-reply receipt. | Runtime privacy/retention acceptance. |
| Admin shell/dashboard | Session role hydration, API token, master-data counts, live map with connection/service-state summary, role-aware inbox/health navigation. | Dashboard exception-first truth and accessibility evidence. |
| Admin routes/stops | CRUD UI plus T10 ordered route-stop management. | The modal exposes local order/membership errors; an approved stateful browser/cache target is still needed for published-read confirmation. |
| Admin operations | Safe read-only source health and Super Admin feedback triage. | Claim, active/timeout exception, history, and recovery paths remain T11. |
| Research/Dev | None. | Separate authenticated comparison dashboard, reproducible filters and metric labels; not part of T9-T12 unless a future task says so. |

## 5. Task Placement

- T9 remains blocked by D-008. Do not consolidate origins or change production fallback behavior without the topology contract.
- T10 is complete for its narrow route-detail composition UI; preserve server-side validation and record stateful published-read evidence only on an approved target.
- T11 needs an operations UI only after backend authorization/lifecycle APIs and the external Android acceptance contract are specified. It must not embed an Android driver runtime or expose sender secrets/source identifiers.
- T12 has D-009 policy. Future triage/device views require explicit server role checks, privacy wording, retention/deletion controls, and read-only safe DTOs rather than generic admin CRUD.

## 6. Usability and Technical Risks

Public tracker state remains broadly coordinated in useShuttleTracker, though supporting hooks isolate map/realtime pieces. Admin and public Socket lifecycles are independently implemented, so they can drift. Admin cookie-presence protection and static dashboard language are UI resilience/truthfulness issues; they are not authorization evidence. OSRM, Leaflet, geolocation, reconnect timing, accessibility, responsive behavior, marker density, and external tiles are unverified runtime dependencies.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is blocked; T10/T12 are complete for exact scopes. T11 requires backend contract/role gates and
external Android acceptance evidence. T12 browser role/accessibility acceptance is still unverified.
T14 owns the public-theme Dashboard redesign after its own re-audit/brief.

Confidence is High for source-visible canonical projection and missing UI surfaces, Medium for T8 synthetic test coverage, and Low for accessibility, production configuration, real Socket.IO failures, hardware, Android, and actual operator/rider outcomes.

## 8. Handoff

Frontend is validated at 671b712. Database is the remaining peer profile before Infrastructure & Device; Dashboard & UX must wait for Frontend and Infrastructure & Device.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: feedback notice, accountable inbox, and safe source health UI were absent — Partially
Resolved.** `FeedbackModal` now makes the one-way/non-emergency/business-day privacy contract visible
before submit and gives an accurate no-reply receipt. New role-aware navigation leads `SUPER_ADMIN`/
`DEV` to a feedback inbox and `ADMIN` or higher to the separate source-health page. The inbox asks for
the current password before delete/restore and only sends selected deletion reasons; the health page
has no actions or forbidden data fields.

**Finding: the client had no role-aware session representation — Resolved for T12 navigation.** Login,
rehydration through `/api/auth/me`, and re-authentication carry the role supplied by the server.
Client hiding is supplemental only; the backend controls authorization. Frontend lint/build and the
repository CI pass, but no browser session with a migrated database account was authorized, so
permission/accessibility/usability outcomes remain unverified.
