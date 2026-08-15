# Implementation Task Specification: T14 — Public Service Explanation and Recovery

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, D-011 Public service-explanation/recovery slice
- User authorization: Run Approved Batch request. Public visual identity must remain substantially
  unchanged; source, semantics, truthful copy, recovery, and small UX corrections are allowed. T9
  and T13 are deferred, T11 remains dependency-gated, and no dependency or owner decision may be
  bypassed.
- Approved decisions: `D-001=C`, `D-011`
- Specialist briefs: None required. The fresh Product/Frontend/Dashboard & UX findings and D-011
  select the bounded question; no cross-domain or owner-controlled uncertainty remains.
- Source audits: `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`,
  `docs/audits/frontend-audit.md`, `docs/audits/dashboard-ux-audit.md`, and
  `docs/audits/production-readiness-audit.md`, revalidated against implementation baseline
  `0a0fe58a59dbdcfc1a4cc59c7d71cb9b4b74639d` and coordinated at `99839c0`.

## Outcome and Non-goals

- Outcome: riders can distinguish current live service, delayed/unknown/no-service data, an
  unavailable realtime connection, and a failed/latest-snapshot load without an invented cause.
  The existing availability card exposes canonical last-update age when known and an explicit
  retry of the existing Public snapshot when useful. Stop ETA no longer converts every missing ETA
  into a claim that no vehicle exists. A slow preloader explains its automatic fallback before it
  releases the map.
- Non-goals: no Public redesign or layout relocation; no new dependency-specific diagnosis; no
  backend/API/schema/auth/role/canonical-state/source-selection change; no T11 exception, trip,
  history, device action, or Mobile source; no Research/Dev Dashboard; no Admin change; no route,
  map-geometry, ETA algorithm, service-worker, deployment, or external-runtime action.

## Identity-preserving UI Direction

- Preserve the incumbent Public glass panels, RSU blue/light palette, typography, overlay
  positions, top-right control order, and bottom-dock structure. Keep the availability footprint
  narrow and add only compact explanatory copy plus a retry affordance in failure states.
- Continue using the existing semantic live/warning/unavailable indicator. Pulse only for verified
  connected live data; explanation and age text use existing muted Public text tokens.
- Keep the stop card image, station name, ETA box, and status pill. Change only the projected ETA
  value/status semantics when current data cannot support an ETA.
- Keep the normal preloader logo/spinner appearance. Reveal one concise Thai slow-load message only
  after a measured delay; the existing automatic five-second fallback remains the recovery path.
- Trade-off: this makes uncertainty and recovery visible without a new status surface, but it does
  not claim dependency ownership, diagnose root cause, or provide deployed/human comprehension
  evidence.

## Baseline Measurements

- `getPublicAvailabilityPresentation` distinguishes connection/canonical counts but has no
  snapshot-failure input, last-update age, explanatory guidance, or retry contract.
- `StopInfoCard` maps every `eta === null` condition to `ยังไม่มีรถในสายนี้`, even when realtime is
  disconnected, data is stale/unknown, or route geometry cannot support a calculation.
- `usePreloader` safely releases the map after five seconds, but the blocking overlay gives no
  progress/fallback explanation before release.
- Measurement-first tests must fail on snapshot failure/retry guidance, canonical age projection,
  state-aware missing ETA, and slow-preloader explanation before the implementation is accepted.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | D-011 permits truthful copy, semantics, recovery, and small Public UX corrections while preserving identity. |
| Architecture | Bounded | Reuse the current canonical count/timing, Socket.IO connection, and REST snapshot boundaries; add no second authority. |
| Security / privacy | None | No payload, identifier, credential, authorization, logging, or user-data boundary changes. |
| Data / migration | None | No schema, persistence, retention, seed, cache, or migration change. |
| Operations / rollout | Bounded | Source/test-only frontend rollback; no deployment or external target is authorized. |
| Research validity | None | No observation, metric, export, simulator interpretation, or evidence claim changes. |

## Allowed Writes

- `docs/tasks/T14-public-service-explanation-and-recovery.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/shuttle-tracker.css`
- `shuttle-tracking-web/components/public/AvailabilityCard.tsx`
- `shuttle-tracking-web/components/public/BottomDock.tsx`
- `shuttle-tracking-web/components/public/Preloader.tsx`
- `shuttle-tracking-web/components/public/ShuttleTracker.tsx`
- `shuttle-tracking-web/components/public/StopInfoCard.tsx`
- `shuttle-tracking-web/hooks/usePreloader.ts`
- `shuttle-tracking-web/hooks/useShuttleTracker.ts`
- `shuttle-tracking-web/utils/truthful-ui-state.ts`
- `shuttle-tracking-web/tests/t14-truthful-state.test.ts`
- `shuttle-tracking-web/tests/t14-public-service-explanation.spec.ts`
- `shuttle-tracking-web/tests/t8-local-server.mjs`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `docs/decision-queue.md`
- `docs/audits/product-audit.md`
- `docs/audits/architecture-audit.md`
- `docs/audits/frontend-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- `docs/audits/production-readiness-audit.md`
- prior `docs/tasks/T14-*.md` handoffs
- `shuttle-tracking-web/hooks/useSocketConnection.ts`
- `shuttle-tracking-web/services/publicApi.ts`
- `shuttle-tracking-web/types/canonical-state.ts`
- `shuttle-tracking-web/utils/canonical-public-state.ts`
- existing T8/T14 unit and browser suites

## Invariants

- Only a successful Public active-vehicle snapshot or accepted canonical event establishes
  authoritative vehicle state. Failure never becomes zero/no-service, and retry uses the same
  existing endpoint.
- Current-service and ETA claims require the existing connected/canonical truth. Cached, stale,
  disconnected, loading, and unknown states never present a current live ETA.
- Last-update text derives only from accepted canonical server-selected time and is omitted when
  absent/invalid; it never promotes browser receipt time or simulator/proxy data to ground truth.
- Socket.IO automatic reconnection, canonical version ordering, local expiry, marker/count/route
  behavior, snapshot-first startup, and the ETA algorithm remain unchanged.
- Public colors, fonts, glass treatment, overlay placement/order, map controls, route selection,
  Feedback, tour, and modal behavior remain substantially unchanged.
- No external, migration, seed, deployment, credential, hardware, Mobile, or Research action runs.

## Required Changes

1. Extend the pure truthful-state projection with a typed snapshot-load state, stable reason code,
   concise explanation, retry eligibility, canonical last-update age formatting, and a state-aware
   ETA presentation. Do not expose source/dependency identity or infer a root cause.
2. Track the existing Public snapshot as loading/ready/error and the newest accepted canonical
   `timing.selectedAt`; expose a bounded Retry handler without changing Socket.IO ownership or API
   shape.
3. Add compact explanation/age content and a 44 px Retry target to `AvailabilityCard`, retaining
   its panel, indicator, width, position, and primary count hierarchy.
4. Feed the same pure presentation into the stop card so a missing or cached ETA receives an honest
   state-specific label and dash while a current connected/live ETA retains the incumbent value,
   arrival, and travelling behavior.
5. Announce slow loading in the existing preloader after a deterministic threshold and retain its
   automatic five-second map release. The normal fast path keeps the incumbent logo/spinner-only
   appearance.
6. Add deterministic pure/source tests and Chromium journeys for failure, retry, last-update age,
   slow-load fallback, narrow/desktop overflow, overlay continuity, and no misleading no-vehicle
   copy.

## Acceptance Criteria

- A failed initial active-vehicle snapshot with a connected Socket shows an unavailable/latest-load
  explanation and enabled `ลองโหลดข้อมูลอีกครั้ง`; clicking it enters loading and then recovers to
  verified live state without fabricating a cause, count, vehicle, or dependency.
- Connected authoritative live data retains `Active Trams`, the count, and pulse while exposing a
  canonical last-update age. Stale/no-service/unknown/reconnecting/disconnected/empty states stay
  non-live and provide truthful concise guidance; invalid/absent timestamps show no invented age.
- A selected stop renders a numeric ETA only when current connected/live presentation supports it.
  Otherwise it renders a dash and a state-aware label; `eta === null` no longer means or says that
  no vehicle exists in the selected route.
- If loading exceeds the slow threshold, the blocking preloader announces that loading is taking
  longer and that the map will open automatically; the overlay still releases after the existing
  five-second safety threshold.
- At 320 x 568, 390 x 844, and 1280 x 900, the existing Public overlays retain their positions/order,
  have no horizontal overflow, and do not collide with each other or map controls. Retry has a
  minimum 44 px target and visible keyboard focus.
- Focused tests, every prior T8/T14 suite, lint, production build, full repository CI, scoped
  Impeccable detector, `git diff --check`, and workflow validation pass. Evidence remains local/
  synthetic, not human/assistive-technology, physical-device, deployed-runtime, or release proof.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:t14`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:public-service`
- `npm --prefix shuttle-tracking-web run test:e2e:t8`
- `npm --prefix shuttle-tracking-web run test:e2e:t14`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:map-quality`
- `npm --prefix shuttle-tracking-web run check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/shuttle-tracker.css shuttle-tracking-web/components/public/AvailabilityCard.tsx shuttle-tracking-web/components/public/BottomDock.tsx shuttle-tracking-web/components/public/Preloader.tsx shuttle-tracking-web/components/public/ShuttleTracker.tsx shuttle-tracking-web/components/public/StopInfoCard.tsx shuttle-tracking-web/hooks/usePreloader.ts shuttle-tracking-web/hooks/useShuttleTracker.ts shuttle-tracking-web/utils/truthful-ui-state.ts`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

- Not applicable. Source/test-only Public frontend behavior; no migration, deployment, cache,
  credential, network, Mobile repository, or external target action is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist first.
- Stop if truthful guidance requires a new/changed backend endpoint, schema, auth/role policy,
  dependency diagnosis, or owner-controlled product promise.
- Stop rather than changing the ETA algorithm, canonical selection/freshness rules, Socket.IO
  ownership, Public visual identity, Admin UI, or adding a dependency.
- Stop rather than bundling T9, T11, T13, T15, Research, broader Public redesign, external runtime,
  or human/deployed acceptance.

## Completion Evidence

- Status: `Complete — Public service explanation/recovery slice`
- Acceptance mapping:
  - Snapshot truth/recovery → a failed Public active-vehicle snapshot is distinct from verified
    empty service, exposes no invented dependency cause/count, and keeps one 44 px Retry control.
    Manual retry remains mounted/disabled while loading, uses the existing endpoint, guards against
    duplicate clicks, and recovers to the accepted canonical state.
  - Canonical explanation/age → one pure typed projection owns connection, snapshot, service,
    explanation, retry eligibility, and ETA reason. Last-update text accepts only valid canonical
    `timing.selectedAt`, selects the newest accepted value, and updates without treating browser
    receipt time as ground truth.
  - ETA truth → the selected-stop card renders a number only for connected authoritative live
    state. Reconnecting/disconnected/loading/error/stale/no-service/unknown/empty and live-without-
    ETA states render a dash plus a specific non-causal label; the old blanket
    `ยังไม่มีรถในสายนี้` claim is absent.
  - Slow-load recovery → the normal preloader retains its incumbent logo/spinner-only visual path.
    At 2.5 seconds it announces a concise slow-load message, and the existing five-second safety
    completion still releases the map without waiting for the snapshot indefinitely.
  - Identity/responsive continuity → Public glass/palette/type/overlay order remains. A measured
    narrow-width correction gives Branding and status a gap; 320/390/1280 px have no horizontal
    overflow, the stop dock does not collide with map controls, and the final scoped detector is
    `[]`.
- Changed files: implementation commit `bf8030898e6f0a6d04ec2abd3eb73d860e3243fc` contains only the
  14 exact Public stylesheet/components/hooks/utility/package/config/test-fixture/unit/browser-test
  paths in this handoff. The unrelated dirty Feedback-role migration was preserved and excluded.
- Validation results:
  - Measurement-first unit compilation failed because snapshot/age/ETA projections did not exist;
    the corrected pure/source suite passes 8/8. Measurement-first Chromium failed 2/2 because
    failure remained `กำลังรอข้อมูลรถ` with no Retry and slow loading had no explanation; final
    browser journeys pass 2/2.
  - Focused browser evidence covers failure → loading → live recovery, canonical update age,
    non-misleading stop ETA, 44 px Retry, slow fallback, 320/390/1280 px overflow, Branding/status
    separation, and dock/control separation. Synthetic trace captures were visually inspected.
  - `npm --prefix shuttle-tracking-web run check` passed simulator 4/4, T8 unit 2/2, T9 unit 5/5,
    truth unit 8/8, motion 4/4, contrast 4/4, T8 browser 1/1, truth 2/2, accessibility 4/4,
    map-quality 2/2, contrast 2/2, Admin Dashboard 2/2, Public recovery 2/2, lint, and the 11-route
    production build. Lint retains only the same two pre-existing warnings in `app/layout.tsx` and
    `utils/IconHelpers.ts`.
  - The sandboxed build first failed only because Turbopack could not bind its internal process
    port; the authorized production build passed. `bash scripts/ci-checks.sh` then passed Backend
    build/boundaries, Prisma validation, every Frontend check, Compose, production topology,
    unsafe-log scan, and workflow validation.
  - Final scoped Impeccable detector returned `[]`; `git diff --check`,
    `node scripts/validate-agent-workflow.js`, visual QA, and exact staging review passed. Evidence
    is local/synthetic, not human/assistive-technology, physical-device, deployed-runtime, or
    release proof.
- Audit freshness changes: Product, Architecture, Frontend, Dashboard & UX, Production Readiness,
  and Roadmap are downgraded to `Needs Re-audit` against implementation `bf80308`. Backend,
  Database, Infrastructure & Device, Security/DevOps/Observability, Discovery, T9/T11/T13/T15
  gates, and owner decisions are unchanged.
