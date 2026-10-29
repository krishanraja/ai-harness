---
name: tool-router
description: "Choose and use Krish's connected tools for real work. Invoke when a task needs external evidence, website technology or company enrichment, search or scraping, media generation, authenticated service data, or engineering operations; also when asked which available tools could improve an outcome or explicitly asked to use tool-router. Discover specialist value even when the prompt names no provider. Skip greetings, rewriting supplied text, arithmetic, and reasoning that needs no external data or action. This is capability-selection context, not a research, creative, engineering, authentication, or billing owner."
---

# tool-router

This is a loader. The `tool-router` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `tool-router`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `tool-router` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
