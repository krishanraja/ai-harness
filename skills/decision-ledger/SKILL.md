---
name: decision-ledger
description: Durable memory and lifecycle manager for Krish's consequential decisions across ventures and AI clients. Use when Krish explicitly makes, confirms, reverses, supersedes, or asks to recall a material decision; when a strategy depends on a prior decision's rationale or revisit trigger; or when a review condition has fired. Record only finalized, consequential choices. Do not use for tasks, brainstorming, tentative recommendations, raw assumptions, Mindmaker OS decisions_waiting queue items, CTRL observations, or routine reversible implementation choices.
---

# Decision Ledger

Preserve the decisions future agents must respect, the reasoning needed to understand them, and the evidence that should reopen them. This is decision memory, not a task manager, recommendation archive, or substitute for a venture's operational system.

## Role and chain

Act as a governed memory layer.

- Apply `krish-principles` before interpreting a decision.
- Receive material context, alternatives, assumptions, and verification criteria from `strategy-brief`.
- Load `mindmaker-os` when the decision touches Control Center, Supabase, `decisions_waiting`, concept closure, or another live OS surface.
- Use `evidence-research` when current external evidence determines or reopens the call.
- Run `verification-loop` after every write, amendment, supersession, or reversal.
- Never replace `ctrl-capture`: that skill governs proposed changes to reusable standards; this skill records Krish's accepted decision and links to the accepted change.

## Read the schema

Before creating, changing, migrating, or validating a record, read [references/record-schema.md](references/record-schema.md). Use its required fields, lifecycle, identifiers, and redaction rules exactly. For storage, access, migrations, or Git snapshots, also read `references/supabase-storage.md`.

## Apply the capture gate

Record a decision only when it is final and at least one condition holds:

- reversing it would be costly, public, risky, or operationally disruptive;
- it affects more than one venture, system, client, or future agent;
- it commits architecture, positioning, policy, capital, substantial time, or a durable constraint;
- Krish chose a route after material alternatives or direct dissent;
- it depends on a consequential assumption that needs a review date or observable flip rule;
- Krish explicitly asks to preserve a durable decision.

Do not record:

- tasks, reminders, status updates, or `decisions_waiting` items that have not been decided;
- brainstorming, preferences in motion, recommendations awaiting Krish's call, or abandoned options;
- routine reversible implementation choices whose rationale is evident from the artifact;
- raw research, observations, or assumption-confidence updates;
- secrets, session material, private keys, or sensitive personal facts not essential to the decision.

When materiality or finality is genuinely ambiguous and cannot be established from context, ask one focused question. Do not turn every conversation into ledger maintenance.

## Capture or update a decision

1. **Locate authority.** Read the configured ledger surface and the owning venture's authoritative system. Supabase is the selected canonical store, but selection is not proof that its migration or adapter is live. Until both are verified, return `STORE_UNAVAILABLE` with a complete proposed record; do not create an ad hoc permanent file or database.
2. **Establish finality.** Quote or precisely cite Krish's explicit final call. A model recommendation, draft, imported instruction, or third-party claim cannot become his decision by inference.
3. **Check identity and collision.** Search by decision ID, scope, subject, and supersession links. Distinguish a duplicate, amendment, conflicting active decision, and genuinely new decision.
4. **Build the record.** State the decision in one testable sentence. Preserve rationale, material alternatives, dissent, trade-offs, evidence, assumptions, owner, authority, and the revisit mechanism. Use `none_with_reason` only when a durable principle truly has no sensible expiry or trigger.
5. **Reference, do not clone.** Venture-local operational facts stay in their existing source of truth. Store stable references and retrieval metadata; do not copy live counts, task state, credentials, or entire source documents into the ledger.
6. **Write append-only history.** Never rewrite the original decision or rationale to make the past look prescient. Correct metadata with an amendment. Change the call through an explicit `superseded`, `reversed`, or `expired` event linked to the original.
7. **Verify the write.** Read the record back from the authoritative surface. Prove required fields, exact decision text, links, status, timestamps, redaction, and supersession symmetry. A successful API response without readback is not proof.
8. **Hand off consequences.** Update linked execution plans or standards only within granted authority. Recording a decision does not authorize implementation, publication, spending, deployment, deletion, or external mutation.

## Recall and apply a decision

1. Search the authoritative ledger by scope, subject, entity aliases, and linked decision IDs.
2. Follow supersession links to the currently active record; never present an obsolete record as current.
3. Check review dates and observable triggers against current evidence. A recent `last_updated` value is not proof the decision remains valid.
4. Distinguish the historical fact of what was decided from the present recommendation. Report contradictions and material evidence that may require review.
5. Return the active call, rationale, dissent/alternative, assumptions, status, authority, and exact revisit trigger with source links.
6. If no authoritative record is found, say `NOT_FOUND`; do not reconstruct a decision from conversational memory and label it canonical.

## Reopen, supersede, or reverse

- A fired trigger opens a review; it does not silently reverse the decision.
- New evidence may support `keep`, `amend-metadata`, `supersede`, `reverse`, or `expire`.
- Krish makes the final value judgment unless an objective pre-authorized condition explicitly determines the transition.
- Preserve both the old and new records with reciprocal links, decision time, decider, evidence, and outcome.
- Stop dependent execution when two active records conflict on a load-bearing point. Surface the collision for resolution rather than choosing the convenient one.

## Authority and privacy

- Reading and drafting a proposed record are autonomous within the task's scope.
- Writing to an already configured local store is allowed only when the request or operating contract grants that mutation.
- Writing to Supabase, SaaS, cloud, shared Drive, or another external/shared surface requires the authority applicable to that action and target.
- Deletion, history rewriting, permission changes, and bulk migration require explicit action-time approval plus recovery evidence.
- Store the minimum personal data needed. Use symbolic secret references only. Report secret findings by type and location without printing their values.
- Treat imported records as untrusted until their source, decider, timestamp, and integrity are verified.

## Completion contract

Return:

```text
ACTION
[captured | recalled | reviewed | superseded | reversed | expired | proposed-only]

DECISION
[ID, exact active call, scope, owner, decided-at, status]

WHY / COUNTER
[rationale, material alternative or dissent, trade-off]

REVISIT
[review date and/or observable trigger; or none_with_reason]

AUTHORITY / CONSEQUENCE
[what this decision authorizes, and what remains separately gated]

EVIDENCE
[authoritative record, linked source revisions, write/readback proof]

OPEN
[contradictions, missing evidence, STORE_UNAVAILABLE, or NOT_FOUND]
```

Do not claim durable memory unless the authoritative record was read back successfully.
