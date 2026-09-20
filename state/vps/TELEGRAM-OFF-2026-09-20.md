# Telegram push changes, 2026-09-20

## Ruling applied

Krish ruled that the OpenClaw OS is pull-only, with Lauren's briefings retained as the deliberate exception. During execution, Krish explicitly overrode the original instruction for `loz-api-monitor` and ordered that job back on.

The source file was backed up before any edit:

- Source: `/root/.openclaw/cron/jobs.json`
- Backup: `/root/.openclaw/cron/jobs.json.bak-2026-09-20`
- Backup verification: present, 55,551 bytes, mode `600`, and byte-identical to the source before editing.

## What changed

### `Arlo Autonomous OS Diagnostics Sentinel`

The job remains in the file with its schedule and prompt intact. Its enabled value changed from `true` to `false`.

Reason: it could push urgent diagnostics to Krish through Telegram, while the same diagnostics already run from root cron without model cost.

### `agatha-state-of-union`

The job remains enabled. Its prompt now writes the brief through the existing `audit_log` path only and explicitly forbids Telegram sending.

The audit content remains:

1. What shipped yesterday.
2. What is blocked today and why.
3. Where an explicit go or no-go decision from Krish is required.

## What was left unchanged

- `loz-api-monitor` is enabled. It was briefly disabled after the first approval, then restored after Krish explicitly ordered it back on. Its final state matches the backup.
- `loz-news-briefing-9am` is enabled and still serves Lauren.
- `loz-news-briefing-2pm` is enabled and still serves Lauren.
- `loz-news-briefing-6pm` is enabled and still serves Lauren.
- `loz-breaking-news-monitor` is enabled and still serves Lauren.
- `api-credit-monitor` remains disabled.
- `Maa morning check-in` remains disabled.
- `Maa evening medication reminder` remains disabled.
- No job was deleted.
- No schedule changed.
- The job count remains 45.

## Readback

The literal Telegram scan found seven jobs. The three scheduled Lauren briefing jobs delegate to a briefing template and do not contain the word Telegram in their gateway prompt, so they are included explicitly below as required.

| Job | Enabled | Sends to |
|---|---:|---|
| `agatha-state-of-union` | true | Nobody. Audit log only. |
| `loz-api-monitor` | true | Krish, retained by explicit override. |
| `api-credit-monitor` | false | Krish when enabled. |
| `Maa morning check-in` | false | Maa when enabled. |
| `Maa evening medication reminder` | false | Maa when enabled. |
| `Arlo Autonomous OS Diagnostics Sentinel` | false | Krish when enabled. |
| `loz-news-briefing-9am` | true | Lauren. |
| `loz-news-briefing-2pm` | true | Lauren. |
| `loz-news-briefing-6pm` | true | Lauren. |
| `loz-breaking-news-monitor` | true | Lauren. |

Structural comparison against the backup found exactly two net differences:

- `Arlo Autonomous OS Diagnostics Sentinel.enabled`
- `agatha-state-of-union.payload.message`

## Reversal commands

Reverse the diagnostics sentinel disablement:

```bash
sudo python3 -c 'import json,os,pathlib; p="/root/.openclaw/cron/jobs.json"; d=json.load(open(p)); next(j for j in d["jobs"] if j["name"]=="Arlo Autonomous OS Diagnostics Sentinel")["enabled"]=True; q=p+".reverse.tmp"; pathlib.Path(q).write_text(json.dumps(d,indent=2)+"\n"); os.chmod(q,os.stat(p).st_mode); os.replace(q,p)'
```

Reverse the Agatha prompt change by restoring only that prompt from the backup:

```bash
sudo python3 -c 'import json,os,pathlib; p="/root/.openclaw/cron/jobs.json"; b="/root/.openclaw/cron/jobs.json.bak-2026-09-20"; d=json.load(open(p)); o=json.load(open(b)); next(j for j in d["jobs"] if j["name"]=="agatha-state-of-union")["payload"]["message"]=next(j for j in o["jobs"] if j["name"]=="agatha-state-of-union")["payload"]["message"]; q=p+".reverse.tmp"; pathlib.Path(q).write_text(json.dumps(d,indent=2)+"\n"); os.chmod(q,os.stat(p).st_mode); os.replace(q,p)'
```
