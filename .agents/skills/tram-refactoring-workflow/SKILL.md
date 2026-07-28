---
name: tram-refactoring-workflow
description: Intake, implement, isolate, verify, and synchronize one approved Tram Tracking System roadmap task. Use for Level 3 planning or implementation, Antigravity delegation, acceptance verification, roadmap completion, and audit-staleness updates.
---

# Tram Refactoring Workflow

## Intake

Read the selected current `### T<number> —` block in
`docs/roadmap/master-refactoring-roadmap.md`, plus `docs/project-knowledge-base.md`,
`docs/audits/README.md`, `docs/decision-queue.md`, cited audits, and affected source.

Stop when an audit is stale, a dependency or owner decision is incomplete, the task ID is not in
the current roadmap, or exact write paths cannot be resolved.

## Task contract

Require objective, source audits, phase, dependencies, blocks, decision gates, priority/difficulty,
execution mode, specialist routing, candidate related files, acceptance criteria, status, and
evidence. Roadmap Related Files are planning candidates, not a write allowlist.

Create `docs/tasks/<task-id>-<topic>.md` from `docs/tasks/task-spec-template.md`. Under
`Allowed Writes`, list exact repository-relative files only—no directories, globs, `..`, or
shorthand such as `src/`. Revise the spec before expanding scope.

## Specialist gate

Use `tram-specialist-consultation` only for focused unresolved domain questions. Record immutable
task-keyed briefs and treat each decision as binding within its question.

## Implementation and isolated delegation

Implement directly when the task requires judgment. For a mechanical bounded task, run:

```bash
./scripts/agy-worker.sh docs/tasks/<task-id>-<topic>.md
```

The script must use a detached temporary worktree, sandbox `agy`, reject unauthorized paths, block
collisions with user changes, and import only a checked patch. Never run the worker in the user's
worktree and never auto-revert a scope breach.

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

## Completion and staleness

1. Set the task `Complete` or `Partially Complete — <remaining>` and record commands/files/date.
2. Update downstream dependency notes and the actual next eligible handoff.
3. Compare changed evidence with cited audits and the knowledge base.
4. Downgrade affected Audit Register rows to `Needs Re-audit` with task ID and rationale.
5. Never rewrite an audit or mark it complete from Level 3.
