# Infrastructure & Device Audit: Tram Tracking System

Audit metadata:

- Evidence baseline: `847a18cce9bc27c82b2622dbc176b3a89bc4d037`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/device-comparison-scope.md`, `docs/testing/pipeline-smoke-tests.md`, `docs/testing/ci-checks.md`, `docs/roadmap/master-refactoring-roadmap.md`, `README.md`, `env.example`, `docker-compose.yml`, `docker-compose.prod.yml`, `docker/init-postgis.sh`, `shuttle-tracking-backend/Dockerfile`, `shuttle-tracking-backend/docker-entrypoint.sh`, `shuttle-tracking-backend/prisma/seed.js`, `shuttle-tracking-backend/simulate-ttn.js`, `shuttle-tracking-backend/test_pipeline.js`, `shuttle-tracking-web/Dockerfile`, `shuttle-tracking-web/simulate.js`, `shuttle-tracking-web/simulate-manual.js`, `shuttle-tracking-web/next.config.ts`, `shuttle-tracking-backend/src/server.ts`, and `shuttle-tracking-backend/src/routes/ingest.route.ts`.
- Reviewed at: `2026-07-22T21:35:07+07:00`
- Validation state: **Validated**
- Predecessor baselines: Backend, Frontend, and Database, each `@ 847a18cce9bc27c82b2622dbc176b3a89bc4d037`; Discovery, Product, and Architecture are also current at this baseline.
- Legacy report commit: `565c58c`

## 1. Executive Summary

The repository provides a credible self-hosted Compose foundation for the approved controlled demonstration. Development Compose runs PostGIS, Redis, backend, and frontend with dependency health checks; production targets build compiled backend/Next images, run migrations before startup, disable seed in non-development mode, require production JWT/TTN secrets, and use named data volumes. T3 also aligns simulator/seed fixtures and documents repeatable mobile, ESP32-style HTTP, TTN webhook, and full pipeline smoke commands.

This is not evidence of a deployed production service or physical device integration. No host, domain, TLS/reverse proxy, managed database/cache, backup/restore process, monitoring destination, TTN application/device registration, mobile application, or ESP32 firmware/hardware contract is present. Production Compose still exposes PostgreSQL and Redis host ports, has no backend/frontend healthchecks, uses localhost origin defaults, and has no documented recovery/operations owner. Those are release-blocking infrastructure facts for daily/public operation, not reasons to redesign the controlled MVP.

The fixed research boundaries remain: Mobile phone GPS through authenticated Socket.IO; a separate ESP32 plus GPS module through Wi-Fi/authenticated HTTP; and a separate LoRaWAN device through gateway, TTN, and authenticated webhook. Simulators validate server boundaries only and cannot prove device, radio, provider, clock, battery, coverage, or field performance.

## 2. Scope, Freshness, and Predecessor Gate

This review covers Compose topology, image targets, startup/migration/seed behavior, environment and origin configuration, container health/dependency ordering, local smoke evidence, and the three distinct device/provider boundaries. It excludes security hardening severity, detailed observability design, hardware selection, provider account configuration, and runtime field performance except where their absence is an infrastructure readiness finding.

Backend, Frontend, and Database are Complete and Validated at the same evidence baseline, so the Infrastructure & Device predecessor gate passes. Since the legacy report, current evidence includes T5 lifecycle integration, the T3 fixture/smoke contract, T4 CI checks and operational signals, the approved D-002/D-004 research scope, and current production Compose/Docker behavior. Current uncommitted changes are audit documentation only.

The repository records Compose parsing and CI/build evidence. No running stack, production deployment, physical source, provider console, or network-failure experiment was observed in this re-audit, so those findings remain `Unable to Verify` rather than being inferred from configuration.

## 3. Prior-Finding Revalidation

| Prior finding | State | Current evidence and implication |
|---|---|---|
| Docker images were development-only | **Resolved** | Backend and frontend Dockerfiles have development and production targets; production runs compiled backend code and `next start` without development source mounts. |
| Health/readiness was missing | **Resolved** | Backend exposes `/health` and dependency-checking `/ready`; development DB/Redis have Compose healthchecks and backend waits for both. |
| Production startup/configuration was incomplete | **Partially Resolved** | Production secrets, migration-before-start, seed-disabled behavior, restart policies, and production targets exist; origins, TLS, backup/restore, Redis policy, logs, alerts, and operations ownership remain undocumented. |
| Vercel/Render/Neon deployment was missing | **Unable to Verify** | No current provider target or deployed topology is documented; no provider claim is accepted from historical text. |
| Source registry/ingestion boundary was incomplete | **Resolved** | Source lifecycle, sender token binding, HTTP ingestion, TTN webhook secret boundary, rate limits, and canonical selection exist in the current backend. |
| Server-side TTN adapter was missing | **Resolved** | `/api/ingest/ttn` decodes supported payload shapes, checks the webhook secret, requires a registered LoRaWAN source, and enters the shared canonical pipeline. |
| ESP32 needed a normalized contract | **Partially Resolved** | Authenticated HTTP and observation schema provide a usable server adapter; no firmware, GPS module, provisioning, retry, offline, power, or network evidence exists. |
| Real mobile/device workflow was absent | **Still Present** | Repository clients are Node simulators; no supported mobile app, background-location permissions, OS-throttling behavior, or physical device contract is present. |
| Simulator fixtures aligned with registry | **Resolved** | `env.example`, `prisma/seed.js`, `simulate.js`, `simulate-ttn.js`, and `test_pipeline.js` use environment-driven, seed-aligned source/device mappings and local-only secrets. |
| Repeatable device-pipeline evidence was missing | **Resolved** | Smoke documentation and `test_pipeline.js` cover authenticated negative paths, ESP32-style HTTP, TTN webhook, mobile sender flow, priority selection, history/analytics, and safe acknowledgements on a configured disposable stack. |
| Operational signals and CI gates were missing | **Partially Resolved** | CI runs backend/frontend/Prisma/Compose/log-safety checks; request IDs and allowlisted signals cover startup/readiness/ingestion/staleness/history failures. Signals are best-effort process logs, not durable metrics or alerts. |
| Production service boundaries were not health-gated | **New Finding** | Production Compose has DB/Redis healthchecks but no backend/frontend healthchecks; frontend depends only on backend container start, not `/ready`. DB and Redis are also host-published in the production file. |

## 4. Current Topology Review

| Environment | Current topology | Assessment |
|---|---|---|
| Development | PostGIS + Redis + backend + frontend; source mounts; nodemon/Next dev; named volumes; DB/Redis healthchecks; backend waits for healthy dependencies | Appropriate for local controlled testing. Defaults and seeded data must remain local-only. |
| Production mode | Same four-service self-hosted topology; compiled backend/Next targets; named volumes; restart `always`; backend migration/secret entrypoint; no seed | Useful template, not a public deployment plan. Host exposure, proxy/TLS, backup, monitoring, and health-gated rollout are open. |
| External sender | Mobile/ESP32 sender to backend origin; TTN device to gateway/provider then backend webhook | Server boundary is defined; external origin, routing, provider, and device facts are unavailable. |

The Compose files use container names and host ports `5432`, `6379`, `3001`, and `3000`. Production DB and Redis are therefore reachable through host-published ports unless an external firewall/network policy restricts them. No internal-only network, resource limit, read-only filesystem, explicit Redis authentication, eviction policy, or provider-managed persistence contract is defined. Detailed secret and hardening decisions remain for Security/DevOps, but the topology must be corrected or explicitly protected before production.

## 5. Image, Startup, and Migration Review

Backend images use Node 22 Alpine, `npm ci`, Prisma client generation, a compiled `dist` production target, and `docker-entrypoint.sh`. The entrypoint validates non-development JWT/TTN secrets for known defaults and minimum length, rejects equal JWT/TTN secrets, runs `prisma migrate deploy`, disables seed outside development, then starts the compiled server. Development startup runs migrations and the seed on each container start.

Frontend images use a development target and a production target with `next build` followed by `next start`. `NEXT_PUBLIC_API_BASE_URL` is injected at build time, so the public REST/Socket origin is a build/deployment configuration rather than a runtime secret. `next.config.ts` includes localhost rewrites for `/api` and `/socket.io`; production origin alignment therefore requires an explicit proxy/origin plan under D-003/current T9.

PostGIS initialization creates `postgis` and `postgis_topology` idempotently. Database migrations are forward files and the current T5 checks are additive. No migration rollback runbook, backup/restore drill, or multi-replica migration coordination is present. `redis:alpine` and `node:22-alpine` are floating tags, which reduces production reproducibility and should be addressed in the topology/runbook phase.

## 6. Environment and Operations Review

`env.example` contains local placeholder values, fixture IDs, and empty local sender secrets. Development Compose supplies safe local defaults for convenience; production Compose requires PostgreSQL password, JWT secret, and TTN webhook secret, but defaults `API_URL`, `FRONTEND_URL`, and frontend API base to localhost when not explicitly overridden. This is safe for local parsing but can silently produce an unusable non-local origin if an operator omits the deployment matrix.

The repository has no documented:

- domain/DNS and TLS terminator;
- frontend/backend public origin and REST/Socket shared-origin matrix;
- database backup schedule, restore owner, or migration rollback procedure;
- Redis persistence, authentication, memory/eviction, or recovery policy;
- log aggregation, alert routing, on-call/incident owner, or retention policy;
- host firewall, container network, resource, or restart-failure policy.

`/health` only reports process liveness and `/ready` checks PostgreSQL/Redis. Neither endpoint is wired as a backend Compose healthcheck in the production file, and frontend has no healthcheck. Readiness signals are allowlisted in logs but not connected to an alert destination.

## 7. Fixed Device and Transport Boundaries

### Mobile: phone GPS → authenticated Socket.IO

The repository simulator logs in through `/api/auth/vehicle-login`, starts a trip, connects Socket.IO with a sender token, sends source/vehicle/trip/coordinate/speed/bearing/accuracy/station, acknowledges canonical results, and attempts re-handshake after a lost connection. This is a useful external-sender contract and tests the server boundary.

It is not a mobile app. There is no evidence for background-location permissions, OS suspension/throttling, network handoff, battery policy, device event timestamps, app version, local queue, or field retry behavior. A real pilot must record phone model/OS/app version, permission state, cadence, time source, mounting, power, and environmental conditions.

### ESP32: GPS module → Wi-Fi → authenticated HTTP

The server supports authenticated `/api/ingest/http` with the same source-bound observation contract. `test_pipeline.js` exercises the `TS_ESP_01` fixture and rejects unauthenticated/mismatched writes. This is a valid server adapter for an initial ESP32 pilot if the physical contract is approved.

No ESP32 firmware, GPS module model, Wi-Fi provisioning, NTP/GNSS clock strategy, HTTP timeout/retry/backoff, offline queue, watchdog, flash-wear policy, credential bootstrap/rotation, antenna/mounting, or power arrangement is documented. Do not infer any of these from the HTTP endpoint.

### LoRaWAN: device → gateway → TTN → authenticated webhook

The server-side `/api/ingest/ttn` path requires `TTN_WEBHOOK_SECRET`, rate-limits IP/source, extracts `end_device_ids.device_id`, decodes supported location shapes, requires an active registered `lorawan` source, and enters the shared canonical pipeline. `simulate-ttn.js` creates synthetic `location_solved` payloads for the seed-aligned `sensor-c4`/`sensor-f2` presets.

No TTN application/device registry, payload formatter ownership, gateway coverage, region/frequency plan, data rate, duty-cycle/fair-use policy, confirmed/unconfirmed uplink choice, frame-counter/deduplication policy, RSSI/SNR capture, webhook registration, provider retry behavior, or deployed device-source mapping is present. There is no MQTT consumer and no evidence that one should be added; keep TTN server-side until provider facts justify a change.

## 8. Simulator and Field-Evidence Boundaries

The simulator and pipeline artifacts are controlled-MVP evidence:

- `simulate.js` exercises sender login, trip start, Socket.IO updates, acknowledgement, and reconnect/re-handshake behavior in a Node process.
- `simulate-manual.js` provides an interactive sender flow with the same token/Socket.IO boundary.
- `simulate-ttn.js` exercises synthetic TTN webhook payloads and source mapping.
- `test_pipeline.js` checks seeded source identities, negative auth/ownership paths, ESP32-style HTTP, TTN, mobile HTTP, source priority, analytics, history, and credential-free acknowledgements.
- `docs/testing/pipeline-smoke-tests.md` requires a disposable Compose stack and local-only secrets, and explicitly states that simulator output does not prove physical/provider deployment.

None of these artifacts proves hardware, radio, network coverage, battery, provider delivery, clock quality, cold/warm start, obstruction, power cycle, duplicate/reordered messages, or controlled failover. The field plan must use equivalent routes/mounting/cadence where feasible, include stationary surveyed checkpoints plus moving sessions, and distinguish bench, field, pilot, and simulator evidence.

## 9. Infrastructure Risks and Recommendations

### High — Production topology is not an operating environment

The production file describes containers but not public origins, TLS, firewall, backups, Redis policy, logs, alerts, ownership, or recovery. DB/Redis are host-published, and backend/frontend are not readiness health-gated.

Define one disposable-to-production topology contract with internal-only data services, frontend/backend origins, TLS termination, `/ready` rollout checks, migration ownership, backup/restore, Redis durability, log/alert destination, and incident ownership. Run it only against an explicitly disposable deployment target first.

### High — Local pipeline evidence is not deployment/provider evidence

Compose parsing and simulator smoke tests prove the checked-in path but not a deployed origin, TLS, restart, network transition, TTN provider, or physical source.

Run the documented smoke suite in a disposable production-mode deployment, capture redacted results, restart services, verify readiness, and retain the environment/configuration identity. Do not claim provider or device support from local runs.

### Medium — Device contracts are incomplete

The server adapters are available, but the mobile app, ESP32 firmware/hardware, and TTN provider/device configuration do not exist in repository evidence.

Before a physical pilot, record hardware/module/firmware, mount/power, cadence, clock, payload/schema version, provisioning/rotation, retry/offline behavior, gateway/provider facts, and route/checkpoint session design. Keep Mobile, ESP32, and LoRaWAN evidence separate.

### Medium — Configuration drift can create a valid-looking but unusable deployment

Production origin defaults remain localhost, frontend API configuration is build-time, Socket.IO and REST origin logic is duplicated, and image tags are not pinned to immutable versions.

Create a deployment matrix and verify a single configured REST/Socket origin from an external client before accepting a deployment. Pin runtime image versions or document the update process.

### Medium — Runtime failure and recovery evidence is missing

There are no healthchecks for application services, no restart/recovery drill, no network-loss/Redis-loss test, and no backup/restore evidence.

Add bounded disposable checks for startup, migration, readiness, backend restart, dependency loss/recovery, and data persistence. Connect signals to an operational destination only after the topology is chosen.

## 10. Actionable Handoffs

| Capability | Measurable outcome | Owner | Acceptance signal | Privacy/operational boundary | Stage |
|---|---|---|---|---|---|
| Production topology contract | One documented public REST/Socket origin, TLS/proxy, internal data services, health-gated startup, backup/restore and ownership | Infrastructure + Security/DevOps | Disposable deployment smoke, readiness/restart, and origin checks pass | Secrets external; no public DB/Redis | Phase 2/4 / T9/T13 |
| Reproducible runtime | Backend/frontend images use approved immutable versions and documented migration/recovery flow | Infrastructure + Backend | Clean build/start/restart/rollback evidence | No seed or fixture secrets in production | Phase 2/4 |
| Mobile sender contract | Real app records permissions, cadence, clock, reconnect, OS/network/power behavior | Device/Mobile owner | Bench and field session logs, not simulator-only | Source-bound sender access | Phase 5 / T15 |
| ESP32 sender contract | Hardware/firmware/GPS/Wi-Fi/HTTP timeout/retry/offline/power facts are recorded | Device owner + Backend | Bench/power-cycle/network-loss evidence | Credential rotation and bounded telemetry | Phase 5 / T15 |
| LoRaWAN/TTN contract | Device/app/gateway/region/codec/webhook/dedup/RSSI-SNR facts are recorded | Device/provider owner + Backend | TTN test uplink and duplicate/outage evidence | Provider secret server-side; research fields allowlisted | Phase 5 / T15 |
| Three-source research session | Identical route/mount/cadence/time window with checkpoints and explicit accuracy semantics | Research + Data owner | Session manifest, raw/aggregate retention/access, bounded export | Separate authenticated research surface | Phase 2/5 / T7/T15 |

These are audit handoffs, not implementation authorization. Level 2 is appropriate for the unresolved hardware/provider/retention/clock questions before Level 3 binds a physical or research design.

## 11. Roadmap and Decision Impact

T3 simulator/fixture alignment and local pipeline evidence are complete. This audit revalidates infrastructure inputs for T7, T9, T13, and T15. D-003/current T9 must define topology/origin before configuration alignment; D-002 and D-004 gate research telemetry and three-device claims. T10–T12 remain deferred under D-001=A.

No new owner decision is proposed. Existing D-001 through D-004 remain the source of truth. Physical hardware, provider, retention, and clock choices are unresolved evidence/owner inputs, not decisions to infer in this audit.

## 12. Assumptions, Unknowns, and Confidence

- Production Compose is a self-hosted template, not a deployed-service proof.
- No host/domain/TLS, provider account, TTN console, gateway, mobile app, ESP32 hardware/firmware, backup/restore target, or load/network-failure test was observed.
- Simulator route coordinates and reported accuracy are synthetic; route distance is not ground-truth device accuracy.
- Confidence is **high** for checked-in Compose, Docker, entrypoint, environment, simulator, and server-boundary facts; **medium** for production-mode operational behavior; **low** for physical/provider readiness.

## 13. Audit Limitations and Handoff

No infrastructure, device, provider, or deployment changes are authorized by this report. Infrastructure & Device is now Complete and Validated. Dashboard & UX is the next eligible profile; it must use current Product, Frontend, and Infrastructure evidence and keep research diagnostics separate from public/ordinary operations UI. Security/DevOps/Observability, Production Readiness, and Roadmap remain gated in the registered order.
