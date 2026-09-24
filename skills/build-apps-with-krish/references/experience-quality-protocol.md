# Experience quality protocol

Use this reference for every material website/app rebuild, every rendered material review, and every release-readiness or world-class claim. The canonical doctrine is `contract/experience-quality-contract.md` when the harness repository is available; this packaged reference is its portable orchestration subset.

## Project profile

Require one repository-owned machine-readable experience-quality profile before the first material review. It must name the state route, owners, surfaces, coverage disciplines, readiness checks, continuity fields, independent blind roles, release devices, and executable commands. Validate it with `scripts/validate-experience-quality-profile.mjs` when the harness repository is available, then add an equivalent project-local validator to the project's normal QA entry point.

Project rules may add gates. They may not silently remove a required discipline, turn `not_run` into pass, delegate material approval, or infer physical-device evidence.

## Brief-fidelity firewall

Before divergence, synthesis, judging or rendering, bind the work to the accepted owner direction. Record the authoritative state/approval/feedback sources, required outcomes and story beats, device and interaction principles, content/data constraints, locked surfaces, rejected patterns, and a candidate-to-requirement mapping. List omissions and contradictions explicitly.

An unresolved omission, contradiction, or unauthorised replacement of the governing idea blocks the candidate. Judges may select among faithful candidates; they cannot trade brief fidelity for originality, feasibility, visual polish, or consensus. Ask: “Is this recognisably the direction Krish approved, or a new idea wearing its words?” If the latter, reject it before rendering. After an owner rules that a material candidate is unrelated or random, freeze it as rejected evidence and reset from the accepted direction; never patch it into compliance or ask the owner to repeat recorded feedback.

## Feedback reconciliation

Require one project-owned machine-readable feedback ledger. For every item preserve the exact feedback, source, surface, section, device, element, classification, required outcome, acceptance test, status, resolution and evidence. Do not replace a note with a summary or a count.

A completed review form submits choices and notes for reconciliation. It does not approve defaults, lock production or waive a correction. Read back every decision note and the overall note in full, then map each to the interpretation, action and unresolved state. `open` and `implemented-awaiting-review` block material approval. Mechanical items may become `verified` from their acceptance evidence; taste or intent items need explicit owner acceptance. Give continuity guardians the applicable ledger. Keep blind jurors free of complaint wording and desired fixes.

## Presentation firewall

Before showing Krish any rendered material surface, run the exact candidate through the profile's human-review readiness command. The command must use a self-owned fresh runtime and candidate-bound evidence. It must block on any applicable failure, inconclusive result, or unrun check covering:

- identity and freshness;
- links, controls, assets, console/network impact;
- overflow, overlap, clipping, truncation, accidental horizontal scroll;
- logo/container/grid/component alignment;
- wrapping, orphans, content range, zoom/reflow;
- contrast, keyboard/focus/semantics, touch targets, reduced motion;
- shallow height, fixed chrome, safe areas, taskbar/home indicator, orientation;
- declared one-screen/section-fit contracts;
- duplicated components/claims and placeholder, debug, or backup-singer copy.

Routine defects found here are corrected and rerun autonomously. Material changes return to the design gate. Krish should supply taste judgment, not first-line QA.

The profile's presentation command is the only valid handoff route. It must recompute the candidate digest, validate the current receipt and cited evidence, reject embedded-frame or multi-scroll-context synthesis, verify forward and reverse journey coverage, check continuity and unresolved feedback, and validate independent specialist evidence before it emits or serves a review URL. A prototype URL opened directly is reference-only and cannot be called a candidate review.

The project must keep adversarial regression fixtures for a stale receipt, a forged receipt, candidate digest mismatch, iframe assembly, missing motion or reverse-scroll evidence, unresolved blocking feedback and judge evidence from another candidate. Its normal CI path must run them. A missing or weakened self-test blocks review readiness.

## Coverage matrix

The project profile and evidence must cover all of:

1. product truth;
2. storyboard and narrative progression;
3. information architecture and active guidance;
4. conversion and trust;
5. visual craft;
6. design-system integrity;
7. device-specific interaction;
8. motion and scroll causality;
9. accessibility and assistive technology;
10. content clarity and human voice;
11. functional state, consequence, persistence, and recovery;
12. responsive layout;
13. performance and technical reliability;
14. originality and brand specificity;
15. evidence provenance.

Do not create generic jurors that all review the same screenshot. Give each specialist a distinct mandate, route/viewports, journey tasks, and evidence. The union must cover the matrix.

## Storyboard and journey evidence

For every major section, capture: first notice; visitor belief before; section job; state/interaction that carries meaning; belief after; handoff to the next belief or action; proof relationship; removable/redundant verdict. For mobile, also capture interruption cost, scroll economy, one-handed action, browser-chrome behavior, and resume.

The conversion specialist must test whether the right person recognizes themselves, understands the outcome, encounters proof when doubt occurs, knows the next action and consequence, and can recover. Global navigation or a footer link alone is not contextual guidance.

## Independent layers

- Continuity guardians know the accepted history and return route, viewport, action, expected, observed, and evidence for every applicable ruling.
- Blind specialist jurors see only the neutral rubric, frozen candidate, assigned surfaces, and candidate-bound evidence. They do not see owner feedback, iteration history, or other verdicts.
- `ux-testing-agent` executes the task-first runtime layer.
- `verification-loop` checks completeness, provenance, hard gates, and the literal final status.
- Krish alone approves material surfaces and exceptions.

One hard-gate failure, continuity failure, missing discipline, missing evidence, invalid submission, or inconclusive item blocks the applicable gate. Scores and consensus cannot override it.

## Release evidence

Release readiness needs all required routes and device classes, valid specialist verdicts, green continuity, deterministic checks, and explicit material approvals. Where applicable retain automation for Chromium, WebKit, and Firefox plus current physical iPhone Safari with VoiceOver and Android Chrome with TalkBack. Emulation is iteration evidence, not a physical-device pass.

Keep `material-review-ready`, `material-approved`, `implemented`, `previewed`, `release-ready`, `world-class`, `deployed`, `live`, and `verified` literal and separate.

## Learning rule

Every repeated objective failure or direct correction becomes one durable rule in its lowest owner: project feedback-ledger item, project hard gate, token/component/content contract, deterministic check, adversarial fixture, continuity ruling, or held-out harness regression. Do not solve the same class of defect frame by frame.
