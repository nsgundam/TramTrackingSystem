# Level 2 Specialized Agents

These agents are the canonical Level 2 specialists for the Tram Tracking System. A Level 1 audit or the Master Refactoring Roadmap should invoke exactly one specialist with a focused finding/task brief. They do not replace the existing Level 1 agents and must not perform a new broad subsystem audit.

## Required Skill (Skill-Driven Workflow)
All Level 2 Specialized Agents delegate decision brief formatting, trade-off matrix evaluation, and decision-queue synchronization to:
- **`specialist-decision-manager`** (`skills/specialist-decision-manager/SKILL.md`)

## Invocation Contract
The caller must provide:
1. The triggering finding or implementation question.
2. `docs/project-knowledge-base.md`.
3. The prior audit(s) named in the selected agent.
4. The relevant source files named in the selected agent.

If the trigger is missing, ask for it and stop. If a required prior audit is missing, name the missing audit and stop rather than inventing context.

## Agent Catalogue

| Topic | Agent | Main Roadmap Work |
|---|---|---|
| JWT & Authentication | [jwt-auth-agent.md](jwt-auth-agent.md) | T1, T5, T17 |
| RBAC / Authorization | [rbac-agent.md](rbac-agent.md) | Deferred product role work, T17 |
| Redis | [redis-agent.md](redis-agent.md) | T8, T10, T13, T14 |
| WebSocket / Socket.IO | [websocket-agent.md](websocket-agent.md) | T1, T9, T13, T16 |
| PostgreSQL / PostGIS | [postgresql-agent.md](postgresql-agent.md) | T3, T10, T11, T14 |
| Express API | [express-agent.md](express-agent.md) | T1, T3, T4, T12, T15 |
| Next.js | [nextjs-agent.md](nextjs-agent.md) | T9, T16, T17, T21 |
| LoRaWAN / TTN | [lorawan-agent.md](lorawan-agent.md) | TTN deferred scope, T1, T2, T13 |
| ESP32 | [esp32-agent.md](esp32-agent.md) | T1, T2, T13, deferred hardware scope |
| Logging | [logging-agent.md](logging-agent.md) | T8, Phase 2 structured logging |
| Monitoring & Alerting | [monitoring-agent.md](monitoring-agent.md) | T8, T9, Phase 4 observability |

When a roadmap task names a different specialist, that task-specific instruction takes precedence over this catalogue.
