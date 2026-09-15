# Long-running run safety

Use these patterns for workers, leases, scheduled tasks, external processes, expensive batches, and pipelines that may be interrupted or resumed.

## Durable run envelope

Before execution, record:

```text
RUN ID: [stable id]
INPUT SEAL: [semantic input hash/version]
CURRENT STAGE: [id]
CHECKPOINT: [durable authoritative location]
ATTEMPT BUDGET: [total across restarts]
ITEM/COST BUDGET: [hard cap]
LEASE/OWNER: [if applicable]
CHILD PROCESSES: [owned ids or none]
COMPLETION EVIDENCE: [authoritative output and postcondition]
RECOVERY ENTRYPOINT: [the real operating surface]
```

## Invariants

- Persist attempt, item, and spend consumption outside process memory. A restart cannot restore the original budget.
- Make each retry semantic: bind it to the same run id, input seal, stage, and intended effect. A changed input creates a new identity rather than reusing an old successful result.
- Use idempotent writes where possible. For at-most-once effects, journal intent before action and reconcile the authoritative destination before retrying.
- A parent owns every child process until terminal state. On cancellation or failure, stop or explicitly transfer the child; never leave it running because the supervisor exited.
- Use `verification-loop` for the distinct liveness, progress, correctness, and completion verdicts and for authoritative final readback.
- Make skips prove why work is already satisfied. A pre-existing record is not proof unless its identity and lineage match the current input.
- Bound retries by error class. Permanent contract, authority, or validation errors hold immediately; transient errors consume the shared attempt budget.
- Recovery is not real until exercised through the same scheduler, API, CLI, or operator surface shape that will invoke it in practice. This does not grant authority to fire production or external effects: use a fixture, staging target, simulation, or authorised bounded canary unless the task separately authorises the real effect.

## Checkpoint design

A checkpoint records the last committed semantic boundary, not the last line executed. It should include the run id, stage, input seal, produced artifact identity, consumed budget, and any outstanding external effect whose result still needs reconciliation.

Resume by validating the checkpoint and authoritative destination, then selecting the first stage whose postcondition is not established. Do not simply continue from a numeric cursor when earlier derived state can be stale or wrong.

## Failure report

Report separately:

- liveness and latest heartbeat;
- progress and last committed checkpoint;
- correctness and stage postcondition;
- total attempts/items/cost consumed;
- owned child processes still running;
- retryable versus terminal cause;
- exact recovery entrypoint and whether it was exercised;
- final consumed-outcome verification.
