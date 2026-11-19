# NOW.md audit 2026-11-19

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | pass |  | none |
| mm-ctrl | fail | 2026-10-28 | north_star_check, recent_too_old, unfolded_notes, unreconciled, old_dated_claims |
| mindmake | fail | 2026-11-17 | too_long, unfolded_notes |
| fractionl-circle | fail | 2026-11-15 | north_star_check, recent_too_old |
| fractionl-pulse | pass |  | none |
| full-time | pass |  | none |
| content-engine | pass |  | old_dated_claims |
| contentarchives | pass |  | north_star_check |
| ai-harness | fail | 2026-11-17 | recent_too_many, where_too_many, old_dated_claims |
| AEO-Engine | pass |  | none |
| makeyourmindup | fail | 2026-10-28 | too_long, where_too_many, old_dated_claims |
| heartside | pass |  | none |
| legibility | pass |  | none |
| growth-heartside | pass |  | none |
| growth-makeyourmindup | fail | 2026-11-19 | unfolded_notes, old_dated_claims |
| growth-mindmake | fail | 2026-11-17 | unfolded_notes |
| growth-fulltime | fail | 2026-11-17 | unfolded_notes |
| growth-legibility | fail | 2026-11-14 | too_long, recent_too_many, where_too_many |
| claude-archive | fail | 2026-11-14 | next_step, unfolded_notes |
| content-watcher | fail | 2026-11-17 | where_too_many |
| filearchives | fail | 2026-11-14 | recent_too_old, recent_too_many, where_too_many, unreconciled |
| inspirationhouse | fail | 2026-11-17 | where_too_many |
| krish-clone | fail | 2026-11-17 | where_too_many, old_dated_claims |
| krish-raja | pass |  | none |
| music-watcher | pass |  | none |
| sendlinks | fail | 2026-11-17 | where_too_many |

## mm-ctrl

- warning `north_star_check`: The North Star check is dated 2026-10-23, 27 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-15); roll them into docs/history/LOG.md.
- fail `unfolded_notes`: 1 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-14); run the fold.
- fail `unreconciled`: A product commit from 2026-11-15 landed after the last NOW.md update and NOW.md still does not reflect it.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 46).

## mindmake

- fail `too_long`: 202 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.
- fail `unfolded_notes`: 4 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-15); run the fold.

## fractionl-circle

- warning `north_star_check`: The North Star check is dated 2026-10-23, 27 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-19); roll them into docs/history/LOG.md.

## content-engine

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 48).

## contentarchives

- warning `north_star_check`: The North Star check is dated 2026-10-27, 23 days ago (limit 7); the next session re-dates it.

## ai-harness

- fail `recent_too_many`: 15 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 76).

## makeyourmindup

- fail `too_long`: 16897 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `where_too_many`: 13 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## growth-makeyourmindup

- fail `unfolded_notes`: 2 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-16); run the fold.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 64).

## growth-mindmake

- fail `unfolded_notes`: 2 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-16); run the fold.

## growth-fulltime

- fail `unfolded_notes`: 4 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-15); run the fold.

## growth-legibility

- fail `too_long`: 17793 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 13 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 16 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## claude-archive

- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unfolded_notes`: 2 closeout note(s) in now-notes/ not folded into NOW.md (oldest 2026-11-15); run the fold.

## content-watcher

- fail `where_too_many`: 15 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## filearchives

- fail `recent_too_old`: 4 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-04); roll them into docs/history/LOG.md.
- fail `recent_too_many`: 15 "What changed recently" bullets older than a day (limit 12).
- fail `where_too_many`: 15 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `unreconciled`: A product commit from 2026-11-16 landed after the last NOW.md update and NOW.md still does not reflect it.

## inspirationhouse

- fail `where_too_many`: 21 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## krish-clone

- fail `where_too_many`: 16 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 39).

## sendlinks

- fail `where_too_many`: 14 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
