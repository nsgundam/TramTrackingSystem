---
name: refactoring-roadmap-manager
description: Handles roadmap task intake, dependency checking, status/evidence metadata updates, and audit staleness flagging.
---

# Refactoring Roadmap Manager

## Overview
This skill governs the intake, lifecycle tracking, roadmap metadata synchronization, and audit document staleness management for refactoring tasks in the Tram Tracking System repository.

## Required Inputs Checklist (Step 1 — Intake)
Before proceeding with implementation, verify and read:
1. `docs/roadmap/master-refactoring-roadmap.md`
2. `docs/project-knowledge-base.md`
3. `docs/decision-queue.md`
4. Source audit(s) cited by the selected task in `docs/audits/`
5. Source files listed under `Related Files` in the task entry

### Blocker Rules
- If dependencies are incomplete, STOP and report the missing dependency.
- If task status is `User Decision Required` or `DECISION GATE`, STOP and present options recorded in `docs/decision-queue.md`.

## Step 8 — Roadmap Synchronization
When a task passes all acceptance criteria:
1. Open `docs/roadmap/master-refactoring-roadmap.md` and locate the task under `## Consolidated Tasks`.
2. Update the task entry in place:
   - `Status:` (`Complete` or `Partially Complete — <what remains>`)
   - `Evidence:` one-line pointer to verification logs (e.g. commands run, file paths).
3. Add unblocking notes to downstream tasks listed under `Blocks`.

## Step 9 — Audit Staleness Flagging
1. Take the list of source audits referenced during planning.
2. Check if the newly implemented code makes any claim or line reference in those audit documents stale.
3. For every stale audit document, record an entry under `Audit Staleness` in the completion report:
   - Audit file path
   - Specific section/finding now outdated
   - Summary of what changed and which Level 1 audit agent should be re-run (do NOT re-run it automatically).
