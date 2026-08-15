# Implementation Task Specification: T14 — Admin Master-data Theme Convergence

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, D-011 Admin master-data visual-system slice
- User authorization: Run Approved Batch request. Public UI should remain substantially unchanged;
  Admin surfaces may be improved fully. T9 and T13 are deferred, T11 remains dependency-gated, and
  no dependency or owner decision may be bypassed.
- Approved decisions: `D-001=C`, `D-011`
- Specialist briefs: None required. The current Dashboard & UX re-audit selects the narrowed Admin
  theme P2, and the established `RSU Operations` foundation removes any open visual-direction or
  owner-controlled question.
- Source audits: `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`,
  `docs/audits/frontend-audit.md`, `docs/audits/dashboard-ux-audit.md`, and
  `docs/audits/production-readiness-audit.md`, revalidated at
  `cfda9283aaf42f62cf00dc0bb0b124e432db2a50` against implementation baseline
  `db723107e024fb293f75dc2268ba7a3c4f6f3bbe`.

## Outcome and Non-goals

- Outcome: extend the authenticated `RSU Operations` semantic system from the shell/Dashboard to
  the Vehicles, Routes, and Stops master-data pages and their four existing CRUD/order dialogs.
  Repeated page, state, action, status, and dialog presentation becomes shared, typed frontend
  code. Loading, fetch failure, retry, empty, card/table, and CRUD affordances remain clearly
  distinguishable at desktop and Mobile sizes, with named 44 px actions and solid Admin surfaces.
- Non-goals: no Public or Login source/style change; no Devices/Feedback/Research page restyle; no
  new master-data capability; no endpoint, request payload, cache, auth/role, schema, persistence,
  validation, confirmation, route-stop ordering, or modal-focus behavior change; no T9/T11/T13/T15,
  dark-mode switch, dependency, backend, Mobile, deployment, or external-target work.

## Identity-preserving Admin Direction

- Continue the current `RSU Operations` control-room language: dark-slate navigation, RSU blue
  action/focus accent, light neutral canvas, solid white surfaces, restrained borders/elevation,
  compact uppercase context labels, and tabular/monospace identifiers.
- Give each master-data page one consistent hierarchy: resource context and primary create action,
  then an explicit loading/error/empty or populated collection surface. Desktop tables remain dense
  and scannable; Mobile cards retain the same data and actions without becoming decorative tiles.
- Use one shared dialog shell and field/action language for the existing forms. Preserve all labels,
  values, focus trapping, Escape/restoration, validation, and submit/cancel semantics.
- Avoid gradients, decorative glass/backdrop blur, hover lift/scale, excessive rounding, or a second
  Admin palette. Destructive actions remain visually distinct but secondary to the resource name.
- Trade-off: this substantially reduces visual/code drift for the three core master-data workflows,
  but the broader Admin theme P2 remains open for Devices, Feedback, and other legacy surfaces.

## Baseline Measurements

- Vehicles, Routes, and Stops repeat roughly 750 lines of hard-coded slate/blue card/table/header/
  state/action presentation. Their modals repeat another roughly 820 lines and mix three backdrop,
  radius, blur, focus, input, and action treatments.
- The pages use hard-coded utility colors instead of the current Admin semantic tokens; two tables
  reference the non-existent `bg-slate-55` utility. Cards use decorative backdrop blur and hover
  lift, contrary to the accepted Admin direction.
- Desktop icon actions are approximately 32–36 px and several edit/delete controls have no
  programmatic name. Existing Mobile actions are also not consistently 44 px.
- A failed master-data list request triggers a browser alert and then falls through to an empty-
  looking page. Loading, failure, and verified empty are not represented by one consistent inline
  state/retry contract.
- Measurement-first browser coverage must fail on semantic resource/dialog contracts, solid
  presentation, named 44 px actions, and inline failure/retry before implementation is accepted.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | D-011 and the current re-audit authorize a separately bounded Admin visual/code/UX slice. |
| Architecture | Bounded | Shared typed presentation primitives only; existing page hooks, API service, CRUD ownership, and modal focus hook remain authoritative. |
| Security / privacy | None | Current Auth context, server authorization, DTOs, identifiers, confirmation prompts, and logs are unchanged. |
| Data / migration | None | No schema, payload, persistence, seed, cache, migration, or route-stop ordering rule changes. |
| Operations / rollout | Bounded | Frontend source/test rollback only; no deployment or external target is authorized. |
| Research validity | None | No observation, metric, export, simulator interpretation, or Research surface changes. |

## Allowed Writes

- `docs/tasks/T14-admin-master-data-theme-convergence.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/admin/admin.css`
- `shuttle-tracking-web/app/admin/vehicles/page.tsx`
- `shuttle-tracking-web/app/admin/routes/page.tsx`
- `shuttle-tracking-web/app/admin/stops/page.tsx`
- `shuttle-tracking-web/components/admin/AdminResourcePage.tsx`
- `shuttle-tracking-web/components/admin/AdminFormModal.tsx`
- `shuttle-tracking-web/components/admin/VehicleModal.tsx`
- `shuttle-tracking-web/components/admin/RouteModal.tsx`
- `shuttle-tracking-web/components/admin/StopModal.tsx`
- `shuttle-tracking-web/components/admin/RouteStopsModal.tsx`
- `shuttle-tracking-web/tests/t14-admin-master-data.spec.ts`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `docs/decision-queue.md`
- current domain/release audits and prior `docs/tasks/T14-*.md` handoffs
- `shuttle-tracking-web/app/admin/layout.tsx`
- `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- `shuttle-tracking-web/app/admin/devices/page.tsx`
- `shuttle-tracking-web/app/admin/feedback/page.tsx`
- `shuttle-tracking-web/app/admin/login/page.tsx`
- `shuttle-tracking-web/components/admin/Sidebar.tsx`
- `shuttle-tracking-web/hooks/useModalFocus.ts`
- `shuttle-tracking-web/services/api.ts`
- frontend DTO types and existing T8/T14 test fixtures/suites

## Invariants

- Vehicles still loads Vehicles and Routes together, submits the same create/update payload, uses
  the same delete endpoint/confirmation, and renders route assignment/status from the same data.
- Routes still loads, creates, updates, deletes, normalizes display color, and opens the current
  route-stop ordering workflow with unchanged requests and ordering semantics.
- Stops still loads, creates, updates, deletes, displays the same bilingual names/coordinates, and
  submits parsed latitude/longitude through the same endpoint.
- Existing form fields, initial values, required/disabled state, native validation, focus trap,
  initial close focus, Escape/restoration, submit/cancel behavior, and route-order interactions remain.
- Loading, request failure, and verified empty remain distinct. A retry repeats only the existing
  read request and cannot fabricate data or broaden authorization.
- The authenticated shell theme remains the only Admin visual authority. Dashboard, Sidebar,
  Devices, Feedback, Login, and every Public file remain unchanged in this slice.
- No external, migration, seed, deployment, credential, hardware, Mobile, or Research action runs.

## Required Changes

1. Add small typed Admin resource primitives for the page header, primary action, collection panel,
   loading/error/retry/empty state, named icon action, and status badge. Reuse semantic Admin CSS
   classes rather than page-specific hard-coded palettes.
2. Convert Vehicles, Routes, and Stops to those primitives while preserving their data fetch and
   CRUD behavior. Replace initial-load browser alerts with a visible inline error and 44 px Retry;
   retain save/delete error and confirmation behavior outside this read-state correction.
3. Add one typed Admin form-dialog shell that owns the current focus hook, close control, semantic
   overlay/surface/header, width option, and disabled-close behavior. Convert the three CRUD dialogs
   and route-stop ordering dialog without changing fields, values, request payloads, or ordering.
4. Extend `admin.css` with solid semantic resource/table/card/dialog/form/state/action classes,
   responsive table/card behavior, 44 px interactive targets, reduced-motion compatibility, and
   focus styling. Do not add gradients, glass blur, hover translation/scale, or a second palette.
5. Add deterministic desktop/Mobile browser evidence for all three pages, semantic token use,
   table/card responsiveness, named 44 px actions, inline failure/retry/empty distinction, dialog
   styling/focus/fields, route-stop workflow continuity, and no horizontal overflow.

## Acceptance Criteria

- At 1280 x 900, Vehicles, Routes, and Stops share the same semantic header/panel/table hierarchy;
  populated rows retain all existing fields and expose named create/edit/delete/manage-stops
  actions. Each icon or primary action measures at least 44 by 44 CSS px.
- At 390 x 844, each page uses cards rather than the desktop table, has no horizontal overflow,
  preserves every visible data field/action, and keeps action targets at least 44 by 44 CSS px.
- A failed initial Vehicles request renders an inline alert and Retry rather than an empty state or
  browser alert. Retry recovers to the verified list using the existing endpoint; a successful
  empty response renders only the explicit empty state.
- CRUD dialogs share a solid semantic Admin surface, named close control, current fields/values,
  at least 44 px controls, wrapped Mobile footer, and existing focus/Escape/restoration behavior.
  Route-stop ordering retains active-stop selection, ordered list, 44 px controls, errors, and publish.
- Computed resource/dialog presentation uses the existing Admin canvas/surface/ink/muted/border/
  primary/danger/focus tokens, has no gradient, backdrop blur, or hover transform, and meets the
  already-audited semantic contrast contract.
- Public, Login, Dashboard, Devices, Feedback, API/auth/schema/backend/Mobile source, dependencies,
  and external targets are unchanged.
- Focused browser tests, every prior T8/T14 suite, lint, production build, full repository CI,
  scoped Impeccable detector, `git diff --check`, and workflow validation pass. Evidence remains
  local/synthetic, not human/assistive-technology, physical-device, deployed-runtime, or release proof.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-master-data`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:contrast`
- `npm --prefix shuttle-tracking-web run check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/admin/admin.css shuttle-tracking-web/app/admin/vehicles/page.tsx shuttle-tracking-web/app/admin/routes/page.tsx shuttle-tracking-web/app/admin/stops/page.tsx shuttle-tracking-web/components/admin/AdminResourcePage.tsx shuttle-tracking-web/components/admin/AdminFormModal.tsx shuttle-tracking-web/components/admin/VehicleModal.tsx shuttle-tracking-web/components/admin/RouteModal.tsx shuttle-tracking-web/components/admin/StopModal.tsx shuttle-tracking-web/components/admin/RouteStopsModal.tsx`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

- Not applicable. Source/test-only authenticated frontend presentation and read-state recovery; no
  migration, deployment, cache, credential, network, Mobile repository, or external target action
  is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist first.
- Stop if implementation requires a changed endpoint/payload, schema, auth/role rule, persisted
  value, destructive-action policy, route-stop ordering behavior, dependency, or owner decision.
- Stop rather than changing Public/Login, Dashboard data/state behavior, Devices/Feedback/Research,
  T9/T11/T13/T15, external runtime, human/deployed acceptance, or dark/theme-switch policy.

## Completion Evidence

- Status: `Complete — Admin master-data theme-convergence slice`
- Acceptance mapping:
  - Shared resource hierarchy → Vehicles, Routes, and Stops use one typed header/panel/state/action/
    status primitive set and semantic Admin classes. Desktop tables and Mobile cards preserve the
    existing IDs, names, status, route/color, coordinates, and actions without hard-coded page
    palettes, invalid `bg-slate-55`, backdrop blur, or hover transforms.
  - Truthful read state → initial loading, failed read, verified empty, and populated data are
    distinct. Vehicles failure renders an inline alert and a named 44 px Retry using the same GET
    boundary; retry recovers without a browser alert, fabricated row, or API/auth change.
  - Shared dialog contract → the three CRUD forms and route-stop ordering use one solid semantic
    dialog/focus shell. Existing field labels/values/native validation, Escape/restoration,
    submit/cancel, active-stop filtering, ordering, error, and publish payload behavior remain.
  - Responsive/action continuity → 1280 px tables and 390 px cards/dialogs have no horizontal
    overflow; every measured primary/icon/dialog/order control is at least 44 by 44 CSS px and every
    row action has a resource-specific accessible name.
  - Scope boundary → Public, Login, Dashboard, Devices, Feedback, backend/API/auth/schema, Mobile,
    dependencies, and external targets are unchanged. Devices/Feedback remain a later Admin theme
    slice, so the broader theme P2 is narrowed rather than claimed closed.
- Changed files: implementation commit `7321a25996cce10367c790e7b992e8e4f52637cf`
  contains only the 13 exact Admin stylesheet/resource pages/shared primitives/dialogs/package/
  config/browser-test paths in this handoff. The unrelated dirty Feedback-role migration was
  preserved and excluded.
- Validation results:
  - Measurement-first focused browser coverage failed 4/4 on absent semantic resource/dialog
    contracts, inline failure/retry, Mobile action/dialog coverage, and shared route-stop dialog.
    The corrected suite passes 4/4 across desktop and Mobile, including the unchanged reordered
    `{ stopIds: ["ST02", "ST01"] }` publish payload.
  - Accessibility regression passes 4/4, contrast passes 2/2, Admin Dashboard passes 2/2, and the
    final focused master-data suite passes 4/4. Trace screenshots for desktop tables, Mobile CRUD,
    inline error/retry, and route-stop dialog were visually inspected against the `RSU Operations`
    direction.
  - `npm --prefix shuttle-tracking-web run check` passes every unit/browser suite, lint with zero
    errors and the same two pre-existing warnings, and the 11-route production build. The first
    sandboxed standalone build failed only because Turbopack could not bind its internal port; the
    authorized build passed.
  - Final `bash scripts/ci-checks.sh` passes Backend build/boundaries, Prisma validation, every
    Frontend check including master-data 4/4, Compose, production topology, unsafe-log scan, and
    workflow validation. The final scoped Impeccable detector returns `[]`; `git diff --check` and
    exact staging review pass.
  - Evidence is local/synthetic, not human/assistive-technology, physical-device, deployed-runtime,
    or release proof. No external target, migration, retention, hardware, or Mobile action ran.
- Audit freshness changes: Product, Architecture, Frontend, Dashboard & UX, Production Readiness,
  and Roadmap are downgraded to `Needs Re-audit` against implementation `7321a25`. Backend,
  Database, Infrastructure & Device, Security/DevOps/Observability, Discovery, T9/T11/T13/T15
  gates, and owner decisions are unchanged.
