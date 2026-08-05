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

## Release boundary

A build does not install or publish anything. Local directory-link changes, Claude cloud uploads, enable/disable actions, credential changes, and external publication require their own explicit approval and verification.

See `architecture/CROSS_CLIENT_RELEASE_SYSTEM.md` for the proposed automatic release and self-correction system. The design is documented but its GitHub workflows, local schedule, wider installations, cloud changes, and deletion stages are not active.

## Current status

The 2026-08-05 candidate set contains 24 curated skills and three thin client adapters. `krish-principles` is always on; `take-the-brief` conditionally elicits intent when consequential end-to-end ownership is transferred; `strategy-brief` then selects the execution route; and `verification-loop` follows execution. `harness-maintainer` governs admission, overlap, freshness, release, and controlled learning. `build-apps-with-krish` preserves Krish's founder-in-the-loop app-delivery method across design, implementation, and verification without replacing the stage owners. `evidence-research` supplies decision-grade external evidence, while `decision-ledger` preserves finalized consequential choices without duplicating operational state. Supabase is the selected canonical decision store; its append-only migration and redacted Git snapshot tooling are designed but remain unapplied/inactive pending migration and adapter canaries. No candidate is labelled production until it passes `contract/active-skill-quality-standard.md`.
