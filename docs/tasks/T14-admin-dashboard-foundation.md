# Implementation Task Specification: T14 — Admin Dashboard Foundation

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, D-011 Admin shell/Dashboard slice
- User authorization: Run Approved Batch request. Public visual identity must remain substantially
  unchanged; Admin Dashboard/Admin pages may be visually improved. T9 and T13 are deferred, T11
  remains dependency-gated, and D-011/D-012 follow their approved owner choices.
- Approved decisions: `D-001=C`, `D-011`
- Specialist briefs: None required. The fresh Dashboard & UX audit and D-011 already select a
  bounded hierarchy/theme question; no cross-domain or owner-controlled uncertainty remains.
- Source audits: `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`,
  `docs/audits/frontend-audit.md`, `docs/audits/dashboard-ux-audit.md`, and
  `docs/audits/production-readiness-audit.md`, revalidated in commit
  `f42a2bb025c4756e04542fc9dbecb41009d8ce7a` and coordinated at `215b885`.

## Outcome and Non-goals

- Outcome: establish a scoped, accessible `RSU Operations` theme for the authenticated Admin shell
  and make the existing truthful Dashboard answer three questions in order: whether its data is
  verified, where canonical vehicle state is visible, and what configured service inventory exists.
  The map remains primary, supporting counts remain explicitly master-data counts, and existing
  source-health/vehicle-management destinations become visible shortcuts rather than invented
  exception actions.
- Non-goals: no Public UI/source change; no T11 trip/history/stale-device exception data or actions;
  no Research/Dev Dashboard; no broader Admin page restyle; no new API, query, auth, role, route,
  schema, persistence, Socket.IO, canonical-state, tile, icon, or deployment behavior; no dark-mode
  switch; no dependency change; no external repository or target action.

## Design Direction

- Theme: `RSU Operations`, a complementary control-room theme that evolves the incumbent dark-slate
  navigation, RSU blue accent, and light neutral work surfaces. Semantic Admin-only CSS tokens own
  canvas, surface, border, text, navigation, focus, positive, and danger colors.
- Hierarchy: concise operations context and verified/unavailable state first; canonical live map as
  the primary workspace; configured vehicles/routes/stops and existing navigation actions as a
  supporting rail. No unavailable exception layer is simulated.
- Visual language: solid surfaces, restrained elevation, blue accent rails, compact operational
  labels, and tabular-number treatment for counts. Avoid gradients, decorative glass, hover lift,
  excessive rounding, and Public glass/map styling changes.
- Trade-off: this creates a coherent light Admin foundation with strong continuity and bounded risk,
  but intentionally does not deliver dark mode or restyle every Admin page in this slice.

## Baseline Measurements

- Source order currently places the three configured-data cards before the canonical map, so the
  primary operational surface appears after supporting inventory at both desktop and Mobile sizes.
- The shell uses ad-hoc slate/blue utility values and decorative blur/shadow treatments with no
  Admin semantic theme boundary. The Dashboard repeats three near-identical card structures.
- Mobile navigation already has breakpoint-aware `inert`, dialog focus trapping, Escape/restoration,
  `aria-current`, and focus-visible behavior. Dashboard counts already fail closed and expose
  loading/error/ready/retry; LiveMap already separates snapshot/realtime state and canonical service
  counts. These are preservation requirements, not redesign targets.
- Measurement-first browser coverage must fail before correction on primary-map source order,
  Admin semantic-token presence, and the new hierarchy/shortcut contract, while recording 390 px
  and 1280 px horizontal-overflow and drawer behavior.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | D-011 permits a separately bounded Admin restructure while Public identity remains untouched. |
| Architecture | Bounded | Admin-only semantic tokens and local presentation components; existing service/state boundaries remain authoritative. |
| Security / privacy | None | Existing auth provider, role filtering, server authorization, payloads, logs, and identifiers are unchanged. |
| Data / migration | None | Existing endpoints and derived counts are presented without new persistence or interpretation. |
| Operations / rollout | Bounded | Frontend source/test rollback only; no target or deployment action is authorized. |
| Research validity | None | No research route, metric, observation, sample, export, or evidence claim changes. |

## Allowed Writes

- `docs/tasks/T14-admin-dashboard-foundation.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/admin/admin.css`
- `shuttle-tracking-web/app/admin/layout.tsx`
- `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- `shuttle-tracking-web/components/admin/Sidebar.tsx`
- `shuttle-tracking-web/components/admin/LiveMap.tsx`
- `shuttle-tracking-web/tests/t14-admin-dashboard.spec.ts`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `docs/decision-queue.md`
- `docs/audits/frontend-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- prior `docs/tasks/T14-*.md` handoffs
- `shuttle-tracking-web/app/globals.css`
- `shuttle-tracking-web/app/admin/login/page.tsx`
- `shuttle-tracking-web/contexts/AuthContext.tsx`
- `shuttle-tracking-web/hooks/useModalFocus.ts`
- `shuttle-tracking-web/services/api.ts`
- `shuttle-tracking-web/tests/t8-local-server.mjs`
- existing T8/T14 unit and browser suites

## Invariants

- Dashboard endpoints, list validation, enabled-vehicle definition, abort behavior, fail-closed
  values, Bangkok update label, retry, and `data-testid` contracts remain.
- LiveMap snapshot-first hydration, queued-event reconciliation, version ordering, local expiry,
  Socket lifecycle, canonical projection, marker rendering, retry, and test IDs remain.
- Mobile drawer remains inert only while closed below 1024 px, focus-trapped while open, Escape-
  closable, focus-restoring, and desktop-visible; role-filtered destinations and logout remain.
- Login remains outside the new shell theme. Other Admin pages inherit only shell canvas/navigation,
  not Dashboard component styling or behavioral changes.
- Public files and styling, backend/mobile source, migrations, APIs, dependencies, external assets,
  routes, roles, and external targets remain unchanged.

## Required Changes

1. Add an Admin-only stylesheet imported by the Admin layout with documented semantic tokens and
   reduced-motion-safe shell presentation. Scope tokens/classes under the authenticated shell so
   Login and Public UI retain their incumbent appearance.
2. Refactor the shell and Sidebar presentation into the `RSU Operations` direction while preserving
   navigation order, role visibility, Mobile dialog semantics, focus lifecycle, and logout behavior.
   Expose signed-in username/role only from the existing authenticated context.
3. Refactor the Dashboard into a semantic header, primary map workspace, and supporting configured-
   inventory/actions rail. Use small local typed presentation data/components instead of duplicating
   card markup; retain truthful loading/error/ready state and existing retry.
4. Consolidate the LiveMap overlays into one readable, responsive status surface that avoids the
   Leaflet zoom controls while preserving all canonical/realtime text, retry, summaries, map,
   markers, and behavior.
5. Add deterministic desktop/Mobile browser evidence for source/visual order, semantic theme token
   use, role/navigation continuity, no horizontal overflow, map/status priority, available shortcut
   destinations, loading/error/retry/ready truth, and existing drawer focus behavior.

## Acceptance Criteria

- At 1280 x 900, the map workspace precedes every configured-inventory card in DOM/keyboard order,
  occupies the primary column, and the supporting rail exposes Vehicles enabled, Total routes, and
  Transit stops without reinterpreting them as live telemetry.
- At 390 x 844, header, map, supporting metrics, and shortcuts fit without horizontal overflow; the
  closed drawer is inert and the open drawer still traps/restores focus. The LiveMap status surface
  remains inside map bounds and does not overlap the Leaflet top-left controls.
- Error mode renders em dashes and the existing retry; recovery renders 1/2/4 and an explicit
  Bangkok update state. Snapshot/realtime/canonical service summaries and retry behavior still pass
  their existing truth journey.
- Admin semantic tokens are computed on the shell, surface/text/border/focus colors meet the scoped
  contrast contract, and no gradients, decorative backdrop blur, or hover-translation are added.
- Source Health and Vehicles shortcuts use only existing authorized routes. No exception count,
  recovery promise, fabricated operational alert, Research data, or new action is rendered.
- Focused Admin Dashboard browser tests, every prior T8/T14 suite, lint, production build, full
  repository CI, scoped Impeccable detector, `git diff --check`, and workflow validation pass.
  Evidence remains synthetic Chromium/source evidence, not human/assistive-technology, physical-
  device, dark-theme, or deployed-runtime acceptance.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run test:e2e:t14`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:map-quality`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:contrast`
- `npm --prefix shuttle-tracking-web run test:e2e:t8`
- `npm --prefix shuttle-tracking-web run lint`
- `npm --prefix shuttle-tracking-web run build:check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/admin/admin.css shuttle-tracking-web/app/admin/layout.tsx shuttle-tracking-web/app/admin/dashboard/page.tsx shuttle-tracking-web/components/admin/Sidebar.tsx shuttle-tracking-web/components/admin/LiveMap.tsx`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

- Not applicable. Source/test-only authenticated frontend presentation; no migration, production
  target, cache, credential, network, Mobile repository, or deployment action is authorized.

## Stop Conditions

- Stop if a path outside this allowlist is required; revise and revalidate the exact task first.
- Stop if the implementation needs a new/changed endpoint, auth/role rule, persisted value, live/
  exception interpretation, Public change, Research data, broader Admin page refactor, dependency,
  or external target.
- Stop rather than bundling T9/T11/T13/T15, dark mode, external icon/tile work, socket ownership
  consolidation, operational exception workflows, or role/account lifecycle controls.

## Completion Evidence

- Status: `Ready for measurement-first implementation`
- Acceptance mapping: Pending.
- Changed files: task-contract/Roadmap coordination only.
- Validation results: pre-implementation scoped Impeccable detector returned `[]`; workflow and
  whitespace validation are required before handoff commit.
- Audit freshness result: Pending implementation acceptance and Level 1 re-audit.
