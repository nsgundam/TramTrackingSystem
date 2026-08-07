# Infrastructure & Device Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 1eec86602c40c859d50dd9d369f636b103b6896f
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture/Backend/Frontend/Database
  audits, docs/decision-queue.md, D-008 specialist briefs, docs/research/, docs/testing/,
  docs/tasks/T9-production-topology-origin-handoff.md,
  docs/tasks/M-20260807-02-secure-simulator-test-artifacts.md,
  docs/tasks/M-20260807-03-redact-manual-simulator-output.md,
  docs/operations/university-server-network-handoff.md, README.md, env.example,
  env.production.example, docker-compose.yml, docker-compose.prod.yml, docker/,
  scripts/test-production-topology.mjs, scripts/ci-checks.sh, shuttle-tracking-backend
  Docker/startup/config/simulator/test files, and shuttle-tracking-web
  Docker/config/simulator/test/ignore files, and the T11 v3 external Mobile compatibility brief
- Reviewed at: 2026-08-08T00:07:30+07:00
- Validation state: Validated
- Predecessor baselines: docs/project-knowledge-base.md, docs/audits/product-audit.md,
  docs/audits/architecture-audit.md, docs/audits/backend-audit.md,
  docs/audits/frontend-audit.md, and docs/audits/database-audit.md @
  1eec86602c40c859d50dd9d369f636b103b6896f

## 2026-08-08 external Mobile repository re-audit

All required predecessors are current at `1eec866...`. The owner-supplied native Android revision
changes the Mobile finding from “no application source observed” to **Partially Resolved**. Static
source declares the location foreground-service type/permissions, starts a persistent notification,
uses fused location, authenticates Socket.IO, sends acknowledged observations, and drops unsent
offline locations.

It does not establish a supported field device. Credentials are held in ordinary preferences,
backup and cleartext are enabled, task removal ends the Trip/service, and the approved enrollment/
QR/claim/Keystore refresh/revoke/replacement/timeout/force-close flow is absent. Gradle execution
stopped before compilation because no Android SDK was available, so build status is **Unable to
Verify**. No emulator, phone, OEM battery path, signing artifact, network transition, or device/OS
acceptance report was exercised. ESP32/LoRaWAN/provider findings are unchanged.

## 1. Executive Summary

The repository contains local and production-mode Compose templates for PostGIS, Redis, backend, and frontend. Images have development/production targets; production startup validates key secrets, runs migrations, and disables normal seed behavior. This is a template, not a deployed production topology.

D-008 now selects the logical production handoff: one university-managed host behind one TLS proxy
at the preferred `https://tram-tracking.rsu.ac.th`, private PostgreSQL/Redis, application-owned
artifacts/migrations/runbook, and University Server/Network ownership of host/network/DNS/TLS,
deployed secrets, off-host recovery, logs/alerts and incidents. T9 repository configuration is now
implemented for the exact handoff: versioned images, internal data network, authenticated Redis,
loopback-only app bindings, dependency health ordering, fail-closed runtime/origin parsing, and an
external-team runbook. The actual host, DNS, firewall, certificate, secrets, backup, alerts,
contacts and capacity remain external evidence and no deployment inference is authorized.

The three device boundaries remain fixed: Mobile phone GPS through authenticated Socket.IO; ESP32 plus GPS module through Wi-Fi/authenticated HTTP; a separate LoRaWAN device through gateway, TTN, and authenticated webhook. M-20260807-02/03 make both Mobile simulators credential-fail-closed and safely logged, make the automated simulator local/configurable and one-shot capable, and exclude generated Playwright outputs from Git and the frontend Docker context. The external native Mobile source is now known but not T11-compatible or runtime-accepted. No ESP32 firmware/hardware, TTN console/gateway, or field/pilot evidence was observed.

## 2. Scope and Freshness

This profile reviews Compose, Docker, startup, environment templates, simulators, test documentation, and declared transport boundaries. It does not certify host security, cloud/provider behavior, TLS, deployment, devices, radio/network, runtime recovery, backups, or field performance.

All required predecessors are revalidated at `1eec866...`. The preceding baseline was
`82f4d97...`. T9 changes `docker-compose.prod.yml`, `env.production.example`,
`scripts/test-production-topology.mjs`, `scripts/ci-checks.sh`, the T9 task and University runbook,
backend entrypoint/runtime/Prisma/Redis/server/rate-limit/test/package/README files, and the central
frontend connection resolver and listed consumers/tests/package. The static topology test and
backend/frontend checks pass; no Compose stack, provider, device, field path, proxy or external
target was run. The owner's reported locked-screen test and the T11 acceptance contract remain
external evidence requirements, not a repository Mobile runtime result. Decisions, runbooks, and
simulators are not runtime proof.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Development-only image paths | Resolved | Backend and frontend Dockerfiles have development and compiled production targets. |
| Dependency readiness was absent | Resolved | T9 adds backend `/ready` and frontend process healthchecks plus health-gated DB/Redis/backend/frontend ordering in production Compose. Actual restart/dependency recovery remains externally unverified. |
| Production secret/migration startup was absent | Partially Resolved | T9 validates connection/authentication/origin/proxy/secret inputs before migrations, disables normal seed, and records artifact/database recovery separation. External secret, backup/restore and operator execution remain unavailable. |
| Provider/topology/domain/TLS deployment existed | Partially Resolved | D-008 and T9 resolve the logical university host/origin/owner contract and checked-in handoff; actual university host, DNS, certificate, network and operations acceptance are Unable to Verify. |
| Database and Redis were protected production internals | Partially Resolved | T9 removes DB/Redis host ports, places them only on an internal data network, runs Redis as its image user with required authentication, and statically tests the contract. External firewall/runtime evidence is unavailable. |
| REST and Socket.IO production origin was established | Resolved | T9 defaults production browser traffic to same-origin `/api` and current-origin Socket.IO, permits one safe shared HTTPS override, and removes consumer fallback chains/localhost rewrites. Deployed proxy behavior remains Unable to Verify. |
| Mobile sender was a supported application | Partially Resolved | A pinned native app statically implements foreground location and acknowledged Socket.IO sending, but not T11 enrollment/QR/claim/Keystore/recovery, safe task removal, signed release, or device/OS runtime acceptance. |
| ESP32 sender was a physical implementation | Still Present | HTTP contract exists, but no firmware, GPS module, provisioning, Wi-Fi/retry/offline, clock, power, or mounting evidence exists. |
| LoRaWAN delivery was deployed | Unable to Verify | Webhook parser/secret and synthetic payload simulator exist; TTN registry, gateway/coverage, region, codec, counters/dedup, webhook delivery, RSSI/SNR, and provider recovery are unknown. |
| Disposable simulator/pipeline evidence existed | Partially Resolved | The automated Mobile simulator is again local/env-driven, credential-fail-closed, supports documented `--once`, emits a safe acknowledgement summary, and has deterministic source/process tests. No authenticated observation, Compose stack, provider, or physical source was run. |
| Automated Mobile simulator could silently target a non-local service with a credential fallback | Resolved | M-20260807-02 removes the checked-in non-local hostname and credential literal. A subprocess test proves a missing credential exits before Socket.IO connects; whether the historical literal was ever active externally is Unable to Verify and requires owner-side rotation assessment. |
| Documented one-shot simulator behavior matched source | Resolved | `--once` now makes one send attempt, checks the canonical acknowledgement, disconnects, and propagates failure through the exit status. Both Mobile tools reject missing credentials before connection and emit allowlisted status rather than token claims, raw responses, or coordinates. The tests do not claim a successful live ingestion run. |
| Generated browser-test artifacts stayed out of source/images | Resolved | Git and Docker ignore `test-results`, `playwright-report`, and `blob-report`; the frontend check enforces the patterns. This is build-context hygiene, not a deployed-image inspection. |

## 4. Current Topology and Operations Gap

| Environment | Repository evidence | Limitation |
|---|---|---|
| Development Compose | Four local services, source mounts, DB/Redis healthchecks, local ports, fixture/seeding variables. | Not a production security, recovery, or device result. |
| Production-mode Compose | Four versioned self-hosted containers, internal-only data network, authenticated Redis, loopback app bindings, required secrets/origin/proxy values, pre-migration validation, and health-gated ordering. | Static repository handoff only; no external deployment, proxy/TLS, secret, restart, recovery, alert, or capacity result exists. |
| External sender path | Mobile/ESP32 contact backend; LoRaWAN contacts TTN then webhook. | Domain/origin, firewall, provider registration and physical runtime remain unverified. |

## 5. Delivered T9 Repository Contract

T9 aligns one origin, private/authenticated PostgreSQL/Redis, fail-closed production configuration,
proxy/CORS/Socket requirements, healthchecks, a non-secret environment schema and University
handoff/recovery commands. It remains Partially Complete and must stop before deployment or runtime
acceptance until the Server/Network Team names contacts and provides actual host/network, DNS/TLS,
secret, backup, log/alert, recovery and capacity facts.

## 6. Device and Field-Evidence Contract

Mobile must provide phone/OS/app version, permission/background/lock-screen behavior, cadence, clock, reconnect, offline discard, power and vehicle-selector/claim behavior. ESP32 must provide board/GPS module/firmware, Wi-Fi association, time source, HTTP timeout/retry/backoff, offline/flash/watchdog, credential rotation, power and mounting facts. LoRaWAN must provide device, gateway, TTN application/codec, region/frequency/duty-cycle, data rate, frame counter/dedup, confirmed policy, webhook, RSSI/SNR and coverage facts. A field session must record equivalent route/mount/cadence/environment and distinguish simulator, bench, field, and pilot evidence. Route distance is only conformance proxy; reported accuracy is only stated uncertainty.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 is Partially Complete for its exact repository-side handoff under D-008. T10 is complete for exact scope and
has no infrastructure dependency beyond ordinary safe verification. T11 can implement backend/web
structures only after its remaining
gates; it may not claim an Android or physical sender result. T12 is complete for exact scope, but
its read-only source view must not be treated as device/provider evidence. Infrastructure & Device
does not propose a new owner decision: D-008 captures the policy and its external acceptance gate.

Confidence is High for checked-in templates, simulator configuration, and deterministic tooling boundaries; Medium for production-mode static behavior; and Low for deployment, TLS, provider, physical device, radio, field performance, recovery and operations.

## 8. Proposed Owner Decisions and Handoff

No new owner decision is proposed. D-008 is implemented only for repository delivery; its external
acceptance checklist and all Mobile/ESP32/LoRaWAN physical facts remain evidence gates.

Infrastructure & Device is validated at `1eec866...`. Dashboard & UX,
Security/DevOps/Observability, Production Readiness, and Roadmap have now completed their dependent
revalidations; none promotes the D-008 decision or tooling evidence to provider, device, field, or
deployment proof.

## 9. T12 Implementation Re-audit — 2026-08-01

T12 adds no Compose, environment, device firmware, provider, gateway, deployment, or physical-source
behavior. Its process-local feedback retention sweep is source code that starts only after the current
backend start sequence; it is not a scheduled-job ownership, multi-instance, backup, or deployment
result. The read-only health page uses existing stored status/last-seen facts and must not be treated
as Android/ESP32/LoRaWAN field or availability evidence. All T9/D-008, T11 Android, and physical
device findings remain **Still Present** or **Unable to Verify** as recorded above.

## 10. M-20260807-02 Tooling Re-audit — 2026-08-07

The corrective maintenance restores the intended safe simulator contract without selecting a
production origin: localhost is the only fallback, any other REST/Socket target must be explicit,
the Mobile credential has no source fallback, and route-fixture lookup is independent of the caller's
working directory. The focused tooling suite passes three deterministic checks, including a missing-
credential subprocess that exits before connection. Full repository CI, Compose parsing, and builds
pass; no simulator, migration, seed, application stack, or external endpoint was run.

This resolves only repository tooling drift. D-008/T9 topology and operations facts, T11's exact
lifecycle handoff and versioned Android acceptance artifact, every ESP32/LoRaWAN physical/provider
fact, and all field/pilot outcomes remain **Still Present** or **Unable to Verify**.

## 11. M-20260807-03 Tooling Re-audit — 2026-08-07

The manual Mobile simulator now follows the same output boundary as the automated tool: no decoded
token claims, raw Trip error object, or submitted coordinate/bearing values enter ordinary output.
Its missing-credential path closes readline/socket resources and returns a failing status before
connection. The shared deterministic suite passes four checks across both scripts, and full
repository CI passes. No simulator target or external credential was used, so device/runtime and
historical credential-rotation facts remain **Unable to Verify**.
