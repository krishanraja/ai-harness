# Installing a release on a machine

Every command here is copied from the script's own `param()` block, not from
memory. The 2026-09-08 install of `v2026.09.08.1` was driven from a prompt
written in chat, and three of its parameter names were wrong, one omitted
argument caused a false halt on two of three surfaces, and one step named a
script that cannot do what the step asked. None of that was recorded anywhere,
so the next install would have repeated it. That is what this file is for.

The machine decides nothing. It installs a release, refuses on unknown drift,
and reports what it found. The cloud never touches it.

## The three surfaces on LORIMER

| Surface id | Target |
|---|---|
| `claude-code-user` | `C:\Users\krish\.claude\skills` |
| `cursor-primary` | `C:\Users\krish\.cursor\skills` |
| `codex-current` | `C:\Users\krish\.codex\skills` |

SURFACE carries one, `codex-surface-07a67cda9f99`, at `C:\Users\krish\.codex\skills`.

`C:\Users\krish\.cursor\skills-cursor` is Cursor's own product surface. It is not
ours and is never a target.

## Parameters, exactly

`scripts/Install-HarnessRelease.ps1`:

| Name | Required | Note |
|---|---|---|
| `-ManifestPath` | yes | the release JSON |
| `-TargetSkillsDirectory` | yes | **not** `-Target` |
| `-SurfaceId` | yes | must match `^[a-z0-9][a-z0-9-]*$` |
| `-ArtifactsDirectory` | no | where the downloaded assets are |
| `-BackupRoot` | no | defaults beside the target |
| `-ExpectedDeploymentRecordPath` | no | see below, this one matters |
| `-ReconciliationRecordPath` | no | required to replace unreconciled drift |
| `-Skills` | no | limit to named skills |
| `-Apply` | no | **plan mode is omitting this.** There is no `-WhatIf` |

## The omission that causes a false halt

`replace-known-baseline` is only reachable when `-ExpectedDeploymentRecordPath`
is passed. Without it, a surface that is byte-identical to its last recorded
deployment classifies as unknown drift and the install stops.

On 2026-09-08 that is exactly what happened: the plan halted on all three
LORIMER surfaces, and only `claude-code-user` had genuine unclassified content.
`cursor-primary` and `codex-current` were exact to the previous release
throughout. The tooling was correct; the invocation was not.

So always pass the previous deployment record:

```powershell
$prev = Get-ChildItem "$target.harness-backups\$surfaceId" |
        Sort-Object Name -Descending | Select-Object -First 1
$expected = Join-Path $prev.FullName 'deployment-record.json'
```

Then plan:

```powershell
.\scripts\Install-HarnessRelease.ps1 `
  -ManifestPath  $manifest `
  -TargetSkillsDirectory $target `
  -SurfaceId     $surfaceId `
  -ArtifactsDirectory $artifacts `
  -ExpectedDeploymentRecordPath $expected
```

Read the plan. Apply by adding `-Apply` and nothing else.

A skill that still classifies as unreconciled after this needs a reconciliation
record and your ruling. It is not a formality: it is the one place a local edit
can be lost, and the installer refusing is the design working.

## Verifying parity

Do not use `scripts/Get-SkillSurfaceAudit.ps1` for this. It takes `-Root`, not
`-Path`, and it is the wrong tool regardless: it audits five hard-coded surfaces
including `C:\Users\krish\.agents\skills`, emits no aggregate and no file count,
and writes into `state\`, which dirties the repository checkout.

Verify against the manifest directly. The per-skill hashes in the deployment
record are the parity contract, and the full-tree aggregate is a second check
over the same bytes.

## The aggregate, and how to compare it

The algorithm is `sha256-path-nul-file-sha256-ordinal-v1`, defined by
`Get-DirectoryArtifactSha256` in `scripts/Install-HarnessRelease.ps1`. That
function is the authority.

For each file: a record string of the portable relative path, one NUL
**character**, and the file's SHA-256 as **uppercase hex**. Records ordinal
sorted, joined with a newline, UTF-8 encoded, hashed once.

`scripts/reconcile-surface.mjs` reimplements it so a Linux job can compare a
surface from anywhere, and `scripts/check-aggregate.mjs` holds the two together
on every push. That guard exists because the first reimplementation was wrong:
it used raw digest bytes instead of hex and no separator between records,
producing a stable, plausible, entirely different number. It was handed to two
Windows hosts as a cross-check, disagreed with both, and I concluded the trees
differed. They did not. Four surfaces agreed with each other and with the release
artifacts. Only the cloud side was wrong.

If a host's aggregate ever disagrees with the cloud's again, suspect the cloud
first and check the per-skill hashes, which name the file.

Attested value for `v2026.09.08.1` (source `cb738af1`), 139 files, agreed by the
release artifacts before install and by all four client surfaces after:

```
F7C08490BFC2F5A25C6669C614E0618180A1D37B6983450E7CCE5DC45A2B4441
```

## Canaries

Byte parity says the right files are on disk. It does not say the client can
reach them, and those are different failures. `v2026.09.08.1` installed with
perfect byte parity on four surfaces while the Video Engine launcher could not
launch at all, because the release carried `allow_implicit_invocation: false`.

Run at least one POSITIVE canary per release. Negative canaries pass for free
when a skill cannot fire at all, which is how that defect survived three of them.

| | Send, in a fresh task | Expect |
|---|---|---|
| A | a question about the OS architecture | routes to the architecture doc; no delete instruction, no cron time, no hard-coded Windows path in the skill itself |
| B | `Video engine` | launches |
| C | `Video engine!` | does not launch |
| D | the dollar form of the name | does not launch |

Canary A resolving a Windows path from the machine's real checkout is correct.
The test is whether the skill *carries* one.

## Known gaps on the machines

- **Codex truncates skill descriptions.** It reports "Skill descriptions were
  shortened to fit the skills context budget". Every trigger contract in this
  harness lives in description text, so truncation can silently narrow or widen
  a trigger. It held on 2026-09-08 and is not structurally guaranteed.
- **The Video Engine cannot run under Codex on LORIMER.** It launches, then
  reports no Node 24 available. The engine contract pins Node 24; the host has
  a different one. Pre-existing, unrelated to the trigger.
