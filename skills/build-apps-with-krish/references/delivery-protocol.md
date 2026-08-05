# App delivery protocol

Use this reference for a new app, a material cross-surface redesign, or any app journey beginning before product and visual decisions are locked. The main skill owns routing and authority; this file supplies the detailed phase protocol.

## Contents

1. Delivery arc
2. Stage gates and evidence
3. Mock and review protocol
4. Systemization protocol
5. State discipline
6. Ownership and collisions
7. Provenance and freshness

## 1. Delivery arc

### Phase 0: establish current truth

Inspect the current repository instructions, architecture, routes, data model, deploy configuration, tests, live environment, existing mocks, design decisions, and user-visible state. Classify evidence as current, stale, contradictory, or unavailable.

Outputs:

- target and revision record;
- existing-product and dead-code map;
- access and authority map;
- risk-ranked unknowns;
- Phase 0 premise test.

Gate: the build premise must be supported by current evidence. A failed premise produces a strategy correction, not code.

### Phase 1: ingest and synthesize

Read the product's source material and existing implementation. Separate durable product doctrine, venture-specific requirements, historical state, external research, and obsolete instructions. Build a synthesis spine that shows what is known, contradictory, or undecided.

Gate: every load-bearing source is represented or explicitly unavailable; copied status prose has not overridden live truth.

### Phase 2: align with Krish

Resolve only the decisions that change product direction. Prefer ranked options, concrete scenarios, paired examples, or rendered alternatives over broad open questions. Ask one question at a time. Give a recommendation and the consequence of each fork without anchoring a later visual reaction.

Outputs:

- intended user and state of use;
- observable promise and non-goals;
- product and data honesty boundaries;
- decision principles and north star;
- unresolved decisions with owners.

Gate: Krish explicitly approves the product direction. Tentative answers remain tentative.

### Phase 3: corpus and architecture

Write or reconcile the product corpus: what the product is, what it is not, how it creates value, which data and intelligence make the promise honest, and how the experience should feel. Then make the architecture call with material alternatives and rejected routes named.

Gate: product promise, data reality, and architecture can coexist. Do not design magic that the system cannot support.

### Phase 4: surface map and vertical slice

Map connected surfaces and states, then select the smallest vertical slice that proves the product's core value end to end. Sequence surfaces so later mocks do not depend on unapproved earlier decisions.

Gate: each surface has a purpose, entry, exit, data dependency, and verification signal. The first surface is named; later surfaces remain unbuilt.

### Phase 5: mock, react, and lock

For each material surface:

1. Lock its governing product and data rule.
2. If the concept is load-bearing and genuinely novel, generate at least three independent concept spines with deliberately different governing interaction metaphors, test their conceptual distance with fresh-context adversarial judges, and synthesize the strongest while preserving real code and data constraints. For post-rejection divergence, use the asymmetric context protocol below. Do not expose a fantasy that cannot survive the shipped system.
3. Produce one rendered, self-contained mock of the synthesis at the intended viewport and state. Show multiple variants only when comparing them is the decision Krish must make.
4. Verify that the artifact actually rendered and is the version being shown.
5. Present it cold, without a persuasive walkthrough, rationale, or change log before Krish's first reaction. Apply the same rule to every revised material mock. Do not hide safety, authority, factual, or data constraints required for a responsible judgment.
6. Capture Krish's exact reaction and classify it as product rule, interaction, structure, visual taste, copy, data honesty, or implementation defect. After that first reaction, reveal a concise map of prior feedback to change to evidence.
7. If rejected, record the conceptual spine and same-spine revision count, revise that surface only, and repeat.
8. If two consecutive revised mocks within the same conceptual spine are rejected, stop local refinement and rerun fresh concept divergence, adversarial judging, and synthesis for that surface. Give generators only a sanitized divergence brief; give the fresh-context judge the complete rejected history. Reset the count when a new spine is selected. Continue the rejected spine only when Krish explicitly asks for that scoped override.
9. If approved, record the explicit lock, rationale, artifact hash or revision, and carry-forward conditions.
10. Only then begin the next material surface.

Gate: explicit approval of the rendered revision. Silence, approval of the idea, or approval of a prior version does not pass.

### Phase 6: systemize and bulletproof

Turn the approved mocks into reusable design and rendering machinery. `krish-design` owns visual doctrine; the build produces the technical system.

Required artifacts as applicable:

- tokens and type scale;
- scoped reusable components;
- interaction and responsive rules;
- per-component content contracts;
- state fixtures and a visible style or preview harness;
- data schemas for AI-generated content;
- bounded visual/icon/chart libraries;
- fallback and repair behavior.

Gate: components survive their real state range using only shared system rules. A local mock style that is missing from the shared system fails.

### Phase 7: validate truth before scale

Prove the engine and the experience against common, quiet, empty, stale, error, adversarial, and generated states. For AI outputs, the model supplies bounded data, not arbitrary layout. Validate and repair against a schema; use deterministic renderer fallbacks.

Gate: no confident user-facing state can render from evidence too weak to support it. The default sparse state feels intentional and useful.

### Phase 8: implement vertical slices

Use `krish-build` to port locked decisions into the real application. Preserve repository idioms, separate data containers from presentational components, and keep the approved design system as the implementation floor. Work vertical-slice first so stored state and user value are proven together.

Gate: build and deterministic checks pass, the requested behavior works, authoritative stored state is correct, and the surface matches the approved artifact at intended viewports.

### Phase 9: release and verify

Use `verification-loop` for artifact-appropriate proof and `ux-testing-agent` for primary user tasks. Distinguish local, preview, merged, deployed, enabled, live, and prod-verified. Obtain exact production approval at action time unless already granted for the named release.

Gate: verify the actual deployed user outcome with current revision, DOM or behavior evidence, persisted state, and high-resolution pixels where visual. A green CI run alone cannot prove live experience.

### Phase 10: preserve and learn

Update canonical state, the design-decision log, and release evidence. Route repeated objective failures or direct user corrections through the governed learning process. Do not let the executing model silently rewrite the standard that judges it.

Gate: current truth can be resumed from the recorded artifacts without conversation history, and proposed standard changes still require named human approval.

## 2. Stage gates and evidence

| Gate | Required independent signal | Common false positive |
|---|---|---|
| Premise | Current repo, data, and environment readback | A brief or stale state file says it exists |
| Product | Explicit approved rule and observable promise | Agreement with attractive prose |
| Visual | Approved rendered revision | Source code, description, or stale screenshot |
| System | Shared components pass fixture range | One hand-tuned mock looks correct |
| Data/AI | Schema, invariants, adversarial and quiet states | One plausible model output |
| Build | Build/tests plus original behavior exercised | CI is green but feature path was not run |
| Persistence | Authoritative readback after action | UI advanced without saving complete data |
| UX | Primary tasks at intended viewports | Generic checklist or clean console |
| Release | Actual environment, revision, behavior, and pixels | Merged or deployed status alone |

Apply concentrated rigor. A check belongs when its failure could change the verdict or expose consequential harm. Remove ceremonial checks that cannot.

## 3. Mock and review protocol

- Use the cheapest rendered medium capable of answering the decision: self-contained HTML, a fixture-rendered component, a high-fidelity prototype, or an on-device feel test.
- For novel concepts, keep divergent generation and adversarial judging upstream of the human review. Present the synthesized candidate, not a wall of agent output. Preserve judge disagreement and the best rejected feature as decision evidence.
- Show one surface and one primary state. Use alternate states within the same review only when the decision cannot be made without comparing them.
- Render at the real container size and intended viewport. Confirm file size, modification time, revision, and visible output before presentation.
- Keep the first reaction unanchored. Do not explain why the mock should work until Krish has given the immediate read.
- Treat every revision as a fresh taste test. Show the revised artifact cold, collect the first reaction, then disclose what changed and why. The post-reaction change map should be terse and traceable: prior feedback, implemented change, verification evidence.
- Track revised attempts by conceptual spine. Two consecutive rejected revisions are evidence that local refinement has stalled: return to independent concept generation and fresh-context judging instead of producing a third same-spine revision. Reset the count for the newly selected spine. Krish may explicitly ask to keep refining the current spine after seeing that consequence.
- Build a sanitized divergence brief before fresh generation. Include the user outcome; invariant product, data, safety, accessibility, brand, and implementation constraints; and Krish's exact failure signals translated into non-solution requirements. Exclude rejected renders, screenshots, DOM or component shapes, layout descriptions, rationales, change logs, rankings, and solution-specific features. Check the brief for indirect leakage such as "do the opposite of the previous card grid."
- Give the sanitized brief separately to independent generators that cannot inspect the rejected artifacts or one another's work. Give the adversarial judge the sanitized brief, all new candidates, the complete rejected history, and the evaluation rubric. The judge must detect disguised repetition, constraint regression, and discarded strengths before synthesis. Preserve provenance between each generator output, the judge verdict, and the rendered synthesis.
- Require at least three spines in each fresh-divergence round and assign each a different governing interaction metaphor. Test pairwise conceptual distance across sequencing, user agency, primary interaction, information structure, and state model. Each spine must differ from every other spine on at least two of those axes; styling, copy, or component-skin changes do not count. If the first round fails, do not synthesize or show it to Krish. Give a second blinded round only the sanitized brief and the judge's missing-territory requirements. If the second round still converges, stop with a named blocker instead of lowering the diversity bar or sampling indefinitely.
- Number variants, fixtures, or cells when asynchronous or voice-note review will be easier by reference number.
- Treat small visual objections as possible system evidence. A cramped label can reveal a bad content contract, spacing token, responsive rule, or component architecture.
- Separate product philosophy, information structure, visual execution, copy stance, and implementation bugs. Fix at the lowest correct layer.
- Freeze the approved decision. Later token unification happens during systemization; later laws become explicit carry-forward corrections. Reopen only when new evidence invalidates the product or interaction decision.

## 4. Systemization protocol

For every recurring component, define:

```text
SLOTS: [name, type, optionality]
RANGE: [min, max, enums, empty, long token, realistic extremes]
SEMANTICS: [what each state may claim]
LAYOUT RULE: [wrap, balance, fixed control, bounded region, responsive change]
GENERATION RULE: [schema, budget, repair, fallback]
FIXTURES: [representative and adversarial cases]
PROOF: [deterministic check plus rendered evidence]
```

Never let generated content author arbitrary markup, layout, icons, charts, or styling. The system owns the chassis; AI returns validated data and bounded choices.

Promote a repeated correction only when the evidence shows a class of failure. Add the rule to its single owner, then add a regression fixture. Do not duplicate the same doctrine in the app orchestrator, design skill, and build skill.

## 5. State discipline

The canonical state artifact must survive a fresh session. At minimum it records:

- source revision and last verified time;
- current phase and gate state;
- completed outputs with evidence;
- in-flight operation identifiers;
- locked decision IDs and artifact revisions;
- open contradictions, approvals, and blockers;
- confirmed versus inferred status;
- exactly one next action and owner.

Update before any long-running, risky, or externally mutable action and immediately after a phase transition. Do not update timestamps merely to make stale state appear fresh.

The project design log is append-mostly. Supersede a prior lock explicitly; do not rewrite history. Cross-venture consequential choices may be referenced in `decision-ledger`, while live project state stays in its owning system.

## 6. Ownership and collisions

| Need | Owner | Suppress |
|---|---|---|
| End-to-end multi-phase app journey | `build-apps-with-krish` | Generic app orchestrators |
| Product/interface taste and rendered approval | `krish-design` | Generic design producer as final authority |
| Technical implementation and release mechanics | `krish-build` | Orchestrator-authored coding doctrine |
| Diagnosis-only UX audit | `ux-testing-agent` | Design or build mutation |
| Independent outcome verdict | `verification-loop` | Producer self-certification |
| Final consequential cross-venture decision | `decision-ledger` | Duplicate project-state record |

A request spanning only one narrow owner should route directly to that owner. The orchestrator is justified when the work spans connected surfaces or at least two material lifecycle stages and needs stateful handoffs.

## 7. Provenance and freshness

Owner: Krish Raja. Adaptation and harness architecture: Codex, reviewed with Krish.

Origin and license: private, user-owned `ctrl-corpus` material. It may inform Krish's private harness but is not authorized for public redistribution.

Source doctrine inspected 2026-08-05. SHA-256 is the source revision because the corpus is not version-controlled:

| Source | Last modified | SHA-256 |
|---|---|---|
| `BUILD-PARTNER-PLAYBOOK.md` | 2026-06-16 | `154781C7850197917D95882BC69CEE918B9A4EB3D7C8E01558E7CB0FCC31D384` |
| `_BUILD-PROCESS-PLAYBOOK.md` | 2026-06-16 | `F82639CACD4E200C221FE8C047FC1A1A044ADAD97AC38F608BE233DEEAA8EF2D` |
| `ITERATION-METHOD-NOTES.md` | 2026-06-16 | `410AB43FCEE0BE8A99ED94DE3E40C35C5B6023C1CFA6F0EB81511B73D40B5437` |
| `_DESIGN-LOG.md` | 2026-06-17 | `07130AC7A0761B8505BA7E15C51C7ADDDCC5B83079699028457450F758263434` |
| `CTRL-CORPUS.md` | 2026-06-16 | `C1E41298231E26FF4B230635C170D497B497CE0FA0F5E92D72701688B083E98C` |
| `CLAUDE-CODE-SKILLS-AND-PERMISSIONS.md` | 2026-06-16 | `682111D911755466E7694F10C9F2B624545A9C0CB1B95DD21C48119AA6A80FD8` |
| `_INTAKE-HARNESS-SPEC.md` | 2026-06-18 | `A05852188347FBDC5226F3620695AC8D6C0713A23CD9359987FFF88D96879E04` |

Material adaptation:

- extracted the cross-venture collaboration and delivery method;
- left CTRL product decisions, operational status, provider credentials, project identifiers, and historical tool permissions in project corpus;
- assigned taste, implementation, UX testing, verification, and durable decision memory to their existing owners instead of copying their doctrine;
- added Krish's 2026-08-05 decision that each new or materially changed visual surface requires one rendered mock and explicit approval, while routine work inside a locked system proceeds autonomously.
- added Krish's 2026-08-05 decision that every revised material mock is also shown cold, with the change log withheld until after his first reaction while safety and factual context remain visible.
- added Krish's 2026-08-05 decision that two consecutive rejected revisions of one conceptual spine trigger fresh divergence and adversarial judging unless he explicitly asks to keep refining it.
- added Krish's 2026-08-05 decision that fresh post-rejection generators are blinded to rejected solutions and receive only a sanitized constraint-and-failure brief, while the independent judge receives the complete history.
- added Krish's 2026-08-05 decision that load-bearing fresh divergence requires at least three conceptually distinct interaction spines, one extra blinded round after superficial convergence, and a blocker after a second convergent set.

Freshness SLA: 90 days, or immediately after a direct correction to the collaboration cadence, a material build failure exposes a missing gate, or the neighboring skill boundaries change. Expiry opens a review finding; it does not silently alter the method.
