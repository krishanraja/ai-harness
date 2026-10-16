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
   Added 2026-10-16: a clock that keeps reporting `blocked` past
   `guardian.blocked_days` is the same blocker, with the reason it sent in
   plain words. One day means two nightly runs in a row. LORIMER ran that
   morning and reported `blocked` on v2026.10.15.2 with no reason anyone off
   the PC could read, so the sync now sends one word from a fixed list (never
   the error text: the ledger is public), and the recorder keeps it with the
   date the clock started failing. In the same change the install step stops
   counting untracked files as a dirty checkout, as decision 1's daily update
   already did: they cannot be lost by the switch and fast-forward it guards,
   and one stray file had stopped every install while the update carried on.
   The count is still written to the run record on the PC. If wrong: an
   install ever overwrites an untracked file (git refuses that on its own), in
   which case restore the old check.
4. Chat lessons: `miner.submit: dispatch`. Redacted lessons from his private
   Claude Code and Codex chats are sent to this repository's public ledger by
   repository_dispatch and checked again by `scripts/intake-observations.mjs`.
   This is a standing approval for that one automated send, a scoped exception
   to `authority.never-publish-post-send`: redacted lessons, into this ledger,
   nothing else.
5. Releases built from main after his merge count as approved by him, and
   install on his PC without a further step. After "Validate harness" passes on
   main, `.github/workflows/harness-auto-release.yml` releases main if a skill
   changed; the release workflow then registers it
   (`scripts/register-release.mjs`), and nightly housekeeping records each
   install the PC reports. This is why stage 8 of
   `contract/skill-routing-contract.md` now names his merge as the approval,
   and why `ctrl-capture` says the release follows a merge through the
   pipeline, never through capture. Claude.ai's own skill catalogue stays a
   supervised upload: it has no API.
6. Every Claude transcript folder on the PC is mined, so a second account and
   Claude Desktop's local agent sessions are learned from as well as the first
   account ("mine both claude accounts", "get the local sessions too").

## If wrong

If the guardian fires in a week where the PC was simply off, raise
`silent_days`. If a lesson ever reaches the ledger carrying a name, path or
secret, set `miner.submit: none` and the miners stop sending at once.
