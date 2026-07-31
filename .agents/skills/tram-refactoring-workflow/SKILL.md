---
name: tram-refactoring-workflow
description: Intake, implement, supervise, repair, verify, and synchronize one approved Tram Tracking System Roadmap or Maintenance work unit. Use for Level 3 planning or implementation, bounded non-roadmap fixes, Antigravity delegation, acceptance verification, task completion, and audit-staleness updates.
---

# Tram Refactoring Workflow

Read `agents/level-3-refactor/AGENT.md` and the engineering completion baseline in `AGENTS.md`
before planning or writing.

## Select the lane

### Roadmap

Read the selected current `### T<number> —` block in
`docs/roadmap/master-refactoring-roadmap.md`, `docs/project-knowledge-base.md`,
`docs/audits/README.md`, `docs/decision-queue.md`, cited audits, and affected source. Stop when a
cited audit is stale, a dependency or owner decision is incomplete, the task ID is not current, or
exact write paths cannot be resolved.

### Maintenance

Use Maintenance only for an explicit user-requested corrective, compatibility, tooling, test, or
small feature outcome that is not a current roadmap task. The Main Agent assigns the next unused
sortable ID `M-YYYYMMDD-NN` and records the user authorization and non-goals.

Read `docs/project-knowledge-base.md`, `docs/audits/README.md`, `docs/decision-queue.md`, affected
source, and impact-relevant audits. Triage product, architecture, security/privacy, data/migration,
operations, and research impact. Unrelated stale audits do not block bounded maintenance. Stop or
route upward when affected evidence is insufficient, an owner-controlled choice is unresolved, the
change requires strategic multi-task planning, or exact write paths cannot be resolved. Do not add
or reorder roadmap work from this lane.

## Task contract

For both lanes require work ID, lane, objective, authorization/source task, source audits,
dependencies and decision gates, non-goals, impact triage, execution mode, specialist routing,
candidate related files, acceptance criteria, status, and evidence. Roadmap Related Files are
planning candidates, not a write allowlist.

Create `docs/tasks/<work-id>-<topic>.md` from `docs/tasks/task-spec-template.md`. Under
`Allowed Writes`, list exact repository-relative files only—no directories, globs, `..`, or
shorthand such as `src/`. Revise the spec before expanding scope.

## Specialist gate

Use `tram-specialist-consultation` only for focused unresolved domain questions. Record immutable
task-keyed briefs and treat each decision as binding within its question.

## Implementation and isolated delegation

Implement directly when the task requires judgment. Delegate only a mechanical bounded portion;
the Main Agent and Level 3 retain scope and acceptance ownership. Run:

```bash
./scripts/agy-worker.sh docs/tasks/<work-id>-<topic>.md
```

The script must use a detached temporary worktree, sandbox `agy`, reject unauthorized paths, block
collisions with user changes, and import only a checked patch. Never run the worker in the user's
worktree and never auto-revert a scope breach. Inspect every imported diff before verification.

## Verification

Safe default:

```bash
bash scripts/ci-checks.sh
git diff --check
node scripts/validate-agent-workflow.js
```

Run relevant focused backend, frontend, socket, operations, Prisma validation, or Compose checks.
Do not run migrations, seeds, runtime smoke tests, deployment, recovery, or provider/hardware tests
against ambient configuration. Require an explicitly approved disposable target, credentials/data
scope confirmation, expected mutation, and cleanup/rollback plan.

Map every acceptance criterion to evidence. Report unavailable checks; never convert a skip into a
pass.

## Repair loop

When a check or acceptance criterion fails:

1. Inspect the failure and resulting diff.
2. Repair an implementation defect only within the approved objective and exact paths.
3. If another path is needed, revise and revalidate the task spec before writing it.
4. Route one focused uncertainty to Level 2; route stale or broad evidence to Level 1.
5. Repeat focused verification, then the repository gates.

Stop for missing user authority, unsafe external state, unresolved owner decisions, or unavailable
facts that materially affect correctness. Do not stop merely because the first implementation or
test attempt failed.

## Completion and staleness

1. Set the task spec `Complete` or `Partially Complete — <remaining>` and record
   acceptance-to-evidence mappings, commands, files, and date.
2. For Roadmap work only, update that task and downstream dependency notes.
3. For Maintenance work, leave roadmap ordering and status unchanged; surface discovered strategic
   debt to Level 1.
4. Compare changed evidence with cited audits and the knowledge base.
5. Downgrade affected Audit Register rows to `Needs Re-audit` with work ID and rationale.
6. Never rewrite an audit, mark it complete, or self-approve the supervised outcome from Level 3.
