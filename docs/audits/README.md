# Audit Register

Last updated: 2026-08-13

Immutable T14 research baseline: `0d985d8948624cb2134a937ce57f071b53bb1852`

Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`

Current coordinated evidence baseline: `0cb7dcc691527b7b7b0e2a238f3ecb329dac93f3`

Owner-decision overlay: the user's 2026-08-12 Plan v1/S14/OSM directions and 2026-08-13 facts that
the migration source change exists only on this Git branch, the migration has never run on
production, and `ADMIN` receives active Feedback read-only access are recorded in
`docs/decision-queue.md`. They are owner authority, not implemented behavior at `0cb7dcc`.

Latest T14 acceptance: `T14-S15` at source
`5955b7aa2a84cc52cc536cc6509219a2adcb577c`, completion `caf913d`, and ordered Level 1 re-audit
`c2dbe98`; final acceptance synchronization is this coordination record.

| Stage / profile | Status | Current result |
|---|---|---|
| R0 Baseline | Complete | Immutable research HEAD `0d985d8`, then-current dirty exclusions, accepted T14 ancestry, and profile freshness recorded. |
| R1 Discovery | Validated @ `0cb7dcc` + owner facts | Current inventory, accepted S15/Admin entry, Git-branch migration source-form gate, approved-but-unimplemented ADMIN read-only policy, and remaining evidence limits are explicit. |
| R2 Product | Validated @ `5955b7a` | S15's bounded mutation progress, failure/retry, and completion behavior is accepted for local evidence. |
| R3 Architecture | Validated @ `531ec9e` source + owner facts | Current data/authority boundaries remain appropriate; selected migration source form and future ADMIN policy remain separate Maintenance. |
| R4 Backend | Validated @ `531ec9e` source + owner facts | No remaining T14 outcome needs API/auth/backend work; migration safety and ADMIN read-only access are bounded Maintenance. |
| R4 Frontend | Validated @ `5955b7a` | S15's five-path guards, safe feedback, receipts, focus, detector, build, and regressions pass. |
| R4 Database | Validated @ `531ec9e` + owner facts — High blocker | Role constraint precedes supported legacy `OPERATOR` conversion; the Git-branch source may be repaired in place because production never ran it, while all other target history remains unknown and no execution is authorized. |
| R5 Infrastructure & Device | Validated @ `531ec9e` | Deployment, Mobile/ESP32/TTN/provider/field facts remain external evidence. |
| R6 Dashboard & UX | Validated @ `5955b7a` | Named busy/failure/success semantics, scoped locking, focus, 44 px, and 390 px evidence pass. |
| R7 Security/DevOps/Observability | Validated @ `531ec9e` | Mobile credential, migration, durable observability, CI breadth, and external operations gates preserved. |
| R8 Production Readiness | Validated @ `5955b7a` / No-Go unchanged | Local/synthetic S15 evidence does not alter external release gates. |
| R9 Finding normalization | Complete | C01–C16, S12/S14, prior scores, task residuals, new findings, and external unknowns mapped exactly once. |
| R10 Plan synthesis | Complete / owner approved | S12 is Removed, S14 Moved, and S15–S17 are approved in dependency order with separate safety/Roadmap/evidence lanes. |
| Roadmap | S15 Accepted / Maintenance next | S15's H/S/C/R chain is complete. Execute migration safety, then ADMIN read-only Feedback, then S16 because the latter pair overlap Feedback source/tests; S17 follows S16. |

Approved Plan v1 package:
[`T14-research-and-execution-plan.md`](../roadmap/T14-research-and-execution-plan.md).
Canonical accepted/removed/moved/approved history:
[`T14-scope-and-closure-ledger.md`](../roadmap/T14-scope-and-closure-ledger.md).

`M-20260812-01` is accepted at handoff `92aedef` and source `cdd69f8`. Its `/admin` redirect and
browser/configuration delta remain Maintenance, not accepted T14 source. Other dirty coordination
documents are Level 1 research synchronization or owner-decision outputs, not application evidence.
No audit promotes source, isolated browser, simulator, or static topology evidence into human,
assistive-technology, physical-device, provider, deployed, or production acceptance.
