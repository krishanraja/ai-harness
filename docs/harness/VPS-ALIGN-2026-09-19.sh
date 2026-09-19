#!/usr/bin/env bash
# OpenClaw alignment audit, 2026-09-19. READ ONLY.
#
# Nothing here starts, stops, enables, disables, installs, edits or deletes.
# Every command either prints or greps. Run it, paste the whole output back.
#
# WHY THIS EXISTS. The publication's format vocabulary changed twice in three
# days: the two retired brands went on 2026-09-17, and lift.the.lid was retired
# on 2026-09-18 and reinstated on 2026-09-19 as one of three subchannels. The
# database, both apps and the n8n factory are now aligned to
# split_the_bill / mind_the_gap / lift_the_lid. This host is the one surface
# nobody has checked, and it runs jobs every sixty seconds.
#
# THE ONE THAT MATTERS MOST is section 3. If n8n-exec-governor.py is live here,
# this machine holds the only cap on n8n execution spend, and that has to be
# known before anything is switched off or moved.
#
# Run from PowerShell on LORIMER:
#   ssh openclaw 'bash -s' < VPS-ALIGN-2026-09-19.sh
# or paste the block below directly into an ssh session.

echo "===== 1. HOST ====="
hostname; uptime; head -2 /etc/os-release; df -h / | tail -1

echo; echo "===== 2. DOES THE OPENCLAW TREE EXIST ====="
if [ -d /root/.openclaw ]; then
  du -sh /root/.openclaw 2>/dev/null
  ls -la /root/.openclaw | head -20
else
  echo "ABSENT: /root/.openclaw does not exist"
fi

echo; echo "===== 3. THE SPEND CAP. Is the n8n governor alive? ====="
ls -la /root/.openclaw/workspace/scripts/n8n-exec-governor.py 2>/dev/null || echo "governor script: NOT FOUND"
cat /root/.openclaw/workspace/scripts/n8n-governor-state.json 2>/dev/null || echo "governor state: NOT FOUND"
echo "--- is it in cron? ---"
crontab -l 2>/dev/null | grep -i "governor" || echo "governor: NOT IN ROOT CRONTAB"

echo; echo "===== 4. FULL CRON INVENTORY, against the checked-in snapshot ====="
crontab -l 2>/dev/null | grep -vE '^\s*#' | grep -v '^\s*$' || echo "root crontab empty or unreadable"
echo "--- entry count ---"
crontab -l 2>/dev/null | grep -vE '^\s*#' | grep -c . || true

echo; echo "===== 5. FORMAT VOCABULARY. Retired names still on this host ====="
echo "Live slugs are split_the_bill, mind_the_gap, lift_the_lid."
echo "Anything below is a name retired on 2026-09-17 and still in use here."
grep -rIl --exclude-dir=.git --exclude-dir=node_modules \
  -e 'money_of_ai' -e 'built_with_ai' -e 'The Money of AI' -e 'Built with AI' \
  -e 'mindmaker_live' -e 'techonomic' -e 'builder_economy' \
  /root/.openclaw 2>/dev/null | head -40 || echo "no retired names found"
echo "--- and whether the live slugs appear at all ---"
grep -rIl --exclude-dir=.git --exclude-dir=node_modules \
  -e 'split_the_bill' -e 'mind_the_gap' -e 'lift_the_lid' \
  /root/.openclaw 2>/dev/null | head -20 || echo "NONE: this host has never seen a live format slug"

echo; echo "===== 6. CREDENTIALS IN PLAINTEXT ====="
echo "The 2026-09-09 audit found a service_role JWT in two scripts here."
echo "Filenames only. Do NOT paste any matched line back."
grep -rIl --exclude-dir=.git --exclude-dir=node_modules \
  -e 'service_role' -e 'eyJhbGciOiJIUzI1NiI' -e 'SUPABASE_SERVICE' -e 'sk-ant-' \
  /root/.openclaw 2>/dev/null | head -20 || echo "no plaintext credential shapes found"

echo; echo "===== 7. WHAT THIS HOST WRITES TO ====="
grep -rIoh --exclude-dir=.git --exclude-dir=node_modules \
  -E 'https://[a-z0-9]+\.supabase\.co/rest/v1/[a-z_]+' \
  /root/.openclaw 2>/dev/null | sort | uniq -c | sort -rn | head -25 || echo "no Supabase writes found"

echo; echo "===== 8. HEARTBEAT: is this host reporting into the harness? ====="
tail -5 /var/log/vps-heartbeat.log 2>/dev/null || echo "no heartbeat log"

echo; echo "===== END. Paste everything above back. ====="
