# Implementation Task Specification: T12 — feedback triage and safe source views

## Source Work

- Work ID: `T12`
- Lane: `Roadmap`
- Roadmap task: `T12`
- User authorization: Run Approved Batch request on 2026-08-01 to re-audit and execute eligible
  T9–T12 work without bypassing dependencies or owner decisions; D-010:A supplied on 2026-08-01.
- Approved decisions: `D-001=C`, `D-007`, `D-009`, and `D-010:A`.
- Specialist briefs: `docs/audits/specialized/T12-identity-feedback-triage-policy.md` and
  `docs/audits/specialized/T12-identity-role-reauth-retention.md`.
- Source audits: all Discovery-through-Production-Readiness profiles were validated at `6697acb`
  plus approved D-009/D-010; this handoff applies their bounded T12 findings only.

## Outcome and Non-goals

- Outcome: anonymous riders receive an explicit one-way privacy receipt; `SUPER_ADMIN`/`DEV` can
  securely triage, soft-delete, and restore feedback; `ADMIN` and higher can use a dedicated
  safe, read-only source-health view; and all administrative requests authorize against the current
  persisted D-007/D-010 role rather than a stale token claim.
- Non-goals: general account/role provisioning, password management other than current-password
  re-authentication, sender credential lifecycle/recovery, device/source writes, Android work,
  raw/historical location or research access, deployment, runtime migration execution, browser
  testing against an ambient target, and legal-compliance claims.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | D-009 requires a visible anonymous/no-reply/non-emergency/business-day notice and accountable Super Admin inbox. |
| Architecture | Bounded | One role module and a dedicated safe source DTO avoid duplicating policy or exposing management DTOs. |
| Security / privacy | Bounded | D-007/D-009/D-010 and the T12 identity brief require persisted-role enforcement, 15-minute re-auth, allowlisting, and content-free audit. |
| Data / migration | Bounded | Additive Feedback lifecycle/audit schema and reviewed OPERATOR→ADMIN/default migration; no target may be migrated. |
| Operations / rollout | Bounded | Idempotent retention sweep runs in the service process and logs only counts; no deployment/runtime target is operated. |
| Research validity | None | Research schema, observations, metrics, and exports remain untouched. |

## Allowed Writes

- `docs/tasks/T12-feedback-triage-safe-source-views.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `docs/audits/lead-audit-summary.md`
- `shuttle-tracking-backend/prisma/schema.prisma`
- `shuttle-tracking-backend/prisma/migrations/20260801110000_feedback_triage_roles/migration.sql`
- `shuttle-tracking-backend/src/controllers/auth.controller.ts`
- `shuttle-tracking-backend/src/controllers/devices.controller.ts`
- `shuttle-tracking-backend/src/controllers/feedback.controller.ts`
- `shuttle-tracking-backend/src/middleware/auth.ts`
- `shuttle-tracking-backend/src/middleware/boundary-errors.ts`
- `shuttle-tracking-backend/src/middleware/validation.ts`
- `shuttle-tracking-backend/src/routes/auth.route.ts`
- `shuttle-tracking-backend/src/routes/devices.route.ts`
- `shuttle-tracking-backend/src/routes/feedback.route.ts`
- `shuttle-tracking-backend/src/server.ts`
- `shuttle-tracking-backend/src/services/admin-role.service.ts`
- `shuttle-tracking-backend/src/services/feedback-retention.service.ts`
- `shuttle-tracking-backend/src/services/feedback.service.ts`
- `shuttle-tracking-backend/src/types/device.ts`
- `shuttle-tracking-backend/src/types/express.d.ts`
- `shuttle-tracking-backend/tests/test_t12_feedback_identity.js`
- `shuttle-tracking-backend/package.json`
- `shuttle-tracking-web/app/admin/devices/page.tsx`
- `shuttle-tracking-web/app/admin/feedback/page.tsx`
- `shuttle-tracking-web/components/admin/Sidebar.tsx`
- `shuttle-tracking-web/components/public/FeedbackModal.tsx`
- `shuttle-tracking-web/contexts/AuthContext.tsx`

## Read-only Context

- `docs/decision-queue.md`
- `docs/audits/specialized/T12-identity-feedback-triage-policy.md`
- `docs/audits/specialized/T12-identity-role-reauth-retention.md`
- `docs/audits/product-audit.md`
- `docs/audits/database-audit.md`
- `docs/audits/security-devops-observability-audit.md`
- `shuttle-tracking-backend/src/services/tracking.service.ts`
- `shuttle-tracking-backend/src/middleware/rate-limit.ts`

## Invariants

- Every administrative request uses a currently persisted, allowlisted role; missing/deleted/unknown
  roles fail closed. A sender JWT is never an administrative JWT.
- `DEV` inherits `SUPER_ADMIN`, which inherits `ADMIN`; no role may be created, promoted, or deleted.
- Login and successful re-authentication mint a signed freshness timestamp. Feedback delete/restore
  accepts only a current `SUPER_ADMIN`/`DEV` principal re-authenticated within 15 minutes.
- Public feedback is anonymous and one-way: no contact field, reply mechanism, raw IP response,
  or feedback-content logging is introduced.
- The Feedback state machine cannot move from a terminal status or skip the approved sequence.
- Retention clears raw IP after 30 days and irreversibly purges Feedback content after 180 days or
  an expired 30-day delete restore window; content-free audit evidence survives the purge.
- T12 source health is GET-only and exact-field allowlisted. It never returns credentials,
  hashes/tokens/QR data, raw payload/location, IP, research data, priority, or arbitrary errors.

## Required Changes

1. Add the reviewed legacy role/default migration, typed hierarchy helpers, persisted-principal
   authentication, fresh-token login/reauthentication, and role/recent-auth middleware.
2. Add the additive Feedback lifecycle/audit model, safe public receipt, Super Admin inbox/status
   transition/delete/restore APIs, deterministic retention service/sweep, and tests.
3. Add a dedicated read-only source health endpoint/DTO based only on the approved safe fields.
4. Add public notice text, role-aware admin navigation, a Super Admin feedback inbox with explicit
   re-authentication before delete/restore, and an all-admin safe source-health page.
5. Synchronize roadmap/task/audit-register evidence after inspection and focused verification.

## Acceptance Criteria

- Legacy `OPERATOR` is mapped to `ADMIN`, new ordinary users default to `ADMIN`, unknown roles are
  denied by the server, and `DEV`/`SUPER_ADMIN` inherit as D-007 requires.
- The public form displays the agreed anonymous/no-reply/privacy/business-day/non-emergency notice
  and receives a minimal receipt; staff triage cannot expose or log IP.
- Only `SUPER_ADMIN`/`DEV` can list/update/delete/restore feedback; delete/restore rejects stale
  re-authentication and records content-free audit evidence.
- Retention time boundaries, transition rules, role and re-auth gates, and audit/safe-DTO redaction
  have deterministic tests. No migration or external runtime is operated.
- `/api/admin/devices/health` and its UI show only safe facts and use no write action.
- Backend check, Prisma validation, frontend lint/build, repository CI, diff check, and agent
  workflow validation pass.

## Validation Commands

- `npm --prefix shuttle-tracking-backend run test:boundaries`
- `npm --prefix shuttle-tracking-backend run check`
- `npm --prefix shuttle-tracking-web run lint`
- `npm --prefix shuttle-tracking-web run build`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

Do not run `prisma migrate`, `db push`, seed, Compose, browser smoke, or any ambient database/Redis
operation. The migration is reviewed and schema-validated only. Runtime checks require an explicitly
approved disposable target, data scope, expected mutations, and cleanup/rollback plan.

## Stop Conditions

- Stop if another write path is required.
- Stop if D-007/D-009/D-010 need a new owner interpretation, or role/password/retention policy
  needs to broaden beyond this specification.
- Stop if a migration, runtime, browser, deployment, hardware, secret, provider, or production
  target is required for verification.
- Stop rather than adding device/source writes, raw data access, account management, or a direct
  rider-contact/reply workflow.

## Completion Evidence

- Status: Complete for exact source/test scope.
- Acceptance mapping:
  - Legacy/default mapping and fail-closed hierarchy → reviewed migration plus
    `test_t12_feedback_identity.js` prove `OPERATOR`→`ADMIN`, default change, role ordering, and
    unknown-role helper rejection; middleware re-fetches the persisted role on every admin request.
  - Anonymous/no-reply notice and accountable triage → public modal notice/receipt and the
    Super-Admin/Dev feedback page implement the approved form, state flow, note, selected delete
    reason, fresh-password confirmation, and restore deadline.
  - Recent re-authentication/immutable safe audit/retention → signed reauth claim, server middleware,
    additive audit table, fixed reason enum, deterministic 15-minute/30-day/180-day tests, and
    content-free audit projection are present.
  - Safe read-only device/source visibility → dedicated `GET /api/admin/devices/health`, allowlisted
    DTO, source-health page, and redaction test omit source ID, credentials, priority, raw data, IP,
    research, and arbitrary errors.
  - Required checks → backend check/Prisma validation, frontend lint/build, repository CI, diff
    whitespace, and workflow validation pass on 2026-08-01. Frontend lint retains only the two
    pre-existing warnings in `app/layout.tsx` and `utils/IconHelpers.ts`.
- Changed files: all exact Allowed Writes except no changes were required to the previously-created
  specialist briefs; implementation adds the listed migration, role/retention services, feedback
  route, frontend pages, and deterministic test.
- Validation results: `npm --prefix shuttle-tracking-backend run check`,
  `npm --prefix shuttle-tracking-web run lint`, `npm --prefix shuttle-tracking-web run build`,
  `bash scripts/ci-checks.sh`, `git diff --check`, and `node scripts/validate-agent-workflow.js`
  passed. CI's isolated Playwright server required the permitted localhost execution outside the
  filesystem sandbox. No migration, seed, Compose, browser test against an ambient database, or
  retention job was run.
- Audit freshness changes: all Level 1 profiles were re-audited and synchronized as `Complete` after
  the T12 evidence review. T9 remains D-008 blocked; T11 remains blocked by its exact lifecycle
  handoff and external Android acceptance artifact.
