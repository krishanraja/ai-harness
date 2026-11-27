# NOW.md audit 2026-11-27

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | fail | 2026-11-27 | where_too_many, unfolded_notes |
| mm-ctrl | fail | 2026-10-28 | as_of_stale, north_star_check, recent_too_old, unfolded_notes, unreconciled, old_dated_claims |
| ctrl | fail | 2026-11-25 | unfolded_notes |
| mindmake | fail | 2026-11-17 | north_star_check, too_long, unfolded_notes, unreconciled |
| fractionl-circle | pass |  | north_star_check |
| fractionl-pulse | fail | 2026-11-24 | north_star_check, unfolded_notes |
| full-time | fail | 2026-11-21 | north_star_check, recent_too_old, unfolded_notes |
| content-engine | pass |  | none |
| contentarchives | fail | 2026-11-27 | north_star_check, recent_too_old |
| ai-harness | fail | 2026-11-26 | unfolded_notes, old_dated_claims |
| answers-engine | pass |  | north_star_check |
| makeyourmindup | pass |  | old_dated_claims |
| heartside | pass |  | north_star_check |
| legibility | fail | 2026-11-24 | as_of_stale, north_star_check, recent_too_old, unfolded_notes, unreconciled |
| growth-heartside | pass |  | none |
| growth-makeyourmindup | fail | 2026-11-19 | as_of_stale, north_star_check, unfolded_notes, old_dated_claims |
| growth-mindmake | fail | 2026-11-17 | unfolded_notes, old_dated_claims |
| growth-full-time | pass |  | old_dated_claims |
| growth-legibility | fail | 2026-11-14 | too_long, recent_too_old, recent_too_many, where_too_many, unfolded_notes, unreconciled, old_dated_claims |
| claude-archive | fail | 2026-11-14 | as_of_stale, north_star_check, recent_too_old, next_step, unfolded_notes, unreconciled |
| content-watcher | fail | 2026-11-17 | as_of_stale, north_star_check, where_too_many |
| filearchives | fail | 2026-11-26 | recent_too_many |
| taste-engine | pass |  | none |
| krish-clone | fail | 2026-11-17 | as_of_stale, north_star_check, where_too_many, old_dated_claims |
| krishraja-site | fail | 2026-11-25 | where_too_many |
| music-watcher | fail | 2026-11-24 | as_of_stale, north_star_check |
| sendlinks | fail | 2026-11-17 | as_of_stale, north_star_check, where_too_many |
| internal-auditor | fail | 2026-11-25 | where_too_many |
| strategist | fail | 2026-11-25 | where_too_many |
| humour-engine | fail | 2026-11-25 | as_of_stale, north_star_check, unfolded_notes |

## control-center

- fail `where_too_many`: 10 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `unfolded_notes`: 2 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-25); run the fold.

## mm-ctrl

- fail `as_of_stale`: as_of is 2026-11-14, 13 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-23, 35 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 2 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-15); roll them into docs/history/LOG.md.
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-14); run the fold.
- fail `unreconciled`: A product commit from 2026-11-15 landed after the last NOW.md update and NOW.md still does not reflect it.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 46).

## ctrl

- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-25); run the fold.

## mindmake

- warning `north_star_check`: The North Star check is dated 2026-11-16, 11 days ago (limit 7); the next session re-dates it.
- fail `too_long`: 206 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.
- fail `unfolded_notes`: 15 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-15); run the fold.
- fail `unreconciled`: A product commit from 2026-11-20 landed after the last NOW.md update and NOW.md still does not reflect it.

## fractionl-circle

- warning `north_star_check`: The North Star check is dated 2026-10-23, 35 days ago (limit 7); the next session re-dates it.

## fractionl-pulse

- warning `north_star_check`: The North Star check is dated 2026-11-18, 9 days ago (limit 7); the next session re-dates it.
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-20); run the fold.

## full-time

- warning `north_star_check`: The North Star check is dated 2026-11-13, 14 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-27); roll them into docs/history/LOG.md.
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-20); run the fold.

## contentarchives

- warning `north_star_check`: The North Star check is dated 2026-10-27, 31 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-27); roll them into docs/history/LOG.md.

## ai-harness

- fail `unfolded_notes`: 7 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-25); run the fold.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 56).

## answers-engine

- warning `north_star_check`: The North Star check is dated 2026-11-15, 12 days ago (limit 7); the next session re-dates it.

## makeyourmindup

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## heartside

- warning `north_star_check`: The North Star check is dated 2026-11-17, 10 days ago (limit 7); the next session re-dates it.

## legibility

- fail `as_of_stale`: as_of is 2026-11-17, 10 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-15, 12 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-23); roll them into docs/history/LOG.md.
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-20); run the fold.
- fail `unreconciled`: A product commit from 2026-11-20 landed after the last NOW.md update and NOW.md still does not reflect it.

## growth-makeyourmindup

- fail `as_of_stale`: as_of is 2026-11-18, 9 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-18, 9 days ago (limit 7); the next session re-dates it.
- fail `unfolded_notes`: 12 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-16); run the fold.
- warning `old_dated_claims`: 2 line(s) speak of something open or pending with no date newer than 14 days (lines 61, 67).

## growth-mindmake

- fail `unfolded_notes`: 19 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-16); run the fold.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 46).

## growth-full-time

- warning `old_dated_claims`: 2 line(s) speak of something open or pending with no date newer than 14 days (lines 27, 58).

## growth-legibility

- fail `too_long`: 19320 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_old`: 5 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-27); roll them into docs/history/LOG.md.
- fail `recent_too_many`: 14 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 18 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `unfolded_notes`: 2 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-24); run the fold.
- fail `unreconciled`: A product commit from 2026-11-24 landed after the last NOW.md update and NOW.md still does not reflect it.
- warning `old_dated_claims`: 2 line(s) speak of something open or pending with no date newer than 14 days (lines 47, 48).

## claude-archive

- fail `as_of_stale`: as_of is 2026-11-14, 13 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-14, 13 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-23); roll them into docs/history/LOG.md.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 3 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-15); run the fold.
- fail `unreconciled`: A product commit from 2026-11-24 landed after the last NOW.md update and NOW.md still does not reflect it.

## content-watcher

- fail `as_of_stale`: as_of is 2026-11-15, 12 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-15, 12 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 15 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## filearchives

- fail `recent_too_many`: 13 "What changed recently" bullets older than a day (limit 12).

## krish-clone

- fail `as_of_stale`: as_of is 2026-11-18, 9 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-18, 9 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 19 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 39).

## krishraja-site

- fail `where_too_many`: 13 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## music-watcher

- fail `as_of_stale`: as_of is 2026-11-16, 11 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-16, 11 days ago (limit 7); the next session re-dates it.

## sendlinks

- fail `as_of_stale`: as_of is 2026-11-15, 12 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-11-15, 12 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 14 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## internal-auditor

- fail `where_too_many`: 10 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## strategist

- fail `where_too_many`: 10 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## humour-engine

- fail `as_of_stale`: as_of is 2026-11-17, 10 days old (limit 7).
- fail `north_star_check`: No North Star check line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-24); run the fold.
