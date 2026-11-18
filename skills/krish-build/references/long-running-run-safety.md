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

## Sub-sessions and agent fan-out

For a child session, a workflow of agents, or any batch split across agents on one machine.

- **A child gets everything in its first prompt.** Never assume messaging between sessions works in either direction. On 18 November 2026 a cloud session could not message the cloud child it had created (the growth push session's report), and a cloud child could not message a parent running on Krish's own computer (this curator's own refused send); both times the platform wanted a trusted device to vouch. Put the full brief, the rules and the hand-back route in the child's first prompt, and hand the result back by the operating contract's Session closeout route (committed, filed in the research library, or carried in full), with a message between sessions only as an extra. For a later batch, start a fresh child with its own full brief; never make a forward by Krish the planned route.
- **Size a fan-out to the machine's concurrency cap.** Read the cap before planning. On 18 November 2026, by the growth push session's own report, a 4-core worker ran at most two workflow agents at a time. Re-check the cap on each machine; never carry this figure over. Group items per agent, for example three or four drafts per verifier, rather than one agent per item.
- **Resume reuses a finished stage only while its prompt is byte-identical.** Keep finished stages' prompts unchanged when relaunching. When a ruling changes mid-run, stop the run, leave the unaffected stages' prompts exactly as they were, put the new rule only into the affected stages, and relaunch.
- **On a shared machine, keep agents inside the task's own folder.** Copy the evidence a run needs into that folder first, then point the agents at the copy. Which folders agents may read is the machine's own instructions file's rule, where one exists; follow it there.

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
