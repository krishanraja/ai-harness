# NOW.md audit 2026-11-06

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | pass |  | none |
| mm-ctrl | fail | 2026-10-28 | as_of_stale, north_star_check, where_too_many |
| mindmake | pass |  | north_star_check |
| fractionl-circle | fail | 2026-11-06 | north_star_check, recent_too_old |
| fractionl-pulse | pass |  | north_star_check |
| full-time | pass |  | none |
| content-engine | fail | 2026-11-06 | too_long |
| contentarchives | pass |  | north_star_check |
| ai-harness | pass |  | none |
| AEO-Engine | pass |  | north_star_check |
| makeyourmindup | fail | 2026-10-28 | too_long, old_dated_claims |
| heartside | pass |  | none |
| legibility | pass |  | north_star_check |
| growth-heartside | fail | 2026-11-04 | where_too_many |
| growth-makeyourmindup | fail | 2026-10-29 | next_step, unfolded_notes |
| growth-mindmake | fail | 2026-10-29 | as_of_stale, north_star_check, recent_too_many, next_step, unreconciled |
| growth-fulltime | fail | 2026-10-29 | as_of_stale, north_star_check, next_step, unfolded_notes, unreconciled |
| growth-legibility | fail | 2026-10-29 | as_of_stale, north_star_check, recent_too_many, next_step |

## mm-ctrl

- fail `as_of_stale`: as_of is 2026-10-23, 14 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-23, 14 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## mindmake

- warning `north_star_check`: The North Star check is dated 2026-10-28, 9 days ago (limit 7); the next session re-dates it.

## fractionl-circle

- warning `north_star_check`: The North Star check is dated 2026-10-23, 14 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-06); roll them into docs/history/LOG.md.

## fractionl-pulse

- warning `north_star_check`: The North Star check is dated 2026-10-23, 14 days ago (limit 7); the next session re-dates it.

## content-engine

- fail `too_long`: line 40 is 1966 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.

## contentarchives

- warning `north_star_check`: The North Star check is dated 2026-10-27, 10 days ago (limit 7); the next session re-dates it.

## AEO-Engine

- warning `north_star_check`: The North Star check is dated 2026-10-27, 10 days ago (limit 7); the next session re-dates it.

## makeyourmindup

- fail `too_long`: 216 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## legibility

- warning `north_star_check`: The North Star check is dated 2026-10-28, 9 days ago (limit 7); the next session re-dates it.

## growth-heartside

- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## growth-makeyourmindup

- fail `next_step`: 2 "Next" lines under "What is next and what is waiting on Krish"; keep the single next action.
- fail `unfolded_notes`: 23 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-10-29); run the fold.

## growth-mindmake

- fail `as_of_stale`: as_of is 2026-10-28, 9 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-28, 9 days ago (limit 7); the next session re-dates it.
- fail `recent_too_many`: 16 "What changed recently" bullets older than a day (limit 12).
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unreconciled`: A product commit from 2026-10-31 landed after the last NOW.md update and NOW.md still does not reflect it.

## growth-fulltime

- fail `as_of_stale`: as_of is 2026-10-27, 10 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-27, 10 days ago (limit 7); the next session re-dates it.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 4 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-10-29); run the fold.
- fail `unreconciled`: A product commit from 2026-10-27 landed after the last NOW.md update and NOW.md still does not reflect it.

## growth-legibility

- fail `as_of_stale`: as_of is 2026-10-29, 8 days old (limit 7).
- fail `north_star_check`: 2 North Star check lines; keep exactly one.
- fail `recent_too_many`: 14 "What changed recently" bullets older than a day (limit 12).
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
