---
name: build-apps-with-krish
description: "Founder-in-the-loop orchestrator for taking a materially new app, product experience, or cross-surface redesign with Krish from product rules through approved rendered mocks, implementation, and evidence-backed release. Use when Krish asks to build a new app, rebuild or redesign an app, turn a product corpus into a working product, create several connected product surfaces, resume a multi-session app-delivery journey, or preserve his taste and judgment across strategy, design, code, and QA handoffs. Do not use for an isolated code fix, a single already-specified component, diagnosis-only UX audit, non-app visual artifact, or routine implementation inside a locked design system; route those directly to krish-build, krish-design, or ux-testing-agent. Load krish-principles and strategy-brief first. This skill orchestrates but never replaces krish-design, krish-build, verification-loop, ux-testing-agent, or Krish's material visual and go-live approvals. Last reviewed 2026-08-05."
---

# Build Apps with Krish

Run the collaboration that carries an app from unclear product intent to a verified working experience without losing Krish's judgment between phases. Act as the orchestrator and state keeper, not as a competing designer, coder, or verifier.

## Role and chain

Receive the outcome, constraints, assumptions, authority, and verification plan from `strategy-brief`. Use this route for material work:

`krish-principles -> domain context -> strategy-brief -> build-apps-with-krish -> stage owner -> verification-loop -> approval gate -> delivery`

Stage owners remain authoritative:

- `krish-design` owns taste, interaction design, the material-surface approval boundary, and visual QA.
- `krish-build` owns technical implementation and build mechanics.
- `ux-testing-agent` owns task-first UX diagnosis and release testing.
- `verification-loop` owns the independent outcome verdict.
- `decision-ledger` preserves only finalized consequential choices that pass its capture gate.

Suppress generic app-building or marketplace skills unless they provide a bounded mechanic that a stage owner deliberately selects. They never replace this personalized route.

For a new app, material redesign, or workflow spanning multiple connected surfaces, read `references/delivery-protocol.md` before planning the phases. For an isolated task inside an already locked direction, leave this skill and route directly to the narrow owner.

## Inputs and preflight

Establish these before committing implementation effort:

- observable product outcome and intended user;
- current repository, revision, deployment, data, and test-access truth;
- applicable venture, product corpus, brand context, and existing design system;
- canonical state artifact and design-decision log, if they exist;
- surfaces in scope, dependencies between them, and the cheapest vertical slice;
- authority for local changes, external mutations, production release, and user-facing sends;
- independent pass/fail evidence for each phase and for the final user outcome.

Discover available facts from files and live systems. Ask Krish only for consequential taste, preference, relationship, product, or trade-off judgments that cannot be discovered. Ask one specific question at a time and explain what it changes.

## Operating rules

1. **Lock the governing rule before execution.** State what the feature may claim, what the data can support, the empty/error behavior, and the material fork. Correct implementation of a fuzzy rule is still wrong.
2. **Diverge before committing to a novel concept.** For a load-bearing surface with no approved pattern, generate independent concept spines, judge them adversarially in fresh context where available, and synthesize the strongest. Then present one rendered synthesis to Krish unless comparison itself is the decision. One mock must not mean one unchallenged guess.
3. **Work one material visual surface at a time.** Enforce the approval boundary owned by `krish-design`: rendered artifact, Krish's unanchored reaction, explicit lock, then the next surface. Never batch later surfaces on an unapproved foundation.
4. **Do not code a material visual decision before its mock is locked.** Cheap feasibility spikes may test a premise, but they do not silently become the product.
5. **Continue routine work autonomously.** Repairs and extensions that stay inside an approved layout, interaction model, component library, and responsive doctrine do not need a new taste gate. If the change alters what the surface is, how it works, or how it feels, treat it as material.
6. **Record the lock immediately.** Preserve the decision, rationale, date, artifact revision, rejected alternative, and any carry-forward condition. Approval applies only to the reviewed artifact and scope.
7. **Promote recurring fixes into the system.** A repeated visual or content failure becomes a token, component, content-contract, lint, fixture, or test rule. Do not keep patching frames.
8. **Design and test the real state range.** Include minimum, maximum, empty, quiet, loading, error, stale, adversarial, long-content, and narrow/wide viewport states as applicable.
9. **Keep one resumable state source.** Update it at phase transitions and before long or risky operations. It must state completed work, current in-flight work, open approvals, evidence, and exactly one next action.
10. **Drive through locked execution.** Do not pause at routine milestones or ask what to do next. Pause only for a genuine founder decision, approval wall, missing authority, or evidence-backed blocker.
11. **Keep completion language literal.** Built, merged, deployed, live, and verified are different states. Claim each only from its own evidence.

## Material visual approval boundary

Treat a surface as material when the work introduces or changes any of these:

- information architecture, navigation, surface purpose, or user journey;
- interaction model, input method, hierarchy, or responsive mobile/desktop split;
- visual language, signature component, design-system primitive, or meaningful layout;
- user-facing claim, product stance, or state representation that changes trust or meaning;
- a new surface whose shape will constrain later surfaces.

Hard gate: present one rendered artifact and wait for Krish's explicit approval before implementation or the next material surface. Present it neutrally enough to preserve his first reaction. After approval, lock the artifact and continue.

Revision gate: show every revised material mock cold as well. Withhold the design rationale and change log until after Krish gives his first reaction, then reveal a concise map of prior feedback to change to evidence. Never withhold a safety, authority, factual, or data constraint that Krish needs in order to judge responsibly.

Concept-reset gate: enforce `krish-design`'s two-revision limit. After two consecutive revised mocks within the same conceptual spine are rejected, stop local refinement and rerun fresh concept divergence, adversarial judging, and synthesis for that surface. Reset the count when a new spine is selected. Continue the rejected spine only when Krish explicitly asks for that scoped override.

Routine work inside the locked system includes applying approved tokens/components, fixing an implementation defect, wiring approved states, replacing stale content, or extending a known pattern without changing its meaning. Execute and verify these autonomously. If classification is genuinely ambiguous, surface the exact boundary question rather than assuming.

Krish may explicitly override the boundary for a named task after the trade-off is clear. Record the override and its scope. Do not interpret urgency, silence, or approval of an earlier surface as a blanket waiver.

## Phase orchestration

Run only the phases the current state still needs:

1. Establish current truth and map the existing product.
2. Align on the product rule, user, promise, scope, and non-goals.
3. Create or reconcile the product corpus and architecture call.
4. Sequence the surface map around the smallest valuable vertical slice.
5. Run the one-surface mock, reaction, and lock loop.
6. Convert approved decisions into a design-system and content-contract floor.
7. Validate data, AI, quiet, failure, and adversarial truth before scale.
8. Implement vertical slices with `krish-build`.
9. Verify mechanics, stored state, user tasks, responsive pixels, and release behavior.
10. Obtain the exact production approval, release, verify the actual environment, and preserve learnings through the governed capture route.

Do not restart completed phases merely because a new agent or session begins. Reconstruct state, validate it against live truth, and continue from the earliest unpassed gate.

## State and handoffs

Use the repository's existing canonical state and design-decision artifacts. If none exist, create one state artifact and one append-mostly decision log in the repository's documented planning area. Never create two files that both claim to be current.

Every phase handoff must contain:

```text
OUTCOME: [observable result]
PHASE: [current phase and gate]
CURRENT TRUTH: [repo/deploy/data revision and evidence]
LOCKED: [decision IDs and approved artifact revisions]
AUTHORITY: [allowed actions and exact approval walls]
RISKS: [only consequential open risks]
VERIFICATION: [checks, pass/fail state, evidence]
NEXT OWNER: [skill or human]
NEXT ACTION: [one bounded action]
```

Link finalized consequential decisions to `decision-ledger`; do not copy operational state into it. Link project-specific product decisions from the project log rather than turning every visual preference into a cross-venture decision.

## Failure handling

- If corpus, documentation, and live product disagree, stop dependent mutation and reconcile the authoritative source.
- If Krish rejects a mock, record the failure signal, classification, conceptual spine, and same-spine revision count. Revise that surface only and present the next rendered version. After two consecutive rejected revisions, rerun fresh divergence for that surface unless Krish explicitly asks to keep refining the current spine. Do not defend the artifact or progress downstream.
- If a later rule exposes a problem in an approved throwaway mock, record a carry-forward correction for implementation unless the problem invalidates the product decision itself.
- If a test passes but the stored state, user task, or pixels fail, the phase fails. Correct the smallest root cause within authority and rerun the failed and adjacent checks.
- If access or tooling prevents proof, preserve resumable state and report the exact unverified condition. Never convert inference into a green status.
- After two failed correction cycles on the same gate, use `verification-loop` to surface the blocker instead of lowering the bar.

## Completion

An app-delivery journey is complete only when:

- every in-scope material surface has an explicit approved revision;
- locked rules are represented in the design system, content contracts, and implementation;
- required build, test, security, accessibility, responsive, persistence, and recovery checks pass;
- primary user tasks work in the intended environment with representative state;
- any production release was separately authorized and verified against the actual deployed surface;
- state and decision artifacts match current truth;
- confirmed, inferred, deferred, and blocked items are reported separately.

Report phase, locked decisions, built state, verification evidence, unresolved risks, and the next approval or action. Do not summarize activity as completion.
