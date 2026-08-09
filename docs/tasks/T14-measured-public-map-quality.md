# Implementation Task Specification: T14 — Measured Public Map Quality

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, D-011 measured responsive/performance slice
- User authorization: Run Approved Batch request; Public visual identity must remain substantially
  unchanged, while source/UX improvements are allowed. Admin theme remains separately bounded.
- Approved decisions: `D-001=C`, `D-011`
- Specialist briefs: None required. The 2026-08-09 Level 1 re-audit selects measurement-led
  responsive/performance/visual-system work and leaves no focused owner-policy uncertainty.
- Source audits: `docs/audits/frontend-audit.md`, `docs/audits/dashboard-ux-audit.md`, and
  `docs/audits/production-readiness-audit.md`, Validated in commit
  `4e63145b22dd1b66fa246cd8cc11fa12861b722c` against source baseline `378818f...`.

## Outcome and Non-goals

- Outcome: deterministic source/browser evidence governs initial route-geometry work, marker motion,
  reduced-motion behavior, narrow-screen Public overlay placement, and the audited Public/Admin
  touch targets. Initial map work loads geometry only for the selected route; later route selection
  loads its data once. A newer marker update cancels prior animation. Reduced-motion users avoid
  continuous/repeated movement. At 320 CSS px, the existing Public information card and map controls
  do not overlap, and the audited map/route-order controls expose at least 44 CSS px hit targets.
- Non-goals: no Public redesign, palette/type/copy change, new information surface, map-provider or
  route algorithm change, Admin theme/hierarchy, broad contrast/token work, raw-image optimization,
  OSM-attribution change, external Admin icon replacement, live-region expansion, backend/schema/API,
  T9, T11, T13, T15, deployment, or dependency work.

## Baseline Measurements

- `components/public/MapControls.tsx` gives each audited control `w-9 h-9` (36 by 36 CSS px).
- `components/admin/RouteStopsModal.tsx` combines a 17 px icon with `p-2`, producing an audited
  control near 33 by 33 CSS px.
- At 320 CSS px, `BottomDock` starts 16 px from the left with a 280 px width while a 36 px map
  control starts 16 px from the right: their horizontal ranges overlap by 28 px when the dock has
  visible content, and both are bottom-aligned.
- `hooks/useShuttleTracker.ts` calls `loadRouteData` for every active route during initialization;
  `useRouteGeometry.ts` may then call OSRM once per uncached route.
- `utils/MapHelpers.ts` starts `requestAnimationFrame` without returning a canceller, while
  `useVehicleTracking.ts` can start another animation for the same marker.
- These source measurements select the task but are not acceptance. The focused browser/unit suite
  must first encode the budgets and then prove the corrected behavior.

## Identity-preserving UI Direction

- Keep the current Public glass panels, tokens, type, icon set, overlay order, and desktop/tablet
  geometry. A 44 px hit area may wrap the existing 36 px visual control so its visible footprint is
  not enlarged.
- Change the BottomDock maximum width only at the narrow size where measured overlap occurs. Do not
  move, restyle, recolor, rename, or recompose the Public cards.
- Reduced motion is conditional on the user's media preference; default motion remains visually
  equivalent. Under reduced motion, continuous decoration stops and map/marker movement resolves
  immediately without changing destination or canonical state.
- Admin route-order buttons may grow their invisible/visible hit box to 44 px; no Admin theme or
  hierarchy decision is implied.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | D-011 plus audited P2 responsive/motion/performance findings bind this exact slice and preserve Public identity. |
| Architecture | Bounded | Existing route/map hooks retain ownership; one pure motion boundary owns cancellation and reduced-motion options. |
| Security / privacy | None | No auth, payload, identifier, logging, or external-origin policy changes. |
| Data / migration | None | No backend, Prisma, Redis, cache contract, or persisted record changes. Browser local geometry cache format remains version 2. |
| Operations / rollout | Bounded | Frontend source/test rollback only; no external runtime or deployment target is authorized. |
| Research validity | None | No research observation, metric, export, or fidelity claim changes. |

## Allowed Writes

- `docs/tasks/T14-measured-public-map-quality.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/globals.css`
- `shuttle-tracking-web/components/admin/RouteStopsModal.tsx`
- `shuttle-tracking-web/components/public/BottomDock.tsx`
- `shuttle-tracking-web/components/public/MapControls.tsx`
- `shuttle-tracking-web/components/public/VehicleInfoCard.tsx`
- `shuttle-tracking-web/hooks/usePreloader.ts`
- `shuttle-tracking-web/hooks/useRouteGeometry.ts`
- `shuttle-tracking-web/hooks/useShuttleTracker.ts`
- `shuttle-tracking-web/hooks/useVehicleTracking.ts`
- `shuttle-tracking-web/utils/MapHelpers.ts`
- `shuttle-tracking-web/utils/motion.ts`
- `shuttle-tracking-web/tests/t14-map-quality.test.ts`
- `shuttle-tracking-web/tests/t14-map-quality.spec.ts`
- `shuttle-tracking-web/tests/t8-local-server.mjs`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `docs/decision-queue.md`
- `docs/audits/frontend-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- `docs/tasks/T14-truthful-feedback-and-live-state.md`
- `docs/tasks/T14-accessible-dialogs-and-navigation.md`
- `shuttle-tracking-web/components/public/ShuttleTracker.tsx`
- `shuttle-tracking-web/hooks/useLeafletMap.ts`
- `shuttle-tracking-web/tests/t8-route-switch.spec.ts`
- `shuttle-tracking-web/tests/t14-truthful-state.spec.ts`
- `shuttle-tracking-web/tests/t14-accessibility.spec.ts`

## Invariants

- Public visual identity, route order/selection, Stop/vehicle selection, ETA, Feedback, canonical
  state, local expiry, PWA transport, and all prior T8/T14 truth/accessibility journeys remain.
- The selected route's stop markers and geometry are ready before the preloader's normal completion;
  unselected routes do not block it. Route API failure still reaches the existing safety timeout.
- A route's stop/geometry load is idempotent while pending and after success. Switching to an
  unloaded route selects it and loads it once; switching back reuses its layer/cache.
- Cancelling animation prevents every older frame from mutating its marker. Removal, non-live state,
  replacement, and hook cleanup cancel owned animations. Reduced motion writes the final position
  without scheduling a frame.
- Touch-target and overlap corrections do not hide controls, intercept the map outside the target,
  or reduce the content card below usable width.
- No dependency, stateful external target, migration, seed, deployment, provider, hardware, or
  Mobile action is introduced.

## Required Changes

1. Add a strict pure motion utility with an injectable frame scheduler, a cancellation contract,
   reduced-motion detection/options, and deterministic tests for completion/replacement/cancel/no-
   frame behavior. Keep Leaflet-specific writes at the existing map boundary.
2. Track one active marker animation per vehicle. Cancel before replacement and on non-live/removal/
   cleanup; choose immediate final positions and non-animated Leaflet fly/pan/scroll behavior when
   `prefers-reduced-motion: reduce` matches.
3. Deduplicate route loads and load only the initially selected route. Selecting an unloaded route
   starts its data/geometry load exactly once; loaded routes remain reusable. Change preloader
   completion from all-route readiness to selected-route readiness without hiding an initial-route
   failure behind a success claim.
4. Encode the current request budget in Playwright: with the two-route fixture, initial readiness
   requests only R01 stops/geometry; selecting R02 requests R02 once; repeated switching adds no
   stop/OSRM request.
5. Preserve the visible 36 px Public map-control panels inside controls with at least 44 px hit boxes.
   Constrain BottomDock only below the measured collision threshold so the visible Stop card and map
   controls have non-overlapping bounding boxes at 320 CSS px.
6. Raise the three audited route-order action controls to at least 44 CSS px and browser-measure them
   in the existing Admin modal without changing their action/order semantics.
7. Add a reduced-motion media block that eliminates continuous pulse/preloader animation and long
   transition/scroll behavior for reduced-motion users, while leaving default computed motion in
   place. Prove both media modes in the focused browser suite.

## Acceptance Criteria

- Pure tests prove animation reaches the same destination, replacement cancels the prior writer,
  explicit cancellation prevents later writes, cleanup cancels all owned frames, and reduced motion
  schedules zero frames.
- On first Public readiness with R01/R02 active, only R01 stops and one R01 geometry attempt occur.
  Selecting R02 adds one R02 stops/geometry attempt; toggling routes again does not add requests.
  The preloader clears through normal selected-route completion rather than its five-second safety.
- At 320 by 568 CSS px with a visible Stop card, all three map control buttons measure at least 44 by
  44 CSS px, the dock/control rectangles do not overlap, and the Public tokens/type/order remain.
- The three RouteStops move-up/move-down/remove buttons measure at least 44 by 44 CSS px and retain
  their accessible names, disabled states, ordering behavior, and modal focus contract.
- With reduced motion, marker/map/scroll helpers choose immediate behavior and known continuous CSS
  animations do not repeat; without reduced motion, the incumbent motion path remains enabled.
- Focused map-quality tests, existing T8/T14 truth/accessibility journeys, lint, production build,
  full repository CI, scoped Impeccable detector, `git diff --check`, and workflow validation pass.
  Browser timings/request counts are synthetic local evidence, not deployed performance proof.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:t14:map-quality`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:map-quality`
- `npm --prefix shuttle-tracking-web run test:e2e:t8`
- `npm --prefix shuttle-tracking-web run test:e2e:t14`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run lint`
- `npm --prefix shuttle-tracking-web run build:check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/globals.css shuttle-tracking-web/components/admin/RouteStopsModal.tsx shuttle-tracking-web/components/public/BottomDock.tsx shuttle-tracking-web/components/public/MapControls.tsx shuttle-tracking-web/components/public/VehicleInfoCard.tsx shuttle-tracking-web/hooks/usePreloader.ts shuttle-tracking-web/hooks/useRouteGeometry.ts shuttle-tracking-web/hooks/useShuttleTracker.ts shuttle-tracking-web/hooks/useVehicleTracking.ts shuttle-tracking-web/utils/MapHelpers.ts shuttle-tracking-web/utils/motion.ts`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

- Not applicable. Source/test-only frontend quality change; no external runtime, deployment, cache
  purge, or migration target is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist before editing.
- Stop if selected-route loading changes server/cache/API authority, route order, ETA/canonical state,
  or requires new product copy/policy.
- Stop rather than bundling contrast/theming, OSM/provider, raw-image, broad live-region, Public
  redesign, Admin hierarchy/theme, a dependency, or T9/T11/T13/T15 work.

## Completion Evidence

- Status: `Complete — measured Public map quality slice`
- Acceptance mapping:
  - Request budget → the initial two-route fixture requests only R01 stops plus one geometry attempt;
    first selection of R02 adds one stops/geometry attempt; repeated R01/R02 switching adds none. The
    selected route, not the whole route catalog, owns normal preloader completion, pending loads are
    deduplicated, successful layers are reused, and failed loads remain retryable.
  - Motion lifecycle → one pure typed utility owns frame scheduling, replacement, explicit/all
    cancellation, reduced-motion options, and scroll behavior. Each vehicle owns at most one marker
    animation; replacement, non-live/removal, route removal, local expiry, and hook cleanup cancel it.
  - Reduced motion → marker destinations resolve without a frame, Leaflet fly/pan and station-list
    scrolling become immediate, and known continuous pulse/spin/preloader motion runs once with
    near-zero duration under the media preference. Default motion remains enabled.
  - Responsive/touch → every Public map control exposes a 44 px target around the existing 36 px
    visible panel. At 320 by 568 the visible dock retains a measured 240 px width and does not
    intersect the control stack. RouteStops move-up/down/remove targets measure at least 44 px.
  - Regression contract → T8 canonical expiry/route switching, T14 truth, and all scoped dialog/
    navigation focus journeys remain green. Public palette, type, component order, desktop/tablet
    geometry, canonical state, route order, ETA, Feedback, and Admin theme remain unchanged.
- Changed files: implementation commit `c5b2e69e3b877516eada33845cd1445c2b313478`
  contains only the exact allowed CSS, Public/Admin components, route/preloader/tracking hooks,
  motion/map utilities, package/config, and focused unit/browser tests. The unrelated dirty
  Feedback-role migration was preserved and excluded.
- Validation results:
  - Measurement-first baseline failed as expected: startup requested R01 and R02, reduced-motion CSS
    remained `infinite`, and no cancellable motion owner existed.
  - `npm --prefix shuttle-tracking-web run test:t14:map-quality` — 4/4 passed for destination,
    cancellation, replacement/cleanup, and zero-frame reduced motion.
  - `npm --prefix shuttle-tracking-web run test:e2e:t14:map-quality` — 2/2 passed for selected-route
    request budgets, normal preloader completion, 320 px non-overlap/44 px targets/36 px visible
    controls, reduced motion, and Admin route-order targets.
  - `npm --prefix shuttle-tracking-web run test:e2e:t8` — 1/1 passed; `test:e2e:t14` — 2/2 passed;
    `test:e2e:t14:a11y` — 4/4 passed.
  - `npm --prefix shuttle-tracking-web run lint` — zero errors and the same two pre-existing warnings
    in `app/layout.tsx` and `utils/IconHelpers.ts`.
  - `npm --prefix shuttle-tracking-web run build:check` — TypeScript/CSS compilation and all 11
    static pages passed. The first sandboxed build attempt failed only because Turbopack could not
    bind an internal port; the required elevated rerun and both full-CI builds passed.
  - Final scoped Impeccable detector returned one reviewed advisory for the pre-existing tiled
    `map-bg` fallback in `globals.css`; this is an actual map canvas surface, not a new decorative UI,
    and removing it would violate the identity-preserving scope. No blocking detector result exists.
  - `bash scripts/ci-checks.sh` — final exit 0 after Backend build/boundaries/Prisma, all Frontend
    unit/E2E/lint/build checks, Compose, production topology, unsafe-log scan, and workflow validation.
  - `git diff --check` and `node scripts/validate-agent-workflow.js` — passed.
  - One diagnostic Playwright run revealed that an existing Service Worker could bypass page-level
    mocks and made a read-only OSRM request. The final focused suite blocks Service Workers only for
    deterministic request measurement; the separate PWA/Socket regression remains enabled and green.
- Audit freshness changes: Product, Architecture, Frontend, Dashboard & UX, Production Readiness,
  and Roadmap are downgraded to `Needs Re-audit — T14 measured map quality` because Public route-load,
  preloader, motion, narrow-screen layout, and scoped Admin touch behavior changed. Backend, Database,
  Infrastructure & Device, and Security/DevOps/Observability behavior did not change.
