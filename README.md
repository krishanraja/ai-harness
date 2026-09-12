# Krish AI Harness

Canonical private source for Krish Raja's cross-client AI operating contract, personalized skills, routing rules, evaluations, and release artifacts.

## Design

- `contract/`: durable operating, routing, and active-skill quality contracts.
- `adapters/`: thin client-specific entry points for Claude, Cursor, and Codex.
- `skills/`: curated candidate and admitted skills only. Research corpora and bulk downloaded libraries do not belong here.
- `evals/`: trigger, routing, and behavior fixtures.
- `scripts/`: validation and deterministic release tooling.
- `state/`: lifecycle registry and cross-surface release evidence.
- `architecture/`: the governed GitHub-to-client release, rollback, freshness, and learning design.

Dynamic operational facts are retrieved from their live sources. They are not copied into skill bodies merely to make the harness feel complete.

## Validate

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\Test-Harness.ps1
```

The validator checks portable frontmatter, names, description limits, the 500-line main-file limit, reference integrity, UI metadata, duplicate manifests, required held-out suites, standalone package paths, CTRL stage numbering, adapter contracts, and high-confidence secret patterns.

## Build a preview release

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\Build-HarnessRelease.ps1 -ReleaseId preview
```

The builder requires a clean Git tree, validates first, then creates deterministic `.skill` archives and a release manifest containing the source commit, full source-skill SHA-256, manifest SHA-256, artifact SHA-256, and working-tree state. `-AllowDirtyPreview` exists only for testing the tooling and must not be used as release evidence.

## Plan or install a verified local release

`Install-HarnessRelease.ps1` defaults to a non-mutating plan. It verifies the clean release manifest, package hashes, archive paths, and extracted full-directory hashes before reporting exact, known-baseline replacement, explicitly reconciled replacement, unreconciled drift, and missing skills. `-Apply` refuses every unknown drift before mutation. A differing directory may be replaced only when it still matches the named prior deployment record or a release-bound reconciliation record matches both its current hash and the candidate hash. Approved replacements are backed up, installed, hash-verified, recorded, and transactionally rolled back on failure.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\Install-HarnessRelease.ps1 `
  -ManifestPath C:\path\to\release-v2026.08.05.1.json `
  -TargetSkillsDirectory C:\Users\krish\.claude\skills `
  -SurfaceId claude-code-user `
  -ExpectedDeploymentRecordPath C:\path\to\prior\deployment-record.json
```

GitHub validation runs on pull requests and `main`. A tag matching `harness-vYYYY.MM.DD.N` creates an immutable GitHub Release after another validation and repeat-build proof. Neither workflow installs or enables a client.

## Release boundary

A build does not install or publish anything. Local directory-link changes, Claude cloud uploads, enable/disable actions, credential changes, and external publication require their own explicit approval and verification.

See `architecture/CROSS_CLIENT_RELEASE_SYSTEM.md` for the governed automatic release and self-correction system. GitHub validation, immutable releases, local reconciliation, live canaries, heartbeat evidence, and controlled observation capture are active. Cloud catalogue uploads remain supervised because the personal catalogues expose no suitable unattended API.

## Current status

The current approved candidate is `v2026.09.12.4`, containing 29 curated skills and three thin client adapters. It corrects routing and recording failures found by authenticated `v2026.09.12.3` live canaries. No candidate becomes deployable until validation, security, collision, behavior, deterministic packaging, immutable publication, installation parity, and post-install canary gates are evidenced.
