# Supabase storage and redacted snapshot contract

Before any storage operation, load the canonical decision-ledger configuration
through the configured client adapter or approved repository. Its `live_status`
is authoritative for availability; an accepted architecture or a migration file
does not prove the production database changed. If that configuration is not
available in the current client, return `STORE_UNAVAILABLE` and keep the record
as a proposal.

## Canonical and non-canonical surfaces

- Canonical records and events live in the configured mind/make OS Supabase
  project after the named migration is applied and verified.
- Venture systems remain authoritative for their operational facts. Store stable
  references rather than cloned task, queue, count, or deployment state.
- The configured decision-ledger snapshot is a deterministic redacted audit and
  recovery artifact. It is never writable input and never resolves a conflict
  against Supabase.
- Local drafts, conversation memory, ADRs, and `decisions_waiting` are evidence or
  linked artifacts, not substitutes for the canonical ledger.

## Access contract

- Never expose the Supabase service-role key to Claude, Cursor, Codex, browser
  code, prompts, skills, logs, screenshots, fixtures, or Git.
- Use a reviewed server-side adapter whose secret is retrieved symbolically at
  execution time. The adapter may expose only the ledger views and RPCs named in
  the config.
- Do not grant `anon` or `authenticated` access merely to make a client work.
  Missing adapter access produces `STORE_UNAVAILABLE` and a proposed record.
- Treat a successful RPC response as provisional until the authoritative current
  view is read back and its event head is consistent.

## Migration and release boundary

The migration belongs to `krishanraja/control-center`, the owner of the Supabase
schema. The harness records its path and verified revision; it does not copy the
migration into a second deployable source.

Before production application:

1. Reconcile the Supabase migration ledger and confirm `db push` contains only the
   intended migration.
2. Apply to a separate project or staging schema.
3. Prove record immutability, event immutability, legal and illegal transitions,
   reciprocal supersession, event-hash continuity, no anon/authenticated access,
   service-role RPC access, and rollback from a verified backup.
4. Require explicit action-time approval naming the project and migration.
5. Read back objects, grants, policies, and smoke-test records after application.

## Git snapshot contract

Use the canonical snapshot exporter supplied by the configured repository. If it
is unavailable, do not improvise an exporter. The reviewed exporter reads only
the allowlisted snapshot view, rejects unexpected fields and high-confidence
secret patterns, sorts by stable decision key, and emits UTF-8/LF JSON without a
volatile generation or export timestamp anywhere in the output. Identical canonical rows must produce identical bytes.

Every snapshot result explicitly reports that rows were sorted by `decision_key` and no generation/export timestamp or other volatile field was emitted, then runs two exports over the same allowlisted rows in different source order and compares the full bytes. Sorting alone is not sufficient proof.

- `excluded`: emit no row.
- `metadata_only`: emit key, status, scope, digest, and null redacted text.
- `summary`: emit only the explicitly authored redacted title, summary, and
  revisit text.
- `personal` scope: always excluded from Git, regardless of requested policy.

If a supposedly redacted row contains a forbidden field or high-confidence credential pattern, reject the full export and leave the prior snapshot bytes untouched. Report only the stable decision key, field/type, and canonical source event id. Never locally redact or emit a cleaned derivative, because that would diverge from the canonical event; require a corrected append-only canonical snapshot event before regenerating.

Inspect the diff before committing a new snapshot. A digest proves the snapshot's
relationship to a canonical event head; it does not make the snapshot canonical.
