# OpenClaw VPS migration, 14 Nov 2026

The OpenClaw fleet moved from the old VPS (`openclaw-vps`, Hetzner CPX21, Ashburn) to the worker
(Hetzner CPX32, Helsinki). Written by the migration session for the check described in control-center
`docs/audits/2026-11-14-fleet-integration/VPS-AND-MACHINES-HANDOVER.md` §8. **Read it, do not trust it:**
every "passed" below names the row or log line that proves it.

No credential, address, project reference, Drive id, email or private person's name is in this file.
Item ids (A1, B4, C3...) are `vps-inventory.md`'s.

## Rulings that shaped this (Krish, 2026-11-14)

- **Full switchover tonight, then delete the old box when satisfied.** This overrides the handover's
  one-job-at-a-time order and its 7-day wait before the old box ends. Every other rule held: nothing ran
  on both boxes at once, nothing was retired without a named yes, the old box is intact and only disabled.
- **Retired by name** (answer "defaults" to a list naming each, with the recommendation "retire all 12"):
  A10 gmail-monitor, A13 system-health job, A14 content-scout, A15 content-engine-sweep2, A17
  marketing-agent, A19 Silent Success backstop, A21 Fireflies sweep, B14 fire-pending-flags, B15
  poll_sync_queue, B18 fireflies-biweekly-pull, B21 vps-heartbeat, C5 Ollama.
- **Service-role key rotation:** deferred to after T+7d (the key now lives in one store, see Secrets).
- **Read-only deploy key** for the worker's control-center checkout: yes (added by Krish).
- **Stay on CPX32** (4 vCPU / 8 GB), with the fleet given a guaranteed memory floor instead of more RAM.
- **music-watcher:** install for the service user only, not in `fleet.yaml`, until Krish decides.

## T0, 2026-11-14

### Timeline (UTC)

| Time | Event |
|---|---|
| 16:30–18:00 | Read-only baseline of the old box (section 4 commands), saved on Krish's machine only |
| 19:40:57 | Attempt 1: old box stopped (gateway, crontab, jobs, web) |
| 19:50:07 | Attempt 1: worker live, 9 min 10 s after the stop |
| 19:56:01–19:56:26 | **Rollback** to the old box (see Failures) |
| 19:59:43 | Attempt 2: old box stopped |
| 20:08:02 | Attempt 2: worker live. **Bots down 8 min 19 s.** Tier-1 allowed gap: 30 min |
| 20:13:04–20:13:35 | Telegram proof (pending updates 0 after a message was sent) |
| 20:15–20:21 | First scheduled runs on the worker proven (table below) |

### Baseline (old box, read live 14 Nov)

- OpenClaw jobs: **43 defined, 21 enabled** (the 2026-09-20 file and the inventory say 22; Fireflies
  sweep A21 was already disabled on the box before the switchover, by something outside this session).
- Root crontab: **30 schedule lines** + `CRON_TZ=Europe/London`. `fireflies-biweekly-pull.sh` (B18) was
  already absent at switchover.
- Running fleet services: openclaw-gateway (root user unit), heartside-mobile-review, caddy, ollama, docker.
- Containers: 1, `openclaw-sbx-agent-loz-*`, **exited 137 five weeks ago**; created on demand by the gateway.
- Caddy site names: `controlcentre.krishraja.com` (its DNS does not point at the box, so it serves nothing),
  and the Heartside review board on an `sslip.io` name built from the host's address.
- Tier-1 last runs before cutover: A22 14 Nov 15:07 · A2 14 Nov 07:02 · A1 13 Nov 16:32 · A20 9 Nov 13:03 ·
  A9 13 Nov 16:32 · B1/B4/B7/B2 every 15/15/5/60 min through 19:59.
- Parity proven before cutover: worker job file **identical** to the live box (43 ids, enabled flags,
  schedules); worker crontab **identical line for line** (30 lines).

### Where everything runs now

Worker layout: OpenClaw 2026.5.7 on its own Node 22.22.1 (`/opt/node22`, the version the old box ran),
gateway as a **system** unit in `fleet.slice` (guaranteed `MemoryMin=1.5G`, `CPUWeight=400`), loopback
only (127.0.0.1/::1:18789 and :18791); root crontab runs inside `fleet.slice` via cron's drop-in. Claude
Remote Control (both accounts) is capped in `claude.slice` (4 GB, 3 cores) and cannot starve the fleet.

| Id | What | Old | New (worker) | Stopped old | Started new | First run on new | Evidence | Result | Longest gap |
|---|---|---|---|---|---|---|---|---|---|
| A1 | Marcus Home Intelligence Brief | enabled, Mon/Wed/Fri 16:30 UTC | enabled, same | 19:59:43 | 20:08:02 | due Mon 16:30 | `home_intelligence` version after Mon slot | not due yet | 0 slots missed so far |
| A2 | vera-daily-audit | enabled, 02:00 ET | enabled, same | 19:59:43 | 20:08:02 | due 15 Nov 07:00 | `vera_audit` row | not due yet | — |
| A3 | vera-weekly-audit | enabled, Fri 06:00 ET | enabled, same | 19:59:43 | 20:08:02 | due Fri | run row | not due yet | — |
| A4 | Arlo Vercel build check | enabled, 09:00 UTC | enabled, same | 19:59:43 | 20:08:02 | due 15 Nov 09:00 | run row | not due yet | — |
| A5 | revenue-finance-agent | enabled, Mon 08:00 ET | enabled, same | 19:59:43 | 20:08:02 | due Mon | run row | not due yet | — |
| A6 | bd-agent | enabled, weekdays 10:00 ET | enabled, same | 19:59:43 | 20:08:02 | due Mon | run row | not due yet | — |
| A7 | visibility-agent | enabled, Mon/Tue/Thu/Fri 09:00 ET | enabled, same | 19:59:43 | 20:08:02 | due Mon | run row | not due yet | — |
| A8 | monthly all-hands | enabled, 28–31 09:00 | enabled, same | 19:59:43 | 20:08:02 | due 30 Nov | run row | not due yet | — |
| A9 | oauth-refresh | enabled, weekdays 11:30 ET | enabled, same (host Google token moved with gog's login) | 19:59:43 | 20:08:02 | due Mon | run row | not due yet | — |
| A10 | gmail-monitor | enabled | **retired** (held disabled) | 19:59:43 | — | — | job disabled on worker | retired | — |
| A11 | context-archiver | enabled, 03:00 ET | enabled, same | 19:59:43 | 20:08:02 | due 15 Nov 08:00 | run row | not due yet | — |
| A12 | Layer 1 Signal Inbox Check | enabled, Mon/Thu 13:00 UTC | enabled, same | 19:59:43 | 20:08:02 | due Mon | run row | not due yet | — |
| A13 | system-health (gateway job) | enabled | **retired** | 19:59:43 | — | — | disabled | retired | — |
| A14 | content-scout | enabled | **retired** | 19:59:43 | — | — | disabled | retired | — |
| A15 | content-engine-sweep2 | enabled | **retired** | 19:59:43 | — | — | disabled | retired | — |
| A16 | weekly-synthesis | enabled, Mon 07:00 ET | enabled, same | 19:59:43 | 20:08:02 | due Mon | run row | not due yet | — |
| A17 | marketing-agent | enabled | **retired** | 19:59:43 | — | — | disabled | retired | — |
| A18 | pulse-weekly-ingest | enabled, Mon 06:00 ET | enabled, same | 19:59:43 | 20:08:02 | due Mon | run row | not due yet | — |
| A19 | Silent Success backstop | enabled | **retired** | 19:59:43 | — | — | disabled | retired | — |
| A20 | Weekly Token Spend Report | enabled, Mon 08:00 ET | enabled, same | 19:59:43 | 20:08:02 | due Mon | run row + sheet | not due yet | — |
| A21 | Fireflies sweep | **already disabled** at switchover | disabled (also retired) | — | — | — | baseline flag | retired | — |
| A22 | loz-news-briefing-9am (family) | enabled, 15:00 London | enabled, same | 19:59:43 | 20:08:02 | due 15 Nov 15:00 | one success row + Krish's copy | **channel proven**, run not due | bots down 8m19s |
| B1 | write-system-health.py | */15 | live | 19:59:43 | 20:08:02 | 20:15:03 | 5 `system_health` rows, `last_check` 6.2 min old at 20:21 | **passed** | 15 min |
| B2 | api-usage-alerter.py | :20 hourly, **crashed every run** (Py 3.10 isoformat) | live, **now works** (Py 3.14) | 19:59:43 | 20:08:02 | 20:20:02 | log "evaluated 28 APIs"; `api_usage_state` 1.2 min old | **passed** | 60 min |
| B3 | api-balance-poller.py | 03:00 | live | 19:59:43 | 20:08:02 | due 15 Nov 03:00 | `api_usage_state` | not due yet | — |
| B4 | openclaw-runs-to-cc.py | */15 | live | 19:59:43 (final run 19:59:44) | 20:08:02 | 20:15:01 | log `inserted=0` (no agent run since) | **passed** (insert proof at first agent run) | 15 min |
| B5 | render-identity.py | */15 | live | 19:59:43 | 20:08:02 | 20:15 | log "13/13 agents rendered" | **passed** | — |
| B6 | regenerate-standards-digest.py | 02:30 | live | 19:59:43 | 20:08:02 | due 02:30 | log | not due yet | — |
| B7 | cc-sync-engine.sh | */5 | live | 19:59:43 | 20:08:02 | 20:10 | log `END sync-engine`; pre-cutover test: "3 updates, 0 errors" | **passed** | 10 min |
| B8 | n8n-exec-governor.py | hourly :00 | live | 19:59:43 | 20:08:02 | due 21:00 | log | not due yet (gap ≤ 2 h) | — |
| B9 | critical-infra-monitor.py | */5 | live | 19:59:43 | 20:08:02 | 20:15:02 | "OK: all critical infra healthy" | **passed** | — |
| B10 | os-autonomous-diagnostics.py | */30 | live | 19:59:43 | 20:08:02 | due 20:30 | log | not due yet | — |
| B11 | vera-nightly-quality-loop.sh | 02:30 | live | 19:59:43 | 20:08:02 | due 02:30 | log | not due yet | — |
| B12 | vera-gap-cycle.sh | Fri 11:30 | live | 19:59:43 | 20:08:02 | due Fri | log | not due yet | — |
| B13 | vera-contradiction-audit.sh; vera-n8n-audit.js | Mon 03:00; 08:00 (**broken on old box**: node path) | live, unchanged (still broken: parity, not repaired) | 19:59:43 | 20:08:02 | due | log | not due yet | — |
| B14 | fire-pending-flags.py | */2 | **retired** (line held) | 19:59:43 | — | — | 0 runs in cron journal | retired | — |
| B15 | poll_sync_queue.py | */5 | **retired** | 19:59:43 | — | — | 0 runs | retired | — |
| B16 | inbox-decay.sh; workspace_maintenance.sh | 08:00; 03:00 | live | 19:59:43 | 20:08:02 | due | log | not due yet | — |
| B17 | api-credit-monitor.sh; token-spend-alert.sh | 14:00 | live | 19:59:43 | 20:08:02 | due 15 Nov 14:00 | log | not due yet | — |
| B18 | fireflies-biweekly-pull.sh | **already absent** at switchover | absent (also retired) | — | — | — | baseline crontab | retired | — |
| B19 | Cleo DRAFTS export | 06:00 (**writes a Google HTML page**) | live, unchanged (parity) | 19:59:43 | 20:08:02 | due 06:00 | file | not due yet | — |
| B20 | events scripts | 06:15/06:45/07:00 (**HTTP 401 daily**; Vercel replaced them 24 Sep) | live, unchanged (parity) | 19:59:43 | 20:08:02 | due | log | not due yet | — |
| B21 | vps-heartbeat.sh | hourly (token rejected since 19 Sep) | **retired** | 19:59:43 | — | — | 0 runs | retired | — |
| B22 | family scripts | called by A22, not scheduled | moved with the workspace | — | — | with A22 | A22 run | not due yet | — |
| B23 | control-center fast-forward | hourly :17, read-write key | live, **read-only** key | 19:59:43 | 20:08:02 | 20:17 | HEAD moved to 19:58:05 commit; push refused (tested) | **passed** | — |
| — | openclaw-keyctl (3 lines, London) | 14:30, 15:45, 16:45 | live; patched to drive the system unit (`--user` removed) | 19:59:43 | 20:08:02 | due 15 Nov 14:30 | log | not due yet | — |
| C1 | OpenClaw gateway | root user unit, loopback | system unit, `fleet.slice`, loopback | 19:59:43 | 20:08:02 | 20:08:01 ready | journal "[gateway] ready", both Telegram + Discord providers started, no 409 | **passed** | 8m19s |
| C2 | Agent workspaces + skills | /root/.openclaw | same paths; key redacted from 192 files; `workspace/temp` + `tmp` left behind | — | — | — | file count 15,366 = 15,366 | **passed** | — |
| C3 | Docker + family sandbox | image 790 MB, container exited | image moved (`docker load`), container created on demand | — | — | at A22 | `docker images` | moved | — |
| C4 | Caddy (80/443) | 2 sites | same 2 sites; Heartside on the worker's `sslip.io` name; 80/443 opened | 19:59:43 | 20:08:02 | 20:08 | `caddy validate`, service active | moved (**Heartside address changed**) | — |
| C5 | Ollama | running, idle | **retired** (not installed) | 19:59:43 | — | — | — | retired | — |
| C6 | ufw, fail2ban, swap | 2 GB swap | worker: ufw (22, 80, 443), fail2ban, 4 GB swap, set before any service | — | — | — | `ufw status` | **passed** | — |
| C7 | The clock (`/opt/vps-clock`) | **LIVE** (inventory said inert: it ran every 5 min and dispatched `compound-daily.yml`) | live, with its token env and dispatch **state** moved (so no slot re-fires) | 19:59:43 | 20:08:02 | silent until 06:30 slot | `state.json` copied | moved, proof at 06:30 | — |
| C8 | Inbound webhooks | none | none | — | — | — | — | n/a | — |
| C9 | Service-role key in host files | 1,619 files | **0** outside the store | — | — | — | count below | **passed** | — |
| C10 | content-engine | reference | reference | — | — | — | — | n/a | — |

```json
{"report":"T0","date":"2026-11-14","stop_old":"19:59:43Z","start_new":"20:08:02Z","gap_minutes":8.3,
 "items":[
 {"id":"A1","new":"enabled","result":"not_due"},{"id":"A2","new":"enabled","result":"not_due"},
 {"id":"A3","new":"enabled","result":"not_due"},{"id":"A4","new":"enabled","result":"not_due"},
 {"id":"A5","new":"enabled","result":"not_due"},{"id":"A6","new":"enabled","result":"not_due"},
 {"id":"A7","new":"enabled","result":"not_due"},{"id":"A8","new":"enabled","result":"not_due"},
 {"id":"A9","new":"enabled","result":"not_due"},{"id":"A10","new":"retired","result":"retired"},
 {"id":"A11","new":"enabled","result":"not_due"},{"id":"A12","new":"enabled","result":"not_due"},
 {"id":"A13","new":"retired","result":"retired"},{"id":"A14","new":"retired","result":"retired"},
 {"id":"A15","new":"retired","result":"retired"},{"id":"A16","new":"enabled","result":"not_due"},
 {"id":"A17","new":"retired","result":"retired"},{"id":"A18","new":"enabled","result":"not_due"},
 {"id":"A19","new":"retired","result":"retired"},{"id":"A20","new":"enabled","result":"not_due"},
 {"id":"A21","new":"disabled","result":"retired","note":"already disabled before switchover"},
 {"id":"A22","new":"enabled","result":"not_due","proof":"telegram pending_updates 0 after inbound message 20:13Z"},
 {"id":"B1","first_run":"20:15:03Z","result":"passed","proof":"system_health last_check 6.2 min at 20:21Z"},
 {"id":"B2","first_run":"20:20:02Z","result":"passed","proof":"api_usage_state 1.2 min; alerter evaluated 28 APIs"},
 {"id":"B3","result":"not_due"},{"id":"B4","first_run":"20:15:01Z","result":"passed","proof":"inserted=0, no agent run since"},
 {"id":"B5","first_run":"20:15Z","result":"passed"},{"id":"B6","result":"not_due"},
 {"id":"B7","first_run":"20:10Z","result":"passed"},{"id":"B8","result":"not_due"},
 {"id":"B9","first_run":"20:15:02Z","result":"passed"},{"id":"B10","result":"not_due"},
 {"id":"B11","result":"not_due"},{"id":"B12","result":"not_due"},{"id":"B13","result":"not_due"},
 {"id":"B14","result":"retired"},{"id":"B15","result":"retired"},{"id":"B16","result":"not_due"},
 {"id":"B17","result":"not_due"},{"id":"B18","result":"retired","note":"already absent"},
 {"id":"B19","result":"not_due"},{"id":"B20","result":"not_due"},{"id":"B21","result":"retired"},
 {"id":"B22","result":"not_due"},{"id":"B23","first_run":"20:17Z","result":"passed"},
 {"id":"C1","result":"passed"},{"id":"C2","result":"passed"},{"id":"C3","result":"moved"},
 {"id":"C4","result":"moved","note":"Heartside address changed"},{"id":"C5","result":"retired"},
 {"id":"C6","result":"passed"},{"id":"C7","result":"moved","note":"live, not inert; proof at 06:30Z"},
 {"id":"C8","result":"n/a"},{"id":"C9","result":"passed","key_files_outside_store":0},{"id":"C10","result":"n/a"}]}
```

### Secrets

- **How secrets reached the worker:** streamed host-to-host through Krish's laptop (never written to its
  disk) into a root-only import area, then placed in a root-only store outside `/root`
  (`/etc/worker/secrets.d/openclaw/`: `gateway.env`, a full `TOOLS.md`, `credentials/`). The workspace's
  `credentials/` is a link into the store; the workspace `TOOLS.md` has the key replaced by an
  instruction to use the `SUPABASE_SERVICE_KEY` environment variable, which the gateway provides. Six
  scripts that parsed `TOOLS.md` for keys now read the store's copy (one-line path change each).
- **Files under `/root`, `/home`, `/opt`, `/usr/local`, `/etc` (store excluded) holding the service-role
  key's value: 0** (measured with `grep -rlF` on the value, never printed; 192 text files redacted). The
  import area was deleted after staging.
- **Rotation:** asked; Krish deferred it to after T+7d.
- Other secrets (both Telegram bot tokens, Discord, LLM keys, gateway token) still sit **inline in
  `openclaw.json`**, as on the old box. Not changed during the move; listed as follow-up.

### Installs

- **Codex:** `codex login status` → "Logged in using ChatGPT" for the service user (`auth.json` owner-only,
  600). One login, shared by both Claude accounts and the Codex desktop app (Remote SSH as the service user,
  which has no sudo). Not copied from anywhere. The old box's Codex login was signed out.
- **The two Claude accounts:** each logged in separately (claude.ai, Max), each with its own config
  directory and its own Remote Control server; each reaches the box from its own Claude app. No credential
  was copied between users or machines. No inbound port opened for them.
- **content-watcher** (machine `cloud-vps`, `filing: engine`): `doctor` → "Ready to run the watcher"; tests OK;
  a local `read` wrote `read.json` + `read.md`. **Switched on 2026-11-14 21:14:02Z** (every minute, like the home
  task). Its engine key came from the laptop's Credential Manager straight into a root-only file, never printed;
  no Apify key is held (`CONTENT_WATCH_APIFY_VIA_ENGINE=1`). **Drops** (Production/Content Inspo) reach it through a
  read-only, new-files-only Drive mirror, switched on 21:45:53Z; its first pass reported `drop.held: 2` (both
  recent drops already read by a home computer, so not read again). The home computers' task is untouched.
- **music-watcher** (`trackcard`, stems + loudness): tests **85 passed** after declaring the undeclared
  `matplotlib` (music-watcher #1); a card with Demucs stem activity written on CPU. New: **Music Inspo watcher**
  (music-watcher #2, merged): every 15 min, each new drop in Drive's Music Inspo becomes a card in
  `taste/inspo/` on one rolling PR. End-to-end on the folder's first drop (a Spotify link): measured with stems in
  5 min 25 s from a SoundCloud recording within 6 s of Spotify's length → music-watcher #3, awaiting Krish.
  Switched on 21:45:53Z.
- Both repositories' `AGENTS.md` now tell any session to use the worker by default (content-watcher #33,
  music-watcher #1).

## Handback to the OS session (2026-11-14)

What the worker now offers the OS, so the OS session can use it without asking:

- **Reach it:** `ssh worker` (admin), `ssh worker-codex` (the service user, for Codex), `ssh worker offload '<cmd>'`
  (a heavy job as the service user inside the Claude budget). From the Claude app or claude.ai, pick the **worker**
  environment (both accounts). Cloud sessions cannot reach it (outbound SSH is blocked there).
- **What runs there:** the whole OpenClaw fleet (15 jobs, 27 cron lines, family bots, clock, Heartside), Claude
  Remote Control for both accounts, the one cloud Codex login, content-watcher as `cloud-vps` (board backup + Drive
  drops), and the Music Inspo watcher. Budgets: `fleet.slice` has a guaranteed floor; Claude and watchers are capped.
- **Reusable engines.** Krish, 2026-11-14: the music engine "will become peripherally useful for my content engine
  as well, as we start making the audio treatment more sophisticated in my production content", used "in the same
  way the content watcher is". What exists for that today, on the worker: `trackcard analyze <wav> --json` gives
  tempo, key/Camelot, sections, drops, loudness (integrated LUFS, crest) and, with stems, Demucs drums / bass /
  vocals / other activity per bar, as a JSON card; `trackcard mcp` serves it over stdio to a Claude session on the
  box. Stem separation itself (the separated audio, not just activity) is Demucs and is installed. Nothing in the
  content engine calls it yet; architecting that is the OS session's to propose.
- **Limits to design around:** YouTube refuses the worker (datacenter IP); Drive access is **read-only** (a
  writer would be a folder-scoped service account, not a broader token); no Claude Code on a timer (the
  zero-routines ruling); secrets only in `/etc/worker/secrets.d/`; the fleet's state exists only on this box
  (backups are an open decision).
- **Open:** T+24h/T+7d evidence (the worker's timer writes it; append it here); rotate the service-role key after
  T+7d, then delete the old box's snapshot; move `openclaw.json`'s inline tokens into the store; Hetzner backups
  for the worker; StemDeck (not installed); 6.7 and the `controlcentre` Caddy block.

### The old box (T0)

Gateway stopped and disabled; every crontab schedule line commented `#SWITCHED-TO-WORKER 2026-11-14#`
(verbatim backup beside it); all 21 enabled jobs disabled (backup + dated note in the cron folder);
Heartside, Caddy, Ollama stopped and disabled. **Nothing of the fleet runs.** One `cc-sync-engine` run
started before 19:40 is hung there (harmless upsert). The box is intact for rollback. It still holds a
Codex login (`/root/.codex/auth.json`, since 4 May) and the read-write control-center deploy key.

### The old box's end (same night, Krish's ruling; the 7-day wait was waived)

| Step | Who | Verified |
|---|---|---|
| Its Codex login signed out (`codex logout` as root) | migration session | `codex login status` → "Not logged in"; `auth.json` gone; no other Codex `auth.json` on its disk. The worker's login unaffected ("Logged in using ChatGPT") |
| Its **read-write** control-center deploy key removed | Krish (GitHub) | `GET /repos/krishanraja/control-center/keys` lists one key: `worker read-only`, `read_only=true` |
| Hetzner snapshot of the old box | Krish (console) | Krish's word; it is now the only rollback path |
| Old box **deleted** | Krish (console) | port 22 times out; `Host openclaw` removed from the laptop's `~/.ssh/config` and its host key from `known_hosts` |

**Rollback from here** = restore the snapshot to a new server, then reverse `12a` (restore the dated crontab and
`jobs.json.pre-switchover-*` backups, enable the gateway) **after** stopping the worker's gateway and crontab.
The snapshot still holds every secret the old box held (incl. the service-role key in ~1,600 files), another
reason to rotate after T+7d and then delete the snapshot.

### Failures and rollbacks

1. **Attempt 1 rolled back (19:56:01–19:56:26).** After the 19:50 switch, test messages to the Loz and
   Agatha bots got no reply and the gateway logged nothing, so the tier-1 rule was applied and the whole
   fleet returned to the old box in 25 s. Cause found afterwards: **the test was invalid.** Both bots are
   `dmPolicy: allowlist` with one allowed user each, and the tester is not that user, so the old box
   ignores him identically (re-tested on the old box: no reply). The valid proof used in attempt 2 is the
   Bot API's `pending_update_count`: with exactly one poller live, an inbound message leaves it at 0.
2. Session-side mistakes caught before they mattered (recorded for the method, not the result): a copy
   script edited while running (copy discarded and redone), a staging script that would have restored
   post-stop job flags (fixed: it now restores the pre-switchover backup and strips the dated prefixes).

### Krish's answers (2026-11-14, asked by the OS session)

He chose all three follow-ups:
- **Retire the `controlcentre.krishraja.com` Caddy block** on the worker. It serves nothing, because that name's DNS is elsewhere.
- **Move the inline secrets** in `openclaw.json` (both Telegram bot tokens, Discord, the AI provider keys, the gateway token) into `/etc/worker/secrets.d/`. This is a move, not a rotation.
- **music-watcher joins the fleet.** Done by the OS session: music-watcher #4 (North Star stub, NOW.md, closeout fold) and ai-harness #259 (fleet entry).

The first two need root on the worker, so the migration session does them over `ssh worker`.
- Reload the gateway once, between scheduled jobs.
- Prove the family bots still answer (pending updates 0) and that `openclaw.json` holds no secret value: count by `grep -cF` on each value, never printed.
- Record both here with their readback.

### Questions for Krish

- **6.7** (VPS role: only clock, outside watchdog, family agents): still unruled; everything moved as is.
- **Rotation** of the service-role key after T+7d, and moving the inline `openclaw.json` secrets into the store.
- **Heartside:** its address changed to the worker's `sslip.io` name; anyone who bookmarked the old one needs the new one.
- **`controlcentre.krishraja.com` Caddy block:** serves nothing (DNS elsewhere); carried over, retire?
- **Old box end:** done the same night (see above). Delete the snapshot once T+7d passes and the key is rotated.
- **music-watcher** joining the fleet.

## T0 check, by the OS session (2026-11-14, read 21:56 to 22:05 UTC)

Read from outside the box, as the handover's section 8 asks. The report was read, not trusted.

| Check | Reading | Result |
|---|---|---|
| `system_health`, all five rows under 20 min old | 5 rows, oldest `last_check` 11 min | pass |
| `api_usage_state` updated within 70 min | 28 rows, newest 37 min | pass |
| OpenClaw runs since cutover (20:08) | 0, and 0 in the same two hours a day earlier: no job is scheduled in that window | consistent, nothing missed |
| No scheduled slot with two rows since cutover | 0 duplicate slots | pass |
| `agents.last_run` moving | newest 159 min old, no agent has run since cutover | not yet measurable, re-read at T+24h |
| content-watcher `cloud-vps` claims nothing that waited under 15 min | 0 claims by anyone since 20:00 | pass |
| Control Center's n8n webhook header path (released the same evening) | proved without calling n8n by the n8n release session, independently of this move | pass |

Not checkable from outside today: the Telegram channel proof, the worker's file counts and the secrets count. They rest on the migration session's own readings above. The first real tier 1 runs are T+24h's: A2 (07:00Z), A22 (15:00 London) and the clock's 06:30 dispatch.

## T+24h

_To be added: A2 vera_audit row (07:00Z), A4, A11, B3, B6, B11, B16, B19, B20, B17, the clock's 06:30 dispatch,
and A22's briefing (one success row; Krish's copy received once)._

## T+7d

_To be added: Mon slots (A1 Mon/Wed/Fri, A5, A6, A7, A9, A12, A16, A18, A20), Fri (A3, B12); A8 on 30 Nov._
