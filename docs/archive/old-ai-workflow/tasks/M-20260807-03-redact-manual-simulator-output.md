# Implementation Task Specification: M-20260807-03 — Redact manual simulator output

## Source Work

- Work ID: `M-20260807-03`
- Lane: `Maintenance`
- Roadmap task: `Not applicable`
- User authorization: Explicit request on 2026-08-07 to inspect and correct clear repository issues
- Approved decisions: `None required`
- Specialist briefs: `None`; the safe local-tool logging invariant is already established by
  M-20260807-01/02
- Source audits: Current Infrastructure & Device re-audit and the pending Security, DevOps &
  Observability re-audit proposal
- Execution mode: Direct Main Agent implementation

## Outcome and Non-goals

- Outcome: Keep the manual Mobile Socket.IO simulator useful while preventing token-claim, raw
  response object, and coordinate output, and extend deterministic tooling guards to both Mobile
  simulators.
- Non-goals: Do not run the simulator, change prompts/input semantics, sender/auth/Trip behavior,
  endpoint policy, dependencies, application code, schema, or roadmap order.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | None | Local developer tool output only. |
| Architecture | Bounded | Aligns both Mobile simulator scripts with one safe output boundary. |
| Security / privacy | Bounded | Removes decoded claims, raw server objects, and precise coordinates from ordinary tool output. |
| Data / migration | None | No service, database, cache, or migration is used. |
| Operations / rollout | None | No deployed/runtime configuration changes. |
| Research validity | None | Submitted values and transport behavior remain unchanged. |

## Allowed Writes

- `docs/tasks/M-20260807-03-redact-manual-simulator-output.md`
- `shuttle-tracking-web/simulate-manual.js`
- `shuttle-tracking-web/tests/simulator-tooling.test.mjs`
- `docs/audits/README.md`

## Read-only Context

- `docs/tasks/M-20260807-01-redact-socket-invalid-payload-logging.md`
- `docs/tasks/M-20260807-02-secure-simulator-test-artifacts.md`
- `shuttle-tracking-web/simulate.js`
- `shuttle-tracking-web/package.json`
- `docs/audits/infrastructure-device-audit.md`
- `docs/audits/security-devops-observability-audit.md`

## Invariants

- Manual coordinate parsing, bearing calculation, sender login, Trip start, reconnect, and
  authenticated `send-location` behavior remain unchanged.
- Missing Mobile credentials fail before any connection and return a failing process status.
- Output may contain stable status/code/source/type/vehicle identifiers, never token claims, raw
  response objects, precise coordinates, or secret/token values.

## Required Changes

1. Remove decoded token-claim and raw Trip error-object output.
2. Replace coordinate/bearing success output with an allowlisted acknowledgement summary.
3. Make missing-credential initialization return a failing status and close local resources.
4. Extend deterministic simulator tooling tests to cover the manual script and its fail-closed path.
5. Downgrade directly affected audit rows pending Level 1 revalidation.

## Acceptance Criteria

- Neither Mobile simulator imports/uses `jwtDecode` or prints token claims.
- The manual simulator does not print raw response objects or submitted coordinates/bearing.
- A missing credential exits with status 1 before Socket.IO connects.
- The focused tooling suite and full repository CI pass without running a simulator target.

## Validation Commands

- `node --check shuttle-tracking-web/simulate-manual.js`
- `npm --prefix shuttle-tracking-web run test:simulator-tooling`
- `bash scripts/ci-checks.sh`
- `node scripts/validate-agent-workflow.js`
- `git diff --check`

## Rollout and Migration Limits

- Do not start the simulator or any service, use a credential, rotate an external secret, or mutate
  data. Historical credential validity remains an external owner fact.

## Stop Conditions

- Stop if another write path, live target, credential, product behavior, dependency, or owner
  decision is required.

## Completion Evidence

- Status: `Complete`
- Acceptance mapping:
  - Token/raw output removal → the manual simulator no longer imports/decodes JWT claims or prints a
    raw Trip response object.
  - Coordinate minimization → successful sends emit only an allowlisted acknowledgement summary
    containing status/source/type/vehicle identifiers.
  - Fail-closed resources/status → missing credentials disconnect the socket, close readline, and
    set process status 1 before any connection.
  - Cross-simulator regression → the focused suite scans both scripts for token/coordinate logging
    and executes missing-credential subprocess checks for each.
- Changed files:
  - `docs/tasks/M-20260807-03-redact-manual-simulator-output.md`
  - `shuttle-tracking-web/simulate-manual.js`
  - `shuttle-tracking-web/tests/simulator-tooling.test.mjs`
  - `docs/audits/README.md`
- Validation results:
  - `node --check shuttle-tracking-web/simulate-manual.js` — passed on 2026-08-07.
  - `npm --prefix shuttle-tracking-web run test:simulator-tooling` — passed 4/4 on 2026-08-07.
  - `bash scripts/ci-checks.sh` — passed every backend, frontend, Prisma, Compose, logging, and agent
    workflow gate on an approved external run on 2026-08-07. Frontend lint retained two pre-existing
    warnings and reported zero errors.
  - `git diff --check` — passed on 2026-08-07.
- Audit freshness changes: Infrastructure & Device was downgraded for changed simulator-tooling
  evidence, with Dashboard & UX, Security, Production Readiness, and Roadmap downstream. Level 1
  revalidated that affected chain on 2026-08-07. No application, device, provider, runtime, field, or
  roadmap-order evidence changed.
