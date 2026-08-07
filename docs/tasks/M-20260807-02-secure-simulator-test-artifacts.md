# Implementation Task Specification: M-20260807-02 — Secure simulator and test artifacts

## Source Work

- Work ID: `M-20260807-02`
- Lane: `Maintenance`
- Roadmap task: `Not applicable`
- User authorization: Explicit request on 2026-08-07 to inspect, correct, and organize clear
  repository problems
- Approved decisions: `None required`
- Specialist briefs: `None`; the safe local-tooling boundary is explicit and does not select a
  production topology
- Source audits: `docs/project-knowledge-base.md`,
  `docs/audits/infrastructure-device-audit.md`, and
  `docs/audits/security-devops-observability-audit.md`
- Execution mode: Direct Main Agent implementation

## Outcome and Non-goals

- Outcome: Make the tracked Mobile Socket.IO simulator local/configurable and credential-fail-closed,
  restore its documented one-observation mode, and keep generated Playwright artifacts out of Git
  and Docker build context.
- Non-goals: Do not contact a running service, rotate credentials, change seed identities, select a
  deployment provider/origin, alter sender/backend behavior, change Playwright behavior, add a
  dependency, or modify roadmap ordering.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | None | Simulator/test tooling only; no rider/admin/mobile product surface changes. |
| Architecture | Bounded | Restores one environment-driven simulator configuration boundary and excludes generated artifacts. |
| Security / privacy | Bounded | Removes a tracked credential fallback and implicit production endpoint; prevents test traces from entering images accidentally. |
| Data / migration | None | No service is started and no database/cache data is read or written. |
| Operations / rollout | Bounded | Explicit environment variables are required for non-local targets; local URL remains the safe default. |
| Research validity | Bounded | Source/vehicle fixture identity and one accepted synthetic observation remain unchanged; no field claim is added. |

## Allowed Writes

- `docs/tasks/M-20260807-02-secure-simulator-test-artifacts.md`
- `shuttle-tracking-web/simulate.js`
- `shuttle-tracking-web/tests/simulator-tooling.test.mjs`
- `shuttle-tracking-web/package.json`
- `shuttle-tracking-web/.gitignore`
- `shuttle-tracking-web/.dockerignore`
- `docs/testing/pipeline-smoke-tests.md`
- `docs/audits/README.md`

## Read-only Context

- `AGENTS.md`
- `agents/level-3-refactor/AGENT.md`
- `.agents/skills/tram-refactoring-workflow/SKILL.md`
- `env.example`
- `shuttle-tracking-web/simulate-manual.js`
- `shuttle-tracking-web/playwright.config.ts`
- `docs/project-knowledge-base.md`
- `docs/audits/infrastructure-device-audit.md`
- `docs/audits/security-devops-observability-audit.md`
- `docs/audits/production-readiness-audit.md`

## Invariants

- `TS_MOB_01` remains the default Mobile source and `VH001` its default vehicle fixture.
- The simulator authenticates through REST, starts/uses the existing Trip path, and emits through
  authenticated Socket.IO without printing a secret or token.
- A non-local target is contacted only when the operator explicitly supplies its URL.
- `--once` sends at most one observation, disconnects, and returns a failing exit status when the
  acknowledgement is unsafe or unsuccessful.
- Generated test results remain available locally but are not tracked or copied into Docker images.

## Required Changes

1. Restore environment-driven API/Socket/source/vehicle configuration with a localhost default and
   no credential literal fallback.
2. Restore the documented `--once` path and safe acknowledgement summary without token/raw-response
   logging.
3. Add a deterministic source/ignore regression test and run it from the frontend check.
4. Ignore Playwright `test-results`, `playwright-report`, and `blob-report` in Git and Docker build
   context.
5. Clarify the smoke-test command's local-default/explicit-non-local contract.
6. Downgrade directly affected audit register rows pending Level 1 re-audit.

## Acceptance Criteria

- `simulate.js` contains no hard-coded production hostname or credential fallback literal.
- Missing `TRACKING_SOURCE_SECRET_MOBILE` fails before sender login or Socket.IO connection.
- API and Socket endpoints, source, and vehicle are configurable; localhost is the only fallback.
- `--once` performs one send attempt, closes the socket, and reports only allowlisted acknowledgement
  identity/status fields.
- Frontend checks deterministically enforce simulator and generated-artifact boundaries.
- Full repository CI, workflow validation, and whitespace checks pass without running the simulator
  or a stateful stack.

## Validation Commands

- `npm --prefix shuttle-tracking-web run test:simulator-tooling`
- `npm --prefix shuttle-tracking-web run lint`
- `npm --prefix shuttle-tracking-web run build`
- `bash scripts/ci-checks.sh`
- `node scripts/validate-agent-workflow.js`
- `git diff --check`
- `git status --short --ignored`

## Rollout and Migration Limits

- Do not run the simulator, services, migrations, seeds, deployments, or credential rotation. A
  real credential that may once have matched the removed literal must be assessed/rotated by the
  authorized external owner; repository inspection cannot prove provider state.

## Stop Conditions

- Stop if another write path is required.
- Stop if a non-local endpoint, credential, provider fact, running target, or data mutation is
  required for acceptance.
- Stop rather than changing backend ingestion, auth, schema, Playwright behavior, dependencies, or
  roadmap scope.

## Completion Evidence

- Status: `Complete`
- Acceptance mapping:
  - Safe target/credential configuration → `simulate.js` now derives REST/Socket endpoints from
    environment with localhost as the only fallback, keeps source/vehicle configurable, and has no
    credential literal or implicit non-local endpoint.
  - Fail-closed behavior → a subprocess regression proves an empty Mobile source credential exits
    with status 1 before Socket.IO connects. The stale undeclared `dotenv` import was removed rather
    than adding a dependency; operators use Node's documented `--env-file` path or process env.
  - Documented one-shot behavior → `--once` sends one observation attempt, validates the safe
    canonical acknowledgement, disconnects, and sets a failing exit status on rejection.
  - Safe simulator output → token claims, raw response objects, and per-observation coordinates are
    no longer printed; the success summary contains only status/source/type/vehicle identifiers.
  - Artifact hygiene → Git and Docker ignore Playwright `test-results`, `playwright-report`, and
    `blob-report`; a deterministic test enforces all three patterns and its inclusion in `check`.
- Changed files:
  - `docs/tasks/M-20260807-02-secure-simulator-test-artifacts.md`
  - `shuttle-tracking-web/simulate.js`
  - `shuttle-tracking-web/tests/simulator-tooling.test.mjs`
  - `shuttle-tracking-web/package.json`
  - `shuttle-tracking-web/.gitignore`
  - `shuttle-tracking-web/.dockerignore`
  - `docs/testing/pipeline-smoke-tests.md`
  - `docs/audits/README.md`
- Validation results:
  - `node --check shuttle-tracking-web/simulate.js` — passed on 2026-08-07.
  - `npm --prefix shuttle-tracking-web run test:simulator-tooling` — final run passed 3/3 tests on
    2026-08-07. The first behavioral run exposed the existing undeclared `dotenv` import; removing
    that import repaired the simulator within the approved paths and the rerun passed.
  - `git check-ignore -v` for all three generated artifact locations — passed on 2026-08-07.
  - `bash scripts/ci-checks.sh` — passed every backend, frontend, Prisma, Compose, logging, and agent
    workflow gate on an approved external run on 2026-08-07. Frontend lint retained two pre-existing
    warnings and reported zero errors.
  - `node scripts/validate-agent-workflow.js` and `git diff --check` — passed on 2026-08-07.
- Audit freshness changes: Infrastructure & Device and Dashboard & UX were downgraded for changed
  simulator/tooling and predecessor evidence; Security, Production Readiness, and Roadmap remained
  downstream. Level 1 revalidated the full affected chain on 2026-08-07 after M-20260807-03 closed
  the related manual-simulator output gap. Discovery/Product/Architecture/Backend/Frontend/Database
  findings were not affected: source/vehicle fixture identity and application/runtime behavior did
  not change.
