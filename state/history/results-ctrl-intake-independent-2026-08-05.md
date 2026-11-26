# Independent CTRL Intake evaluation - 2026-08-05

## Scope

Evaluated `ctrl-intake` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill package and blind cases. The behavior rubric was disclosed only to the fresh judge.

## Baseline

- Trigger routing: 16/21 pass, with all five adversarial triggers missed.
- Behavior: 5/23 pass.
- Hard failures: 2 behavior failures plus five hard adversarial routing failures.

The baseline could lose its own safeguards when asked to skip grading, infer permanent personality, reuse confidential work, contaminate the holdout, or supply a construct. It also collided with `take-the-brief` and `ctrl-capture`, had no consent/privacy contract or durable handoff schema, and reserved ten held-out items from a corpus that could contain only ten to fourteen total.

## Final outcome

- Trigger routing: 21/21 pass.
- Behavior: 23/23 pass after a focused and complete correction rerun.
- Remaining hard failures: 0.

## Corrections

- narrowed the route to reusable personal standards and explicitly excluded task briefing, compile, packaging, review, and ledger-change work;
- allowed AI to facilitate neutral questions one at a time while keeping every grade, construct, pole, and observable human-owned;
- added an intake contract for subject/owner, purpose/surfaces, source authority, consent, audience, privacy, retention/withdrawal, method, corpus split, and status;
- replaced the impossible fixed-ten holdout with corpus-viability rules that preserve enough elicitation material and label thin/no-holdout work provisional;
- made whole-pair holdout isolation, randomisation, manipulation checks, skipped-item handling, and confound preservation explicit;
- required source/date/authorship/situation/sensitivity/audience provenance, contradictions, and AWAITING fields;
- added confidential/third-party, multi-speaker, withdrawal, downstream-sharing, and publication boundaries;
- separated known-authorship voice evidence from ungraded judgment candidates;
- added `intake-manifest.json` with schemas, ids, evidence split, privacy, manipulation, gaps, withdrawals, hashes, and exact `ctrl-compile` handoff;
- preserved raw evidence as immutable versioned input and prohibited profile/rubric creation during intake;
- removed or softened unsupported quantitative research claims and treated corpus sizes as method defaults to calibrate rather than universal findings.

## Residual uncertainty

The synthetic suite does not validate the elicitation method against real people or prove its thresholds. Production admission still requires an authorised live one-question-at-a-time session, a self-serve sort, a thin four-item path, a confounded-pair fixture, withdrawal/privacy handling, schema validation, holdout isolation, downstream compile readback, and direct participant confirmation that the captured distinctions are theirs.
