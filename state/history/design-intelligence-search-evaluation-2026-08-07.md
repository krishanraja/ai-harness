# Design intelligence search evaluation — 2026-08-07

## Deterministic gates

- Canonical harness: passed with 27 skills and three adapters; no high-confidence secret patterns.
- Adapter unit tests: 5/5 passed, including read-only mobile-web execution and integrity sensitivity.
- Pinned upstream tests: 36/36 passed.
- Pinned upstream data validation: passed for 12 domains, 22 stacks, and `ui-reasoning.csv`.
- Evaluation inventory: 13 trigger cases (5 positive, 5 negative, 3 adversarial collision) and 16 behavior cases (4 nominal, 5 failure/edge, 4 authority/security, 3 handoff/collision).
- Diff whitespace check: passed.

## Independent semantic gate

The local Claude Code evaluator was unavailable on 2026-08-07: even a two-word smoke prompt returned no response before timeout. This was recorded as evaluator unavailability, not a skill pass or failure. The semantic gate was rerouted to a fresh Claude Cloud conversation using a condensed specification and 15 high-signal trigger, authority, collision, failure, freshness, and mobile-web cases.

Initial result: 13/15 passed, with no silent mutation observed. The evaluator found two primary ambiguities and four adjacent wording gaps:

- “corpus packet” was too narrow to forbid every kind of shared seed across concept arms;
- empty-result behavior was not guaranteed by the condensed primary contract;
- missing fields, non-web scope mismatch, conflicts, and two-engine real-device evidence needed to be impossible to infer away.

The primary skill contract was corrected at the lowest layer. A closing independent regression re-ran T4, B1, B2, B3, B6, and B8: 6/6 passed with zero hard failures.

## Admission conclusion

The adapter is suitable as a manual-only subordinate retrieval tool. It is not a design owner, current-standards source, implementation skill, persistence mechanism, or QA substitute. Cloud parity remains gated on retiring the conflicting `mobile-app-ui-design` skill rather than running both.
