---
name: agy-worker-task-runner
description: Formulates bounded task specifications and delegates execution to Antigravity CLI worker script.
---

# Antigravity Worker Task Runner

## Overview
This skill governs the delegation of mechanical, bounded implementation tasks from Codex (Planner) to Antigravity CLI (Worker) via `./scripts/agy-worker.sh`.

## Protocol & Scope Rules
1. **Scope Ceiling**: Allowed write paths are strictly limited to `Related Files` in the roadmap entry, plus paired files (e.g. Prisma migration paired with schema edit).
2. **Coordination Exception**: `docs/tasks/<task-name>.md` is always writable.

## Workflow
1. Check existing working tree (`git status --short`, `git diff --stat`).
2. Create bounded task spec file at `docs/tasks/<task-name>.md`:
   ```markdown
   # Implementation Task Specification: T<number>
   ## Allowed Writes
   - <list of explicitly allowed write paths>
   ## Read-only Context
   - <list of reference files>
   ## Required Changes
   - <precise, step-by-step mechanical implementation details>
   ## Validation Commands
   - <commands to run>
   ## Stop Conditions
   - Stop if outside file modification is needed or if ambiguous decisions arise.
   ```
3. Execute worker delegation command:
   ```bash
   ./scripts/agy-worker.sh "Implement exactly docs/tasks/<task-name>.md"
   ```
4. Post-execution verification:
   - Check `git diff --name-only` against `Allowed Writes`.
   - If worker touched unauthorized files, revert unauthorized edits and report scope breach.
