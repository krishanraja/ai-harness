# Independent CTRL Capture evaluation - 2026-08-05

## Scope

Evaluated `ctrl-capture` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill package and blind cases. The behavior rubric was disclosed only to the fresh judge.

## Baseline

- Trigger routing: 21/21 pass.
- Behavior: 16/23 pass.
- Hard failures: 4.

The baseline applied accepted deltas directly to live standard and skill files, appended and deleted lines in place, bypassed Compile/Build/fresh Check/release gates, and omitted important snapshot-integrity, privacy, rollback, and release evidence.

## Final outcome

- Trigger routing: 21/21 pass.
- Behavior: 23/23 pass after a focused correction rerun and one complete regression.
- Remaining hard failures: 0.

## Corrections

- redefined Capture as proposal, decision-record, change-handoff, and post-release measurement ownership with no live-edit authority;
- added a capture contract for authorised snapshot schema/hash, access/privacy, active standard, release state, proposal policy/history, evaluation sets, and write authority;
- required stable-id deduplication, unknown disposition preservation, opportunity denominators, surface/situation separation, and injection-safe evidence handling;
- replaced universal two-strike/five-week/thirteenth-run rules with owner-configured policy, while preserving recurrence as a useful default and adding a severe-incident override;
- separated output, method, routing, freshness/regression, and incident evidence without treating recurrence as truth;
- required competing diagnoses for standard, Check implementation, routing, parity, work-mix, and evidence-quality defects;
- added complete versioned proposal fields for evidence, alternatives, expected effect, risk/`IF WRONG`, focused/full tests, size/context, privacy, dependencies, owner, and rollback;
- prevented owner acceptance from becoming direct edit/deploy authority and required a versioned change request through Compile, Build, fresh Check, and controlled release;
- removed append/delete-in-place contradiction and preserved source, Git/release/audit history, prior known-good, and rollback artifacts;
- replaced mandatory one-in/one-out deletion with measured context budgeting, replacement, progressive disclosure, or split passes;
- routed under-trigger phrases through Build's positive/negative/adversarial suite and full regression rather than direct description edits;
- made non-firing retirement evidence depend on applicable opportunities and owner decision;
- distinguished a one-open sealed holdout from a disclosed reusable regression set and required a new untouched set for a new unbiased estimate;
- added raw counts, zero-denominator handling, source/build/deploy/runtime identity, exposure-normalised monitoring, and effective/ineffective/uncertain post-release states;
- made all proposal/decision-store writes visible, exact-target authorised, privacy-bounded, immutable/versioned, and read back.

## Residual uncertainty

The synthetic suite does not prove that a proposed change improves a real personal standard. Production admission still requires an authorised privacy-minimised snapshot, a named owner and policy, one genuine output/method/routing pattern, owner accept/reject evidence, a versioned Compile/Build/fresh Check path, separately approved release with rollback, per-surface version/parity readback, adequate exposure, and measured recurrence/false-positive change. A severe incident fixture should also prove safe evidence handling and containment without permanent auto-change. No proposal store, standard, skill, ledger, release, or client surface was mutated.
