# Security, DevOps & Observability Audit

Audit metadata:
- Evidence baseline: `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Accepted T14 application baseline: `c72feb90e7a35da45d82bac61eb927ab7c55a37c`
- Evidence scope: `shuttle-tracking-backend/src/`, `shuttle-tracking-backend/prisma/`,
  `shuttle-tracking-web/app/`, `shuttle-tracking-web/services/`, `docker-compose.yml`,
  `docker-compose.prod.yml`, `.github/workflows/`, `scripts/`, `docs/operations/`, and every R1–R6
  predecessor path named below
- Reviewed at: `2026-08-12T23:15:48+07:00`
- Validation state: **Validated for T14 Research R7 — migration blocker open**
- Predecessor baselines: `docs/project-knowledge-base.md`, `docs/audits/product-audit.md`,
  `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`,
  `docs/audits/frontend-audit.md`, `docs/audits/database-audit.md`,
  `docs/audits/infrastructure-device-audit.md`, and `docs/audits/dashboard-ux-audit.md`, each
  validated in order over `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Owner-decision overlay: current Plan v1/S14/OSM directions affect T14 disposition only, not
  security evidence.

## 1. Current controls

The repository has meaningful source/test controls: sender JWT binding and per-write revalidation,
required TTN bearer authentication, selected parsers/rate limits, persisted Admin role rechecks,
recent authentication for sensitive Feedback actions, redacted safe DTOs, bounded research access/
export, fail-closed production configuration, private-data-service Compose topology, allowlisted
operational signals, and deterministic CI/build/boundary checks.

Prior maintenance removed raw Socket.IO payload logging and unsafe simulator credential/output
defaults. These remain source/test results; deployed logs and historical external credential state
are unverified.

## 2. Current security and operations findings

| Finding | State | Placement |
|---|---|---|
| External Android app stores reusable Sender material in ordinary preferences with backup/cleartext enabled and no installation revocation contract | High, still present | Coordinated T11 Backend/Mobile blocker |
| Role migration installs the supported-role constraint before converting legacy `OPERATOR` | High, newly current | Database Maintenance and Production stop condition |
| Actual TLS/proxy hops/firewall/secret placement/private services | Unable to verify | T9 external acceptance / T13 |
| Feedback migration, IP clearing, purge, restore, backup, and multi-instance scheduling | Source exists; runtime unverified | T12 rollout / T13 evidence |
| Durable metrics/log sink, alert routing, on-call, incident and recovery drills | Still absent | T13 |
| Dependency, secret-history, SAST, container, live integration, migration, deployment, restore and promotion scanning/evidence | Partial CI only | T13/DevSecOps work |
| Legacy master-data write validation/rate limiting is less consistent than newer routes | Medium | Bounded Backend/Security Maintenance after an exact boundary measurement |
| Historical removed simulator credential validity/rotation | Unable to verify | Authorized external owner assessment before target use |
| Admin marker and Public icon font depend on third-party asset hosts | Medium dependency/privacy/licence exposure | Bounded asset Maintenance; local deterministic browser runs currently block these hosts |
| Consumer canonical validators differ intentionally in accepted optional source identity | No observed exploit/defect | Do not merge as cleanup; require a focused contract/security decision before any decoder refactor |

## 3. Approved T14 outcome security impact

| Approved outcome | Security/privacy impact | Required guard |
|---|---|---|
| Admin operational mutation integrity | Bounded positive reliability | Preserve server authorization, exact request bodies/status graph, one pending request, safe narrowed errors, and no content logging |
| Public stop-image resilience | Bounded external-content behavior | Do not introduce proxying, arbitrary HTML/URL logging, new image domains, tracking, or provider/storage policy |
| Admin timestamp contract | None if presentation-only | Treat inputs as untrusted strings, return a safe fallback, and never change server receipt/retention semantics |
| Removed S12 OSM work | No T14 implementation after the 2026-08-12 owner cancellation | Current provider/licence exposure remains a Production stop condition until runtime stops using the provider/basemap or a separately authorized compliant outcome exists |
| Moved S14 optional/general Feedback association | Material product/privacy/data change | No implementation in this batch; any later roadmap decision must preserve verified supplied IDs and avoid unnecessary identity/contact data |

External asset removal is desirable but is Maintenance rather than a reason to expand a T14 source
unit. A local asset must have documented provenance/licence or be code-native and repository-owned.

## 4. Observability and release limits

Current signals are allowlisted process stdout plus readiness checks; they are not durable metrics,
alerts, audit storage, or incident evidence. No accepted/rejected/duplicate trend, receive/process
latency series, persistence/backpressure alert, source recovery alert, dashboard/export failure
monitor, retention/access policy, or deployed routing is evidenced. Redis loss/restart and global
Socket.IO fan-out remain untested operational conditions.

Passing repository CI cannot close these findings: the normal checks do not start PostgreSQL,
Redis, the full application, a legacy-data migration, or a deployment target. No penetration test,
secret-history scan, provider action, credential rotation, target migration, restore, or incident
exercise occurred during research.

## 5. Confidence and handoff

Confidence is High for code-visible controls/gaps and the SQL ordering defect; Medium for static CI/
Compose evidence; and Low for deployed attack resistance, credentials, TLS/proxy, logs, backups,
providers, physical devices, and incidents. Production Readiness R8 may consume this report. The
migration blocker gates database rollout and release claims but not local S15–S17 source work;
external release gates remain binding, and this audit grants no source authority.
