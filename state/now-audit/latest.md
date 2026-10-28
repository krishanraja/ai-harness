# NOW.md audit 2026-10-28

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | fail | 2026-10-28 | too_long, recent_too_many, where_too_many, old_dated_claims |
| mm-ctrl | fail | 2026-10-28 | where_too_many |
| mindmake | fail | 2026-10-28 | north_star_check, too_long |
| fractionl-circle | fail | 2026-10-28 | next_step |
| fractionl-pulse | fail | 2026-10-28 | too_long, recent_too_many, where_too_many, next_step, old_dated_claims |
| full-time | fail | 2026-10-28 | too_long, recent_too_old, recent_too_many, where_too_many, next_step, old_dated_claims |
| content-engine | fail | 2026-10-28 | too_long, recent_too_old, recent_too_many, where_too_many, next_step, old_dated_claims |
| contentarchives | fail | 2026-10-28 | too_long, recent_too_many, where_too_many, old_dated_claims |
| ai-harness | fail | 2026-10-28 | too_long, recent_too_many, stale_pr_claim, old_dated_claims |
| AEO-Engine | pass |  | none |
| makeyourmindup | fail | 2026-10-28 | recent_too_old, next_step, old_dated_claims |
| heartside | fail | 2026-10-28 | too_long, next_step |
| legibility | fail | 2026-10-28 | too_long, where_too_many, next_step |
| growth-heartside | fail | 2026-10-28 | next_step |

## control-center

- fail `too_long`: 108743 characters (limit 16000); line 53 is 3256 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 70 "What changed recently" bullets (limit 12).
- fail `where_too_many`: 49 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 3 line(s) speak of something open or pending with no date newer than 14 days (lines 64, 71, 73).

## mm-ctrl

- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## mindmake

- fail `north_star_check`: 2 North Star check lines; keep exactly one.
- fail `too_long`: 211 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.

## fractionl-circle

- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".

## fractionl-pulse

- fail `too_long`: 41101 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 24 "What changed recently" bullets (limit 12).
- fail `where_too_many`: 11 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `next_step`: 3 "Next" lines under "What is next and what is waiting on Krish"; keep the single next action.
- warning `old_dated_claims`: 7 line(s) speak of something open or pending with no date newer than 14 days (lines 38, 43, 44, 46, 92).

## full-time

- fail `too_long`: 40201 characters (limit 16000); line 93 is 1732 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_old`: 2 "What changed recently" bullet(s) older than 30 days (oldest 2026-09-27); roll them into docs/history/LOG.md.
- fail `recent_too_many`: 16 "What changed recently" bullets (limit 12).
- fail `where_too_many`: 17 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `next_step`: 6 "Next" lines under "What is next and what is waiting on Krish"; keep the single next action.
- warning `old_dated_claims`: 7 line(s) speak of something open or pending with no date newer than 14 days (lines 66, 70, 72, 100, 102).

## content-engine

- fail `too_long`: 139608 characters (limit 16000); 290 lines (limit 200); line 257 is 3650 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-09-27); roll them into docs/history/LOG.md.
- fail `recent_too_many`: 108 "What changed recently" bullets (limit 12).
- fail `where_too_many`: 44 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `next_step`: 8 "Next" lines under "What is next and what is waiting on Krish"; keep the single next action.
- warning `old_dated_claims`: 4 line(s) speak of something open or pending with no date newer than 14 days (lines 81, 84, 87, 258).

## contentarchives

- fail `too_long`: 76577 characters (limit 16000); line 82 is 2097 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 47 "What changed recently" bullets (limit 12).
- fail `where_too_many`: 17 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 4 line(s) speak of something open or pending with no date newer than 14 days (lines 52, 65, 124, 127).

## ai-harness

- fail `too_long`: 47172 characters (limit 16000); line 34 is 5035 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 39 "What changed recently" bullets (limit 12).
- fail `stale_pr_claim`: Line 51 says PR 150 is open or waiting to merge, but it is merged.
- fail `stale_pr_claim`: Line 73 says PR 104 is open or waiting to merge, but it is merged.
- warning `old_dated_claims`: 2 line(s) speak of something open or pending with no date newer than 14 days (lines 99, 100).

## makeyourmindup

- fail `recent_too_old`: 2 "What changed recently" bullet(s) older than 30 days (oldest 2026-09-24); roll them into docs/history/LOG.md.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 47).

## heartside

- fail `too_long`: 16799 characters (limit 16000); line 57 is 1641 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".

## legibility

- fail `too_long`: 17465 characters (limit 16000); line 65 is 1894 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.
- fail `where_too_many`: 11 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".

## growth-heartside

- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
