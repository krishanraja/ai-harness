---
name: krish-build
description: "Technical producer for implementation and repair. MUST load for code changes, including a single pure function, and for designing or repairing a multi-stage repository pipeline. For non-trivial implementation, strategy-brief routes first and then hands to krish-build; observing strategy-brief never replaces this producer. Tiny reversible edits may use krish-build directly with a compressed strategy check. Trigger on: 'build this', 'implement', 'deploy', 'ship it', 'commit', 'edge function', 'migration', 'API endpoint', 'run the pipeline', 'stage conveyor', 'set this up', 'wire this', 'API key', 'why did this fail', 'it ran but nothing happened', file delivery builds, or multi-step technical execution. Covers stage ownership, determinism, idempotency, gates, runtime-only secrets, validation, repair, and environment truth. Use tools-access for authentication and a reviewed tool skill for API mechanics. Fully reviewed 2026-10-06."
---

# krish-build

This is a loader. The `krish-build` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `krish-build`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `krish-build` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
