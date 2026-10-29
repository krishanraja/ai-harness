---
name: mindmake
description: "Exclusion gate first: never invoke for mind/make OS agents, workflows, n8n, Supabase queues, fleet status, or other live internal runtime state; route those to mindmake-os under `collision-rules.mindmake-os-owns-current`, even when the prompt says Mindmake. This is durable commercial context for Mindmake, Krish Raja's AI advisory, education, and product business. Use for Mindmake offers, ICPs, positioning, sales architecture, mindmake.co, Maven, the editorial funnel, CTRL/mm-ctrl, or customer-facing claims, as context before a commercial producer. Exclude generic conversion strategy and final prose voice. Never answer current price, date, seat, availability, route, product-version, or channel-status questions from this skill alone; retrieve the relevant live source."
---

# mindmake

This is a loader. The `mindmake` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `mindmake`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `mindmake` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
