---
name: specialist-decision-manager
description: Governs Level 2 Specialized Domain Agent execution, standardized decision brief formatting, alternative trade-off matrix generation, and decision queue integration.
---

# Specialist Decision Manager Skill

## Overview
This skill governs the execution contract, decision brief formatting, trade-off matrix evaluation, and handoff protocols for all Level 2 Specialized Agents in `agents/specialized/`.

---

## 1. Specialist Invocation & Input Checklist
Before executing a Level 2 specialist consultation:
1. Confirm caller brief has:
   - Triggering audit finding or specific architectural question.
   - Pointer to `docs/project-knowledge-base.md`.
   - Relevant source file paths.
2. If trigger or required code evidence is missing, STOP and request context. Do not perform an unguided general audit.

---

## 2. Standard Level 2 Decision Brief Format
Save generated decision briefs to `docs/audits/specialized/<agent-name>.md` using this exact structure:

```markdown
# Level 2 Specialist Decision Brief: <Domain / Topic>

## 1. Trigger & Core Problem Statement
- Triggering finding / task ID: `T<number>` or Audit section.
- Problem overview and affected trust/technical boundary.

## 2. Recommended Decision
- Concise summary of the recommended solution.

## 3. Alternatives Comparison Matrix
| Option | Complexity | Scalability | Security / Reliability | Implementation Effort | Recommended |
|---|---|---|---|---|---|
| Option A (Minimal / MVP) | Low | Adequate | Medium | Small | Yes/No |
| Option B (Balanced) | Medium | Good | High | Medium | Yes/No |
| Option C (Advanced) | High | High | Very High | Large | No |

## 4. Rationale & MVP Alignment
- Why this option fits current project constraints (~10 vehicles, MVP scale).

## 5. Concrete Implementation Steps
- Precise, ordered steps with exact file paths, schema changes, and middleware placement.

## 6. Failure Modes & Rollout Compatibility
- Error handling behavior, token/credential expiry, network reconnects, and backward compatibility.

## 7. Level 3 Implementation Handoff
- Target implementation task ID or allowed files for Level 3 Refactoring Agent.
```

---

## 3. Decision Queue Synchronization
If the recommended decision alters existing architecture, security policy, database topology, or hardware requirements:
1. Format a decision proposal entry.
2. Register it under `docs/decision-queue.md`.
3. Mark implementation as **Blocked on User Decision** until Project Owner approval is granted.
