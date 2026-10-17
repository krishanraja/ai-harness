# Cloud session miner

Claude Code cloud sessions (like the one that built this) leave no transcript on
any machine Krish owns, so the PC's miner cannot read them. This is the prompt
of the weekly Claude Code scheduled task that mines them the same way, under the
same rules (Rulings, Krish, 2026-10-14 and 2026-10-15). Every Sunday at 11:46
New York time (Krish's noon, moved off the hour), before the steward's weekly
proposal run at 21:40 UTC, it wakes one standing cloud session on this
repository, "Session miner (standing)", and sends it the prompt below.

## Prompt

> Weekly run. You are the cloud session miner for krishanraja/ai-harness. Work
> only in the repository checkout; write nothing to it, write no file of your
> own, and open no pull request.
>
> 0. Bring the checkout up to date: `git fetch origin main` then
>    `git checkout --detach origin/main`.
> 1. List my Claude Code sessions from the last 8 days with the
>    claude-code-remote `list_sessions` tool (`mine: true`). Skip this session
>    and any session whose title starts with "Session miner".
> 2. For each, call `list_events` with kinds user and assistant and limit 100,
>    paging back with `before_id` until a page reaches past 8 days or
>    `has_more` is false or missing (the last page leaves it out). Only call
>    the tool: do not copy, save, summarise or print what it returns.
>    Retain repository identity only from verified provider metadata. If that
>    metadata is unavailable, leave scope unknown; never infer it from a title.
>    Report incomplete accounts, pagination or unavailable tools as coverage
>    gaps. Do not report full history coverage from the sessions you can see.
> 3. Run `node scripts/mine-sessions.mjs --source cloud-events --dry-run` and
>    read the lessons it proposes. If any lesson names a person, a client, a
>    path or a secret, stop and report which kind instead of sending anything.
> 4. Otherwise run `node scripts/mine-sessions.mjs --source cloud-events
>    --submit dispatch --from-dry-run`. It sends exactly the lessons the dry
>    run proposed, as a GitHub repository_dispatch; the repository's intake
>    workflow records them.
>    If durable acknowledgement is pending (exit 3), rerun that command once
>    after the intake completes. The miner replays its saved interpretation,
>    verifies the main-branch ledger, and advances only acknowledged cursors.
>    A later dry run first acknowledges an already stored pending batch, then
>    prepares fresh proposals. It sends nothing during that dry run.
> 5. Reply with counts only: sessions read, excerpts, lessons sent, lessons
>    rejected. If any step fails, say which step and the error in one line.

## Why this shape

A scheduled task that starts a fresh session gets no session-listing tools, so
the task wakes a standing session that was opened once by hand and has them.
The agent never writes transcript text anywhere: `--source cloud-events` reads
the `list_events` results back from the session's own Claude Code transcript
(and from tool-results, where Claude Code saves a large one), skips synthetic
and subagent turns, and keeps a per-session cursor outside the repository so a
re-fetched page is never mined twice. If the extractor's reply is malformed,
the miner keeps every lesson that still parses and asks once more when none
does, so one bad reply cannot sink the run. The dry run keeps the lessons it
proposed in the state folder, and `--from-dry-run` sends that set rather than
asking the model again, so what goes out is what was checked. Event ids are deterministic, so a resend
after a lost cursor is absorbed by the intake.

Version 2 episodes preserve the goal, retained decisions, requested delta,
attempt, outcome, conditions and uncertainty. They enter the existing brain
as scoped evidence or candidates, not accepted requirements. The standing
task's saved prompt must be read back before claiming this documentation has
updated the provider-side schedule; this repository cannot infer that parity.

The selection, redaction, validation and sending are the same code the PC's
miner runs (`scripts/mine-sessions.mjs`), so the two cannot drift, and
`scripts/intake-observations.mjs` checks every lesson again before it reaches
the public ledger. The task needs no secret of its own.
