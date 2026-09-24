# Experience quality contract

This contract is the reusable quality floor for a materially new or materially changed website, app, or connected product experience. It prevents a founder from becoming the first person to discover clipping, weak story structure, unclear journeys, generic conversion logic, or device-inappropriate interaction.

`build-apps-with-krish` owns orchestration of this contract. `krish-design` still owns taste and material visual approval, `krish-build` owns implementation, `ux-testing-agent` owns observed task evidence, and `verification-loop` owns the completion verdict. A panel never replaces Krish's approval of a material surface.

## Required project adapter

Each governed project must keep one machine-readable experience-quality profile in its repository and validate it in the project's normal QA entry point. The profile must conform to `experience-quality-profile.schema.json` and name:

- the canonical project state route;
- the exact owners for orchestration, taste, implementation, task validation, completion, material approval, exceptions, and release;
- every material surface and required device class;
- the deterministic checks that must pass before a rendered artifact is shown for material review;
- the continuity fields and journey tasks that must be evidenced;
- at least six independent specialist juror identities whose combined scopes cover every required discipline;
- candidate, runtime, rubric, evidence, and verdict provenance;
- automated browser and physical assistive-device release evidence;
- the commands that validate definitions, review readiness, continuity, blind judging, and final status.

It must also define a **brief-fidelity hard gate**. Before concept judging or rendering, the candidate must trace every material choice to the accepted owner direction and identify every omission, contradiction, substituted governing metaphor, and rejected pattern. An unresolved omission or contradiction is a fail. Visual polish, feasibility, originality, panel consensus, or score cannot compensate for failing the accepted brief. A judge may help choose among faithful candidates; it may not rewrite the owner's direction.

Repository-specific rules may exceed this contract. They may not weaken it silently.

## Two independent quality layers

### Continuity guardians

Guardians know the full accepted contract and history. They test whether approved intent and prior fixes survive implementation. Every applicable observation must contain `route`, `viewport`, `action`, `expected`, `observed`, and `evidence`. A missing, failed, inconclusive, stale, or candidate-mismatched observation blocks the gate.

### Blind specialist panel

Blind jurors receive the frozen candidate, neutral rubric, assigned routes/viewports, and candidate-bound evidence only. They do not receive owner complaints, desired fixes, iteration history, prior scores, or one another's verdicts. At least six independent juror identities are required; one executor impersonating several roles is not independence.

The panel must include distinct coverage for:

- product truth and claim integrity;
- storyboard and narrative progression;
- information architecture, active guidance, and conversion trust;
- visual craft, space, typography, and design-system integrity;
- device-specific interaction, motion, and scroll causality;
- accessibility, assistive technology, responsive layout, and technical reliability;
- content clarity and human voice;
- originality, emotional lift, and brand specificity;
- functional state, consequence, persistence, and recovery;
- evidence provenance and candidate/runtime identity.

Scores and consensus cannot override it: a failed hard gate, continuity failure, missing role, missing route, missing viewport, or inconclusive item blocks the applicable gate.

## Human-review readiness gate

Before Krish sees a rendered material surface, the exact artifact must pass applicable deterministic and rendered checks for:

- artifact and runtime identity;
- fresh capture from a self-owned runtime, never an ambient or unknown server;
- broken links, inert controls, and missing assets;
- overlap, clipping, truncation, hidden overflow, and accidental horizontal scroll;
- logo, container, grid, baseline, and component alignment;
- text wrapping, awkward orphans, minimum/maximum content, and zoom/reflow;
- contrast, focus, keyboard operation, touch targets, and reduced motion;
- sticky/fixed chrome, browser chrome, safe areas, shallow desktop height, and physical taskbar/home-indicator clearance;
- section height and any declared one-screen fit contract;
- duplicate components, repeated claims, placeholder/debug copy, and backup-singer instructions;
- console/network failures that affect the user;
- the route, viewport, state, timestamp, candidate identity, and evidence hash.

Any applicable `fail`, `inconclusive`, or `not_run` result blocks presentation. The producer may correct routine implementation defects and rerun the gate without asking Krish. A material change returns to `krish-design`'s approval boundary.

## Executable presentation firewall

Written rules are not an enforcement mechanism. Every governed project must expose one fail-closed presentation command named by its project profile. That command is the only valid route for presenting a rendered material candidate to Krish. It must refuse to produce or serve a review URL unless all of these are true for the exact current bytes:

- a machine-readable candidate manifest identifies the artifact, files, route, integration model and required evidence;
- the candidate is an integrated production candidate, not a component gallery, fixture, iframe assembly, parity harness or static frame collection;
- one page-level DOM and scroll context owns the journey when the accepted experience requires cross-section scroll choreography;
- a candidate-bound receipt records every required readiness check as `pass` and contains no `fail`, `inconclusive`, `not_run`, `stale`, `mismatch` or `missing` result;
- continuous forward and reverse journey evidence exists for every required device class and every declared scroll-driven section;
- continuity evidence, reconciled-feedback evidence and independent specialist evidence all match the candidate digest;
- the receipt is still fresh and every cited evidence file exists with the recorded digest.

Direct prototype URLs are reference material only. They are never evidence of review readiness and must not be handed to Krish as a candidate. The project must keep an adversarial self-test that proves the firewall rejects at least: an embedded-frame assembly, missing scroll evidence, stale candidate evidence, mismatched judge evidence, unresolved blocking feedback and a forged pass receipt. The normal repository build or CI path must run that self-test so a weakened firewall cannot merge silently.

This makes bypass fail closed inside the governed build, review and agent workflow. It does not claim that a person with arbitrary filesystem and source-control authority is physically unable to delete the controls. Such a deletion must be visible as a code change and must fail the harness and project regression gates.

## Narrative and journey gate

The experience must be evaluated as a storyboard, not a collection of attractive frames. For each route and device class, record:

1. what the visitor notices first;
2. what belief or question changes in each major section;
3. why that section exists and what would be lost if removed;
4. what action or next belief the section hands off to;
5. where proof appears relative to the claim that creates the need for it;
6. whether the primary action is discoverable, timely, and clear in consequence;
7. whether repeated copy, instruments, imagery, or interactions perform a genuinely different job;
8. whether mobile is independently sequenced for interruption, one-handed use, scroll economy, and resume.

If instructions are needed to explain normal navigation or interaction, first treat that as evidence that the visual cues, information architecture, or interaction model may be wrong. Necessary safety, accessibility, consent, pricing, and consequence copy is not "backup-singer" text.

## Brief-fidelity gate

Before divergence, synthesis, or material review, freeze a candidate trace containing:

1. the accepted owner outcomes and experience qualities;
2. the exact authoritative state, approvals, feedback, assets, and locked surfaces used;
3. the required story beats, interaction principles, device rules, content/data constraints, and commercial invariants;
4. rejected patterns and prior failures that must not return;
5. a candidate-to-requirement mapping for every material choice;
6. explicit omissions and contradictions, each resolved or blocked;
7. a plain-language answer to: “Is this recognisably the direction Krish approved, or a new idea wearing its words?”

Only candidates with no unresolved omission, contradiction, or unauthorised governing substitution may reach taste judging. If Krish rejects a material spine as unrelated or random, freeze it as rejected evidence, stop patching it, update the lowest owning hard gate, and restart from the accepted direction. Do not ask him to repeat recorded feedback.

## Feedback reconciliation gate

Every governed project must keep one machine-readable feedback ledger named by its experience-quality profile. Capture the owner's exact words before interpretation and bind each item to the surface, section, device and element it concerns. Each item must state its classification, required observable outcome, acceptance test, status, resolution and evidence.

Choice capture and approval are separate states. A `done`, saved or submitted selection means the choices and commentary were received for reconciliation. It is not blanket approval of defaults, a production lock, implementation authority or release authority. The final readback must show every decision note and the overall note verbatim, not merely count them. The working response must map each note to its interpretation, required action and unresolved state.

An item in `open` or `implemented-awaiting-review` blocks material approval of its surface. Mechanical criteria may move to `verified` after their declared acceptance test passes. Taste, meaning, priority and owner-intent criteria require Krish's explicit acceptance before they move to `accepted`. A later correction supersedes rather than rewrites the historical item.

Continuity guardians receive the full applicable ledger. Blind jurors remain blind to owner history and receive only neutral candidate-bound requirements derived from resolved constraints; they do not receive complaint wording or desired fixes. A judge verdict that ignores an applicable requirement is incomplete.

## Device-specific interaction gate

Desktop and mobile are separate composed experiences, not merely viewport widths. Verify the actual input model, browser chrome, orientation, interruption/resume behavior, safe areas, text enlargement, and reduced-motion path. Emulation accelerates iteration but cannot satisfy a release requirement for a named physical device.

For final release, automate Chromium, WebKit, and Firefox where applicable and retain current physical evidence for iPhone Safari with VoiceOver and Android Chrome with TalkBack. Unavailable physical evidence is `not_run`, never an inferred pass.

## Evidence and provenance

Every run is immutable and bound to the exact candidate, runtime revision, profile, rubric, capture manifest, and submitted verdicts by digest or equivalent immutable identity. Evidence files must exist inside the frozen run, match recorded hashes, and be cited by observation ID. Stale screenshots, another checkout, another server, another revision, or uncited prose cannot support a pass.

The producing agent may run mechanical checks but cannot be the sole qualitative judge. Jurors must have distinct context IDs, executor identities, and attestations. Duplicated, contaminated, tampered, stale, low-confidence, incomplete, or unbound submissions are invalid.

## Gate semantics

- **Material review ready:** all applicable human-review readiness checks pass for the exact rendered artifact and the executable presentation firewall has issued a current candidate-bound receipt. This does not mean the surface is approved.
- **Material approved:** Krish explicitly approves the rendered revision. This does not authorize implementation beyond the named scope or any release.
- **Implementation ready:** the approved rule is represented in shared components/content contracts and deterministic checks pass.
- **Release ready:** continuity is fully green; all required specialist verdicts are valid; every hard gate passes; all routes and required devices work; physical evidence is complete; and every material surface is owner-approved.
- **World-class winner:** release-ready plus the project's predeclared winner thresholds pass on desktop and mobile. A panel score never substitutes for material approval.
- **Live and verified:** the separately authorized release is deployed and the actual production revision, behavior, state, and pixels have been checked.

Built, committed, merged, previewed, deployed, live, release-ready, world-class, and verified are separate literal states.

## Learning and durability

Every direct correction or repeated objective failure must become one of: a project feedback-ledger item, project hard gate, shared token/component/content contract, deterministic check, adversarial fixture, continuity ruling, or held-out harness regression. Update the single owning layer. Do not duplicate doctrine across skills, and do not let the same model silently lower the standard that judges its own output.

Owner: Krish Raja. First accepted as a cross-project quality requirement on 2026-09-23 after repeated Mindmake redesign failures exposed missing review-readiness, narrative, conversion, design-system, device-specific, and evidence-binding gates.
