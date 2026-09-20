# The unknowns, settled, 2026-09-20

## What the job file says

Job count: 45. The map recorded 33, 45 and about 38. The file says 45. The heartbeat count was correct. The architecture estimate and the map's 29-row gateway inventory were incomplete.

- `oauth-refresh`, weekdays at 11:30 ET, enabled. Writes the host-local Google OAuth token file. Host Google integrations read it.
- `context-archiver`, daily at 03:00 ET, enabled. Writes host-local priorities, venture summaries, weekly summaries, context budget, attention data and run reports. Other host agents read those files. It does not write a durable external artifact.
- `system-health`, daily at 14:00 ET, enabled. Runs host diagnostics and writes a host-local report only when attention is needed. The gateway and host operators read it. The separate zero-AI root job owns the durable `system_health` table.
- `gmail-monitor`, weekdays at 09:00, 13:00 and 17:00 ET, enabled. Writes a host-local report when qualifying mail exists. No durable label, star, row or message was found, and no external reader was found.
- `content-scout`, Fridays at 08:00 ET, enabled. Writes `active/newsletter-scout-feed.json`, a local editorial brief and an error log. `newsletter-draft` reads the feed. Recent runs held email behind the approval gate, so no durable email was sent.
- `Hunter - Daily Sourcing`, Mondays and Thursdays at 08:00 ET, enabled. The prompt says it updates the master job Google Sheet. Krish and Nell read that sheet.
- `content-engine-sweep1`, Fridays at 18:00 ET, disabled. Its template proposes content through host-local files. No attributable durable output or reader was found.
- `content-engine-sweep2`, Mondays at 07:00 ET, enabled. Its template proposes content through host-local files. No attributable durable output has landed since June, and six other writers now supply content proposals.
- `newsletter-draft`, Wednesdays at 10:00 ET, enabled. Recent runs write local Markdown and HTML editions plus `newsletter-dedup.json`. Google Drive and Discord delivery were held behind the approval gate, so no durable output was created by the observed runs.
- `builder-economy-instagram-daily`, Monday through Saturday at 08:30 ET, disabled. The prompt asks for host-local Instagram plans. No durable output or reader was found.
- `pulse-weekly-ingest`, Mondays at 06:00 ET, enabled. The job file delegates to a template and does not name its write target. Its durable write and reader remain unknown from the job file.
- `bd-agent`, weekdays at 10:00 ET, enabled. Its intended lead and outreach outputs have no current durable rows: `contacted_persons` is empty and recent `leads` rows belong to another job. No reader of a unique output was found.
- `visibility-agent`, Monday, Tuesday, Thursday and Friday at 09:00 ET, enabled. Writes local stage and podcast pipeline JSON files, a Nova report and an Agatha note. Agatha is the named local reader. It writes no durable row, email, submission or Drive file.
- `product-agent`, Mondays at 08:00 ET, enabled. Successful runs write local product briefs, a local handoff queue and a local report. Agatha is the named local reader. No current Google Doc or durable database write was confirmed.
- `enterprise-gigs-agent`, weekdays at 11:00 ET, disabled. It belongs to retired ventures. No durable output or reader was found.
- `revenue-finance-agent`, Mondays at 08:00 ET, enabled. The job file delegates to a template and does not name its write target. Its durable write and reader remain unknown from the job file.
- `vera-daily-audit`, daily at 02:00 ET, enabled. Writes local Vera reports, `vera-queue.json` and repair alerts. Host agents read the queue. No `vera_audit` row lands on this cadence.
- `vera-weekly-audit`, Fridays at 06:00 ET, enabled. Writes a host-local report and repair alerts. No matching durable database row or application reader was found.
- `weekly-synthesis`, Mondays at 07:00 ET, enabled. Writes a host-local weekly intelligence brief and report. Host agents read the brief. No durable `suggestions`, `content_ideas` or workflow heartbeat is attributable to it.
- `tools-agent`, Sundays at 03:00 ET, disabled. Writes host-local integration diagnostics and repair alerts. Host operators read them.
- `marketing-agent`, Wednesdays at 09:00 ET, enabled. Writes local SEO briefs, social drafts, 28 local handoff items, a report and a Vera queue item. Content Engine, Agatha and Vera are the named local readers. No durable content artifact was confirmed.
- `innovation-agent`, Thursdays at 20:00 ET, disabled. The job file delegates to a template and does not name a durable write or reader.
- `Cron: 0 9 28-31 * *`, monthly at 09:00 ET on the final eligible day, enabled. Writes ten per-agent KPI tasks to Supabase. Control Center and the agents read those tasks.
- `Arlo - Hourly Feedback Pickup`, hourly, disabled. Reads recent Supabase task feedback and only reports it in the run result. No durable write is requested.
- `Arlo - Daily Dashboard Update (2AM UTC)`, daily at 02:00 UTC, disabled. Writes Control Center `public/data` files, builds execution state, commits and pushes to `main`. The Control Center deployment and its users read the repository output.
- `Arlo - Vercel Build Health Check (9AM UTC)`, daily at 09:00 UTC, enabled. Reads Vercel deployments and may fix, commit and push Control Center code on an error. Vercel and Control Center users read the result.
- `Arlo - Hourly Jobs Sync`, hourly, disabled. Runs `sync_jobs.py` for the job applications UI. The exact durable target is not named in the job file, and the job UI is its named reader.
- `Marcus Home Intelligence Brief`, Monday, Wednesday and Friday at 16:30 UTC, enabled. Writes the Supabase-backed `home_intelligence` source. The Control Center Intel panel reads it.
- `Layer 1 Signal Inbox Check`, Mondays and Thursdays at 13:00 UTC, enabled. Moves Drive inbox files to a processed folder and writes local signal and seen-registry JSON. The Drive move outlives the host, but no repository reader consumes the local signal output.
- `agatha-state-of-union`, weekdays at 09:00 ET, enabled. Intended to send Krish a summary and has written an `audit_log` row. No recent Drive document or application reader of its unique audit event was found.
- `loz-api-monitor`, Fridays at 17:00, enabled. Sends a Telegram usage report to Krish. Krish is the reader.
- `loz-memory-maintenance`, Fridays at 17:30, enabled. Writes Lauren's host-local `MEMORY.md`. Lauren's host agent reads it.
- `api-credit-monitor`, daily at 10:00 ET, disabled. Intended to send a Telegram alert on low balances. The disabled gateway entry has no current reader or output.
- `loz-news-briefing-9am`, daily at 09:00 ET, enabled. Sends a Telegram briefing to Lauren and updates host-local candidate and delivered-story ledgers. Lauren reads the Telegram message.
- `Silent Success Detector - Backstop Trigger`, Mondays at 08:05 UTC, enabled. Calls an n8n workflow. The durable workflow output is `silent_success`, but observed rows come from the workflow's own 12:00 schedule, not this backstop.
- `Truth Reconciler - Backstop Trigger`, Sundays at 07:05 UTC, enabled. Calls an n8n workflow. Intended readers are fleet reconciliation surfaces, but `fleet_drift_report` has no rows and no database reader.
- `Maa morning check-in`, Sundays at 09:30 London time, disabled. Sends a Telegram message to Maa when enabled. Maa is the reader.
- `Maa evening medication reminder`, Sundays at 20:00 London time, disabled. Sends a Telegram message to Maa when enabled. Maa is the reader.
- `Fireflies Meeting Intelligence Sweep`, on the 1st and 15th at 10:00 ET, enabled. Writes only host-local Fireflies JSON and Markdown logs. No external reader was found.
- `Weekly Token Spend Report`, Mondays at 08:00 ET, enabled. Writes a Google Sheet and returns a summary for Krish. Krish is the reader.
- `Arlo Autonomous OS Diagnostics Sentinel`, every six hours at minute 25 UTC, enabled. Writes host-local diagnostics and sends Telegram only for urgent findings. Krish is the conditional reader. The same diagnostics already run from root cron at zero AI cost.
- `loz-cultural-collab-radar`, daily at 10:30 ET, disabled. The prompt delegates to a local template. No durable write or reader was established.
- `loz-news-briefing-2pm`, daily at 14:00 ET, enabled. Sends a Telegram briefing to Lauren and updates host-local candidate and delivered-story ledgers. Lauren is the reader.
- `loz-news-briefing-6pm`, daily at 18:00 ET, enabled. Sends a Telegram briefing to Lauren and updates host-local candidate and delivered-story ledgers. Lauren is the reader.
- `loz-breaking-news-monitor`, every 90 minutes, enabled. Sends up to three qualifying Telegram stories to Lauren and updates host-local dedup and candidate ledgers. Lauren is the reader.

## The eleven

### 1. `fireflies-biweekly-pull.sh`

Does it write anything that outlives the host: No. It writes dated JSON and Markdown files under `/root/.openclaw/workspace-ops/logs` and a temporary log.

What reads it: No external reader was found. The gateway run can summarize the local result, but the files themselves have no identified consumer.

What it costs per run: The two latest successful gateway runs cost USD 0.00026 on DeepSeek and USD 0.64679 on Claude Sonnet. They recorded 20,661 and 90,662 total tokens respectively. The shell-only root cron pull has no model cost.

VERDICT: retire. It preserves no artifact beyond the machine and duplicates a cheaper shell pull.

### 2. `gmail-monitor`

Does it write anything that outlives the host: No. Its template writes only a local report for qualifying messages, and the last runs did not label, star or send mail.

What reads it: No reader outside the host was found. The report directory is the only observed destination.

What it costs per run: The last three runs cost USD 0.00211, USD 0.00194 and USD 0.00408, with 24,108, 24,341 and 30,939 total tokens.

VERDICT: retire. It produces no durable triage state and no application consumes its local report.

### 3. `system-health` gateway job

Does it write anything that outlives the host: No. The job runs local diagnostics and returns `OS_DIAGNOSTICS_OK` when healthy. Its last run produced no external delivery.

What reads it: The gateway run log and host operator are the only readers. The durable `system_health` table is rewritten every 15 minutes by `write-system-health.py`, not by this job.

What it costs per run: The latest run cost USD 0.00151 and recorded 26,862 total tokens.

VERDICT: retire. It adds model cost to a host-only check already covered by a zero-AI writer.

### 4. `context-archiver`

Does it write anything that outlives the host: No. The inspected night wrote local priorities, venture files, context budget, an attention file, a run report and a local week summary. It read Supabase but explicitly patched no rows.

What reads it: Host agents and wake protocols read the local context files. No external table, Drive file, document, email or commit reads its output.

What it costs per run: The inspected run cost USD 0.01880 and recorded 86,717 total tokens.

VERDICT: retire. Every output disappears with the host, and no durable consumer was found.

### 5. `workspace_maintenance` gateway job

Does it write anything that outlives the host: No gateway job by this name exists in `jobs.json`.

What reads it: Not applicable. A separate root-cron script with this name maintains local symlinks and backups, but that is not a gateway entry.

What it costs per run: USD 0.00 for the absent gateway job.

VERDICT: retire. Correct the inventory entry because there is no gateway job to port.

### 6. `vera-daily-audit`

Does it write anything that outlives the host: No. It writes a local daily report, `vera-queue.json`, backups and local repair alerts. No 06:00 UTC `vera_audit` row was found.

What reads it: Other host agents inspect the Vera queue and repair alerts. The grep found references in host-local queues, error logs and archived cleanup records, but no application or repository reader of the daily report directory.

What it costs per run: The last three runs cost USD 0.01866, USD 0.01164 and USD 0.01290, with 100,591, 55,410 and 57,113 total tokens.

VERDICT: port. The audit function produces actionable quality findings, while its named n8n replacement is not currently writing them. Retiring it without a working reader-side replacement would drop the function.

### 7. `visibility-agent`

Does it write anything that outlives the host: No. The September 14 session edited local stage and visibility pipeline JSON, wrote a local Nova report and wrote a local Agatha escalation. It sent no pitch and submitted no conference application.

What reads it: Agatha is named as the local reviewer. No row landed in `visibility_targets`, `contacted_persons` or `tasks`, and no mailbox artifact was found.

What it costs per run: The September 14 run cost USD 1.26789 and recorded 124,454 total tokens.

VERDICT: retire. It has built a large local draft backlog with zero sends or submissions, no durable reader and the highest observed cost in this group.

### 8. `content-scout`

Does it write anything that outlives the host: No. Recent runs update a local newsletter feed, a local editorial brief or an error log. Email was held behind the unattended approval gate.

What reads it: The local `newsletter-draft` job reads the feed. No external system reads it directly.

What it costs per run: The latest run cost USD 0.17905 and recorded 57,298 total tokens.

VERDICT: retire. Its only reader is another host job, and the newsletter job already performs its own live research when the feed is absent.

### 9. `newsletter-draft`

Does it write anything that outlives the host: Not in the observed runs. It creates local Markdown and HTML editions and updates a local de-duplication file. Google Drive, Discord and Substack actions were not executed.

What reads it: Krish is the intended reviewer, but the observed artifacts stay on the host and no durable review link was created.

What it costs per run: The latest run cost USD 0.23745 and recorded 65,816 total tokens.

VERDICT: port. This is a distinct editorial production function with complete weekly drafts, but its delivery step needs a durable review destination before the host is removed.

### 10. `marketing-agent`

Does it write anything that outlives the host: No durable content artifact was confirmed. The September 16 report records local SEO briefs, social drafts, 28 local handoff items and a local Vera escalation.

What reads it: Content Engine, Agatha and Vera are named readers through host-local queues. The distribution workflow has zero executions and the draft workflow is failing, so no durable downstream consumer completed the handoff.

What it costs per run: The parent session cost USD 0.00548 and recorded 43,628 total tokens. The spawned child session ledger was not retained under the discoverable session paths, so total run cost is unknown.

VERDICT: retire. The template is stale, its downstream pipeline is broken, and all confirmed output is local.

### 11. `product-agent`

Does it write anything that outlives the host: No durable artifact was confirmed. The last successful run wrote local briefs, a local handoff queue and a local report. The September 14 scheduled run ended in error with no session or usage record.

What reads it: Agatha is the named reader through the local handoff queue. The roster identity was retired on September 14, and the two consumer webhooks have no producer executions.

What it costs per run: The September 7 parent session cost USD 0.01215 and recorded 51,133 total tokens. The spawned child session ledger was not retained under the discoverable session paths, so the full successful-run cost is unknown. The September 14 failed run has no recorded model usage.

VERDICT: retire. The current roster and product list are stale, the latest run failed, and no durable brief or active consumer was confirmed.

## The ten script bodies

- `arlo-daily-contradiction-audit.sh`: Intended to write a local audit log and an `audit_log` row, but its body is malformed because Python statements sit directly in a Bash script before a closing `PYEOF`. This strengthens, and does not change, section 3's retire verdict.
- `vera-contradiction-audit.sh`: Writes a local Vera log and a durable `audit_log` row with `event_type=vera_weekly_audit`. The map already proved nothing reads the findings, so the retire verdict does not change.
- `workspace_maintenance.sh`: Rebuilds local symlinks, creates three-day local workspace archives, deletes older local archives and appends a local audit log. Nothing outlives the host, so the retire verdict does not change.
- `fire-pending-flags.py`: Reads `pending_flags`, inserts a `tasks` row, patches the flag as fired and attempts an `audit_log` row. These are durable writes, but the dashboard can no longer enqueue flags under current RLS and only one historical row exists, so section 3's retire verdict does not change.
- `cc-sync-engine.sh`: Patches `agents.last_run`, upserts `home_intelligence` and conditionally writes `audit_log`. This confirms durable writes, but the map proved that it overwrites live n8n-owned intelligence and stopping it is the fix, so the retire verdict does not change.
- `cc-doc-creator.sh`: Creates Google Docs in per-agent Drive folders and patches `tasks.link_primary` with each document URL. This confirms section 2's keep-until-ported verdict.
- `write-system-health.py`: Deletes and rewrites the five durable `system_health` rows on each run. This confirms section 2's keep-until-ported verdict.
- `api-credit-monitor.sh`: Writes only local balance logs and pull-only alert logs. Telegram sending is commented out. The retire verdict does not change.
- `api-balance-poller.py`: Upserts DeepSeek, NeverBounce and Apify balances and status into `api_usage_state`. The six-hourly connections sweep already owns equivalent data, so the retire verdict does not change.
- `api-usage-alerter.py`: Calls the rollup RPC, patches `api_usage_state.last_status` and writes local pull-only alerts. Telegram sending is unreachable dead code and no application reads the table, so the retire verdict does not change.

## The three small facts

- The 02:30 root-cron line that calls `render-plan.py` is `/root/.openclaw/workspace-ops/scripts/vera-nightly-quality-loop.sh`, line 26. It runs `python3 render-plan.py`. The other 02:30 line is `regenerate-standards-digest.py` and does not call it.
- `/etc/cron.d/vera-audit` exists only as disabled comments. It says the duplicate was disabled on 2026-06-09 and the canonical schedule is root cron at `0 8 * * *` for `vera-n8n-audit.js`.
- The requested `/root/.openclaw/workspace/scripts/deliver_gate.py` path does not exist. The file is `/root/.openclaw/workspace/agents/tools/deliver_gate.py`. It reads `standards_registry`, writes violations to `learning_events`, increments `standards_registry.hit_count` and `last_hit_at`, and writes gate overrides to `audit_log`.

## What I could not settle

- `ssh openclaw 'sudo sh -c ...'` for the combined system-health, context and Vera-reader check was parsed by local PowerShell. `tail`, `sed` and `grep` were reported as unknown local commands. The checks were repeated as separate SSH calls and settled.
- `tail -n 1 /root/.openclaw/cron/runs/a170511a-a5e1-45a3-af2d-ca377f642f75.jsonl` failed because that copied ID was wrong. The correct ID is `a170511a-a5e1-45a3-af2d-ca377d12d361`; the corrected read succeeded.
- `jq '.jobs[] | select(.name=="workspace_maintenance")' /root/.openclaw/cron/jobs.json` returned nothing. This settled that the gateway name is absent.
- The first exact-time filter for the September 14 visibility run returned nothing because the run began at 13:04 UTC. Reading the last runs and the matching session ID settled it.
- Two PowerShell here-string attempts to run the ten-script loop failed with `bash: syntax error: unexpected end of file`. Individual `find` and `sed` calls read all ten scripts successfully.
- The first `jq` date-format commands for the content-scout and newsletter run logs failed with a shell quoting error. Simpler field selection succeeded.
- Ten repeated `jq --arg n` job-ID lookups failed because PowerShell expanded the remote variable. A single all-job ID listing succeeded.
- The first all-prompt `jq` concatenation failed with a shell quoting error. Compact JSON selection succeeded and returned all 45 prompts.
- The specified `grep -l render-plan /root/.openclaw/workspace/scripts/*.py /root/.openclaw/workspace-ops/scripts/*.sh` returned nothing because the unprivileged remote shell could not expand root-owned script directories before `sudo grep` ran. Direct inspection of the two 02:30 scripts found the call in `vera-nightly-quality-loop.sh:26`.
- `grep -n "table\|digest" /root/.openclaw/workspace/scripts/deliver_gate.py` returned nothing because that path does not exist. `find` located the file under `workspace/agents/tools`, and direct inspection settled its tables.
- Two session-ledger reads were reset by SSH while running in parallel. Both succeeded on individual retry.
- `find` returned nothing for the marketing and product child session IDs. Their parent costs are known, but total run costs remain unknown because the child ledgers are not present under `/root/.openclaw/agents`.
- `pulse-weekly-ingest`, `revenue-finance-agent` and `innovation-agent` delegate to templates, but their job entries do not name durable write targets. Those targets were outside the eleven-job work list, so they remain unknown from this pass.

## Credentials seen

- `/root/.openclaw/workspace/active/templates/newsletter-draft.md:64`
- `/root/.openclaw/workspace/active/templates/marketing-agent.md:77`
- `/root/.openclaw/workspace/active/templates/marketing-agent.md:171`
- `/root/.openclaw/workspace-ops/scripts/cc-sync-engine.sh:9`
- `/root/.openclaw/workspace-ops/scripts/cc-sync-engine.sh:33`
