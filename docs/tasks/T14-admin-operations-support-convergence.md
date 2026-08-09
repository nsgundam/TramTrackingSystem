# Implementation Task Specification: T14 — Admin Operations-support Convergence

## Source Work

- Work ID: `T14`
- Lane: `Roadmap`
- Roadmap task: `T14`, D-011 Admin operations/support visual-system and truthful-state slice
- User authorization: Run Approved Batch request. Public UI should remain substantially unchanged;
  Admin surfaces may be improved fully. T9 and T13 are deferred, T11 remains dependency-gated, and
  no dependency or owner decision may be bypassed.
- Approved decisions: `D-009`, `D-010:A`, `D-011`. D-012 is not implemented by this slice.
- Specialist briefs: None required. The validated affected chain selects this exact narrowed P2,
  and the incumbent `RSU Operations` system plus existing T12 policy removes any open visual,
  product, data, security, or owner-controlled choice.
- Source audits: `docs/audits/product-audit.md`, `docs/audits/architecture-audit.md`,
  `docs/audits/frontend-audit.md`, `docs/audits/dashboard-ux-audit.md`, and
  `docs/audits/production-readiness-audit.md`, revalidated at
  `5cd0d9c2a4335f1705ad6731186de961c7427179` against completion baseline
  `4e609e327347163edf2e725d5ae40e7a9a6c0ecd` and implementation `7321a25`.

## Outcome and Non-goals

- Outcome: converge the existing authenticated Source Health and Feedback Inbox pages on the
  `RSU Operations` semantic Admin system. Both pages gain one shared page/state/action vocabulary,
  scan-first operational ledgers, explicit initial loading/failure/retry/empty/ready states, named
  44 px controls, and responsive Mobile behavior. The existing sensitive Feedback confirmation
  reuses the shared Admin dialog surface and focus lifecycle while preserving T12 policy and action
  semantics.
- Non-goals: no Public or Login source/style change; no Dashboard/master-data/Research redesign;
  no source recovery, assignment, credential, trip/history/exception, role-management, or new
  Feedback capability; no privacy/retention/status-transition/delete/restore policy change; no
  endpoint, request payload, DTO allowlist, auth/role, schema, persistence, migration, cache,
  dependency, backend, Mobile, T9/T11/T13/T15, dark-mode switch, deployment, or external-target work.

## Identity-preserving Admin Direction

- Subject/audience/job: an RSU transport operator or privileged case reviewer must verify source
  freshness or move an anonymous case safely, without mistaking a failed read for an empty queue.
- Palette: retain `RSU Operations` canvas `#F3F6FA`, surface `#FFFFFF`, ink `#142033`, muted
  `#526176`, RSU blue `#075DC7`, positive `#087A55`, and danger `#B42318`; status variants remain
  derived semantic extensions rather than a second palette.
- Type: retain the Admin shell's Inter body/display treatment and use the existing system monospace
  only for source/case identifiers and tabular operational values. No font or dependency changes.
- Layout: one context header and 44 px Refresh, then the binding privacy/read-only notice, then a
  truthful state or dense ledger. Desktop uses scan-friendly columns/cards; 390 px stacks the same
  fields and actions without horizontal overflow.
- Signature: a narrow operational signal rail on each source/case record encodes the existing
  freshness/status. It is structural, not decorative: the rail, badge, and text expose the same
  state and never rely on color alone.
- Self-critique: generic KPI cards, gradients, glass, oversized hero text, and decorative motion do
  not serve these task surfaces. The revised direction uses domain-specific ledgers, source/case
  labels, retention/read-only boundaries, and one restrained status rail instead.

```text
Desktop: [context + title + policy]                         [Refresh]
         [read-only / privacy boundary notice                         ]
         [status rail | source/case identity | verified facts | actions]

Mobile:  [context + title]
         [Refresh        ]
         [boundary notice]
         [rail | identity]
         [facts          ]
         [44 px actions  ]
```

## Baseline Measurements

- `devices/page.tsx` and `feedback/page.tsx` contain roughly 330 lines of hard-coded slate/blue/
  emerald/amber/rose/violet page, card, state, status, field, action, and dialog presentation rather
  than the semantic Admin system used by Dashboard and master data.
- Both pages render an error alert independently of their loading/empty branch. An initial failed
  Source Health read therefore also renders `No sources are registered`; an initial failed Feedback
  read also renders `No active feedback cases` and the recoverable-deletions section. Neither is a
  verified-empty result.
- Refresh and case action controls use padding-based heights below the audited 44 px minimum. Source
  cards, Feedback case cards, deleted rows, and the sensitive dialog do not share the current Admin
  page/panel/action/dialog primitives.
- The scoped Impeccable detector returns `[]`; manual/source inspection identifies the semantic,
  state-projection, and target-size gaps the regex detector cannot prove. Measurement-first browser
  coverage must fail on those absent contracts before implementation is accepted.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | D-011 and the validated Dashboard & UX audit select these two existing Admin surfaces only. |
| Architecture | Bounded | Shared typed presentation primitives and local read-state separation; current page/API/Auth/modal owners remain authoritative. |
| Security / privacy | Bounded | Preserve D-009 safe-field/privacy/retention copy, D-010:A role behavior, server authorization, fresh auth, and sensitive payloads exactly. |
| Data / migration | None | No schema, data, retention execution, migration, seed, cache, or persistence change. |
| Operations / rollout | Bounded | Frontend source/test rollback only; no source action, deployment, or external target is authorized. |
| Research validity | None | No observation, source comparison, metric, export, simulator, or Research surface changes. |

## Allowed Writes

- `docs/tasks/T14-admin-operations-support-convergence.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`
- `shuttle-tracking-web/app/admin/admin.css`
- `shuttle-tracking-web/app/admin/devices/page.tsx`
- `shuttle-tracking-web/app/admin/feedback/page.tsx`
- `shuttle-tracking-web/components/admin/AdminResourcePage.tsx`
- `shuttle-tracking-web/components/admin/AdminFormModal.tsx`
- `shuttle-tracking-web/tests/t14-admin-operations-support.spec.ts`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/package.json`

## Read-only Context

- `docs/decision-queue.md`
- current domain/release audits and prior `docs/tasks/T12-*.md` and `docs/tasks/T14-*.md` handoffs
- `shuttle-tracking-web/app/admin/layout.tsx`
- `shuttle-tracking-web/app/admin/dashboard/page.tsx`
- `shuttle-tracking-web/app/admin/vehicles/page.tsx`
- `shuttle-tracking-web/app/admin/routes/page.tsx`
- `shuttle-tracking-web/app/admin/stops/page.tsx`
- `shuttle-tracking-web/app/admin/login/page.tsx`
- `shuttle-tracking-web/components/admin/Sidebar.tsx`
- `shuttle-tracking-web/hooks/useModalFocus.ts`
- `shuttle-tracking-web/contexts/AuthContext.tsx`
- `shuttle-tracking-web/services/api.ts`
- existing T8/T12/T14 tests and local Playwright fixture

## Invariants

- Source Health remains available to `ADMIN` and higher, calls only `GET admin/devices/health`, and
  displays only `sourceType`, safe vehicle ID/name, freshness, `lastSeenAt`, status, and allowlisted
  `errorCategory`. It exposes no credential, payload, location, IP, assignment, recovery, or source-
  mutation action.
- Feedback Inbox remains hidden/denied for ordinary `ADMIN` and available only to `SUPER_ADMIN`/
  `DEV`; server authorization remains authoritative. It retains anonymous/one-way/non-emergency/
  business-day, 180-day case, and 30-day recoverable-deletion wording.
- Feedback still reads `admin/feedback` and `admin/feedback/deleted`, patches only optional `status`
  and trimmed `internalNote`, follows the current status graph, and clears a saved note draft only
  after success.
- Delete/restore still requires `auth/reauthenticate`; delete posts exactly one selected reason to
  `admin/feedback/:id/delete`, restore posts to `admin/feedback/:id/restore`, and submitting prevents
  Escape/close. Password, message, note, or Feedback content is not logged.
- Initial read failure is distinct from verified empty. Retry repeats only the incumbent GET reads;
  later refresh failure may retain prior verified data only with truthful stale-result guidance.
- Existing dialog naming, initial Cancel focus, wrapped focus, Escape/restoration, disabled-close,
  submit, and error behavior remain.
- Public, Login, Dashboard/master-data behavior, backend/API/auth/schema, Mobile, dependencies,
  migrations, runtime targets, and Research remain unchanged.

## Required Changes

1. Extend the typed Admin page primitives just enough for `source-health` and `feedback`, secondary/
   busy header actions, semantic notice/action variants, and required status tones. Preserve all
   current master-data consumers.
2. Convert Source Health to semantic Admin header/notice/state/panel/card classes. Separate initial
   failure from empty, attach a named Retry, preserve safe fields, expose status text plus the signal
   rail, and keep Refresh/Retry at least 44 px.
3. Convert Feedback Inbox to the same page language. Separate initial load failure from verified
   queues, preserve role and policy copy, retain every active/deleted field and action, and make
   compact desktop/Mobile case/deletion controls at least 44 px.
4. Reuse `AdminFormModal` for the sensitive confirmation without adding an extra close action or
   changing initial Cancel focus. Preserve reason/password labels, description, focus trap, Escape/
   restoration, submit lock, re-authentication, and exact delete/restore requests.
5. Extend `admin.css` with solid semantic operations ledger, boundary notice, field/action, and
   confirmation styles. Use the incumbent tokens, one status rail, responsive wrapping, and reduced-
   motion compatibility; add no gradient, glass blur, hover lift/scale, or new font.
6. Add deterministic desktop/Mobile browser evidence for hierarchy/policy, safe fields, role
   boundary, initial failure/retry/empty distinction, status/action sizing, no overflow, sensitive
   dialog focus, status/note transition payloads, re-authenticated delete/restore payloads, and scope.

## Acceptance Criteria

- At 1280 x 900, Source Health and Feedback share the semantic Admin header/notice/panel hierarchy;
  all existing safe source fields, case fields, retention/privacy guidance, status, responsibility,
  note, and recoverable-deletion details remain present without hard-coded page palettes.
- At 390 x 844, both pages have no horizontal overflow; source/case/deletion ledgers preserve the
  same content and actions, and every visible Refresh/Retry/case/dialog action measures at least
  44 by 44 CSS px.
- Initial Source Health or Feedback read failure renders one inline alert and named Retry, not an
  empty state or unverified queue. Retry recovers through the same GET endpoint(s); successful empty
  responses render only their explicit verified-empty states.
- Source Health remains read-only and exposes only the T12 safe-field allowlist. Feedback remains
  unavailable to `ADMIN`, retains its status graph and privacy/retention copy, and sends the same
  note/status/delete-reason/restore requests under current server/fresh-auth boundaries.
- The sensitive confirmation uses the solid semantic Admin dialog, starts focus on Cancel, wraps
  focus, restores the invoking action, closes with Escape only while idle, retains reason/password
  labels and description, and exposes 44 px controls.
- Computed page/panel/dialog presentation uses the existing Admin canvas/surface/ink/muted/border/
  primary/positive/danger/focus tokens, has no gradient, backdrop blur, or hover transform, and the
  signal rail always has equivalent visible status text.
- Public, Login, Dashboard, master-data behavior, backend/API/auth/schema, Mobile source,
  dependencies, migrations, and external targets are unchanged.
- Focused browser tests, every prior T8/T14 suite, lint, production build, full repository CI,
  scoped Impeccable detector, `git diff --check`, and workflow validation pass. Evidence remains
  local/synthetic, not human/assistive-technology, physical-device, deployed-runtime, retention-run,
  or release proof.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-operations-support`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:a11y`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-master-data`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:admin-dashboard`
- `npm --prefix shuttle-tracking-web run test:e2e:t14:contrast`
- `npm --prefix shuttle-tracking-web run check`
- `node /Users/ns/.codex/skills/impeccable/scripts/detect.mjs --json shuttle-tracking-web/app/admin/admin.css shuttle-tracking-web/app/admin/devices/page.tsx shuttle-tracking-web/app/admin/feedback/page.tsx shuttle-tracking-web/components/admin/AdminResourcePage.tsx shuttle-tracking-web/components/admin/AdminFormModal.tsx`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

- Not applicable. Source/test-only authenticated frontend presentation and read-state recovery; no
  migration, retention run, deployment, credential, network, Mobile repository, or external target
  action is authorized.

## Stop Conditions

- Stop if another write path is required; revise and revalidate this exact allowlist first.
- Stop if implementation requires a changed endpoint/payload, DTO allowlist, schema, auth/role rule,
  privacy/retention/status/deletion policy, source action, persisted value, dependency, or owner
  decision.
- Stop rather than changing Public/Login, Dashboard/master-data behavior, T11/Research/T13/T15,
  backend/Mobile, external runtime, human/deployed acceptance, or dark/theme-switch policy.

## Completion Evidence

- Status: `Pending implementation`
- Acceptance mapping: Pending measurement-first implementation and Main Agent review.
- Changed files: Pending exact implementation commit; the unrelated dirty Feedback-role migration
  must remain preserved and excluded.
- Validation results: Pending focused and full acceptance checks.
- Audit freshness changes: On accepted implementation, downgrade Product, Architecture, Frontend,
  Dashboard & UX, Production Readiness, and Roadmap to `Needs Re-audit`. Level 3 cannot mark an
  affected audit complete.
