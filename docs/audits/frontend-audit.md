# Frontend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 4e609e327347163edf2e725d5ae40e7a9a6c0ecd
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture audits, Backend audit as
  cross-boundary context, docs/decision-queue.md, docs/tasks/,
  shuttle-tracking-web/app/, shuttle-tracking-web/components/, shuttle-tracking-web/config/,
  shuttle-tracking-web/contexts/, shuttle-tracking-web/hooks/, shuttle-tracking-web/services/,
  shuttle-tracking-web/types/, shuttle-tracking-web/utils/, shuttle-tracking-web/package.json,
  shuttle-tracking-web/tests/, full frontend check evidence, and the current Impeccable technical
  audit/detector pass
- Reviewed at: 2026-08-10T02:40:21+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md @
  1eec86602c40c859d50dd9d369f636b103b6896f; docs/audits/product-audit.md and
  docs/audits/architecture-audit.md @ 4e609e327347163edf2e725d5ae40e7a9a6c0ecd

## 2026-08-10 T14 Admin master-data theme-convergence re-audit

Product and Architecture are revalidated at `4e609e3...`; Discovery remains current at
`1eec866...`. T14 extends the semantic Admin system through Vehicles, Routes, Stops, and all four
existing master-data dialogs. One typed resource hierarchy owns headers, panels, loading/error/
empty states, status badges, and named actions; one dialog shell owns the incumbent focus contract.
Desktop tables and Mobile cards preserve domain data and actions, initial read failure is no longer
rendered as verified empty, and Retry uses the existing request boundary. Route-stop browser evidence
retains the ordered `{ stopIds: ["ST02", "ST01"] }` payload.

The source score remains **15/20 — below the release baseline**: Accessibility, Performance,
Responsive Design, Theming, and Implementation Integrity each remain 3/4. One P1, eight P2, and one
P3 remain open; eight P1 and two P2 findings are resolved across T14. The Admin theme P2 is further
narrowed because the shell, Dashboard, master-data pages, and their dialogs now use a coherent
semantic system; the legacy-failure P2 is narrowed because these three initial reads now distinguish
error from empty. Source Health/Feedback palettes and error projections, broader live/touch/device/
human evidence, raw/external assets, forced-light/no-switch behavior, duplicated Public/Admin socket
lifecycle, and the T13-blocked Research surface remain.

Measurement-first master-data browser coverage moved from 4/4 failing to 4/4 passing; the fresh
re-audit repeat also passes 4/4. Accessibility 4/4, contrast 2/2, Admin Dashboard 2/2, every earlier
frontend suite, lint with the same two warnings, the 11-route build, scoped detector `[]`, and full
repository CI pass. Public/Login and out-of-scope Admin pages are unchanged. This is synthetic local
Chromium/source evidence, not human, assistive-technology, physical-device, stateful backend, dark-
theme, deployed, or release acceptance.

Because the remaining P1 is blocked on T13 evidence, the next eligible unit is the narrowed Admin
operations/support theme-and-state P2 for Source Health and Feedback only. It must preserve T12 role,
privacy, retention, status-transition, fresh-auth, and read-only boundaries and exclude Public/Login,
T11, Research, API/auth/schema, Mobile, and external-runtime work.

## 2026-08-10 T14 Public service explanation/recovery re-audit — superseded for Admin master-data findings

Product and Architecture are revalidated at `db72310...`; Discovery remains current at
`1eec866...`. T14 closes the Public service-explanation P1 for its bounded existing-state source/
browser contract. One strict projection distinguishes loading, verified empty, snapshot failure,
connection recovery, and canonical live/stale/no-service/unknown state; canonical accepted time
drives last-update age; numeric ETA is withheld outside authoritative connected-live state; Retry
uses the existing snapshot boundary; and the preloader explains unusual delay before the incumbent
safety release.

The source score remains **15/20 — below the release baseline**: Accessibility, Performance,
Responsive Design, Theming, and Implementation Integrity each remain 3/4. One P1, eight P2, and one
P3 remain open; eight P1 and two P2 findings are resolved across T14. Broader live-region/touch/
device/human evidence, raw/external assets, broader Admin/legacy theming, duplicated Public/Admin
socket lifecycle and recovery, and the T13-blocked Research surface remain. Resolving one bounded
P1 does not by itself raise a dimension to 4/4.

Measurement-first evidence moved Public truth tests from compile failure to 8/8 passing and focused
browser journeys from 2/2 failing to 2/2 passing at 1280 and 320 CSS px. The final scoped detector
returns `[]`; every prior unit/browser suite, lint with the same two warnings, the 11-route build,
and full repository CI pass. Public palette, typography, component order, glass/map identity, and
primary behavior remain intact. This is synthetic local Chromium/source evidence, not human,
assistive-technology, physical-device, deployed, or service-operations acceptance.

Because the remaining P1 is blocked on T13 evidence, the next eligible slice is the narrowed Admin
theme P2: converge authenticated master-data pages on the existing semantic Admin system without
changing Public/Login, API/auth/schema behavior, or owner-controlled policy.

## 2026-08-10 T14 Admin Dashboard foundation re-audit — superseded for Public service findings

Product and Architecture are revalidated at `0a0fe58...`; Discovery remains current at
`1eec866...`. T14 establishes one scoped `RSU Operations` semantic theme for the Admin shell and
Dashboard, keeps Login/Public outside it, and replaces the Dashboard's repeated decorative cards
with a map-first primary workspace plus typed configured-inventory rail. Existing Source Health and
Vehicles routes are the only new shortcuts. No exception, Research, auth, API, or state authority is
invented.

The source score is **15/20 — below the release baseline**: Theming improves from 2/4 to 3/4 because
the primary Admin shell/Dashboard now has documented semantic tokens and a coherent hierarchy;
Accessibility, Performance, Responsive Design, and Implementation Integrity remain 3/4. Two P1,
eight P2, and one P3 remain open; the broader Admin/legacy palette, theme switch/dark mode, raw/
external assets, broader live/touch/device/human evidence, Public explanation, and Research surface
remain. The theme P2 is narrowed, not closed.

Measurement-first Admin browser tests move from 2/2 failing to 2/2 passing at 1280 and 390 CSS px,
including semantic-token ratios, map-before-inventory order, primary-column width, no horizontal
overflow, overlay/control separation, existing shortcuts, and drawer focus continuity. Truth 2/2,
accessibility 4/4, map-quality 2/2, contrast 2/2, every unit suite, lint with the same two warnings,
the 11-route build, detector `[]`, and final full CI pass. Public files are unchanged. Evidence is
synthetic local Chromium/source evidence, not human/assistive-technology, device/dark-theme, or
deployed acceptance.

The next eligible P1 is a bounded Public service-explanation/recovery slice using current state and
preserving visual identity. It must not invent route/dependency causes or absorb T11, Research,
broader Admin theming, or external-runtime work.

## 2026-08-09 T14 contrast/color-governance re-audit — superseded for Admin Dashboard findings

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
the bounded feedback inbox and safe read-only source-health page. T14 now supplies truthful Public
connection/snapshot/service-state explanation, canonical age, state-aware ETA, retry, and slow-load
recovery while removing false Admin live/zero claims. There is still
no sender/claim/trip-history/exception UI, accountable operations summary, or authenticated research
dashboard. Scoped keyboard, motion, touch, request, and contrast semantics now have source/browser
evidence, while assistive-technology, human, and runtime acceptance remain absent.

D-007 is implemented for the bounded T12 session/navigation surfaces: the client hydrates the
server-provided role and hides the Feedback Inbox from `ADMIN`; server authorization remains
authoritative. T14's bounded Admin shell/Dashboard now uses the complementary `RSU Operations`
theme, and the same semantic system now governs Vehicles, Routes, Stops, and their existing dialogs,
while the Public surface keeps its current identity. Source Health and Feedback remain outside that
slice and require another exact handoff.

T9 removes the per-consumer production fallback chains and routes public/admin REST and Socket.IO
through one resolver. Production defaults to same-origin `/api` and current-origin Socket.IO; a
safe explicit HTTPS origin is shared when configured. No DOM structure, copy, styling, role, or
canonical-state behavior changed.

## 2. Scope and Freshness

This re-audit covers public/admin state ownership, REST/Socket lifecycle, loading/failure/permission
behavior, configuration, route/geometry/ETA presentation, and relevant tests. The Impeccable pass is
a static technical audit, not accessibility certification or human usability evidence; this profile
does not certify load, real devices, deployed origin, or provider behavior.

The preceding affected baseline was `db72310...`. Exact T14 evidence is recorded in all seven task
specifications and their implementation/test paths, including truth projections, Public Feedback/
availability/StopInfo/ETA/preloader/socket consumers, map-quality/color boundaries, the Admin
theme/shell/Dashboard/map/master-data pages/dialogs, focused tests, and Service Worker. No browser
path through the university proxy or deployed origin was authorized. The unrelated dirty Feedback-
role migration is excluded.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public canonical state/version ownership was missing | Resolved | Hydration and Socket.IO updates accept V1 canonical state with epoch/version ordering and backend route authority. |
| Locally expired live state could leave a Marker/count/ETA visible | Resolved | T8 projects local expiry consistently and its deterministic plus isolated-browser tests cover expiry and newer-live restoration. |
| Route switching could restore stale/expired Marker | Resolved | Marker eligibility requires current live state, known matching route authority, and no local expiry; T8 tests cover R01 to R02 to R01. |
| Public connection/service failure is explained to riders | Resolved for bounded source/browser scope | Availability, StopInfo, ETA, Retry, canonical age, and preloader guidance distinguish the existing snapshot/connection/canonical states without inventing causal diagnosis. Human/assistive-technology comprehension and deployed recovery remain release evidence. |
| Route-stop management UI existed | Resolved | The authenticated Routes page launches `RouteStopsModal`, which loads current order and active stops, prevents duplicate local selection, supports add/remove/reorder, reports errors, and publishes the full list. Build/lint/CI passed; no ambient admin browser workflow was run. |
| Admin sender/trip/history/exception operations existed | Partially Resolved | T12 adds a safe read-only source-health page. Mobile claim/revocation, credentials, active/timeout trips, history, and force-close remain absent. |
| Feedback had accountable triage | Partially Resolved | T12 adds the notice/receipt, Super Admin/Dev inbox, case transitions, password-confirmed delete/restore, and safe health page. T14 removes fabricated/auto-selected vehicle association and browser-verifies failure/empty/retry/explicit selection. Staff/rider human acceptance remains unavailable. |
| Admin role-specific UX enforced D-007 | Partially Resolved | Session hydration receives the server role and navigation hides the feedback inbox from ADMIN. Backend authorization remains authoritative and general role management is out of scope. |
| Public/backend origin contract was settled | Resolved | T9 centralizes every listed REST/Socket consumer, defaults production to same origin, rejects unsafe/conflicting overrides, and removes hidden localhost rewrites/fallback loops. Focused tests pass; deployed proxy behavior remains Unable to Verify. |
| Research dashboard exposed raw diagnostic work appropriately | Still Present | No Dev Dashboard exists; this correctly avoids exposing raw telemetry but leaves D-004 research UI incomplete. |
| Static frontend technical quality met a production release baseline | Partially Resolved | The post-master-data score remains 15/20: every dimension is 3/4. One P1, eight P2, and one P3 remain across residual accessibility/performance/responsive/theming/recovery and Research. |

## 4. Surface Assessment

| Surface | Current behavior | C-scope gap |
|---|---|---|
| Public tracker | Canonical/truth/keyboard behavior plus snapshot/connection explanation, canonical age, state-aware ETA, Retry/slow-load recovery, selected-route-only geometry, cancellable/reduced motion, measured 320 px non-overlap/44 px controls, and normalized route-color display. | Broader touch/device/human assistive-technology and deployed recovery evidence; route/dependency causal diagnosis requires a future server contract rather than UI inference. |
| Public feedback | Verified association, truthful states, programmatic category/form state, a named focus-trapped/restoring dialog, and measured light-surface contrast. | Runtime privacy/retention and human assistive-technology acceptance. |
| Admin shell/dashboard | Truthful data/map state plus breakpoint-aware navigation, scoped semantic tokens, map-first hierarchy, configured-inventory labels, existing safe shortcuts, reduced motion, and contrast. | T11-backed exception/actions and human/runtime evidence. |
| Admin master data | Vehicles/Routes/Stops share semantic hierarchy, truthful initial read states, desktop tables/Mobile cards, named 44 px actions, and focus-contained CRUD/route-order dialogs. | Human/device evidence and an approved stateful browser/cache target for published-read confirmation. |
| Admin operations/support | Safe read-only source health and Super Admin/Dev feedback triage retain T12 policy. | Hard-coded page palettes, sub-44 px actions, and error-plus-empty projection remain; claim, active/timeout exception, history, and recovery paths remain T11. |
| Research/Dev | None. | Separate authenticated comparison dashboard, reproducible filters and metric labels; not part of T9-T12 unless a future task says so. |

## 5. Task Placement

- T9 now consolidates REST/Socket origins and removes production fallback ambiguity through its
  exact D-008 handoff. Preserve the resolver; browser/proxy acceptance still requires an approved
  external target.
- T10 is complete for its narrow route-detail composition UI; preserve server-side validation and record stateful published-read evidence only on an approved target.
- T11 needs an operations UI only after backend authorization/lifecycle APIs and the external Android acceptance contract are specified. It must not embed an Android driver runtime or expose sender secrets/source identifiers.
- T12 has D-009 policy. Future triage/device views require explicit server role checks, privacy wording, retention/deletion controls, and read-only safe DTOs rather than generic admin CRUD.
- T14's first seven slices are complete. The Public explanation P1 is closed and Admin master-data
  theme/error findings are narrowed for bounded source/browser evidence. The next eligible unit is
  bounded Source Health/Feedback Admin operations-support convergence; Public/Login, T11 exceptions,
  Research/T13, API/auth/schema, Mobile, and external-runtime work remain separate.

## 6. Usability and Technical Risks

Public tracker state remains broadly coordinated in useShuttleTracker, though supporting hooks isolate map/realtime pieces. Admin and public Socket lifecycles are independently implemented, so they can drift. Admin cookie-presence protection and static dashboard language are UI resilience/truthfulness issues; they are not authorization evidence. OSRM, Leaflet, geolocation, reconnect timing, accessibility, responsive behavior, marker density, and external tiles are unverified runtime dependencies.

### Impeccable technical audit evidence

| Dimension | Score | Current result |
|---|---:|---|
| Accessibility | 3/4 | Root/dialog/focus/form/sidebar plus scoped master-data action, motion, touch, and contrast evidence exist; broader live regions/touch coverage, assistive technology, and human evidence remain. |
| Performance | 3/4 | Selected-route/deduplicated geometry and cancellable marker motion are tested; raw images, external/global assets, broad backdrop work, and deployed budgets remain. |
| Responsive Design | 3/4 | The measured 320 px Public collision plus 390 px master-data cards/dialogs and audited 44 px targets are corrected; broader device/content/human coverage remains. |
| Theming | 3/4 | Public tokens plus a semantic Admin shell/Dashboard/master-data system exist; Source Health/Feedback hard-coded palettes and the forced light/no-switch posture remain. |
| Implementation Integrity | 3/4 | Product-specific separation, fail-closed truth projections, bounded Public recovery, and shared Admin resource/dialog ownership are tested; Public/Admin socket lifecycle duplication and broader recovery surfaces remain. |
| **Total** | **15/20 — Below release baseline** | **0 P0; 1 open P1; 8 P2; 1 P3; 8 P1 and 2 P2 resolved by T14; the theme P2 is narrowed.** |

The final contrast detector has one reviewed advisory for the pre-existing tiled `map-bg` fallback;
it is an actual map canvas surface rather than a new decorative grid. Preserve selected-route request
budgets, motion cleanup, 36 px Public visuals/44 px targets, shared focus, canonical expiry/route
tests, fail-closed projections, code splitting, role-aware safe pages, and zero lint errors.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff; T10/T12 are complete for exact scopes. T11
requires backend contract/role gates and external Android acceptance evidence. T12 browser role/
human/assistive-technology acceptance is still unverified. T14's first seven slices are revalidated;
the next exact slice is bounded Source Health/Feedback Admin operations-support convergence.
Research remains blocked on T13.

Confidence is High for source-visible ownership and missing UI surfaces, Medium for synthetic
request/motion/viewport/contrast evidence, and Low for assistive-technology, production
configuration, real Socket.IO failures, hardware, Android, and operator/rider outcomes.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-011 permits a bounded Source Health/Feedback Admin operations-
support convergence slice next; the handoff must preserve Public/Login identity and current T12
data/auth/privacy/retention/action ownership.

Frontend is validated at `4e609e3...`. Dashboard & UX and downstream profiles may consume this
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
