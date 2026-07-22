# Specialized Agent Outputs

This directory is reserved for focused Level 2 decisions produced during audits or the Master
Refactoring Roadmap process. Name each immutable output
`<task-or-audit-id>-<specialist>-<topic>.md`; do not append unrelated decisions to a specialist-wide
file. Each output must retain the triggering
finding, decision, alternatives, implementation steps, failure modes, migration risk, priority,
difficulty, evidence classification, primary-source research metadata when required, confidence,
validation plan, and unresolved user decisions.

The Level 2 contract lives in
[`agents/level-2-specialist/AGENT.md`](../../../agents/level-2-specialist/AGENT.md) and its workflow
in `.agents/skills/tram-specialist-consultation/`. These files are generated decision briefs, not
replacements for Level 1 audit documents.

For device-comparison work, use the approved scope in
[`docs/research/device-comparison-scope.md`](../../research/device-comparison-scope.md) and select
only the specialist playbook needed for the focused question.
