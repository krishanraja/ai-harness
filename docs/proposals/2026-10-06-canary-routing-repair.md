# Close the v2026.10.06.1 routing failures

Status: approved for correction and governed rollout by Krish's instruction on
2026-10-06 to continue until every declared surface is complete. The immutable
v2026.10.06.1 release remains unchanged; these corrections target v2026.10.06.2.

## Evidence

- The Codex invocation canary incorrectly rotated the directly imported
  `krish-principles` adapter invariant onto the v2026.10.06.1 sheet. Social and
  acknowledgement cases then failed because a file read that occurs on every
  turn was mistaken for skill activation.
- Claude Code routed `Implement this API endpoint and prove it works.` directly
  to `krish-build` in three of three attempts, skipping `strategy-brief`. The
  same sentinel has failed intermittently across earlier releases, so this is a
  durable producer-handoff gap rather than a byte regression in v2026.10.06.1.
- A second Codex machine exposed `video-engine` in its catalogue with implicit
  invocation enabled, yet the exact fresh prompt `Video engine` did not load the
  skill in three of three attempts. A standalone diagnostic reproduced the
  refusal: the router tried to decide whether the chat was new before loading
  the guard.
- The `take-the-brief` no-interview collision could load the target exclusion
  guard and be scored as activation. The eval named an expected skill in prose
  but did not declare the canonical `strategy-brief` route that the instrument
  can observe.

## Decision

1. Keep adapter invariants out of every invocation-canary rotation seed.
2. Put the strategy precondition at the front of both `strategy-brief` and
   `krish-build` metadata, with an explicit producer handback in the build skill.
3. Make exact current-prompt discovery unconditional for `video-engine`; retain
   the new-chat history check inside the loaded activation guard, where a guard
   read remains distinct from launching the authority repository.
4. Declare `strategy-brief` as the observable neighboring route for
   `brief-trigger-017` so a guard read plus the correct handoff is not laundered
   into a false activation failure.

## Verification

- `scripts/test-canaries.mjs` sweeps 41 release seeds and rejects any sheet that
  rotates `krish-principles` back into invocation evidence.
- The full harness validator passes with 29 production skills and the security,
  reference, adapter, trigger and behavior suites intact.
- In an isolated Codex home containing the candidate skill tree, the strategy
  sentinel loaded `strategy-brief` in three of three attempts.
- The exact and whitespace-trimmed Video Engine prompts loaded the guard in the
  isolated home; `Video engine!` remained contained and did not activate the
  engine authority boundary.
- After publication, both local machines and every supported cloud catalogue
  receive only the changed skill packages, retain rollback evidence, and run
  fresh-session canaries before the rollout is called complete.

