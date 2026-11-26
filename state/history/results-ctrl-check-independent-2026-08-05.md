# Independent CTRL Check evaluation - 2026-08-05

## Scope

Evaluated `ctrl-check` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill package and blind cases. The behavior rubric was disclosed only to the fresh judge.

## Baseline

- Trigger routing: 21/21 pass.
- Behavior: 13/23 pass.
- Hard failures: 4.

The baseline silently appended ledger rows without review-write authority, disclosed no privacy/retention boundary, asked the user to restart a conversation rather than creating an isolated reviewer, dropped criteria beyond an arbitrary seven-item cap, and did not reliably separate review evidence from automatic blocking, editing, sending, or domain-owner handoffs.

## Final outcome

- Trigger routing: 21/21 pass.
- Behavior: 23/23 pass in one complete run.
- Remaining hard failures: 0.

## Corrections

- introduced a frozen review contract for exact standard/submission hashes, status, scope, criteria, exemplars, authority, privacy, and current-fact needs;
- required a fresh isolated reviewer to load the standard before the submission without builder conclusions, ledgers, holdouts, or judge expectations;
- replaced manual new-chat ritual and claimed memory reset with an explicit independence protocol and honest unavailable state;
- separated deterministic validators from semantic judgment and removed claims that AI style checks are always right;
- replaced universal banned-word, line, description, prompt-count, and provider-limit rules with accepted standards and pinned validators;
- required every applicable criterion to be covered across frozen independent passes when necessary, without aggregate scoring;
- aligned verdicts to `holds`, `breaks`, `not-applicable`, and `insufficient-evidence`, each with exact evidence or resolution need;
- separated subject criteria, provenance, current factual truth, and house advisories without averaging disagreement;
- scoped provenance to subject-specific claims while giving governance, platform, and factual claims their correct sources;
- blocked unauthorised exemplars and holdout contamination and preserved hidden evaluation confidentiality;
- made revisions proposed, passage-level, source-preserving, and separately rechecked rather than silently applied;
- made ledger rows visible proposals by default, with exact write authority, privacy, retention, append, and readback contracts;
- removed author identity and unnecessary confidential text from the observation schema and kept raw history out of current reviews;
- prohibited clean-review results from authorising edit, send, publish, approve, installation, production activation, or automatic blocking;
- routed factual verification, package defects, recurrence, UX reproduction, visual judgment, implementation, and release to their named owners.

## Residual uncertainty

The synthetic suite does not prove inter-reviewer agreement or correctness against Krish's or another subject's real standard. Production admission still requires an authorised accepted standard plus frozen real submission, a fresh-context comparison against human owner judgment, a stale/withdrawn fixture, injected submission, intentionally contaminated package, current-fact research handoff, privacy-bounded ledger proposal and separately approved append/readback, revision recheck, false-positive monitoring, and client-surface discovery/parity. No artifact, ledger, external destination, package, or gate disposition was mutated.
