# Prompt: keep the VPS checkout of control-center reading after it goes private

Paste everything below the line into Claude Code on LORIMER (the `openclaw` ssh
alias works there) or in a Claude Code session on the VPS itself. Run it BEFORE
`krishanraja/control-center` is made private, then run step 6 again after.

It changes the host. Every change is gated, backed up and reversible. The
decision behind it: Krish, 2026-10-15, make control-center private without
breaking anything that reads it.

---

You are working on the OpenClaw VPS (hostname `openclaw-vps`). Its checkout of
`krishanraja/control-center` at `/root/Projects/control-center` follows `main`
and fetches anonymously over HTTPS. Its push URL is anonymous on purpose, so a
push fails: Arlo diagnoses and never pushes (ruling, 2026-10-05). When the
repository goes private, the anonymous fetch starts failing, and with it
`os-autonomous-diagnostics.py` (which checks the architecture doc exists in the
checkout) and `regen-arch-section-4.py` (which reads the checkout).

The fix is a read-only deploy key for fetch only. The push URL stays anonymous,
and a read-only key cannot push either, so "Arlo cannot push" still holds twice.

## Hard rules

1. **Where am I.** Run `hostname`. If it prints `openclaw-vps`, run commands
   directly with `sudo`. Otherwise you are on LORIMER: run every host command as
   `ssh openclaw 'sudo ...'`.
2. **Read first.** Do phase 0 in full and show it before changing anything.
3. **One change at a time.** Say what will change and how to undo it, wait for
   Krish's yes, back up, apply, read back. Never two steps under one yes.
4. **Back up** every edited file as `<file>.bak-2026-10-15` first.
5. **Never print a private key.** Only the `.pub` file is ever shown.
6. Nothing else on the host changes.

## Phase 0: read, change nothing

```
hostname
sudo git -C /root/Projects/control-center remote -v
sudo git -C /root/Projects/control-center config --get remote.origin.pushurl || echo "no explicit pushurl"
sudo git -C /root/Projects/control-center fetch --dry-run origin main && echo FETCH-OK
sudo crontab -l | grep -n "control-center" || true
sudo grep -rn "Projects/control-center" /root/.openclaw/cron 2>/dev/null | head -20
sudo ls -l /root/.ssh/control_center_deploy* 2>/dev/null || echo "no key yet"
sudo grep -rIl "raw.githubusercontent.com/krishanraja/control-center" /root/.openclaw /root/Projects /root/scripts 2>/dev/null | grep -v "/Projects/control-center/" | head -50
```

Report: the current fetch and push URLs, how the checkout is kept current (the
cron line or job that pulls it), and every file outside the checkout that names
a `raw.githubusercontent.com/krishanraja/control-center` URL. A Supabase task
from 2026-09-18 told agent files (CLAUDE.md, ORG.md, TOOLS.md) to point at either
the checkout path or that raw URL, so expect some.

## Step 1: make the key (host)

Undo: delete the two files.

```
sudo test -f /root/.ssh/control_center_deploy || sudo ssh-keygen -t ed25519 -N "" -C "openclaw-vps control-center read-only" -f /root/.ssh/control_center_deploy
sudo cat /root/.ssh/control_center_deploy.pub
```

## Step 2: Krish adds it on GitHub (his press, a permission change)

Give Krish this, with the `.pub` line from step 1:

1. Open https://github.com/krishanraja/control-center/settings/keys/new
2. Title: `openclaw-vps read-only`
3. Key: paste the line
4. Leave **Allow write access** unchecked
5. Press **Add key**

Wait for him to say it is added.

## Step 3: an ssh alias for the key (host)

Back up `/root/.ssh/config` if it exists. Undo: restore the backup.

```
sudo sh -c 'cat >> /root/.ssh/config <<EOF

Host github-control-center
  HostName github.com
  User git
  IdentityFile /root/.ssh/control_center_deploy
  IdentitiesOnly yes
EOF'
sudo ssh -o StrictHostKeyChecking=accept-new -T github-control-center 2>&1 | head -2
```

Read back: GitHub answers `Hi krishanraja/control-center! You've successfully
authenticated, but GitHub does not provide shell access.` Anything else, stop.

## Step 4: fetch through the key, push stays anonymous (host)

Back up `/root/Projects/control-center/.git/config`. Undo: restore it.

```
sudo git -C /root/Projects/control-center remote set-url origin git@github-control-center:krishanraja/control-center.git
sudo git -C /root/Projects/control-center remote set-url --push origin https://github.com/krishanraja/control-center.git
sudo git -C /root/Projects/control-center remote -v
```

Read back: fetch is `git@github-control-center:...`, push is the anonymous
`https://github.com/...` URL.

## Step 5: the agent files (host)

For each file phase 0 listed, back it up, then replace the raw URL with the
checkout path (the architecture doc becomes
`/root/Projects/control-center/docs/MINDMAKE_OS_ARCHITECTURE.md`; any other file
the same way under `/root/Projects/control-center/`). For KRISH.md or
PORTFOLIO.md use `https://controlcenter.krishraja.com/api/canon/KRISH.md` and
`/api/canon/PORTFOLIO.md`, which stay public. Read back: the phase 0 grep
returns nothing outside the checkout.

## Step 6: prove it (run now, and again after the repository is private)

```
sudo git -C /root/Projects/control-center fetch origin main && sudo git -C /root/Projects/control-center rev-parse origin/main
sudo git -C /root/Projects/control-center push --dry-run origin HEAD:refs/heads/arlo-probe 2>&1 | tail -1
sudo test -f /root/Projects/control-center/docs/MINDMAKE_OS_ARCHITECTURE.md && echo ARCH-DOC-PRESENT
curl -s -o /dev/null -w "%{http_code}\n" https://raw.githubusercontent.com/krishanraja/control-center/main/README.md
curl -s -o /dev/null -w "%{http_code}\n" https://controlcenter.krishraja.com/api/canon/KRISH.md
```

Pass: the fetch succeeds and `origin/main` equals the sha GitHub shows for
`main`; the push dry run is refused; the doc is present; the raw URL is `200`
before the flip and `404` after; the canon link is `200`. Then run the
diagnostics once (`os-autonomous-diagnostics.py --mode quick`, from where the
root crontab runs it) and show the last lines of its log.

End with one short report for Krish: what changed, the backups, and the step 6
readback.
