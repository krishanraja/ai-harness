# Cloud session miner

Claude Code cloud sessions (like the one that built this) leave no transcript on
any machine Krish owns, so the PC's miner cannot read them. This is the prompt
of the weekly Claude Code scheduled task that mines them the same way, under the
same rules (Rulings, Krish, 2026-10-14 and 2026-10-15). It starts a fresh
session on this repository every Sunday at 17:47 UTC, before the steward's
weekly proposal run.

## Prompt

> You are the weekly cloud session miner for krishanraja/ai-harness. Work only
> in the repository checkout; write nothing to it and open no pull request.
>
> 1. List my Claude Code sessions from the last 8 days with the
>    claude-code-remote `list_sessions` tool (`mine: true`). Skip this session
>    and any session whose title starts with "Session miner".
> 2. For each, read its user and assistant turns with `list_events` (kinds user
>    and assistant only, paging until done). Write them, in order, to a scratch
>    file outside the repository as a JSON array of `{ "role", "text", "at",
>    "session" }`. Never commit that file and never print its contents.
> 3. Run `node scripts/mine-sessions.mjs --source events-json --path <that file>
>    --state <a scratch folder> --dry-run` and read the lessons it proposes. If
>    any lesson names a person, a client, a path or a secret, stop and report
>    which kind instead of sending anything.
> 4. Otherwise run the same command without `--dry-run` and with
>    `--submit dispatch`. It sends the lessons as a GitHub repository_dispatch
>    (the gh CLI is already authenticated here); the repository's intake
>    workflow records them.
> 5. Delete the scratch file and folder. Reply with counts only: sessions read,
>    excerpts, lessons sent, lessons rejected.

## Why this shape

The selection, redaction, validation and sending are the same code the PC's
miner runs (`scripts/mine-sessions.mjs`), so the two cannot drift, and
`scripts/intake-observations.mjs` checks every lesson again before it reaches
the public ledger. The task needs no secret of its own.
