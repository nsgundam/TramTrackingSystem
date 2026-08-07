# Implementation Task Specification: T9 — production topology and origin handoff

## Source Work

- Work ID: `T9`
- Lane: `Roadmap`
- Roadmap task: `T9`
- User authorization: Run in roadmap order and use the recommended D-008 contract, confirmed on
  2026-08-07 after the owner clarified that the application team hands production deployment to
  the University Server/Network Team.
- Approved decisions: `D-003=A`; `D-008` university-managed single-host, single-origin handoff.
- Specialist briefs:
  `docs/audits/specialized/D-008-observability-production-topology-handoff.md` and
  `docs/audits/specialized/D-008-observability-production-topology-handoff-v2.md`.
- Source audits: `docs/project-knowledge-base.md`, `docs/audits/architecture-audit.md`,
  `docs/audits/backend-audit.md`, `docs/audits/frontend-audit.md`,
  `docs/audits/database-audit.md`, `docs/audits/infrastructure-device-audit.md`,
  `docs/audits/security-devops-observability-audit.md`, and
  `docs/audits/production-readiness-audit.md` — current/sealed at
  `e7c98a53409cc443a852ef137a7f65e3b8d8156c`; Production Readiness remains No-Go.

## Gate and Execution Status

- Dependency gate: Satisfied. `D-003=A` removes the configuration cycle; approved `D-008` fixes
  the production topology and responsibility boundary; the Roadmap marks T9 eligible for this exact
  repository handoff.
- Decision gate: Satisfied for repository implementation. Actual University host, proxy address,
  DNS/TLS, secrets, contacts, recovery, monitoring, and capacity are external acceptance facts and
  are not required values for source implementation.
- Specialist routing: Complete. The D-008 v1 policy brief and v2 exact-path brief are consumed;
  there is no unresolved cross-domain question for this task.
- Execution mode: Main Agent implementation with optional bounded worker delegation inside Allowed
  Writes. Workers do not inherit approval, path expansion, acceptance, or completion authority.

## Outcome and Non-goals

- Outcome: Deliver a deterministic, fail-closed repository handoff for the approved university
  production topology: loopback-only app bindings, private/authenticated data services, one
  REST/Socket origin authority, explicit proxy/CORS/client-address behavior, healthchecks, a
  non-secret environment schema, and a Server/Network operations runbook.
- Non-goals: No deployment, container startup, migration/seed, DNS/TLS/firewall/secret-store change,
  provider configuration, port scan, backup/restore, restart, alert, load test, VPS failover, schema
  change, device/simulator change, UI redesign, or production-readiness claim. Development localhost
  behavior remains supported.

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | Bounded | No intentional screen or journey change; REST/Socket connection behavior is consolidated and must retain isolated T8 tests. |
| Architecture | Bounded | One runtime configuration authority and one frontend backend-origin authority implement the approved monolith/single-origin boundary. |
| Security / privacy | Bounded | D-008 resolves the policy: data services private, Redis authenticated, production config fail closed, proxy trust explicit, and secrets never logged/client-exposed. |
| Data / migration | Bounded | No schema/data write. Runtime validation precedes the existing migration command; actual migration/restore needs an approved target/operator. |
| Operations / rollout | Bounded | Static Compose/env/health/runbook handoff only; external execution and acceptance remain unavailable. |
| Research validity | None | No raw observation, canonical selection, provenance, metric, export, or field-evidence path changes. |

## Allowed Writes

- `docs/tasks/T9-production-topology-origin-handoff.md`
- `docker-compose.prod.yml`
- `env.production.example`
- `scripts/test-production-topology.mjs`
- `scripts/ci-checks.sh`
- `shuttle-tracking-backend/src/config/runtime.ts`
- `shuttle-tracking-backend/src/config/validate-runtime.ts`
- `shuttle-tracking-backend/src/config/prisma.ts`
- `shuttle-tracking-backend/src/config/redis.ts`
- `shuttle-tracking-backend/src/server.ts`
- `shuttle-tracking-backend/src/middleware/rate-limit.ts`
- `shuttle-tracking-backend/docker-entrypoint.sh`
- `shuttle-tracking-backend/tests/test_t9_runtime_config.js`
- `shuttle-tracking-backend/package.json`
- `shuttle-tracking-backend/README.md`
- `shuttle-tracking-web/config/backend.ts`
- `shuttle-tracking-web/services/api.ts`
- `shuttle-tracking-web/services/publicApi.ts`
- `shuttle-tracking-web/hooks/useShuttleTracker.ts`
- `shuttle-tracking-web/hooks/useSocketConnection.ts`
- `shuttle-tracking-web/components/public/FeedbackModal.tsx`
- `shuttle-tracking-web/components/admin/LiveMap.tsx`
- `shuttle-tracking-web/next.config.ts`
- `shuttle-tracking-web/tests/t9-backend-origin.test.ts`
- `shuttle-tracking-web/package.json`
- `docs/operations/university-server-network-handoff.md`
- `docs/roadmap/master-refactoring-roadmap.md`
- `docs/audits/README.md`

## Read-only Context

- `AGENTS.md`
- `docs/decision-queue.md`
- `docs/audits/specialized/D-008-observability-production-topology-handoff.md`
- `docs/audits/specialized/D-008-observability-production-topology-handoff-v2.md`
- `docker-compose.yml`
- `shuttle-tracking-backend/Dockerfile`
- `shuttle-tracking-web/Dockerfile`
- `shuttle-tracking-web/playwright.config.ts`
- `shuttle-tracking-web/hooks/useRouteGeometry.ts`

## Invariants

- PostgreSQL is the durable application record; Redis loss cannot promote transient live state to
  durable or current truth.
- Production frontend/backend traffic reaches public users only through the university TLS reverse
  proxy; application ports are loopback-only and data-service ports are not host-published.
- A no-override production frontend uses relative `/api` and current-origin Socket.IO. Any explicit
  production/demo origin is HTTPS, origin-only, non-local, and shared by REST and Socket.IO.
- Development, simulator, and isolated Playwright localhost behavior remains supported.
- CORS is an exact browser-origin control, not authentication. Non-browser/no-origin sender and
  health requests remain possible; authentication/authorization boundaries are unchanged.
- Forwarded client identity is trusted only through explicit production proxy IP/CIDR configuration;
  application code never parses a forwarding header itself.
- Production configuration rejects secrets/placeholders/connectivity mistakes before migration and
  never includes configured values in errors/logs.
- Repository checks are source/static evidence only. External target facts remain unavailable and
  T9 cannot become Complete from this work alone.

## Required Changes

1. Add a pure typed backend runtime parser and thin production validation entrypoint; use the parsed
   database, Redis, origin, proxy, and port settings from Prisma, Redis, Express, Socket.IO, and rate
   limiting. Invoke validation before the existing migration step.
2. Align production Compose with versioned frontend/backend image names, the approved networks,
   loopback bindings, Redis authentication, backend `/ready` and frontend process healthchecks, and
   `service_healthy` ordering.
3. Add a sanitized production environment template and a static semantic Compose test; include it
   in repository CI without printing rendered configuration.
4. Add a single frontend backend-connection resolver and route all listed REST/Socket consumers
   through it. Keep matching legacy development variables compatible, reject conflicts, use
   same-origin production by default, and remove hidden localhost rewrites.
5. Add deterministic backend and frontend configuration regressions and wire them into their normal
   checks.
6. Document the exact University Server/Network handoff, reverse-proxy routes, `0600` secret-file
   boundary, pre-migration backup/release/database-recovery distinction, health checks, and every
   D-008 external acceptance item. Include a release record for artifact ID, release notes, deployed-
   version verification, retained rollback artifact, responsibility acceptance, and named contacts.
   Provide repository-side backup/restore commands and post-restore application validation checks
   for later execution only. Correct the backend environment documentation.
7. After verification, record T9 as partially complete and downgrade only the affected audit
   register rows; do not edit or validate audit report bodies in Level 3.

## Acceptance Criteria

- Rendered production Compose has no PostgreSQL/Redis host ports, keeps both only on an internal
  data network, binds frontend/backend to `127.0.0.1`, requires Redis authentication, supplies app
  healthchecks, waits for backend readiness, and names frontend/backend images with one required
  release version. Its source requires every production secret without a usable default, its
  tracked example uses placeholders, and no database/Redis/JWT/TTN secret enters frontend build or
  runtime variables.
- Production runtime rejects missing/placeholder/weak secrets, malformed/local data URLs, missing
  database or Redis authentication, loopback/localhost data fallbacks, insecure/local/path-bearing
  frontend origins, and
  missing/broad/numeric proxy trust without revealing values. Valid explicit production
  configuration and local development configuration pass.
- Backend CORS covers `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`; exact configured
  origin/no-origin semantics remain; `clientAddress()` uses Express `req.ip`; the configured Express
  proxy predicate accepts an explicitly listed test proxy and rejects an unlisted address. Actual
  forwarded-hop and spoof-resistance behavior remains external target evidence.
- Production frontend default resolves REST to `/api` and Socket.IO to the current origin; one
  explicit HTTPS demo origin is shared; matching legacy inputs work and conflicts or unsafe
  production origins fail; consumers have no independent environment/localhost fallback chains;
  the deterministic frontend test rejects any localhost rewrite in `next.config.ts`.
- Runtime validation occurs before `prisma migrate deploy`; the runbook distinguishes artifact
  rollback from database recovery. The runbook maps every D-008 responsibility/external-checklist
  item, including artifact ID/release notes/deployed-version check/retained rollback artifact,
  written responsibility acceptance and named contacts, and includes gated backup/restore commands
  plus post-restore application checks; all runtime outcomes remain unavailable until performed and
  signed off by the University Server/Network Team.
- Backend check, frontend check, static topology test, full repository CI, agent workflow
  validation, and diff check pass without starting the stack or touching an external target.

## Validation Commands

- `npm --prefix shuttle-tracking-backend run check`
- `npm --prefix shuttle-tracking-web run check`
- `node scripts/test-production-topology.mjs`
- `bash scripts/ci-checks.sh`
- `node scripts/validate-agent-workflow.js`
- `git diff --check`

## Rollout and Migration Limits

No target is approved for this task. Do not start Compose, run Prisma migration/seed, create or read
deployed secrets, deploy, restore, scan, alert, or load-test. The runbook may document commands and
acceptance steps, but execution belongs to a later explicitly approved disposable/staging target and
the University Server/Network Team.

## Stop Conditions

- Stop if a write path outside Allowed Writes is required.
- Stop if an owner policy, actual proxy/host/CIDR, secret value, provider, DNS/TLS, firewall,
  monitoring, contact, recovery target, or hardware fact must be invented.
- Stop if implementation requires a dependency, schema/data change, deployment, migration, seed,
  backup/restore, port scan, browser against ambient data, or load test.
- Stop rather than changing UI behavior, sender/device contracts, canonical/research semantics, or
  roadmap order.

## Completion Evidence

- Status: `In Progress`
- Acceptance mapping: Pending implementation and Main Agent verification.
- Changed files: Pending.
- Validation results: Pending.
- Audit freshness changes: Pending. After the Main Agent reviews the final diff, downgrade only rows
  whose evidence scope or predecessor changed and record a row-specific rationale; do not
  pre-approve a fixed list.
