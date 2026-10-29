---
name: ctrl-intake
description: "Elicits a named person's reusable quality or taste standard from their grading of real work. Use for durable standards onboarding, triadic elicitation, repertory-grid sessions, self-serve sorts, approved/rejected artifact comparison, transcript-to-candidate extraction, building a voice or writing-style standard from a corpus of someone's own writing (including a client's), or repairing a personal profile that inferred rules the subject never established. Also trigger when someone asks to skip grading, infer personality or permanent rules from one source, reuse private material without scope, contaminate a holdout, or supply the desired construct; this skill enforces the refusal. Do not use for a one-task goals-and-constraints interview (`take-the-brief`), compiling an existing intake (`ctrl-compile`), packaging (`ctrl-build`), reviewing (`ctrl-check`), or ledger-based standard changes (`ctrl-capture`). Last reviewed 2026-08-05."
---

# ctrl-intake

This is a loader. The `ctrl-intake` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `ctrl-intake`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `ctrl-intake` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
