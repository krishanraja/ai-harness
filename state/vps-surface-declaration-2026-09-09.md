# Declaring the OpenClaw VPS: four changes, 2026-09-09

Follow-on from `state/vps-liveness-audit-2026-09-09.md`, which was read-only. This one
changes things. Every change was preceded by a capture of the prior state and followed by
reading the result back. Nothing was deleted. Backups are named in each section.

The plan file named in the brief, `/root/.claude/plans/can-we-make-sure-synthetic-harbor.md`,
does not exist. It is absent from the VPS (`/root/.claude` exists, `plans/` does not), from
the Windows `~/.claude/plans/` directory, and from this repo's history. The work below was
driven from the audit and the four numbered jobs in the brief instead.

## 1. The SQLite question: nothing migrates

The rule given was: tables named `messages`, `sessions` or `parts` mean transcripts and
nothing moves; tables named `facts`, `memories` or `notes` mean durable memory and it
migrates into the brain.

**Neither.** Read-only (`file:...?mode=ro`), table names only:

```
cleo.sqlite / main.sqlite / ops.sqlite, identical 16 objects each:
  chunks, chunks_fts, chunks_fts_config, chunks_fts_content, chunks_fts_data,
  chunks_fts_docsize, chunks_fts_idx, chunks_vec, chunks_vec_chunks,
  chunks_vec_info, chunks_vec_rowids, chunks_vec_vector_chunks00,
  embedding_cache, files, meta, sqlite_sequence
```

No transcript tables. No durable-memory tables. The `meta` row says exactly what these are:

```json
{"model":"text-embedding-3-small","provider":"openai","sources":["memory"],
 "chunkTokens":400,"chunkOverlap":80,"vectorDims":1536}
```

These are **derived retrieval indexes** over markdown, not stores in their own right. The
`files` table proves it, and the counts line up exactly against the filesystem:

| db | files indexed | markdown on disk | source |
|---|---|---|---|
| main | 76 | 75 in `memory/*.md` plus `MEMORY.md` | `workspace/` |
| ops | 52 | 51 plus `MEMORY.md` | `workspace-ops/` |
| cleo | 1 | 3 plus `MEMORY.md` | `workspace-cleo/` |

**So the 77 MB does not migrate.** It is FTS structures, vector blobs and an embedding
cache, all rebuildable from the markdown by re-running the indexer. What carries the
meaning is the markdown itself, and that is roughly **1.3 MB** in total
(`workspace/memory` 864K, `workspace-ops/memory` 420K, `workspace-cleo/memory` 16K) plus
the three `MEMORY.md` files. Ordinary text files, already the thing worth moving.

Two things worth recording rather than acting on:

- **Cleo's index is stale.** It holds 1 file against 3 on disk and was last written
  2026-04-15. Anything asking cleo's memory a question is searching one document.
- The 77 MB figure is `main` (51.7) + `ops` (19.1) + `cleo` (6.5). `loz` and `finno` were
  not opened. Per Krish's ruling of 2026-09-09 the four personal agents (loz, steph, finno,
  maa) were left entirely alone: not read, not listed, not catalogued.

## 2. The heartbeat is installed and reporting

Prior state, captured first: no `vps-heartbeat.sh` on the host, no heartbeat line in the
root crontab (43 lines), no `/var/log/vps-heartbeat.log`, and no `openclaw-vps` key in
`state/heartbeats.json`.

Installed:

- `scripts/vps-heartbeat.sh` copied to `/root/.openclaw/workspace/scripts/`, mode 755,
  root-owned. Verified by sha256 against the repo copy:
  `fd0aea4035b85a48e50c5d685fd00827e77852a3530f385495298fa86a58fe71`, identical both sides.
- Token in the environment, never in the script:
  `/root/.openclaw/workspace/scripts/.vps-heartbeat.env`, mode 600, root-owned, holding
  `export GITHUB_HEARTBEAT_TOKEN=...`.
- Crontab, 43 lines to 46: `5 * * * * . /root/.openclaw/workspace/scripts/.vps-heartbeat.env && /root/.openclaw/workspace/scripts/vps-heartbeat.sh >> /var/log/vps-heartbeat.log 2>&1`
- Prior crontab backed up to `/root/crontab.backup-2026-09-09-heartbeat.txt` (4855 bytes).

**The first hand-run passed on the host and failed on GitHub, which is the whole reason the
test is worth running.** The script reported `heartbeat sent, status=ok executions=1682
jobs=45` and exited 0, because a `repository_dispatch` returns 204 as soon as the event is
accepted. The workflow it triggered then failed:

```
heartbeat: clock must be one of harness-sync-surface, harness-sync-lorimer.
##[error]Process completed with exit code 2.
```

The repository half declared `openclaw-vps` in `EXPECTED_CLOCKS` in `audit-harness.mjs`,
but nothing taught the recorder to accept it. Two further blockers sat behind the first:
`record-machine-heartbeat.mjs` required `release` to match `vYYYY.MM.DD.N`, and the VPS
sends no release at all, so every heartbeat it will ever send would have been rejected;
and it allowed only `ok` or `blocked`, while the script can legitimately report `degraded`.

Fixed in this change:

- `openclaw-vps` added to `allowedClocks`.
- `release` is now required only of the clocks that ship a harness release
  (`harness-sync-surface`, `harness-sync-lorimer`). The VPS is not a harness install.
- `degraded` accepted as a first-class status.
- The operational fields the script already sends are now recorded rather than dropped:
  `n8n_cycle_start`, `n8n_executions_this_cycle`, `gateway_jobs_defined`. The workflow
  passes them through by environment, matching the existing injection-safe pattern.
- Absent and zero are kept distinct. A missing counter and an idle one mean opposite things.

Note `gateway_jobs_defined` reads **45**, where the audit of the same day counted 33
gateway cron jobs. Not reconciled here, and worth a look: either the count grew, or the two
methods count different things.

## 3. The governor warns, and no longer acts

Prior state: `n8n-exec-governor.py`, 8056 bytes, sha256 `8256edbc8ed657...`, hourly in the
root crontab, `dry=False`, counter at 1682. Backed up unchanged to
`n8n-exec-governor.py.bak-2026-09-09`, verified byte-identical by sha256.

Removed the TRIP branch that called `POST /workflows/{id}/deactivate`. Verified: no
deactivation call remains anywhere in the file. It had never fired, and had it fired it
would have deactivated 77 of 86 workflows with no saved record of what had been active and
no path back.

Kept: the cumulative counter, and both alert levels. `TRIP_AT` became `CRITICAL_AT`, an
alert rather than an action.

Added a **per-workflow hourly rate alarm**, because a rate spike is the shape a runaway
actually takes. A cumulative counter only tells you the month is going badly, by which
point the money is gone. Threshold 200 executions per hour for a single workflow, against
observed fleet-wide hourly deltas of 2 to 13. Six-hour per-workflow cooldown so one bad
workflow cannot spam. The divisor is the real elapsed window since `last_seen`, floored at
0.25h, so a missed cron run does not read as a spike and a double run cannot inflate one.

`CRITICAL_WHITELIST` is retained though nothing now reads it. It is the curated list of
what must stay alive if the cap is ever rehomed somewhere that can act, and that judgement
is expensive to reconstruct.

Verified on the host: syntax OK; `--dry-run` clean and state untouched at 1682; a live run
advancing the counter to 1690 and writing `rate_alerted: {}`; and the rate alarm exercised
end to end in an isolated copy with the threshold lowered to 1 and alerts redirected to
`/tmp`, which correctly detected 8 workflows, resolved their names through the n8n API and
formatted the alert. Test artifacts removed.

### One correction to the audit

The audit says the governor "sends its WARN and TRIP alerts through the ops Telegram
account". It does not, and has not since 2026-09-06. `telegram()` appends to
`/var/log/os-pull-only-alerts.log` and returns before the sender, which is dead code kept
for a one-line revert. The audit read the config, not the function body.

The brief asked to keep both alert levels "through the ops Telegram account". Both levels
are kept and still route through that same `telegram()` helper, so the routing is
unchanged. Push was **not** re-enabled, because PULL ONLY is a standing ruling recorded as
done and live across six layers, and silently reversing it here would be a regression
nobody asked for. Re-enabling it is one line and Krish's call.

## 4. The service_role JWT is out of both scripts

Prior state captured: both scripts carried the identical plaintext key. Fingerprint
(sha256, first 16) `20a6b68cf2fab2d5`; payload `role=service_role`, `ref=gojpffsrxybbpbdzzrvs`,
issued 2026-04-14, **valid until 2036-04-14**.

Backed up to `sync-briefs-to-skills.sh.bak-jwt-2026-09-09` and
`regenerate-standards-digest.py.bak-jwt-2026-09-09`.

Both now resolve the key at runtime: `SUPABASE_SERVICE_KEY` from the environment, falling
back to the root-only `/root/.openclaw/credentials/supabase.env` (mode 600) that the fleet
already uses. **There is deliberately no hardcoded fallback.** `render-identity.py` did its
migration with one, which is why that file still contains the key today; a fallback is how
the secret comes back. Both scripts now fail closed and say why.

Verified: zero `eyJ` occurrences in either file; `bash -n` and `py_compile` both clean; a
real run of the nightly digest job regenerating 67 pre-check rules; and a fail-closed test
with the environment unset and the credentials path pointed at nothing, which refused to
run and exited 1.

### The key itself is NOT rotated, and rotating it is not a two-script job

The brief said rotate. Moving it out of these two scripts is done. Issuing a new
service_role key and invalidating the old one was not, because the blast radius makes it a
fleet operation rather than a file edit. The identical key appears in **893 files** on this
host:

- 815 agent session transcripts under `agents/*/sessions/*.jsonl`
- 2 files in `media/inbound/`
- ~25 files of live code and config, including several on short cron cadences:
  `fire-pending-flags.py` (every 2 min), `cc-sync-engine.sh` and `poll_sync_queue.py`
  (every 5 min), `render-identity.py` (every 15 min), `inbox-decay.sh`,
  `vera-contradiction-audit.sh`, `supabase-tools.py`, `learning_router.py`,
  `capture_win.py`, `deliver_gate.py`, `check_apis.py`, `cc-doc-creator.sh`,
  `cc-task-router.sh`, `exec-approvals.json`, `TOOLS.md`, `agent-arlo/SKILL.md`, and two
  n8n workflow backups.

Rotating the key without updating all of those at once takes down the sync engine, identity
rendering, flag firing and the nightly audits within minutes, silently. The sequence has to
be: point every consumer at `SUPABASE_SERVICE_KEY`, confirm each still runs, then issue the
new key and update the one credentials file. That is its own piece of work.

Two related exposures, both pre-existing and both still open:

- The `sbp_` Supabase Personal Access Token in `credentials/supabase.env` was already
  flagged for rotation and was re-exposed in this session while reading that file.
- The GitHub token now installed for the heartbeat is the `repo`-scoped one from
  `TOKENS.md`, marked exposed since 2026-06-11. It is in a mode-600 env file and not in any
  script, but it should be replaced by a fine-grained PAT scoped to `krishanraja/ai-harness`
  alone. The env file carries a TODO saying so.

## Still open

1. The execution cap still does not exist anywhere. The governor now warns and never acts,
   which was the ruling, so nothing caps n8n spend. That is a deliberate, known gap.
2. The real service_role rotation, sequenced as above.
3. A fine-grained GitHub PAT to replace the exposed one.
4. `gateway_jobs_defined` 45 against the audit's 33.
5. Cleo's memory index holds 1 of 4 documents.
6. From the audit and untouched here: `verify_doc.py` crashing every 30 minutes,
   `poll_sync_queue.py` emitting nothing since 2026-08-24, five agent render logs frozen at
   the 2026-08-29 rebrand, and the VPS `control-center` clone 11 days behind main.
