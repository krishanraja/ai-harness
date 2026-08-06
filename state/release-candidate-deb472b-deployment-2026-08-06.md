# Candidate deb472b deployment evidence - 2026-08-06

## Release identity

- Release ID: `candidate-deb472b`
- Canonical repository: private `krishanraja/ai-harness`
- Clean source commit: `deb472bc4a1675f412fe86445d2cc7ab344050d4`
- Canonical skills: 26
- Deterministic transport artifacts: 52 (26 standard `.skill` archives and 26 Perplexity root ZIPs)
- Artifact-set SHA-256: `64B25BDDA4051912A6DD0D289A123853633670AE1FAD212E4902A6DBF8EF6BE8`
- Clean retained builds: `C:\Users\krish\.scratch\ai-harness-release\candidate-deb472b-a` and `candidate-deb472b-b`
- Validation workflow: `https://github.com/krishanraja/ai-harness/actions/runs/31129073508` - success for the exact source commit

The two clean builds produced matching names and SHA-256 values for all 52 transport artifacts. `scripts/Test-Harness.ps1`, `git diff --check`, and `scripts/Test-HarnessReleaseInstaller.ps1` passed. The validator reported 26 skills, three adapters, and no high-confidence secrets.

## CTRL Intake identity

- Installed source-skill SHA-256: `40F91A01F81548B5687DC015F695D066C679739F3CADF3D9B8BAE4A0D98D2A68`
- Standard package: `ctrl-intake-candidate-deb472b.skill`
- Standard package SHA-256: `6365DF00D4074DC8AF024F1C66F890079FF09DE4A50856AFDA4050FB5FD0B988`
- Perplexity package: `ctrl-intake-candidate-deb472b-perplexity.zip`
- Perplexity package SHA-256: `4BC76DB7817F36F7325B19F84491FE2A6B80AF34CD07D8C6764D119D875FCE69`

The release preserves the complete multi-file skill. Standard archives use a top-level skill directory; Perplexity archives place `SKILL.md` at the archive root. Both retain `leaves/voice.md` and the other supporting leaves.

## Independent behavior evaluation

Fresh Claude Code executor and judge contexts first exposed three gaps: failure to load the transcript leaf beside the voice leaf, omission of withdrawal terms, and an underspecified downstream voice owner. The corrected candidate passed both held-out trigger cases and all four rerun behavior cases with zero hard failures. Full evidence is in `state/results-ctrl-intake-voice-independent-2026-08-06.md`.

## Local deployment

The verified standard packages were installed transactionally to:

- Cursor: `C:\Users\krish\.cursor\skills`
- Claude Code/Desktop: `C:\Users\krish\.claude\skills`
- Codex: `C:\Users\krish\.codex\skills`

On each surface, the preflight plan found 25 exact skills, one replacement (`ctrl-intake`), and zero additions. The post-install audit found 26 exact skills, zero replacements, and zero additions. The installed `ctrl-intake` directory hash is `40F91A01F81548B5687DC015F695D066C679739F3CADF3D9B8BAE4A0D98D2A68` on all three surfaces.

Rollback records:

- Cursor: `C:\Users\krish\.cursor\skills.harness-backups\cursor-primary\candidate-deb472b-20260806T223338Z-bf13ef71\deployment-record.json`
- Claude local: `C:\Users\krish\.claude\skills.harness-backups\claude-local\candidate-deb472b-20260806T223340Z-9d425a5c\deployment-record.json`
- Codex: `C:\Users\krish\.codex\skills.harness-backups\codex-local\candidate-deb472b-20260806T223342Z-ede18ac1\deployment-record.json`

## Claude Cloud deployment and canary

Claude Cloud `ctrl-intake` was replaced with the standard package. Detail readback showed five files, including `leaves/voice.md`, and showed the rule requiring both the voice and transcript leaves.

The final Skills inventory contained all 26 canonical user-managed names with zero missing; Anthropic-managed `morning` and `skill-creator` remained separate. `ctrl-intake` showed an 8/6/26 update date.

A fresh chat selected `ctrl-intake`, named both `/mnt/skills/user/ctrl-intake/leaves/voice.md` and `/mnt/skills/user/ctrl-intake/leaves/transcripts.md`, stated that both are mandatory together, asked exactly one authorization/owner question, and stopped. Canary evidence: `https://claude.ai/chat/06b46593-d428-4177-9224-fb5cf0c0ee99`.

## Perplexity Computer deployment and canary

Perplexity `ctrl-intake` was replaced with the root ZIP. File readback showed `SKILL.md` plus `live-session.md`, `sort.md`, `transcripts.md`, and `voice.md` under `leaves/`. The final inventory contained exactly 26 enabled canonical names, with zero missing and zero extra user-managed names.

A fresh Computer task named both `ctrl-intake/leaves/voice.md` and `ctrl-intake/leaves/transcripts.md`, stated that both must load together, asked exactly one authorization/owner question, and stopped. Canary evidence: `https://www.perplexity.ai/computer/tasks/d5605361-58d7-4bed-b52e-38bad0b3be64`.

## Verification boundary

Deployment and byte parity are proven for all three local directories; live behavior is proven on both cloud surfaces. A Claude Code CLI canary was inconclusive because the fresh process exhausted its bounded context budget before responding. Cursor's agent CLI was absent, and the installed Codex CLI executable was inaccessible from this sandbox, so no local runtime behavior pass is claimed. These limitations do not change the verified installed bytes or the reversible deployment records.

The voice method remains deliberately provisional until its first authorized real-client corpus resolves the documented AWAITING questions. That is an epistemic boundary of the method, not deployment drift.
