---
name: locked-revision
description: Apply surgical changes to an already approved, final, or locked artifact without regressing anything else. Use when the user says "change nothing else," "do not regress," "keep everything else identical," requests an exact revision of a prior version, or when multiple prior approvals must remain intact. Do not use for ordinary first drafts or broad redesigns.
---

# locked-revision

This is a loader. The `locked-revision` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `locked-revision`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `locked-revision` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
