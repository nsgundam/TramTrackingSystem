# Observability and Field Testing

- Define service-level signals for ingress acceptance, rejection reason, duplicates, processing and
  persistence latency, source freshness, canonical selection/failover, Redis/DB failure, TTN webhook,
  query/export failure, and experiment completeness.
- Control metric cardinality; use source/vehicle identifiers only in bounded diagnostic views, not
  unbounded infrastructure metric labels.
- Correlate observation, source, vehicle, trip, experiment, request, and provider identifiers without
  logging credentials or raw continuous coordinates.
- Create a repeatable field protocol with hardware/firmware manifest, route/geometry version,
  mounting, start/end time, conditions, cadence, clock check, checkpoints, failure injections,
  operator notes, and redacted export checksum.
- Exercise cold start, weak/absent network, gateway gap, app suspension, server restart, Redis/DB
  degradation, duplicate/delay/reorder, power cycle, credential rotation, and recovery.
- Distinguish simulator, bench, field, pilot, and production evidence. Record sample size,
  missingness, excluded data, limitations, and reproducibility artifacts.
- Define actionable alert thresholds from pilot baselines; avoid inventing production thresholds
  before field evidence exists.
