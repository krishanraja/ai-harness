# Candidate skill quality audit — 2026-08-05

## Verdict

The curated candidate set is structurally valid and secret-free, but it is not yet production-grade under `contract/active-skill-quality-standard.md`. Structural lint proves packaging hygiene, not behavioral quality. `production_active` remains empty until the applicable held-out gates pass.

## Cross-cutting gaps

1. **Held-out coverage:** only `mindmaker-os` has a small blind trigger/behavior comparison. Routing fixtures mention other skills but do not independently establish their trigger precision or behavior.
2. **Collision testing:** broad words such as Mindmaker, build, design, review, strategy, research, and outbound are not yet tested pairwise across every neighboring skill.
3. **Independent qualitative judging:** Krish Voice, Principles, Design, and commercial judgment lack a held-out Krish-scored corpus and fresh-context/order-swapped comparison.
4. **Provenance:** several cloud-derived personalized skills have review dates but no complete origin/adaptation/license record in the registry.
5. **Freshness:** Mindmaker and Content Corpus predate later portfolio/channel changes and require live business reconciliation before admission.
6. **End-to-end chains:** CTRL, strategy→execution→verification, content→voice, design→build→UX QA, and local→cloud release have not yet passed full handoff tests.
7. **Client parity:** no canonical candidate is installed from this repository yet, so cross-client behavior and hash parity remain unverified.

## Per-skill admission work

| Candidate | Strength | Required before production |
|---|---|---|
| `krish-principles` | Rich personal doctrine and explicit decision rules | Always-on trigger/behavior suite; routine-task non-overreach tests; Krish-scored decision cases; provenance record |
| `strategy-brief` | Proportionate micro/standard/material strategy and explicit verification planning | Held-out route-quality, overplanning, missing-choice, authority, and handoff tests |
| `verification-loop` | Artifact-specific evidence hierarchy and bounded correction | Independent failure-location tests; false-success, secret-redaction, inconclusive, and two-cycle stop cases |
| `harness-maintainer` | Curated admission/lifecycle discipline | Mis-trigger, overlap, provider import, rollback, and controlled-learning end-to-end tests |
| `evidence-research` | Missing cross-domain evidence workflow now covered | Primary-source, contradiction, stale source, paywall, correlated-source, PDF/table, and citation-support evals |
| `mindmaker-os` | Thin live-state router with good source boundaries | Expand beyond 8 trigger and 5 behavior cases; live-access failure, source conflict, concept closure, and stale-runtime cases |
| `mindmaker` | Detailed commercial distinction and durable/volatile markers | Reconcile against post-June portfolio changes; split volatile sections; commercial collision and retired-offer tests |
| `content-corpus` | Strong channel mandates and voice pairing | Reconcile current channels/offers; negative triggers; channel collision and sourced-content evals |
| `krish-voice` | Deep personalized mechanics and August cloud lineage | More progressive split from 495 lines; held-out real Krish corpus; de-AI, email, deck, uncertainty, and adversarial mimicry scoring |
| `krish-content-marketer` | Clear conversion role separate from voice | Expand owned methodology/evidence; distinguish strategy from drafting; conversion/brand/ethics and collision evals |
| `krish-design` | Strong taste systems and explicit inheritance | Reference artifacts and counterexamples; responsive/accessibility trade-off cases; Design vs UX Foundations/Build collisions |
| `krish-build` | Good deterministic build doctrine and secure runtime direction | Repo-type/environment cases; partial build, stale deploy, rollback, user-change preservation, and delivery verification |
| `ux-foundations` | Useful thin generic reference replacing nine skills | Add authoritative source/review record; WCAG/version freshness; lookup-only and design-collision tests |
| `ux-testing-agent` | Evidence-first diagnosis and safe authority | Browser/repository canary audits; auth/data limitations; responsive/accessibility, false reproduction, and fix-scope tests |
| `tools-access` | Secret-free symbolic authentication contract | Blocked from full admission until storage/runtime mapping is chosen; missing-access and redaction tests can proceed without sensitive remediation |
| `apify` | Focused actor/cost/dedup mechanics with helper assets | Current official API provenance; script unit tests; actor drift, empty-success, rate/cost, pagination, and write-boundary cases |
| `ctrl-intake` | Strong human elicitation and sorting routes | Input/handoff schema, incomplete interview, conflicting examples, privacy, and anchoring-bias tests |
| `ctrl-compile` | Clear standard compilation outputs and kill-rate concept | Explicit authority; malformed intake, sparse evidence, held-out leakage, rubric-size, and downstream schema tests |
| `ctrl-build` | Concise packaging and description discipline | Package schema, reference integrity, installer/client variants, and no-restatement regression tests |
| `ctrl-check` | Quote-before-judge and provenance discipline | External standard input contract; fresh-context review; missing rubric, self-review, qualitative bias, and ledger-write tests |
| `ctrl-capture` | Human-owned learning gate and repeated-signal filter | Real persistent ledger contract; Stage 8→9 handoff; quarterly decay, duplicate signal, rejected proposal, and rollback tests |

## Priority sequence

1. Admit the always-on core only after its full held-out suite: Principles, Strategy Brief, Verification Loop, Harness Maintainer.
2. Reconcile and test the identity/business layer: Mindmaker OS, Mindmaker, Voice, Content Corpus, Content Marketer, Design, Build.
3. Test tool/reference validators: UX Foundations, UX Testing, Tools Access (non-sensitive cases), Apify, Evidence Research.
4. Run the CTRL chain end to end with a real but non-sensitive standard and durable ledger location.
5. Canary one local client before any cloud replacement or bulk-library retirement.

No candidate should be promoted by lowering the gate. Failed cases become explicit work and regression fixtures.
