# Audit Register

Last updated: 2026-08-10

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | D-011/D-012 and pinned external Mobile source are current; Android runtime and external infrastructure/device facts remain unavailable. |
| Product | Needs Re-audit | `docs/audits/product-audit.md` | `4e609e3` | 2026-08-10 | Source Health/Feedback Admin journeys changed at `06e0291`; Mobile/T11 remain partial/blocked. |
| Architecture | Needs Re-audit | `docs/audits/architecture-audit.md` | `4e609e3` | 2026-08-10 | Shared Admin resource/modal ownership was extended at `06e0291`; backend/data contracts are unchanged. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Needs Re-audit | `docs/audits/frontend-audit.md` | `4e609e3` | 2026-08-10 | Source Health/Feedback source/browser evidence changed at `06e0291`; score and findings require revalidation. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Needs Re-audit | `docs/audits/dashboard-ux-audit.md` | `4e609e3` | 2026-08-10 | Operations ledgers, truthful states, 44 px actions, and the sensitive dialog changed at `06e0291`; next selection is pending. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Needs Re-audit / No-Go | `docs/audits/production-readiness-audit.md` | `4e609e3` | 2026-08-10 | Synthetic Admin evidence changed at `06e0291`; human/assistive-technology/deployed/release gates remain open. |
| Roadmap | Needs Re-audit | `docs/roadmap/master-refactoring-roadmap.md` | `4e609e3` | 2026-08-10 | The eighth T14 slice is implemented at `06e0291`; affected-chain revalidation is required before continuation. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.
