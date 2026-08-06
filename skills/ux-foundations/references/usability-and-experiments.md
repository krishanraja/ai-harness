# Usability, patterns, and experiment foundations

Last reviewed: 2026-08-05.

## Heuristics are diagnostic lenses

Nielsen's ten usability heuristics are broad diagnostic lenses: visibility of system status; match with the real world; user control and freedom; consistency and standards; error prevention; recognition rather than recall; flexibility and efficiency; aesthetic and minimalist design; error recognition, diagnosis, and recovery; and help and documentation.

Use the [Nielsen Norman Group's maintained overview](https://www.nngroup.com/articles/ten-usability-heuristics/) as the named source. A heuristic finding should include:

- the observable interface condition;
- the likely user consequence;
- affected task, users, frequency, and severity evidence;
- competing explanations or requirements;
- the observation needed to verify it.

Do not call a heuristic a WCAG criterion, law, accepted user preference, or proof of a defect. Severity is contextual. If no observation or research exists, label impact as a hypothesis.

## Interaction patterns are conditional hypotheses

Rules such as "single-column forms are better," "undo beats confirmation," "skeletons beat spinners," "primary buttons belong on the right," or "validate on blur" may be useful prompts, but none is universally correct. Test each against:

- the user's goal, error cost, frequency, expertise, and input mode;
- platform conventions and accessibility requirements;
- content length, information relationships, viewport, and localization;
- latency, reversibility, technical truth, and failure behaviour;
- Krish's accepted design system and artifact-specific evidence;
- observed usability evidence.

State the pattern as a hypothesis, name the context in which it may help, expose the trade-off, and identify the cheapest verification. `krish-design` owns Krish's design decision; `ux-testing-agent` owns observed product testing.

Collision rule: when Krish has accepted an artifact-specific choice and generic pattern guidance points elsewhere, do not reopen or override the choice. Return the bounded advisory rationale and explicitly hand any proposed observed validation to `ux-testing-agent` with the artifact/revision identity, test question, affected task and users, required evidence, and readback recipient.

## Minimum pre-launch controlled-experiment contract

Before an A/B or controlled experiment launches, define:

1. decision to be made, owner, decision rights, and ship/kill/iterate thresholds;
2. eligible population, exclusions, exposure point, and generalization boundary;
3. unit of assignment and unit of analysis;
4. randomization mechanism, allocation, persistence, and interference assumptions;
5. falsifiable hypothesis and expected causal mechanism;
6. one declared primary metric, guardrails, metric direction, windows, and practical significance;
7. baseline, minimum detectable effect, significance/error policy, power, sample-size assumptions, and expected duration;
8. calendar effects, novelty/learning effects, ramp plan, and minimum runtime justified by the decision—not a universal one-week rule;
9. instrumentation and logging validation before exposure;
10. assignment-integrity checks, especially sample-ratio mismatch (SRM), plus attrition, missingness, contamination, and cross-device identity risks;
11. exclusions, variance-reduction or multiple-testing policy, analysis plan, and permitted segment analyses declared before reading results;
12. stopping rule, sequential-testing method if used, and treatment of inconclusive or harmful outcomes;
13. privacy, consent, safety, operational rollback, and data retention appropriate to the population and product;
14. reporting format, evidence owner, revision identity, expiry/retest condition, and post-decision monitoring.

"One visible variable per test" can reduce interpretive ambiguity, but it is not a universal experimental-validity law. Factorial or bundled-treatment experiments can be valid when the estimand, randomization, traffic, analysis, and decision are designed accordingly.

Useful original methodological references include Kohavi et al. on trustworthy controlled experiments and Deng et al. on diagnosing sample-ratio mismatch. Treat every paper as bounded by its methods and date; use the latest authorised analytics standard for an actual launch.

## Experiment handoff

This skill can produce the contract but cannot instrument, expose users, spend traffic, analyse unseen data, or ship a result. Hand the approved contract to the authorised analytics and implementation owners with:

- experiment and artifact revision identity;
- population, assignment, metrics, guardrails, and power assumptions;
- validated instrumentation evidence;
- decision rights, launch approval, rollback, stopping rule, and data boundary;
- required analysis and readback;
- current unresolved risks.

Launching the test and shipping a winner are separate consequential actions and require separate authority. Return here only when a generic foundation is disputed.
