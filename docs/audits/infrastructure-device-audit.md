# Infrastructure & Device Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Evidence scope: `docker-compose.yml`, `docker-compose.prod.yml`, `docker/`,
  `shuttle-tracking-backend/Dockerfile`, `shuttle-tracking-web/Dockerfile`, `.github/workflows/`,
  `scripts/`, `docs/operations/`, `docs/research/`, simulator boundaries under both application
  test trees, and the pinned external Android revision recorded by Discovery
- Reviewed at: `2026-08-13T21:51:09+07:00`
- Validation state: **Validated**
- Re-audit purpose: M-20260812-02 Infrastructure & Device compatibility.
- Predecessor baselines: `docs/audits/backend-audit.md`, `docs/audits/frontend-audit.md`, and
  `docs/audits/database-audit.md` (R4), each validated over
  `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Owner-decision overlay: current Plan v1/S14/OSM directions affect placement only, not
  topology/device evidence.

## 1. Repository topology evidence

T9 supplies a checked-in single-origin production template with private PostgreSQL/Redis networking,
authenticated Redis, loopback application bindings, health ordering, a fail-closed runtime/origin
configuration authority, and a University Server/Network handoff. This is repository/static
evidence only. Actual host resources, firewall, DNS/TLS, proxy hops, secret store, off-host backup,
restore, log/metric sink, alerts, restart, scaling, and incident ownership remain unverified.

Accepted `M-20260812-01` Playwright/Next/TypeScript configuration isolates the browser-test build
cache. It does not alter the intended production topology and remains separate Maintenance evidence.

M-02 source `71f2002` changes no Compose, image, topology, device, provider, firmware, Mobile, or
external-target path. Full CI is static/regression evidence only; no infrastructure or device target
ran, and every external gate below remains unchanged.

## 2. Device/source boundaries

| Boundary | Repository evidence | Missing acceptance |
|---|---|---|
| Mobile/Socket.IO | Pinned Android source has a foreground location service, short-lived sender login, Trip start/end, and acknowledged location writes | Approved installation/claim/Keystore refresh/revocation contract, writable coordinated client patch, build/device/OS/background/reconnect/task-removal evidence |
| ESP32 GPS/Wi-Fi/HTTP | Server boundary, credentials, simulators/fixtures | Firmware, module/antenna/power/mounting, time source, offline queue, retry/backoff/watchdog, credential rotation, physical tests |
| LoRaWAN/Gateway/TTN/Webhook | Authenticated webhook and simulator/seed mappings | Region/frequency plan, device registry, gateway coverage, codec/payload version, frame counters, duty cycle, RSSI/SNR, dedupe/retry and provider delivery evidence |
| Simulators | Deterministic local tools with explicit credentials/targets and redacted output | They are synthetic and cannot establish physical accuracy, availability, power, coverage, or field recovery |

No new immutable Mobile revision, ESP32 firmware, TTN configuration, device report, field session, or
provider/runtime evidence was supplied during this research pass.

## 3. T14 placement

Proxy behavior, reconnect/load, provider response, physical devices, human Mobile use, and field
results are **external evidence**, not T14 source slices. They must be decomposed by owner:

- T9/T13: deployed origin, TLS/proxy, private services, backup/restore, monitoring, capacity, and
  recovery;
- T11: supported Mobile sender lifecycle and Android acceptance;
- T15: physical Mobile/ESP32/LoRaWAN comparison, field protocol, provider facts, and Research UI;
- release acceptance: human/AT and representative device/browser matrices.

The Public image, timestamp, and asset residuals do not require device firmware or topology changes;
owner-cancelled OSM work is removed from T14. Do not hide an external-evidence gap inside a frontend completion criterion and do not infer
physical behavior from isolated Playwright or simulators.

## 4. Stop conditions and confidence

Stop any research-field, internal-operations, or public-service claim if physical/provider facts,
secure provisioning/rotation, representative route/coverage sessions, reconnect/power-cycle
recovery, or deployed operations evidence is missing. Confidence is High for repository topology
and explicit absence, Medium for static production-mode checks, and Low for every deployed, radio,
device, provider, field, recovery, or capacity outcome. Dashboard & UX R6 may consume this report.
