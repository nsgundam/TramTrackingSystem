# Frontend Audit: Tram Tracking System

## 1. Executive Summary

Frontend ปัจจุบันเป็น MVP ที่ใช้งาน flow หลักได้ทั้ง public tracker และ admin portal: หน้า public โหลด `ShuttleTracker` แบบปิด SSR, แสดง Leaflet map, โหลด stops, โหลดหรือสร้าง route geometry, รับ Socket.IO `location-update`, อัปเดต marker, คำนวณ ETA, เลือกป้าย/รถ และใช้ browser geolocation ได้ (`shuttle-tracking-web/app/page.tsx:1-14`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:491-711`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:714-813`).

Admin portal รองรับ login, เก็บ JWT ใน `admin_token` cookie, protect route จาก cookie, fetch dashboard stats, แสดง live map, และ CRUD vehicles/routes/stops (`shuttle-tracking-web/app/admin/login/page.tsx:15-33`, `shuttle-tracking-web/contexts/AuthContext.tsx:46-74`, `shuttle-tracking-web/proxy.ts:4-22`, `shuttle-tracking-web/app/admin/dashboard/page.tsx:26-52`, `shuttle-tracking-web/app/admin/vehicles/page.tsx:17-67`, `shuttle-tracking-web/app/admin/routes/page.tsx:16-62`, `shuttle-tracking-web/app/admin/stops/page.tsx:16-58`).

Assessment: **partially ready for MVP, not production-ready yet**.

Main frontend risks:

- Realtime clients do not expose connection, disconnect, reconnect, stale GPS, or backend restart state to users/admins (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`).
- Public tracker concentrates fetching, geometry caching, socket processing, marker lifecycle, snapping, ETA, geolocation, and user interaction in one large component, which is hard to maintain safely (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:40-815`).
- Public route geometry cache invalidation uses only stop IDs, so reordered stops or changed stop coordinates can leave stale local geometry (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:552-590`).
- Admin route protection checks only cookie presence in `proxy.ts`; token expiry is handled later in client context, creating a brief protected-page render path for expired cookies (`shuttle-tracking-web/proxy.ts:4-16`, `shuttle-tracking-web/contexts/AuthContext.tsx:46-66`).
- Product-critical frontend capabilities remain missing or partial: route-stop management UI, trip history UI, feedback review UI, reports, alerts, and device health visibility. Public feedback submission is implemented via the `FeedbackModal` component on the map page, but admin feedback review is missing. Search found no frontend route/page for these features, and the sidebar exposes only Dashboard, Vehicles, Routes, and Stops (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`; product gaps in `docs/audits/product-audit.md:180-198`, `docs/audits/product-audit.md:240-340`, `docs/audits/product-audit.md:405-430`).

## 2. Current Frontend Overview

The frontend is a Next.js App Router application in `shuttle-tracking-web/`. Dependencies include Next.js 16.1.6, React 19.2.3, Leaflet/React-Leaflet, Socket.IO client, Axios, Turf.js, cookies-next, jwt-decode, lucide-react, and react-joyride (`shuttle-tracking-web/package.json:11-25`).

Public surface:

- Root page at `/` dynamically imports `ShuttleTracker` with SSR disabled (`shuttle-tracking-web/app/page.tsx:1-14`).
- `ShuttleTracker` owns the public map, route toggle, stop markers, vehicle markers, route line, ETA, nearest stop, geolocation marker, Socket.IO subscription, and app tour (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:40-815`).
- Leaflet map setup is factored into `useLeafletMap`, which creates an OpenStreetMap tile layer on `#rsu-map` (`shuttle-tracking-web/hooks/useLeafletMap.ts:5-33`).
- Presentation cards are split into `AvailabilityCard`, `StopInfoCard`, `VehicleInfoCard`, and `AppTour` (`shuttle-tracking-web/components/public/AvailabilityCard.tsx:5-18`, `shuttle-tracking-web/components/public/StopInfoCard.tsx:31-109`, `shuttle-tracking-web/components/public/VehicleInfoCard.tsx:14-90`).

Admin surface:

- `/admin/layout.tsx` wraps admin pages in `AuthProvider`, hides sidebar on login, and provides responsive sidebar/mobile header behavior (`shuttle-tracking-web/app/admin/layout.tsx:1-64`).
- Sidebar navigation exposes Dashboard, Vehicles, Routes, and Stops only (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`).
- Login page posts to `auth/login` and calls `login(token, user)` (`shuttle-tracking-web/app/admin/login/page.tsx:15-33`).
- Dashboard fetches vehicles/routes/stops and renders stats plus `LiveMap` (`shuttle-tracking-web/app/admin/dashboard/page.tsx:26-52`, `shuttle-tracking-web/app/admin/dashboard/page.tsx:70-133`).
- Vehicles, routes, and stops pages use page-local fetch/save/delete functions and modal forms (`shuttle-tracking-web/app/admin/vehicles/page.tsx:17-67`, `shuttle-tracking-web/app/admin/routes/page.tsx:16-62`, `shuttle-tracking-web/app/admin/stops/page.tsx:16-58`).

API/environment:

- `.env.example` defines `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api` only (`shuttle-tracking-web/.env.example:1`).
- Authenticated Axios client attaches Bearer token from `admin_token` cookie and redirects on 401/403 (`shuttle-tracking-web/services/api.ts:4-37`).
- Public Axios client exists, but the main public tracker mostly uses direct `fetch` with origin fallback instead (`shuttle-tracking-web/services/publicApi.ts:1-10`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:491-520`).

## 3. Frontend Strengths

1. **Core public tracking journey exists.** The app loads a browser-only tracker, fetches route stops, renders stop markers and route lines, subscribes to `location-update`, updates vehicle markers, computes stop ETA, and supports nearest-stop lookup (`shuttle-tracking-web/app/page.tsx:6-14`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:500-615`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:674-711`).

2. **Map-specific helper logic is partially separated.** Leaflet setup, marker movement, route point search, and bus icon HTML are factored into helper files (`shuttle-tracking-web/hooks/useLeafletMap.ts:5-33`, `shuttle-tracking-web/utils/MapHelpers.ts:5-64`, `shuttle-tracking-web/utils/IconHelpers.ts:1-63`).

3. **Admin CRUD screens cover MVP entities.** Vehicles, routes, and stops pages list data, open create/edit modals, call admin APIs, delete with confirmation, refetch after mutation, and show empty states (`shuttle-tracking-web/app/admin/vehicles/page.tsx:17-67`, `shuttle-tracking-web/app/admin/vehicles/page.tsx:249-263`, `shuttle-tracking-web/app/admin/routes/page.tsx:16-62`, `shuttle-tracking-web/app/admin/routes/page.tsx:226-242`, `shuttle-tracking-web/app/admin/stops/page.tsx:16-58`, `shuttle-tracking-web/app/admin/stops/page.tsx:202-215`).

4. **Authenticated API handling is centralized enough for MVP.** `services/api.ts` adds the Bearer token on requests and removes the cookie plus redirects on 401/403 (`shuttle-tracking-web/services/api.ts:11-37`).

5. **Admin layout has responsive structure.** The admin layout switches between fixed desktop sidebar and mobile drawer/header (`shuttle-tracking-web/app/admin/layout.tsx:20-61`, `shuttle-tracking-web/components/admin/Sidebar.tsx:47-104`).

## 4. Critical Issues

### Issue 1: Realtime UI has no visible connection or stale-state model

The public tracker and admin live map both subscribe to `location-update`, but neither handles `connect`, `disconnect`, `connect_error`, reconnect status, stale timestamps, or removal/degradation of vehicles when GPS stops arriving (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`). The dashboard always renders "Live System Active" regardless of socket state (`shuttle-tracking-web/app/admin/dashboard/page.tsx:64-67`).

Impact: users and admins can see an apparently healthy live map even when the backend is unavailable, the socket is reconnecting, or a vehicle marker is stale.

Priority: **High**

### Issue 2: Route geometry cache can become stale after operational changes

`ShuttleTracker` computes `stopsSignature` from stop IDs only and stores route geometry in `localStorage`. It does not include stop order, coordinates, route version, updated timestamp, or route-stop mapping revision (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:552-590`). Product audit identifies route-stop ordering as critical to operations (`docs/audits/product-audit.md:180-198`).

Impact: if admins reorder stops or move a stop while IDs stay the same, clients may continue using old cached route geometry and wrong stop `polyIndex` values.

Priority: **High**

### Issue 3: Public tracker is a large multi-responsibility component

`ShuttleTracker` owns state, refs, data fetching, cache selection, OSRM fallback, map event wiring, socket handling, Turf snapping, marker creation/update, ETA calculations, cards, route toggles, geolocation, and tour integration in one component (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:40-815`).

Impact: future features such as stale markers, route-stop editing awareness, trip history links, or multi-source device indicators will be risky to add without regressions.

Priority: **High**

### Issue 4: Admin route protection only checks cookie presence in the proxy

`proxy.ts` redirects admin pages only when `admin_token` is missing, and redirects `/admin/login` when a token exists (`shuttle-tracking-web/proxy.ts:4-16`). Expiry validation happens in client context after page load (`shuttle-tracking-web/contexts/AuthContext.tsx:46-66`).

Impact: an expired or malformed cookie can pass the proxy and reach protected pages until the client detects it. The Axios interceptor will eventually redirect on 401/403, but protected UI state can briefly render.

Priority: **Medium**

## 5. Public Tracking Flow Review

Trace:

1. Page load: `/` renders `<main>` and dynamically imports `ShuttleTracker` with SSR disabled (`shuttle-tracking-web/app/page.tsx:1-14`).
2. Map setup: `useLeafletMap` creates a Leaflet map on `#rsu-map` with OpenStreetMap tiles (`shuttle-tracking-web/hooks/useLeafletMap.ts:9-23`).
3. Route data load: once the map is available, `loadRouteData("R01")` and `loadRouteData("R02")` run (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:621-657`).
4. Stop fetch: for each route, the tracker tries backend origins and fetches `/api/public/routes/:routeId/stops` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:491-520`).
5. Stop markers: fetched stops are stored in `stopsByRouteRef`, converted into Leaflet markers, and click handlers set selected stop and recalculate ETA (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:525-550`).
6. Geometry resolution: the tracker checks `localStorage`, then `/data/route-<id>.json`, then OSRM fallback (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:552-590`).
7. Route line and stop indexes: final coordinates are saved, stops receive `polyIndex`, and a route polyline is added (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:595-615`).
8. Socket connection: a Socket.IO client connects to `configuredBackendOrigin` or current origin and listens for `location-update` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`).
9. Marker update: each update is normalized, speed history is stored, the location is optionally snapped to route geometry using Turf, and marker position/bearing are updated (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:315-480`).
10. ETA/nearest stop: ETA uses vehicle polyline index, stop polyline index, distance along the route, stop dwell time, and recent speed history (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:92-171`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:255-313`). Nearest stop uses browser geolocation and Leaflet distance (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:180-210`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:674-692`).
11. User interaction: route buttons switch visible route/stop/vehicle layers; map click clears selected cards; stop/vehicle clicks show cards (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:212-244`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:385-405`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:633-648`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:743-809`).

Findings:

- Implemented: page load, stop fetch, local route file, localStorage cache, OSRM fallback, Socket.IO update, marker snapping, ETA, nearest stop, route toggles, cards, and app tour.
- Not Implemented: user-facing route-load failure state. `loadRouteData` only logs failure (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:616-618`).
- Not Implemented: socket connection status or stale marker state (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`).

## 6. Admin Flow Review

Trace:

1. Login page collects username/password, posts to `auth/login`, extracts `{ token, user }`, and calls `login` (`shuttle-tracking-web/app/admin/login/page.tsx:15-33`).
2. `AuthProvider.login` stores `admin_token` cookie for one day, sets token/user state, sets Axios default auth header, and navigates to `/admin/dashboard` (`shuttle-tracking-web/contexts/AuthContext.tsx:68-74`).
3. `proxy.ts` protects `/admin/*` except `/admin/login` by checking cookie presence (`shuttle-tracking-web/proxy.ts:4-22`).
4. On client mount, `AuthProvider` decodes stored JWT, logs out if expired/invalid, otherwise restores user/token state (`shuttle-tracking-web/contexts/AuthContext.tsx:46-66`).
5. Dashboard loads vehicles, routes, and stops in parallel, then derives active vehicle count locally (`shuttle-tracking-web/app/admin/dashboard/page.tsx:26-52`).
6. Dashboard dynamically imports `LiveMap`, which opens a Socket.IO connection and stores latest locations keyed by vehicle ID (`shuttle-tracking-web/app/admin/dashboard/page.tsx:9-16`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`).
7. CRUD pages fetch data on mount, submit create/update from modals, delete after `confirm`, and refetch after mutation (`shuttle-tracking-web/app/admin/vehicles/page.tsx:17-67`, `shuttle-tracking-web/app/admin/routes/page.tsx:16-62`, `shuttle-tracking-web/app/admin/stops/page.tsx:16-58`).
8. Frontend cache invalidation awareness is limited to refetching the current admin list after mutation. There is no frontend API call for route-stop mapping, no route geometry cache purge instruction, and no cross-tab/admin-public cache awareness (`shuttle-tracking-web/app/admin/vehicles/page.tsx:50-52`, `shuttle-tracking-web/app/admin/routes/page.tsx:44-46`, `shuttle-tracking-web/app/admin/stops/page.tsx:41-42`; no `route-stops` frontend caller found by `rg`).

Findings:

- Implemented: login, token storage, client expiry check, route protection by cookie, dashboard stats, live admin map, vehicle/route/stop CRUD.
- Partial: route protection and session expiry are split between proxy and client context; feedback is partially implemented (public submission exists, admin review is missing).
- Not Implemented: route-stop management, trip history, reports, feedback review (admin side), device health, alerts, admin user management.

## 7. Real-Time Client Review

Normal operation:

- Public tracker connects to `socketOrigin` and handles `location-update` by calling `processLocationUpdateRef.current(data)` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`).
- Admin live map connects and stores latest locations in React state keyed by vehicle ID (`shuttle-tracking-web/components/admin/LiveMap.tsx:27-38`).

Disconnect/reconnect/backend restart:

- Socket.IO client default reconnect behavior likely applies, but the frontend code does not subscribe to reconnect lifecycle events. Evidence is insufficient to claim any user-visible handling; therefore connection state handling is **Not Implemented** in the UI (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`).
- Stale GPS behavior is **Not Implemented**. Vehicle markers remain in refs/state until route filtering or component unmount; no timestamp or TTL removes stale markers (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:70-87`, `shuttle-tracking-web/components/admin/LiveMap.tsx:24-38`).
- Admin dashboard status says "Live System Active" regardless of actual socket state (`shuttle-tracking-web/app/admin/dashboard/page.tsx:64-67`).

Performance:

- Public tracker stores Leaflet markers and many mutable structures in refs, which avoids re-rendering React for every GPS update (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:66-87`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:315-480`). This is appropriate for map-marker performance at MVP scale.
- Admin `LiveMap` stores all active vehicle locations in React state and re-renders marker JSX on every `location-update` (`shuttle-tracking-web/components/admin/LiveMap.tsx:24-38`, `shuttle-tracking-web/components/admin/LiveMap.tsx:57-73`). For 10 vehicles this is probably acceptable, but there is no throttling or stale cleanup evidenced.

## 8. State and Data Fetching Review

State management:

- Public tracker uses many `useRef` stores for map objects and realtime data, with React state reserved for selected route, cards, count, user location, and UI lock state (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:46-88`). This fits Leaflet's imperative model, but the amount of responsibility in one component makes correctness harder to verify.
- Auth state is centralized in `AuthContext` (`shuttle-tracking-web/contexts/AuthContext.tsx:14-90`).
- Admin CRUD state is page-local and simple (`shuttle-tracking-web/app/admin/vehicles/page.tsx:9-16`, `shuttle-tracking-web/app/admin/routes/page.tsx:9-14`, `shuttle-tracking-web/app/admin/stops/page.tsx:9-14`).

Data fetching:

- Admin pages use the centralized authenticated Axios client (`shuttle-tracking-web/app/admin/dashboard/page.tsx:30-34`, `shuttle-tracking-web/app/admin/vehicles/page.tsx:20-23`, `shuttle-tracking-web/app/admin/routes/page.tsx:19-20`, `shuttle-tracking-web/app/admin/stops/page.tsx:19-20`).
- Public tracker uses direct `fetch` with origin fallback rather than `publicApi`, so API behavior is duplicated (`shuttle-tracking-web/services/publicApi.ts:1-10`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:491-520`).
- Dashboard catches errors only with `console.error` and still renders stats after loading ends; no visible dashboard error state is shown (`shuttle-tracking-web/app/admin/dashboard/page.tsx:45-49`).

Needs Confirmation:

- Whether API route shapes are stable enough for duplicated public fetch logic. No frontend API contract or generated types were found.

## 9. Map and Route Geometry Review

Geometry order:

- Implemented order is `localStorage` cache first, then local `/data/route-<id>.json`, then OSRM fallback (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:552-590`). This differs from the frontend agent wording "local file -> cache -> OSRM", but it is the actual code path.

Strengths:

- Local JSON route geometry files exist for R01 and R02 (`shuttle-tracking-web/public/data/route-R01.json`, `shuttle-tracking-web/public/data/route-R02.json`).
- OSRM fallback can generate geometry from route stops if local/cache geometry is missing (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:578-590`).
- Turf route snapping is localized to a nearby window around the last route index, reducing cross-lane jumps (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:335-367`, `shuttle-tracking-web/utils/MapHelpers.ts:41-64`).

Risks:

- Cache signature uses only stop IDs (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:552-564`).
- OSRM fetch lacks `ok` handling and user-facing failure state; if local JSON, cache, and OSRM all fail, the route line is absent and only an error is logged (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:578-618`).
- Environment configuration does not document `NEXT_PUBLIC_BACKEND_URL`, although the public tracker uses it. `.env.example` only documents `NEXT_PUBLIC_API_BASE_URL` (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:42-45`, `shuttle-tracking-web/.env.example:1`).
- Admin `LiveMap` uses `NEXT_PUBLIC_API_BASE_URL` directly for Socket.IO, which defaults to a URL ending in `/api` (`shuttle-tracking-web/components/admin/LiveMap.tsx:27-29`, `shuttle-tracking-web/.env.example:1`). Public tracker strips `/api` before connecting (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:42-45`). Needs Confirmation: whether the backend Socket.IO server accepts the `/api` origin URL in all environments.

## 10. Forms and CRUD UX Review

Vehicles:

- Form requires id/name/type, supports status select and assigned route select (`shuttle-tracking-web/components/admin/VehicleModal.tsx:67-160`).
- Save calls POST or PUT and refetches (`shuttle-tracking-web/app/admin/vehicles/page.tsx:40-57`).
- Delete uses browser `confirm` and refetches (`shuttle-tracking-web/app/admin/vehicles/page.tsx:59-67`).

Routes:

- Form requires id/name/color and status (`shuttle-tracking-web/components/admin/RouteModal.tsx:62-140`).
- Save/delete/refetch are implemented (`shuttle-tracking-web/app/admin/routes/page.tsx:34-62`).

Stops:

- Form requires id/nameTh/lat/lng and parses lat/lng as floats before submit (`shuttle-tracking-web/components/admin/StopModal.tsx:54-60`, `shuttle-tracking-web/components/admin/StopModal.tsx:77-165`).
- No client-side coordinate range validation is implemented beyond `type="number"` and `required` (`shuttle-tracking-web/components/admin/StopModal.tsx:118-144`).

Feedback and concurrent edits:

- Success feedback is mostly implicit: modal closes and list refreshes. Failure feedback uses `alert` (`shuttle-tracking-web/app/admin/vehicles/page.tsx:53-56`, `shuttle-tracking-web/app/admin/routes/page.tsx:47-60`, `shuttle-tracking-web/app/admin/stops/page.tsx:43-56`).
- Concurrent edit/stale data handling is **Not Implemented**. No version field, updated timestamp comparison, conflict UI, or revalidation prompt is present in frontend CRUD flows.

## 11. Error, Loading, and Empty State Review

Implemented:

- Admin list pages show loading states (`shuttle-tracking-web/app/admin/vehicles/page.tsx:100-103`, `shuttle-tracking-web/app/admin/routes/page.tsx:97-100`, `shuttle-tracking-web/app/admin/stops/page.tsx:88-91`).
- Admin list pages show empty states for zero vehicles/routes/stops (`shuttle-tracking-web/app/admin/vehicles/page.tsx:249-253`, `shuttle-tracking-web/app/admin/routes/page.tsx:226-230`, `shuttle-tracking-web/app/admin/stops/page.tsx:202-206`).
- Login page shows inline error and disables submit while loading (`shuttle-tracking-web/app/admin/login/page.tsx:11-33`, `shuttle-tracking-web/app/admin/login/page.tsx:55-98`).

Partial:

- Dashboard has loading indicators for stat cards, but fetch failure only logs to console and leaves no visible error (`shuttle-tracking-web/app/admin/dashboard/page.tsx:45-49`, `shuttle-tracking-web/app/admin/dashboard/page.tsx:78-120`).
- Public geolocation failure logs to console or alerts when user explicitly requests nearest location (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:180-181`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:674-692`).

Not Implemented:

- Public route/stops load failure state (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:616-618`).
- Public zero-stops route state beyond silently having no markers (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:525-550`).
- GPS stale/offline state when updates stop mid-session (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`).

## 12. Missing Frontend Capabilities

Strictly from frontend evidence:

- Route-stop management UI: **Not Implemented**. Sidebar has no route-stop page, routes page only manages route id/name/color/status, and no `route-stops` caller was found (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`, `shuttle-tracking-web/components/admin/RouteModal.tsx:20-25`, `rg route-stops shuttle-tracking-web` returned no caller). Product audit marks this Phase 1 Critical (`docs/audits/product-audit.md:180-198`).
- Trip history UI: **Not Implemented**. No frontend page or API usage for trips/history was found; product audit marks trip history as missing/critical (`docs/audits/product-audit.md:240-266`).
- Feedback UI: **Partially Implemented**. Public feedback submission is implemented via the `FeedbackModal` component (`shuttle-tracking-web/components/public/FeedbackModal.tsx`) and the "ส่งข้อเสนอแนะ" button on the map (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:924-930`). However, the **Admin Feedback Review UI** is **Not Implemented** (no feedback review screen or endpoint integrations exist for admins).
- Device status UI: **Not Implemented**. No device health or last-seen admin UI was found; architecture/backend audits identify no device/source abstraction yet (`docs/audits/architecture-audit.md:7-17`, `docs/audits/backend-audit.md:188-206`).
- Reports UI: **Not Implemented**. No reports page or report API usage was found; product audit lists reporting as missing (`docs/audits/product-audit.md:405-430`).
- Alerts/notifications UI: **Not Implemented**. No alert/notification workflow was found; dashboard status is static (`shuttle-tracking-web/app/admin/dashboard/page.tsx:64-67`).
- Admin user/role management UI: **Not Implemented**. Sidebar and pages only expose dashboard/vehicles/routes/stops (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`).

## 13. Recommended Improvements

### Recommendation 1: Add realtime connection and stale vehicle states

### Problem

Public and admin maps subscribe to `location-update` only. They do not expose connection status, reconnecting state, backend errors, or stale vehicle markers (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:695-711`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-43`).

### Impact

Users and admins can mistake stale or disconnected data for live tracking. The dashboard currently displays "Live System Active" regardless of socket health (`shuttle-tracking-web/app/admin/dashboard/page.tsx:64-67`).

### Recommendation

Track socket lifecycle events (`connect`, `disconnect`, `connect_error`, `reconnect_attempt`) in a small connection state model. Store `lastSeenAt` per vehicle, dim or label stale vehicles after a short threshold, and show a non-blocking map status indicator.

### Why

This directly addresses the highest frontend reliability gap without requiring a new state-management library.

### Priority

High

### Difficulty

Medium

### Learning Topic

Socket.IO reconnection strategies and stale realtime data indicators.

### Related Files

`shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/app/admin/dashboard/page.tsx`

---

### Recommendation 2: Fix route geometry cache invalidation

### Problem

Route geometry cache signature uses only stop IDs (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:552-564`).

### Impact

Stop reordering or coordinate edits can leave clients with old local route geometry and incorrect ETA/marker snapping.

### Recommendation

Build the signature from stop IDs, order, lat/lng, and route ID. If the backend later exposes route version or `updatedAt`, prefer that. Also catch invalid JSON from `localStorage` and fall back gracefully.

### Why

Product audit identifies route-stop ordering as operationally critical, and the frontend route line/ETA depends on accurate geometry (`docs/audits/product-audit.md:180-198`).

### Priority

High

### Difficulty

Easy

### Learning Topic

Client cache invalidation and cache keys.

### Related Files

`shuttle-tracking-web/components/public/ShuttleTracker.tsx`

---

### Recommendation 3: Split `ShuttleTracker` into focused hooks/modules

### Problem

`ShuttleTracker` mixes map setup, fetching, caching, socket processing, snapping, ETA, marker lifecycle, geolocation, and UI rendering in one component (`shuttle-tracking-web/components/public/ShuttleTracker.tsx:40-815`).

### Impact

Future reliability features will be difficult to add and test without regressions.

### Recommendation

Extract focused units such as `useRouteData`, `useVehicleSocket`, `useVehicleMarkers`, and `useEtaCalculator`. Keep Leaflet markers in refs, but move side-effect ownership into named hooks with clear inputs/outputs.

### Why

The existing code already has helper boundaries (`useLeafletMap`, `MapHelpers`, `IconHelpers`), so this continues the current pattern rather than adding a new framework.

### Priority

High

### Difficulty

Medium

### Learning Topic

Custom React hooks for imperative map integrations.

### Related Files

`shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/hooks/useLeafletMap.ts`, `shuttle-tracking-web/utils/MapHelpers.ts`

---

### Recommendation 4: Add route-stop management UI

### Problem

Admins can create routes and stops, but cannot manage stop membership/order per route from the frontend. No `route-stops` caller was found, and the sidebar has no route-stop management area (`shuttle-tracking-web/components/admin/Sidebar.tsx:15-36`).

### Impact

Public tracking depends on route-stop order, but operations staff cannot update that order through the admin portal.

### Recommendation

Add a route detail or route-stop manager page that lists route stops, adds/removes stops, reorders stops, and explains that public route geometry may refresh after changes.

### Why

Product audit marks route-stop management as Phase 1 Critical, and backend route-stop endpoints already exist according to the knowledge base (`docs/audits/product-audit.md:180-198`, `docs/project-knowledge-base.md:96-100`).

### Priority

Critical

### Difficulty

Medium

### Learning Topic

Ordered many-to-many UI patterns.

### Related Files

`shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/components/admin/RouteModal.tsx`, `shuttle-tracking-web/components/admin/Sidebar.tsx`

---

### Recommendation 5: Improve admin CRUD feedback and validation

### Problem

CRUD failures use browser alerts, success is implicit, and stop coordinates are only constrained by number inputs without range validation (`shuttle-tracking-web/app/admin/vehicles/page.tsx:53-65`, `shuttle-tracking-web/app/admin/routes/page.tsx:47-60`, `shuttle-tracking-web/app/admin/stops/page.tsx:43-56`, `shuttle-tracking-web/components/admin/StopModal.tsx:118-144`).

### Impact

Admins get inconsistent feedback and can submit coordinates that are numeric but invalid for latitude/longitude.

### Recommendation

Add inline form errors, disabled submit while saving, success toast/banner, API error message display, and latitude/longitude range validation.

### Why

This improves reliability and admin confidence without changing backend contracts.

### Priority

Medium

### Difficulty

Easy

### Learning Topic

Controlled forms, client validation, and mutation feedback.

### Related Files

`shuttle-tracking-web/components/admin/VehicleModal.tsx`, `shuttle-tracking-web/components/admin/RouteModal.tsx`, `shuttle-tracking-web/components/admin/StopModal.tsx`, `shuttle-tracking-web/app/admin/vehicles/page.tsx`, `shuttle-tracking-web/app/admin/routes/page.tsx`, `shuttle-tracking-web/app/admin/stops/page.tsx`

---

### Recommendation 6: Align socket environment configuration

### Problem

`.env.example` documents only `NEXT_PUBLIC_API_BASE_URL`, public tracker derives backend origin by stripping `/api`, and admin `LiveMap` passes `NEXT_PUBLIC_API_BASE_URL` directly to Socket.IO (`shuttle-tracking-web/.env.example:1`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx:42-45`, `shuttle-tracking-web/components/admin/LiveMap.tsx:27-29`).

### Impact

Different frontend surfaces may connect to different socket origins in non-local environments.

### Recommendation

Document and use a single `NEXT_PUBLIC_BACKEND_URL` or `NEXT_PUBLIC_SOCKET_URL` for Socket.IO, and keep `NEXT_PUBLIC_API_BASE_URL` for REST only.

### Why

Socket.IO connects to the backend origin, not the REST `/api` base path. The public tracker already acknowledges this by stripping `/api`.

### Priority

Medium

### Difficulty

Easy

### Learning Topic

Environment configuration for REST versus websocket origins.

### Related Files

`shuttle-tracking-web/.env.example`, `shuttle-tracking-web/components/public/ShuttleTracker.tsx`, `shuttle-tracking-web/components/admin/LiveMap.tsx`, `shuttle-tracking-web/README.md`

---

### Recommendation 7: Decode or validate admin token in route protection

### Problem

`proxy.ts` only checks that `admin_token` exists (`shuttle-tracking-web/proxy.ts:4-16`).

### Impact

Expired or malformed cookies can reach protected pages until client-side logout or API 401/403 handling runs.

### Recommendation

At minimum, clear expired cookies and redirect earlier in the client layout before rendering protected page content. If edge-safe JWT verification is available later, validate expiry in the proxy too.

### Why

The current client context already decodes expiry, so the improvement is to apply the same session model consistently before protected UI renders.

### Priority

Medium

### Difficulty

Medium

### Learning Topic

Next.js route protection and client/server auth boundaries.

### Related Files

`shuttle-tracking-web/proxy.ts`, `shuttle-tracking-web/contexts/AuthContext.tsx`, `shuttle-tracking-web/app/admin/layout.tsx`

---

## 14. Frontend Learning Topics

### Socket reconnection strategies

What it is: a UI pattern for showing whether realtime data is connected, reconnecting, failed, or stale.

What problem it solves: users can tell the difference between "no vehicles" and "live connection is down."

Does this project need it now: yes, because both public and admin maps depend on live GPS.

Simpler alternative: start with a single connection badge and per-vehicle `lastSeenAt`, then add richer retry details later.

Suggested learning order: Socket.IO client lifecycle events -> timestamp-based stale UI -> reconnect UX copy.

### Client cache invalidation

What it is: choosing cache keys that change whenever the underlying data changes.

What problem it solves: prevents old route geometry from surviving after stop edits or reordering.

Does this project need it now: yes, because route geometry affects marker snapping and ETA.

Simpler alternative: include stop IDs, order, lat/lng in the signature before introducing backend versions.

Suggested learning order: cache key design -> localStorage error handling -> backend version fields.

### Custom hooks for imperative APIs

What it is: wrapping side effects like Leaflet markers and Socket.IO subscriptions in named hooks.

What problem it solves: reduces large component complexity while preserving efficient refs.

Does this project need it now: yes, before adding stale vehicles, route-stop cache awareness, and source/device indicators.

Simpler alternative: extract one hook at a time, starting with route data loading or socket handling.

Suggested learning order: `useRef` for imperative objects -> effect cleanup -> custom hook inputs/outputs.

### Controlled forms and mutation feedback

What it is: keeping form values in React state and showing validation/saving/error/success states.

What problem it solves: admins understand what failed and avoid submitting invalid data.

Does this project need it now: yes for stops coordinate validation and CRUD clarity.

Simpler alternative: inline errors and disabled submit buttons before introducing a full form library.

Suggested learning order: controlled inputs -> field validation -> API error mapping -> success feedback.

## 15. Audit Limitations

- Required context documents were present: project knowledge base, product audit, architecture audit, and backend audit. No reduced-context limitation applies.
- This audit did not evaluate backend correctness beyond using prior backend/architecture audit findings as context.
- No browser/device visual QA was run as part of this audit. Responsiveness/accessibility comments are based on source evidence only.
- No synthetic performance benchmark was run. Performance findings are limited to code structure and update patterns.
- `PublicMap.tsx` appears unused because root page imports `ShuttleTracker`, and repository search found no `PublicMap` import (`shuttle-tracking-web/app/page.tsx:6-14`; `rg PublicMap shuttle-tracking-web`). It was treated as legacy/cleanup evidence, not current runtime behavior.

## 16. Handoff

Recommended next agents:

- **Database Audit Agent**: review whether route-stop ordering, trip history, GPS tracks, device/source models, and cache/version fields are ready for the missing frontend capabilities identified here.
- **Dashboard & UX Audit Agent**: review admin workflows, realtime status UX, route-stop manager interaction, form feedback, and public tracker states from a user-experience perspective.
- **Infrastructure & Device Audit Agent**: review Socket.IO deployment origins, environment variable conventions, backend restart behavior, device sender identity, and stale/offline semantics that the frontend should display.

Completion checklist:

- Public and admin frontend flows traced end-to-end.
- Real-time client behavior reviewed.
- State and data-fetching patterns reviewed.
- Map and route geometry handling reviewed.
- Missing frontend capabilities identified against Product Audit.
- Recommendations prioritized and justified with evidence.
- Learning topics explained in mentor mode.
- `docs/audits/frontend-audit.md` created.
