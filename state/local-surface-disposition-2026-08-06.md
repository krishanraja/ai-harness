# Local skill-surface disposition — 2026-08-06

## Decision

The private GitHub repository and its validated release manifest are the source of truth. Cursor, Claude Desktop/Code, and Codex receive release-managed copies. `C:\Users\krish\.agents\skills` remains a third-party/shared catalog, not a second canonical deployment. Codex's provider-managed `.system` directory is outside the user-skill set and must not be moved.

No directory in this audit is deleted. Every approved retirement is a reversible move to a release-addressed quarantine with a deployment record and hash verification.

## Current drift against the 26-skill candidate

| Surface | User directories | Canonical present | Canonical missing | Noncanonical |
|---|---:|---:|---:|---:|
| Cursor `C:\Users\krish\.cursor\skills` | 32 | 24 | 2 | 8 |
| Claude `C:\Users\krish\.claude\skills` | 99 | 24 | 2 | 75 |
| Codex `C:\Users\krish\.codex\skills` | 32 | 24 | 2 | 8 |
| Shared `.agents` catalog | 66 | 5 name collisions | 21 not expected here | 61 distinct/noncanonical names |

The two missing canonical skills on each primary client are `n8n-operator` and `instantly-operator`.

## Primary-client retirements

The same eight noncanonical directories are active in Cursor and Codex, and also occur in Claude:

`agentic-engineering`, `backend-patterns`, `browser-qa`, `design-system`, `e2e-testing`, `frontend-patterns`, `n8n-cli`, `postgres-patterns`.

Disposition: quarantine from all three primary client surfaces after the 26-skill release installs successfully. They are generic, overlapping, unprovenanced, overlong, malformed, or superseded; `n8n-cli` is specifically superseded by `n8n-operator`. Their source copies remain recoverable and can later be admitted only through the same provenance, routing, behavior-evaluation, and release gate as canonical skills.

## Claude-only retirements

Claude has 67 additional noncanonical directories beyond those eight. Quarantine all 67 from the active Claude surface after the canonical release installs. High-confidence collisions/supersessions include:

`agent-md-refactor`, `code-reviewer`, `data-pipeline`, `data-pipeline-architect`, `design`, `fleet-ops`, `N8N`, `strategy`, `uiux-toolkit`, `ux`, `ux-concepts`, `ux-principles`.

The remaining Claude-only directories are not declared bad; they are unadmitted third-party or project-specific capabilities. They stay recoverable in quarantine and may be reviewed individually when a real route and repeated need justify admission. Bundles and corpora are not executable skills.

Exact Claude noncanonical set (75):

```text
agentic-engineering
agent-md-refactor
audit
backend-patterns
backend-to-frontend-handoff-docs
browser-qa
build-partner
c4-architecture
Claude Skills Ultimate Bundle
code-reviewer
codex
command-creator
commit-work
crafting-effective-readmes
daily-meeting-update
database-schema-designer
datadog-cli
data-pipeline
data-pipeline-architect
dependency-updater
design
design-system
design-system-starter
difficult-workplace-conversations
domain-name-brainstormer
draw-io
e2e-testing
edge-function-deploy-and-verify
excalidraw
feedback-mastery
fine-tuning-expert
fleet-ops
frontend-patterns
frontend-to-backend-requirements
fullstack-planner
game-changing-features
gemini
gepetto
humanizer
jira
krish-content-corpus
lesson-learned
live-verify-via-playwright-login
marp-slide
meme-factory
mermaid-diagrams
mui
N8N
n8n-cli
naming-analyzer
openapi-to-typescript
perplexity
plugin-forge
postgres-patterns
professional-communication
qa-test-planner
qc-fixture-render-harness
react-dev
react-useeffect
react-vite-stack
reducing-entropy
requirements-clarity
session-handoff
ship-learn-next
skill-judge
spa-cache-and-deploy-hardening
strategy
supabase-edge
supabase-mgmt-api-migration
uiux-toolkit
ux
ux-concepts
ux-principles
web-to-markdown
writing-clearly-and-concisely
```

## Shared `.agents` catalog

Do not purge the 61 distinct third-party names as part of the primary-client cleanup. Quarantine only the five same-name canonical collisions—`krish-voice`, `mindmaker`, `mindmaker-os`, `tools-access`, and `ux-testing-agent`—after confirming no client is resolving those paths as its sole active copy. This removes ambiguous ownership while preserving the broader catalog for demand-led review.

## Execution order

1. Build and independently verify the clean 26-skill release.
2. Install all 26 canonical skills to Cursor, Claude, and Codex, preserving replaced versions.
3. Read back directory hashes and run fresh routing/canary prompts in each client.
4. Move the named noncanonical primary-client directories to quarantine; never touch Codex `.system`.
5. Re-audit counts, names, hashes, and route collisions.
6. Only then replace the four temporary Claude Cloud candidates and retire their legacy names under a separate exact approval/readback gate.

## Rollback

Restore the release-addressed backup/quarantine directory to its original surface, verify its directory hash, and rerun the surface audit. A rollback never implicitly restores a retired Cloud skill or changes credentials.
