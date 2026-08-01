# Infrastructure & Device Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 6697acbd62c740039722769588b1c464231e5ce1 plus approved D-009/D-010:A and the current T12 implementation working tree
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture/Backend/Frontend/Database audits, docs/decision-queue.md, docs/research/, docs/testing/, roadmap/task records, README.md, env.example, docker-compose.yml, docker-compose.prod.yml, docker/, shuttle-tracking-backend Docker/startup/config/simulator/test files, and shuttle-tracking-web Docker/config/simulator files
- Reviewed at: 2026-08-01T14:45:45+07:00
- Validation state: Validated
- Predecessor baselines: Discovery, Product, Architecture, Backend, Frontend, and Database @ 6697acbd62c740039722769588b1c464231e5ce1 plus their T12 implementation re-audit addenda

## 1. Executive Summary

The repository contains local and production-mode Compose templates for PostGIS, Redis, backend, and frontend. Images have development/production targets; production startup validates key secrets, runs migrations, and disables normal seed behavior. This is a template, not a deployed production topology.

D-008 narrows candidates to university infrastructure, AWS, or a VPS and delays domain binding until a working server deployment. It does not select provider/region/network placement, public origins, TLS terminator/certificate owner, secret source, PostgreSQL/Redis placement, backup/restore, migration/rollback, logging/alerts, or incident owner. T9 is therefore blocked and no configuration or deployment inference is authorized.

The three device boundaries remain fixed: Mobile phone GPS through authenticated Socket.IO; ESP32 plus GPS module through Wi-Fi/authenticated HTTP; a separate LoRaWAN device through gateway, TTN, and authenticated webhook. Checked-in simulators and a disposable smoke plan are backend-contract evidence only. No Mobile application, ESP32 firmware/hardware, TTN console/gateway, or field/pilot evidence was observed.

## 2. Scope and Freshness

This profile reviews Compose, Docker, startup, environment templates, simulators, test documentation, and declared transport boundaries. It does not certify host security, cloud/provider behavior, TLS, deployment, devices, radio/network, runtime recovery, backups, or field performance.

All required predecessors are validated at 6697acb plus the D-009 working copy. T10 adds no
infrastructure configuration, migration, browser/runtime target, or device behavior. The owner's
reported locked-screen test and the T11 acceptance contract are external evidence requirements, not
a repository Mobile runtime result. Decisions and simulators are not runtime proof.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Development-only image paths | Resolved | Backend and frontend Dockerfiles have development and compiled production targets. |
| Dependency readiness was absent | Partially Resolved | DB/Redis Compose healthchecks and backend ready endpoint exist. Production Compose has no backend/frontend healthchecks or health-gated frontend dependency. |
| Production secret/migration startup was absent | Partially Resolved | Production entrypoint validates secrets, migrates and disables normal seed. Operations ownership/recovery/rollback remain undefined. |
| Provider/topology/domain/TLS deployment existed | Unable to Verify | D-008 intentionally leaves actual provider, region, network, origins and TLS/operations facts pending. |
| Database and Redis were protected production internals | Still Present | Production Compose host-publishes both data-service ports; no selected network/firewall/managed-service boundary exists. |
| REST and Socket.IO production origin was established | Still Present | Templates and frontend code retain localhost/default/fallback behavior; no D-008 contract defines public origin or TLS proxy. |
| Mobile sender was a supported application | Still Present | The Node simulator uses backend sender APIs; no native app, installation, background permission, lock-screen, reconnect, offline-discard, or field evidence exists. |
| ESP32 sender was a physical implementation | Still Present | HTTP contract exists, but no firmware, GPS module, provisioning, Wi-Fi/retry/offline, clock, power, or mounting evidence exists. |
| LoRaWAN delivery was deployed | Unable to Verify | Webhook parser/secret and synthetic payload simulator exist; TTN registry, gateway/coverage, region, codec, counters/dedup, webhook delivery, RSSI/SNR, and provider recovery are unknown. |
| Disposable simulator/pipeline evidence existed | Partially Resolved | Documented local disposable Compose smoke and synthetic tests exist. They must not run against ambient or production state and were not re-executed in this audit. |

## 4. Current Topology and Operations Gap

| Environment | Repository evidence | Limitation |
|---|---|---|
| Development Compose | Four local services, source mounts, DB/Redis healthchecks, local ports, fixture/seeding variables. | Not a production security, recovery, or device result. |
| Production-mode Compose | Four self-hosted containers, production build targets, restart always, required DB/JWT/TTN secrets, migration-before-start. | No selected host/network/TLS, backend/frontend healthcheck, internal-only data placement, backup/restore, alerting, or incident ownership. |
| External sender path | Mobile/ESP32 contact backend; LoRaWAN contacts TTN then webhook. | Domain/origin, firewall, provider registration and physical runtime remain unverified. |

## 5. Required T9 Contract

T9 cannot start until the owner supplies one written deployment record naming provider/host and region/network boundary; frontend/backend public origins; PostgreSQL and Redis placement; TLS terminator and certificate owner; secret source; Redis persistence/authentication/eviction policy; log and alert destination; backup/restore owner; migration/rollback owner; and incident/on-call owner. The record must forbid plaintext production traffic and direct public data-service exposure. Only then may configuration be aligned and a disposable/staging readiness/origin check be planned.

## 6. Device and Field-Evidence Contract

Mobile must provide phone/OS/app version, permission/background/lock-screen behavior, cadence, clock, reconnect, offline discard, power and vehicle-selector/claim behavior. ESP32 must provide board/GPS module/firmware, Wi-Fi association, time source, HTTP timeout/retry/backoff, offline/flash/watchdog, credential rotation, power and mounting facts. LoRaWAN must provide device, gateway, TTN application/codec, region/frequency/duty-cycle, data rate, frame counter/dedup, confirmed policy, webhook, RSSI/SNR and coverage facts. A field session must record equivalent route/mount/cadence/environment and distinguish simulator, bench, field, and pilot evidence. Route distance is only conformance proxy; reported accuracy is only stated uncertainty.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is blocked by D-008 facts. T10 is complete for exact scope and has no infrastructure dependency
beyond ordinary safe verification. T11 can implement backend/web structures only after its remaining
gates; it may not claim an Android or physical sender result. T12 is complete for exact scope, but
its read-only source view must not be treated as device/provider evidence. Infrastructure & Device
does not propose a new owner decision: D-008 captures the missing facts.

Confidence is High for checked-in templates and server-boundary facts, Medium for production-mode static behavior, and Low for deployment, TLS, provider, physical device, radio, field performance, recovery and operations.

## 8. Handoff

Dashboard & UX is now eligible with current Product, Frontend, and Infrastructure & Device evidence. Security, DevOps & Observability waits for Dashboard & UX as well.

## 9. T12 Implementation Re-audit — 2026-08-01

T12 adds no Compose, environment, device firmware, provider, gateway, deployment, or physical-source
behavior. Its process-local feedback retention sweep is source code that starts only after the current
backend start sequence; it is not a scheduled-job ownership, multi-instance, backup, or deployment
result. The read-only health page uses existing stored status/last-seen facts and must not be treated
as Android/ESP32/LoRaWAN field or availability evidence. All T9/D-008, T11 Android, and physical
device findings remain **Still Present** or **Unable to Verify** as recorded above.
