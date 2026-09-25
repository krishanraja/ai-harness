# Handoff contract

The skill diagnoses and specifies; named owners produce and verify.

## Design handoff
Send `krish-design` the user, moment, target outcome, selected intervention, required states, content needs, constraints, guardrails, and open questions. Do not prescribe visual taste from the source corpus.

## Build handoff
Send `krish-build` or `build-apps-with-krish` the affected surfaces, repository constraints, state model, events and properties, eligibility, exposure logging, feature flag, experiment allocation, accessibility criteria, tests, rollback trigger, and non-goals.

## Evidence handoff
Use `evidence-research` when the decision requires primary literature, current platform rules, competitor verification, or quantitative benchmarks. The catalog itself is not sufficient evidence for causal claims.

## Standards handoff
Use `ux-foundations` for current accessibility and generic UX requirements. Do not turn a dated practitioner page into a standard.

## Verification handoff
Use `verification-loop` for artifact checks and `ux-testing-agent` for observable browser or device evidence. Verify all loading, empty, error, success, permission, cancellation, and recovery states touched by the intervention.

## Required implementation packet

- Diagnosis and target outcome.
- Intended user feeling at this moment, and why this outcome matters to the business. Downstream owners make dozens of small calls this brief cannot list; this line is what lets them make those calls the way the brief would.
- Selected catalog record IDs with computed status.
- Evidence level and unresolved assumptions.
- Journey entry and exit conditions.
- Required UI and system states.
- Analytics events, properties, and exposure semantics.
- Primary metric, guardrails, decision window, and segments.
- Accessibility, privacy, consent, and commercial constraints.
- Feature flag, rollback trigger, and owner.
- Decision date and the `scripts/record_result.py` command to run when it arrives.
