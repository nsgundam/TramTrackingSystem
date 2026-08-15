# Documentation Map

This page is the human entry point for repository state. It summarizes where current authority
lives; it does not replace the evidence in audits, task specifications, decisions, or Git.

## Read This First

1. [`audits/README.md`](audits/README.md) — current freshness and validation register.
2. [`audits/lead-audit-summary.md`](audits/lead-audit-summary.md) — current cross-domain status,
   blockers, and next eligible coordination action.
3. [`roadmap/master-refactoring-roadmap.md`](roadmap/master-refactoring-roadmap.md) — repository-wide
   task order, dependency gates, and task status.
4. [`roadmap/T14-research-and-execution-plan.md`](roadmap/T14-research-and-execution-plan.md) — the
   completed research, normalized findings, approved fixes, dependency order, and exact-handoff gate.
5. [`roadmap/T14-scope-and-closure-ledger.md`](roadmap/T14-scope-and-closure-ledger.md) — the detailed
   T14 slice inventory and research-input register.
6. [`decision-queue.md`](decision-queue.md) — owner-controlled policy decisions; Pending items do
   not authorize implementation.

Do not select work from a historical task, specialist brief, audit addendum, or Git commit without
checking the first four records above.

## Current Project Position

| Area | Current state | Meaning |
|---|---|---|
| Production Readiness | `No-Go` | A controlled local demonstration is Conditional only; deployment, operations, Mobile/device, human/assistive-technology, and field evidence remain incomplete. |
| Completed repository work | T1–T8, T10, T12 | Complete only for each recorded source/test or approved disposable-target contract. |
| T9 | Repository-complete; externally incomplete | University Server/Network acceptance is still required. |
| T11 | Blocked | Coordinated Backend/Admin/Mobile lifecycle work and an Android acceptance artifact are missing. |
| T13 | Owner-deferred | Depends on T9 external acceptance and approved target authority. |
| T14 | Plan v1 approved; exact-handoff execution | Accepted IDs are S01–S11 and S13. S12/OSM is Removed, S14 is Moved, and approved S15–S17 run one at a time. |
| T15 | Blocked/deferred | Depends on T13 and physical/provider evidence. |

## T14 in One Page

- T14 already delivered truthful Public/Admin state, accessibility/navigation, measured map
  quality, contrast, Admin hierarchy and operations convergence, Public recovery, the fixed-light
  Signal Lens Admin/Login system, mutation recovery, shared browser Socket.IO mechanics, and
  truthful Admin Feedback session hydration.
- No T14 source slice is active until the first exact-path handoff is committed. The accepted T14
  application baseline remains `c72feb9`.
- S12/OSM is owner-cancelled/Removed and licence/attribution work is left to the Frontend team.
  S14 is Moved outside T14. S15 Admin mutation integrity, S16 Admin timestamp contract, and S17
  Public stop-image resilience are approved in that order.
- Each approved unit still requires a committed exact-path handoff, measurement-first evidence,
  full gates, and Level 1 acceptance before the next unit starts.
- A future regression against an accepted slice keeps that slice ID. A materially new outcome is a
  separate Maintenance or Roadmap decision; it does not extend T14 automatically.

## Document Classes

| Class | Authoritative records | Maintenance rule |
|---|---|---|
| Active coordination | Audit Register, Lead Summary, Decision Queue, Master Roadmap, T14 ledger | Keep concise, current, and explicit about one next action. |
| Current evidence snapshot | Project Knowledge Base and domain/readiness audits | Replace superseded narrative; retain current metadata, findings, analysis, limits, and handoff. |
| Immutable implementation evidence | `tasks/*.md` and Git commits | Keep for exact paths, acceptance, and provenance; do not treat as current work authority. |
| Immutable focused decisions | `audits/specialized/*.md` | Keep versioned briefs; later revisions state exactly what they supersede. |
| External acceptance/research | `operations/`, `research/`, and `testing/` | Separate repository checks from deployed, device, field, or human evidence. |
| Product/design authority | Root `PRODUCT.md` and `DESIGN.md` | Applies only within its stated Public/Admin boundary and approved task scope. |

## Directory Guide

- `audits/`: Discovery/domain/readiness evidence and the current audit register.
- `audits/specialized/`: immutable Level 2 decision briefs.
- `roadmap/`: repository-wide order plus task-specific closure ledgers.
- `tasks/`: exact-path implementation handoffs and completion records, including historical work.
- `operations/`: external deployment and recovery handoffs.
- `research/`: owner-approved research scope and parameters.
- `testing/`: repeatable CI and controlled pipeline evidence.

The root [`AGENTS.md`](../AGENTS.md) defines routing and ownership. Agent workflow changes are
recorded in [`agent-change-queue.md`](agent-change-queue.md).

