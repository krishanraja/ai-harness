# Auditing the OpenClaw VPS before retiring it

Krish ruled on 2026-09-09 that the VPS should be retired as orchestrator. Nothing
here retires it. This establishes what it actually does first, because the
premise that it "barely does much" is contradicted by the evidence available
from the cloud.

## Why this must happen before anything is switched off

`control-center/scripts/cron/crontab.txt` is a checked-in snapshot of the root
crontab. It holds 13 entries and several fire constantly:

| Schedule | Job |
|---|---|
| every minute | `poll_sync_queue.py` |
| every 2 minutes | `fire-pending-flags.py` |
| every 5 minutes | `cc-sync-engine.sh` |
| every 15 minutes | `cc-doc-creator.sh`, `render-identity.py` |
| every 6 hours | Google Drive token refresh, `sync-to-drive.py` |
| nightly | Arlo contradiction audit, Vera contradiction audit, standards digest, workspace maintenance |

A machine running jobs every sixty seconds is not dormant.

Worse, `docs/MINDMAKE_OS_ARCHITECTURE.md` describes two jobs that are **absent
from that snapshot**, which means the snapshot is stale:

- `n8n-exec-governor.py`, hourly, deactivating any n8n workflow above 8,000
  executions per cycle. The doc calls it a hard backstop placed deliberately
  outside n8n so it cannot be starved.
- `critical-infra-monitor.py`, every 5 minutes, calling the Supabase RPC
  `audit_critical_infra`.

**If the governor is live, switching off the VPS removes the only cap on n8n
execution spend.** That failure mode is a large bill arriving quietly, which is
the exact class of silent failure this whole programme exists to end.

One further contradiction to settle: Supabase `learning_events` rows point at
`/root/.openclaw/...` paths, and an earlier session concluded that filesystem no
longer exists. The crontab snapshot says it does. Both cannot be true.

## Why Krish runs this and not the cloud session

There is no SSH client in the cloud sandbox at all. Not a key problem, not a host
problem: `ssh` is not installed, `/root/.ssh` is empty, and `paramiko` is absent.
Installing one and shipping a private key into an ephemeral container is the
wrong trade for a read-only audit, so this runs from the Windows machine where
the `openclaw` alias already works.

## The command set

Read only. Nothing here starts, stops, enables, disables, installs, edits or
deletes anything. Paste the whole block into PowerShell on LORIMER.

```powershell
ssh openclaw 'bash -s' <<'AUDIT'
echo "===== 1. HOST ====="
hostname; uptime; cat /etc/os-release | head -2; df -h / | tail -1

echo; echo "===== 2. DOES THE OPENCLAW TREE EXIST ====="
ls -d /root/.openclaw 2>/dev/null && du -sh /root/.openclaw 2>/dev/null || echo "ABSENT: /root/.openclaw does not exist"

echo; echo "===== 3. THE SPEND GOVERNOR, THE ONE THAT MATTERS ====="
for f in n8n-exec-governor.py critical-infra-monitor.py; do
  p=$(find /root /opt /srv -name "$f" 2>/dev/null | head -1)
  if [ -n "$p" ]; then echo "FOUND $p"; stat -c '  modified %y  size %s bytes' "$p"; else echo "NOT FOUND: $f"; fi
done
crontab -l 2>/dev/null | grep -i 'governor\|infra-monitor' || echo "  not in root crontab"

echo; echo "===== 4. EVERY SCHEDULE ====="
echo "--- root crontab ---"; crontab -l 2>/dev/null || echo "(none)"
echo "--- other users ---"; for u in $(cut -f1 -d: /etc/passwd); do c=$(crontab -u "$u" -l 2>/dev/null); [ -n "$c" ] && echo "[$u]" && echo "$c"; done
echo "--- /etc/cron.d ---"; ls -la /etc/cron.d/ 2>/dev/null | tail -n +2
echo "--- systemd timers ---"; systemctl list-timers --all --no-pager 2>/dev/null | head -20

echo; echo "===== 5. WHAT IS RUNNING ====="
systemctl list-units --type=service --state=running --no-pager 2>/dev/null | head -25
echo "--- docker ---"; docker ps --format '{{.Names}}\t{{.Status}}\t{{.Image}}' 2>/dev/null || echo "(no docker)"

echo; echo "===== 6. IS IT ACTUALLY DOING ANYTHING (liveness) ====="
echo "--- 15 most recently modified logs ---"
find /var/log /tmp /root/.openclaw -name '*.log' -mmin -10080 2>/dev/null | head -15 | while read l; do
  echo "$(stat -c '%y' "$l" | cut -d. -f1)  $(stat -c '%s' "$l" | tr -d ' ')b  $l"
done
echo "--- last 3 lines of the 5 newest, credentials stripped ---"
find /var/log /tmp /root/.openclaw -name '*.log' -mmin -10080 2>/dev/null | head -5 | while read l; do
  echo "### $l"; tail -3 "$l" 2>/dev/null | sed -E 's/(sbp_|ghp_|vcp_|sk-|eyJ|Bearer )[A-Za-z0-9._-]+/[REDACTED]/g'
done

echo; echo "===== 7. AGENT IDENTITIES AND BRIEFS, WITH DATES ====="
for d in /root/.openclaw/workspace /root/.openclaw/workspace-loz /root/.openclaw/workspace-steph /root/.openclaw/workspace-finno /root/.openclaw/workspace-maa; do
  [ -d "$d" ] || continue
  echo "--- $d"
  for f in IDENTITY.md SOUL.md MEMORY.md; do
    [ -f "$d/$f" ] && stat -c "    %n  %s bytes  modified %y" "$d/$f" | cut -d. -f1
  done
done
echo "--- per-agent skill briefs ---"
ls -la /root/.openclaw/skills/ 2>/dev/null | tail -n +2 | head -20

echo; echo "===== 8. WHAT EXISTS ONLY HERE (migration risk) ====="
echo "--- sqlite databases ---"; find /root /opt /srv -name '*.db' -o -name '*.sqlite*' 2>/dev/null | head -10
echo "--- openclaw config, keys masked ---"
[ -f /root/.openclaw/openclaw.json ] && python3 -c "
import json,re
d=json.load(open('/root/.openclaw/openclaw.json'))
def scrub(o):
    if isinstance(o,dict): return {k:('[REDACTED]' if re.search('token|key|secret|password',k,re.I) else scrub(v)) for k,v in o.items()}
    if isinstance(o,list): return [scrub(i) for i in o]
    if isinstance(o,str) and len(o)>40 and re.match(r'^[A-Za-z0-9._:-]+$',o): return '[REDACTED]'
    return o
print(json.dumps(scrub(d),indent=1)[:2500])" 2>/dev/null || echo "(no openclaw.json)"

echo; echo "===== 9. TELEGRAM, VARIABLE NAMES ONLY ====="
grep -rlI 'telegram' /root/.openclaw 2>/dev/null | head -10
echo "--- env var names present, never values ---"
grep -rhoI 'TELEGRAM[A-Z_]*' /root/.openclaw 2>/dev/null | sort -u

echo; echo "===== AUDIT COMPLETE ====="
AUDIT
```

## What the output decides

| If the output shows | Then |
|---|---|
| `n8n-exec-governor.py` present and in a crontab | **Retirement is blocked.** The cap moves to a GitHub Actions schedule and is proven working before the VPS is touched |
| The governor absent | The risk was theoretical, and retirement proceeds on the other evidence |
| `/root/.openclaw` absent | The crontab snapshot is stale fiction and the machine is already effectively dead. Retirement is bookkeeping |
| Logs modified within hours | Something is live. Each writer gets identified and given a home before anything stops |
| Logs stale by weeks | The premise holds and the jobs are firing into nothing |
| A sqlite file or local state | That is the migration list, and it moves before the machine goes |

Paste the output back. Nothing gets switched off on inference.

## What is already known, and does not need the VPS to settle

Two things were established from the cloud and are not in question:

- **No n8n workflow calls the VPS.** Every outbound host across the workflow
  exports is Vercel, Supabase, Anthropic, Google, Stripe, Apify, Apollo,
  Podchaser, Perplexity, GitHub or Telegram. The VPS is not in the execution
  path of the fleet.
- **The agent identities are not really here.** `agents.brief_content` in
  Supabase holds 14 briefs of 8k to 28k characters, ten updated within the last
  four days. Whatever `IDENTITY.md` and `SOUL.md` hold on the VPS, the live
  operating instructions are in the database. The exception is the four
  personal-life agents, which the architecture doc says exist only in OpenClaw
  config and are deliberately absent from the `agents` table. Those are
  genuinely unmirrored and section 7 above is what recovers them.
