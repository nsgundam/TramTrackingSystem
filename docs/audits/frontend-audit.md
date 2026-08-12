# Frontend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 9ff7e85b19bcbe17b6d810451904c0f981cb0571
- Evidence scope: PRODUCT.md, docs/project-knowledge-base.md, Product/Architecture audits, Backend audit as
  cross-boundary context, DESIGN.md, .impeccable/design.json, docs/decision-queue.md, docs/tasks/,
  shuttle-tracking-web/app/, shuttle-tracking-web/components/, shuttle-tracking-web/config/,
  shuttle-tracking-web/contexts/, shuttle-tracking-web/hooks/, shuttle-tracking-web/services/,
  shuttle-tracking-web/types/, shuttle-tracking-web/utils/, shuttle-tracking-web/package.json,
  shuttle-tracking-web/tests/, full frontend check evidence, and the current Impeccable technical
  audit/detector pass
- Reviewed at: 2026-08-12T19:15:00+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md @
  1eec866b986b4cb4e802f7a48fac93e54e780699; docs/audits/product-audit.md and
  docs/audits/architecture-audit.md @ 9ff7e85b19bcbe17b6d810451904c0f981cb0571

## 2026-08-12 T14-S13 Admin Feedback session-hydration frontend re-audit

Product and Architecture are validated at evidence baseline `9ff7e85`; Discovery remains current
at `1eec866...`. The application delta from accepted source `70f42c1` to application-source
baseline `c72feb9` is exactly `shuttle-tracking-web/app/admin/feedback/page.tsx` plus
`shuttle-tracking-web/tests/t14-admin-operations-support.spec.ts`, with completion record
`9a9cf5c`. `T14-S13` is
**Complete for its exact Frontend source/browser contract** and is the twelfth accepted source
slice; accepted IDs are `T14-S01` through `T14-S11` plus `T14-S13`, while `T14-S12` stays deferred.

The Feedback page now uses the existing auth `isLoading` state to render one shared polite status
and prevent privileged reads until a server-returned privileged role resolves. It preserves the
resolved `SUPER_ADMIN`/`DEV` inbox and exact `ADMIN` denial. There is no Public, CSS/theme, Login,
AuthContext/API/proxy, request/payload/policy, backend, schema, or dependency delta.

| Dimension | Score | Current result |
|---|---:|---|
| Accessibility | 3/4 | One false assertive denial becomes a truthful polite status with deterministic no-data/no-read coverage; broad live-region consistency and human/AT evidence remain open. |
| Performance | 3/4 | One bounded branch/effect guard adds no dependency or persistent render effect; deployed budgets remain open. |
| Responsive Design | 3/4 | The existing panel primitive changes no persistent layout; broader device/content/human coverage remains incomplete. |
| Theming | 3/4 | The existing Signal Lens state component is reused without CSS or Public change. |
| Implementation Integrity | 3/4 | Server-returned role stays authoritative and no protected read starts before resolution; broader system ceilings persist. |
| **Total** | **15/20 — Below release baseline** | **0 P0; 1 P1; 5 P2; 1 P3 open. Eight P1 and five P2 findings remain resolved across T14.** |

| Current Frontend finding | State | Evidence and implication |
|---|---|---|
| Admin Feedback unresolved session projected as final role denial | Resolved | For bounded local source/browser evidence, measurement failed 1/1 before source; final focused 1/1 proves neutral pending state, no protected read, and exact resolved-role branches. |
| Feedback had accountable triage | Partially Resolved | Truthful hydration narrows the existing journey; staff/rider/runtime acceptance is absent. |
| Admin role-specific UX enforced D-007 | Partially Resolved | Hydration and request gating are truthful; server authority, general capability/account lifecycle, research navigation, and human role-denial evidence remain separate. |
| Static frontend technical quality met release baseline | Partially Resolved | All five dimensions remain 3/4. |

Admin operations 6/6, Login/material 5/5, accessibility 4/4, Dashboard 2/2, lint with zero errors/two
prior warnings, 11-route build, scoped detector `[]`, full CI, workflow/diff checks, and two finish
reviews pass. Login evidence covers rejected request/pending/inline error and protected redirect, not
successful credential/session acceptance. This is local/synthetic evidence, not human/AT, physical-
device, deployed session/proxy/runtime, security, or release proof. `T14-S14` remains Proposed and
blocked on the pending D-011/Public-UI choice at `9ff7e85`; no source handoff exists. Dashboard & UX
may consume this baseline; the pre-existing design-sidecar drift and unrelated migration are
excluded.

## T14 Re-audit Provenance

Superseded per-slice narratives were compacted on 2026-08-12. The current finding dispositions and
domain analysis below remain authoritative. Stable slice IDs and H/S/C/R provenance live in
`docs/roadmap/T14-scope-and-closure-ledger.md`; exact implementation and validation evidence stays
in the committed `docs/tasks/T14-*.md` records and Git history. This structural compaction changes
no evidence baseline, finding state, score, release determination, or owner decision.

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
authoritative. T14's shared Admin system now governs Dashboard, Vehicles, Routes, Stops, Source
Health, Feedback Inbox, their dialogs, and Login through the bright-neutral Signal Lens foundation,
while Public keeps its current identity. T12 roles, safe fields, lifecycle, and request behavior
remain authoritative. Owner refinement `a0a0ce1` is implemented at `c4fdc3a`; the semantic component
and behavior contracts remain reusable. Source baseline `e6a04ad` adds and repairs shared semantic
master-data mutation recovery, including immutable delete-target identity, without changing page
fields, requests, authorization, route-stop behavior, Public, or Login source.
Source baseline `70f42c1` adds one browser Socket.IO transport/listener implementation owner shared
by the Public hook and Admin LiveMap while retaining separate lifecycle instances and every
consumer-owned structural-validation, canonical, and UI behavior.
Application-source baseline `c72feb9` then makes Admin Feedback session hydration truthful without
moving session, role, request, or server authority: the page renders a neutral pending state and
starts no privileged read until a server-returned `SUPER_ADMIN`/`DEV` role resolves, while final
`ADMIN` denial remains unchanged. Coordination evidence through `9ff7e85` adds no application
delta; it records that the separate `T14-S14` proposal remains owner-gated.

T9 removes the per-consumer production fallback chains and routes public/admin REST and Socket.IO
through one resolver. Production defaults to same-origin `/api` and current-origin Socket.IO; a
safe explicit HTTPS origin is shared when configured. No DOM structure, copy, styling, role, or
canonical-state behavior changed.

## 2. Scope and Freshness

This re-audit covers public/admin state ownership, REST/Socket lifecycle, loading/failure/permission
behavior, configuration, route/geometry/ETA presentation, and relevant tests. The Impeccable pass is
a static technical audit, not accessibility certification or human usability evidence; this profile
does not certify load, real devices, deployed origin, or provider behavior.

The preceding accepted application-source baseline was `70f42c1`. Changed application evidence is
the exact `docs/tasks/T14-admin-feedback-session-hydration-truth-state.md` handoff,
`shuttle-tracking-web/app/admin/feedback/page.tsx`,
`shuttle-tracking-web/tests/t14-admin-operations-support.spec.ts`, completion record `9a9cf5c`,
fresh detector `[]`, and retained local build/CI evidence. The bounded application delta is exactly
those two source/test files at `c72feb9`; evidence baseline `9ff7e85` additionally records only the
pending `T14-S14` owner gate. Exact prior T14 evidence remains in the earlier task records.
No browser path through the university proxy or deployed origin was authorized. The unrelated dirty
Feedback-role migration is excluded.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Admin Feedback unresolved session projected as final role denial | Resolved | The held-auth browser guard proves one neutral polite status with zero protected reads, followed by exact reads only after a server-returned privileged role resolves; final `ADMIN` denial remains unchanged. |
| Public/Admin Socket.IO lifecycle implementation was duplicated | Resolved | One shared implementation owns scoped transport/listener mechanics; consumers retain separate instances and product-specific structural validation/canonical/UI behavior. |
| Public canonical state/version ownership was missing | Resolved | Hydration and Socket.IO updates accept V1 canonical state with epoch/version ordering and backend route authority. |
| Locally expired live state could leave a Marker/count/ETA visible | Resolved | T8 projects local expiry consistently and its deterministic plus isolated-browser tests cover expiry and newer-live restoration. |
| Route switching could restore stale/expired Marker | Resolved | Marker eligibility requires current live state, known matching route authority, and no local expiry; T8 tests cover R01 to R02 to R01. |
| Public connection/service failure is explained to riders | Resolved | Availability, StopInfo, ETA, Retry, canonical age, and preloader guidance distinguish the bounded existing snapshot/connection/canonical states without inventing causal diagnosis. Human/assistive-technology comprehension and deployed recovery remain release evidence. |
| Route-stop management UI existed | Resolved | The authenticated Routes page launches `RouteStopsModal`, which loads current order and active stops, prevents duplicate local selection, supports add/remove/reorder, reports errors, and publishes the full list. Build/lint/CI passed; no ambient admin browser workflow was run. |
| Admin sender/trip/history/exception operations existed | Partially Resolved | T12 adds a safe read-only source-health page. Mobile claim/revocation, credentials, active/timeout trips, history, and force-close remain absent. |
| Feedback had accountable triage | Partially Resolved | T12 adds the notice/receipt, Super Admin/Dev inbox, case transitions, password-confirmed delete/restore, and safe health page. T14 removes fabricated Public association and browser-verifies neutral auth hydration with no premature read, final Admin role denial, queue failure/retry, note/status, reasoned delete, payload-free restore, and dialog focus. Staff/rider human acceptance remains unavailable. |
| Admin role-specific UX enforced D-007 | Partially Resolved | Session hydration receives the server role, navigation hides the feedback inbox from `ADMIN`, and T14-S13 keeps unresolved hydration distinct from final denial while suppressing privileged reads. Backend authorization remains authoritative and general role management is out of scope. |
| Public/backend origin contract was settled | Resolved | T9 centralizes every listed REST/Socket consumer, defaults production to same origin, rejects unsafe/conflicting overrides, and removes hidden localhost rewrites/fallback loops. Focused tests pass; deployed proxy behavior remains Unable to Verify. |
| Research dashboard exposed raw diagnostic work appropriately | Still Present | No Dev Dashboard exists; this correctly avoids exposing raw telemetry but leaves D-004 research UI incomplete. |
| Static frontend technical quality met a production release baseline | Partially Resolved | The post-lifecycle score remains 15/20: every dimension is 3/4. One P1, five P2, and one P3 remain across residual accessibility/performance/responsive/integrity and Research. |
| Owner-selected Admin material/Login system was absent | Resolved | Signal Lens remains one fixed-light Admin/Login system with functional glass, opaque content, and accessibility fallbacks. |
| Rejected Login errors were preempted by protected-route navigation | Resolved | Login source is unchanged; rejected-request inline handling and other protected-request redirect behavior remain covered. |
| Native master-data mutation recovery was unsafe and non-semantic | Resolved | One shared typed feedback/confirmation composition replaces all three native paths and preserves exact requests, values, focus, and retry. |

## 4. Surface Assessment

| Surface | Current behavior | C-scope gap |
|---|---|---|
| Public tracker | Canonical/truth/keyboard behavior plus snapshot/connection explanation, canonical age, state-aware ETA, Retry/slow-load recovery, selected-route-only geometry, cancellable/reduced motion, measured 320 px non-overlap/44 px controls, and normalized route-color display. | Broader touch/device/human assistive-technology and deployed recovery evidence; route/dependency causal diagnosis requires a future server contract rather than UI inference. |
| Public feedback | Verified association, truthful states, programmatic category/form state, a named focus-trapped/restoring dialog, and measured light-surface contrast. | Runtime privacy/retention and human assistive-technology acceptance. |
| Admin shell/dashboard/Login | Bright-neutral Signal Lens shares semantic tokens, restrained functional glass, opaque operational content, responsive navigation, truthful map state, and exact inline rejected-Login recovery. | T11-backed exception/actions and human/runtime evidence. |
| Admin master data | Vehicles/Routes/Stops share Signal Lens hierarchy, truthful initial read states, desktop tables/Mobile cards, named 44 px actions, focus-contained CRUD/delete/route-order dialogs, pending locks, retained narrowed failure/retry, and persistent receipts. | Human/device evidence and an approved stateful browser/cache target for published-read confirmation. |
| Admin operations/support | Safe read-only source health and Super Admin/Dev feedback triage retain T12 policy while sharing Signal Lens ledgers, truthful initial and auth-hydration states, no premature privileged reads, named 44 px actions, responsive layout, and the sensitive dialog. | Human/device/runtime acceptance remains; claim, active/timeout exception, history, and recovery paths remain T11. |
| Research/Dev | None. | Separate authenticated comparison dashboard, reproducible filters and metric labels; not part of T9-T12 unless a future task says so. |

## 5. Task Placement

- T9 now consolidates REST/Socket origins and removes production fallback ambiguity through its
  exact D-008 handoff. Preserve the resolver; browser/proxy acceptance still requires an approved
  external target.
- T10 is complete for its narrow route-detail composition UI; preserve server-side validation and record stateful published-read evidence only on an approved target.
- T11 needs an operations UI only after backend authorization/lifecycle APIs and the external Android acceptance contract are specified. It must not embed an Android driver runtime or expose sender secrets/source identifiers.
- T12 has D-009 policy. Future triage/device views require explicit server role checks, privacy wording, retention/deletion controls, and read-only safe DTOs rather than generic admin CRUD.
- T14 has twelve accepted source IDs: `T14-S01` through `T14-S11` plus `T14-S13`. The Admin
  Feedback hydration slice is complete for this Frontend source/browser-regression contract at
  application-source baseline `c72feb9`; `T14-S12` remains deferred and is not counted. Dashboard &
  UX and downstream profiles may consume evidence baseline `9ff7e85`. `T14-S14` remains Proposed
  and blocked on the pending D-011/Public-UI choice at that evidence baseline. Public
  visual/product identity, DOM/copy/layout and valid
  observable behavior, Login
  presentation/behavior, page data/fields, T11 exceptions, Research/T13, API/auth/schema, Mobile,
  dependencies, and external runtime remain separate.

## 6. Usability and Technical Risks

Public tracker state remains broadly coordinated in useShuttleTracker, though supporting hooks
isolate map/realtime pieces. Public/Admin transport/listener mechanics now share one implementation,
while separate lifecycle instances and consumer-owned structural validation/canonical state remain
intentional. Admin cookie-presence protection and static dashboard language are UI resilience/
truthfulness issues; they are not authorization evidence. OSRM, Leaflet, geolocation, real reconnect
timing, accessibility, responsive behavior, marker density, and external tiles remain unverified
runtime dependencies.

### Impeccable technical audit evidence

| Dimension | Score | Current result |
|---|---:|---|
| Accessibility | 3/4 | Root/dialog/focus/form/sidebar plus scoped mutation/operations-support action, live-region, motion, touch, and contrast evidence exist; broader assistive technology and human evidence remain. |
| Performance | 3/4 | Selected-route/deduplicated geometry, cancellable marker motion, and bounded functional-layer blur are tested; raw images, external/global assets, and deployed budgets remain. |
| Responsive Design | 3/4 | The measured 320 px Public collision plus 390 px master-data forms/confirmations and operations-support ledgers/dialogs with audited 44 px targets are corrected; broader device/content/human coverage remains. |
| Theming | 3/4 | Signal Lens now supplies one documented fixed-light Admin/Login token and material system with accessibility fallbacks; broader cross-surface/platform evidence remains below a full release baseline. |
| Implementation Integrity | 3/4 | Product-specific separation, fail-closed truth projections, shared browser transport mechanics, exact Login rejection handling, and shared Admin mutation ownership are tested; remaining system ceilings persist. |
| **Total** | **15/20 — Below release baseline** | **0 P0; 1 open P1; 5 P2; 1 P3; 8 P1 and 5 P2 resolved by T14.** |

The final contrast detector has one reviewed advisory for the pre-existing tiled `map-bg` fallback;
it is an actual map canvas surface rather than a new decorative grid. Preserve selected-route request
budgets, motion cleanup, 36 px Public visuals/44 px targets, shared focus, canonical expiry/route
tests, fail-closed projections, code splitting, role-aware safe pages, and zero lint errors.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff; T10/T12 are complete for exact scopes. T11
requires backend contract/role gates and external Android acceptance evidence. T12 browser role/
human/assistive-technology acceptance is still unverified. T14 has twelve accepted source IDs:
`T14-S01` through `T14-S11` plus `T14-S13`. The latest
hydration slice is complete for this Frontend source/browser-regression scope at application-source
baseline `c72feb9`; `T14-S12` remains deferred and `T14-S14` remains Proposed/blocked on the pending
D-011/Public-UI choice at `9ff7e85`. Dashboard & UX and downstream profiles may consume this
evidence baseline.
Research remains blocked on T13.

Confidence is High for source-visible ownership and missing UI surfaces, Medium for synthetic
request/motion/viewport/contrast evidence, and Low for assistive-technology, production
configuration, real Socket.IO failures, hardware, Android, and operator/rider outcomes.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is needed to accept `T14-S13`. The bright-neutral Admin foundation, bounded
mutation-feedback outcome, shared browser transport implementation, and hydration truth-state are
complete for their exact scopes. The separate `T14-S14` proposal has no source handoff and remains
blocked on the pending D-011/Public-UI choice at `9ff7e85`. Further T14 planning must preserve
Public identity plus Login/page behavior and current endpoint/payload/auth ownership.

Frontend is validated at evidence baseline `9ff7e85` with application-source baseline `c72feb9`.
Dashboard & UX and downstream profiles may consume these baselines; Database remains independently
current at `1eec866...`.

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
