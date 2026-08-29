# Codex surface reconciliation — SURFACE-07a67cda9f99 — 2026-08-29

## Authority and scope

Krish Raja explicitly instructed: “Run another check as things have been updated. And then first, synchronise what's in your skills to the github and then pull it all back and sync it locally.” This authorizes promotion of the named Codex user-skill divergences into the private canonical repository, publication of a governed release, and installation of that verified release back to this Codex surface. It does not authorize changes to Claude, Cursor, Perplexity, provider-managed skills, public publication, or permanent deletion.

The source inventory was `C:\Users\krish\.codex\skills`, excluding the provider-managed `.system` directory. GitHub identity was `krishanraja`; the private repository was `krishanraja/ai-harness`; and the pre-reconciliation repository revision was `ba6ac8dbcf7eb09f7d52e93001411ec795ddcb79`.

## Preserved inbound evidence

- Snapshot: `C:\Users\krish\.scratch\ai-harness\inbound\SURFACE-07a67cda9f99\pre-sync-20260829-56d4bae`
- Aggregate algorithm: `sha256-path-nul-file-sha256-ordinal-v1`
- Personalized surface: 9 files, 52,056 bytes, aggregate `56D4BAEB4879A981CC45259BABAE58B1EDF669445F544AD3F089FB0CFC9FE47A`
- `locked-revision`: 7 files, aggregate `85E8E7B7AE94951B10473DA266E5DC596629C5CB251291FA4349878B9724309B`
- `video-engine`: 2 files, aggregate `EE839A4DA93A4688801C7830302186ED44DC6907ECE6A6ED859D99498A766365`

The snapshot preserves every observed byte, including `locked-revision/scripts/__pycache__/apply_revision.cpython-312.pyc` at SHA-256 `5F406CA18C241B6398CDB034C5A8A663865BC69E318FC20F24F2FF1A8120773F`.

## Decisions

### `video-engine` — promote to canonical

The skill owns a distinct, exact-launch route and does not collide with ordinary video work. Its two files were promoted byte-for-byte. Canonical aggregate: `EE839A4DA93A4688801C7830302186ED44DC6907ECE6A6ED859D99498A766365`.

### `locked-revision` — merge into canonical

The six authored instruction, metadata, reference, and Python source files were promoted with repository LF text normalization and verified as text-identical after normalization. The generated Python bytecode cache was not admitted as source; it remains byte-exact in the inbound snapshot. A deterministic offline regression suite was added to prove exact delta application, stale-baseline failure, undeclared-change detection, and manifest tamper detection.

Canonical aggregate after the regression suite: `EEA407C09C24E4523B64B1C3BB2BC69DC2D4DE73F68106002871EBD141AC222C` across 7 files.

## Admission evidence

- Trigger and collision suites: `evals/locked-revision-trigger-cases.jsonl` and `evals/video-engine-trigger-cases.jsonl`.
- Behavior, failure, authority, and handoff suites: `evals/locked-revision-behavior-cases.jsonl` and `evals/video-engine-behavior-cases.jsonl`.
- Deterministic helper tests: `skills/locked-revision/tests/test_locked_revision.py`.
- Deterministic router entries: `contract/skill-routing-contract.md`.
- Ownership, roles, review dates, and active set: `state/skill-registry.yaml`.
- Candidate source set after reconciliation: 29 skills, 139 files, aggregate `1C45506654DCEAE3FC5AB30FBD256265D5ED8759F3F3B0FDC8A26122AC6C498A` under the same ordinal aggregate algorithm.

The exact source commit and every source/package hash are bound by the release manifest generated from the clean tagged commit. Local installation must use those immutable release assets, never raw `main` or a working-tree copy.
