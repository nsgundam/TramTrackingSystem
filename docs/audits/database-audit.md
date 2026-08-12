# Database Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Accepted T14 application baseline: `c72feb90e7a35da45d82bac61eb927ab7c55a37c`
- Evidence scope: `shuttle-tracking-backend/prisma/schema.prisma`,
  `shuttle-tracking-backend/prisma/migrations/`, data-owning backend services/tests,
  `docs/research/`, and the R1–R3 predecessor reports named below
- Reviewed at: `2026-08-12T23:15:48+07:00`
- Validation state: **Validated for T14 Research R4 — High non-T14 blocker open**
- Predecessor baselines: `docs/project-knowledge-base.md` (R1),
  `docs/audits/product-audit.md` (R2), and `docs/audits/architecture-audit.md` (R3), each validated
  over `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Owner-decision overlay: current Plan v1/S14/OSM directions affect placement only and change no
  data evidence.

## 1. Current durable data products

| Product | Durable authority | Current limitation |
|---|---|---|
| Master data and ordered RouteStop | PostgreSQL | Runtime cache/database publication proof is external |
| Trip and sampled canonical `GPSTrack` | PostgreSQL/PostGIS via Operations | Not raw/event-complete history; no T11 timeout/recovery fields |
| Latest/canonical live state | Redis only | Transient, no durable current-state replay |
| Bounded research observations/aggregates | T7 PostgreSQL tables/services | Scheduled/runtime retention and representative-volume query evidence absent |
| Feedback lifecycle and content-free audit | PostgreSQL | Target migration, purge, backup, and multi-instance scheduling unverified |

T7 research facts remain separated from Public canonical state and sampled operational history.
TrackingSource has current assignment and credential facts but no effective-dated assignment history
for later operational explanation. D-012 general lifecycle structures and T11 installation/claim/
timeout/recovery structures are not present.

## 2. High-severity migration ordering defect

The current `20260801110000_feedback_triage_roles` migration executes in this order:

1. drop the old role constraint;
2. add a new constraint allowing only `ADMIN`, `DEV`, and `SUPER_ADMIN`;
3. update legacy `OPERATOR` rows to `ADMIN`.

PostgreSQL validates an added check constraint against existing rows. Consequently, step 2 can fail
whenever legacy `OPERATOR` data exists, preventing step 3. Any unexpected historical role can also
stop the migration, contradicting the migration comment and prior audit statement that such a value
would remain for application-level fail-closed handling.

Current coverage is insufficient: `test_t12_feedback_identity.js` matches the later `UPDATE` text but
does not assert ordering or execute a migration against legacy rows. `prisma validate`, builds, and
the repository's ordinary CI do not prove the upgrade.

Disposition: **Authorized Maintenance M-20260812-02, High, release blocker**. The applied-history
answer is required before choosing between editing the existing migration and a forward corrective
migration. Rollout still requires an approved disposable target or deterministic PostgreSQL fixture;
no migration execution is authorized.

## 3. Remaining database findings

| Finding | State | Placement |
|---|---|---|
| One active Trip and status/time integrity | Resolved for current lifecycle | T11 must extend, not bypass, these invariants |
| Effective-dated source/vehicle assignment provenance | Partial | T11/D-012 or later operational-history design |
| Raw research retention | Implemented in bounded source form | T13/T15 runtime scheduling, volume, export, backup evidence |
| `GPSTrack` treated as raw/high-fidelity evidence | Still unsafe as a claim | Preserve sampled-canonical label; T11/T15 decide any new history product |
| Feedback migration/retention/purge/restore | Source exists; runtime unverified | T12 rollout/external evidence |
| T11 receipt-time, close-reason, installation/claim, force-close audit durability | Absent | T11 |
| D-012 account/source/deletion/backup/recovery durability | Absent | Separate later Roadmap work |
| Production database/Redis placement, query plans, rollback, backup/restore | Unable to verify | T9/T13 external acceptance |

## 4. T14 relevance and gate

No approved T14 frontend outcome requires a schema migration. Optional/general Feedback association
is Moved outside T14 because it would change Product/Data contracts. The approved timestamp display
policy must not mutate stored semantics. The migration blocker must be resolved before any
production/readiness claim but does not become a T14 slice.

## 5. Confidence and handoff

Confidence is High for schema/migration-visible facts and the constraint-order diagnosis; Medium for
unit/contract evidence; and Low for target data, rollback, retention execution, query plans,
backup/restore, and production volume. Infrastructure & Device R5 may consume the completed R4 set
after Frontend is validated. No stateful target was operated.
