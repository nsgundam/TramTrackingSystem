# Implementation Task Specification: M-20260815-01 — AI engineering workflow migration

## Source Work

- Work ID: `M-20260815-01`
- Lane: `Maintenance`
- Roadmap task: `Not applicable`
- User authorization: AI Workflow Migration request, 2026-08-15, using the referenced “AI in Engineering Workflow” conversation as the source of intent.
- Approved decisions: The engineering owner explicitly chose a human-owned, minimal SWE workflow; Jira is for intern training only and is not a TramTracking development dependency.
- Specialist briefs: `None` — this changes repository process documentation and tooling only; it does not change an application boundary.
- Source audits: `docs/audits/README.md` and the current audit set, validated at `9323afc`; they are historical evidence to archive, not gates for application work.

## Outcome and Non-goals

- Outcome: Replace the active audit/roadmap/task-driven AI process with a concise human-owned engineering workflow: Problem → Analyze → Requirement + Acceptance Criteria → Design → Plan → Implement → Test → AI Review → Human Review → Commit/PR → CI/CD → Learn. Preserve durable engineering knowledge in active documentation and archive historical workflow records and instructions.
- Non-goals: No application source, runtime configuration, dependency, schema, API, UI, test behavior, deployment, migration, or product feature change. Do not select or implement any former roadmap item after this migration.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | None | No product or UI behavior changes; `PRODUCT.md` is only relinked to durable documentation. |
| Architecture | Bounded | Active architecture documentation is distilled from the existing validated knowledge base; runtime topology remains unchanged. |
| Security / privacy | Bounded | Security and production stop conditions remain explicit in durable docs; no security boundary changes. |
| Data / migration | None | No database target, migration, seed, or data operation. |
| Operations / rollout | Bounded | Existing operational handoff and release limits remain active; only historical workflow references are removed. |
| Research validity | Bounded | The research scope remains active and continues to distinguish proxy metrics from field/ground-truth evidence. |

## Allowed Writes

- `AGENTS.md`
- `README.md`
- `PRODUCT.md`
- `docs/README.md`
- `docs/architecture.md`
- `docs/domain.md`
- `docs/deployment.md`
- `docs/engineering-workflow.md`
- `docs/runbook.md`
- `docs/research/device-comparison-scope.md`
- `docs/testing/ci-checks.md`
- `scripts/ci-checks.sh`
- `scripts/test-production-topology.mjs`
- `docs/archive/old-ai-workflow/README.md`
- The exact existing paths under `agents/`, `.agents/`, `docs/audits/`, `docs/roadmap/`, and `docs/tasks/`, plus `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/agent-change-queue.md`, `docs/research/T7-owner-input-questionnaire.md`, `scripts/agy-worker.sh`, and `scripts/validate-agent-workflow.js`, relocated without content changes to the matching path below `docs/archive/old-ai-workflow/`.

## Read-only Context

- `DESIGN.md`
- `docs/operations/university-server-network-handoff.md`
- `docs/testing/pipeline-smoke-tests.md`
- `docs/research/device-comparison-scope.md`
- application source and configuration needed only to verify documentation claims

## Invariants

- Agents may discover problems, but discovery does not authorize implementation.
- The engineering owner approves problem framing, requirements, design trade-offs, scope expansion, and merge/release decisions.
- Requirements and acceptance criteria are proportional: they may live in a conversation, issue, or PR rather than a mandatory task document.
- Git history, pull requests, tests, and CI are the primary engineering record; durable docs describe stable system knowledge only.
- Repository/static evidence is never represented as deployed, field, human, hardware, or production acceptance.
- Historical materials remain available under `docs/archive/old-ai-workflow/` and are not treated as active instructions.

## Required Changes

1. Extract current product/domain, architecture, deployment, runbook, research, and production-limit knowledge into concise active documentation.
2. Replace the active agent instructions and README workflow section with the new human-owned engineering workflow and optional specialist-toolbox model.
3. Archive rather than delete the Level 1–3 contracts, project skills, audits, decisions, roadmap, task specifications, historical knowledge base, and obsolete workflow validator/worker.
4. Remove the obsolete workflow-validation invocation from CI while retaining application checks.
5. Correct the README development-seed credential instructions from the verified source behavior.

## Acceptance Criteria

- The active workflow has one readable canonical sequence and explicitly requires owner approval before implementation, scope expansion, and merge/release.
- Active instructions contain no Level 1–3 pipeline, audit freshness, roadmap selection, mandatory task-spec, or automatic-next-task rule.
- Active documentation retains the system/domain overview, architecture/data invariants, deployment/runbook limits, research semantics, and production stop conditions.
- All legacy workflow materials are preserved below `docs/archive/old-ai-workflow/`; no active link points to them as operational instructions.
- `bash scripts/ci-checks.sh` still runs the relevant repository checks and no longer invokes the legacy workflow validator.
- `git diff --check` passes. No application source file changes.

## Validation Commands

- `rg -n -i 'level [123]|tram-(audit|specialist|refactoring)-workflow|next eligible|task spec|audit freshness|master-refactoring-roadmap' AGENTS.md README.md docs --glob '!docs/archive/**'`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `git diff --name-only`

## Rollout and Migration Limits

- Not applicable. This is a documentation and local developer-tooling migration only; do not run database, Compose runtime, simulator, deployment, or production checks.

## Stop Conditions

- Stop if preserving durable knowledge requires changing application source or inferring an unverified external fact.
- Stop if another non-documentation/runtime path is required.
- Stop rather than selecting a roadmap item or turning a discovered concern into implementation work.

## Completion Evidence

- Status: `Complete`
- Acceptance mapping:
  - One human-owned engineering sequence and explicit owner approval boundaries → `AGENTS.md`,
    `docs/engineering-workflow.md`, and `README.md`.
  - Durable domain, architecture, deployment/runbook, research, testing, and operational knowledge
    remain active → `docs/domain.md`, `docs/architecture.md`, `docs/deployment.md`,
    `docs/runbook.md`, `docs/research/device-comparison-scope.md`, `docs/testing/`, and
    `docs/operations/`.
  - Legacy instructions and process state are preserved but inactive →
    `docs/archive/old-ai-workflow/` contains the former root guide, agent contracts, skills,
    audits, decisions, roadmap, tasks, knowledge base, validator, and worker.
  - No application source was changed → `git diff --name-only -- shuttle-tracking-backend
    shuttle-tracking-web docker docker-compose.yml docker-compose.prod.yml env.example .github`
    returned no paths.
- Changed files: Active guide/docs listed under Allowed Writes; legacy agents, skills, audits,
  decisions, roadmap, tasks, knowledge base, workflow validator, and worker relocated under
  `docs/archive/old-ai-workflow/`.
- Validation results:
  - Active Markdown link check passed (14 files), 2026-08-15.
  - Active legacy-workflow reference check passed; only the guide's explicit prohibition on creating
    a roadmap/ledger/task specification remains.
  - Legacy active paths absent: `agents/`, `.agents/`, `docs/audits/`, `docs/roadmap/`,
    `docs/tasks/`, `scripts/validate-agent-workflow.js`, and `scripts/agy-worker.sh`.
  - `bash scripts/ci-checks.sh` passed outside the sandbox because Playwright requires a temporary
    localhost listener. Backend checks, Prisma validation, frontend unit/E2E checks, lint with two
    pre-existing warnings and zero errors, production build, Compose validation, production topology,
    and unsafe dynamic logging check passed, 2026-08-15.
  - `git diff --check` passed, 2026-08-15.
- Audit freshness changes: Not applicable — audit records are historical after this migration.
