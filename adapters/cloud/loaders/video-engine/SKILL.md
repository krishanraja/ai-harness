---
name: video-engine
description: "Use this skill whenever the current user message, after trimming leading and trailing whitespace, equals 'Video engine' case-insensitively, so the skill can validate the launch guard. Discovery is not activation: after loading, activate only if that exact message is also the first user-authored message in a new chat. Terminal punctuation, additional words or lines, quoted mentions, later-turn uses, and $video-engine must not activate the engine. On a failed guard, stop before accessing the authority repository. Never activate for ordinary video requests."
---

# video-engine

This is a loader. The `video-engine` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `video-engine`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `video-engine` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
