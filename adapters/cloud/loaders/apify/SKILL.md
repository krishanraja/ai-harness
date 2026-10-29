---
name: apify
description: "Exclusion gate first: NEVER invoke to build or publish a custom Actor from source; krish-build owns that implementation. Otherwise select, prepare, run, recover, or verify Apify Store Actor jobs and Apify API dataset collection for Krish. Use for Apify, Actor selection, public-web scraping through Apify, Actor input validation, paid-run cost controls, run-sync or async execution, 408/429/empty-dataset diagnosis, dataset pagination, or the Apify leg of an n8n/Supabase/research pipeline. Treat Actor identity, build, schema, permissions, pricing, and health as live facts; require exact run and spend authority; use maxTotalChargeUsd for total charge protection; preserve run/dataset provenance; and stop at a verified collection handoff. Do not mutate downstream systems, conduct legal analysis, synthesise market strategy, or contact scraped people. Last reviewed 2026-10-06."
---

# apify

This is a loader. The `apify` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.

1. Call Control Center `get_skill` with name `apify`. Follow the returned `text` as this skill's instructions, in full.
2. When those instructions name a reference file, read it with `get_skill`, name `apify` and that file's path.
3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.
