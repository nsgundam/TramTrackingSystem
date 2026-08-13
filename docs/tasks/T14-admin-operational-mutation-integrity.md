# Implementation Task Specification: T14-S15 — Admin Operational Mutation Integrity

## Source Work

- Work ID: `T14`
- Slice ID: `T14-S15`
- Lane: `Roadmap`
- Roadmap task: `T14`, Plan v1 WP-A
- User authorization: Run Approved Batch on 2026-08-12. Execute S15 before S16 and S17; OSM/S12
  is Removed and future licence/attribution handling belongs to the Frontend team outside this
  batch.
- Approved decisions: T14 Research Plan v1 at coordination baseline
  `efec75750053da7742876681696a8aaf185195df`; D-009/T12 retain Feedback role, privacy, status,
  delete, restore, and re-authentication semantics; D-011 retains the incumbent bright-neutral
  Signal Lens Admin identity.
- Source audits: R1–R8 and Roadmap are Validated at coordinated evidence baseline `531ec9e`; Plan v1
  is owner-approved at `efec757`. The independent RF-18 migration-safety lane blocks database
  rollout, not this local frontend slice.
- Product/design workflow: identity-preserving behavior refactor under `frontend-design`. Reuse the
  current opaque operational feedback, shared modal, button, form, and status vocabulary. Add no
  token, font, icon family, animation, stylesheet, or visual redesign.

## Gate and Execution Status

- Dependency gate: Passed. The accepted S08/S10/S13 contracts provide the Feedback and shared Admin
  mutation primitives; T10 owns the route-stop request/order contract.
- Decision gate: Passed. Plan v1 registers and approves S15. No product, role, data, privacy,
  timestamp, Public, provider, or external-target decision is required.
- Task gate: Passed only when this exact-path handoff is committed. Source work must begin with the
  deterministic held-request measurements below.
- Evidence-freshness gate: Passed at `efec757`; no application source changed after accepted T14
  baseline `c72feb9` except separately accepted Maintenance `M-20260812-01`.
- Specialist gate: No Level 2 brief is required. Stop if implementation exposes a new endpoint,
  permission, status, data, or cross-domain policy question.
- Execution mode: Direct Level 3, measurement-first, one Active T14 slice.

## Outcome and Non-goals

- Outcome: Feedback note/status updates and route-stop order publish each enforce one synchronous
  in-flight request, expose a programmatically named busy state, retain the exact draft/order and a
  safe actionable error after failure, support exact-payload retry, and publish a polite named
  completion receipt after success.
- Non-goals: no endpoint, body, Feedback status graph, T10 route-order rule, role, authorization,
  sensitive delete/restore, re-authentication, field, data refresh authority, API/backend/schema,
  migration, dependency, CSS/theme, Public/Login, timestamp, OSM/provider, Mobile, Research,
  deployment, or external-target change; no global toast framework or optimistic success.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | Makes incumbent mutation progress, failure, retry, and completion truthful without adding capability. |
| Architecture | Bounded | Ref-backed synchronous guards remain local to the two existing mutation owners and reuse shared feedback presentation. |
| Security / privacy | Preserved | Server authorization and safe operational copy remain authoritative; no Feedback content is copied into receipts or logs. |
| Data / migration | None | Exact PATCH/PUT bodies and refresh boundaries remain unchanged; no target or persistent data operation is run. |
| Operations / rollout | Bounded | Frontend source/test rollback only; RF-18 and release gates remain independent. |
| Research validity | None | No research observation, metric, map, simulator, device, or provenance surface changes. |

## Allowed Writes

- `docs/tasks/T14-admin-operational-mutation-integrity.md`
- `docs/roadmap/T14-scope-and-closure-ledger.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/admin/feedback/page.tsx`
- `shuttle-tracking-web/app/admin/routes/page.tsx`
- `shuttle-tracking-web/components/admin/RouteStopsModal.tsx`
- `shuttle-tracking-web/tests/t14-admin-operations-support.spec.ts`
- `shuttle-tracking-web/tests/t14-admin-master-data.spec.ts`

## Read-only Context

- `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`
- current audits, Decision Queue, Plan v1, canonical ledger, and accepted S08/S10/S13 task evidence
- `shuttle-tracking-web/components/admin/AdminMutationFeedback.tsx`
- `shuttle-tracking-web/components/admin/AdminFormModal.tsx`
- `shuttle-tracking-web/components/admin/AdminResourcePage.tsx`
- `shuttle-tracking-web/services/api.ts` and current route/stop/Feedback types
- existing Admin Dashboard, Liquid Glass/Login, accessibility, operations, and full-CI tests/config
- all CSS, Public, Login, backend, schema, migration, dependency, Mobile, Research, deployment, and
  external-target paths

## Invariants

- Feedback updates remain `PATCH admin/feedback/:id` with a body containing only the selected
  `status` and/or trimmed non-empty `internalNote`. An empty update remains a no-op. The draft clears
  only after PATCH success; the incumbent list reload remains the post-success source of truth.
- Route order remains `PUT admin/route-stops/:routeId` with exactly `{ stopIds }` in visible order.
  The modal closes only after success; failure retains the local order and permits retry.
- A ref-backed guard is acquired before either async request begins and released in `finally`, so
  rapid/repeated activation cannot issue a second request before React renders disabled state.
- Only the Feedback case being updated is locked. Its note/status actions expose a named busy state
  without freezing other cases. Route publish locks selection, add, reorder, remove, cancel, close,
  and publish for that modal while the request is pending.
- Failure uses the existing safe `AdminMutationFeedback`/alert vocabulary and never renders/logs an
  arbitrary error object. Success uses a persistent polite status receipt naming only the case ID
  or route identity and survives the incumbent reload/error branch.
- Sensitive delete/restore confirmation, password, reason, request bodies, focus lifecycle, roles,
  loading/error/empty/ready projections, 44 px controls, and 390 px no-overflow behavior remain.
- No `any`, unsafe assertion shortcut, lint disable, `@ts-ignore`, native alert/confirm, dependency,
  stylesheet, backend/API/schema, migration, Public/Login, OSM/provider, or external action.

## Required Changes

1. Add held-PATCH browser coverage for one Feedback case before production edits: assert a named
   busy region/action, locked note/status controls for that case, one exact request after repeated
   activation, retained note plus actionable failure, exact-body retry, polite completion receipt,
   cleared draft, and refreshed next-state graph.
2. Implement a per-case synchronous in-flight guard and typed pending-action state in the Feedback
   page. Build and validate the body before acquiring the guard. Keep the receipt above the
   loading/data branch so it survives the post-success reload.
3. Add held-PUT browser coverage for route order before production edits: assert named busy state,
   all modal mutation/close controls locked, one exact request after repeated activation, retained
   order and safe retry after failure, then modal close plus a page-level route receipt after
   success at 390 px with preserved focus behavior.
4. Implement a synchronous publish guard in `RouteStopsModal`, reuse the incumbent safe mutation
   feedback, and make `onSaved` carry the completed route identity to the routes page before its
   incumbent refresh. Do not change the request body or modal composition.
5. Run focused suites first, then the full Admin regressions and repository gates. If a stylesheet,
   shared primitive, server contract, or additional write path becomes necessary, stop and revise
   this handoff before writing it.

## Acceptance Criteria

- Held Feedback PATCH and route-order PUT each observe exactly one request despite repeated
  activation; busy state is programmatically named and every relevant scoped control is locked.
- Feedback failure retains the note and current case state; retry sends the exact same body. Success
  clears only that draft, reloads through the incumbent boundary, and leaves a polite receipt.
- Route failure retains the ordered stop list and open modal; retry sends the exact same `{ stopIds
  }`. Success closes the modal, refreshes routes, and leaves a polite receipt naming the route.
- Exact existing status graph, Feedback safe fields/privacy, sensitive delete/restore and fresh-auth
  behavior, route-stop semantics, focus/Escape, Admin roles, 44 px controls, and 390 px layout pass.
- No CSS, shared primitive, Public/Login, timestamp, backend/API/schema, migration, dependency,
  OSM/provider, Mobile, Research, deployment, or external-target path changes.
- Measurement-first failures and post-source passes are recorded. Focused suites, Admin Dashboard,
  Liquid Glass/Login, accessibility, frontend check/build, scoped detector, full repository CI,
  workflow validation, and `git diff --check` pass.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-operations-support -- --grep "mutation integrity"`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-master-data -- --grep "route-stop mutation integrity"`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-operations-support`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-master-data`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-liquid-glass`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/admin/feedback/page.tsx shuttle-tracking-web/app/admin/routes/page.tsx shuttle-tracking-web/components/admin/RouteStopsModal.tsx`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

Not applicable. This is authenticated Admin frontend source/test work only. No database target,
migration, seed, credential, destructive external request, deployment, network, provider, or
external environment action is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate the allowlist before writing.
- Stop for a new endpoint/body, role/permission, Feedback status/privacy, route-order, server-error,
  field, shared visual, CSS, timestamp, Public/Login, OSM/provider, backend/schema, dependency,
  migration, Mobile, Research, deployment, or external-target requirement.
- Stop rather than issuing optimistic success, clearing a failed draft/order, locking unrelated
  cases, weakening sensitive action behavior, or treating local browser evidence as human/AT,
  deployed, migration, security, or release acceptance.

## Completion Evidence

- Status: `Source complete at 5955b7a; affected Level 1 re-audit required before acceptance`
- Handoff baseline: `99e67e8a3d8b36009aeebfb5c71584596c93e799`, refined without source
  expansion at `8eafa44ed088f7b70991755affbf610e50e6e3e3`.
- Source baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`.
- Changed source/test paths: the five application/test paths in the allowlist; no documentation,
  backend, API/schema, migration, CSS, dependency, Public/Login, provider, or external-target path
  is part of the source commit.
- Measurement-first evidence:
  - Feedback focused measurement failed 1/1 before source because two same-turn activations produced
    two PATCH requests instead of one.
  - Route-stop focused measurement failed 1/1 before source and exposed two held PUTs, absent named
    busy semantics, unlocked select/Add controls, no completion receipt, and lost invoker focus.
- Acceptance mapping:
  - per-case ref guards issue one exact trimmed Feedback PATCH, lock note/status/delete only for the
    active case, retain the draft/status graph on safe failure, retry the same body, clear only after
    success, and retain a polite case-ID receipt across reload;
  - the route modal ref guard issues one exact `{ stopIds }` PUT, locks every mutation/close path,
    blocks same-turn close/Escape, preserves order and safe actionable failure, and retries the same
    payload;
  - successful route publish closes the modal, refreshes without detaching the invoker, restores
    focus, and publishes a polite route-name/ID receipt; and
  - existing sensitive Feedback delete/restore, T12 roles, status transitions, privacy text,
    master-data CRUD, 44 px controls, and 390 px no-overflow behavior remain covered.
- Final validation on 2026-08-13: focused Feedback and route-order measurements pass 1/1 each;
  Admin operations support passes 7/7; Admin master data 8/8; accessibility 4/4; Admin Liquid
  Glass/Login 5/5; Admin Dashboard 2/2; scoped Impeccable detector returns `[]`; lint has zero
  errors and the same two pre-existing warnings; production build succeeds. Full
  `bash scripts/ci-checks.sh`, workflow validation, and `git diff --check` pass. Independent
  read-only finish review returned `PASS` after the guarded-close, same-case Delete-lock, and safe
  fallback repairs.
- Evidence limits: local source/synthetic-browser evidence only; no human, assistive-technology,
  deployed runtime, database target, migration, provider, device, field, or production acceptance.
- Audit freshness after source: Product, Frontend, Dashboard & UX, Production Readiness, and Roadmap
  become `Needs Re-audit`; Level 3 may not mark them complete. Architecture remains current unless
  the implementation crosses this task's page-local request/DTO/refresh boundary, which is a stop
  condition rather than approved scope.
