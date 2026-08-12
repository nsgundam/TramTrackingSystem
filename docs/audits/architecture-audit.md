# Architecture Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Accepted T14 application baseline: `c72feb90e7a35da45d82bac61eb927ab7c55a37c`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/audits/product-audit.md`,
  `shuttle-tracking-backend/src/`, `shuttle-tracking-backend/prisma/`,
  `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`, `shuttle-tracking-web/hooks/`,
  `docker-compose.yml`, `docker-compose.prod.yml`, `.github/workflows/`, and the T11/T13/T15/D-012
  records cited below
- Reviewed at: `2026-08-12T23:15:48+07:00`
- Validation state: **Validated for T14 Research R3**
- Predecessor baselines: `docs/project-knowledge-base.md` (R1) and
  `docs/audits/product-audit.md` (R2), each validated over
  `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`
- Owner-decision overlay: current Plan v1/S14/OSM owner directions are authority, not source evidence
  at `531ec9e`.
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
| One browser transport/listener implementation was duplicated | Resolved by accepted T14 outcome | Preserve regression tests; repair under the accepted identity if it regresses |
| Consumer-specific canonical decoding remains separate | Intentional boundary | Remove C16 unless a concrete policy drift/defect is measured |
| Page-local Admin resource mutation ownership remains | Intentional after shared semantic feedback | Remove C06; no harmful duplication is evidenced |
| Redis current version/live state has no durable replay after loss | Still present | T13/later architecture and operations work, not T14 |
| Protected history, timeout exception, sender claim/recovery data flow is absent | Still present | T11 cross-repository work |
| Research comparison UI/data contract is incomplete | Still present | T15 after physical/provider gates |
| General account/session/source/deletion/backup lifecycle is absent | Still present | D-012/later Roadmap work |
| Realtime rooms/replay/backpressure/load behavior | Unable to verify | External/load evidence under T13/T15, not T14 source by default |
| Timestamp rendering policy is not centralized | Policy approved | T14-S16 bounded shared formatter after S15 acceptance |
| OSM URL/attribution literals are duplicated across Public/Admin | Still present; owner cancelled S12 | Removed from T14; provider/basemap removal or compliance is a later separate decision before production |
| External image/font assets bypass a repository-owned asset boundary | Still present | Bounded Maintenance unless a product-visible change requires Public authority |

## 3. Newly changed database boundary

The committed `20260801110000_feedback_triage_roles` migration adds a constraint accepting only
`ADMIN`, `DEV`, and `SUPER_ADMIN` before converting legacy `OPERATOR` rows. On a database containing
an `OPERATOR`, PostgreSQL can reject the new constraint before the conversion executes. Unexpected
historical roles also no longer remain available for the documented application-level fail-closed
path; they can stop the migration instead.

This is a high-severity migration-ordering defect and a Production Readiness stop condition. It is
not T14 and is authorized as `M-20260812-02`; its applied-history answer determines whether the safe
source form is an existing-file repair or a forward migration. No target execution is authorized,
and no target was queried or migrated during research, so affected-row count is unknown.

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
