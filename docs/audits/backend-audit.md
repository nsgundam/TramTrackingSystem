# Backend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Evidence scope: `shuttle-tracking-backend/src/`, `shuttle-tracking-backend/prisma/`,
  `shuttle-tracking-backend/tests/`, `shuttle-tracking-backend/package.json`,
  `shuttle-tracking-backend/tsconfig.json`, `scripts/ci-checks.sh`, `docs/decision-queue.md`, and the
  R1–R3 predecessor reports named below plus
  `docs/tasks/M-20260812-02-admin-role-migration-safety.md`
- Reviewed at: `2026-08-13T21:51:09+07:00`
- Validation state: **Validated**
- Re-audit purpose: M-20260812-02 Backend acceptance over source `71f2002` and completion evidence
  `9323afc`.
- Predecessor baselines: `docs/project-knowledge-base.md` (R1),
  `docs/audits/product-audit.md` (R2), and `docs/audits/architecture-audit.md` (R3), each validated
  over `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Owner-decision overlay: M-02 consumes only the 2026-08-13 migration source-form authority at
  `71f2002`; local/shared/staging target facts remain unknown and ADMIN read-only access remains
  unimplemented. Accepted T14 application behavior remains `5955b7a`.
- Evidence note: no backend runtime route/service changed; source `71f2002` changes the existing SQL
  migration and its deterministic boundary test only.

## 1. Current backend boundary

Mobile Socket.IO, authenticated sender HTTP, and authenticated TTN webhook ingestion remain distinct
trust boundaries feeding the shared observation/canonical service. Sender JWTs bind source,
vehicle, and credential version; Socket.IO writes revalidate that binding. Boundary parsing,
coordinate checks, acknowledgements, selected rate limits, redacted operational signals, and the
T7 research-only data path remain present.

The Operations service remains the authoritative transactional Trip lifecycle and sampled
canonical-history writer. T12 provides persisted Admin role checks, recent authentication for
sensitive Feedback actions, Feedback lifecycle APIs, and a safe read-only source-health DTO.

## 2. Current findings and placement

| Finding | State | Required placement |
|---|---|---|
| Sender write authentication and current source/vehicle/version binding | Resolved | Source/test evidence; preserve with no T14 work |
| TTN webhook authentication and documented-payload parsing | Resolved | Source/test evidence; provider duplicates/aliases/delivery remain external T15 evidence |
| Protected Trip history/detail, timeout exception, and recovery APIs | Still Present | T11 |
| Installation activation/claim/refresh/revocation and accepted-observation receipt-time lifecycle | Still Present | Coordinated T11 Backend/Mobile work |
| Timeout/no-reopen and audited force-close state machine | Still Present | T11 must extend Operations transaction/lock authority |
| Feedback triage and retention source | Partially Resolved | Source implemented; T12 runtime/external rollout acceptance remains |
| General account/session/source credential/deletion/backup lifecycle | Still Present | Policy approved but unimplemented; D-012/later Roadmap task |
| Legacy vehicle/route/stop write parsing and abuse controls are less consistent than newer routes | Still Present | Bounded Backend/Security Maintenance after exact measurement; not T14 |
| Redis live-state replay, distributed sweep/fan-out ownership, and load behavior | Unable to Verify | T13/later architecture/operations evidence |

## 3. Role-migration source repair and rollout gate

| Finding | State | Evidence / placement |
|---|---|---|
| Constraint-before-conversion and partial-commit source defect | Resolved | At `71f2002`; exact transaction is BEGIN → drop → `OPERATOR`-only update → `ADMIN` default → validated final allowlist → unchanged Feedback DDL → COMMIT; normalized deterministic test and recorded backend/full CI pass. |
| Per-target history and executed legacy upgrade/unknown-role rollback | Unable to Verify | No database target was queried or operated; target authority and disposable PostgreSQL evidence remain rollout/release gates. |

Only `OPERATOR` maps to `ADMIN`; `DEV` and `SUPER_ADMIN` remain unchanged, and unexpected roles are
not mapped or elevated. A final-constraint failure aborting the transaction is PostgreSQL source
semantics, not observed runtime rollback. This is no longer a Backend source blocker and does not
gate later local M-20260813-01/S16 work after ordered acceptance.

## 4. T14 relevance

No approved T14 outcome requires a backend API, authentication, schema, role, or canonical-state
change on current evidence. Public image resilience, narrow Admin mutation integrity, asset
localization, and timestamp presentation must preserve existing backend contracts. Owner-cancelled
OSM work is no longer a T14 candidate.
Any implementation that requires optional/general Feedback persistence, timestamp API semantics, provider
proxying, or new service-state causes is a scope change requiring Product/Architecture review rather
than an implicit frontend slice.

## 5. Evidence limits and confidence

Confidence is High for code-visible routes/services and the repaired SQL/test boundary, Medium for
deterministic CI, and Low for target history/execution/rollback, concurrency/load, Redis loss, TTN
delivery, deployed logs, Android runtime, and production operations. Frontend and Database R4 may
run in parallel on this same baseline; this report authorizes no source or target work.
