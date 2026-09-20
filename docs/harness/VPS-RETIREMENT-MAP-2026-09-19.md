# VPS retirement map, 2026-09-19

What the OpenClaw VPS actually carries, what already exists on the GitHub side, and the order a wind-down has to follow.

Compiled from 62 verified rows (33 root cron entries, 29 gateway jobs), each put through two refutation lenses: "something already does this" and "is the output load-bearing". Preconditions come from `scratchpad/vps/rulings.md`, which carries the nine Krish rulings and the ten stated preconditions with file and line for each.

Reading key. `held: true` means both lenses failed to refute the row. `held: false` means at least one lens refuted the row as written; the verdict may still stand on corrected grounds, and the correction is carried in the note. Credentials are named by variable or file path only. Where evidence is missing this document says unknown and names the one command that would settle it.

**Who decided each row.** This map was produced across a model switch, so it says which model did what rather than implying one author. The 62-row classification and the four source readers were fable 5.1. The two refutation lenses were split: fable 5.1 on 68 checks, opus 5 on 38 checks. The synthesis was opus 5. Every row in section 7 carries the models that checked it, and a row nobody checked says so.

The reason to record it is not the model names. A verdict here decides whether a job gets switched off, and the next person to disagree with one needs to know what produced it.

Nothing here is an instruction to switch anything off. Every host action needs its own explicit approval for that named action, runs from LORIMER over `ssh openclaw`, and is preceded by a fresh read-only audit (P2, P10, R9).

---

## 0. Corrections, 2026-09-20

The read-only pass this map asked for ran on the host. `state/vps/UNKNOWNS-SETTLED-2026-09-20.md`
is its output and it wins over this map wherever the two disagree, because it
opened files this map reasoned about from names.

**The gateway has 45 jobs, not 29.** Line 7 below called the gateway layer the
weakest evidence here and it was worse than that: sixteen jobs were missing from
the inventory entirely. The heartbeat's count of 45 was right the whole time and
both this map and `ARCH:1771` were wrong. Anything in section 3 or section 7
that counts gateway rows is understated by sixteen.

**Nine of the eleven unknowns retire and two port.** The nine write only local
JSON and Markdown under `/root/.openclaw`, read by nothing outside the machine.
The two with a real consumer are `vera-daily-audit`, whose `vera-queue.json`
host agents read, and `newsletter-draft`. Section 5 is settled and closed.

**These jobs have a price, and this map had them at nothing.** `gmail-monitor`
costs about USD 0.002 a run, three times a weekday. One Fireflies sweep run
charged USD 0.65. They are scheduled LLM sessions, and the case for retiring a
job that writes nothing anyone reads is stronger once the run has a number on it.

**Telegram, settled 2026-09-20 (section 4.7).** The pull-only breach this map
reported was not one. All 73 Telegram-capable nodes across the n8n mirrors are
disabled, and the live Stripe workflow reads the same. The four `agatha-state-of-union`
delivery claims are false: the 2026-09-15 `audit_log` row says "dispatched to
Krish via Telegram" in the same sentence that reports "Telegram creds broken".
`ARCH:212-214` already rules against exactly that. What does still send is on
the gateway, and it splits in two:

- **To Krish**, and so his to switch off: `loz-api-monitor` (Fridays 17:00) and
  `Arlo Autonomous OS Diagnostics Sentinel` (every six hours, urgent only, and
  the same diagnostics already run from root cron at no model cost).
- **To Lauren**, and NOT his alone to switch off: `loz-news-briefing-9am`,
  `-2pm`, `-6pm` and `loz-breaking-news-monitor` (every 90 minutes). These are
  the one deliberate pull-only exception at `ARCH:191-193`. Switching them off
  stops something another person receives, without her knowing, so it is named
  here and not acted on. The two `maa` jobs are already disabled.

**A live Telegram bot token is in plaintext in at least one LIVE n8n node**, and
the count is not known. Correcting a claim made earlier the same day and wrong:
all 63 Telegram nodes in the checked-in mirrors use the `{{TELEGRAM_BOT_TOKEN_OPS}}`
placeholder, so git is clean and "around sixty nodes carry the token" was false.
What is true is narrower and still bad: the LIVE `Stripe | Mindmaker OS | Payment
Alert` workflow, read from n8n on 2026-09-20, has the bot token written into the
node's URL, where git shows a placeholder. That is the exact divergence
`scripts/n8n/scan-live-secrets.mjs` found on 2026-09-14 across seven nodes and
sixteen credentials, and it means the mirror cannot answer this question: only a
live scan can. Disabling a node does not remove a credential from it, and n8n
keeps version history, so the token is exposed whether or not the node ever
fires again. Reported here by location and never by value. Run the live scan to
get the real count; rotation was declined on 2026-09-20.

---

## 1. The answer in eight lines

1. Four jobs carry something no other surface produces, and they are the reason the host cannot go this week: `n8n-exec-governor.py` (the only cumulative per-billing-cycle execution counter and the only per-workflow spike alarm anywhere, DECL:203, ARCH:520), `write-system-health.py` (the only writer of the five `system_health` rows the Systems panel, the sidebar badge and the `audit_critical_infra` freshness guard read), the 02:30 `render-plan.py` stamp (the only thing keeping `/api/health` agent-freshness out of `failed`), and `cc-doc-creator.sh` (the only writer of `tasks.link_primary`, which `decisions_waiting` and DecisionDetail render).
2. Four more are load-bearing only because the GitHub-side owner is broken or switched off, not because the VPS does anything better: `vera-gap-cycle.sh` (its upstream, the n8n "Run Vera Audit" code node, has been `disabled: true` since 2026-09-06T20:37:58Z), the Marcus Home Intelligence backstop (the n8n Daily Brief has failed on an Anthropic 401 every day since 2026-09-16), `critical-infra-monitor.py` (the n8n copy is live but at 3 hours against 5 minutes, and phase-shifted out of the auto-resolve window), and `render-identity.py` (its only live reader is the host's own `sync-to-drive.py` identity leg).
3. Two are unique but cheap and mechanical: `vps-heartbeat.sh`, which is the declared `openclaw-vps` surface and is already failing with a 401 since 2026-09-19T09:05Z, and `monthly-all-hands`, which is the only writer of the ten per-agent monthly KPI tasks.
4. Everything else on the OS side of the machine, 32 of 62 rows, writes nothing anyone reads. The clearest cases: `arlo-daily-contradiction-audit.sh` has produced no `audit_log` row since 2026-04-14 while its own Monday sibling has reported it missing for six consecutive weeks; `poll_sync_queue.py` returns an empty set 288 times a day; `fire-pending-flags.py` polls a queue that RLS has made unfillable since 2026-09-09; `cleo-drafts-export` re-exports a Google Doc that has not changed since 2026-04-30.
5. Three jobs are firing into a 401 and nobody noticed: `ingest-events-gmail.py` (06:15 UTC), `discover-events.py` (06:45 UTC) and `vps-heartbeat.sh` (hourly), which is why the events lane looks retired and the declared clock looks dead. The credential rotation in P6 and these failures are the same problem.
6. The one precondition that blocks everything, P1, is not met and cannot be met by porting: the cap was removed by ruling on 2026-09-09 (R6), so "rehome the execution cap" means build one, seeded from the retained `CRITICAL_WHITELIST`, and prove it trips. Verified 2026-09-20: no workflow in `krishanraja/ai-harness/.github/workflows/` or `krishanraja/control-center/.github/workflows/` counts n8n executions.
7. The gateway layer is the weakest evidence in this map. `/root/.openclaw/cron/jobs.json` has never been read, so 29 rows describe jobs by name and cadence only; 10 of them have unknown writes, and the job count itself is unreconciled (33 audited, 45 reported by the heartbeat, about 38 in the architecture doc).
8. The four personal-life agents (9 rows) are outside this map entirely by R5: not read, not listed, not catalogued. They are named here only so the count adds up.

---

## 2. Port first

Eleven rows. Each is load-bearing, or is the only producer of an output a surface reads. Order inside this section is the order they should be done, not the order of value.

### 2.1 `n8n-exec-governor.py` (hourly). The cap. Blocks everything.

- **Replaces**: the hourly VPS line, and the hand-off of the cycle count into `write-system-health.py` and into `state/heartbeats.json`.
- **Repo**: `krishanraja/ai-harness`, where `scripts/n8n-exec-governor.py` is already checked in.
- **Action**: `.github/workflows/n8n-governor.yml`, `schedule: 0 * * * *`, plus `workflow_dispatch` with a `--dry-run` input.
- **Secrets by name**: `N8N_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. The current `TOOLS.md` and `openclaw.json` parsing is removed.
- **State**: commit `state/n8n-governor-state.json` back to main, the pattern `harness-machine-heartbeat.yml` already uses for `state/heartbeats.json`, so the counter never resets mid-cycle.
- **Table**: upsert `system_health` id `sys:N8N Execution Budget` (message `<count>/10000 this cycle`), and insert a tier-3 `silent_failures` row (`workflow_id` `infra:n8n-budget`) on WARN, CRITICAL or RATE. That replaces the log file and the `write-system-health.py` hand-off. It stays pull-only, per R1: a table and a banner, never a phone.
- **Equivalence proved by**: running the Action beside the VPS line for 24 hours and diffing the two state files hourly on count, `cycle_start` and rate window.
- **The cap itself proved by**: a controlled test with `CRITICAL_AT` set below the current count and the whitelist pointed at throwaway workflows, observing the deactivate calls land and the restore command bring them back (LIVE:343).
- **Gate**: an acting branch reverses R6 (warn-only) and needs a Ruling line from Krish. See section 4.1.
- **Partial cover that already exists**: `/api/meter/n8n-sync` (Vercel, `35 */6 * * *`) writes per-workflow per-day executions into `meter_daily`, and summing it since 2026-09-01 gives 3,053 against the governor's 2,966 at the same hour, 3 percent apart. It carries no threshold, no hourly spike check, no whitelist, and it reads a 3-day window that a retention prune would hide.

### 2.2 `write-system-health.py` (*/15). The five rows the dashboard reads.

- **Replaces**: the VPS refresher, and the table clobbering that currently deletes `connections-sweep`'s critical rows within 15 minutes.
- **Repo**: `control-center`.
- **Cron**: `*/15 * * * *` to `/api/refresh-health` in `vercel.json`, with the `CRON_SECRET` guard the other crons use.
- **Secrets by name**: `N8N_BASE_URL`, `N8N_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_ORIGIN`; DeepSeek through the same `runCheck` `connections-sweep` uses; budget headroom from the governor's new state or from the `system_health` row the governor Action writes.
- **Table**: `system_health`, upserting only the five `sys:` ids **by id**, never deleting the table, so `connections-sweep`'s `sys-api-*` rows survive.
- **Equivalence proved by**: with the VPS line disabled, the five rows' `last_check` advances every 15 minutes for 24 hours, SystemsPanel shows the same five components, `audit_critical_infra` returns no `monitoring:stale` entry, and an `api-anthropic` row written by the 12:00 sweep is still present at 12:30.
- **Two corrections to carry**: `api/refresh-health.ts` today writes four unrelated components (N8N Cloud, Content Engine, Revenue Report Workflow, Status Webhook), sets no id, and is POST-only, so its body is replaced rather than just scheduled. And the partial-unique-index warning at ARCH:232-236 is stale: live `pg_indexes` shows two plain unique btrees, on `id` and on `component`, so conflicting on either works now.
- **Readers**: SystemsPanel.tsx:94, MobileSystems.tsx:40, DesktopSidebar.tsx:36 (with a realtime subscription), api/health.ts:70, api/_tabGrounding.ts:241, and the DB function `audit_critical_infra()`.

### 2.3 `critical-infra-monitor.py` (*/5). Cadence, not capability.

- **Replaces**: the 5-minute caller of RPC `audit_critical_infra`. The live n8n copy `SXdHes0WwIovjPAB` (`0 */3`, active, 12 consecutive successes to 2026-09-19 19:00) calls the identical RPC with the same credential, so the rows and the banner are identical. The gap is detection latency, up to 7 hours instead of 5 minutes, and a recovery race: auto-resolve needs a healthy row under one hour old, and n8n fires 59 to 60 minutes after each 6-hourly sweep.
- **Repo**: `control-center`. Two options, one cheap.
  - Cheap: move the n8n cron from `0 */3 * * *` to `20 */3 * * *` so it lands inside the auto-resolve window. No new code.
  - Like-for-like: a Vercel cron `*/5 * * * *` to a route calling `rpc('audit_critical_infra')` with `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET`.
- **Table**: `silent_failures`, tier 4, `failure_type` `critical_infra_down`, `workflow_id` `infra:<component>`. Read by `useCriticalAlerts.ts` (the Home critical mark), `api/_tabGrounding.ts`, and the weekly `audit_failure_patterns()` sweep.
- **Equivalence proved by**: an `infra:api-anthropic` row appearing within 5 minutes of the sweep writing a failing row, and auto-resolving within one hour of a healthy row.
- **Coupling that must be respected**: this row cannot be retired independently of 2.2. If both stop, the five probed components stop being written, and after 24 hours every RPC call returns the synthetic `monitoring:stale` entry, which the n8n caller counts as a failure and Telegrams every 3 hours.
- **Two defects not to copy**: the RPC dedupes only on open rows younger than 5 minutes, so a persistent failure yields one row per call (721 rows in 7 days); and `useCriticalAlerts` fetches 60 rows tier-desc, so 32 open duplicates of one component crowd out 71 tier-3 rows.

### 2.4 `vera-nightly-quality-loop.sh` (daily 02:30). Port the reader, not the writer.

- **Replaces**: nothing, deliberately. The daily stamp on all 14 `agent_plans` rows (`last_rendered_at`, `last_rendered_by = render-plan.py`) proves a file was rendered on the host, not that an agent did anything. The content it stamps is June KPIs untouched since June.
- **Repo**: `control-center`, `api/health.ts` lines 81 to 113.
- **Change**: derive per-agent freshness from `workflow_health.latest_success` per agent (written 6-hourly by `/api/health/fleet-reconcile`) with a per-agent expected cadence, and drop the `agent_plans.last_rendered_at` read. Do not count agents with no scheduled workflow (arlo, and hunter whose one workflow is inactive).
- **Secrets by name**: `SUPABASE_SERVICE_ROLE_KEY`, already present.
- **Equivalence proved by**: the component reporting the same agents `workflow_health` says are silent. Expect degraded, not green. On today's data a `workflow_runs`-derived version reports arlo and vera stale over 11 active agents (degraded), or 4 stale over all 14 (failed). Either is the true state; the current green is manufactured by the stamp, so "stays out of failed" is the wrong acceptance test.
- **Two other readers to port or delete in the same change**: the `plan_stale` computation in eleven active n8n workflows (72-hour threshold, currently inert because nothing branches on it), and the host wake protocol's 72-hour READ-ONLY gate (ARCH:1025), which dies with the host.
- **Precondition**: settle which of the two 02:30 lines calls `render-plan.py`. See section 5.

### 2.5 `vera-gap-cycle.sh` (Friday 11:30 UTC). Equivalent by construction, blocked upstream.

- **Replaces**: the only caller of `route_vera_gaps()` then `reconcile_vera_gaps()`, which turn weekly Vera findings into `vera_gaps` rows and owned `tasks`, and feed the ninth `decisions_waiting` branch.
- **Repo**: `control-center`. Vercel cron `30 11 * * 5` to `/api/health/vera-gap-cycle`, `CRON_SECRET` guard.
- **Secrets by name**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Tables**: `vera_gaps` and `tasks`, written inside the SECURITY DEFINER RPCs, so the port is equivalent by construction. Plus one `audit_log` row (actor `vera`, `event_type` `vera_gap_cycle`) carrying both RPC results.
- **Equivalence proved by**: on the first Friday after a weekly `vera_audit` row lands, `vera_gaps.last_audit_at` equals that row's `created_at` and the audit row carries created, persisted and reopened counts, with the VPS line disabled.
- **Upstream precondition that matters more than the port**: the n8n Behavioural Auditor `l0nujD2PBYGeEtXx` has its only working node, "Run Vera Audit", set `disabled: true` in its single saved version (2026-09-06T20:37:58Z, author Krish Raja). Every run since is a one-second pass-through writing one generic `audit_log` row; `workflow_health` still reads healthy because `fleet-reconcile` classifies on run and error counts alone. No `vera_audit` row exists after 2026-09-06, so the port would route nothing. Re-enabling that node is a change needing its own approval, and the live node carries three inline credential values (an n8n API key, the Supabase service-role JWT, a Telegram bot token) that must move to n8n credentials and be rotated first.
- **Live scale check before spending effort**: of 24 findings in the last weekly run, 23 are on tasks already `superseded` and 1 is open. The weekly number is mostly noise, and priya's 54 superseded tasks will inflate it further.

### 2.6 `cc-doc-creator.sh` (*/15). The only per-task doc minting.

- **Replaces**: nothing else mints a Google Doc per task. `createDriveDoc` in `api/_google.ts` has one caller, the guest briefing route.
- **Repo**: `control-center`. Vercel cron `*/15 * * * *` to `/api/tasks/doc-creator`; hourly is acceptable, the UI tolerates the lag.
- **Secrets by name**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, plus either `GOOGLE_DRIVE_FOLDER_ID` (a Shared Drive) or `GOOGLE_IMPERSONATE_SUBJECT` with Drive scope, because a service account has no Drive quota of its own; `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.
- **Table**: `tasks.link_primary`, plus an `audit_log` row (actor `doc-creator`, target task id).
- **Equivalence proved by**: running the VPS job in parallel until one cron write is read back from `tasks.link_primary`. The surface to watch is the `decisions_waiting` view (which selects `link_primary AS url`) and `DecisionDetail.tsx:190,213-215`.
- **Evidence it is live rather than idle**: 46 tasks were linked within 20 minutes of creation, all on the `*/15` grid; the most recent is task 62c683cf, created 2026-09-14 19:55:40, linked 20:00:06. There are zero unlinked candidates among active tasks; the "48 candidates, 480 runs, no write" reading counted 46 superseded and 2 waiting rows.
- **Unknowns to settle first**: the script's real status filter (live data says active only, narrower than the documented rule), and whether the Vercel project holds the Google service-account variables (the env listing returned 403). New docs will be owned by the service account or the impersonated user rather than the host OAuth user; existing links are untouched.

### 2.7 `render-identity.py` (*/15), with the `sync-to-drive.py` identity leg.

- **Replaces**: the renderer itself needs no GitHub equivalent. Sixteen n8n workflows load `agents.brief_content` at runtime, and Control Center reads and writes the column directly. Host Claude Code sessions, the only readers of the rendered `SKILL.md`, retire with the host.
- **What actually blocks retirement**: all 14 `google_drive_sync` identity rows carry `workspace_path = /root/.openclaw/skills/agent-{id}/SKILL.md`, and `sync-to-drive.py` mirrors that file into a per-agent Identity Google Doc every 6 hours (10 of 11 active agents rewritten at 2026-09-19 18:00 UTC, no errors). Retiring the renderer alone would freeze 14 Identity Docs silently, because an unchanged checksum is a skip.
- **Option A**: retire the identity leg of `sync-to-drive.py` in the same change, and accept that the 14 Identity Docs stop updating.
- **Option B**: if the docs are wanted, move the mirror to a Vercel cron that renders `agents.brief_content` into the existing `google_drive_sync.doc_id` through `api/_google.ts`, keyed on a hash of `brief_content` rather than the file's `rendered_at` stamp. Secrets as in 2.6.
- **Cleanup in the same change**: set `crons.id='render-identity'` to retired; reword `DesktopOrg.tsx` lines 853-854, 886-887, 914 and 958 (the "within 60s" claim is wrong even today); drop or document as advisory the `sync_queue` insert in `api/sync-brief.ts` lines 61-70; correct `api/skill-proposals/approve.ts:12-14`, `docs/AGENTS.md:152-154,171,184`, `README.md:198`, `docs/ARCHITECTURE.md:282` and `ARCH:560,992,1009-1014,1721-1729`.
- **Ruling needed before choosing A or B**: nothing in code reads the 14 Identity Docs or the 14 Action Docs. See section 4.5.
- **Note**: six of the 14 agents (arlo, priya, leo, felix, kai, vera) have no runtime loader in any n8n workflow, so after retirement their `brief_content` has no reader anywhere.

### 2.8 `vps-heartbeat.sh` (hourly :05). The declared surface.

- **Replaces**: the sending half of the `openclaw-vps` clock. The receiving half is already GitHub: `harness-machine-heartbeat.yml`, `scripts/record-machine-heartbeat.mjs` (allowlists `openclaw-vps` and exempts it from the release identifier), and `EXPECTED_CLOCKS` in `scripts/audit-harness.mjs`, which opens a finding past 48 hours.
- **Repo**: `ai-harness`. The governor Action (2.1) posts the same `repository_dispatch` at the end of each hourly run.
- **Secret by name**: a fine-grained PAT scoped to `krishanraja/ai-harness` with contents write, stored as `GITHUB_HEARTBEAT_TOKEN`, replacing the repo-scoped token that now returns 401 (DECL:196-199).
- **Payload**: `gateway_jobs_defined` becomes null once the gateway is gone; `record-machine-heartbeat.mjs` already treats null as absent. Do not copy the sender's status logic, which sets `degraded` when the gateway count is null (`vps-heartbeat.sh` lines 65-70), or the clock reports degraded on every run.
- **Equivalence proved by**: `state/heartbeats.json` showing the clock advancing hourly with `n8n_executions_this_cycle` equal to the governor state count, and `audit-harness` raising no missing-clock finding for 72 hours after the VPS line is disabled.
- **Already failing**: `last_run` 2026-09-19T09:05:09.158Z, status ok, 2917 executions, 45 gateway jobs, and the hourly POST has returned 401 since. Read at 2026-09-20 that clock is already over 24 hours old, so `/api/health` harness-heartbeat is degraded and the 48-hour `failed` threshold trips from 2026-09-21T09:05Z, which turns the Control Center sidebar dot red.
- **Ruling needed**: the clock name. See section 4.2.

### 2.9 Marcus Home Intelligence backstop (gateway, `30 16 * * 1,3,5` UTC). A credential repair, not a port.

- **Replaces**: on Wednesdays and Fridays it is currently the only writer landing `home_intelligence.top_three`. The designed producer is n8n Marcus Daily Brief `d2sHSeyXMmu8Xe0C`, whose "Write home_intelligence" node PATCHes `top_three`, `top_three_alternates`, `top_three_reasoning`, `top_three_at`, `daily_brief`, `daily_brief_at`, `momentum`, `momentum_at` in exactly the shape `useHomeIntelligence.ts:22` and `api/daily-focus/suggestions.ts` parse. It has failed at node "Sonnet brief" with a 401 on every run since 2026-09-16; last success 2026-09-15 10:31.
- **Repair**: rotate the n8n Anthropic credentials (`w8sWwz8EfYc1JA7G` for the Daily Brief, `NqmXYF7Q7sJg5Iog` for Synthesis `TI1ozQbPtI69qlgO`), and rotate the inline Supabase service_role JWT in both workflows' code nodes (`Load OS State`, `Write to Supabase`, `Pull live data`), which the repo mirror templates as placeholders but the live nodes carry as literals.
- **Table**: `home_intelligence`. `version`, `version_created_at` and the `home_intelligence_synthesis` audit row have no readers anywhere and are not ported.
- **Equivalence proved by**: `top_three_at` landing daily at 10:30 UTC from `d2sHSeyXMmu8Xe0C` for one week, and `/api/daily-focus/suggestions` returning three primary cards. Then retire the gateway job.
- **Separate defect to fix at the same time**: `TI1ozQbPtI69qlgO`'s "Log Run to Supabase" node writes `success` regardless of the parse result, so `workflow_health` reads healthy while the workflow writes nothing (execution 42906, 2026-09-18 15:00, Anthropic 401 then a Gemini fallback truncated at the 1200-token cap).
- **Product decision inside this one**: the backstop's cards are Zara-signal proposals with agent owners, kind `content`, and no `action_target_id`, which is outside `TopThreeKind` and leaves the "Open task" action with nowhere to go. If those semantics are wanted on Home, that is a decision to take before retirement.

### 2.10 `monthly-all-hands` (gateway, `0 9 28-31 * *`). The KPI ladder.

- **Replaces**: the n8n copy `WbHC2krWcX9IHbE7` is an announcement stub whose Telegram node is disabled and whose only write is a self-certified `workflow_runs` row with `outcome_count` 0. It has two rows in its life. It is not an equivalent.
- **Repo**: `control-center`. One monthly job, Vercel cron `0 9 28-31 * *` with a last-day guard so it fires once rather than four times, or a GitHub Actions schedule.
- **Secrets by name**: `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.
- **Tables**: `tasks`. Mark the prior month's rows where `origin = all-hands-YYYY-MM` superseded with the closing note, then insert the next month's ten per-agent KPI rows with the new origin, agent, venture and target text, seeded from the `agents` KPI fields. Write the review itself to a Supabase-backed surface (a new `all_hands_reviews` row, or a section in `home_intelligence`) instead of a host file at `warm/all-hands/`.
- **Equivalence proved by**: on the last day of the month, ten new `tasks` rows with the new origin and ten flipped to superseded with the closing note, matching the observed 2026-07-31 09:00:00Z and 2026-08-31 09:00:00Z pattern and the `cc-sync-engine` audit rows at 09:10 and 09:15.
- **Then**: unpublish the n8n stub so `workflow_health` stops reporting a job that does nothing as healthy, and strip the plaintext service-role JWT and Telegram bot token from its live node parameters before archiving.

### 2.11 `discover-events.py` (daily 06:45). Conditional on a ruling.

- **Status**: the only event discovery on any surface. Nothing on GitHub, Vercel, n8n or Supabase writes `events`. The read path already exists in the database (`events_recommendable`, `visibility_items`, `events_for`, `scrub_dead_events`) and has no callers; `pg_stat_statements` shows `events_for` at zero calls since 2026-04-14.
- **If the attend lane ships**: a Vercel cron writing `events` from Luma and the host watchlist. Secrets unknown until the host script is read, so this cannot be specified further today.
- **If the lane is dropped**: retire `ingest-events-gmail.py`, `discover-events.py` and `score-events.py` together with the four schema objects, and copy the Draw and Demand scoring out of the host first. Note the ranking and archive rules are already checked in (`supabase/migrations/20260821200000_restore_adr008_hardening_drift.sql`); what is host-only is the Gmail query and parse, the discovery sources, and the model that fills `draw_score` and `demand_score`.
- **Live fact that changes the framing**: the job is still firing daily and its upsert returns 401 (06:45:09 UTC on 2026-09-19, same on 09-14 and 09-17). The lane stopped on 2026-09-09 for a credential reason, not a scheduling one. `score-events.py` made no request at all on 2026-09-19.
- **Ruling**: see section 4.6.

---

## 3. Retire now

Thirty-two rows whose output nothing reads. One evidence line each. "Retire" here means the crontab or gateway line stops; it is still a host change under P10 and still needs its own approval.

### Root cron (18)

| # | Job | Evidence that nothing reads it |
|---|---|---|
| 1 | `arlo-daily-contradiction-audit.sh` | Four `audit_log` rows ever, all 2026-04-14; its own Monday sibling has reported "Arlo audit hasn't run in N days" for six consecutive Mondays (N = 117 to 152). A server-side sweep of every `created_at` table in the 03:00 to 03:02 window shows only grader, cleo and vera rows. |
| 2 | `vera-contradiction-audit.sh` | 24 `vera_weekly_audit` rows, findings in the `changes` jsonb; no `.from('audit_log').select` anywhere in `src` or `api` except `api/spend/ingest.ts:172` filtered to its own event types. The one incidental touch is Marcus counting rows per actor, which never selects `changes`. |
| 3 | `regenerate-standards-digest.py` | `standards_registry`: 169 rows, total `hit_count` 10, `last_hit_at` 2026-05-04, no insert or update in 30 days. RLS enabled with zero policies, so only `service_role` can read it and no `api/` route does. The digest's only consumers are the host wake protocol and `deliver_gate.py`, both host-only. |
| 4 | `vera-n8n-audit.js` | Writes only `/var/log/vera-audit.log`; no repo reads it. Zero `vera_audit` rows at UTC hour 8 across all 147 rows. `/api/health/fleet-reconcile` already writes `workflow_health`, `credential_health`, `silent_failures` and `audit_log` from the same n8n API, 28 runs in 7 days. |
| 5 | `workspace_maintenance.sh` | No GitHub-side job touches a host filesystem, and none needs to. Every row written at 03:00 in the last 7 days is attributable to the content-engine grader, Cleo's Newsletter Sweep or the Vera Monday audit. Stock logrotate and fstrim timers already run on the host. |
| 6 | `refresh_token.sh` + `sync-to-drive.py` | The only code reader of `google_drive_sync` is `api/agents/[name].ts`, which has no caller in `src` and would return PGRST116 anyway because every agent has two rows. None of the 28 doc ids appears anywhere in the repo. Supabase API logs for a full week show every request to the table from `Python-urllib/3.10`. Conditional: see 4.5 and 2.7. |
| 7 | `fire-pending-flags.py` | One row ever (agent `test`, 2026-04-16). Since migration `20260909110000_revoke_anon_writes.sql` the only policy on `pending_flags` is `anon_update`, so `FlagAgentModal`'s insert is refused and both modals' selects return nothing. The queue cannot refill from the dashboard. |
| 8 | `cc-sync-engine.sh` | Both lenses refuted the row's claim that it is the only writer. Three live n8n writers own `home_intelligence.summary` and `metrics`, and the VPS job overwrites all three within 5 minutes, falsifying the Intel tab's "MARCUS, WRITTEN" dateline and making the 4-day stale check unreachable. Stopping the line is the fix; no port. |
| 9 | `poll_sync_queue.py` | 288 GET requests to `sync_queue?status=eq.pending` in 24 hours, all returning the empty set; one row in the table since 2026-04-22. `api/sync-brief.ts` already documents its enqueue as advisory. Drop the enqueue block and the two stale `DesktopOrg.tsx` comments with it. |
| 10 | `cleo-drafts-export` | Drive metadata: created 2026-04-30T21:11:14Z, modified 2026-04-30T21:11:15Z. The same 2.7 KB has been re-exported every morning for about 20 weeks. No repo, workspace listing or wake protocol names `DRAFTS.md`. |
| 11 | `inbox-decay.sh` | `tasks_inbox` holds 0 rows; lifetime stats are 1 insert, 4 updates, 1 delete. The RPC has been called 116 times through PostgREST, so the cron fires; at most one row could ever have been archived and it no longer exists. |
| 12 | `token-spend-alert.sh` | Writes only `/var/log/os-pull-only-alerts.log`; the only repo mentions are the crontab line and four doc lines. It measures the gateway's own spend, which goes to zero with the gateway. Carry forward one real gap: there is no absolute daily LLM-dollar line on the GitHub side, which is why the 2026-09-15 `enrich-person` day (17.72 USD, 3,284 calls against a 0.01 to 1.49 USD baseline) raised no alert. |
| 13 | `os-autonomous-diagnostics.py --mode quick` | Every quick-mode check reads this host's own paths, crontab, gateway payloads, processes and git tree, so the subject ends with the host. No reader in `src`, `api` or Supabase. Retiring it must also remove the `openclaw-vps` clock assertion; see 4.2. |
| 14 | `api-credit-monitor.sh` | No table carries a 14:00 write from it: `api_call_log` has zero rows at hour 14 across all five sources, and every `api_usage_state.last_polled_at` sits in the 6-hourly sweep's slot. `/api/health/connections-sweep` already writes `service_registry` for 36 services and mirrors status onto `api_usage_state`. |
| 15 | `api-balance-poller.py` | Its three vendors (DeepSeek, NeverBounce, Apify) are all `check_kind = balance` rows the 6-hourly sweep already reads; `api_usage_state.deepseek` and `.apify` carry the sweep's exact values. `remaining_quota` is null on all 28 rows and NeverBounce carries no figure at all, so nothing only this job writes exists. |
| 16 | `api-usage-alerter.py` | Its outputs are `api_usage_state.last_status` and a log file. No `.select()` on `api_usage_state` exists in `src`, `api`, `compound` or any view, function or trigger. The monthly rollup is recomputed at read time by `meterMtd()` in `api/_spend.ts`. Retire on those grounds, not on "thresholds are null": all 28 rows carry thresholds and the job is evaluating them. |
| 17 | `ingest-events-gmail.py` | No `.from('events')` in `src` or `api`; the guest scout's `events` source reads `visibility_targets`. The two DB views over `events` have three ad-hoc calls between them in five months. Last gmail-sourced row 2026-09-03; the daily POST now returns 401. |
| 18 | `score-events.py` | Scores a table with no application reader. `events_for` has zero calls and `events_recommendable` two, both hand-written audits. `decision` and `outcome` are null on all 355 rows, so the scores have never driven a choice. Retire with 3.17 and section 2.11. |

### Gateway (14)

| # | Job | Evidence that nothing reads it |
|---|---|---|
| 19 | `oauth-refresh` | A second refresher for the same `tokens.json` the root crontab already refreshes every 6 hours. Retire the gateway entry only; `refresh_token.sh` stays while the host runs `sync-to-drive.py` and the 06:00 DRAFTS pull. This row is not migrated to GitHub: `api/_google.ts` mints a per-invocation service-account token and never touches that file. |
| 20 | `agatha-state-of-union` | No Drive doc on its cadence exists in the connected account since 2026-08-25; `api/_google.ts` has no Drive read function at all, so no route could open one. Its only durable output is its own `audit_log` row, and nothing writes or reads `state_of_union_sent` or `sotu_sent` anywhere. Stopped producing after 2026-09-16. Carries a pull-only breach; see 4.7. |
| 21 | `system-health` (gateway) | Every `system_health` row is the zero-AI `write-system-health.py`'s, rewritten every 15 minutes with identical `created_at` stamps, so anything this session wrote would be erased inside 15 minutes. Its own writes are unknown; see 5.3. |
| 22 | `vera-weekly-audit` | No `vera_audit` row of any type has ever landed at Friday 10:xx UTC; all 15 weekly rows sit at 11:00 UTC paired with an n8n `vera_audit_complete` event. Host report files exist for 2026-09-11 and 09-18 with no matching database row. |
| 23 | `bd-agent-daily-001` | `contacted_persons` holds 0 rows lifetime; `leads` has 0 created in 7 days and every recent row is the 08:00 Audience Sync. `/api/pilot-deals/monday` already drafts five warm approaches a week for the reopened advisory door, as Gmail drafts Krish sends. Do not port a LinkedIn-DM-as-Krish job; ARCH:2661 forbids it. |
| 24 | `enterprise-gigs-daily-001` | Retired 2026-07-10 with both its ventures. No `workflow_runs` row ever mentions gig or felix in the shape the old heartbeat used. Delete `/root/.openclaw/cron/runs/enterprise-gigs-daily-001.jsonl` rather than archiving it: the ALIGN scan lists it as carrying a plaintext credential. |
| 25 | `weekly-synthesis` | `suggestions` holds 0 rows; no `content_ideas` row has ever carried a bare `synthesis` source_type; `workflow_runs` shows no empty-`workflow_id` heartbeats in 30 days. Every Monday 11:00 to 12:30 write in six weeks belongs to n8n, Vercel or `cc-sync-engine`. |
| 26 | `content-engine-sweep2` | Marked LEGACY in ARCH:1787. No attributable output since 2026-06-01 in `content_ideas`, `weekly_briefs`, `audit_log` or `content_engine_runs`. Six live GitHub-side writers already create content proposals. Retire on that basis, not on "`/api/briefs/assemble` replaces it": assemble is the consumer, not a proposer. |
| 27 | `content-engine-sweep1` | Disabled. One line of evidence in the whole corpus (ALIGN:157). `suggestions` 0 rows; all 60 `content_ideas` rows in 7 days attribute to four other named jobs. |
| 28 | `Layer 1 Signal Inbox Check` | `zara_signals` has 0 Drive-sourced rows ever and none created since 2026-07-24; `content_ideas` has 0 rows with `source_type signal_inbox`; `audit_log` has 0 `signal_inbox_ingest` events. Its n8n twin has one execution ever, a DNS error. |
| 29 | `Arlo - Hourly Feedback Pickup` | Disabled 2026-06-01 after 1,237 runs hunting a script that was not at the cron's path. n8n Vera Feedback Aggregation consumes `feedback_queue` weekly (201 of 390 rows consumed, 13 audit events). Note the missing script sits in cold storage with an inline JWT at `cold/scripts-all/pickup_feedback.py`; route that to rotation. |
| 30 | `Arlo Autonomous OS Diagnostics Sentinel` | Runs the same script the root cron runs every 30 minutes at zero AI cost, four LLM sessions a day for a host watching itself. No reader in `src`, `api` or any Supabase object. |
| 31 | `Truth Reconciler Backstop` | `fleet_drift_report` holds 0 rows, ever; no view or function references it; `workflow_proposals` has never held an `agent_id` of `truth_reconciler`. Carry forward that the skill-map versus live-n8n drift check then has no owner anywhere; `/api/health/fleet-reconcile` does not read `fleet_skill_workflow_map_v1`. |
| 32 | `Silent Success Detector` (gateway) | Across all time the Monday 08:00 to 08:20 window holds three `silent_failures` rows, all `critical_infra_down`, and zero `silent_success` rows. Every `silent_success` row lands at 12:00, written by n8n `F6srw1yE9uH67q14`. |

---

## 4. Needs a ruling

Both sides are stated. Nothing here is picked.

### 4.1 The n8n execution cap (P1, R6, R8)

- **One side**: the wind-down rule on record says rehome the cap, prove it trips in a controlled test, then reassess, and until a cap exists somewhere else this host cannot be retired (AUDIT:126; LIVE:62-65, 342-344, 357; TAKEAWAY:135).
- **The other side**: the same decision table's absent-governor branch reads "The risk was theoretical, and retirement proceeds on the other evidence" (AUDIT:127), and after R6 there is no cap to rehome, only a counter: "The execution cap still does not exist anywhere. The governor now warns and never acts, which was the ruling, so nothing caps n8n spend. That is a deliberate, known gap" (DECL:203-204). TAKEAWAY:131 instructs that both lines be reported and neither picked.
- **What building a cap would reverse**: R6 removed the TRIP branch on 2026-09-09 because it had never fired and, had it fired, would have deactivated 77 of 86 workflows with no saved record of what had been active and no path back (DECL:113-116). An acting branch needs a Ruling line, and the retained `CRITICAL_WHITELIST` (DECL:127-129) is the seed.
- **Verified 2026-09-20**: neither repo's `.github/workflows/` contains anything that counts n8n executions.

### 4.2 The `openclaw-vps` clock (R4 against R7)

- **One side**: R4, retire the VPS as orchestrator (AUDIT:3-6, LIVE:3-5; both paraphrase, the exact wording is unknown).
- **The other side**: R7, `openclaw-vps` stays a permanently declared surface (HNOW:92, FACTS:191).
- **Why it matters now**: `EXPECTED_CLOCKS` in `scripts/audit-harness.mjs` opens a finding past 48 hours, and `api/health.ts` lines 264 to 318 read `state/heartbeats.json` from GitHub and push a critical alert past 48 hours, which turns the Control Center sidebar dot red. The clock has been failing with a 401 since 2026-09-19T09:05Z, so this is live, not hypothetical.
- **Two ways to settle**: keep the name and have the governor Action post it (2.8), or declare a new clock, for example `n8n-governor-action`, and undeclare `openclaw-vps` from `EXPECTED_CLOCKS` and from `allowedClocks` in `record-machine-heartbeat.mjs:18`. The second needs a Ruling line because R7 called it permanent. No source resolves the pair (rulings.md Part 4 item 3).

### 4.3 The four personal-life agents (9 rows)

- **The ruling**: loz, steph, finno and maa were left entirely alone by ruling of 2026-09-09: not read, not listed, not catalogued (DECL:55-56; TAKEAWAY:215; FACTS:255). The two `maa` reminder jobs were disabled 2026-09-07 at Krish's request, and the re-enable commands are recorded at ARCH:200-201. Lauren's `loz` briefings are the one deliberate pull-only exception (ARCH:191-193).
- **The rows inside the boundary**: `fix_orphaned_briefings.py`, `loz_freshness_diagnostic.py`, `loz_signal_radar.py`, `verify_doc.py`, `briefing_and_send.py`, `loz-breaking-news-monitor`, `loz-news-briefing-9am`, `maa morning check-in`, `maa evening medication reminder`. Also the `loz` sandbox container, recorded as "not a leftover".
- **What a retirement forces**: these are host-only and unmirrored. Switching off the machine switches them off. Either the plan excludes the host until they are rehomed by Krish, or he rules on them. This map does not describe them further.
- **One known fault inside the boundary**: `verify_doc.py --auto-repair` crashes every 30 minutes on a missing `doc_of_day.json` (LIVE:200-202). Reported, not touched.

### 4.4 The gateway layer as a class (29 rows)

- **One side**: P2, nothing is switched off on inference; a read-only audit is run and its output read back first (AUDIT:51-52, 133; LIVE:340-341). `/root/.openclaw/cron/jobs.json` has never been read, so every gateway row in this map is built from names, cadences and downstream traces. Ten rows have unknown writes.
- **The other side**: these jobs spawn Claude Code agent sessions and spend real LLM tokens on a cadence (ARCH:1788), and the evidence in section 3 shows fourteen of them leaving no trace in any table, view, function, Drive folder or mailbox anyone reads.
- **The count is not reconciled**: 33 audited (LIVE:127), 45 reported by the heartbeat (HB:19), about 38 in ARCH:1771 (DECL:207).
- **The settling command is one listing**, section 5.12, and it settles ten rows at once.

### 4.5 The 28 Identity and Action Google Docs  SETTLED 2026-09-20

**Ruling (Krish, 2026-09-20): he does not open them.** That was the one thing no
code could settle, and it closes this item and the half of 2.7 that depended on
it. `render-identity.py` retires with `sync-to-drive.py`'s identity leg; no
Vercel cron is built to replace the mirror. The docs mirror Supabase, which is
already the source of truth, so nothing is lost that is not still in a table.
The 28 documents themselves are left in Drive and not deleted: the ruling is
that nobody reads them, which is a reason to stop writing them and not a reason
to destroy them. Both sides of the old question are kept below as the record.

### 4.5 The 28 Identity and Action Google Docs

- **One side**: no code reads them. `api/agents/[name].ts` is the only reader of `google_drive_sync` and has no caller; none of the 28 doc ids appears in any repo; the 14 `agent_plans.doc_link` values point at folders or at a document id absent from `google_drive_sync`, so the ten n8n workflows that put "Plan doc: <url>" in a prompt are not reading these docs. The docs mirror Supabase, which is already the source of truth (ARCH:992).
- **The other side**: whether Krish opens them by hand is unknown and cannot be settled from code. If he does, the render is one Vercel cron on `api/_google.ts` using `google_drive_sync.folder_id` (2.7, option B).
- **What would settle it**: Krish saying so, or a Drive `files.get` on the 28 doc ids with `fields=viewedByMeTime,modifiedTime`.

### 4.6 The attend lane (`events`)  SETTLED 2026-09-20

**Ruling (Krish, 2026-09-20): "nope but I like that feature so have it fixed and
more antifragile."** The lane ships. It does not, however, stay as it was: 355
rows with a null `decision` and a null `outcome` on every one is a lane that has
never learned anything from a single event, and it went quiet on 2026-09-09 with
nobody noticing for eleven days.

Done the same day, in control-center migration `20260920100000`: the lane joins
the one intake as the `events_attend` source rather than staying a private table
with its own credential and no watcher, and the fault that hid its death is
fixed for every source rather than for this one. Each source now declares how
often it should produce, `intake_source_health` computes the verdict at read
time, and an overdue source becomes a named `source_went_quiet` hand-off row.
Four other live sources turned out to be silently quiet the moment it was
switched on, one of them for 31 days.

Still owed, and it is step 7 of the order: the discovery itself runs on the host
and 401s. Porting it off is what makes the source produce again. Both sides of
the old question are kept below as the record.

### 4.6 The attend lane (`events`), where the two lenses disagreed

- **One side (something already does this)**: nothing on any surface writes `events`, the read path already exists in the database, and `visibility_targets` is a press and podcast register, not a substitute. Port the discovery rather than lose the only event sourcing (keep_until_ported).
- **The other side (load-bearing)**: no application reader exists, the two views over `events` have three ad-hoc calls in five months, `decision` and `outcome` are null on all 355 rows, and the lane has been 401-ing daily since 2026-09-09. Retire all three jobs and the four schema objects.
- **Krish decides whether the attend lane ships.** If it does, section 2.11 applies; if not, rows 3.17, 3.18 and this one retire together.

### 4.7 Pull-only pushes still firing (R1)

- **The ruling**: the OS never initiates contact; there is no Telegram alerting, no push, no "ping Krish when X" (ARCH:140-143), with the single deliberate exception of Lauren's `loz` briefings (ARCH:191-193).
- **What the evidence shows**: `agatha-state-of-union`'s own `audit_log` rows claim four consecutive Telegram deliveries to chat 6773796504 (2026-09-11, 09-14, 09-15, 09-16), the same chat the n8n weekly's Telegram node was disabled from reaching. The n8n System Cost Advisor still posts to Telegram weekly.
- **Two readings**: either these are a pull-only breach to close in the same change, or they are unconfirmed delivery claims by an agent, which ARCH:212-214 already rules against separately ("must not claim delivery unless the tool confirmed it").
- **Either way it is a change needing its own approval.** Reported, not acted on.

### 4.8 Re-enabling the Vera auditor node

- Gates section 2.5. The node has been `disabled: true` since 2026-09-06T20:37:58Z with no note, and nobody noticed because `workflow_health` reads healthy. Re-enabling it is a mutation of live n8n, needs its own approval, and must be preceded by moving three inline credential values out of the node and rotating them.
- Until it is re-enabled, `vera_gaps` is starved and the Friday cycle routes nothing, whether it runs on the VPS or on Vercel.

---

## 5. Unknown

Eleven rows the repositories say nothing useful about, each with the one host command that would settle it. All are read-only. Run them from LORIMER over `ssh openclaw`, and mask any line that would print a credential.

| # | Job | The one command |
|---|---|---|
| 1 | `fireflies-biweekly-pull.sh` (Mon and Thu 09:00 UTC) | `cat /root/.openclaw/workspace-ops/scripts/fireflies-biweekly-pull.sh; tail -50 /tmp/fireflies-pull.log` . Nothing on the GitHub side pulls Fireflies except the `krishanraja/AEO-Engine` weekly Action, which has been silent since 2026-09-08 against a weekly expectation, and that repo is not reachable from this session. |
| 2 | `gmail-monitor` (gateway, three sessions a weekday) | `jq '.jobs[] \| select(.name\|test("gmail"))' /root/.openclaw/cron/jobs.json` plus the last three run logs. No `audit_log` row has ever carried a gmail, inbox or triage actor; the mailbox has two user labels and zero starred threads in 60 days, so a Gmail label or star is the only output a database check cannot see. |
| 3 | `system-health` (gateway, 0 14 ET) | `jq '.jobs[] \| select(.name=="system-health")' /root/.openclaw/cron/jobs.json` and the last run log. Its writes are unknown; its retire in 3.21 rests on cost and on the 15-minute table rewrite, not on proven duplication. |
| 4 | `context-archiver` (gateway, 0 3 ET) | `jq '.jobs[] \| select(.name=="context-archiver")' /root/.openclaw/cron/jobs.json` plus one night's output under the workspace archive path. The row's own source records the writes as presumed. If it only deletes temp files and logs, retire; if it writes curated memory or session summaries anywhere that outlives the host, it is a port. |
| 5 | `workspace_maintenance` (gateway duplicate) | The same `jobs.json` listing, with the payload field excluded. If the name is absent, the fix belongs at ARCH:1796 as a documentation correction, not a retirement; the 2026-09-09 listing printed 11 of 33 jobs, so its absence there proves nothing. |
| 6 | `vera-daily-audit` (gateway, 0 2 ET) | `cat /root/.openclaw/workspace/warm/agent-reports/vera-daily-2026-09-15.json` and a grep of the workspace for readers of that directory. No `vera_audit` row has ever landed at 06:00 UTC, and its named n8n replacement has been writing nothing since 2026-09-06. |
| 7 | `visibility-agent` (gateway, four sessions a week) | `jq '.jobs[] \| select(.name=="visibility-agent")' /root/.openclaw/cron/jobs.json` and the session log for 2026-09-14 13:00 UTC. Nothing attributable lands in `visibility_targets`, `contacted_persons`, `tasks` or the mailbox; the only trace anywhere is two April JSON reports in the cold archive. Note the three n8n workflows that share this surface are all broken for separate reasons. |
| 8 | `content-scout` (gateway, cadence unknown) | The same `jobs.json` listing. One line of evidence exists for this job (ALIGN:156). `suggestions` is empty and every `content_ideas` source in 7 days has a named Vercel or n8n producer. |
| 9 | `newsletter-draft` (gateway, Wednesday) | `jq '.jobs[] \| select(.name=="newsletter-draft")' /root/.openclaw/cron/jobs.json`, for its target table or Drive folder. No newsletter-shaped writer exists on the GitHub side; `/api/briefs/assemble` is the internal Friday brief, and the n8n Content Factory is a webhook that produces Google Docs and never publishes. |
| 10 | `marketing-agent` (gateway, Wednesday) | `cat /root/.openclaw/workspace/warm/agent-reports/marketing-agent-2026-09-16.json`. Three consecutive Wednesday report files exist, so the job is live, and `warm/marketing-drafts/reddit-intel-*.md` and `seo-briefs-*.md` share those dates, but attributing them is inference. Its stated verdict is keep_until_ported at confidence 0.3 and the two lenses disagreed on whether the verdict should stay unknown. |
| 11 | `product-agent` (gateway, Monday) | `jq '.jobs[] \| select(.name\|test("product-agent|maya"))' /root/.openclaw/cron/jobs.json`. The n8n Status Update Receiver says the VPS sends `product-agent` as the descriptive id for the roster slug `priya`, who was retired 2026-09-14; `product_health` has had no row since 2026-09-13 and two consumer webhooks are armed with no producer and zero executions ever. |

Unknowns that are not whole rows, listed so they are not lost:

- **Script bodies.** Ten root-cron scripts are in no repository and were never read: `arlo-daily-contradiction-audit.sh`, `vera-contradiction-audit.sh`, `workspace_maintenance.sh`, `fire-pending-flags.py`, `cc-sync-engine.sh`, `cc-doc-creator.sh`, `write-system-health.py`, `api-credit-monitor.sh`, `api-balance-poller.py`, `api-usage-alerter.py`. Each retire in section 3 rests on reader-side evidence rather than on the script. `sed -n '1,120p'` on each, with credential lines masked, closes the gap.
- **Which 02:30 line calls `render-plan.py`.** Both `regenerate-standards-digest.py` and `vera-nightly-quality-loop.sh` are on 02:30 and `render-plan.py` has no line of its own. `grep -l render-plan /root/.openclaw/workspace/scripts/*.py /root/.openclaw/workspace-ops/scripts/*.sh` settles it, and section 2.4 waits on it.
- **`/etc/cron.d/vera-audit`**, dated 2026-06-09, contents unknown, may schedule a second copy of `vera-n8n-audit.js`. `cat` it before retiring row 3.4.
- **Whether `deliver_gate.py` reads the table or the digest** (row 3.3). Both are host-only, so it does not change the verdict.

---

## 6. Retirement order

Each step names the precondition it waits on. No step is an instruction to act; each needs its own approval at the time (P10), runs from LORIMER (R9), and is preceded by a fresh read-only audit because a stale diagnostic snapshot is not truth (ARCH:1639).

1. **Read `/root/.openclaw/cron/jobs.json` and the ten unread script bodies.** Waits on: nothing. Settles ten gateway rows (section 5) and lifts the inference under eighteen root-cron retires. This is P2 and it is the only step with no precondition.
2. **Rotate the credentials the map surfaced, and fix the three jobs already failing on 401.** Waits on: step 1 for the full file list. Covers `SUPABASE_SERVICE_KEY` across the roughly 25 live host files (P6), the `sbp_` PAT in `credentials/supabase.env`, the repo-scoped GitHub token behind the heartbeat, the inline n8n API key in `vera-n8n-audit.js` and its `.bak` copy, the three inline values in the live Vera auditor node, the two n8n Anthropic credentials, the service-role JWT in the live "Control Center Live Sync" and Marcus nodes, and `system_config.hunter_google_oauth_refresh_token`, which sits in a table with an `anon` read policy. Until this lands, `ingest-events-gmail.py`, `discover-events.py` and `vps-heartbeat.sh` keep firing into a 401 and no port can be proved against a broken upstream.
3. **Build the cap, prove it trips, and post the heartbeat from it.** Waits on: the section 4.1 ruling and the section 4.2 clock ruling. Sections 2.1 and 2.8. This is P1, the precondition that blocks the machine, and it is a build rather than a move because R6 removed the acting branch.
4. **Port `write-system-health.py`, then `critical-infra-monitor.py`.** Waits on: step 3 for the budget number the health row carries. Sections 2.2 and 2.3, in that order and in the same window, because the two are coupled through the 24-hour freshness guard.
5. **Repair the broken GitHub-side owners.** Waits on: step 2. Re-enable the Vera auditor node (4.8) so `vera_audit` resumes, and confirm Marcus Daily Brief writes `top_three` daily for a week (2.9). Nothing downstream can be proved equivalent while its upstream is switched off.
6. **Port the four remaining writers.** Waits on: step 5. `vera-gap-cycle.sh` (2.5), `cc-doc-creator.sh` (2.6), the `api/health.ts` freshness reader (2.4), `monthly-all-hands` (2.10). Each proves itself by the readback named in its section, running in parallel with the VPS line.
7. **Take the two product decisions.** Waits on: Krish. The attend lane (4.6) and the 28 Identity and Action Docs (4.5). Their outcome decides whether `discover-events.py` is a port or a retire, and whether `render-identity.py` retires with `sync-to-drive.py`'s identity leg or the mirror moves to Vercel (2.7, 2.11).
8. **Stop the 32 retire rows.** Waits on: step 1 for the gateway half, and on nothing else for the cron half, except that `workspace_maintenance.sh` (3.5) goes last among them rather than first, because if it is what keeps the 4.7 GB `/root/.openclaw` tree from filling, stopping it early while other jobs still write to the same disk breaks them. Do the cleanup each row names in the same change: the `sync_queue` enqueue, the Flag modals, the `os-autonomous-diagnostics` crontab assertion, the n8n all-hands stub, the two armed Truth Reconciler webhooks.
9. **Move the host-only state.** Waits on: step 8, so nothing is still writing to it. P4. The 1.3 MB of markdown under `workspace*/memory/` and the three `MEMORY.md` files carry the meaning; the 77 MB of SQLite is derived index and does not migrate. Still host-only and in neither git nor Supabase: `openclaw.json` (the sole definition of 7 agents and 8 Telegram accounts), `cron/jobs.json`, `credentials/`, the Google OAuth tokens, the per-agent `auth-state.json` files, `skills/` with 87 archived entries, 2.3 GB of session history. The 122 active `standards_registry` rows are a separate reading job into the canon, not a file move.
10. **Settle the four personal-life agents.** Waits on: Krish (4.3). They are outside this map. The machine cannot be switched off while they run on it.
11. **Switch the host off.** Waits on: steps 3 through 10, and on a final read-only audit showing no writer still firing. Then remove or re-point `openclaw-vps` per the step 3 ruling, so the harness does not carry a permanent stale-clock finding.

---

## 7. Every row

62 rows. Verdict is the verified verdict; `held: false` is marked with an asterisk and its correction is in the section named. Confidence is the row's own, 0 to 1. Equivalent is abbreviated; the full text is in the row.

### Root cron, 33 rows

| Job | Cadence | Verdict | GitHub-side equivalent | Conf | Checked by |
|---|---|---|---|---|---|
| `arlo-daily-contradiction-audit.sh` | daily 03:00 UTC | retire | none exact; fleet-reconcile and the n8n Vera auditor cover the n8n half | 0.55 | fable 5.1 |
| `vera-contradiction-audit.sh` | Mon 03:00 UTC | retire | none | 0.60 | fable 5.1 |
| `regenerate-standards-digest.py` | daily 02:30 UTC | retire | none | 0.85 | fable 5.1 |
| `vera-n8n-audit.js` | daily 08:00 UTC | retire | `/api/health/fleet-reconcile`, `0 */6` | 0.70 | fable 5.1 |
| `workspace_maintenance.sh` | daily 03:00 UTC | retire | none needed | 0.90 | fable 5.1 |
| `refresh_token.sh` + `sync-to-drive.py` | every 6h | retire | none for the outbound mirror | 0.70 | not checked |
| `fire-pending-flags.py` | every 2 min | retire | none; the UI still writes `pending_flags` | 0.85 | fable 5.1 |
| `cc-sync-engine.sh` | every 5 min | retire * (3.8) | three live n8n writers own the columns | 0.80 | fable 5.1 |
| `cc-doc-creator.sh` | every 15 min | port * (2.6) | none; the primitive exists in `api/_google.ts` | 0.60 | fable 5.1 |
| `poll_sync_queue.py` | every 5 min | retire | none needed | 0.90 | fable 5.1 |
| `render-identity.py` | every 15 min | keep_until_ported * (2.7) | none for the renderer; the blocker is its Drive reader | 0.90 | fable 5.1 |
| `vera-nightly-quality-loop.sh` | daily 02:30 UTC | keep_until_ported (2.4) | none for a daily stamp; port the reader | 0.60 | fable 5.1 |
| `cleo-drafts-export` | daily 06:00 UTC | retire | none needed | 0.90 | not checked |
| `inbox-decay.sh` | daily 08:00 UTC | retire | none calls the RPC | 0.75 | fable 5.1 |
| `fireflies-biweekly-pull.sh` | Mon, Thu 09:00 UTC | unknown * (5.1) | partial: the AEO-Engine weekly Action, silent since 09-08 | 0.40 | fable 5.1 |
| `token-spend-alert.sh` | daily 14:00 UTC | retire * (3.12) | `api/_meter.ts` plus `checkMoneyLines`; no absolute daily line | 0.90 | fable 5.1 |
| `os-autonomous-diagnostics.py --mode quick` | every 30 min | retire * (3.13) | none needed; subject is the host | 0.90 | fable 5.1 |
| `vera-gap-cycle.sh` | Fri 11:30 UTC | keep_until_ported (2.5) | none | 0.85 | fable 5.1 |
| `api-credit-monitor.sh` | daily 14:00 UTC | retire * (3.14) | `/api/health/connections-sweep`, `0 */6` | 0.70 | fable 5.1 |
| `n8n-exec-governor.py` | hourly | keep_until_ported (2.1) | partial: `/api/meter/n8n-sync` has the count, no thresholds | 0.90 | fable 5.1 |
| `critical-infra-monitor.py` | every 5 min | keep_until_ported * (2.3) | n8n `SXdHes0WwIovjPAB`, same RPC at `0 */3` | 0.65 | fable 5.1 |
| `api-balance-poller.py` | daily 03:00 UTC | retire | `/api/health/connections-sweep` | 0.75 | fable 5.1 |
| `api-usage-alerter.py` | hourly :20 | retire * (3.16) | `meterMtd()` at read time; sweep thresholds | 0.75 | fable 5.1 |
| `write-system-health.py` | every 15 min | keep_until_ported (2.2) | partial: sweep covers critical vendors only | 0.85 | opus 5 |
| `fix_orphaned_briefings.py` | hourly :15 | leave_alone_by_ruling | not assessed (R5) | 1.00 | not checked |
| `ingest-events-gmail.py` | daily 06:15 UTC | retire | none for `events` | 0.60 | opus 5 |
| `discover-events.py` | daily 06:45 UTC | keep_until_ported * (2.11, 4.6) | none | 0.60 | opus 5 |
| `score-events.py` | daily 07:00 UTC | retire | none | 0.60 | opus 5 |
| `loz_freshness_diagnostic.py` | 14:30, 19:30, 23:30 UTC | leave_alone_by_ruling | not assessed (R5) | 1.00 | not checked |
| `loz_signal_radar.py` | every 30 min | leave_alone_by_ruling | not assessed (R5) | 1.00 | not checked |
| `verify_doc.py --auto-repair` | :07 and :37 | leave_alone_by_ruling | not assessed (R5) | 1.00 | not checked |
| `vps-heartbeat.sh` | hourly :05 | keep_until_ported (2.8) | receiving half is already GitHub | 0.60 | opus 5 |
| `briefing_and_send.py` | 13:00, 18:00, 22:00 UTC | leave_alone_by_ruling | not assessed (R5) | 1.00 | not checked |

### Gateway, 29 rows

| Job | Cadence | Verdict | GitHub-side equivalent | Conf | Checked by |
|---|---|---|---|---|---|
| `oauth-refresh` | 11:30 ET weekdays | retire * (3.19) | none; the duplicate is the root cron refresher | 0.85 | opus 5 |
| `agatha-state-of-union` | 09:00 ET weekdays | retire * (3.20) | n8n weekly SOTU (Drive doc) plus Marcus (intel) | 0.55 | opus 5 |
| `gmail-monitor` | 13:00, 17:00, 21:00 UTC | unknown * (5.2) | none for triage | 0.55 | opus 5 |
| `system-health` | 14:00 ET | retire * (3.21, 5.3) | none confirmed | 0.75 | not checked |
| `context-archiver` | 03:00 ET | retire, unverified * (5.4) | none found | 0.90 | opus 5 |
| `workspace_maintenance` | 03:00 ET if it exists | unknown * (5.5) | none needed | 0.70 | not checked |
| `vera-daily-audit` | 02:00 ET | unknown * (5.6) | n8n auditor, whose work node is disabled | 0.75 | opus 5 |
| `vera-weekly-audit` | Fri 06:00 ET | retire * (3.22) | n8n auditor writes the weekly row, node disabled | 0.70 | fable 5.1 |
| `bd-agent-daily-001` | 10:00 ET weekdays | retire * (3.23) | `/api/pilot-deals/monday` | 0.60 | fable 5.1 |
| `enterprise-gigs-daily-001` | retired 2026-07-10 | retire | none needed | 0.90 | fable 5.1 |
| `visibility-agent` | 09:00 ET, 4 days | unknown, lean retire * (5.7) | three n8n workflows, all broken | 0.60 | fable 5.1 |
| `weekly-synthesis` | Mon 07:00 ET | retire * (3.25) | n8n Cleo Synthesis and Marcus Synthesis | 0.70 | fable 5.1 |
| `content-engine-sweep2` | Mon 07:00 ET | retire * (3.26) | six live content_ideas producers | 0.90 | fable 5.1 |
| `content-engine-sweep1` | unknown, disabled | retire * (3.27) | same six | 0.90 | fable 5.1 |
| Marcus Home Intelligence backstop | 16:30 UTC Mon, Wed, Fri | keep_until_ported * (2.9) | n8n Marcus Daily Brief, failing on 401 | 0.55 | fable 5.1 |
| Layer 1 Signal Inbox Check | 13:00 UTC Mon, Thu | retire * (3.28) | none reads that folder | 0.45 | fable 5.1 |
| `Arlo - Hourly Feedback Pickup` | hourly, disabled 2026-06-01 | retire | n8n Vera Feedback Aggregation, weekly | 0.90 | fable 5.1 |
| `monthly-all-hands` | 09:00 UTC, 28th to 31st | port * (2.10) | n8n stub, announcement only | 0.75 | fable 5.1 |
| Arlo Autonomous OS Diagnostics Sentinel | `25 */6` | retire * (3.30) | none needed; root cron runs it twice as often | 0.90 | opus 5 |
| `loz-breaking-news-monitor` | every 2h | leave_alone_by_ruling | not assessed (R5) | 1.00 | not checked |
| `loz-news-briefing-9am` | 09:00 New York | leave_alone_by_ruling | not assessed (R5) | 1.00 | not checked |
| `content-scout` | unknown | unknown * (5.8) | none confirmed | 0.60 | opus 5 |
| `newsletter-draft` | Wednesday | investigate, hold the retire * (5.9) | none confirmed | 0.65 | opus 5 |
| `marketing-agent` | Wednesday | keep_until_ported * (5.10) | none found | 0.30 | opus 5 |
| `product-agent` | Monday | unknown, leaning retire * (5.11) | none; the consumers are webhooks with no producer | 0.30 | opus 5 |
| Truth Reconciler Backstop | Sun 07:05 | retire * (3.31) | `/api/health/fleet-reconcile`, partial only | 0.85 | opus 5 |
| Silent Success Detector | Mon 08:05 | retire | n8n `F6srw1yE9uH67q14`, `0 */8` | 0.80 | opus 5 |
| `maa morning check-in` | morning, disabled 2026-09-07 | leave_alone_by_ruling | not assessed (R5) | 1.00 | not checked |
| `maa evening medication reminder` | evening, disabled 2026-09-07 | leave_alone_by_ruling | not assessed (R5) | 1.00 | not checked |

Counts by verdict: 32 retire, 12 port or keep_until_ported, 9 unknown or hold, 9 leave alone by ruling. Total 62.

Two rows sit in a different section from their verdict, and the reason is stated where each appears. `marketing-agent` carries keep_until_ported at confidence 0.30 with unknown writes, so it is actioned in section 5.10 (read the report file) rather than in section 2, and the two lenses disagreed on whether the verdict should have stayed unknown. `discover-events.py` carries keep_until_ported, and its port in section 2.11 is conditional on the attend-lane ruling in 4.6; if the lane is dropped it retires with rows 3.17 and 3.18.
