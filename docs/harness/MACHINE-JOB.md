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

Canaries are the instrument for trigger behaviour, as of Krish's ruling on
2026-09-08. The trigger eval harness that used to answer this question was
retired the same day; `contract/canary-contract.md` says why.

Get the sheet for the release you just installed:

```
node scripts/canaries.mjs --sheet
```

It names the skills, the exact messages, and which results are load-bearing.
Send each as the **first message in a fresh task**. Record what happened, not
what should have happened, using only these four outcomes:

| Outcome | Meaning |
|---|---|
| `fired` | The skill loaded and ran |
| `not-fired` | Nothing loaded |
| `wrong-skill` | A different skill loaded; name it |
| `unreachable` | Absent from the client's catalog, or the client refused |

`not-fired` and `unreachable` look identical from the outside and mean opposite
things. Keeping them apart is the whole reason the 2026-09-08 defect is
findable at all.

**Run the positive canaries. They are the only ones that prove anything.** On
SURFACE both negative canaries for `video-engine` passed while the positive
failed, and they passed because the skill could not fire at all. A skill that
cannot fire also cannot fire wrongly, so every negative there was vacuous and
read as health.

Write one report per surface and record it:

```
node scripts/canaries.mjs --record state/canaries/<release>-<surface>.json
```

It refuses a malformed report outright, and it **records a failing one and exits
non-zero**, because a canary failure is the most valuable thing this instrument
produces and must never be the thing that gets thrown away.

## Automatic machine reconciliation

`scripts/Invoke-HarnessSync.ps1` performs this procedure without making a
governance decision. It identifies LORIMER or SURFACE from the computer name and
the exact owned roots above. Any other shape is ambiguous and stops. It never
targets Cursor's `skills-cursor` product surface or the inert `.agents` catalog.

On a new approved release it:

1. Uses authenticated GitHub REST endpoints to find and download the latest
   immutable `harness-v*` release.
2. Verifies every downloaded asset against `SHA256SUMS.txt`.
3. Finds each surface's newest deployment record and passes it as
   `-ExpectedDeploymentRecordPath`.
4. Plans every owned surface without `-Apply`, applies only a clean plan, and
   leaves any surface with unknown drift untouched.
5. Verifies every per-skill hash and the full tree aggregate directly against
   the release manifest.
6. Runs observable canaries on clients with a supported headless interface and
   records failures without converting them into success.
7. Commits machine evidence to a named branch and opens a pull request. The
   machine task never pushes to `main`.
8. Sends a repository dispatch heartbeat. The cloud workflow records that clock
   in `state/heartbeats.json`, where the harness audit treats 48 hours of silence
   as an outage.

If every local surface already reports the latest release, it performs no
download, install, canary, commit, or pull request. It still sends the heartbeat
that proves the machine task remains alive.

Register or repair the daily task from an interactive PowerShell session:

```powershell
pwsh -NoProfile -File .\scripts\Invoke-HarnessSync.ps1 -RegisterScheduledTask
```

It registers `Mindmake AI Harness Sync` for 08:30 local time under the current
user, with wake and network requirements, battery execution allowed and a
four-hour limit. Run it by hand with:

```powershell
Start-ScheduledTask -TaskName 'Mindmake AI Harness Sync'
```

Then inspect the operating-system result, not merely the registration:

```powershell
Get-ScheduledTaskInfo -TaskName 'Mindmake AI Harness Sync'
```

The task uses the signed-in user's existing GitHub and client credentials. It
does not store a token in its action, arguments, working directory, or reports.

Cursor remains manual for canaries. Cursor has no supported headless client
that exposes skill invocation as observable output, so the automatic job records
that surface as `manual-required` instead of pretending a result. Installation
and byte parity remain automatic.

## Known gaps on the machines

- **Codex truncates skill descriptions.** It reports "Skill descriptions were
  shortened to fit the skills context budget". Every trigger contract in this
  harness lives in description text, so truncation can silently narrow or widen
  a trigger. It held on 2026-09-08 and is not structurally guaranteed.
- **The Video Engine cannot run under Codex on LORIMER.** It launches, then
  reports no Node 24 available. The engine contract pins Node 24; the host has
  a different one. Pre-existing, unrelated to the trigger.
