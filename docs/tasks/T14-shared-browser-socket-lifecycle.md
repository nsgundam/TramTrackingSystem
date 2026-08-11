# Implementation Task Specification: T14 — Shared Browser Socket.IO Lifecycle Ownership

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, remaining duplicated Public/Admin browser Socket.IO lifecycle finding
- User authorization: Run Approved Batch plus the 2026-08-11 direction to continue Roadmap work
  without bypassing dependencies or owner decisions; Public visual/product identity must remain
  substantially unchanged, while source/UX quality may improve without a redesign.
- Approved decisions: D-011 fixes the Public preservation boundary and bright-neutral Admin world.
  D-012 is approved but intentionally unimplemented here.
- Specialist briefs: None required. The current Level 1 chain identifies this exact bounded unit and
  no focused cross-domain uncertainty remains.
- Source audits: Product, Architecture, Frontend, Dashboard & UX, Production Readiness, and Roadmap
  are validated against source baseline `e6a04ad7fd73cafa1463fd83099c0ffb2d14c13d` by coordination
  commit `95a8de1102d22d290dc37288f2e67500b7e4f91f`; unaffected Discovery/domain evidence is current at
  `1eec866b986b4cb4e802f7a48fac93e54e780699`.
- Product/design workflow: identity-preserving frontend refactor under `frontend-design`. It changes
  internal browser transport/listener ownership only; it creates no new surface, visual system,
  copy, layout, interaction, or product capability.

## Gate and Execution Status

- Dependency gate: Passed. T8 and its Public truth/route/expiry contracts are complete; current
  Dashboard & UX and Architecture profiles validate the duplicated lifecycle finding. T9/T13 remain
  deferred, T11/T15 remain blocked, and none is bypassed.
- Decision gate: Passed. D-011 supplies the required Public/Admin direction. This refactor makes no
  policy choice and does not implement D-012.
- Task gate: Passed when this exact-path handoff is committed. No application source may change
  before the measurement-first guard fails against the incumbent duplicated implementation.
- Evidence-freshness gate: Passed. The affected Level 1 chain is current at `e6a04ad`; creating this
  contract changes coordination only, not application evidence.
- Specialist gate: Direct Level 3 is sufficient. Stop and route one focused question to Level 2
  only if inspection exposes an unresolved cross-domain fact.
- Execution mode: Direct Level 3, measurement-first, inside the approved batch. Stop at any new
  owner decision, dependency, external target, API/backend/auth/schema, consumer-behavior, or write-
  path need.

## Outcome and Non-goals

- Outcome: replace duplicated Public/Admin Socket.IO construction, connection-state listeners,
  reconnect-attempt signaling, location-event forwarding, connect, and cleanup with one strict
  browser lifecycle boundary. The boundary forwards location payloads as `unknown`; Public and
  Admin consumers retain all validation, version, snapshot, hydration, queue, expiry, and visible-
  state authority.
- Non-goals: no Public/Admin visual/product identity, DOM, copy, layout, theme, accessibility,
  request, event name/payload/handling order, hydration timing/outcome, canonical projection,
  marker/map, Retry, expiry, endpoint, backend, API/auth/schema, dependency, Mobile, migration,
  Research, T9/T11/T13/T15, deployment, external-target, or owner-policy change. No generic event
  bus, global connection store, server idempotency, room/replay/load work, or Socket.IO upgrade.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | None | No surface or observable behavior changes; incumbent Public/Admin browser journeys remain regression gates. |
| Architecture | Bounded | One browser transport lifecycle owner replaces duplicated wiring; canonical and UI consumers retain their authorities. |
| Security / privacy | Bounded | The shared boundary accepts untrusted event payloads as `unknown`; consumer guards must narrow before use and no payload is logged. |
| Data / migration | None | No request, canonical state, cache, schema, persistence, migration, or target operation. |
| Operations / rollout | Bounded | Frontend source/test rollback only; no deployment, connection origin, server event, provider, or runtime-target action. |
| Research validity | None | No observation, metric, simulator, device, provenance, export, or Research surface change. |

## Allowed Writes

- `docs/tasks/T14-shared-browser-socket-lifecycle.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/services/browserSocketLifecycle.ts`
- `shuttle-tracking-web/hooks/useSocketConnection.ts`
- `shuttle-tracking-web/components/admin/LiveMap.tsx`
- `shuttle-tracking-web/tests/t14-socket-lifecycle.test.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`
- `docs/project-knowledge-base.md`, `docs/decision-queue.md`, current audits, Roadmap, and prior T14
  task/completion records
- `shuttle-tracking-web/hooks/useShuttleTracker.ts`
- `shuttle-tracking-web/types/index.ts`
- `shuttle-tracking-web/types/canonical-state.ts`
- `shuttle-tracking-web/utils/canonical-public-state.ts`
- `shuttle-tracking-web/utils/truthful-ui-state.ts`
- `shuttle-tracking-web/config/backend.ts`
- `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- `shuttle-tracking-web/tests/t8-public-state.test.ts`
- `shuttle-tracking-web/tests/t8-route-switch.spec.ts`
- `shuttle-tracking-web/tests/t9-backend-origin.test.ts`
- `shuttle-tracking-web/tests/t14-truthful-state.test.ts`
- `shuttle-tracking-web/tests/t14-truthful-state.spec.ts`
- all Public/Admin style, backend, schema, migration, Mobile, Research, deployment, dependency-lock,
  and external-target paths

## Invariants

- `backendConnection.socketOrigin`, `autoConnect: false`, event name `location-update`, connection
  events `connect`, `disconnect`, `connect_error`, Manager event `reconnect_attempt`, and explicit
  connect/disconnect behavior remain exact.
- The shared lifecycle owns only Socket.IO transport creation, listener registration, the first-
  versus-later connection distinction, connection-state callback signaling, location payload
  forwarding as `unknown`, listener removal, and socket disconnect. It does not import or know any
  canonical DTO, version, snapshot, map, hydration, Retry, expiry, or React state implementation.
- Public still awaits its initial REST snapshot attempt before creating/connecting the socket; a
  failed snapshot does not prevent socket recovery. Only the second and later successful `connect`
  events request Public rehydration.
- Public decodes the forwarded `unknown` without mutation, then calls incumbent canonical
  acceptance/version/state/expiry mutation before checking map availability. If the map is absent,
  accepted canonical state remains stored but is neither queued nor marker-processed. With a map,
  accepted updates still replace `pendingUpdatesRef.current[vehicleId]` while zooming and otherwise
  reach `processLocationUpdateRef` in that order. REST hydration continues to process accepted
  states directly and does not enter the zoom queue.
- Admin still completes `await hydrate(false)` before socket creation/connect. Only the second and
  later successful `connect` events invoke `hydrate(true)`; events arriving during hydration still
  queue and reconcile through the incumbent newer-version rules.
- Admin `isCanonicalVehicleState` remains the strict `unknown` guard. Local canonical-expiry timers,
  version refs, snapshot queue, commit/reconciliation, `hasAuthoritativeState`, and display counts
  remain Admin-consumer state and never move into the shared lifecycle.
- Admin manual `Retry snapshot` still sets loading/reconnecting state and increments
  `snapshotAttempt`, causing the incumbent effect cleanup and a fresh `hydrate(false)`/socket
  lifecycle. Public retry remains independent of socket ownership.
- Listener registration completes before explicit connect. A successful connect signals
  `connected` synchronously and then invokes the consumer reconnect callback synchronously only on
  the second and later connect; `disconnect` signals `disconnected`, while `connect_error` and
  Manager `reconnect_attempt` signal `reconnecting`.
- Admin's reconnect callback calls `hydrate(true)` synchronously so `isHydrating` is set before a
  later location event. Snapshot success reconciles queued newer states and snapshot failure replays
  queued states through incumbent acceptance. A transient socket disconnect does not clear either
  consumer's canonical-expiry timers.
- A disposed consumer receives no later connection/payload callbacks. Cleanup removes the exact
  lifecycle listeners and disconnects exactly once; consumer-owned Admin expiry timers retain their
  existing cleanup.
- No Public/Admin visual/product identity, rendered DOM/copy/layout/theme, focus/accessibility,
  request, origin, event name/payload/handling order, Login, or external boundary changes.
- No new dependency, explicit/implicit `any`, unsafe double assertion, `@ts-ignore`, lint disable,
  arbitrary payload logging, raw object rendering, timer abstraction, or shared canonical-state
  authority.

## Required Changes

1. Add `browserSocketLifecycle.ts` as the sole scoped `socket.io-client` construction/listener owner.
   Use a small strict transport port/factory so deterministic tests can drive connect, disconnect,
   connect-error, reconnect-attempt, location payload, and disposal without a network target.
2. Refactor `useSocketConnection.ts` to start that lifecycle only after the incumbent Public initial
   snapshot attempt. Add a pure required-field structural `unknown` decoder before incumbent
   canonical acceptance, then
   retain ref freshness, accept-before-map order, map availability, zoom queue ordering, second-and-
   later rehydration, direct REST-hydration processing, and effect cleanup.
3. Refactor `LiveMap.tsx` to start the same lifecycle only after `await hydrate(false)`. Retain strict
   `unknown` validation, hydrate queue/reconciliation, `hydrate(true)` reconnect behavior, manual
   Retry restart, canonical-expiry timers, visible state, and cleanup.
4. Add a focused Node test measurement-first. Before source, it must fail because both consumers own
   direct Socket.IO wiring. After source, it must prove one construction/listener owner, unknown
   payload forwarding, exact connection-state/reconnect semantics, first-connect suppression,
   disposed-callback suppression, idempotent cleanup, consumer sequencing/asymmetry source guards,
   and absence of canonical/expiry ownership in the shared module.
5. Add the focused test script to `package.json` and the existing `check` chain without changing a
   dependency or lockfile.

## Acceptance Criteria

- Exactly one scoped frontend source module imports/constructs `socket.io-client`; Public and Admin
  consumers use the same lifecycle API and contain no duplicate connect/disconnect/connect-error/
  reconnect-attempt listener block.
- The shared lifecycle forwards `location-update` as `unknown`, reports exact connection states,
  invokes the consumer reconnect callback only on second-and-later successful connections, ignores
  callbacks after disposal, removes its listeners, and disconnects idempotently.
- Public initial snapshot-before-connect, failed-snapshot socket recovery, later-connect rehydrate,
  decode/accept-before-map order, zoom queue, and processing order are source-guarded; the unchanged
  valid Public truth/route/expiry journeys remain browser-regressed.
- Admin initial `hydrate(false)`-before-connect, later-connect `hydrate(true)`, queued newer-state
  reconciliation, strict unknown guard, manual Retry effect/socket restart, canonical-expiry timers,
  and hydrate-failure queue replay are source-guarded; lifecycle event/reconnect behavior is unit-
  tested and unchanged Admin Retry/expiry/visible truth journeys remain browser-regressed. No forced-
  reconnect or zoom-time browser-event claim is added.
- Existing T8/T9/T14 pure and browser suites, Admin Dashboard/accessibility/Login material suites,
  lint, production build, full repository CI, scoped changed-target detector, workflow validator,
  and `git diff --check` pass. No human/AT/device/deployed claim is added.
- Only Allowed Writes change. Public/Admin DOM/copy/layout/theme, Login behavior, backend/API/auth/
  schema, dependency lock, Mobile, migration, Research, T9/T11/T13/T15, deployment, and external
  targets remain unchanged; the unrelated dirty Feedback-role migration remains excluded.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:t14:socket-lifecycle`
- `npm --prefix shuttle-tracking-web run test:t8`
- `npm --prefix shuttle-tracking-web run test:t9`
- `npm --prefix shuttle-tracking-web run test:t14`
- `npm --prefix shuttle-tracking-web run test:e2e:t8`
- `npm --prefix shuttle-tracking-web run test:e2e:t14`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:public-service`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-liquid-glass`
- `npm --prefix shuttle-tracking-web run lint`
- `npm --prefix shuttle-tracking-web run build:check`
- `bash scripts/ci-checks.sh`
- `node scripts/validate-agent-workflow.js`
- `git diff --check`

## Rollout and Migration Limits

- Not applicable. No migration, deployment, external service, ambient database/cache, credential,
  provider, Mobile, or physical-device target is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this contract before expansion.
- Stop if preserving Public or Admin sequencing requires a changed event, payload, request, DOM,
  copy, layout, hydration outcome, canonical authority, or expiry policy.
- Stop if an owner decision, dependency, migration/target, backend/API/auth/schema, secret, provider,
  Mobile, Research, or hardware fact is required.
- Stop rather than adding a dependency, changing origin/reconnect configuration, centralizing
  canonical state, or broadening this into generic realtime architecture.

## Completion Evidence

- Status: `Complete` for the exact local source/test scope at immutable source commit
  `70f42c15948bf09e71a3c91d594a4c21f52db23b`.
- Acceptance mapping:
  - The measurement-first direct-owner guard failed 1/1 against the incumbent source and identified
    both `hooks/useSocketConnection.ts` and `components/admin/LiveMap.tsx` as direct Socket.IO
    lifecycle owners. The final focused suite passes 4/4 with
    `services/browserSocketLifecycle.ts` as the single scoped construction/listener owner.
  - The shared boundary forwards payload identity as `unknown`, preserves exact Socket and Manager
    event wiring/state signals, suppresses the first-connect rehydrate callback, invokes it on later
    connects, removes every listener, suppresses callbacks after disposal, and disconnects
    idempotently. Real adapter wiring and the consumer absence predicates are source-guarded.
  - Public snapshot-failure continuation, required-field structural narrowing with strict string-
    enum checks and Public source-identity rejection, canonical accept-before-map,
    map/zoom queue order, and later-connect rehydrate are guarded. Admin hydrate-before-connect,
    hydrate-before-request, queued-newer-state reconciliation, failure replay, Retry restart, and
    canonical-expiry ownership remain consumer-side and guarded.
  - An adversarial review found coercive enum checks. A new strict-boundary measurement then failed
    1/1 (focused aggregate 3 pass/1 fail) against `String(...)`; requiring string enum values and
    Public `sourceId === undefined` repaired it, after which the focused suite returned to 4/4.
  - Public/Admin DOM, copy, layout, theme, event names, request shapes, origins, backend/API/auth/
    schema, dependencies, Login source behavior, Mobile, Research, migrations, and external targets
    did not change.
- Changed source/test files:
  - `shuttle-tracking-web/services/browserSocketLifecycle.ts`
  - `shuttle-tracking-web/hooks/useSocketConnection.ts`
  - `shuttle-tracking-web/components/admin/LiveMap.tsx`
  - `shuttle-tracking-web/tests/t14-socket-lifecycle.test.ts`
  - `shuttle-tracking-web/package.json`
- Validation results:
  - `npm --prefix shuttle-tracking-web run test:t14:socket-lifecycle` passes 4/4.
  - T8, T9, and T14 pure regression groups pass 2/2, 5/5, and 8/8 respectively.
  - The bounded T8/T14 Public, accessibility, Admin Dashboard, and Admin Liquid Glass/Login browser
    regression run passes 16/16. The Login evidence covers the unchanged rejected-request/pending/
    inline-error and protected-redirect paths; it does not add a successful-session browser claim.
  - Focused lint passes; full lint has zero errors and the same two pre-existing warnings. The
    scoped changed-target Impeccable detector returns `[]`.
  - `bash scripts/ci-checks.sh` passes in a clean verification copy, including backend checks,
    frontend pure/browser suites, the 9-route production build, Compose/topology, unsafe-logging,
    and workflow validation. `node scripts/validate-agent-workflow.js` and `git diff --check` pass.
  - Independent implementation and adversarial test reviewers both returned `PASS` after the
    strict-boundary repair.
- Evidence limits: browser evidence covers unchanged surrounding local journeys but does not force a
  reconnect or a zoom-time socket event. No human, assistive-technology, physical-device, deployed,
  ambient database/cache, or external-runtime acceptance is claimed.
- Audit freshness changes: the Level 3 completion sync marked Product, Architecture, Frontend,
  Dashboard & UX, Production Readiness, and Roadmap `Needs Re-audit` against `70f42c1`; Level 3 did
  not accept the slice. The subsequent ordered Level 1 chain validates the same immutable source,
  accepts it as T14 slice eleven, resolves the duplicated-lifecycle P2 for exact local evidence, and
  retains the 15/20 score with one P1, five P2, and one P3 open. Production remains `No-Go`.
