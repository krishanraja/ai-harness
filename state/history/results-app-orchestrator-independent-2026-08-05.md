# Independent app-orchestrator evaluation - 2026-08-05

## Scope

Evaluated `build-apps-with-krish` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this file records redacted results only.

The complete skill package, including `references/delivery-protocol.md`, was supplied to the blind executor. The behavior rubric was withheld until the fresh judge pass.

## Final outcome

- Trigger routing: 24/24 pass.
- Behavior: 29/29 pass after full and focused correction reruns.
- Final former-hard-failure status: 4/4 pass.
- Remaining hard failures: 0.
- Final focused post-rejection reset check: pass with no finding.

## Located failures and corrections

The first run located omitted stage-contract details despite generally correct routing and safe instincts. Four omissions were classified as hard because the response did not explicitly name authentication routing, rollback/readback, safe-evidence fallback, or the ability to continue authorised preview work while production remained gated.

Corrections made:

- added a required mixed-corpus preflight record with one canonical state route, source layers, product truth, explicit non-goals, surface dependencies, the smallest vertical slice, and first surface;
- required every phase exit to update canonical state with confirmed/inferred status and exactly one next action;
- kept later material surfaces paused until the current surface passes its planned implementation/verification gate;
- made viewport/state-range proof, ungated-mechanic proof, sparse-default proof, fresh self-contained high-resolution rendering, and historical affected-row assessment explicit;
- clarified that mock approval permits authorised local/preview continuation but never production mutation;
- routed imported-guide authentication through `tools-access` with minimum scope and exact action-time approval;
- required dry-run/fixture/canary verification to define rollback and authoritative readback;
- required a limitation and unverified verdict when private visual evidence cannot be safely recaptured;
- made post-rejection synthesis feasibility and a complete `RESET TRACE` mandatory;
- required the concept-reset judge to answer all three checks explicitly: disguised repetition, invariant-constraint regression, and useful discarded strengths.

Every failed case and its adjacent stage-transition or concept-divergence cases passed after correction. No gate was lowered and no aggregate score hid a failure.

## Residual uncertainty

The suite establishes behavior on reviewed synthetic cases. It does not replace a real multi-session app canary with Krish's live visual reactions, actual repository state, rendered mock revisions, implementation, and deployed readback. The skill remains a candidate until clean packaging, canary discovery, one real founder-in-loop delivery path, rollback evidence, and cross-surface parity pass.
