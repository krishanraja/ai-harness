# NOW.md audit 2026-11-12

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | pass |  | none |
| mm-ctrl | fail | 2026-10-28 | as_of_stale, north_star_check, where_too_many |
| mindmake | pass |  | north_star_check |
| fractionl-circle | pass |  | north_star_check |
| fractionl-pulse | pass |  | north_star_check |
| full-time | pass |  | north_star_check |
| content-engine | pass |  | none |
| contentarchives | pass |  | north_star_check |
| ai-harness | fail | 2026-11-10 | where_too_many |
| AEO-Engine | pass |  | none |
| makeyourmindup | fail | 2026-10-28 | too_long, old_dated_claims |
| heartside | fail | 2026-11-11 | too_long, recent_too_many, where_too_many, old_dated_claims |
| legibility | pass |  | north_star_check |
| growth-heartside | fail | 2026-11-10 | too_long, recent_too_many, where_too_many, unfolded_notes |
| growth-makeyourmindup | fail | 2026-10-29 | too_long, next_step, unfolded_notes |
| growth-mindmake | fail | 2026-10-29 | as_of_stale, north_star_check, next_step, unfolded_notes, old_dated_claims |
| growth-fulltime | fail | 2026-10-29 | as_of_stale, north_star_check, next_step, unfolded_notes, unreconciled |
| growth-legibility | fail | 2026-10-29 | as_of_stale, north_star_check, recent_too_many, next_step, unfolded_notes |

## mm-ctrl

- fail `as_of_stale`: as_of is 2026-10-23, 20 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-23, 20 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## mindmake

- warning `north_star_check`: The North Star check is dated 2026-10-28, 15 days ago (limit 7); the next session re-dates it.

## fractionl-circle

- warning `north_star_check`: The North Star check is dated 2026-10-23, 20 days ago (limit 7); the next session re-dates it.

## fractionl-pulse

- warning `north_star_check`: The North Star check is dated 2026-10-23, 20 days ago (limit 7); the next session re-dates it.

## full-time

- warning `north_star_check`: The North Star check is dated 2026-11-01, 11 days ago (limit 7); the next session re-dates it.

## contentarchives

- warning `north_star_check`: The North Star check is dated 2026-10-27, 16 days ago (limit 7); the next session re-dates it.

## ai-harness

- fail `where_too_many`: 10 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## makeyourmindup

- fail `too_long`: 218 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## heartside

- fail `too_long`: 18876 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 18 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 46).

## legibility

- warning `north_star_check`: The North Star check is dated 2026-10-28, 15 days ago (limit 7); the next session re-dates it.

## growth-heartside

- fail `too_long`: 21893 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 24 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 24 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `unfolded_notes`: 9 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-04); run the fold.

## growth-makeyourmindup

- fail `too_long`: 16201 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `next_step`: 2 "Next" lines under "What is next and what is waiting on Krish"; keep the single next action.
- fail `unfolded_notes`: 28 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-10-29); run the fold.

## growth-mindmake

- fail `as_of_stale`: as_of is 2026-10-28, 15 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-28, 15 days ago (limit 7); the next session re-dates it.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 11 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-05); run the fold.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 31).

## growth-fulltime

- fail `as_of_stale`: as_of is 2026-10-27, 16 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-27, 16 days ago (limit 7); the next session re-dates it.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 5 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-10-29); run the fold.
- fail `unreconciled`: A product commit from 2026-10-27 landed after the last NOW.md update and NOW.md still does not reflect it.

## growth-legibility

- fail `as_of_stale`: as_of is 2026-10-29, 14 days old (limit 7).
- fail `north_star_check`: 2 North Star check lines; keep exactly one.
- fail `recent_too_many`: 15 "What changed recently" bullets older than a day (limit 12).
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 2 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-10); run the fold.
