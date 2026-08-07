# D-012 Identity and Administrative Lifecycle Decision Brief

This immutable brief records the least-privilege recommendation accepted by the owner on
2026-08-07. It refines D-007 without expanding T11/T12 or authorizing an implementation task.

## 1. Trigger and focused question

- **Decision:** D-012
- **Question:** Which actor, action, fresh-authentication, reason, audit, and recovery rules govern
  administrative accounts, non-Mobile Sender credentials, privileged deletion, backup/export, and
  out-of-band DEV recovery?
- **Primary playbook:** Identity, Security, and Privacy.
- **Evidence:** D-006/D-007/D-009/D-010, current persisted-role and 15-minute re-authentication
  middleware, current hard-delete Sender path, Feedback soft-delete/audit design, Prisma schema, and
  current Security/Database/Production audits.

## 2. Binding lifecycle matrix

| Capability | Minimum actor | Required controls | Recovery / prohibited behavior |
|---|---|---|---|
| Create `ADMIN`; promote/demote/disable another `ADMIN` | `SUPER_ADMIN` | Server-side persisted-role check; re-auth within 15 minutes; explicit reason; immutable actor/target/from/to audit | Disable rather than hard-delete. No self-disable/demotion; do not remove the last enabled `SUPER_ADMIN`/`DEV` recovery path. |
| Create `SUPER_ADMIN`; promote `ADMIN` to `SUPER_ADMIN`; demote/disable `SUPER_ADMIN` | `DEV` | Same controls, plus confirmation naming the target and resulting role | No in-product `DEV` creation/removal. A `SUPER_ADMIN` cannot elevate itself or a peer to `DEV`. |
| Reset an `ADMIN`/`SUPER_ADMIN` credential | A role permitted to manage that target | Fresh auth, explicit reason, immutable audit, revoke all target sessions | Issue a one-time reset/activation path; never reveal an existing password or password hash. |
| Create/assign non-Mobile Sender credential | `ADMIN` | Validate source type/vehicle; show a generated secret once; record issuer/time/version without the secret | Never redisplay or “recover” the secret. Recovery is rotation. Do not reassign a source during an active Trip. |
| Rotate/revoke/disable non-Mobile Sender credential | `ADMIN` | Fresh auth for revoke/disable/rotation; reason; immutable audit; atomically increment credential version | Existing access fails on the next server revalidation. Preserve source and telemetry provenance; do not hard-delete to revoke. |
| Shared-phone enrollment/recovery/force-close | `ADMIN` | T11 v1/v2/v3 contract, including explicit reason/audit for force-close | T11 remains authoritative; this decision does not weaken its claim/token/Trip invariants. |
| Recoverable delete of `Trip` plus its `GPSTrack` evidence | `SUPER_ADMIN` | Fresh auth; explicit reason; immutable audit; named pre-action backup/export artifact; transactional tombstone | Restore for 30 days. Do not independently delete individual `GPSTrack` rows. A normal application request must not hard-delete evidence. |
| Final purge after restore window | `DEV` | Second deliberate action, fresh auth, reason, immutable audit, verified backup identifier and documented restore result | Never purge lifecycle/audit evidence. Run only on an explicitly approved target; ordinary UI must not expose an immediate purge shortcut. |
| Feedback delete/restore/purge | `SUPER_ADMIN` | D-009's fresh-auth, reason, immutable audit, 30-day restore and 180-day content policy | D-009 remains authoritative. |
| Controlled operational backup/export | `SUPER_ADMIN` | Named fixed-purpose export, bounded fields/time, fresh auth, reason, immutable audit, encrypted approved destination | No arbitrary query/export endpoint. Restore is a separately logged action and must be exercised on a disposable approved target first. |
| Raw research export/lifecycle | D-006/D-007 role boundary | Fixed session/time/source bounds and existing export audit | D-006 remains authoritative; no public or ordinary operations exposure. |
| Provision/deprovision/recover `DEV` | Owner or explicitly allowlisted creator-team member, out of band | Two-person verification where two authorized people are available; versioned runbook; named ticket/reason; protected audit; revoke prior sessions/credentials | No product UI/API path. The allowlist and recovery contacts live in the controlled operations system, not source code. |

Hierarchical access does not replace action-specific checks. `DEV` inherits lower-role actions but
must still satisfy the same fresh-auth, reason, confirmation, backup, and audit controls.

## 3. Account and session invariants

1. Administrative users gain an explicit enabled/disabled lifecycle; disabling or changing role
   invalidates existing sessions through a server-checked session/credential version. JWT role
   claims alone never authorize an action.
2. Accounts and immutable audit records are not hard-deleted through the application. Usernames may
   be retained or tombstoned as needed for attribution; secrets and reset values are never logged.
3. Bootstrap must fail closed if no authorized recovery route exists. Seed/default credentials are
   prohibited in production. The named owner/team allowlist is deployment-controlled sensitive
   configuration, not a repository default.
4. “Last privileged account” protection considers enabled `DEV` plus enabled `SUPER_ADMIN` accounts
   and the recorded out-of-band owner recovery route. The system must not infer that an unknown
   external contact exists.

## 4. Audit contract

Every protected mutation records a server-generated event ID, actor ID and persisted role, target
type/ID, action, prior and resulting state, reason, request time, completion/result, and safe
correlation ID. It must exclude passwords, credential values, tokens, raw request bodies, precise
locations, Feedback content, and raw research payloads. Audit writes participate in the mutation's
transaction or the mutation fails closed. Audit reads are separately authorized and are not implied
by ordinary `ADMIN` access.

## 5. Recommendation rationale and alternatives

This matrix favors recoverable disable/rotation/tombstone operations over hard deletion. Benefits
are preserved attribution, immediate revocation, deterministic incident review, and a realistic
rollback path. Costs are additive schema/migration work, a session-version check, retention jobs,
backup storage, and more operational testing.

Allowing `SUPER_ADMIN` to manage peers or immediately hard-delete Trip/GPS data would reduce support
friction, but increases self-escalation, lockout, and irreversible evidence-loss risk. Requiring
`DEV` for all daily Sender rotation would be stricter but would centralize routine operations and
conflict with D-007's `ADMIN` device-provisioning authority. The selected split keeps routine device
work with operations while reserving role elevation and final purge for the narrowest actor.

## 6. Implementation and evidence gates

- This decision unblocks exact future handoffs; it does not add account management, backup, purge,
  or Sender-write scope to T11, T12, T14, or the deferred T9/T13 work.
- Before implementation, a Level 3 task must name exact schema/migration/API/UI/audit/job paths and
  preserve the existing Feedback and research contracts.
- Migrations and restore/purge exercises require an explicitly approved disposable target.
- The external `DEV` allowlist, contact names, backup destination, and recovery ticket system remain
  target facts. Their absence blocks runtime/release acceptance but not repository schema/API work.

## 7. Sources and confidence

- **Owner decision (high):** accepted recommended least-privilege handling on 2026-08-07.
- **Repository evidence (high):** role allowlist/persisted lookup and 15-minute re-auth exist; general
  account lifecycle/session versioning and recoverable Trip/GPS deletion do not.
- **External guidance (high, accessed 2026-08-07):**
  [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html),
  [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html),
  and [NIST SP 800-63B-4](https://csrc.nist.gov/pubs/sp/800/63/b/4/final).
- **Confidence:** high for policy and repository gaps; runtime controls remain unverified until an
  exact implementation and approved-target exercise exist.
