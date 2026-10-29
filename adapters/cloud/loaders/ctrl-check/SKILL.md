---
name: ctrl-check
description: "Independently reviews a frozen submission or personal AI package against an exact accepted standard, returning criterion-level evidence, provenance findings, bounded revisions, and an advisory owner handoff. Use for pre-send drafts, decks, proposals, emails, posts, profiles, instructions, SKILL.md packages, second opinions, and rechecks after fixes. Also trigger to refuse guessed personal judgment without a standard, same-pass self-certification, sealed-holdout or ledger leakage, silent logging, automatic blocking, or edit/send/publish shortcuts. Do not use to elicit (`ctrl-intake`), compile (`ctrl-compile`), build (`ctrl-build`), learn/update (`ctrl-capture`), perform app QA (`ux-testing-agent`), implement fixes (`krish-build`), or deploy. Last reviewed 2026-08-05."
---

# ctrl-check

This is a loader. The `ctrl-check` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `ctrl-check`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `ctrl-check` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
