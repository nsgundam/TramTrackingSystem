# Audit Register

Last updated: 2026-08-13

Immutable T14 research baseline: `0d985d8948624cb2134a937ce57f071b53bb1852`

Accepted T14 application baseline: `5955b7aa2a84cc52cc536cc6509219a2adcb577c`

Current coordinated evidence baseline: `387ea597c3b5c92fb2c70bb859b5222ac5519f98`

Owner-decision overlay: the user's 2026-08-12 Plan v1/S14/OSM directions and 2026-08-13 facts that
the migration source change exists only on this Git branch, the migration has never run on
production, and `ADMIN` receives active Feedback read-only access are recorded in
`docs/decision-queue.md`. They are owner authority, not implemented behavior at `387ea59`.

Latest T14 acceptance: `T14-S15` at source
`5955b7aa2a84cc52cc536cc6509219a2adcb577c`, completion `caf913d`, and ordered Level 1 re-audit
`c2dbe98`; final acceptance synchronization is this coordination record.

Latest unaccepted Maintenance source: `M-20260812-02` at
`71f20028f12ae4b04a8005ab3d7d71cd3b0cefa0`; exact-path source and full CI pass, but affected
Level 1 profiles and Roadmap require ordered re-audit before acceptance.

| Stage / profile | Status | Current result |
|---|---|---|
| R0 Baseline | Complete | Immutable research HEAD `0d985d8`, then-current dirty exclusions, accepted T14 ancestry, and profile freshness recorded. |
| R1 Discovery | Needs Re-audit @ `71f2002` | M-20260812-02 changes committed migration/test inventory and must replace the prior High-blocker snapshot without claiming target execution. |
| R2 Product | Validated @ `5955b7a` | S15's bounded mutation progress, failure/retry, and completion behavior is accepted for local evidence. |
| R3 Architecture | Needs Re-audit @ `71f2002` | Atomic migration ordering must be checked against the unchanged runtime/data boundary and target gates. |
| R4 Backend | Needs Re-audit @ `71f2002` | The migration/test delta requires bounded backend-boundary acceptance; runtime routes are unchanged. |
| R4 Frontend | Validated @ `5955b7a` | S15's five-path guards, safe feedback, receipts, focus, detector, build, and regressions pass. |
| R4 Database | Needs Re-audit @ `71f2002` | Static ordering/atomicity repair is source-complete; target history, execution, upgrade/rollback, and affected rows remain unverified. |
| R5 Infrastructure & Device | Validated @ `531ec9e` | Deployment, Mobile/ESP32/TTN/provider/field facts remain external evidence. |
| R6 Dashboard & UX | Validated @ `5955b7a` | Named busy/failure/success semantics, scoped locking, focus, 44 px, and 390 px evidence pass. |
| R7 Security/DevOps/Observability | Needs Re-audit @ `71f2002` | Least-privilege mapping/fail-closed source and CI evidence changed; rollout/operations gates remain. |
| R8 Production Readiness | Needs Re-audit @ `71f2002` / No-Go unchanged | Static atomicity repair changes one blocker but supplies no target migration/rollback evidence. |
| R9 Finding normalization | Complete | C01–C16, S12/S14, prior scores, task residuals, new findings, and external unknowns mapped exactly once. |
| R10 Plan synthesis | Complete / owner approved | S12 is Removed, S14 Moved, and S15–S17 are approved in dependency order with separate safety/Roadmap/evidence lanes. |
| Roadmap | Needs Re-audit — M-20260812-02 Source Complete | Re-audit the Maintenance evidence in predecessor order; after acceptance, execute ADMIN read-only Feedback, then S16 and S17. |

Approved Plan v1 package:
[`T14-research-and-execution-plan.md`](../roadmap/T14-research-and-execution-plan.md).
Canonical accepted/removed/moved/approved history:
[`T14-scope-and-closure-ledger.md`](../roadmap/T14-scope-and-closure-ledger.md).

`M-20260812-01` is accepted at handoff `92aedef` and source `cdd69f8`. Its `/admin` redirect and
browser/configuration delta remain Maintenance, not accepted T14 source. Other dirty coordination
documents are Level 1 research synchronization or owner-decision outputs, not application evidence.
No audit promotes source, isolated browser, simulator, or static topology evidence into human,
assistive-technology, physical-device, provider, deployed, or production acceptance.
