# Audit Register

Last updated: 2026-08-09

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | D-011/D-012 and pinned external Mobile source are current; Android runtime and external infrastructure/device facts remain unavailable. |
| Product | Needs Re-audit — T14 measured map quality | `docs/audits/product-audit.md` | `378818f` | 2026-08-09 | Commit `c5b2e69` changes selected-route readiness, reduced motion, and narrow Public control behavior; Mobile/T11 remains independent. |
| Architecture | Needs Re-audit — T14 measured map quality | `docs/audits/architecture-audit.md` | `378818f` | 2026-08-09 | T14 adds one motion/cancellation boundary and on-demand route-load ownership; backend/data authority is unchanged. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Needs Re-audit — T14 measured map quality | `docs/audits/frontend-audit.md` | `378818f` | 2026-08-09 | Request, RAF, reduced-motion, touch, and 320 px evidence passes; findings and score must be refreshed. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Needs Re-audit — T14 measured map quality | `docs/audits/dashboard-ux-audit.md` | `378818f` | 2026-08-09 | Map-quality 2/2 and motion 4/4 pass without a Public redesign; responsive/performance findings require rescoring. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Needs Re-audit — T14 measured map quality / No-Go | `docs/audits/production-readiness-audit.md` | `378818f` | 2026-08-09 | Synthetic source/browser performance and responsive evidence changed; all human/deployed/release gates remain open. |
| Roadmap | Needs Re-audit — T14 measured map quality | `docs/roadmap/master-refactoring-roadmap.md` | `378818f` | 2026-08-09 | Implementation `c5b2e69` passes full CI; Level 1 must revalidate before selecting contrast/visual-system or Admin theme work. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.
