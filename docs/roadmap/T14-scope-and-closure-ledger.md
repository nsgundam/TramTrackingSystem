# T14 Scope and Closure Ledger

This is the canonical T14 slice, candidate, and closure-detail record. The
`master-refactoring-roadmap.md` remains the repository-wide ordering authority; this ledger owns
T14's detailed inventory and its single `Next action`. Individual task files and Git commits remain
the immutable implementation evidence.

## 1. Current Snapshot

| Item | Current value |
|---|---|
| Application-source baseline | `c72feb90e7a35da45d82bac61eb927ab7c55a37c` |
| Latest T14 Level 1 acceptance | `a5280542be9628e08174892f9546ecf7bb64858e` |
| Accepted source slices | 12: `T14-S01` through `T14-S11` plus `T14-S13` |
| Deferred registered slice | `T14-S12` — OSM visible attribution/endpoint alignment; Public-UI authority gate |
| Proposed registered slice | `T14-S14` — optional Public Feedback vehicle association; owner disposition pending |
| Active source slice | None |
| Technical score | 15/20; 0 P0, 1 P1, 5 P2, and 1 P3 open |
| Release state | Production `No-Go`; controlled local demonstration is Conditional only |
| Next action | Owner approves or revises the finite closure package in Sections 6–7; T14 source work is frozen until that one review |

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
| T14-S12 | Visible OSM attribution and Standard raster endpoint alignment | Owner-deferred | Deferred — blocked | `T14-osm-attribution-and-raster-endpoint-alignment.md` | `45ecc0a / — / — / —` | Deferral coordination: `5eb266f`. Public team has not authorized the visible credit; no source allowlist is live and no zero-credit/provider alternative is selected. |
| T14-S13 | Truthful Admin Feedback session hydration and zero premature privileged reads | Required | Accepted | `T14-admin-feedback-session-hydration-truth-state.md` | `4c33cf0 / c72feb9 / 9a9cf5c / a528054` | Owns only unresolved `auth/me` projection/read timing; Login/AuthContext/API/role policy remain unchanged. |
| T14-S14 | Optional Public Feedback vehicle association / general-system Feedback | Owner classification pending | Proposed — blocked | No task | `— / — / — / —` | Proposal gate: `9ff7e85`. No write authority. Must preserve S01 verification for every supplied ID and must not silently downgrade vehicle intent. |

Accepted slices are closed to opportunistic edits. A repair that preserves the same outcome records a
repair chain under that ID. A materially new outcome requires owner-visible registration first.

## 6. Finite Closure Decision

The recommended owner decision is one package, not sixteen independent task selections:

1. Close T14 with **no additional source slice** after the already accepted set.
2. Keep S12 `Deferred`. It may reopen under the same ID only if the Public UI team authorizes the
   required visible OSM credit or an approved provider/licence decision replaces the current gate.
3. Mark S14 `Moved` to a separately reviewed future Public Feedback task. Do not choose its data/UI
   model inside T14.
4. Approve the terminal candidate dispositions in Section 7.

This package preserves every open finding and release gate; it only stops those items from extending
T14. Approval authorizes Level 1 documentation synchronization, not application source work.

If the owner wants to override the recommendation, only these two product choices need separate
answers:

| Item | A | B | C |
|---|---|---|---|
| S12 map attribution | Keep Deferred (recommended) | Authorize minimal linked `OpenStreetMap` credit and no Leaflet prefix | Require a new provider/licence decision; current Standard tiles cannot be used without credit |
| S14 Feedback association | Move/defer (recommended) | Authorize simple nullable vehicle association | Authorize explicit `subjectScope: system \| vehicle` with schema/API work |

For either S14 implementation option, vehicle-specific intent must still fail closed: a missing or
unknown vehicle ID may never become general Feedback automatically. Public form changes require
Public-UI authority and a new exact handoff.

## 7. Candidate Closure Package

Candidate IDs are review references only. The dispositions become terminal for T14 only when the
owner approves the package; they create no task or source authority.

| Ref | Residual item | Proposed terminal disposition | Where it belongs if later authorized |
|---|---|---|---|
| C01 | Remaining Admin async/live-region consistency | `Moved` | Fresh Maintenance intake after a measured defect or explicit accessibility request |
| C02 | Public stop-image sizing/lazy/error behavior | `Moved` | Public UI team |
| C03 | Admin remote icon/asset localization and licence hardening | `Moved` | Separate Admin maintenance after asset/licence selection |
| C04 | Public/global Material Symbols and asset-origin policy | `Moved` | Public UI team |
| C05 | Admin timestamp locale/time-zone/invalid-date policy | `Moved` | Decision-led Maintenance |
| C06 | Page-local mutation state-machine refactor | `Removed` | Reopen only from a deterministic defect or measured material duplication |
| C07 | Human, assistive-technology, usability, and device acceptance | `Moved` | Release-evidence plan; not a repository source slice |
| C08 | Proxy, reconnect/load/provider, and physical-device evidence | `Moved` | T9/T11/T13/T15 external acceptance |
| C09 | Sender claim, timeout, history, and recovery UI | `Moved` | T11 |
| C10 | Research/Dev comparison Dashboard | `Moved` | T13/T15 after research/runtime/physical gates |
| C11 | Account/Sender/deletion/backup lifecycle controls | `Moved` | Later D-012 implementation task |
| C12 | Design sidecar refresh | `Moved` | Optional documentation Maintenance |
| C13 | Automatic dark Admin theme | `Removed` | Conflicts with the approved fixed-light direction |
| C14 | OSM attribution/endpoint work | `Removed as duplicate` | Existing S12 only |
| C15 | General Public redesign or unbounded Admin polish | `Removed` | Requires a new owner-approved outcome, not T14 |
| C16 | Shared Public/Admin canonical decoder refactor | `Removed` | New Maintenance only if a measured policy-preserving defect exists |

No candidate in this package is `Required` for T14 technical closure. Moved items retain their
finding/evidence status and must pass the destination lane's normal gates if selected later.

## 8. T14 Technical Closure Contract

T14 may be marked technically `Complete` only when all conditions below are true:

- every registered slice is `Accepted`, `Deferred`, `Removed`, or `Moved`;
- the owner has approved or revised the finite closure package, every candidate has a terminal
  classification, and every item classified `Required` is accepted;
- no slice is `Active` or `Source Complete`, no unclassified candidate remains, and no affected
  audit/Roadmap row is `Needs Re-audit`;
- S14 has an explicit owner disposition: approve, defer, remove, or move;
- the latest application-source baseline is accepted by the complete ordered Level 1 chain;
- the Audit Register and Master Roadmap are `Complete / Validated` at that baseline;
- the latest application delta retains current focused, regression, full-CI, workflow, and diff
  evidence required by its contract; and
- no dependency, owner decision, Public-UI authority, or external-target gate was bypassed.

Technical T14 closure does **not** mean 20/20 UX, Production Readiness, human/AT certification,
deployed acceptance, or completion of T9, T11, T13, or T15. Those are separate release gates.

## 9. No-Surprise and Source-Freeze Rules

- Slice IDs are immutable, never renumbered, and never reused.
- At most one slice may be `Active`.
- Before closure, a candidate cannot become a slice until this ledger and the Master Roadmap expose
  the intended classification and a committed exact-path task passes all gates.
- Re-audit may discover a candidate but cannot silently create or start the next slice.
- The ledger alone owns T14's `Next action`; task files own only their bounded implementation.
- No repair expands paths or outcome without a revised reviewed contract.
- Further T14 application source is frozen until the owner approves or revises the finite closure
  package. After closure, no new candidate may be appended to T14: regressions reuse the affected
  accepted slice ID, while materially new outcomes enter Maintenance or a later Roadmap synthesis.

## 10. Validation Checklist for This Ledger

- IDs are unique; S12 is excluded from the accepted count.
- At most one row is Active; currently there is none.
- Every Accepted row has H/S/C/R provenance; non-acceptance coordination commits are kept outside
  those four fields.
- Every Deferred row has a reason and no live source allowlist.
- Every Proposed row has no source commit or source authority.
- C01 through C16 appear exactly once in the closure package; none is silently `Required`.
- S13 provenance is exactly `4c33cf0 / c72feb9 / 9a9cf5c / a528054`.
- `node scripts/validate-agent-workflow.js` and `git diff --check` pass after synchronization.
- The unrelated Feedback-role migration remains preserved and excluded.
