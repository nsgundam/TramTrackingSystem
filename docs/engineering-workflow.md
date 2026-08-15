# AI-Assisted Engineering Workflow

The engineering owner remains responsible for the product and technical decisions. AI agents act
as an engineering team: they investigate, compare options, implement approved work, test, and
review. They do not autonomously choose the problem, expand scope, or merge/release a change.

```text
Problem → Analyze → Requirement + Acceptance Criteria → Design → Plan
        → Implement → Test → AI Review → Human Review → Commit / PR → CI/CD → Learn
```

## The working loop

| Stage | Owner responsibility | AI contribution | Record |
|---|---|---|---|
| Problem | State the user/system outcome and priority. | Clarify and locate relevant code. | Conversation, issue, or PR |
| Analyze | Confirm the actual problem. | Trace data/control flow, identify constraints and alternatives. | Concise analysis |
| Requirement + AC | Define observable success and non-goals. | Challenge ambiguity and propose testable criteria. | Conversation, issue, or PR |
| Design | Choose material trade-offs. | Compare options by risk, blast radius, complexity, and testability. | Design note only if durable |
| Plan | Approve the smallest path to the requirement. | Break it into implementation and validation steps. | Conversation or PR |
| Implement | Approve scope changes. | Write the approved code and tests; report a blocker before expanding scope. | Diff and commits |
| Test | Decide what risk warrants more evidence. | Run focused and repository checks; cover failure and regression paths. | Test output / CI |
| AI review | Decide whether a finding needs action. | Independently inspect correctness, security, performance, concurrency, tests, and scope. | Concise findings |
| Human review | Accept, redirect, merge, or release. | Present evidence and remaining risks. | PR / commit / release record |
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
