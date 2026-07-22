---
name: audit-contract-manager
description: Governs Level 1 audit contract compliance, finding status classifications, report structure standards, and evidence freshness validation.
---

# Level 1 Audit Contract Manager Skill

## Overview
This skill standardizes re-audit workflows, finding revalidation classifications, evidence metadata, freshness verification, and shared report structures for all Level 1 Master Audit Agents in the Tram Tracking System.

---

## 1. Input Freshness & Gate Verification Checklist
Before conducting a Level 1 domain audit:
1. Verify mandatory input files exist:
   - `docs/project-knowledge-base.md`
   - `docs/audits/README.md`
   - Prior domain audit report in `docs/audits/<domain>-audit.md` (if re-auditing)
   - Predecessor domain audit reports (as defined in the domain agent contract)
2. **Stop Condition**: If any mandatory predecessor report or knowledge base file is missing or unvalidated, STOP and request completion of the prerequisite audit phase.

---

## 2. Standard Finding Status Classification
Every prior audit finding MUST be revalidated against current repository evidence and classified into one of the following exact categories:

| Status | Definition | Evidence Requirement |
|---|---|---|
| **Resolved** | The finding is completely fixed or mitigated. | Exact code/file lines proving resolution. |
| **Partially Resolved** | Initial progress was made, but remaining gaps exist. | Specific code lines fixed and remaining gaps. |
| **Still Present** | The finding persists in the codebase without change. | Line numbers and file paths where gap remains. |
| **No Longer Relevant** | Architectural/scope changes rendered finding moot. | Architectural decision or scope change reference. |
| **Unable to Verify** | Cannot verify without unprovided runtime/hardware facts. | Missing external evidence or hardware dependency. |
| **New Finding** | Newly identified risk/gap discovered in current code. | Direct repository code evidence. |

---

## 3. Shared Audit Report Contract
All Level 1 audit reports generated under `docs/audits/<domain>-audit.md` MUST include the following mandatory sections:

```markdown
# <Domain> Audit Report

## 1. Executive Summary & Scope
- Summary of domain readiness, primary findings, and key changes.
- Explicit list of files and configurations inspected.

## 2. Prior Findings Revalidation Table
| Finding ID / Topic | Original Severity | Current Status | Evidence / Line References | Notes |
|---|---|---|---|---|

## 3. Domain Analysis & Actionable Recommendations
- Core domain findings categorized by priority (Critical / High / Medium / Low).
- For each recommendation, specify: Impact, Effort, Priority, and Learning Value.

## 4. Roadmap Impact
- Specific tasks added, updated, or unblocked in `docs/roadmap/master-refactoring-roadmap.md`.

## 5. Assumptions, Unknowns & Unavailable Evidence
- Explicit list of unverified hardware/deployment facts and assumptions made.

## 6. Confidence Rating
- Rating: **High**, **Medium**, or **Low** with explicit rationale based on evidence quality.

## 7. Required Decisions (Decision Queue Sync)
- Material choices requiring Project Owner approval for `docs/decision-queue.md`.
```

---

## 4. Evidence Rules & Integrity Constraints
- **No Inferred Code**: Never guess file paths, schema fields, or function signatures. Inspect exact files.
- **No Dummy Fixes**: Never mark a finding "Resolved" based on documentation alone; demand code/test evidence.
- **No Silent Drops**: Never omit a finding from the previous audit report without explicit status classification.
