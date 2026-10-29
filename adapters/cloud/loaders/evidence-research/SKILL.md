---
name: evidence-research
description: Decision-grade research and due diligence for Krish. Use when asked to investigate, research, compare, verify, diligence, map a market, evaluate evidence, establish current truth, or produce a sourced recommendation; when claims are recent, disputed, niche, costly, or consequential; and when strategy depends on external facts. Do not use for a simple stable fact with one authoritative source or as a substitute for execution. Frame the decision first, prefer primary evidence, preserve contradictions and dates, separate fact from inference, and hand a claim-evidence matrix to strategy and verification.
---

# evidence-research

This is a loader. The `evidence-research` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `evidence-research`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `evidence-research` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
