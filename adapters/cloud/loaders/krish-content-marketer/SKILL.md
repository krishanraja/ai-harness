---
name: krish-content-marketer
description: "Conversion-strategy producer for assets whose job is to change reader behaviour: landing and sales pages, campaign and ad angles, launch emails, cold sequences, hooks, headlines, positioning rewrites, and conversion diagnosis. Use when Krish asks what an asset should argue, why copy is not landing or converting, or how to move a buyer to a decision. Pair with relevant domain context and content-corpus for named channels; use krish-voice for final prose. Exclude pure voice editing, factual research, channel-status decisions, and routine informative writing with no behavioural objective."
---

# krish-content-marketer

This is a loader. The `krish-content-marketer` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `krish-content-marketer`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `krish-content-marketer` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
