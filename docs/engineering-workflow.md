# AI-Assisted Engineering Workflow

The engineering owner remains responsible for the product and technical decisions. AI agents act
as an engineering team: they investigate, compare options, implement approved work, test, and
review. They do not autonomously choose the problem, expand scope, or merge/release a change.

```text
Problem → Analyze → Requirement + Acceptance Criteria → Design → Plan
        → Route Implementation → Implement → Deterministic Verification
        → Independent AI Review → Human Review → Commit / PR → CI/CD → Learn
```

## The working loop

| Stage | Owner responsibility | AI contribution | Record |
|---|---|---|---|
| Problem | State the user/system outcome and priority. | Clarify and locate relevant code. | Conversation, issue, or PR |
| Analyze | Confirm the actual problem. | Trace data/control flow, identify constraints and alternatives. | Concise analysis |
| Requirement + AC | Define observable success and non-goals. | Challenge ambiguity and propose testable criteria. | Conversation, issue, or PR |
| Design | Choose material trade-offs. | Compare options by risk, blast radius, complexity, and testability. | Design note only if durable |
| Plan | Approve the smallest path to the requirement. | Break it into implementation and validation steps. | Conversation or PR |
| Route implementation | Approve any executor or scope exception. | Route frontend execution to Antigravity through `agy`; choose the smallest relevant executor for other work. | Implementation contract |
| Implement | Approve scope changes. | Write the approved code and tests; report a blocker before expanding scope. | Diff |
| Deterministic verification | Decide what risk warrants more evidence. | Run focused and repository checks; cover failure and regression paths. | Test output / CI |
| Independent AI review | Decide whether a finding needs action. | A fresh-context, read-only Sol High reviewer inspects correctness, security, performance, concurrency, tests, and scope. | Verdict and concise findings |
| Human review | Accept, redirect, merge, or release. | Present evidence, independent-review verdict, and remaining risks. | PR / commit / release record |
| Learn | Reflect on trade-offs and operations. | Ask probing senior-engineering questions. | Usually conversation |

## Approval and stopping rules

- A request to implement a clear outcome authorizes work within that outcome. Investigation,
  review, and planning requests remain read-only unless the owner asks for a change.
- Stop and present options before an unapproved architecture change, API or schema contract change,
  dependency upgrade, security-policy change, UI redesign, external operation, or unrelated cleanup.
- Report discoveries; never convert them into a self-assigned task. The owner decides whether they
  become a future problem.
- Do not commit, push, open a PR, deploy, or mutate an external target without explicit approval.

## Choosing the agent shape

Use one agent for ordinary work when it can retain the problem and its acceptance criteria. Split
responsibilities only when it adds independent value:

- **SWE** for unfamiliar code, root-cause analysis, requirements, and design choices.
- **Coding** for approved, bounded implementation and testing.
- **Review** for an independent diff review.
- **Specialist** only for relevant risk: security/authentication, database/data migration, backend
  concurrency, frontend/accessibility, infrastructure/release, performance, or research validity.

Specialists advise the owner; they are not a mandatory sequence of gates.

## Definition of ready and implementation contract

Implementation is ready to route only when these fields are explicit:

```text
Problem
Requirement
Acceptance criteria
Approved design
Allowed scope
Forbidden changes
Relevant files
Expected deterministic checks
```

This is the contract passed to any implementer. It bounds execution but does not prescribe every
low-level coding choice. A missing field is resolved in the conversation; it does not require a new
task document.

## Orchestration hooks

The names below describe workflow interception points. Codex lifecycle hooks can run deterministic
commands, but the orchestrating agent or a future external graph runner owns specialist delegation
and reviewer spawning.

### `routeImplementation`

Classify each approved implementation unit before code changes begin:

| Scope | Executor | Boundary |
|---|---|---|
| Frontend code, CSS, UX behavior, accessibility, responsive behavior, or frontend tests | Antigravity through the installed `agy` CLI | Implement only the contract; do not redefine the design or explore unrelated improvements. |
| Backend or ordinary repository work | Coding agent | Implement only the approved plan and tests. |
| Database, security, operations, performance, or research work with specialist risk | Smallest relevant specialist | Advise or implement only the explicitly approved specialist scope. |

Invoke `agy` from the repository root in sandbox mode and pass the complete implementation contract.
Never use `--dangerously-skip-permissions`. A mixed frontend/backend change is executed as ordered,
non-overlapping units; two agents must not write concurrently in one checkout. If AGY is unavailable
or asks to exceed the contract, stop for the owner instead of falling back silently.

Every frontend contract must begin by requiring Antigravity to read the vendored community skill at
`tools/agy-skills/frontend-design/SKILL.md`, sourced unchanged from `anthropics/skills`, and then
read `DESIGN.md`. Use the explicit path rather than relying on skill auto-discovery. The repository
design system, approved design, and scope remain authoritative whenever generic community guidance
offers a different direction.

The non-interactive command shape is:

```text
agy --sandbox --mode accept-edits --print "<community skill path + implementation contract>"
```

The existing UX/UI skill rules still run before frontend delegation: use `frontend-design` to shape
a new surface or behavior-preserving refactor, then use `impeccable` to analyze, critique, polish,
or audit the relevant UI. Run Impeccable in the primary Codex workflow rather than asking AGY to
execute its Codex-specific tooling. Its concise, approved output becomes part of the implementation
contract passed to Antigravity.

### Frontend design-analysis sequence

Use this sequence only for a new/refined visual surface, an explicit UI/UX quality request, or a
frontend audit/redesign. A logic-only frontend repair does not need a design-analysis pass unless
its approved requirement changes user-facing behavior or visual quality.

```text
Approved frontend requirement/design
  → frontend-design: establish direction
  → impeccable: shape | critique | polish | audit
  → Owner approval for any material design decision
  → AGY: implement the bounded contract
  → Deterministic checks
  → impeccable: read-only audit/critique when UI changed
  → Sol High: independent final review
```

Impeccable is the primary workflow's design-analysis specialist. It produces a scoped brief that
states the user job, information hierarchy, visual direction, incumbent authority to preserve,
states, responsive/accessibility requirements, allowed files, and required verification. It never
authorizes a new identity, content claim, interaction model, design-system change, API change, or
scope expansion. Those decisions remain with the owner.

### `afterImplementationReview`

Every implementation follows the same gate regardless of whether Antigravity, a coding agent, a
specialist, or a human wrote it:

```text
Implementation
  → Deterministic checks
  → Fresh-context Sol High review (read-only)
  → PASS | CHANGES_REQUIRED | HUMAN_DECISION_REQUIRED
```

Use `.codex/agents/sol-high-reviewer.toml`, pinned to `gpt-5.6-sol` with `high` reasoning and a
requested read-only sandbox. Before spawning, set the parent/runtime permission mode to read-only
and verify the child's effective sandbox. Live parent overrides can replace the profile's sandbox
setting, so the profile alone is not enforcement. Give the reviewer intent, approved boundaries,
the diff and changed-file list, relevant source, and test output—not the implementer's private
reasoning.

When the orchestrator cannot verify a spawned child's effective permission boundary, run a fresh,
isolated review from the repository root with this command shape:

```text
codex exec --ephemeral --sandbox read-only --model gpt-5.6-sol \
  --config 'model_reasoning_effort="high"' "<review contract>"
```

If neither route can guarantee an effective read-only sandbox, return
`HUMAN_DECISION_REQUIRED`; never run the independent reviewer with write permission. The reviewer
checks correctness, regressions, edge cases, races, security, architecture, API/data contracts,
unexpected files, test adequacy, maintainability, and scope creep. For frontend work it also checks
accessibility, responsive behavior, browser behavior, and loading/error/empty states.

The reviewer never edits. `CHANGES_REQUIRED` returns accepted in-scope findings to the original
implementer, followed by affected checks and another fresh review. Stop after two automatic repair
cycles; a third non-pass verdict, an unapproved scope/design change, or a material trade-off becomes
`HUMAN_DECISION_REQUIRED`.

`PASS` means no actionable issue was found in that review. It is not a promise that the change is
bug-free, and it never replaces deterministic tests, CI, or owner review.

## Definition of done

An implementation is ready for human review when:

- each acceptance criterion maps to evidence;
- focused and relevant repository checks pass, with any skipped check and reason stated;
- the changed-file list contains no unexplained scope;
- the independent Sol High reviewer returns `PASS`, or the owner explicitly resolves a reported
  decision; and
- durable documentation is updated only if the change made it inaccurate.

Commit, PR, CI/CD, merge, release, and production evidence remain later owner-controlled steps.

## Documentation and evidence

Requirements and acceptance criteria belong in the lightest useful record: often the conversation,
an issue, or a PR. Write or update durable documentation only for lasting product/domain facts,
architecture, deployment/runbook procedure, research definition, or an enduring decision.

Evidence must describe its level honestly. Source inspection, a simulator, local tests, and CI do
not prove production deployment, a physical device, field performance, provider behavior, or human
usability. Those require their own authorized evidence.

## Suggested request format

```text
Problem: What is wrong or what outcome is needed?
Requirement: What must be true when this is done?
Acceptance criteria: How will we observe success?
Constraints: What must not change?
Decision needed: Which trade-off needs owner approval, if any?
```

For learning after a change, ask the agent to challenge the chosen design: alternatives, edge
cases, observability, failure recovery, scaling assumptions, and what evidence would change the
decision.
