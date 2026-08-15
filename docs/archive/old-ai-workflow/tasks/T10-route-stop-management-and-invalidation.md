# Implementation Task Specification: T10 — route-stop management and invalidation

## Source Work

- Work ID: T10
- Lane: Roadmap
- Roadmap task: T10
- User authorization: Run Approved Batch request on 2026-08-01 to re-audit and execute eligible T9–T12 work without bypassing dependencies or owner decisions.
- Approved decisions: D-001=C; D-007 is not changed by this task because all existing authenticated admins retain the same server authorization boundary.
- Specialist briefs: None; the revalidated Architecture, Backend, Frontend, Dashboard & UX, Security, and Production reports resolve task placement without a focused unresolved technical question.
- Source audits: docs/audits/product-audit.md, architecture-audit.md, backend-audit.md, frontend-audit.md, database-audit.md, dashboard-ux-audit.md, security-devops-observability-audit.md, and production-readiness-audit.md — Validated at 671b71209ad3ba3341de78f836b6ec057813280c.

## Outcome and Non-goals

- Outcome: An authenticated admin can open a route, select active stops, add/remove/reorder its complete ordered sequence, publish it through one validated replacement operation, and receive newly ordered stops on the next public read after cache invalidation.
- Non-goals: No role hierarchy/account lifecycle, route geometry persistence/generation, route playback, device/source operations, feedback triage, public theme redesign, deployment configuration, mobile sender behavior, schema migration, or browser test against an ambient database.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | T10 owns operator-managed route-stop composition; preserve existing route CRUD and public read behavior. |
| Architecture | Bounded | One replacement command owns publish ordering; public cache invalidation occurs after a successful write. |
| Security / privacy | Bounded | Existing authenticated admin boundary is retained; no new sensitive data or role decision. |
| Data / migration | Bounded | Existing RouteStop rows are replaced transactionally; no schema change or migration. |
| Operations / rollout | None | No runtime/deployment action; browser smoke requires an explicitly approved disposable target and is not run here. |
| Research validity | None | No research model, raw telemetry, or metrics path changes. |

## Allowed Writes

- docs/tasks/T10-route-stop-management-and-invalidation.md
- docs/roadmap/master-refactoring-roadmap.md
- docs/audits/README.md
- shuttle-tracking-backend/src/middleware/validation.ts
- shuttle-tracking-backend/src/services/route-stop-order.service.ts
- shuttle-tracking-backend/src/controllers/routeStops.controller.ts
- shuttle-tracking-backend/src/routes/routeStops.route.ts
- shuttle-tracking-backend/tests/test_t10_route_stops.js
- shuttle-tracking-backend/package.json
- shuttle-tracking-web/app/admin/routes/page.tsx
- shuttle-tracking-web/components/admin/RouteStopsModal.tsx

## Read-only Context

- docs/roadmap/master-refactoring-roadmap.md
- docs/decision-queue.md
- docs/audits/architecture-audit.md
- docs/audits/backend-audit.md
- docs/audits/frontend-audit.md
- docs/audits/dashboard-ux-audit.md
- shuttle-tracking-backend/src/services/cache.service.ts
- shuttle-tracking-backend/prisma/schema.prisma
- shuttle-tracking-web/types/route.ts
- shuttle-tracking-web/types/stop.ts

## Invariants

- The public rider surface reads ordered stops only from its existing public API and continues to derive local geometry cache versioning from that returned sequence.
- The selected route in the admin UI cannot assign vehicle route authority or alter canonical vehicle state.
- A published sequence contains each active stop at most once and server-assigned contiguous orders beginning at one.
- Route-stop replacement commits all membership/order changes atomically; no partial order becomes visible to an admin write.
- Public cache invalidation happens only after a successful mutation and legacy create/delete mutations also invalidate the public cache.
- No endpoint, UI, or log exposes credentials, raw research observations, or new role privilege.

## Required Changes

1. Add a bounded replacement payload parser and pure ordered-sequence helper that rejects duplicate stops and assigns contiguous server-side order.
2. Add an authenticated PUT route-stop replacement endpoint. Verify the route exists and every submitted stop exists and is active; replace its rows in one transaction; then invalidate public cache.
3. Make the existing create/delete route-stop mutations invalidate the same public cache after success.
4. Add a route-stop management modal to the existing authenticated Routes page. It loads active stops and current ordered route stops, supports add/remove/up/down, protects against duplicates, shows loading/saving/error state, and publishes the full ordered list through the replacement endpoint.
5. Add deterministic backend tests for payload rejection and contiguous replacement ordering, and include them in backend boundary checks.
6. Record acceptance evidence, update T10 status/dependency notes, and downgrade affected audit register rows after source changes.

## Acceptance Criteria

- An authenticated admin has a route-detail UI to select, remove, and reorder active stops, then publish without manual API work.
- Empty or duplicate/malformed stop lists and unavailable/inactive stop membership fail safely; server order is contiguous and derived from list order.
- A successful replacement is transactionally written and invalidates route-stop public cache; the next public read is able to obtain the new ordered sequence for geometry cache refresh.
- Existing route-stop create/delete mutations invalidate public cache.
- Backend deterministic test, backend build/check, frontend lint/build, repository CI, diff check, and agent-workflow validation pass.
- Browser route-change smoke is reported as unavailable unless an explicitly approved disposable runtime target is supplied.

## Validation Commands

- npm --prefix shuttle-tracking-backend run test:boundaries
- npm --prefix shuttle-tracking-backend run build
- npm --prefix shuttle-tracking-web run lint
- npm --prefix shuttle-tracking-web run build
- bash scripts/ci-checks.sh
- git diff --check
- node scripts/validate-agent-workflow.js

## Rollout and Migration Limits

Not applicable. Do not run migrations, seed, Compose up, browser smoke, or any ambient runtime check. No schema/data migration is in scope.

## Stop Conditions

- Stop if a write path outside Allowed Writes is required.
- Stop if D-007 role authorization must change or a new owner policy is needed.
- Stop if verification requires an ambient database, a production/disposable runtime target not explicitly approved, deployment facts, secrets, provider, or hardware.
- Stop rather than changing public canonical state, route geometry storage, or deployment configuration.

## Completion Evidence

- Status: Complete
- Acceptance mapping:
  - Route-detail management without manual API work → `RouteStopsModal.tsx` is launched from the authenticated Routes page and loads active stops/current route order; it publishes the complete sequence with one `PUT /api/admin/route-stops/:routeId` request.
  - Reject duplicate/malformed/inactive membership and assign contiguous order → `test_t10_route_stops.js` passed through the backend boundary suite; the controller verifies every submitted stop is active before the transaction.
  - Atomically replace the route sequence and invalidate public cache → source inspection confirms `replaceRouteStops` deletes/creates one route sequence inside `prisma.$transaction`, then calls `invalidatePublicCache`; legacy create/delete now call the same invalidator after success.
  - Build and repository gates → backend check, frontend lint/build, `bash scripts/ci-checks.sh`, `git diff --check`, and agent-workflow validation passed on 2026-08-01. Frontend lint retains two pre-existing warnings in `app/layout.tsx` and `utils/IconHelpers.ts`.
  - Browser route-change smoke → not run for T10 because no explicitly approved disposable database/runtime target was supplied. The repository's isolated T8 browser fixture passed in CI, but it does not exercise admin route mutation.
- Changed files: `docs/tasks/T10-route-stop-management-and-invalidation.md`, `docs/roadmap/master-refactoring-roadmap.md`, `docs/audits/README.md`, `shuttle-tracking-backend/src/middleware/validation.ts`, `shuttle-tracking-backend/src/services/route-stop-order.service.ts`, `shuttle-tracking-backend/src/controllers/routeStops.controller.ts`, `shuttle-tracking-backend/src/routes/routeStops.route.ts`, `shuttle-tracking-backend/tests/test_t10_route_stops.js`, `shuttle-tracking-backend/package.json`, `shuttle-tracking-web/app/admin/routes/page.tsx`, and `shuttle-tracking-web/components/admin/RouteStopsModal.tsx`.
- Validation results: `npm --prefix shuttle-tracking-backend run check` passed; `npm --prefix shuttle-tracking-web run lint` passed with two pre-existing warnings; `npm --prefix shuttle-tracking-web run build` passed; `bash scripts/ci-checks.sh` passed outside the sandbox so its synthetic localhost Playwright server could bind; `git diff --check` and `node scripts/validate-agent-workflow.js` passed.
- Audit freshness changes: Discovery, Product, Architecture, Backend, Frontend, Database, Infrastructure & Device, Dashboard & UX, Security/DevOps/Observability, Production Readiness, and Roadmap are downgraded to `Needs Re-audit` because T10 changes backend/admin/public route-stop behavior and/or their required predecessors. T9/T11/T12 remain independently blocked, so no follow-on re-audit bypasses their owner or external-evidence gates.
