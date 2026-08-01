# T12 Role Enforcement, Re-authentication, and Retention Decision Brief

## 1. Trigger and focused question

- **Task:** T12
- **Trigger:** D-009 defines feedback/device policy and D-010:A defines the legacy-role
  transition, but the repository has a bearer-token check only. It neither retrieves the current
  user role at authorization time nor has a recent-authentication boundary or feedback lifecycle.
- **Question:** What smallest server-enforced role, re-authentication, data-lifecycle, and safe-DTO
  design can implement D-007, D-009, and D-010:A without adding general account management or
  device/source writes?
- **Evidence paths:** `docs/decision-queue.md`, `shuttle-tracking-backend/prisma/schema.prisma`,
  `shuttle-tracking-backend/src/controllers/auth.controller.ts`,
  `shuttle-tracking-backend/src/middleware/auth.ts`,
  `shuttle-tracking-backend/src/controllers/feedback.controller.ts`,
  `shuttle-tracking-backend/src/services/feedback.service.ts`,
  `shuttle-tracking-backend/src/controllers/devices.controller.ts`, and
  `shuttle-tracking-backend/src/services/tracking.service.ts`.
- **Primary playbook:** Identity, Security, and Privacy.
- **Output:** This immutable task-keyed Level 2 technical brief.

## 2. Binding decisions and repository facts

1. D-007 fixes the descending hierarchy as `DEV` > `SUPER_ADMIN` > `ADMIN`.
2. D-009 grants feedback-inbox ownership to `SUPER_ADMIN` (with `DEV` inheritance), requires a
   15-minute recent re-authentication for soft delete/restore, and limits the device/source view to
   safe read-only fields.
3. D-010:A maps every legacy `OPERATOR` to `ADMIN`, makes `ADMIN` the default, retains `DEV` and
   `SUPER_ADMIN`, and requires unknown roles to fail closed at every server authorization boundary.
4. The current User role is an unconstrained string and admin JWTs contain only identity. Current
   `authenticateToken` verifies a token but does not look up its user, role, or current authority.
5. Feedback currently contains message/type/vehicle/IP only. The current device response includes
   credential lifecycle fields, so it cannot be reused for the T12 safe view.

## 3. Selected technical contract

### Authorization and session freshness

1. Add one typed role module with the exact allowlist `ADMIN`, `SUPER_ADMIN`, and `DEV`; hierarchy
   checks compare only this allowlist. Any absent, deleted, or unknown persisted role is denied with
   a stable authorization error.
2. `authenticateToken` verifies a non-sender JWT **and then queries the current User row**. It puts
   a typed `{ id, username, role, reauthenticatedAt }` principal on the request. Tokens carry no
   authority-bearing role claim, so a changed or unmapped account cannot retain stale access until
   JWT expiry.
3. Login is a recent authentication event. It emits a signed admin token with a private,
   numeric-date `reauthenticatedAt` claim and returns the persisted role. `POST /api/auth/reauthenticate`
   requires the authenticated user's current password and replaces the token with a new current
   `reauthenticatedAt`; it does not alter password, role, account, or sender credentials.
4. A `requireRecentReauthentication` middleware accepts only a finite signed timestamp no older
   than 15 minutes. Soft-delete and restore require it after the `SUPER_ADMIN` minimum-role check.
   General normal-admin endpoints do not require re-entry of a password.

### Feedback and retention

1. Use an additive `Feedback` lifecycle: `status`, responsible actor, status timestamps, bounded
   internal note, `deletedAt`, deleter/reason, and restore expiry. Valid transitions are
   `new → acknowledged → investigating → resolved`; `duplicate` and `rejected` are terminal.
   No endpoint may bypass a terminal state.
2. Store append-only, content-free feedback audit events. They contain stable action, actor ID,
   status transition, timestamp, and optional deletion reason; never copy rider message, IP, raw
   payload, or arbitrary error data into an event or log.
3. The retention sweep is idempotent: clear `ipAddress` after 30 days, and hard-purge feedback
   content after 180 days or a soft-deleted record's 30-day restore expiry, whichever occurs first.
   The independent non-content audit records remain. The scheduled process only logs counts and
   stable outcome codes. Deterministic cutoff functions and tests establish this behavior without
   operating a database target.
4. Public submission remains anonymous. It returns a minimal receipt (ID and creation time only),
   rate limits with the source address in Redis, and has a prominent privacy/non-emergency/
   business-day notice. It does not return submitted message, IP, or triage state.

### T12 safe source/device DTO

1. Add a dedicated query/DTO rather than weakening the existing device-management response.
2. Its exact fields are source ID, source type, assigned vehicle ID/name, freshness,
   last-seen timestamp, source status, and an allowlisted error category. Freshness is derived from
   the existing source-health function. The present schema has no stored source error category, so
   return only a fixed non-sensitive category derived from health (`none`, `never_seen`, `stale`, or
   `disabled`), never an internal message.
3. Exclude source secret/hash, credential/version/issuance/rotation data, QR or activation values,
   raw payloads, client IP, raw/historical locations, research data, priority, and arbitrary errors.
   The endpoint is GET-only and `ADMIN` or higher may read it. Existing device writes and analytics
   remain outside T12.

## 4. Required boundaries and non-goals

- Apply the persisted-role authentication boundary to existing ordinary admin routes so every
  authenticated administrative action fails closed for an unmapped role. This is the minimum
  implementation of D-010:A; it is not general user/role provisioning.
- Feedback inbox/state/delete/restore endpoints require `SUPER_ADMIN` or inherited `DEV` authority.
  No `ADMIN` feedback access is added.
- No role editor, password reset/change, account provisioning, Android sender operation, credential
  rotation, device assignment, source analytics, raw location, research view, deployment, or
  stateful migration execution belongs in this task.
- A migration file is reviewed as source; it must not be applied to an ambient or production
  database without an explicitly approved disposable target.

## 5. Verification contract

- Deterministic tests prove OPERATOR-to-ADMIN migration text/default, unknown role fail-closed,
  hierarchy decisions, sender-token rejection, 15-minute recent-auth boundary, status transition
  rejection, retention cutoffs, audit metadata exclusion, and safe DTO exclusion.
- Backend TypeScript check and Prisma schema validation must pass. Frontend lint/build must pass
  with any pre-existing warnings identified. Repository CI and whitespace checks are mandatory.
- No browser or database runtime target is assumed or executed.

## 6. Confidence and remaining gates

- **Decision confidence:** high. The owner has approved both the mapping and the feedback policy.
- **Implementation confidence:** high for code/schema/test construction; medium for runtime because
  no disposable database or browser target is authorized.
- **No remaining owner decision blocks T12.** T9 remains D-008 topology-blocked and T11 remains
  blocked by its external Android acceptance artifact and exact lifecycle handoff.
