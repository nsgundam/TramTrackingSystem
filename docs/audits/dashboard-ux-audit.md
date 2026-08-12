# Dashboard & UX Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 9ff7e85b19bcbe17b6d810451904c0f981cb0571
- Evidence scope: PRODUCT.md, docs/project-knowledge-base.md,
  Product/Architecture/Backend/Frontend/Infrastructure & Device audits,
  DESIGN.md, .impeccable/design.json, docs/decision-queue.md, docs/research/, docs/tasks/,
  docs/operations/university-server-network-handoff.md, shuttle-tracking-web/app/,
  shuttle-tracking-web/components/, shuttle-tracking-web/config/,
  shuttle-tracking-web/hooks/, shuttle-tracking-web/services/, shuttle-tracking-web/types/,
  shuttle-tracking-web/utils/, shuttle-tracking-web/tests/, full current frontend check evidence,
  and the current Impeccable technical audit/detector pass
- Reviewed at: 2026-08-12T19:16:00+07:00
- Validation state: Validated
- Predecessor baselines: docs/audits/product-audit.md and docs/audits/frontend-audit.md @
  9ff7e85b19bcbe17b6d810451904c0f981cb0571; docs/audits/infrastructure-device-audit.md @
  1eec866b986b4cb4e802f7a48fac93e54e780699

## 2026-08-12 T14-S13 Admin Feedback session-hydration Dashboard & UX re-audit

Product and Frontend are validated at evidence baseline `9ff7e85`, with application-source baseline
`c72feb9`; Infrastructure & Device remains current at `1eec866...`. The exact application delta
from `70f42c1` is `shuttle-tracking-web/app/admin/feedback/page.tsx` and
`shuttle-tracking-web/tests/t14-admin-operations-support.spec.ts`, mapped by task
`docs/tasks/T14-admin-feedback-session-hydration-truth-state.md` and completion record `9a9cf5c`.
`T14-S13` is accepted for its bounded Dashboard & UX contract and becomes the twelfth accepted
source slice. The accepted ID set is `T14-S01` through `T14-S11` plus `T14-S13`, not “the first
twelve,” because `T14-S12` remains Deferred.

During unresolved `auth/me`, the route now shows the existing neutral polite verification state and
renders neither final denial nor inbox/ledger data; it issues no privileged Feedback reads. After
resolution, privileged roles retain the exact inbox and `ADMIN` retains exact denial. This is one
truthful state correction, not a redesign: no Public UI, persistent hierarchy, CSS/theme, Login,
role/API/payload/backend/schema, or T12 policy changes.

The Impeccable score remains **15/20 — below release baseline** with every dimension at 3/4, zero P0,
one P1, five P2, and one P3 open; resolved totals remain eight P1 and five P2. The concrete false-
denial subcase state is **Resolved** for bounded local source/browser evidence. Role-specific UX,
accountable Feedback, and the broader live-region/accessibility finding remain **Partially
Resolved**.

Measurement-first failed 1/1; final focused 1/1, operations 6/6, Login/material 5/5,
accessibility 4/4, Dashboard 2/2, lint/build, detector `[]`, full CI, and two finish reviews pass.
Login proof covers rejection/inline recovery and protected redirect only. No human, AT, physical-
device, deployed/proxy, security, or release acceptance is claimed. OSM/Public attribution remains
Deferred as `T14-S12`; optional vehicle association remains Proposed as `T14-S14` and blocked on the
pending D-011/Public-UI confirmation at `9ff7e85`. Production may consume this baseline; the design-
sidecar drift and unrelated migration remain excluded.

## T14 Re-audit Provenance

Superseded per-slice narratives were compacted on 2026-08-12. The current finding dispositions and
domain analysis below remain authoritative. Stable slice IDs and H/S/C/R provenance live in
`docs/roadmap/T14-scope-and-closure-ledger.md`; exact implementation and validation evidence stays
in the committed `docs/tasks/T14-*.md` records and Git history. This structural compaction changes
no evidence baseline, finding state, score, release determination, or owner decision.

## 1. Executive Summary

The repository has three deliberately separate UI audiences: a canonical-only public rider map, an authenticated but limited admin/master-data dashboard, and no current research dashboard. T8 is resolved for the limited rider projection: the map will not present a locally expired/non-live vehicle as live, and tests cover expiry, route switch, and newer-live restoration.

D-001=C requires more than that projection. T14 now gives riders truthful snapshot/connection/
service explanation, canonical age, state-aware ETA, Retry, and slow-load recovery, and gives Admin
explicit load/error/retry/snapshot/realtime/last-known states. T10
supplies Admin route-stop composition; T12 adds source health, feedback triage, and limited
role-specific navigation. Admins still lack trip/history/timeout exceptions and Mobile recovery.
The research scope remains a future authenticated developer surface and must not be exposed through
public/admin operations pages.

The owner approves substantial Admin Dashboard improvement but does not own the Public visual
surface. T14 must therefore preserve Public identity and split Admin restructuring into bounded
slices. T10 and T12 provide their exact bounded operations/data-policy surfaces; T11 remains
independently blocked. This audit does not authorize an unbounded redesign.

The required Impeccable re-audit scores the current frontend **15/20 — below the release baseline**
with no P0, one open P1, five P2, one P3, eight resolved P1, and five resolved P2 findings. Product-
specific truth/recovery/keyboard behavior, measured motion/request/viewport/contrast budgets, and
the bright-neutral Admin shell/Dashboard/Login/master-data/operations-support system are stronger,
`e6a04ad` resolves native master-data mutation recovery, `70f42c1` resolves duplicated browser
transport/listener ownership, and `c72feb9` resolves the concrete Admin Feedback hydration false-
denial subcase for their bounded local evidence. The accepted T14 ID set is `T14-S01` through
`T14-S11` plus `T14-S13`; `T14-S12` remains Deferred.
Exception-first operations and the missing Research surface still constrain release. Owner
refinement `a0a0ce1` remains implemented at `c4fdc3a`; the accepted hierarchy, content, state, focus,
responsive, and request contracts remain binding.

T9 changed how existing REST/Socket consumers select their backend, not what any surface displayed
or allowed. At that T9-only baseline, the UI score and all twenty technical findings were unchanged;
the T14 result above supersedes the two resolved and one narrowed truth findings.

## 2. Scope and Freshness

This profile reviews information architecture, truthfulness, separation of public/operations/research surfaces, loading/error/accessibility states, and task placement. It is not a browser usability study, accessibility certification, user research, device/pilot, or production service test.

Product and Frontend are revalidated at evidence baseline `9ff7e85`, with application-source
baseline `c72feb9`; Infrastructure & Device remains current at `1eec866...`. The preceding accepted
application baseline was `70f42c1`. Changed evidence is the exact two-file Admin Feedback hydration
delta, task `docs/tasks/T14-admin-feedback-session-hydration-truth-state.md`, completion record
`9a9cf5c`, focused and surrounding browser suites, fresh detector `[]`, and retained build/full-CI
evidence at `c72feb9`.
Browser evidence uses isolated fixtures, not a
university proxy, real service, assistive
technology, physical mobile device, user research, production traffic, or runtime retention; it is
not accessibility certification.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public/Admin Socket.IO lifecycle implementation was duplicated | Resolved | One shared implementation owns scoped transport/listener mechanics; each surface retains a separate instance and product-specific validation/canonical/UI authority. |
| Public expired/non-live Marker could overstate service | Resolved | T8 canonical projection and synthetic tests remove Marker/count/ETA at expiry and prevent route-switch recurrence until newer live state. |
| Public rider state was fully explanatory | Resolved | Availability, StopInfo, ETA, Retry, canonical age, and slow-load messaging distinguish the bounded snapshot/connection/canonical states the client can know without inventing causes. Human/assistive-technology comprehension and deployed recovery remain release evidence. |
| Admin live map had no state visibility | Partially Resolved | LiveMap exposes one responsive snapshot/realtime/canonical summary, retry, queued-version reconciliation, snapshot absence, and locally expired last-known state. T11-backed exception/action paths remain absent. |
| Admin dashboard was an accountable operations surface | Partially Resolved | Explicit loading/error/retry/updated master-data state, a primary canonical map, labelled inventory, and existing safe shortcuts replace false/flat hierarchy. No T11-backed exception summary or recovery actions exist. |
| Route-stop management journey existed | Resolved | The Routes page presents a shared semantic route-detail dialog for ordered active-stop add/remove/reorder and publish. The exact reordered payload is browser-verified; no stateful database/cache/public-read confirmation was run. |
| Feedback capture had staff triage/privacy journey | Partially Resolved | T12 implements notice/receipt, Super Admin/Dev triage, selected reason delete/restore, and safe health fields. T14 browser-verifies neutral unresolved-session hydration with no privileged read, resolved-role branches, truthful queue recovery, case actions/requests, and scoped form/dialog/sensitive-confirmation keyboard semantics; no human assistive-technology or runtime acceptance exists. |
| Research data had an appropriate dashboard | Still Present | No research route/UI has session/source/time filters, metric definitions, sample counts, uncertainty labels, drill-down or bounded export. Existing absence preserves the no-raw-public invariant. |
| Role-specific UX enforced the new hierarchy | Partially Resolved | The concrete unresolved-session false denial is Resolved: Feedback renders neutral verification and performs no privileged read until a server-returned role resolves; resolved `SUPER_ADMIN`/`DEV` inbox and `ADMIN` denial remain exact. General capability rendering, account lifecycle, research navigation, human role-denial acceptance, and runtime rollout remain absent. |
| Unresolved Admin session was projected as final Feedback role denial | Resolved | The held-auth measurement failed 1/1 before source; focused browser evidence now proves one neutral polite verification state, no denial/data/read before role resolution, and exact privileged/denied branches after resolution. |
| Dashboard public-theme direction had a bounded specification | Resolved | The owner-refined fixed-light Signal Lens shell/navigation/Login/modal/control foundation and accessibility fallbacks are implemented; Public identity remains separate. |
| Modal, focus, form, and document accessibility met a release baseline | Partially Resolved | Root/dialog/form/Mobile behavior plus mutation alert/status semantics, pending locks, focus restoration, reduced motion, audited 44 px targets, and scoped contrast evidence now exist. Broader assistive technology and human acceptance remain open. |
| Feedback vehicle association failed safely | Resolved | Public Feedback exposes loading/error/empty/retry, creates no fallback vehicles or selection, and only submits an explicitly chosen ID returned by a successful list. Pure and mobile-browser evidence cover failure, recovery, selection, and posted ID. |
| Rejected Admin Login errors recover inline | Resolved | Login source is unchanged; rejected-request inline handling and protected-request redirection remain covered. |
| Native master-data mutation recovery was unsafe and non-semantic | Resolved | All three resources now retain values/target on failure, block repeat pending actions, expose named contextual recovery and receipts, and use one focus-managed delete confirmation. |

## 4. Audience and Information Boundary

| Audience | Allowed present/future information | Prohibited/required separation |
|---|---|---|
| Public rider | Canonical route/stops/live state, neutral ETA, feedback and truthful service messaging. | No source identity, raw telemetry, credentials, research comparison, unrestricted history or admin actions. |
| ADMIN operations | Authorized route publishing, source/device/trip exception and feedback workflow data. | Must be server-authorized; not raw research diagnostic data or higher-privilege deletion/export by default. |
| SUPER_ADMIN/DEV | Approved privileged actions and separate research surfaces. | T12's bounded Feedback/fresh-auth actions exist; D-012 policy is approved but unimplemented, and no UI grants implicit authority. |
| Research developer | Session-scoped metrics/aggregates, data definitions, limitations, bounded exports. | Separate route/auth; displayed route conformance and reported accuracy must not be labeled ground truth. |

## 5. Required UX Task Placement

- T10 is complete for its route-detail management scope. Keep the post-save public-read confirmation as an approved-target validation need, not a claim based on modal source alone.
- T11 needs compact authenticated operations paths for active/auto-closed trips, protected history/detail, stale/silent exception, Mobile claim/revoke and audited emergency recovery only after backend APIs and Android acceptance evidence exist. Do not place driver runtime or sender secret entry in Admin UI.
- T12's Feedback inbox/status/assignment and read-only source-health views implement their bounded
  source/test contract. Preserve server-authorized actions and clear privacy/retention/delete/restore
  controls; runtime/human acceptance remains separate.
- T14's accepted ID set is `T14-S01` through `T14-S11` plus `T14-S13`. `T14-S13` is accepted for
  this Dashboard & UX source/browser contract at application baseline `c72feb9`; `T14-S12` remains
  Deferred, and proposed `T14-S14` is blocked on the pending D-011/Public-UI choice recorded at
  `9ff7e85`. Production Readiness and Roadmap may consume this evidence. Admin Login, Public visual/
  product identity, DOM/copy/layout and valid observable behavior,
  page data/fields, T11 exceptions, Research/T13, API/auth/schema, Mobile, dependencies, and external
  runtime remain separate.

## 6. Impeccable Technical Audit

### 6.1 Audit health score

| Dimension | Score | Key finding |
|---|---:|---|
| Accessibility | 3/4 | Root/dialog/form/sidebar plus mutation/operations-support named actions, alert/status semantics, scoped motion/touch/contrast, and Availability/ETA/preloader status evidence exist; broader assistive-technology and human evidence remain. |
| Performance | 3/4 | Selected-route/deduplicated geometry, owned marker cancellation, and bounded functional-layer blur are tested; raw/external/global assets and deployed budgets remain. |
| Responsive Design | 3/4 | The measured 320 px Public collision plus 390 px master-data forms/confirmations and operations-support ledgers/dialogs with audited 44 px targets are corrected; broader device/content/human coverage remains. |
| Theming | 3/4 | One documented fixed-light Signal Lens Admin/Login system and its accessibility fallbacks are implemented; broader cross-surface/platform evidence remains below a full release baseline. |
| Implementation Integrity | 3/4 | Product-specific separation, fail-closed truth projections, no-read session hydration, shared browser transport mechanics, exact Login rejection handling, and shared Admin mutation ownership are tested; remaining system ceilings persist. |
| **Total** | **15/20 — Below release baseline** | **0 P0; 1 open P1; 5 P2; 1 P3; 8 P1 and 5 P2 resolved by T14.** |

Implementation integrity verdict: **Improved but not release-ready.** The rider map, source health,
feedback, and route operations are product-specific, and T14 removes the known false live/zero/
vehicle claims. Missing exception-first operations, human/assistive-technology evidence, deployed
recovery, broader live/touch coverage, and human/device evidence keep Dashboard/UX below the
release baseline.

### 6.2 P1 findings

1. **Root document accessibility — Resolved for source/browser scope.** User zoom is unrestricted,
   the Public root is Thai, and Admin declares its English content boundary.
2. **Systemic dialog/focus failure — Resolved for listed surfaces.** One typed focus hook supplies
   named modal semantics, initial/wrapped focus, safe Escape, and restoration across every listed
   Public/Admin dialog; focused browser journeys cover the representative flows.
3. **Form naming and selected state — Resolved for listed controls.** Feedback category state,
   Login/CRUD/route-stop controls, internal note, deletion reason, and password have programmatic
   names/associations; browser locators verify the primary flows.
4. **Off-screen Mobile navigation — Resolved.** Breakpoint-aware `inert`/`aria-hidden`, modal focus,
   Escape/restoration, `aria-current`, and focus-visible styles pass Mobile and Desktop browser checks.
5. **Public service explanation — Resolved for bounded existing-state source/browser scope.**
   Availability, StopInfo, ETA, canonical age, Retry, and slow-load messaging now distinguish the
   snapshot/connection/canonical states the client can know. A route/dependency causal diagnosis is
   unavailable server data and must not be guessed; human/assistive-technology comprehension and
   deployed recovery remain release evidence.
6. **Admin operational truth — Resolved for T14 first slice.** Counts preserve loading/error/ready
   truth and the map reconciles snapshot/event/local-expiry state. Exception-first summaries and
   actions remain a separate product gap, not a false-state regression.
7. **False Feedback vehicle — Resolved.** Failure/empty responses create no option or selection;
   recovery requires a verified response and explicit selection before submit.
8. **Contrast governance — Resolved for audited source/browser scope.** One semantic light-surface
   foreground removes the enumerated non-disabled 400-level failures; one shared badge preserves
   valid route backgrounds and chooses >=4.5:1 text. Pure 4/4 and browser 2/2 pass. This is not
   human, assistive-technology, physical-device, dark-theme, or deployed acceptance.
9. **The Dev/Research Dashboard is absent.** There is no protected route/navigation for session,
   source, device, firmware, time, sample count, missingness, metric definitions, uncertainty,
   drill-down, or bounded export.

### 6.3 P2 and systemic findings

- **Partially Resolved:** Availability, ETA, preloader, and Admin Feedback verification changes now
  expose scoped truthful status announcements; loading/error/success/connection changes elsewhere
  still lack consistent `aria-live`/`role=status`.
- **Resolved:** For scoped source/browser evidence, known pulse/preloader, marker, map fly/pan, and
  station-list motion now honor `prefers-reduced-motion`; no human vestibular acceptance occurred.
- **Resolved:** initial geometry is selected-route-only/deduplicated and one owned marker animation
  cancels on replacement/removal/cleanup, with 4/4 unit and 2/2 browser evidence.
- **Resolved:** For bounded source/unit/browser-regression evidence, Public/Admin Socket.IO
  construction, listener, connection-signal, and cleanup mechanics now have one implementation;
  each consumer retains its separate canonical/UI policy.
- **Still Present:** Public stop images use raw `<img>` without dimensions/lazy/error handling; the Admin map icon is
  externally hosted; Material Symbols load globally for a deferred tour.
- **Resolved:** For bounded source/browser evidence, Signal Lens supplies the shared fixed-light Admin/
  Login functional-glass layer and reduced-transparency/forced-contrast/no-filter fallbacks. The
  Dashboard update label is explicitly Bangkok time, while broader timestamp policy remains.
- **Partially Resolved:** OSM attribution remains disabled/hidden. The measured controls/collision portion is resolved:
  Public targets are 44 px around retained 36 px visuals, route-order targets are 44 px, and the
  240 px dock does not collide at 320 px.
- **Partially Resolved:** The scoped stop thumbnail is now a semantic button; raw image sizing/loading/error behavior remains.
  Vehicles/Routes/Stops/Source Health/Feedback initial failures are inline, distinct
  from empty, and retryable. **Resolved:** For bounded source/browser evidence, master-data save/delete
  paths now expose semantic retained recovery and shared destructive confirmation.

### 6.4 Detector verification and positive evidence

The final Signal Lens detector and fresh Level 1 repeat return `[]`; the finish reviewer reports
`PASS`. The broader contrast pass retains one reviewed advisory for the pre-existing tiled `map-bg`
fallback, an actual map surface rather than a new decorative grid. Detector/reviewer output is not
accessibility or human acceptance evidence.

Positive evidence to preserve: public map/tour/feedback code splitting, memoized public components,
deterministic canonical expiry/route tests, explicit device-health privacy text, shared Admin
resource/dialog ownership, named actions, accessible ordered-list/alert semantics in
RouteStopsModal, responsive Admin card/table splits, and lint with zero errors.

No new Impeccable fix command is recommended by this bounded re-audit. Preserve the verified
mutation contract; existing open findings remain governed by their Roadmap dependencies and evidence
gates rather than an unscoped polish pass.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff under D-008. T10/T12 are complete for exact
scopes. T11 needs backend/role/lifecycle and external Android evidence. T12 human/runtime acceptance
remains unverified. The accepted T14 ID set is `T14-S01` through `T14-S11` plus `T14-S13` at
application baseline `c72feb9`; `T14-S12` remains Deferred. Production Readiness and Roadmap may
consume this evidence. Research stays blocked on T13. No new owner decision is required to accept
`T14-S13`; proposed `T14-S14` remains blocked on the pending D-011/Public-UI choice at `9ff7e85`.

Confidence is High for source-visible separation/ownership, Medium for synthetic request/motion/
viewport/contrast/material evidence, and Low for assistive technology, user comprehension, real
operations, devices, and deployed outcomes.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed for acceptance of `T14-S13`. D-011's shared bright-neutral Admin
Liquid Glass foundation, bounded CRUD mutation feedback, internal browser transport refactor, and
Admin Feedback hydration correction are accepted for their exact scopes while preserving Public
identity and all Login/page contracts. Proposed `T14-S14` is not authorized: it remains blocked on
the pending D-011/Public-UI choice recorded at `9ff7e85`; `T14-S12` remains Deferred.

Dashboard & UX is validated at evidence baseline `9ff7e85`, with application-source baseline
`c72feb9`, current predecessors, and the technical audit.
Production Readiness and Roadmap may consume these results; Security/DevOps/Observability remains
independently current at `1eec866...`.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: accountable feedback triage and safe source operations were absent from the admin journey
— Partially Resolved.** The admin sidebar now distinguishes a Super Admin/Dev feedback inbox from an
all-admin, read-only source-health surface. The inbox exposes case status, responsible actor, bounded
note, selected deletion reason, restore deadline, and a recent-password confirmation. The health page
has explicit empty/loading/error text and explains that recovery/credential actions do not belong
there. These pages are separate from the existing dashboard, so the static dashboard label and lack of
an exception-first summary remain **Still Present**.

At the T12 checkpoint no browser usability, keyboard/focus, screen-reader, role-denial, or staff
acceptance run was authorized. T14 now supplies scoped keyboard evidence and the later bounded
Admin hierarchy foundation, but human/assistive-technology acceptance and T11-backed operations
remain independent findings.

## 10. M-20260807-02/03 Predecessor Re-audit — 2026-08-07

The simulator and generated-test-artifact maintenance changes no rider/admin component, route, state
model, styling, or browser behavior. Infrastructure & Device is current again and retains the rule
that simulator output is test evidence only. The technical audit above newly makes existing
accessibility and integrity defects explicit; it does not authorize a redesign or claim browser/user
acceptance.
narrowed: human/AT, other async announcements, general account lifecycle, Research navigation, and
runtime acceptance remain open.
