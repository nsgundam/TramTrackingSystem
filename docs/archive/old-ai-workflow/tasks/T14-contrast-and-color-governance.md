# Implementation Task Specification: T14 — Contrast and Route-Color Governance

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, D-011 contrast/visual-system slice
- User authorization: Run Approved Batch request. Public visual identity must remain substantially
  unchanged; source/UX improvements are allowed. Admin Dashboard visual redesign remains a later,
  separately bounded slice.
- Approved decisions: `D-001=C`, `D-011`
- Specialist briefs: None required. The measured map-quality re-audit selects bounded contrast/
  visual-system governance and leaves no focused owner-policy uncertainty.
- Source audits: `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`,
  `docs/audits/frontend-audit.md`, `docs/audits/dashboard-ux-audit.md`, and
  `docs/audits/production-readiness-audit.md`, revalidated in commit
  `fcff991d536d2e5de72d4d396b48770f981a6d5a` against immutable source baseline `7aae795...`.

## Outcome and Non-goals

- Outcome: one strict pure foreground/route-color boundary and one semantic muted-on-light token
  govern the audited contrast risks. Valid route background colors remain unchanged while small
  badge text selects black or white with at least 4.5:1 contrast. Invalid route-display colors fail
  to the incumbent blue fallback. Non-disabled low-emphasis text/icons on the audited white/light
  Public and Admin surfaces use a token with at least 4.5:1 text contrast and 3:1 non-text contrast.
- Non-goals: no Public layout, component order, typography, glass treatment, route identity/color,
  copy, map behavior, or information-surface change; no Admin theme/hierarchy redesign; no dark-mode
  implementation; no backend/schema/API/color-policy mutation; no broad component rewrite; no
  live-region, raw-image, OSM/provider, performance, T9, T11, T13, T15, deployment, dependency, or
  external-target work.

## Baseline Measurements

- Tailwind v4 `slate-400` is `#90a1b9`, which measures 2.63:1 against white; `gray-400` is
  `#99a1af`, which measures 2.60:1. Both fail WCAG AA for the audited 12–14 px text and the 3:1
  non-text threshold for close/action icons.
- The audited light surfaces use these values in Public Feedback/Tour controls and in white/light
  Admin dashboard, source-health, feedback, route, stop, vehicle, and modal surfaces. Disabled
  controls and the dark Admin Login/Sidebar surfaces are distinct and are not selected by this slice.
- Vehicle route badges render arbitrary `route.color` backgrounds with unconditional `text-white`.
  White measures only 1.32:1 on `#fde047` and 3.68:1 on the incumbent `#3b82f6`; neither guarantees
  small-text AA. A dark sample `#1e3a8a` needs white instead.
- Choosing the higher-contrast of black and white guarantees at least approximately 4.58:1 for any
  opaque sRGB background. Focused tests must encode the exact color parsing, ratio, fallback, and
  rendered-style contracts before correction.

## Identity-Preserving UI Direction

- Retain every valid route background exactly; change only its text foreground when white fails.
- Add one semantic muted-on-light token at `#45556c` (7.58:1 on white) and use it only where the
  current light-surface foreground fails. Do not globally replace slate/gray values on dark surfaces.
- Keep Public Feedback/Tour DOM order, spacing, size, copy, interactions, and palette relationships.
  The only visible Public difference is the minimum necessary darkening of low-contrast foregrounds.
- Keep all Admin layouts/components/actions unchanged. This contrast repair does not select or imply
  the later Admin Dashboard theme.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | D-011 permits accessibility/visual-system correction while protecting Public identity. |
| Architecture | Bounded | One pure utility owns untrusted display-color parsing/contrast; one shared badge owns the rendered invariant. |
| Security / privacy | None | No auth, payload logging, identifiers, permissions, or external-origin behavior changes. |
| Data / migration | None | Route values are normalized only for display; persistence and API contracts remain unchanged. |
| Operations / rollout | Bounded | Frontend source/test rollback only; no target or deployment action is authorized. |
| Research validity | None | No observation, metric, export, source comparison, or fidelity claim changes. |

## Allowed Writes

- `docs/tasks/T14-contrast-and-color-governance.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/globals.css`
- `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- `shuttle-tracking-web/app/admin/devices/page.tsx`
- `shuttle-tracking-web/app/admin/feedback/page.tsx`
- `shuttle-tracking-web/app/admin/routes/page.tsx`
- `shuttle-tracking-web/app/admin/stops/page.tsx`
- `shuttle-tracking-web/app/admin/vehicles/page.tsx`
- `shuttle-tracking-web/components/admin/RouteModal.tsx`
- `shuttle-tracking-web/components/admin/RouteStopsModal.tsx`
- `shuttle-tracking-web/components/admin/StopModal.tsx`
- `shuttle-tracking-web/components/admin/VehicleModal.tsx`
- `shuttle-tracking-web/components/public/AppTour.tsx`
- `shuttle-tracking-web/components/public/FeedbackModal.tsx`
- `shuttle-tracking-web/components/public/RouteSelector.tsx`
- `shuttle-tracking-web/components/shared/RouteColorBadge.tsx`
- `shuttle-tracking-web/utils/colorContrast.ts`
- `shuttle-tracking-web/tests/t14-contrast.test.ts`
- `shuttle-tracking-web/tests/t14-contrast.spec.ts`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `docs/decision-queue.md`
- `docs/audits/frontend-audit.md`
- `docs/audits/dashboard-ux-audit.md`
- `docs/tasks/T14-truthful-feedback-and-live-state.md`
- `docs/tasks/T14-accessible-dialogs-and-navigation.md`
- `docs/tasks/T14-measured-public-map-quality.md`
- `shuttle-tracking-web/components/admin/Sidebar.tsx`
- `shuttle-tracking-web/app/admin/login/page.tsx`
- `shuttle-tracking-web/hooks/useRouteGeometry.ts`
- `shuttle-tracking-web/tests/t8-local-server.mjs`
- existing T8/T14 browser and unit suites

## Invariants

- Valid route colors, route order/selection, map geometry, Marker/ETA/canonical state, Feedback
  behavior, modal/focus/navigation behavior, touch targets, reduced motion, and request budgets remain.
- Every rendered route badge obtains background and foreground from the same normalized color. No
  caller may reintroduce unconditional white badge text or independently parse the background.
- The color boundary accepts `unknown`, supports only `#RGB`/`#RRGGBB`, expands/normalizes valid
  input, and falls back deterministically without unsafe assertions or browser-only behavior.
- The semantic muted token is limited to foregrounds on audited white/light surfaces. Disabled
  controls and dark-surface tokens remain intentional and are not mechanically rewritten.
- No persisted route color, API payload, backend validation, dependency, external target, migration,
  seed, provider, hardware, or Mobile repository is changed.

## Required Changes

1. Encode strict pure sRGB parsing, normalization, relative luminance, contrast ratio, and readable
   black/white foreground selection. Test short/long mixed-case hex, invalid/unknown input, fallback,
   threshold-adjacent colors, and representative light/dark route colors.
2. Add one shared route-color badge that uses the pure boundary for both background and foreground.
   Replace both duplicated Vehicle route badges; normalize route display swatches/dots without
   changing valid colors.
3. Add the semantic muted-on-light token and replace only non-disabled `slate-400`/`gray-400`
   foregrounds on the exact audited light-surface files. Retain the existing hover, focus, spacing,
   size, text, and action behavior.
4. Add a deterministic source guard covering the exact audited light-surface files so unqualified
   `text-slate-400`/`text-gray-400` cannot recur while intentional `disabled:` and dark-surface usage
   remains outside the rule.
5. Add focused browser evidence: Public Feedback labels and close control meet their text/non-text
   ratios on the same white dialog; Admin route badges preserve representative valid light/dark
   backgrounds and every badge foreground measures at least 4.5:1. Confirm the incumbent Public
   route selector structure and prior T8/T14 journeys remain unchanged.

## Acceptance Criteria

- Pure tests prove parsing/normalization/fallback and demonstrate at least 4.5:1 for representative
  light, medium/default-blue, dark, short-hex, and invalid route inputs.
- The exact light-surface source guard passes with no non-disabled `text-slate-400` or
  `text-gray-400`; it does not ban those tokens globally or alter dark Login/Sidebar usage.
- Browser-computed Public Feedback label text is at least 4.5:1 against its dialog surface and the
  close icon is at least 3:1. Layout, dialog semantics, labels, and actions are unchanged.
- Browser-computed light and dark Admin route badges retain their valid input backgrounds, choose
  different readable foregrounds as required, and each measures at least 4.5:1. Invalid display
  input uses the incumbent normalized fallback.
- Focused contrast tests, T8/T14 truth/accessibility/map-quality suites, lint, production build,
  full repository CI, scoped Impeccable detector, `git diff --check`, and workflow validation pass.
  Computed-style evidence is synthetic Chromium evidence, not accessibility certification, human
  acceptance, physical-device coverage, or deployed theme evidence.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:t14:contrast`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:contrast`
- `npm --prefix shuttle-tracking-web run test:e2e:t8`
- `npm --prefix shuttle-tracking-web run test:e2e:t14`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:map-quality`
- `npm --prefix shuttle-tracking-web run lint`
- `npm --prefix shuttle-tracking-web run build:check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/globals.css shuttle-tracking-web/app/admin/dashboard/page.tsx shuttle-tracking-web/app/admin/devices/page.tsx shuttle-tracking-web/app/admin/feedback/page.tsx shuttle-tracking-web/app/admin/routes/page.tsx shuttle-tracking-web/app/admin/stops/page.tsx shuttle-tracking-web/app/admin/vehicles/page.tsx shuttle-tracking-web/components/admin/RouteModal.tsx shuttle-tracking-web/components/admin/RouteStopsModal.tsx shuttle-tracking-web/components/admin/StopModal.tsx shuttle-tracking-web/components/admin/VehicleModal.tsx shuttle-tracking-web/components/public/AppTour.tsx shuttle-tracking-web/components/public/FeedbackModal.tsx shuttle-tracking-web/components/public/RouteSelector.tsx shuttle-tracking-web/components/shared/RouteColorBadge.tsx`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

- Not applicable. Source/test-only frontend contrast repair; no external runtime, deployment,
  persisted color rewrite, cache purge, or migration target is authorized.

## Stop Conditions

- Stop if a path outside this allowlist is required; revise and revalidate the exact task first.
- Stop if correction requires changing a valid route color, Public layout/type/component order,
  server validation/persistence, product copy, or an owner-controlled theme choice.
- Stop rather than bundling dark mode, broad Public styling, Admin hierarchy/theme, OSM/assets,
  live-region expansion, another dependency, or T9/T11/T13/T15 work.

## Completion Evidence

- Status: `Complete — contrast/color-governance slice`
- Acceptance mapping:
  - Color boundary → strict pure parsing accepts only `#RGB`/`#RRGGBB`, normalizes case/short hex,
    falls back to `#3B82F6`, computes sRGB luminance/contrast, and selects black or white from the
    same normalized background. Representative light/default/dark/threshold/invalid inputs all
    produce at least 4.5:1.
  - Route rendering → one shared `RouteColorBadge` owns both background and foreground for Mobile/
    Desktop Vehicle views. Valid route colors remain unchanged; invalid badge, Public selector dot,
    and Admin route swatch display use the incumbent fallback.
  - Light-surface foregrounds → one `#45556c` semantic token replaces only the audited non-disabled
    400-level Public/Admin light-surface values. Public Feedback/Tour order, copy, spacing, size,
    interaction, glass/map identity, and all Admin layouts/actions remain unchanged.
  - Regression contract → an exact source guard prevents unqualified 400-level foregrounds from
    returning on the selected light files while preserving disabled and dark Login/Sidebar usage.
    Existing truth, focus/navigation, request/motion, responsive/touch, and canonical-state journeys
    remain green.
- Changed files: implementation commit `799905f4e11ab9d4ddcf1e612fe03f94e9b9ffd6`
  contains only the exact allowed frontend token, audited Public/Admin foregrounds, route display
  boundary/component, package/config, and focused unit/browser tests. The unrelated dirty Feedback-
  role migration was preserved and excluded.
- Validation results:
  - Measurement-first pure baseline failed because `utils/colorContrast.ts` did not exist. The
    corrected CSS Color 4 browser baseline failed both intended contracts: Public label contrast was
    2.6301:1 and zero shared route badges existed.
  - `npm --prefix shuttle-tracking-web run test:t14:contrast` — 4/4 passed for normalization,
    luminance/foreground selection, >=4.5 route cases, and the exact light-surface source guard.
  - `npm --prefix shuttle-tracking-web run test:e2e:t14:contrast` — 2/2 passed for Public computed
    text/icon contrast and valid-light/valid-dark/invalid Admin route badges.
  - `npm --prefix shuttle-tracking-web run check` — simulator 4/4, T8 unit 2/2, T9 unit 5/5,
    truth unit 5/5, motion 4/4, contrast 4/4, T8 browser 1/1, truth browser 2/2,
    accessibility 4/4, map-quality 2/2, contrast 2/2, lint, and 11-page production build passed.
    Lint retains only the same two pre-existing warnings in `app/layout.tsx` and
    `utils/IconHelpers.ts`.
  - The final scoped Impeccable detector returned the one reviewed pre-existing `map-bg` advisory;
    it is the actual map canvas fallback, not a new decorative grid or contrast defect.
  - `bash scripts/ci-checks.sh` — exit 0 after Backend build/boundaries/Prisma, all Frontend checks,
    Compose, production topology, unsafe-log scan, and workflow validation.
  - `git diff --check` and `node scripts/validate-agent-workflow.js` — passed.
  - Evidence is local/synthetic Chromium, not human or assistive-technology acceptance, a physical-
    device matrix, dark-theme acceptance, or deployed runtime proof.
- Audit freshness result: Product, Architecture, Frontend, Dashboard & UX, Production Readiness,
  and Roadmap were revalidated at `f42a2bb025c4756e04542fc9dbecb41009d8ce7a`. The technical score
  is 14/20 with two P1, eight P2, and one P3 open; Production remains No-Go. Backend, Database,
  Infrastructure & Device, and Security/DevOps/Observability remain current at `1eec866...` because
  their behavior did not change. The next eligible exact T14 slice is a bounded Admin shell/
  Dashboard hierarchy and complementary-theme foundation; Public UI, T11 exception data, Research,
  and broader Admin pages remain outside that slice.
