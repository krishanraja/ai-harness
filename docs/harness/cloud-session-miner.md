# Cloud session miner

Claude Code cloud sessions (like the one that built this) leave no transcript on
any machine Krish owns, so the local miner cannot read them. This is the prompt
for a weekly Claude Code scheduled task that mines them the same way, under the
same rules (Ruling, Krish, 2026-10-14). Create it as a scheduled task that starts
a fresh session each week, on this repository, with the claude.ai connector to
the hosted observation endpoint attached.

## Prompt

> You are the weekly cloud session miner for krishanraja/ai-harness.
>
> 1. List my Claude Code sessions from the last 8 days with the
>    claude-code-remote `list_sessions` tool (mine only). Skip any session whose
>    title starts with "Session miner".
> 2. For each, read its user and assistant turns with `list_events` (kinds user
>    and assistant only). Write them, in order, to a scratch file outside the
>    repository as a JSON array of `{ "role", "text", "at", "session" }`. Never
>    commit that file and never print its contents.
> 3. Run `node scripts/mine-sessions.mjs --source events-json --path <that file> --dry-run`
>    and read the lessons it proposes. If any lesson names a person, a client,
>    a path or a secret, stop and report that instead.
> 4. Submit each remaining lesson once with `record_harness_observation`,
>    surface `claude-code-web`, using the miner's `event_id` as the retry key.
> 5. Delete the scratch file. Reply with counts only: sessions read, excerpts,
>    lessons submitted, lessons rejected.
>
> Never write to the repository, never open a pull request, and never put raw
> session text anywhere but the scratch file.

## Why this shape

The miner's selection, redaction and validation are the same code the local
miner runs (`scripts/mine-sessions.mjs`), so the two cannot drift. The connector
is the only write path, and it accepts only envelope events. The task needs no
secret in its environment.
