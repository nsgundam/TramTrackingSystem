# Implementation Task Specification: M-20260811-01 — Public server-rendered shell

## Source Work

- Work ID: `M-20260811-01`
- Lane: `Maintenance`
- Roadmap task: `Not applicable`
- User authorization: User requested a reasonable hybrid-rendering adjustment on 2026-08-11.
- Approved decisions: `None`
- Specialist briefs: `None`
- Source audits: `docs/project-knowledge-base.md` and `docs/audits/frontend-audit.md` (`Needs Re-audit` in the Audit Register before this work)

## Outcome and Non-goals

- Outcome: The public route preserves a server boundary and no-JavaScript fallback while showing only the existing map preloader after the browser-only Leaflet tracker loads.
- Non-goals: No visual redesign, API/realtime/state-contract change, admin change, dependency change, or attempt to server-render Leaflet.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | Avoids sequential duplicate loading screens and retains no-JavaScript messaging. |
| Architecture | Bounded | Narrows the client-only boundary to a dedicated adapter; Leaflet remains browser-only. |
| Security / privacy | None | No trust boundary, data, authentication, or logging changes. |
| Data / migration | None | No schema, persistence, or DTO changes. |
| Operations / rollout | Bounded | Normal frontend build/deploy; rollback is the source patch. |
| Research validity | None | No telemetry, research, provenance, or metric changes. |

## Allowed Writes

- `docs/tasks/M-20260811-01-public-server-shell.md`
- `shuttle-tracking-web/app/page.tsx`
- `shuttle-tracking-web/app/shuttle-tracker.css`
- `shuttle-tracking-web/components/public/PublicTrackerClient.tsx`
- `shuttle-tracking-web/tests/public-server-shell.test.mjs`

## Read-only Context

- `docs/project-knowledge-base.md`
- `docs/audits/README.md`
- `docs/audits/frontend-audit.md`
- `docs/decision-queue.md`
- `shuttle-tracking-web/components/public/ShuttleTracker.tsx`

## Invariants

- Leaflet, Socket.IO, geolocation, PWA, and localStorage behavior remain client-side.
- The existing `ShuttleTracker` remains the authoritative interactive public UI.
- The public route remains `/` and retains the language provider around the interactive tracker.

## Required Changes

1. Convert `app/page.tsx` into a server component with a no-JavaScript fallback.
2. Move the `ssr: false` dynamic import into a narrow client adapter.
3. Keep the existing map preloader as the only visible loading experience.
4. Add deterministic regression coverage for the rendering boundary and absence of the duplicate shell.

## Acceptance Criteria

- `app/page.tsx` contains no `use client`, `next/dynamic`, or direct Leaflet tracker import.
- Server output includes a no-JavaScript explanation but no duplicate loading UI.
- `PublicTrackerClient` owns the browser-only dynamic import with `ssr: false` and preserves `LanguageProvider`.
- Existing public frontend lint, tests, and production build pass.

## Validation Commands

- `node --test tests/public-server-shell.test.mjs`
- `npm run test:t8`
- `npm run lint`
- `npm run build`
- `bash scripts/ci-checks.sh`
- `git diff --check`
- `node scripts/validate-agent-workflow.js`

## Rollout and Migration Limits

- Not applicable; no migration or ambient runtime test is authorized.

## Stop Conditions

- Stop if another write path is required.
- Stop if an owner decision, migration target, secret, provider, or hardware fact is unresolved.
- Stop rather than changing architecture or adding dependencies outside this specification.

## Completion Evidence

- Status: `Complete`
- Acceptance mapping: Server/client boundary and absence of duplicate shell → `node --test tests/public-server-shell.test.mjs` (2/2 pass); existing canonical projection → `npm run test:t8` (2/2 pass); valid Next.js production boundary → `npm run build` (pass, `/` prerendered static); frontend static quality → `npm run lint` (0 errors, 2 pre-existing warnings).
- Changed files: `docs/tasks/M-20260811-01-public-server-shell.md`, `shuttle-tracking-web/app/page.tsx`, `shuttle-tracking-web/app/shuttle-tracker.css`, `shuttle-tracking-web/components/public/PublicTrackerClient.tsx`, `shuttle-tracking-web/tests/public-server-shell.test.mjs`.
- Validation results: 2026-08-11 — focused boundary tests pass; T8 tests pass; frontend lint passes with two existing warnings; frontend production build passes; prior Compose validation and `git diff --check` pass. Full repository CI limitations remain the pre-existing CRLF Bash script, stale generated Prisma Client types, missing `cross-env` for E2E, and Windows path handling in the workflow validator.
- Audit freshness changes: None planned; Discovery and Frontend were already `Needs Re-audit` before this task.
