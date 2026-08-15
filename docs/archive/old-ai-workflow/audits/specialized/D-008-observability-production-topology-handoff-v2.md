# D-008 Repository Implementation Handoff v2

This brief supersedes only **Section 4 (Exact future implementation handoff)** of
[`D-008-observability-production-topology-handoff.md`](D-008-observability-production-topology-handoff.md).
The owner-approved topology, responsibility boundary, external acceptance checklist, evidence
limits, and all other sections of the original immutable brief remain binding.

## 1. Trigger and focused question

- **Decision / task:** D-008 / T9
- **Trigger:** D-008 is approved and the affected Level 1 reports are current, but the original
  handoff names categories rather than exact repository-relative write and test paths.
- **Question:** What is the smallest exact repository boundary that can implement the approved
  production topology/origin contract without inventing University Server/Network facts or
  operating an external target?
- **Evidence baseline:** `e7c98a53409cc443a852ef137a7f65e3b8d8156c`.
- **Evidence paths:** `docker-compose.prod.yml`, `env.example`, `scripts/ci-checks.sh`,
  `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/config/prisma.ts`,
  `shuttle-tracking-backend/src/config/redis.ts`,
  `shuttle-tracking-backend/src/middleware/rate-limit.ts`,
  `shuttle-tracking-backend/docker-entrypoint.sh`, `shuttle-tracking-web/services/api.ts`,
  `shuttle-tracking-web/services/publicApi.ts`,
  `shuttle-tracking-web/hooks/useShuttleTracker.ts`,
  `shuttle-tracking-web/hooks/useSocketConnection.ts`,
  `shuttle-tracking-web/components/public/FeedbackModal.tsx`,
  `shuttle-tracking-web/components/admin/LiveMap.tsx`, and
  `shuttle-tracking-web/next.config.ts`.
- **Primary playbook:** Observability and Field Testing. **Supporting playbook:** Identity,
  Security, and Privacy.
- **Output:** This immutable v2 brief constrains a separate Main-Agent-owned Level 3 task
  specification. The approved owner decision, current Roadmap, and Main Agent authorize the
  repository-side T9 work; this brief does not grant implementation authority.

## 2. Binding implementation boundary

The Level 3 task may write only these exact paths:

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
- `docs/roadmap/master-refactoring-roadmap.md` (T9 evidence/status only)
- `docs/audits/README.md` (affected freshness rows only)

`docker-compose.yml`, the frontend Dockerfile and Playwright configuration, application schema,
audit report bodies, provider configuration, and UI behavior are outside this handoff. Existing
development variables may remain compatibility inputs only through the new central frontend
resolver; production use of any accepted legacy value must pass the same HTTPS, origin-only, and
non-local validation as the preferred variable.

## 3. Required invariants and changes

1. **Network boundary:** PostgreSQL and Redis publish no host ports and attach only to an internal
   data network. Frontend and backend host ports bind only to `127.0.0.1` for the university reverse
   proxy. This is repository configuration evidence, not an external firewall or port-scan result.
2. **Authenticated Redis:** the Redis server requires a production credential; the backend and
   Redis healthcheck use that credential without embedding it in tracked source or printing it.
   Redis remains transient and never becomes the durable location authority.
3. **Fail-closed backend runtime:** one typed parser validates production database/Redis
   connectivity, secrets, browser origin, and explicit proxy IP/CIDR trust. It rejects missing,
   placeholder, local/insecure, unauthenticated, conflicting, numeric/broad-proxy, or malformed
   values as applicable, without including values in errors. Redis may carry its password in a
   separate required variable rather than its URL. Development localhost behavior stays available.
4. **Pre-migration validation:** the compiled validator runs before `prisma migrate deploy`. The
   task does not execute a migration. Artifact rollback and database restore remain separate
   operator decisions.
5. **One browser connection authority:** one frontend resolver supplies the REST base and Socket.IO
   origin to API services, the public tracker, feedback, and Admin LiveMap. Production without an
   override uses relative `/api` plus current-origin Socket.IO. An explicit demo backend must be an
   origin-only HTTPS URL. Matching legacy inputs may remain compatible; conflicting inputs fail.
6. **No hidden production proxy:** Next.js must not silently rewrite production traffic to a
   localhost backend. The university reverse proxy owns `/api/*` and `/socket.io/*`.
7. **CORS and client address:** backend CORS allows only the exact configured browser origin plus
   no-origin non-browser clients and supports `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE`, and
   `OPTIONS`. Express proxy trust is explicit, and rate limiting uses `req.ip`; source must not parse
   `X-Forwarded-For` itself.
8. **Health contract:** backend Compose health uses `/ready`; frontend has a process healthcheck;
   frontend waits for backend `service_healthy`. Internal health URLs are not proof that the public
   proxy, WSS, dependencies, or alerts work.
9. **Environment boundary:** `env.production.example` contains placeholders only and may be
   tracked. A deployed production environment file remains outside Git/image, is `0600`, and must
   replace every placeholder. Static Compose validation must never print its rendered environment.
10. **Evidence boundary:** the runbook identifies application-team deliverables and an external
    checklist. HTTPS/WSS, actual ports, restart, restore, alert delivery, named contacts, host
    capacity, and 10,000-viewer results remain unavailable until the University Server/Network Team
    runs and accepts them.

## 4. Deterministic acceptance

- `test_t9_runtime_config.js` exercises valid development/production parsing and rejects missing,
  placeholder, insecure/local, unauthenticated, malformed, and unsafe proxy configuration. It also
  checks the server, entrypoint, CORS-method, and trusted-address source invariants. Express's
  compiled proxy predicate is exercised for one configured and one untrusted address; actual proxy
  hops and spoof-resistance remain external runtime acceptance.
- `t9-backend-origin.test.ts` proves production same-origin behavior, one explicit HTTPS demo
  origin, development localhost compatibility, matching legacy input compatibility, conflicting
  inputs, and rejection of HTTP/localhost/path/query/credential-bearing production origins. It
  checks that consumers do not keep their own environment/fallback chains and that Next.js has no
  localhost rewrite which could hide a missing production reverse-proxy route.
- `test-production-topology.mjs` parses `docker compose ... config --format json` in memory using
  `env.production.example`; it checks loopback app bindings, private data services/network, Redis
  authentication, healthchecks, dependency ordering, versioned application image names, required
  non-default production secret expressions, and absence of server secrets from frontend build or
  runtime variables without dumping the rendered document. It also verifies that values classified
  as secrets in the tracked example remain explicit placeholders.
- Full backend/frontend checks, repository CI, agent workflow validation, and `git diff --check`
  must pass.

## 5. Failure modes and stop conditions

- Incorrect reverse-proxy trust can collapse rate-limit identities or allow spoofed forwarding
  data; require actual IP/CIDR input and leave target validation external.
- A password with reserved URL characters can make an operator-authored database URL differ from
  the database credential; the runbook must require a percent-encoded URL and a connection check,
  not guess or log the value.
- A frontend override with a path can produce duplicate `/api`; accept origins only.
- A release without an artifact identifier, release notes, deployed-version check, retained rollback
  artifact, or written responsibility acceptance is not an operable handoff even if Compose parses.
- Compose parsing cannot prove Docker host firewall, public reachability, TLS, WebSocket upgrade,
  restore, monitoring, or load capacity.
- Stop if another write path, dependency, schema change, provider call, secret, migration, target,
  or owner policy is required. Do not start containers or contact external systems.

## 6. Priority, evidence, and confidence

- **Priority:** High; this is the next eligible repository work unit and precedes T13/public
  deployment evidence.
- **Difficulty:** Medium for source/static delivery; High and externally owned for deployment
  acceptance.
- **Owner decision:** High confidence; D-008 is approved.
- **Repository evidence:** High confidence; the baseline visibly publishes all service/data ports,
  leaves Redis unauthenticated, duplicates localhost fallbacks, omits app healthchecks, and does not
  configure proxy trust.
- **External evidence:** Unable to verify; this handoff deliberately cannot supply it.
- **Completion classification:** successful repository work makes T9 `Partially Complete —
  repository handoff passed; external acceptance unavailable`, never `Complete` or production
  ready.
