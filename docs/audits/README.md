# Audit Register

Last updated: 2026-08-12

Immutable T14 research baseline: `0d985d8948624cb2134a937ce57f071b53bb1852`

Accepted T14 application baseline: `c72feb90e7a35da45d82bac61eb927ab7c55a37c`

Current coordinated evidence baseline: `531ec9e31d7325ccc2b617c394f71d8ebdcacb69`

Owner-decision overlay: the user's 2026-08-12 Plan v1 approval, S14 move, migration authorization,
and Frontend-team OSM assignment are recorded in the current `docs/decision-queue.md`
synchronization. They are owner authority, not source behavior at `531ec9e`.

| Stage / profile | Status | Current result |
|---|---|---|
| R0 Baseline | Complete | Immutable research HEAD `0d985d8`, then-current dirty exclusions, accepted T14 ancestry, and profile freshness recorded. |
| R1 Discovery | Validated @ `531ec9e` | Current inventory plus accepted Admin entry, High role-migration blocker, and credential-document mismatch. |
| R2 Product | Validated @ `531ec9e` | T14 outcomes separated from T11/T15/D-012/Maintenance/external evidence. |
| R3 Architecture | Validated @ `531ec9e` | Current data/authority boundaries remain appropriate; generic refactors rejected without defects. |
| R4 Backend | Validated @ `531ec9e` | No approved T14 outcome needs API/auth/backend work; T11 and bounded Security Maintenance remain. |
| R4 Frontend | Validated @ `531ec9e` | `M-20260812-01` Admin entry accepted; exact T14 residual locations, gates, and overlap remain current. |
| R4 Database | Validated @ `531ec9e` — High blocker | Role constraint precedes supported legacy `OPERATOR` conversion; authorized repair awaits migration-history fact. |
| R5 Infrastructure & Device | Validated @ `531ec9e` | Deployment, Mobile/ESP32/TTN/provider/field facts remain external evidence. |
| R6 Dashboard & UX | Validated @ `531ec9e` | Admin entry journey accepted; 15/20 remains normalized into approved bounded outcomes and other owners. |
| R7 Security/DevOps/Observability | Validated @ `531ec9e` | Mobile credential, migration, durable observability, CI breadth, and external operations gates preserved. |
| R8 Production Readiness | Validated @ `531ec9e` / No-Go | Local demo Conditional; field trial, internal operations, and public service No-Go. |
| R9 Finding normalization | Complete | C01–C16, S12/S14, prior scores, task residuals, new findings, and external unknowns mapped exactly once. |
| R10 Plan synthesis | Complete / owner approved | S12 is Removed, S14 Moved, and S15–S17 are approved in dependency order with separate safety/Roadmap/evidence lanes. |
| Roadmap | Plan v1 approved / exact handoff next | One unit may run at a time after its committed Level 3 task; owner approval alone is not source authority. |

Approved Plan v1 package:
[`T14-research-and-execution-plan.md`](../roadmap/T14-research-and-execution-plan.md).
Canonical accepted/removed/moved/approved history:
[`T14-scope-and-closure-ledger.md`](../roadmap/T14-scope-and-closure-ledger.md).

`M-20260812-01` is accepted at handoff `92aedef` and source `cdd69f8`. Its `/admin` redirect and
browser/configuration delta remain Maintenance, not accepted T14 source. Other dirty coordination
documents are Level 1 research synchronization or owner-decision outputs, not application evidence.
No audit promotes source, isolated browser, simulator, or static topology evidence into human,
assistive-technology, physical-device, provider, deployed, or production acceptance.
