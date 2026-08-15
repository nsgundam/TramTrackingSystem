# Database Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Evidence scope: `shuttle-tracking-backend/prisma/schema.prisma`,
  `shuttle-tracking-backend/prisma/migrations/`, data-owning backend services/tests,
  `docs/research/`, `docs/decision-queue.md`, the R1–R3 predecessor reports named below, and
  `docs/tasks/M-20260812-02-admin-role-migration-safety.md`
- Reviewed at: `2026-08-13T21:51:09+07:00`
- Validation state: **Validated**
- Re-audit purpose: M-20260812-02 Database acceptance over source `71f2002` and completion evidence
  `9323afc`.
- Predecessor baselines: `docs/project-knowledge-base.md` (R1),
  `docs/audits/product-audit.md` (R2), and `docs/audits/architecture-audit.md` (R3), each validated
  over `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Owner-decision overlay: M-02 consumes only the 2026-08-13 migration source-form authority at
  `71f2002`; local/shared/staging target facts remain unknown and ADMIN read-only access remains
  unimplemented. Accepted T14 application behavior remains `5955b7a`.

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

## 2. Resolved source defect; rollout gate remains

| Finding | State | Evidence / placement |
|---|---|---|
| Role migration ordering and atomicity | Resolved | Source `71f2002` has one explicit transaction ordering drop → `OPERATOR` conversion → `ADMIN` default → validated final allowlist → unchanged Feedback DDL → commit. The exact normalized SQL sequence and role fixtures pass. |
| Target history, executed upgrade/rollback, live final constraint/default, and affected rows | Unable to Verify | Requires explicit target authority and disposable PostgreSQL upgrade/rollback evidence before execution. |

Unknown roles remain unmapped and would fail the final validated check, aborting the explicit
transaction by PostgreSQL semantics. This is static/source evidence only; no database target was
queried, migrated, or rolled back. The former High source blocker is closed, while the distinct
rollout gate and other release blockers preserve Production No-Go.

## 3. Remaining database findings

| Finding | State | Placement |
|---|---|---|
| One active Trip and status/time integrity | Resolved | Current lifecycle invariant; T11 must extend, not bypass, it |
| Effective-dated source/vehicle assignment provenance | Partially Resolved | T11/D-012 or later operational-history design |
| Raw research retention | Partially Resolved | T13/T15 runtime scheduling, volume, export, backup evidence |
| `GPSTrack` treated as raw/high-fidelity evidence | Still Present | Claim remains unsafe; preserve sampled-canonical label and let T11/T15 decide any new history product |
| Feedback migration/retention/purge/restore | Partially Resolved | T12 rollout/external evidence |
| T11 receipt-time, close-reason, installation/claim, force-close audit durability | Still Present | Absent; T11 |
| D-012 account/source/deletion/backup/recovery durability | Still Present | Absent; separate later Roadmap work |
| Production database/Redis placement, query plans, rollback, backup/restore | Unable to Verify | T9/T13 external acceptance |

## 4. T14 relevance and gate

No approved T14 frontend outcome requires a schema migration. Optional/general Feedback association
is Moved outside T14 because it would change Product/Data contracts. The approved timestamp display
policy must not mutate stored semantics. M-02 resolves the static migration blocker without becoming
a T14 slice; target execution/rollback evidence remains required before production/readiness claims.

## 5. Confidence and handoff

Confidence is High for schema/migration-visible facts and the repaired static contract; Medium for
unit/CI evidence; and Low for target history/data, executed rollback, retention, query plans,
backup/restore, and production volume. Infrastructure & Device R5 may consume the completed R4 set
after Frontend is validated. No stateful target was operated.
