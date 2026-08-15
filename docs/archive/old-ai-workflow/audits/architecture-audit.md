# Architecture Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/product-audit.md`,
  `docs/decision-queue.md`,
  `docs/tasks/M-20260812-02-admin-role-migration-safety.md`,
  `shuttle-tracking-backend/src/`, `shuttle-tracking-backend/prisma/`,
  `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`, `shuttle-tracking-web/hooks/`,
  `docker-compose.yml`, `docker-compose.prod.yml`, `.github/workflows/`, and the T11/T13/T15/D-012
  records cited below
- Reviewed at: `2026-08-13T21:51:09+07:00`
- Validation state: **Validated**
- Re-audit purpose: M-20260812-02 Architecture acceptance over source `71f2002` and completion
  evidence `9323afc`.
- Predecessor baselines: `docs/project-knowledge-base.md` (R1) and
  `docs/audits/product-audit.md` (R2), each validated over
  `9323afce3d2085eadb9b736eca4a121a9a91c4db`
- Owner-decision overlay: M-02 consumes only the 2026-08-13 migration source-form authority at
  `71f2002`; local/shared/staging target facts remain unknown and ADMIN read-only access remains
  unimplemented. Accepted T14 application behavior remains `5955b7a`.
- Separate Maintenance: the accepted `M-20260812-01` redirect/test-cache delta remains outside T14
  and changes no architecture boundary below.

## 1. Current architecture

The existing modular monolith remains appropriate. Express/Socket.IO owns public, Admin, sender,
and TTN boundaries; PostgreSQL/PostGIS owns durable operational and research records; Redis owns
transient current state, caching, throttling, and fan-out. Mobile/Socket.IO, ESP32 HTTP, and
LoRaWAN/TTN webhook acquisition remain distinct trust boundaries that converge on one normalized
canonical-selection path.

The system correctly separates four data products:

| Data product | Authority | Constraint |
|---|---|---|
| Latest per-source observation | Redis source snapshot | Transient; not research/history truth |
| Versioned canonical live vehicle state | Redis canonical envelope | Public/Admin projection only; server receive time drives freshness |
| Sampled canonical Trip history | PostgreSQL/PostGIS `GPSTrack` through Operations | Not raw replay or event-complete history |
| Bounded raw research records/aggregates | T7 PostgreSQL research schema/services | Authenticated research only; never Public state |

T14's shared browser Socket.IO implementation owns transport/listener mechanics only. Public and
Admin intentionally retain separate validation, canonical reconciliation, hydration, expiry, map,
and UI policy. Combining those consumers into one global decoder/store would widen failure impact
and is not supported by a measured defect.

Similarly, the accepted shared Admin mutation feedback/confirmation boundary intentionally leaves
endpoint, DTO, request, target, refresh, and pending-state authority in each resource page. A new
generic mutation state machine is not justified by current evidence.

## 2. Current architecture findings

| Finding | State | Placement |
|---|---|---|
| One browser transport/listener implementation was duplicated | Resolved | Accepted T14 outcome; preserve regression tests and repair under the accepted identity if it regresses |
| Consumer-specific canonical decoding remains separate | No Longer Relevant | Intentional boundary; remove C16 unless a concrete policy drift/defect is measured |
| Page-local Admin resource mutation ownership remains | No Longer Relevant | Intentional after shared semantic feedback; remove C06 because no harmful duplication is evidenced |
| Redis current version/live state has no durable replay after loss | Still Present | T13/later architecture and operations work, not T14 |
| Protected history, timeout exception, sender claim/recovery data flow is absent | Still Present | T11 cross-repository work |
| Research comparison UI/data contract is incomplete | Still Present | T15 after physical/provider gates |
| General account/session/source/deletion/backup lifecycle is absent | Still Present | D-012/later Roadmap work |
| Realtime rooms/replay/backpressure/load behavior | Unable to Verify | External/load evidence under T13/T15, not T14 source by default |
| Timestamp rendering policy is not centralized | Still Present | Policy is approved; T14-S16 owns the bounded shared formatter after S15 acceptance |
| OSM URL/attribution literals are duplicated across Public/Admin | Still Present | Owner cancelled S12; removed from T14, with provider/basemap removal or compliance left as a separate pre-production decision |
| External image/font assets bypass a repository-owned asset boundary | Still Present | Bounded Maintenance unless a product-visible change requires Public authority |

## 3. Role-migration source repair and target boundary

`M-20260812-02` resolves the repository source defect at `71f2002`. The existing migration now has
one explicit `BEGIN`/`COMMIT` boundary and the exact order drop predecessor constraint → convert only
`OPERATOR` to `ADMIN` → set the `ADMIN` default → install the validated
`ADMIN`/`DEV`/`SUPER_ADMIN` constraint → preserve all Feedback DDL → commit. Unknown roles remain
unmapped and statically make the final constraint abort the transaction.

| Finding | State | Placement |
|---|---|---|
| Constraint-before-conversion and partial-commit source defect | Resolved | At `71f2002`; preserve the exact normalized SQL/test contract under M-02 |
| Target history, executed upgrade/rollback, live final default/constraint, affected rows | Unable to Verify | Explicit target authority plus disposable PostgreSQL evidence before execution/release |

The modular-monolith, runtime owner, API, schema shape, and role-policy boundaries are unchanged.
The rollback conclusion is PostgreSQL source semantics, not observed target behavior. No database
was queried or migrated, and later ADMIN read-only access remains separate Maintenance.

## 4. Dependency and authority rules

- T11 must extend the existing Operations transaction/locking order for receipt-time
  `lastAcceptedAt`, timeout/no-reopen, normal end, and audited force-close. It must coordinate the
  versioned Mobile contract rather than add controller-side lifecycle writers.
- T13 must define degraded live-state and recovery behavior, durable observability, approved-target
  migration/rollback/restore, and actual topology evidence before production claims.
- T15 owns the Research Dashboard, physical comparison, scale triggers, and provider/device facts.
- D-012 constrains a later account/source/deletion/recovery implementation and must not be hidden
  inside T11, T12, or T14.
- Public-visible S17 fallback authority is approved within its exact contract. Provider/licence
  changes remain outside this batch under the Frontend team; they are not refactors.

## 5. Confidence and handoff

Confidence is High for repository-visible ownership, data-product separation, accepted T14
boundaries, and the SQL ordering diagnosis; Medium for deterministic test behavior; and Low for
distributed recovery, load, deployed topology, Mobile runtime, devices, and provider behavior.
Backend, Frontend, and Database R4 may consume this report on the same immutable baseline. R3 does
not select a work unit or authorize source.
