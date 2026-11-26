# Reconciliation evidence: additional Codex machine and Claude local

Recorded: 2026-08-29T13:50:50Z
Proposed release: `v2026.08.29.2`
Hash algorithm: `sha256-path-nul-file-sha256-ordinal-v1`

## Inputs preserved

- GitHub `origin/main` at `d60b85126a96c9cd5711a1fe77bf5a5aae952cc6`.
- Additional Codex machine release `harness-v2026.08.29.1` at `bf9861c9c2823866835b002b3fe8826a3694113f`, with 29 skills and its recorded deployment canary for `codex-surface-07a67cda9f99`.
- Byte-preserved Claude snapshot at `C:\Users\krish\.scratch\ai-harness-reconcile-2026-08-29-claude-snapshot\skills`.
- Mindmake commercial canon at `krishanraja/mindmake` commit `1f7241b152c2912298d8a397bee266e257b97e15`.
- Live OS architecture at `C:\Users\krish\control-center\docs\MINDMAKER_OS_ARCHITECTURE.md`, observed 2026-08-29.

Complete aggregate hashes:

| Input | Skills/files scope | SHA-256 |
|---|---|---|
| Fetched GitHub release source | complete `skills/` tree | `52B50E24D2B5DF004E3A0EF6E27A2FA158177BFA989C6745EE9BB145EE0AB6B2` |
| Preserved Claude local snapshot | complete snapshot, including extras | `5C7DE023ADD584DCC224988AAACE33059211BB59D5AC7C16FC3ED263D5593C68` |
| Reconciled candidate before commit | complete 29-skill `skills/` tree | `7B13998DD29B2AAFFB628CE49227FF68B642A267B1EC5BFFFE87FC1EC7906CE6` |

## Reconciliation decisions

| Inbound change | Classification | Decision and evidence |
|---|---|---|
| `locked-revision` and `video-engine` from the additional Codex machine | known approved release descendant | Retain. They have distinct narrow routes, trigger/behavior suites, and were already packaged and canaried in `harness-v2026.08.29.1`. |
| `mindmaker` -> `mindmake` and `mindmaker-os` -> `mindmake-os` | promote and merge | Adopt the source-backed rename. The new commercial and OS documentation explicitly makes Mindmake and mind/make OS canonical and retires Mindmaker except for legal, historical, URL, filesystem, and verbatim-quote contexts. |
| Claude commercial canon, publication channels, voice doctrine, route references, and provider labels | merge candidate | Adopt where corroborated by the Mindmake North Star, canon, publication document, live OS architecture, or a purely mechanical route rename. Add negative regressions for the retired brand/skill names. |
| Claude Mindmake design edits | merge with correction | Adopt the rename but replace its stale forest/Space Grotesk system with a bounded live-source route and the recorded ink/mint/amber and Archivo/Newsreader/IBM Plex Mono/Source Serif 4 roles. The North Star wins identity conflicts. |
| Claude `design-intelligence-search` vendor byte drift | tooling-only byte drift | Do not promote the differing CRLF working-copy bytes. The candidate adapter still proves the pinned newline-normalized vendor hash `9D1A0F3C3DBFE96D6BFE54B656C216A30323C3815197409BCAC034481B0C6807`; retain the canonical LF bytes and unchanged pinned commit `abb7f2fd5a083fa1ff55c326a963ff0d95c33f99`. |
| Claude broad `ui-ux-pro-max` skill | extra/collision | Do not admit or package. Its broad authority duplicates `krish-design`, `build-apps-with-krish`, and the bounded manual-only adapter. The snapshot is retained; no deletion is authorized by this reconciliation. |
| Old `mindmaker`/`mindmaker-os` routes | superseded names | Rename the canonical skills and their evals. Preserve old names only in explicit retirement regressions, legal entity names, historical URLs/paths, or verbatim evidence. |

The final candidate `mindmake` hash is `D4076EE99318A6F2DAE4504399BEB62B7AF0B96F4D5BD9DBD4C9EC260C0F1F73`; `mindmake-os` is `76BC9DDA957B1CDC54BE75F4C66075F0221E42502FF84B610841F07257BA0C9B`.

## Gate evidence before commit

- Harness validation: passed, 29 skills, 3 adapters, no high-confidence secrets.
- JSONL parse: passed for every evaluation record.
- Design adapter tests: 5/5 passed.
- Pinned upstream UI/UX Pro Max tests: 36/36 passed.
- Pinned data validation: 12 domain files, 22 stack files, and `ui-reasoning.csv` passed.
- `locked-revision` offline tests: 5/5 passed.
- Standard and Perplexity repeat packaging: 58/58 archives byte-identical across two LF-normalized builds.
- `ctrl-intake` transport check: `SKILL.md`, `leaves/voice.md`, and `leaves/transcripts.md` survived both layouts at their required paths.
- PowerShell parser: passed for the builder, surface auditor, installer, installer self-test, and full harness validator.
- Runtime-independent evidence: PowerShell `7.6.4`, .NET `10.0.10`, locale `en-US`, explicit `StringComparer.Ordinal`, manifest schema 4.

The bundled `skill-creator` quick validator was also attempted but its host Python lacks the validator's undeclared `PyYAML` dependency. This is a validator-environment limitation, not a skill failure; the repository's stricter frontmatter, naming, reference, metadata, behavior, security, and packaging validator passed. The clean-commit installer refusal/reconciliation self-test and immutable release build remain post-commit gates.

## Authority and rollback

This stage has not mutated a local client, cloud account, GitHub `main`, tag, or release. Claude's original bytes and both preview builds remain under `.scratch`. Deployment must use the clean immutable packages, preserve per-surface backups, and refuse any hash that no longer matches this reconciliation. Permanent deletion remains separately gated.
