#!/usr/bin/env bash
# Hourly heartbeat from the OpenClaw VPS into the harness brain.
#
# Declared 2026-09-09. Until then this host read agents.brief_content every 15
# minutes and wrote system_health back every 15 minutes, and appeared in no
# manifest and raised no finding when it broke. That is why five per-agent
# render logs died at the 2026-08-29 rebrand and nobody noticed for eleven days.
#
# This closes that. audit-harness.mjs declares openclaw-vps in EXPECTED_CLOCKS
# and opens a finding when the entry is missing or older than 48 hours, so the
# watchdog that watches everything else is finally watched itself.
#
# It reports state, it never changes any. No workflow is touched, no file on
# this host is written except the log line. Push only: no inbound port is
# opened and nothing needs to reach this machine.
#
# Install (as root, once):
#   cp vps-heartbeat.sh /root/.openclaw/workspace/scripts/
#   chmod +x /root/.openclaw/workspace/scripts/vps-heartbeat.sh
#   # add to root crontab, a few minutes past the hour so it reads a governor
#   # line that has already been written:
#   5 * * * * /root/.openclaw/workspace/scripts/vps-heartbeat.sh >> /var/log/vps-heartbeat.log 2>&1
#
# Requires GITHUB_HEARTBEAT_TOKEN in the environment, a token with repo scope on
# krishanraja/ai-harness. Never hardcode it here. The audit of 2026-09-09 found a
# plaintext service_role JWT in two sibling scripts on this host; do not add a
# third.

set -uo pipefail

REPO="krishanraja/ai-harness"
GOVERNOR_STATE="/root/.openclaw/workspace/scripts/n8n-governor-state.json"
GATEWAY_JOBS="/root/.openclaw/cron/jobs.json"

if [ -z "${GITHUB_HEARTBEAT_TOKEN:-}" ]; then
  echo "[$(date -u +%FT%TZ)] no GITHUB_HEARTBEAT_TOKEN in environment, refusing to run" >&2
  exit 78
fi

# The n8n execution counter, so the brain can see the spend trend without
# reaching into this host. Absent or unreadable is reported as null, never as
# zero, because a missing counter and an idle one mean opposite things.
count=null; projected=null; cycle=null
if [ -r "$GOVERNOR_STATE" ]; then
  read -r count cycle < <(python3 -c "
import json,sys
try:
    d=json.load(open('$GOVERNOR_STATE'))
    print(d.get('count','null'), d.get('cycle_start','null'))
except Exception:
    print('null','null')" 2>/dev/null) || { count=null; cycle=null; }
fi

# How many gateway jobs are defined. A number that falls without a commit
# explaining it is the signal worth having.
jobs=null
if [ -r "$GATEWAY_JOBS" ]; then
  jobs=$(python3 -c "
import json
try:
    d=json.load(open('$GATEWAY_JOBS'))
    print(len(d if isinstance(d,list) else d.get('jobs',[])))
except Exception: print('null')" 2>/dev/null) || jobs=null
fi

# Degraded is not a failure. It means the heartbeat is honest about something
# being wrong here, which is more useful than a green light that means nothing.
status=ok
[ "$count" = "null" ] && status=degraded
[ "$jobs" = "null" ] && status=degraded

payload=$(python3 - "$status" "$cycle" "$count" "$jobs" <<'PYEOF'
import json, sys
status, cycle, count, jobs = sys.argv[1:5]
def num(v):
    try: return int(v)
    except (TypeError, ValueError): return None
print(json.dumps({
  "event_type": "harness-machine-heartbeat",
  "client_payload": {
    "clock": "openclaw-vps",
    "status": status,
    "n8n_cycle_start": None if cycle == "null" else cycle,
    "n8n_executions_this_cycle": num(count),
    "gateway_jobs_defined": num(jobs),
  },
}))
PYEOF
)

code=$(curl -sS -o /tmp/vps-heartbeat-resp.txt -w '%{http_code}' -m 30 \
  -X POST "https://api.github.com/repos/$REPO/dispatches" \
  -H "Authorization: Bearer $GITHUB_HEARTBEAT_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d "$payload" 2>/dev/null)

if [ "$code" = "204" ]; then
  echo "[$(date -u +%FT%TZ)] heartbeat sent, status=$status executions=$count jobs=$jobs"
else
  echo "[$(date -u +%FT%TZ)] heartbeat FAILED http=$code $(head -c 200 /tmp/vps-heartbeat-resp.txt)" >&2
  exit 1
fi
