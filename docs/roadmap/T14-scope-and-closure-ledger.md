# T14 Scope, Research, and Closure Ledger

This is the canonical T14 slice, research-input, and eventual closure-detail record. The
`master-refactoring-roadmap.md` remains the repository-wide ordering authority; this ledger owns
T14's detailed inventory and its single `Next action`. Individual task files and Git commits remain
the immutable implementation evidence.

## 1. Current Snapshot

| Item | Current value |
|---|---|
| Research evidence baseline | `0d985d8948624cb2134a937ce57f071b53bb1852` |
| Application-source baseline | `5955b7aa2a84cc52cc536cc6509219a2adcb577c` |
| Latest T14 Level 1 acceptance | `c2dbe9851063a47bcdd89b1f77b4ded7e835c190` with final coordination synchronization |
| Accepted source slices | 13: `T14-S01` through `T14-S11`, `T14-S13`, and `T14-S15` |
| Removed registered slice | `T14-S12` — OSM work owner-cancelled on 2026-08-12; underlying provider risk remains outside T14 |
| Moved registered slice | `T14-S14` — optional Public Feedback vehicle association moved outside T14 on 2026-08-12 |
| Approved registered slices | `T14-S15` Admin mutation integrity is Accepted; `T14-S16` Admin timestamp contract and `T14-S17` Public stop-image resilience await their ordered exact handoffs |
| Active source slice | None |
| Technical score | 15/20 health signal; its P1 belongs to T15 and does not imply seven T14 tasks |
| Release state | Production `No-Go`; controlled local demonstration is Conditional only |
| Research state | R0–R10 complete; Plan v1 approved; S12 Removed, S14 Moved, S15–S17 ordered; separate safety/Roadmap/evidence lanes retained |
| Next action | Execute `M-20260812-02` as an in-place repair of this Git branch's migration source; production never ran it, while other target history remains unknown and no execution is authorized. Then execute `M-20260813-01` for ADMIN active Feedback read-only access; only then open S16 because M-20260813-01 and S16 overlap Feedback source/tests. |

The stable ID is an identity, not an acceptance counter. `T14-S12` remains S12 even though S13 was
accepted first. Never describe the accepted set as “the first twelve.”

## 2. Authority and Scope Boundary

T14 owns bounded frontend/dashboard UX, accessibility, map maintainability, responsive/performance
quality, and behavior-preserving frontend implementation integrity after T8. It may preserve or
improve Admin UX under the bright-neutral Signal Lens direction. It may not silently absorb:

- Public visual redesign or a Public-visible delta without Public-UI authority;
- T11 sender enrollment, trip history, timeout exceptions, Mobile claim/recovery, or Android proof;
- T13 deployment/recovery/monitoring execution or T15 physical/research-provider work;
- D-012 account, credential, deletion, backup, and recovery implementation;
- backend/API/schema/auth policy, a provider/licence choice, or external target work without a new
  exact handoff and the required owner/dependency gates.

## 3. Slice State Model

Normal progression:

`Candidate → Proposed → Ready → Active → Source Complete → Accepted`

Terminal alternatives are `Deferred`, `Removed`, and `Moved`.

- `Blocked` is a gate qualifier, not a lifecycle state.
- `Needs Re-audit` is audit/Roadmap freshness, not a slice state.
- `Accepted` requires the full evidence chain: committed exact handoff, source, completion record,
  and ordered Level 1 acceptance.
- `Deferred` is terminal for the current technical-closure decision only when the owner explicitly
  accepts the deferral; it does not resolve the underlying finding.

## 4. What Makes One Slice Pass

Every source slice must satisfy all of these conditions:

1. Its outcome, non-goals, exact write paths, dependencies, owner decisions, and stop conditions are
   committed before source work.
2. The cheapest deterministic measurement fails against the incumbent defect or duplication before
   production source changes.
3. The focused measurement passes after implementation and covers changed failure/boundary paths.
4. Relevant Public, Admin, Login, API/payload, accessibility, responsive, and behavior-preservation
   regressions pass in proportion to the change.
5. Required lint, strict build, repository CI, workflow validation, `git diff --check`, and scoped
   frontend detector/visual review pass when applicable.
6. The resulting diff stays inside the allowlist and does not overlap another active slice or
   bypass an owner/dependency gate.
7. Level 3 records completion and marks affected reports `Needs Re-audit`; Level 1 then inspects the
   immutable delta and accepts or rejects it. Level 3 cannot self-accept a slice.

## 5. Registered Slice Inventory

`H/S/C/R` means handoff, application source, Level 3 completion, and Level 1 re-audit acceptance.
Coordination-only evidence is deliberately outside that chain: S12 was deferred at `5eb266f`, and
S14's pending proposal/decision gate was recorded at `9ff7e85` without creating a task or handoff.

| ID | Outcome / owned boundary | Class | State | Task | Immutable evidence `H / S / C / R` | Overlap lock / next action |
|---|---|---|---|---|---|---|
| T14-S01 | Truthful Feedback association and Public/Admin live-state projection | Required | Accepted | `T14-truthful-feedback-and-live-state.md` | `bf69744 / 1b2b6c1 / bd34552 / 44779cd` | Supplied vehicle IDs remain verified/fail closed; S14 may change only whether an ID is mandatory. |
| T14-S02 | Accessible dialogs, forms, focus, navigation, and Mobile Admin sidebar | Required | Accepted | `T14-accessible-dialogs-and-navigation.md` | `4469f79 / 8baa274 / 378818f / 4e63145` | Preserve the shared focus lifecycle and current Public identity. |
| T14-S03 | Measured Public map request, motion, touch, and narrow-screen quality | Required | Accepted | `T14-measured-public-map-quality.md` | `3115c15 / c5b2e69 / 7aae795 / fcff991` | Preserve selected-route budgets, cancellation, reduced motion, and measured geometry. |
| T14-S04 | Contrast and route-color governance | Required | Accepted | `T14-contrast-and-color-governance.md` | `d675965 / 799905f / f42a2bb / 215b885` | Preserve governed colors and >=4.5:1 audited foreground selection. |
| T14-S05 | Admin shell and map-first Dashboard foundation | Required | Accepted | `T14-admin-dashboard-foundation.md` | `d3e16b5 / 9411e36 / 0a0fe58 / 99839c0` | No fabricated T11 alerts, history, or recovery actions. |
| T14-S06 | Public service explanation, Retry, canonical age, and ETA truth | Required | Accepted | `T14-public-service-explanation-and-recovery.md` | `47cb644 / bf80308 / db72310 / cfda928` | Explain only states the client knows; never invent a dependency cause. |
| T14-S07 | Admin Vehicles/Routes/Stops semantic convergence | Required | Accepted | `T14-admin-master-data-theme-convergence.md` | `b4f8341 / 7321a25 / 4e609e3 / 5cd0d9c` | Exact CRUD and route-stop fields/payloads remain authoritative. |
| T14-S08 | Admin Source Health/Feedback operations-support convergence | Required | Accepted | `T14-admin-operations-support-convergence.md` | `365c5fd / 06e0291 / 23b4d6f / 9af2c59` | Preserve T12 role, safe-field, privacy, status, delete, and restore contracts. |
| T14-S09 | Bright-neutral Admin/Login Liquid Glass foundation | Owner-required | Accepted | `T14-admin-liquid-glass-foundation.md` | `c7f696e / c4fdc3a / 2b49fd8 / f526939` | Fixed light white/gray Signal Lens; no automatic dark theme; no Public redesign. |
| T14-S10 | Admin master-data mutation pending/failure/retry/receipt/delete identity | Required | Accepted | `T14-admin-master-data-mutation-feedback.md` | `1c341f7 / 2ddb835→e6a04ad / 8ebdf9a→e5f6422 / 95a8de1` | Repairs remain under S10; exact requests, retained fields, focus, and immutable target IDs stay covered. |
| T14-S11 | Shared browser Socket.IO transport/listener lifecycle ownership | Required | Accepted | `T14-shared-browser-socket-lifecycle.md` | `389437c / 70f42c1 / 535ec73 / fd527ac` | Consumer validation, canonical, hydration, queue, map, Retry, and expiry policy remain separate. |
| T14-S12 | Visible OSM attribution and Standard raster endpoint alignment | Owner-cancelled | Removed | `T14-osm-attribution-and-raster-endpoint-alignment.md` | `45ecc0a / — / — / —` | Owner cancelled OSM work on 2026-08-12. Dormant handoff is closed and grants no future authority. Current provider/licence risk is unresolved outside T14. |
| T14-S13 | Truthful Admin Feedback session hydration and zero premature privileged reads | Required | Accepted | `T14-admin-feedback-session-hydration-truth-state.md` | `4c33cf0 / c72feb9 / 9a9cf5c / a528054` | Owns only unresolved `auth/me` projection/read timing; Login/AuthContext/API/role policy remain unchanged. |
| T14-S14 | Optional Public Feedback vehicle association / general-system Feedback | New Product/Data/Privacy capability | Moved outside T14 | No task | `— / — / — / —` | Owner accepted the move on 2026-08-12. Any later capability requires new roadmap synthesis and must preserve S01 verification. |
| T14-S15 | Admin Feedback note/status and route-order publish mutation integrity | Plan v1 approved | Accepted | `T14-admin-operational-mutation-integrity.md` | `99e67e8 / 5955b7a / caf913d / c2dbe98` | Preserve exact request/status/T10/auth behavior; later ADMIN read-only policy is separate. |
| T14-S16 | Deterministic Admin timestamp presentation contract | Plan v1 approved | Proposed — approved, handoff pending | No task yet | `— / — / — / —` | Execute after S15 due Feedback overlap; approved policy is en-GB, 24-hour Asia/Bangkok with visible ICT and safe fallbacks. |
| T14-S17 | Public stop-image loading/error resilience | Plan v1 approved | Proposed — approved, handoff pending | No task yet | `— / — / — / —` | Execute after S16; Public fallback authority is approved while successful composition and focus behavior remain fixed. |

Accepted slices are closed to opportunistic edits. A repair that preserves the same outcome records a
repair chain under that ID. A materially new outcome requires owner-visible registration first.

## 6. Research-First Planning Gate

The owner clarified on 2026-08-12 that the next objective is not to approve closure. The required
sequence is to research the entire remaining problem space, normalize the findings, and present one
complete implementation plan before any further T14 execution.

The binding planning contract is
[`T14-research-and-execution-plan.md`](T14-research-and-execution-plan.md). It defines the ordered
R0–R10 profile sequence, input set, finding classifications, work-unit contract, completion gate,
and post-approval change control.

Research consequences:

- the previous finite-closure recommendation remains withdrawn;
- R0–R10 are complete in the linked Plan v1; OSM is owner-removed and Plan v1's three remaining work
  outcomes are approved as S15–S17;
- no source may begin before its stable identity and exact-path T14 handoff are committed; and
- later re-audit findings enter change control rather than becoming automatic new slices.

## 7. Research Input Disposition

These IDs remain traceable references only. Full evidence, severity, dependencies, and acceptance
contracts live in Plan v1 Sections 13–16; this table records each C input exactly once.

| Ref | Final primary disposition | Result |
|---|---|---|
| C01 | Approved T14-S15 | Narrowed to Feedback note/status pending/receipt and route-order publish busy/completion; broad live-region work removed. |
| C02 | Approved T14-S17 | Stop-image geometry/load/error resilience under bounded Public fallback authority; no redesign/provider change. |
| C03 | Maintenance | Used external Admin marker; licence/provenance and approved local/code-native asset required. |
| C04 | Maintenance, Public gated | Global Google font used by two Public App Tour glyphs; remove/localize separately. |
| C05 | Approved T14-S16 | en-GB, 24-hour Asia/Bangkok, visible ICT, safe invalid/missing copy, and domain-only Never. |
| C06 | Removed | Shared semantic mutation boundary already exists; page request/DTO ownership is intentional. |
| C07 | External evidence | Human, AT, usability, and device acceptance is not source implementation. |
| C08 | External evidence | Split proxy/load/provider/physical proof among T9/T11/T13/T15 owners. |
| C09 | Other Roadmap — T11 | Sender claim, receipt-time timeout, protected history/exceptions, and recovery. |
| C10 | Other Roadmap — T15 | Research comparison Dashboard and physical/provider evidence. |
| C11 | Other Roadmap — D-012/later | General account/source/deletion/backup/recovery lifecycle. |
| C12 | Maintenance | Optional generated sidecar refresh; no product defect inferred. |
| C13 | Removed | Contradicts approved fixed-light Signal Lens. |
| C14 | Removed with S12 | Duplicate eliminated; owner cancelled OSM work. Current provider/licence risk remains outside T14 and blocks production until separately resolved. |
| C15 | Removed | Unbounded Public redesign/Admin polish has no acceptance contract. |
| C16 | Removed from T14 | Consumer policy separation is intentional; focused Maintenance only if a future contract proves drift. |

S12 (Removed) and S14 (Moved) remain the registered terminal rows in Section 5.
`M-20260812-01`, `M-20260812-02`, and `M-20260813-01` are separate Maintenance units outside T14.
The README credential mismatch, legacy Admin boundary hardening, T10/T12 runtime proof, T13
observability/recovery, and external Mobile/provider/field facts retain their Plan or other-owner
dispositions. None receives a new T14 C or slice ID.

## 8. Research Completion and Future Closure Gate

Research R0–R10 is complete and Plan v1 was approved on 2026-08-12. OSM is owner-removed and assigned
outside this batch; S14 is Moved; S15–S17 are registered in dependency order. No closure claim is
made.

Each selected T14 work unit may begin only after its own committed exact-path task specification.
T14 may later be marked technically `Complete` only when the approved
plan's required units are accepted or explicitly removed/moved/deferred, no slice is Active or
Source Complete, affected audits/Roadmap are validated, and no dependency or authority gate was
bypassed.

Technical T14 closure will still not mean 20/20 UX, Production Readiness, human/AT certification,
deployed acceptance, or completion of T9, T11, T13, or T15. Those remain separate gates.

## 9. No-Surprise and Source-Freeze Rules

- Slice IDs are immutable, never renumbered, and never reused.
- At most one slice may be `Active` after plan approval; currently none is Active.
- Re-audit may discover a finding but cannot assign a stable slice ID, create a handoff, or select
  the next task.
- After Plan v1 approval, source remains frozen per unit until that unit has a committed exact-path
  handoff; at most one slice may be Active.
- A separately user-authorized Maintenance correction follows its own work ID and does not change
  T14 ordering or scope.
- After plan approval, any scope addition requires visible change-control analysis and owner review.
- A regression against an accepted outcome keeps that identity; a materially new outcome is not
  appended to T14 automatically.

## 10. Validation Checklist for This Ledger

- IDs are unique; S12 is excluded from the accepted count.
- At most one row is Active; currently none is Active.
- Every Accepted row has H/S/C/R provenance; non-acceptance coordination commits are kept outside
  those four fields.
- Every Deferred or Removed row has a reason and no live source allowlist.
- Every Proposed row has no source commit; owner approval alone is not source authority without its
  committed exact-path handoff.
- C01 through C16 appear exactly once with evidence-based dispositions; none is a pre-approved task.
- S13 provenance is exactly `4c33cf0 / c72feb9 / 9a9cf5c / a528054`.
- `node scripts/validate-agent-workflow.js` and `git diff --check` pass after synchronization.
- The committed Feedback-role migration remains preserved, is assessed as a High non-T14 blocker,
  and is not silently edited through this ledger.
