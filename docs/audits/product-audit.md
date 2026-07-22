# Product Audit: Tram Tracking System

Validation status: **Needs Re-audit**. This legacy report predates the current evidence-baseline
contract; roadmap task references inside it may use superseded numbering.

Last re-audited: 2026-07-19

## 1. Executive Summary

The product is a credible **tracking demonstration and controlled MVP**, not yet a complete daily
operations product. Riders can view live vehicles, stops, estimated arrival information, nearby
stops, and can now submit feedback. Administrators can manage vehicles, routes, and stops and see
a live map. The repository still lacks the workflows an operator needs to run service without
developer intervention: route-stop ordering, a driver-facing sender workflow, trip history,
device operations, feedback triage, and actionable service-health states.

The most meaningful product change since the previous audit is rider feedback: the public tracker
opens a feedback form and posts it to `POST /api/public/feedback`. This resolves the absence of a
submission channel, but not the full feedback workflow because no review, status, or assignment
surface exists for administrators.

Current product readiness:

- **Suitable now:** demonstration, usability testing, or a controlled pilot with a known operator
  and an externally supplied authenticated sender.
- **Before daily operations:** route-stop management, a supported driver/sender workflow, trip
  history, and explicit stale/offline operations visibility.
- **Before a broader rider launch:** decide the operational MVP scope in D-001; then include the
  corresponding feedback, service-status, and support workflow.

## 2. Scope, Evidence, and Re-audit Status

Scope: product value, user roles, journeys, functional completeness, and product roadmap impact.
This audit does not assess implementation quality, security, infrastructure, performance, or
deployment readiness.

Evidence inspected:

- `docs/project-knowledge-base.md` (Discovery refresh 2026-07-18)
- Previous `docs/audits/product-audit.md`
- `README.md`
- Public tracker, feedback, and admin route/dashboard/sidebar source
- Public feedback and route-stop API route definitions
- Git history since the prior audit-document refresh

| Prior finding | Current status | Current evidence |
|---|---|---|
| Route-stop management UI is missing | **Still Present** | Route-stop APIs exist, but the Knowledge Base and frontend route inventory show no route-stop page or sidebar entry. |
| A real driver/mobile workflow is missing | **Partially Resolved** | Sender authentication, trip APIs, and simulators are stronger, but no driver/mobile app is present. |
| Admin trip history is missing | **Still Present** | No trip/history page or route is found in the frontend inventory. |
| Feedback workflow is missing | **Partially Resolved** | Public `FeedbackModal` and `POST /api/public/feedback` now exist; admin review/list/status is absent. |
| Offline/stale operational visibility is missing | **Still Present** | Dashboard still presents counts and a live map; no operational stale/offline workflow is evidenced. |
| Reports and analytics are missing | **Still Present** | No product report/analytics page or workflow is present. |
| Device operations are incomplete | **Partially Resolved** | Backend tracking-source CRUD and analytics exist, but no administrator device page is present. |

## 3. Product Vision

The product helps university riders reduce uncertainty about shuttle location and arrival while
giving transport staff a place to maintain the operational data used by the public map. The
evidenced MVP is a public tracker plus basic administration, not a complete fleet-operations suite.

## 4. User Role Evaluation

### Public rider

Implemented: choose R01/R02, inspect route/stops/live vehicles, select a stop or vehicle, use
nearby-stop lookup, see ETA-style information, take the tour, and submit feedback.

Partial or missing: service hours, disruption/closure status, a clear stale/no-service state, and
confirmation that submitted feedback is reviewed.

### Administrator

Implemented: login, live-map dashboard, and CRUD for vehicles, routes, and stops.

Partial or missing: route-stop order, devices/tracking sources, trip history, feedback review,
alerts, reports, and day-to-day service exceptions.

### Driver, mobile sender, or device operator

Implemented: authenticated sender/trip/location contracts and simulator tooling.

Missing: a supported user-facing flow for assignment confirmation, start/end state, sending state,
error recovery, and incident reporting. The repository contains no mobile application or ESP32
firmware.

## 5. User Journey Analysis

| Journey | Status | Product assessment |
|---|---|---|
| Rider: open → select route → inspect live vehicle/stop → ETA/nearby stop | Partial | The core journey works for R01/R02, but users cannot reliably understand no-service or stale-data situations from product evidence alone. |
| Rider: submit feedback | Partial | Submission and success/error feedback exist; no visible follow-up or staff triage loop exists. |
| Admin: login → monitor → manage routes/stops/vehicles | Partial | Master-data maintenance works, but route composition and service exceptions require unsupported/manual work. |
| Driver/sender: authenticate → start trip → send location → end trip | Partial | Backend/simulator path exists; the operational user journey is not supplied as a product surface. |

## 6. Feature Inventory

| Module | Status | Evidence |
|---|---|---|
| Public tracking | Implemented | Public tracker has live marker, stop, vehicle, ETA, geolocation, and tour features. |
| Route selection | Partial | Public UI offers only hard-coded R01/R02 choices, while Discovery records R03 in project data. |
| Admin vehicles/routes/stops | Implemented | Dedicated admin pages and sidebar entries exist. |
| Route-stop operations | Partial | API exists; no admin page is evidenced. |
| Sender/trip lifecycle | Partial | Authenticated APIs and simulators exist; no supported driver surface exists. |
| Trip history/playback | Missing | No admin trip/history experience is evidenced. |
| Public feedback | Implemented | Feedback modal submits a typed message against a vehicle. |
| Feedback operations | Missing | No review/list/status/assignment workflow is evidenced. |
| Device/source administration | Partial | Backend CRUD/analytics exists; no admin UI is evidenced. |
| Operations dashboard | Partial | Counts and live map exist; stale/offline, active-trip, feedback, and exception views are absent. |
| Reports, alerts, notifications | Missing | No user-facing workflow is evidenced. |

## 7. Feature Gap Analysis

### Route-stop management — needed now for operator-managed routes

Problem: admins can maintain routes and stops separately but cannot maintain membership or order.

Current impact: route changes require API/manual intervention; public routing and ETA depend on the
order.

Recommendation: provide an admin route detail workflow to add/remove/reorder stops, including a
clear confirmation of the published order.

Business benefit: operations staff can make routine route changes safely without developer help.

Priority: Critical. Difficulty: Medium. Learning topic: ordered many-to-many relationships.

Related future agents: Architecture, Backend, Frontend, Dashboard & UX.

### Supported driver/sender workflow — before daily operations

Problem: the system's authenticated sender flow is only represented by APIs and simulators.

Current impact: real service relies on an unaudited external client or manual technical operation.

Recommendation: either build a minimum driver-facing workflow or formally define and audit the
external sender application as a product dependency.

Business benefit: makes trip and location operations repeatable for non-developer staff.

Priority: Critical for daily operations. Difficulty: Medium. Learning topic: mobile GPS lifecycle,
offline/retry behaviour, and operational UX.

Related future agents: Architecture, Backend, Frontend, Infrastructure & Device.

### Admin trip history — before daily operations

Problem: stored trips are not accessible as an administrator workflow.

Current impact: staff cannot answer whether a vehicle operated, when it did, or investigate a
reported service issue.

Recommendation: add a list with date, vehicle, route, and status filters; defer map playback until
the retention/fidelity decision is made.

Business benefit: minimum accountability and service investigation.

Priority: Critical for operations; playback is deferred. Difficulty: Medium. Learning topic:
operational history and sampled time-series limitations.

Related future agents: Backend, Database, Frontend.

### Feedback triage — important after public submission

Problem: riders can submit feedback but staff cannot see, classify, assign, or close it.

Current impact: the product promises a reporting channel without an evidenced response loop.

Recommendation: add a small admin inbox with status, type, vehicle, time, and resolution note;
decide retention/privacy expectations before exposing it to broad public use.

Business benefit: turns feedback capture into an actionable service-improvement loop.

Priority: High. Difficulty: Easy-Medium. Learning topic: case/feedback triage.

Related future agents: Backend, Frontend, Dashboard & UX, Security.

### Operations visibility and device administration — before a wider pilot

Problem: the dashboard cannot show whether a route, device, or trip needs attention, and device
management is API-only.

Current impact: administrators see objects and live markers, not explicit service health.

Recommendation: make stale/offline state, current trip, source/device freshness, and exception
reason visible before treating the dashboard as an operations console.

Business benefit: prevents staff from mistaking an old location or missing source for active
service.

Priority: High. Difficulty: Medium. Learning topic: operational state and freshness.

Related future agents: Backend, Infrastructure & Device, Dashboard & UX.

## 8. Dashboard Audit

The dashboard is useful for demonstration: it displays active-vehicle, route, and stop counts plus
a live map. It is not an operational control surface yet because it has no active-trip list,
stale/offline state, route-service status, feedback queue, device health, or exception list.

## 9. MVP Evaluation

The rider-facing tracking MVP is substantially present. The product cannot claim an
operator-managed daily-service MVP until route-stop management, a supported sender workflow, trip
history, and service freshness/exception visibility are present and validated.

The feedback addition is valuable but does not by itself complete the service-quality workflow.

## 10. Product Completeness Score

| Area | Assessment | Reason |
|---|---|---|
| Tracking | Strong | Live map, stops, vehicles, ETA, geolocation, and tour are implemented. |
| Trips | Partial | Sender lifecycle exists but admin history and supported driver experience are absent. |
| Vehicles and stops | Strong | Core admin maintenance exists. |
| Routes | Partial | Route CRUD exists; stop composition/order is unavailable to admins. |
| Feedback | Partial | Submission exists; staff triage is absent. |
| Device support | Partial | Backend source operations exist; operator UI and health workflow are absent. |
| Dashboard | Partial | Counts/live map exist; actionable service state is absent. |
| Reports and notifications | Missing | No product workflow is evidenced. |

## 11. Product Roadmap

### Phase 1 — operational MVP

1. Route-stop management and published order.
2. Supported driver/sender workflow or audited external-client contract.
3. Admin trip history list.
4. Stale/offline and service-exception visibility.

### Phase 2 — service feedback and operations

1. Feedback triage inbox and status workflow.
2. Device/source management and health visibility.
3. Public no-service/stale-service communication.

### Phase 3 — evidence-led enhancement

1. Playback only after the history-fidelity decision.
2. Reports/analytics and announcements after pilot evidence identifies their value.

## 12. Learning Topics

1. **Ordered route-stop management** — needed now because stop order affects the public journey.
2. **Operational state and freshness** — needed before staff rely on a live map.
3. **Trip history with sampled data** — needed before designing history/playback expectations.
4. **Feedback triage and privacy** — needed before asking riders to rely on the new feedback form.
5. **Transport KPIs** — scale-triggered, after there is operational data worth analyzing.

## 13. Decision Log

| Item | Rationale | Impact | Status |
|---|---|---|---|
| D-001 — operational MVP scope | The minimum set differs between a controlled demo and daily/public service. | Governs Phase 1 product scope. | Pending owner decision |
| Playback fidelity | Product must not promise detail beyond the current sampled history. | Deferred to T14 decision. | Pending owner decision |

## 14. Roadmap Impact

This report revalidates the intent behind roadmap tasks T10, T11, T19, T20, T21, T22, and T28.
It does not modify the roadmap because the Roadmap Agent must use validated cross-domain reports
and approved decisions. The feedback submission change means T20 should distinguish completed
public capture from still-unimplemented staff triage when it is next revalidated.

## 15. Assumptions and Unknowns

- No external requirements document defines whether the next release is a demonstration, internal
  pilot, daily service, or broad public launch.
- No real mobile/driver application, TTN deployment, or ESP32 firmware was available to inspect.
- No owner for feedback review, response target, retention, or privacy policy is evidenced.
- Browser/runtime behaviour was not observed; evidence is repository-based.

## 16. Confidence

**High** for implemented/absent repository product surfaces because the Knowledge Base, UI route
inventory, and current components agree. **Medium** for real-world usability because no browser,
driver, or operations session was observed.

## 17. Required Decisions

Owner decision D-001 is required before Phase 1 implementation is treated as the product's
operational MVP scope. The owner must choose whether the next target is a controlled demo, daily
operations, or wider public rider use.

## 18. Audit Limitations

This audit did not run the application, inspect visual behaviour in a browser, evaluate security or
deployment, or assess external mobile/device systems not present in the repository.

## 19. Handoff

Next agent: **Architecture Audit Agent**.

It should assess whether the refreshed product priorities—route-stop operations, supported sender
workflow, history, feedback triage, and service freshness—fit the current system boundaries without
introducing unnecessary complexity.
