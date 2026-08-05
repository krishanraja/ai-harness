# Deterministic release proof - 2026-08-05

## Result

- Release ID: `canary-0e76b07`
- Source commit: `0e76b07b317ee3cac5c2fb12c17d5435c6cec157`
- Working tree: clean for both builds
- Structural/security validation: passed for both builds
- Skill artifacts per build: 23
- Artifact hash differences between builds: 0
- Full source-skill hash differences against the canonical surface-audit hash model: 0
- Standalone package dependency-closure validation: passed for all skills
- Deterministic artifact-set SHA-256: `A429D3D8E654953F67875AA10AD527C5DAF03DA441C744B4C509292312FFCA2E`

Two independent output directories were used. Each `.skill` archive records a fixed entry timestamp and deterministic path order. The release manifests differ by design because they record distinct `built_at_utc` evidence timestamps; the 23 artifact names and hashes are identical.

This supersedes the earlier clean reproducibility proof for commit `6215d91`; that proof remains preserved in Git history.

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
