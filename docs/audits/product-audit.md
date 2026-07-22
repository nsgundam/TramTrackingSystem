# Product Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/testing/pipeline-smoke-tests.md`, `README.md`, `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`, `shuttle-tracking-web/services/`, `shuttle-tracking-web/contexts/`, `shuttle-tracking-web/simulate.js`, `shuttle-tracking-web/simulate-manual.js`, `shuttle-tracking-backend/src/routes/`, `shuttle-tracking-backend/src/controllers/`, `shuttle-tracking-backend/src/services/`, `shuttle-tracking-backend/prisma/`, `shuttle-tracking-backend/simulate-ttn.js`, `shuttle-tracking-backend/test_pipeline.js`, and `shuttle-tracking-backend/test_t5_operations.js`
- Reviewed at: `2026-07-22T20:49:38+07:00`
- Validation state: `Validated`
- Predecessor baselines: `docs/project-knowledge-base.md @ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`

## 1. Executive Summary

The repository evidences a credible public tracking demonstration and controlled MVP. Riders can
select active routes, inspect stops and live vehicle markers, use nearby-stop lookup and ETA-style
information, and submit feedback. Administrators can authenticate, maintain vehicles/routes/stops,
and view a Socket.IO live map. Sender APIs, T5 trip lifecycle logic, simulators, and backend source
analytics support technical testing.

The product is not an operator-managed daily-service product. Route-stop composition, a supported
driver/sender surface, trip history, feedback triage, source/device health, explicit stale/offline
states, and the approved developer research dashboard are absent or incomplete. The current
approved release scope is D-001=A: controlled demonstration or supervised pilot with a known
operator and an externally supplied authenticated sender.

The most important product truthfulness gap is that the UI can present live/active language without
an explicit connection, freshness, or no-service contract. A backend source-health sweep exists,
but its signals are not exposed as a public or admin product state.

## 2. Scope and Freshness

This profile assesses product value, roles, journeys, functional completeness, release scope, and
roadmap impact. It does not sign off implementation quality, security, infrastructure, performance,
deployment, physical devices, or external-provider behavior.

The prior report at `59a996f` lacked the required metadata and predated the current Discovery
baseline, T5 lifecycle boundary, approved D-001/D-002 decisions, and D-004 research scope. The
current evidence diff includes public/admin UI, feedback, sender/trip/realtime boundaries,
simulator/seed alignment, research scope, and test/documentation changes. The only uncommitted
changes outside this report are Discovery/coordinator documents; they change audit state, not
application product behavior, and were treated as coordination evidence.

No browser session, running application, real rider/operator, mobile app, ESP32 firmware, TTN
deployment, or physical research source was observed. Repository evidence therefore proves code
surfaces and declared contracts, not successful real-world journeys.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence |
|---|---|---|
| Route-stop management UI is missing | **Still Present** | Authenticated route-stop APIs exist, but `Sidebar.tsx` and `app/admin/` contain no route-stop management page. |
| A real driver/mobile workflow is missing | **Partially Resolved** | Sender authentication, trip start/end, location ingestion, simulators, and T5 idempotent lifecycle logic exist; no driver/mobile application or supported non-developer workflow is present. |
| Admin trip history is missing | **Still Present** | No trip/history REST read route, admin page, filter, or playback workflow is evidenced. |
| Feedback workflow is missing | **Partially Resolved** | `FeedbackModal` and `POST /api/public/feedback` provide capture, loading, validation, success, and error states; no review, status, assignment, receipt, or closure workflow exists. |
| Offline/stale operational visibility is missing | **Still Present** | `AvailabilityCard` shows a count and the admin dashboard says “Live System Active”; neither exposes Socket.IO connection or source freshness state. |
| Reports and analytics are missing | **Still Present** | No user-facing product reports exist; device analytics is an authenticated backend selection-count endpoint only. |
| Device operations are incomplete | **Partially Resolved** | Backend source CRUD, credential rotation, and selection analytics exist; no admin device/source page or operational health workflow exists. |
| Public route choices were hard-coded to R01/R02 | **No Longer Relevant** | `ShuttleTracker` loads active routes from `/api/public/active-routes`; the development seed currently exposes R01/R02 and leaves R03 inactive. Geometry and route assignment truth remain separate gaps. |
| Product decisions were still pending in the report | **No Longer Relevant** | D-001, D-002, and D-004 are approved in `docs/decision-queue.md`; exact retention, access, and experiment parameters remain open. |

## 4. Product Scope and Roles

### Public rider

The public surface promises route selection, stops, live vehicle locations, ETA-style waiting time,
nearby-stop lookup, and feedback. It is suitable for supervised demonstration, but it does not
distinguish a fresh live service from a disconnected browser, a stale source, an inactive vehicle,
or a route with no current service.

### Administrator/operator

The authenticated admin surface supports login, vehicle/route/stop CRUD, counts, and a live map.
It does not provide the route-stop order required to publish a route, source/device health, active
trip accountability, feedback triage, exceptions, history, or reports. The current single admin
token shape also does not evidence separate operator, support, or research permissions.

### Driver or sender operator

The backend supports source login, trip start/end, HTTP ingestion, Socket.IO ingestion, token
rotation, and safe acknowledgements. This is a technical contract and simulator path, not a
supported driver journey with assignment confirmation, sending/reconnect state, or incident
recovery.

### Developer/researcher

The repository has source-selection analytics and approved research definitions, but no authenticated
Dev Dashboard for live/historical three-source comparison, freshness, latency, cadence, delivery
quality, accuracy semantics, filters, or bounded export. The research sources remain three distinct
boundaries: Mobile GPS/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and independent LoRaWAN/Gateway/TTN/Webhook.
Simulators are test tools, not a fourth source.

### External provider

The TTN webhook and payload decoder contract are present. The TTN application/device registry,
gateway coverage, provider configuration, and live delivery behavior are unavailable, so the
external-provider journey cannot be marked complete.

## 5. Journey Analysis

| Journey | Product state | Evidence-based assessment |
|---|---|---|
| Rider: open → choose route → inspect stops/vehicles → ETA/nearby stop | Partial | Route and stop data load through REST; Socket.IO markers and ETA logic exist. The UI has no explicit API/socket failure, stale timestamp, or offline state, and a vehicle can be locally associated with the currently selected route when its authoritative route is not in the event. |
| Rider: submit feedback | Partial | The modal loads active vehicles, validates required fields, submits a typed message, and shows success/error states. API failure falls back to static vehicle options, feedback records capture IP, and there is no privacy notice, receipt, review, or response loop. |
| Admin: login → monitor fleet → maintain master data | Partial | Login, loading, CRUD, empty states, and basic error alerts exist. The dashboard has counts and a live map, but no current-connection truth, source freshness, active-trip list, route-stop order, exceptions, or device controls in the UI. |
| Driver/sender: authenticate → start → send → recover → end | Partial | The authenticated REST/Socket.IO contract and simulators cover the technical happy path and token expiry/rotation boundaries. No supported driver client or non-developer operational recovery journey is present. |
| Researcher: compare Mobile/ESP32/LoRaWAN sources | Missing | D-004 defines an authenticated dashboard and metric vocabulary, but only backend source-selection counts and simulator evidence exist. No live/historical comparison or bounded export surface is implemented. |
| TTN/provider: deliver → decode → observe health → recover | Unable to Verify | The webhook boundary and payload shapes are repository-visible; provider registry, gateway, delivery, and recovery behavior are external and unobserved. |

## 6. Truthful State Evaluation

The product has some local loading and empty/error states, but they do not form a complete service
state model:

- Public route/stop/vehicle loading failures are logged and the preloader has a five-second safety
  timeout; no rider-facing failure or recovery message is rendered when route data or Socket.IO is
  unavailable.
- `StopInfoCard` can say no vehicle is available when ETA is null, but this does not distinguish no
  scheduled service from stale data, disconnected realtime, missing geometry, or a backend failure.
- `AvailabilityCard` counts visible Leaflet markers, not a server-declared freshness state. It can
  therefore represent “received a marker” rather than “service is currently available.”
- The admin dashboard's “Live System Active” label is static. `LiveMap` subscribes to
  `location-update` but does not expose connection, stale, empty, reconnect, or last-update state.
- The frontend route map assigns an incoming vehicle to the selected route if it has no local route
  mapping. The canonical event does not include authoritative route identity, so route selection can
  affect what riders see.
- Feedback has explicit form loading/submitting/success/error states, but its fallback static vehicle
  list can mask an active-vehicle API failure and its stored IP/retention behavior is not explained
  to riders.

## 7. Product Completeness

| Capability | State | Release interpretation |
|---|---|---|
| Public live tracking and route/stop viewing | Implemented for controlled demo | Requires known backend/runtime and truthful limitations; not a daily-service guarantee. |
| ETA and nearby-stop assistance | Partial | Useful demonstration signal; accuracy/latency are not measured ground truth and stale behavior is not communicated. |
| Public feedback capture | Implemented | Capture works; support/triage, privacy, retention, and response ownership remain open. |
| Vehicle, route, and stop master-data CRUD | Implemented | Basic admin maintenance exists. |
| Route-stop composition and order | Missing from product surface | Required for operator-managed route changes. |
| Sender/trip lifecycle | Partial | Backend contract is stronger after T5; supported driver product is absent. |
| Trip history and playback | Missing | No read workflow; playback is constrained by sampled canonical history and D-002 policy. |
| Device/source administration and health | Partial | API CRUD/analytics exist; no operator UI or health state. |
| Feedback operations | Missing | No inbox, status, assignment, resolution, or retention workflow. |
| Research/Dev Dashboard | Missing | Approved D-004 scope is not implemented. |
| Reports, alerts, notifications, announcements | Missing | No product workflow is evidenced. |

## 8. Approved Release Boundary

D-001 is approved as **A — Minimal controlled demonstration**. The current product may be described
as a supervised pilot with a known operator and an externally supplied authenticated sender. It must
not be described as daily campus operations or a broad public service.

D-002 approves bounded raw diagnostics for comparing Mobile, LoRaWAN, and ESP32 research sources,
but retention duration, deletion owner, research role, event-time semantics, and experiment design
remain unresolved. D-004 defines the separate authenticated Dev Dashboard scope and accuracy guardrails.
Neither decision makes the dashboard or physical research evidence exist today.

## 9. Actionable Capability Recommendations

Each recommendation has an outcome, owner, acceptance signal, privacy boundary, and release stage:

| Capability | Measurable outcome | Owner | Acceptance signal | Privacy boundary | Release stage |
|---|---|---|---|---|---|
| Route-stop operations | An operator can add/remove/reorder a route and see the published stop sequence without developer/API help. | Transport operations | A disposable route test changes order and the public route reflects it after one controlled refresh. | Route/stop metadata only; audit who changed the route. | Future daily-operations scope (D-001 B/C), not current A. |
| Supported sender workflow | A non-developer sender can authenticate, start, send, recover from expiry/disconnect, and end a trip. | Product + mobile/device owner | Happy path, token rotation, reconnect, and rejected-write tests pass through a documented client. | Sender identity and location access only for assigned vehicle; no public raw telemetry. | Required before daily operations. |
| Service freshness contract | Rider and operator can distinguish fresh, stale, offline, and no scheduled service within the agreed threshold. | Backend + frontend + operations | Controlled source silence beyond 30 seconds produces the documented state and recovery transition. | No new personal data. | Required before daily operations; useful even in pilot testing. |
| Trip history list | Staff can find completed trips by vehicle/date/route and see status/time without raw playback promises. | Transport operations + data owner | A completed T5 trip is queryable with the declared retention and access rules. | Authenticated operations access; retention and deletion owner required. | Future daily-operations scope. |
| Feedback triage | Every submitted case is visible to an owner, assigned a status, and either resolved or escalated. | Transport support owner | Test feedback moves through intake → assigned → resolved with response target and audit trail. | IP/feedback retention, access, and rider notice must be approved. | Broader rider scope (D-001 C). |
| Research Dev Dashboard | Researchers can compare the three approved sources using defined metrics and bounded redacted export. | Research owner + data owner | Metric definitions, access role, retention, reference evidence, and export bounds are accepted before field trials. | Separate authenticated research role; no public controls or unrestricted raw telemetry. | Approved research scope, implementation gated by exact parameters. |

## 10. Roadmap Impact

The current roadmap should map these findings to its current task IDs only after Architecture and
downstream domain audits revalidate the boundaries. The product-level order is:

1. Preserve D-001=A controlled-demo claim and document its supported operator/sender dependency.
2. Establish the canonical route/service/freshness contract before promising daily operations.
3. Add route-stop operations, supported sender workflow, and trip-history access for a future daily
   scope.
4. Add feedback triage and public stale/no-service communication only when support ownership and
   privacy/retention are approved.
5. Implement D-004 research dashboard separately from public canonical tracking and ordinary admin
   operations, after D-002 parameters are specified.

This report does not edit the master roadmap or authorize implementation. Legacy references to
superseded T10/T11/T14/T20/T28 numbering must not be copied into new task handoffs.

## 11. Proposed Owner Decisions

No new owner decision is required to retain the approved controlled-demo scope. Before upgrading to
daily or wider public release, the owner must approve:

- the supported sender/client dependency and operations owner;
- feedback privacy notice, IP retention, access, response target, and deletion owner;
- trip-history retention/access and whether sampled canonical history is sufficient; and
- D-004 research access role, raw/aggregate retention, timestamp semantics, reference evidence, and
  export bounds.

These are pending owner choices, not inferred product requirements.

## 12. Assumptions and Unknowns

- “Admin,” “operator,” “driver,” and “researcher” are treated as separate product responsibilities;
  the current application does not implement separate roles.
- Backend APIs and simulators are not treated as evidence of a real mobile app, ESP32 firmware, TTN
  deployment, or field performance.
- ETA, route distance, and device-reported accuracy are product signals/proxies, not measured
  ground-truth error.
- Browser behavior, runtime recovery, scheduled service, feedback ownership, and deployment context
  remain unobserved or owner-controlled.

## 13. Confidence

**High** for repository-visible product surfaces and missing UI/API workflows because the Discovery
inventory, current components, routes, and schema agree. **Medium** for the static journey
truthfulness assessment because no browser/runtime session was observed. **Low** for real rider,
operator, device, provider, and production outcomes.

## 14. Handoff

Next eligible profile: **Architecture**. It must consume the validated Discovery and Product
baselines and test whether the route/service/freshness contract, Operations/Trip boundary, public
canonical state, sender dependency, and separate research surface fit the current topology without
making owner decisions on their behalf.
