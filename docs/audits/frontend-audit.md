# Frontend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: f42a2bb025c4756e04542fc9dbecb41009d8ce7a
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture audits, Backend audit as
  cross-boundary context, docs/decision-queue.md, docs/tasks/,
  shuttle-tracking-web/app/, shuttle-tracking-web/components/, shuttle-tracking-web/config/,
  shuttle-tracking-web/contexts/, shuttle-tracking-web/hooks/, shuttle-tracking-web/services/,
  shuttle-tracking-web/types/, shuttle-tracking-web/utils/, shuttle-tracking-web/package.json,
  shuttle-tracking-web/tests/, full frontend check evidence, and the current Impeccable technical
  audit/detector pass
- Reviewed at: 2026-08-09T23:51:01+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md @
  1eec86602c40c859d50dd9d369f636b103b6896f; docs/audits/product-audit.md and
  docs/audits/architecture-audit.md @ f42a2bb025c4756e04542fc9dbecb41009d8ce7a

## 2026-08-09 T14 contrast/color-governance re-audit

Product and Architecture are revalidated at `f42a2bb...`; Discovery remains current at
`1eec866...`. T14 closes the audited contrast P1 for source/browser scope: one strict pure utility
normalizes route display colors and selects a >=4.5:1 black/white badge foreground; one shared badge
removes duplicated unconditional white text; one `#45556c` token replaces only failing non-disabled
400-level foregrounds on the enumerated Public/Admin light surfaces. Valid route backgrounds and
Public structure, copy, type, order, glass/map identity, and behavior remain unchanged.

The source score is **14/20 — below the release baseline**: Accessibility improves from 2/4 to 3/4;
Performance and Responsive Design remain 3/4, Theming 2/4, and Integrity 3/4. Two P1, eight P2, and
one P3 remain open; seven P1 and two P2 findings are resolved across T14. The narrowed Public
explanation and missing Research Dashboard remain P1. Contrast unit 4/4, browser 2/2, every prior
T8/T14 suite, lint/build, and full CI pass. Evidence is synthetic/local, not human, assistive-
technology, physical-device/dark-theme, or deployed acceptance.

## 2026-08-09 measured Public map-quality re-audit — superseded for contrast findings

Product and Architecture are revalidated at `7aae795...`; Discovery remains current at
`1eec866...`. T14 closes the eager-all-route geometry and uncancelled marker-animation P2 findings:
initial readiness requests only the selected route, pending/successful loads are deduplicated/reused,
and a later route loads once. One pure motion owner supplies cancellation and reduced-motion options;
each vehicle owns at most one frame chain. The measured 320 px Public dock/control rectangles no
longer collide, all map targets are 44 px around their retained 36 px visuals, and audited route-order
targets are 44 px.

The source score is **13/20 — below the release baseline**: Performance and Responsive Design each
improve from 2/4 to 3/4; Accessibility stays 2/4, Theming 2/4, and Integrity 3/4. Three P1, eight P2,
and one P3 remain open; six P1 and two P2 findings are resolved across T14. Contrast, the narrowed
Public explanation, and the missing Research Dashboard remain P1. Motion 4/4, map-quality browser
2/2, T8 1/1, truth 2/2, accessibility 4/4, lint/build, and full CI pass. Evidence is synthetic local,
not human/device/deployed performance or accessibility acceptance.

## 2026-08-09 accessibility/navigation re-audit — superseded for map-quality findings

Product and Architecture are revalidated at `378818f...`; Discovery remains current at
`1eec866...`. T14 resolves the four scoped accessibility/navigation P1s: root zoom/language,
systemic named modal/focus/Escape/restoration behavior, form/category programmatic state, and the
off-screen Mobile Admin drawer. One typed hook owns the focus lifecycle. Public Feedback/image,
Admin CRUD/route-stop/sensitive Feedback, Login, and Mobile/Desktop navigation are covered by four
focused browser journeys while Public visual identity and truth behavior remain intact.

The current source score is **11/20 — below the release baseline**: Accessibility improves from 1/4
to 2/4; three P1, ten P2, and one P3 remain open; six P1 findings are now resolved across the two T14
slices. The remaining P1s are the narrowed Public service explanation, unguided contrast, and the
missing Research Dashboard. No axe/screen-reader session, measured contrast, reduced-motion/touch-
target acceptance, human usability, deployed proxy, or real interruption session was observed.
Focused accessibility 4/4, truth 2/2, T8 1/1, lint/build, detector `[]`, and full CI pass.

## 2026-08-09 truth-slice re-audit — superseded for accessibility findings

Product and Architecture are revalidated at `bd34552...`; Discovery remains current at
`1eec866...`. T14 closes the two misleading-state P1 findings for false Feedback vehicle association
and unconditional/zero-on-failure Admin liveness. It also narrows the Public service-state P1:
connection, canonical live/stale/no-service/unknown, absence, and retry are now explicit in the
incumbent availability-card layout, while route/dependency-specific explanation and last-update age
remain open. Admin hydration/event reconciliation and local expiry now have pure regression tests,
and `/socket.io/` bypasses PWA offline fallback.

The focused T14 tests passed 5/5; mobile/desktop browser journeys passed 2/2 and the repaired
transport repeat passed 4/4; T8 browser regression passed; lint has zero errors and the same two
pre-existing warnings; the production build and full CI passed. The final scoped Impeccable detector
returned `[]`. No keyboard, screen-reader, contrast, human usability, deployed proxy, or real
interruption session was observed. The current source score is therefore **10/20 — below the release
baseline**: Implementation Integrity improves to 3/4, two P1 findings are resolved, and seven P1,
ten P2, and one P3 remain open.

## 2026-08-08 D-011 pre-implementation snapshot — superseded by the T14 re-audit

Required predecessors are current at `1eec866...`; no web source changed. D-011 now approves the
first T14 slice in this order: data integrity/truthful Public and Admin state, then accessibility/
navigation, then measured responsive/performance/visual-system work. The Public tracker must retain
its incumbent visual identity; only minimal semantic, copy/state, accessibility, and source-quality
changes are allowed. Admin pages may receive a separately bounded visual restructure.

At that pre-implementation baseline, the 9/20 Impeccable score and all source findings remained
current. Approval changed task eligibility, not finding state; the later T14 implementation and
2026-08-09 section above now supersede those truth-finding states. The external Android
repository changes no web surface and does not authorize a T11 Admin UI before server APIs exist.

## 1. Executive Summary

The public tracker consumes the canonical state contract and T8 is resolved for its approved projection: native and isolated Playwright tests cover an initial live Marker/count, local expiry removal, route switch non-restoration, and restoration only after a newer authoritative live state. Raw research data and credentials are not exposed to riders.

D-001=C changes the release expectation. T10 adds authenticated route-stop management and T12 adds
the bounded feedback inbox and safe read-only source-health page. T14 now supplies a truthful basic
Public connection/service-state explanation and removes false Admin live/zero claims. There is still
no sender/claim/trip-history/exception UI, accountable operations summary, or authenticated research
dashboard. Scoped keyboard, motion, touch, request, and contrast semantics now have source/browser
evidence, while assistive-technology, human, and runtime acceptance remain absent.

D-007 is implemented for the bounded T12 session/navigation surfaces: the client hydrates the
server-provided role and hides the Feedback Inbox from `ADMIN`; server authorization remains
authoritative. The first T14 truth/integrity slice is owner-approved. A later Admin Dashboard
redesign may use a complementary theme, while the Public surface keeps its current identity; neither
authorizes broad styling without an exact handoff.

T9 removes the per-consumer production fallback chains and routes public/admin REST and Socket.IO
through one resolver. Production defaults to same-origin `/api` and current-origin Socket.IO; a
safe explicit HTTPS origin is shared when configured. No DOM structure, copy, styling, role, or
canonical-state behavior changed.

## 2. Scope and Freshness

This re-audit covers public/admin state ownership, REST/Socket lifecycle, loading/failure/permission
behavior, configuration, route/geometry/ETA presentation, and relevant tests. The Impeccable pass is
a static technical audit, not accessibility certification or human usability evidence; this profile
does not certify load, real devices, deployed origin, or provider behavior.

The preceding baseline was `1eec866...`. Exact T14 evidence is recorded in
`docs/tasks/T14-truthful-feedback-and-live-state.md` and the implementation/test paths it lists,
including the truth projection utility, Public Feedback/availability/socket consumers, Admin
dashboard/map, focused tests, and Service Worker. No browser path through the university proxy or
deployed origin was authorized. The unrelated dirty Feedback-role migration is excluded.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public canonical state/version ownership was missing | Resolved | Hydration and Socket.IO updates accept V1 canonical state with epoch/version ordering and backend route authority. |
| Locally expired live state could leave a Marker/count/ETA visible | Resolved | T8 projects local expiry consistently and its deterministic plus isolated-browser tests cover expiry and newer-live restoration. |
| Route switching could restore stale/expired Marker | Resolved | Marker eligibility requires current live state, known matching route authority, and no local expiry; T8 tests cover R01 to R02 to R01. |
| Public connection/service failure is explained to riders | Partially Resolved | The socket hook exposes connection state and the availability card distinguishes authoritative live/stale/no-service/unknown, reconnecting, disconnected, unavailable, and empty states with a retry boundary. Route/dependency-specific guidance, last-update age, and human comprehension remain open. |
| Route-stop management UI existed | Resolved | The authenticated Routes page launches `RouteStopsModal`, which loads current order and active stops, prevents duplicate local selection, supports add/remove/reorder, reports errors, and publishes the full list. Build/lint/CI passed; no ambient admin browser workflow was run. |
| Admin sender/trip/history/exception operations existed | Partially Resolved | T12 adds a safe read-only source-health page. Mobile claim/revocation, credentials, active/timeout trips, history, and force-close remain absent. |
| Feedback had accountable triage | Partially Resolved | T12 adds the notice/receipt, Super Admin/Dev inbox, case transitions, password-confirmed delete/restore, and safe health page. T14 removes fabricated/auto-selected vehicle association and browser-verifies failure/empty/retry/explicit selection. Staff/rider human acceptance remains unavailable. |
| Admin role-specific UX enforced D-007 | Partially Resolved | Session hydration receives the server role and navigation hides the feedback inbox from ADMIN. Backend authorization remains authoritative and general role management is out of scope. |
| Public/backend origin contract was settled | Resolved | T9 centralizes every listed REST/Socket consumer, defaults production to same origin, rejects unsafe/conflicting overrides, and removes hidden localhost rewrites/fallback loops. Focused tests pass; deployed proxy behavior remains Unable to Verify. |
| Research dashboard exposed raw diagnostic work appropriately | Still Present | No Dev Dashboard exists; this correctly avoids exposing raw telemetry but leaves D-004 research UI incomplete. |
| Static frontend technical quality met a production release baseline | Partially Resolved | The post-contrast score is 14/20: accessibility/performance/responsive/integrity are 3/4 and theming 2/4. Two P1, eight P2, and one P3 remain across explanation, residual performance/responsive/theming, recovery, and research. |

## 4. Surface Assessment

| Surface | Current behavior | C-scope gap |
|---|---|---|
| Public tracker | Canonical/truth/keyboard behavior plus selected-route-only geometry, cancellable/reduced motion, measured 320 px non-overlap/44 px controls, and normalized route-color display. | Last-update/dependency guidance, broader touch/device/human assistive-technology, and deployed recovery evidence. |
| Public feedback | Verified association, truthful states, programmatic category/form state, a named focus-trapped/restoring dialog, and measured light-surface contrast. | Runtime privacy/retention and human assistive-technology acceptance. |
| Admin shell/dashboard | Truthful data/map state plus breakpoint-aware Mobile navigation, reduced-motion behavior, and scoped light-surface contrast. | Exception-first actions, coherent theme/hierarchy, broader touch, and human/runtime evidence. |
| Admin routes/stops | CRUD UI plus T10 ordered route-stop management and measured 44 px order controls. | The modal exposes local order/membership errors; an approved stateful browser/cache target is still needed for published-read confirmation. |
| Admin operations | Safe read-only source health and Super Admin feedback triage. | Claim, active/timeout exception, history, and recovery paths remain T11. |
| Research/Dev | None. | Separate authenticated comparison dashboard, reproducible filters and metric labels; not part of T9-T12 unless a future task says so. |

## 5. Task Placement

- T9 now consolidates REST/Socket origins and removes production fallback ambiguity through its
  exact D-008 handoff. Preserve the resolver; browser/proxy acceptance still requires an approved
  external target.
- T10 is complete for its narrow route-detail composition UI; preserve server-side validation and record stateful published-read evidence only on an approved target.
- T11 needs an operations UI only after backend authorization/lifecycle APIs and the external Android acceptance contract are specified. It must not embed an Android driver runtime or expose sender secrets/source identifiers.
- T12 has D-009 policy. Future triage/device views require explicit server role checks, privacy wording, retention/deletion controls, and read-only safe DTOs rather than generic admin CRUD.
- T14's first four slices are complete. The next eligible unit is a bounded Admin shell/Dashboard
  hierarchy and complementary-theme foundation using existing truthful data. Public identity stays
  out of scope; T11 exceptions, Research, and broader Admin pages remain separate.

## 6. Usability and Technical Risks

Public tracker state remains broadly coordinated in useShuttleTracker, though supporting hooks isolate map/realtime pieces. Admin and public Socket lifecycles are independently implemented, so they can drift. Admin cookie-presence protection and static dashboard language are UI resilience/truthfulness issues; they are not authorization evidence. OSRM, Leaflet, geolocation, reconnect timing, accessibility, responsive behavior, marker density, and external tiles are unverified runtime dependencies.

### Impeccable technical audit evidence

| Dimension | Score | Current result |
|---|---:|---|
| Accessibility | 3/4 | Root/dialog/focus/form/sidebar plus scoped motion/touch/contrast evidence exist; broader live regions/touch coverage, assistive technology, and human evidence remain. |
| Performance | 3/4 | Selected-route/deduplicated geometry and cancellable marker motion are tested; raw images, external/global assets, broad backdrop work, and deployed budgets remain. |
| Responsive Design | 3/4 | The measured 320 px dock/control collision and audited 44 px targets are corrected; broader device/content/human coverage remains. |
| Theming | 2/4 | Public tokens exist; admin/legacy hard-coded palettes and forced light mode remain inconsistent. |
| Implementation Integrity | 3/4 | Product-specific separation and fail-closed truth projections are tested; Public/Admin socket lifecycle duplication and broader recovery surfaces remain. |
| **Total** | **14/20 — Below release baseline** | **0 P0; 2 open P1; 8 P2; 1 P3; 7 P1 and 2 P2 resolved by T14.** |

The final contrast detector has one reviewed advisory for the pre-existing tiled `map-bg` fallback;
it is an actual map canvas surface rather than a new decorative grid. Preserve selected-route request
budgets, motion cleanup, 36 px Public visuals/44 px targets, shared focus, canonical expiry/route
tests, fail-closed projections, code splitting, role-aware safe pages, and zero lint errors.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff; T10/T12 are complete for exact scopes. T11
requires backend contract/role gates and external Android acceptance evidence. T12 browser role/
human/assistive-technology acceptance is still unverified. T14's first four slices are revalidated;
the next exact slice is a bounded Admin shell/Dashboard hierarchy and complementary-theme foundation.

Confidence is High for source-visible ownership and missing UI surfaces, Medium for synthetic
request/motion/viewport/contrast evidence, and Low for assistive-technology, production
configuration, real Socket.IO failures, hardware, Android, and operator/rider outcomes.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-011 permits a bounded Admin theme/hierarchy slice next; the
handoff must limit it to the shell and Dashboard and must not invent unavailable operations data.

Frontend is validated at `f42a2bb...`. Dashboard & UX and downstream profiles may consume this
baseline; Database remains independently current at `1eec866...`.

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
