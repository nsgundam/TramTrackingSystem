# Audit Register

Last updated: 2026-08-12

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | Full-SHA metadata is corrected to the valid `1eec866b...`; D-011/D-012 and pinned external Mobile source remain current, while Android/runtime/device facts remain unavailable. |
| Product | Complete / Validated | `docs/audits/product-audit.md` | evidence `9ff7e85`; app `c72feb9` | 2026-08-12 | S13 is accepted at `a528054`; the false-denial subcase is Resolved without changing Public/Login/request boundaries. |
| Architecture | Complete / Validated | `docs/audits/architecture-audit.md` | evidence `9ff7e85`; app `c72feb9` | 2026-08-12 | Existing auth/server authority is preserved and no privileged Feedback read begins before a resolved privileged role. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Complete / Validated | `docs/audits/frontend-audit.md` | evidence `9ff7e85`; app `c72feb9` | 2026-08-12 | S13 evidence passes; accepted IDs are `S01–S11 + S13`, with Public identity and Login behavior preserved. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Complete / Validated | `docs/audits/dashboard-ux-audit.md` | evidence `9ff7e85`; app `c72feb9` | 2026-08-12 | S13 removes one transient false denial; score remains 15/20 and broad role/live-region/human/AT/runtime limits remain. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Complete / Validated / No-Go | `docs/audits/production-readiness-audit.md` | evidence `9ff7e85`; app `c72feb9` | 2026-08-12 | S13 changes no human, AT, deployed, Mobile/device, operations, stage, or release gate. |
| Roadmap | Plan / Research | `docs/roadmap/master-refactoring-roadmap.md` | evidence `9ff7e85`; app `c72feb9` | 2026-08-12 | The [T14 research plan](../roadmap/T14-research-and-execution-plan.md) requires a complete predecessor-ordered audit, deduplicated finding register, and whole-plan owner review before another T14 source slice. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.

Metadata correction on 2026-08-11: the inherited invalid full spelling
`1eec86602c40c859d50dd9d369f636b103b6896f` was replaced in active Discovery/audit/Roadmap
metadata by the commit that short `1eec866` actually resolves to,
`1eec866b986b4cb4e802f7a48fac93e54e780699`. This changes provenance spelling only; the unaffected
source evidence and finding states are unchanged.
