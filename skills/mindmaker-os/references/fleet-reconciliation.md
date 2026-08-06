# Mindmaker OS fleet reconciliation

Use for existing agent/workflow fleet triage or change planning. Do not answer from an archived fleet map, copied workflow ID, schedule, schema, or status.

## Table of contents

1. Resolve the live topology
2. Trace the control loop
3. Diagnose without stale maps
4. Change and closure protocol

## Resolve the live topology

Reconcile four classes independently:

- intended agent roles, handoffs, approval gates, and learning loops from the current architecture revision;
- live n8n workflows, activation/published state, schedules, definitions, and executions;
- live relational state, schemas, constraints, queues, audit/heartbeat tables, and configuration ownership;
- external runtime/output surfaces such as hosts, deployments, messages, documents, or dashboards.

Resolve stable identities live and record retrieval time. Human-readable agent or workflow names are aliases, not sufficient identifiers. A map in a brief or skill is historical evidence only.

## Trace the control loop

For a task, proposal, approval, correction, or learning claim, trace the complete chain:

```text
origin -> queue/state record -> dispatcher/router -> worker workflow -> external effect
       -> heartbeat/audit -> evaluator -> proposal -> human/approved gate
       -> implementation -> deployment/activation -> recurrence monitor
```

Name every missing edge. A detector, proposal, approval row, or successful execution alone does not prove the loop closed.

## Diagnose without stale maps

1. Pull the exact current workflow definition and relevant executions.
2. Query the current table/view schema before writing code against it.
3. Inspect the first divergent node's real input, output, and item count.
4. Verify the downstream artifact/state that the workflow exists to create.
5. Compare monitoring claims with the workflow's own current evidence window.
6. Distinguish stale history, false red, green-with-empty-output, trigger-mode drift, schema mismatch, fan-out ordering, provider failure, and downstream failure.
7. Hand the located n8n mechanic and acceptance criteria to `n8n-operator`.

Treat any named historical failure pattern as a hypothesis to reproduce, never as permanent tenant truth.

## Change and closure protocol

Before a workflow mutation, preserve the current live definition, resolve dependents and duplicate-trigger risk, and define the database/output readback. `n8n-operator` must request exact approval for create/update/activate/deactivate/execute/delete actions.

After the change, verify:

- saved definition and active/published state;
- real-trigger execution, not manual mode alone;
- database/output effect and audit/heartbeat on success and failure;
- dependent router/map consistency;
- absence of duplicate/orphan workflow effects;
- recurrence monitoring across an appropriate window.

Only then mark the concept or incident closed. Preserve rollback until the observation window passes.
