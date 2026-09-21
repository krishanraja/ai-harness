# History log

Chronological record for `krishanraja/ai-harness`. Newest first. The steward
rolls entries out of `NOW.md`'s "What changed recently" into this file when they
pass 30 days, and adds a line whenever a document is superseded, banners or
moved. Nothing here is ever rewritten.

## 2026-09-21

- reconciled at `3324038`: two `chore(heartbeat)` commits since `9bec0078`, both timestamp-only updates to `state/heartbeats.json`, no documentation consequence. `NOW.md`'s head and as_of stamped forward. `harness-maintainer`'s freshness SLA (reviewed 2026-08-20, 30 day SLA, due 2026-09-19) is past due per `node scripts/audit-harness.mjs`; noted in the waiting-on-Krish list and the Do not trust section rather than moved.

## 2026-09-20

- reconciled at `9bec0078`: sections 4.5, 4.6 and 4.7 of the retirement map settled with Krish's rulings, and the Telegram change applied on the host with its evidence merged. His override on `loz-api-monitor` is written in as an exception rather than left implicit, because a job running against a documented instruction to stop it looks like an oversight to the next reader.
- reconciled at `d62858f`: the settle-the-unknowns prompt was written, run on the host, and its 206-line report merged. The gateway job count is settled at 45 against three disagreeing numbers, nine of eleven unknown jobs retire, and the retirement map gained a corrections section that wins over its own body. Two claims of mine were corrected in the same pass: Telegram is not a pull-only breach (every node is disabled and the delivery claims are false), and the bot-token exposure is one live node with an unknown live count, not sixty. `NOW.md` re-headed with three bullets.
- reconciled at `0390a0d`: two non-steward commits since `b654fb0`. The VPS retirement map
  (62 rows, two refutation lenses each, every row labelled with the model that checked it)
  and a correction to the OpenClaw operator handoff, which had been written as a list of
  things to go and find out twenty minutes after the audit that found them out was committed
  to this repository. `NOW.md` re-headed with two bullets.

## 2026-09-19

- reconciled at `b654fb0`: the canon's two-channel rule was replaced by the three
  subchannels and the authority for a mandate moved to `venture_formats.mandate` in
  Mindmaker OS. The OpenClaw VPS was audited from the host, its report and the raw
  audit output committed to `state/vps/` and merged, and the operator handoff
  corrected against two independent verifiers. `NOW.md` re-headed with three new
  "What changed recently" bullets and two "Do not trust" lines.
- note: the `openclaw-vps` heartbeat stops at 2026-09-19T09:05Z because its GitHub
  token is invalid, not because the host stopped. `audit-harness.mjs` will open a
  finding at 48 hours; that finding will be true about the credential and false
  about the machine.

## 2026-09-08

- SURFACE installed `v2026.09.08.2` with 29 of 29 per-skill hashes and the
  139-file release aggregate matching. The first full Codex canary sheet was
  recorded as a failure rather than corrected to expectation.
- Machine release work moved into `scripts/Invoke-HarnessSync.ps1` and the
  `Mindmake AI Harness Sync` Windows Scheduled Task. It plans before applying,
  passes the previous deployment record, stops on unknown drift, verifies direct
  manifest parity, records observable canaries, opens an evidence pull request
  and sends a cloud heartbeat. Cursor canaries remain manual.
- The reconciler and the harness audit added (`scripts/reconcile.mjs`,
  `scripts/audit-harness.mjs`), both wired into `harness-steward.yml` nightly.
  The reconciler writes only through pull requests and never overwrites an edit
  made inside the markers; the audit never writes at all.
- Proposal issue #3 opened and resolved the same day: a block edit in
  `contentarchives` widening the secrets rule to cover commit messages and issue
  and pull request bodies. Resolved as option 1, the edit belonging in the canon
  rather than in one copy of it, so `contract/templates/canon-block.md` carries
  it and all ten surfaces re-render.
- `NOW.md` corrected. It had claimed trigger accuracy read `unmeasured` for all
  29 skills, inherited from a plan document rather than read from the registry.
  The registry carries `evaluation_evidence` for `n8n-operator` and
  `instantly-operator` only, while 19 per-skill result files from 2026-08-05 sit
  in `state/` and were never folded in.
- `NOW.md` and this log created. ai-harness joined the docs steward fleet as its
  ninth repository (`control-center` `docs/steward/fleet.json`), so the canon is
  maintained the same way it asks every other repository to be maintained. The
  registry is registered as a truth file: read, never written.

  Two entries rolled out of `NOW.md` on creation because they were already past
  the 30 day window:

## 2026-08-07

- Design-intelligence search evaluated and deliberately narrowed to a
  manual-only, read-only subordinate of `krish-design`, with the upstream
  installer, auto-trigger language and generic stack authority suppressed
  (`state/design-intelligence-search-evaluation-2026-08-07.md`,
  `state/import-review-ui-ux-pro-max-2026-08-07.md`).

## 2026-08-05

- The curated set was established: independent per-skill evaluations across 18
  skills, a quality readiness matrix, and the first release proof
  (`state/quality-readiness-matrix-2026-08-05.md`,
  `state/release-proof-2026-08-05.md`).
