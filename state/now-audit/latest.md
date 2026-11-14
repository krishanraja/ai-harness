# NOW.md audit 2026-11-14

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | pass |  | old_dated_claims |
| mm-ctrl | fail | 2026-10-28 | as_of_stale, north_star_check, where_too_many |
| mindmake | fail | 2026-11-14 | north_star_check, too_long |
| fractionl-circle | pass |  | north_star_check |
| fractionl-pulse | pass |  | north_star_check |
| full-time | pass |  | old_dated_claims |
| content-engine | fail | 2026-11-13 | too_long |
| contentarchives | pass |  | north_star_check, old_dated_claims |
| ai-harness | fail | 2026-11-10 | recent_too_many, old_dated_claims |
| AEO-Engine | fail | 2026-11-13 | too_long, where_too_many |
| makeyourmindup | fail | 2026-10-28 | where_too_many, old_dated_claims |
| heartside | pass |  | old_dated_claims |
| legibility | pass |  | north_star_check |
| growth-heartside | fail | 2026-11-14 | recent_too_many, where_too_many, old_dated_claims |
| growth-makeyourmindup | pass |  | old_dated_claims |
| growth-mindmake | fail | 2026-11-14 | where_too_many |
| growth-fulltime | pass |  | none |
| growth-legibility | fail | 2026-11-14 | recent_too_many |

## control-center

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 50).

## mm-ctrl

- fail `as_of_stale`: as_of is 2026-10-23, 22 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-23, 22 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## mindmake

- warning `north_star_check`: The North Star check is dated 2026-10-28, 17 days ago (limit 7); the next session re-dates it.
- fail `too_long`: 207 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.

## fractionl-circle

- warning `north_star_check`: The North Star check is dated 2026-10-23, 22 days ago (limit 7); the next session re-dates it.

## fractionl-pulse

- warning `north_star_check`: The North Star check is dated 2026-10-23, 22 days ago (limit 7); the next session re-dates it.

## full-time

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 78).

## content-engine

- fail `too_long`: line 19 is 1604 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.

## contentarchives

- warning `north_star_check`: The North Star check is dated 2026-10-27, 18 days ago (limit 7); the next session re-dates it.
- warning `old_dated_claims`: 5 line(s) speak of something open or pending with no date newer than 14 days (lines 65, 66, 67, 68, 69).

## ai-harness

- fail `recent_too_many`: 15 "What changed recently" bullets older than a day (limit 12).
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 35).

## AEO-Engine

- fail `too_long`: 18690 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `where_too_many`: 11 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## makeyourmindup

- fail `where_too_many`: 10 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## heartside

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 46).

## legibility

- warning `north_star_check`: The North Star check is dated 2026-10-28, 17 days ago (limit 7); the next session re-dates it.

## growth-heartside

- fail `recent_too_many`: 15 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 11 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 85).

## growth-makeyourmindup

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 65).

## growth-mindmake

- fail `where_too_many`: 10 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## growth-legibility

- fail `recent_too_many`: 13 "What changed recently" bullets older than a day (limit 12).
