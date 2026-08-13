# Dashboard & UX Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Evidence scope: Public/Admin routes and components under `shuttle-tracking-web/app/` and
  `shuttle-tracking-web/components/`, browser tests under `shuttle-tracking-web/tests/`,
  `DESIGN.md`, `.impeccable/design.json`,
  `docs/tasks/T14-admin-operational-mutation-integrity.md`, `docs/audits/product-audit.md`,
  `docs/audits/frontend-audit.md`, and `docs/audits/infrastructure-device-audit.md`
- Task evidence: `docs/tasks/T14-admin-operational-mutation-integrity.md` at completion record
  `caf913d` over source `5955b7a`
- Reviewed at: `2026-08-13T21:51:09+07:00`
- Validation state: **Validated**
- Re-audit purpose: M-20260812-02 Dashboard & UX compatibility; accepted UI/T14 behavior remains at
  `5955b7a`.
- Predecessor baselines: `docs/audits/product-audit.md`, `docs/audits/frontend-audit.md`, and
  `docs/audits/infrastructure-device-audit.md` (R5), validated in order over `9323afc` while the
  accepted visible application behavior remains `5955b7a`
- Owner-decision overlay: current Plan v1/S14/OSM directions are owner authority, not UI behavior at
  `531ec9e`.
- Bounded delta: `M-20260812-01` is accepted at source commit `cdd69f8`; authenticated `/admin` and
  successful Login land on the incumbent Dashboard while unauthenticated entry remains protected.
  This Maintenance result does not change the accepted T14 application baseline.
- M-02 compatibility: source `71f2002` changes no UI path, copy, role exposure, layout, interaction,
  or browser behavior. The 15/20 score and S16/S17 findings remain unchanged; ADMIN read-only
  Feedback remains separate and unimplemented.

## 1. Audience and information boundary

| Audience | Current surface | Required separation |
|---|---|---|
| Public rider | Canonical route/stops/live state, bounded ETA/recovery explanation, Feedback | No raw source identity, credentials, research comparison, unrestricted history, or Admin actions |
| Admin operations | Dashboard, master data, route ordering, safe Source Health, role-gated Feedback | Server authorization remains authoritative; missing T11 exceptions must not be fabricated |
| Research developer | Protected APIs only | Future T15 route/UI must keep session/provenance/uncertainty/export distinct from daily operations and Public state |

The fixed-light Signal Lens system remains the approved Admin identity. Automatic dark mode and a
general Public redesign are not outstanding quality tasks; they contradict the owner boundary.

S15 at `5955b7a` now provides one-request, named pending, retained failure/retry, and polite
completion behavior for the two residual mutation paths. The UI reuses incumbent Signal Lens
materials and safe feedback semantics; no CSS or visual identity changed. Synthetic evidence covers
keyboard focus, 44 px controls, and 390 px no-overflow. The later ADMIN read-only policy is separate.

## 2. Technical audit score and interpretation

| Dimension | Score | Current limiting evidence |
|---|---:|---|
| Accessibility | 3/4 | S15's exact Feedback/route-order semantics and focus pass; human/AT acceptance remains absent |
| Performance | 3/4 | Map request/motion budgets exist; raw stop images and global/external assets remain |
| Responsive Design | 3/4 | Deterministic 320/390 px journeys exist; representative physical-device/text/human coverage is absent |
| Theming | 3/4 | Coherent fixed-light Admin system exists; the generated design sidecar is stale documentation |
| Implementation Integrity | 3/4 | Product-specific truth and shared mechanics are strong; timestamp policy and external asset ownership remain inconsistent |
| **Total** | **15/20** | **Useful health signal, not a task count or closure counter** |

The prior “one P1, five P2, one P3” aggregate is normalized as follows:

- the P1 missing Research Dashboard belongs to **T15**, not T14;
- P2 repository work is Public stop images, asset dependencies, and timestamp policy; S15 resolved
  the narrow Admin mutation residual, while T11 operations and external acceptance remain separate;
- P3 design-sidecar drift is optional Documentation Maintenance; and
- human, assistive-technology, physical-device, provider, deployed recovery, and load results are
  evidence gates, not source defects.

The required fresh Impeccable detector run returned one advisory on the dotted `map-bg` utility.
Because that utility is used on the actual map canvas, the warning is a verified false positive and
creates no work. The context loader separately reports `.impeccable/design.json` stale relative to
`DESIGN.md`; refresh it only through an explicit documentation Maintenance action.

## 3. Current UX finding register

| Finding | State | Severity / destination |
|---|---|---|
| Feedback note/status PATCH has per-case one-request mutation integrity | Resolved | At `5955b7a` for local/synthetic scope; T14-S15 validated with per-case guard, scoped lock, safe retry, and polite receipt |
| Route-order publish exposes named one-request progress and completion | Resolved | At `5955b7a` for local/synthetic scope; T14-S15 validated with full modal lock, named busy, exact retry, receipt, and focus restoration |
| Public stop thumbnail/modal image has no intrinsic/lazy/decode/error contract | Still Present | P2, reproducible; **Approved T14-S17** within bounded Public authority |
| Public map hides required OSM attribution while using Standard tiles | Still Present | Compliance/policy finding; owner cancelled S12 and **Removed it from T14**; keep a separate pre-production provider/basemap stop condition |
| Admin timestamp locale/time-zone/invalid handling differs by page | Still Present | P2, reproducible; **Approved T14-S16** under the recorded policy |
| Admin marker uses remote Flaticon asset with no local provenance/licence | Still Present | P2 dependency; Maintenance/asset decision |
| Google Material Symbols loads globally for two Public App Tour glyphs | Still Present | P2 dependency/performance; Public-authority-gated Maintenance |
| Research Dashboard absent | Still Present | P1; T15 |
| T11 history/timeout/sender recovery and exception-first operations absent | Still Present | Release-critical; T11 |
| Human/AT/device/deployed UX proof | Unable to Verify | External acceptance |

## 4. Approved T14 UX outcome contracts

### T14-S15 — Admin operational mutation integrity — validated

Outcome met at `5955b7a`: the two non-sensitive mutation paths expose one-request pending, retained
failure/retry, and polite success semantics consistent with the accepted Admin system.

Non-goals: no endpoint/payload/status graph, sensitive delete/restore, T10 order rule, role,
authorization, schema, CSS identity, Public, Login, or backend change.

Evidence: held PATCH/PUT measurements failed before source and pass after repair. Full Admin
operations 7/7, master data 8/8, accessibility 4/4, Liquid Glass/Login 5/5, Dashboard 2/2, detector
`[]`, lint/build, and full repository CI pass.

### T14-S17 — Public stop-image resilience

Outcome: successful images keep the incumbent composition while reserved geometry, thumbnail load/
decode policy, and a named 404 fallback avoid broken-image UI and unstable interaction.

Non-goals: no image provider/storage/API, stop data, map, ETA, copy hierarchy, modal focus contract,
or Public redesign. Public authority is required for the visible fallback.

First measurement: intercept the image with success and 404 fixtures at 320/390 widths; assert
stable card geometry, fallback semantics, no broken dialog, and preserved focus/Escape/restoration.

### T14-S16 — Admin timestamp contract

Outcome: Dashboard, Source Health, and Feedback use one typed presentation rule for valid, missing,
offset, and invalid timestamps without changing stored/server time semantics.

Non-goals: no schema/API/retention/deadline change. The owner-approved policy is `en-GB`, 24-hour
`Asia/Bangkok`, visible `ICT`, `Unavailable` for missing/malformed values, and `Never` only for a
domain-confirmed never-seen source. A committed exact handoff and pure formatter fixtures precede
browser regression.

### S12 — removed by owner

The owner cancelled OSM work on 2026-08-12. The dormant handoff is closed and no T14 implementation
is recommended. This does not resolve the current provider/licence exposure because application
source is unchanged; before production, a separate decision must remove that basemap/provider from
runtime or authorize a compliant outcome.

## 5. Evidence limits and handoff

No human usability, assistive-technology, physical device, provider, deployed proxy, ambient
network, load, or production session was performed. Confidence is High for source-visible
residuals and audience boundaries, Medium for the completed isolated browser outcomes, and Low for
external acceptance. This report validates M-02 Dashboard/UX compatibility while retaining S15's
local acceptance; M-20260813-01 remains next, and S16/S17 still require ordered handoffs. No new
owner decision is required for M-02 source acceptance.
