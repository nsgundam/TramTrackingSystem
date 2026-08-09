# Audit Register

Last updated: 2026-08-10

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | D-011/D-012 and pinned external Mobile source are current; Android runtime and external infrastructure/device facts remain unavailable. |
| Product | Needs Re-audit | `docs/audits/product-audit.md` | `0a0fe58` | 2026-08-10 | Public explanation/recovery changed at `bf80308`; identity and Mobile/T11 boundaries require revalidation, not expansion. |
| Architecture | Needs Re-audit | `docs/audits/architecture-audit.md` | `0a0fe58` | 2026-08-10 | Public state/ETA presentation ownership changed at `bf80308`; backend/data authority is unchanged. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Needs Re-audit | `docs/audits/frontend-audit.md` | `0a0fe58` | 2026-08-10 | Public recovery implementation `bf80308` passes focused/full CI; score and remaining findings need revalidation. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Needs Re-audit | `docs/audits/dashboard-ux-audit.md` | `0a0fe58` | 2026-08-10 | Public explanation, ETA truth, Retry, and slow-load evidence at `bf80308` require Level 1 revalidation. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Needs Re-audit / No-Go | `docs/audits/production-readiness-audit.md` | `0a0fe58` | 2026-08-10 | Source/full-CI evidence changed at `bf80308`; human/assistive-technology/deployed/release gates remain open. |
| Roadmap | Needs Re-audit | `docs/roadmap/master-refactoring-roadmap.md` | `0a0fe58` | 2026-08-10 | Exact T14 Public implementation `bf80308` is accepted; next work requires affected-chain revalidation. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.
