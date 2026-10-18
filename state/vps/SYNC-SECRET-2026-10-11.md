# tasks-sync webhook secret, 2026-10-11

## Brief

The 2026-10-11 brief assumed the VPS cron job `cc-sync-engine.sh` POSTs tasks to the n8n webhook `webhook/tasks-sync` (workflow `FYIEtFZKYLmDoZz5`, "System | Mindmaker OS | Control Center Live Sync"), and that it needed the `x-sync-secret` header now that the webhook enforces it.

## Finding: the premise is false, so no change was made

- `/root/.openclaw/workspace-ops/scripts/cc-sync-engine.sh` (root crontab, `*/5`) contains **no** call to `webhook/tasks-sync`, and no curl at all. Its only network calls are:
  - reads from the n8n public API (`/api/v1/workflows`, `/api/v1/executions`), used for counts only;
  - reads from Supabase `tasks`, `agents`, `workflow_runs`;
  - writes to Supabase: PATCH `agents.last_run`, upsert `home_intelligence` id `current`, and an `audit_log` row through `cc_audit_diff.py`.
  It sends tasks nowhere. Control Center reads them straight from Supabase.
- A recursive search of `/root/.openclaw`, `/root/Projects`, `/etc/cron*` and `/usr/local/bin` for `tasks-sync` found only two cold archives: `workspace/cold/n8n-backups/FYIEtFZKYLmDoZz5.json` and a May 2026 audit report. **No live VPS caller exists.**
- The n8n execution history for `FYIEtFZKYLmDoZz5` holds only three executions, none on a 5-minute cadence:

| Execution | Started (UTC) | Caller | Secret sent | `POST /api/sync` result |
|---|---|---|---|---|
| 45673 | 2026-10-08 14:01:59 | VPS (IPv6 `2a01:4ff:f0:ab6f::1`, curl 7.81.0, matches the VPS) | no | 401 Unauthorized (error branch) |
| 45963 | 2026-10-11 12:21:05 | external IP `160.79.106.132`, curl 8.5.0 | yes | `{"ok":true,"received_tasks":0,"upserted":0}` |
| 45964 | 2026-10-11 12:44:19 | external IP `160.79.106.132`, curl 8.5.0 | yes | `{"ok":true,"received_tasks":0,"upserted":0}` |

- 45673 was a one-off hand test from an agent session on the VPS: a hardcoded 2026-06-01 "fractionl-pulse-test-pipeline" payload that also appears in archived agent session logs under `/root/telegram-retire-backup-20261003T235801Z/`. It was not the cron.
- 45963 and 45964 were the gate being verified after the secret went live, with an empty `tasks` array. The secret-gated path already returns `ok: true`.

## What was not done, and why

- No backup, edit, or secret placement on the VPS. Nothing there consumes `SYNC_SECRET`, so writing it to disk would only add one more place the secret lives.
- Adding a new push from the cron to the webhook would create a new data flow, not fix a broken one, and duplicate what Control Center already reads from Supabase. That is a design decision for Krish, not part of this brief.
- The acceptance test ("two consecutive cron runs land as successful executions") cannot be met as written, because the cron never calls the webhook.

## Security follow-up (open)

n8n stores incoming webhook headers in execution data, and execution redaction is off for production runs (`redaction.production: false`). Executions **45963 and 45964 therefore hold the live `x-sync-secret` value in plaintext** in n8n's execution history. Suggested fix, pending Krish's go: rotate `SYNC_SECRET` (Vercel `control-center` production, plus the n8n workflow check), turn on production execution redaction in n8n, and delete those two executions.

## Rollback

Nothing to roll back. The VPS, Vercel and n8n are unchanged.
