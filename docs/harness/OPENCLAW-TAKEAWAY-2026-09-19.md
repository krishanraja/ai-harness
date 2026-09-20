# OpenClaw VPS takeaway, 2026-09-19

Operator handoff for the OpenClaw VPS, written for someone with shell access to the host: Krish, from the Windows machine LORIMER, where the `openclaw` ssh alias works.

**Read this first.** The read-only audit that the first draft of this document asked Krish to go and run had already been run, on the host, as root, on 2026-09-19 between 15:07 and 15:09 UTC. Its verbatim 183-line output and its report are in this repository. So this is not a list of things to go and find out. It is a record of what came back, what was changed on the back of it, and what is still open.

**Sources.** Facts about the host are cited by fact number in square brackets, like `[F69]`, or by one of the markers below.

- `docs/harness/VPS-FACTS-2026-09-19.md` in this repository (compiled 2026-09-19 from repository files only; nothing in it was read from the host). Where it disagrees with the audit, the audit wins, because the facts file never saw the machine.
- `[OUT]` `state/vps/ALIGN-2026-09-19-audit.txt`: the verbatim audit output, 183 lines, completed 2026-09-19 15:09:19 UTC.
- `[RPT]` `state/vps/ALIGN-2026-09-19.md`: the audit and change report for the same run.
- `[NOW]` `NOW.md` in this repository, which records the run.
- `[CRON]` `/home/user/control-center/scripts/cron/crontab.txt`, the checked-in crontab snapshot, regenerated from this audit in control-center commit `69376a2`.

Both `[OUT]` and `[RPT]` were committed in `6c9cc71` at 15:53 UTC and merged to main in `987ac5f` at 16:35 UTC. This document's own first version is `b654fb0` at 16:36 UTC, one minute later, in the same repository.

Three facts about the database and the factory are not about the VPS. They are cited to the repository file that holds them:

- `[MIG]` `/home/user/control-center/supabase/migrations/20260919100000_every_output_is_a_suggestion.sql`
- `[FACTORY]` `/home/user/control-center/scripts/n8n/cleo-omnichannel-content-factory.workflow.json`
- `[ALIGN]` `/home/user/ai-harness/docs/harness/VPS-ALIGN-2026-09-19.sh` (the audit script itself)

Independent verification on 2026-09-19 refuted several lines of the first draft. Each correction cites the file that settles it:

- `[ALIASES]` `/home/user/makeyourmindup/migrations/2026-09-19-format-identity-and-aliases.sql` (the `public.format_aliases` ledger, lines 89 to 96)
- `[FKEYS]` `/home/user/makeyourmindup/migrations/2026-09-19-format-foreign-keys.sql` (the six foreign keys, lines 61 to 72, and the applied-and-read-back footer, lines 76 to 87)
- `[INTAKE]` `/home/user/makeyourmindup/engine/INTAKE_RUNNER_SPEC.md`
- `[TAX]` `npx tsx scripts/check-content-taxonomy.mts`, run in `/home/user/control-center` at HEAD `0481984` on 2026-09-19
- `[ARCH]` `/home/user/control-center/docs/MINDMAKE_OS_ARCHITECTURE.md`
- `[GOV]` `/home/user/ai-harness/scripts/n8n-exec-governor.py`
- `[HBSH]` `/home/user/ai-harness/scripts/vps-heartbeat.sh`
- `[HB]` `/home/user/ai-harness/state/heartbeats.json` (lines 19 to 24)
- `[LIVE]` `/home/user/ai-harness/state/vps-liveness-audit-2026-09-09.md` (lines 101 to 119)
- `[AUDIT]` `/home/user/ai-harness/docs/harness/VPS-AUDIT.md` (line 127)

Where something about the host was not covered by the audit, this document says so and names what would cover it. Nothing about the host has been invented.

**Copy rule.** Never paste a credential, a token, a key or a matched line from section 6 of the audit output. Filenames only `[F91]`.

---

## 1. Why you are here

1. The publication now runs three subchannels: `split_the_bill` on Wednesdays, `mind_the_gap` on Fridays as the hero, and `lift_the_lid` standing with no fixed day. `lift_the_lid` was retired on 2026-09-18 and reinstated on 2026-09-19 `[F93]`.
2. Seven names are retired and must not be written anywhere new: `money_of_ai`, `built_with_ai`, `The Money of AI`, `Built with AI`, `mindmaker_live`, `techonomic`, `builder_economy` `[F93]`. Five of them resolve through `public.format_aliases`: `money_of_ai` to `split_the_bill`, `built_with_ai` to `lift_the_lid`, and `mindmaker_live`, `techonomic` and `builder_economy` to `general`, the holding lane. The ledger also carries the two storage keys `paid` (to `split_the_bill`) and `built` (to `lift_the_lid`) `[ALIASES]`. The two display names, `The Money of AI` and `Built with AI`, have no alias row; they are labels on the retired `venture_formats` rows and do not resolve through the ledger. `venture_formats.mandate` in Mindmaker OS is the only source of format truth `[F93]` `[MIG]`.
3. The database is aligned: the six foreign keys to `venture_formats(slug)` were applied and read back on 2026-09-19 `[FKEYS]`. The n8n factory is partly aligned. Its Route by Channel switch accepts the three slugs, each appearing exactly once in the workflow JSON: `split_the_bill` routes to paid, `lift_the_lid` to built, `mind_the_gap` to house. But its prompt text still lists `mindmaker_live` as a channel, and its teardown check keys on `target_channel === 'paid'` `[FACTORY]`. The Control Center app is not aligned: no file under `src/` or `api/` carries a live slug, 38 tracked files under `src/` or `api/` carry a retired name, and `scripts/check-content-taxonomy.mts` fails on main with eight failures across `VENTURE_FORMATS`, `LANES`, `FACTORY_CHANNELS` and `PUBLIC_SERIES` `[TAX]`. The `makeyourmindup` checkout holds specs, migrations and templates rather than app code, so there is no second app to align yet. The audit script's header says the database, both apps and the factory are aligned `[ALIGN]`; that line is an assertion, not evidence, and nothing in this document rests on it.
4. The rule for machine outputs is defined and not yet obeyed. `public.suggestions` exists with `reason` NOT NULL, a check that the reason is a sentence, and a check that a row either proposes or hands off; a hand-off is a named row in `public.handoff_reasons` rather than a silent null `[MIG]`. No code in `control-center/api`, `control-center/src`, `makeyourmindup` or `ai-harness/scripts` writes to the table, and the only insert on record is in the intake runner spec `[INTAKE]`. The live table held 0 rows when read on 2026-09-19. Nothing on the VPS writes to it either: the host's active direct table writes are `agents`, `sync_queue`, `audit_log`, `events`, `pending_flags`, `tasks`, `google_drive_sync`, `agent_plans`, `corrections`, `home_intelligence`, `api_usage_state` and `system_health`, and `suggestions` is not among them `[RPT]`. The report names the residue in its own open list: machine-selected content proposals were listed and not migrated to `public.suggestions` `[RPT]`.
5. The VPS was the one surface nobody had checked, and on 2026-09-19 it was checked `[NOW]`. It runs 33 active cron entries. The fastest is `fire-pending-flags.py` every 2 minutes; `cc-sync-engine.sh` and `poll_sync_queue.py` run every 5 minutes; `cc-doc-creator.sh`, `render-identity.py` and `write-system-health.py` every 15; the governor hourly `[OUT]`. Two scripts that run on the host are checked into `ai-harness`: `scripts/n8n-exec-governor.py`, whose docstring says it runs on the OpenClaw VPS `[GOV]`, and `scripts/vps-heartbeat.sh`, whose header says to copy it to `/root/.openclaw/workspace/scripts/` `[HBSH]`. Every other script the crontab names lives only on the host, which is why the audit had to be run on the host rather than inferred from the repository.

---

## 2. The read-only audit, and what it returned

### 2.1 How it was run

From a shallow clone of `krishanraja/ai-harness` main at `/root/ai-harness-audit` on the host, revision `dc57cf3`, script `docs/harness/VPS-ALIGN-2026-09-19.sh`, SHA-256 `7bb43b4b...f65f520`. The script was read before it was executed and held read-only inventory commands only `[RPT]`.

It ran as root. That matters: the ssh user is `krish` with passwordless sudo, and `/root/.openclaw` is root-owned, so without root the tree can look absent and half the sections print NOT FOUND for the wrong reason `[F101]`. The script header says `bash -s` without `sudo` `[ALIGN]`; the run used root and the tree was found.

The script only prints and greps. It started, stopped, enabled, disabled, installed, edited and deleted nothing `[F113]` `[ALIGN]`. The report records the same: no publishing, sending, scheduling, spending, database write, webhook call, provider API call or production script execution during the audit `[RPT]`.

Output: 183 lines, 13,410 bytes, completed 2026-09-19 15:09:19 UTC, credential-value scan clean, zero redactions required `[RPT]`. It is at `state/vps/ALIGN-2026-09-19-audit.txt` in full.

### 2.2 What each section returned

**Section 1, HOST.** `openclaw-vps`, Ubuntu 22.04.5 LTS, up 206 days, `/dev/sda1` 75G with 38G used, 52 percent `[OUT]`. This is the right machine.

**Section 2, DOES THE OPENCLAW TREE EXIST.** It exists: `/root/.openclaw`, 4.7 GB, root-owned, mode 700 `[OUT]`. Nothing in this document is blocked by an absent tree.

**Section 3, THE SPEND CAP.** All three lines came back. The governor script is at `/root/.openclaw/workspace/scripts/n8n-exec-governor.py`, mode 755, mtime 2026-09-09 12:21:39 UTC. Its state file printed. The hourly cron line is in the root crontab. So section 3.1 below is the case that applies, not 3.2 `[OUT]` `[RPT]`.

**Section 4, FULL CRON INVENTORY.** 33 active entries `[OUT]`.

- That is in the range the 2026-09-09 evidence predicted: 31 active entries then `[F31]`, growing from 43 lines to 46 when the heartbeat was installed `[F29]`. Nothing was lost.
- The checked-in snapshot held 12 lines and described a machine that no longer existed `[F36]`. It has since been regenerated from this audit and now holds all 33 `[CRON]`, in control-center commit `69376a2` at 16:34 UTC on 2026-09-19, two minutes before this document's own first commit.
- The cadence disagreement over `poll_sync_queue.py` is closed. The live crontab runs it every 5 minutes `[OUT]`, and line 10 of the regenerated snapshot now reads `*/5 * * * * /usr/bin/python3 /root/.openclaw/workspace-ops/scripts/poll_sync_queue.py` `[CRON]`. The every-minute figure was the old snapshot and is gone.
- The snapshot's own footer records the drift it closed: 22 live jobs were missing from the old copy, one path had moved (`vera-n8n-audit.js` is under `scripts/`), and `poll_sync_queue.py` runs every five minutes, not every minute `[CRON]`.

**Section 5, FORMAT VOCABULARY.** The retired-name list came back as 40 paths, capped by the script at 40, and every one of them is history: one file in `media/inbound/`, three files in `cron/runs/`, and the rest session transcripts under `agents/cleo/sessions/` and `agents/ops/sessions/` `[OUT]`. The full inventory behind it is 760 files, classified as 715 label, 41 read, 4 inactive write `[RPT]`.

- Files under `skills/agent-*/SKILL.md` are rendered from `agents.brief_content` every 15 minutes `[F39]` `[F98]`. A retired name there is fixed in the database, not on the host; a host edit is overwritten within one tick. None appeared in this sample.
- `skills/content-corpus/SKILL.md` holds the channel mandates `[F95]`. It was created naming four content brands: Techonomic, The Builder Economy, Signal & Noise, and Mindmake's publication `[F96]` `[ARCH]`. Two of the four are on the retired list, as `techonomic` and `builder_economy`. Signal & Noise is live, and nothing in the source ties the fourth name to a retired slug. It has drifted from the database copy before `[F97]`.
- Any file rendered or copied between 2026-08-29 and 2026-09-17 can carry `money_of_ai` or `built_with_ai`, because the database itself used those slugs in that window `[F99]`.
- Matches inside `agents/*/sessions/*.jsonl` are history, not code. Leave them.
- The live-slug half of the section printed its heading and then nothing at all `[OUT]`. The sentence `NONE: this host has never seen a live format slug` `[F94]` cannot print: in the script at lines 52 to 54 the grep is piped into `head -20`, so the pipeline's exit status is `head`'s, which is always 0, and the `|| echo` never fires `[ALIGN]`. Read the blank heading as the finding the report states plainly: live publication slugs found under `/root/.openclaw`, zero `[RPT]`.
- Outcome: gate 4.1 below has nothing active in it. Every retired name on the host is a label, a read, history or inactive code, and zero eligible active writes carry one `[RPT]`.

**Section 6, CREDENTIALS IN PLAINTEXT.** Filenames only, capped by the script at 20 `[ALIGN]`. The 20 that printed are 11 files under `media/inbound/`, 8 under `cron/runs/`, and `/root/.openclaw/cron/inbox-decay.sh` `[OUT]`, so the printed list is a sample and not the total, exactly as the 2026-09-09 picture of 893 files predicted `[F86]`.

- The report holds the full value-free inventory: 10,066 location rows across 1,651 files, of which 13 were active scripts at the start of the pass `[RPT]`.
- Those active locations are listed by file and line in the report's section A7, and the ten that could be fixed were fixed the same day. Gate 4.3 below records what that closed and what it did not.
- Do not paste any matched line back `[F91]`.

**Section 7, WHAT THIS HOST WRITES TO.** A count of `rest/v1/<table>` URLs per table. The top of the list is `tasks` (11,464), `workflow_runs` (813), `approvals` (706), `audit_log` (355), `agents` (322), `system_config` (311), `home_intelligence` (295) `[OUT]`.

- `content_ideas` appears at 110 `[OUT]`, so it looked at first like an input to gate 4.2. The report resolved it: no active script writes `content_themes.channel`, `content_slate_rulings.channel`, `shifts.lane`, `guests.format`, `video_studio_jobs.series` or `content_ideas.lane_slot`, and no `_was` column was changed `[RPT]`. The count is reads and history, not a protected write.
- Tables the architecture doc says the host writes: `system_health` `[F46]`, `home_intelligence` and `tasks` `[F48]` `[F49]`, `audit_log` `[F50]`, `tasks_inbox` `[F51]`, `vera_gaps` `[F52]`, `api_usage_state` `[F53]`, plus RPC calls to `audit_critical_infra` `[F54]` and `archive_stale_inbox_ideas` `[F51]`. Some writes go through the Control Center API rather than straight to Supabase, so they do not show up here `[F55]`.
- Still not settled: the complete live RPC table set, because live database function definitions were not fetched and no RPC was invoked `[RPT]`. `rollup_api_usage` is the named unknown.

**Section 8, HEARTBEAT.** One line came back: `[2026-09-19T15:05:01Z] heartbeat FAILED http=401 {"message": "Bad credentials", ...}` `[OUT]`.

- So the log exists, the cron line is present (section 4 of the output carries `5 * * * * . /root/.openclaw/workspace/scripts/.vps-heartbeat.env && /root/.openclaw/workspace/scripts/vps-heartbeat.sh`), and the job is firing on schedule `[OUT]` `[CRON]`.
- The failure is a credential, not a dead machine. `GITHUB_HEARTBEAT_TOKEN` is declared in the heartbeat environment file and the response is HTTP 401, so the token is present and invalid `[RPT]`. This is not the exit 78 case, which is what a missing token produces `[F75]`.
- That is why `state/heartbeats.json` stops at 2026-09-19T09:05:09Z `[HB]`. Read the gap as a credential fact and not as a liveness signal `[NOW]`.
- The fix is gate 4.3d, replacing the token. Nothing needs reinstalling.

---

## 3. The spend cap

The n8n Cloud plan cap is 10,000 executions a month, and the goal is to stay at or under 8,000 with margin `[F65]`. The governor is the only thing on any surface that watches that number, and it runs on this host rather than in n8n precisely so it cannot be starved by the thing it measures `[F80]`.

What the governor is: `/root/.openclaw/workspace/scripts/n8n-exec-governor.py`, hourly `[F63]`, confirmed live by this audit at `0 * * * *`, log at `/var/log/n8n-governor.log` `[OUT]` `[F69]`. State at `scripts/n8n-governor-state.json` with `cycle_start`, `count`, `last_seen`, `warned`, `tripped`; log lines read `cycle=... count=... projected=... warn@7000 trip@8000 dry=False` `[F70]`.

What it does now: **it warns and never acts.** On 2026-09-09 the branch that deactivated workflows was removed, because had it ever fired it would have deactivated 77 of 86 workflows with no record of what was active and no path back. `TRIP_AT` became `CRITICAL_AT` `[F71]`. A per-workflow alarm at 200 executions an hour was added `[F72]`. Its alerts go to `/var/log/os-pull-only-alerts.log`, not Telegram `[F73]`. The harness's own words: "The execution cap still does not exist anywhere. The governor now warns and never acts, which was the ruling, so nothing caps n8n spend. That is a deliberate, known gap" `[F74]`.

The architecture doc agrees. Section 3.4.1 of `docs/MINDMAKE_OS_ARCHITECTURE.md`, line 535, now reads "External VPS governor (warning only since 2026-09-09; there is no automated cap) ... It no longer trips ... Corrected 2026-09-19 after a VPS audit re-confirmed warn-only; this paragraph had described the old behaviour for ten days" `[ARCH]`. That correction landed in control-center commit `0481984` at 16:04:49 UTC, which is the same commit this document cites as the HEAD for its `[TAX]` evidence. Only a dated 2026-07-01 changelog entry still carries the old tripping wording, and that is a historical record rather than a description of current behaviour.

### 3.1 The case that applies: the governor is live on this host

Section 3 of the audit returned all three lines: the script exists, the state file printed, and the hourly cron line is in the root crontab `[OUT]`. So this is the live case, and section 3.2 below is kept only as the decision table for a future run.

1. Do not switch this host off and do not remove the cron line. Switching off the VPS removes the only watcher on n8n execution spend `[F68]`.
2. The state file read `count` 2,950 against the warn line of 7,000 `[F64]`, with `cycle_start` 2026-09-01T00:00:00+00:00, `last_seen` 2026-09-19T14:34:56.043Z, `warned` false, `tripped` false, and no workflows recorded as deactivated `[OUT]` `[RPT]`. The most recent observed log run was 15:00:02 UTC `[RPT]`. For trend: 1,680 on 2026-09-09 `[F70]`, and 2,917 at 09:05Z on 2026-09-19 `[HB]`. Nineteen days into the cycle at 2,950, the projection stays well under the warn line.
3. If the fleet goes quiet, do not blame the governor first. A trip stamps `updatedAt` on every toggled workflow; on 2026-08-12 only one workflow had changed and the governor was not the cause `[F67]`. Since 2026-09-09 it cannot trip at all `[F71]`.
4. Know that a warning is all you will get. There is no automatic cap. If the count approaches 7,000, the decision to act is Krish's and is made from n8n, not from this host. The report's own open list leads with this: no automated n8n execution spend cap was proven `[RPT]`.
5. Nothing to change in this section. The governor was not stopped, disabled, edited or moved during the audit, and its mode, mtime and cron line were verified unchanged afterwards `[RPT]`.

### 3.2 If a future run shows the governor is not live on this host

This did not happen on 2026-09-19. Kept as the decision table for the next run, if one or more lines ever come back NOT FOUND or NOT IN ROOT CRONTAB.

1. Then nothing anywhere caps or even watches n8n execution spend, since the governor was the only watcher `[F74]`. Note a disagreement on record. The harness's VPS audit decision table reads, for the absent case: "The risk was theoretical, and retirement proceeds on the other evidence" `[F68]` `[AUDIT]`. The wind-down rule in item 5 below says to rehome the cap first `[F114]`. Report both lines; do not pick one.
2. Before concluding anything, check that the audit ran as root `[F101]`. A missing state file with a present script and a present cron line is a different situation from all three missing.
3. Read the heartbeat's last line in section 8. The heartbeat reads `count` from the same state file and reports null, not zero, when the file is absent `[F75]`. A null there confirms the state file is gone.
4. Do not install, restore or write a governor from this document. That is a change and needs its own approval.
5. Report it as the first line of the report. The rule on record for any wind-down is: rehome the execution cap, prove the new cap in a controlled test, then reassess `[F114]`. Until a cap exists somewhere else, this host cannot be retired and nothing that touches n8n spend should move.

---

## 4. The gates, and where each one stands

Rules that apply to every gate:

- Audit output in hand first. No gate opens from memory or from this document alone.
- One gate, one approval, for that named change and that named file. Approval does not carry forward to the next gate.
- Back up before editing, in the house pattern already on the host: a sibling copy with a dated suffix, like `n8n-exec-governor.py.bak-2026-09-09` `[F71]` and `regenerate-standards-digest.py.bak-jwt-2026-09-09` `[F84]`.
- Verify after editing the way 2026-09-09 verified: `bash -n` or `py_compile`, a real run, and a fail-closed test where a fallback was removed `[F84]`.
- Any file under `skills/agent-*/` is rendered from the database every 15 minutes `[F39]` `[F98]`. Do not edit it on the host.

### Gate 4.1: retired vocabulary in VPS scripts. Nothing found active.

**Input:** the retired-name list from audit section 5, and the 760-file inventory behind it.

**Where it stands:** zero eligible active writes carry a retired name, zero active scripts contain `venture_formats`, and zero active scripts post `target_channel` `[RPT]`. The four write-capable files that do carry a retired name are all inactive, none is in root cron or the OpenClaw job inventory, and in each the retired name is a content or display value rather than one of the protected routing fields. They were left unchanged `[RPT]`. The remaining 756 files are labels, reads and history, and they stay for a later pass `[RPT]`.

**The rules, if a future run does find one:**

- If the file is `skills/agent-<id>/SKILL.md`: not a host change. The fix is in `agents.brief_content` for that agent, in the database `[F39]` `[F98]`. On the 2026-07-06 product retirement all 14 brief rows had to be cleaned `[F98]` (the facts file dates it 2026-07-10; the architecture doc's line sits under its 2026-07-06 heading `[ARCH]`). Report the agent ids and stop.
- If the file is `skills/content-corpus/SKILL.md`: this is the channel mandate file that Cleo, Nell and Nova load before composing `[F95]`. Its content is now supposed to come from `venture_formats.mandate`, the only source of format truth `[MIG]` `[F93]`. Do not rewrite mandates by hand on the host; report the file and let the source be fixed. Whether it is copied from the database or hand-maintained on the host was not settled by this audit, and the report records no mandate restated in a local file `[RPT]` `[F97]`.
- If the file is a script under `workspace/scripts/`, `workspace-ops/scripts/` or `cron/`: do not write a replacement mapping from memory, and do not take one from the factory. The factory JSON holds no occurrence of `money_of_ai`, `built_with_ai`, `The Money of AI` or `Built with AI` `[FACTORY]`. The resolver gate 4.2 requires is `public.format_aliases`, and it gives: `money_of_ai` and `paid` go to `split_the_bill`; `built_with_ai` and `built` go to `lift_the_lid`; `mindmaker_live`, `techonomic` and `builder_economy` go to `general`, the holding lane, not to any subchannel `[ALIASES]`. `The Money of AI` and `Built with AI` have no alias row. The factory's Route by Channel switch groups those three names differently: `techonomic` with `split_the_bill`, `builder_economy` with `lift_the_lid`, `mindmaker_live` with `mind_the_gap` `[FACTORY]`. So the factory and the ledger disagree on `mindmaker_live`, `techonomic` and `builder_economy`. For `money_of_ai` or `built_with_ai` in a script, propose the ledger's value as a one-line-per-name replacement, ask for approval with the filename and the diff, and edit only after the yes. For any of the other five names, report the file and the value as a finding and do not choose a target; which resolver the host follows is a ruling for Krish, not a choice for this gate.
- If the file is a session transcript, a log, a backup or `media/inbound/`: leave it. It is history.

### Gate 4.2: scripts writing to a table that now has a foreign key. Nothing found.

**Input:** audit section 7, filtered to `content_themes`, `content_slate_rulings`, `shifts`, `guests`, `video_studio_jobs` and `content_ideas`.

**Where it stands:** no active script writes any of the six protected columns `[RPT]`. The change phase applied no change and fixed zero retired-name writes, because no eligible active write was found `[RPT]`. `content_ideas` appears in the section 7 counts, but not as a write to `lane_slot`.

**The change in the database:** `content_themes.channel`, `content_slate_rulings.channel`, `shifts.lane`, `guests.format`, `video_studio_jobs.series` and `content_ideas.lane_slot` carry a foreign key to `venture_formats(slug)`. The migration that added them is `makeyourmindup/migrations/2026-09-19-format-foreign-keys.sql`. It names all six constraints (`content_themes_channel_fkey`, `content_slate_rulings_channel_fkey`, `shifts_lane_fkey`, `guests_format_fkey`, `video_studio_jobs_series_fkey`, `content_ideas_lane_slot_fkey`), and its footer records it applied and read back on 2026-09-19: a typo such as `split_the_bil` is refused by name, and a retired slug is still accepted because historical rows have to keep resolving `[FKEYS]`. The suggestions migration of the same day describes the same move from CHECK constraints with literal values to foreign keys, so that an unknown value "still fails the write and names itself in the error" `[MIG]`. Confirm the six constraints against the live schema before editing any script.

**What a write must send, if one is ever added:**

- One of `split_the_bill`, `mind_the_gap` or `lift_the_lid`, spelled exactly as `venture_formats` holds it `[F93]`.
- Never a retired name. If a script only knows a retired name, the named fix is to resolve it through `public.format_aliases` first, "which is what that ledger is for" `[MIG]`.
- Never a guess. If the script cannot tell which format a piece belongs to, it must not fall through to a default. The named hand-off for that case is a `public.suggestions` row with `proposed` null, `handoff_reason` set to `format_not_in_venture_formats` or `format_ambiguous_question`, and a `reason` of at least twelve characters `[MIG]`.
- Expect a failed insert to say which value was refused. That is the design, not a bug `[MIG]`.

`content_ideas.lane_slot` was set to `money_of_ai` and `built_with_ai` on 2026-08-29 `[F99]`, so a script that copied those values into its own code was the most likely find. None was found.

### Gate 4.3: the plaintext credential rotation from the 2026-09-09 audit

**Input:** audit section 6 (filenames only) and the report's section A7 (file and line, no values).

**What was found:** a plaintext `service_role` JWT in two sibling scripts, `sync-briefs-to-skills.sh` and `regenerate-standards-digest.py` `[F82]` `[F83]`. Both were fixed on 2026-09-09 to read `SUPABASE_SERVICE_KEY` from the environment, falling back to the root-only `/root/.openclaw/credentials/supabase.env` (mode 600), with no hardcoded fallback so both fail closed `[F84]`. The key is not rotated and appeared in 893 files on 2026-09-09 `[F86]`. Issued 2026-04-14, valid until 2036-04-14 `[F88]`. It is the same key as the SEV-0 leak of 2026-07-01 `[F90]`.

**The sequence on record, and the order is the whole point:** point every consumer at `SUPABASE_SERVICE_KEY`, confirm each still runs, then issue the new key and update the one credentials file. Rotating first would take down the sync engine, identity rendering, flag firing and the nightly audits within minutes, silently `[F87]`.

- **4.3a, done on 2026-09-19.** Ten active source files were changed to load `SUPABASE_SERVICE_KEY` from the environment or the existing managed environment file, failing closed when it is unavailable, with no hardcoded fallback. No credential was rotated `[RPT]`. The ten are `inbox-decay.sh`, `cc-doc-creator.sh`, `cc-task-router.sh`, `cc-sync-engine.sh`, `poll_sync_queue.py`, `create-agatha-plan-doc.py`, `fire-pending-flags.py`, `render-identity.py`, `render-plan.py` and `vera-contradiction-audit.sh` `[RPT]`, which covers all four this gate used to name: `render-identity.py` `[F85]` and the every-2-minute and every-5-minute jobs `fire-pending-flags.py`, `cc-sync-engine.sh` and `poll_sync_queue.py` `[F86]`. Final verification records active source service-role JWT matches, zero `[RPT]`, proved afterwards by the 2, 5 and 15 minute job tiers running normally `[NOW]`.
- **4.3b, open.** Config files have no runtime to read an env var, so each needs its own decision. Propose per file, do not batch.
- **4.3c, open, and it is now the next step.** Every active consumer runs from the env file, so the order's precondition is met: issue the new `service_role` key and update `/root/.openclaw/credentials/supabase.env` `[F84]` `[F87]`. Issuing a key is a credential rotation and needs Krish's explicit yes for that action alone. The history, the cold storage, the backups and the media copies are closed by the rotation, not by editing; the report puts that residue at 1,519 session-history files, 59 in cold storage, 14 backups, 6 in media and 1 in cron run history `[RPT]`.
- **4.3d, open, and one part of it is now live.** Four other credential shapes are still inline and all four need rotating: the n8n API key at `cc-sync-engine.sh` lines 9 and 33 and `vera-n8n-audit.js` line 3; an Anthropic admin key shape at `token-spend-tracker.py` line 286; a Supabase access-token fallback at `regen-arch-section-4.py` line 10; and the GitHub heartbeat token at `.vps-heartbeat.env` line 5, which is returning HTTP 401 and so is already failing `[RPT]`. The heartbeat token is the repo-scoped GitHub token from `TOKENS.md`, exposed since 2026-06-11, and it should be replaced by a fine-grained PAT scoped to `krishanraja/ai-harness` alone `[F89]`. Each is its own gate.

Never write any of these values into a file you paste, a commit, a chat or a report. Refer to them by variable name only `[F91]`.

### Gate 4.4: the heartbeat. The token is invalid, not missing.

**Input:** audit section 8, and the heartbeat line in audit section 4.

**What it is:** `vps-heartbeat.sh`, hourly at 5 past, installed 2026-09-09 with the env file sourced first `[F29]`. It writes to GitHub, not Supabase: a `repository_dispatch` to `krishanraja/ai-harness` with event type `harness-machine-heartbeat` `[F60]`. It refuses to run without `GITHUB_HEARTBEAT_TOKEN` in the environment, exit 78 `[F75]`. The harness opens a finding when the entry is missing or older than 48 hours, with the fix text "Check the hourly cron entry on the VPS and that GITHUB_HEARTBEAT_TOKEN is still valid" `[F77]`. `openclaw-vps` stays a permanently declared surface by ruling of 2026-09-09 `[F78]`.

**Where it stands:** the cron line is present and unchanged, the script is installed, and the job fires `[OUT]` `[RPT]`. The script was left alone. The last log line is HTTP 401 Bad credentials at 2026-09-19T15:05:01Z, so the second half of that fix text is the half that applies: the token is declared and invalid `[OUT]` `[RPT]`. This is not exit 78, which is what a missing token gives.

**What to do:** replace the token under gate 4.3d, then read the next hourly line. Nothing in the cron entry or the script needs changing to fix this. A later `degraded` status would be a different problem: it means the governor counter or the gateway job count came back null `[F75]`, and it is cross-read with section 3 rather than fixed in the heartbeat.

---

## 5. What must never be done from the VPS

- **Publishing.** Nothing on this host publishes. The publication's outputs go through the n8n factory and Control Center, and no n8n workflow calls the VPS `[F59]`.
- **Sending.** The host is pull-only. Seven scripts that used to send Telegram directly now append to `/var/log/os-pull-only-alerts.log`; the OS never initiates contact with Krish `[F61]`. The exceptions are deliberate and are not yours to widen: Lauren's `loz` briefings still send, and the two `maa` reminder jobs were disabled 2026-09-07 at Krish's request `[F109]`. The audit listed the outbound-capable scripts and left them alone, and the scheduled Loz radar runs with `--paid never` `[RPT]`.
- **Spending.** The gateway cron jobs at `/root/.openclaw/cron/jobs.json` spawn Claude Code sessions and cost real tokens `[F32]`. Do not add, enable or re-enable one. The n8n execution count is watched from here but never acted on from here (section 3).
- **Writing a suggestion without a reason.** `public.suggestions.reason` is NOT NULL and at least twelve characters. A row either proposes something or hands off with a named `handoff_reason`, never neither and never both `[MIG]`. A script that cannot say why it decided something does not write the row. The named hand-off for anything that would publish, send, schedule or spend is `external_action_needs_krish`, and its fix hint is "Not a gap to close. The approval gate is the design" `[MIG]`.
- **Touching the four personal-life agents.** `loz`, `steph`, `finno` and `maa` were left entirely alone by ruling of 2026-09-09: not read, not listed, not catalogued `[F107]`. The `loz` sandbox container is not a leftover `[F114]`.
- **Restarting the gateway by the CLI.** If an `openclaw.json` change is ever approved, the restart is `sudo XDG_RUNTIME_DIR=/run/user/0 systemctl --user restart openclaw-gateway.service`; the `openclaw gateway restart` CLI does not see the systemd user unit and is a no-op `[F104]`. No `openclaw.json` change is proposed in this document.

---

## 6. What was reported, and what is left

1. The whole audit output, sections 1 through 8, is in this repository at `state/vps/ALIGN-2026-09-19-audit.txt`, exactly as printed `[OUT]`. Section 6 printed filenames only by design; the matched lines were not fetched `[F91]`. No credential value appears in the output, the report or this document `[RPT]`.
2. No credential, token, key, `botToken`, or the contents of `credentials/`, `integrations/google/tokens.json`, any `auth-state.json`, or `.vps-heartbeat.env` was pasted `[F92]` `[F89]`. Secrets are referred to by variable name.
3. Section 3.1 applied, not 3.2. The governor script, its state file and its hourly cron line were all present `[OUT]`.
4. Gate by gate: 4.1 nothing found active; 4.2 nothing found; 4.3a approved and done, with ten files changed and zero active source JWT matches afterwards; 4.3b, 4.3c and 4.3d open; 4.4 diagnosed, and its fix sits inside 4.3d.
5. Disagreements still on record, after this audit closed three of them: the gateway job count of about 38 versus 33 versus 45 `[F117]`, brief rendering `[F118]`, the governor's alert path `[F120]`, the `audit_critical_infra` cadence `[F121]`, `learning_events` `[F122]`, the factory switch versus the `format_aliases` ledger on where `mindmaker_live`, `techonomic` and `builder_economy` resolve (gate 4.1), and the VPS audit's decision table versus the wind-down rule on an absent governor (section 3.2). Closed by this audit: the `poll_sync_queue.py` cadence `[F115]`, now five minutes in both the host and the snapshot; the snapshot size `[F116]`, now 33 in both; and the governor's action `[F119]`, now warn-only in the architecture doc as well as in the code. A new one is a finding, not a mistake.
6. The three jobs that were firing into nothing on 2026-09-09 are still worth one line each: `poll_sync_queue.py` had written nothing to its log since 2026-08-24, `verify_doc.py --auto-repair` was crashing every 30 minutes on a missing file, and five per-agent logs in `/tmp` had been frozen since 2026-08-29 `[F108]` `[F100]`. All three jobs are still in the live crontab `[OUT]`. The audit script has no section that reads those logs, so their current state is not settled by it.
7. The repository clone at `/root/Projects/control-center` was 11 days behind main with a dirty tree on 2026-09-09 `[F62]`. Its current state is still unknown: the audit script does not check it. `cd /root/Projects/control-center && git status --short && git log -1 --format=%h` is one extra read-only command worth adding to the next run.
