# Tram Tracking System Agent Guide

Keep repository guidance here, reusable workflows in `.agents/skills/`, and project state in
`docs/`. Do not duplicate the same rule across those layers.

## Three-level workflow

| Level | Contract | Skill | Purpose |
|---|---|---|---|
| 1 | `agents/level-1-audit/AGENT.md` | `tram-audit-workflow` | Discovery, domain audits, production assessment, and roadmap synthesis. |
| 2 | `agents/level-2-specialist/AGENT.md` | `tram-specialist-consultation` | One focused technical decision per question. |
| 3 | `agents/level-3-refactor/AGENT.md` | `tram-refactoring-workflow` | Bounded implementation, verification, and state synchronization. |

Read the matching agent contract and skill before acting. Use Level 2 only when Level 1 or Level 3
has a focused cross-domain uncertainty; it is not a mandatory extra layer for mechanical work.

## Source-of-truth boundaries

- `AGENTS.md`: stable repository-wide routing and safety rules.
- `agents/`: three role contracts only.
- `.agents/skills/`: the only project-skill location; domain playbooks live one level below each
  workflow in `references/`. Do not recreate a root `skills/` mirror.
- `docs/audits/README.md`: audit freshness and next eligible audit phase.
- `docs/decision-queue.md`: approved or pending owner decisions.
- `docs/research/`: approved experiment scope and research definitions.
- `docs/roadmap/master-refactoring-roadmap.md`: implementation order and task status.
- `docs/tasks/`: exact-path implementation handoffs.

## Ownership and safety

- Level 1 owns audit reports and coordination records. Domain runs propose decisions; the
  coordinator validates and merges them.
- Level 2 writes immutable task-keyed briefs under `docs/audits/specialized/`; it does not edit code
  or shared queues.
- Level 3 may update its roadmap task and downgrade affected audits to `Needs Re-audit`; it never
  marks an audit complete.
- Preserve pre-existing changes. Never auto-revert a scope breach.
- Require exact repository-relative write paths before worker delegation.
- Run migrations or deployment checks only against an explicitly approved disposable target.

## Required validation

Run `node scripts/validate-agent-workflow.js` after changing agents, skills, or their paths. Run
`bash scripts/ci-checks.sh` before completing an implementation task.
