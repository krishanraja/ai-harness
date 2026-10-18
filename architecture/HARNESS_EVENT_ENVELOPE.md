# Harness event envelope

This is the transport contract for the governed learning inbox. It does not
grant capture authority, store credentials or make the inbox canonical. The
Control Center API implementation validates the version 1 fields. Direct GitHub
intake also accepts the version 2 extension below. GitHub
remains the only authority for accepted harness doctrine.

## Transport

```text
POST ${HARNESS_EVENT_INGEST_URL}
Authorization: Bearer ${HARNESS_EVENT_INGEST_TOKEN}
Content-Type: application/json
```

Clients call the HTTPS endpoint directly through their native network or tool
capability. There is one declared exception to "no installed helper": the
opt-in weekly session miner (`scripts/Invoke-SessionMiner.ps1` on a named
machine, and a cloud scheduled task for Claude Code cloud sessions). It reads
session logs where they already are, redacts locally before any model sees an
excerpt, and submits only envelope events through this same endpoint (Ruling,
Krish, 2026-10-14). Nothing raw leaves the machine and nothing raw enters the
repository.
Capture must not block the primary task. A client that cannot make the call
reports capture as unavailable instead of creating a local shadow ledger.

## Version 1

```json
{
  "event_id": "codex:session:01J0000000000000",
  "schema_version": 1,
  "occurred_at": "2026-09-12T10:00:00.000Z",
  "surface": "codex",
  "kind": "failure",
  "summary": "A verified build returned success without writing its expected output.",
  "evidence_ref": "session:01J0000000000000#turn-18",
  "related_skill_or_rule": "krish-build.green-checkmark",
  "outcome": "failed",
  "severity": "high",
  "confidence": "high"
}
```

Allowed surfaces: `codex`, `claude-code`, `claude-code-web` (a Claude Code
cloud session), `claude-ai` (claude.ai and Claude Desktop), `chatgpt`, `cursor`,
`github-actions`, `n8n`, `other`. `claude-cloud` and `perplexity` remain
accepted for rows already recorded under them.

Allowed kinds: `explicit_correction`, `failure`, `missed_trigger`,
`false_trigger`, `repeated_manual_step`, `successful_pattern`, `contradiction`,
`preference` (how Krish wants something done, stated or shown), `friction` (a
step that cost him time or attention and need not have).

An `event_id` beginning `session-miner:` marks an event the session miner
produced; the importer records it as `producer: session-miner`.

Allowed outcomes: `corrected`, `failed`, `succeeded`, `unknown`.

Allowed severities: `low`, `medium`, `high`, `blocking`.

Allowed confidence values: `low`, `medium`, `high`.

`related_skill_or_rule` may be null. Every other field is required. Unknown
fields are rejected, including `transcript`, `prompt`, arbitrary metadata and
customer records. The server normalizes whitespace and timestamps, computes
the payload hash and returns a receipt. A retry reuses the same event id. The
same id with different content returns a conflict.

## Version 2: scoped learning episodes

Direct `harness-observations` repository dispatch accepts the version 1 fields
plus these explicitly allowed fields. The optional hosted endpoint is not
assumed to support this extension until its own implementation is verified.

| Field | Meaning |
| --- | --- |
| `schema_version` | `2` |
| `repository` | Exact registered fleet name, or `null` for unknown scope |
| `episode_id` | `episode:` followed by 16–64 lowercase hex characters; stable across transports |
| `knowledge_type` | `fact`, `requirement`, `preference`, `procedure`, `hypothesis`, `experiment` or `working_decision` |
| `source_revision` | Verified full 40-character Git commit, or `null` |
| `episode` | Bounded redacted context object described below |
| `measurement` | Optional validated source/use/outcome claim; see the measurement contract below |

`episode` permits `goal`, `requested_change`, `attempt` and `outcome` strings,
and `retained`, `conditions`, `uncertainties` and `evidence_refs` arrays.
Each string is at most 500 characters, each array at most eight entries and
the serialized context at most 4,000 characters. References are opaque
`commit:`, `check:`, `artifact:`, `session:` or `observation:` locators.
URLs, private shapes, control characters and unknown keys are rejected.
`scripts/lib/learning-episode.mjs` is the executable field validator.

Episode identity and kind determine deduplication across transports. The
canonical payload hash covers all episode fields, including source scope;
the same identity with changed content is a conflict, never an update.
Legacy observations remain scope-unknown. Assistant claims and reported
outcomes remain evidence and cannot establish an accepted instruction.

The authenticated GitHub route commits append-only observations and returns
durability through exact identity and payload-hash readback from GitHub main.
Dispatch acceptance alone is not a receipt. Batches are bounded by the intake
validator; retries reuse identical content. Raw transcripts never enter this
transport.

## Measurement and cloud-progress records

An optional version 2 `measurement` is bounded to 6,000 characters. Its
repository must match the envelope. It binds opaque source/account/run
identities, exact source and brain revisions, the delivered view hash,
workflow, conditions and an opportunity identity. Kinds are `source-run`,
`loading`, `application`, `opportunity` and `outcome`. Source-run records
retain explicit failure, partial enumeration and pagination states. Private
conditions and native result values remain hashes and source references.
Production and synthetic evaluation are separate evidence classes.

These rows have class `measurement` and cannot become learned guidance.
Intake authenticates transport and validates shape; it does not verify use.
Scheduled health independently reads the exact source proof and verifies its
hash and successful source-job attestation, or its exact owner merge, before
counting observed use. Citation/prose alone does not prove application.
`scripts/lib/repository-measurements.mjs` validates the fields and evidence;
`docs/harness/repository-measurements.md` describes the producer handoff.

A miner may also dispatch `producer: session-miner`, `events: []` and one
`checkpoint`. This is a separate transport control record, not knowledge.
`scripts/lib/miner-checkpoint.mjs` admits only bounded hashed session/event
identities, timestamps and matching observation ID/payload-hash receipts.
Intake appends it to `state/session-miner/checkpoints.jsonl` only after those
receipts exist. Recovery pins one GitHub main revision and checks both ledgers
before resuming. No raw source IDs, transcript or account name is stored.
An explicit empty extraction may acknowledge progress without lessons; a
malformed or rejected extraction cannot. Checkpoints certify acknowledged
batches, never comprehensive provider-history coverage.

## Capture boundary

Submit only the smallest fact needed to recognise the pattern. Never submit a
raw conversation, credential, customer data, machine name, absolute local path
or full model output. `evidence_ref` is an opaque locator for a human who has
access to the originating surface, not copied evidence.

An event can contribute to a proposal. It cannot approve one. No endpoint or
importer may change a skill, contract, registry, rule or active client surface,
and new inferred meaning requires a pull request a named human merges. The
owner-approved `brain-repository-administration-v1` plan separately authorizes
the deterministic publisher to project already accepted, hash-bound knowledge
through checked PRs to the exact targets and paths in
`contract/repository-administration.json`, with merged-byte readback. This
exception grants no approval authority to an event, model or importer. See
`docs/harness/repository-administration.md` for ownership and rollback.
