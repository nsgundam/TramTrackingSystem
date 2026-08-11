# Audit Register

Last updated: 2026-08-11

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | Full-SHA metadata is corrected to the valid `1eec866b...`; D-011/D-012 and pinned external Mobile source remain current, while Android/runtime/device facts remain unavailable. |
| Product | Needs Re-audit | `docs/audits/product-audit.md` | `70f42c1` | 2026-08-11 | Internal Public/Admin browser lifecycle ownership changed without a planned UI/product change; Level 1 must validate preservation before accepting the slice. |
| Architecture | Needs Re-audit | `docs/audits/architecture-audit.md` | `70f42c1` | 2026-08-11 | One shared browser transport owner replaced duplicated wiring; consumer authority and boundary claims require Level 1 revalidation. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Needs Re-audit | `docs/audits/frontend-audit.md` | `70f42c1` | 2026-08-11 | Focused lifecycle 4/4, bounded browser 16/16, full CI, and scoped detector `[]` pass; duplicated-lifecycle finding disposition remains Level 1-owned. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Needs Re-audit | `docs/audits/dashboard-ux-audit.md` | `70f42c1` | 2026-08-11 | No Admin/Public DOM, copy, layout, or theme path changed, but shared lifecycle evidence changed; score and human/AT/runtime limits await revalidation. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Needs Re-audit / No-Go | `docs/audits/production-readiness-audit.md` | `70f42c1` | 2026-08-11 | Local lifecycle source/browser/CI evidence changed; no human, AT, deployed, Mobile/device, operations, or release gate is satisfied. |
| Roadmap | Needs Re-audit | `docs/roadmap/master-refactoring-roadmap.md` | `70f42c1` | 2026-08-11 | First ten T14 slices remain accepted; lifecycle source is complete locally and the affected Level 1 chain must revalidate it before further source selection. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.

Metadata correction on 2026-08-11: the inherited invalid full spelling
`1eec86602c40c859d50dd9d369f636b103b6896f` was replaced in active Discovery/audit/Roadmap
metadata by the commit that short `1eec866` actually resolves to,
`1eec866b986b4cb4e802f7a48fac93e54e780699`. This changes provenance spelling only; the unaffected
source evidence and finding states are unchanged.
