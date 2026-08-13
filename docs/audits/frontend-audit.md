# Frontend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Evidence scope: `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`,
  `shuttle-tracking-web/config/`, `shuttle-tracking-web/contexts/`, `shuttle-tracking-web/hooks/`,
  `shuttle-tracking-web/services/`, `shuttle-tracking-web/tests/`, and the R1–R3 predecessor reports
- Reviewed at: `2026-08-13T21:51:09+07:00`
- Validation state: **Validated**
- Re-audit purpose: M-20260812-02 Frontend compatibility; accepted frontend/T14 behavior remains at
  `5955b7a`.
- Predecessor baselines: `docs/project-knowledge-base.md` (R1),
  `docs/audits/product-audit.md` (R2), and `docs/audits/architecture-audit.md` (R3), each validated
  over `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Owner-decision overlay: current Plan v1/S14/OSM directions are owner authority, not frontend
  behavior at `531ec9e`.
- Bounded delta: `M-20260812-01` source commit `cdd69f8` adds only the canonical `/admin` redirect,
  its deterministic journey, and isolated Playwright build-cache configuration. It is accepted as
  Maintenance evidence and does not change the accepted T14 application baseline.
- M-02 compatibility: source `71f2002` changes only backend SQL and the shared T12 identity test;
  no web path or behavior changes. ADMIN read-only Feedback remains unimplemented and separate.

## 1. Current frontend state

The Public tracker and Admin workspace preserve separate visual/product authority while sharing only
bounded infrastructure where policy is identical. Accepted T14 work now covers canonical truth,
Public recovery explanations, focus/dialog semantics, contrast, measured map motion/requests,
responsive Admin hierarchy, mutation feedback, shared browser Socket.IO mechanics, and truthful
Feedback session hydration.

No accepted T14 regression was found. The prior direct `/admin` 404 is resolved by Maintenance
`M-20260812-01`: source commit `cdd69f8` adds a same-origin server redirect to `/admin/dashboard`
while unauthenticated navigation remains protected. The accepted T14 baseline and identity remain
unchanged.

S15 source `5955b7a` is frontend-validated. Ref-backed guards are acquired before async work;
Feedback locks only the active case while route publish locks every modal mutation/close path.
Errors reuse the safe opaque feedback primitive, receipts survive reload, and the route refresh
keeps the invoker connected for focus restoration. Exact five-path allowlist, detector `[]`, lint,
build, focused suites, and full CI pass. The later ADMIN read-only policy remains a separate unit.

## 2. Verified residual source findings

| Ref | State | Current evidence / disposition |
|---|---|---|
| C01 — broad live-region inconsistency | Resolved | At `5955b7a`, no broader shared-state defect was established; T14-S15 validates one-request pending, retained retry, named completion, focus, and 390 px behavior. |
| C02 — Public stop images | Still Present | `StopInfoCard.tsx` lacks intrinsic dimensions, loading/decoding policy, and `onError`; **Approved T14-S17** within granted Public fallback authority. |
| C03 — Admin vehicle icon | Still Present | `LiveMap.tsx` uses a live Flaticon CDN URL without a local licence/provenance artifact; use a bounded Maintenance/asset decision and do not copy the file without licence evidence. |
| C04 — global Material Symbols | Still Present | Root `app/layout.tsx` loads a Google font for two `AppTour.tsx` glyphs; Public-authority-gated Maintenance may replace it with the local icon system after usage tests. |
| C05 — timestamp policy | Still Present | Dashboard and the two operational pages differ and do not consistently guard invalid values; **Approved T14-S16** under the en-GB/Asia-Bangkok/ICT policy. |
| C06 — generic mutation state machine | No Longer Relevant | Shared semantic feedback exists while pages intentionally own requests, DTOs, targets, refresh, and pending state; no harmful duplication was measured. |
| C12 — design sidecar | Still Present | Impeccable reports `.impeccable/design.json` older than `DESIGN.md`; Documentation Maintenance only, with no UI defect inferred. |
| C14/S12 — OSM | Still Present | Public still uses the provider while hiding attribution, but the owner removed S12 from T14; provider/basemap risk remains a separate pre-production decision. |
| C16 — shared canonical decoder | No Longer Relevant | Public and Admin intentionally retain consumer-specific validation/canonical/UI rules; reopen only for a concrete drift/regression. |

Additional source facts:

- the Public map's dotted `map-bg` utility triggered one Impeccable detector advisory for a generic
  grid background; inspection confirms it is used on the actual map canvas, so this is a false
  positive and not a work item;
- no automatic dark Admin theme is allowed by the fixed-light Signal Lens decision;
- a broad Public redesign and unlimited polish remain outside T14; and
- Research UI, T11 operations, D-012 lifecycle controls, deployment, devices, and human/AT proof
  cannot be repaired inside frontend T14 residual work.

## 3. Approved-outcome measurements and paths

### T14-S15 — Admin operational mutation integrity — validated

- Source/test commit: `5955b7a`, five exact paths recorded in the task handoff.
- Measurement-first: both held-request journeys failed before source on duplicate requests plus
  missing busy/completion/focus semantics, then passed after repair.
- Result: exact PATCH/PUT payloads, status graph, route order, note clearing only after success,
  sensitive delete/restore re-authentication, roles, focus, 44 px, and 390 px behavior pass.

### T14-S17 — Public stop-image resilience

- Planned source: `shuttle-tracking-web/components/public/StopInfoCard.tsx`; scoped styling only if
  measurement proves it necessary.
- Planned tests: a focused static contract plus the existing T14 map-quality/accessibility browser
  suites.
- First failing evidence: assert both image states have deterministic intrinsic/aspect-ratio
  reservation, the thumbnail is lazy/async decoded, and a failed remote image yields a named stable
  fallback without opening a broken-image dialog.
- Preserve: stop selection, text/ETA, dialog focus/Escape/restoration, Public identity, map geometry,
  API data, and successful-image expansion.

### T14-S16 — Timestamp presentation

- Planned source: one typed formatting utility plus Dashboard, Source Health, and Feedback
  consumers; no API/schema change.
- Planned tests: pure valid/invalid/offset fixtures plus existing Admin browser regressions.
- Required decision: locale, fixed `Asia/Bangkok` versus viewer zone, whether to show the zone, and
  the exact invalid/missing label.
- Preserve: stored timestamps, server receipt-time semantics, status/retention deadlines, and
  authorization.

### OSM alignment — removed from T14

The owner cancelled S12 on 2026-08-12. Its dormant handoff is closed and cannot be reactivated as
implicit authority. The decision changes no source, so the current provider/licence exposure is
not resolved; before production, separately remove that basemap/provider from runtime or authorize
a compliant provider/licence outcome.

## 4. Technical quality evidence

The current documented technical score remains **15/20** for continuity; it must not be converted
into a closure counter. Its sole open P1 is the missing Research Dashboard owned by T15. Current
open counts are 0 P0 / 1 P1 / 4 P2 / 1 P3 after C01 resolution. Remaining P2/P3 observations
decompose into the approved stop-image outcome, external assets/Maintenance, timestamp policy, and
optional sidecar documentation. The S15 re-audit independently reran both focused tests and the
detector, and recorded regressions/full CI passed. The current M-02 compatibility re-audit changes no
web source and ran no human/AT/device/deployed session.

## 5. Confidence and handoff

Confidence is High for exact source locations and retained S15 local invariants; Medium for
synthetic accessibility impact; and Low for real-device, assistive-technology, deployed/provider,
and human outcomes. This report validates M-02 Frontend compatibility because no web path changed;
it does not authorize or accept the separate ADMIN read-only policy implementation.
