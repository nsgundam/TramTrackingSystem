# Agent Change Queue

## Pending Changes

## Approved Changes

## Applied Changes

### AC-002

Agent: Product Audit Agent
File: `agents/product/AGENT.md`

Problem/evidence:
The instruction has no explicit report path and does not require comparison with the prior Product
Audit, although the lead-audit shared minimum requires both for a re-audit.

Exact proposed change:
Require `docs/audits/product-audit.md` as the output; add the previous report to required inputs;
add a re-audit workflow that classifies important findings as Resolved, Partially Resolved, Still
Present, No Longer Relevant, Unable to Verify, or New Finding; and require scope/evidence,
roadmap impact, assumptions/unknowns, confidence, and required decisions in the report.

Expected benefit:
Product findings will remain traceable to current product evidence and will not silently retain
superseded gaps.

Priority: High
Audit-blocking status: Cleared — required before Product re-audit
Owner decision: Approved
Proposal date: 2026-07-19
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-003

Agent: Architecture Audit Agent
File: `agents/architecture/AGENT.md`

Problem/evidence:
The instruction has no explicit report path and lacks a prior-findings re-audit workflow required
by the lead-audit shared minimum.

Exact proposed change:
Require `docs/audits/architecture-audit.md` as the output; add the previous report to required
inputs; require the standard finding-status classification and current evidence; and add explicit
scope/evidence, roadmap impact, assumptions/unknowns, confidence, and required-decision sections.

Expected benefit:
Architecture conclusions will distinguish current constraints from historical recommendations and
surface material design decisions before dependent audits begin.

Priority: High
Audit-blocking status: Cleared — required before Architecture re-audit
Owner decision: Approved
Proposal date: 2026-07-19
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-004

Agent: Frontend Audit Agent
File: `agents/frontend/AGENT.md`

Problem/evidence:
The report path and predecessor inputs are defined, but the instruction does not require
revalidation of the previous Frontend Audit or the lead-audit shared report fields.

Exact proposed change:
Add the previous frontend report to required inputs; add the standard re-audit finding-status
workflow; and require scope/evidence, roadmap impact, assumptions/unknowns, confidence, and
required decisions.

Expected benefit:
Frontend findings will show which realtime, UX, and state-management risks changed with current
source instead of repeating stale conclusions.

Priority: High
Audit-blocking status: Cleared — required before Frontend re-audit
Owner decision: Approved
Proposal date: 2026-07-19
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-005

Agent: Database Audit Agent
File: `agents/database/AGENT.md`

Problem/evidence:
The instruction does not require comparison with the previous Database Audit or the full
lead-audit shared report fields.

Exact proposed change:
Add the previous database report to required inputs; add the standard re-audit finding-status
workflow; and require scope/evidence, roadmap impact, assumptions/unknowns, confidence, and
required decisions.

Expected benefit:
Schema, migration, and retention findings will be revalidated against current migrations and
avoid carrying forward resolved constraints.

Priority: High
Audit-blocking status: Cleared — required before Database re-audit
Owner decision: Approved
Proposal date: 2026-07-19
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-006

Agent: Infrastructure & Device Audit Agent
File: `agents/infrastructure/infrastructure-device-audit-AGENT.md`

Problem/evidence:
The instruction lacks prior-report revalidation and the complete shared report contract, despite
recent changes to Compose, production startup, sender flows, and TTN simulation.

Exact proposed change:
Add the previous infrastructure report to required inputs; add the standard re-audit
finding-status workflow; and require scope/evidence, roadmap impact, assumptions/unknowns,
confidence, and required decisions.

Expected benefit:
Infrastructure and device conclusions will explicitly separate repository evidence from unobserved
provider/device behavior.

Priority: High
Audit-blocking status: Cleared — required before Infrastructure & Device re-audit
Owner decision: Approved
Proposal date: 2026-07-19
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-007

Agent: Dashboard & UX Audit Agent
File: `agents/dashboard/dashboard-ux-audit-AGENT.md`

Problem/evidence:
The instruction lacks prior-report revalidation and the lead-audit shared report fields.

Exact proposed change:
Add the previous dashboard/UX report to required inputs; add the standard re-audit finding-status
workflow; and require scope/evidence, roadmap impact, assumptions/unknowns, confidence, and
required decisions.

Expected benefit:
UX findings will distinguish recently delivered public feedback behavior from unresolved
operational-visibility and administration gaps.

Priority: Medium
Audit-blocking status: Cleared — required before Dashboard & UX re-audit
Owner decision: Approved
Proposal date: 2026-07-19
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-008

Agent: Security, DevOps & Observability Audit Agent
File: `agents/security/security-devops-observability-audit-AGENT.md`

Problem/evidence:
The instruction lacks prior-report revalidation and the lead-audit shared report fields, even
though sender authentication and production configuration changed after the prior audit.

Exact proposed change:
Add the previous security report to required inputs; add the standard re-audit finding-status
workflow; and require scope/evidence, roadmap impact, assumptions/unknowns, confidence, and
required decisions.

Expected benefit:
Security and operability conclusions will revalidate changed trust boundaries rather than treating
historical Critical findings as current truth.

Priority: High
Audit-blocking status: Cleared — required before Security/DevOps/Observability re-audit
Owner decision: Approved
Proposal date: 2026-07-19
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-009

Agent: Production Readiness Audit Agent
File: `agents/production/production-readiness-audit-AGENT.md`

Problem/evidence:
The synthesis contract checks report existence but does not require confirmation that source audits
were re-audited and validated after material repository changes.

Exact proposed change:
Require an input-freshness table containing each source report's last-reviewed date and validation
state; stop the synthesis when required domain reports are stale or unvalidated; and include
confidence, assumptions/unknowns, roadmap impact, and pending decisions in the final determination.

Expected benefit:
Production readiness will not make a go/no-go determination from historically available but stale
evidence.

Priority: High
Audit-blocking status: Cleared — required before Production Readiness re-audit
Owner decision: Approved
Proposal date: 2026-07-19
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-010

Agent: Master Refactoring Roadmap Agent
File: `agents/roadmap/master-refactoring-roadmap-AGENT.md`

Problem/evidence:
The instruction does not require the Decision Queue as an input or require rejection of stale,
unvalidated audit evidence; the current roadmap also contains a T6/T16 dependency cycle.

Exact proposed change:
Add `docs/decision-queue.md` and validated audit-record status as required inputs; prohibit roadmap
changes based on stale/unvalidated reports or unapproved decisions; require an explicit dependency-
cycle check; and record roadmap impact, assumptions/unknowns, confidence, and deferred decisions.

Expected benefit:
The roadmap will reflect verified findings and owner decisions, with blocked work and sequencing
conflicts visible before implementation begins.

Priority: High
Audit-blocking status: Cleared — required before Roadmap revalidation
Owner decision: Approved
Proposal date: 2026-07-19
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-001

Agent: Backend Audit Agent
File: `agents/backend/AGENT.md`

Problem/evidence:
The agent did not require comparison of the previous backend audit against current code, so resolved findings could be carried forward without revalidation.

Exact proposed change:
Add a re-audit workflow and finding-status classification.

Expected benefit:
Backend re-audits explicitly revalidate prior findings and distinguish resolved, still-present, and newly discovered issues.

Priority: High
Audit-blocking status: Cleared — required before backend re-audit
Owner decision: Approved
Approval date: 2026-07-19
Applied date: 2026-07-19

---

### AC-011

Agent: Cross-level agent and project-skill workflow
Files: `AGENTS.md`, `.agents/skills/*/SKILL.md`, `agents/`, `skills/`, `scripts/agy-worker.sh`,
`scripts/ci-checks.sh`, and workflow coordination documents under `docs/`

Problem/evidence:
The 2026-07-22 skill refactor introduced concise role separation but left project skills
undiscoverable to Codex, mismatched the roadmap section/task schema, allowed contradictory
specialist and shared-state ownership rules, relied on prompt-only worker scope enforcement,
included an ambient `prisma migrate deploy` verification command, and left audit/roadmap status
documents pointing to superseded task IDs and T1 as the next task after T1–T5 completed.

Exact approved change:
Add a root agent router and Codex discovery bridges; define one predecessor/freshness/ownership
contract; allow multiple specialists with one focused question each; use immutable task-keyed
specialist briefs; require exact-path task specs; isolate Antigravity execution in a sandboxed
temporary worktree and import only validated patches; gate stateful verification; normalize roadmap
task metadata; reconcile stale audit/decision/roadmap state; and add automated workflow validation.

Expected benefit:
Agent activation becomes discoverable, audit freshness and shared-state writes become deterministic,
cross-domain consultation no longer conflicts, worker scope breaches cannot overwrite the user's
worktree, and roadmap handoffs reflect current evidence.

Priority: Critical
Audit-blocking status: Cleared — required before unattended agent workflow use
Owner decision: Approved explicitly in the 2026-07-22 user request to fix every listed issue
Proposal date: 2026-07-22
Approval date: 2026-07-22
Applied date: 2026-07-22
Verification: All 14 canonical/bridge skill directories passed `quick_validate.py`; shell syntax and
`git diff --check` passed; the agent workflow validator passed for 7 skills and 15 roadmap tasks;
and `bash scripts/ci-checks.sh` passed backend tests/build, Prisma validation, frontend lint/build,
Compose validation, redaction checks, and workflow validation on 2026-07-22.

---

### AC-012

Agent: Simplified three-level agent architecture
Files: `AGENTS.md`, `agents/`, `.agents/skills/`, `README.md`,
`docs/project-knowledge-base.md`, `docs/audits/specialized/README.md`, and
`scripts/validate-agent-workflow.js`

Problem/evidence:
AC-011 restored safety but kept 26 agent instruction files, 7 canonical skills under `skills/`, and
7 discovery bridges under `.agents/skills/`. Codex discovers repository skills directly from
`.agents/skills`; duplicate canonical/bridge layers increased navigation cost and drift risk without
adding capability.

Exact approved change:
Replace the distributed contracts with exactly three role files (`level-1-audit`,
`level-2-specialist`, `level-3-refactor`) and exactly three repo skills (`tram-audit-workflow`,
`tram-specialist-consultation`, `tram-refactoring-workflow`). Move all canonical skill content into
`.agents/skills`, remove the root `skills/` mirror and obsolete agent files, update active path
references, preserve AC-011 safety/freshness/ownership rules, and make the validator enforce the
three-by-three architecture.

Expected benefit:
The active instruction surface becomes discoverable from one router, one role per level, and one
workflow per level while retaining audit evidence gates, focused specialist decisions, exact task
scope, isolated worker execution, stateful-check gating, and audit-staleness synchronization.

Priority: High
Audit-blocking status: Cleared — simplification requested before further agent workflow use
Owner decision: Approved explicitly in the 2026-07-22 user request to redesign and consolidate the workflow
Proposal date: 2026-07-22
Approval date: 2026-07-22
Applied date: 2026-07-22
Verification: All three skills passed `quick_validate.py`; the workflow validator passed exactly
3 agents, 3 skills, and 15 roadmap tasks; `git diff --check` and shell syntax passed; read-only
forward tests correctly selected Discovery as the next audit and blocked T6 on stale audits,
missing specialist briefs, and missing exact-path task spec; and `bash scripts/ci-checks.sh` passed
backend tests/build, Prisma validation, frontend lint/build, Compose validation, redaction checks,
and workflow validation on 2026-07-22.

---

### AC-013

Agent: Domain playbooks and three-device research scope
Files: `agents/level-1-audit/AGENT.md`, `agents/level-2-specialist/AGENT.md`,
`.agents/skills/tram-audit-workflow/`, `.agents/skills/tram-specialist-consultation/`,
`docs/research/device-comparison-scope.md`, `docs/decision-queue.md`,
`docs/roadmap/master-refactoring-roadmap.md`, `README.md`, and
`scripts/validate-agent-workflow.js`

Problem/evidence:
The three-contract architecture removed duplication but left Level 1 domain depth and Level 2
research methodology too implicit. D-002 approved bounded comparison of three senders, while the
repository lacked durable definitions for the three physical transport boundaries, Dev Dashboard
scope, route-distance limitations, current primary-source research, and on-demand audit/specialist
knowledge.

Exact approved change:
Keep exactly one contract per level and add one-level `references/` playbooks: nine audit playbooks
for Level 1 and ten focused specialist playbooks for Level 2. Record Mobile/Socket.IO,
ESP32+GPS/Wi-Fi/HTTP, and separate LoRaWAN/Gateway/TTN/Webhook as the three research sources; define
the initial authenticated Dev Dashboard; distinguish route conformance, reported uncertainty,
pairwise disagreement, and measured ground-truth error; require primary-source/version/evidence
metadata for current research; and validate the complete reference inventory automatically.

Expected benefit:
Agents retain a small always-loaded surface while gaining repeatable product, device, telemetry,
security, field-test, data, and visualization depth. Research recommendations become traceable and
the future implementation cannot silently overstate route proximity or device-reported accuracy as
absolute GPS accuracy.

Priority: High
Audit-blocking status: Cleared — required before relying on the consolidated agents for re-audit or
device-comparison design
Owner decision: Approved explicitly in the 2026-07-22 clarification of the three devices and Dev
Dashboard scope
Proposal date: 2026-07-22
Approval date: 2026-07-22
Applied date: 2026-07-22
Verification: All three skills passed `quick_validate.py`; the workflow validator passed exactly 3
agents, 3 skills, 9 Level 1 references, 10 Level 2 references, and 15 roadmap tasks; `git diff
--check` and shell syntax passed. Read-only forward tests selected only the Database audit playbook
to identify the current raw-telemetry and predecessor blockers, and selected Product/Research as
primary plus Telemetry/Geospatial as the inseparable supporting playbook to produce a correct T7
accuracy contract. The latter also detected the current TTN `accuracy ?? hdop` semantic risk. No
forward-test files or external systems were modified.

---

## Rejected Changes

## Postponed Changes
