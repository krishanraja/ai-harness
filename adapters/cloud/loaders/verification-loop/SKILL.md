---
name: verification-loop
description: "Correction ownership first: after fixing a failed test, invoke verification-loop to rerun the original and adjacent checks; generic regression closure belongs here, not to ux-testing-agent unless the request names UX or a rendered user flow. Exclusion gate: NEVER invoke for an unexecuted future plan when no recommendation, artifact, action, or observable outcome exists, even if asked to call it verified; strategy-brief owns that phase. Otherwise this is Krish's completion gate: invoke to verify, QA, prove, inspect, or certify an existing artifact, change, dataset, workflow, deployment, cloud state, browser flow, research conclusion, or recommendation, including attempts to skip contradictory evidence. Use after every correction and before claiming completion, readiness, parity, or delivery. Select observable independent checks, correct only within authority, rerun failed checks, separate facts from inference, never expose matched secrets, and never treat self-critique as independent proof."
---

# verification-loop

This is a loader. The `verification-loop` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `verification-loop`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `verification-loop` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
