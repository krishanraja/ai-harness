# Release v2026.08.29.1 — Codex deployment — 2026-08-29

## Outcome

Release `harness-v2026.08.29.1` was published from commit `bf9861c9c2823866835b002b3fe8826a3694113f`, verified immutable and attested by GitHub, downloaded into fresh staging, installed transactionally on `codex-surface-07a67cda9f99`, and passed a fresh-task read-only canary. No Claude, Cursor, Perplexity, provider-managed, public, or remote-machine surface was changed.

## GitHub evidence

- Repository: `krishanraja/ai-harness` (private; authenticated identity `krishanraja`; admin permission).
- Main validation run: `33251354865`, passed.
- Release workflow run: `33251410346`, passed.
- Release URL: `https://github.com/krishanraja/ai-harness/releases/tag/harness-v2026.08.29.1`.
- GitHub release ID: `378971265`; `immutable: true`; draft and prerelease both false.
- GitHub release attestation verification: passed with `gh release verify`.
- Assets: 60 total: 58 transport archives, one release manifest, and `SHA256SUMS.txt`.
- Published manifest SHA-256: `1B29EE7DD3D63F1484570919104DDF4740FB0F73C195AE002C3EBD982C13E954`.
- Published checksum-file SHA-256: `B11090ADF31CC99E4A2BE77A2A8F1746FEC100C9B630E4A256C79639B0DFCCC2`.
- All 59 entries in `SHA256SUMS.txt` verified against the downloaded files; the checksum file, manifest, and both newly admitted `.skill` assets independently passed GitHub attestation verification.

Two clean local builds and the GitHub workflow each built 29 skills. All 29 standard `.skill` archives and all 29 Perplexity archives repeated identically; all standard and Perplexity archive contents were source-exact; 48 portable supporting-resource files were checked per transport. The published 58 archives exactly matched the local clean build. The release manifest differs between builds only in `built_at_utc`; every other manifest field is exact and every published archive is deterministic.

## Reconciliation evidence

The original Codex personalized surface was preserved at `C:\Users\krish\.scratch\ai-harness\inbound\SURFACE-07a67cda9f99\pre-sync-20260829-56d4bae` and at `C:\Users\krish\.codex\skills.harness-backups\codex-surface-07a67cda9f99\pre-v2026.08.29.1-56d4bae`.

- Original personalized surface: 9 files; ordinal aggregate `56D4BAEB4879A981CC45259BABAE58B1EDF669445F544AD3F089FB0CFC9FE47A`.
- `video-engine`: promoted exact; aggregate `EE839A4DA93A4688801C7830302186ED44DC6907ECE6A6ED859D99498A766365`.
- `locked-revision`: authored content promoted with LF repository normalization; transient bytecode excluded; deterministic tests added; canonical aggregate `EEA407C09C24E4523B64B1C3BB2BC69DC2D4DE73F68106002871EBD141AC222C`.
- Reconciliation decision: `merge-into-canonical`, bound to the local installer hash and candidate release hash in `C:\Users\krish\Documents\Codex\2026-08-29\read\work\codex-surface-07a67cda9f99-reconciliation-v2026.08.29.1.json`.

A syntax-only validation created two additional transient `.pyc` files after the original snapshot. The pre-install backup and audit preserve that observed state. None of the three cache files was admitted to Git or remains in the installed canonical skill.

## Installation evidence

- Plan: 27 missing, one exact (`video-engine`), one reconciled replacement (`locked-revision`), zero unreconciled drift.
- Apply: 28 changes and one exact skill.
- Deployment record: `C:\Users\krish\.codex\skills.harness-backups\codex-surface-07a67cda9f99\v2026.08.29.1-20260829T120430Z-395f045b\deployment-record.json`.
- Replacement backup: the same deployment directory contains the byte-exact prior `locked-revision`.
- Post-install plan: 29 exact, zero changes, zero drift, zero missing.
- Post-install personalized surface: 29 skills, 139 files, ordinal aggregate `1C45506654DCEAE3FC5AB30FBD256265D5ED8759F3F3B0FDC8A26122AC6C498A`.
- `.system` remained present and excluded from personalized parity.

## Fresh-task canary

Fresh Codex task `01a04d69-414f-75e0-b9b8-094d36979749` returned PASS without mutations.

- 29 personal directories and 29 `SKILL.md` files; installed and deployment-record name sets differ by zero.
- Deployment identity, result, commit, and 29-skill count passed.
- `locked-revision` positive/negative boundaries, authoritative-baseline stop, five supporting paths, and zero installed bytecode caches passed.
- `video-engine` exact-launch and ordinary-video negative boundaries passed statically without repository fetch or CLI execution.
- `ctrl-intake` paired `leaves/voice.md` plus `leaves/transcripts.md` availability passed.
- Coexistence and both rollback locations passed read-only checks.

Residual uncertainty: fresh-task routing was verified from discovered installed contracts rather than by invoking a runtime classifier or launching the Video Engine. This was intentional to keep the canary read-only and avoid activating an operational workflow.

## Ongoing reconciliation

Heartbeat `daily-ai-harness-reconciliation-surface` remains ACTIVE at 08:30 local daily. Saved-prompt readback SHA-256 is `504921CE3A2230FE65A2FAF2011131C8D9CA35ADBA69F235CBEB775438EE14DD`. Its prompt preserves provider exclusions, ordinal hashing, immutable-release-only installation, plan-only gating, rollback, fresh-task canaries, deterministic dual-transport checks, paired CTRL voice resources, mobile-web boundaries, and read-only design-intelligence constraints.
