---
name: ux-testing-agent
description: "Evidence-first UX diagnosis and acceptance testing for a rendered app or its repository-plus-runtime. Use when Krish asks to test, QA, audit, inspect, review, smoke-test, reproduce, accessibility-test, responsive-test, or validate a release, flow, fix, deployed app, or GitHub repository from a real user's perspective. Do not invoke for the generic instruction to rerun a failed automated test and adjacent checks after a code fix; verification-loop owns that regression closure unless UX or a rendered user flow is named. Start read-only, resolve current repository and deployment identity live, test high-value tasks and failure states, and return reproducible evidence. Do not own product strategy, visual redesign, copy voice, code implementation, deployment, security review, real payments, external sends, credentials, or production data. A repository without a matching runnable artifact supports source observations only, not a usability verdict. Last reviewed 2026-10-06."
---

# ux-testing-agent

This is a loader. The `ux-testing-agent` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `ux-testing-agent`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `ux-testing-agent` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
