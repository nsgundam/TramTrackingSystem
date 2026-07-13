# Dashboard & UX Audit: Tram Tracking System

## 1. Executive Summary

The Tram Tracking System has a credible MVP user interface for two main surfaces: a public live map and an admin management portal. Public users can open the tracker, switch between `R01` and `R02`, see stops, see vehicle markers when GPS updates arrive, select stops/vehicles, and get ETA-like waiting time. Admin users can log in, view summary counts, watch a live map, and manage vehicles, routes, and stops.

UX assessment: **partially ready for MVP, not yet ready for real daily operations**.

The public experience is strongest when live data is flowing and a user already understands the route codes. It is weaker when a first-time user needs to know which route to choose, whether the data is current, what to do when no vehicles are active, or how much confidence to place in an ETA. Evidence: route controls render only `R01` and `R02` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:747-758`), active vehicle count shows only a count (`shuttle-tracking-web/components/public/AvailabilityCard.tsx:5-15`), ETA is shown as a specific minute value (`shuttle-tracking-web/components/public/StopInfoCard.tsx:86-105`), route load failures only log to console (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:616-618`), and the socket handler listens only for `location-update` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`).

The admin dashboard is useful as a CRUD portal, but not yet as an operations dashboard. It answers "how many vehicles/routes/stops exist?" better than "is service healthy right now?" Evidence: the landing dashboard has three cards and a live map (`shuttle-tracking-web/app/admin/dashboard/page.tsx:70-133`), the status badge always says `Live System Active` (`shuttle-tracking-web/app/admin/dashboard/page.tsx:64-67`), and the admin live map stores incoming locations without connection, stale, or offline state (`shuttle-tracking-web/components/admin/LiveMap.tsx:24-43`).

## 2. Public Experience Overview

From the Product Audit, the public user is a university rider trying to reduce uncertainty: choose a route, see current shuttle location, understand nearby stops, and estimate waiting time (`docs/audits/product-audit.md:36-52`). The repository supports this core journey through the public tracker inventory in the knowledge base (`docs/project-knowledge-base.md:41-56`).

Current public strengths:

- Full-screen map-first experience with RSU branding (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:714-741`).
- Route switching between `R01` and `R02` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:743-761`).
- Stop markers, selected stop card, vehicle card, nearest-stop lookup, route geometry, and live marker updates (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:500-615`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:674-711`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:763-810`).
- Stop card displays station name, optional image, ETA, and a status phrase (`shuttle-tracking-web/components/public/StopInfoCard.tsx:52-107`).

Current public weaknesses:

- Route labels are operational codes only. No direction, destination, service area, or route description is visible in the selector (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:747-758`).
- No visible connection freshness or last-updated signal exists, even though the experience depends on live GPS (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`).
- No explicit route-load or stops-load error state is shown to the user (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:616-618`).
- No active vehicle state is reduced to `0 คัน`; it does not explain whether service is closed, vehicles are not transmitting, or the system is disconnected (`shuttle-tracking-web/components/public/AvailabilityCard.tsx:5-15`).

## 3. Admin Experience Overview

From the Product Audit, the admin user is trying to operate and maintain the system: log in, monitor live operations, manage vehicles/routes/stops, and respond when service data is wrong or missing (`docs/audits/product-audit.md:58-79`). The current product supports basic data management but lacks operational visibility for stale GPS, device health, alerts, active trips, and route-stop management (`docs/audits/product-audit.md:129-130`, `docs/audits/product-audit.md:403-406`).

Current admin strengths:

- Login has inline loading and error feedback (`shuttle-tracking-web/app/admin/login/page.tsx:15-33`, `shuttle-tracking-web/app/admin/login/page.tsx:55-98`).
- Sidebar is simple and predictable: Dashboard, Vehicles, Routes, Stops (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`).
- Dashboard shows active vehicles, total routes, total stops, and a live map (`shuttle-tracking-web/app/admin/dashboard/page.tsx:70-133`).
- Vehicle, route, and stop pages provide list, create, edit, delete, loading, and empty states (`shuttle-tracking-web/app/admin/vehicles/page.tsx:79-264`, `shuttle-tracking-web/app/admin/routes/page.tsx:74-243`, `shuttle-tracking-web/app/admin/stops/page.tsx:70-215`).

Current admin weaknesses:

- Dashboard has no incident-oriented hierarchy: no stale GPS list, offline vehicles, active trips, route coverage, or data-quality warnings.
- `Live System Active` is static and not tied to real socket/API health (`shuttle-tracking-web/app/admin/dashboard/page.tsx:64-67`).
- Vehicle status is database status only: `active`, `inactive`, `maintenance`. It is not enough to distinguish moving, idle, silent, disconnected, or stale GPS (`shuttle-tracking-web/app/admin/vehicles/page.tsx:214-225`; backend schema at `shuttle-tracking-backend/prisma/schema.prisma:46-61`).
- Route-stop ordering exists in the database and backend API, but there is no admin UI caller (`docs/project-knowledge-base.md:96-100`; `shuttle-tracking-backend/prisma/schema.prisma:86-99`).

## 4. UX Strengths

1. **Map-first public experience fits the rider goal.** Public users land directly on the tracker rather than a marketing page. The full-screen map, route controls, active count, stop card, vehicle card, and location controls are all present in one view (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:714-812`).

2. **Selected-stop feedback is clear once a stop is tapped.** The stop icon enlarges from 32px to 48px, the map flies to the stop, and the stop card shows station name plus ETA/status (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:532-546`, `shuttle-tracking-web/components/public/StopInfoCard.tsx:79-105`).

3. **Admin CRUD screens have expected basics.** Each management screen has a clear header, add button, loading state, responsive mobile cards, desktop table, edit/delete actions, and an empty state (`shuttle-tracking-web/app/admin/vehicles/page.tsx:79-264`, `shuttle-tracking-web/app/admin/routes/page.tsx:74-243`, `shuttle-tracking-web/app/admin/stops/page.tsx:70-215`).

4. **Destructive actions require confirmation.** Vehicle, route, and stop deletion use `confirm(...)` before making delete requests (`shuttle-tracking-web/app/admin/vehicles/page.tsx:59-67`, `shuttle-tracking-web/app/admin/routes/page.tsx:53-61`, `shuttle-tracking-web/app/admin/stops/page.tsx:49-57`).

5. **The data model already has useful operational foundations.** Trips, GPS tracks, route-stop ordering, and feedback are present in schema, even when not surfaced yet (`shuttle-tracking-backend/prisma/schema.prisma:86-160`).

## 5. Critical UX Issues

### Issue 1: Live data has no user-visible freshness model

Public and admin maps listen for `location-update`, but the UI does not expose connection status, reconnecting state, last update time, or stale vehicle markers (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`). The admin dashboard always says `Live System Active` (`shuttle-tracking-web/app/admin/dashboard/page.tsx:64-67`).

Impact: both riders and admins can mistake stale data for current data. This directly weakens trust in the system.

### Issue 2: Admin dashboard is not yet an operations dashboard

The dashboard shows active vehicle count, total routes, total stops, and a live map (`shuttle-tracking-web/app/admin/dashboard/page.tsx:70-133`). It does not surface silent vehicles, GPS quality, active trips, routes without vehicles, recent failures, or alerts. Product Audit already identifies alerts, active trips, and device health as missing (`docs/audits/product-audit.md:403-406`).

Impact: an admin cannot answer "what needs attention right now?" without manually inspecting multiple screens or waiting for a user report.

### Issue 3: Public route selection and ETA framing can overstate certainty

Route controls display only `R01` and `R02` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:747-758`). ETA is presented as a specific minute value (`shuttle-tracking-web/components/public/StopInfoCard.tsx:86-105`) even though it is calculated client-side from route geometry, vehicle position, recent speed, and stop dwell assumptions (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:92-170`).

Impact: first-time users may choose the wrong route or over-trust a precise ETA when live inputs are incomplete.

### Issue 4: Error and empty states are inconsistent

Admin list pages show loading and empty states, but fetch failures often use browser alerts (`shuttle-tracking-web/app/admin/vehicles/page.tsx:27-30`, `shuttle-tracking-web/app/admin/routes/page.tsx:21-24`, `shuttle-tracking-web/app/admin/stops/page.tsx:21-24`). Dashboard fetch failure only logs to console (`shuttle-tracking-web/app/admin/dashboard/page.tsx:45-49`). Public route load failure only logs to console (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:616-618`).

Impact: users get different feedback patterns for similar problems, and some critical failures are invisible.

### Issue 5: Public onboarding tour targets appear stale

`AppTour` targets `.rsu-avail`, `.route-selector`, `.rsu-stop-card-compact`, and `.gps-locate-btn` (`shuttle-tracking-web/components/public/AppTour.tsx:22-50`). Repository search found those selectors only in `app/shuttle-tracker.css` and `AppTour`, not in the active JSX controls (`rg` evidence from `shuttle-tracking-web/components` and `shuttle-tracking-web/app`). The current `AvailabilityCard` and route/location controls do not include these class names (`shuttle-tracking-web/components/public/AvailabilityCard.tsx:5-15`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:743-810`).

Impact: first-time help may fail to point at the intended elements, reducing discoverability for nearest stop, route switching, and active count.

## 6. Public Journey Walkthrough

### First-time user

1. User opens `/` and sees a map with RSU branding (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:714-741`).
2. User sees `Active Trams` and route buttons `R01` and `R02` (`shuttle-tracking-web/components/public/AvailabilityCard.tsx:13-14`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:743-761`).
3. Friction: the route buttons do not explain direction, destination, route name, or which route serves which stops. The route names are available in admin route records, but the public selector does not surface them.
4. User can tap a stop marker. The marker becomes larger, the map moves to it, and a stop card appears (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:532-546`, `shuttle-tracking-web/components/public/StopInfoCard.tsx:52-107`).
5. User sees ETA. Friction: ETA is displayed as a precise minute number or `-` with status text (`shuttle-tracking-web/components/public/StopInfoCard.tsx:86-105`), without explaining if no vehicle, stale GPS, or route data failure is involved.
6. User can tap current location. If browser location is unavailable, the app uses an alert (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:246-252`).
7. Friction: the visible current-location button has a title, but no visible label; discoverability depends on icon recognition (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:803-809`).

### Returning user

1. Returning user likely knows route code and can switch quickly.
2. Returning user benefits from direct map access and persistent route geometry cache (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:552-590`).
3. Friction: returning users still have no freshness indicator. If a vehicle stopped reporting, the old marker can remain because no stale cleanup exists in the public tracker (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:70-87`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`).

## 7. Admin Journey Walkthrough

### Typical admin day

1. Admin logs in. Login form provides required fields, loading text, and inline error (`shuttle-tracking-web/app/admin/login/page.tsx:61-98`).
2. Admin lands on Dashboard. It shows `Live Dashboard`, a static `Live System Active` badge, three stat cards, and a live map (`shuttle-tracking-web/app/admin/dashboard/page.tsx:54-133`).
3. Admin tries to answer "is everything okay?" Current UI partially answers count-level questions, but not operational-health questions. There is no list of vehicles that are active but silent, inactive but assigned, or reporting bad/stale GPS.
4. Admin watches live map. The map shows markers only after `location-update` events and popups with speed and station (`shuttle-tracking-web/components/admin/LiveMap.tsx:57-73`). It does not show routes, stops, last seen time, connection health, or stale state.
5. Admin manages vehicles. Vehicle page supports add/edit/delete, status, and route assignment (`shuttle-tracking-web/app/admin/vehicles/page.tsx:79-264`, `shuttle-tracking-web/components/admin/VehicleModal.tsx:74-143`).
6. Admin manages routes. Route page supports id, name, color, status (`shuttle-tracking-web/components/admin/RouteModal.tsx:70-123`).
7. Operational gap: admin cannot manage which stops belong to each route or their order from the UI, despite `RouteStop.stopOrder` existing in schema (`shuttle-tracking-backend/prisma/schema.prisma:86-99`).
8. Admin notices a problem. Current UI gives no alerting surface for stale GPS, trip failure, disconnected socket, feedback, or incident reports.

## 8. Information Hierarchy Review

### Public surface

The public page prioritizes the map, which matches the primary task. The top-right active count and route selector are visible, and the selected stop/vehicle card appears in the bottom-left (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:724-810`).

What works:

- The map is the dominant element.
- Active count and route switcher are always visible.
- Selected stop/vehicle details do not require page navigation.

What does not work yet:

- The top-right hierarchy treats route code as enough context. For a new rider, route meaning is more important than internal route ID.
- The active count is visually prominent, but freshness is more important than count alone for trust.
- The stop card gives ETA prominence but not confidence or last-updated context.

### Admin surface

The admin dashboard prioritizes high-level counts (`shuttle-tracking-web/app/admin/dashboard/page.tsx:70-128`). This is useful for inventory awareness, but less useful for operations.

What works:

- Dashboard title and stats are simple.
- CRUD pages have clear add actions and tables.
- Sidebar is easy to scan.

What does not work yet:

- For live operations, the most important information is exceptions: no GPS, stale vehicle, route without coverage, active trip problems, or backend/socket failure. These are not visually represented.
- The live map is below stat cards and does not contain operational overlays such as route lines, stop markers, stale colors, or last seen times.

## 9. Feedback and Error State Review

### Loading states

Implemented:

- Dashboard stat cards show spinners while loading (`shuttle-tracking-web/app/admin/dashboard/page.tsx:78-120`).
- CRUD pages show loading rows/cards (`shuttle-tracking-web/app/admin/vehicles/page.tsx:100-103`, `shuttle-tracking-web/app/admin/routes/page.tsx:97-100`, `shuttle-tracking-web/app/admin/stops/page.tsx:88-91`).
- Admin live map dynamic import shows a loading map placeholder (`shuttle-tracking-web/app/admin/dashboard/page.tsx:9-16`).
- Login button shows `Signing in...` and disables submit (`shuttle-tracking-web/app/admin/login/page.tsx:90-98`).

Not Found:

- Public map route/stops loading indicator beyond initial map presence.
- Public socket reconnecting indicator.

### Empty states

Implemented:

- Vehicles, routes, and stops each have zero-data empty states with an action hint (`shuttle-tracking-web/app/admin/vehicles/page.tsx:249-253`, `shuttle-tracking-web/app/admin/routes/page.tsx:226-230`, `shuttle-tracking-web/app/admin/stops/page.tsx:202-206`).

Partial:

- Public active vehicle count can show `0 คัน` (`shuttle-tracking-web/components/public/AvailabilityCard.tsx:13-14`), but it does not explain why no vehicles are visible.

Not Implemented:

- Public route has no stops state.
- Admin live map has no empty state explaining no vehicles have reported yet.

### Error states

Implemented:

- Login error appears inline (`shuttle-tracking-web/app/admin/login/page.tsx:55-58`).

Partial:

- CRUD pages use browser `alert` for fetch/save/delete failures (`shuttle-tracking-web/app/admin/vehicles/page.tsx:27-30`, `shuttle-tracking-web/app/admin/routes/page.tsx:47-60`, `shuttle-tracking-web/app/admin/stops/page.tsx:43-56`).

Not Implemented:

- Dashboard visible fetch error (`shuttle-tracking-web/app/admin/dashboard/page.tsx:45-49`).
- Public route load failure UI (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:616-618`).
- Socket disconnect/reconnect UI on public or admin map.

## 10. Operational Visibility Gap Analysis

### Silent or stale vehicles

Not Implemented. Vehicle records have `status`, but no `lastSeenAt`, GPS freshness, device health, or source health fields in the current schema (`shuttle-tracking-backend/prisma/schema.prisma:46-61`). Live maps store latest locations in frontend state/refs without stale cleanup (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:70-87`, `shuttle-tracking-web/components/admin/LiveMap.tsx:24-43`).

Operational impact: an admin cannot tell whether a vehicle is active and healthy, active but silent, or simply not running.

### Active trips and trip history

Partial in backend storage; not surfaced in admin UI. `Trip` and `GPSTrack` exist (`shuttle-tracking-backend/prisma/schema.prisma:105-145`), but Product Audit notes no trip history/admin trip UI (`docs/audits/product-audit.md:242-254`).

Operational impact: admins cannot verify service completion, investigate incidents, or compare current service against past trips.

### Device health and GPS quality

Not Implemented. Backend Audit states no device/source abstraction exists; the schema has Vehicle and GPSTrack but no device/source health model (`docs/audits/backend-audit.md:188-206`, `shuttle-tracking-backend/prisma/schema.prisma:46-61`).

Operational impact: GPS device failures are invisible until riders or admins notice missing movement.

### Route coverage

Not Implemented as dashboard logic. Admin can see total routes and active vehicles, but not "which active routes currently have at least one reporting vehicle" (`shuttle-tracking-web/app/admin/dashboard/page.tsx:70-128`).

Operational impact: an admin cannot quickly identify an uncovered route.

### Rider feedback or incident reporting

Schema exists, but no workflow is surfaced. `Feedback` exists in Prisma (`shuttle-tracking-backend/prisma/schema.prisma:151-160`), while Product Audit notes no public submission or admin review workflow (`docs/audits/product-audit.md:280-288`).

Operational impact: rider-reported issues have no product path into daily operations.

## 11. Recommended Improvements

### Recommendation 1: Add live freshness and stale vehicle states

### Problem

Public and admin maps do not show socket connection status, last updated time, stale vehicles, or reconnecting state (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`).

### User Impact

Riders and admins can mistake stale GPS data for live service.

### Recommendation

Track socket lifecycle (`connect`, `disconnect`, `connect_error`, reconnect attempts) and store `lastSeenAt` per vehicle. Show a small map status label such as `Live`, `Reconnecting`, or `Last update 2 min ago`. Dim or label vehicles after a stale threshold.

### Why

Trust is the core UX value of a live tracker. A simple freshness model is smaller than a redesign and directly addresses the highest-risk experience gap.

### Priority

High

### Difficulty

Medium

### Learning Topic

Realtime data freshness and status/traffic-light patterns.

### Related Files

`shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/app/admin/dashboard/page.tsx`

---

### Recommendation 2: Reframe the admin dashboard around operational exceptions

### Problem

Dashboard cards show inventory counts, but not vehicles/routes requiring attention (`shuttle-tracking-web/app/admin/dashboard/page.tsx:70-128`).

### User Impact

An admin starting the day cannot quickly answer "is everything okay right now?"

### Recommendation

Add an "Attention Needed" section above or beside the map with: silent vehicles, active vehicles with stale GPS, routes with no active reporting vehicle, and socket/API health. Keep the current counts as secondary supporting metrics.

### Why

Operational dashboards should prioritize exceptions because admins act on problems, not totals.

### Priority

High

### Difficulty

Medium

### Learning Topic

Information hierarchy for operational dashboards.

### Related Files

`shuttle-tracking-web/app/admin/dashboard/page.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-backend/prisma/schema.prisma`

---

### Recommendation 3: Make route selection understandable for first-time riders

### Problem

The public route selector shows only `R01` and `R02` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:747-758`).

### User Impact

New riders may not know which route to choose, especially if route codes are internal or campus-specific.

### Recommendation

Show route name or destination under the route code, for example `R01 - Campus Loop`. If space is tight on mobile, use a compact sheet or tooltip opened from the route selector.

### Why

Route code is useful for operators; destination/service meaning is useful for riders.

### Priority

Medium

### Difficulty

Easy

### Learning Topic

Recognition over recall in navigation labels.

### Related Files

`shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/admin/RouteModal.tsx`, `shuttle-tracking-web/types/route.ts`

---

### Recommendation 4: Add ETA confidence framing

### Problem

ETA appears as a precise minute value, but it is derived from client-side route geometry, recent speed history, and assumptions (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:92-170`, `shuttle-tracking-web/components/public/StopInfoCard.tsx:86-105`).

### User Impact

Riders may over-trust the ETA, especially when GPS is stale, no vehicles are active, or the route just loaded.

### Recommendation

Label ETA as `ประมาณ X นาที` or `~X min`, and pair it with freshness: `updated just now`, `no live vehicle`, or `GPS stale`. Use ranges where confidence is low, such as `5-8 min`.

### Why

Confidence framing makes estimates useful without pretending they are exact.

### Priority

Medium

### Difficulty

Easy

### Learning Topic

Confidence framing for estimated times.

### Related Files

`shuttle-tracking-web/components/public/StopInfoCard.tsx`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`

---

### Recommendation 5: Improve no-vehicle and no-data states on the public map

### Problem

`Active Trams` can show `0 คัน`, but the UI does not explain whether service is closed, no vehicle is assigned, no GPS has reported, or the socket is disconnected (`shuttle-tracking-web/components/public/AvailabilityCard.tsx:5-15`).

### User Impact

Riders may not know whether to wait, switch routes, walk, or report an issue.

### Recommendation

When count is zero, show a short state message near the route selector or stop card: `No live vehicles on this route right now` plus freshness/connection status. If route stops fail to load, show `Could not load stops. Try again`.

### Why

Empty states should explain the situation and suggest the next useful action.

### Priority

High

### Difficulty

Easy

### Learning Topic

Empty-state design.

### Related Files

`shuttle-tracking-web/components/public/AvailabilityCard.tsx`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`

---

### Recommendation 6: Fix or remove stale onboarding tour selectors

### Problem

`AppTour` targets selectors that are not present in the active JSX controls (`shuttle-tracking-web/components/public/AppTour.tsx:22-50`; current controls at `shuttle-tracking-web/components/public/ShuttleTracker.tsx:743-810` and `shuttle-tracking-web/components/public/AvailabilityCard.tsx:5-15`).

### User Impact

First-time users may receive broken or confusing guidance.

### Recommendation

Add stable `data-tour` attributes or matching class names to the actual active count, route selector, stop card, and location button. Prefer `data-tour="route-selector"` over styling class names.

### Why

Tours are only helpful if their anchors are stable across visual refactors.

### Priority

Medium

### Difficulty

Easy

### Learning Topic

Guided onboarding and stable UI selectors.

### Related Files

`shuttle-tracking-web/components/public/AppTour.tsx`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/public/AvailabilityCard.tsx`

---

### Recommendation 7: Replace browser alerts with inline, recoverable admin feedback

### Problem

CRUD failures use `alert`, while dashboard failures only log to console (`shuttle-tracking-web/app/admin/vehicles/page.tsx:27-30`, `shuttle-tracking-web/app/admin/routes/page.tsx:47-60`, `shuttle-tracking-web/app/admin/stops/page.tsx:43-56`, `shuttle-tracking-web/app/admin/dashboard/page.tsx:45-49`).

### User Impact

Admins get inconsistent feedback, and some failures are invisible.

### Recommendation

Use inline banners/toasts with specific messages and retry actions. On dashboard, show a non-blocking error banner when stats or map data cannot load.

### Why

Operational tools should keep admins oriented and allow recovery without interruptive browser dialogs.

### Priority

Medium

### Difficulty

Easy

### Learning Topic

Pessimistic UI feedback and recoverable errors.

### Related Files

`shuttle-tracking-web/app/admin/dashboard/page.tsx`, `shuttle-tracking-web/app/admin/vehicles/page.tsx`, `shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/app/admin/stops/page.tsx`

---

### Recommendation 8: Add route-stop management as an admin workflow

### Problem

Admins can create routes and stops separately, but cannot manage stop membership/order for a route. The schema has `RouteStop.stopOrder`, and the knowledge base confirms route-stop endpoints exist but no frontend caller was found (`shuttle-tracking-backend/prisma/schema.prisma:86-99`, `docs/project-knowledge-base.md:96-100`).

### User Impact

Admins cannot safely update actual service routes from the UI.

### Recommendation

Add a route detail view or "Manage Stops" action on each route. Let admins add/remove stops and reorder them. Show a preview of ordered stops before saving.

### Why

For a tracking product, route order is operational data, not just a database relationship.

### Priority

Critical

### Difficulty

Medium

### Learning Topic

Many-to-many relationship management and ordered-list UX.

### Related Files

`shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/components/admin/RouteModal.tsx`, `shuttle-tracking-backend/prisma/schema.prisma`, `shuttle-tracking-backend/src/routes/routeStops.route.ts`

---

### Recommendation 9: Add an admin live vehicle list beside the map

### Problem

The admin live map only shows markers after updates arrive and popups on click (`shuttle-tracking-web/components/admin/LiveMap.tsx:57-73`).

### User Impact

Admins cannot scan all vehicles, sort by problem state, or notice a silent vehicle without interacting with the map.

### Recommendation

Add a compact table/list next to or below the live map: vehicle, route, status, last seen, speed, station/next stop, and health label. Use the map for spatial context, not as the only monitoring surface.

### Why

Maps are good for location, but lists are better for scanning exceptions.

### Priority

High

### Difficulty

Medium

### Learning Topic

Progressive disclosure and map-plus-list monitoring patterns.

### Related Files

`shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/app/admin/dashboard/page.tsx`

## 12. UX Learning Topics

### Information hierarchy

What it is: deciding which information gets the most visual weight based on the user's immediate goal.

What problem it solves: prevents dashboards from highlighting easy-to-count data while hiding action-critical data.

Does this project need it now: yes. The admin dashboard currently highlights totals, while operational exceptions are missing.

Simpler alternative: keep the existing cards but add one `Attention Needed` band above the map.

Suggested learning order: dashboard goals -> user actions -> exception states -> layout priority.

### Empty-state design

What it is: designing useful UI for "nothing here yet" or "nothing available now."

What problem it solves: helps users understand whether zero data is normal, broken, or actionable.

Does this project need it now: yes. Public `0 คัน`, no route stops, and no live map vehicles need explanation.

Simpler alternative: one sentence plus a retry/status indicator.

Suggested learning order: empty reason -> user next action -> recovery path.

### Confidence framing for ETA

What it is: presenting estimates with uncertainty, freshness, or ranges instead of over-precise numbers.

What problem it solves: preserves trust when live data is noisy or incomplete.

Does this project need it now: yes. ETA depends on route geometry, speed history, and live GPS state.

Simpler alternative: use `ประมาณ` or `~`, plus `updated X sec ago`.

Suggested learning order: estimate inputs -> confidence levels -> copy patterns.

### Status and traffic-light patterns

What it is: using consistent labels and visual treatments for states like healthy, warning, critical, offline, and unknown.

What problem it solves: lets admins scan operational health quickly.

Does this project need it now: yes, especially for vehicle and socket freshness.

Simpler alternative: start with three states: Live, Stale, Offline/Unknown.

Suggested learning order: state definitions -> thresholds -> UI labels -> color plus text.

### Progressive disclosure

What it is: showing summary information first, with details available when needed.

What problem it solves: keeps a dashboard scannable without hiding important diagnostic detail.

Does this project need it now: yes. The admin map needs summary exceptions plus drill-down details.

Simpler alternative: vehicle list rows with expandable details.

Suggested learning order: summary fields -> detail fields -> actions.

## 13. Audit Limitations

- This audit used repository evidence and source inspection. No live browser walkthrough or user testing session was performed.
- User research evidence was Not Found. Route-label recommendations are based on UX principles and repository evidence that route controls expose only IDs, not on observed rider behavior.
- Backend currently lacks device health and last-seen fields, so some recommendations require small data-model/API support before the UI can fully implement them.
- This audit intentionally avoids frontend architecture review except where source evidence affects user experience. Code-structure risks are covered by `docs/audits/frontend-audit.md`.
- This audit intentionally avoids product-scope prioritization except where gaps directly affect daily operations. Product completeness is covered by `docs/audits/product-audit.md`.

## 14. Handoff

Recommended next UX-focused implementation order:

1. Add visible live/freshness state to public and admin maps.
2. Add public no-vehicle/no-data messages and route-load error UI.
3. Fix `AppTour` selectors with stable tour anchors.
4. Rework admin dashboard to show `Attention Needed` operational states.
5. Add route-stop management UI.
6. Add admin live vehicle list with last-seen and stale labels.
7. Later, add trip history, feedback inbox, reports, and deeper device health once backend support is available.

Primary files for handoff:

- `shuttle-tracking-web/components/public/ShuttleTracker.tsx`
- `shuttle-tracking-web/components/public/AvailabilityCard.tsx`
- `shuttle-tracking-web/components/public/StopInfoCard.tsx`
- `shuttle-tracking-web/components/public/AppTour.tsx`
- `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- `shuttle-tracking-web/components/admin/LiveMap.tsx`
- `shuttle-tracking-web/app/admin/routes/page.tsx`
- `shuttle-tracking-backend/prisma/schema.prisma`
