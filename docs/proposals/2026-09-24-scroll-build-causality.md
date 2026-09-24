# Authored scroll-build acceptance

## Finding and authority

On 2026-09-24, Krish approved an existing rendered design but corrected two sections that should build while pinned. Appearance, selected-state attributes and entrance reveals had passed parity checks without proving the accepted scroll interaction. The scoped instruction is to preserve the approved design, restore the two scroll builds, and harden the underlying system. This is a verification-contract gap, not a new design preference or a reason to create another skill.

Canonical baseline: commit `79d31a7`, following the installed quality-system overlay. No installed skill directory, release artifact, prior canary, or historical approval is modified by this candidate.

## Narrow change

- Extend the existing experience-quality contract with an authored scroll-build acceptance clause, conditional on an accepted pinned sequence.
- Add its portable orchestration summary to the existing experience-quality reference; retain the existing routing owners.
- Add a reusable trace validator receiving two separate inputs: the accepted ordered-state contract and captured observations. It rejects absent device cases, static/entrance-only substitutes, unchanging content, state skips, wrong-direction input, stuck boundaries, stale identity and missing evidence references.
- Run 24 deterministic positive/adversarial cases from the normal `Test-Harness.ps1` gate. The test fixtures are independent synthetic geometry, not assertions copied from the website implementation.
- Keep profile version 1.3.0 and existing gates intact. No physical-device or independent-judge requirement is relaxed.

The trace validator is deliberately not a claim that a fabricated JSON report is impossible. The project still owns fresh browser capture, candidate/source identity, evidence-file hashing, visible-state inspection, input execution, control accessibility, short-viewport and reduced-motion paths. Its acceptance gate must consume the resulting trace rather than merely retaining this document.

## Verification and status

- Baseline `Test-Harness.ps1`: pass, 29 skills, 3 adapters, no high-confidence secrets.
- `node scripts/test-scroll-build-evidence.mjs`: pass, 24 cases.
- Post-change `Test-Harness.ps1`: pass, 29 skills, 3 adapters, no high-confidence secrets. Parent release agent independently reviewed the acceptance-clause intent and approved the scoped commit/package/install continuation. Fresh-client behavioral evidence belongs to the subsequent immutable deployment/canary records.
- Candidate staged locally; not installed, enabled, published or claimed canaried. Wider client rollout remains the existing governed release process.

## Release and rollback

The site may consume the checker or an equivalent project-local implementation now under the owner's current release scope. A future harness package must originate from a clean commit, preserve both deterministic transport layouts and pass a fresh-context behavior canary before any installed surface is replaced. Preserve its prior package and hashes. Roll back by restoring that recorded prior artifact, never by rewriting the historical correction or evidence.

Commit provenance when finalized: `Ruling (Krish, 2026-09-24): Preserve the approved design; restore the two scroll-locked builds and harden the system against static parity substituting for runtime interaction.`
