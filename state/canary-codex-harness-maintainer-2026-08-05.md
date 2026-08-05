# Codex canary evidence: harness-maintainer - 2026-08-05

## Scope and authority

- Surface: `C:\Users\krish\.codex\skills`
- Skill: `harness-maintainer`
- Prior target state: absent
- Approved scope: install this skill only; test discovery, routing, behavior, and rollback; leave all existing skills untouched
- Production status: canary only; `production_active` remains empty

## Release identity

- Release ID: `canary-300fbe7`
- Source commit: `300fbe77382024ac3e6f15fd6b4201fe3f5b5b8e`
- Release validation: passed
- Release working tree: clean
- Package SHA-256: `C9AD8DC53F77746B2C2517DA8ACF2CF7F920F06E5E9F9537C4C3393581965C68`
- Expected full source-skill SHA-256: `8F78C1979F82A9DD712EB2C4568690C9023D305BDC8F1714B9DDB321CD40A1B2`

## Install-path finding

The initial install used the official GitHub skill installer with a clean checkout pinned to the exact source commit. On this Windows host, Git normalized LF files to CRLF. The installed text was semantically unchanged, but the reviewed bytes were not preserved:

- Git-checkout installed full-directory SHA-256: `048AB8001A8B663435F8D0FC826CCF7D94C1EE383F181DF8EFD5925C2E3375E2`
- Expected full-directory SHA-256: `8F78C1979F82A9DD712EB2C4568690C9023D305BDC8F1714B9DDB321CD40A1B2`
- Result: rejected as a parity failure

Only the newly created canary directory was removed. No pre-existing skill was modified. The canary was then installed by extracting the deterministic `.skill` release archive.

## Final installed parity

- Installed full-directory SHA-256: `8F78C1979F82A9DD712EB2C4568690C9023D305BDC8F1714B9DDB321CD40A1B2`
- Expected full-directory SHA-256: `8F78C1979F82A9DD712EB2C4568690C9023D305BDC8F1714B9DDB321CD40A1B2`
- Installed file count: 2
- Hash parity: passed
- Structural/security validation: passed
- Surface audit relation: exact
- Other Codex skill directories modified: none

## Remaining canary gates

- Fresh-task discovery: pending; the already-open Codex task cannot prove a newly installed skill was discovered at task start.
- Positive and negative routing cases: pending fresh-task discovery.
- Chained behavior and coexistence: pending fresh-task discovery.
- Rollback procedure: exact rollback is removal of the newly added directory because the prior target was absent. It has not been executed after the successful install because the canary remains installed for the fresh-task gates.

## Decision

Keep the byte-identical canary installed and do not promote it to production until a new Codex task proves discovery, routing, behavior, and coexistence. Use deterministic release extraction, not Git checkout, for Windows client deployment.
