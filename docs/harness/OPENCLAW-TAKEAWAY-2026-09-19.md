# OpenClaw VPS takeaway, 2026-09-19

Operator handoff for the OpenClaw VPS. Written for someone with shell access to the host: Krish, from the Windows machine LORIMER, where the `openclaw` ssh alias works. Follow it top to bottom. Nothing in section 2 changes the host. Every change in section 4 is its own approval gate and waits for a yes.

**Sources.** Every fact about the host below is grounded in one file and cited by its fact number in square brackets, like `[F69]`:

- `docs/harness/VPS-FACTS-2026-09-19.md` in this repository (compiled 2026-09-19 from repository files only; nothing in it was read from the host).

Three facts about the database and the factory are not about the VPS and are not in that file. They are cited to the repository file that holds them:

- `[MIG]` `/home/user/control-center/supabase/migrations/20260919100000_every_output_is_a_suggestion.sql`
- `[FACTORY]` `/home/user/control-center/scripts/n8n/cleo-omnichannel-content-factory.workflow.json`
- `[ALIGN]` `/home/user/ai-harness/docs/harness/VPS-ALIGN-2026-09-19.sh` (the audit script itself)

Where neither the facts file nor the repository says something about the host, this document says **unknown until the audit runs**. Nothing about the host has been invented.

**Copy rule for anything you paste back.** Never paste a credential, a token, a key or a matched line from section 6 of the audit. Filenames only `[F91]`.

---

## 1. Why you are here

1. The publication now runs three subchannels: `split_the_bill` on Wednesdays, `mind_the_gap` on Fridays as the hero, and `lift_the_lid` standing with no fixed day. `lift_the_lid` was retired on 2026-09-18 and reinstated on 2026-09-19 `[F93]`.
2. Seven names are retired and must not be written anywhere new: `money_of_ai`, `built_with_ai`, `The Money of AI`, `Built with AI`, `mindmaker_live`, `techonomic`, `builder_economy`. They resolve through `public.format_aliases`, and `venture_formats.mandate` in Mindmaker OS is the only source of format truth `[F93]` `[MIG]`.
3. The database, both apps and the n8n factory are aligned. The factory's Route by Channel switch now accepts the three slugs: `split_the_bill` routes to paid, `lift_the_lid` to built, `mind_the_gap` to house `[FACTORY]` `[ALIGN]`.
4. Every machine output is now a row in `public.suggestions` with a reason that cannot be empty, and a hand-off is a named row in `public.handoff_reasons` rather than a silent null `[MIG]`.
5. The VPS is the one surface nobody has checked, and it runs jobs every sixty seconds `[F15]` `[ALIGN]`. No VPS script is checked into any repository `[F37]`, so the only way to know what the host carries is to run the audit and read what comes back.

---

## 2. Read-only audit first

### 2.1 How to run it

From PowerShell on LORIMER:

```
ssh openclaw 'sudo bash -s' < VPS-ALIGN-2026-09-19.sh
```

The script header says `bash -s` without `sudo` `[ALIGN]`. Use `sudo`. The ssh user is `krish` with passwordless sudo, and `/root/.openclaw` is root-owned, so without sudo the tree can look absent and half the sections print NOT FOUND for the wrong reason `[F101]`.

The script only prints and greps. It starts, stops, enables, disables, installs, edits and deletes nothing `[F113]` `[ALIGN]`. Paste the whole output back (section 6 of this document).

### 2.2 What each section's output means, and the decision

**Section 1, HOST.** Prints hostname, uptime, OS release and disk.

- Expected: Ubuntu 22.04. Uptime was 196 days on 2026-09-09 `[F102]`.
- Anything else: you are on the wrong machine. Stop and report.

**Section 2, DOES THE OPENCLAW TREE EXIST.**

- Expected: the tree exists, about 4.5 GB, root-owned `[F57]`.
- `ABSENT: /root/.openclaw does not exist`: first suspect is that the script ran without sudo `[F101]`. Re-run with `sudo bash -s`. If it is still absent, stop and report; every other section will be empty and nothing in section 4 applies until this is understood.

**Section 3, THE SPEND CAP.** Three lines: the governor script, its state file, and whether the word governor is in the root crontab. This is the section that matters most `[F81]`. Read section 3 of this document before deciding anything.

**Section 4, FULL CRON INVENTORY.** The live root crontab minus comments, and a count.

- The checked-in snapshot is 12 job lines `[F14]`. The live crontab held 31 active entries on 2026-09-09 `[F31]` and grew from 43 lines to 46 when the heartbeat was installed that day `[F29]`. So a count in the thirties or forties is normal, and a count near 12 means something was lost.
- The snapshot is stale by the harness's own verdict: "It describes a machine that no longer exists" `[F36]`. Do not delete a live line because the snapshot lacks it.
- Known cadence disagreement: `poll_sync_queue.py` is every minute in the snapshot and every 5 minutes on the host and in the architecture doc `[F115]`. Whichever the live crontab shows is the truth.
- Decision: paste it back. No line is removed from this section's output. The snapshot in the repository gets regenerated from what you paste `[F36]`.

**Section 5, FORMAT VOCABULARY.** Two lists: files carrying a retired name, then files carrying a live slug.

- Files under `skills/agent-*/SKILL.md` are rendered from `agents.brief_content` every 15 minutes `[F39]` `[F98]`. A retired name there is fixed in the database, not on the host; a host edit is overwritten within one tick.
- `skills/content-corpus/SKILL.md` holds the channel mandates and was created naming three brands now on the retired list `[F95]` `[F96]`. It has drifted from the database copy before `[F97]`.
- Any file rendered or copied between 2026-08-29 and 2026-09-17 can carry `money_of_ai` or `built_with_ai`, because the database itself used those slugs in that window `[F99]`.
- Matches inside `agents/*/sessions/*.jsonl` are history, not code. Leave them.
- `NONE: this host has never seen a live format slug` is one of the possible outputs `[F94]`. It is not an error. It means every format decision on the host still runs on old vocabulary or on none.
- Decision: the retired-name list becomes gate 4.1. The live-slug list tells you how much of the host has already caught up. No edits yet.

**Section 6, CREDENTIALS IN PLAINTEXT.** Filenames only.

- Expected: a long list. On 2026-09-09 the same `service_role` key appeared in 893 files: 815 session transcripts, 2 files in `media/inbound/`, and about 25 live code and config files including `fire-pending-flags.py`, `cc-sync-engine.sh`, `poll_sync_queue.py`, `render-identity.py`, `inbox-decay.sh`, `vera-contradiction-audit.sh`, `supabase-tools.py`, `learning_router.py`, `capture_win.py`, `deliver_gate.py`, `check_apis.py`, `cc-doc-creator.sh`, `exec-approvals.json`, `TOOLS.md`, `agent-arlo/SKILL.md` and two n8n workflow backups `[F86]`. The script caps its output at 20 filenames `[ALIGN]`, so the list you see is a sample, not the total.
- `sync-briefs-to-skills.sh` and `regenerate-standards-digest.py` were fixed on 2026-09-09 to read the key from the environment `[F84]`. If either still matches, the fix did not hold. `render-identity.py` is expected to match because it kept a hardcoded fallback `[F85]`.
- Decision: the list feeds gate 4.3. Do not paste any matched line back `[F91]`.

**Section 7, WHAT THIS HOST WRITES TO.** A count of `rest/v1/<table>` URLs per table.

- This is the only method on record for finding out what the host writes, because no VPS script is checked in `[F37]` `[F38]`.
- Tables the architecture doc says the host writes: `system_health` `[F46]`, `home_intelligence` and `tasks` `[F48]` `[F49]`, `audit_log` `[F50]`, `tasks_inbox` `[F51]`, `vera_gaps` `[F52]`, `api_usage_state` `[F53]`, plus RPC calls to `audit_critical_infra` `[F54]` and `archive_stale_inbox_ideas` `[F51]`. Some writes go through the Control Center API rather than straight to Supabase, so they will not show up here `[F55]`.
- Decision: if any of `content_themes`, `content_slate_rulings`, `shifts`, `guests`, `video_studio_jobs` or `content_ideas` appears, it feeds gate 4.2. Which VPS scripts write to those six tables is **unknown until the audit runs**.

**Section 8, HEARTBEAT.** The last five lines of `/var/log/vps-heartbeat.log`.

- Expected: a line from within the last hour, because the job runs hourly at 5 past `[F29]`. The latest recorded heartbeat before this handoff was 2026-09-19T09:05:09Z, status ok, cycle start 2026-09-01, 2,917 executions this cycle, 45 gateway jobs defined `[F76]`.
- `no heartbeat log`: the job may never have run on this host, or logs elsewhere. Whether the cron line is present is **unknown until the audit runs**; section 4 of the output will show it if it is there.
- A `degraded` status means the governor counter or the gateway job count came back null `[F75]`.
- Decision: feeds gate 4.4.

---

## 3. The spend cap

The n8n Cloud plan cap is 10,000 executions a month, and the goal is to stay at or under 8,000 with margin `[F65]`. The governor is the only thing on any surface that watches that number, and it runs on this host rather than in n8n precisely so it cannot be starved by the thing it measures `[F80]`.

What the governor is, as last recorded: `/root/.openclaw/workspace/scripts/n8n-exec-governor.py`, hourly `[F63]`, found live on 2026-09-09 at `0 * * * *`, `dry=False`, log at `/var/log/n8n-governor.log` `[F69]`. State at `scripts/n8n-governor-state.json` with `cycle_start`, `count`, `last_seen`, `warned`, `tripped`; log lines read `cycle=... count=... projected=... warn@7000 trip@8000 dry=False` `[F70]`.

What it does now: **it warns and never acts.** On 2026-09-09 the branch that deactivated workflows was removed, because had it ever fired it would have deactivated 77 of 86 workflows with no record of what was active and no path back. `TRIP_AT` became `CRITICAL_AT` `[F71]`. A per-workflow alarm at 200 executions an hour was added `[F72]`. Its alerts go to `/var/log/os-pull-only-alerts.log`, not Telegram `[F73]`. The harness's own words: "The execution cap still does not exist anywhere. The governor now warns and never acts, which was the ruling, so nothing caps n8n spend. That is a deliberate, known gap" `[F74]`. The architecture doc still describes the old tripping behaviour and has not been updated `[F119]`.

### 3.1 If section 3 shows the governor is live on this host

All three lines came back: the script exists, the state file printed, and a crontab line mentions governor.

1. Do not switch this host off and do not remove the cron line. Switching off the VPS removes the only watcher on n8n execution spend `[F68]`.
2. Read `count` in the printed state file against the warn line of 7,000 `[F64]`. The last recorded count was 2,917 with twelve days of the cycle gone `[F76]`; the count was 1,680 on 2026-09-09 `[F70]`. A count that is far higher than that trend, or a `cycle_start` that is not the first of this month, is worth a line in your report.
3. If the fleet goes quiet, do not blame the governor first. A trip stamps `updatedAt` on every toggled workflow; on 2026-08-12 only one workflow had changed and the governor was not the cause `[F67]`. Since 2026-09-09 it cannot trip at all `[F71]`.
4. Know that a warning is all you will get. There is no automatic cap. If the count approaches 7,000, the decision to act is Krish's and is made from n8n, not from this host.
5. Nothing to change in this section. The governor stays exactly as it is.

### 3.2 If section 3 shows the governor is not live on this host

One or more lines came back NOT FOUND or NOT IN ROOT CRONTAB.

1. Then nothing anywhere caps or even watches n8n execution spend, since the governor was the only watcher `[F74]` and the harness recorded that if it is absent "the risk was theoretical" only in the sense that no script was ever holding it `[F68]`.
2. Before concluding anything, check that the audit ran with sudo `[F101]`. A missing state file with a present script and a present cron line is a different situation from all three missing.
3. Read the heartbeat's last line in section 8. The heartbeat reads `count` from the same state file and reports null, not zero, when the file is absent `[F75]`. A null there confirms the state file is gone.
4. Do not install, restore or write a governor from this document. That is a change and needs its own approval.
5. Report it as the first line of your report. The rule on record for any wind-down is: rehome the execution cap, prove the new cap in a controlled test, then reassess `[F114]`. Until a cap exists somewhere else, this host cannot be retired and nothing that touches n8n spend should move.

---

## 4. Changes to make, each as its own approval gate, smallest first

Rules that apply to every gate:

- Read-only audit output in hand first. No gate opens from memory or from this document alone.
- One gate, one approval, for that named change and that named file. Approval does not carry forward to the next gate.
- Back up before editing, in the house pattern already on the host: a sibling copy with a dated suffix, like `n8n-exec-governor.py.bak-2026-09-09` `[F71]` and `regenerate-standards-digest.py.bak-jwt-2026-09-09` `[F84]`.
- Verify after editing the way 2026-09-09 verified: `bash -n` or `py_compile`, a real run, and a fail-closed test where a fallback was removed `[F84]`.
- Any file under `skills/agent-*/` is rendered from the database every 15 minutes `[F39]` `[F98]`. Do not edit it on the host.

### Gate 4.1: retired vocabulary in VPS scripts

**Input:** the retired-name list from audit section 5.

**What to do, per file:**

- If the file is `skills/agent-<id>/SKILL.md`: not a host change. The fix is in `agents.brief_content` for that agent, in the database `[F39]` `[F98]`. On the 2026-07-10 retirement all 14 brief rows had to be cleaned `[F98]`. Report the agent ids and stop.
- If the file is `skills/content-corpus/SKILL.md`: this is the channel mandate file that Cleo, Nell and Nova load before composing `[F95]`. Its content is now supposed to come from `venture_formats.mandate`, the only source of format truth `[MIG]` `[F93]`. Do not rewrite mandates by hand on the host; report the file and let the source be fixed. Whether it is copied from the database or hand-maintained on the host is **unknown until the audit runs** `[F97]`.
- If the file is a script under `workspace/scripts/`, `workspace-ops/scripts/` or `cron/`: propose a one-line-per-name replacement, retired slug to live slug, with the mapping from the factory: `money_of_ai` and `techonomic` and `The Money of AI` go to `split_the_bill`; `built_with_ai` and `builder_economy` and `Built with AI` go to `lift_the_lid`; `mindmaker_live` goes to `mind_the_gap` `[FACTORY]`. Ask for approval with the filename and the diff. Edit only after the yes.
- If the file is a session transcript, a log, a backup or `media/inbound/`: leave it. It is history.

**Why smallest:** it is a string replacement inside a file you can back up and syntax-check, and a wrong edit shows up in the next cron run's log.

### Gate 4.2: scripts writing to a table that now has a foreign key

**Input:** audit section 7, filtered to `content_themes`, `content_slate_rulings`, `shifts`, `guests`, `video_studio_jobs` and `content_ideas`.

**The change in the database:** the brief for this handoff says `content_themes.channel`, `content_slate_rulings.channel`, `shifts.lane`, `guests.format`, `video_studio_jobs.series` and `content_ideas.lane_slot` now carry a foreign key to the format vocabulary. The repository checkout read for this document does not hold a migration file naming those six constraints; the 2026-09-19 migration says the vocabulary moved from CHECK constraints with literal values to foreign keys "same reason as venture_formats on 2026-09-19", so that an unknown value "still fails the write and names itself in the error" `[MIG]`. Confirm the six constraints against the live schema before editing any script.

**What the write must send now:**

- One of `split_the_bill`, `mind_the_gap` or `lift_the_lid`, spelled exactly as `venture_formats` holds it `[F93]`.
- Never a retired name. If a script only knows a retired name, the named fix is to resolve it through `public.format_aliases` first, "which is what that ledger is for" `[MIG]`.
- Never a guess. If the script cannot tell which format a piece belongs to, it must not fall through to a default. The named hand-off for that case is a `public.suggestions` row with `proposed` null, `handoff_reason` set to `format_not_in_venture_formats` or `format_ambiguous_question`, and a `reason` of at least twelve characters `[MIG]`.
- Expect a failed insert to say which value was refused. That is the design, not a bug `[MIG]`.

**What to do:** which VPS scripts write to these six tables is **unknown until the audit runs** `[F37]` `[F38]`. For each script that section 7 names against one of those tables, read what value it sends, propose the change as its own diff, and ask for approval per file. `content_ideas.lane_slot` was set to `money_of_ai` and `built_with_ai` on 2026-08-29 `[F99]`, so a script that copied those values into its own code is the most likely find.

### Gate 4.3: the plaintext credential rotation from the 2026-09-09 audit

**Input:** audit section 6 (filenames only).

**What was found:** a plaintext `service_role` JWT in two sibling scripts, `sync-briefs-to-skills.sh` and `regenerate-standards-digest.py` `[F82]` `[F83]`. Both were fixed the same day to read `SUPABASE_SERVICE_KEY` from the environment, falling back to the root-only `/root/.openclaw/credentials/supabase.env` (mode 600), with no hardcoded fallback so both fail closed `[F84]`. `render-identity.py` still carries the key because its earlier migration kept a hardcoded fallback `[F85]`. The key is not rotated and appears in 893 files on the host `[F86]`. Issued 2026-04-14, valid until 2036-04-14 `[F88]`. It is the same key as the SEV-0 leak of 2026-07-01 `[F90]`.

**The sequence on record, and the order is the whole point:** point every consumer at `SUPABASE_SERVICE_KEY`, confirm each still runs, then issue the new key and update the one credentials file. Rotating first would take down the sync engine, identity rendering, flag firing and the nightly audits within minutes, silently `[F87]`.

Each step below is its own gate.

- **4.3a** For each live script in the section 6 list that still hardcodes the key (start with `render-identity.py` `[F85]`, then the every-2-minute and every-5-minute jobs `fire-pending-flags.py`, `cc-sync-engine.sh`, `poll_sync_queue.py` `[F86]`), propose the same change made on 2026-09-09: read from `SUPABASE_SERVICE_KEY`, fall back to the mode-600 env file, no hardcoded fallback `[F84]`. One file per approval. Back up, edit, `bash -n` or `py_compile`, real run, fail-closed test `[F84]`.
- **4.3b** Config files in the list (`exec-approvals.json`, `TOOLS.md`, `agent-arlo/SKILL.md`, the two n8n workflow backups `[F86]`) each need their own decision, because a config file has no runtime to read an env var. Propose per file, do not batch.
- **4.3c** Only after every consumer runs from the env file: issue the new `service_role` key and update `/root/.openclaw/credentials/supabase.env` `[F84]` `[F87]`. Issuing a key is a credential rotation and needs Krish's explicit yes for that action alone. The 815 transcripts and the 2 inbound files `[F86]` are closed by the rotation, not by editing.
- **4.3d** Two related exposures, both still open: a Supabase personal access token (the `sbp_` shape) in `credentials/supabase.env`, already flagged for rotation; and the repo-scoped GitHub token from `TOKENS.md`, exposed since 2026-06-11 and now installed for the heartbeat in `/root/.openclaw/workspace/scripts/.vps-heartbeat.env`, which should be replaced by a fine-grained PAT scoped to `krishanraja/ai-harness` alone `[F89]`. Each is its own gate.

Never write any of these values into a file you paste, a commit, a chat or a report. Refer to them by variable name only `[F91]`.

### Gate 4.4: the heartbeat

**Input:** audit section 8, and the heartbeat line in audit section 4 if present.

**What it is:** `vps-heartbeat.sh`, hourly at 5 past, installed 2026-09-09 with the env file sourced first `[F29]`. It writes to GitHub, not Supabase: a `repository_dispatch` to `krishanraja/ai-harness` with event type `harness-machine-heartbeat` `[F60]`. It refuses to run without `GITHUB_HEARTBEAT_TOKEN` in the environment, exit 78 `[F75]`. The harness opens a finding when the entry is missing or older than 48 hours, with the fix text "Check the hourly cron entry on the VPS and that GITHUB_HEARTBEAT_TOKEN is still valid" `[F77]`. `openclaw-vps` stays a permanently declared surface by ruling of 2026-09-09 `[F78]`.

**What to do:**

- Section 8 shows a line from the last hour with status ok: nothing to change.
- Section 8 shows lines but the latest is old, or status `degraded`: `degraded` means the governor counter or the gateway job count came back null `[F75]`. Cross-read with audit section 3. Report; the fix is usually in gate 4.3 (the token) or section 3 (the state file), not in the heartbeat itself.
- Section 8 shows `no heartbeat log` and section 4 shows no heartbeat line: the cron line is missing. Propose reinstalling the recommended line from the harness script, in the form recorded on 2026-09-09 with the env file sourced first `[F29]`. Installing a cron line is a change and needs approval.
- Exit 78 in the log: the token is missing from `/root/.openclaw/workspace/scripts/.vps-heartbeat.env` `[F75]` `[F89]`. Replacing the token is gate 4.3d.

---

## 5. What must never be done from the VPS

- **Publishing.** Nothing on this host publishes. The publication's outputs go through the n8n factory and Control Center, and no n8n workflow calls the VPS `[F59]`.
- **Sending.** The host is pull-only. Seven scripts that used to send Telegram directly now append to `/var/log/os-pull-only-alerts.log`; the OS never initiates contact with Krish `[F61]`. The exceptions are deliberate and are not yours to widen: Lauren's `loz` briefings still send, and the two `maa` reminder jobs were disabled 2026-09-07 at Krish's request `[F109]`.
- **Spending.** The gateway cron jobs at `/root/.openclaw/cron/jobs.json` spawn Claude Code sessions and cost real tokens `[F32]`. Do not add, enable or re-enable one. The n8n execution count is watched from here but never acted on from here (section 3).
- **Writing a suggestion without a reason.** `public.suggestions.reason` is NOT NULL and at least twelve characters. A row either proposes something or hands off with a named `handoff_reason`, never neither and never both `[MIG]`. A script that cannot say why it decided something does not write the row. The named hand-off for anything that would publish, send, schedule or spend is `external_action_needs_krish`, and its fix hint is "Not a gap to close. The approval gate is the design" `[MIG]`.
- **Touching the four personal-life agents.** `loz`, `steph`, `finno` and `maa` were left entirely alone by ruling of 2026-09-09: not read, not listed, not catalogued `[F107]`. The `loz` sandbox container is not a leftover `[F114]`.
- **Restarting the gateway by the CLI.** If an `openclaw.json` change is ever approved, the restart is `sudo XDG_RUNTIME_DIR=/run/user/0 systemctl --user restart openclaw-gateway.service`; the `openclaw gateway restart` CLI does not see the systemd user unit and is a no-op `[F104]`. No `openclaw.json` change is proposed in this document.

---

## 6. How to report back

1. Paste the whole audit output, sections 1 through 8, exactly as printed `[F113]` `[ALIGN]`. Section 6 prints filenames only by design; do not go and fetch the matched lines `[F91]`.
2. Do not paste any credential, token, key, `botToken`, or the contents of `credentials/`, `integrations/google/tokens.json`, any `auth-state.json`, or `.vps-heartbeat.env` `[F92]` `[F89]`. Refer to a secret by its variable name.
3. Say which of section 3.1 or 3.2 applied. That is the first line of the report.
4. For each gate in section 4, say one of: nothing found, proposed and waiting for approval, approved and done with the verification you ran, or not applicable.
5. If two things you saw disagree with each other or with this document, say so rather than picking one. Known disagreements on record are: `poll_sync_queue.py` cadence `[F115]`, the snapshot size `[F116]`, the gateway job count of ~38 versus 33 versus 45 `[F117]`, brief rendering `[F118]`, the governor's action `[F119]` and alert path `[F120]`, the `audit_critical_infra` cadence `[F121]`, and `learning_events` `[F122]`. A new one is a finding, not a mistake.
6. The three jobs that were firing into nothing on 2026-09-09 are worth one line each if you see them: `poll_sync_queue.py` had written nothing to its log since 2026-08-24, `verify_doc.py --auto-repair` was crashing every 30 minutes on a missing file, and five per-agent logs in `/tmp` had been frozen since 2026-08-29 `[F108]` `[F100]`.
7. The repository clone at `/root/Projects/control-center` was 11 days behind main with a dirty tree on 2026-09-09 `[F62]`. Its current state is **unknown until the audit runs**; the audit script does not check it, so `cd /root/Projects/control-center && git status --short && git log -1 --format=%h` is one extra read-only command worth adding to your paste.
