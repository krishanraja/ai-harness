# n8n operations and failure modes

Use this reference for existing-workflow triage, deployment, or runtime verification. Treat every historical failure pattern as a hypothesis to test on the current tenant and version.

## Table of contents

1. Evidence ladder
2. Triage sequence
3. High-signal hypotheses
4. Deployment readback

## Evidence ladder

Collect, in order:

1. exact live workflow definition, version/update marker, settings, and activation/published state;
2. relevant executions with status, trigger mode, duration, last node, and bounded time window;
3. actual input/output and item count at the first divergence;
4. downstream database row, file, message, webhook receipt, or provider state;
5. monitoring/agent claims only as secondary evidence.

## Triage sequence

1. Reproduce or identify the exact failing execution without rerunning a consequential action.
2. Compare reported symptom with live workflow and downstream outcome.
3. Locate the first node whose observed output differs from its contract.
4. Separate definition drift, credential binding, trigger-shape, item-shape, schema, provider, timeout, race, and downstream failures.
5. Design the smallest correction and a regression case using synthetic/value-minimised data.
6. Preserve the live definition, request exact approval, apply once, read back, and rerun only when duplicate risk is controlled.

## High-signal hypotheses

### Green execution, no useful output

Check for an upstream node returning zero items, a filter removing everything, a schema mismatch that resolves to null, a success branch that never reaches the writer, or a provider response whose body indicates failure. Force an explicit skip/error result where required, but do not send invalid placeholder bodies into costly nodes.

### Manual succeeds, schedule or webhook fails

Compare trigger payload shape, execution mode, current runtime restrictions, credentials, environment variables, time zone, permissions, and timeouts. Reproduce with the real trigger or a faithful fixture; do not promote a manual-only pass.

### Intermittent fan-out failure

Inspect branches that converge while reading named-node output from another branch. Verify execution ordering on the current version. Prefer explicit merge/correlation or sequential dependencies when downstream logic assumes all sources are ready.

### False red or stale failure window

Inspect the workflow's own current executions and final artifact. A monitoring synthesis may include stale errors or a downstream failure. Record the monitor window and distinguish new failures from historical executions that have not rolled out of the window.

### Partial or duplicate creation

After create/update retries, list by stable name and identifiers; identify orphans without deleting them. Preserve successful subsets and idempotency keys. Deletion remains separately approved.

### Timeout at a repeatable boundary

Confirm current platform limits and execution mode from official docs/runtime. Reduce serial calls, batch safely, split asynchronous work, or move to a supported trigger mode; never encode a historical duration as permanent truth.

## Deployment readback

After update/create:

- retrieve and compare the saved definition;
- verify active/published state separately;
- verify any integration/MCP/tool-availability setting that the update path may reset;
- run a bounded safe execution;
- inspect final node output and the downstream artifact;
- check audit/heartbeat/error paths;
- list similarly named workflows to detect orphans;
- retain the pre-change export until the observation window passes.
