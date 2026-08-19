# Tram Tracking System Agent Guide

Build software with the engineering owner, not a process for its own sake. The owner is the
technical decision-maker; AI agents extend their ability to investigate, implement, test, and
review.

## Authority and scope

- The owner decides the problem, requirement, acceptance criteria, design trade-offs, acceptable
  risk, scope expansion, merge, and release.
- An agent may discover a problem, but discovery does **not** authorize implementation. Report the
  finding with evidence and options; wait for the owner to frame or approve a new problem.
- A direct request to implement a clearly described outcome authorizes work within that outcome. A
  request to investigate, plan, explain, or review does not.
- Do not turn one request into a batch, select a follow-up task, or use a finding to create work on
  the owner's behalf.
- Do not push, deploy, operate a database migration, or access a non-disposable external target
  without explicit owner authorization.

## Engineering workflow

Use this one sequence. Keep each stage proportionate to the change; a small bug can record its
requirement and acceptance criteria in the conversation or PR instead of a new document.

```text
Problem
  → Analyze
  → Requirement + Acceptance Criteria
  → Design
  → Implementation Plan
  → Route Implementation
  → Implement
  → Deterministic Verification
  → Independent AI Review
  → Human Review
  → Commit / Pull Request
  → CI/CD
  → Learn
```

1. **Problem.** State the user or system problem and why it matters. Do not begin with a filename.
2. **Analyze.** Trace relevant code and tests; report root cause, affected paths, constraints, and
   viable options concisely.
3. **Requirement + acceptance criteria.** Confirm observable outcomes and non-goals with the
   owner. State how success will be checked.
4. **Design.** Compare meaningful choices by scope, risk, complexity, testability, and operational
   consequences. The owner chooses when a trade-off is material.
5. **Plan.** List the smallest implementation and test steps that satisfy the approved design.
6. **Route implementation.** Use the implementation-routing rules below. Routing chooses the
   executor; it does not reopen the requirement, design, plan, or approved scope.
7. **Implement.** Change only the approved scope plus essential supporting code and tests. Stop for
   an architectural change, dependency update, schema/API contract change, redesign, or unrelated
   cleanup that was not approved.
8. **Deterministic verification.** Select checks from risk: happy path, failure path,
   authorization, input validation, boundary, race/state transition, regression, and integration
   behavior as applicable.
9. **Independent AI review.** After checks, a fresh-context, read-only `gpt-5.6-sol` reviewer at
   `high` reasoning inspects the diff for correctness, security, data handling, concurrency,
   performance, readability, test quality, and scope creep. The reviewer reports findings and
   never edits the implementation.
10. **Human review.** Present the problem, chosen design, diff, tests, independent-review verdict,
    risks, and unresolved items for the owner to accept or redirect.
11. **Commit / PR and CI/CD.** Git history, PR discussion, tests, and CI are the working record.
    A commit, PR, push, or deployment needs the owner's explicit authorization.
12. **Learn.** When useful, discuss the trade-off, missed assumption, production signal, and what
    would change at greater scale. This is normally a short conversation, not mandatory paperwork.

The fuller operating reference is [docs/engineering-workflow.md](docs/engineering-workflow.md).

## Agent roles

- **SWE agent:** investigates the repository, refines the requirement, compares designs, and
  proposes a plan. It does not implement an unapproved plan.
- **Coding agent:** implements the approved plan, writes focused tests, runs checks, and repairs
  in-scope defects. It does not invent features or broaden the design.
- **Reviewer agent:** inspects a diff and reports prioritized findings. It does not silently change
  the implementation or approve a merge.
- **Specialists:** backend, frontend, database, security, DevOps, performance, and research
  expertise are a toolbox, not a pipeline. Call the smallest relevant specialist only when the
  change's risk or an unresolved fact requires it.

## Implementation-routing and review hooks

These hooks are orchestration policies within the engineering workflow. They are not claims that a
native Codex lifecycle hook can launch another agent: current lifecycle hooks execute command
handlers, while agent routing is performed by the orchestrating agent or an external orchestrator.

### `beforeImplement`

Do not route or implement until the working context contains the problem, requirement, acceptance
criteria, approved design, allowed scope, forbidden changes, and expected verification. Keep that
contract in the conversation or PR unless it is durable engineering knowledge.

### `routeImplementation`

- For any frontend implementation—including code, styles, interactions, accessibility, responsive
  behavior, or frontend tests under `shuttle-tracking-web/`—the orchestrating agent must invoke the
  installed `agy` CLI and delegate implementation to Antigravity. The primary/SWE agent retains
  requirement, design, scope, and acceptance authority; Antigravity is the bounded implementer.
- Send Antigravity an implementation contract containing the problem, requirement, acceptance
  criteria, approved design, allowed scope, forbidden changes, relevant files, and expected tests.
  Run it from the repository root with the sandbox enabled. Never use
  `--dangerously-skip-permissions`.
- For mixed changes, split the approved plan into ordered, non-overlapping execution units. Route
  only the frontend unit to Antigravity; do not run concurrent writers in the same checkout.
- If `agy` is missing, cannot start, requests an unapproved action, or cannot complete the contract,
  stop and report the blocker. Do not silently substitute the primary agent as frontend implementer.
- Route backend and other ordinary implementation to the coding agent. Use a database, security,
  DevOps, performance, or research specialist only when the approved scope or risk calls for it.

### `afterImplementationReview`

- After every implementation and its deterministic checks, spawn a fresh-context reviewer using
  the project profile `.codex/agents/sol-high-reviewer.toml` (`gpt-5.6-sol`, `high`, requested
  read-only sandbox).
- Before spawning, set the parent/runtime permission mode to read-only and verify that the child has
  an effective read-only sandbox; a profile setting alone is insufficient because live parent
  overrides can replace it. If the orchestrator cannot verify that boundary, use an isolated
  ephemeral `codex exec --sandbox read-only` review or return `HUMAN_DECISION_REQUIRED`. Never run
  the independent reviewer with effective write permission.
- Give the reviewer the problem, requirement, acceptance criteria, approved design and scope, diff,
  changed-file list, relevant source, and test results. Do not send the implementer's hidden
  reasoning or ask the implementer to act as its own final reviewer.
- Require one verdict: `PASS`, `CHANGES_REQUIRED`, or `HUMAN_DECISION_REQUIRED`. A pass means the
  independent AI review found no actionable issue; it is not a guarantee that the code has no bugs.
- The reviewer reports only. Route accepted in-scope fixes back to the original implementer, rerun
  affected deterministic checks, then request a fresh review.
- Allow at most two automatic repair cycles. If the next review still does not pass, or a finding
  requires scope/design/contract expansion, stop for the engineering owner.
- No implementation is ready for human review, commit, or PR until deterministic evidence and the
  independent-review verdict are reported. The owner remains the final decision-maker.

## Documentation

Keep documentation only when it is durable engineering knowledge: product/domain behavior,
architecture and invariants, design system, deployment, operational runbooks, research definitions,
or an enduring architectural decision. Keep temporary work in the conversation, issue, PR, commit,
and test results.

- Start at [docs/README.md](docs/README.md) for the active documentation map.
- Update a durable document when a completed change makes it inaccurate. Do not create an audit,
  roadmap, ledger, task specification, or handoff document merely to authorize ordinary work.
- Historical audit/roadmap/task workflow materials live under
  [docs/archive/old-ai-workflow/](docs/archive/old-ai-workflow/). They provide provenance only and
  are not active instructions or a backlog.
- Jira is not part of TramTracking development workflow. It may be used separately for intern
  training.

## Engineering baseline

- Preserve observable behavior unless the approved requirement changes it. Prefer small cohesive
  units, explicit dependencies, and one authoritative implementation for each invariant.
- Keep TypeScript strict. Do not use explicit or implicit `any`, unsafe double assertions,
  `@ts-ignore`, or lint disables to bypass a defect.
- Validate input and authorization at server boundaries. Keep credentials and sensitive payloads
  out of logs; return stable safe errors.
- Add the cheapest deterministic test that can fail for the changed defect or invariant. A diff,
  build, or agent report alone is not acceptance evidence.
- Keep raw research observations separate from canonical operational state. Preserve provenance,
  units, timestamps, selection/rejection semantics, versioning, and reproducible analyses. Never
  present simulator or proxy measurements as field or ground-truth evidence.
- Treat migrations, seeds, runtime smoke checks, hardware/provider testing, and deployments as
  stateful operations. Run them only against an explicitly authorized disposable target with a
  defined expected mutation and cleanup or rollback plan.

## UX/UI work

- Invoke `frontend-design` before creating a new UX/UI surface or making a behavior-preserving
  UX/UI refactor that retains the incumbent visual identity.
- Invoke `impeccable` for a frontend UX/UI audit or a redesign that replaces the incumbent visual
  identity. For combined audit and implementation, audit first.
- Apply accessibility, responsive behavior, semantic state, error/loading/empty states, and
  existing product/design constraints to the approved scope. Do not turn a bounded fix into a UI
  redesign without approval.

## Completion

Before reporting implementation work as ready for human review, inspect the diff, run the focused
checks and relevant repository checks, map each acceptance criterion to evidence, obtain the
mandatory independent-review verdict, and state any skipped check with its reason. If a check fails
or the reviewer reports a finding, investigate and repair only within the approved scope; otherwise
stop with the evidence and decision needed from the owner.
