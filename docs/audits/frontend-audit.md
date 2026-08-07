# Frontend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: cdedcc2fd82ab264e2176716ac23a74c948e1a28
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture audits, Backend audit as
  cross-boundary context, docs/decision-queue.md, docs/tasks/,
  shuttle-tracking-web/app/, shuttle-tracking-web/components/, shuttle-tracking-web/config/,
  shuttle-tracking-web/contexts/, shuttle-tracking-web/hooks/, shuttle-tracking-web/services/,
  shuttle-tracking-web/types/, shuttle-tracking-web/utils/, shuttle-tracking-web/package.json,
  shuttle-tracking-web/tests/, full frontend check evidence, and the current Impeccable technical
  audit/detector pass
- Reviewed at: 2026-08-07T19:53:43+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md, docs/audits/product-audit.md, and
  docs/audits/architecture-audit.md @ cdedcc2fd82ab264e2176716ac23a74c948e1a28

## 1. Executive Summary

The public tracker consumes the canonical state contract and T8 is resolved for its approved projection: native and isolated Playwright tests cover an initial live Marker/count, local expiry removal, route switch non-restoration, and restoration only after a newer authoritative live state. Raw research data and credentials are not exposed to riders.

D-001=C changes the release expectation. T10 adds authenticated route-stop management and T12 adds
the bounded feedback inbox and safe read-only source-health page. There is still no public service-
state/recovery explanation, sender/claim/trip-history/exception UI, or authenticated research dashboard.
The current dashboard has useful Socket.IO connection and service-state summaries, but its
static Live System Active label and master-data count do not make it an accountable operations surface.

D-007 is implemented for the bounded T12 session/navigation surfaces: the client hydrates the
server-provided role and hides the Feedback Inbox from `ADMIN`; server authorization remains
authoritative. The requested public-theme Dashboard redesign belongs to the later T14 scope after
Dashboard & UX and D-011 produce an exact information hierarchy; it does not authorize broad
styling work here.

T9 removes the per-consumer production fallback chains and routes public/admin REST and Socket.IO
through one resolver. Production defaults to same-origin `/api` and current-origin Socket.IO; a
safe explicit HTTPS origin is shared when configured. No DOM structure, copy, styling, role, or
canonical-state behavior changed.

## 2. Scope and Freshness

This re-audit covers public/admin state ownership, REST/Socket lifecycle, loading/failure/permission
behavior, configuration, route/geometry/ETA presentation, and relevant tests. The Impeccable pass is
a static technical audit, not accessibility certification or human usability evidence; this profile
does not certify load, real devices, deployed origin, or provider behavior.

The preceding baseline was `82f4d97...`. Exact changed frontend evidence is
`docs/tasks/T9-production-topology-origin-handoff.md`, `docs/decision-queue.md`,
`shuttle-tracking-web/components/admin/LiveMap.tsx`,
`shuttle-tracking-web/components/public/FeedbackModal.tsx`,
`shuttle-tracking-web/config/backend.ts`, `shuttle-tracking-web/hooks/useShuttleTracker.ts`,
`shuttle-tracking-web/hooks/useSocketConnection.ts`, `shuttle-tracking-web/package.json`,
`shuttle-tracking-web/services/api.ts`, `shuttle-tracking-web/services/publicApi.ts`, and
`shuttle-tracking-web/tests/t9-backend-origin.test.ts`. The current full frontend check passes:
simulator tooling 4/4, T8 native tests 2/2, T9 origin tests 5/5, isolated Playwright 1/1,
lint with two pre-existing warnings, and production build. No browser path through the university
proxy or deployed origin was authorized.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public canonical state/version ownership was missing | Resolved | Hydration and Socket.IO updates accept V1 canonical state with epoch/version ordering and backend route authority. |
| Locally expired live state could leave a Marker/count/ETA visible | Resolved | T8 projects local expiry consistently and its deterministic plus isolated-browser tests cover expiry and newer-live restoration. |
| Route switching could restore stale/expired Marker | Resolved | Marker eligibility requires current live state, known matching route authority, and no local expiry; T8 tests cover R01 to R02 to R01. |
| Public connection/service failure is explained to riders | Still Present | The public socket hook silently reconnects/hydrates; route/API failure has no persistent rider recovery state or C-scope no-service explanation. |
| Route-stop management UI existed | Resolved | The authenticated Routes page launches `RouteStopsModal`, which loads current order and active stops, prevents duplicate local selection, supports add/remove/reorder, reports errors, and publishes the full list. Build/lint/CI passed; no ambient admin browser workflow was run. |
| Admin sender/trip/history/exception operations existed | Partially Resolved | T12 adds a safe read-only source-health page. Mobile claim/revocation, credentials, active/timeout trips, history, and force-close remain absent. |
| Feedback had accountable triage | Partially Resolved | T12 adds the notice/receipt, Super Admin/Dev inbox, case transitions, password-confirmed delete/restore, and safe health page. Browser staff/rider acceptance remains unavailable. |
| Admin role-specific UX enforced D-007 | Partially Resolved | Session hydration receives the server role and navigation hides the feedback inbox from ADMIN. Backend authorization remains authoritative and general role management is out of scope. |
| Public/backend origin contract was settled | Resolved | T9 centralizes every listed REST/Socket consumer, defaults production to same origin, rejects unsafe/conflicting overrides, and removes hidden localhost rewrites/fallback loops. Focused tests pass; deployed proxy behavior remains Unable to Verify. |
| Research dashboard exposed raw diagnostic work appropriately | Still Present | No Dev Dashboard exists; this correctly avoids exposing raw telemetry but leaves D-004 research UI incomplete. |
| Static frontend technical quality met a production release baseline | New Finding | The required Impeccable audit remains 9/20 (Poor): no P0, nine P1, ten P2, and one P3 across modal/focus/form accessibility, truthful service/feedback state, responsive targets, performance, and theming. T9 introduced none of these defects and resolves none. |

## 4. Surface Assessment

| Surface | Current behavior | C-scope gap |
|---|---|---|
| Public tracker | Canonical REST hydration, Socket.IO updates, route filtering, local expiry, Marker/count/ETA projection, route/stop map and feedback capture. | Explicit fresh/no-service/stale/recovery messaging and resilient retry states. |
| Public feedback | Validation, submit/error/success, vehicle fallback, privacy notice, and no-reply receipt. | Runtime privacy/retention acceptance. |
| Admin shell/dashboard | Session role hydration, API token, master-data counts, live map with connection/service-state summary, role-aware inbox/health navigation. | Dashboard exception-first truth and accessibility evidence. |
| Admin routes/stops | CRUD UI plus T10 ordered route-stop management. | The modal exposes local order/membership errors; an approved stateful browser/cache target is still needed for published-read confirmation. |
| Admin operations | Safe read-only source health and Super Admin feedback triage. | Claim, active/timeout exception, history, and recovery paths remain T11. |
| Research/Dev | None. | Separate authenticated comparison dashboard, reproducible filters and metric labels; not part of T9-T12 unless a future task says so. |

## 5. Task Placement

- T9 now consolidates REST/Socket origins and removes production fallback ambiguity through its
  exact D-008 handoff. Preserve the resolver; browser/proxy acceptance still requires an approved
  external target.
- T10 is complete for its narrow route-detail composition UI; preserve server-side validation and record stateful published-read evidence only on an approved target.
- T11 needs an operations UI only after backend authorization/lifecycle APIs and the external Android acceptance contract are specified. It must not embed an Android driver runtime or expose sender secrets/source identifiers.
- T12 has D-009 policy. Future triage/device views require explicit server role checks, privacy wording, retention/deletion controls, and read-only safe DTOs rather than generic admin CRUD.

## 6. Usability and Technical Risks

Public tracker state remains broadly coordinated in useShuttleTracker, though supporting hooks isolate map/realtime pieces. Admin and public Socket lifecycles are independently implemented, so they can drift. Admin cookie-presence protection and static dashboard language are UI resilience/truthfulness issues; they are not authorization evidence. OSRM, Leaflet, geolocation, reconnect timing, accessibility, responsive behavior, marker density, and external tiles are unverified runtime dependencies.

### Impeccable technical audit evidence

| Dimension | Score | Current result |
|---|---:|---|
| Accessibility | 1/4 | Systemic dialog/focus/form naming, off-screen sidebar, live-region, language/zoom, and reduced-motion gaps remain. |
| Performance | 2/4 | Code splitting/memoization exist; eager route geometry, uncancelled map animation, raw images, and broad transition/backdrop work remain. |
| Responsive Design | 2/4 | Admin card/table breakpoints exist; small touch targets and narrow-screen overlay collisions remain. |
| Theming | 2/4 | Public tokens exist; admin/legacy hard-coded palettes and forced light mode remain inconsistent. |
| Implementation Integrity | 2/4 | Product-specific separation is clear, but service/dashboard and Feedback fallback states can mislead. |
| **Total** | **9/20 — Poor** | **0 P0; 9 P1; 10 P2; 1 P3.** |

The detector returned two mechanistic candidates. `app/globals.css:91-95` is a permitted map-surface
grid and `components/admin/StopModal.tsx:146-147` is an empty element, so neither is an actionable
contrast/design-pattern finding after context review. Manual verification retains the material
findings above. Preserve the positive evidence: canonical expiry/route tests, code splitting,
role-aware safe pages, explicit loading/error/empty text, RouteStopsModal semantics, and zero lint
errors. Recommended T14 sequence remains `$impeccable harden`, `$impeccable adapt`,
`$impeccable optimize`, `$impeccable document`, then `$impeccable polish`, followed by re-audit.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff; T10/T12 are complete for exact scopes. T11
requires backend contract/role gates and external Android acceptance evidence. T12 browser role/
accessibility acceptance is still unverified. T14 owns the public-theme Dashboard redesign after its
own re-audit/brief.

Confidence is High for source-visible canonical projection and missing UI surfaces, Medium for T8 synthetic test coverage, and Low for accessibility, production configuration, real Socket.IO failures, hardware, Android, and actual operator/rider outcomes.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-011 remains the binding choice for the first exact T14 slice;
this audit evidence is not permission for an unbounded redesign.

Frontend is validated at `cdedcc2...` for the T9 implementation impact. Database and every dependent
profile through Roadmap have now completed their revalidations.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: feedback notice, accountable inbox, and safe source health UI were absent — Partially
Resolved.** `FeedbackModal` now makes the one-way/non-emergency/business-day privacy contract visible
before submit and gives an accurate no-reply receipt. New role-aware navigation leads `SUPER_ADMIN`/
`DEV` to a feedback inbox and `ADMIN` or higher to the separate source-health page. The inbox asks for
the current password before delete/restore and only sends selected deletion reasons; the health page
has no actions or forbidden data fields.

**Finding: the client had no role-aware session representation — Resolved for T12 navigation.** Login,
rehydration through `/api/auth/me`, and re-authentication carry the role supplied by the server.
Client hiding is supplemental only; the backend controls authorization. Frontend lint/build and the
repository CI pass, but no browser session with a migrated database account was authorized, so
permission/accessibility/usability outcomes remain unverified.
