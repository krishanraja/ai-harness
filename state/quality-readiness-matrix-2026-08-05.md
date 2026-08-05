# Canonical skill quality and readiness matrix - 2026-08-05

## Verdict

The 24-skill canonical set is a coherent candidate architecture, not a production library. All 24 pass the repository's structural and secret-pattern gates. None yet has both complete held-out evidence and verified active-surface parity, so `production_active` correctly remains empty.

Current measurable state:

- Active local exact canonical artifacts: 0.
- Exact canonical artifacts found as staged `.skill` archives: 7 skill names.
- Canonical candidates present and enabled in Claude Cloud: 16.
- Canonical candidates absent from Claude Cloud: 8.
- Enabled non-canonical user skills in Claude Cloud: 16.
- Enabled provider-managed Claude skills: 2.
- Freshness SLA failures: 1 (`content-corpus`, 11 days overdue on 2026-08-05).
- Candidates within 10 days of review expiry: 3 (`mindmaker`, `krish-content-marketer`, `apify`).
- Dedicated minimum-sized trigger and behavior suites designed: 4 (`build-apps-with-krish`, `decision-ledger`, `harness-maintainer`, `take-the-brief`).
- Dedicated independent evidence exists for 2 skills: a smaller prior `mindmaker-os` run and a new `harness-maintainer` run. Neither is yet a complete production admission.

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
| `krish-principles` | Always-on base doctrine | Strong | current | older staged archive; no exact active copy | enabled, older 2026-07-03 copy | Structural | Full core trigger/behavior suite plus Krish-scored decision cases |
| `take-the-brief` | Conditional task-intent gateway | Strong after import hardening | current | absent | absent | Suite designed | Confirm provenance; execute trigger/behavior and collision suites; prove one-question turn behavior and handoff before canary |
| `strategy-brief` | Always-on pre-execution strategy | Strong | current | absent | absent | Structural | Core route-quality, proportionality, authority, and handoff suite |
| `verification-loop` | Always-on post-execution validator | Strong | current | active drift only | absent | Structural | Core false-success, inconclusive, secret-redaction, correction-stop, and collision suite |
| `harness-maintainer` | Harness governance/release | Strong | current | absent | absent | Limited executed: 21/21 blind triggers; safe behavior uplift with residual evidence-field omissions | Rerun the complete behavior rubric after hardening, then clean-tree packaging and one canary |
| `evidence-research` | Decision-grade research | Strong | current | absent | absent | Structural | Source-quality, contradiction, staleness, injection, citation-support, and handoff suite |
| `decision-ledger` | Consequential decision memory | Strong | current | absent | absent | Suite designed | Non-production migration, authenticated adapters, lifecycle/security suite, redacted readback, rollback |
| `mindmaker-os` | Live operating-state router | Thin by design | current | invalid legacy directories; no exact active copy | enabled stale monolith, 2026-07-07 | Limited executed | Expanded live-access, conflict, stale-runtime, closure, and collision suite; thin-copy canary |
| `mindmaker` | Commercial context | Good but fact-heavy | current; due 2026-08-09 | exact staged archive plus active drift | enabled, 2026-06-10 | Structural | Krish-owned reconciliation of current offers/ICPs plus retired-offer and commercial collision tests |
| `content-corpus` | Channel context | Stale | **11 days overdue** | exact staged archive; no exact active copy | enabled, 2026-06-10 | Structural | Current channel/offer reconciliation, negative triggers, channel collisions, sourced-content cases |
| `krish-voice` | Personal outbound voice | Deep but at 494-line limit | current | active and staged drift; no exact copy | enabled, 2026-08-03 | Structural | Progressive split plus held-out real Krish corpus for prose, email, deck, de-AI, uncertainty, and mimicry |
| `krish-content-marketer` | Conversion strategy | Good | current; due 2026-08-10 | absent | enabled, 2026-06-11 | Structural | Owned conversion methodology, strategy-versus-drafting boundary, brand/ethics/collision suite |
| `krish-design` | Personal design doctrine | Strong | current | older staged archive | enabled older 2026-07-03 copy | Structural | Reference artifacts/counterexamples, responsive/accessibility trade-offs, design/UX/build collisions |
| `krish-build` | Technical producer doctrine | Strong after runtime proof reference | current | older staged archive | enabled older 2026-07-03 copy | Structural | Repo/environment, partial build, stale deploy, rollback, user-change preservation, and delivery suite |
| `build-apps-with-krish` | App-delivery orchestrator | Strong | current | absent | absent | Suite designed | Execute full trigger/behavior suite and rendered multi-surface handoff canary with Krish approval gates |
| `ux-foundations` | Narrow generic UX reference | Thin | current | exact staged archive; no exact active copy | enabled, 2026-07-03 | Structural | Primary provenance/WCAG freshness plus lookup-only and design-collision suite |
| `ux-testing-agent` | Evidence-first UX validator | Strong | current | invalid legacy directories; no exact active copy | absent | Structural | Read-only browser/repo canaries, auth/data limits, false reproduction, responsive/accessibility, fix-scope suite |
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

1. Finish independent evaluation of `harness-maintainer`, `take-the-brief`, and the always-on core.
2. Reconcile the four user-owned freshness questions: Mindmaker offers/ICPs, active channels, outbound status, and whether `morning` has a distinct purpose.
3. Build deterministic packages from a clean commit.
4. Ask Krish to choose one local canary surface and approve its exact activation/relink action.
5. Verify discovery, routing, behavior, and rollback on the canary.
6. Present the cloud replacement/disablement set for explicit approval.
7. Roll out one surface at a time; never infer parity from names or dates.
