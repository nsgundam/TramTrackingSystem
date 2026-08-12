# Implementation Task Specification: M-20260812-01 — Canonical Admin Entry Redirect

## Source Work

- Work ID: `M-20260812-01`
- Lane: `Maintenance`
- Roadmap task: `Not applicable`
- User authorization: explicit 2026-08-12 request to make successful Admin login and `/admin`
  navigation land on `/admin/dashboard`
- Approved decisions: None; this preserves the incumbent authenticated Admin destination
- Specialist briefs: None
- Source audits: `docs/project-knowledge-base.md` Validated at `1eec866...`;
  `docs/audits/frontend-audit.md` and `docs/audits/dashboard-ux-audit.md` Validated at evidence
  `9ff7e85...` / application `c72feb9...` before this maintenance delta

## Outcome and Non-goals

- Outcome: a successful Admin login lands on `/admin/dashboard`; an authenticated visit to the
  canonical `/admin` entry redirects to `/admin/dashboard`; an unauthenticated `/admin` visit still
  lands on `/admin/login`.
- Non-goals: no Login redesign, authentication/authorization change, token/cookie policy change,
  backend/API/schema/migration change, new Admin capability, T14 slice, or Roadmap reordering.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | Removes a 404 from the existing Admin entry journey and keeps Dashboard as the incumbent destination. |
| Architecture | Bounded | Add one App Router entry page; preserve `proxy.ts` as the session gate and AuthContext as successful-login session owner. |
| Security / privacy | Bounded | No auth bypass: unauthenticated `/admin` remains proxy-protected and `/admin/dashboard` remains protected. |
| Data / migration | None | No persistence, schema, cache, or data mutation. |
| Operations / rollout | Bounded | Frontend route-only deployment; rollback removes the entry page and test/config additions. |
| Research validity | None | No observation, metric, export, device, simulator, or research claim changes. |

## Allowed Writes

- `docs/tasks/M-20260812-01-admin-entry-redirect.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/admin/page.tsx`
- `shuttle-tracking-web/tests/admin-entry-route.spec.ts`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `docs/project-knowledge-base.md`
- `docs/decision-queue.md`
- `docs/audits/frontend-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- `docs/tasks/T14-admin-dashboard-foundation.md`
- `docs/tasks/T14-admin-liquid-glass-foundation.md`
- `shuttle-tracking-web/proxy.ts`
- `shuttle-tracking-web/contexts/AuthContext.tsx`
- `shuttle-tracking-web/app/admin/layout.tsx`
- `shuttle-tracking-web/app/admin/login/page.tsx`
- `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- `shuttle-tracking-web/tests/t8-local-server.mjs`

## Invariants

- Missing Admin session redirects protected Admin paths to `/admin/login`.
- Successful login stores the incumbent session and routes to `/admin/dashboard`.
- Existing role, API, Login error, Dashboard, Sidebar, Public UI, and T14 behavior remain unchanged.
- Redirects are same-origin and add no user-controlled target.

## Required Changes

1. Add browser coverage for unauthenticated `/admin`, authenticated `/admin`, and successful Login.
2. Prove the authenticated `/admin` case fails against the incumbent missing route.
3. Add the minimal App Router entry page that redirects `/admin` to `/admin/dashboard`.
4. Register the focused browser command in frontend configuration and the full frontend check.
5. Run focused, regression, build/lint, full repository, workflow, and diff verification.

## Acceptance Criteria

- Authenticated navigation to `/admin` returns no 404 and ends at `/admin/dashboard`.
- Successful Login ends at `/admin/dashboard`.
- Unauthenticated navigation to `/admin` ends at `/admin/login`.
- `/admin/dashboard` remains protected and existing Admin Dashboard/Login regression suites pass.
- No backend, schema, migration, dependency, Public UI, or unrelated source path changes.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:e2e:admin-entry`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-liquid-glass`
- `npm --prefix shuttle-tracking-web run lint`
- `npm --prefix shuttle-tracking-web run build:check`
- `bash scripts/ci-checks.sh`
- `node scripts/validate-agent-workflow.js`
- `git diff --check`

## Rollout and Migration Limits

- No stateful target, migration, seed, deployment, credential, provider, or external system action.

## Stop Conditions

- Stop if backend/auth/session policy or another source write path is required.
- Stop if the redirect would bypass the proxy or broaden access to an Admin route.
- Stop rather than adding a dependency, configurable redirect target, or unrelated UX change.

## Completion Evidence

- Status: `In Progress`
- Acceptance mapping: Pending implementation and verification.
- Changed files: Pending.
- Validation results: Pending.
- Audit freshness changes: Pending; Frontend and Dashboard & UX are expected to require re-audit
  because the Admin entry behavior and browser evidence change.
