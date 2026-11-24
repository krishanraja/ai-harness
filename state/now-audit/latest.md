# NOW.md audit 2026-11-24

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | fail | 2026-11-21 | unfolded_notes |
| mm-ctrl | fail | 2026-10-28 | as_of_stale, north_star_check, recent_too_old, unfolded_notes, unreconciled, old_dated_claims |
| mindmake | fail | 2026-11-17 | north_star_check, too_long, unfolded_notes, unreconciled |
| fractionl-circle | fail | 2026-11-24 | north_star_check, recent_too_old |
| fractionl-pulse | fail | 2026-11-24 | recent_too_old, unfolded_notes, unreconciled |
| full-time | fail | 2026-11-21 | north_star_check, recent_too_old, unfolded_notes, unreconciled |
| content-engine | fail | 2026-11-24 | where_too_many |
| contentarchives | fail | 2026-11-24 | north_star_check, recent_too_old |
| ai-harness | fail | 2026-11-17 | too_long, recent_too_many, where_too_many, old_dated_claims |
| AEO-Engine | pass |  | north_star_check |
| makeyourmindup | fail | 2026-10-28 | too_long, where_too_many, old_dated_claims |
| heartside | pass |  | none |
| legibility | fail | 2026-11-24 | north_star_check, recent_too_old, unfolded_notes, unreconciled |
| growth-heartside | pass |  | none |
| growth-makeyourmindup | fail | 2026-11-19 | unfolded_notes, unreconciled, old_dated_claims |
| growth-mindmake | fail | 2026-11-17 | unfolded_notes, old_dated_claims |
| growth-fulltime | fail | 2026-11-17 | as_of_stale, north_star_check, recent_too_old, unfolded_notes |
| growth-legibility | fail | 2026-11-14 | as_of_stale, north_star_check, too_long, recent_too_many, where_too_many, unreconciled |
| claude-archive | fail | 2026-11-14 | as_of_stale, north_star_check, recent_too_old, next_step, unfolded_notes |
| content-watcher | fail | 2026-11-17 | as_of_stale, north_star_check, where_too_many |
| filearchives | fail | 2026-11-14 | where_too_many |
| inspirationhouse | fail | 2026-11-17 | where_too_many |
| krish-clone | fail | 2026-11-17 | where_too_many, old_dated_claims |
| krish-raja | fail | 2026-11-24 | where_too_many |
| music-watcher | fail | 2026-11-24 | as_of_stale, north_star_check |
| sendlinks | fail | 2026-11-17 | as_of_stale, north_star_check, where_too_many |
| internal-auditor | pass |  | none |
| strategist | pass |  | none |

## control-center

- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-20); run the fold.

## mm-ctrl

- fail `as_of_stale`: as_of is 2026-11-14, 10 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-23, 32 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 2 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-15); roll them into docs/history/LOG.md.
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-14); run the fold.
- fail `unreconciled`: A product commit from 2026-11-15 landed after the last NOW.md update and NOW.md still does not reflect it.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 46).

## mindmake

- warning `north_star_check`: The North Star check is dated 2026-11-16, 8 days ago (limit 7); the next session re-dates it.
- fail `too_long`: 206 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.
- fail `unfolded_notes`: 14 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-15); run the fold.
- fail `unreconciled`: A product commit from 2026-11-20 landed after the last NOW.md update and NOW.md still does not reflect it.

## fractionl-circle

- warning `north_star_check`: The North Star check is dated 2026-10-23, 32 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-23); roll them into docs/history/LOG.md.

## fractionl-pulse

- fail `recent_too_old`: 3 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-23); roll them into docs/history/LOG.md.
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-20); run the fold.
- fail `unreconciled`: A product commit from 2026-11-20 landed after the last NOW.md update and NOW.md still does not reflect it.

## full-time

- warning `north_star_check`: The North Star check is dated 2026-11-13, 11 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 3 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-21); roll them into docs/history/LOG.md.
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-20); run the fold.
- fail `unreconciled`: A product commit from 2026-11-20 landed after the last NOW.md update and NOW.md still does not reflect it.

## content-engine

- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## contentarchives

- warning `north_star_check`: The North Star check is dated 2026-10-27, 28 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 8 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-23); roll them into docs/history/LOG.md.

## ai-harness

- fail `too_long`: 16987 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 20 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 19 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 85).

## AEO-Engine

- warning `north_star_check`: The North Star check is dated 2026-11-15, 9 days ago (limit 7); the next session re-dates it.

## makeyourmindup

- fail `too_long`: 16786 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `where_too_many`: 16 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## legibility

- warning `north_star_check`: The North Star check is dated 2026-11-15, 9 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-23); roll them into docs/history/LOG.md.
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-20); run the fold.
- fail `unreconciled`: A product commit from 2026-11-20 landed after the last NOW.md update and NOW.md still does not reflect it.

## growth-makeyourmindup

- fail `unfolded_notes`: 6 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-16); run the fold.
- fail `unreconciled`: A product commit from 2026-11-18 landed after the last NOW.md update and NOW.md still does not reflect it.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 64).

## growth-mindmake

- fail `unfolded_notes`: 15 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-16); run the fold.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 46).

## growth-fulltime

- fail `as_of_stale`: as_of is 2026-11-14, 10 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-14, 10 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-23); roll them into docs/history/LOG.md.
- fail `unfolded_notes`: 4 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-15); run the fold.

## growth-legibility

- fail `as_of_stale`: as_of is 2026-11-15, 9 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-15, 9 days ago (limit 7); the next session re-dates it.
- fail `too_long`: 17793 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 13 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 16 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `unreconciled`: A product commit from 2026-11-17 landed after the last NOW.md update and NOW.md still does not reflect it.

## claude-archive

- fail `as_of_stale`: as_of is 2026-11-14, 10 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-14, 10 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-23); roll them into docs/history/LOG.md.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 2 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-15); run the fold.

## content-watcher

- fail `as_of_stale`: as_of is 2026-11-15, 9 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-15, 9 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 15 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## filearchives

- fail `where_too_many`: 15 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## inspirationhouse

- fail `where_too_many`: 23 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## krish-clone

- fail `where_too_many`: 19 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 39).

## krish-raja

- fail `where_too_many`: 13 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## music-watcher

- fail `as_of_stale`: as_of is 2026-11-16, 8 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-16, 8 days ago (limit 7); the next session re-dates it.

## sendlinks

- fail `as_of_stale`: as_of is 2026-11-15, 9 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-15, 9 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 14 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
