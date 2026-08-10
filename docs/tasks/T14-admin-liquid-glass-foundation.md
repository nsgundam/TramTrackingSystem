# Implementation Task Specification: T14 — Admin Liquid Glass Foundation

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, D-011 owner-selected Admin visual-world foundation
- User authorization: Run Approved Batch plus the 2026-08-10 owner direction to redesign Admin as
  premium iOS-inspired Liquid Glass / glassmorphism. Public UI remains substantially unchanged;
  T9/T13 are deferred, T11 remains dependency-gated, and no dependency or owner decision may be
  bypassed.
- Approved decision: D-011 refinement at `a0a0ce1`. D-012 is not implemented by this slice.
- Specialist briefs: None required. Product, Architecture, Frontend, Dashboard & UX, Production
  Readiness, and Roadmap are revalidated at `f1d0103`; the owner has fixed the visual direction and
  the remaining question is bounded web implementation/measurement.
- Product/design workflow: `PRODUCT.md` is current. Impeccable new-work assigned seed `7c756d3a`;
  the explicit owner-pinned Liquid Glass direction overrides unrelated catalog challengers. Final
  built ground truth must be recorded in root `DESIGN.md` and `.impeccable/design.json`.
- Primary material references:
  <https://developer.apple.com/design/human-interface-guidelines/materials> and
  <https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass>.

## Outcome and Non-goals

- Outcome: establish one durable **Signal Lens Workbench** visual foundation for every current Admin
  route. Admin shell, desktop/Mobile navigation, Login presentation, shared modals, and important
  controls use restrained adaptive glass; maps, tables, ledgers, forms, and long operational content
  use more opaque standard materials. Existing semantic hierarchy, content, state, role, focus,
  responsive, and request behavior remain intact.
- Non-goals: no Public source/style/layout change; no page data or workflow redesign; no new
  capability, metric, field, copy claim, role, route, endpoint, request body, auth behavior, schema,
  persistence, migration, cache, dependency, backend, Mobile, T9/T11/T13/T15, Research, deployment,
  or external-target work. Master-data mutation feedback follows this foundation and is not bundled.

## Direction Contract

- **THESIS:** operational truth seen through a calm signal lens; reject both flat generic enterprise
  chrome and glass applied indiscriminately to every content card.
- **OWN-WORLD:** campus-sky/cobalt ambient field; adaptive regular glass for navigation, contextual
  controls, and modal chrome; white/graphite standard material for dense content; concentric rounded
  geometry; system UI type; sparse cyan/violet ambient refraction that never replaces status color.
- **STORY:** the operator first recognizes the secure RSU workspace, then sees current context and
  actions in the glass layer, then reads verified operational content on stable opaque surfaces.
- **FIRST VIEWPORT:** desktop floats a compact glass navigation rail beside a spacious operational
  canvas; Mobile uses one glass top capsule and drawer; Login uses the same material grammar and one
  clear primary action.
- **FORM:** Signal Lens Workbench, the third grounded direction; seed `7c756d3a`.
- **FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the
  verdict, and DESIGN.md.

The contract must survive the production build as the first child of the Admin surface root. Because
Next/React does not preserve JSX comments and Public root layout is out of scope, the Admin layout
must emit the contract inside a non-rendered `<template data-admin-design-contract>` in both Login
and authenticated branches. Browser evidence and built-output search must find `7c756d3a`.

## Visual and Interaction System

- **Color strategy — restrained:** retain RSU cobalt as the functional accent. Light context uses a
  cool campus-sky canvas, deep navy ink, high-opacity content material, and regular white glass.
  Dark context uses midnight navy, near-white ink, graphite content material, and regular dark
  glass. Cyan/violet appear only in the ambient field/refraction, not as status meaning.
- **Material hierarchy:** glass is limited to Sidebar/Mobile header, Login panel, shared modal,
  primary/secondary contextual controls, and compact status/context chrome. Resource panels,
  tables, cards, ledgers, form bodies, alerts, and map canvas remain visually stable and more opaque.
- **Shape:** large shell/navigation/modal radii nest concentrically; operational cards and fields use
  a smaller related radius. Borders use luminous inner/outer separation, not a generic white stroke
  on every object.
- **Type/icon:** use the Apple-platform-aware system stack (`-apple-system`, `BlinkMacSystemFont`,
  `Segoe UI`, sans-serif) and the existing Lucide icons. Add no font, icon, image, or dependency.
- **Motion:** only existing navigation/modal/control state transitions, 160–220 ms, with no hover
  scale, parallax, spring simulation, or looping decoration. Reduced motion removes material motion
  while preserving state changes.
- **Fallbacks:** `prefers-reduced-transparency`, `prefers-contrast: more`, `forced-colors`,
  `prefers-reduced-motion`, and `@supports not (backdrop-filter: blur(...))` each produce a legible
  operable result. Transparency and ambient color are never the only hierarchy/status signal.

## Baseline Measurements

- Current authenticated Admin uses `data-admin-theme="rsu-operations"`, `color-scheme: light`, an
  opaque dark Sidebar/Mobile header, and opaque light page/modal/control surfaces. No shared dark,
  reduced-transparency, forced-contrast, or unsupported-filter material variant exists.
- Login already uses Tailwind `backdrop-blur`, gradients, white transparency, and hover scale, but it
  is an independent visual system rather than the semantic Admin tokens/components. It must converge
  without changing `POST auth/login`, form labels/autocomplete, error projection, or session login.
- Current Admin semantic/focus/responsive implementation is strong: baseline detector returns `[]`,
  Dashboard/master-data/operations-support/a11y suites pass at their recorded baselines, and all
  audited actions are 44 px. These are preservation requirements.
- Measurement-first browser coverage must fail before implementation on absent Signal Lens theme,
  shared material hierarchy, adaptive/fallback contract, and converged Login presentation.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded redesign | D-011 fixes Admin-only visual authority and keeps Public/behavior unchanged. |
| Architecture | Bounded | One shared CSS/token/layout authority; page/API/domain owners remain unchanged. |
| Security / privacy | None | Login request and role/privacy boundaries remain exact; no credential/content logging. |
| Data / migration | None | No schema, persistence, migration, seed, retention, or cache action. |
| Performance | Bounded risk | Blur is limited to functional layers and requires source/browser budgets plus fallbacks. |
| Operations / rollout | Bounded | Frontend source/test rollback only; no deployment or runtime target. |
| Research validity | None | No observation, metric, export, simulator, or Research surface change. |

## Allowed Writes

- `docs/tasks/T14-admin-liquid-glass-foundation.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/admin/admin.css`
- `shuttle-tracking-web/app/admin/layout.tsx`
- `shuttle-tracking-web/app/admin/login/page.tsx`
- `shuttle-tracking-web/components/admin/Sidebar.tsx`
- `shuttle-tracking-web/tests/t14-admin-liquid-glass.spec.ts`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`
- `DESIGN.md`
- `.impeccable/design.json`

## Read-only Context

- `PRODUCT.md`, `docs/decision-queue.md`, current audits, and prior `docs/tasks/T14-*.md`
- all Admin Dashboard/Vehicles/Routes/Stops/Source Health/Feedback page logic
- all Admin resource/form/route-stop/feedback-confirmation/LiveMap component logic and modal focus hook
- all Public/Login API service, auth context, API/auth/schema/backend/Mobile/deployment paths
- existing T8/T10/T12/T14 tests and local Playwright fixture

## Invariants

- Public source, CSS, DOM, copy, assets, and visual identity do not change.
- Admin route content, field labels, status/privacy/read-only guidance, roles, endpoints, payloads,
  cache/canonical behavior, load/error/empty/ready projections, and action availability do not change.
- Login still posts exactly `{ username, password }` to `auth/login`, preserves autocomplete and
  safe error behavior, and delegates session handling to the incumbent Auth context.
- Sidebar role filtering, active page semantics, Mobile inert/aria-hidden/dialog behavior,
  initial/wrapped focus, Escape/restoration, and Logout behavior remain.
- Existing modal naming/focus/close-disabled behavior and 44 px controls remain; CSS material changes
  must not add a focus target, hide an alert, or reorder an action.
- Glass is not applied to map tiles, table/ledger/form content layers, long text, alerts, or status
  meaning. Every translucent surface has legible adaptive and opaque fallbacks.
- No Apple asset/trademark, external image/font, package, `any`, lint disable, or unsafe assertion is
  introduced.

## Required Changes

1. Change the Admin surface marker to `data-admin-theme="signal-lens"` and emit the six-part
   direction contract/seed through a non-rendered template in authenticated and Login roots.
2. Refactor Admin CSS tokens into adaptive light/dark semantic values plus explicit glass/content/
   ambient/elevation roles. Add restrained ambient signal-field depth without an asset or content
   claim.
3. Restyle desktop Sidebar, Mobile header/drawer/backdrop, primary/secondary/context controls, and
   shared modal as regular glass functional layers. Keep navigation labels, role behavior, action
   order, and focus unchanged.
4. Keep Dashboard/resource/operations content materials more opaque while translating borders,
   shadows, radii, fields, alerts, badges, and focus rings into the same world. Preserve all
   responsive table/card and status semantics.
5. Replace Login's independent Tailwind material composition with semantic Admin Login classes,
   the same theme/material hierarchy, and no hover scale. Preserve fields, request, error, loading,
   and session behavior.
6. Add reduced-transparency, increased/forced-contrast, reduced-motion, and no-backdrop-filter
   fallbacks. Keep both light and dark context at WCAG AA for text and meaningful controls.
7. Add deterministic browser/source evidence at 1280 x 900 and 390 x 844 for material hierarchy,
   Login request/error, Sidebar/focus/44 px/no-overflow, light/dark tokens, accessibility fallbacks,
   direction-contract survival, and unchanged representative page content.
8. After implementation/visual QA, run the Impeccable finish reviewer. Resolve material findings
   within its bounded rounds, then use the documenter to write `DESIGN.md` and
   `.impeccable/design.json` from built ground truth, not aspiration.

## Acceptance Criteria

- Desktop and Mobile Admin surfaces visibly share Signal Lens Workbench: premium adaptive glass
  navigation/control/modal layers float over a coherent ambient field while operational content
  remains stable, legible, and recognizably RSU transport-specific.
- `backdrop-filter` is present only on scoped functional layers; content panels/tables/ledgers/forms/
  map canvas compute to `none`. Blur/shadow/radius usage is bounded and introduces no horizontal
  overflow or measured action below 44 by 44 CSS px.
- Light and dark contexts retain at least 4.5:1 normal-text contrast on the tested standard-material
  surfaces. Reduced transparency and unsupported-filter rules replace glass with opaque materials;
  forced/increased contrast and reduced motion retain visible boundaries, focus, and state.
- Login uses the shared theme, no independent Tailwind gradient/glass/hover-scale world, and posts
  the exact incumbent body. Invalid login remains an inline alert; pending state prevents repeat
  submission.
- Sidebar navigation/roles/current page, Mobile drawer inert/focus/Escape/restoration, Admin route
  headings, resource data/state, Feedback/Source Health policy, and modal behavior remain covered by
  prior suites.
- `template[data-admin-design-contract]` is non-rendered and contains every direction block plus
  seed `7c756d3a` in both Admin branches; the production build contains the seed.
- No Public, backend, API/auth/schema, dependency, Mobile, migration, Research, T9/T11/T13/T15,
  deployment, or external-target path changes.
- Measurement-first focused evidence fails before source implementation and passes afterward. Every
  prior frontend suite, lint, production build, full repository CI, final one-shot detector,
  `git diff --check`, and workflow validation pass. Visual QA is one desktop/Mobile batch plus at
  most one confirmation batch; final review verdict and any open items are recorded honestly.
- Root `DESIGN.md` and `.impeccable/design.json` accurately document only implemented tokens,
  materials, motion, breakpoints, and 5–10 canonical components. No provisional token is promoted.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-liquid-glass`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-master-data`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-operations-support`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:contrast`
- `npm --prefix shuttle-tracking-web run check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/admin/admin.css shuttle-tracking-web/app/admin/layout.tsx shuttle-tracking-web/app/admin/login/page.tsx shuttle-tracking-web/components/admin/Sidebar.tsx`
- production-build search for `7c756d3a`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

Not applicable. This is source/test-only authenticated Admin presentation. No migration, cache
operation, credential, deployment, network, Mobile repository, or external target action is
authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist first.
- Stop if implementation requires changed content/workflow, endpoint/payload, API/schema/auth/role,
  persistence/cache, dependency, Public source/identity, or owner policy.
- Stop rather than applying glass to dense content/status meaning, weakening contrast/focus/
  transparency fallbacks, changing Login/session behavior, or absorbing mutation feedback,
  T11/Research/T13/T15, backend/Mobile, deployment, or external runtime.
- Stop for owner direction only if the implemented restrained functional-layer interpretation is
  rejected in favor of glass on dense content, because that would materially change the accepted
  accessibility/performance contract.

## Completion Evidence

- Status: `Ready for measurement-first implementation`
- Baseline: exact handoff created from revalidated commit `f1d0103`; source implementation has not
  started and the unrelated dirty Feedback-role migration remains excluded.
- Acceptance mapping, visual verdict, design-system paths, and final validation results: pending.
- Audit freshness after implementation: Product, Architecture, Frontend, Dashboard & UX,
  Production Readiness, and Roadmap must be downgraded to `Needs Re-audit`; unaffected profiles and
  external/owner gates remain unchanged.
