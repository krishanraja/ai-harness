# Prompt: switch the clock on

Paste everything below the line into Claude Code on LORIMER, after the
hardening prompt (`VPS-LORIMER-PROMPT.md`) has run. That run left the clock
installed and tested at `/opt/vps-clock` with no token and no cron line
(`state/vps/HARDEN-AND-CLOCK-2026-10-03.md`). This prompt finishes it.

---

You are on LORIMER. `ssh openclaw` reaches the VPS. Use `sudo` for everything
on the host. The hard rules of `docs/harness/VPS-LORIMER-PROMPT.md` in
`krishanraja/ai-harness` still apply:

- one change at a time, with Krish's yes
- a dated backup before any edit
- read back after every change
- never print a credential
- never read or touch anything belonging to loz, steph, finno or maa

## 1. Update two files (one yes)

Since the install, the clock gained a second entry, COMPOUND's daily brief at
06:30 New York, and its tests grew to 26. `clock.py` is unchanged. Back up the
two files that change as `<file>.bak-YYYY-MM-DD`. Then download both from
`https://raw.githubusercontent.com/krishanraja/ai-harness/main/scripts/vps/`
into `/opt/vps-clock/`, and check all three hashes. Stop on any mismatch:

```
0bc4ddfca77d67f0f36c54ece93ca68b58cba82846802bed5b1371082af299bd  clock.py
87155666195d03d17bae9f027bd991f018be0e81dd32fe4ed4e6a9f31670c097  clock.json
253e3482f64db18ed0ff64d8a93d1c097df9cc2853e89122c50a7bc10beee4f1  test_clock.py
```

Then run `cd /opt/vps-clock && python3 -m unittest -q test_clock`, which must
end `OK` (26 tests). Then run
`python3 /opt/vps-clock/clock.py --config /opt/vps-clock/clock.json --dry-run --now 2026-10-05T10:31:00Z`,
which must print one `would-dispatch krishanraja/compound compound-daily.yml@main`
line.

## 2. The token (Krish does this himself)

He creates one fine-grained token at github.com → Settings → Developer
settings → Fine-grained personal access tokens:

- Repository access: only `krishanraja/lozatron` and `krishanraja/compound`
- Permissions: Actions read and write, Contents read-only (Metadata read-only
  is added automatically)
- Expiry: one year, with a calendar reminder a week before

He installs it from his own terminal, so it never passes through this chat:

```
ssh openclaw
sudo install -d -m 700 /etc/vps-clock && sudo bash -c 'umask 077; read -rsp "Token: " T; echo; printf "CLOCK_GITHUB_TOKEN=%s\n" "$T" > /etc/vps-clock/env'
```

You then check `sudo stat -c '%a %U' /etc/vps-clock/env` reads `600 root`.

## 3. Prove the token without dispatching (no yes needed, read-only)

Run this as root on the host. It prints two status lines and never prints the
token:

```
sudo python3 - <<'EOF'
import json, urllib.request
token = [l.split("=", 1)[1].strip() for l in open("/etc/vps-clock/env") if l.startswith("CLOCK_GITHUB_TOKEN=")][0]
for repo, wf in (("lozatron", "briefings.yml"), ("compound", "compound-daily.yml")):
    req = urllib.request.Request(f"https://api.github.com/repos/krishanraja/{repo}/actions/workflows/{wf}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json", "User-Agent": "vps-clock"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(repo, r.status, json.load(r)["state"])
    except Exception as e:
        print(repo, "FAILED", getattr(e, "code", type(e).__name__))
EOF
```

Both lines must read `200 active`. A 404 on either means the token is not
scoped to that repository, and Krish remakes it.

## 4. Turn it on (one yes)

Back up the root crontab to `/root/crontab.bak-YYYY-MM-DD`, then add exactly:

```
*/5 * * * * /usr/bin/python3 /opt/vps-clock/clock.py --config /opt/vps-clock/clock.json >> /var/log/vps-clock.log 2>&1
```

Add `/etc/logrotate.d/vps-clock` (weekly, rotate 8, compress, missingok,
notifempty). Read back:

- the active cron count is one more than before
- after the next five-minute tick, `/var/lib/vps-clock/state.json` exists with a
  `first_tick`
- the log is quiet outside the two windows

Undo: restore the crontab backup.

## 5. The proof is in the morning

- **06:30 New York** (10:30 UTC until 1 November, 11:30 after). The log shows
  `compound-daily-brief … dispatched … HTTP 204`, then `settled` on the next
  tick.
- **09:00 New York** (13:00 UTC, 14:00 after 1 November). The log shows
  `lozatron-briefing … dispatched … HTTP 204`, then `proved` about 30 minutes
  later.

A `dispatch-refused … HTTP 422` means that repository's `main` does not
declare the `trigger` input yet. Both merged on 2026-10-03, so this would be a
regression; report it.

## 6. Write it down

Append the outcome to `state/vps/HARDEN-AND-CLOCK-2026-10-03.md` in
`krishanraja/ai-harness` on a new branch: the hashes, the token check result
(statuses only), the cron line, and the undo. Commit, push with up to four
retries on a network error, and report the branch and commit. No pull request.
Do not change anything else on the host.
