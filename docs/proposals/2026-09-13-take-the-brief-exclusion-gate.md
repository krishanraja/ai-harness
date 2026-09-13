# Take-the-brief exclusion gate

Status: approved corrective change after `v2026.09.13.6` live evidence.

## Evidence

On Claude Code, `brief-trigger-017` correctly routed away from
`take-the-brief`. On Codex, the same prompt produced the correct route on two of
three fresh attempts but loaded `take-the-brief` once. All selected positive
briefing cases fired on both clients.

The prompt explicitly says not to interview and identifies a supplied brief,
while also using broad ownership language. The existing exclusion was late in a
long discovery description and was not prominent in the loaded instructions.

## Correction

- Put the exclusion first in discovery metadata.
- Repeat it as the first decision gate in the skill body.
- Make clear that generic ownership language cannot override an explicit
  no-interview instruction plus an existing brief.
- Preserve all positive interview triggers and the broader held-out case.

This is a narrow routing correction based on repeated live evidence. It does not
turn one wording example into a general refusal to brief ambiguous delegated
work.

User authority: Krish approved closing the observed gaps and merging the result
to main on 2026-09-13.
