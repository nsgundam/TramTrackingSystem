# Implementation Task Specification: M-20260812-01 — Canonical Admin Entry Redirect

## Source Work

- Work ID: `M-20260812-01`
- Lane: `Maintenance`
- Roadmap task: `Not applicable`
- User authorization: explicit 2026-08-12 request to make successful Admin login and `/admin`
  navigation land on `/admin/dashboard`
- Approved decisions: None; this preserves the incumbent authenticated Admin destination
- Specialist briefs: None
- Source audits: `docs/project-knowledge-base.md`, `docs/audits/frontend-audit.md`, and
  `docs/audits/dashboard-ux-audit.md` validated during T14 Research at immutable evidence
  `0d985d8...` / accepted T14 application `c72feb9...`; each explicitly excludes this Maintenance
  overlay from its immutable source baseline

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
- `shuttle-tracking-web/next.config.ts`
- `shuttle-tracking-web/tsconfig.json`
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
2. Isolate Playwright's Next build cache from an existing developer server without changing normal
   development or production build output.
3. Prove the authenticated `/admin` case fails against the incumbent missing route.
4. Add the minimal App Router entry page that redirects `/admin` to `/admin/dashboard`.
5. Register the focused browser command in frontend configuration and the full frontend check.
6. Run focused, regression, build/lint, full repository, workflow, and diff verification.

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

- Status: `Complete — source accepted at cdd69f8af768a0c67020de4ed53405a967c39294`
- Acceptance mapping:
  - Authenticated `/admin` → `/admin/dashboard`: the measurement-first suite failed exactly this
    case before source (1 failed, 2 passed); the final focused suite passes 3/3 and asserts the
    `Live operations` Dashboard heading.
  - Successful Login → `/admin/dashboard`: the final focused suite submits the incumbent Login
    fields against a deterministic successful response and passes.
  - Unauthenticated `/admin` → `/admin/login`: the final focused suite passes and asserts the
    existing `Admin Portal` heading.
  - Protected Dashboard and existing Login behavior: Admin Dashboard passes 2/2, Signal Lens/Login
    passes 5/5, and the complete repository CI passes.
  - Scope integrity: inspected diff contains no backend, schema, migration, dependency, Public UI,
    auth policy, or unrelated source change.
- Changed files:
  - `docs/tasks/M-20260812-01-admin-entry-redirect.md`
  - `docs/audits/README.md`
  - `shuttle-tracking-web/app/admin/page.tsx`
  - `shuttle-tracking-web/tests/admin-entry-route.spec.ts`
  - `shuttle-tracking-web/next.config.ts`
  - `shuttle-tracking-web/tsconfig.json`
  - `shuttle-tracking-web/playwright.config.ts`
  - `shuttle-tracking-web/package.json`
- Validation results on 2026-08-12:
  - Measurement-first `npm run test:e2e:admin-entry`: expected failure 1/3, only authenticated
    direct `/admin` failed while the two preserved journeys passed.
  - Final `npm run test:e2e:admin-entry`: 3/3 passed.
  - `npm run test:e2e:t14:admin-dashboard`: 2/2 passed.
  - `npm run test:e2e:t14:admin-liquid-glass`: 5/5 passed.
  - `npm run lint`: passed with zero errors and the two pre-existing warnings in `app/layout.tsx`
    and `utils/IconHelpers.ts`.
  - `npm run build:check`: passed; the 12-route output includes `/admin` and `/admin/dashboard`.
  - `bash scripts/ci-checks.sh`: all backend, Prisma, frontend, browser, build, Compose, topology,
    logging, and agent-workflow checks passed.
  - `node scripts/validate-agent-workflow.js`: passed with three agents, three skills, and 15
    roadmap tasks.
  - `git diff --check`: passed before final evidence synchronization and must pass again afterward.
- Audit synchronization: T14 Research R4/R6/R8 inspected and recorded this working overlay while
  excluding it from immutable T14 baseline `0d985d8`. Bounded Level 1 acceptance inspected source
  commit `cdd69f8`, focused results 3/3 + 2/2 + 5/5, and the exact delta. Frontend and Dashboard &
  UX are current at `cdd69f8`; no broad T14 finding or new slice was created. Other domain findings
  and Roadmap ordering are unchanged.
