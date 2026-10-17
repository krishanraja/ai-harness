# Repository measurement handoff

Measurements enter the existing `harness-observations` GitHub dispatch. They
are evidence, never approval or instructions. The nightly administration job
independently verifies their source proofs and derives health; the existing
scoreboard and digest read the same per-repository result. No additional
service, package or local machine is involved.

## Collect at the owning workflow

Use the existing source run to record one bounded claim for an observed event:

- `source-run`: provider/account/window coverage, pagination, counts, cursor
  and acknowledged payload hashes. Explicit partial, failed and unavailable
  states remain visible beside successful sources.
- `loading`: the source execution's successful Read calls and results for the
  delivered resources. A citation or delivered hash alone is insufficient.
- `application`: named deterministic checks with independently expected and
  actual result hashes. A generic success statement is insufficient.
- `opportunity`: a unique task opportunity, its conditions, result, failure
  class and owning layer. Deliberate experiments are separate from avoidable
  corrections. Unknown outcomes remain unknown.
- `outcome`: an existing native metric, unit and value hash. The native value
  remains at its authoritative source; no private experiment result is copied.

The schema in `scripts/lib/repository-measurements.mjs` requires the admitted
repository, source/account/run hashes and source revision. Task records also
require the delivered brain revision, view hash, workflow, condition hash and
relevant knowledge IDs. `observed_at` is a fixed ISO timestamp from the source
event; retries reuse it rather than the submission time. The receipt's
`execution_revision` separately identifies the worker revision, so a harness
job can prove a target repository's pinned version without conflating them.
Use `synthetic-evaluation` for fixtures. Do not label a
canary or replay as production work. Do not reconstruct missing scope.

## Submit and prove

Keep the bounded claim in a JSON file at its authorized producer. Preview the
validated transport without sending it:

```sh
node scripts/repository-health.mjs --record measurement.json --repo content-engine
```

Add `--submit` to use the existing authenticated GitHub dispatch. A returned
dispatch count is not a durability receipt: check the exact observation ID
and payload hash on GitHub main. Retrying identical content is idempotent;
changed content under an existing identity is refused.

The optional `receipt` points to an exact committed source JSON file and its
SHA256. The proof binds the complete claim, including its repository. The
source file contains actual tool execution, deterministic check results,
native outcome or source-run receipt. The successful default-branch source
job must emit the exact machine attestation produced by:

```sh
node scripts/repository-health.mjs --attest measurement.json --evidence evidence.json
```

The producer calls this after collecting the evidence. It prints only the
repository and hashes. The health verifier fetches that exact job's logs and
the proof independently; an unrelated successful run or a later descendant
commit cannot attest by ancestry alone. Alternatively, an exact owner merge
containing the source proof can establish an owner-confirmed verdict. Neither
route expands any application or capture authority.

Absent, inaccessible, malformed, mismatched or merely asserted proofs stay
reported/unverified. The verifier persists only bounded statuses and hashes,
never source artifacts, tool outputs, private titles or model prose.

## Read the result

`state/repository-administration/health.json` distinguishes delivery, observed
loading, application checks and outcome evidence. Its groups bind repository,
source/account, source revision, brain revision, view, workflow and conditions.
Repeated avoidable failures count only within a comparable group and use
unique opportunity identities. A changed audience or condition is separate.
Failure-layer counts distinguish missing evidence, interpretation, scope,
retrieval, stale instructions, ignored guidance, code defects and experiments.

No verified opportunities means null effectiveness, even if delivery, citation
or synthetic tests succeeded. Observed native outcomes do not establish that
the harness caused an improvement. Source receipts describe their declared
account/window only; unknown provider accounts and histories stay unknown.
Opaque miner checkpoints demonstrate acknowledged progress, not exhaustive
history coverage.
