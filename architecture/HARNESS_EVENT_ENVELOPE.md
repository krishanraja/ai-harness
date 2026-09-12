# Harness event envelope

This is the transport contract for the governed learning inbox. It does not
grant capture authority, store credentials or make the inbox canonical. The
Control Center API implementation validates the same version 1 fields. GitHub
remains the only authority for accepted harness doctrine.

## Transport

```text
POST ${HARNESS_EVENT_INGEST_URL}
Authorization: Bearer ${HARNESS_EVENT_INGEST_TOKEN}
Content-Type: application/json
```

Clients call the HTTPS endpoint directly through their native network or tool
capability. There is no installed helper, background process or local schedule.
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

Allowed surfaces: `codex`, `claude-code`, `cursor`, `claude-cloud`,
`perplexity`, `github-actions`, `n8n`, `other`.

Allowed kinds: `explicit_correction`, `failure`, `missed_trigger`,
`false_trigger`, `repeated_manual_step`, `successful_pattern`, `contradiction`.

Allowed outcomes: `corrected`, `failed`, `succeeded`, `unknown`.

Allowed severities: `low`, `medium`, `high`, `blocking`.

Allowed confidence values: `low`, `medium`, `high`.

`related_skill_or_rule` may be null. Every other field is required. Unknown
fields are rejected, including `transcript`, `prompt`, arbitrary metadata and
customer records. The server normalizes whitespace and timestamps, computes
the payload hash and returns a receipt. A retry reuses the same event id. The
same id with different content returns a conflict.

## Capture boundary

Submit only the smallest fact needed to recognise the pattern. Never submit a
raw conversation, credential, customer data, machine name, absolute local path
or full model output. `evidence_ref` is an opaque locator for a human who has
access to the originating surface, not copied evidence.

An event can open a proposal. It cannot approve one. No endpoint, importer or
workflow may update a skill, contract, registry, rule or active client surface.
