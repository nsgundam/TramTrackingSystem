# Product Audit: Tram Tracking System

## Executive Summary

The product is a functional MVP for real-time university shuttle tracking. It already supports the core public use case: users can open a public map, select a route, view stops, see live vehicle markers, select stops or vehicles, and get estimated arrival information. Administrators can log in and manage the basic operational data: vehicles, routes, and stops.

MVP status: **partially ready**. The tracking experience exists, but the operational product is not complete enough to call the MVP fully finished. The main gaps are driver/mobile workflow, route-stop management in the admin UI, trip history, feedback workflow, reports, notifications/alerts, and device health visibility.

Evidence:

- The knowledge base defines known users and MVP objective: public user, admin user, and driver/mobile/device sender (`docs/project-knowledge-base.md:9-15`).
- Public tracking features are documented as implemented (`docs/project-knowledge-base.md:41-56`).
- Admin pages are documented as implemented for dashboard, vehicles, routes, and stops (`docs/project-knowledge-base.md:58-86`).
- Driver/device flow exists through REST and Socket.IO, but only a simulator is included, not a full mobile app (`docs/project-knowledge-base.md:88-94`).
- Admin sidebar exposes only Dashboard, Vehicles, Routes, and Stops (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`).

## Product Vision

The current product objective is to help university riders track shuttle/tram locations in real time and help transport administrators maintain the operational data that powers the public tracking map.

Business value:

- Reduces uncertainty for riders waiting for shuttles.
- Gives operations staff a single place to manage routes, stops, vehicles, and live movement.
- Creates a foundation for future transport reliability features such as incident response, reports, and service-quality analysis.

Evidence:

- The repository summary states the system solves shuttle/tram location visibility for public users and gives administrators a management interface (`docs/project-knowledge-base.md:5-8`).
- The business context identifies university shuttle/tram tracking and public ETA/arrival value (`docs/project-knowledge-base.md:19-23`).

## User Role Evaluation

### Public User

Current capabilities:

- Open public tracking page.
- Switch between routes R01 and R02.
- View route line, active stops, and live vehicle movement.
- Select a stop and see stop information.
- Select a vehicle and see vehicle status context.
- Use browser location to find nearest stop.
- View ETA based on route geometry, speed history, and stop sequence.

Missing capabilities:

- Submit feedback or report service issues.
- See announcements, delays, route closures, or service interruptions.
- See scheduled service windows or expected headways.

Evidence:

- Public feature inventory lists route toggles, stop loading, route geometry, live markers, vehicle card, nearest stop, and ETA (`docs/project-knowledge-base.md:41-56`).
- The database has a `Feedback` model, but no frontend or route evidence was found for submitting or reviewing feedback (`shuttle-tracking-backend/prisma/schema.prisma:151-160`).

### Admin User

Current capabilities:

- Log into admin portal.
- View live dashboard.
- See counts of active vehicles, total routes, and total stops.
- View live map.
- CRUD vehicles, assign vehicles to routes, and view status.
- CRUD routes, including color and status.
- CRUD stops, including Thai/English names and coordinates.

Missing capabilities:

- Manage route-stop ordering from the UI.
- View trip history and GPS playback.
- Review feedback.
- View reports, trends, or operational KPIs.
- Receive alerts for offline vehicles, stale GPS, incidents, or device problems.
- Manage admin users or staff roles.

Evidence:

- Dashboard fetches only vehicles, routes, and stops and calculates active vehicle count (`shuttle-tracking-web/app/admin/dashboard/page.tsx:18-44`).
- Dashboard renders only summary cards and a live map (`shuttle-tracking-web/app/admin/dashboard/page.tsx:70-133`).
- Sidebar exposes only Dashboard, Vehicles, Routes, and Stops (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`).
- Route-stop endpoints exist, but the knowledge base notes no frontend caller was found (`docs/project-knowledge-base.md:96-100`).

### Driver, Mobile App, Or Device Sender

Current capabilities:

- Vehicle ID verification.
- Start trip.
- End trip.
- Send GPS through Socket.IO.
- Simulate a vehicle trip from repository script.

Missing capabilities:

- Full driver/mobile UI.
- Driver authentication/session beyond vehicle ID verification.
- Driver workflow for selecting vehicle, confirming route, seeing current trip state, pausing/resuming, or reporting incidents.
- Device status view for GPS quality, battery, last seen, or connectivity.

Evidence:

- Driver/device flow is documented as API and Socket.IO based, with simulator only (`docs/project-knowledge-base.md:88-94`).
- Trips API only exposes start and end endpoints (`shuttle-tracking-backend/src/routes/trips.route.ts:1-8`).

## User Journey Analysis

### Public User Journey

Current journey:

Open website -> choose route -> view route/stops -> receive live vehicle updates -> select stop/vehicle -> view ETA or nearest stop.

Assessment:

- Core journey is implemented.
- Journey becomes incomplete when users need service context beyond live position, such as delays, no active vehicles, announcements, or feedback/reporting.

### Admin Journey

Current journey:

Login -> dashboard -> monitor live vehicles -> manage vehicles/routes/stops -> logout.

Assessment:

- Basic administration journey is implemented.
- Operational journey is incomplete because admins cannot manage stop order per route, inspect completed trips, review rider feedback, monitor device health, or respond to alerts.

### Driver/Device Journey

Current journey:

Verify vehicle -> start trip -> send GPS -> end trip.

Assessment:

- Backend ingestion path exists.
- Product journey is incomplete because there is no real driver-facing application or device management workflow in this repository.

## Feature Inventory

| Module | Status | Product Evidence |
|---|---|---|
| Public Tracking | Implemented | Public route, stop, vehicle, ETA, geolocation, and tour features are listed in the knowledge base (`docs/project-knowledge-base.md:41-56`). |
| Real-time GPS | Implemented | Backend receives trip/location updates and broadcasts `location-update` (`docs/project-knowledge-base.md:35-37`). |
| Trips | Partial | Trip start/end and GPS tracks exist, but no trip history or admin trip UI exists (`shuttle-tracking-backend/prisma/schema.prisma:105-145`). |
| Vehicles | Implemented | Admin vehicle CRUD and route assignment are listed (`docs/project-knowledge-base.md:68-74`). |
| Routes | Partial | Route CRUD exists, but route-stop management is API-only/no frontend caller (`docs/project-knowledge-base.md:75-80`, `docs/project-knowledge-base.md:96-100`). |
| Stops | Implemented | Admin stop CRUD and coordinates are listed (`docs/project-knowledge-base.md:81-86`). |
| Route-Stop Mapping | Partial | Backend API exists, admin UI absent (`docs/project-knowledge-base.md:96-100`). |
| Feedback | Planned/Data-only | `Feedback` model exists, but no product workflow was found (`shuttle-tracking-backend/prisma/schema.prisma:151-160`). |
| Dashboard | Partial | Has live map and three stats only (`shuttle-tracking-web/app/admin/dashboard/page.tsx:18-44`, `shuttle-tracking-web/app/admin/dashboard/page.tsx:130-133`). |
| Reporting | Missing | No report pages or report endpoints found in repository search. |
| Notifications/Alerts | Missing | No alert/notification pages or workflows found. |
| Device Support | Partial | GPS ingestion exists, but device health and management are absent. |
| Administration | Partial | Admin auth exists, but admin user/role management is absent. |

## Feature Gap Analysis

### 1. Route-Stop Management UI

Problem

Admins can create routes and stops, but cannot manage which stops belong to each route or their order from the admin UI.

Current Impact

Public tracking depends on route-stop ordering. Without an admin UI, changing routes requires backend/API/manual work.

Recommendation

Add a route detail page or route-stop manager where admins can add/remove stops and reorder stops per route.

Reason

The backend route-stop endpoints exist, but no frontend caller was found.

Business Benefit

Transport staff can update route plans without developer intervention.

Difficulty

Medium.

Priority

Phase 1 Critical.

Research Topic

Many-to-many relationship management and ordered lists.

Related Future Agent

Frontend/UI Agent, API Agent.

### 2. Driver/Mobile Workflow

Problem

The repository supports API/device ingestion, but does not include a full driver-facing product.

Current Impact

The live map depends on simulator or external clients. Real operations cannot reliably start/end trips or submit location from a usable driver workflow.

Recommendation

Build a minimal driver web/mobile workflow: vehicle login, assigned route confirmation, start trip, live sending status, end trip, and error handling.

Reason

The knowledge base states the repository includes a simulator, not a full mobile app.

Business Benefit

Makes the live tracking system usable in real daily operations.

Difficulty

Medium.

Priority

Phase 1 Critical.

Research Topic

Driver operational workflow and mobile GPS tracking.

Related Future Agent

Mobile/Product Agent, UX Agent.

### 3. Trip History

Problem

Trips and GPS tracks are stored, but admins cannot view completed trips.

Current Impact

Admins cannot answer operational questions such as which vehicle ran, when it ran, or whether service was completed.

Recommendation

Add trip history with filters by date, route, vehicle, and status. Include summary metrics and optional map playback later.

Reason

The schema has `Trip` and `GPSTrack`, while admin navigation lacks a trip page.

Business Benefit

Supports accountability, incident investigation, and service improvement.

Difficulty

Medium.

Priority

Phase 1 Critical for list/history, Phase 2 Important for playback.

Research Topic

Operational logs and time-series data review.

Related Future Agent

Backend/API Agent, Frontend/UI Agent.

### 4. Feedback Workflow

Problem

The database has a feedback model, but no public submission or admin review workflow was found.

Current Impact

Riders have no product channel to report late vehicles, missing stops, unsafe driving, or wrong map data.

Recommendation

Add a simple public feedback form and admin feedback inbox with type, message, timestamp, and status.

Reason

Feedback is modeled in the database but not exposed as a product feature.

Business Benefit

Creates a practical feedback loop between riders and transport operations.

Difficulty

Low to Medium.

Priority

Phase 2 Important.

Research Topic

Feedback triage workflow.

Related Future Agent

Product Agent, Frontend/UI Agent.

### 5. Alerts And Offline Detection

Problem

The dashboard shows “Live System Active” and active count, but not stale GPS, offline vehicles, or route service alerts.

Current Impact

Admins may think service is healthy even if a vehicle stopped sending data or a route has no active vehicles.

Recommendation

Add dashboard alerts for stale location, route without active vehicles, inactive assigned vehicle, and active trip without recent GPS.

Reason

Dashboard currently displays only three counts and a live map.

Business Benefit

Improves operational response and rider trust.

Difficulty

Medium.

Priority

Phase 2 Important.

Research Topic

Staleness detection and operational alerting.

Related Future Agent

Backend/API Agent, Product Agent.

### 6. Reports And Analytics

Problem

No report or analytics workflow exists.

Current Impact

Admins cannot measure route usage, service reliability, vehicle activity, or recurring issues.

Recommendation

Start with simple operational reports: trips per day, active vehicle hours, average trip duration, route activity, and feedback counts.

Reason

The product already stores trips and GPS tracks, but there is no admin report surface.

Business Benefit

Helps management justify service changes and monitor service quality.

Difficulty

Medium.

Priority

Phase 3 Enhancement.

Research Topic

Transport KPIs and basic analytics.

Related Future Agent

Data/Analytics Agent.

## Dashboard Audit

Current dashboard capability:

- Live dashboard header.
- Active vehicle count.
- Total route count.
- Total stop count.
- Live map component.

Dashboard gaps:

- No stale GPS/offline vehicle indicator.
- No active trips list.
- No route service status table.
- No incident/feedback panel.
- No device health or GPS quality status.
- No reports or trend summaries.
- No audit/activity log.

Assessment:

The dashboard is useful for a demo and basic monitoring, but it is not yet a complete operations dashboard. It tells admins “what exists” and “what is visible now,” but not “what needs attention.”

## MVP Evaluation

MVP goal:

Provide a working real-time shuttle tracking experience for riders and basic admin management for routes, stops, vehicles, and live operations.

Has the MVP achieved that goal?

Partially. The rider-facing live tracking MVP is mostly achieved. The admin data-management MVP is partially achieved. The operational MVP is not complete until route-stop management, driver/mobile workflow, and trip history are available.

Required before calling MVP complete:

1. Route-stop management UI.
2. Minimal driver/mobile workflow or documented supported tracking client.
3. Admin trip history.
4. Dashboard stale/offline vehicle visibility.
5. Basic feedback/report issue path, if rider feedback is part of intended MVP.

## Product Completeness Score

| Area | Score | Reason |
|---|---:|---|
| Tracking | 8/10 | Live map, route toggle, stops, vehicles, ETA, geolocation are present. Needs service alerts and stale tracking states. |
| Trips | 4/10 | Start/end and storage exist. Admin history and playback are missing. |
| Vehicles | 7/10 | CRUD, route assignment, and status exist. Needs device health and operational detail. |
| Routes | 5/10 | CRUD exists. Route-stop ordering UI is missing. |
| Stops | 7/10 | CRUD and coordinates exist. Route membership workflow is missing. |
| Feedback | 2/10 | Database model exists, but no workflow found. |
| Dashboard | 5/10 | Live map and counts exist. Lacks alerts, trip monitor, device status, and reports. |
| Reporting | 1/10 | No product workflow found. |
| Notifications | 1/10 | No product workflow found. |
| Device Support | 4/10 | Location ingestion exists. Device onboarding, health, and GPS quality are missing. |
| Administration | 5/10 | Admin login and core CRUD exist. User/role management and audit history are missing. |

## Product Roadmap

### Phase 1 Critical

1. Build route-stop management UI.
2. Build minimal driver/mobile trip workflow.
3. Add admin trip history.
4. Add dashboard stale/offline vehicle status.

### Phase 2 Important

1. Add public feedback submission.
2. Add admin feedback inbox.
3. Add active trips monitor.
4. Add basic service alerts and route status.
5. Add device health fields and admin visibility.

### Phase 3 Enhancement

1. Add trip playback.
2. Add reports and analytics.
3. Add announcements/service disruption messages for public users.
4. Add admin user and role management.
5. Add operational audit log.

## Learning Topics

### Ordered Many-To-Many Management

What it is: Managing relationships where one item belongs to another in a specific sequence, such as stops on a route.

Why this project needs it: Route-stop order determines public route display and ETA calculations.

Required now: Yes.

When to learn: Before implementing route-stop management UI.

Difficulty: Medium.

### Operational State And Staleness

What it is: Determining whether data is current enough to trust, for example whether a vehicle has sent GPS recently.

Why this project needs it: A live map can mislead admins and riders if old locations appear active.

Required now: Yes for MVP completion.

When to learn: Before improving dashboard monitoring.

Difficulty: Medium.

### Trip History And Time-Series Review

What it is: Reviewing past operational events over time, including trips and GPS tracks.

Why this project needs it: Admins need historical answers after a service issue.

Required now: Yes for operations MVP.

When to learn: Before building trip history.

Difficulty: Medium.

### Feedback Triage

What it is: A workflow for receiving, categorizing, tracking, and resolving user reports.

Why this project needs it: Riders need a channel to report service problems.

Required now: Not strictly required for the smallest tracking MVP, but important soon.

When to learn: Phase 2.

Difficulty: Low to Medium.

### Transport KPIs

What it is: Metrics such as trips per day, active vehicles, average trip duration, delays, and route coverage.

Why this project needs it: Reports help management improve service.

Required now: No.

When to learn: Phase 3.

Difficulty: Medium.

## Decision Log

| Recommendation | Reason | Business Impact | Priority | Related Future Agents |
|---|---|---|---|---|
| Build route-stop management UI | API exists but no frontend caller found | Enables non-developer route updates | Critical | Frontend/UI Agent, API Agent |
| Build minimal driver/mobile workflow | Simulator exists but no full mobile app | Makes live tracking operational | Critical | Mobile/Product Agent |
| Add trip history | Trips and GPS tracks exist without admin review | Enables accountability and investigations | Critical | Backend/API Agent, Frontend/UI Agent |
| Add dashboard stale/offline alerts | Dashboard has only counts and live map | Improves operational response | Important | Backend/API Agent, Product Agent |
| Add feedback workflow | Feedback model exists but no workflow | Gives riders a reporting channel | Important | Product Agent, Frontend/UI Agent |
| Add reports/analytics | No report workflow found | Supports service improvement | Enhancement | Data/Analytics Agent |

## Audit Limitations

- This audit did not run the application in a browser.
- This audit did not inspect visual UI behavior beyond source files and the discovery knowledge base.
- This audit did not review code quality, architecture quality, security, infrastructure, deployment, performance, or testing, by instruction.
- No external product requirements document was found beyond `docs/project-knowledge-base.md`, so MVP expectations are inferred from repository evidence and agent instructions.

## Handoff

Recommended next audit agent: **Architecture Audit Agent**.

Suggested handoff notes:

- Product audit found functional MVP gaps, especially route-stop UI, driver workflow, trip history, stale/offline dashboard states, feedback, and reports.
- Architecture audit should not repeat product discovery; it can focus on whether the current architecture supports these next product phases cleanly.
