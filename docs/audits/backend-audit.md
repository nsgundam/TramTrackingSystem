# Backend Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Evidence scope: `shuttle-tracking-backend/src/`, `shuttle-tracking-backend/prisma/`,
  `shuttle-tracking-backend/tests/`, `shuttle-tracking-backend/package.json`,
  `shuttle-tracking-backend/tsconfig.json`, `scripts/ci-checks.sh`, `docs/decision-queue.md`, and the
  R1–R3 predecessor reports named below
- Reviewed at: `2026-08-13T19:23:32+07:00`
- Validation state: **Validated for T14 Research R4**
- Predecessor baselines: `docs/project-knowledge-base.md` (R1) coordinated at `0cb7dcc` plus the
  2026-08-13 owner facts, `docs/audits/product-audit.md` (R2) validated at `5955b7a`, and
  `docs/audits/architecture-audit.md` (R3) retaining source evidence at `531ec9e`; S15 and the owner
  facts change no Backend boundary
- Owner-decision overlay: current Plan v1/S14/OSM directions plus the 2026-08-13 migration-source and
  ADMIN read-only decisions affect placement only, not backend baseline facts; S15 changes no
  backend boundary.
- Evidence note: no backend runtime source changed after the prior validated backend baseline; one
  committed SQL migration changed and is assessed at the backend/data boundary below.

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
| Sender write authentication and current source/vehicle/version binding | Resolved in source/test | Preserve; no T14 work |
| TTN webhook authentication and documented-payload parsing | Resolved in source/test | Provider duplicates/aliases/delivery remain external T15 evidence |
| Protected Trip history/detail, timeout exception, and recovery APIs | Still absent | T11 |
| Installation activation/claim/refresh/revocation and accepted-observation receipt-time lifecycle | Still absent | Coordinated T11 Backend/Mobile work |
| Timeout/no-reopen and audited force-close state machine | Still absent | T11 must extend Operations transaction/lock authority |
| Feedback triage and retention source | Implemented; rollout unverified | T12 runtime/external acceptance, not T14 |
| General account/session/source credential/deletion/backup lifecycle | Policy approved, unimplemented | D-012/later Roadmap task |
| Legacy vehicle/route/stop write parsing and abuse controls are less consistent than newer routes | Still present | Bounded Backend/Security Maintenance after exact measurement; not T14 |
| Redis live-state replay, distributed sweep/fan-out ownership, and load behavior | Unable to verify | T13/later architecture/operations evidence |

## 3. Role-migration boundary blocker

`20260801110000_feedback_triage_roles/migration.sql` now adds the three-role check constraint before
updating legacy `OPERATOR` values. A database with an existing `OPERATOR` may reject the constraint
and stop before conversion. The static T12 identity test checks only that the `UPDATE` statement is
present; normal TypeScript/Prisma/build checks do not execute upgrade order against legacy rows.

This is High severity, outside T14, and is authorized as bounded Database Maintenance
`M-20260812-02`. The owner-selected source form is an in-place repair of this Git branch's existing
migration because the source change exists only here and the migration never ran on production.
Unknown local/shared/staging history remains a per-target gate; before any execution, an authorized
disposable migration fixture must cover legacy `OPERATOR`, supported privileged roles, unexpected
roles, rollback/stop behavior, and final constraint/default state. No target migration is authorized
or claimed here.

## 4. T14 relevance

No approved T14 outcome requires a backend API, authentication, schema, role, or canonical-state
change on current evidence. Public image resilience, narrow Admin mutation integrity, asset
localization, and timestamp presentation must preserve existing backend contracts. Owner-cancelled
OSM work is no longer a T14 candidate.
Any implementation that requires optional/general Feedback persistence, timestamp API semantics, provider
proxying, or new service-state causes is a scope change requiring Product/Architecture review rather
than an implicit frontend slice.

## 5. Evidence limits and confidence

Confidence is High for code-visible routes/services and missing T11/D-012 boundaries, Medium for
deterministic tests, and Low for concurrency/load, Redis loss, TTN delivery, deployed logs, target
migrations, Android runtime, and production operations. Frontend and Database R4 may run in parallel
on this same baseline; this report authorizes no source work.
