---
name: tool-economics
description: Choose among available MCP connectors and API-backed services when a task has multiple viable tools or the user asks about allowance, cost, or underuse. Use live capability and entitlement evidence to preserve output quality while avoiding unnecessary paid calls. Do not use for model selection, credential discovery, login, provider operation, or subscription cancellation.
---

# Tool Economics

## Role

This is task-level tool-choice context. The task's domain skill owns the work; `tools-access` owns authentication and scope. This skill chooses a capable route and records why. It never operates a provider, changes a subscription, or reads a credential value.

## Inputs

- At the first tool-relevant request in a fresh session, inspect tools actually connected in that session, read `get_tool_value_catalog` and the authorized `get_service_economics_snapshot` once when available. Recheck economics when its `as_of` is stale or a consequential call needs a live allowance. Catalog membership never proves a connector is installed here.
- The requested outcome and quality bar.
- Tools actually available in this session, from connector/tool descriptions or live discovery.
- A current, access-controlled service-economics snapshot from `get_service_economics_snapshot` when that tool is connected. Check its `as_of`, coverage, and source type. A twice-weekly snapshot is a planning signal, not proof of the remaining balance at call time.
- Provider-specific live price, allowance, expiry, quota, and account identity only where the provider or its official dashboard supplies them.

## Choice

1. Name the capability needed, including output format, rights, quality, and deadline. Rule out tools that cannot meet it.
   Exclude a route marked retired in the current service registry even if its old key remains in KeePass or a connector is still installed. A charge after retirement is a billing review signal, not a reason to use the route.
2. Verify the exact account, service, and billing pool. App or MCP credits may differ from developer API credits; never transfer a balance between pools by inference.
3. When an MCP connector and a direct API can both serve the task, attempt the already connected MCP first. Check that its actual tools support the required operation, parameters, output, scale, and quality; a successful login or broad provider name is not enough. If the MCP lacks needed flexibility, fails, or cannot complete the job, use the direct API through an approved runtime credential and the narrow provider owner. Supabase, Vercel, GitHub, and n8n APIs may expose controls their MCP connectors do not. Record the capability gap and avoid repeating a failed MCP call without a reason. The API route still needs verified identity, scope, billing pool, and authority.
4. Among routes that can complete the task, prefer a verified included allowance before metered overage. Compare the marginal cost of the actual operation, not subscription headline prices. If quality materially differs, show that trade-off and select for the requested outcome. MCP-first is an attempt order, not permission to accept an inadequate result or assume MCP and API share credits.
5. Use an expiring included allowance only for work with real value. Do not create work to burn credits. Use more than one provider when each contributes a distinct needed result, not to consume quotas.
6. If the snapshot is stale, a service is unchecked, prices are unverified, or usage is unmetered, mark that fact unknown and use a small official live read if available. Absence of meter rows never means a tool is unused.
7. Handoff the selected provider, account, scope, estimated incremental cost, source and timestamp to its narrow operator. `tools-access` verifies authentication. Exact approval remains necessary for spending beyond an included allowance, new subscriptions, uploads, sends, publication, deletion, and access changes.
8. Notice when a connected tool could add concrete value to the user's present goal. Offer one specific, optional use with the outcome it would improve and the likely cost or unknown. Do not invent a separate project, interrupt the task with generic suggestions, or spend an allowance merely to use it. Explain the distinctive contribution of the proposed tool; do not list tools by name alone.

## Output

For ordinary work, choose silently and give a one-line reason when the choice affects quality or cost. Offer a relevant tool idea when it materially advances the current task. For a comparison or spend audit, report: task, capable choices, what each contributes, observed entitlement, marginal cost or unknown, source age, selected route, and the next evidence needed. Never put credential values, secret-store coordinates, raw invoices, or account identifiers in this output.

## Stop conditions

- No trustworthy current tool inventory: say which capability is unknown and continue with an available verified route.
- No price or balance evidence for a potentially billable operation: use a no-cost read first; stop before paid execution if its cost could exceed the authorized allowance.
- Conflicting provider and snapshot figures: preserve both scopes and timestamps, then verify the exact billing pool before acting.
