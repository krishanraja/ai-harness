# Deterministic release proof - 2026-08-05

## Result

- Release ID: `canary-6215d91`
- Source commit: `6215d91a1ad3f4ecf879a0d230157d196cdfae3c`
- Working tree: clean for both builds
- Structural/security validation: passed for both builds
- Skill artifacts per build: 23
- Artifact hash differences between builds: 0
- Full source-skill hash differences against the canonical surface-audit hash model: 0
- Deterministic artifact-set SHA-256: `CE6FAD0EF49F740B46FB84487A730ED8D53E01724612BE8989F16A86AB11694A`

Two independent output directories were used. Each `.skill` archive records a fixed entry timestamp and deterministic path order. The release manifests differ by design because they record distinct `built_at_utc` evidence timestamps; the 23 artifact names and hashes are identical.

## Builder safeguards verified

- Refuses a dirty working tree by default.
- Allows dirty output only through an explicit `-AllowDirtyPreview` flag that is recorded as `dirty-preview` and is not release evidence.
- Constrains release identifiers to filename-safe characters.
- Records the exact source commit and working-tree state.
- Records a deterministic full-directory source-skill hash separately from the `SKILL.md` manifest hash.
- Records the deterministic package hash and byte count.
- Runs the harness validator before creating artifacts.

## Boundary

This proves clean-tree packaging reproducibility only. It does not prove client discovery, trigger routing, behavior, cloud parity, enabled state, or rollback. No package was installed or uploaded. The next gate is one explicitly approved local canary with the prior known-good artifact preserved.
