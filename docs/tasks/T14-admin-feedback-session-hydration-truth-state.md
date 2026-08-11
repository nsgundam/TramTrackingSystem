# Implementation Task Specification: T14 — Admin Feedback Session-Hydration Truth State

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, bounded Admin role-specific loading/status correction
- User authorization: Run Approved Batch with no dependency or owner-decision bypass. Public UI is
  owned by another team and may not change; Admin behavior/code may improve within the incumbent
  bright-neutral Signal Lens world. Admin Login/session behavior must be checked.
- Approved decisions: D-009 preserves Feedback roles/privacy/lifecycle; D-010:A preserves the
  persisted role mapping; D-011 preserves Public UI and permits bounded Admin improvements. Its
  2026-08-11 refinement defers the OSM/Public-visual unit without blocking this Admin-only slice.
  D-012 is approved but intentionally unimplemented here.
- Source audits: Product, Architecture, Frontend, Dashboard & UX, Production Readiness, and Roadmap
  are Complete/Validated against immutable source baseline
  `70f42c15948bf09e71a3c91d594a4c21f52db23b`; coordination commit
  `5eb266fc8841c9a3f598619cb81b14a82a7f514b` records the OSM deferral and permits selection of a
  separate non-Public-visual T14 unit. Unaffected evidence is current at
  `1eec866b986b4cb4e802f7a48fac93e54e780699`.
- Product/design workflow: identity-preserving Admin behavior correction under `frontend-design`.
  Reuse the existing `AdminResourceState` loading/status vocabulary; do not add a visual system,
  change persistent page hierarchy, or touch CSS. The current Impeccable evidence identifies the
  broader live-region/role-specific P2; a scoped detector returns `[]`, so controlled browser timing
  is the required defect measurement.

## Gate and Execution Status

- Dependency gate: Passed. T8, T12, and T14's first eleven accepted slices are complete for their
  exact scopes. T9/T13 remain owner-deferred and T11/T15 remain blocked; none is a dependency of this
  unit and none is bypassed.
- Decision gate: Passed. D-009, D-010:A, and D-011 already bind the exact role and UI boundaries. No
  new role, authorization, Login, provider, or presentation decision is required.
- Task gate: Passed when this exact-path handoff is committed. No application source may change
  before the controlled session-hydration browser journey fails against the incumbent false denial.
- Evidence-freshness gate: Passed. No web source changed after `70f42c1`; `5eb266f` changes only
  coordination and the immutable focused OSM brief.
- Specialist gate: Direct Level 3 is sufficient. The defect and incumbent session/role authority are
  repository-evidenced; stop for Level 2 only if implementation exposes a new auth-policy question.
- Execution mode: Direct Level 3, measurement-first, inside the approved batch. Stop at any new
  owner decision, dependency, auth/API/schema authority, Public UI, external target, or write path.

## Outcome and Non-goals

- Outcome: while the existing `GET auth/me` session hydration is unresolved, the Admin Feedback
  route presents a neutral polite verification state, never a final role-denial alert, and issues no
  privileged Feedback reads. After hydration, `SUPER_ADMIN`/`DEV` retain the exact inbox and
  `ADMIN` retains the exact restriction state.
- Non-goals: no authentication/authorization policy, cookie, token, redirect, Login form/session
  writer, role hierarchy, Sidebar, Feedback endpoint/payload/status graph/privacy/retention/fresh-
  auth behavior, persistent page presentation, CSS/theme, Public UI, OSM/provider, backend,
  API/schema/migration, dependency, Mobile, Research, T9/T11/T13/T15, deployment, or external-runtime
  change. This slice does not close the broad live-region P2 or prove successful credential Login.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | Removes one transient false denial and truthfully separates session verification from final role restriction. |
| Architecture | Bounded | The page consumes the existing `useAuth().isLoading`; `AuthContext`, API interception, and server roles remain authoritative. |
| Security / privacy | Preserved | No privilege is granted client-side and no protected Feedback read may occur before a resolved privileged role. |
| Data / migration | None | No schema, payload, persistence, retention, cache, or migration change. |
| Operations / rollout | Bounded | Local source/browser correction only; no deployment, target, session store, or external operation. |
| Research validity | None | No research observation, metric, export, device, map, or canonical state changes. |

## Allowed Writes

- `docs/tasks/T14-admin-feedback-session-hydration-truth-state.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/admin/feedback/page.tsx`
- `shuttle-tracking-web/tests/t14-admin-operations-support.spec.ts`

## Read-only Context

- `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`
- `docs/decision-queue.md`, current audits/Roadmap, prior T12/T14 tasks, and the OSM deferral brief
- `shuttle-tracking-web/contexts/AuthContext.tsx`
- `shuttle-tracking-web/services/api.ts`
- `shuttle-tracking-web/proxy.ts`
- `shuttle-tracking-web/components/admin/AdminResourcePage.tsx`
- `shuttle-tracking-web/components/admin/Sidebar.tsx`
- `shuttle-tracking-web/app/admin/login/page.tsx`
- existing Admin Dashboard, accessibility, Login/material, and full-CI configuration/tests
- all Public UI, CSS, backend, schema, migration, Mobile, Research, OSM/provider, dependency-lock,
  deployment, and external-target paths

## Invariants

- `GET auth/me` and the server-returned persisted role remain the session/role authority. Cookie
  presence, route rendering, and client hiding are not authorization evidence.
- The page consumes the incumbent `isLoading` signal. While `isLoading || !user`, it renders one
  existing polite `AdminResourceState` loading state with bounded non-sensitive verification copy;
  it renders neither the restriction alert nor the inbox.
- Neither `GET admin/feedback` nor `GET admin/feedback/deleted` is issued before a resolved
  `SUPER_ADMIN` or `DEV` user exists. A resolved `ADMIN` issues neither read and receives the exact
  incumbent restriction message.
- A resolved `SUPER_ADMIN` or `DEV` retains the current initial load/error/empty/ready behavior,
  privacy copy, safe fields, status/note PATCH bodies, re-authenticated delete reason, payload-free
  restore, focus behavior, action sizing, and request counts.
- Protected 401/403 handling remains owned by `services/api.ts`: cookie deletion and Login redirect
  stay exact. The page must not add a timeout, fallback role, redirect, session write, or auth retry.
- No CSS, persistent Feedback hierarchy, visual theme, Public DOM/copy/layout, Login source, API,
  backend, schema, dependency, OSM, Mobile, Research, migration, deployment, or external target
  changes. The unrelated dirty Feedback-role migration remains preserved and excluded.

## Required Changes

1. Add one controlled browser journey to `t14-admin-operations-support.spec.ts`. Hold
   `/api/auth/me` behind a deterministic promise, wait until the request has begun, and before
   releasing it assert a polite verification status, zero restriction alerts, no inbox/ledger, and
   zero active/deleted Feedback GETs. Use `try/finally` so a red assertion always releases the route.
2. Run that journey before production source. It must fail against the incumbent immediate role
   denial while the auth request remains pending; record the exact failure as measurement-first
   evidence.
3. In the Feedback page only, consume `isLoading` and project `isLoading || !user` through the
   existing `AdminResourcePanel`/`AdminResourceState` loading vocabulary. Preserve the final role
   predicate and all privileged inbox behavior.
4. Release the controlled auth response with the existing `SUPER_ADMIN` shape; assert the transient
   status leaves, the restriction alert never appears, the inbox/ledger becomes ready, and active
   plus deleted Feedback GETs occur exactly once each. Strengthen the existing resolved `ADMIN`
   journey to assert its exact denial and zero Feedback GETs.

## Acceptance Criteria

- The measurement-first hydration journey fails before source because a pending valid session is
  projected as final denial; the same focused journey passes after the bounded page correction.
- Pending session verification exposes one polite `role=status` message and never exposes the
  assertive restriction alert, inbox content, privacy case data, or a privileged Feedback request.
- Releasing `SUPER_ADMIN` proves the normal inbox starts only after role resolution and makes exactly
  one active plus one deleted GET. The existing `ADMIN` journey proves final denial with zero reads.
- Full Admin operations support passes with the prior Source Health and Feedback loading/error/empty,
  mutation, fresh-auth, focus, 44 px, and Mobile-overflow contracts unchanged.
- Admin Liquid Glass/Login regression passes only as evidence for rejected Login request/pending/
  inline error, protected rejection redirect, and material preservation; no successful credential-
  Login/session acceptance is claimed. Accessibility and Admin Dashboard regressions pass.
- Scoped detector `[]`, lint, strict build, frontend check, full repository CI, workflow validator,
  and `git diff --check` pass. Only the exact allowlist changes; Public UI and the unrelated migration
  remain untouched.
- This unit resolves the concrete false-denial defect and narrows the existing role-specific/loading-
  status P2 evidence. The score and open counts remain 15/20 and 0 P0 / 1 P1 / 5 P2 / 1 P3 until an
  ordered Level 1 re-audit determines broader finding disposition.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-operations-support -- --grep "session hydration"`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-operations-support`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-liquid-glass`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run lint`
- `npm --prefix shuttle-tracking-web run build:check`
- `npm --prefix shuttle-tracking-web run check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/admin/feedback/page.tsx`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

Not applicable. This is a local Admin browser projection correction. No migration, session-store
operation, credential action, deployment, external request, or runtime target is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist before writing.
- Stop if implementation requires changing `AuthContext`, API/proxy behavior, Login, role policy,
  Feedback requests/payloads/status graph, CSS/theme, Public UI, backend/schema, dependency, OSM,
  Mobile, Research, migration, deployment, or an external target.
- Stop rather than using a timeout/role guess, weakening final ADMIN denial, treating the page as
  authorization authority, broadening into Feedback action announcements, or claiming successful
  credential Login, broad P2 closure, human/AT, deployed, security, or release acceptance.

## Completion Evidence

- Status: `Pending`
- Execution note: exact handoff awaits commit, then its controlled measurement-first failure.
- Source baseline: pending.
- Measurement-first evidence: pending.
- Final validation: pending.
- Audit freshness changes: none at handoff creation. After source changes, Level 3 must mark Product,
  Architecture, Frontend, Dashboard & UX, Production Readiness, and Roadmap `Needs Re-audit`; Level 3
  never marks those reports complete.
- Evidence limits: local source/synthetic browser evidence only; no successful credential Login,
  human usability, assistive technology, deployed session/runtime, security penetration, Mobile,
  device, provider, field, or production-release acceptance is authorized or claimed.
