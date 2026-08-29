# Skill routing contract

This file decides which skill runs, in what order, and which apparent matches must be ignored. It is the deterministic layer above individual skill descriptions.

## Routing principles

1. Apply `krish-operating-contract.md` and `krish-principles` to every request.
2. Classify the request before loading a skill: domain context, strategy, artifact capability, validation, or standards maintenance.
3. The narrowest applicable skill wins. A broad `mandatory` or `always` claim inside a skill never overrides this router.
4. Use one primary writer. Validators may stack after the writer; two competing writers may not.
5. Load domain context before an artifact skill, use `strategy-brief` before material execution, and run `verification-loop` afterward.
6. If two skills still conflict, prefer the newer reviewed release only when its provenance and compatibility are known. Otherwise stop and record a routing collision.
7. Record the route for material work as: `principles -> conditional intent briefing -> context -> strategy -> producer -> verification -> approval gate -> delivery`.

## Global chain

- `krish-principles` is always on. A narrower skill may specialize it but never suppress it.
- `take-the-brief` runs before `strategy-brief` only when Krish explicitly requests a pre-work interview or transfers new, materially ambiguous, or high-stakes end-to-end ownership. It stays out of clear, urgent, routine, and already-briefed work.
- `strategy-brief` runs before execution. For routine reversible work it may be compressed to the objective, route, and check; for material work it produces the full brief.
- `verification-loop` runs after execution and after any corrective change. Verification uses artifact-appropriate evidence and does not inherit permission to mutate external state.
- Pure social conversation does not need an artificial execution report. Factual answers still require proportionate source checking when freshness or stakes demand it.

## Core routes

| Request | Context | Primary producer | Verification |
|---|---|---|---|
| Explicit pre-work interview or materially ambiguous end-to-end task handoff | `take-the-brief` elicits task intent; then relevant domain context | `strategy-brief`, then the narrow task producer | Clear-win criteria pass to `verification-loop` |
| Mindmaker OS architecture, fleet, Control Center, Supabase, OpenClaw, or reconciliation | `mindmaker-os` | Task-specific tool or skill | Live-state check plus revision/hash |
| n8n workflow design, execution diagnosis, or runtime operation | `mindmaker-os` first only for Krish's existing OS fleet | `n8n-operator` | Live definition, execution, downstream outcome, and rollback readback |
| Instantly campaign, lead, analytics, webhook, or API operation | Relevant offer context; `krish-content-marketer` for targeting/sequence and `krish-voice` for final copy | `instantly-operator`; add `n8n-operator` only for workflow wiring | Official live API contract, provider readback, counts/job, and business outcome |
| Mindmaker commercial offer, positioning, or client work | `mindmaker` | Task-specific commercial skill | Source and claim check |
| Outbound writing under Krish's name | Relevant domain skill, then `content-corpus` when evidence is needed | `krish-voice` | Source check and Krish Voice kill-list pass |
| Content strategy or angle generation | Relevant domain skill, then `content-corpus` | `krish-content-marketer` | `krish-voice` only when drafting the final artifact |
| Software implementation | Relevant domain skill | `krish-build` | Tests/build, then `code-reviewer` for material changes |
| Product or interface design | Relevant domain skill; `design-intelligence-search` only when the design owner explicitly requests one bounded corpus query | `krish-design` | `ux-foundations`, then observable browser/UX QA |
| New app or material cross-surface product redesign | Relevant domain skill | `build-apps-with-krish` orchestrates; `krish-design` and `krish-build` own their stages | Stage gates, `verification-loop`, then `ux-testing-agent` for release tasks |
| App or repository UX testing | Relevant domain skill | `ux-testing-agent` | Evidence bundle and reproducible findings |
| Skill creation or revision | Relevant domain skill | `skill-creator` | Frontmatter, trigger, behavior, security, and packaging evals |
| Surgical change to an approved, final, or locked artifact | Relevant domain context and the artifact-format producer | `locked-revision` controls the immutable baseline, declarative delta, and rebuild scope | Exact allowed-diff proof plus format-specific checks and recoverable prior release |
| Exact first-message launch `Video engine` or explicit `$video-engine` invocation | `video-engine` launcher | Latest `krishanraja/mindmake-video-studio` `main` and its repository-owned workflow | `studio doctor`, job-list status, repository gates, and private-only publication policy |
| Harness/configuration audit | `mindmaker-os` when OS-related | No prose producer | Deterministic harness audit; model critique is supplemental |
| Research, comparison, due diligence, or current external evidence | Relevant domain skill | `evidence-research` | Claim-evidence, contradiction, freshness, and citation-support checks |
| Record, recall, review, supersede, or reverse a finalized consequential decision | Owning domain skill; `mindmaker-os` for live OS state | `decision-ledger` | Authoritative readback, lifecycle-link, redaction, and trigger check |

## Collision rules

- `ux-foundations` replaces the retired generic cloud skills `strategy`, `ux-design`, `ux-concepts`, `ux-toolkit`, `design`, `ux`, `ux-principles`, `ab-test-plan`, and `design-system-builder`. Do not enable both generations.
- `data-pipeline-architect` is the design/planning route; `data-pipeline` is the implementation route. If a request spans both, plan first and implement second.
- `krish-voice` owns final prose voice. `krish-content-marketer` owns strategy and angle selection; it does not override the voice pass.
- `mindmaker-os` owns operating-system architecture and live-state routing. `mindmaker` owns the commercial brand. Load both only when the work genuinely crosses the boundary.
- `code-reviewer`, `ctrl-check`, and deterministic tests are validators, not competing producers.
- `build-apps-with-krish` owns the stateful journey across connected surfaces or multiple material app-delivery stages. `krish-design` still owns visual taste and the one-rendered-surface approval gate; `krish-build` still owns implementation. Route an isolated design, code, or QA task directly to its narrow owner. Generic app-building skills may supply a bounded mechanic but never replace this personalized orchestrator.
- `design-intelligence-search` is a manual-only, read-only subordinate of `krish-design` or `build-apps-with-krish`. It may widen one named concept arm with pinned product, style, palette, type, landing, icon, chart, motion, or mobile-web candidates. It never triggers from a generic design/build/review request, never feeds every divergence arm, and never owns taste, current UX standards, code, persistence, QA, or accessibility claims. The upstream UI/UX Pro Max workflow, installer, auto-trigger language, persistence, and generic `ux`, `web`, `react`, and stack authority remain suppressed.
- `mindmaker-os` owns current fleet identity, architecture, database dependencies, and acceptance criteria. `n8n-operator` owns provider-specific workflow mechanics and approved n8n actions. Legacy `N8N`, `n8n`, `n8n-cli`, `fleet-ops`, and `krish-fleet-ops` must not remain active beside these routes.
- `krish-content-marketer` owns outbound targeting, sequence logic, proof, and CTA; `krish-voice` owns final email copy; `instantly-operator` owns only provider mechanics. Legacy `instantly` and `krish-outbound` are extraction sources, not competing production writers.
- `decision-ledger` stores finalized consequential choices. `mindmaker-os` owns the unresolved `decisions_waiting` queue and concept-closure runtime; the Assumption Ledger owns falsifiable beliefs; `ctrl-capture` owns observations and proposed standard changes. Link these artifacts without merging their state.
- `take-the-brief` captures task-specific intent before ownership transfer. `strategy-brief` converts that intent into the execution route, authority boundary, and verification plan. `ctrl-intake` elicits durable taste and quality standards from graded artifacts. Do not use any one as a substitute for the others.
- Generic marketplace skills never become always-on merely because they are installed. They must occupy a named route here first.
- `locked-revision` is a change-control wrapper for an identified approved baseline, not a replacement for document, spreadsheet, presentation, video, design, or code producers. It may stack with the narrow format owner, but it owns the declared delta and non-regression gate. Keep it out of first drafts, broad redesigns, and ordinary edits without a locked baseline.
- `video-engine` activates only from the exact first-message launcher after allowed trimming/punctuation or explicit `$video-engine`. Ordinary mentions of video, editing, captions, rendering, YouTube, Shorts, or a "video engine" remain with the applicable general capability. After a valid launch, the latest Video Engine repository is authoritative and the installed skill remains a thin pointer.

## CTRL standards chain

The CTRL chain is for creating or changing a reusable standard. It is not the default route for routine work.

1. `ctrl-intake`: stages 1-2, INGEST and SORT.
2. `ctrl-compile`: stage 3, COMPILE.
3. `ctrl-build`: stage 4, GENERATE.
4. `ctrl-check`: stages 5-7, SCRUB, CRITIQUE, and PROVENANCE + MEASURE.
5. Stage 8, DELIVER, is the explicit human-approved installation or publication step. No skill silently performs it.
6. `ctrl-capture`: stage 9, LEARN. It proposes evidence-backed changes; a named human accepts or rejects each one.

Never skip from intake to build, allow capture to edit a standard directly, or treat self-critique as an independent verifier.

## Approval gates

Explicit approval is required immediately before any cloud upload, enable/disable action, skill deletion, credential rotation/revocation, protected-folder move, directory-link replacement, publication, send, charge, or irreversible external mutation.

Approval applies to the named action and targets only. It does not transfer to later stages.

## Required route evidence

For material outputs, record:

- selected skills and why each was selected;
- skills deliberately suppressed because of a collision;
- source revisions and retrieval times for dynamic facts;
- deterministic checks run and their results;
- inferred findings that remain unverified;
- the exact action still behind an approval gate.
