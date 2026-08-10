# Product

<!-- impeccable:product-schema 1 -->

This record combines explicit owner directions with facts already validated in repository audits.
Items described as repository-evidenced are not claims of deployed, field, or human acceptance.

## Platform

web

## Users

- Primary Admin redesign audience: university transport operations staff using authenticated
  `ADMIN`, `SUPER_ADMIN`, or `DEV` roles to monitor service state and maintain vehicle, route, stop,
  source-health, and feedback records. This role/task model is repository-evidenced.
- Public riders use the live tracker, route/stop information, ETA projection, and feedback capture;
  their incumbent UI identity is outside the Admin redesign and must remain substantially unchanged.
- Mobile, ESP32, simulator, and LoRaWAN/TTN senders provide observations through distinct protected
  ingestion boundaries; they are system actors, not users of the Admin visual theme.

## Product Purpose

The Tram Tracking System makes university shuttle service visible to riders and operable by
authorized staff. Success means riders receive truthful service state while staff can verify live
operations, maintain master data, and handle supported exceptions without fabricated state or
unsafe authority expansion. Production readiness remains a separate evidence gate.

## Positioning

The product combines a public university-shuttle map with an authenticated operational workspace
that projects one canonical vehicle state across multiple independently authenticated sender types.
Research observations remain separate from canonical operational truth.

## Operating Context

- Admin work is an `Operate` context: frequent scanning, status verification, CRUD maintenance,
  route-stop ordering, source-health review, and privileged feedback triage on desktop and Mobile
  web viewports.
- The operating environment can include bright university offices and on-the-go Mobile use, so
  state, text, tables, and actions must remain legible without relying on translucency or color.
- T9/T13 external infrastructure work is deferred by the owner; T11 still requires coordinated
  Backend/Mobile and Android evidence. These gates cannot be visually designed away.

## Capabilities and Constraints

- Current Admin surfaces: Dashboard, Vehicles, Routes, Stops, Source Health, Feedback Inbox, shared
  form/route-stop/sensitive dialogs, role-aware navigation, and Login.
- The Public UI must preserve its incumbent identity and layout as far as practical. Public changes
  are limited to separately approved source quality, semantics, accessibility, truthful state/copy,
  and small behavior-preserving UX corrections.
- Admin pages may be restructured and visually redesigned only through bounded exact-path roadmap
  slices with deterministic desktop/Mobile and accessibility evidence.
- Existing API methods, payloads, authorization, canonical state, privacy/retention, schema,
  persistence, and Mobile contracts remain authoritative unless a separate task explicitly changes
  them.
- Do not promote simulators, browser fixtures, or static source inspection into deployed, field,
  physical-device, human-usability, or release evidence.

## Brand Commitments

- Product names already in use are `RSU Tram Tracker` and `RSU Operations`; existing RSU identity
  and transport terminology remain recognizable.
- Owner direction on 2026-08-10: move the authenticated Admin web experience to a premium,
  iOS-inspired Liquid Glass / glassmorphism visual world. This is a binding Admin direction, not
  permission to imitate Apple trademarks/assets or to apply transparency indiscriminately.
- Owner palette refinement on 2026-08-10: keep that Admin world explicitly light and neutral—white,
  porcelain, and restrained grays with graphite text. Blue is limited to functional actions,
  current selection, focus, and existing status meaning. Do not use a navy/campus-sky ambient world
  or automatically switch Admin into a dark theme when the operating system requests dark mode.
- Public visual identity remains substantially unchanged and is not absorbed into the Admin world.
- Product copy stays calm, operational, and truthful. Do not invent availability, root cause,
  recovery, capacity, accuracy, or service promises.

## Evidence on Hand

- Validated product/discovery/audit evidence under `docs/`, including the revalidated T14 baseline
  at `9af2c59` and approved decisions in `docs/decision-queue.md`.
- Admin implementation and tokens in `shuttle-tracking-web/app/admin/`, shared components in
  `shuttle-tracking-web/components/admin/`, and deterministic browser journeys in
  `shuttle-tracking-web/tests/`.
- Existing RSU logo asset at `shuttle-tracking-web/public/icons/RSU_logo.png`.
- No approved Liquid Glass comp, human usability study, assistive-technology session, deployed
  Admin runtime, physical-device matrix, or production acceptance artifact exists yet.

## Product Principles

1. Operational truth outranks visual spectacle.
2. Public and Admin visual authority remain deliberately separate.
3. Privileged actions expose intent, state, recovery, and role boundaries explicitly.
4. One semantic component/token system should serve every Admin route without changing domain/API
   ownership.
5. Every readiness claim names whether its evidence is source, synthetic browser, stateful target,
   human, device, field, or deployed.

## Accessibility & Inclusion

Admin work must remain keyboard-operable, zoom-safe, responsive at least through the audited 390 px
Mobile width, and usable with reduced motion, reduced transparency, and increased contrast. Text
and meaningful controls target WCAG AA contrast; touch targets remain at least 44 by 44 CSS px.
Glass effects require a legible opaque fallback and may never be the sole carrier of hierarchy,
status, or interaction state.
