---
name: content-corpus
description: "Exclusion gate first: never lead drafting, conversion strategy, persuasive angles, strategic overlays, or generic marketing strategy, including for a warm lead email; those belong to krish-content-marketer, with krish-voice owning final prose. Load this skill alongside those owners only when the task also asks what a named channel is for, whom it serves, which native form fits, or how one source should differ across channels. It routes Krish Raja's editorial, audio, education, outbound, and visibility surfaces including the publication's three channels (follow.the.money, under.the.hood, mind.the.gap), Signal & Noise, Maven, and lead email. Never infer that a channel is currently active; verify status live before producing or publishing."
---

# content-corpus

This is a loader. The `content-corpus` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `content-corpus`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `content-corpus` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
