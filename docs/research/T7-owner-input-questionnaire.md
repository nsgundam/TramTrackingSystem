# T7 Owner Input Questionnaire

Status: **Owner answers recorded — ready for Level 2 specialist consultation**
Recorded at: 2026-07-29

Purpose: collect the owner-controlled parameters that Level 2 specialists must have before
producing the immutable T7 decision briefs.

## A. Data lifecycle, access, and export

1. **Raw retention:**
   - Raw observations: Retained for **90 days**, age starts at **backend receive time (`receiveTime`)**.
   - Derived aggregates: Retained until Super Admin / Dev manually deletes them from the database.

2. **Deletion accountability:**
   - Deletion owner: Super Admin / Dev.
   - Schedule: Runs every Friday or when retention threshold (90 days) is reached.
   - Export backup & verification: Export data to backup file prior to deletion. Level 2 specialist to define specific verification steps for PostgreSQL, Redis, exports, and backups.
   - Deletion strategy: Hybrid approach (anonymization of identifiable info combined with hard-delete as specified by Level 2).

3. **Research access:**
   - Allowed roles: **Dev / Super Admin** only.
   - Access method: Dedicated Research UI showing research-related metrics and data.
   - Audit logging: Read and Export operations do **not** require audit logging.

4. **Privacy and allowed fields:**
   - Privacy basis: Drivers are university employees operating university-owned trams with explicit consent for fleet tracking. No privacy/consent barriers for vehicle and driver tracking.
   - Level 2 specialist may specify exact field handling (allowed, redacted, hashed, forbidden) during consultation.

5. **Export bounds:**
   - Format: **CSV** only.
   - Limits: Unrestricted export bounds (no hard row/time limits for Dev exports).
   - Export fields: Level 2 specialist to recommend allowed/useful export fields.

6. **Capacity and migration target:**
   - Capacity: ~30 total devices across ~10 vehicles (~3 devices per vehicle).
   - Session duration: ~1 month per research session.
   - Migration & Disposable test target: Level 2 specialist to define/select the appropriate disposable target.

## B. Research protocol and validity

7. **T7 scope boundary:**
   - Scope: Physical sources include **Mobile** and **LoRaWAN (TTN)** (2 active sources available now). Implement T7 for Mobile and LoRaWAN directly.

8. **Physical-source facts:**
   - Mobile: Android devices.
   - LoRaWAN: via TTN (The Things Network) webhooks.

9. **Ground truth:**
   - Surveyed checkpoints or high-precision reference receivers: **Neither available**.
   - Conformance: T7 reports **route-conformance distance** and **pairwise disagreement**, not absolute GPS error.

10. **Clock and latency:**
    - Primary comparison: Compare device signal acquisition time (`producerEventTime`) against Server receipt time (`backendReceiveTime`).
    - Level 2 specialist may analyze and define additional timestamp/metric comparisons.

11. **Sessions and repeats:**
    - Continuous iterative testing until usable and stable values/metrics are achieved.

12. **Decision rule:**
    - Rule: Compare metrics separately (latency, cadence/jitter, availability, delivery quality, route conformance, etc.) with **NO OVERALL WINNER**. The research report/readers will evaluate trade-offs independently.

## Current gate

Owner input is recorded. Level 2 specialists may now proceed with the focused consultations to produce:

- `docs/audits/specialized/T7-product-research-accuracy-protocol.md`
- `docs/audits/specialized/T7-data-lifecycle-access.md`
