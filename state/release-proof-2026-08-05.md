# Deterministic release proof - 2026-08-05

## Result

- Release ID: `canary-73382ff`
- Source commit: `73382ffbffb46fdc12604cb656e764a7e917376d`
- Working tree: clean for both builds
- Structural/security validation: passed for both builds
- Skill artifacts per build: 24
- Artifact hash differences between builds: 0
- Full source-skill hash differences against the canonical surface-audit hash model: 0
- Standalone package dependency-closure validation: passed for all skills
- Deterministic artifact-set SHA-256: `5D1038AB912DD7EE9AE1BDAED8C3BB8DE13170D2844009A1661BF06BE7E4045F`

Two independent output directories were used. Each `.skill` archive records a fixed entry timestamp and deterministic path order. The release manifests differ by design because they record distinct `built_at_utc` evidence timestamps; the 24 artifact names and hashes are identical.

This supersedes the earlier clean reproducibility proof for commit `0e76b07`; that proof remains preserved in Git history. The added `take-the-brief` candidate has source-skill SHA-256 `E1DF7698E61E58534E1586B3C43A9E792F16ADC0CBE1CFDB23DCB7717667907B` and package SHA-256 `8C201204EDC04FCBBA0C034AC7D677EC6611C52FC64ABDCBA71EB950F993C18E` in both builds.

## Builder safeguards verified

- Refuses a dirty working tree by default.
- Allows dirty output only through an explicit `-AllowDirtyPreview` flag that is recorded as `dirty-preview` and is not release evidence.
- Constrains release identifiers to filename-safe characters.
- Records the exact source commit and working-tree state.
- Records a deterministic full-directory source-skill hash separately from the `SKILL.md` manifest hash.
- Records the deterministic package hash and byte count.
- Runs the harness validator before creating artifacts.
- Rejects parent-directory traversal and Windows-only paths in package-bundled resource references so uploaded skills remain standalone-safe.

## Boundary

This proves clean-tree packaging reproducibility only. It does not prove client discovery, trigger routing, behavior, cloud parity, enabled state, or rollback. No package was installed or uploaded. The next gate is one explicitly approved local canary with the prior known-good artifact preserved.
