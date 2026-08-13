# Implementation Task Specification: M-20260812-02 — Admin Role Migration Safety

## Source Work

- Work ID: `M-20260812-02`
- Lane: `Maintenance`
- Roadmap task: `Not applicable`
- Status: `Ready — exact-path handoff must be committed before test/source work`
- User authorization: on 2026-08-12 the owner authorized the High-severity migration-ordering
  repair; on 2026-08-13 the owner confirmed that the migration source change exists only on this
  Git branch and the migration has never run on production.
- Approved source form: repair this branch's existing
  `20260801110000_feedback_triage_roles` migration in place. Unknown local/shared/staging target
  history remains a per-target execution gate.
- Approved decisions: D-010:A retains `DEV` and `SUPER_ADMIN`, converts only legacy `OPERATOR` to
  `ADMIN`, makes `ADMIN` the default, and rejects unexpected roles without silently mapping or
  elevating them.
- Dependencies and decision gates: coordination `387ea59`, D-010:A, and the 2026-08-13 owner facts
  are satisfied. This exact-path handoff must be committed before any test/source edit.
  `M-20260813-01`, S16, and S17 are downstream. No database-target authority exists.
- Execution mode: `Direct Main Agent implementation; no worker delegation` because transaction
  ordering and migration-test design require data/SQL judgment.
- Specialist briefs: None. The owner-supplied source-form fact resolves the prior focused
  uncertainty; no target fact is inferred.
- Source audits: `docs/decision-queue.md`, `docs/project-knowledge-base.md`,
  `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`, and
  `docs/audits/database-audit.md`, synchronized at `387ea59`.

## Outcome and Non-goals

- Outcome: make the branch-only role/Feedback migration atomic and executable for every supported
  predecessor role by dropping the predecessor constraint before conversion, converting only
  `OPERATOR`, setting the new default, and installing the exact final role constraint afterward.
- Outcome: an unexpected role remains unmapped and makes the final constraint abort and roll back
  the entire migration rather than being deleted, silently converted, or partially committed.
- Non-goals: no database target operation, forward migration, Prisma schema change, role/API/UI
  policy change, Feedback DDL redesign, data cleanup, seed, deployment, T14 slice, or Roadmap
  reordering.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | None | No capability or visible behavior changes; later ADMIN Feedback read-only work remains separate. |
| Architecture | Bounded | One existing PostgreSQL migration becomes one explicit transaction; no runtime owner or boundary changes. |
| Security / privacy | High positive | Preserves least-privilege D-010:A mapping and fail-closed rejection; no sensitive payload/log behavior changes. |
| Data / migration | High | Repairs constraint/conversion order and partial-commit risk without operating any target. |
| Operations / rollout | Gated | Source/test proof only. Every target still requires known migration history, explicit authority, and disposable upgrade/rollback evidence. |
| Research validity | None | No observation, metric, export, device, simulator, or ground-truth claim changes. |

## Allowed Writes

- `docs/tasks/M-20260812-02-admin-role-migration-safety.md`
- `shuttle-tracking-backend/prisma/migrations/20260801110000_feedback_triage_roles/migration.sql`
- `shuttle-tracking-backend/tests/test_t12_feedback_identity.js`
- `docs/audits/README.md`

## Read-only Context

- `docs/decision-queue.md`
- `docs/project-knowledge-base.md`
- `docs/audits/architecture-audit.md`
- `docs/audits/backend-audit.md`
- `docs/audits/database-audit.md`
- `docs/audits/security-devops-observability-audit.md`
- `docs/audits/production-readiness-audit.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/roadmap/T14-scope-and-closure-ledger.md`
- `shuttle-tracking-backend/prisma/migrations/20260729170000_add_t7_research_diagnostics/migration.sql`
- `shuttle-tracking-backend/prisma/schema.prisma`
- `shuttle-tracking-backend/package.json`
- `scripts/ci-checks.sh`

## Invariants

- Supported predecessor roles are exactly `OPERATOR`, `DEV`, and `SUPER_ADMIN`.
- Final supported roles are exactly `ADMIN`, `DEV`, and `SUPER_ADMIN`.
- Only `OPERATOR` maps to `ADMIN`; `DEV` and `SUPER_ADMIN` are retained unchanged.
- Unknown roles are not mapped, deleted, or elevated. The final validated constraint rejects them
  and the explicit transaction rolls the complete migration back.
- The predecessor constraint is dropped before conversion; the final constraint is installed only
  after conversion and default selection.
- Existing Feedback columns, foreign keys, indexes, audit table, and audit indexes remain unchanged
  and inside the same transaction.
- `M-20260813-01` owns later ADMIN Feedback read authorization; this unit changes no route or role
  capability.

## Required Changes

1. Extend the existing deterministic identity test before source repair so it proves transaction
   cardinality, exact role-statement order, exact predecessor/final allowlists, absence of
   `NOT VALID`, Feedback DDL placement, and pure supported/unknown role fixtures.
2. Run the focused test against the incumbent migration and record the expected failure caused by
   missing transaction and constraint-before-conversion order.
3. Wrap the existing migration in one explicit `BEGIN`/`COMMIT` transaction.
4. Preserve the drop first; move `OPERATOR` conversion and default selection before the exact final
   `ADMIN`/`DEV`/`SUPER_ADMIN` constraint.
5. Preserve all remaining Feedback DDL byte-for-behavior except transaction enclosure.
6. Run focused, backend, full repository, workflow, and diff verification without connecting to a
   database.

## Acceptance Criteria

- Exactly one `BEGIN` is first and exactly one `COMMIT` is last.
- Role order is `BEGIN → drop predecessor constraint → OPERATOR update → ADMIN default → final
  validated role constraint → Feedback DDL → COMMIT`.
- Exactly one role-constraint drop, role update, default change, and final role-constraint addition
  exist; `NOT VALID` is absent.
- The predecessor allowlist is exactly `OPERATOR`/`DEV`/`SUPER_ADMIN`; the final allowlist is exactly
  `ADMIN`/`DEV`/`SUPER_ADMIN`.
- Deterministic fixtures prove supported conversion/retention and prove an unknown role stays
  unmapped and fails the final allowlist.
- All existing Feedback DDL remains inside the same transaction and no schema/API/UI/dependency or
  forward-migration path changes.
- Focused tests, backend checks, full repository CI, workflow validation, and diff checks pass.

## Validation Commands

- `npm --prefix shuttle-tracking-backend run build`
- `node shuttle-tracking-backend/tests/test_t12_feedback_identity.js`
- `npm --prefix shuttle-tracking-backend run check`
- `bash scripts/ci-checks.sh`
- `node scripts/validate-agent-workflow.js`
- `git diff --check`
- Exact-path review with `git status --short` and `git diff --name-only`

## Rollout and Migration Limits

- Do not run Prisma migrate, reset, seed, `db push`, direct SQL, or any command that connects to a
  database.
- Do not operate production, staging, shared, local, disposable, or any other stateful target.
- The owner fact selects source form only; it does not establish target history or rollout proof.
- A later target execution requires exact target authority plus a disposable PostgreSQL exercise for
  supported upgrade, unknown-role rollback, final default/constraint, and preserved Feedback schema.

## Stop Conditions

- Stop if any evidence shows this exact migration was applied to the target whose history would be
  rewritten; select a target-specific forward repair only through a revised handoff.
- Stop if the repair needs a Prisma schema, package/script, API, route, UI, seed, or new migration
  path.
- Stop and revise/revalidate this handoff before writing any path outside `Allowed Writes`, including
  a new helper, test, task, audit, or configuration path.
- Stop rather than cleaning, mapping, deleting, or elevating an unexpected historical role.
- Stop if preserving Feedback DDL requires semantic changes outside transaction enclosure.

## Completion Evidence

- Status: `Pending source implementation`
- Handoff baseline: `Pending this document's commit`
- Measurement-first evidence: Pending.
- Source baseline: Pending.
- Validation results: Pending.
- Audit freshness after source: downgrade R1 Discovery, R3 Architecture, R4 Backend, R4 Database,
  R7 Security/DevOps/Observability, R8 Production Readiness, and Roadmap coordination to
  `Needs Re-audit`. Product, Frontend, Infrastructure & Device, and Dashboard & UX remain current
  unless implementation crosses a stop condition.
- Evidence limits: static/source/deterministic-test evidence only; no database target, affected-row,
  migration execution, rollback, deployed, or production evidence.
