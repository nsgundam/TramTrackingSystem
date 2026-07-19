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

## Rejected Changes

## Postponed Changes
