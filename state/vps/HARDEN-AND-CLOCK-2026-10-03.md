# VPS harden and clock, 2026-10-03

Host: `openclaw-vps` (Ubuntu 22.04, 3 vCPU, 3.7 GiB). Run from LORIMER over the `openclaw` ssh alias.
Decision behind it: `docs/harness/VPS-ROLE-2026-10-03.md`.
Krish approved each step in chat; the last message was a blanket yes for everything remaining.

## Status at a glance

| Step | State |
|---|---|
| 1.1 Firewall | Done |
| 1.2 Printer port | Done (via snap, see below) |
| 1.3 Swap | Done |
| 1.4 fail2ban | Done |
| 1.5 Stop Ollama | Skipped by Krish's ruling |
| 1.6 Reboot | Done, before the prompt arrived; after-checks pass except the loz sandbox (open) |
| 2.1 Preconditions | Lozatron fix on main: pass. Token: **not on the box yet (Krish)** |
| 2.2 Fetch and verify | Done |
| 2.3 Prove the token | **Blocked on the token** |
| 2.4 Turn the clock on | **Blocked on 2.3** |
| 2.5 First real dispatch | Open, after 2.4 |

## Phase 0 table, before and after

"Before" was taken just after the reboot (23:3x UTC), before any hardening. "After" is after 1.1 to 1.4 and 2.2.

| Check | Before | After |
|---|---|---|
| Kernel, reboot-required | 5.15.0-194, no | same |
| Memory available | 2869 MB | 2748 MB |
| Swap | none | 2 GB `/swapfile`, swappiness 10 |
| Disk `/` | 47% | 50% (swapfile + fail2ban) |
| sshd port | 22 | 22 |
| Public listeners | 22 sshd, 80/443 caddy, 631 cupsd | 22 sshd, 80/443 caddy |
| Loopback listeners | 11434 ollama, 53 resolved, 2019 caddy admin, 18789/18791 gateway, containerd | unchanged |
| ufw | installed, inactive | active, deny in, allow out, deny routed; 22/80/443 allowed v4+v6 |
| cups | snap `cupsd` and `cups-browsed` enabled, active | both disabled, inactive |
| fail2ban | not installed | 0.11.2-6, active, sshd jail on |
| ollama / docker / caddy | active / active / active | unchanged |
| Docker published ports | none | none |
| Root cron (`grep -vc '^\s*#'`) | 30 | 30 |
| Gateway service | active | active |
| `systemctl --failed` | none | none |
| Python | 3.10.12, zoneinfo ok | same |

## Each step

### 1.6 Reboot (done first)

Krish asked for the reboot before this prompt arrived; it ran at 23:31 UTC from LORIMER after checking disk space and that the 5.15.0-194 kernel and initrd were present. Host had been up 221 days with 13 queued kernels plus libc6 and libssl3. No `/root/pre-reboot-*.txt` was written; the before-snapshot was taken in the session.

| After-check | Before | After | Result |
|---|---|---|---|
| Root cron count | 30 | 30 | pass (the "33" in the prompt was stale; Krish confirmed) |
| Gateway service | active | active | pass |
| Containers | loz sandbox Up 5 months | loz sandbox Exited (137) | **open**, see below |
| `systemctl --failed` | | none | pass |
| Hourly governor line | `[2026-10-03T23:00:01Z] done` | not yet due at commit (23:47 UTC) | **open** |

The loz sandbox has restart policy `no`, so the reboot left it stopped. Per Krish: leave it for OpenClaw to recreate. After Lauren's 13:00 UTC run, check `sudo docker ps -a` names and status only. If it is still exited, tell Krish first; the approved fix is a plain `docker start openclaw-sbx-agent-loz-4805770c`.

### 1.1 Firewall

- Changed: `ufw allow 22/tcp`, `80/tcp`, `443/tcp`; default deny incoming, allow outgoing; `ufw --force enable`.
- Backups: `/etc/ufw/ufw.conf.bak-2026-10-03`, `/etc/ufw/user.rules.bak-2026-10-03`, `/etc/ufw/user6.rules.bak-2026-10-03`, `/etc/default/ufw.bak-2026-10-03` (all verified present).
- Readback: `Status: active`, `Default: deny (incoming), allow (outgoing), deny (routed)`, 22/80/443 allowed on v4 and v6. A held ssh session stayed up, a new `ssh openclaw true` succeeded, and 443 still answered from outside.
- Undo: `sudo ufw disable`

### 1.2 Printer port

- The prompt's units (`cups`, `cups-browsed`, `cups.socket`, `cups.path`) do not exist on this host: CUPS is the **snap**, not the apt package. The first command was a no-op. The same intent was applied with the snap's own reversible switch.
- Changed: `snap stop --disable cups` (services `cups.cupsd` and `cups.cups-browsed`).
- Backup: none needed; no file edited.
- Readback: both services `disabled inactive`; nothing listening on 631. (ufw already blocked 631 from outside after 1.1.)
- Undo: `sudo snap start --enable cups`

### 1.3 Swap

- Changed: `fallocate -l 2G /swapfile`, `chmod 600`, `mkswap`, `swapon`; appended `/swapfile none swap sw 0 0` to `/etc/fstab`; wrote `vm.swappiness=10` to `/etc/sysctl.d/99-swap.conf`; `sysctl --system`.
- Backup: `/etc/fstab.bak-2026-10-03` (verified).
- Readback: `swapon --show` shows `/swapfile file 2G`; `free -m` shows 2047 MB swap; `vm.swappiness = 10`; `/swapfile` is `-rw------- root root`.
- Note: `sysctl --system` printed two `Invalid argument` warnings for `net.ipv4.conf.all.accept_source_route` and `promote_secondaries`. They come from the stock Ubuntu network sysctl files, not from `99-swap.conf`, and were not touched.
- Undo: `sudo swapoff /swapfile && sudo cp -p /etc/fstab.bak-2026-10-03 /etc/fstab && sudo rm /swapfile /etc/sysctl.d/99-swap.conf && sudo sysctl --system`

### 1.4 fail2ban

- Changed: `apt-get install fail2ban` (0.11.2-6); created `/etc/fail2ban/jail.local` with only `[sshd]` / `enabled = true` (it did not exist); `systemctl enable --now fail2ban`.
- Backup: none needed; new file, no existing file edited.
- Readback: active and enabled. `fail2ban-client status sshd`: watching `/var/log/auth.log`, 9 failed attempts seen, 1 IP banned within seconds of starting. LORIMER's own ssh kept working afterwards.
- Undo: `sudo systemctl disable --now fail2ban`

### 1.5 Stop Ollama: skipped

Phase 0's search hit two run logs under `/root/.openclaw/cron/runs/`: `system-health` (ops agent, enabled, daily 14:00 New York) and `loz-news-briefing-2pm` (disabled). Krish allowed reading the `system-health` job definition only: it runs the template `active/templates/system-health.md` on `deepseek/deepseek-v4-flash`. The template was not opened. Ruling: skip 1.5 whether that job needs Ollama or only checks it. The job is on the retirement list, swap reduces the RAM pressure, and Ollama comes off when the job retires.

### 2.1 Preconditions

- Lozatron fix: `curl .../lozatron/main/.github/workflows/briefings.yml | grep -c 'LOZ_TRIGGER: '` printed `1`. Pass.
- Token: `/etc/vps-clock/env` does **not** exist. Krish has to create the fine-grained token (only `krishanraja/lozatron`; Actions read and write, Contents read-only; one-year expiry) and install it from his own terminal with the no-echo command in the prompt. It must not pass through a chat.

### 2.2 Fetch and verify

- Created `/opt/vps-clock` (root, 755). Downloaded `clock.py`, `clock.json`, `test_clock.py` from `ai-harness` branch `claude/dreamy-einstein-gzxsfg`, `scripts/vps/`.
- SHA-256: all three `OK` against the pinned values.
- Tests: `Ran 24 tests ... OK` on the host's Python 3.10.12.
- Dry run at `--now 2026-10-05T13:01:00Z`: `lozatron-briefing slot=2026-10-05T09:00 would-dispatch krishanraja/lozatron briefings.yml@main attempt 1 (on time)`, then `dry run: 1 entry, nothing dispatched, state untouched`.
- No cron line was added. The code is inert until 2.4.
- Undo: `sudo rm -r /opt/vps-clock`

### 2.3 and 2.4: blocked on the token

Once `/etc/vps-clock/env` exists:

1. `sudo stat -c '%a %U' /etc/vps-clock/env` must print `600 root`.
2. Run the read-only probe from the prompt; it must print `200 active`.
3. Back up the root crontab to `/root/crontab.bak-YYYY-MM-DD`, add the single `*/5` clock line, add `/etc/logrotate.d/vps-clock` (weekly, rotate 8, compress, missingok, notifempty). The cron count must become 31.
4. After the next five-minute tick, `/var/lib/vps-clock/state.json` exists with a `first_tick`.

## Open checks

1. **Token, then 2.3 and 2.4** (Krish creates the token; the rest is a short follow-up session).
2. **First real dispatch (2.5)**, the morning after 2.4: at 09:00 New York (13:00 UTC until 1 November, 14:00 UTC after), `/var/log/vps-clock.log` shows `dispatched ... HTTP 204`. A Lozatron `workflow_dispatch` run starts within a minute, and about 30 minutes later the log shows `proved`. Do not force a dispatch outside the window.
3. **loz sandbox** after Lauren's 13:00 UTC run: `docker ps -a` names and status only; if still exited, ask Krish before `docker start`.
4. **Governor line**: the first post-reboot hourly line (00:00 UTC 2026-10-04) in `/var/log/n8n-governor.log`; not yet due when this was committed.

## Crontab drift (read-only, for the record)

The prompt's "33 at the 2026-09-19 audit" matches `control-center` `scripts/cron/crontab.txt` on main (33 non-blank active lines). The live root crontab has 30 by the prompt's count, which includes 2 blank lines, so 28 real lines. Five lines are in the repo and not live, all `workspace-loz`:

- `*/30 * * * *` `loz_signal_radar.py --mode quick --paid never`
- `0 13,18,22 * * *` `briefing_and_send.py`
- `15 * * * *` `fix_orphaned_briefings.py`
- `30 14,19,23 * * *` `loz_freshness_diagnostic.py`
- `7,37 * * * *` `verify_doc.py --auto-repair --quiet`

Nothing is live that is missing from the repo. Nothing was changed. The repo file is now out of date with the host on these five lines.

## Reads touching loz (ruling of 2026-09-09)

- One incidental read of a job's name and enabled flag (`loz-news-briefing-2pm`, disabled), caused by the prompt's own Ollama search sweeping loz's run logs. Krish noted it as the prompt's doing. Nothing further under loz was read.
- The crontab drift list above names five loz cron lines. They were read from the public `control-center` repo file for the diff Krish asked for, not from loz's workspace.
- Nothing under loz was changed.

## Finding, not acted on

The OpenClaw node process (the gateway on 18789/18791) runs as root. Moving it means moving `/root/.openclaw`, and that belongs to the clean-host replacement, not to this pass.

## Not done, on purpose

No credential was rotated or printed. No PR was opened. Nothing else on the host changed: the n8n governor, every OpenClaw gateway job, the loz, steph, finno and maa agents and their cron lines, and the loz sandbox were left as found.

## Clock switched on, 2026-10-04

Run from LORIMER with `docs/harness/VPS-CLOCK-ON-PROMPT.md`. Krish said yes to step 1 and to step 4; steps 2 and 3 needed no change from this session.

### 1. Files updated

- Backups: `/opt/vps-clock/clock.json.bak-2026-10-04`, `/opt/vps-clock/test_clock.py.bak-2026-10-04` (both verified).
- Downloaded `clock.json` and `test_clock.py` from `ai-harness` `main`, `scripts/vps/`. `clock.py` unchanged.
- SHA-256, all `OK`:
  - `0bc4ddfca77d67f0f36c54ece93ca68b58cba82846802bed5b1371082af299bd  clock.py`
  - `87155666195d03d17bae9f027bd991f018be0e81dd32fe4ed4e6a9f31670c097  clock.json`
  - `253e3482f64db18ed0ff64d8a93d1c097df9cc2853e89122c50a7bc10beee4f1  test_clock.py`
- Tests: `Ran 26 tests ... OK`.
- Dry run at `--now 2026-10-05T10:31:00Z`: `compound-daily-brief slot=2026-10-05T06:30 would-dispatch krishanraja/compound compound-daily.yml@main attempt 1 (on time)`, then `dry run: 2 entries, nothing dispatched, state untouched`.
- Side effect: running the tests as root left a `__pycache__` folder in `/opt/vps-clock`. Harmless.
- Undo: `sudo cp -p /opt/vps-clock/clock.json.bak-2026-10-04 /opt/vps-clock/clock.json && sudo cp -p /opt/vps-clock/test_clock.py.bak-2026-10-04 /opt/vps-clock/test_clock.py`

### 2. Token

Krish created and installed it from his own terminal; it never passed through a chat. `/etc/vps-clock/env` is `600 root`, its folder `700 root`, and it holds one `CLOCK_GITHUB_TOKEN` line. The value was not read or printed.

### 3. Token proof (read-only, statuses only)

- `lozatron 200 active`
- `compound 200 active`

### 4. Turned on

- Backup: `/root/crontab.bak-2026-10-04` (42 lines; identical to the live crontab minus the new line).
- Added to the root crontab:
  ```
  */5 * * * * /usr/bin/python3 /opt/vps-clock/clock.py --config /opt/vps-clock/clock.json >> /var/log/vps-clock.log 2>&1
  ```
- Added `/etc/logrotate.d/vps-clock`: `weekly`, `rotate 8`, `compress`, `missingok`, `notifempty`. A dry run of the full `/etc/logrotate.conf` (which sets `su root adm`) picks it up cleanly. Testing the file on its own reports an "insecure permissions" error only because the global `su` line is not loaded then; that is not a fault.
- Readback: active cron count 30 to 31. First tick at `2026-10-04T00:05:01Z` wrote `/var/lib/vps-clock/state.json` with keys `first_tick`, `last_tick`, `slots`. `/var/log/vps-clock.log` exists and is empty, as expected outside both windows.
- Undo: `sudo crontab /root/crontab.bak-2026-10-04 && sudo rm /etc/logrotate.d/vps-clock`

### 5. The proof is in the morning (open)

- 06:30 New York (10:30 UTC until 1 November, 11:30 after): `compound-daily-brief ... dispatched ... HTTP 204`, then `settled` on the next tick.
- 09:00 New York (13:00 UTC, 14:00 after 1 November): `lozatron-briefing ... dispatched ... HTTP 204`, then `proved` about 30 minutes later.
- A `dispatch-refused ... HTTP 422` would be a regression (both repos declared the `trigger` input on 2026-10-03); report it.

### Earlier open checks, updated

- **Governor line: closed.** Cron started the governor at 00:00:01 UTC and it logged `[2026-10-04T00:00:02Z] done`. The line sits in `/var/log/n8n-governor.log.1.gz` because the weekly logrotate ran at the same minute and left a fresh empty log. All reboot after-checks now pass except the loz sandbox.
- **Token, 2.3, 2.4: closed** by the steps above.
- **loz sandbox:** still open. Check `sudo docker ps -a` names and status after Lauren's 13:00 UTC run; if still exited, ask Krish before `docker start`.
