# Implementation Task Specification: T14 — Accessible Dialogs and Navigation

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, D-011 accessibility/navigation slice
- User authorization: Run Approved Batch request; Public visual identity must remain substantially
  unchanged and Admin theme work must remain separately bounded.
- Approved decisions: `D-001=C`, `D-007`, `D-009`, `D-011`
- Specialist briefs: None required; the 2026-08-09 Level 1 re-audit fixes the next eligible slice
  and leaves no focused owner-policy uncertainty.
- Source audits: `docs/audits/frontend-audit.md`, `docs/audits/dashboard-ux-audit.md`, and
  `docs/audits/production-readiness-audit.md`, Validated in commit
  `44779cd49ddc96c7a0cbf76b53053498747ea758` against source baseline `bd34552...`.

## Outcome and Non-goals

- Outcome: the current Public Feedback/image dialogs and Admin CRUD/route-stop/sensitive-action
  dialogs expose names and modal semantics, receive and contain keyboard focus, close with Escape,
  and restore focus. Their visible form labels are programmatically associated. The Mobile Admin
  drawer is inert while off-screen, traps/restores focus while open, closes with Escape, and exposes
  the current route. Root zoom and primary-language metadata no longer block accessible use.
- Non-goals: no Public redesign or layout change; no Admin theme/hierarchy redesign; no copy-policy,
  backend, schema, API, auth, role, Feedback lifecycle, map/state, route behavior, deployment,
  performance, reduced-motion, contrast-system, touch-target, research, T9, T11, T13, or T15 work.

## Identity-preserving UI Direction

- Palette and type: retain every incumbent Public/Admin color, font, type scale, surface, and icon.
- Layout: retain dialog/card/drawer dimensions, order, spacing, and responsive breakpoints. Add only
  semantic attributes, focus-visible affordances, and invisible language/viewport corrections.
- Interaction signature: initial focus goes to the existing close button (or first safe control),
  Tab/Shift+Tab remain inside the open modal/drawer, Escape closes when the action is not submitting,
  and focus returns to the invoking control.
- Public limit: category selected state may gain `aria-pressed`; the image thumbnail may become a
  semantic button without changing its appearance. No new visual system or component style is added.
- Admin limit: the drawer gains truthful hidden/open/current-page semantics. Visual theme work is
  explicitly deferred.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | D-011 and Dashboard & UX P1 findings 1–4 bind language/zoom, dialog, form, focus, and drawer behavior. |
| Architecture | Bounded | One reusable client hook owns modal focus lifecycle; page-specific forms retain their current data/actions. |
| Security / privacy | None | Authorization and Feedback payload/lifecycle behavior do not change. |
| Data / migration | None | No backend, Prisma, Redis, cache, or persisted data change. |
| Operations / rollout | Bounded | Frontend-only rollback is the prior bundle; no deployment or runtime target is authorized. |
| Research validity | None | Research data and claims are untouched. |

## Allowed Writes

- `docs/tasks/T14-accessible-dialogs-and-navigation.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/layout.tsx`
- `shuttle-tracking-web/app/admin/layout.tsx`
- `shuttle-tracking-web/app/admin/login/page.tsx`
- `shuttle-tracking-web/app/admin/feedback/page.tsx`
- `shuttle-tracking-web/components/admin/Sidebar.tsx`
- `shuttle-tracking-web/components/admin/RouteModal.tsx`
- `shuttle-tracking-web/components/admin/RouteStopsModal.tsx`
- `shuttle-tracking-web/components/admin/StopModal.tsx`
- `shuttle-tracking-web/components/admin/VehicleModal.tsx`
- `shuttle-tracking-web/components/public/FeedbackModal.tsx`
- `shuttle-tracking-web/components/public/StopInfoCard.tsx`
- `shuttle-tracking-web/hooks/useModalFocus.ts`
- `shuttle-tracking-web/tests/t14-accessibility.spec.ts`
- `shuttle-tracking-web/tests/t8-local-server.mjs`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `docs/decision-queue.md`
- `docs/audits/frontend-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- `docs/tasks/T14-truthful-feedback-and-live-state.md`
- `shuttle-tracking-web/contexts/AuthContext.tsx`
- `shuttle-tracking-web/app/admin/routes/page.tsx`
- `shuttle-tracking-web/app/admin/stops/page.tsx`
- `shuttle-tracking-web/app/admin/vehicles/page.tsx`
- `shuttle-tracking-web/tests/t14-truthful-state.spec.ts`

## Invariants

- Public visual identity, Feedback truth/fail-closed behavior, canonical state, and T8/T14 first-
  slice acceptance remain unchanged.
- A focus trap contains only visible, enabled, non-negative-tab-index controls and restores the
  element focused immediately before opening when that element still exists.
- Escape never submits a form or triggers a destructive action. A submitting sensitive action or
  route-stop publish cannot be dismissed through the new Escape path.
- The Admin sidebar is hidden/inert only below the existing `lg` breakpoint; desktop navigation
  remains visible and keyboard-operable regardless of the Mobile open-state flag.
- Root metadata allows user zoom and identifies the primarily Thai Public document; Admin content
  explicitly identifies its English language boundary.
- No dependency is added and no stateful, external, migration, seed, deployment, provider, hardware,
  or Mobile action is run.

## Required Changes

1. Add one strict typed `useModalFocus` hook that captures prior focus, moves initial focus, traps
   Tab/Shift+Tab, closes through a current callback on Escape, and restores focus on cleanup.
2. Apply labelled `role=dialog`/`aria-modal`, the shared focus lifecycle, named close controls, and
   submit-aware Escape behavior to every allowed Public/Admin modal.
3. Associate every visible label in the allowed login, Feedback, CRUD, route-stop, internal-note,
   delete-reason, and password forms with a unique control ID; expose Feedback category state as a
   named group with `aria-pressed` controls.
4. Replace the clickable Public stop-image wrapper with a visually unchanged semantic button and
   make its image dialog keyboard-dismissible/restoring.
5. Remove root maximum-scale/user-scalable restrictions, set the Public document language to Thai,
   and identify the Admin English boundary without changing layout.
6. Make Mobile Admin navigation breakpoint-aware: inert/hidden while off-screen, modal/focus-trapped
   while open, Escape/backdrop/close capable, restored to the menu trigger, and `aria-current=page`
   on the active link. Retain desktop behavior and add visible keyboard focus styles.
7. Add isolated mobile/desktop Playwright journeys for root/Feedback semantics, Admin drawer focus,
   CRUD/route-stop dialogs, and the Feedback sensitive-action dialog. Preserve all existing T8/T14
   truth journeys.

## Acceptance Criteria

- Root viewport contains no zoom prohibition; `<html lang="th">` and the Admin English boundary are
  present.
- Every allowed modal has an accessible dialog name, `aria-modal=true`, predictable initial focus,
  forward/backward wrapping, Escape closure when safe, and invoker focus restoration.
- Public Feedback type controls expose the selected state; all allowed form controls have an
  associated accessible label; the stop-image trigger works with keyboard activation.
- On a Mobile viewport, the closed Admin drawer is absent from the accessibility/tab order; opening
  exposes a labelled modal drawer, focuses its close control, traps focus, marks the active page,
  closes on Escape, and restores the menu trigger. On desktop the navigation remains interactive.
- No visible Public layout/palette/type treatment changes, no Admin theme redesign occurs, and T14's
  truthful Feedback/live-state behavior remains intact.
- Focused accessibility journeys, existing T14/T8 journeys, lint, production build, full repository
  CI, scoped Impeccable detector, `git diff --check`, and workflow validation pass. Human assistive-
  technology/accessibility acceptance remains explicitly unclaimed.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14`
- `npm --prefix shuttle-tracking-web run test:e2e:t8`
- `npm --prefix shuttle-tracking-web run lint`
- `npm --prefix shuttle-tracking-web run build:check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/layout.tsx shuttle-tracking-web/app/admin/layout.tsx shuttle-tracking-web/app/admin/login/page.tsx shuttle-tracking-web/app/admin/feedback/page.tsx shuttle-tracking-web/components/admin/Sidebar.tsx shuttle-tracking-web/components/admin/RouteModal.tsx shuttle-tracking-web/components/admin/RouteStopsModal.tsx shuttle-tracking-web/components/admin/StopModal.tsx shuttle-tracking-web/components/admin/VehicleModal.tsx shuttle-tracking-web/components/public/FeedbackModal.tsx shuttle-tracking-web/components/public/StopInfoCard.tsx`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

- Not applicable. Source/test-only frontend accessibility change; no external runtime or deployment
  target is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist first.
- Stop if semantics require a product-copy, authorization, API/schema, destructive-action, or owner-
  controlled policy change.
- Stop rather than bundling Public redesign, Admin theme/hierarchy, performance/scale, broad touch/
  contrast work, a new dependency, or T9/T11/T13/T15.

## Completion Evidence

- Status: `In Progress`
- Acceptance mapping: Pending implementation and Main Agent verification.
- Changed files: Pending; the unrelated dirty Feedback-role migration remains excluded.
- Validation results: Pending.
- Audit freshness changes: Pending implementation acceptance.
