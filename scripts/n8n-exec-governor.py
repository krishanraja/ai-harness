#!/usr/bin/env python3
"""
n8n Execution Governor. Spend visibility for the n8n Cloud account.

Runs on the OpenClaw VPS (free infra, OUTSIDE n8n's execution budget, so it cannot be
starved when n8n nears its cap). Maintains its OWN cumulative execution counter for the
current billing cycle (robust to n8n's execution-history retention pruning).

WARNS LOUDLY, NEVER ACTS. Reshaped 2026-09-09 on Krish's ruling.

Until that date this script carried a TRIP branch that deactivated every ACTIVE workflow
not named in CRITICAL_WHITELIST. It had never fired. Had it fired it would have
deactivated 77 of 86 workflows with nothing in the script able to restore them: there is
no saved list of what was on before, and no re-activation path. A silent mass shutdown of
the automation fleet is a worse outcome than the overspend it was guarding against, and it
would have arrived with no human in the loop. The counter and both alert levels are kept.
The deactivation is gone.

  - WARN  at 7,000/cycle (or projected end-of-cycle >= 9,500) -> alert, once per cycle
  - CRITICAL at 8,000/cycle                                   -> alert, once per cycle
  - RATE  per-workflow hourly spike                           -> alert, with cooldown

The rate alarm is the one that earns its place. A cumulative counter only tells you the
month is going badly, and by then the money is spent. A single workflow suddenly running
hundreds of executions an hour is the actual failure shape: a loop, a retry storm, a
webhook feeding itself. That is visible within the hour it starts.

Alerts route through the ops Telegram account helper below. Note that since the PULL ONLY
work of 2026-09-06 that helper appends to /var/log/os-pull-only-alerts.log and returns
before the sender, so alerts are pull-only by design. Re-enabling push is a deliberate
one-line revert and a decision for Krish, not something this script should do on its own.

  - Reads only what it needs, at runtime, from existing stores (no aggregated secret file):
      * n8n API key  -> parsed from TOOLS.md by decoding JWT payloads (iss=n8n, aud=public-api)
      * Telegram ops -> /root/.openclaw/openclaw.json  (.channels.telegram.accounts.ops.botToken)
  - State (no secrets) in STATE_PATH. Cumulative counter => accurate even if n8n prunes old
    execs, as long as this runs at least as often as the shortest retention window.
  - Idempotent per cycle (will not re-alert); re-arms automatically on cycle rollover.
  - --dry-run: compute + log only. NO state mutation.

Cron (system crontab, root):  0 * * * *  /usr/bin/python3 /root/.openclaw/workspace/scripts/n8n-exec-governor.py >> /var/log/n8n-governor.log 2>&1
"""
import json, os, sys, re, base64, urllib.request, urllib.error, urllib.parse, datetime as dt

# ---- config -----------------------------------------------------------------
TOOLS_MD    = "/root/.openclaw/workspace/TOOLS.md"
OPENCLAW    = "/root/.openclaw/openclaw.json"
STATE_PATH  = "/root/.openclaw/workspace/scripts/n8n-governor-state.json"
TG_CHAT     = "6773796504"                    # ops chat
RESET_DAY   = 1                               # billing cycle reset day-of-month (UTC). ADJUST to your anniversary.
WARN_AT     = 7000
CRITICAL_AT = 8000                            # was TRIP_AT. Now an alert level, not an action.
PROJECT_WARN= 9500                            # projected end-of-cycle warn

# Executions per hour, for a SINGLE workflow, that count as a spike. Normal hourly deltas
# across the whole fleet sat between 2 and 13 in the sampled window of 2026-09-09, so one
# workflow on its own reaching this is far outside normal and worth waking up for.
RATE_ALARM_PER_WF = 200
RATE_COOLDOWN_HRS = 6                         # do not re-alert the same workflow inside this window

# Retained deliberately though nothing reads it now that deactivation is gone. This is the
# curated list of what must stay alive if a cap is ever rehomed somewhere that can act, and
# that judgement is expensive to reconstruct. Revenue, approvals, error visibility, routing.
CRITICAL_WHITELIST = ("Stripe", "Approval", "Error Monitor", "Orchestrator",
                      "Control Center Live Sync", "Status Update Receiver", "Critical Infrastructure Monitor")
DRY = "--dry-run" in sys.argv

def log(*a):
    ts = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}]", *a, flush=True)

def parse_ts(s):
    """ISO timestamp to aware datetime. Python 3.10 fromisoformat does not accept a
    trailing Z, and every timestamp n8n returns carries one."""
    try:
        return dt.datetime.fromisoformat(str(s).replace("Z", "+00:00"))
    except Exception:
        return None

# ---- secrets (runtime, single-purpose) --------------------------------------
def _jwt_payload(j):
    try:
        p = j.split(".")[1]; p += "=" * (-len(p) % 4)
        return json.loads(base64.urlsafe_b64decode(p).decode("utf-8", "ignore"))
    except Exception:
        return {}

def n8n_key():
    txt = open(TOOLS_MD, encoding="utf-8", errors="ignore").read()
    for j in set(re.findall(r"eyJ[A-Za-z0-9._-]{60,}", txt)):
        pl = _jwt_payload(j)
        if pl.get("iss") == "n8n" and pl.get("aud") == "public-api":
            return j
    raise RuntimeError("n8n API key not found in TOOLS.md")

def tg_token():
    cfg = json.load(open(OPENCLAW, encoding="utf-8"))
    return cfg["channels"]["telegram"]["accounts"]["ops"]["botToken"]

# ---- n8n api ----------------------------------------------------------------
KEY = None
BASE = "https://krishraja10101.app.n8n.cloud/api/v1"
def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
        headers={"X-N8N-API-KEY": KEY, "Content-Type": "application/json", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode() or "{}")

def telegram(msg):
    # PULL-ONLY (2026-09-06): the OS never pings Krish. Alerts are appended to
    # /var/log/os-pull-only-alerts.log where Control Center reads them. The original sender below is kept
    # deliberately as dead code so this is a one-line revert.
    try:
        import datetime as _dt
        with open("/var/log/os-pull-only-alerts.log", "a", encoding="utf-8") as _f:
            _f.write(_dt.datetime.utcnow().isoformat() + " " + str(msg) + chr(10))
    except Exception:
        pass
    return
    try:
        tok = tg_token()
        body = urllib.parse.urlencode({"chat_id": TG_CHAT, "text": msg}).encode()
        urllib.request.urlopen("https://api.telegram.org/bot%s/sendMessage" % tok, data=body, timeout=15).read()
    except Exception as e:
        log("WARN telegram failed:", e)

# ---- cycle + state ----------------------------------------------------------
def cycle_start(now):
    y, m = now.year, now.month
    if now.day < RESET_DAY:
        m -= 1
        if m == 0: y, m = y - 1, 12
    return dt.datetime(y, m, RESET_DAY, tzinfo=dt.timezone.utc)

def load_state():
    try: return json.load(open(STATE_PATH))
    except Exception: return {}

def save_state(s):
    if DRY: return
    json.dump(s, open(STATE_PATH, "w"), indent=1)

def workflow_names(ids):
    """Resolve workflow ids to names, fetched only when an alarm actually fires."""
    names = {}
    try:
        for w in api("GET", "/workflows?limit=250").get("data", []):
            names[str(w.get("id"))] = w.get("name") or str(w.get("id"))
    except Exception as e:
        log("WARN could not resolve workflow names:", e)
    return {i: names.get(i, i) for i in ids}

# ---- main -------------------------------------------------------------------
def main():
    global KEY
    KEY = n8n_key()
    now = dt.datetime.now(dt.timezone.utc)
    cs = cycle_start(now)
    st = load_state()
    if st.get("cycle_start") != cs.isoformat():
        log("cycle rollover -> new cycle", cs.isoformat())
        st = {"cycle_start": cs.isoformat(), "count": 0, "last_seen": cs.isoformat(),
              "warned": False, "tripped": False}
    st.setdefault("rate_alerted", {})

    last_seen = st["last_seen"]
    # pull executions newer than last_seen (paginate), count them overall and per workflow
    new, newest, cursor, pages = 0, last_seen, "", 0
    per_wf = {}
    while True:
        q = "/executions?limit=250" + (f"&cursor={cursor}" if cursor else "")
        r = api("GET", q); data = r.get("data", [])
        stop = False
        for e in data:
            t = e.get("startedAt") or ""
            if t > last_seen:
                new += 1
                wf = str(e.get("workflowId") or "unknown")
                per_wf[wf] = per_wf.get(wf, 0) + 1
                if t > newest: newest = t
            else:
                stop = True
        cursor = r.get("nextCursor") or ""
        pages += 1
        if stop or not cursor or pages >= 20:
            break
    st["count"] += new
    st["last_seen"] = newest

    elapsed = (now - cs).total_seconds()
    cyc_len = (cycle_start(now + dt.timedelta(days=32)) - cs).total_seconds()
    frac = max(elapsed / cyc_len, 1e-6)
    projected = st["count"] / frac

    # Hours actually covered by this sample. A missed cron run must not read as a spike, so
    # the divisor is the real elapsed window, floored so a double run cannot inflate a rate.
    prev = parse_ts(last_seen)
    window_h = max(((now - prev).total_seconds() / 3600.0) if prev else 1.0, 0.25)

    log(f"cycle={cs.date()} count={st['count']} (+{new}) projected={projected:.0f} "
        f"warn@{WARN_AT} critical@{CRITICAL_AT} window={window_h:.2f}h workflows={len(per_wf)} dry={DRY}")

    # WARN
    if not st.get("warned") and (st["count"] >= WARN_AT or projected >= PROJECT_WARN):
        st["warned"] = True
        telegram(f"WARNING n8n governor: {st['count']} execs this cycle (projected ~{projected:.0f}). "
                 f"Approaching cap. This governor alerts only, it does not deactivate anything.")
        log("WARN alert sent")

    # CRITICAL. Alert only. Deactivation was removed 2026-09-09 on Krish's ruling.
    if st["count"] >= CRITICAL_AT and not st.get("tripped"):
        st["tripped"] = True
        telegram(f"CRITICAL n8n governor: {st['count']} execs this cycle, past the {CRITICAL_AT} line. "
                 f"No workflow has been touched. Deciding what to switch off is a human call.")
        log(f"CRITICAL alert sent at {st['count']}")

    # RATE. Per-workflow hourly spike, the shape a runaway actually takes.
    spikes = []
    for wf, c in per_wf.items():
        rate = c / window_h
        if rate < RATE_ALARM_PER_WF:
            continue
        last = parse_ts(st["rate_alerted"].get(wf))
        if last and (now - last).total_seconds() < RATE_COOLDOWN_HRS * 3600:
            log(f"rate spike on {wf} at {rate:.0f}/h, inside cooldown, not re-alerting")
            continue
        spikes.append((wf, c, rate))
    if spikes:
        names = workflow_names([w for w, _, _ in spikes])
        lines = "\n".join(f"- {names.get(w, w)} ({w}): {c} execs, ~{r:.0f}/h" for w, c, r in spikes)
        telegram(f"RATE ALARM n8n governor: {len(spikes)} workflow(s) above {RATE_ALARM_PER_WF}/h "
                 f"over the last {window_h:.1f}h. Nothing has been deactivated.\n{lines}")
        for w, _, _ in spikes:
            st["rate_alerted"][w] = now.isoformat()
        log(f"RATE alarm sent for {len(spikes)} workflow(s)")

    save_state(st)
    log("done")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log("FATAL", repr(e)); sys.exit(1)
