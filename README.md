# Krish AI Harness

Canonical private source for Krish Raja's cross-client AI operating contract, personalized skills, routing rules, evaluations, and release artifacts.

## Design

- `contract/`: durable operating, routing, and active-skill quality contracts.
- `adapters/`: thin client-specific entry points for Claude, Cursor, and Codex.
- `skills/`: curated active skills only. Research corpora and bulk downloaded libraries do not belong here.
- `evals/`: trigger, routing, and behavior fixtures.
- `scripts/`: validation and deterministic release tooling.
- `state/`: lifecycle registry and cross-surface release evidence.

Dynamic operational facts are retrieved from their live sources. They are not copied into skill bodies merely to make the harness feel complete.

## Validate

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\Test-Harness.ps1
```

The validator checks frontmatter, names, description limits, the 500-line main-file limit, reference integrity, duplicate manifests, CTRL stage numbering, adapter contracts, and high-confidence secret patterns.

## Build a preview release

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\Build-HarnessRelease.ps1 -ReleaseId preview
```

The builder validates first, then creates deterministic `.skill` archives and a release manifest containing source and artifact SHA-256 hashes.

## Release boundary

A build does not install or publish anything. Local directory-link changes, Claude cloud uploads, enable/disable actions, credential changes, and external publication require their own explicit approval and verification.

## Current status

The 2026-08-05 candidate set contains 20 curated skills and three thin client adapters. `krish-principles` is always on; `strategy-brief` precedes execution and `verification-loop` follows it. `harness-maintainer` governs admission, overlap, freshness, release, and controlled learning. No candidate is labelled production until it passes `contract/active-skill-quality-standard.md`.
