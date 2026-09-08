# LORIMER deployment, release v2026.09.08.1

- Host: LORIMER, three surfaces: `claude-code-user`, `cursor-primary`, `codex-current`
- Release: `harness-v2026.09.08.1`, tag resolves to `cb738af1` as declared
- Repo revision at install: `469d31e`, fast-forwarded from `6dde469`, clean before and after
- Manifest SHA-256 `66188213989BABF75CBC37AD106E8308BA7BED1C32545D9911F0C26BBCE6F200`, matched
- Assets: 60 downloaded, 59 verified, zero mismatches
- Reported: 2026-09-08

## Result

All three surfaces: 27 exact, 2 replaced, 0 unreconciled, 0 additions. After install,
29 skills and 139 files on each, all 29 per-skill hashes matching the manifest, and an
identical full-tree aggregate:

```
F7C08490BFC2F5A25C6669C614E0618180A1D37B6983450E7CCE5DC45A2B4441
```

Each rollback directory holds the replaced `mindmake-os` and `video-engine` trees. The
2026-09-07 hand-edit is preserved intact, not deleted.

| Surface | Rollback and deployment record |
|---|---|
| `claude-code-user` | `.claude\skills.harness-backups\claude-code-user\v2026.09.08.1-20260908T145422Z-4b769fb1\` |
| `cursor-primary` | `.cursor\...\cursor-primary\v2026.09.08.1-20260908T145444Z-bae937d6\` |
| `codex-current` | `.codex\...\codex-current\v2026.09.08.1-20260908T145458Z-98d7a66e\` |

## The aggregate: the cloud was wrong, twice

This value was computed by LORIMER from the release artifacts **before** installing,
then reproduced by all three of its client surfaces after installing, and independently
by SURFACE. It was asked to match `4CBF02F3...` from `scripts/reconcile-surface.mjs` and
did not, which is the second time a cloud-computed aggregate disagreed with a host.

On 2026-09-08 I recorded that as the two sides walking different roots. **That was
wrong.** The Node reimplementation was wrong, on two axes:

| | Authority (`Get-DirectoryArtifactSha256`) | What the Node version did |
|---|---|---|
| file digest in the record | uppercase hex string | raw 32 digest bytes |
| between records | joined with a newline | nothing, concatenated |
| hashing | one hash over the joined UTF-8 payload | a rolling update per record |

Corrected and verified: the Node implementation now reproduces `F7C08490...` over the
`cb738af1` skills tree exactly. `scripts/check-aggregate.mjs` holds the two together on
every push, with a differential test proving each axis is load-bearing.

A third claimed axis, sorting by path rather than by composed record, turned out **not**
to be load-bearing and is documented as such: a record is `path + NUL + hex`, NUL is
`0x00`, and no character valid in a path sorts below it, so record order always resolves
inside the path portion. The differential test found that itself.

## Canaries: all pass

**Claude Code**, all four:

- (a) OS architecture question routes to `control-center/docs/MINDMAKE_OS_ARCHITECTURE.md`, does not instruct deleting anything (it now requires explicit approval for a named target), no cron time.
- (b) `Video engine` invokes `Skill(video-engine)`, then 16 Bash calls. Launched.
- (c) `Video engine!` zero tool calls. Did not launch, and said the exclamation mark stopped it.
- (d) the dollar form, zero tool calls. Did not launch.

**Codex**, all three: `Video engine` launched and drove the engine CLI; both negative
forms did not launch, the dollar form citing the trigger contract explicitly.

Canary (a) printed a Windows path, but that is the model resolving this machine's actual
checkout, which is what root resolution is for. The installed `mindmake-os` SKILL.md
carries no Windows path, no cron time and no delete instruction.

Note the contrast with SURFACE, which installed the same bytes and failed canary B. The
difference is the client: `allow_implicit_invocation: false` removes a skill from the
Codex catalog. Byte parity is not reachability, and only a positive canary tells them
apart.

## Ruling: nothing reads `C:\Users\krish\.agents\skills`

Verified on LORIMER: no skills path points there in `.claude/settings.json`,
`.claude/settings.local.json`, `.claude.json`, `.codex/config.toml`, or
`.cursor/mcp.json`, and no installed instruction file names it (`.codex/AGENTS.md`, all
three `.cursor/rules/*.mdc`, `.claude/CLAUDE.md`). A full sweep of the three client trees
hit only transcripts and caches.

The directory holds 63 entries, not the 61 previously recorded: 62 directories plus a
loose `ml-engineer.md`. Nine of them are skills the routing contract explicitly forbids.

**They are inert.** Nothing reads the directory, so the forbidden skills are not a live
routing risk. It stays an unmanaged third-party catalog. Nothing there was read from,
installed to, or deleted.

## Open: loose files beside two managed roots

Unmanaged, and the installer never sees them, so they are outside parity entirely:

- `C:\Users\krish\.claude\skills`: 62 loose files (53 third-party marketing `.md`, 9 `.skill` archives)
- `C:\Users\krish\.cursor\skills`: 11 loose files

These sit **inside** release-managed roots, unlike `.agents\skills` which is a separate
directory. Awaiting a ruling.

## Two deviations worth recording

1. **The plan halted at step 3 on all three surfaces, and on two of them that was my
   error, not drift.** `replace-known-baseline` is only reachable when
   `-ExpectedDeploymentRecordPath` is passed, and the command I supplied omitted it.
   `cursor-primary` and `codex-current` were exact to the previous release throughout;
   only `claude-code-user` had genuine unclassified content. With the baseline record
   passed, `video-engine` also classifies as `replace-known-baseline` rather than
   `replace-reconciled`. Same bytes either way.

2. **Three parameter names in my brief were wrong**, and one step named a script that
   cannot do what it asked. `-Target` is `-TargetSkillsDirectory`; there is no `-WhatIf`,
   plan mode is omitting `-Apply`; `Get-SkillSurfaceAudit.ps1` takes `-Root`, not `-Path`,
   and is the wrong tool for parity anyway: it audits five hard-coded surfaces including
   `.agents\skills`, emits no aggregate or file count, and writes into `state\`, dirtying
   the checkout. Corrected in `docs/harness/MACHINE-JOB.md`, which did not exist and is
   why none of this was caught before it reached a machine.

## Two host gaps, neither ours

- **Codex truncates skill descriptions**, reporting "Skill descriptions were shortened to
  fit the skills context budget". Every trigger contract in this harness lives in
  description text. It held today and is not structurally guaranteed.
- **The Video Engine cannot run under Codex on LORIMER.** It launches correctly, then
  reports no Node 24 available, having found `C:\Program Files\nodejs\node.exe`. The
  engine contract pins Node 24. Pre-existing, unrelated to the trigger fix.
