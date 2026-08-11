# Architecture Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 70f42c15948bf09e71a3c91d594a4c21f52db23b
- Evidence scope: PRODUCT.md, docs/project-knowledge-base.md, docs/audits/product-audit.md,
  DESIGN.md, .impeccable/design.json,
  docs/decision-queue.md, docs/research/, docs/tasks/, docs/operations/, README.md,
  Compose/environment configuration and scripts, shuttle-tracking-backend/src/,
  shuttle-tracking-backend/prisma/, shuttle-tracking-backend/tests/,
  shuttle-tracking-web/config/, shuttle-tracking-web/hooks/, shuttle-tracking-web/utils/,
  shuttle-tracking-web/types/, shuttle-tracking-web/services/,
  shuttle-tracking-web/components/, shuttle-tracking-web/tests/, and the T11 v3 external Mobile
  compatibility brief
- Reviewed at: 2026-08-11T19:28:00+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md @ 1eec866b986b4cb4e802f7a48fac93e54e780699;
  docs/audits/product-audit.md @ 70f42c15948bf09e71a3c91d594a4c21f52db23b

## 2026-08-11 T14 shared browser Socket.IO lifecycle architecture re-audit

Discovery remains validated at `1eec866...`; Product is validated at `70f42c1`. Architecture-
relevant application evidence changes from `e6a04ad` only in the exact lifecycle task, one new
browser transport implementation boundary, its Public/Admin consumers, focused tests, and package
script. Completion record `535ec73` maps the exact implementation and local evidence limits. The
eleventh T14 slice is **Complete for its exact frontend architecture contract**.

`browserSocketLifecycle.ts` is now the sole scoped production implementation owner for Socket.IO
construction, Socket and Manager listener registration/removal, explicit connect/disconnect, first-
versus-later connection signaling, unknown payload forwarding, and idempotent disposal. Each Public
or Admin consumer starts its own lifecycle instance; this is not a global socket singleton, shared
connection-state store, or new domain authority. The boundary does not import canonical DTOs,
React, maps, hydration, snapshots, Retry, queues, or expiry timers.

Public/Admin retain required-field structural narrowing with strict string-enum checks, canonical
acceptance/version authority, snapshot/hydration order, queue/reconciliation/failure replay, map/
zoom processing, Retry, and canonical expiry. Valid canonical payload behavior and handling order
remain exact; payloads with invalid required structure, coercive enum values, or Public source
identity fail before consumer use.
`backendConnection.socketOrigin`, `autoConnect: false`, event names, and consumer-specific initial/
reconnect sequencing remain unchanged.

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public/Admin browser Socket.IO lifecycle implementation was duplicated and could drift | Resolved | One shared implementation boundary owns scoped browser transport/listener mechanics; consumers retain structural validation and every canonical/UI authority. |
| Vehicle and source identity were conflated | Resolved | Public rejects source identity; Admin retains its internal optional source projection. |
| Trip lifecycle lacked one owner | Resolved | Operations remains authoritative; no lifecycle writer was added. |
| Canonical current state was untyped/consumer-owned | Resolved | Backend V1 authority remains; consumers still validate and version-order the projection. |
| Raw diagnostics and temporal semantics were absent | Partially Resolved | T7 remains bounded; producer clocks and physical replay remain unverified. |
| Redis current state is durable truth | Still Present | No durable current-state recovery/replay was added. |
| Route-stop cache ownership is incomplete | Resolved | T10 authority remains unchanged. |
| Realtime fan-out/scaling is proven | Unable to Verify | No rooms, replay, load, distributed recovery, or deployed measurement was added. |
| Public/admin service-state behavior is an operational contract | Partially Resolved | Truthful consumer projections and ordering remain; history, actionable exceptions, causal diagnosis, and deployed recovery are incomplete. |
| Production topology and REST/Socket origin authority were unresolved | Partially Resolved | T9 repository authority remains; external TLS/proxy/recovery/capacity evidence is unavailable. |
| Shared Admin material/Login presentation authority was absent | Resolved | No presentation path changed; Signal Lens remains authoritative. |
| Login rejection shared protected-route redirect behavior | Resolved | Login source is unchanged; bounded rejection/redirect regressions pass. |
| Native/page-local mutation feedback lacked one shared semantic presentation/focus boundary | Resolved | The accepted shared mutation composition remains unchanged. |

The direct-owner measurement failed 1/1 against both incumbent consumers. A later strict-enum/
source-identity measurement failed 1/1 before repair; final focused lifecycle 4/4, T8 2/2, T9 5/5,
T14 pure 8/8, bounded browser 16/16, scoped detector `[]`, production build, full CI, and two finish
reviews pass. Reconnect/disposal proof is fake-transport/source evidence; no browser suite forces a
reconnect or zoom-time event. No deployed transport, load, ambient state, human/AT, device, or
operations claim is added. No Level 2 or owner decision is required. Frontend and downstream
profiles may consume this validated baseline; the unrelated dirty Feedback-role migration is
excluded.

## 2026-08-11 T14 Admin master-data mutation-feedback re-audit — superseded by shared lifecycle evidence

Discovery remains validated at `1eec866...`; Product is validated against `e6a04ad`. Architecture-
relevant evidence changes only the bounded Admin mutation pages, CRUD/shared modal components,
semantic CSS, and deterministic browser coverage recorded by completion records `8ebdf9a` and
`e5f6422`. The tenth T14 slice is **Complete for its exact frontend architecture contract**.

`AdminMutationFeedback.tsx` is one typed presentation boundary for the established non-empty server
`error` string or resource fallback, semantic receipt, and shared delete-confirmation composition.
Each resource page remains the owner of endpoint selection, immutable target identity, request
snapshot, read refresh, and local save/delete/receipt state. Ref-backed in-flight guards are the
local synchronous repeat-invocation guard within each mounted page; shared controls mirror that
state through disabled and `aria-busy` presentation. Server authorization and mutation authority
remain unchanged. Keyed modal sessions and synchronous form initialization keep the selected
record/DTO coherent without moving data ownership into the modal shell.
The bounded target-identity repair adds the immutable selected ID to the confirmation presentation
and its accessible description; it does not change request identity or deletion authority.

Vehicle, Route, and Stop POST/PUT/DELETE endpoints and bodies remain exact, including disabled edit
IDs and the existing Stop `imageUrl`/numeric projection. T10 route-stop replacement remains exactly
`{ stopIds: ["ST02", "ST01"] }`. No dependency, authorization, API/schema, persistence, cache,
canonical state, backend, Public/Login source, Mobile, Research, or external-runtime authority
changed. The helper excludes arbitrary caught objects and sibling debug payloads; it does not create
a server error-classification or redaction contract.

Measurement-first coverage failed 4/4 before source and the later target-identity assertion failed
1/1 before repair. Final master-data coverage passes 8/8 after exact request-ID, modal-
initialization, and confirmation-identity repairs. Accessibility 4/4, Admin Login/material 5/5,
Dashboard 2/2, operations support 5/5, detector `[]`, visual finish review `PASS`, the production build, and
full repository CI pass. These establish local composition only, not deployed transport, ambient
database/cache publication, human/assistive-technology, device, or operations behavior.

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Vehicle and source identity were conflated | Resolved | The frontend-only slice does not change TrackingSource/Vehicle authority or public omission. |
| Trip lifecycle lacked one owner | Resolved | Operations remains authoritative; no lifecycle writer was added. |
| Canonical current state was untyped/consumer-owned | Resolved | Existing V1 canonical authority and projections are untouched. |
| Raw diagnostics and temporal semantics were absent | Partially Resolved | T7 remains bounded; producer clocks and physical replay remain unverified. |
| Redis current state is durable truth | Still Present | No durable current-state recovery/replay was added. |
| Route-stop cache ownership is incomplete | Resolved | T10 transaction/invalidation authority and ordered request remain unchanged. |
| Realtime fan-out/scaling is proven | Unable to Verify | No rooms, replay, load, or deployed measurement was added. |
| Public/admin service-state behavior is an operational contract | Partially Resolved | Existing truthful service-state projections are unchanged; history, actionable exceptions, causal diagnosis, and deployed recovery remain incomplete. |
| Production topology and REST/Socket origin authority were unresolved | Partially Resolved | T9 repository authority remains; external TLS/proxy/recovery/capacity evidence remains unavailable. |
| Shared Admin material/Login presentation authority was absent | Resolved | Mutation content reuses the established Signal Lens glass/opaque material tiers. |
| Login rejection shared protected-route redirect behavior | Resolved | Login source is unchanged; rejected-request, inline-error, protected-route redirect, and material regressions pass. |
| Native/page-local mutation feedback lacked one shared semantic presentation/focus boundary | Resolved | One shared feedback/confirmation composition now owns semantics/focus and visible/accessibly described immutable target identity while each page retains request, pending state, and DTO authority. |

No Level 2 or owner decision is required. Frontend and the downstream affected profiles consume this
Architecture baseline; further source selection remains owned by the revalidated Roadmap.
Three deliberately page-owned mutation state machines remain a non-blocking drift risk; one table-
driven all-resource suite currently enforces their shared request/feedback invariants. The unrelated
dirty Feedback-role migration is excluded from the immutable `e6a04ad` evidence.

## 2026-08-10 T14 bright-neutral Admin Liquid Glass foundation re-audit — superseded by mutation-feedback evidence

Discovery remains current at `1eec866...`; Product is validated against `c4fdc3a`. The ninth T14
slice is **Complete for its exact frontend architecture contract**. One Admin layout marker and one
semantic stylesheet now own the fixed-light white/gray material system across authenticated routes
and Login. Sidebar/Mobile navigation, contextual controls, shared modal chrome, and Login are the
bounded glass layer; maps, tables, ledgers, cards, and form content retain opaque operational
materials. Reduced-transparency, increased/forced-contrast, reduced-motion, and unsupported-filter
fallbacks remain presentation branches rather than new application state authorities.

The only behavior repair is local to the shared Axios response boundary: an exact rejected
`auth/login` request clears a stale Admin cookie and preserves the typed rejection for inline form
handling, while every other 401/403 retains hard Login redirection. Endpoint, request DTO, successful
session ownership, server authorization, domain/page data ownership, schema, persistence, cache,
backend, Mobile, and Public boundaries are unchanged. Focused 5/5 browser evidence, prior Admin
regressions, production build, detector `[]`, finish review, and full CI validate local composition;
they do not establish deployed or human behavior.

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Vehicle and source identity were conflated | Resolved | The presentation slice does not change TrackingSource/Vehicle authority or public omission. |
| Trip lifecycle lacked one owner | Resolved | Operations remains authoritative; no lifecycle writer was added. |
| Canonical current state was untyped/consumer-owned | Resolved | Existing V1 canonical authority and projections are untouched. |
| Raw diagnostics and temporal semantics were absent | Partially Resolved | T7 remains bounded; producer clocks and physical replay remain unverified. |
| Redis current state is durable truth | Still Present | No durable current-state recovery/replay was added. |
| Route-stop cache ownership is incomplete | Resolved | T10 transaction/invalidation authority is unchanged. |
| Realtime fan-out/scaling is proven | Unable to Verify | No rooms, replay, load, or deployed measurement was added. |
| Public/admin service-state behavior is an operational contract | Partially Resolved | Existing truthful projections remain; history, actionable exceptions, causal diagnosis, and deployed recovery remain incomplete. |
| Production topology and REST/Socket origin authority were unresolved | Partially Resolved | T9 repository authority remains; external TLS/proxy/recovery/capacity evidence remains unavailable. |
| Shared Admin material/Login presentation authority was absent | Resolved | `c4fdc3a` establishes one documented Signal Lens authority without moving page/domain ownership. |
| Login rejection shared protected-route redirect behavior | Resolved | Only exact `auth/login` rejection bypasses navigation; all other 401/403 responses retain the incumbent redirect. |

The next architecture-safe unit is master-data mutation feedback under a new exact-path handoff. It
may replace native page-local `alert`/`confirm` calls with typed local action state and the existing
shared confirmation/focus boundary, but must not move request, DTO, authorization, destructive-
intent, route-stop, API, schema, Public, or session ownership. No Level 2 or owner decision is needed.

## 2026-08-10 D-011 Admin Liquid Glass direction re-audit — superseded by built foundation evidence

Product is revalidated at `a0a0ce1`; Discovery and the first eight T14 source implementations remain
current at their recorded baselines. The new owner direction changes presentation architecture only:
one Admin shell/token/material authority must cover navigation, Login, shared modals/controls, and
the existing semantic page primitives. Domain pages retain request, DTO, role, canonical-state,
cache, persistence, and error-state ownership.

The architecture-safe foundation is primarily shared Admin layout, Sidebar, Login classes, and
semantic CSS. Glass belongs to the functional navigation/control/modal layer; dense tables, ledgers,
forms, and map content use more opaque materials. Tokenized light/dark context plus reduced-
transparency, forced/increased-contrast, reduced-motion, and unsupported-filter fallbacks prevent a
CSS effect from becoming a second behavior or accessibility authority.

This shared foundation must precede master-data mutation feedback so new notices and confirmation
components consume one stable system. It requires no backend, API/auth/schema, dependency, data,
cache, Mobile, Research, or external-runtime change and no Level 2 decision. Public/Login auth
behavior remains intact; only the Admin Login presentation joins the foundation.

## 2026-08-10 T14 Admin operations-support convergence re-audit — superseded for Admin visual direction

Product is revalidated at `23b4d6f...`; Discovery remains current at `1eec866...`. The eighth T14
slice extends the typed `AdminResourcePage` hierarchy, semantic state/notice/action vocabulary, and
existing `AdminFormModal` focus lifecycle to Source Health and Feedback Inbox. Each page retains
request ownership and endpoint selection. Source Health keeps the safe DTO allowlist and read-only
boundary; Feedback keeps its role gate, state graph, trimmed note/status PATCH, fresh-auth delete
reason, and payload-free restore. Initial read failure, verified empty, and ready data are now one
mutually exclusive local projection rather than a second data or permission authority.

No dependency, endpoint, schema, persistence, cache, authorization, retention, canonical-state
model, external asset origin, backend, or Mobile behavior changed. Focused browser 5/5, every earlier
frontend regression, the 11-route Turbopack build, detector `[]`, and full repository CI establish
local composition only; stateful retention/database, human/assistive-technology, device, deployed,
and operations evidence remain open.

The next architecture-safe unit is bounded replacement of native Vehicles/Routes/Stops mutation
alert/confirm flows with local inline action state and the existing semantic Admin confirmation/focus
contract. It must preserve page request ownership, endpoint/payload/auth behavior, delete intent,
modal DTOs, and T10 route-stop authority. Public/Login, T11, Research, schema/API/auth, Mobile, and
external-runtime work remain separate.

## 2026-08-10 T14 Admin master-data theme-convergence re-audit — superseded for operations-support findings

Product is revalidated at `4e609e3...`; Discovery remains current at `1eec866...`. The seventh T14
slice introduces one typed `AdminResourcePage` hierarchy and one `AdminFormModal` focus/presentation
shell across Vehicles, Routes, Stops, and route-stop ordering. The existing page components retain
request ownership and endpoint selection; each initial list read now owns a narrowed
loading/error/empty/ready state, and Retry reuses that same read boundary. Route-color normalization,
CRUD form DTOs, native validation, active-stop filtering, ordered replacement, and the published
`stopIds` contract remain authoritative where they were before.

No dependency, endpoint, schema, persistence, cache, authorization, canonical-state model, external
asset origin, backend, or Mobile behavior changed. The shared components remove repeated
presentation/focus structure without creating a second data or permission authority. Fresh focused
browser 4/4, all earlier frontend regressions, the 11-route build, detector `[]`, and full repository
CI establish local composition only; stateful cache/database publication, human/assistive-
technology, device, deployed, and operations evidence remain open.

The next architecture-safe unit is bounded convergence of the existing Source Health and Feedback
Admin pages. It may reuse semantic Admin state/action/dialog primitives and correct error-plus-empty
projection, but must preserve T12's read-only DTO, role gates, privacy/retention copy, status graph,
fresh-auth delete/restore contract, and current APIs. Public/Login, T11, Research, schema/auth/API,
Mobile, and external-runtime work remain separate.

## 2026-08-10 T14 Public service explanation/recovery re-audit — superseded for Admin master-data findings

Product is revalidated at `db72310...`; Discovery remains current at `1eec866...`. The sixth T14
slice adds a typed `PublicVehicleSnapshotState` and one pure Public presentation projection that
combines the existing snapshot outcome, Socket.IO connection state, canonical service state, and
accepted canonical timestamp. `useShuttleTracker` remains the snapshot/realtime owner; Retry calls
the existing snapshot boundary and guards overlapping requests rather than creating another data
authority. ETA remains numeric only for authoritative connected-live input.

The change adds no dependency, endpoint, schema, persistence, cache, authorization, canonical-state
model, external asset origin, or backend/mobile behavior. It deliberately cannot identify a route-
or dependency-specific failure cause because no such contract exists. Pure 8/8, Public browser 2/2,
the 11-route build, and full repository CI establish local state projection and recovery behavior
only; deployed transport/recovery, history/exceptions, human comprehension, and assistive-
technology evidence remain open.

The next eligible architecture-safe unit is a bounded Admin master-data presentation convergence
slice that reuses the existing `.admin-shell` semantic tokens and current page/API/auth ownership.
It must exclude Public/Login, T11/Research, schema/API/auth changes, and any second state authority.

## 2026-08-10 T14 Admin Dashboard foundation re-audit — superseded for Public service findings

Product is revalidated at `0a0fe58...`; Discovery remains current at `1eec866...`. One Admin-only
stylesheet scopes semantic canvas/surface/text/border/navigation/focus/status tokens under
`.admin-shell`; the Login branch and every Public surface remain outside that boundary. The
Dashboard uses one typed metric-definition list for repeated presentation and retains the existing
API/list-validation/count authority. Sidebar presentation still consumes the established Auth
context and role hierarchy rather than creating a second permission model.

`LiveMap` changes only the status surface and map container presentation. Snapshot-first hydration,
queued version reconciliation, local expiry, Socket lifecycle, canonical projection, markers, and
T6's exact unknown-state source expression remain authoritative and pass boundary/browser tests.
The first full-CI attempt caught that source expression being obscured by markup; the repaired form
and final full CI pass. No dependency, endpoint, schema, persistence, cache, authorization,
canonical-state model, external asset origin, or backend/mobile behavior changed.

The architecture can next support a bounded Public explanation/recovery slice only through current
typed connection/canonical state. An exact handoff must stop if route/dependency-specific causes
would require a new server contract; it may not infer them in presentation or become a second state
authority.

## 2026-08-09 T14 contrast/color-governance re-audit — superseded for Admin Dashboard findings

Product is revalidated at `f42a2bb...`; Discovery remains current at `1eec866...`.
`utils/colorContrast.ts` is one pure display boundary for untrusted route-color normalization,
luminance, ratio, and readable foreground selection. `RouteColorBadge` owns the invariant that a
badge derives background and text from the same normalized value; Public route dots and Admin route
swatches reuse normalization. The semantic muted-on-light token is scoped to audited light surfaces
rather than replacing dark-surface tokens globally.

The change adds no dependency, server validation, API, schema, authorization, persisted color
mutation, canonical state, or second product/data authority. Pure 4/4, browser 2/2, the 11-page
build, and full CI establish local display behavior only. Human/assistive-technology/device/dark-
theme/deployed outcomes remain unverified, and the unrelated dirty Feedback-role migration remains
excluded.

## 2026-08-09 measured Public map-quality re-audit — superseded for contrast findings

Product is revalidated at `7aae795...`; Discovery remains current at `1eec866...`. Existing
`useRouteGeometry` remains the owner of stop/geometry layers, but now deduplicates pending work,
records only successful routes as ready, and loads the selected route rather than every catalog
entry. Successful layers/cache remain reusable and route selection remains the same authority.
`utils/motion.ts` is one pure typed boundary for frame scheduling, cancellation, reduced-motion map
options, and scroll behavior; `useVehicleTracking` owns one canceller per vehicle and cleans it up.

The change adds no dependency, server/cache format, API, schema, authorization, canonical state, or
second route authority. Unit/browser/full-CI evidence proves local request/cancellation/viewport
budgets, not deployed OSRM latency, device rendering, capacity, or human experience. The unrelated
dirty Feedback-role migration remains excluded.

## 2026-08-09 accessibility/navigation re-audit — superseded for map-quality findings

Product is revalidated at `378818f...`; Discovery remains current at `1eec866...`. T14 now owns the
scoped dialog lifecycle through one strict client hook rather than repeating focus query, Tab,
Escape, and restoration logic across Public/Admin surfaces. Page components retain their data and
action ownership. Mobile drawer visibility derives from the existing `lg` breakpoint through
`useSyncExternalStore`, so `inert` is applied only to the off-screen Mobile navigation; desktop
navigation does not inherit Mobile state.

The shared boundary is exercised through 4/4 browser journeys and full TypeScript production build/
CI. It adds no dependency, server contract, schema, cache, authorization, or second product-state
authority. DOM/browser behavior is not an assistive-technology or deployed-runtime proof, and the
unrelated dirty Feedback-role migration remains excluded.

## 2026-08-09 truth-slice re-audit — superseded for accessibility findings

Product is revalidated at `bd34552...`; Discovery remains current at `1eec866...`. T14 preserves the
single backend-owned `CanonicalVehicleStateV1` authority and adds typed, pure frontend projections
instead of creating another service-state model. Public presentation combines canonical counts with
the actual Socket.IO connection state. Admin presentation treats the successful snapshot as the
base, removes snapshot-absent vehicles, queues events during hydration, lets the newer version win,
and locally expires live data into last-known state. The Service Worker bypass for `/socket.io/`
prevents an offline cache/fallback from becoming a second realtime transport authority.

This is source, deterministic-test, local-browser, and CI evidence only. Public and Admin socket
lifecycle code remains independently implemented and can drift; Redis loss/replay, distributed
fan-out, deployed transport, history/exceptions, and the T11 lifecycle remain unresolved. The
unrelated dirty Feedback-role migration was excluded from this baseline and no schema/backend
behavior changed; the T6 edit is a compatibility assertion only.

## 2026-08-08 decision/Mobile snapshot — superseded for T14 findings

Discovery and Product are current at `1eec866...`; application source in this repository is
unchanged. The pinned external Android source confirms a concrete consumer of the present
`vehicle-login`/Trip/Socket.IO contract, but also exposes contract drift: the client persists and
replays a static Source ID/secret while T11 requires installation enrollment, a protected refresh
credential, a non-secret vehicle selector, exclusive claim/version state, and authoritative
idempotent Trip recovery. The safe architecture remains one versioned cross-repository state machine
with server-owned claims/lifecycle; retaining old and new authentication contracts indefinitely
would create two authorities.

D-012 now supplies the future least-privilege account/Sender/deletion/recovery policy, closing the
owner question but not the schema/service/session/audit implementation. D-011 authorizes a bounded
T14 truth/integrity slice and preserves the Public visual identity. Neither decision changes current
runtime boundaries.

## 1. Executive Summary

The current monolith remains an appropriate implementation shape, but D-001=C raises the operational requirements imposed on it. Express/Socket.IO is the boundary for public, admin, sender, and TTN traffic; PostgreSQL/PostGIS owns durable operational and research records; Redis owns transient canonical state, caches, throttles, and Socket.IO fan-out. Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN/Webhook remain distinct acquisition paths that converge on one normalization/canonical-selection boundary.

T6/T8 give public consumers one versioned canonical projection: only an authoritative, unexpired live state displays a Marker, contributes to active count, or supplies ETA. This is a local truthfulness correction, not public service-state or operations accountability. T7 adds bounded raw research records, distinct from canonical state and sampled GPSTrack, so raw diagnostics must not leak into public/admin operational projections.

The C-scope architecture still lacks protected history/exception/read models and the Mobile
installation/claim/timeout state machine. D-008 now declares a university-managed single-host,
single-origin logical topology and operations handoff. T9 now statically validates the repository
template, runtime/origin authorities, and runbook; the external runtime remains unvalidated.
T10/T12 supply their bounded route-stop, authorization, Feedback and
safe-view boundaries. None is a reason to split the appropriate monolith into unrelated services.
T14 now also centralizes repeated Admin master-data presentation and dialog focus structure while
leaving each request, DTO, authorization, and mutation contract at its incumbent boundary. Source
Health and Feedback now consume the same presentation/focus vocabulary without moving their T12
safe-field, role, lifecycle, or request authority. Owner refinement `a0a0ce1` now requires those
shared presentation boundaries to consume one bright-neutral Admin Liquid Glass material/token
foundation; `c4fdc3a` implements it without moving domain or request ownership.
Source baseline `e6a04ad` now replaces the three page-local native mutation recovery paths with one typed
feedback/confirmation composition while resource pages retain endpoint, target, DTO, refresh, and
pending-state ownership. The shared confirmation identifies the immutable target visually and in
its accessible description.
Source baseline `70f42c1` now supplies one browser Socket.IO transport/listener implementation
boundary for the Public tracker hook and Admin LiveMap. Each consumer retains its own lifecycle
instance plus structural validation, canonical state/version, snapshot/hydration, queue, map, Retry,
and expiry authority.

## 2. Scope and Freshness

This profile covers boundaries, authority, data products, temporal semantics, cache/realtime
behavior, and task placement. It does not certify deployment, physical devices, provider behavior,
deployed browser runtime, human behavior, load, or an Android client.

Discovery remains current at `1eec866...`; Product is revalidated at `70f42c1`, and the preceding
affected Architecture baseline was `e6a04ad`. Exact changed evidence is the shared browser Socket.IO
lifecycle task, service boundary, Public/Admin consumers, focused test/package script, and completion
record `535ec73` at `70f42c1`.
Existing T9 topology, canonical selection, research capture, relational schema, route-stop mutation/
cache ownership, Feedback lifecycle, and Mobile/ESP32/LoRaWAN acquisition semantics are unchanged.
The implementation supplies isolated browser evidence but no TLS, recovery, capacity, deployment,
device, Android, ambient data-target, human, or deployed-runtime proof.
The valid Discovery commit `1eec866b986b4cb4e802f7a48fac93e54e780699` is an ancestor of
`70f42c1`; the bounded application delta is the five-file source/test commit `70f42c1`.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public/Admin browser Socket.IO lifecycle implementation was duplicated and could drift | Resolved | `browserSocketLifecycle.ts` is the sole scoped production transport/listener implementation owner; Public/Admin retain separate instances and all structural-validation/canonical/UI authority. |
| Vehicle and source identity were conflated | Resolved | TrackingSource remains independent of Vehicle, with source type, binding, priority, credential version, and source reference on sampled history. Public canonical projection omits internal source identity. |
| Trip lifecycle lacked one owner | Resolved | operations.service.ts owns start/virtual-start, active-trip validation, end, vehicle repair, and sampled-history transaction behavior. Future timeout/force-close must extend this authority, not create controller-side writers. |
| Canonical current state was untyped/consumer-owned | Resolved | canonical-state.service.ts owns the V1 envelope, route authority, freshness, epoch/version, REST projection, and Socket.IO publication; T8 consumes that contract and rejects older state. |
| Raw diagnostics and temporal semantics were absent | Partially Resolved | T7 records bounded raw research observations with session, source, transport, receive/process/event-time, sequence/deduplication and disposition fields. Physical producer-clock quality and operational high-fidelity replay remain unverified/out of scope. |
| Redis current state is durable truth | Still Present | Redis current state/version allocation remains transient. PostgreSQL holds sampled canonical history and separate research evidence, not durable recovery/replay for public live state. |
| Route-stop cache ownership is incomplete | Resolved | T10 provides bounded active-membership validation, contiguous ordered replacement in one Prisma transaction, and post-success shared public-cache invalidation; legacy create/delete use the same invalidator. Deterministic tests/CI cover the pure boundary, not a stateful cache/DB runtime. |
| Realtime fan-out/scaling is proven | Unable to Verify | The Redis adapter exists, but publication is global and no rooms, replay, load threshold, or fan-out measurement is evidenced. |
| Public/admin service-state behavior is an operational contract | Partially Resolved | Canonical state distinguishes live, stale, no_service, and unknown; T8 keeps Public projection coherent; T14 now projects truthful Public snapshot/connection/service guidance plus Admin snapshot/realtime/local-expiry and Source Health/Feedback failure/retry/verified-empty state. History, actionable exceptions, unavailable causal diagnosis, deployed recovery, and operational ownership remain incomplete. |
| Production topology and REST/Socket origin authority were unresolved | Partially Resolved | T9 establishes one checked-in university topology, one fail-closed backend runtime parser, and one frontend REST/Socket origin resolver with deterministic tests. Actual reverse proxy, TLS, data-service exposure, restart, recovery, and capacity remain Unable to Verify externally. |
| Shared Admin material/Login presentation authority was absent | Resolved | `c4fdc3a` remains the one fixed-light Signal Lens authority; mutation receipts/errors use opaque operational tiers and confirmation reuses shared glass modal chrome. |
| Login rejection shared protected-route redirect behavior | Resolved | Login source is unchanged; the exact rejected-request exception and protected-route redirect remain independently covered. |
| Native/page-local mutation feedback lacked one shared semantic presentation/focus boundary | Resolved | `AdminMutationFeedback` owns narrowed error/receipt/confirmation presentation, including visible/accessibly described immutable target identity, while resource pages retain request, pending state, and DTO authority. |

## 4. Data Products and Authority

| Data product | Authoritative boundary | Required separation |
|---|---|---|
| Latest per-source observation | Redis source snapshot | Transient input to canonical selection; not research history or public state. |
| Canonical current vehicle state | Redis versioned canonical envelope | Only public/admin realtime/initial-state projection; server receive time is freshness clock. |
| Canonical trip history | PostgreSQL/PostGIS GPSTrack through Operations | Sampled operational history; does not become raw research replay. |
| Bounded raw diagnostics and aggregates | T7 PostgreSQL research schema/services | Authenticated research-only surface, session/protocol/versioned; never public projection. |
| Route/stop data | PostgreSQL plus public Redis caches | T10 mutates ordered data transactionally and invalidates public cache after success. |
| Feedback triage | PostgreSQL Feedback plus content-free audit events | T12 implements the D-009 lifecycle/retention/access policy at a server-authorized boundary; runtime execution remains unverified. |

## 5. Required C-scope Placement

- T9: repository configuration now implements the one university-managed origin, private data
  network, loopback app bindings, runtime validation, and application/Server-Network handoff. Keep
  REST and Socket.IO behind one TLS proxy and stop before external operations unless named owners
  and an approved target are available.
- T10: complete for its exact composition/invalidation scope. A future audit must retain the invariant that the public read consumes the changed authoritative sequence rather than treating cache invalidation as a production proof.
- T11: extend the Operations/lifecycle authority and supporting schema/auth boundaries for receipt-time lastAcceptedAt, 10-minute timeout, no-reopen, Mobile installation/claim, revocation, audit, protected history, and exceptions. The pinned Android client is an external consumer that must migrate in coordination with the versioned contract. D-012 general lifecycle policy remains outside T11.
- T12: D-009 resolves feedback privacy/retention/triage/deletion and read-only device-view policy. Its feedback and source/device views must remain separate from raw research data and privileged actions, with server role/re-authentication enforcement.

## 6. Risks and Recommendations

1. Define Redis-loss/degraded and recovery behavior before a production claim; the current model cannot recreate a durable current-state/version stream from PostgreSQL.
2. Keep timeout execution serialized with sender observations and administrative recovery in the same lifecycle transaction/locking order. Rejected/post-close observations must not advance lastAcceptedAt.
3. Preserve the implemented reusable `ADMIN` < `SUPER_ADMIN` < `DEV` authorization and fresh-auth
   boundary; apply approved D-012 only through an exact general lifecycle handoff.
4. Preserve T10's explicit cache invalidation and add its stateful public-read proof only on an approved disposable target; do not fall back to TTL semantics.
5. Preserve the no-raw-public invariant; research data requires distinct authentication and provenance/retention semantics.
6. Preserve the shared browser transport boundary without turning it into a global connection or
   canonical-state store; consumer-specific validation and reconciliation remain intentional.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its repository-side handoff under D-008. T10/T12 are complete for their
bounded handoffs. T14's first ten slices remain accepted, and the eleventh shared browser lifecycle
slice is complete for this Architecture source/unit/browser-regression contract at `70f42c1`.
T11 still needs focused technical and external Android evidence;
Research remains blocked on T13.
Production operations, runtime retention, capacity and external-device facts remain open; no new
owner decision is proposed.

Confidence is High for code-visible authority, display-color ownership, and missing boundaries;
Medium for synthetic request/viewport/motion/contrast behavior; and Low for assistive technology,
distributed recovery, deployment, load, hardware, provider, Android, and operations.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-011 and D-012 are approved and constrain only their stated
UX-order and general account/source lifecycle work; external T9/Mobile acceptance remains evidence,
not a policy choice to infer.

Frontend and downstream profiles consume this Architecture baseline. Backend and Database remain
current at `1eec866...` because T14 changes no runtime API, schema, or persistence authority. The
Roadmap owns the next exact continuation gate after the affected profile chain revalidates; none of
this evidence promotes a visual direction or browser fixture into assistive-technology, device, or
runtime proof.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: administrative identity had no role/re-authentication boundary — Partially Resolved.** A
single typed role module now forms the D-007 hierarchy. The administrative authentication middleware
verifies a non-sender token, obtains the current User role, rejects unknown/deleted accounts, and
attaches a typed principal. Sensitive Feedback delete/restore adds a 15-minute signed fresh-auth
boundary. This avoids token-role staleness and does not create a parallel identity system; general
account lifecycle/password management remains intentionally outside T12.

**Finding: feedback had no isolated lifecycle/data product — Resolved for the bounded T12 design.**
Feedback case state, responsible actor, deletion/restore fields, and independent content-free audit
events are additive operational records. Retention is a separate idempotent service; it does not
affect canonical, sampled trip, raw research, or public location data. The code has no external
scheduler owner/topology proof, so runtime scheduling remains an operations constraint rather than an
architecture completion claim.
