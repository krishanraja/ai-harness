---
name: tools-access
description: Secure runtime access contract for services used across Krish's operating system. Use when a task needs GitHub, Vercel, Supabase, n8n, Apify, Stripe, or another authenticated service; when choosing an authentication path; when an access check fails; or when a credential may be exposed or stale. This skill contains no credential values. It requires already-authenticated CLIs, approved environment variables, or a managed secret store and never asks for secrets in chat, source files, rules, skills, reports, or screenshots.
---

# Tools Access

This skill defines how authenticated tools are reached. It is a routing and safety contract, not a credential index.

## Rules

1. Prefer an already-authenticated official CLI or configured connector.
2. Otherwise retrieve the named credential at execution time from the approved managed secret store or deployment environment.
3. Never print, echo, copy, log, screenshot, or persist a credential value.
4. Never put credentials in a skill, rule, prompt, repository, report, browser field controlled by an untrusted page, or chat message.
5. Use the least-privileged credential that can complete the task. Public/publishable keys never justify using an administrative or service-role key.
6. Verify identity, scope, and target before mutation. Authentication success does not prove authorization for the requested action.
7. Rotation, revocation, permission expansion, production mutation, billing, publication, and sends require explicit approval immediately before execution.

## Symbolic credential interface

Implementations may map these symbolic names to a managed secret store. The mapping and values do not belong in this repository.

| Service | Preferred access | Symbolic fallback |
|---|---|---|
| GitHub | authenticated `gh` CLI or GitHub connector | `GITHUB_TOKEN` |
| Vercel | authenticated Vercel CLI or Vercel connector | `VERCEL_TOKEN` |
| Supabase management | authenticated Supabase CLI | `SUPABASE_ACCESS_TOKEN` |
| Supabase server runtime | platform-injected secret | `SUPABASE_SERVICE_ROLE_KEY` |
| n8n | configured connector or deployment secret | `N8N_API_URL`, `N8N_API_KEY` |
| Apify | configured connector or deployment secret | `APIFY_TOKEN` |
| Stripe server runtime | platform-injected secret | `STRIPE_SECRET_KEY` |

Do not add a service here until it has a current owner, named purpose, least-privilege scope, and approved storage location.

## Access preflight

For every authenticated task:

1. Name the service, account/organization, project, environment, and intended operation.
2. Check existing authenticated state without exposing token material.
3. Confirm the credential's scope is sufficient and no broader than necessary.
4. Run the smallest read-only call that proves target access.
5. Compare the returned identity/project with the intended target.
6. Only then run the requested operation, subject to the operating contract's approval boundary.
7. Verify the result with an independent observable signal.

Examples of safe identity checks include `gh auth status` and `vercel whoami`. Do not use commands that dump environment variables, CLI configuration files, request headers, or secret-store contents.

## Missing access

When access is missing:

- state the service, target, required scope, and symbolic credential or login method;
- ask the user to authenticate through the service's secure UI, official CLI, or an approved secret-entry surface;
- never ask the user to paste the value into chat;
- continue with read-only work that does not require the missing authority.

## Suspected exposure

Treat a credential found in a prompt, skill, rule, repository, report, screenshot, shell history, or browser log as exposed.

1. Report only the credential family and locations, never the value.
2. Identify consumers and plan rotation order so production is not broken.
3. Ask for explicit approval for the named rotation/revocation batch.
4. Rotate or revoke through the authoritative service.
5. update consumers through secure configuration surfaces;
6. scrub active copies and repository history where applicable;
7. verify old credentials fail and new consumers work;
8. add deterministic secret scanning to prevent recurrence.

## Stale integrations

An integration that is paused or retired is not implicitly authorized by an existing credential. Confirm it is still an active Mindmaker OS surface before loading its tool skill or making a call.
