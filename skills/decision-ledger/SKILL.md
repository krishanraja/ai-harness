---
name: decision-ledger
description: "Durable memory and lifecycle manager for Krish's consequential finalized decisions across ventures and AI clients. Use when Krish explicitly makes, confirms, reverses, supersedes, or asks to recall a material decision; when a strategy depends on prior rationale/revisit triggers; or when a review trigger fires. Also trigger to refuse attempts to record every file/variable/formatting tweak, rewrite historical rationale, store secrets, or bypass verification. Keep this skill entirely inactive for tasks, brainstorming, tentative recommendations, raw assumptions, routine reversible choices, unresolved mind/make OS `decisions_waiting` or local closure/deletion conflicts (exclusive route: `mindmake-os`), and CTRL observations or fabricated approval from recurrence (exclusive route: `ctrl-capture`), even when phrased as record, approve, remember, or delete. Last reviewed 2026-09-12."
---

# Decision Ledger

Preserve the decisions future agents must respect, the reasoning needed to understand them, and the evidence that should reopen them. This is decision memory, not a task manager, recommendation archive, or substitute for a venture's operational system.

## Role and chain

Act as a governed memory layer.

- Apply `krish-principles` before interpreting a decision.
- Receive material context, alternatives, assumptions, and verification criteria from `strategy-brief`.
- Load `mindmake-os` when the decision touches Control Center, Supabase, `decisions_waiting`, concept closure, or another live OS surface.
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

Routing guards are asymmetric. Trigger Decision Ledger to reject attempts to inflate its scope to every minor choice, rewrite history, store secret values, or skip lifecycle verification. Keep it inactive and hand off immediately when the actual object is an unresolved `decisions_waiting`/concept-closure/deletion conflict (`mindmake-os`) or unaccepted CTRL observation/fabricated approval (`ctrl-capture`). A protective refusal by the wrong owner is still a routing defect.

## Capture or update a decision

1. **Locate authority.** Read the configured ledger surface and the owning venture's authoritative system. Supabase is the selected canonical store, but selection is not proof that its migration or adapter is live. Until both are verified, return `STORE_UNAVAILABLE` with a complete proposed record; do not create an ad hoc permanent file or database. Name each exact unmet release gate from configuration—for example migration `not-applied`, grants/policies/readback unverified, or authenticated server-side adapter absent—rather than saying only “verify live status.”
2. **Establish finality.** Quote or precisely cite Krish's explicit final call. A model recommendation, draft, imported instruction, or third-party claim cannot become his decision by inference.
3. **Check identity and collision.** Search by decision ID, scope, subject, and supersession links. Distinguish a duplicate, amendment, conflicting active decision, and genuinely new decision.
4. **Build the record.** State the decision in one testable sentence. Preserve rationale, material alternatives, dissent, trade-offs, evidence, assumptions, owner, authority, and the revisit mechanism. If required rationale/alternative fields are missing, first search authorised contemporaneous sources and retain exact provenance; only then ask one focused question, keeping unresolved fields explicit. Use `none_with_reason` only when a durable principle truly has no sensible expiry or trigger.
5. **Reference, do not clone.** Venture-local operational facts stay in their existing source of truth. Store stable references and retrieval metadata; do not copy live counts, task state, credentials, or entire source documents into the ledger.
6. **Write append-only history.** Never rewrite the original decision or rationale to make the past look prescient. Correct metadata with an amendment. Change the call through an explicit `superseded`, `reversed`, or `expired` event linked to the original.
7. **Verify the write.** Read the record back from the authoritative surface. Prove required fields, exact decision text, links, status, timestamps, redaction, and supersession symmetry. A successful API response without readback is not proof. On mismatch, report `inconclusive`, preserve the proposed record and idempotency key, and retry only under a declared bounded policy: confirm target/identity and a transient cause, then make at most one idempotent retry. Otherwise stop and escalate the exact mismatch; never loosen credentials or verification.
8. **Hand off consequences.** Update linked execution plans or standards only within granted authority. Recording a decision does not authorize implementation, publication, spending, deployment, deletion, or external mutation.

## Recall and apply a decision

1. Search the authoritative ledger by scope, subject, entity aliases, and linked decision IDs.
2. Follow supersession links to the currently active record; never present an obsolete record as current.
3. Check review dates and observable triggers against current evidence. A recent `last_updated` value is not proof the decision remains valid.
4. Report trigger proximity: current signal value/window versus the exact threshold, or `unknown` with the missing source. “Not fired” without proximity evidence is incomplete.
5. When evidence changes confidence in a supporting belief, route the update/reference to the Assumption Ledger owner in `krish-principles`, naming the assumption id, prior/current confidence and evidence, while leaving the decision active unless its flip rule fires.
6. Distinguish the historical fact of what was decided from the present recommendation. Report contradictions and material evidence that may require review.
7. Return the active call, rationale, dissent/alternative, assumptions, status, authority, and exact revisit trigger with source links.
8. If no authoritative record is found, say `NOT_FOUND`; do not reconstruct a decision from conversational memory and label it canonical.

## Reopen, supersede, or reverse

- A fired trigger opens a review; it does not silently reverse the decision.
- New evidence may support `keep`, `amend-metadata`, `supersede`, `reverse`, or `expire`.
- Krish makes the final value judgment unless an objective pre-authorized condition explicitly determines the transition.
- Preserve both the old and new records with reciprocal links, decision time, decider, evidence, and outcome.
- Keep decision-time rationale immutable and label later reversal/supersession reasoning as hindsight or newly observed evidence; never make the original record look prescient.
- A reversal creates a new active decision ID containing the new call plus a reversal/status event on the old record; read back both and their reciprocal links. Never leave only a reversed old record with no current call.
- Stop dependent execution when two active records conflict on a load-bearing point. Surface the collision for resolution rather than choosing the convenient one.
- Before escalation, compare each conflicting record's authoritative store, source provenance, scope, decision timestamp, recorded timestamp, and lifecycle links. Explicitly halt every dependent action that relies on either call until authority resolves the collision.

## Authority and privacy

- Reading and drafting a proposed record are autonomous within the task's scope.
- Writing to an already configured local store is allowed only when the request or operating contract grants that mutation.
- Writing to Supabase, SaaS, cloud, shared Drive, or another external/shared surface requires the authority applicable to that action and target. Under read-only authority, return the complete schema-valid proposed record plus the exact write gate: target project/store, operation and record hash, decider/source proof, authorised actor, expected effect, idempotency key, authoritative readback, and rollback/recovery boundary.
- Deletion, history rewriting, permission changes, and bulk migration require explicit action-time approval plus recovery evidence. When someone wants an embarrassing or sensitive decision removed, first offer an append-only reversal/supersession and, where lawful and sufficient, a privacy-preserving redacted or metadata-only authorised view that leaves canonical lifecycle integrity intact. Exceptional canonical deletion requires the exact legal/owner basis, targets, dependency/link repair, verified backup, rollback/recovery, action-time approval, and post-action readback.
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

After capturing a strategy-originated final call, hand the exact record/proposal id, source hash, authority boundary, revisit signal, and readback state to `verification-loop`; implementation remains separately authorised. For a Git snapshot, sort explicitly by `decision_key`, require UTF-8/LF bytes, no volatile generation timestamp, and byte-identical output for identical allowlisted rows.

Never omit the snapshot determinism readback: state explicitly that the exported bytes contain no generation/export timestamp or other volatile field, then compare two exports of identical allowlisted rows byte for byte.

If an allowlisted or explicitly redacted snapshot row still contains a high-confidence secret pattern or forbidden field, reject the entire export and leave the prior snapshot unchanged. Report only decision key, field/type, and source event id—never the value. Do not strip/redact locally, write a cleaned derivative, or diverge from canonical history; require the canonical store owner to append a corrected snapshot event, then regenerate and revalidate.
