# T12 Feedback Triage and Safe Source View Decision Brief

## 1. Trigger and focused question

- **Task:** T12
- **Trigger:** T12 was blocked because feedback ownership, anonymous-contact policy, retention, deletion/restore safeguards, SLA, and source/device action scope were unspecified.
- **Question:** What operational and privacy contract governs anonymous rider feedback and the authorized read-only source/device view?
- **Evidence paths:** docs/decision-queue.md, docs/roadmap/master-refactoring-roadmap.md, shuttle-tracking-backend/prisma/schema.prisma, shuttle-tracking-backend/src/services/feedback.service.ts, shuttle-tracking-backend/src/routes/public.route.ts, shuttle-tracking-web/components/public/FeedbackModal.tsx, and the Product, Database, Security, Dashboard & UX, and Production Readiness audits.
- **Primary playbook:** Identity, Security, and Privacy. **Supporting playbook:** Product and Research Design.
- **Output:** This immutable task-keyed decision brief.

## 2. Binding owner decisions

### Feedback operations and privacy

1. **Owner:** SUPER_ADMIN owns the feedback inbox and accountable triage.
2. **Rider contact model:** feedback is anonymous and one-way. Do not add email, phone, account login, or direct reply in T12. The public confirmation only acknowledges receipt.
3. **Service window:** triage operates on business days only. The inbox must state that it is not an emergency channel and must not promise after-hours response.
4. **Case workflow:** new → acknowledged → investigating → resolved; duplicate and rejected are terminal dispositions. A case records responsible SUPER_ADMIN, status timestamps, and a bounded internal resolution/note field.
5. **Retention:** retain feedback message, type, vehicle reference, case metadata, and audit evidence for 180 days from creation. Retain raw client IP for rate-limiting no longer than 30 days, then remove it; do not repurpose it for triage, analytics, or rider identification.
6. **Deletion and recovery:** use soft deletion. Only SUPER_ADMIN and DEV may request it after recent re-authentication within 15 minutes, explicit reason, immutable actor/action/audit record, and a 30-day restore window. After the restore window, perform the configured irreversible purge while retaining only non-content audit metadata necessary to demonstrate the action.
7. **Privacy notice:** before public submission, present a concise notice: anonymous feedback, no direct response, what fields are stored, 180-day message/case retention, IP used only for abuse/rate-limiting and removed within 30 days, business-day triage, and that riders must not include emergency or sensitive personal information.

### Source/device view

1. ADMIN, SUPER_ADMIN, and DEV may read only source type, assigned vehicle, freshness, last-seen time, status, and allowlisted error category.
2. The view must not expose credentials, credential hashes, access/refresh material, QR activation values, raw payloads, client IP, raw or historical location, research observations, or arbitrary internal error text.
3. T12 is **read-only** for device/source state. Shared-phone disable/revoke/re-enrollment and force-close remain T11; credential rotation, assignment, deletion, and maintenance writes are explicitly out of scope.

## 3. MVP rationale and alternatives

Anonymous one-way feedback avoids adding contact-personal-data obligations while still giving riders an accountable intake path. SUPER_ADMIN ownership makes escalation unambiguous. The 180/30-day split minimizes retained IP while preserving a short anti-abuse window. Read-only operational health gives ADMIN enough information to diagnose service freshness without converting a dashboard into a credential-management or research-data surface.

Rejected alternatives: unrestricted Admin deletion, unbounded IP retention, rider-response/contact collection, public source identity/raw telemetry, and mixing device recovery writes into T12. Each would increase privacy, authorization, or workflow scope beyond this task.

## 4. Exact future implementation handoff

After affected re-audits are validated, the T12 Level 3 specification must use an additive Feedback lifecycle/assignment/retention/deletion/audit model, server-enforced hierarchy and recent re-authentication, scheduled or deterministic retention tests, a public notice and anonymous receipt, an authenticated SUPER_ADMIN inbox, and a safe read-only source/device DTO/page.

The exact handoff must explicitly exclude account/role management, Android recovery actions, raw/research data, credentials, rider contact/response, and any migration or runtime operation unless a separate disposable target is approved.

## 5. Failure modes and validation

- A UI-hidden control is not authorization; every list/detail/delete/restore/read endpoint must enforce roles server-side.
- A feedback message can contain personal data despite anonymous design; staff notes and logs must be bounded/redacted and no raw content may enter application logs.
- Retention must use deterministic time tests for 30-day IP removal, 180-day case deletion eligibility, 30-day restore expiry, authorization, recent re-authentication, audit records, and terminal-case behavior.
- Safe source DTO tests must prove prohibited values never appear, including on error paths.
- Browser/admin workflow tests must cover notice, receipt, business-day wording, inbox status/assignment, and denied roles.
- No claim of legal compliance, actual purge, backup/restore, or production operation is established until separately validated on an approved target.

## 6. Open gates and confidence

- The owner decisions in this brief resolve T12's feedback/device-policy gate.
- Implementation remains prohibited until Discovery through Roadmap are re-audited after T10 and these decisions, an exact task allowlist is approved, and the role hierarchy/re-authentication design is verified against current code.
- **Owner-decision confidence:** high.
- **Repository evidence:** high that current Feedback stores message, vehicle, and IP but has no lifecycle/notice/inbox; high that current source/device scope would need a safe DTO.
- **Privacy/legal status:** policy is approved for product implementation; legal/regulatory sufficiency is not assessed by this brief.

