# M-20260815-01: Admin timestamp presentation contract

## Outcome

Present every timestamp in the Admin Dashboard, Source Health, and Feedback Inbox in the
same unambiguous Thailand-time format: `DD Mon YYYY, HH:mm ICT` (for example,
`15 Aug 2026, 14:30 ICT`).

## Scope

- Add one typed browser-safe timestamp presentation utility in
  `shuttle-tracking-web/utils/admin-timestamp.ts`.
- Route the three Admin surfaces through that utility without changing their layout,
  data-fetching behaviour, role boundaries, or empty/error fallbacks.
- Add deterministic unit coverage and focused browser assertions for the displayed contract.

## Non-goals

- No API, storage, timestamp provenance, retention, authorization, or timezone-policy changes.
- No public-page timestamp changes or Admin visual redesign.

## Impact assessment

- Product: removes ambiguity for operations staff by making the timezone explicit.
- Architecture: one presentation utility becomes the sole Admin timestamp formatter.
- Security and privacy: no new data is loaded or exposed.
- Data and migration: presentation-only; source values remain unchanged.
- Operations and research: no runtime configuration, deployment, or evidence semantics change.

## Acceptance evidence

- Valid timestamps render in `Asia/Bangkok` as en-GB 24-hour date/time text ending in `ICT`.
- Invalid or absent values safely return control to each screen's existing fallback.
- Dashboard, Source Health, and both Feedback timestamp fields use the utility.
- Focused unit/browser checks and repository validation pass.
