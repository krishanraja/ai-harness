# Repository stage conveyor

Use this pattern when a repository runs a repeatable lifecycle with several derived artifacts, specialised responsibilities, independent gates, resumability, metered work, or material side effects. Do not impose it on a one-step script, a small CRUD surface, or a build whose direct data flow is already clearer.

## Intended outcome

The repository itself makes ownership and handoffs executable. A later agent can locate the stage that owns a defect, change the smallest responsible component, and prove the final consumed result without reconstructing the system from a long narrative file.

The governing split is:

```text
repository instructions explain the route
manifest declares the topology
stage code performs one bounded responsibility
shared guards enforce cross-cutting invariants
artifacts carry lineage between stages
tests prove local behavior and complete handoffs
orchestrator advances eligible stages only
```

## Qualifying gate

Use the conveyor when the combined shape of the work makes explicit ownership and handoffs materially safer or easier to operate. Relevant signals include:

- the work has several material transformations;
- an output feeds more than one downstream consumer;
- a run can be resumed, retried, scheduled, or outlive one session;
- calls are metered, slow, or capable of material side effects;
- different stages need independent standards or reviewers;
- multiple derived artifacts can drift apart;
- the repository has repeatedly fixed downstream symptoms caused by one upstream producer.

These are judgment signals, not a numeric threshold. Otherwise prefer a direct module, function, or script. Stage machinery has a maintenance cost and must earn it.

## Stage contract

Every stage declares:

- stable `id` and one responsibility owner;
- executable paths it owns;
- named input and output artifacts;
- shared guards it consumes;
- allowed side effects, with `none` stated explicitly;
- retry mode, total attempt cap, and durable checkpoint;
- completion evidence derived from an authoritative output, destination readback, rendered artifact, or independent re-derivation.

Completion semantics are owned by `verification-loop`. The stage contract must name the artifact and postcondition that skill will verify.

## Handoff rules

1. Give every artifact a stable identity and semantic input lineage. Operational timestamps may be metadata but must not silently change semantic identity.
2. Declare each edge from producer to consumer. The producer emits the artifact; the consumer names it as an input and validates it before use.
3. Preserve absence as absence. A missing, truncated, unparseable, stale, or unconsumed artifact cannot become a rejection, approval, empty success, or cached verdict.
4. Verify the last artifact or state the user or downstream system actually consumes. Do not infer it from a correct intermediate file.
5. When the same defect appears in several branches, inspect their nearest shared producer, contract, or guard before patching every branch.
6. Treat dependency integrity and dependency availability as separate claims. A checksum proves the bytes received; it does not make an expiring nightly tag, temporary signed URL, mutable alias, or retention-limited host a reproducible build input. Mirror build-critical binaries into a retained, access-controlled release owned by the repository or use a provider with an explicit compatible retention contract. Keep the expected digest in version control and exercise authenticated download plus digest verification on every supported build platform.

## Ownership and layout

Use the repository's idioms. A common shape is:

```text
pipeline/
  stage-conveyor.json
  stages/
    capture/
    classify/
    build/
    verify/
  guards/
  orchestrator/
tests/
  pipeline/
```

The folder names are optional. The ownership boundaries are not.

- Each executable file belongs to exactly one responsibility owner: a stage or a shared guard.
- A shared guard has one implementation owner and an explicit set of stages that must consume it.
- Each promoted learning has one enforcement owner and at least one executable regression check.
- The orchestrator may route, checkpoint, schedule, and report. Domain transformation, judgment, and verification stay in their owning stages.
- Version contracts, inputs, outputs, decisions, and hashes. Do not copy an entire implementation tree merely to preserve every revision; Git and immutable release artifacts preserve code history.

## Control plane and workers

Keep control-plane decisions separate from worker execution. The control plane may declare eligibility, issue bounded work, and record safe projections. A worker validates the exact contract and lineage before acting, records a durable checkpoint, and returns a result that the control plane independently reads back.

For leases, scheduled jobs, external processes, or metered batches, also read `long-running-run-safety.md`.

## Conformance checker

Invoke `scripts/check-stage-conveyor.mjs` from the skill package and supply a manifest. If a repository vendors the checker, preserve its relative `scripts/` and `references/stage-conveyor-manifest.schema.json` layout so the executable continues to load the canonical schema:

```powershell
node scripts/check-stage-conveyor.mjs --root . --manifest pipeline/stage-conveyor.json
```

The repository's build or pull-request workflow owns invocation after material topology changes; Krish does not maintain the manifest by hand outside an authorised repository change. Review whether the conveyor still earns its maintenance cost at the three-build or ninety-day measurement gate.

The checker validates:

- unique stage, guard, entrypoint, and learning identities;
- complete and exclusive stage-or-guard ownership of inventoried executable files;
- real producer-to-consumer artifact joins;
- required guards consumed by every declared stage;
- entrypoints owned by their target stage;
- bounded retry and checkpoint declarations;
- completion evidence that does not rely on logs or progress;
- one enforcement owner and an existing check for every promoted learning.

The checker proves declared topology and repository coverage. It does not prove domain semantics, runtime reachability, user value, or production safety. Keep focused stage tests, edge integration tests, recovery tests, and final consumed-outcome verification.

## Required regression classes

Adopt fixtures for the failure classes the repository can actually experience:

- a guard exists but one relevant consumer bypasses it;
- absent or truncated generation becomes a cached negative verdict;
- opposite sides of a boundary define the same wire contract independently;
- recovery exists in code but is unreachable from the operating surface;
- progress continues while semantic output is wrong;
- correct data is written into an artifact the user never consumes;
- a restart resets the retry or spend budget;
- a parent exits while child work continues unowned;
- revision history duplicates stable executors instead of versioning evidence.
- a hash-pinned build dependency disappears from its upstream host or requires authentication that CI does not provide.

## Completion packet

Hand `verification-loop`:

```text
PIPELINE: [manifest path/hash and repository revision]
CHANGED STAGES: [ids and executable paths]
CHANGED EDGES/GUARDS: [producer, artifact, consumer, guard]
FOCUSED PROOF: [stage tests and failure reproductions]
TOPOLOGY PROOF: [checker result]
RECOVERY PROOF: [restart/retry/operational entrypoint]
FINAL OUTCOME: [authoritative destination or consumed artifact]
UNVERIFIED: [runtime, cost, production, or human judgment gaps]
```
