# The PC guardian, and chat lessons into the ledger

Status: accepted. Krish decided each point below on 2026-10-15 ("go", "just
fix to 100% completion", and three explicit answers in the session). This file
is the provenance for the `guardian` and `miner.submit` entries in
`contract/learning-policy.yaml`, first seen 2026-10-15.

## Evidence

- LORIMER's scheduled task `Mindmake AI Harness Sync` reported
  `LastTaskResult 64` (PowerShell's code for a `-File` path that does not
  exist) on Krish's own readback of 2026-10-15, with its last run that morning.
- `state/heartbeats.json` last recorded `harness-sync-lorimer` at
  2026-10-06T21:44Z, and the repository's `repository_dispatch` runs show no
  machine heartbeat after 2026-10-06T21:55Z: nine days in which no improvement
  could reach his local tools and nothing said so.
- The weekly session miner had no route that accepted its events: the hosted
  inbox refused `session-miner:` ids and the `preference` and `friction` kinds.

## Decision

1. The PC sync keeps its checkout on main every day and restarts on a changed
   copy of itself, so a sync change on main can no longer strand the PC.
2. The session miner runs weekly from that sync; there is nothing separate to
   install.
3. Guardian: a machine clock silent longer than `guardian.silent_days`
   becomes one blocker in the weekly digest with its one-line fix. Three days
   for `harness-sync-lorimer`, a daily task: long enough that a weekend with
   the PC off stays quiet, short enough that a broken task surfaces within the
   week it broke. This complements `harness-maintainer.scheduled-audit-invariant`
   (the audit names the stale clock; the guardian puts it in front of Krish).
4. Chat lessons: `miner.submit: dispatch`. Redacted lessons from his private
   Claude Code and Codex chats are sent to this repository's public ledger by
   repository_dispatch and checked again by `scripts/intake-observations.mjs`.
   This is a standing approval for that one automated send, a scoped exception
   to `authority.never-publish-post-send`: redacted lessons, into this ledger,
   nothing else.
5. Releases built from main after his merge count as approved by him. The
   registrar (`scripts/register-release.mjs`) exists; running it unattended is
   not yet wired.

## If wrong

If the guardian fires in a week where the PC was simply off, raise
`silent_days`. If a lesson ever reaches the ledger carrying a name, path or
secret, set `miner.submit: none` and the miners stop sending at once.
