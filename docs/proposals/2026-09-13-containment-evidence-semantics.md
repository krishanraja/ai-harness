# Containment evidence semantics

Status: approved final measurement correction after `v2026.09.13.5`.

## Evidence

The `.5` Claude report was clean apart from the intentionally unobservable task
route. Codex passed every ordinary positive for strategy, verification,
briefing, video, design intelligence, OS, decision memory, Instantly, locked
revision, app orchestration, and research. Three failures remained:

- two contradictory adversarial prompts whose correct guard may either refuse
  inside the named skill or route away before loading it;
- one app-orchestration negative where the forbidden orchestrator stayed out,
  but the expected downstream build owner was not observed in two samples.

The last item contradicted the canary regression doctrine that a negative case
asserts one thing: target containment. It also made a downstream routing sample
capable of erasing valid containment evidence.

## Correction

- Keep the two contradictory phase/guard prompts in held-out evaluation with
  `release_canary: false`.
- For a negative with `expected_route`, fail only when the forbidden target is
  observed. Record an unobserved expected owner as an `unmeasured_routes` entry
  and make the report `partial`.
- Continue to treat an observed expected owner as stronger passing evidence.
- Parse skill mentions as exact hyphenated tokens so `mindmake` is not falsely
  detected inside `mindmake-os`.
- Add regression coverage for held-out exclusion, exact-token parsing, and a
  missing canonical neighbor producing `partial`, never `passed` or `failed`.

This does not lower the positive bar. Every skill counted as reachable still
requires an owner-clear positive canary to fire, and any forbidden target firing
still fails the surface.

User authority: Krish approved the sharper, less-fragile path and closure of all
observed audit gaps on 2026-09-13.
