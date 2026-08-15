# Implementation Task Specification: <work-id> — <topic>

## Source Work

- Work ID: `T<number>` or `M-YYYYMMDD-NN`
- Lane: `Roadmap` or `Maintenance`
- Roadmap task: `T<number>` or `Not applicable`
- User authorization: `<request/date or Roadmap task>`
- Approved decisions: `<decision IDs or None>`
- Specialist briefs: `<task-keyed paths or None>`
- Source audits: `<paths and validation states>`

## Outcome and Non-goals

- Outcome: `<observable behavior or engineering result>`
- Non-goals: `<explicitly excluded behavior or scope>`

## Impact Triage

| Concern | Impact | Evidence or required route |
|---|---|---|
| Product / UX | None / Bounded / Escalate | `<path, finding, or Level 1 route>` |
| Architecture | None / Bounded / Escalate | `<path, invariant, or Level 1 route>` |
| Security / privacy | None / Bounded / Escalate | `<boundary, decision, or Level 2 route>` |
| Data / migration | None / Bounded / Escalate | `<schema/data effect and target gate>` |
| Operations / rollout | None / Bounded / Escalate | `<runtime and rollback effect>` |
| Research validity | None / Bounded / Escalate | `<provenance/metric effect or Level 2 route>` |

## Allowed Writes

List exact repository-relative file paths. Do not use directories, globs, `src/` shorthand, or
paths containing `..`.

- `path/to/exact-file.ext`

## Read-only Context

- `docs/roadmap/master-refactoring-roadmap.md`
- `path/to/context-file.ext`

## Invariants

- `<behavior or data invariant that must remain true>`

## Required Changes

1. `<bounded implementation step>`

## Acceptance Criteria

- `<observable criterion>`

## Validation Commands

- `<safe command>`

## Rollout and Migration Limits

- `<explicitly approved target or Not applicable>`

## Stop Conditions

- Stop if another write path is required.
- Stop if an owner decision, migration target, secret, provider, or hardware fact is unresolved.
- Stop rather than changing architecture or adding dependencies outside this specification.

## Completion Evidence

- Status: `Pending` | `In Progress` | `Partially Complete — <remaining>` | `Complete`
- Acceptance mapping: `<criterion → command/result>`
- Changed files: `<exact paths>`
- Validation results: `<command, result, date>`
- Audit freshness changes: `<rows and rationale or None>`
