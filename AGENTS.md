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
  → Implement
  → Test
  → AI Review
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
6. **Implement.** Change only the approved scope plus essential supporting code and tests. Stop for
   an architectural change, dependency update, schema/API contract change, redesign, or unrelated
   cleanup that was not approved.
7. **Test.** Select tests from risk: happy path, failure path, authorization, input validation,
   boundary, race/state transition, regression, and integration behavior as applicable.
8. **AI review.** Review the diff independently for correctness, security, data handling,
   concurrency, performance, readability, test quality, and scope creep. Findings are advice, not
   automatic edits.
9. **Human review.** Present the problem, chosen design, diff, tests, risks, and unresolved items
   for the owner to accept or redirect.
10. **Commit / PR and CI/CD.** Git history, PR discussion, tests, and CI are the working record.
    A commit, PR, push, or deployment needs the owner's explicit authorization.
11. **Learn.** When useful, discuss the trade-off, missed assumption, production signal, and what
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
checks and relevant repository checks, map each acceptance criterion to evidence, and state any
skipped check with its reason. If a check fails, investigate and repair only within the approved
scope; otherwise stop with the evidence and decision needed from the owner.
