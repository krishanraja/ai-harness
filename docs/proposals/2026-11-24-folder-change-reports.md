# Sessions report folder changes to filearchives, 2026-11-24

Status: ruled by Krish on 2026-11-24. This pull request adds one canon sentence.

`Ruling (Krish, 2026-11-24): every session reports the folders it creates, moves, renames, merges or removes to filearchives, with his words.`

His words, typed in the Claude Code session of 2026-11-24: "does every other repo know that it needs to report to filearchives repo when new folders are created/deleted/merged etc in a session". Then: "retry the ai-harness canon change".

## Which part of the North Star this moves

The harness North Star's "a correction given once, not twice". Today a folder a session creates for him is given a guessed purpose, and he corrects it later. With the report, his words travel with the folder the first time.

## Why

The answer was no. A code search across his repositories found no mention of filearchives, and neither the skills index nor the canon block had a folder rule. filearchives follows every folder by id, so a move by any session is followed correctly, but it never learns why. A folder a session creates is guessed from its name instead of carrying his words.

## What changes here

- One canon sentence (**Folders:**). A session that creates a folder in his Google Drive or dev folders, or moves, renames, merges or removes one there with his yes for that folder, reports it to filearchives with his words, the way filearchives' own AGENTS.md says. Today that is `tools/report_folder_change.ps1` on his PC, writing to a local inbox outside every repository. The mechanism lives in filearchives, not the canon, so the canon cannot go stale when the tool changes.
- A cloud session that cannot reach his computer names the change in its closeout note instead. filearchives still follows the folder by id.
- filearchives reads the inbox at its daily check-in:
  - a created folder takes his words as its purpose;
  - a move keeps the reason;
  - a removal he asked for is recorded as his.

  This is built in krishanraja/filearchives pull request 31 (D-048, proof `tests/test_folder_inbox.ps1`).

## Bounds

This widens no authority, and the canon sentence says so itself. A report moves nothing. Moving, renaming, merging or removing one of his folders still needs his yes for that folder, and removing one stays his decision under the Authority rules (`authority.treat-any-purge-deletion` is unchanged and is not narrowed). The sentence names no drive letter or user path, because this repository is public. It fires only when a session changes one of his folders, not on every session.

## How we will know it worked

His own weekly folder page (filearchives' LATEST.md) shows "What sessions told me", with each change and his words. A folder a session made for him no longer appears with a guessed purpose. filearchives' LOG.jsonl counts `session_reports` each day.
