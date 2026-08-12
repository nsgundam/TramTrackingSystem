# Dashboard & UX Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Accepted T14 application baseline: `c72feb90e7a35da45d82bac61eb927ab7c55a37c`
- Evidence scope: Public/Admin routes and components under `shuttle-tracking-web/app/` and
  `shuttle-tracking-web/components/`, browser tests under `shuttle-tracking-web/tests/`,
  `DESIGN.md`, `.impeccable/design.json`, `docs/audits/product-audit.md`,
  `docs/audits/frontend-audit.md`, and `docs/audits/infrastructure-device-audit.md`
- Reviewed at: `2026-08-12T23:15:48+07:00`
- Validation state: **Validated for T14 Research R6**
- Predecessor baselines: `docs/audits/product-audit.md` (R2),
  `docs/audits/frontend-audit.md` (R4), and `docs/audits/infrastructure-device-audit.md` (R5), each
  validated over `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Owner-decision overlay: current Plan v1/S14/OSM directions are owner authority, not UI behavior at
  `531ec9e`.
- Bounded delta: `M-20260812-01` is accepted at source commit `cdd69f8`; authenticated `/admin` and
  successful Login land on the incumbent Dashboard while unauthenticated entry remains protected.
  This Maintenance result does not change the accepted T14 application baseline.

## 1. Audience and information boundary

| Audience | Current surface | Required separation |
|---|---|---|
| Public rider | Canonical route/stops/live state, bounded ETA/recovery explanation, Feedback | No raw source identity, credentials, research comparison, unrestricted history, or Admin actions |
| Admin operations | Dashboard, master data, route ordering, safe Source Health, role-gated Feedback | Server authorization remains authoritative; missing T11 exceptions must not be fabricated |
| Research developer | Protected APIs only | Future T15 route/UI must keep session/provenance/uncertainty/export distinct from daily operations and Public state |

The fixed-light Signal Lens system remains the approved Admin identity. Automatic dark mode and a
general Public redesign are not outstanding quality tasks; they contradict the owner boundary.

## 2. Technical audit score and interpretation

| Dimension | Score | Current limiting evidence |
|---|---:|---|
| Accessibility | 3/4 | Broad semantic/focus coverage exists; exact Feedback/route-order pending/completion states remain, and human/AT acceptance is absent |
| Performance | 3/4 | Map request/motion budgets exist; raw stop images and global/external assets remain |
| Responsive Design | 3/4 | Deterministic 320/390 px journeys exist; representative physical-device/text/human coverage is absent |
| Theming | 3/4 | Coherent fixed-light Admin system exists; the generated design sidecar is stale documentation |
| Implementation Integrity | 3/4 | Product-specific truth and shared mechanics are strong; timestamp policy and external asset ownership remain inconsistent |
| **Total** | **15/20** | **Useful health signal, not a task count or closure counter** |

The prior “one P1, five P2, one P3” aggregate is normalized as follows:

- the P1 missing Research Dashboard belongs to **T15**, not T14;
- P2 repository work is the narrow Admin mutation residual, Public stop images, asset dependencies,
  and timestamp policy; T11 operations and external acceptance are separate owners;
- P3 design-sidecar drift is optional Documentation Maintenance; and
- human, assistive-technology, physical-device, provider, deployed recovery, and load results are
  evidence gates, not source defects.

The required fresh Impeccable detector run returned one advisory on the dotted `map-bg` utility.
Because that utility is used on the actual map canvas, the warning is a verified false positive and
creates no work. The context loader separately reports `.impeccable/design.json` stale relative to
`DESIGN.md`; refresh it only through an explicit documentation Maintenance action.

## 3. Current UX finding register

| Finding | Severity / state | Destination |
|---|---|---|
| Feedback note/status PATCH lacks per-case pending lock and success announcement; rapid repeat is not guarded | P2, reproducible | **Approved T14-S15: narrow Admin operational mutation integrity** |
| Route-order publish has disabled/spinner behavior but no named busy/completion status | P2, narrow | Include in S15; preserve exact T10 behavior |
| Public stop thumbnail/modal image has no intrinsic/lazy/decode/error contract | P2, reproducible | **Approved T14-S17** within bounded Public authority |
| Public map hides required OSM attribution while using Standard tiles | Compliance/policy finding; owner cancelled S12 | **Removed from T14**; keep as a separate pre-production provider/basemap stop condition |
| Admin timestamp locale/time-zone/invalid handling differs by page | P2, reproducible | **Approved T14-S16** under the recorded policy |
| Admin marker uses remote Flaticon asset with no local provenance/licence | P2 dependency | Maintenance/asset decision |
| Google Material Symbols loads globally for two Public App Tour glyphs | P2 dependency/performance | Public-authority-gated Maintenance |
| Research Dashboard absent | P1, still present | T15 |
| T11 history/timeout/sender recovery and exception-first operations absent | Release-critical, still present | T11 |
| Human/AT/device/deployed UX proof | Unable to verify | External acceptance |

## 4. Approved T14 UX outcome contracts

### T14-S15 — Admin operational mutation integrity

Outcome: the two remaining non-sensitive mutation paths expose one-request pending, retained
failure/retry, and polite success semantics consistent with the accepted Admin system.

Non-goals: no endpoint/payload/status graph, sensitive delete/restore, T10 order rule, role,
authorization, schema, CSS identity, Public, Login, or backend change.

First measurement: hold each PATCH/PUT in Playwright; repeated activation produces exactly one
request, busy state is programmatically named, failure preserves input/order and retries, and
success produces a stable polite receipt. Planned paths are limited to the two components, their
two existing browser specs, and a shared primitive only if strictly required.

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
residuals and audience boundaries, Medium for isolated browser outcomes until measurement-first
tests run, and Low for external acceptance. Security/DevOps/Observability R7 may consume this
report; S15–S17 are registered/approved outcomes but gain write authority only from their individual
committed task handoffs.
