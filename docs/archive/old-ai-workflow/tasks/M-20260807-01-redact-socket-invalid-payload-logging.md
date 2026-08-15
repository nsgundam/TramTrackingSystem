# Implementation Task Specification: M-20260807-01 — Redact Socket.IO invalid-payload logging

## Source Work

- Work ID: `M-20260807-01`
- Lane: `Maintenance`
- Roadmap task: `Not applicable`
- User authorization: Explicit request on 2026-08-07 to inspect the repository and update clear,
  safe fixes
- Approved decisions: `None required`
- Specialist briefs: `None`; the validated SEC-01 finding and its required invariant are explicit
- Source audits: `docs/audits/security-devops-observability-audit.md` and
  `docs/audits/production-readiness-audit.md`, both `Validated` at the current T12 evidence
- Execution mode: Direct Main Agent implementation

## Outcome and Non-goals

- Outcome: Reject invalid Socket.IO location input without writing the untrusted payload,
  coordinates, or arbitrary body content to ordinary logs, while preserving the safe response and
  allowlisted operational outcome signal.
- Non-goals: Do not change observation validation, sender authorization, ingestion behavior,
  response codes, CORS/topology, logging infrastructure, dependencies, schema, frontend behavior,
  or roadmap ordering.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | None | Invalid sender acknowledgement and error-response behavior remain unchanged. |
| Architecture | Bounded | Removes one duplicate unsafe diagnostic path; the existing operational-signal boundary remains authoritative. |
| Security / privacy | Bounded | Resolves SEC-01 by preventing untrusted Socket.IO payload content from entering stdout/stderr. |
| Data / migration | None | No schema, migration, persisted record, or retention behavior changes. |
| Operations / rollout | Bounded | Log content becomes safer; no runtime target, deployment, or configuration change is required. |
| Research validity | None | Accepted observation and research metadata processing remain unchanged. |

## Allowed Writes

- `docs/tasks/M-20260807-01-redact-socket-invalid-payload-logging.md`
- `shuttle-tracking-backend/src/server.ts`
- `shuttle-tracking-backend/tests/test_operational_signals.js`
- `scripts/ci-checks.sh`
- `docs/audits/README.md`

## Read-only Context

- `AGENTS.md`
- `agents/level-3-refactor/AGENT.md`
- `.agents/skills/tram-refactoring-workflow/SKILL.md`
- `docs/project-knowledge-base.md`
- `docs/decision-queue.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/security-devops-observability-audit.md`
- `docs/audits/production-readiness-audit.md`
- `shuttle-tracking-backend/src/services/operational-signals.ts`
- `shuttle-tracking-backend/package.json`

## Invariants

- Invalid Socket.IO observations receive the same safe mapped code/message and are not processed.
- Every rejected observation still emits the allowlisted `ingestion.outcome` metadata signal.
- Ordinary logs contain no raw payload, coordinates, secrets, request bodies, or arbitrary error
  objects.
- Accepted observation, canonical-state, and research metadata paths are unchanged.

## Required Changes

1. Remove the raw Socket.IO payload from invalid-observation logging and rely on the existing
   allowlisted rejection signal.
2. Add a deterministic regression assertion covering the Socket.IO source logging boundary.
3. Extend the repository unsafe dynamic logging gate to reject console calls containing `rawData`.
4. Downgrade directly affected audit register rows pending Level 1 re-audit.

## Acceptance Criteria

- The invalid `send-location` parser path has no console call containing `rawData` or payload fields.
- Invalid input response/acknowledgement and operational `reasonCode` behavior remain unchanged.
- Backend boundary tests deterministically fail if `rawData` is reintroduced into a console call.
- The repository logging scan also rejects such a regression.
- Backend build/tests, Prisma validation, repository CI, workflow validation, and whitespace checks
  pass without a stateful migration, service, or deployment run.

## Validation Commands

- `npm --prefix shuttle-tracking-backend run build`
- `npm --prefix shuttle-tracking-backend run test:boundaries`
- `npm --prefix shuttle-tracking-backend run prisma:validate`
- `bash scripts/ci-checks.sh`
- `node scripts/validate-agent-workflow.js`
- `git diff --check`

## Rollout and Migration Limits

- Not applicable. Do not start services, run migrations/seeds, deploy, or use ambient data.

## Stop Conditions

- Stop if another write path is required.
- Stop if preserving the response/signal contract requires an owner decision or broader logging
  architecture change.
- Stop rather than changing topology, authentication, validation, dependencies, schema, or roadmap
  scope.

## Completion Evidence

- Status: `Complete`
- Acceptance mapping:
  - No raw invalid Socket.IO payload logging → the direct `console.warn(..., { rawData })` path was
    removed; the mapped acknowledgement, `error-response`, and allowlisted rejection signal remain.
  - Deterministic regression → `test_operational_signals.js` scans every `console.log/warn/error`
    statement in `server.ts`, rejects `rawData`, and asserts the safe invalid-code signal remains.
  - Repository enforcement → `scripts/ci-checks.sh` now includes `rawData` in the unsafe dynamic
    logging gate.
  - Static/runtime-safe validation → backend boundary tests, Prisma validation, frontend checks,
    Compose parsing, workflow validation, and whitespace validation pass without starting the
    application stack or mutating data.
- Changed files:
  - `docs/tasks/M-20260807-01-redact-socket-invalid-payload-logging.md`
  - `shuttle-tracking-backend/src/server.ts`
  - `shuttle-tracking-backend/tests/test_operational_signals.js`
  - `scripts/ci-checks.sh`
  - `docs/audits/README.md`
- Validation results:
  - `npm --prefix shuttle-tracking-backend run build` — passed on 2026-08-07.
  - `npm --prefix shuttle-tracking-backend run test:boundaries` — passed on 2026-08-07.
  - `npm --prefix shuttle-tracking-backend run prisma:validate` — passed on 2026-08-07.
  - `node scripts/validate-agent-workflow.js` — passed on 2026-08-07.
  - `git diff --check` — passed on 2026-08-07.
  - `bash scripts/ci-checks.sh` — sandboxed Playwright could not bind `127.0.0.1:13001` (`EPERM`).
    The first approved external run reached Playwright but hit the pre-existing T8 expiry timing
    flake; an immediate full approved rerun passed every gate on 2026-08-07. Frontend lint retained
    two pre-existing warnings and reported zero errors.
- Audit freshness changes: Security, DevOps & Observability; Production Readiness; and Roadmap were
  downgraded to `Needs Re-audit` at implementation completion, then revalidated by Level 1 on
  2026-08-07 after all M-20260807-01/02/03 evidence was stable. M-20260807-01 changes SEC-01 evidence
  but does not change roadmap ordering or resolve D-008, T11, runtime, provider, hardware, or field-
  evidence gates.
