# Sessions report folder changes to filearchives, 2026-11-24

Status: asked for by Krish on 2026-11-24. This pull request adds one canon sentence.

His words, typed in the Claude Code session of 2026-11-24: "does every other repo know that it needs to report to filearchives repo when new folders are created/deleted/merged etc in a session". Then: "retry the ai-harness canon change".

## Why

The answer was no. A code search across his repositories found no mention of filearchives, and neither the skills index nor the canon block had a folder rule. filearchives follows every folder by id, so a move by any session is followed correctly, but it never learns why. A folder a session creates is guessed from its name instead of carrying his words.

## What changes here

- One canon sentence (**Folders:**). A session that creates, moves, renames, merges or removes a folder in his Google Drive folders or his dev folder reports it with filearchives' `tools/report_folder_change.ps1`, with his words. The report goes to a local inbox outside every repository, so no session needs to push to filearchives.
- filearchives reads the inbox at its daily check-in:
  - a created folder takes his words as its purpose;
  - a move keeps the reason;
  - a removal he asked for is recorded as his.

  This is built in krishanraja/filearchives pull request 31 (D-048, proof `tests/test_folder_inbox.ps1`).

## Bounds

This widens no authority. A report moves nothing; moving or removing one of his folders still needs his yes for that folder under filearchives' own rules. The sentence names no drive letter or user path, because this repository is public.

## How we will know it worked

filearchives' LOG.jsonl counts `session_reports` each day. Sessions that change his folders show up there with his words, and LATEST.md lists them under "What sessions told me".
