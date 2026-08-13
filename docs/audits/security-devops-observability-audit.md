# Security, DevOps & Observability Audit

Audit metadata:
- Evidence baseline: `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Evidence scope: `shuttle-tracking-backend/src/`, `shuttle-tracking-backend/prisma/`,
  `shuttle-tracking-web/app/`, `shuttle-tracking-web/services/`, `docker-compose.yml`,
  `docker-compose.prod.yml`, `.github/workflows/`, `scripts/`, `docs/operations/`,
  `docs/tasks/M-20260812-02-admin-role-migration-safety.md`, and every R1–R6 predecessor path named
  below
- Reviewed at: `2026-08-13T21:51:09+07:00`
- Validation state: **Validated**
- Re-audit purpose: M-20260812-02 Security/DevOps/Observability acceptance over source `71f2002`
  and completion evidence `9323afc`.
- Predecessor baselines: `docs/project-knowledge-base.md`, `docs/audits/product-audit.md`,
  `docs/audits/architecture-audit.md`, `docs/audits/backend-audit.md`,
  `docs/audits/frontend-audit.md`, `docs/audits/database-audit.md`,
  `docs/audits/infrastructure-device-audit.md`, and `docs/audits/dashboard-ux-audit.md`, each
  validated in order over `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Owner-decision overlay: M-02 consumes only the 2026-08-13 migration source-form authority at
  `71f2002`; local/shared/staging target facts remain unknown and ADMIN read-only access remains
  unimplemented. Accepted T14 application behavior remains `5955b7a`.

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
| External Android app stores reusable Sender material in ordinary preferences with backup/cleartext enabled and no installation revocation contract | Still Present | High; coordinated T11 Backend/Mobile blocker |
| Role migration least-privilege ordering/atomicity source defect | Resolved | At `71f2002`; only `OPERATOR` maps to `ADMIN`, privileged roles remain, unknown roles are not mapped/elevated, and deterministic tests freeze the exact atomic sequence |
| Target migration history and executed upgrade/rollback/default/constraint evidence | Unable to Verify | Production/rollout stop condition requiring target authority and disposable PostgreSQL evidence |
| Actual TLS/proxy hops/firewall/secret placement/private services | Unable to Verify | T9 external acceptance / T13 |
| Feedback migration, IP clearing, purge, restore, backup, and multi-instance scheduling | Partially Resolved | Source exists; runtime remains unverified under T12 rollout / T13 evidence |
| Durable metrics/log sink, alert routing, on-call, incident and recovery drills | Still Present | Absent; T13 |
| Dependency, secret-history, SAST, container, live integration, migration, deployment, restore and promotion scanning/evidence | Partially Resolved | Partial CI only; T13/DevSecOps work |
| Legacy master-data write validation/rate limiting is less consistent than newer routes | Still Present | Medium; bounded Backend/Security Maintenance after an exact boundary measurement |
| Historical removed simulator credential validity/rotation | Unable to Verify | Authorized external owner assessment before target use |
| Admin marker and Public icon font depend on third-party asset hosts | Still Present | Medium dependency/privacy/licence exposure; bounded asset Maintenance, with local deterministic browser runs currently blocking these hosts |
| Consumer canonical validators differ intentionally in accepted optional source identity | No Longer Relevant | No observed exploit/defect; do not merge as cleanup, and require a focused contract/security decision before any decoder refactor |

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

Repository CI now provides stronger static migration-sequence regression coverage, but it does not
start PostgreSQL, execute the legacy-data migration, or operate a deployment target. No penetration
test, secret-history scan, provider action, credential rotation, target migration/rollback, restore,
or incident exercise occurred.

## 5. Confidence and handoff

Confidence is High for code-visible controls and the repaired least-privilege SQL contract; Medium
for static CI/Compose evidence; and Low for target history/execution/rollback, deployed attack
resistance, credentials, TLS/proxy, logs, backups, providers, physical devices, and incidents.
Production Readiness R8 may consume this report. The target-evidence gate still blocks rollout and
release claims but not later local Maintenance/T14 source after ordered acceptance; this audit
grants no source or target authority.
