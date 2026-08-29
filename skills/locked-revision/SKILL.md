---
name: locked-revision
description: Apply surgical changes to an already approved, final, or locked artifact without regressing anything else. Use when the user says "change nothing else," "do not regress," "keep everything else identical," requests an exact revision of a prior version, or when multiple prior approvals must remain intact. Do not use for ordinary first drafts or broad redesigns.
---

# Locked Revision

Treat the approved artifact as an immutable baseline. Do not reconstruct its state from conversation when a canonical file or release exists.

## Required workflow

1. Identify the exact baseline artifact and record its hash. If no authoritative baseline can be resolved, stop before mutation and ask for one.
2. Translate the request into a declarative delta containing each target, its expected old value, its approved new value, invariants, and rebuild scope. Resolve ambiguity before mutation when it could change meaning, timing, assets, or downstream output.
3. Create a new version. Never overwrite the baseline or edit a generated delivery artifact as the source of truth.
4. Apply the delta to the canonical source. Renderers and exporters may consume approved content but must not rewrite or improvise it.
5. Compute the full semantic diff between baseline and candidate. Fail if any observed change is undeclared, any expected old value is stale, or any declared change is missing.
6. Rebuild only affected dependencies. Reuse unaffected artifacts byte-for-byte when the format permits it.
7. Run format-specific checks plus hash, structure, timing, layout, and reference validation in proportion to the artifact's risk.
8. Generate the release report from validation data. Preserve the previous release and advance any current-version pointer only after every gate passes.

## Fail-closed rules

- A promise that nothing else changed is not evidence. Provide an allowed-diff report.
- Do not render, export, deploy, or send externally before the candidate passes the semantic diff gate.
- Do not silently repair a stale delta. Report the mismatch and regenerate or reapprove it.
- Do not hand-maintain claims that can be derived from validators, manifests, probes, or hashes.
- Preserve integer or canonical units such as frames, cells, object IDs, or AST nodes. Derive display units from them.
- Detect content identity, not only filenames. Use perceptual checks for media and semantic checks for structured content when exact hashes are insufficient.
- Intentional repetitions or exceptions need an explicit allowlist.

## Supporting resources

- Read [references/protocol.md](references/protocol.md) when installing this workflow in a project, defining a delta, or choosing validation gates.
- Use `scripts/apply_revision.py` to apply an approved structured-JSON delta without direct editing.
- Use `scripts/verify_revision.py` to prove that a JSON candidate equals the baseline plus only the declared operations and to verify unchanged file pairs.
- Use `scripts/release_manifest.py` to create or verify a hash-based release manifest.

## Handoff

Report the new artifact paths, the authorised changes, preserved invariants, validation result, and recoverable baseline. Do not call a release final when a gate failed or was skipped.
