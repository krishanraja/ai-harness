---
name: tools-access
description: "Secure runtime access, identity, scope, and target-verification contract for authenticated services used across Krish's operating system. Use when a task needs GitHub, Vercel, Supabase, n8n, Apify, Stripe, MCPMarket, or another authenticated service; when choosing OAuth, connector, CLI, or managed-secret access; when login, scope, tenant, session, connector, or credential state fails; or when a credential may be exposed, stale, or over-privileged. This skill contains no credential values and never turns authentication into mutation authority. It proves access and hands the verified context to the narrow task owner; it does not become the deployer, researcher, tester, publisher, or operator merely because it controls authentication. Last reviewed 2026-10-18."
---

# tools-access

This is a loader. The `tools-access` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `tools-access`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `tools-access` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
