# Developer Dashboard and Visualization

- Build an authenticated developer/research surface separate from rider and ordinary operational
  views; enforce server-side roles for raw queries and exports.
- Support live map comparison of three sources plus canonical state and historical experiments with
  vehicle, route, source, session, device/firmware, and time filters.
- Show online/stale/offline, last event/receive time, latency distributions, interval/jitter,
  availability, accepted/rejected/duplicate rates, reported accuracy, route distance, pairwise
  disagreement, ground-truth error when available, selection/failover, and radio/power metadata.
- Pair every metric with definition, unit, sample count, missingness, percentile method, time zone,
  exclusions, retention limit, and whether it is measured, reported, or inferred.
- Use map layers, small multiples, distributions/time series, comparison tables, and drill-down
  intentionally. Do not encode source only by color or overload one composite score.
- Bound map points and chart samples through server aggregation/decimation and progressive loading.
  Make live/history merging and reconnect behavior deterministic.
- Export redacted CSV/JSON with experiment metadata and schema/version manifest; display audit and
  expiry implications before large exports.
