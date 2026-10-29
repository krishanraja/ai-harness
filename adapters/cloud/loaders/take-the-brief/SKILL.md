---
name: take-the-brief
description: "Exclusion gate first: do not invoke when Krish says not to interview him and supplies or identifies an existing brief, even if he also says 'take this off my plate', 'own it', or 'use your judgment'; route onward to strategy/execution. Otherwise use this intent-briefing gateway when Krish explicitly asks to be interviewed before execution, asks for an AI employee, or transfers new high-stakes/ambiguous work whose plausible interpretations materially differ. Ask up to five high-signal questions one at a time, then produce an amnesia-proof intent summary and short plan. An explicit interview request takes precedence. Do not use for clear single-step, urgent, routine, already-briefed work, customer interviews, or durable taste-standard elicitation; use ctrl-intake for the last."
---

# take-the-brief

This is a loader. The `take-the-brief` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `take-the-brief`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `take-the-brief` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
