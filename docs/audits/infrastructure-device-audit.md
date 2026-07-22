# Infrastructure & Device Audit: Tram Tracking System

Validation status: **Needs Re-audit**. This legacy report lacks the complete predecessor-baseline
metadata required by the current audit contract.

Re-audited: 2026-07-22

## 1. Executive Summary

The repository now has a credible production-mode self-hosted Compose configuration: multi-stage production images, compiled backend/frontend commands, production secret checks, migration-before-start, named volumes, restart policies, and backend health/readiness endpoints. T3 also repaired the checked-in mobile/TTN fixture contract and added repeatable pipeline smoke documentation.

It is not proof of a deployed production service. The repository contains no actual host, domain, TLS/reverse proxy, provider topology, backup/restore owner, log destination, TTN console/device registry, mobile application, or ESP32 firmware/hardware contract. T4 operational signals are allowlisted best-effort process logs, not durable metrics or alerts.

Device boundaries are stronger: source-bound mobile/ESP32-style HTTP and Socket.IO ingestion, plus an authenticated TTN webhook, all use the canonical pipeline. T3 now makes simulator defaults environment-driven and seed-aligned, and the smoke suite exercises authentication, canonical selection, TTN handling, source priority, and safe acknowledgements. Physical device/provider integration remains unverified.

## Scope, Evidence, and Re-audit Status

Reviewed the Knowledge Base; current Product, Architecture, Backend, and Database reports; prior Infrastructure & Device report; Compose files; Dockerfiles; entrypoint; PostGIS init; env templates; roadmap T3 evidence; documentation; simulators; tests; and current server/ingest boundaries. The roadmap records passing development/production Compose validation, backend checks, frontend lint/build, mobile/TTN smoke, full pipeline evidence, and `git diff --check` on 2026-07-21. In this re-audit, the backend/Prisma/boundary checks passed and frontend lint had six warnings with no errors; the frontend production build could not fetch Google Fonts because this environment could not reach `fonts.googleapis.com`. These claims are repository-recorded or local-check evidence; no live deployment was available in this re-audit.

No running deployment, provider account, DNS/TLS configuration, managed database/cache, TTN application, hardware, mobile app, or firmware was available. Those matters are marked unavailable rather than inferred.

| Prior finding | Re-audit status | Current evidence |
|---|---|---|
| Docker images were development-only | **Resolved** | Production targets run compiled backend code and next start; production Compose selects them. |
| Health/readiness was missing | **Resolved** | Backend exposes health and dependency-checking ready endpoints. |
| Production startup/configuration was incomplete | **Partially Resolved** | Compose requires core secrets, uses restart policies, production targets, and migration-before-start; host/TLS/backups/log operations remain undocumented. |
| Vercel/Render/Neon deployment was missing | **Unable to Verify** | No current provider target/config is documented; historical report claims are not current repository evidence. |
| Source registry/ingestion boundary was incomplete | **Resolved** | Source lifecycle, sender token binding, HTTP ingestion, TTN secret boundary, rate limits, and canonical selection exist. |
| Server-side TTN adapter was missing | **Resolved** | The TTN endpoint accepts documented payload shapes and uses the canonical pipeline. |
| ESP32 needed a normalized contract | **Partially Resolved** | Authenticated HTTP ingestion is usable, but no firmware, transport choice, or provisioning evidence exists. |
| Real mobile/device workflow was absent | **Still Present** | Only Node simulators are in the repository. |
| Simulator fixtures align with registry | **Resolved** | T3 makes mobile/TTN IDs and secrets environment-driven, aligns defaults/documentation with seed fixtures, and adds repeatable smoke commands. |
| Repeatable device-pipeline evidence was missing | **Resolved** | T3 smoke documentation and `test_pipeline.js` cover mobile, ESP32-style HTTP, TTN, priority selection, history, and safe acknowledgements. |
| Operational signals and CI gates were missing | **Partially Resolved** | T4 adds CI checks, request IDs, allowlisted signals, redaction, suppression, and source-health sweep; signals remain process-local/best-effort and not alerting. |

## 2. Current Infrastructure Overview

Development Compose runs PostGIS, Redis, backend, and frontend with source mounts. DB/Redis have health checks and backend waits for both; the runtime is nodemon plus Next development server.

Production Compose uses the same self-hosted four-service topology with production Docker targets. The backend validates production secrets, runs Prisma migrations, disables development seed, then starts compiled code. Frontend receives its API base URL at build time and runs next start. Postgres and Redis remain host-exposed containers backed by named volumes.

## 3. Infrastructure Strengths

- Compose validation passes for development and production-mode files.
- DB/Redis health checks, dependency ordering, backend readiness, and restart policies are present.
- Dockerfiles use npm ci and separate development/production targets without source mounts in production.
- PostGIS initialization and migrations are automated; production seed is disabled.
- Production entrypoint validates JWT/TTN secret presence/defaults and rejects identical secrets.
- Redis adapter supports Socket.IO fan-out across backend processes.

## 4. Critical Infrastructure Issues

### High — Production Compose is not a complete operating environment

The file describes one self-hosted container topology but not its public host, domain, TLS/reverse proxy, public origins, backup/restore, Redis persistence/eviction policy, log shipping, alerts, or operations ownership. Public values default to localhost when not supplied.

Impact: production-mode images may still fail to connect publicly or be difficult to recover and operate after deployment.

Recommendation: before a public/daily release, document one topology with frontend/backend origins, TLS terminator, service ownership, backups/restores, Redis policy, health probes, migration runbook, and incident log location. D-003 already governs configuration/origin sequence.

Priority: High before production. Difficulty: Medium.

### High — T3 evidence is local/pilot evidence, not provider evidence

T3 now proves the configured local pipeline, but the evidence is based on simulators and a disposable stack. The repository still has no live TTN application/device registration, webhook registration, mobile application, ESP32 firmware, or deployed provider endpoint.

Impact: sender authentication and canonical selection can be repeatably tested in development, but real uplink delivery, reconnect behavior, device clocks, network failures, and provider payload variations remain unverified.

Recommendation: retain the current smoke contract, then run the same checks against a disposable deployed environment and a real TTN test device before claiming physical integration.

Priority: Medium now; High before physical pilot. Difficulty: Medium.

### Medium — Runtime device and provider evidence is unavailable

No TTN application/device registry, decoder ownership, public webhook registration, ESP32 firmware, hardware/network choice, provisioning procedure, or real mobile app is present.

Impact: server code proves boundaries, not real device connectivity or delivery behavior.

Recommendation: retain the current server adapters and collect a minimal physical-sender contract before hardware rollout. Do not choose MQTT, direct browser delivery, or an ESP32 stack by guesswork.

Priority: Medium now; High before physical pilot. Difficulty: Medium.

## 5. Local/Dev vs. Production Gap Analysis

| Area | Current production-mode evidence | Gap |
|---|---|---|
| Runtime | Compiled Node backend and Next start | Actual host and deployed runtime unobserved. |
| Data/cache | Named volumes | Backup/restore and Redis persistence/eviction not documented. |
| Startup | Required secrets, migrations, restart policies | No rollback/runbook or Compose health probe for backend/frontend. |
| Networking | Configurable origins and ports | Domain, TLS, proxy, firewall, and true CORS/Socket values unknown. |
| Operations | Container console logs | No aggregation, alerting, or ownership evidence. |

This configuration can be a controlled self-hosted base after these operations facts are supplied. It is not evidence for an unspecified managed/provider deployment.

## 6. Current Device Ingestion Review (Mobile)

The Node simulator logs in as a sender, starts a trip, connects Socket.IO with its sender token, and sends source/vehicle/trip, coordinates, speed, bearing, accuracy, and station. Server-side writes revalidate source/vehicle/credential claims and acknowledge only the canonical outcome.

This is a valid external-sender contract, not a mobile application. T3 makes the simulator source/vehicle IDs environment-driven, requires `TRACKING_SOURCE_SECRET_MOBILE`, uses sender JWT handshake authentication, and waits for a safe Socket.IO acknowledgement (`shuttle-tracking-web/simulate.js:9-15`, `shuttle-tracking-web/simulate.js:126-197`, `shuttle-tracking-web/simulate.js:214-227`). Background location, permission, reconnect/backoff semantics for a real app, device timestamp, battery/network data, and driver experience are Not Implemented. The documented smoke command is repeatable only when the disposable fixture stack is configured.

## 7. LoRaWAN Integration Readiness

The implemented path is a server-side TTN webhook, not MQTT. It validates the TTN secret, rate-limits by IP/source, extracts the TTN device ID, accepts several location shapes, requires an active registered LoRaWAN source, and sends the normalized result through canonical selection (`shuttle-tracking-backend/src/routes/ingest.route.ts:150-260`). T3 provides seed-aligned `sensor-c4` and `sensor-f2` simulations and repeatable smoke commands.

No TTN application, payload formatter ownership, deployed device-source mapping, webhook registration, MQTT consumer, or direct browser delivery is found. These are Needs Confirmation; do not create a second pipeline. Keep TTN through the backend so source selection and D-002 telemetry policy remain shared.

## 8. ESP32 Integration Readiness

Authenticated HTTP ingestion is a practical existing adapter for an ESP32 or gateway. It uses the same bound sender token and observation shape as other non-LoRaWAN sources; T3's pipeline test exercises the ESP32-style source fixture. Socket.IO is also available, but repository evidence does not show it is the preferred embedded protocol.

No firmware, GPS module, connectivity, payload cadence, offline queue, credential bootstrap, or power requirements are documented. Use HTTP for an initial physical pilot only after that contract is known; reconsider MQTT only if device/fleet evidence requires it.

## 9. Multi-Device Architecture Readiness

Readiness is **partial and suitable for controlled source experiments**. Non-TTN senders are bound to a source; TTN is a trusted webhook boundary; every accepted input reaches priority/freshness canonical selection. The selected update carries source identity/type and Socket.IO can fan out with Redis.

Open work is source-health visibility, ordering/retention under D-002, assignment history, and real source provisioning. Keep public views canonical; any source comparison belongs in an authenticated operational surface after requirements are defined.

## 10. Secrets and Configuration Review (Structural)

Templates keep secret values out of source and production Compose requires database/JWT/TTN values. Production startup performs further checks. Development defaults are useful locally but must remain local-only. The missing configuration artifact is an origin and deployment matrix covering frontend, REST/Socket backend, database/Redis endpoints, TTN webhook URL, and where each secret is supplied.

Secret strength/rotation and cloud-secret controls are deferred to Security/DevOps.

## 11. Missing Infrastructure Capabilities

- Actual production topology, domain/TLS, origin matrix, migration rollback, and operations runbook.
- Backup/restore owner, Redis persistence/eviction policy, log destination, monitoring, and alerts.
- Repeatable configured integration environment beyond local/disposable Compose.
- Durable metrics/alerts and complete malformed/oversized-ingestion signal coverage.
- TTN registry/decoder/webhook setup evidence and ESP32 firmware/provisioning/network contract.
- Source-health/device operations view for operators.

## 12. Recommended Improvements

### Recommendation 1: Run the T3 pipeline evidence in a disposable deployed environment

### Problem

The repository now has seed-aligned simulators and local smoke documentation, but no deployed-environment evidence.

### Impact

Provider, origin, TLS, restart, and network behavior can still differ from the local Compose result.

### Recommendation

Deploy the production-mode stack to a disposable environment after D-003 topology decisions, configure secrets/origins, run the documented mobile and TTN smoke commands plus the full pipeline test, and retain redacted results.

### Why

T3 already repaired the local fixture contract; the remaining infrastructure question is whether the same contract survives the selected runtime topology.

### Priority

High.

### Difficulty

Medium.

### Learning Topic

Deployment smoke tests and configuration-as-contract.

### Related Files

docker-compose.prod.yml, docs/testing/pipeline-smoke-tests.md, simulate.js, simulate-ttn.js, prisma/seed.js, and test_pipeline.js.

### Recommendation 2: Document one production topology and operating runbook

### Problem

Production Compose lacks actual origin, TLS, backup, and operating ownership facts.

### Impact

The first deployment becomes the test of configuration and recovery assumptions.

### Recommendation

Before production, document chosen topology, public origins, TLS terminator, service ownership, backup/restore, migrations, health probes, Redis policy, and log location. Resolve D-003 before implementing origin/configuration changes.

### Why

A small runbook is a simpler durable step than premature provider automation.

### Priority

High — before production.

### Difficulty

Medium.

### Learning Topic

Deployment topology, origin contracts, and recovery drills.

### Related Files

docker-compose.prod.yml, Dockerfiles, docker-entrypoint.sh, env templates, and D-003.

### Recommendation 3: Define physical sender contracts before selecting protocols

### Problem

TTN/ESP32 physical and provider details are absent.

### Impact

Choosing MQTT, sockets, or hardware provisioning now would be speculative.

### Recommendation

For each physical sender record source mapping, payload fields, event/receipt time, cadence, connectivity/offline expectations, credential bootstrap/rotation, and canonical-source priority. Use existing HTTP/webhook adapters for the first pilot where they fit.

### Why

The backend already normalizes inputs, so no transport redesign is justified yet.

### Priority

Medium now; High before physical pilot.

### Difficulty

Medium.

### Learning Topic

Device provisioning, webhook adapters, and unreliable-network telemetry.

### Related Files

src/routes/ingest.route.ts, src/services/tracking.service.ts, and D-002.

### Recommendation 4: Smoke-test production-mode operations in a disposable environment

### Problem

Compose parses but no build/start/restart/persistence/recovery evidence is checked in.

### Impact

Operational assumptions remain untested until deployment.

### Recommendation

After topology selection, build/start production Compose, check readiness, restart backend, confirm migration/seed behavior, and document backup/restore responsibility.

### Why

This produces useful operations evidence without adopting a new platform.

### Priority

Medium — before production.

### Difficulty

Medium.

### Learning Topic

Health checks, startup sequencing, and recovery drills.

### Related Files

docker-compose.prod.yml, docker-entrypoint.sh, src/server.ts, and Database Audit.

## 13. Infrastructure & Device Learning Topics

1. Compose development versus compiled production targets — needed now.
2. Health/readiness and deployment orchestration — before production.
3. Webhook adapters versus device sockets/MQTT — after sender facts are known.
4. Origins, TLS, and CORS/Socket configuration — before public deployment.
5. Backup/restore and Redis durability — before production.

## Roadmap Impact

This report validates production image/startup and sender/TTN foundations. D-003 already gates production origin/configuration sequencing; D-002 gates telemetry fidelity. T3 simulator alignment and pipeline evidence are complete. No new owner decision or roadmap change is created.

## Assumptions and Unknowns

- Production Compose is only a self-hosted configuration template, not deployed-service evidence.
- Provider, domain/TLS, backup/log ownership, TTN configuration, and hardware behavior are unknown.
- ESP32 transport, connectivity, payload, power, and provisioning are unknown.

## Confidence

**High** for checked-in Compose, image, entrypoint, simulator, and server-boundary facts. **Medium** for production readiness without a deployment. **Low** for physical-device and TTN provider readiness without external configuration or hardware.

## Required Decisions

- D-003 remains the gate for production configuration/origin ordering.
- D-002 remains the gate for device comparison, raw observations, and playback fidelity.

No new decision is needed to align simulators or document the current self-hosted template. Actual provider/hardware choices need owner input before implementation, but remain unavailable evidence rather than an audit blocker.

## 14. Audit Limitations

No running Docker stack, deployed host, provider account, DNS/TLS, managed database/cache, TTN console, mobile app, ESP32 device, hardware specification, load test, backup/restore drill, or network-failure test was observed. Security hardening and observability implementation are deferred.

## 15. Open Questions for the User

1. What topology, domains, TLS terminator, and operations owner will be used for non-local release?
2. Which TTN application/device IDs and decoder map to registered source IDs?
3. What ESP32 hardware, network, cadence, offline behavior, and credential bootstrap are intended?
4. Is a real mobile sender in scope for the controlled pilot, or are simulators supported senders?

## 16. Handoff

This report supersedes the previous Infrastructure & Device Audit. Dashboard & UX should validate source-health/stale-state presentation; Security/DevOps should audit public origins, secret operations, runtime controls, logging, and observability; Production Readiness should synthesize accepted reports after those domains refresh.
