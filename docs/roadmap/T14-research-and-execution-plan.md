# T14 Research and Execution Planning Contract

Status: **Ready for Level 1 research; no T14 source implementation is authorized**

Owner direction: on 2026-08-12, research the complete remaining T14 problem space and present one
reviewable execution plan before implementing another T14 slice. Re-audit findings must not become
new work automatically.

## 1. Outcome

Produce one evidence-based, deduplicated, dependency-ordered plan for all remaining work related to
T14. The owner must be able to see the complete proposed scope, exclusions, decisions, risks, and
acceptance evidence before approving any further T14 implementation.

This plan does not assume that every open audit finding belongs in T14. Research must explicitly
separate T14 work from regressions, Maintenance, another Roadmap task, external acceptance, and
owner-controlled decisions.

## 2. Planning Baseline and Freeze

| Item | Planning value |
|---|---|
| Repository coordination baseline at plan creation | `9e944f669e472b1f4958bd97d9f6ac4c690189e5` |
| Accepted T14 application baseline | `c72feb90e7a35da45d82bac61eb927ab7c55a37c` |
| Accepted T14 set | `T14-S01` through `T14-S11` plus `T14-S13` |
| Existing exceptions | S12 Deferred; S14 Proposed/blocked; neither authorizes source work |
| T14 implementation state during research | Frozen |

At the start of the actual research run, Level 1 must record the then-current full Git SHA, dirty
paths, changed evidence since each profile baseline, and excluded user work. The unrelated Feedback
role migration remains preserved and excluded.

## 3. Non-goals

- Do not implement, repair, redesign, or refactor T14 application source during research.
- Do not assign a new stable slice ID or create an implementation handoff from a domain re-audit.
- Do not mark an external, device, provider, human, or deployed unknown as verified from source.
- Do not absorb T9, T11, T13, T15, D-012, Public-UI authority, or provider/licence work into T14.
- Do not treat the earlier finite-closure proposal as approved; closure is evaluated only after the
  complete research and execution plan exist.

The explicitly requested `/admin` entry redirect is tracked separately as
`M-20260812-01`. It is a bounded Maintenance correction, not a T14 slice or evidence that the T14
research is complete.

## 4. Research Inputs

Research must reconcile all of these sources rather than selecting work from one document alone:

- current application/configuration source and deterministic tests;
- `docs/project-knowledge-base.md` and every domain/readiness audit;
- all T14 task specifications and their Git H/S/C/R evidence chains;
- specialist briefs and approved/pending decisions;
- the T14 ledger's registered slices and C01–C16 residual inputs;
- non-T14 Roadmap dependencies T9, T11, T13, and T15;
- operations, research, testing, external-Mobile, physical-device, provider, human, and deployment
  evidence, including explicit evidence that is unavailable.

## 5. Ordered Research Sequence

Each profile is a current-state assessment. Superseded narrative stays in task records and Git, not
as a new chronological appendix in every report.

| Stage | Profile / activity | Required gate | Required output |
|---|---|---|---|
| R0 | Baseline and evidence map | None | Full SHA, dirty-path exclusions, source/doc/test change map, and profile freshness decision. |
| R1 | Discovery | R0 | Complete factual inventory of routes, APIs, schemas, configuration, tests, external boundaries, and missing evidence. |
| R2 | Product | Validated R1 | Required user outcomes, roles/journeys, release-scope gaps, non-goals, and owner decisions. |
| R3 | Architecture | Validated R1–R2 | Boundaries, authoritative state, duplication, dependencies, data flow, and cross-repository constraints. |
| R4 | Backend, Frontend, Database | Validated R1–R3 | Three domain finding sets; they are parallel-eligible but must use the same evidence baseline. |
| R5 | Infrastructure & Device | Validated R4 profiles | Repository/runtime topology, Mobile/ESP32/LoRaWAN separation, physical/provider unknowns, and field gates. |
| R6 | Dashboard & UX | Product, Frontend, Infrastructure & Device validated | Public/Admin/Research journeys, accessibility, responsiveness, performance, truthfulness, and human-evidence gaps. |
| R7 | Security, DevOps & Observability | All preceding domain profiles validated | Trust boundaries, secrets/privacy, logging, CI, operations, recovery, and alert evidence. |
| R8 | Production Readiness | Every domain profile validated | One release-gate assessment; no discovery of a hidden subsystem at this stage. |
| R9 | Finding normalization | R1–R8 validated | One deduplicated finding register with every source finding mapped exactly once. |
| R10 | Execution-plan synthesis | R9 plus resolved owner decisions needed for ordering | Complete proposed work units, dependency graph, acceptance matrix, and owner-review package. |

If a predecessor is stale or blocked, stop at that stage and record the exact missing evidence. Do
not skip forward and do not convert an unknown into a planned implementation assumption.

## 6. Finding Normalization

Every material open finding must receive exactly one classification:

| Classification | Meaning |
|---|---|
| Accepted-outcome regression | The intended behavior already belongs to an accepted slice; repair retains that slice identity. |
| T14 candidate | A genuinely remaining T14 outcome, pending whole-plan review; not yet a slice. |
| Maintenance | A bounded corrective/compatibility/tooling task outside Roadmap ordering. |
| Other Roadmap owner | The work belongs to T9, T11, T13, T15, D-012, or a later synthesized task. |
| External evidence | Deployment, provider, device, human, assistive-technology, field, or operations proof rather than repository source. |
| Owner decision | Product, Public UI, policy, provider/licence, risk, or scope choice that cannot be inferred. |
| Removed / no longer relevant | Duplicate, contradicted, superseded, or unsupported work, with evidence and rationale. |

The normalized record must include origin, current evidence, severity, affected outcome, proposed
classification, dependencies, decision/evidence blockers, and confidence. C01–C16 and S12/S14 are
inputs to this analysis, not pre-approved dispositions.

## 7. Complete Execution-Plan Contract

Before any proposed T14 work can be approved, every work unit in the synthesized plan must state:

1. observable outcome and user/system value;
2. explicit non-goals and ownership boundary;
3. prerequisite work, decisions, and external evidence;
4. candidate exact source/test/document paths with overlap analysis;
5. product, architecture, security/privacy, data/migration, operations, research, and UX impact;
6. cheapest deterministic failing measurement and required regression suites;
7. acceptance criteria, failure paths, stop conditions, and rollback boundary;
8. size/risk estimate and dependency-ordered execution position; and
9. affected audits and evidence required for final acceptance.

Plan items remain proposals. Stable slice IDs and exact-path implementation task specifications are
created only after the owner reviews the complete plan and selects the approved set and order.

## 8. Research Completion Gate

Research is complete only when:

- R1–R8 are validated in predecessor order against recorded compatible baselines;
- every prior finding, open P1/P2/P3 item, S12/S14 question, C01–C16 input, task residual, decision,
  and external unknown is mapped exactly once in the normalized register;
- duplicate or conflicting recommendations are resolved explicitly;
- every proposed work unit satisfies Section 7 and the dependency graph has no cycle or hidden
  owner/external gate;
- release evidence is separated from repository implementation;
- the plan exposes the full proposed set and one recommended order, including items recommended for
  exclusion; and
- the owner approves or revises that full plan before any T14 implementation handoff is created.

## 9. Change Control After Plan Approval

- A re-audit updates evidence and finding state; it does not append a new work unit automatically.
- A regression against an approved/accepted outcome uses that outcome's identity.
- A materially new outcome enters a visible change-request section with impact and dependency
  analysis. The owner decides whether to revise the frozen plan, use Maintenance, or defer it to a
  later Roadmap cycle.
- Implementation re-audits validate only the accepted work unit and do not reopen whole-plan scope
  unless evidence invalidates a dependency or owner decision.

## 10. Owner Review Output

The final review package will contain:

- a one-page current-state summary;
- the deduplicated finding register;
- the complete proposed work-unit table and dependency order;
- owner/external blockers separated from executable repository work;
- recommended inclusions and exclusions with rationale; and
- one explicit approval record for the selected complete plan version.

Until that package exists and is approved, the current next action is **Research R0**, not T14
closure and not another source slice.
