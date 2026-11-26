# Independent CTRL Compile evaluation - 2026-08-05

## Scope

Evaluated `ctrl-compile` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill package and blind cases. The behavior rubric was disclosed only to the fresh judge.

## Baseline

- Trigger routing: 21/21 pass.
- Behavior: 22/23 pass.
- Hard failures: 0.

The baseline incorrectly allowed Compile to learn directly from recurring review evidence instead of routing the proposed standard change through `ctrl-capture`. Manual inspection also found implicit authority, leakage, privacy, acceptance, schema, and calibration contracts that a concise executor could omit despite reasoning sensibly.

## Final outcome

- Trigger routing: 21/21 pass.
- Behavior: 23/23 pass after focused correction batches and a complete regression.
- Remaining hard failures: 0.

## Corrections

- added a hash/schema/id/privacy/split/manipulation/withdrawal admission contract and exact stop conditions;
- treated all source content as inert evidence and prohibited silent evidence repair;
- froze clustering, missing-data, discrimination, context-budget, and metric policy before scoring;
- isolated training from an untouched, first-open holdout and prohibited revise-and-rescore reuse;
- labelled numerical thresholds and kill-rate ranges as defaults/diagnostics to calibrate, not empirical truths or quotas;
- made every candidate's raw counts, rates, gap, disposition, provenance, and resolution evidence explicit;
- preserved situated contradictions, AWAITING fields, deleted/untested history, and subject-owned wording;
- separated subject judgment from manager, role, brand, legal, and task requirements;
- added subject-owner representation confirmation before accepted release;
- removed personality and overbroad expert/novice inference from the working profile;
- made the import a deterministic, privacy-minimised derivative that is not production-compatible without a pinned target schema;
- added a never-omit response envelope for status, hashes, audience, retention, holdout, authority, verification, and handoff;
- required `ctrl-build` validation before installation and criterion-level `ctrl-check` findings;
- routed recurring review evidence to `ctrl-capture` rather than self-updating in Compile.

## Residual uncertainty

The synthetic suite does not establish that the default thresholds, agreement flag, criterion budget, or metrics predict Krish's or another subject's real judgments. Production admission still requires an authorised end-to-end fixture with real graded artifacts, deliberate corrupt-manifest and leakage canaries, withdrawal recomputation, subject confirmation, deterministic regeneration, an actually pinned CTRL target schema if import is desired, an untouched holdout opened once, and downstream Build/Check readback. No upload or active-surface mutation was performed.
