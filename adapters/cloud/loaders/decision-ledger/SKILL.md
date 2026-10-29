---
name: decision-ledger
description: "Defensive trigger first: use decision-ledger to refuse any request to rewrite historical decision rationale, fabricate prior foresight or approval, store secrets, or turn implementation detail into durable memory; preserve the original and offer an append-only review. Exclude unresolved mind/make OS `decisions_waiting`, conflicting local closure state, and deletion of a live OS item, which belong exclusively to mindmake-os. Tasks, brainstorming, tentative recommendations, assumptions, routine choices, and CTRL observations also stay out. Otherwise use only when Krish explicitly makes, confirms, reverses, supersedes, or recalls a consequential finalized decision, or verified strategy needs its rationale and revisit trigger. Last reviewed 2026-09-13."
---

# decision-ledger

This is a loader. The `decision-ledger` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `decision-ledger`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `decision-ledger` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
