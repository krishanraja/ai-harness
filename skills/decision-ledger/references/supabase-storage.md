# Supabase storage and redacted snapshot contract

Read `../../state/decision-ledger-config.yaml` before any storage operation. Its
`live_status` is authoritative for availability; an accepted architecture or a
migration file does not prove the production database changed.

## Canonical and non-canonical surfaces

- Canonical records and events live in the configured Mindmaker OS Supabase
  project after the named migration is applied and verified.
- Venture systems remain authoritative for their operational facts. Store stable
  references rather than cloned task, queue, count, or deployment state.
- `state/decision-ledger-snapshot.json` is a deterministic redacted audit and
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

Use `scripts/Export-DecisionLedgerSnapshot.ps1`. It reads only the allowlisted
snapshot view, rejects unexpected fields and high-confidence secret patterns,
sorts by stable decision key, and emits UTF-8/LF JSON without a volatile export
timestamp. Identical canonical rows must produce identical bytes.

- `excluded`: emit no row.
- `metadata_only`: emit key, status, scope, digest, and null redacted text.
- `summary`: emit only the explicitly authored redacted title, summary, and
  revisit text.
- `personal` scope: always excluded from Git, regardless of requested policy.

Inspect the diff before committing a new snapshot. A digest proves the snapshot's
relationship to a canonical event head; it does not make the snapshot canonical.
