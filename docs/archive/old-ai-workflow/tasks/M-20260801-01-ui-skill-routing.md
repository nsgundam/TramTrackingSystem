# Implementation Task Specification: M-20260801-01 — UI skill routing

## Source Work

- Work ID: `M-20260801-01`
- Lane: `Maintenance`
- Roadmap task: `Not applicable`
- User authorization: Explicit request on 2026-08-01 to route UX/UI creation and refactoring to
  `frontend-design`, and frontend audits or redesigns to `impeccable`
- Approved decisions: `AC-015`
- Specialist briefs: `None`
- Source audits: `docs/audits/README.md` — Frontend and Dashboard & UX are already
  `Needs Re-audit`; this workflow-only change does not alter application evidence

## Outcome and Non-goals

- Outcome: Repository agents select the intended UI skill consistently and distinguish a
  behavior-preserving refactor from a visual redesign.
- Non-goals: Do not change application UI, audit findings/status, roadmap order, installed global
  skill content, or ownership of Level 1/Level 3 acceptance.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | Changes agent routing only; no product behavior or UI is modified. |
| Architecture | Bounded | Adds one repository-wide routing contract and a validator assertion. |
| Security / privacy | None | No authorization, secret, or sensitive-data boundary changes. |
| Data / migration | None | No schema, data, or migration changes. |
| Operations / rollout | None | No runtime or deployment changes. |
| Research validity | None | No research data or measurement definitions change. |

## Allowed Writes

- `AGENTS.md`
- `docs/agent-change-queue.md`
- `docs/tasks/M-20260801-01-ui-skill-routing.md`
- `scripts/validate-agent-workflow.js`

## Read-only Context

- `agents/level-1-audit/AGENT.md`
- `agents/level-3-refactor/AGENT.md`
- `.agents/skills/tram-audit-workflow/SKILL.md`
- `.agents/skills/tram-refactoring-workflow/SKILL.md`
- `docs/project-knowledge-base.md`
- `docs/audits/README.md`
- `docs/decision-queue.md`
- `/Users/ns/.codex/skills/frontend-design/SKILL.md`
- `/Users/ns/.codex/skills/impeccable/SKILL.md`

## Invariants

- Root `AGENTS.md` remains the single source of truth for repository-wide routing.
- Level 1 retains audit ownership and Level 3/Main Agent retain implementation acceptance.
- Existing application behavior and pre-existing worktree changes remain untouched.

## Required Changes

1. Add one concise UX/UI routing section to `AGENTS.md`.
2. Route creation and behavior-preserving UX/UI refactoring to `frontend-design`.
3. Route frontend audits through the `impeccable` `audit` command and visual redesigns through
   `impeccable`.
4. Define precedence for requests that contain both audit and implementation work.
5. Extend the workflow validator so the routing contract cannot disappear silently.

## Acceptance Criteria

- `AGENTS.md` contains unambiguous routing for creation, refactor, audit, and redesign.
- Refactor and redesign are distinguished by whether the incumbent visual identity is preserved or
  replaced.
- Audit-plus-implementation requests have an explicit skill sequence.
- The routing supplements rather than replaces the three-level workflow and ownership rules.
- Repository workflow validation, CI, and whitespace checks pass.

## Validation Commands

- `node scripts/validate-agent-workflow.js`
- `git diff --check`
- `bash scripts/ci-checks.sh`

## Rollout and Migration Limits

- Not applicable; this is repository instruction and validation maintenance only.

## Stop Conditions

- Stop if another write path is required.
- Stop if an owner decision, migration target, secret, provider, or hardware fact is unresolved.
- Stop rather than changing architecture or adding dependencies outside this specification.

## Completion Evidence

- Status: `Complete`
- Acceptance mapping:
  - Creation/refactor routing → `AGENTS.md` routes new and identity-preserving UX/UI work to
    `frontend-design`; enforced by `scripts/validate-agent-workflow.js`.
  - Audit/redesign routing → `AGENTS.md` routes frontend audits to the `impeccable` `audit` command
    and replacement visual redesigns to `impeccable`; enforced by the workflow validator.
  - Mixed-request precedence and ownership → `AGENTS.md` requires audit-first sequencing and keeps
    the three-level gates, acceptance, and state ownership authoritative.
  - Repository gates → workflow validation, whitespace validation, and full CI passed.
- Changed files: `AGENTS.md`, `docs/agent-change-queue.md`,
  `docs/tasks/M-20260801-01-ui-skill-routing.md`, `scripts/validate-agent-workflow.js`
- Validation results:
  - `node scripts/validate-agent-workflow.js` — passed on 2026-08-01.
  - `git diff --check` plus an explicit trailing-whitespace scan of this untracked task file —
    passed on 2026-08-01.
  - `bash scripts/ci-checks.sh` — first sandboxed run blocked at Playwright port binding with
    `EPERM`; approved rerun outside the sandbox passed on 2026-08-01. Frontend lint retained two
    pre-existing warnings and reported zero errors.
- Audit freshness changes: None; this is an agent-contract-only change, and Frontend plus Dashboard
  & UX were already `Needs Re-audit` before this work.
