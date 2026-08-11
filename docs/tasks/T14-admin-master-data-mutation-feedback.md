# Implementation Task Specification: T14 — Admin Master-Data Mutation Feedback

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, remaining native master-data mutation-recovery finding
- User authorization: Run Approved Batch plus the 2026-08-10/11 direction to continue Roadmap work
  without bypassing dependencies or owner decisions; Public UI remains substantially unchanged and
  authenticated Admin may be improved inside the owner-selected bright-neutral Signal Lens world.
- Approved decisions: D-011 at `a0a0ce1`; the bright-neutral Admin foundation is implemented at
  `c4fdc3a` and accepted by the affected Level 1 chain at `f526939`. D-012 is not implemented here.
- Specialist briefs: None required. Product, Architecture, Frontend, Dashboard & UX, Production
  Readiness, and Roadmap validate this exact next finding at `f526939`; no focused cross-domain
  uncertainty remains.
- Source audits: `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`,
  `docs/audits/frontend-audit.md`, `docs/audits/dashboard-ux-audit.md`, and
  `docs/audits/production-readiness-audit.md` are `Validated` at source baseline `c4fdc3a`;
  `docs/audits/README.md` identifies this bounded handoff as ready without changing freshness.
- Product/design workflow: this is an identity-preserving Operate-mode refactor under
  `frontend-design`, not a new visual world. The concrete subject is an RSU operator mutating one
  vehicle, route, or stop; the page's job is to make target, pending state, success, failure, and
  destructive intent unambiguous. The compact mutation receipt is the one signature element. It
  extends the documented opaque alert and shared-modal tiers without changing tokens, type, palette,
  or `DESIGN.md` authority.

## Gate and Execution Status

- Dependency gate: Passed. T8 is complete for its approved truthful Public-state scope, and T10's
  later route-stop/cache boundary is complete; this task consumes but does not modify either result.
- Decision gate: Passed. D-011 and its owner refinement at `a0a0ce1` bind Public preservation and the
  explicitly light white/gray Admin visual world. D-012 implementation is intentionally excluded.
- Task gate: Passed. This document is the exact-path Level 3 handoff selected by the current Roadmap.
- Evidence-freshness gate: Passed. The affected Level 1 chain is validated at `f526939` against
  source baseline `c4fdc3a`; task creation changes no application evidence or audit freshness.
- Specialist gate: No Level 2 brief is required; no focused product, security, data, or visual-
  identity uncertainty remains.
- Execution mode: Direct Level 3, measurement-first, inside the approved batch. Stop at any new
  owner decision, dependency, policy, endpoint/body, permission, external-target, or write-path need.

## Outcome and Non-goals

- Outcome: replace native browser mutation alerts and confirmations on Vehicles, Routes, and Stops
  with one typed semantic feedback boundary, inline form failure/pending behavior, persistent page-
  level success receipts, and one shared focus-managed delete confirmation. Existing requests,
  fields, data refresh, authorization, page hierarchy, and Signal Lens materials remain intact.
- Non-goals: no Public or Login source/style/behavior change; no master-data field, validation,
  workflow, permission, endpoint, request body, response contract, cache, canonical-state, T10
  route-stop behavior, schema, persistence, migration, dependency, backend, Mobile, T9/T11/T13/T15,
  Research, deployment, external-target, general notification/toast framework, bulk action, undo,
  soft-delete, or owner-policy work.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | Level 1 selects native master-data mutation recovery; action vocabulary and outcomes become visible without changing capability. |
| Architecture | Bounded | One typed client presentation/error boundary and one shared confirmation component; page/API/data owners remain unchanged. |
| Security / privacy | Bounded | Server authorization remains authoritative; safe error projection accepts `unknown` and never renders/logs an arbitrary error object. |
| Data / migration | None | Existing create/update/delete requests are unchanged; no schema, migration, seed, cache, or stateful target action. |
| Operations / rollout | Bounded | Frontend source/test rollback only; no deployment, runtime target, account, or destructive external operation. |
| Research validity | None | No research observation, metric, export, simulator, device, or provenance surface changes. |

## Allowed Writes

- `docs/tasks/T14-admin-master-data-mutation-feedback.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/admin/admin.css`
- `shuttle-tracking-web/app/admin/vehicles/page.tsx`
- `shuttle-tracking-web/app/admin/routes/page.tsx`
- `shuttle-tracking-web/app/admin/stops/page.tsx`
- `shuttle-tracking-web/components/admin/AdminFormModal.tsx`
- `shuttle-tracking-web/components/admin/AdminMutationFeedback.tsx`
- `shuttle-tracking-web/components/admin/VehicleModal.tsx`
- `shuttle-tracking-web/components/admin/RouteModal.tsx`
- `shuttle-tracking-web/components/admin/StopModal.tsx`
- `shuttle-tracking-web/tests/t14-admin-master-data.spec.ts`

## Read-only Context

- `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`
- `docs/project-knowledge-base.md`, `docs/decision-queue.md`, current audits, and prior T14 tasks
- `shuttle-tracking-web/components/admin/AdminResourcePage.tsx`
- `shuttle-tracking-web/components/admin/RouteStopsModal.tsx`
- `shuttle-tracking-web/app/admin/feedback/page.tsx`
- `shuttle-tracking-web/hooks/useModalFocus.ts`
- `shuttle-tracking-web/services/api.ts`
- `shuttle-tracking-web/types/vehicle.ts`, `shuttle-tracking-web/types/route.ts`,
  `shuttle-tracking-web/types/stop.ts`
- existing T8/T10/T12/T14 tests, Playwright configuration, and package scripts
- all backend, schema, migration, Public, Login, Mobile, Research, deployment, and external-target
  paths

## Invariants

- Vehicle create/update/delete remain respectively `POST admin/vehicles`,
  `PUT admin/vehicles/:id`, and `DELETE admin/vehicles/:id` with the incumbent DTO.
- Route create/update/delete remain respectively `POST admin/routes`, `PUT admin/routes/:id`, and
  `DELETE admin/routes/:id` with the incumbent DTO; `RouteStopsModal` still publishes the exact
  ordered `{ stopIds }` body through `PUT admin/route-stops/:routeId`.
- Stop create/update/delete remain respectively `POST admin/stops`, `PUT admin/stops/:id`, and
  `DELETE admin/stops/:id` with the incumbent DTO.
- A delete request occurs only after explicit confirmation. Cancel, Escape, or close before pending
  sends no request and restores focus to the invoking action. While pending, confirm/repeat/close are
  disabled; failure keeps the dialog open with a safe inline alert and permits retry.
- A save failure keeps the form and entered values available, exposes a safe inline alert, and
  permits retry. Pending submit cannot repeat. Success closes the form, refreshes through the
  incumbent read boundary, and exposes a polite page receipt naming the completed action.
- Feedback is semantic and non-transient: failure uses `role="alert"`; success uses a polite status;
  meaning is not color-only; controls remain at least 44 by 44 CSS px and keyboard focus is visible.
- Signal Lens remains explicitly light white/gray. The shared modal stays on the functional-glass
  tier; receipts and form alerts remain opaque operational content. No new token, font, icon family,
  dark theme, animation, or decorative material is introduced.
- Public and Admin Login source/DOM/copy/style/request behavior do not change. Sidebar roles,
  master-data content/fields/action availability, load/error/empty/ready projections, and existing
  responsive table/card behavior remain.
- No arbitrary caught error, credential, request configuration, response body, or payload is logged
  or rendered. Untrusted failure input is narrowed from `unknown` to one non-empty server `error`
  string or a stable resource-specific fallback.
- No dependency, `any`, unsafe double assertion, lint disable, `@ts-ignore`, or native
  `window.alert`/`window.confirm` equivalent is introduced.

## Required Changes

1. Add one typed `AdminMutationFeedback` boundary for safe error extraction plus success/error
   receipts that reuse existing semantic tokens, Lucide icons, live-region semantics, and optional
   44 px dismissal.
2. Add one `AdminDeleteConfirmation` composition over `AdminFormModal`, with explicit resource
   identity, Cancel-first focus, destructive action, pending lock, inline failure, Escape/restoration,
   and no new permission or deletion semantics.
3. Replace Vehicles, Routes, and Stops native save/delete feedback with typed page state. Preserve
   exact endpoints/bodies; clear stale errors when a new action begins; keep failed forms/dialogs
   open; publish stable success receipts only after the request succeeds. Remove existing arbitrary
   caught-error object logging from all three scoped page files, including their load catches.
4. Extend the three existing CRUD form modals only enough to accept safe inline failure and pending
   state, prevent repeat submit/close while pending, and preserve every field, label, value, native
   validation, action name, focus entry, and DTO.
5. Extend the existing master-data Playwright fixture and tests measurement-first for all three
   resources: a deterministic source guard for native dialogs/arbitrary object logs; exact create
   POST and update PUT bodies; inline save failure/value retention; success receipt; pending lock;
   exact delete target/request; cancel/no-request; failure/retry; focus restoration; 44 px; no
   Mobile overflow; and unchanged route-stop payload. Prefix every new focused title with
   `T14 Admin master-data mutation` so the exact measurement command is reproducible.

## Acceptance Criteria

- Vehicles, Routes, and Stops contain no native `alert()`/`confirm()` mutation path. All three use
  the same shared semantic feedback and delete-confirmation implementation rather than three visual/
  focus copies.
- Each resource's edit/save failure stays in its open form with server-safe/fallback text and current
  values; repeat submission is blocked while pending; retry sends the exact incumbent update body;
  success closes and publishes the matching visible status receipt.
- Each resource's create journey sends the exact incumbent POST body and publishes the matching
  receipt only after success; create request and field coverage do not substitute for the required
  edit/failure/retry evidence.
- Each resource's delete action opens a named shared dialog identifying the target. Cancel/Escape
  sends no request and restores invoking focus. Confirm sends exactly one incumbent DELETE; failure
  remains actionable in-dialog; retry can succeed and yields a page receipt.
- Shared success/error content is opaque and legible inside Signal Lens; confirmation chrome uses
  the existing shared glass modal. Desktop and 390 x 844 Mobile have visible focus, no horizontal
  overflow, and no scoped action below 44 by 44 CSS px.
- Existing master-data data, field labels, create/update/delete endpoint/payload behavior, T10 route-
  stop `{ stopIds: ["ST02", "ST01"] }`, load/error/empty/ready projections, responsive tables/cards,
  Admin theme, Sidebar, Login, and Public behavior remain regression-covered.
- The focused suite deterministically rejects `alert()`/`confirm()` and scoped arbitrary caught-error
  logging in all three page sources; behavioral journeys also observe no native browser dialog.
- Measurement-first focused mutation journeys fail before source implementation on absent shared
  feedback/confirmation behavior and pass afterward. Existing master-data, accessibility, Admin
  Liquid Glass, Dashboard, operations-support, frontend check/build, detector, full repository CI,
  `git diff --check`, and workflow validation pass.
- No Public, Login, backend, API/schema, dependency, Mobile, migration, Research, T9/T11/T13/T15,
  deployment, or external-target path changes; the unrelated dirty Feedback-role migration remains
  excluded.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-master-data -- --grep "T14 Admin master-data mutation"`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-master-data`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-liquid-glass`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-operations-support`
- `npm --prefix shuttle-tracking-web run check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/admin/admin.css shuttle-tracking-web/app/admin/vehicles/page.tsx shuttle-tracking-web/app/admin/routes/page.tsx shuttle-tracking-web/app/admin/stops/page.tsx shuttle-tracking-web/components/admin/AdminFormModal.tsx shuttle-tracking-web/components/admin/AdminMutationFeedback.tsx shuttle-tracking-web/components/admin/VehicleModal.tsx shuttle-tracking-web/components/admin/RouteModal.tsx shuttle-tracking-web/components/admin/StopModal.tsx`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

Not applicable. This is authenticated Admin frontend source/test work only. No migration, seed,
cache operation, credential, destructive external request, deployment, network, Mobile repository,
or external target action is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist before writing.
- Stop if a server error contract, endpoint/body, role/permission, field/validation, delete semantic,
  soft-delete/undo policy, schema/cache behavior, Public/Login change, dependency, or owner decision
  is required.
- Stop rather than changing T10 route-stop ordering, closing a failed form/dialog, exposing arbitrary
  error objects, emitting an optimistic success before request completion, or absorbing T11,
  Research/T13, D-012, backend/Mobile, deployment, or external-runtime work.

## Completion Evidence

- Status: `Ready for measurement-first implementation`
- Acceptance mapping: pending.
- Changed files: exact handoff plus Roadmap and Audit Register coordination notes only; source
  implementation has not started.
- Validation results: task/dependency/decision/freshness gates pass at `f526939`; exact native
  mutation paths and incumbent request/dialog/test boundaries were inspected on 2026-08-11.
- Audit freshness changes: None for handoff creation; no application evidence changed.
