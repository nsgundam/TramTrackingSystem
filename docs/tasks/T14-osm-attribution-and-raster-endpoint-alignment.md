# Implementation Task Specification: T14 — OSM Attribution and Standard Raster Endpoint Alignment

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, remaining visible map-attribution and official Standard raster endpoint
  finding
- User authorization: Run Approved Batch plus the 2026-08-11 direction to continue Roadmap work
  without bypassing dependencies or owner decisions. Public visual/product identity must remain
  substantially unchanged; the compact map credit required by the current provider policy is the
  only authorized Public presentation change.
- Approved decisions: D-011 fixes the Public preservation boundary and bright-neutral Admin world.
  D-012 is approved but intentionally unimplemented here.
- Specialist briefs: None required. The ordered Product, Architecture, Frontend, Dashboard & UX,
  Production Readiness, and Roadmap re-audit at coordination commit
  `fd527acb1f331b055b586ada40f626abb2a8ae65` selects this exact bounded unit; no focused cross-domain
  uncertainty remains.
- Source audits: the affected Level 1 chain is validated against immutable source baseline
  `70f42c15948bf09e71a3c91d594a4c21f52db23b`; unaffected Discovery/domain evidence is current at
  `1eec866b986b4cb4e802f7a48fac93e54e780699`.
- External policy evidence: the OSM Foundation Tile Usage Policy at
  `https://operations.osmfoundation.org/policies/tiles/`, reviewed 2026-08-11, identifies the exact
  Standard raster URL `https://tile.openstreetmap.org/{z}/{x}/{y}.png` and requires clearly visible
  attribution on the map. This task aligns only those named constraints; it does not claim full
  provider-policy compliance or authorize a provider, caching, identification, or rollout change.
- Product/design workflow: identity-preserving frontend work under `frontend-design`. Reuse
  Leaflet's compact native attribution presentation at the edge of the map; do not introduce a new
  visual component, overlay family, typography, color system, or general Public redesign.

## Gate and Execution Status

- Dependency gate: Passed. T8 and the first eleven accepted T14 slices are complete for their exact
  scopes. T9/T13 remain owner-deferred, T11/T15 remain blocked, and none is bypassed.
- Decision gate: Passed. D-011 supplies the required Public/Admin direction. Showing the provider
  credit and using its named endpoint applies a current external constraint rather than selecting a
  new visual world or provider. D-012 implementation remains excluded.
- Task gate: Passed when this exact-path handoff is committed. No application source may change
  before the focused measurement-first guard fails against the incumbent hidden-attribution and
  subdomain-template implementation.
- Evidence-freshness gate: Passed. The affected Level 1 chain is current at `70f42c1`; creating this
  contract changes coordination only, not application evidence.
- Specialist gate: Direct Level 3 is sufficient. Stop and route one focused question to Level 2
  only if inspection exposes an unresolved provider/licence or layout fact.
- Execution mode: Direct Level 3, measurement-first, inside the approved batch. Stop at any new
  owner decision, dependency, provider, server/API/auth/schema, observable map behavior, external
  target, or write-path need.

## Outcome and Non-goals

- Outcome: use the exact current OSM Standard raster endpoint in the Public and Admin maps, restore
  a compact visible linked OSM attribution on Public, retain the existing visible Admin credit, and
  keep all browser tests deterministic against the new exact host. The credit stays within the map
  and clear of incumbent controls/docks at the measured narrow widths.
- Non-goals: no map provider, tile style, zoom range, center, viewport, route, stop, marker, popup,
  geolocation, motion, Socket.IO, canonical state, Admin hierarchy/theme, Login, non-attribution
  Public DOM/copy/layout, backend, API/auth/schema, dependency, cache, service worker, offline,
  prefetch, bulk-download, proxy, User-Agent/Referer, Mobile, migration, Research, T9/T11/T13/T15,
  deployment, external-runtime, stop-image/storage, Flaticon, or global-font work. This is not a
  full OSM policy or production-runtime certification.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | One compact provider credit becomes visible on Public; all other Public/Admin presentation and behavior remain regression constraints. |
| Architecture | Bounded | Existing Leaflet owners keep their responsibilities; one immutable config boundary owns the shared attribution and raster URL literals. |
| Security / privacy | None | No credential, user data, request payload, logging, permission, authentication, or server boundary changes. |
| Data / migration | None | No schema, persistence, cache mutation, seed, migration, or stateful target action. |
| Operations / rollout | Bounded | Browser source/test rollback only; deterministic interception must prevent ambient tile fetches during local CI. No deployment or provider-console action. |
| Research validity | None | No observation, metric, simulator, device, export, provenance, or Research surface changes. |

## Allowed Writes

- `docs/tasks/T14-osm-attribution-and-raster-endpoint-alignment.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/config/openStreetMap.ts`
- `shuttle-tracking-web/hooks/useLeafletMap.ts`
- `shuttle-tracking-web/components/admin/LiveMap.tsx`
- `shuttle-tracking-web/app/shuttle-tracker.css`
- `shuttle-tracking-web/tests/t14-osm-attribution.test.ts`
- `shuttle-tracking-web/tests/t14-map-quality.spec.ts`
- `shuttle-tracking-web/tests/t14-admin-dashboard.spec.ts`
- `shuttle-tracking-web/tests/t14-public-service-explanation.spec.ts`
- `shuttle-tracking-web/tests/t14-truthful-state.spec.ts`
- `shuttle-tracking-web/tests/t14-admin-liquid-glass.spec.ts`
- `shuttle-tracking-web/tests/t14-contrast.spec.ts`
- `shuttle-tracking-web/tests/t14-accessibility.spec.ts`
- `shuttle-tracking-web/tests/t8-route-switch.spec.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`
- `docs/project-knowledge-base.md`, `docs/decision-queue.md`, current audits, Roadmap, and prior T14
  task/completion records
- `shuttle-tracking-web/components/public/ShuttleTracker.tsx`
- `shuttle-tracking-web/components/public/MapControls.tsx`
- `shuttle-tracking-web/components/public/BottomDock.tsx`
- `shuttle-tracking-web/config/backend.ts`
- `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- `shuttle-tracking-web/app/admin/admin.css`
- Playwright configuration and the local T8/T14 mock server
- all other Public/Admin source, backend, schema, migration, Mobile, Research, deployment,
  dependency-lock, asset, font, service-worker, and external-target paths

## Invariants

- One immutable frontend config boundary owns the exact raster URL and attribution values. Public
  and Admin consume exactly `https://tile.openstreetmap.org/{z}/{x}/{y}.png`; no `{s}` Standard tile
  host or alternate OSM raster endpoint remains in the two map owners.
- Public Leaflet attribution is enabled and the OSM tile layer contributes a visible linked
  `OpenStreetMap` credit pointing to `https://www.openstreetmap.org/copyright`. Admin retains the
  same linked credit. Neither stylesheet nor component state hides, toggles, or moves the credit
  off-map.
- The attribution uses Leaflet's incumbent compact control rather than a new React overlay. It may
  receive the minimum scoped CSS necessary for legibility/non-collision, but no new palette,
  typography, token, animation, glass surface, icon, or general layout rule is introduced.
- At 320 x 568 and 390 x 844, Public attribution remains fully inside the map/viewport and does not
  intersect `bottom-dock` or `map-controls`. At the existing 390 px Admin breakpoint it remains
  inside `admin-live-map` and does not intersect the status surface or Leaflet zoom controls.
- Public map initialization order, center `RSU_CENTER`, zoom 15, disabled native zoom control,
  maximum tile zoom 19, custom controls, route selection, geolocation, marker/route animation,
  bottom dock, preloader, tour, feedback, and canonical state behavior remain exact.
- Admin center, zoom, native controls, status/retry surface, canonical state, marker/popup, theme,
  responsive hierarchy, and Socket.IO lifecycle remain exact.
- All eight incumbent interception call sites across seven browser specs use the exact official tile
  host before navigation, and the previously unisolated T8 route-switch journey adds the same exact-
  host interception. No frontend-check browser journey relies on ambient OSM network access.
  Flaticon and OSRM handling remains unchanged.
- No dependency, `any`, unsafe assertion, lint disable, `@ts-ignore`, provider abstraction, cache,
  prefetch, offline pack, proxy, or service-worker tile path is introduced.

## Required Changes

1. Add a focused source-contract test and package/check script. Before implementation, run only its
   incumbent predicates and record a deterministic failure covering Public attribution disabled or
   hidden, both `{s}` endpoint literals, all eight stale wildcard interception call sites across the
   seven specs, and the absent T8 interception. Afterward, bind the exact endpoint, linked
   attribution, absence of hiding, exact-host interception, and allowed-path preservation.
2. Add one immutable `config/openStreetMap.ts` authority for the exact official Standard raster URL
   and linked provider credit. Enable Public Leaflet attribution and make both existing map owners
   consume those constants instead of their incumbent literals.
3. Remove the Public stylesheet rule that hides Leaflet attribution. Add no replacement styling
   unless browser measurement proves the compact native control is illegible, clipped, or colliding;
   any repair must remain scoped to `#rsu-map .leaflet-control-attribution`.
4. Update all eight incumbent Playwright interception call sites across the seven existing files
   from the wildcard subdomain pattern to the exact host, and add the same interception to the T8
   route-switch journey, so local/full CI cannot make ambient tile requests after the endpoint change.
5. Extend the existing map-quality browser suite with focused `T14 OSM attribution` journeys that
   assert visible text/link semantics, in-map bounds, no horizontal overflow, and non-intersection
   at Public 320/390 and Admin 390 while preserving incumbent map controls and hierarchy.

## Acceptance Criteria

- The measurement-first focused guard fails before source implementation for the incumbent hidden
  Public credit, disabled attribution control, two `{s}` endpoint templates, and stale browser
  interception patterns; the final focused suite passes after implementation.
- Public and Admin both consume one config authority for the exact current Standard raster URL and
  visibly expose its linked `OpenStreetMap` attribution within the map. Public no longer contains a
  CSS or Leaflet option that hides/disables it.
- Public 320 x 568 and 390 x 844 browser evidence proves the attribution box is visible, fully
  bounded, linked to the OSM copyright page, does not overlap the bottom dock or custom map controls,
  and creates no horizontal page overflow. Admin 390 x 844 evidence proves the same in-map bounds
  and no collision with its status surface or native zoom controls.
- Existing Public map request budgets, route selection, locate action, preloader/recovery, truthful
  state, accessibility, contrast, and Admin Dashboard/Liquid Glass/Login regressions pass. No
  successful Login/session browser claim is inferred from the rejection/redirect suite.
- All eight changed browser specs intercept `https://tile.openstreetmap.org/**`; every one of the
  eight incumbent wildcard call sites is gone, T8 is newly isolated, deterministic test evidence
  makes no ambient tile request, and no unrelated external-route handling changes.
- The scoped Impeccable detector returns `[]`; lint, strict build, full frontend check, full
  repository CI, `git diff --check`, and workflow validation pass.
- No non-attribution Public visual/product identity, Admin theme/hierarchy, map behavior, backend,
  API/auth/schema, dependency, cache/offline/prefetch, Mobile, migration, Research, deployment, or
  external-target path changes. The unrelated dirty Feedback-role migration remains excluded.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:t14:osm-attribution`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:map-quality -- --grep "T14 OSM attribution"`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:map-quality`
- `npm --prefix shuttle-tracking-web run test:e2e:t8`
- `npm --prefix shuttle-tracking-web run test:e2e:t14`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:contrast`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:public-service`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-liquid-glass`
- `npm --prefix shuttle-tracking-web run check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/config/openStreetMap.ts shuttle-tracking-web/hooks/useLeafletMap.ts shuttle-tracking-web/components/admin/LiveMap.tsx shuttle-tracking-web/app/shuttle-tracker.css`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

Not applicable. This is local browser frontend source/test alignment only. No migration, cache
operation, provider account, tile download, deployment, runtime target, credential, Mobile
repository, or external request outside ordinary existing map behavior is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist before writing.
- Stop if provider choice, licence interpretation beyond the two named policy constraints, custom
  attribution copy, caching/proxy/offline behavior, dependency, request identification, backend,
  auth/schema, deployment, or owner policy is required.
- Stop rather than moving/replacing incumbent controls, redesigning Public, changing Admin theme,
  weakening attribution visibility, introducing ambient test traffic, or absorbing asset/font,
  stop-image, Flaticon, T9/T11/T13/T15, Mobile, Research, or external-runtime work.

## Completion Evidence

- Status: `Pending`
- Execution note: exact handoff awaits commit, then its measurement-first failure.
- Source baseline: pending.
- Measurement-first evidence: pending.
- Final validation: pending.
- Visual evidence: pending for Public 320/390 and Admin 390 local synthetic browser captures.
- Evidence limits: source/local/synthetic browser evidence only; no human usability, assistive-
  technology, deployed/proxy/cache, provider-log, load, physical-device, Mobile, or production-
  runtime acceptance is authorized or claimed.
- Audit freshness changes: none at handoff creation. After source changes, Level 3 must mark Product,
  Architecture, Frontend, Dashboard & UX, Production Readiness, and Roadmap `Needs Re-audit`; Level 3
  never marks those reports complete.
