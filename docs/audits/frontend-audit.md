# Frontend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Accepted T14 application baseline: `c72feb90e7a35da45d82bac61eb927ab7c55a37c`
- Evidence scope: `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`,
  `shuttle-tracking-web/config/`, `shuttle-tracking-web/contexts/`, `shuttle-tracking-web/hooks/`,
  `shuttle-tracking-web/services/`, `shuttle-tracking-web/tests/`, and the R1–R3 predecessor reports
- Reviewed at: `2026-08-12T23:15:48+07:00`
- Validation state: **Validated for T14 Research R4**
- Predecessor baselines: `docs/project-knowledge-base.md` (R1),
  `docs/audits/product-audit.md` (R2), and `docs/audits/architecture-audit.md` (R3), each validated
  over `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Owner-decision overlay: current Plan v1/S14/OSM directions are owner authority, not frontend
  behavior at `531ec9e`.
- Bounded delta: `M-20260812-01` source commit `cdd69f8` adds only the canonical `/admin` redirect,
  its deterministic journey, and isolated Playwright build-cache configuration. It is accepted as
  Maintenance evidence and does not change the accepted T14 application baseline.

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

## 2. Verified residual source findings

| Ref | Current source evidence | Disposition |
|---|---|---|
| C01 — broad live-region inconsistency | Most shared loading/error/success states are semantic. Two exact residuals remain: non-sensitive Feedback note/status updates have no per-case pending lock or success receipt and can invoke repeated PATCH requests; route-order publish disables visually but does not expose a named busy/completion state. | **Approved T14-S15** for those operations only; remove the broader “all live regions” formulation. |
| C02 — Public stop images | `StopInfoCard.tsx` renders thumbnail and modal raw `<img>` elements without intrinsic dimensions, `loading`, `decoding`, or an `onError` fallback. | **Approved T14-S17** within the granted Public fallback authority. |
| C03 — Admin vehicle icon | `LiveMap.tsx` uses a live Flaticon CDN URL for every vehicle marker; no local licence/provenance artifact exists. | **Maintenance/asset decision**. Do not copy the file without licence evidence; prefer an approved local/code-native marker. |
| C04 — global Material Symbols | Root `app/layout.tsx` loads a Google font globally; only `AppTour.tsx` uses two glyphs. The tour is mounted dynamically by `ShuttleTracker`. | **Maintenance**, Public-authority gated if icon presentation changes. Replace with the existing local icon system or remove the dependency after usage tests. |
| C05 — timestamp policy | Dashboard uses Thai locale with `Asia/Bangkok`; Source Health and Feedback use viewer-default `toLocaleString()` and do not guard invalid values. | **Approved T14-S16** under the recorded en-GB/Asia-Bangkok/ICT policy. |
| C06 — generic mutation state machine | Shared semantic feedback/confirmation exists; pages intentionally own requests, DTOs, targets, refresh, and pending state. | **Removed**; no harmful duplication/defect measured. |
| C12 — design sidecar | Impeccable context reports `.impeccable/design.json` older than `DESIGN.md`. | **Documentation Maintenance** only; no UI implementation defect is inferred. |
| C14/S12 — OSM | Public disables attribution and uses the wildcard Standard tile URL; owner cancelled S12 on 2026-08-12. | **Removed from T14**. No source change; provider/basemap risk remains a separate pre-production decision. |
| C16 — shared canonical decoder | Public and Admin share transport/listener mechanics but retain consumer-specific validation/canonical/UI rules. | **Removed** unless a concrete policy drift/regression is measured. |

Additional source facts:

- the Public map's dotted `map-bg` utility triggered one Impeccable detector advisory for a generic
  grid background; inspection confirms it is used on the actual map canvas, so this is a false
  positive and not a work item;
- no automatic dark Admin theme is allowed by the fixed-light Signal Lens decision;
- a broad Public redesign and unlimited polish remain outside T14; and
- Research UI, T11 operations, D-012 lifecycle controls, deployment, devices, and human/AT proof
  cannot be repaired inside frontend T14 residual work.

## 3. Approved-outcome measurements and paths

### T14-S15 — Admin operational mutation integrity

- Planned source: `app/admin/feedback/page.tsx`, `components/admin/RouteStopsModal.tsx`, and an
  existing shared Admin feedback primitive only if reuse requires it.
- Planned tests: `tests/t14-admin-operations-support.spec.ts` and
  `tests/t14-admin-master-data.spec.ts`.
- First failing evidence: hold the Feedback PATCH and route-order PUT; repeated activation must
  yield one request, the exact action must expose a named busy state, failure must retain the note/
  order and allow retry, and success must publish one polite completion receipt.
- Preserve: exact payloads/status graph, route ordering, note clearing only after success, sensitive
  delete/restore re-authentication, focus behavior, roles, API/schema, and all other surfaces.

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
into seven T14 tasks. Its sole open P1 is the missing Research Dashboard owned by T15. Remaining
P2/P3 observations decompose into the approved stop-image outcome, external assets/Maintenance, timestamp
decision, and external human/device/runtime proof. The fresh detector returned only the verified
map-canvas false positive above. No browser suite or human/AT session was rerun in this research-only
pass.

## 5. Confidence and handoff

Confidence is High for exact source locations and accepted local invariants; Medium for likely
performance/accessibility impact until focused measurements fail; and Low for real-device,
assistive-technology, deployed/provider, and human outcomes. Backend, Frontend, and Database R4 are
now complete on the same baseline. Infrastructure & Device R5 may proceed; no source task is
authorized.
