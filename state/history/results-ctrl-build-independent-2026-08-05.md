# Independent CTRL Build evaluation - 2026-08-05

## Scope

Evaluated `ctrl-build` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill package and blind cases. The behavior rubric was disclosed only to the fresh judge.

## Baseline

- Trigger routing: 21/21 pass.
- Behavior: 14/23 pass.
- Hard failures: 0.

The baseline did not reliably separate runtime from hidden evaluation material, emit a deterministic manifest, preserve exemplar/holdout separation, expose AWAITING fallback behavior, record before/after evaluation, or produce complete independent-review and controlled-release handoffs.

## Final outcome

- Trigger routing: 21/21 pass on the final skill version.
- Behavior: 23/23 pass across three disjoint final-version batches (8/8, 8/8, 7/7).
- Remaining hard failures: 0.

A single 23-case behavior response was not accepted as final evidence because repeated complete runs omitted different low-level readbacks while the same cases passed focused runs. The suite was not weakened: the identical 23 blind cases and expectations were partitioned into fresh executor/judge batches to remove cross-case response compression as a measurement confound. This batching limitation remains visible rather than being presented as a monolithic pass.

## Corrections

- separated the installable runtime directory from private behavior cases, holdouts, expected answers, fixtures, and reports;
- made the frozen human-readable Compile package authoritative and client/platform syntax subordinate;
- added exact admission checks for owner decision, source hashes, rule allowlists, exclusions, privacy, holdout state, targets, and candidate status;
- distinguished subject-specific directives from governance/platform mechanics and required valid pointers, reasons, and situations only for the former;
- made unsupported personal claims explicit `NOT ESTABLISHED` gaps rather than plausible padding;
- required a conservative fallback inside every generated router, including an adjacent else branch for situated rules;
- replaced rigid router, frontmatter, prompt-count, and provider-limit claims with current validator/target contracts and measured context budgets;
- removed sealed holdout data from runtime exemplars and restricted user-facing tests to non-secret smoke prompts without answers;
- added privacy, authorship, audience, retention, injection-delimiting, secret-propagation, and separately declared remediation-scope controls;
- required one canonical personal-content source plus thin, hash-linked adapters and semantic drift comparison;
- added deterministic file inventories, repeat-build hashes, reference diagnostics, pointer checks, target validation, and private held-out suites;
- made package, Compile, review, and release status separate and prohibited Build from installing, uploading, enabling, replacing, deleting, or activating;
- required versioned independent-review corrections and exact `harness-maintainer` release handoffs with prior known-good, rollback, and per-surface canaries;
- routed recurring correction evidence through `ctrl-capture` rather than an auto-updating runtime loop.

## Residual uncertainty

The synthetic suite does not prove that a generated personal skill reproduces a subject's judgment or that any client currently discovers the same bytes. Production admission still requires one authorised real Compile package, deterministic rebuild, official and target-specific validation, secret/privacy fixtures, a deliberately injected exemplar, hidden held-out execution, subject acceptance, independent `ctrl-check`, and separate Claude Code, Cursor, Codex, and Claude Cloud canaries with rollback evidence. The evaluator should automate bounded disjoint behavior batches so output compression cannot masquerade as a skill failure. No package was installed, uploaded, enabled, replaced, or activated.
