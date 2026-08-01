# Tram Tracking System Agent Guide

Keep repository guidance here, reusable workflows in `.agents/skills/`, and project state in
`docs/`. Do not duplicate the same rule across those layers.

## Main Agent supervisor

The repository Main Agent is the default entry point and remains accountable for the user's outcome.
It owns work classification, the completion contract, level routing, delegation boundaries,
acceptance review, repair iterations, and final state synchronization. A delegated agent or worker
may produce evidence or a patch; it never inherits approval or completion authority.

### Operating modes

- `Status`: report current evidence, blockers, and next eligible work without writes.
- `Plan`: propose an ordered bounded plan without implementing it.
- `Run Specific`: complete the user-selected audit, decision, roadmap task, or maintenance task.
  This is the default mutating mode for a specific user request.
- `Run Next`: select and complete one next eligible work unit from the requested lane.
- `Run Approved Batch`: continue across the explicitly approved task set, repairing failed checks
  without waiting for another prompt, and stop at the first authority, safety, or evidence blocker.

Do not silently turn `Run Specific` into a batch or select unrelated backlog work. Within approved
scope, do not ask the user to manually trigger ordinary inspect, test, or repair steps.

### Execution lanes

| Lane | Entry gate | Route | State rule |
|---|---|---|---|
| Audit / roadmap synthesis | Eligible evidence and predecessor state. | Level 1 | Level 1 owns audit and coordination records. |
| Roadmap implementation | Current approved `T<number>` task and satisfied gates. | Level 3 | Update only that task and affected audit freshness. |
| Maintenance implementation | Explicit user request, bounded outcome, and no unresolved owner-controlled decision. | Level 3 with `M-YYYYMMDD-NN` work ID | Record an exact-path task spec; do not add or reorder roadmap work. |
| Focused uncertainty | One binding cross-domain question. | Level 2 from Level 1 or Level 3 | The immutable brief constrains only its stated question. |

Maintenance is for corrective, compatibility, tooling, test, or small feature work outside the
roadmap. Before implementation, assess product, architecture, security/privacy, data/migration,
operations, and research impact. Route broad discovery to Level 1 and focused uncertainty to Level
2. If the request changes an owner-controlled policy or expands into strategic multi-task work, stop
for an owner decision or roadmap synthesis instead of hiding the expansion inside maintenance.

### Supervision loop

For each approved work unit:

1. Define the outcome, non-goals, lane, acceptance evidence, and stop conditions.
2. Inspect current source, project state, dependencies, and pre-existing worktree changes.
3. Pass the selected level's gates and create or validate the exact-path handoff.
4. Implement directly or delegate only the bounded mechanical portion.
5. Inspect the resulting diff and behavior; never accept a worker's self-report as proof.
6. Run focused checks and the required repository gates, mapping every acceptance criterion to
   evidence.
7. On failure, repair an in-scope implementation defect and repeat from inspection. Revise the task
   contract before expanding paths; route a narrow uncertainty to Level 2; route stale/broad
   evidence to Level 1; stop only for missing authority, unsafe external state, or unresolved facts.
8. Synchronize task evidence, dependency notes, and affected audit freshness before reporting the
   result. In `Run Approved Batch`, select the next eligible approved unit and repeat.

The loop ends only when the requested scope passes its acceptance contract, the approved batch is
exhausted, or a concrete blocker requires user authority or external evidence.

## Three-level workflow

| Level | Contract | Skill | Purpose |
|---|---|---|---|
| 1 | `agents/level-1-audit/AGENT.md` | `tram-audit-workflow` | Discovery, domain audits, production assessment, and roadmap synthesis. |
| 2 | `agents/level-2-specialist/AGENT.md` | `tram-specialist-consultation` | One focused technical decision per question. |
| 3 | `agents/level-3-refactor/AGENT.md` | `tram-refactoring-workflow` | Bounded implementation, verification, and state synchronization. |

Read the matching agent contract and skill before acting. Use Level 2 only when Level 1 or Level 3
has a focused cross-domain uncertainty; it is not a mandatory extra layer for mechanical work.

## UX/UI skill routing

- Invoke `frontend-design` before creating a new UX/UI surface or refactoring an existing UX/UI
  implementation while preserving its incumbent visual identity and product behavior.
- Invoke `impeccable` with its `audit` command before a frontend UX/UI audit, including the Level 1
  Frontend and Dashboard & UX profiles. Treat its findings as evidence; Level 1 retains audit and
  shared-state ownership.
- Use `impeccable` for a redesign that replaces the incumbent visual world or identity. Do not
  classify a behavior-preserving code or component refactor as a redesign.
- For a request that combines audit and implementation, run the `impeccable` audit first. Then use
  `frontend-design` for the approved creation or identity-preserving refactor, or continue with
  `impeccable` when the approved outcome is a redesign.

These UI skills supplement the selected three-level workflow; they do not replace its gates,
exact-path task contract, verification, acceptance, or state-synchronization ownership.

## Source-of-truth boundaries

- `AGENTS.md`: stable repository-wide routing and safety rules.
- `agents/`: three role contracts only.
- `.agents/skills/`: the only project-skill location; domain playbooks live one level below each
  workflow in `references/`. Do not recreate a root `skills/` mirror.
- `docs/audits/README.md`: audit freshness and next eligible audit phase.
- `docs/decision-queue.md`: approved or pending owner decisions.
- `docs/research/`: approved experiment scope and research definitions.
- `docs/roadmap/master-refactoring-roadmap.md`: implementation order and task status.
- `docs/tasks/`: exact-path roadmap and maintenance implementation handoffs.

## Engineering completion baseline

- Preserve observable behavior unless the acceptance contract explicitly changes it. Keep one
  authoritative implementation for each invariant and remove duplication only with regression
  evidence.
- Use clear domain, application, and infrastructure boundaries. Prefer small cohesive units,
  explicit dependencies, composition, and interfaces at replaceable boundaries. Use classes when
  identity, lifecycle, or invariants benefit from encapsulation; do not force OOP onto pure
  transforms, React hooks, or stateless utilities.
- Keep TypeScript strict. Do not introduce explicit or implicit `any`, unsafe double assertions,
  `@ts-ignore`, or lint disables as shortcuts. Accept `unknown` at untrusted boundaries, validate
  and narrow it, then use typed DTOs, domain types, or discriminated unions internally.
- Validate input and authorization at server boundaries, keep secrets and sensitive payloads out of
  logs, return stable safe errors, and make production behavior configurable and observable.
- Add the cheapest deterministic test that can fail for the defect or invariant. Cover changed
  boundaries and failure paths; a build, diff, or delegated report alone is not acceptance.
- Keep raw research observations distinct from canonical operational state. Preserve provenance,
  units, timestamps, selection/rejection semantics, versioning, and reproducible export/analysis
  definitions; never upgrade simulator or proxy measurements into field or ground-truth evidence.

## Ownership and safety

- Level 1 owns audit reports and coordination records. Domain runs propose decisions; the
  coordinator validates and merges them.
- Level 2 writes immutable task-keyed briefs under `docs/audits/specialized/`; it does not edit code
  or shared queues.
- Level 3 may update its roadmap task and downgrade affected audits to `Needs Re-audit`; it never
  marks an audit complete.
- The Main Agent owns final acceptance and cross-level routing. A worker cannot approve a decision,
  expand its write scope, mark an audit complete, or declare the supervised outcome complete.
- Preserve pre-existing changes. Never auto-revert a scope breach.
- Require exact repository-relative write paths before worker delegation.
- Run migrations or deployment checks only against an explicitly approved disposable target.

## Required validation

Run `node scripts/validate-agent-workflow.js` and `git diff --check` after changing agents, skills,
or their paths. Run `bash scripts/ci-checks.sh` before completing an implementation task.
