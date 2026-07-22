---
name: task-verification-suite
description: Standardized verification commands and security quality gates for refactoring tasks.
---

# Task Verification Suite

## Overview
This skill provides automated verification and acceptance criteria validation for changes across backend, frontend, database, and operational boundaries.

## Automated Sanity Check Command
Run the primary repository CI check:
```bash
bash scripts/ci-checks.sh
```

## Domain-Specific Verification Commands
- **Backend Build & Tests**:
  ```bash
  cd shuttle-tracking-backend && npm run build && npm test
  ```
- **Prisma Schema & Migrations**:
  ```bash
  cd shuttle-tracking-backend && npx prisma validate && npx prisma migrate deploy
  ```
- **Frontend Lint & Build**:
  ```bash
  cd shuttle-tracking-web && npm run lint && npm run build
  ```
- **Compose Runtime Config Verification**:
  ```bash
  docker compose --env-file env.example config --quiet
  docker compose -f docker-compose.prod.yml --env-file env.example config --quiet
  ```

## Security & Redaction Checklist
- Confirm no `secretHash`, JWT secret, password, or Bearer token is printed in logs or REST responses.
- Ensure all newly added errors return safe, standardized HTTP status codes and redacted error messages.
