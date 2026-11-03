# NOW.md audit 2026-11-03

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | pass |  | none |
| mm-ctrl | fail | 2026-10-28 | as_of_stale, north_star_check, where_too_many |
| mindmake | pass |  | none |
| fractionl-circle | pass |  | north_star_check |
| fractionl-pulse | pass |  | north_star_check |
| full-time | pass |  | none |
| content-engine | pass |  | none |
| contentarchives | pass |  | none |
| ai-harness | fail | 2026-11-01 | recent_too_many, old_dated_claims |
| AEO-Engine | pass |  | none |
| makeyourmindup | fail | 2026-10-28 | too_long, old_dated_claims |
| heartside | fail | 2026-11-01 | too_long, recent_too_many, where_too_many |
| legibility | pass |  | none |
| growth-heartside | pass |  | none |
| growth-makeyourmindup | fail | 2026-10-29 | north_star_check, unfolded_notes |
| growth-mindmake | fail | 2026-10-29 | recent_too_many, next_step, unreconciled |
| growth-fulltime | fail | 2026-10-29 | next_step, unfolded_notes, unreconciled |
| growth-legibility | fail | 2026-10-29 | north_star_check, recent_too_many, next_step |

## mm-ctrl

- fail `as_of_stale`: as_of is 2026-10-23, 11 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-23, 11 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## fractionl-circle

- warning `north_star_check`: The North Star check is dated 2026-10-23, 11 days ago (limit 7); the next session re-dates it.

## fractionl-pulse

- warning `north_star_check`: The North Star check is dated 2026-10-23, 11 days ago (limit 7); the next session re-dates it.

## ai-harness

- fail `recent_too_many`: 13 "What changed recently" bullets older than a day (limit 12).
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 58).

## makeyourmindup

- fail `too_long`: 215 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## heartside

- fail `too_long`: 27141 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 15 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 24 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## growth-makeyourmindup

- fail `north_star_check`: No North Star check line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 18 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-10-29); run the fold.

## growth-mindmake

- fail `recent_too_many`: 16 "What changed recently" bullets older than a day (limit 12).
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unreconciled`: A product commit from 2026-10-31 landed after the last NOW.md update and NOW.md still does not reflect it.

## growth-fulltime

- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 4 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-10-29); run the fold.
- fail `unreconciled`: A product commit from 2026-10-27 landed after the last NOW.md update and NOW.md still does not reflect it.

## growth-legibility

- fail `north_star_check`: 2 North Star check lines; keep exactly one.
- fail `recent_too_many`: 14 "What changed recently" bullets older than a day (limit 12).
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
