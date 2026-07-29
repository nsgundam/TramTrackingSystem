# Infrastructure & Device Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/research/T7-owner-input-questionnaire.md`, `docs/tasks/T7-raw-research-observations.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/testing/ci-checks.md`, `docs/roadmap/master-refactoring-roadmap.md`, `README.md`, `AGENTS.md`, `env.example`, `docker-compose.yml`, `docker-compose.prod.yml`, `docker/init-postgis.sh`, `shuttle-tracking-backend/Dockerfile`, `shuttle-tracking-backend/docker-entrypoint.sh`, `shuttle-tracking-backend/prisma/seed.js`, `shuttle-tracking-backend/src/server.ts`, `shuttle-tracking-backend/src/routes/ingest.route.ts`, `shuttle-tracking-backend/src/config/redis.ts`, `shuttle-tracking-backend/src/services/tracking.service.ts`, `shuttle-tracking-backend/simulate-ttn.js`, `shuttle-tracking-backend/tests/test_pipeline.js`, `shuttle-tracking-web/Dockerfile`, `shuttle-tracking-web/simulate.js`, `shuttle-tracking-web/simulate-manual.js`, and `shuttle-tracking-web/next.config.ts`
- Reviewed at: `2026-07-29T11:12:14+07:00`
- Validation state: **Validated**
- Predecessor baselines: Backend, Frontend, and Database `@ fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`; Discovery and Product `@ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`; Architecture `@ fa9441b9bd1a1a9dec6547e1d8f53b2ee974fefd`
- Previous report baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`

## 1. Executive Summary

The repository provides a credible self-hosted Compose foundation for a controlled demonstration.
Development Compose runs PostGIS, Redis, backend, and frontend with dependency health checks.
Production targets build compiled backend/Next images, run migrations before startup, disable seed
outside development, and validate required JWT/TTN secrets. The current T6 runtime wiring has one
canonical Socket.IO publication boundary, and the TTN webhook remains a server-side authenticated
adapter.

This is not evidence of a deployed production service or physical device integration. No host,
domain, TLS/reverse proxy, managed database/cache, backup/restore process, monitoring destination,
TTN application/device registration, mobile application, or ESP32 firmware/hardware contract is in
the repository. Production Compose still host-publishes PostgreSQL and Redis, has no backend or
frontend healthchecks, defaults origins to localhost when omitted, and has no documented recovery or
operations owner. These remain release-blocking facts for daily/public operation.

The fixed research boundaries remain separate: Mobile phone GPS through authenticated Socket.IO;
ESP32 plus GPS module through Wi-Fi/authenticated HTTP; and LoRaWAN through gateway, TTN, and an
authenticated webhook. Simulators validate server contracts only and cannot prove device, radio,
provider, clock, battery, coverage, or field performance.

## 2. Scope, Freshness, and Predecessor Gate

The previous Infrastructure & Device report was based at `847a18c...`. Backend, Frontend, and
Database are now current validated predecessors at `fa9441b...`; the predecessor gate passes.

The evidence comparison from the previous baseline to the current commit included the T6 canonical
publication and ingest response changes, server/startup wiring, the moved pipeline test and smoke
command, T5/T6 roadmap evidence, and current Compose/testing documentation. The current worktree also
contains uncommitted D-006 coordination documentation; it is treated as owner/coordination evidence,
not as a runtime or deployment result.

This review covers Compose topology, image targets, startup/migration/seed behavior, environment and
origin configuration, container health/dependency ordering, local smoke evidence, and the three
distinct device/provider boundaries. It does not certify security hardening severity, detailed
observability design, hardware selection, provider account configuration, or field performance.

Static validation in this re-audit passed:

- `docker compose -f docker-compose.yml config --quiet`;
- production Compose parsing with disposable placeholder values for required secrets;
- current predecessor backend/frontend/database validation recorded in their reports.

No running stack, deployment, physical source, provider console, or network-failure experiment was
observed. Those findings remain `Unable to Verify` rather than being inferred from configuration.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Docker images were development-only | **Resolved** | Backend and frontend Dockerfiles retain development and production targets; production uses compiled backend code and `next start` without development source mounts. |
| Dependency health/readiness was missing | **Partially Resolved** | Development DB/Redis have Compose healthchecks, backend waits for healthy dependencies, and `/health`/`/ready` exist. Production still does not healthcheck backend/frontend application endpoints. |
| Production startup/configuration was incomplete | **Partially Resolved** | Required production secrets, migration-before-start, seed-disabled behavior, restart policies, and production targets exist. Origins, TLS, backup/restore, Redis policy, logs, alerts, and operations ownership remain open. |
| Provider deployment evidence was missing | **Unable to Verify** | No current provider target, host, domain, TLS terminator, or deployed topology is documented; no provider claim is accepted from Compose alone. |
| Source registry/ingestion boundary was incomplete | **Resolved** | Source lifecycle, sender-token binding, HTTP ingestion, TTN webhook-secret boundary, rate limits, canonical selection, and the T6 canonical publication path are present. |
| Server-side TTN adapter was missing | **Resolved** | `/api/ingest/ttn` validates the webhook secret, extracts the registered device ID, decodes supported payload shapes, requires a registered LoRaWAN source, and enters the shared canonical pipeline. |
| ESP32 needed a normalized server contract | **Partially Resolved** | Authenticated HTTP and the common observation schema provide a server adapter; firmware, GPS module, provisioning, retry, offline, power, and network behavior remain unverified. |
| Real mobile/device workflow was absent | **Still Present** | Checked-in sender clients are Node simulators; no supported mobile app, permission flow, OS throttling, background behavior, or physical-device contract exists. |
| Simulator fixtures were inconsistent with registry | **Resolved** | `env.example`, seed data, mobile/TTN simulators, and `tests/test_pipeline.js` use aligned environment-driven source/vehicle mappings. |
| Repeatable device-pipeline evidence was missing | **Resolved** | Smoke documentation and the moved pipeline test cover authenticated negative paths, ESP32-style HTTP, TTN webhook, mobile sender flow, priority selection, history/analytics, and safe acknowledgements on a configured disposable stack. The test itself was not rerun here because no approved target was started. |
| Operational signals and CI gates were missing | **Partially Resolved** | CI/static checks and redacted process signals cover startup/readiness, ingestion, staleness, and history failures. Signals remain best-effort process logs, not durable metrics or alerts. |
| Production service boundaries were not health-gated | **New Finding** | Production Compose has DB/Redis healthchecks but no backend/frontend healthchecks; frontend depends on backend container start rather than `/ready`. DB and Redis are also host-published. |

## 4. Current Topology Review

| Environment | Current topology | Assessment |
|---|---|---|
| Development | PostGIS, Redis, backend, and frontend; source mounts; nodemon/Next dev; named volumes; DB/Redis healthchecks; backend waits for healthy dependencies | Appropriate for local controlled testing. Defaults, seed data, and local secrets must remain non-production. |
| Production mode | Same four-service self-hosted topology; compiled backend/Next targets; named volumes; restart `always`; migration/secret entrypoint; no seed | A useful template, not a public deployment plan. Host exposure, proxy/TLS, backup, monitoring, health-gated rollout, and ownership remain open. |
| External senders | Mobile/ESP32 sender to the backend origin; TTN device through gateway/provider to webhook | Server boundaries are defined; external origin, routing, provider, and device facts are unavailable. |

The Compose files use host ports `5432`, `6379`, `3001`, and `3000`. Production DB and Redis are
therefore reachable through host-published ports unless an external firewall/network policy restricts
them. No internal-only data-service exposure, resource limit, read-only filesystem, explicit Redis
authentication, eviction policy, or provider-managed persistence contract is defined. Detailed
hardening remains for Security/DevOps, but the topology must be corrected or explicitly protected
before production.

## 5. Image, Startup, and Migration Review

Backend images use Node 22 Alpine, lockfile installation, Prisma generation, a compiled production
target, and `docker-entrypoint.sh`. The entrypoint validates non-development JWT/TTN secrets for
known defaults and minimum length, rejects equal JWT/TTN secrets, runs `prisma migrate deploy`,
disables seed outside development, and starts the compiled server. Development startup runs migration
and seed on container start.

Frontend images retain development and production targets. The production build receives
`NEXT_PUBLIC_API_BASE_URL` as a build argument and runs `next start`. The checked-in `next.config.ts`
rewrites `/api` and `/socket.io` to `localhost:3001`; production origin alignment therefore needs an
explicit proxy/origin contract under D-003/T9. REST and Socket.IO reach the same backend contract in
T6, but the deployment-level origin is not established.

PostGIS initialization is idempotent and migration files are forward/additive. No migration rollback
runbook, backup/restore drill, or multi-replica migration coordination is present. `redis:alpine` and
`node:22-alpine` remain floating tags, reducing reproducibility; D-006 separately requires a pinned
and recorded Redis digest before T7 stateful validation.

## 6. Environment and Operations Review

`env.example` contains local placeholders and seed-aligned fixture IDs. Development Compose supplies
convenience defaults; production Compose requires database password, JWT secret, and TTN webhook
secret, but defaults `API_URL`, `FRONTEND_URL`, and the frontend API base to localhost when omitted.
This is acceptable for local parsing but can produce a valid-looking unusable non-local deployment.

The repository has no documented:

- domain/DNS and TLS terminator;
- frontend/backend public origin and REST/Socket shared-origin matrix;
- database backup schedule, restore owner, or migration rollback procedure;
- Redis persistence, authentication, memory/eviction, or recovery policy;
- log aggregation, alert routing, on-call/incident owner, or retention policy;
- host firewall, container network, resource, or restart-failure policy.

`/health` reports process liveness and `/ready` checks PostgreSQL with `SELECT 1` and Redis with
`PING`. Neither is wired as a backend Compose healthcheck in the production file, and frontend has no
healthcheck. Signals are allowlisted and redacted but are not connected to an alert destination.

## 7. Fixed Device and Transport Boundaries

### Mobile: phone GPS → authenticated Socket.IO

The simulator logs in through `/api/auth/vehicle-login`, starts a trip, connects Socket.IO with a
sender token, sends source/vehicle/trip/coordinate/speed/bearing/accuracy/station, receives the T6
canonical acknowledgement, and attempts re-handshake after disconnect. This exercises the external
sender boundary.

It is not a mobile app. There is no evidence for background-location permission, OS suspension or
throttling, network handoff, battery policy, device event timestamp, app version, local queue, or
field retry behavior. A physical pilot must record phone model/OS/app version, permissions, cadence,
clock, mounting, power, and environment.

### ESP32: GPS module → Wi-Fi → authenticated HTTP

The server supports authenticated `/api/ingest/http` with the common source-bound observation
contract, and the pipeline fixture exercises `TS_ESP_01`. This is a server adapter, not an ESP32
implementation.

No ESP32 firmware, GPS module model, Wi-Fi provisioning, NTP/GNSS clock strategy, HTTP timeout/retry/
backoff, offline queue, watchdog, flash-wear policy, credential bootstrap/rotation, antenna/mounting,
or power arrangement is documented. None may be inferred from the HTTP endpoint.

### LoRaWAN: device → gateway → TTN → authenticated webhook

The server-side `/api/ingest/ttn` path requires `TTN_WEBHOOK_SECRET`, rate-limits IP/source, extracts
`end_device_ids.device_id`, decodes supported location shapes, requires an active registered
`lorawan` source, and enters the T6 canonical pipeline. `simulate-ttn.js` creates synthetic
`location_solved` payloads for `sensor-c4` and `sensor-f2` presets.

No TTN application/device registry, payload formatter ownership, gateway coverage, region/frequency
plan, data rate, duty-cycle/fair-use policy, confirmed/unconfirmed choice, frame-counter/deduplication
policy, RSSI/SNR capture, webhook registration, provider retry behavior, or deployed mapping exists.
There is no MQTT consumer and no evidence that one should be added; keep TTN server-side until
provider facts justify a change.

## 8. Simulator and Field-Evidence Boundaries

The simulator and pipeline artifacts are controlled-MVP evidence:

- `shuttle-tracking-web/simulate.js` exercises sender login, trip setup, Socket.IO updates, canonical
  acknowledgement, and reconnect/re-handshake behavior in a Node process;
- `shuttle-tracking-backend/simulate-ttn.js` exercises synthetic TTN webhook payloads and source
  mapping;
- `shuttle-tracking-backend/tests/test_pipeline.js` checks seeded identities, negative auth and
  ownership paths, ESP32-style HTTP, TTN, mobile HTTP, source priority, analytics, history, and
  credential-free acknowledgements;
- `docs/testing/pipeline-smoke-tests.md` requires a disposable Compose stack and local-only secrets.

These artifacts do not prove hardware, radio, network coverage, battery, provider delivery, clock
quality, cold/warm start, obstruction, power cycle, duplicate/reordered messages, or controlled
failover. A field plan must use equivalent routes/mounting/cadence where feasible, include stationary
surveyed checkpoints plus moving sessions, and distinguish bench, field, pilot, and simulator
evidence.

## 9. Infrastructure Risks and Recommendations

### High — Production topology is not an operating environment

The production file describes containers but not public origins, TLS, firewall, backups, Redis policy,
logs, alerts, ownership, or recovery. DB/Redis are host-published, and application services are not
readiness health-gated.

Define one disposable-to-production topology contract with internal-only data services, frontend/
backend origins, TLS termination, `/ready` rollout checks, migration ownership, backup/restore, Redis
durability, log/alert destination, and incident ownership. Exercise it on an explicitly disposable
target first.

### High — Local pipeline evidence is not deployment/provider evidence

Compose parsing and simulator smoke tests prove the checked-in path, not deployed origin, TLS,
restart, network transition, TTN provider behavior, or physical source.

Run the documented smoke suite in a disposable production-mode deployment, capture redacted results,
restart services, verify readiness, and retain environment/configuration identity. Do not claim
provider or device support from local runs.

### Medium — Device contracts are incomplete

The server adapters are available, but the mobile app, ESP32 firmware/hardware, and TTN provider/device
configuration do not exist in repository evidence.

Before a physical pilot, record hardware/module/firmware, mount/power, cadence, clock, payload/schema,
provisioning/rotation, retry/offline behavior, gateway/provider facts, and route/checkpoint session
design. Keep Mobile, ESP32, and LoRaWAN evidence separate.

### Medium — Configuration drift can create a valid-looking unusable deployment

Production origins default to localhost, frontend API configuration is build-time, origin rewrite
logic is duplicated across layers, and image tags are not pinned to immutable versions.

Create a deployment matrix and verify one configured REST/Socket origin from an external client before
accepting a deployment. Pin runtime image versions or document the update process.

### Medium — Runtime failure and recovery evidence is missing

There are no application healthchecks, restart/recovery drill, network-loss/Redis-loss test, or
backup/restore evidence.

Add bounded disposable checks for startup, migration, readiness, backend restart, dependency
loss/recovery, and data persistence. Connect signals to an operational destination only after the
topology is chosen.

## 10. Actionable Handoffs

| Capability | Measurable outcome | Owner | Acceptance signal | Stage |
|---|---|---|---|---|
| Production topology contract | One public REST/Socket origin, TLS/proxy, internal data services, health-gated startup, backup/restore and ownership | Infrastructure + Security/DevOps | Disposable deployment smoke, readiness/restart, and origin checks pass | T9/T13 |
| Reproducible runtime | Backend/frontend images use approved immutable versions and documented migration/recovery flow | Infrastructure + Backend | Clean build/start/restart/rollback evidence | T9/T13 |
| Mobile sender contract | Real app records permissions, cadence, clock, reconnect, OS/network/power behavior | Device/Mobile owner | Bench and field session logs, not simulator-only | T15 |
| ESP32 sender contract | Hardware/firmware/GPS/Wi-Fi/HTTP timeout/retry/offline/power facts are recorded | Device owner + Backend | Bench, power-cycle, and network-loss evidence | T15 |
| LoRaWAN/TTN contract | Device/app/gateway/region/codec/webhook/dedup/RSSI-SNR facts are recorded | Device/provider owner + Backend | TTN test uplink and duplicate/outage evidence | T15 |
| Three-source research session | Equivalent route/mount/cadence/time window with checkpoints and explicit accuracy semantics | Research + Data owner | Session manifest, raw/aggregate retention/access, bounded export | T7/T15 |

These are audit handoffs, not implementation authorization. Level 2 remains appropriate for
unresolved hardware/provider/clock questions before Level 3 binds a physical or research design.

## 11. Roadmap and Decision Impact

T3 fixture alignment and local pipeline evidence remain complete. This audit revalidates infrastructure
inputs for T7, T9, T13, and T15. D-003 defines sequencing but does not supply hosting/domain/TLS or
operations-owner facts. D-006 approves an isolated T7 validation target and safer export controls;
it does not provide provider/hardware evidence or authorize production deployment. T10–T12 remain
deferred under D-001=A.

No new owner decision is proposed. Existing D-001 through D-006 remain the source of truth.

## 12. Assumptions, Unknowns, and Confidence

- Production Compose is a self-hosted template, not deployed-service proof.
- No host/domain/TLS, provider account, TTN console, gateway, mobile app, ESP32 hardware/firmware,
  backup/restore target, or load/network-failure test was observed.
- Simulator coordinates and reported accuracy are synthetic; route distance is not ground-truth
  device accuracy.
- Confidence is **high** for checked-in Compose, Docker, entrypoint, environment, simulator, and
  server-boundary facts; **medium** for production-mode operational behavior; and **low** for
  physical/provider readiness.

## 13. Audit Limitations and Handoff

No infrastructure, device, provider, or deployment change is authorized by this report.
Infrastructure & Device is **Complete / Validated** at the current evidence baseline. Dashboard & UX
is the next sequential profile; it must use current Product, Frontend, and Infrastructure evidence
and keep research diagnostics separate from public/ordinary operations UI. Security/DevOps/
Observability, Production Readiness, and Roadmap remain gated in the registered order.
