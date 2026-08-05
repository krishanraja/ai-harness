---
name: mindmaker-os
description: Canonical operating guide for Krish Raja's Mindmaker OS. Use for questions or work involving the Mindmaker OS architecture, Control Center, agent fleet, OpenClaw VPS, n8n workflows, Supabase operating state, self-healing loops, agent plans, decisions_waiting, concept closure, or cross-surface OS reconciliation. Do not use for Mindmaker's commercial offers alone; use the mindmaker skill instead. Always retrieve live state for counts, status, schedules, and credentials rather than trusting a cached value.
---

# Mindmaker OS

Use this skill as a router to the right source and verification path. It deliberately does not embed the full architecture manual or current fleet counts.

## Source selection

1. For durable architecture, read the current `docs/MINDMAKER_OS_ARCHITECTURE.md` on the default branch of `krishanraja/control-center`. Capture its commit and file hash.
2. For current operational state, query the relevant Supabase table/view or service API. Capture retrieval time and the query's scope.
3. For a human procedure, read the applicable version-controlled or local runbook and note its reviewed date.
4. For current code behavior, inspect the deployed revision and repository code. Documentation alone is not proof of runtime behavior.
5. Never read credentials from this skill. Retrieve a named secret only at execution time from the approved secret store.

## Working protocol

1. Classify the request as architecture, live state, procedure, code/runtime, or a combination.
2. Load only the sources required for that class.
3. Compare source claims when more than one surface is involved.
4. If the architecture, runtime, and live state disagree, record a reconciliation finding before changing anything.
5. Apply Krish's authority boundaries: research and drafts are autonomous; publishing, sending, credential rotation, charges, and irreversible external mutations need explicit approval.
6. Verify the requested outcome with an observable check. State the source, revision/time, and any remaining inference.

## Freshness rules

- Counts, workflow activation, schedules, agent status, current tasks, and credential health are always live-state facts.
- A reviewed date never overrides a newer commit or live result.
- Do not force freshness by touching file mtimes. Builds and syncs must identify their source commit and artifact hash.
- When producing a skill/cloud artifact, package from a clean canonical commit and record the SHA-256 in `state/surfaces.json`.

## Non-negotiables

- Supabase is the operating-state source of truth; local JSON must not become a competing state store.
- Approval is a wall. Drafts are allowed; nothing publishes or sends automatically.
- Objective, plan, identity, and decision are distinct concepts.
- Concept closures are durable and cross-surface; do not simulate closure with a single row update.
- Deterministic checks beat model assertions, especially for numbers, sync parity, and completion.

