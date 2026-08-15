# T14 OSM Attribution for Research Use — Focused Decision Brief

This immutable Level 2 brief answers only whether research or non-commercial use permits the Public
and Admin maps to omit every Leaflet/OpenStreetMap credit while they use the OSM Foundation Standard
raster service. It does not amend D-011, choose a replacement provider, edit application source, or
mark T14 complete.

## 1. Trigger and focused question

- **Task:** T14, visible OSM attribution and Standard raster endpoint alignment.
- **Trigger:** On 2026-08-11 the owner clarified that both Public and Admin maps should remain visually
  empty of Leaflet and OpenStreetMap credit because the system is research/non-commercial work.
- **Question:** Does that research/non-commercial purpose create an attribution exemption for the
  current `tile.openstreetmap.org` maps, and what exact handoff remains valid if zero-credit UI is a
  binding requirement?
- **Primary playbook:** Developer Dashboard and Visualization.
- **Repository evidence:** the exact Level 3 contract at
  `docs/tasks/T14-osm-attribution-and-raster-endpoint-alignment.md`, current coordination baseline
  `45ecc0a`, Public `hooks/useLeafletMap.ts`, Admin `components/admin/LiveMap.tsx`, and Public
  `app/shuttle-tracker.css`.
- **Constraints:** preserve Public/Admin map behavior and D-011 visual boundaries; do not bypass an
  external provider/licence condition; do not turn a focused uncertainty into a provider migration.

## 2. Evidence and interpretation

### OSM Foundation Standard tile service

The current official Tile Usage Policy states that anyone using tiles from
`tile.openstreetmap.org` must follow the policy. Its minimum requirements include the exact Standard
raster URL and visible OpenStreetMap licence attribution on the map, and it says attribution must not
be hidden beneath UI, behind toggles, or off-screen. The policy separately warns commercial services
about availability; that warning does not limit the policy or its attribution requirement to
commercial users. The policy's mention of aggregated research usage data is a privacy/operations
statement, not a research exemption.

### OpenStreetMap data licence

OSM data is distributed under the ODbL. The OSMF copyright page and Attribution Guidelines require
credit when OSM data is used publicly. Non-commercial and research purposes are not listed as an
exception. The Legal FAQ distinguishes private use inside one school/organisation from Public Use,
but the Roadmap target includes a Public rider surface and the current browser map is not evidenced
as a private, access-restricted internal research tool. More importantly, even a private internal
consumer of `tile.openstreetmap.org` remains subject to that service's Tile Usage Policy.

### Leaflet library prefix

Leaflet is a separate JavaScript map library. Its official API documents the attribution-control
prefix as `String | false` and explicitly permits `false` to disable the `Leaflet` prefix. Removing
the Leaflet word/link therefore does not remove or satisfy the separate OpenStreetMap data/provider
attribution obligation.

## 3. Recommended decision

**Remove the optional Leaflet prefix from both Public and Admin, but retain one restrained linked
OpenStreetMap attribution in each map.** Use the shortest clear form supported by OSMF guidance,
linking `OpenStreetMap` to `https://www.openstreetmap.org/copyright`, and keep it at the map edge with
measured contrast and non-collision. This is the only bounded T14 continuation supported by the
current provider, licence, Roadmap, and exact source/test scope.

If a zero-credit map is a non-negotiable owner requirement, the current OSMF Standard endpoint unit
must stop and return to Level 1 as deferred/blocked on a new provider/data-licence decision. It must
not be accepted by merely hiding attribution. A provider or dataset that contractually permits the
desired presentation must be identified and approved first; self-hosting OSM-derived tiles alone
does not automatically remove ODbL attribution for a public interactive map.

This is an evidence-based engineering constraint, not jurisdiction-specific legal advice. Obtain
qualified legal review if the owner intends to rely on a private-research or other licence exception.

## 4. Alternatives and trade-offs

| Alternative | Benefit | Cost / risk | Disposition |
|---|---|---|---|
| Minimal linked `OpenStreetMap` text; no Leaflet prefix | Smallest visual footprint, current provider retained, exact T14 scope remains valid | One compact credit remains visible | Recommended |
| Hide/collapse all attribution while keeping OSMF Standard tiles | Cleanest map surface | Directly conflicts with the current service policy; access may be blocked and T14 evidence would be false | Reject |
| Splash screen, temporary credit, or information button | Frees persistent map space; general OSMF attribution guidance describes conditional collapse mechanisms | The stricter Standard Tile Usage Policy says attribution must be clearly on the map and not hidden behind toggles; requires written provider/legal confirmation before use | Not authorized |
| Commercial/white-label non-OSM provider or separately licensed dataset | May permit different branding/attribution terms and offer SLA | Cost, account/secret/privacy terms, vendor lock-in, new dependency/config/runtime tests, owner procurement decision | New Level 1/2 decision |
| Self-host tiles/data for a genuinely private internal experiment | More service control and no community tile dependency | Infrastructure, updates, storage, security, cache/operations burden; public OSM-derived output can still require ODbL credit | New architecture/operations decision |
| Remove the basemap entirely | No map-provider attribution | Breaks the approved rider/Admin map capability and research spatial context | Reject |

## 5. MVP rationale

The attribution text is not research data, an application capability, or a new visual world. Keeping
one compact provider credit and removing only the Leaflet prefix meets the stated desire for a
quieter map with the smallest code/UX change. Replacing or self-hosting a provider to eliminate one
line of map credit has disproportionate cost and introduces evidence, availability, privacy, and
operations work that the current T14 slice explicitly excludes.

## 6. Exact implementation handoff

If the owner accepts the recommendation, Level 3 may revise the existing exact T14 contract without
expanding its source allowlist:

1. Keep the shared exact Standard raster URL and linked OSM attribution authority.
2. Configure both Leaflet attribution controls with `prefix: false` or the equivalent documented API
   so neither map renders the optional Leaflet word/link.
3. Assert source and browser output contain the linked OpenStreetMap credit and do not contain the
   Leaflet prefix.
4. Preserve the existing 320/390 px visibility, non-collision, exact-host interception, map behavior,
   Login, Public identity, and Admin Signal Lens regression gates.

If the owner requires zero credit, Level 3 must not change the current map presentation further. The
Main Agent should record the T14 unit as deferred on provider/licence choice, remove only the
uncommitted work owned by this attempt after verifying exact paths, re-synthesize the Roadmap, and
open a separate focused provider/licence comparison before any provider source change.

## 7. Failure modes and rollout risks

- Treating non-commercial purpose as an exemption could produce a policy-violating public build and
  cause tile-service blocking without notice.
- Removing the library prefix and provider credit together conflates two independent obligations.
- Moving credit behind a toggle may pass a superficial screenshot while violating the exact service
  rule and making the source/browser acceptance guard misleading.
- A provider switch without a versioned contract can change map appearance, geographic coverage,
  rate limits, privacy exposure, secrets, cache behavior, cost, availability, or research
  comparability.
- Calling an externally reachable Public page “private research” without access-control/runtime
  evidence is an unsupported classification.

## 8. Owner decision required

Choose exactly one:

- **A — Minimal required OSM credit, no Leaflet prefix:** continue the current bounded T14 task.
- **B — Zero-credit is mandatory:** defer the current unit and authorize a separate provider/data-
  licence decision; do not use the current OSMF Standard endpoint without its attribution.

No source implementation is authorized by this brief until that choice is recorded by the owner.

## 9. Sources, evidence class, and confidence

- **Repository evidence (high):** source and exact task contract at coordination baseline `45ecc0a`;
  no deployed/provider runtime was observed.
- **Primary external evidence (high, accessed 2026-08-11):**
  [OSMF Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/),
  [OSMF Attribution Guidelines](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines),
  [OpenStreetMap Copyright and License](https://www.openstreetmap.org/copyright),
  [OSMF Licence and Legal FAQ](https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ), and
  [Leaflet Attribution Control API](https://leafletjs.com/reference.html#control-attribution).
- **Field/runtime evidence:** unavailable. No OSMF communication, provider account, legal opinion,
  deployed access restriction, traffic log, or tile-service acceptance was observed.
- **Assumptions:** the Roadmap's Public rider page can be made available outside one internal research
  organisation; the current tile URL identifies the OSMF Standard service.
- **Confidence:** high that non-commercial/research purpose does not exempt the current Standard tile
  service from visible OSM attribution; high that the Leaflet prefix can be removed; low for any
  unreviewed alternative provider's white-label terms.
- **Validation plan:** after owner choice A, run focused source guards, exact-host interception,
  rendered Public/Admin attribution text/link/no-Leaflet assertions, 320/390 collision checks, and
  full CI. After choice B, validate a new provider/licence brief before source work.
