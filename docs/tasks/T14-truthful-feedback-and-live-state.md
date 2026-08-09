# Implementation Task Specification: T14 — Truthful Feedback and Live State

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`
- User authorization: Run Approved Batch request plus D-011 approval on 2026-08-07; T9/T13 may be
  deferred without bypassing their gates.
- Approved decisions: `D-001=C`, `D-007`, `D-009`, `D-011`
- Specialist briefs: None required; the focused D-011 order and visual authority are complete.
- Source audits: `docs/audits/frontend-audit.md`, `docs/audits/dashboard-ux-audit.md`, and
  `docs/audits/production-readiness-audit.md`, all Validated at
  `ec8f005f3cbe9079dd592e486072780a5e6c833d`.

## Outcome and Non-goals

- Outcome: Public Feedback never invents or auto-selects an unverified vehicle and offers a truthful
  retry path. The Public availability card distinguishes authoritative live/stale/no-service,
  reconnecting, and unavailable states without a visual redesign. The Admin Dashboard distinguishes
  loading/ready/error master-data state, removes unconditional “live” claims, and locally expires
  stale realtime states while reconciling a successful snapshot with queued newer Socket.IO events.
- Non-goals: no Public redesign; no Admin theme redesign; no dialog/focus/sidebar/accessibility batch;
  no backend, schema, auth, role, Feedback policy, map geometry, ETA, T11, research, deployment,
  performance/scale, route, or source/device-management change.

## Identity-preserving UI Direction

- Palette: retain the incumbent Public tokens—Primary `#0058be`, Surface `#f8f9ff`, On Surface
  `#151c25`, Error `#ba1a1a`—and use existing semantic emerald/amber/slate utilities only to make
  live/reconnecting/unavailable status truthful.
- Type: retain Inter/Noto Sans Thai and the current Public/Admin type scales.
- Layout: retain the Public top-right card footprint, Feedback modal structure, Admin three-card
  grid, and map placement. Add only inline state/retry content that fits those structures.
- Signature: the existing availability dot becomes a truthful semantic state indicator; it pulses
  only for current authoritative live data.
- Self-critique: a new generic status banner, gradient, font, card system, or decorative dashboard
  treatment would be unrelated to the owner-approved data-integrity slice and is excluded.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | D-011 and Dashboard & UX P1 findings 5–7 bind the exact truth/recovery states and Public visual preservation. |
| Architecture | Bounded | Reuse `CanonicalVehicleStateV1`, version ordering, server-receive freshness, and the single REST/Socket authority; do not create a second state model. |
| Security / privacy | Bounded | Never submit a fabricated/unverified vehicle ID; do not add logs, identifiers, payload exposure, or new authorization assumptions. |
| Data / migration | None | No backend, Prisma, cache, or persisted data change. |
| Operations / rollout | Bounded | Frontend-only rollback is the prior bundle; runtime/deployment remains unverified and unauthorized. |
| Research validity | None | Raw research data, metrics, and claims are untouched. |

## Allowed Writes

- `docs/tasks/T14-truthful-feedback-and-live-state.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- `shuttle-tracking-web/components/admin/LiveMap.tsx`
- `shuttle-tracking-web/components/public/AvailabilityCard.tsx`
- `shuttle-tracking-web/components/public/FeedbackModal.tsx`
- `shuttle-tracking-web/components/public/ShuttleTracker.tsx`
- `shuttle-tracking-web/hooks/useShuttleTracker.ts`
- `shuttle-tracking-web/hooks/useSocketConnection.ts`
- `shuttle-tracking-web/utils/truthful-ui-state.ts`
- `shuttle-tracking-web/tests/t14-truthful-state.test.ts`
- `shuttle-tracking-web/tests/t14-truthful-state.spec.ts`
- `shuttle-tracking-web/tests/t8-local-server.mjs`
- `shuttle-tracking-web/tests/t8-route-switch.spec.ts`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`
- `shuttle-tracking-web/public/sw.js`
- `shuttle-tracking-backend/tests/test_t6_realtime.js`

## Read-only Context

- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/decision-queue.md`
- `docs/audits/dashboard-ux-audit.md`
- `docs/audits/frontend-audit.md`
- `shuttle-tracking-web/types/canonical-state.ts`
- `shuttle-tracking-web/utils/canonical-public-state.ts`
- `shuttle-tracking-web/services/publicApi.ts`
- `shuttle-tracking-backend/src/controllers/public.controller.ts`
- `shuttle-tracking-backend/src/services/canonical-state.service.ts`

## Invariants

- Public code consumes only the canonical public state and never exposes source identity, raw
  telemetry, credentials, research data, or administrative controls.
- A vehicle is selectable for Feedback only when the successful active-vehicle response contains
  its ID. API failure or an empty response creates no fallback list and no selection.
- Socket disconnection never labels cached state as currently live. A locally expired authoritative
  `live` state counts/displays as stale until a newer state arrives.
- Successful snapshots remove absent vehicles, while Socket.IO states received during hydration are
  queued and a newer queued version wins after snapshot reconciliation.
- Public visual identity/layout and Admin route/auth behavior remain unchanged.
- No stateful, external, migration, seed, deployment, provider, hardware, or Mobile action is run.

## Required Changes

1. Add pure typed projections for verified Feedback selection, Public availability presentation,
   canonical local expiry, and snapshot-plus-queued-state reconciliation.
2. Replace Feedback fallback/auto-selection with explicit loading/error/empty/retry states; preserve
   a preselected ID only when returned by the successful server list and disable submit otherwise.
3. Return Public Socket.IO connection state, record whether any authoritative snapshot/event exists,
   and feed both plus canonical counts into the unchanged availability-card footprint.
4. Replace Admin stats zero-on-error and “Live System Active” claims with explicit loading/ready/
   error values, Bangkok-time update evidence, and retry; describe active master data as enabled,
   not necessarily tracking.
5. Make Admin LiveMap connect even when the initial snapshot fails, expose connection/snapshot state,
   allow retry, queue Socket.IO events during hydration, reconcile snapshots, and locally expire
   current states without discarding last-known position.
6. Add deterministic pure/source tests and focused desktop/mobile Playwright journeys; keep the
   existing T8 expiry/route-switch test passing.
7. Keep the PWA Service Worker from intercepting Socket.IO polling/upgrade transport; realtime
   requests must use the network directly and surface their real connection state.

## Acceptance Criteria

- Failed/empty active-vehicle fetch shows no `VH001`/`VH002` or other fabricated option, selects no
  vehicle, blocks submit, explains the state, and can recover by Retry. A successful list requires
  explicit selection unless the supplied initial ID is present.
- Public availability displays a pulsing live indicator only when connected with authoritative live
  state; stale/no-service/unknown/reconnecting/disconnected states use truthful non-live labels and
  do not claim a current live count.
- Admin stats failure renders unavailable values and Retry rather than zeros; successful retry shows
  the actual counts and a non-live “updated” time. “Live System Active” and “active & tracking” are
  absent.
- Admin map keeps trying Socket.IO after snapshot failure, labels both states, retries the snapshot,
  drops vehicles absent from a successful snapshot, retains newer queued events, and moves locally
  expired live data into stale/last-known presentation.
- Existing Public layout/theme, canonical version/route behavior, T8 Marker/count/ETA invariants,
  Admin auth/navigation, and centralized origin contract remain intact.
- Focused tests, desktop/mobile browser journeys, frontend lint/build, full repository CI,
  Impeccable detector, and `git diff --check` pass; any unavailable visual/human acceptance is
  reported rather than promoted.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:t14`
- `npm --prefix shuttle-tracking-web run test:t8`
- `npm --prefix shuttle-tracking-web run test:e2e:t14`
- `npm --prefix shuttle-tracking-web run check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/admin/dashboard/page.tsx shuttle-tracking-web/components/admin/LiveMap.tsx shuttle-tracking-web/components/public/AvailabilityCard.tsx shuttle-tracking-web/components/public/FeedbackModal.tsx shuttle-tracking-web/components/public/ShuttleTracker.tsx`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

- Not applicable. Source/test-only frontend change; no external runtime or deployment target is
  authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist first.
- Stop if truthful presentation requires a backend/schema/API change or new policy choice.
- Stop rather than bundling later D-011 accessibility/Admin-theme work, changing Public identity,
  adding dependencies, or expanding into T9/T11/T13/T15.

## Completion Evidence

- Status: `Complete — first D-011 truth/integrity slice`
- Acceptance mapping:
  - Verified Feedback association → failed and empty active-vehicle responses create no option or
    selection, keep Submit disabled, explain the condition, and recover through Retry; only an ID
    returned by the successful response can be submitted. The mobile Playwright journey verifies
    failure, empty, recovery, explicit selection, and the posted vehicle ID.
  - Truthful Public state → `AvailabilityCard` combines authoritative canonical counts with actual
    Socket.IO state, pulses only for connected/live data, and distinguishes reconnecting,
    disconnected, stale, no-service, unknown, and empty states. Local-expiry and route-switch
    regression evidence remains green.
  - Truthful Admin state → dashboard master-data loading/error/ready states no longer convert
    failures to zero or claim unconditional liveness; Retry shows verified counts and a Bangkok-time
    update. The map connects after snapshot failure, exposes separate realtime/snapshot state,
    reconciles queued versions, drops snapshot-absent vehicles, and projects expired/disconnected
    live state as last-known.
  - PWA transport integrity → the Service Worker bypasses `/socket.io/` so Engine.IO polling and
    upgrade requests are not wrapped in an offline fallback. The browser journey was repeated twice
    after this repair with four of four journeys passing.
  - Visual authority → the incumbent Public layout, palette, typography, card footprint, and modal
    structure remain; only semantic state/copy/retry/focus affordances changed. Final Impeccable
    detector output is `[]`. No separate human visual acceptance or deployed-runtime claim is made.
- Changed files: implementation commit `1b2b6c1` contains the exact frontend, utility, Service
  Worker, deterministic-test, Playwright, and task-contract paths listed above. The compatible T6
  source assertion in `shuttle-tracking-backend/tests/test_t6_realtime.js` is the only additional
  implementation-caused path and was added to this allowlist before acceptance. The unrelated dirty
  Feedback-role migration was preserved and excluded from T14 ownership.
- Validation results:
  - `npm --prefix shuttle-tracking-web run test:t14` — 5/5 passed on 2026-08-09.
  - `npm --prefix shuttle-tracking-web run test:e2e:t14` — 2/2 passed; the post-Service-Worker
    repeat run passed 4/4 journeys.
  - `npm --prefix shuttle-tracking-web run test:e2e:t8` — 1/1 passed.
  - `npm --prefix shuttle-tracking-web run lint` — zero errors; two pre-existing warnings remain in
    `app/layout.tsx` and `utils/IconHelpers.ts`.
  - Final Impeccable detector — `[]`.
  - `bash scripts/ci-checks.sh` — passed Backend build/boundaries/Prisma, Frontend tests/E2E/lint/
    production build, Compose, production topology, safe-logging, and workflow validation on
    2026-08-09.
  - `git diff --check` and `node scripts/validate-agent-workflow.js` — passed.
- Audit freshness result: Product, Architecture, Frontend, Dashboard & UX, Production Readiness,
  and Roadmap are revalidated at `bd34552...` on 2026-08-09. Backend, Database, Infrastructure &
  Device, and Security/DevOps/Observability remain independently current at `1eec866...`; the T6
  file is a compatibility assertion only. The next eligible T14 unit is accessibility/navigation
  under a new exact-path handoff.
