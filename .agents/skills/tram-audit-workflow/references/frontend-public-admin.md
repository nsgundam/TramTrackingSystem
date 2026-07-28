# Frontend Public and Admin

- Keep rider UI dependent only on canonical location and truthful freshness/service state. Never
  expose raw device comparison or credentials publicly.
- Audit Next.js server/client boundaries, admin authentication, API and Socket.IO lifecycle, state
  ownership, reconnect, stale data, loading, empty, partial, and error states.
- Treat the Dev Dashboard as an authenticated diagnostic surface distinct from daily operations.
- Require filters to be URL- or state-reproducible and bound by vehicle, source, experiment/session,
  route, and time range.
- Check map performance, marker density, chart sampling, timezone/unit labels, color accessibility,
  keyboard use, responsive layout, and safe CSV/JSON export feedback.
- Make uncertainty explicit: reported device accuracy, route distance, pairwise disagreement, and
  ground-truth error are different measures and need different labels.
- Verify that live updates merge deterministically with historical queries and do not silently
  double-count reconnect/replay data.
