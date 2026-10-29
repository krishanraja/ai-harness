---
name: ctrl-capture
description: "Turns authorised review, method, routing, freshness, and post-release evidence into versioned change proposals for the named standard owner, then monitors accepted changes through the governed CTRL release chain. Use for weekly or scheduled capture, recurring false positives or uncovered needs, method corrections, under-trigger evidence, possible staleness/retirement, accepted proposal handoffs, and whether deployed changes reduced recurrence. Also trigger to refuse direct live-standard edits, one-example overlearning, raw-ledger runtime use, reused-holdout claims, history deletion, or ownerless automatic changes. Do not use for first-time elicitation (`ctrl-intake`), compilation (`ctrl-compile`), packaging (`ctrl-build`), review (`ctrl-check`), or installation/release (`harness-maintainer`). Last reviewed 2026-08-05."
---

# ctrl-capture

This is a loader. The `ctrl-capture` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `ctrl-capture`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `ctrl-capture` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
