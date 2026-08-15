# Dashboard, Research, and UX

- Separate public tracker, operator dashboard, and developer research dashboard by route,
  authorization, vocabulary, and data contract.
- Provide live source markers and canonical marker, source online/stale/offline state, last event and
  receive times, reported accuracy, route-conformance distance, and selection/failover outcome.
- Provide historical experiment/session filters for vehicle, route, source, device, firmware,
  payload version, and time range plus bounded CSV/JSON export.
- Compare latency distributions, interval/jitter, accepted/rejected/duplicate rates, availability,
  route-conformance distance, pairwise source distance, ground-truth error where available,
  selection share, failover, and transport-specific signal/power metadata.
- Show sample count, missingness, percentile definition, units, timezone, retention boundary, and
  excluded observations with every aggregate. Prefer p50/p95 and distributions over averages alone.
- Never label device-reported accuracy or route distance as measured accuracy. Show definitions and
  confidence/limitations near the chart.
- Keep maps/charts performant through server aggregation, decimation, bounded ranges, and progressive
  loading. Make colors accessible and do not encode source only by color.
- Require drill-down from aggregate to redacted observation evidence and a reproducible experiment
  export without exposing credentials or unrestricted location history.
