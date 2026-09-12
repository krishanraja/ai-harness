---
name: video-engine
description: "Exact activation guard for Krishan Raja's Mindmake Video Engine. Activate only when the complete first user message, after trimming leading and trailing whitespace, equals 'Video engine' case-insensitively. Terminal punctuation, additional words or lines, quoted mentions, later-turn uses, and $video-engine must not activate the engine. A client may retrieve this guard while resolving a nearby phrase; retrieval is not activation and must stop before accessing the authority repository. Never activate for ordinary video requests."
---

# Video Engine launcher

Use this as a thin launcher. GitHub `krishanraja/mindmake-video-studio` `main` is the only authority for code, configuration, operational instructions, and durable learning.

Semantic clients may retrieve this file while deciding whether a nearby phrase matches. That read is not a launch. Activation begins only when the exact-match check passes and the client accesses, fetches, or runs the authority repository or its engine surface. On a failed match, do not cross that boundary.

## Trigger contract

Start a new Video Engine session only when both are true:

1. The current message is the first user-authored message in a new chat.
2. After removing leading and trailing whitespace only, its complete contents equal `Video engine`, case-insensitively.

`Video engine`, `VIDEO ENGINE` and ` Video engine ` pass. Everything else fails, including `Video engine!`, `Video engine please`, a message carrying another line, a quoted mention, `$video-engine`, and the exact words on a later turn.

This matches `krishanraja/mindmake-video-studio` `main` exactly, which this file names as the only authority. Narrowed here on 2026-09-08: the canon had been declaring a wider trigger than the repository it defers to, which the SURFACE reconciliation caught as a standing collision.

- Do not activate from phrases such as `video edit`, `edit this video`, `generate a video`, `my video engine`, `how does the video engine work?`, or any unrelated mention of video production.
- If this skill was selected but the trigger contract is not satisfied, stop applying it immediately. Do not fetch the repository, run the CLI, inspect Video Engine state, or redirect the request. Handle the request normally with the relevant general capability.
- After a valid launch, follow-up turns in that same chat may continue the active Video Engine workflow without repeating the launch phrase.

## Start every session

1. Obtain the latest `main` commit from GitHub into a disposable checkout under the current task's `work/` directory. Never use an unrelated or stale local clone as authority.
2. Read the checkout's `AGENTS.md` and `.agents/skills/mindmake-video/SKILL.md` completely before operating the engine.
3. Use `drive_root/Ventures/Active/Mindmaker/04_Content/Video Engine` as the media inbox and base path, with `drive_root` resolved for your surface from `contract/paths.yaml`. Where that root is null the engine has no media surface: say so and stop rather than substituting a local directory. Media stays outside GitHub.
4. Run `studio doctor` and the job-list form of `studio status`. Report blockers plainly; never bypass a hard gate.
5. If the user only said `Video engine`, return a concise operating brief with current system health and the most useful next choices: weekly radar, create a video, resume/review a job, or import feedback/analytics. Recommend the strongest next action rather than asking a context-free question.

## Authority and safety

- Treat this installed launcher only as a pointer. When it conflicts with the repository, follow the latest GitHub `main`.
- Fetch provider signals only through the repository's authenticated read-only adapters. Fail closed if credentials or schema versions are invalid.
- Never put media, credentials, tokens, raw private records, OAuth state, jobs, or derived indexes in GitHub.
- Never publish publicly. YouTube uploads are private-only and LinkedIn output is a local draft package.
- Preserve the three approval gates and the feedback confirmation loop. No durable preference becomes active without explicit user approval.
