# Close the v2026.10.06.2 adjacent routing failures

Status: approved for correction and governed rollout by Krish's instruction on
2026-10-06 to continue until the declared rollout is 100% complete. The
immutable v2026.10.06.2 release and its failed canary records remain unchanged;
these corrections target the next immutable patch release.

## Evidence

- Claude Code sometimes loaded `strategy-brief` without returning to
  `krish-build` for a one-function implementation. Codex did the same for a
  qualifying stage-conveyor request.
- Codex sometimes routed a generic post-fix regression instruction to
  `ux-testing-agent` rather than the cross-artifact `verification-loop`.
- Codex read the Apify exclusion guard for a custom-Actor build, but the eval
  did not declare the neighboring `krish-build` route needed to distinguish a
  correct guard read from incorrect Apify ownership.

## Decision

1. State that every authorised code change and qualifying conveyor design loads
   `krish-build`; non-trivial work still routes through `strategy-brief` first,
   while a tiny reversible edit may use a compressed strategy check.
2. Give `verification-loop` explicit precedence for generic post-fix test and
   adjacent-regression closure, while preserving `ux-testing-agent` ownership
   of named UX and rendered-flow acceptance.
3. Put the custom-Actor exclusion first in Apify discovery metadata and declare
   `krish-build` as the observable neighboring route in the negative eval.

## Verification

- Run deterministic trigger and surface validation over the complete harness.
- In an isolated Codex home containing only the candidate skill tree, repeat
  each previously failing route three times and retain the observed skill-read
  evidence.
- Re-run the prior strategy, Video Engine, and briefing collision sentinels to
  prove the patch does not regress the v2026.10.06.2 fixes.
- Publish a new immutable release only after local validation passes, then run
  fresh-session canaries on every declared local and cloud surface.

## Candidate outcome

- Isolated Codex routing selected `verification-loop` 3/3 for the post-fix
  regression prompt.
- It selected `krish-build` 3/3 for both the qualifying stage conveyor and the
  single-function implementation, retaining `strategy-brief` ahead of material
  implementation.
- It routed the custom-Actor build to `krish-build` and suppressed Apify 3/3.
- The API strategy-to-producer sentinel passed 3/3. The exact Video Engine
  launcher activated, the punctuation variant stayed contained, and the
  no-interview case routed to `strategy-brief` without `take-the-brief`.
