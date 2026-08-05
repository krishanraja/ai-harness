# Consequential decision record schema

Use this schema for every canonical record. A storage adapter may change field syntax, never field meaning or lifecycle behavior.

## Canonical record

| Field | Requirement | Rule |
|---|---|---|
| `decision_id` | Required | Stable `DEC-YYYYMMDD-short-slug`; never recycle an ID. |
| `title` | Required | Short noun phrase for search and display. |
| `decision` | Required | One testable sentence stating the finalized call. |
| `status` | Required | `active`, `conditional`, `review_due`, `superseded`, `reversed`, or `expired`. |
| `decided_at` | Required | ISO 8601 timestamp with timezone. Preserve the decision time, not the write time. |
| `recorded_at` | Required | ISO 8601 timestamp with timezone. |
| `decider` | Required | Verified human or authorized decision body. Never infer Krish as decider. |
| `accountable_owner` | Required | Person accountable for review and downstream coherence. |
| `scope` | Required | `cross_venture`, `venture`, `system`, `harness`, or another explicit bounded scope. |
| `affected_entities` | Required | Ventures, systems, clients, standards, or artifacts affected. |
| `rationale` | Required | The decision-critical reasons at the time, not a retrospective rewrite. |
| `alternatives` | Required | Material alternatives considered and why they lost; use `none_with_reason` only when genuine. |
| `dissent` | Required | Contrary recommendation or evidence; use `none_recorded` rather than inventing consensus. |
| `tradeoffs` | Required | Costs and constraints accepted by the decision. |
| `evidence_refs` | Required | Stable source references with revision/retrieval time and fact-vs-inference labels. |
| `assumptions` | Required | Consequential falsifiable beliefs or `none_with_reason`; link to an Assumption Ledger when one exists. |
| `revisit` | Required | Observable trigger and/or `review_on`; use `none_with_reason` only for a durable principle. |
| `authority_granted` | Required | What the decision authorizes. Never imply unrelated execution authority. |
| `source_ref` | Required | Conversation, meeting, issue, document, or signed artifact establishing finality. |
| `supersedes` | Required | Decision IDs replaced by this record; empty list when none. |
| `superseded_by` | Required | Replacement decision IDs; empty list while current. |
| `outcome` | Required | `not_yet_observed`, observed result with evidence, or `unknown_with_reason`. |
| `events` | Required | Append-only lifecycle and metadata-amendment history. |
| `last_verified_at` | Required | Latest time the canonical record and links were read back. |

## Revisit object

At least one of `review_on` or `trigger` is required unless `none_with_reason` is justified.

```yaml
revisit:
  review_on: "2026-11-05"
  trigger: "Three consecutive releases miss the agreed adoption threshold"
  signal_source: "Named dashboard/query and scope"
  owner: "Krish Raja"
  action_when_fired: "Set status to review_due and prepare a keep/supersede/reverse brief"
```

A trigger must be observable. Avoid phrases such as "if it stops working," "when needed," or "later."

## Event model

Preserve events in order:

```yaml
events:
  - type: "created"
    at: "ISO-8601 timestamp"
    actor: "verified actor"
    source_ref: "stable source"
  - type: "metadata_amended"
    at: "ISO-8601 timestamp"
    actor: "verified actor"
    fields: ["evidence_refs"]
    reason: "Why metadata was wrong or incomplete"
  - type: "status_changed"
    at: "ISO-8601 timestamp"
    actor: "verified actor"
    from: "active"
    to: "superseded"
    linked_decision: "DEC-YYYYMMDD-replacement"
    source_ref: "final authorization"
```

Never replace `rationale`, `alternatives`, `dissent`, or `tradeoffs` in place. A later interpretation belongs in an event, review artifact, or replacement decision.

## Collision rules

- Same call, scope, and rationale: treat as a duplicate and link the source; do not create a second active record.
- Same subject but materially different call: require an explicit supersession/reversal decision or report a conflict.
- Venture-local decision: keep operational detail in the venture source of truth and store only its stable reference plus cross-venture consequence.
- `decisions_waiting`: an unresolved queue item, not a finalized ledger decision.
- Assumption Ledger: falsifiable belief, not a choice. Link it when it supports a decision.
- CTRL observation ledger: evidence for a proposed standard change, not the accepted change itself.
- Concept closure: use `mindmaker-os` to verify the cross-surface closure; link the verified closure event when it embodies a material decision.

## Privacy and integrity

- Redact credential values, tokens, cookies, private keys, and unnecessary personal data before persistence.
- Use stable symbolic references for secrets or private source systems.
- Preserve source hashes, commit IDs, record IDs, or immutable URLs when available.
- A successful write without authoritative readback leaves the operation `proposed-only` or `inconclusive`.
- Never use an editable `last_updated` label as the sole proof of finality, freshness, or integrity.
