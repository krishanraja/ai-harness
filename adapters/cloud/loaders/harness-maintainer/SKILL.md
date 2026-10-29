---
name: harness-maintainer
description: Governance and lifecycle manager for Krish's canonical AI harness. Use when auditing, adding, revising, splitting, merging, admitting, deprecating, quarantining, packaging, syncing, or diagnosing a skill, rule, adapter, evaluation, or client surface; when a skill mis-triggers, overlaps, goes stale, or behaves differently across Claude, Cursor, Codex, or cloud; and when proposing a missing skill or chapter. Apply the active-skill quality standard, preserve the curated-only policy, stage changes before activation, and never upload, enable, disable, delete, relink, or publish without the required approval.
---

# harness-maintainer

This is a loader. The `harness-maintainer` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `harness-maintainer`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `harness-maintainer` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
