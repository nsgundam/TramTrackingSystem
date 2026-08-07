# D-008 Production Topology and Operations Handoff Decision Brief

## 1. Trigger and focused question

- **Decision:** D-008
- **Trigger:** T9 and T13 are blocked because the repository has a production-mode template but no
  approved host, origin, network, TLS, data-service, secret, recovery, monitoring, or incident-
  ownership contract.
- **Question:** What deployment topology and responsibility boundary should the application team
  hand to the University Server/Network Team while keeping Render, Vercel, Neon, and AWS learning
  environments outside the production evidence boundary?
- **Evidence paths:** `docs/decision-queue.md`, `docs/audits/infrastructure-device-audit.md`,
  `docs/audits/security-devops-observability-audit.md`,
  `docs/audits/production-readiness-audit.md`, `docker-compose.prod.yml`, `env.example`,
  `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/config/redis.ts`,
  `shuttle-tracking-web/services/api.ts`, and `shuttle-tracking-web/hooks/useShuttleTracker.ts`.
- **Primary playbook:** Observability and Field Testing. **Supporting playbook:** Identity, Security,
  and Privacy.
- **Output:** This immutable decision-keyed brief. It constrains T9/T13 handoff and does not prove a
  deployed environment.

## 2. Binding owner decision

The owner accepted this recommended contract on **2026-08-07** and clarified that the repository
team develops and hands off the application; the University Server/Network Team deploys and operates
the real production service.

### 2.1 University production profile

1. The initial production target is one **university-managed server**. A single host is accepted as
   the zero-budget starting topology and as a single point of failure; it is not high availability.
2. The preferred public origin is `https://tram-tracking.rsu.ac.th`, subject to university DNS
   approval. One TLS reverse proxy owns the public origin and routes:
   - `/` to the Next.js frontend;
   - `/api/*` to the Express backend; and
   - `/socket.io/*` to the Socket.IO backend with WebSocket upgrade support.
3. Public ingress is limited to HTTPS on port `443`, with port `80` permitted only to redirect to
   HTTPS. Administrative SSH must be restricted to the university's approved administrator
   network. Frontend and backend accept public traffic only through the proxy. PostgreSQL, Redis,
   and application ports `3000`/`3001` have no public host binding.
4. PostgreSQL/PostGIS is the durable application datastore. Redis is a private, authenticated
   coordination/cache service and is not the only durable record. After Redis loss or restart, the
   rider surface must remain safely stale/no-service until newer accepted observations rebuild live
   state.
5. Production secrets must not be stored in Git, an image, or a client-visible `NEXT_PUBLIC_*`
   value. Use a university secret manager when available; otherwise use a root- or service-account-
   owned `0600` file outside the repository and image, readable only by the deployment service and
   designated server administrators. The application lead defines secret purposes but does not
   need the deployed values. Rotation remains an operational procedure, not a source-code
   assumption.
6. Initial availability targets are planned maintenance outside vehicle service hours, an
   **RPO of at most 24 hours**, and an **RTO before the next service period and at most 24 hours**.
   PostgreSQL backups must run at least daily to storage outside the production host and must be
   restored successfully to a disposable target before release. A better university capability may
   tighten these targets without weakening this minimum contract.
7. An external VPS is a manual cold-recovery option only. It is not a live replica, automatic
   failover, or high-availability claim. Using it requires an approved off-host backup, an isolated
   recovery rehearsal, DNS cutover and rollback steps, and University Server/Network approval.
8. Capacity goals are at most 10 simultaneously reporting vehicles and up to 10,000 concurrent
   public viewers. They are unverified targets. No production capacity or reliability claim is
   allowed until a representative load test passes on the selected university host.
9. The absence of a university data-residency restriction does not make the data public or
   non-sensitive. Precise locations, feedback text, client IP data, password/credential hashes, and
   operational identifiers retain the repository's access, retention, redaction, and backup
   controls even if an approved recovery target is outside the university.

### 2.2 Responsibility boundary

| Area | Application team | University Server/Network Team |
|---|---|---|
| Application artifacts | Versioned frontend/backend images or Compose bundle, release notes, non-secret environment schema, health contract | Verify artifact/version deployed and retain the approved rollback artifact |
| Application configuration | Define required variables, allowed origin behavior, migration command, readiness semantics | Inject target values and secrets without committing them |
| Database change | Author and review Prisma migrations; explain compatibility and rollback limits | Approve the target window, back up, run/observe migration, and execute infrastructure recovery |
| Network and public entry | Document required `/`, `/api/*`, `/socket.io/*`, and `/ready` behavior | Own host/OS, firewall, reverse proxy, restricted SSH, public IP/NAT, DNS, TLS issuance and renewal |
| Secrets | Define secret purposes and application rotation behavior | Generate/store/inject/rotate production values and restrict operator access |
| Data and recovery | Provide backup/restore commands and application validation checks | Own off-host destination, schedule, retention, restore execution, and recovery evidence |
| Observability | Emit allowlisted structured signals and readiness state; document expected alerts | Own log destination/retention, host/service metrics, alert delivery, named primary/backup contacts, and incident response |
| UI and senders | Public UI maintainer reviews rider build; Mobile/TTN/IoT maintainer owns sender/provider configuration and acceptance artifacts | Expose only approved endpoints and coordinate provider/network changes with those maintainers |

The application lead and Server/Network Team jointly approve a release window: the application lead
accepts the artifact and migration behavior; the Server/Network Team accepts infrastructure,
recovery, and operational readiness. Neither role may silently approve the other's evidence.

### 2.3 Isolated development/demo profile

The approved convenience profile is Vercel for the frontend, a Render web service for the long-
running Express/Socket.IO backend, Neon Postgres/PostGIS, and Render Key Value where shared Redis-
compatible state is needed. It is development/demo/learning evidence only and uses separate
credentials, database, sender registrations, and synthetic/test data. Production secrets, backups,
and unrestricted production data must never be copied into it.

Render web services support public WebSockets, require `wss` for public connections, and may replace
instances, so clients must reconnect; outbound WebSocket traffic also counts toward bandwidth.
Render explicitly says its free instances are not for production, and free Key Value has no
persistence. Neon provides PgBouncer-based pooled connections and documents Prisma migrations, but
its 10,000-client pool limit does not establish 10,000 active application users or this system's
capacity. Vercel environment values are scoped per deployment and encrypted at rest, but any
`NEXT_PUBLIC_*` value is a public build-time value rather than a secret. AWS Free Tier is suitable
for learning only: current benefits depend on account creation date and, for newer accounts, end
after six months or when credits are exhausted.

## 3. Alternatives and trade-offs

| Alternative | Benefit | Cost/risk | Decision |
|---|---|---|---|
| University single-host, single-origin | Lowest operational complexity and no new hosting budget; matches handoff ownership | Single point of failure; capacity and recovery must be proven | **Selected for initial production** |
| Split managed Vercel/Render/Neon production | Faster platform setup and managed TLS/data services | Recurring cost, cross-provider ownership, egress/runtime limits, and a larger incident boundary | Demo profile only unless a later owner decision funds and re-audits it |
| Self-managed AWS/VPS production | Useful learning and flexible control | The developer would inherit OS, firewall, TLS, backups, billing, monitoring, and incident duties without current operations capacity | Learning or cold recovery only |

Microservice decomposition, multi-region active/active, Kubernetes, and automatic cross-provider
failover are rejected for the current scale and team. They add operational failure modes without
evidence that the monolith or a university single host is the limiting factor.

## 4. Exact future implementation handoff

After Level 1 synchronizes D-008 and affected audits, T9 may create an exact-path Level 3 task for
repository-side delivery only. It should:

1. make the production Compose/network template keep PostgreSQL and Redis off public host ports and
   require production origins/secrets without localhost fallbacks;
2. define the single-origin REST/Socket contract, proxy forwarding/WebSocket requirements, complete
   CORS method set, trusted-client-address assumptions, and internal readiness behavior;
3. add production healthchecks, a non-secret environment contract, migration/rollback/backup
   commands, and a University Server/Network handoff runbook;
4. add deterministic configuration tests and run the full repository gates; and
5. stop before migration, DNS, provider, secret, deployment, port-scan, backup, alert, or load-test
   operations unless an explicitly approved disposable/staging target and the responsible external
   operator are available.

T9 cannot be marked complete solely from repository tests. T13 and the public release remain gated
on the external acceptance evidence below.

## 5. External acceptance checklist

The University Server/Network Team must provide or accept all of the following before production
readiness can be claimed:

- named primary and backup operational contacts and written acceptance of the responsibility table;
- actual host, OS, CPU/RAM/disk, bandwidth, public-IP/NAT, administrator network, and firewall facts;
- approved DNS for `tram-tracking.rsu.ac.th`, valid TLS, automatic renewal, and a tested expiry alert;
- an external scan showing only `80/443` public and no public `3000`, `3001`, `5432`, or `6379`;
- one-origin HTTPS REST and WSS Socket.IO checks, including authenticated admin `PUT`/`DELETE`;
- actual secret location/access/rotation procedure and proof that production has no localhost or
  placeholder default;
- an off-host backup destination, schedule and retention, plus a disposable restore within the
  accepted RPO/RTO;
- actual log/metric destination and successful alerts for host down, readiness failure, disk
  pressure, and PostgreSQL/Redis failure to both contacts;
- restart evidence showing durable PostgreSQL recovery and safe no-service behavior until Redis/live
  state is rebuilt; and
- a representative 10-vehicle/10,000-viewer load result with defined duration, latency, error,
  resource, and reconnect thresholds. A VPS recovery claim additionally requires a recorded manual
  restore, DNS cutover, validation, and rollback rehearsal.

## 6. Failure modes, migration risk, and validation

- A single host can fail completely; the accepted mitigation is off-host backup plus a manual
  recovery runbook, not an HA claim.
- Incorrect proxy upgrade/timeout settings can make HTTP appear healthy while Socket.IO fails.
- Publishing container or data-service ports bypasses the intended TLS/authentication boundary.
- A successful Prisma migration without a pre-migration backup and application rollback decision can
  leave a running but incompatible release.
- Redis restart can erase transient live coordination; the UI must fail stale/no-service rather than
  reusing last-known live truth.
- Ten thousand connected viewers can multiply Socket.IO fan-out and bandwidth far beyond ten vehicle
  ingress events; only target-host measurement can establish capacity.
- A cold VPS can drift from the production artifact, secrets, database extension, proxy, or DNS
  contract; rehearse rather than assuming portability.

Repository validation must include the T9 focused configuration tests,
`node scripts/validate-agent-workflow.js`, `git diff --check`, and `bash scripts/ci-checks.sh`.
External validation must use an explicitly approved target and retain redacted evidence for every
checklist item. Simulator, Compose parsing, build success, or cloud-console configuration alone is
not runtime acceptance.

## 7. Priority, difficulty, evidence, and confidence

- **Priority:** High. This decision unlocks the repository-side T9 handoff and is a prerequisite for
  T13 and any production claim.
- **Difficulty:** Medium for repository delivery; High for external operations and capacity proof.
- **Owner decision (high):** university production ownership, application-team handoff, zero-budget
  constraint, preferred single domain, external placement allowed, service hours, team roles, and
  capacity goals were supplied or explicitly delegated to this recommendation on 2026-08-07.
- **Repository evidence (high):** current production Compose publishes all service/data ports and
  retains localhost defaults; backend readiness and environment-driven REST/Socket paths exist.
- **External facts (unable to verify):** no university host, DNS, TLS, firewall, secret store,
  backup, monitoring, contact acceptance, staging result, or capacity evidence was supplied.
- **Confidence:** High that this is the smallest operable handoff for the current team and budget;
  Low for production capability until the external checklist passes.

No further application-owner policy answer is required for D-008. Exact infrastructure values and
named contacts are external acceptance evidence owned by the University Server/Network Team, not
facts the application developer should invent.

## 8. Primary-source research metadata

Accessed **2026-08-07**:

- [Render WebSockets](https://render.com/docs/websocket)
- [Render free-instance limitations](https://render.com/docs/free)
- [Render Key Value](https://render.com/docs/key-value)
- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon Prisma migrations](https://neon.com/docs/guides/prisma-migrations)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel `NEXT_PUBLIC_*` environment boundary](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables)
- [AWS EC2 Free Tier usage](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html)
