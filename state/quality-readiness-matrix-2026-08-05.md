# Canonical skill quality and readiness matrix - 2026-08-05

## Verdict

The 24-skill canonical set is a coherent candidate architecture, not a production library. All 24 pass the repository's structural and secret-pattern gates. Fourteen candidates now have complete independent trigger/behavior evidence on their reviewed suites, but none yet has verified active-surface parity, so `production_active` correctly remains empty.

Current measurable state:

- Active local exact canonical artifacts: 0.
- Exact canonical artifacts found as staged `.skill` archives: 7 skill names.
- Canonical candidates present and enabled in Claude Cloud: 16.
- Canonical candidates absent from Claude Cloud: 8.
- Enabled non-canonical user skills in Claude Cloud: 16.
- Enabled provider-managed Claude skills: 2.
- Freshness SLA failures: 0.
- Candidates within 10 days of review expiry: 1 (`apify`).
- Repository-enforced minimum-sized trigger and behavior suites: 14 skills (`build-apps-with-krish`, `harness-maintainer`, `take-the-brief`, `evidence-research`, `krish-voice`, `krish-design`, `krish-build`, `ux-testing-agent`, the three always-on core skills, and the three commercial/content skills).
- Complete independent trigger/behavior evidence on reviewed suites: 14 skills (`krish-principles`, `take-the-brief`, `strategy-brief`, `verification-loop`, `harness-maintainer`, `evidence-research`, `mindmaker`, `content-corpus`, `krish-content-marketer`, `krish-voice`, `build-apps-with-krish`, `krish-design`, `krish-build`, `ux-testing-agent`). A smaller prior `mindmaker-os` run remains limited evidence.

## Rating method

`Clarity / coverage` is not a production score:

- **Strong:** distinct role, concrete triggers and exclusions, executable workflow, authority or handoff boundaries, and meaningful edge-case coverage are present.
- **Good:** role and workflow are clear, but one or more input, handoff, authority, provenance, or edge-case layers remain incomplete.
- **Thin:** intentionally concise or underdeveloped; useful for routing/reference but not independently comprehensive.
- **Stale:** the review SLA has expired or embedded operational/business facts require reconciliation.

`Evidence stage`:

- **Structural:** lint, packaging rules, references, and secret-pattern checks only.
- **Suite designed:** minimum category counts exist, but the complete held-out comparison has not passed.
- **Limited executed:** an independent run exists, but breadth, collisions, or canary evidence is below the production gate.
- **Canary:** installed on one authorized client and smoke-tested with recorded parity evidence. No candidate is at this stage.

## Per-skill matrix

| Candidate | Role/class | Clarity / coverage | Freshness | Local user-surface evidence | Claude Cloud | Evidence stage | Binding gate before canary |
|---|---|---|---|---|---|---|---|
| `krish-principles` | Always-on base doctrine | Strong | current | older staged archive; no exact active copy | enabled, older 2026-07-03 copy | Independent suite pass: 32/32 triggers, 34/34 behaviors | Baseline/personal-judgment review, clean release, and one canary |
| `take-the-brief` | Conditional task-intent gateway | Strong after import hardening | current | absent | absent | Independent suite pass: 21/21 triggers, 23/23 behaviors | Prove one-question turn behavior on a canary and complete release parity |
| `strategy-brief` | Always-on pre-execution strategy | Strong | current | absent | absent | Independent suite pass: 32/32 triggers, 34/34 behaviors | Clean release, discovery, and chained canary |
| `verification-loop` | Always-on post-execution validator | Strong | current | active drift only | absent | Independent suite pass: 32/32 triggers, 34/34 behaviors | Clean release, artifact-specific canary, and parity |
| `harness-maintainer` | Harness governance/release | Strong | current | exact Codex canary only | absent | Independent suite pass: 21/21 triggers, 23/23 behaviors plus 23/23 regression | Verify canary discovery/behavior and complete controlled release evidence |
| `evidence-research` | Decision-grade research | Strong after research-contract, privacy, authority, and handoff hardening | current; reviewed 2026-08-05 | absent | absent | Independent suite pass: 21/21 triggers, 23/23 behaviors | Live dynamic-page/PDF/private-data canary with citation readback, injection resistance, owner handoff, and parity |
| `decision-ledger` | Consequential decision memory | Strong | current | absent | absent | Suite designed | Non-production migration, authenticated adapters, lifecycle/security suite, redacted readback, rollback |
| `mindmaker-os` | Live operating-state router | Thin by design | current | invalid legacy directories; no exact active copy | enabled stale monolith, 2026-07-07 | Limited executed | Expanded live-access, conflict, stale-runtime, closure, and collision suite; thin-copy canary |
| `mindmaker` | Commercial context | Strong, lean router plus one-level canon/product/freshness references | current; reviewed 2026-08-05 | exact staged archive plus active drift | enabled stale 2026-06-10 copy | Independent suite pass: 21/21 triggers, 23/23 behaviors | Baseline comparison, clean package, and source-conflict canary |
| `content-corpus` | Channel context | Strong, status-aware router plus channel references | current; reviewed 2026-08-05 | exact staged archive; no exact active copy | enabled stale 2026-06-10 copy | Independent suite pass: 21/21 triggers, 23/23 behaviors | Baseline comparison, clean package, and named-channel canary |
| `krish-voice` | Personal outbound voice | Strong after progressive split and fact/privacy/authority/handoff hardening | current; reviewed 2026-08-05 | active and staged drift; no exact copy | enabled older 2026-08-03 copy | Independent suite pass: 21/21 triggers, 23/23 behaviors | Authorised held-out real-Krish corpus, blind mimicry comparison, rendered deck canary, Krish acceptance, and parity |
| `krish-content-marketer` | Conversion strategy | Strong, bounded producer with governed learning | current; reviewed 2026-08-05 | absent | enabled stale 2026-06-11 copy | Independent suite pass: 21/21 triggers, 23/23 behaviors | Baseline comparison, clean package, and conversion/voice handoff canary |
| `krish-design` | Personal design doctrine | Strong after explicit proof/authority/handoff contracts | current | older staged archive | enabled older 2026-07-03 copy | Independent suite pass: 21/21 triggers, 23/23 behaviors | Real rendered-artifact canary with Krish reaction, implementation handoff, responsive/accessibility proof, and parity |
| `krish-build` | Technical producer doctrine | Strong after runtime/authority/freshness contracts | current | older staged archive | enabled older 2026-07-03 copy | Independent suite pass: 21/21 triggers, 23/23 behaviors | Real repository and bounded mutation/readback canaries, rollback proof, current artifact presentation, and parity |
| `build-apps-with-krish` | App-delivery orchestrator | Strong after explicit phase/reset contracts | current | absent | absent | Independent suite pass: 24/24 triggers, 29/29 behaviors | Rendered multi-session app canary with real Krish reactions, implementation handoff, production readback, and rollback |
| `ux-foundations` | Narrow generic UX reference | Thin | current | exact staged archive; no exact active copy | enabled, 2026-07-03 | Structural | Primary provenance/WCAG freshness plus lookup-only and design-collision suite |
| `ux-testing-agent` | Evidence-first UX validator | Strong after revision, mutation, injection, evidence, and owner-boundary hardening | current; reviewed 2026-08-05 | invalid legacy directories; mandated `.Codex` path absent; no exact active copy | absent | Independent suite pass: 21/21 triggers, 23/23 behaviors | Revision-matched preview, designated auth, injected-content, safe action, responsive/accessibility, fix-handoff, and parity canaries |
| `tools-access` | Runtime authentication contract | Good | current | invalid/drifted legacy copies; no exact active copy | enabled legacy copy, 2026-06-13 | Structural | Choose runtime mapping; test missing access/redaction now; sensitive remediation remains deferred |
| `apify` | Narrow web-data tool | Good | current; due 2026-08-14 | absent | enabled, 2026-06-15 | Structural | Current primary API provenance, helper tests, actor drift, empty-success, cap/cost, pagination, and write-boundary suite |
| `ctrl-intake` | Standards stages 1-2 | Good | current | exact staged archive; no exact active copy | enabled, 2026-08-05 | Structural | Input/handoff schema, incomplete interview, conflicting examples, privacy, and anchoring-bias suite |
| `ctrl-compile` | Standards stage 3 | Good | current | exact staged archive; no exact active copy | enabled, 2026-08-05 | Structural | Explicit authority plus malformed intake, sparse evidence, leakage, rubric-size, and downstream schema suite |
| `ctrl-build` | Standards stage 4 | Good | current | exact staged archive; no exact active copy | enabled, 2026-08-05 | Structural | Package schema, reference integrity, client variants, and no-restatement regression suite |
| `ctrl-check` | Standards stages 5-7 | Good | current | exact staged archive; no exact active copy | enabled, 2026-08-05 | Structural | External-standard contract, fresh-context judging, missing rubric, bias, provenance, and ledger-write suite |
| `ctrl-capture` | Standards stage 9 | Good | current | Stage 8 staged drift; no exact active copy | enabled Stage 9 copy, 2026-08-05 | Structural | Persistent ledger contract, Stage 8-to-9 handoff, decay, duplicate signal, rejection, and rollback suite |

## Architecture conclusions

### Keep one chained core

The durable chain is:

`krish-principles -> take-the-brief when triggered -> strategy-brief -> routed producer/tool/context skill -> verification-loop`

`take-the-brief` stays out of clear, urgent, routine, and already-briefed work. `harness-maintainer` governs changes to the chain. `ctrl-capture` can propose learning changes, but only a named human can accept a personal-standard change. `decision-ledger` records finalized consequential choices; it does not become a general memory sink.

### Preserve specialist ownership

- `build-apps-with-krish` orchestrates product delivery; it does not absorb design, implementation, or QA doctrine.
- `krish-design` owns visual and interaction taste; `ux-foundations` is a narrow generic lookup; `ux-testing-agent` independently validates observed behavior.
- `krish-voice` owns how Krish writes; `content-corpus` owns channel context; `krish-content-marketer` owns conversion intent.
- `mindmaker-os` retrieves live operating state; `mindmaker` owns durable commercial context.
- Provider and marketplace material should normally enter as a narrow tool reference or connector beneath an existing owner, not as another broad active skill.

### Place `ctrl-corpus` inside the build chain

The durable lessons in `C:\Users\krish\ctrl-corpus` belong primarily as conditional references and regression cases under `build-apps-with-krish`, `krish-build`, `krish-design`, and `verification-loop`. Its five proposed global skill concepts substantially overlap existing owners. The first extracted chapter, `krish-build/references/app-runtime-verification.md`, preserves the remote-write, fixture-render, authenticated-runtime, edge/serverless, and cache/build proof patterns without embedding project IDs, credentials, or blanket permissions.

## Release order

1. Finish independent evaluation of the remaining candidate skills, prioritising `tools-access`, `mindmaker-os`, and the CTRL chain.
2. Resolve only the genuinely user-owned remaining route decisions, including whether `morning` has a distinct retained purpose and any later purge/retirement set.
3. Build deterministic packages from a clean commit.
4. Ask Krish to choose one local canary surface and approve its exact activation/relink action.
5. Verify discovery, routing, behavior, and rollback on the canary.
6. Present the cloud replacement/disablement set for explicit approval.
7. Roll out one surface at a time; never infer parity from names or dates.
