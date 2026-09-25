---
name: consumer-app-outcomes
description: Diagnose consumer-app lifecycle problems and translate them into measurable, ethical product interventions. Use for onboarding, activation, retention, monetisation, engagement, habit formation, growth and sharing, conversion, trust, experience refinement, intent shaping, or premium positioning. Do not use for visual taste, paywall or landing copy and angles, generic accessibility lookup, implementation ownership, or UX testing; route those to their named owners.
---

# Consumer App Outcomes

## Role and boundary

Use this skill as lifecycle context and decision support. It diagnoses a product leak, selects outcome hypotheses from the bundled catalog, and produces a bounded intervention and measurement brief.

It does not own visual design, persuasive copy, source code, standards lookup, user research, or observed QA. Hand those stages to `krish-design`, `krish-content-marketer` then `krish-voice`, `krish-build` or `build-apps-with-krish`, `ux-foundations`, `evidence-research`, and `ux-testing-agent` respectively.

Treat the Consumer App Studio pages as a public taxonomy and practitioner source, not proof that a tactic causes an outcome. Never reproduce its paid cards, prompts, screenshots, or commercial examples.

## Required inputs

Collect or mark unknown:

- product promise and business model;
- target user and intended job;
- affected lifecycle stage;
- funnel or cohort evidence;
- current flow and repository constraints;
- existing event definitions;
- user-control, privacy, accessibility, and commercial constraints.

Do not invent baselines, conversion rates, significance, sample sizes, or user motives.

## Route the diagnosis

Read `references/stack-router.md`. Select one primary stack from observable evidence. Add a secondary stack only when the leak genuinely crosses a boundary.

Read `references/stack-contracts.md` for the target outcome, useful evidence, primary metrics, and guardrails. Retrieve candidate records from `references/outcome-catalog.json` with `python scripts/retrieve.py --stack <stack> --query "<observed leak>" --brief` when command execution is available; otherwise inspect only the chosen stack's records and any rows for them in `references/evidence-log.jsonl`.

Each retrieved record carries a status computed from the evidence log: `candidate` (untested practitioner hypothesis), `tested`, `supported`, `contested`, or `retired`. Report the status with the record ID. Never describe a candidate as proven, and never omit a contrary or harmful result that retrieval prints.

For provenance or freshness questions, inspect `references/source-ledger.json`. For how results are recorded and how status is computed, read `references/evidence-loop.md`. For evidence strength and prohibited patterns, read `references/evidence-and-ethics.md`. For downstream work, read `references/handoff-contract.md`.

## Workflow

1. State the diagnosed leak as an observable gap, not a tactic request.
2. Separate known evidence, inference, and unknowns.
3. Choose the primary stack and target outcome.
4. Retrieve three to five candidate records by stack and problem terms. Where match is equal, prefer tested or supported records, and read their contrary results first.
5. Reject candidates whose prerequisites are absent or whose guardrails cannot be measured.
6. Offer at most three interventions with mechanism, trade-off, primary metric, guardrails, and rollback trigger.
7. Select one intervention only when the evidence supports a choice; otherwise frame a research or instrumentation step first.
8. Define the smallest coherent implementation boundary and send it to the correct producer.
9. Require exposure logging, event validation, accessibility checks, and observed verification before claiming success.
10. Report what production evidence would confirm or falsify the hypothesis.
11. Close the loop. When the decision window ends, give the exact `scripts/record_result.py` command that records the result against the record ID. Null, contrary, and harmful results are recorded too. A record's status changes only through that log.

## Outcome rules

- Onboarding ends at first meaningful value, not completed paperwork.
- Activation requires an action that plausibly predicts return; derive it from retained-user evidence rather than copied benchmarks.
- Retention must strengthen recurring core value before adding messages or streaks.
- Monetisation must disclose value, price, renewal, limits, cancellation, and material terms before commitment.
- Engagement optimises valuable depth, not raw time or taps.
- Habit formation supports a routine the user wants and can pause, reset, or leave without punishment.
- Growth and sharing must benefit the recipient and protect contacts, privacy, and consent.
- Conversion removes avoidable friction from an action the user already wants; it never manufactures consent.
- Trust keeps sensitive actions predictable, status-visible, recoverable, and conventional.
- Experience refinement covers loading, empty, error, progress, and achievement states proportionately.
- Intent shaping follows expressed goals and transparent signals; suggestions remain dismissible and reversible.
- Premium positioning must be supported by real differentiation and craft, not theatrical delay or artificial scarcity.

## Experiment contract

For every proposed experiment define:

- eligibility and exclusion criteria;
- assignment unit and exposure event;
- primary metric and decision window;
- at least two guardrails, including user harm where relevant;
- instrumentation validation before interpretation;
- stopping and rollback conditions;
- segments to inspect for uneven effects;
- explicit statement that correlation or a shipped pattern is not causal proof.

Do not prescribe a universal minimum sample size. Route statistical design to qualified experimentation support when stakes or complexity require it.

## Output contract

Return:

```text
Diagnosis
- Observed leak:
- Known / inferred / unknown:
- Primary stack and outcome:

Options
- Intervention:
- Mechanism:
- Preconditions:
- Primary metric:
- Guardrails:
- Ethical or accessibility risk:

Recommended next move
- Smallest testable change:
- Instrumentation:
- Producer handoff:
- Verification:
- Rollback trigger:
- What remains unproven:
- Result to record: (record ID, metric, decision date)
```

## Completion gate

Do not call the work complete unless:

- the recommendation traces to one or more catalog records, each named with its computed status;
- every contrary or harmful result on a cited record is stated;
- source observation, practitioner hypothesis, and causal evidence remain distinct;
- the target outcome and guardrails are measurable;
- deceptive, coercive, privacy-invasive, or accessibility-hostile variants are rejected;
- the implementation owner and verifier are named;
- uncertainty and missing production evidence are explicit.
