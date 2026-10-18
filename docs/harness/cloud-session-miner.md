# Cloud session miner

Claude Code cloud sessions (like the one that built this) leave no transcript on
any machine Krish owns, so the PC's miner cannot read them. This is the prompt
of the weekly Claude Code scheduled task that mines them the same way, under the
same rules (Rulings, Krish, 2026-10-14 and 2026-10-15). Every Sunday at 11:46
New York time (Krish's noon, moved off the hour), before the steward's weekly
proposal run at 21:40 UTC, it wakes one standing cloud session on this
repository, "Session miner (standing)", and sends it the prompt below.

## How cloud sessions are covered

Ruling (Krish, 2026-10-18): cloud sessions are covered in two layers, with no
GitHub collector.

1. **Live capture is the primary route.** Under Observation capture in the
   operating contract, every session in either Claude account sends a redacted
   lesson through the Control Center connector (`record_harness_observation`)
   right after a correction. The GitHub import loop records it. This needs no
   schedule.
2. **This weekly miner is the backstop.** It reads finished sessions and
   catches corrections live capture missed. A scheduled task can only read the
   account it runs in, so each Claude account needs its own standing session
   and its own copy of this task with the same prompt.

No supported interface lets a GitHub runner list or read Claude Code cloud
sessions. The Compliance API is Enterprise-only and excludes cloud sessions,
a CLI OAuth token can only make model requests, and the session tools exist
only inside a Claude session. The Control Center connector is write-only: its
one tool records an observation and reads nothing. So the `claude-cloud-account-*`
collector jobs in `config/harness-jobs.json` stay blocked until such an
interface exists, and the watchdog keeps reporting them as inaccessible rather
than letting this task stand in for them.

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
>    If durable acknowledgement is pending (exit 3), rerun that command
>    after the corresponding intake run completes. Lessons and opaque cloud
>    progress have separate acknowledgement stages, so a second rerun may
>    be needed. The miner replays its saved interpretation, checks matching
>    payload receipts and progress on GitHub main, and advances only then.
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
and subagent turns, and keeps a private per-session cursor outside the
repository. After matching lesson receipts are durable, it submits an opaque progress checkpoint through
the same intake. `state/session-miner/checkpoints.jsonl` contains only hashed
session and event identities, timestamps and observation payload receipts. A
fresh cloud worker reads a pinned GitHub revision, verifies the checkpoint's
receipts against that revision's observation ledger, and matches hashes only
to sessions already returned by the provider. Lost local state therefore
resumes without copying provider identifiers into the repository. Concurrent
older checkpoints cannot rewind progress; timestamp ties retain all event
identities. These receipts show acknowledged processed batches, not complete
provider account access or exhaustive history coverage.

If the extractor's reply is malformed, including a partially readable array,
the miner asks once more and then fails without advancing a cursor. Only a
complete JSON array is accepted. An explicit empty array deliberately declines
all selected excerpts; a valid nonempty array deliberately declines omitted
excerpts. Refusal prose cannot become an empty week. The dry run keeps the
lessons it proposed in the state folder, and `--from-dry-run` sends that set rather than
asking the model again, so what goes out is what was checked. Event ids are
deterministic, so a resend after a lost cursor is absorbed by the intake. Empty interpretations also
receive opaque cloud checkpoints, so a fresh worker need not reinterpret them.

Version 2 episodes preserve the goal, retained decisions, requested delta,
attempt, outcome, conditions and uncertainty. They enter the existing brain
as scoped evidence or candidates, not accepted requirements. The standing
task's saved prompt must be read back before claiming this documentation has
updated the provider-side schedule; this repository cannot infer that parity.

The selection, redaction, validation and sending are the same code the PC's
miner runs (`scripts/mine-sessions.mjs`), so the two cannot drift, and
`scripts/intake-observations.mjs` checks every lesson again before it reaches
the public ledger. The task needs no secret of its own.
