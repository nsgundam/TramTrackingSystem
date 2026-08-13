# T14 Research and Execution Planning Contract

Status: **Research R0–R10 complete; Plan v1 approved; S15 accepted; S16–S17 ordered; OSM excluded;
exact-handoff gates active**

Owner direction: on 2026-08-12, research the complete remaining T14 problem space and present one
reviewable execution plan before implementing another T14 slice. Re-audit findings must not become
new work automatically.

## 1. Outcome

Produce one evidence-based, deduplicated, dependency-ordered plan for all remaining work related to
T14. The owner must be able to see the complete proposed scope, exclusions, decisions, risks, and
acceptance evidence before approving any further T14 implementation.

This plan does not assume that every open audit finding belongs in T14. Research must explicitly
separate T14 work from regressions, Maintenance, another Roadmap task, external acceptance, and
owner-controlled decisions.

## 2. Planning Baseline and Freeze

| Item | Planning value |
|---|---|
| Repository coordination baseline at plan creation | `9e944f669e472b1f4958bd97d9f6ac4c690189e5` |
| Immutable research evidence baseline | `0d985d8948624cb2134a937ce57f071b53bb1852` |
| Accepted T14 application baseline | `c72feb90e7a35da45d82bac61eb927ab7c55a37c` |
| Accepted T14 set | `T14-S01` through `T14-S11` plus `T14-S13` |
| Existing exceptions | S12 owner-cancelled/Removed and assigned outside this batch; S14 Moved outside T14 on 2026-08-12; neither authorizes source work |
| T14 implementation state during research | Frozen |

R0 recorded the current full Git SHA, changed evidence, and dirty paths. Six uncommitted web paths
owned by `M-20260812-01` are excluded from immutable T14 evidence. The Feedback-role migration is no
longer dirty: it is committed at the research baseline and therefore was assessed as changed
Database/Backend/Security/Readiness evidence, while remaining outside T14 implementation authority.
The user's 2026-08-12 S12 cancellation and later Plan v1 approval/S14 move/Frontend-team OSM
assignment are owner-decision coordination recorded in `docs/decision-queue.md`; R2–R10 consume
that authority without claiming it is source evidence at `0d985d8` or `531ec9e`.
After R0, `M-20260812-01` was independently accepted at handoff `92aedef`, source `cdd69f8`, and
Level 1 record `531ec9e`; it remains outside the accepted T14 application baseline.

## 3. Non-goals

- Do not implement, repair, redesign, or refactor T14 application source during research.
- Do not assign a new stable slice ID or create an implementation handoff from a domain re-audit.
- Do not mark an external, device, provider, human, or deployed unknown as verified from source.
- Do not absorb T9, T11, T13, T15, D-012, Public-UI authority, or provider/licence work into T14.
- Do not treat the earlier finite-closure proposal as approved; closure is evaluated only after the
  complete research and execution plan exist.

The explicitly requested `/admin` entry redirect is tracked separately as
`M-20260812-01`. It is a bounded Maintenance correction, not a T14 slice or evidence that the T14
research is complete.

## 4. Research Inputs

Research must reconcile all of these sources rather than selecting work from one document alone:

- current application/configuration source and deterministic tests;
- `docs/project-knowledge-base.md` and every domain/readiness audit;
- all T14 task specifications and their Git H/S/C/R evidence chains;
- specialist briefs and approved/pending decisions;
- the T14 ledger's registered slices and C01–C16 residual inputs;
- non-T14 Roadmap dependencies T9, T11, T13, and T15;
- operations, research, testing, external-Mobile, physical-device, provider, human, and deployment
  evidence, including explicit evidence that is unavailable.

## 5. Ordered Research Sequence

Each profile is a current-state assessment. Superseded narrative stays in task records and Git, not
as a new chronological appendix in every report.

| Stage | Profile / activity | Required gate | Required output |
|---|---|---|---|
| R0 | Baseline and evidence map | None | Full SHA, dirty-path exclusions, source/doc/test change map, and profile freshness decision. |
| R1 | Discovery | R0 | Complete factual inventory of routes, APIs, schemas, configuration, tests, external boundaries, and missing evidence. |
| R2 | Product | Validated R1 | Required user outcomes, roles/journeys, release-scope gaps, non-goals, and owner decisions. |
| R3 | Architecture | Validated R1–R2 | Boundaries, authoritative state, duplication, dependencies, data flow, and cross-repository constraints. |
| R4 | Backend, Frontend, Database | Validated R1–R3 | Three domain finding sets; they are parallel-eligible but must use the same evidence baseline. |
| R5 | Infrastructure & Device | Validated R4 profiles | Repository/runtime topology, Mobile/ESP32/LoRaWAN separation, physical/provider unknowns, and field gates. |
| R6 | Dashboard & UX | Product, Frontend, Infrastructure & Device validated | Public/Admin/Research journeys, accessibility, responsiveness, performance, truthfulness, and human-evidence gaps. |
| R7 | Security, DevOps & Observability | All preceding domain profiles validated | Trust boundaries, secrets/privacy, logging, CI, operations, recovery, and alert evidence. |
| R8 | Production Readiness | Every domain profile validated | One release-gate assessment; no discovery of a hidden subsystem at this stage. |
| R9 | Finding normalization | R1–R8 validated | One deduplicated finding register with every source finding mapped exactly once. |
| R10 | Execution-plan synthesis | R9 plus resolved owner decisions needed for ordering | Complete proposed work units, dependency graph, acceptance matrix, and owner-review package. |

If a predecessor is stale or blocked, stop at that stage and record the exact missing evidence. Do
not skip forward and do not convert an unknown into a planned implementation assumption.

## 6. Finding Normalization

Every material open finding must receive exactly one classification:

| Classification | Meaning |
|---|---|
| Accepted-outcome regression | The intended behavior already belongs to an accepted slice; repair retains that slice identity. |
| T14 candidate | A genuinely remaining T14 outcome, pending whole-plan review; not yet a slice. |
| Maintenance | A bounded corrective/compatibility/tooling task outside Roadmap ordering. |
| Other Roadmap owner | The work belongs to T9, T11, T13, T15, D-012, or a later synthesized task. |
| External evidence | Deployment, provider, device, human, assistive-technology, field, or operations proof rather than repository source. |
| Owner decision | Product, Public UI, policy, provider/licence, risk, or scope choice that cannot be inferred. |
| Removed / no longer relevant | Duplicate, contradicted, superseded, or unsupported work, with evidence and rationale. |

The normalized record must include origin, current evidence, severity, affected outcome, proposed
classification, dependencies, decision/evidence blockers, and confidence. C01–C16 and S12/S14 are
inputs to this analysis, not pre-approved dispositions.

## 7. Complete Execution-Plan Contract

Before any proposed T14 work can be approved, every work unit in the synthesized plan must state:

1. observable outcome and user/system value;
2. explicit non-goals and ownership boundary;
3. prerequisite work, decisions, and external evidence;
4. candidate exact source/test/document paths with overlap analysis;
5. product, architecture, security/privacy, data/migration, operations, research, and UX impact;
6. cheapest deterministic failing measurement and required regression suites;
7. acceptance criteria, failure paths, stop conditions, and rollback boundary;
8. size/risk estimate and dependency-ordered execution position; and
9. affected audits and evidence required for final acceptance.

Before approval, plan items remain proposals. The owner has now selected S15–S17; their stable IDs
are registered, while exact-path task specifications are still created and committed one at a time
before source work.

## 8. Research Completion Gate

Research is complete only when:

- R1–R8 are validated in predecessor order against recorded compatible baselines;
- every prior finding, open P1/P2/P3 item, S12/S14 question, C01–C16 input, task residual, decision,
  and external unknown is mapped exactly once in the normalized register;
- duplicate or conflicting recommendations are resolved explicitly;
- every proposed work unit satisfies Section 7 and the dependency graph has no cycle or hidden
  owner/external gate;
- release evidence is separated from repository implementation;
- the plan exposes the full proposed set and one recommended order, including items recommended for
  exclusion; and
- the owner approves or revises that full plan before any T14 implementation handoff is created.

## 9. Change Control After Plan Approval

- A re-audit updates evidence and finding state; it does not append a new work unit automatically.
- A regression against an approved/accepted outcome uses that outcome's identity.
- A materially new outcome enters a visible change-request section with impact and dependency
  analysis. The owner decides whether to revise the frozen plan, use Maintenance, or defer it to a
  later Roadmap cycle.
- Implementation re-audits validate only the accepted work unit and do not reopen whole-plan scope
  unless evidence invalidates a dependency or owner decision.

## 10. Owner Review Output

The final review package will contain:

- a one-page current-state summary;
- the deduplicated finding register;
- the complete proposed work-unit table and dependency order;
- owner/external blockers separated from executable repository work;
- recommended inclusions and exclusions with rationale; and
- one explicit approval record for the selected complete plan version.

The package now exists in Sections 11–17. The owner approved Plan v1 on 2026-08-12. Source may begin
only one unit at a time after that unit receives a committed exact-path Level 3 handoff; approval is
not T14 closure.

## 11. R0 Baseline and Evidence Map

Research used immutable HEAD `0d985d8948624cb2134a937ce57f071b53bb1852`, committed at
`2026-08-12T21:23:32+07:00`. The accepted T14 application baseline remains `c72feb9`; the accepted
set remains S01–S11 plus S13, with no accepted-outcome regression found.

The application worktree overlay excluded from immutable T14 evidence is:

- `shuttle-tracking-web/app/admin/page.tsx` and
  `shuttle-tracking-web/tests/admin-entry-route.spec.ts`;
- `shuttle-tracking-web/next.config.ts`, `package.json`, `playwright.config.ts`, and `tsconfig.json`.

Those six web paths belong to separate Maintenance `M-20260812-01`; its exact task record is
`docs/tasks/M-20260812-01-admin-entry-redirect.md`. They demonstrate a local `/admin` to
`/admin/dashboard` correction and successful/unauthenticated journey, but do not become T14 evidence
until independently committed and accepted. Other dirty `docs/` paths are current Level 1 research
synchronization or owner-decision outputs. They are not attributed to Maintenance and do not prove
application behavior. In particular, the S12 cancellation is direct owner authority recorded in
the current `docs/decision-queue.md` overlay, not evidence contained in immutable HEAD `0d985d8`.

Compared with the old Discovery baseline, the committed change set contains accepted T14 frontend/
test work, current design/audit/task records, one backend regression assertion, workflow changes,
and one SQL migration edit. Compared with `c72feb9`, committed application behavior is unchanged
except that SQL edit. The edit adds the new supported-role check before legacy `OPERATOR` conversion,
which can stop the migration on supported legacy data. R1–R8 therefore assessed every profile again
instead of treating only Frontend/Dashboard as stale.

## 12. R1–R8 Validated Synthesis

| Stage | Validated current result |
|---|---|
| R1 Discovery | Route/API/schema/config/test inventory remains coherent; no new T14 application source exists after `c72feb9`; the migration-order blocker and README credential mismatch are newly current non-T14 facts. |
| R2 Product | T14 has no hidden entitlement to T11, T15, D-012, or external acceptance. Approved bounded residual Product value exists only for exact Admin mutation, timestamp, and stop-image outcomes; OSM is removed from T14. |
| R3 Architecture | The modular monolith and data-product boundaries remain appropriate. Generic mutation and canonical-decoder refactors are not justified; Redis recovery and missing operations remain other owners. |
| R4 Backend | No approved T14 outcome needs a backend/API/auth change. T11 and D-012 boundaries remain absent; legacy Admin write hardening is Maintenance. |
| R4 Frontend | Exact residuals and planned measurements are identified. External assets and design-sidecar drift are Maintenance; no broad redesign/dark-theme/cleanup unit is valid. |
| R4 Database | The role-migration ordering is a High release blocker outside T14; no approved T14 outcome needs schema work. |
| R5 Infrastructure & Device | Mobile/ESP32/LoRaWAN/provider/deployment/field facts remain external and cannot be converted into frontend completion. |
| R6 Dashboard & UX | The 15/20 score is a health signal, not seven tasks. Its P1 Research Dashboard belongs to T15; T14 owns only S15–S17 below. |
| R7 Security/DevOps/Observability | S15–S17 remain presentation-only. Migration, Mobile credentials, external assets, durable signals, CI breadth, and production controls keep their separate owners. |
| R8 Production Readiness | Controlled local demo remains Conditional; field trial, internal operations, and public service remain No-Go. Completing S15–S17 does not change that determination. |

## 13. R9 Normalized Finding Register

`RF-*` values are finding references, not Roadmap tasks or slice IDs. Every material residual input
is assigned exactly one primary classification.

| Finding | Origin | Current evidence / severity | Classification and destination | Gate |
|---|---|---|---|---|
| RF-01 | C01 | Feedback note/status updates lack per-case pending/receipt and permit repeated PATCH activation; route-order publish lacks a named busy/completion state. P2, High confidence. | **Approved T14-S15** — narrow Admin operational mutation integrity | Committed exact handoff |
| RF-02 | C02 | Public stop thumbnail/modal raw images lack intrinsic/lazy/decode/error behavior. P2, High source confidence. | **Approved T14-S17** — Public stop-image resilience | Committed exact handoff |
| RF-03 | C03 | Admin vehicle marker depends on a Flaticon CDN; provenance/licence/local availability is absent. P2. | **Maintenance** — Admin asset hardening | Approved local/code-native asset and provenance |
| RF-04 | C04 | Google Material Symbols loads globally for two mounted Public App Tour glyphs. P2. | **Maintenance** — Public asset dependency removal | Public authority if appearance changes |
| RF-05 | C05 | Dashboard is fixed Bangkok/Thai locale; Source Health/Feedback use viewer locale and unsafe invalid-date rendering. P2. | **Approved T14-S16** timestamp work | Committed exact handoff after S15 acceptance |
| RF-06 | C06 | Page request/state logic is similar but intentionally retains DTO/request/target ownership after shared feedback primitives. | **Removed / no longer relevant** | Re-enter only with a failing invariant |
| RF-07 | C07 | Human, AT, usability, and physical-device acceptance is absent. | **External evidence** | Named test plan, participants/devices, intended release stage |
| RF-08 | C08 | Proxy, reconnect/load, provider, and physical evidence is unavailable and spans multiple targets. | **External evidence** — split across T9/T11/T13/T15 | Approved targets and external owners |
| RF-09 | C09 | Sender claim, receipt-time timeout, history, exceptions, and recovery are absent. Critical/High. | **Other Roadmap owner — T11** | Coordinated Backend/Admin/Mobile contract and Android evidence |
| RF-10 | C10 | Research/Dev comparison Dashboard is absent; this is the prior open UX P1. | **Other Roadmap owner — T15** | T13 plus physical/provider/data-definition gates |
| RF-11 | C11 | D-012 lifecycle matrix is approved but not implemented. High release relevance. | **Other Roadmap owner — D-012/later task** | Separate synthesis and target facts |
| RF-12 | C12 | Impeccable reports generated design sidecar stale; inspected semantic content remains broadly aligned. P3 docs. | **Maintenance** — optional sidecar refresh | Explicit `$impeccable document` request |
| RF-13 | C13 | Automatic dark Admin conflicts with fixed-light owner direction. | **Removed / no longer relevant** | New owner visual decision only |
| RF-14 | C14 + S12 | Public hides required OSM credit while the current source still consumes OSM Standard tiles. The owner cancelled this work on 2026-08-12. | **Removed from T14 by owner**; unresolved provider/licence risk remains outside the plan | Before production, separately stop using this provider/basemap or authorize a compliant provider/licence outcome |
| RF-15 | C15 | General Public redesign/unbounded Admin polish has no measurable outcome and conflicts with D-011. | **Removed / no longer relevant** | New bounded owner-approved outcome only |
| RF-16 | C16 | Consumer validators duplicate some structure and differ on optional source identity; S11 intentionally keeps consumer policy separate and no observed bug exists. | **Removed from T14**; future focused Maintenance only if a contract proves drift | Architecture/Security decision plus failing behavior |
| RF-17 | S14 | Optional/general Feedback vehicle association is a new Product/Data/Privacy capability, not an S01 regression. | **Moved outside T14 by owner** | New roadmap/Product/Data/Privacy decision if reopened |
| RF-18 | New R0 | Role constraint precedes supported legacy `OPERATOR` conversion; current test checks text, not execution/order. High. | **Authorized Maintenance — migration safety** | In-place Git-branch source repair selected; per-target history and disposable PostgreSQL evidence required before execution |
| RF-19 | Discovery | Root README advertises `admin123`; seed requires explicit controlled credentials. Medium security/docs. | **Maintenance — credential documentation** | Confirm intended developer provisioning instructions |
| RF-20 | Security | Legacy master-data writes have less consistent parsing/rate limiting than newer boundaries. Medium. | **Maintenance — Backend/Security** | Exact boundary measurement and allowlist |
| RF-21 | Architecture/Security | Redis current state has no durable replay; durable metrics/alerts/recovery/load evidence is absent. High release impact. | **Other Roadmap owner — T13/later operations** | External topology and approved target |
| RF-22 | T10 residual | Actual database/cache/public-read confirmation is not current evidence. | **External evidence** | Approved disposable/staging target |
| RF-23 | T12 residual | Migration, retention/purge, backup, scheduler, staff/rider runtime acceptance is absent. | **External evidence** | Approved staging/operations owners |
| RF-24 | SEC-08 | External Android stores reusable Sender material in ordinary preferences with backup/cleartext enabled. High. | **Other Roadmap owner — T11** | Writable Mobile authority and device acceptance |
| RF-25 | Security history | Removed simulator credential's historical validity/rotation cannot be inferred. | **External evidence** | Authorized credential owner assessment |
| RF-26 | Admin entry | The R0 baseline lacked `/admin`; Maintenance now redirects and tests it at source `cdd69f8`. | **Resolved by Maintenance M-20260812-01** | Accepted separately at `531ec9e`; not T14 |
| RF-27 | T14 history | Accepted outcomes have valid H/S/C/R ancestry, but most slice IDs were assigned retrospectively; S09 had an accepted historical allowlist anomaly. | **Removed / documentation reconciled** | Preserve exact Git/task evidence; do not claim an upfront finite plan existed |
| RF-28 | Security R7 | Dependency, secret-history, SAST, container, live-integration, migration, deployment, restore, and promotion coverage is partial or absent from ordinary CI. High release relevance. | **Other Roadmap owner — T13/DevSecOps** | Approved topology/target, tools, owners, and promotion contract |
| RF-29 | Database R4 | TrackingSource stores current assignment/credential facts but has no effective-dated source/vehicle assignment provenance for later operational explanation. | **Other Roadmap owner — T11/D-012-later design** | Define the operational history question and lifecycle owner before schema work |
| RF-30 | Database R4 / T7 residual | Research retention source exists, but scheduled/multi-instance execution and backup/restore have no runtime proof. | **Other Roadmap owner — T13 operations** | Approved target, scheduler ownership, backup/restore evidence |
| RF-31 | Database R4 / T7 residual | Representative-volume query/export behavior is unverified and no physical/provider comparison dataset exists. | **External evidence — T15 research acceptance** | Reproducible dataset/protocol, physical/provider facts, approved target |
| RF-32 | Database R4 | `GPSTrack` is sampled canonical operational history, not raw or event-complete evidence. Treating it as raw remains an unsafe claim, not a missing T14 UI feature. | **Removed / preserve semantic constraint**; any new history product belongs to T11/T15 | New Product/Data contract before changing storage or claims |

There is **no accepted-outcome regression** at the immutable T14 application baseline. If one later
appears, it must reuse its accepted outcome identity rather than becoming a new plan item.

The old score maps without hidden work: P1 → RF-10; repository P2 clusters → RF-01 through RF-05;
P3 → RF-12. External and other-Roadmap blockers remain visible but are not T14 score-generated
slices.

## 14. R10 Proposed T14 Work Units

The owner approved these outcomes on 2026-08-12. Their registered stable identities are S15, S16,
and S17, but this table is not a task spec or source authority; each still requires its own committed
exact-path handoff.

| Proposal | Observable value | Prerequisite | Risk / size | Recommended position |
|---|---|---|---|---:|
| WP-A / S15 — Admin operational mutation integrity | Prevent duplicate case updates; expose pending, retained failure/retry, and completion to visual/screen-reader users | Approved; exact handoff required | Medium / Small–Medium | 1 |
| WP-B / S16 — Admin timestamp contract | Deterministic, truthful dates/deadlines across Dashboard, Source Health, and Feedback | Approved timestamp policy; accepted S15; M-20260812-02 then M-20260813-01 accepted first; exact handoff required | Medium / Small | 2 |
| WP-C — OSM attribution/endpoint alignment | **Removed by owner on 2026-08-12** | No implementation | — | — |
| WP-D / S17 — Public stop-image resilience | Stable image layout and truthful failure behavior without redesign | Public fallback authority approved; exact handoff required | Medium / Small | 3 |

### WP-A — Admin operational mutation integrity

1. **Outcome/value:** Feedback note/status and route-order publish issue one pending request, expose a
   programmatically named busy state, retain actionable failure/retry, and announce completion.
2. **Non-goals:** no endpoint, body, status graph, T10 order rule, sensitive delete/restore,
   re-authentication, role, backend, schema, Public, Login, or theme change.
3. **Prerequisite:** Plan v1 approval plus S15's committed exact-path handoff.
4. **Candidate paths/overlap:** `app/admin/feedback/page.tsx`,
   `components/admin/RouteStopsModal.tsx`, their existing operations/master-data browser specs, and
   an existing shared feedback primitive only if required. WP-B overlaps Feedback and therefore
   follows WP-A.
5. **Impact:** Product/UX and client reliability only; authorization/data/security semantics remain
   server-owned; no migration/operations/research effect.
6. **First failing measurement:** hold PATCH/PUT responses; repeat activation produces one request;
   assert `aria-busy`/named pending, retained draft/order and Retry on failure, exact payload, and a
   polite receipt after success.
7. **Acceptance:** exact incumbent requests/status transitions, note clearing only after success,
   route order, focus, sensitive-dialog behavior, roles, 390 px layout, Admin accessibility, and full
   repository gates pass.
8. **Stop/rollback:** stop if a new server contract, global toast framework, path, or policy is
   needed; rollback is the bounded frontend/test delta.
9. **Affected audits/evidence:** Product, Frontend, Dashboard & UX, Production Readiness become stale
   for the exact delta; local browser evidence cannot change release status.

### WP-B — Admin timestamp contract

1. **Outcome/value:** one typed formatter produces deterministic valid/missing/invalid/offset output
   across three Admin surfaces and accurately labels the display zone.
2. **Non-goals:** no stored timestamp, API, schema, retention cutoff, receipt-time, expiry, or status
   change.
3. **Prerequisite:** approved policy recorded; accepted S15; accepted `M-20260812-02` then
   `M-20260813-01`; and S16's committed exact-path handoff. M-20260813-01 and S16 are serialized
   because both touch Feedback.
4. **Candidate paths/overlap:** a new typed Admin timestamp utility; Dashboard, Source Health, and
   Feedback pages; focused pure tests plus existing Admin browser specs.
5. **Impact:** UX/i18n presentation only. Parsing accepts `unknown`/string at the display edge and
   fails safely; data/research semantics stay unchanged.
6. **First failing measurement:** run valid UTC/offset, invalid, null, and different process-timezone
   fixtures; current page-local output must fail the chosen deterministic contract.
7. **Acceptance:** consistent zone-labelled output, no `Invalid Date`, semantic distinction between
   true `Never` and invalid/unavailable data, preserved deadlines/status, and full Admin regressions.
8. **Stop/rollback:** stop on server/storage semantics or translation expansion; rollback is the
   formatter/consumer/test delta.
9. **Affected audits/evidence:** Product, Architecture, Frontend, Dashboard & UX; no production gate
   changes.

Approved policy: English Admin copy using `en-GB`, 24-hour display in `Asia/Bangkok`, a visible
`Bangkok time`/`ICT` label where context is not otherwise explicit, `Unavailable` for malformed data,
and `Never` only for a domain-confirmed never-seen source.

### WP-C — OSM alignment — Removed

The owner cancelled OSM work on 2026-08-12. S12 is terminally Removed from the T14 plan; its dormant
handoff is closed and must never be resumed as implicit authority. No source is changed by this
decision. Because the current application still requests OSM Standard tiles while hiding Public
credit, the underlying provider/licence risk remains a Production stop condition outside T14. A
future decision must either remove that basemap/provider from runtime or create a new, separately
authorized compliant provider/licence outcome. Research will not replace cancellation with another
T14 slice.

### WP-D — Public stop-image resilience

1. **Outcome/value:** successful images retain incumbent composition; reserved geometry, bounded
   thumbnail load/decode policy, and a named failure fallback prevent broken-image interaction.
2. **Non-goals:** no provider/storage/API, stop data, map, ETA, modal focus lifecycle, copy hierarchy,
   or Public redesign.
3. **Prerequisite:** bounded Public fallback authority is approved. It has no dependency on removed
   WP-C; execute in the approved sequence after accepted S16 and S17's committed exact-path
   handoff.
4. **Candidate paths/overlap:** `components/public/StopInfoCard.tsx`, scoped style only if measured,
   and existing map-quality/accessibility browser specs.
5. **Impact:** Public UX/performance only; do not introduce proxying, tracking, arbitrary HTML, new
   domains, or image-persistence behavior.
6. **First failing measurement:** deterministic success/404 image routes at 320/390; assert reserved
   geometry, load policy, named fallback, no broken dialog, and stable focus/Escape/restoration.
7. **Acceptance:** successful image/expansion unchanged, failure truthful and keyboard-safe, no
   horizontal/layout instability, selected-stop/ETA/map behavior preserved, and full Public gates.
8. **Stop/rollback:** stop on storage/provider/copy redesign or another path; rollback is bounded
   component/test/style work.
9. **Affected audits/evidence:** Product, Frontend, Dashboard & UX, Production Readiness; deployed
   image-provider performance remains external.

## 15. Work Outside T14

| Lane | Recommended handling | Relationship to T14 |
|---|---|---|
| Migration safety RF-18 | Highest-priority bounded Database Maintenance before any target rollout | Independent of local T14 coding; blocks release/migration acceptance |
| Admin-entry RF-26 | Accepted `M-20260812-01` at source `cdd69f8` / Level 1 record `531ec9e` | Complete outside T14; never a T14 slice |
| Assets RF-03/RF-04 | Separate Admin and Public Maintenance units after licence/Public gates | Do not broaden WP-D automatically |
| Docs RF-12/RF-19 | Optional sidecar refresh and credential-instruction correction | Documentation Maintenance |
| Backend boundary RF-20 | Exact measured Security/Backend Maintenance | No frontend/T14 absorption |
| T11 RF-09/RF-24/RF-29 | Coordinated sender/Trip/history/recovery/Mobile work, including the bounded assignment-history question | Release dependency, not T14 |
| D-012 RF-11/RF-29 | Later cross-domain lifecycle synthesis; RF-29 ownership is fixed before any schema work | Explicitly outside T11/T12/T14 |
| T13 RF-21/RF-28/RF-30 plus T9 facts | Deployment, recovery, observability, CI/DevSecOps, research scheduling and backup evidence | Keeps production No-Go independent of T14 |
| T15 RF-10/RF-31 plus physical research | Research Dashboard, representative data behavior, and field comparison | The old P1 does not generate T14 work |
| Data-semantic RF-32 | Preserve `GPSTrack` as sampled canonical history; route any new history product to T11/T15 | No T14 implementation finding |
| External RF-07/RF-08/RF-22/RF-23/RF-25 | Named approved targets and evidence plans | Never mark complete from source/browser fixtures |

## 16. Dependency Graph and Recommended Order

```text
Owner approved Plan v1
├─ T14 S15 Admin mutation integrity ──> accepted
├─ M-20260812-02 in-place branch-source repair (Maintenance; no target execution)
│  └─ M-20260813-01 ADMIN active Feedback read-only (Maintenance)
│     └─ S16 Admin timestamp contract
├─ WP-C/S12 OSM ──> Removed by owner; no T14 continuation
├─ accepted S16 + approved Public authority ──> S17 stop-image resilience
└─ S14 ──> Moved outside T14
```

There is no cycle. S15 is accepted. `M-20260812-02` then `M-20260813-01` run before S16 as explicit
Maintenance prerequisites; they do not add or reorder a T14 slice. M-20260813-01 and S16 are
serialized because both touch Feedback. S17 follows under the owner-approved batch order and is
independent of removed S12. RF-18's unknown local/shared/staging target history and disposable
evidence remain gates before any target execution, not evidence produced by source repair. Other
Roadmap and external-evidence lanes do not become hidden prerequisites for local T14 implementation,
but their unresolved state continues to block release claims.

## 17. Owner Review and Approval Record

- Plan version: **T14 Research Plan v1 — 2026-08-12**
- Research state: **Complete**
- Implementation state: **Approved batch; one exact handoff/source unit at a time**

Owner response recorded on 2026-08-12:

1. WP-A is approved and registered as S15;
2. the recommended `en-GB` / `Asia/Bangkok` / 24-hour / visible `ICT` / safe-fallback policy is
   approved for S16;
3. the bounded Public image-failure fallback is approved for S17; and
4. S14 optional/general Feedback is Moved outside T14.

Recorded owner decision: **WP-C/S12 OSM work is cancelled and Removed from T14**. This does not
claim the current provider/licence finding is resolved. Licence/attribution work is left to the
Frontend team and is outside this Agent batch.

The owner also authorized a separate RF-18 migration-safety Maintenance repair before any target
rollout. On 2026-08-13 the owner confirmed that the source change exists only on this Git branch and
the migration never ran on production, selecting an in-place repair of this branch's migration
source. Local/shared/staging target history remains unknown; no database execution is authorized.
The owner also approved `M-20260813-01`: `ADMIN` may read active, non-deleted Feedback and existing
internal-note text, while every mutation plus deleted/recovery read stays `SUPER_ADMIN`/`DEV`. This
Maintenance follows M-20260812-02 and precedes overlapping S16 without becoming a T14 slice.
The Main Agent must still create and commit one exact-path Level 3 handoff per work unit before
source implementation; the removed S12 handoff may not be revived.
