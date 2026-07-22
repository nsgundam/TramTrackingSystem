---
name: specialist-routing
description: Routes refactoring tasks and file changes to Level 2 Specialized Agents and formats invocation briefs.
---

# Specialist Routing Skill

## Overview
This skill selects, routes, and invokes Level 2 Specialized Agents (`agents/specialized/`) whenever a task impacts specific technical domains.

## Specialist Routing Matrix
| Domain / Affected Files | Canonical Level 2 Specialist | File Path |
|---|---|---|
| JWT, sessions, sender credentials | `jwt-auth-agent` | `agents/specialized/jwt-auth-agent.md` |
| Roles and permissions | `rbac-agent` | `agents/specialized/rbac-agent.md` |
| Redis caching, TTL, adapter | `redis-agent` | `agents/specialized/redis-agent.md` |
| Socket.IO / realtime events | `websocket-agent` | `agents/specialized/websocket-agent.md` |
| PostgreSQL / PostGIS schema/queries | `postgresql-agent` | `agents/specialized/postgresql-agent.md` |
| Express routes, controllers, DTOs | `express-agent` | `agents/specialized/express-agent.md` |
| Next.js / React frontend UI/state | `nextjs-agent` | `agents/specialized/nextjs-agent.md` |
| LoRaWAN / TTN ingestion | `lorawan-agent` | `agents/specialized/lorawan-agent.md` |
| ESP32 hardware/ingestion | `esp32-agent` | `agents/specialized/esp32-agent.md` |
| Structured logs & redaction | `logging-agent` | `agents/specialized/logging-agent.md` |
| Monitoring, health, freshness | `monitoring-agent` | `agents/specialized/monitoring-agent.md` |

## Level 2 Invocation Brief Template
Send focused questions to the specialist using this structure:
```text
Task: T<number> — <task name>
Trigger: <audit finding & section>
Question: <single focused architectural/implementation question>
Current Evidence: <files, functions, schema/config details>
Constraints: <MVP scale, invariants, user decisions>
```
Treat Level 2 decisions as binding implementation constraints. If specialists conflict, stop and surface the conflict to the user.
