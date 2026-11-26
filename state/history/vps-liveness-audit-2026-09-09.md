# OpenClaw VPS liveness audit, 2026-09-09

Read-only audit of `openclaw-vps` run over `ssh openclaw` on 2026-09-09, in
answer to the 2026-09-09 ruling that the VPS be retired as orchestrator on the
grounds that it is barely checked. Nothing was started, stopped, enabled,
disabled, installed, edited or deleted. Every command was a read.

Method note: the command block in `docs/harness/VPS-AUDIT.md` assumes a root
shell. The ssh user is `krish` (uid 1001) with passwordless sudo, and
`/root/.openclaw` is root-owned, so each section was piped through
`ssh openclaw 'sudo bash -s'` instead of run directly. No other change.

## Headline

The premise is wrong. The machine is not idle and it is not close to idle.

| Question | Answer |
|---|---|
| Is `n8n-exec-governor.py` live? | **Yes.** Hourly, ran 11:00:01Z today, `dry=False` |
| Is `critical-infra-monitor.py` live? | **Yes.** Every 5 minutes, ran 11:25:02Z today |
| Does `/root/.openclaw` exist? | **Yes.** 4.5 GB, root-owned, modified 11:20 today |
| Is the machine doing work? | Yes. 31 root cron entries plus 33 OpenClaw gateway jobs, nearly all with fresh logs |
| Uptime | 196 days |

## 1. The spend governor is live, and it is the blocking finding

```
/root/.openclaw/workspace/scripts/n8n-exec-governor.py      8056 bytes  modified 2026-09-06 21:33
/root/.openclaw/workspace/scripts/critical-infra-monitor.py 4259 bytes  modified 2026-09-06 21:33
```

Root crontab:

```
0 * * * *   /usr/bin/python3 .../n8n-exec-governor.py      >> /var/log/n8n-governor.log
*/5 * * * * /usr/bin/python3 .../critical-infra-monitor.py >> /var/log/critical-infra-monitor.log
```

`/var/log/n8n-governor.log`, last written 11:00 today, unbroken hourly across
the whole sampled window:

```
[2026-09-09T10:00:02Z] cycle=2026-09-01 count=1667 (+2)  projected=5942 warn@7000 trip@8000 dry=False
[2026-09-09T11:00:01Z] cycle=2026-09-01 count=1680 (+13) projected=5959 warn@7000 trip@8000 dry=False
```

State file `scripts/n8n-governor-state.json`, written 11:00 today:

```json
{"cycle_start":"2026-09-01T00:00:00+00:00","count":1680,
 "last_seen":"2026-09-09T11:00:00.141Z","warned":false,"tripped":false}
```

This is not a heartbeat with no substance behind it. The counter advances by a
real, varying delta each hour, the projection recomputes, and `dry=False` means
a trip would actually deactivate workflows. The script's own docstring states
the design intent: it lives on the VPS precisely because that is outside the n8n
execution budget and therefore cannot be starved when n8n nears its cap. WARN at
7,000, TRIP at 8,000, with a `CRITICAL_WHITELIST` covering Stripe, Approval,
Error Monitor, Orchestrator, Control Center Live Sync, Status Update Receiver
and Critical Infrastructure Monitor.

Consequence, stated plainly: **switching off this VPS today removes the only cap
on n8n execution spend.** Per the decision table in `docs/harness/VPS-AUDIT.md`,
retirement is blocked until that cap is rehomed and proven working elsewhere.

`critical-infra-monitor.py` is equally live, logging `OK: all critical infra
healthy` every five minutes through 11:25:02Z today.

## 2. The filesystem contradiction is settled

`/root/.openclaw` exists. `drwx------ 35 root root`, modified 11:20 today,
**4.5 GB**. The earlier session's conclusion that it no longer exists was wrong,
most likely because it was checked without sudo from the `krish` account, where
the directory is unreadable and can look absent. The Supabase `learning_events`
rows pointing at `/root/.openclaw/...` are correct.

Layout by size:

```
2.3G  agents/          1.7G  browser/          350M  workspace/       98M   memory/
90M   media/           28M   workspace-ops/    24M   npm/             8.7M  cron/
6.8M  skills/          6.6M  workspace-loz/    860K  workspace-finno/
328K  workspace-cleo/  228K  workspace-steph/  164K  workspace-maa/
72K   telegram/        64K   credentials/
```

## 3. Every schedule on the box

**Root crontab: 31 active entries** (plus commented-out ones). The checked-in
snapshot at `control-center/scripts/cron/crontab.txt` is **12 lines** and is
badly stale, in both directions:

- It omits the governor, the infra monitor, `api-balance-poller.py`,
  `api-usage-alerter.py`, `write-system-health.py`, the whole events pipeline
  (`ingest-events-gmail`, `discover-events`, `score-events`), the Loz jobs
  (`fix_orphaned_briefings`, `loz_freshness_diagnostic`, `loz_signal_radar`,
  `verify_doc`), `os-autonomous-diagnostics.py`, `vera-gap-cycle.sh`,
  `fireflies-biweekly-pull.sh`, `token-spend-alert.sh`, `api-credit-monitor.sh`
  and `inbox-decay.sh`.
- It also mis-states one it does carry: the snapshot says `poll_sync_queue.py`
  runs **every minute**; the live crontab runs it **every 5 minutes**.

Do not plan a retirement from that snapshot. It describes a machine that no
longer exists.

Live root crontab, grouped by cadence:

| Cadence | Jobs |
|---|---|
| every 2 min | `fire-pending-flags.py` |
| every 5 min | `cc-sync-engine.sh`, `poll_sync_queue.py`, `critical-infra-monitor.py` |
| every 15 min | `cc-doc-creator.sh`, `render-identity.py`, `write-system-health.py` |
| every 30 min | `os-autonomous-diagnostics.py --mode quick`, `loz_signal_radar.py` |
| 7 and 37 past | `verify_doc.py --auto-repair` (added 2026-09-09) |
| hourly | **`n8n-exec-governor.py`**, `api-usage-alerter.py` (:20), `fix_orphaned_briefings.py` (:15) |
| 6-hourly | Google token refresh then `sync-to-drive.py` |
| daily | Arlo contradiction audit, standards digest, workspace maintenance, `vera-n8n-audit.js`, `inbox-decay.sh`, Cleo DRAFTS export, `api-credit-monitor.sh`, `token-spend-alert.sh`, `api-balance-poller.py`, events ingest/discover/score, `loz_freshness_diagnostic.py` (3x), Vera nightly quality loop |
| weekly | Vera contradiction audit (Mon), Vera gap cycle (Fri), Fireflies pull (Mon and Thu) |

**Other crontabs:** none. Only root has one.

**`/etc/cron.d`:** `e2scrub_all`, `.placeholder`, and `vera-audit` (2026-06-09).

**systemd timers:** 14, all stock Ubuntu (motd, apt-daily, logrotate, fstrim,
man-db and so on). No project timers. Zero root user-level timers.

**OpenClaw gateway cron: 33 jobs**, a scheduler entirely separate from the
system crontab, and entirely absent from the checked-in snapshot. Every one
reports `ok`. A sample with last-run ages at audit time:

```
loz-breaking-news-monitor   every 2h                       7m ago
Arlo Autonomous OS Diag     25 */6 * * *                   5h ago
loz-news-briefing-9am       0 9 * * * America/New_York     22h ago
agatha-state-of-union       0 9 * * 1-5                   22h ago
gmail-monitor               0 9,13,17 * * 1-5             14h ago
bd-agent-daily-001          0 10 * * 1-5                  21h ago
system-health               0 14 * * *                    17h ago
vera-daily-audit            0 2 * * *                      5h ago
context-archiver            0 3 * * *                      4h ago
Truth Reconciler Backstop   5 7 * * 0                      3d ago
Silent Success Detector     5 8 * * 1                      2d ago
```

Most run on `deepseek/deepseek-*`, a few on `anthropic/claude-*` and
`moonshot/kimi-k2.5`. Agents referenced: `ops`, `loz`, `main`.

**Running services:** `openclaw-gateway.service` (v2026.5.7, root user unit,
active), `caddy` (ports 80 and 443), `docker` and `containerd`, `ollama`
(127.0.0.1:11434), plus stock system services. Node listening on 127.0.0.1:18789
and :18791, pid 2060242, the gateway.

**Docker:** one container, `openclaw-sbx-agent-loz-4805770c`, image
`openclaw-sandbox:bookworm-slim`, up 4 months.

## 4. Real liveness, per log

Fifteen distinct project logs were written within the hour before the audit.
Sample of the freshest:

```
2026-09-09 11:27:04  /tmp/openclaw/openclaw-2026-09-09.log
2026-09-09 11:26:01  /var/log/openclaw-flags.log
2026-09-09 11:25:06  /tmp/cc-sync.log
2026-09-09 11:25:02  /var/log/critical-infra-monitor.log
2026-09-09 11:20:02  /var/log/api-usage.log
2026-09-09 11:15:04  /tmp/render-identity.log            (25.4 MB)
2026-09-09 11:15:02  /var/log/system-health.log
2026-09-09 11:15:02  /var/log/loz-orphan-sweep.log
2026-09-09 11:07:01  /var/log/loz-doc-integrity.log
2026-09-09 11:00:09  /var/log/loz-signal-radar.log
2026-09-09 11:00:01  /var/log/n8n-governor.log
2026-09-09 11:00:01  /var/log/os-autonomous-diagnostics.log
```

Content, not just timestamps:

```
openclaw-flags   [2026-09-09T11:26:01Z] Found 0 flags to fire
cc-sync          2026-09-09T11:25:01Z START sync-engine / END sync-engine
system-health    [2026-09-09T11:15:02Z] wrote 5 health rows; 1 not-healthy: [('DeepSeek Balance','degraded')]
os-diagnostics   status=OK findings=0 report=.../audits/os-diagnostics/latest.md
```

`system-health` is the strongest single piece of evidence that the box is
load-bearing: it writes five rows into Supabase every fifteen minutes and is
currently the thing reporting DeepSeek balance as degraded.

### Three jobs that fire into nothing

Reported because the honest answer is mixed, not uniformly green.

1. **`poll_sync_queue.py`** runs (syslog confirms cron fired it at 11:20:01 and
   11:25:01 today) but `/tmp/poll_sync.log` has not changed since **2026-08-24**,
   and its last content is a traceback ending `TimeoutError: The read operation
   timed out`. The job emits nothing on a normal run, so there is no positive
   evidence it does useful work, only evidence that it executes. This is the
   silent-success shape: not provably alive, not provably dead.
2. **`verify_doc.py --auto-repair`**, added to cron **today**, crashes on every
   run: `FileNotFoundError: .../workspace-loz/state/doc_of_day.json`. It has been
   firing every 30 minutes into an exception since it was added.
3. Five per-agent logs in `/tmp` (`cleo.w.log`, `arlo.w.log`, `leo.w.log`,
   `priya.w.log`, `zara.w.log`) all stop dead at **2026-08-29 09:50**, within
   seconds of each other. That is the rebrand day. Whatever wrote them stopped
   then and has not resumed.

## 5. Agent identity and brief files

`openclaw.json` defines **7 agents** in `agents.list`: `main`, `ops`, `cleo`,
`loz`, `steph`, `finno`, `maa`, each bound to its own workspace.

| Workspace | Size | IDENTITY.md | SOUL.md | MEMORY.md |
|---|---|---|---|---|
| `workspace` (main) | 350M | 230 b, 2026-05-20 | 9,961 b, 2026-05-27 | 7,703 b, 2026-08-29 |
| `workspace-ops` | 28M | 1,063 b, 2026-08-29 | 1,871 b, 2026-05-15 | 9,365 b, 2026-09-07 |
| `workspace-cleo` | 328K | 319 b, 2026-04-16 | 6,389 b, 2026-08-29 | 7,023 b, 2026-08-29 |
| `workspace-loz` | 6.6M | 872 b, 2026-04-23 | 2,494 b, 2026-04-23 | **107,621 b, 2026-09-04** |
| `workspace-finno` | 860K | 168 b, 2026-03-27 | 4,099 b, 2026-04-15 | 4,127 b, 2026-08-19 |
| `workspace-steph` | 228K | 206 b, 2026-03-24 | 1,457 b, 2026-03-24 | 900 b, 2026-06-10 |
| `workspace-maa` | 164K | 516 b, 2026-05-12 | 3,168 b, 2026-05-17 | 4,240 b, 2026-05-17 |

The four personal-life agents hold more than the three canonical files. Beyond
IDENTITY, SOUL and MEMORY they carry `AGENTS.md`, `USER.md`, `TOOLS.md` and
`HEARTBEAT.md`, and for maa a substantial personal set: `MEDICAL.md` (7,373 b),
`APPOINTMENTS.md`, `DOCTORS.md`, `QUESTIONS.md`, `PLAN.md`, `PATTERNS.md`.
Loz is a live working directory, 337 files, `delivered_stories.json` written
today and `MEMORY.md` at 105 KB updated 2026-09-04.

Also present: `/root/.openclaw/skills/` with 15 `agent-*` directories
(agatha, arlo, cleo, felix, hunter, kai, leo, marcus, maya, nell, nova, priya,
vera, zara, plus `agents-orchestrator`) and an `_archived/` folder holding 87
entries.

## 6. What exists only here, the migration risk list

**SQLite databases, none of which are mirrored anywhere known:**

```
51.7 MB  /root/.openclaw/memory/main.sqlite      2026-09-08
19.1 MB  /root/.openclaw/memory/ops.sqlite       2026-09-09
16.8 MB  /root/.openclaw/memory/loz.sqlite       2026-09-04
 8.2 MB  /root/.openclaw/memory/finno.sqlite     2026-08-19
 6.5 MB  /root/.openclaw/memory/cleo.sqlite      2026-04-15
 676 KB  /root/.openclaw/tasks/runs.sqlite       2026-09-09
 180 KB  /root/.openclaw/flows/registry.sqlite   2026-09-07
```

Note there is no `steph.sqlite` and no `maa.sqlite`; those two agents have
workspace files but no memory database.

**Other host-only state:**

- `/root/.openclaw/openclaw.json`, the only definition of the 7 agents and of 8
  Telegram bot accounts, with three historical backups beside it
  (`.last-good`, `.bak-spendfix`, `.clobbered.2026-05-14`).
- `/root/.openclaw/cron/jobs.json` and `jobs-state.json`, the only definition of
  the 33 gateway cron jobs. 8.7 MB of cron directory.
- `/root/.openclaw/credentials/` (64 KB) and
  `/root/.openclaw/integrations/google/tokens.json`, the OAuth refresh loop the
  six-hourly cron depends on.
- Per-agent `auth-state.json` under `/root/.openclaw/agents/<id>/agent/` for
  cleo, ops, main, finno, loz, maa.
- `scripts/n8n-governor-state.json`, the cumulative execution counter. Cheap to
  lose in the sense that it re-derives, but a reset counter means the cap
  silently restarts from zero mid-cycle.
- `/root/.openclaw/skills/` (6.8 MB) including `_archived/` with 87 entries.
- `/root/.openclaw/media/` (90 MB) and `/root/.openclaw/agents/` (2.3 GB) of
  session history.
- The four personal-life workspaces described above, in particular maa's medical
  set.
- `/root/Projects/control-center`, a clone last pulled at commit `db64a75a`
  (2026-08-29, PR #247), with an uncommitted working tree: the architecture doc
  shows as deleted at its old `MINDMAKER_` name and untracked at its new
  `MINDMAKE_` name. Nothing is lost by this, GitHub holds the canonical file,
  but the clone is 11 days behind main.

## 7. Telegram

Telegram is a first-class channel on this host, not a vestige.

`openclaw.json` -> `channels.telegram` carries `enabled`, `dmPolicy`,
`groupPolicy`, `streaming` and **8 accounts**: `default`, `loz`, `steph`,
`finno`, `ops`, `cleo`, `maa`, `agatha`. Each account holds a `botToken` field.
The `ops` account additionally has `allowFrom`. No token values were read or
printed.

`/root/.openclaw/telegram/` (72 KB) holds per-account `command-hash-*.txt` and
`update-offset-*.json` files. `update-offset-default.json` was last written
**2026-09-06**, so the default bot was still receiving updates three days ago.

Code and config referencing Telegram: `openclaw.json`, `cron/jobs.json`,
`plugins/installs.json`, `sessions.json` for all seven agents, and
`workspace-finno/active/build_control_center_v3.py` plus
`workspace-finno/active/crons.json`. The governor itself sends its WARN and TRIP
alerts through the `ops` Telegram account.

Environment variable **names** found (values never read):

```
TELEGRAM              TELEGRAM_BOT            TELEGRAM_CHAT
TELEGRAM_BODY         TELEGRAM_BOT_TOKEN      TELEGRAM_CHAT_ID
TELEGRAM_CHANNEL      TELEGRAM_SEND           TELEGRAM_STORIES
TELEGRAM_DISABLE_AUTO_SELECT_FAMILY   TELEGRAM_ENABLE_AUTO_SELECT_FAMILY
TELEGRAM_DNS_RESULT_ORDER             TELEGRAM_EOF / TELEGRAMEOF
```

The last four are Node runtime flags and shell heredoc markers, not credentials.

This sits awkwardly beside the PULL ONLY work, which recorded Telegram push as
killed across six layers. That was about the Vercel and Supabase fleet. On this
host Telegram remains configured and in use, and the spend governor's only alert
path runs through it.

## 8. Answers

**Is the spend governor live?** Yes. `n8n-exec-governor.py`, hourly in the root
crontab, last ran 11:00:01Z on 2026-09-09, `dry=False`, maintaining a real
cumulative counter at 1,680 executions against an 8,000 trip threshold.
Evidence: the cron line, the log with unbroken hourly entries and varying
deltas, and the state file written at the same minute.

**Is this machine doing work, or firing into nothing?** Doing work, with three
named exceptions. Fifteen project logs written in the last hour, 31 root cron
entries, 33 gateway cron jobs all reporting `ok`, a live gateway service, a
running sandbox container, and a health writer pushing five rows into Supabase
every fifteen minutes. The exceptions are `poll_sync_queue.py` (executes but
emits nothing since 2026-08-24, last output a timeout traceback),
`verify_doc.py` (crashes every 30 minutes on a missing state file, added today),
and five per-agent `/tmp` logs frozen at the 2026-08-29 rebrand.

**What exists only here?** The seven SQLite memory and task databases (103 MB
total), `openclaw.json` as the sole definition of 7 agents and 8 Telegram bot
accounts, `cron/jobs.json` as the sole definition of 33 gateway jobs, the
credentials and Google OAuth token store, per-agent auth state, the skills tree
with 87 archived entries, 2.3 GB of session history, and the four personal-life
agent workspaces including maa's medical set. None of it is in Supabase, none of
it is in git.

**What is safe to switch off, and what is not.** Nothing yet, and no retirement
order is proposed, because the governor question resolved the way that blocks
one. The sequence that has to come first is: rehome the execution cap, prove the
new cap trips in a controlled test, then reassess. Until that is done, this
machine is the only thing standing between a runaway n8n workflow and a bill
nobody sees coming.

Two things can be said about the far end of the list, without acting on them.
`ollama` (127.0.0.1:11434) and the `cups` snap services show no project
dependency in anything audited here and are the least entangled candidates
whenever a wind-down does start. The `openclaw-sbx-agent-loz` container has been
up four months and is the only container on the host, so it is not a leftover.

## 9. Follow-ups this audit surfaced

Recorded, not acted on.

1. The cap must move before anything is switched off, and be proven working.
2. `control-center/scripts/cron/crontab.txt` is 12 lines against 31 live entries
   and gets one cadence wrong. It should either be regenerated or deleted, since
   a stale snapshot is worse than none.
3. The checked-in snapshot does not know the OpenClaw gateway scheduler exists.
   33 jobs are invisible to anyone reading the repo.
4. `verify_doc.py` has been crashing every 30 minutes since it was added today.
5. `poll_sync_queue.py` produces no evidence of success. It needs a heartbeat
   line, or it cannot be reasoned about.
6. Five agent render logs stopped at the 2026-08-29 rebrand and nobody noticed
   for 11 days.
7. `sync-briefs-to-skills.sh` and `regenerate-standards-digest.py` still carry a
   hardcoded plaintext `service_role` JWT. Unrotated.
8. The VPS `control-center` clone is 11 days behind main with a dirty tree.
