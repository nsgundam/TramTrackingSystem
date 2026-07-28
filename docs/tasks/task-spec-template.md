# Implementation Task Specification: T<number> — <topic>

## Source Task

- Roadmap task: `T<number>`
- Approved decisions: `<decision IDs or None>`
- Specialist briefs: `<task-keyed paths or None>`

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

