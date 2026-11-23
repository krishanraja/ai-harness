# The taste system holds only preference and inspiration, 2026-11-23

Status: ruled by Krish on 2026-11-23. This pull request changes the canon's wording only. It moves no stored record.

`Ruling (Krish, 2026-11-23): the taste system holds only preference and inspiration; defects move out of it.`

His words, typed in the Claude Code session of 2026-11-23: "we need to enact this too: Move defects out of the taste system so it holds only preference and inspiration."

## Why

This moves the harness North Star's "a correction given once, not twice": a defect that reaches the internal-auditor can get a guard, and one filed as taste cannot.

Evidence: `config/rejection-floor.json` in krishanraja/content-engine at commit `bd0f124f`, read on 2026-11-23, holds 403 records, of which 81 have `kind: process`. Sessions were told to send every correction to the taste engine.

## What changes here

- The canon's taste sentence sends his preferences to `report_to_taste_engine`, and defects and engine failures to `record_harness_observation`. A correction holding both is split.
- `krish-voice`, its humour reference and `krish-design` say the same, so no skill keeps the old reading.

## What does not change here

The move of existing records is separate and has not run. It is held in krishanraja/inspirationhouse pull request 62 and content-engine branch `claude/defects-leave-taste`, whose migration is not applied. Those carry their own review and checks, and this canon wording does not depend on them: `record_harness_observation` already exists and already reaches the evidence intake.

## Bounds

Nothing is deleted. This widens no authority: it changes where a lesson is recorded, and sends, posts and spends keep their own approvals. The rule is about the kind of lesson, so it holds for every venture; only the publication's existing records are proposed for moving, because only it has a failure log to receive them.
