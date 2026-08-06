# n8n workflow design

Use this reference for net-new workflow architecture or a structural revision.

## Table of contents

1. Data contracts
2. Structure and control flow
3. External actions
4. AI nodes
5. Reliability checklist

## Data contracts

n8n moves arrays of items between nodes. Define the expected item count and JSON/binary schema before each node. After fan-out, merge, aggregation, batching, or a sub-workflow boundary, verify the resulting item count and correlation key explicitly.

Use explicit field-setting/transform nodes for renaming and normalisation. Use code only when the transformation cannot be expressed reliably with ordinary nodes. Code must return the documented n8n item shape for its configured execution mode.

Pin synthetic or value-minimised data while developing. Never pin secrets or unnecessary personal data.

## Structure and control flow

- Start with one trigger whose real payload shape is represented in tests.
- Split stable responsibilities into sub-workflows with explicit input/output contracts.
- Prefer deterministic `If`, `Switch`, filter, merge, aggregate, and bounded loop patterns over an AI agent.
- Add a timeout and stop rule around polling or waits.
- Design empty, null, duplicate, partial, rate-limited, and upstream-unavailable paths deliberately.
- Guarantee one observable result for a deliberate skip; do not manufacture invalid downstream payloads merely to keep nodes running.
- Avoid parallel branches that read each other's unfinished output. Correlate by stable keys or sequence dependencies when ordering matters.

## External actions

Before a paid, send-capable, or mutating node:

1. deduplicate and filter first;
2. check prerequisites and system health;
3. enforce batch, cost, retry, and time caps;
4. attach an idempotency or correlation key where the provider supports one;
5. route success, partial success, retryable failure, and terminal failure separately;
6. write an audit/heartbeat signal on both success and failure;
7. verify the downstream artifact, not only the node response.

Keep provider credentials in n8n Credentials or an approved managed runtime. Never embed them in Code, expressions, workflow notes, fixtures, or exports.

## AI nodes

Use a deterministic transform or simple model chain when no tool-calling autonomy is required. For any model step:

- provide a bounded input and owned prompt source;
- request structured output with a schema;
- validate required fields and truth constraints after generation;
- route invalid/empty output without calling downstream paid or send nodes;
- cap items, tokens/cost, retries, and latency;
- retain a human gate before public or consequential output;
- record model/provider/retrieval context without secrets.

## Reliability checklist

- Real trigger shape tested, not manual trigger alone.
- Every branch reaches a deliberate terminal state.
- Empty inputs do not silently halt required reporting.
- Loop and polling exit conditions are bounded.
- External writes are idempotent or duplicate-safe.
- Error workflow/route and operator notification exist where consequence warrants them.
- Workflow and sub-workflow contracts match.
- Node parameters were checked against the installed/current provider schema.
- A real downstream outcome can be observed independently.
