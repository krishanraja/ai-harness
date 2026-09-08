# SURFACE deployment, release v2026.09.08.1

- Host: SURFACE, surface id `codex-surface-07a67cda9f99`
- Release: `harness-v2026.09.08.1`, source commit `cb738af10744d91f20d47c37fd84b0cd6bb837bf`
- Reported: 2026-09-08

## Plan

27 exact, 1 replace-known-baseline (`mindmake-os`), 1 replace-reconciled (`video-engine`), 0 unreconciled, 0 additions.

The `video-engine` replacement was authorised by a reconciliation record at
`C:\Users\krish\.scratch\ai-harness\video-engine-retire-2026-09-09.json`, written after the
2026-09-08 trigger narrowing. `mindmake-os` replaced a known baseline.

## Install

Successful. Two skills replaced and hash-verified. Live surface reads 29 skills, 139 files,
29 of 29 per-skill hashes exact, host audit reports zero drift.

- Rollback: `C:\Users\krish\.codex\skills.harness-backups\codex-surface-07a67cda9f99\v2026.09.08.1-20260908T142007Z-ba7ae26e`
- Deployment record: the same directory, `deployment-record.json`

## The aggregate did not match, and the cloud was the one that was wrong

The host reported a full-tree aggregate of
`F7C08490BFC2F5A25C6669C614E0618180A1D37B6983450E7CCE5DC45A2B4441`. It was asked to match
`4CBF02F37D011B630655C5A9F38054908A3F31F50DDF3FA241288411BD408299`, computed by
`scripts/reconcile-surface.mjs` over the same release. It did not.

I first recorded this as the two sides walking different roots and disagreeing about which
files belong. **That was wrong**, and the correction is worth more than the original note.

LORIMER later computed the same `F7C08490...` from the release artifacts before installing,
and all three of its client surfaces reproduced it after installing. Four independent
computations, one outlier: mine. Reading
`Get-DirectoryArtifactSha256` in `scripts/Install-HarnessRelease.ps1`, which is the
authority, the Node reimplementation was wrong on two axes.

| | Authority | What the Node version did |
|---|---|---|
| file digest inside the record | uppercase hex string | raw 32 digest bytes |
| between records | joined with a newline | nothing, concatenated |
| hashing | one hash over the joined UTF-8 payload | a rolling update per record |

Corrected the same day, and it now reproduces `F7C08490...` exactly.
`scripts/check-aggregate.mjs` holds the two implementations together on every push, with a
differential test that proves each axis is load-bearing.

The lesson is not the one I first drew. The aggregate IS comparable across
implementations, which is the whole reason for reimplementing it. What failed was writing
the reimplementation from the NAME of the algorithm rather than from the algorithm, and
then trusting the resulting number over two machines that disagreed with it.

## Canaries

| Canary | Sent | Expected | Result |
|---|---|---|---|
| A | OS architecture question | route to the architecture doc, no deletion instruction, no Windows path, no cron time | PASS |
| B | `Video engine`, exact, fresh task | engine launches | **FAIL**, twice |
| C | `Video engine!` | does not launch | PASS |
| D | the dollar form | does not launch | PASS |

### Canary B is a real defect, and C and D passed for the wrong reason

The host reported the launcher absent from its catalog because the installed
`agents/openai.yaml` carried `allow_implicit_invocation: false`.

That flag was set on 2026-09-08 alongside the trigger narrowing, and setting it was a
mistake. The ruling narrowed *what matches*: the exact first message `Video engine` and
nothing else. The flag does not narrow what matches. It is an on switch, and on Codex turning
it off removes the skill from the discoverable catalog, so the exact phrase could not fire it
either. A launcher that cannot launch fails the positive half of its own contract.

Upstream, which this skill names as its only authority, is explicit that it is a launcher:

> The phrase `Video engine` is a narrow launcher outside this repository. Do not interpret
> incidental references to video editing as permission to start a production workflow.

Narrow, and a launcher. Narrowness belongs to the description, which already states the
exact-match rule and names every excluded form. That is the layer that can tell `Video engine`
from `Video engine!`.

C and D passed because nothing could start at all. A skill that cannot fire also cannot fire
wrongly, so every negative trigger test on this host was vacuous. That is why the failure
needed a positive canary to surface, and why no cloud check caught it.

Corrected for the next release: the flag is `true`, `Test-Harness.ps1` asserts `true` with the
reasoning attached, and `scripts/audit-harness.mjs` gained an `unreachable-trigger` check that
fires whenever a skill's description declares a positive trigger while its adapter disables
implicit invocation. The check distinguishes that case from a genuinely manual-only skill:
`design-intelligence-search` sets the flag false, says "Manual-only" and "Never trigger
directly", and is correctly not flagged.

## Standing

Bytes: verified. Live discovery: one known failure, caused by the release and fixed in the
canon. This surface stays on `v2026.09.08.1` until the next release carries the correction.
