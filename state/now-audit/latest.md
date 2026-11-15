# NOW.md audit 2026-11-15

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | pass |  | old_dated_claims |
| mm-ctrl | fail | 2026-10-28 | north_star_check, recent_too_old, old_dated_claims |
| mindmake | pass |  | none |
| fractionl-circle | fail | 2026-11-15 | north_star_check, recent_too_old |
| fractionl-pulse | pass |  | north_star_check |
| full-time | fail | 2026-11-15 | too_long, where_too_many |
| content-engine | pass |  | none |
| contentarchives | pass |  | north_star_check |
| ai-harness | pass |  | none |
| AEO-Engine | pass |  | none |
| makeyourmindup | fail | 2026-10-28 | where_too_many, old_dated_claims |
| heartside | pass |  | none |
| legibility | pass |  | none |
| growth-heartside | pass |  | none |
| growth-makeyourmindup | pass |  | old_dated_claims |
| growth-mindmake | pass |  | none |
| growth-fulltime | pass |  | none |
| growth-legibility | fail | 2026-11-14 | recent_too_many |
| claude-archive | fail | 2026-11-14 | next_step |
| content-watcher | pass |  | none |
| filearchives | fail | 2026-11-14 | recent_too_old, recent_too_many |
| inspirationhouse | pass |  | none |
| krish-clone | pass |  | old_dated_claims |
| krish-raja | pass |  | none |
| music-watcher | pass |  | none |
| sendlinks | pass |  | none |

## control-center

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 46).

## mm-ctrl

- warning `north_star_check`: The North Star check is dated 2026-10-23, 23 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-15); roll them into docs/history/LOG.md.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 46).

## fractionl-circle

- warning `north_star_check`: The North Star check is dated 2026-10-23, 23 days ago (limit 7); the next session re-dates it.
- fail `recent_too_old`: 1 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-15); roll them into docs/history/LOG.md.

## fractionl-pulse

- warning `north_star_check`: The North Star check is dated 2026-10-23, 23 days ago (limit 7); the next session re-dates it.

## full-time

- fail `too_long`: 18189 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `where_too_many`: 11 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## contentarchives

- warning `north_star_check`: The North Star check is dated 2026-10-27, 19 days ago (limit 7); the next session re-dates it.

## makeyourmindup

- fail `where_too_many`: 11 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## growth-makeyourmindup

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 64).

## growth-legibility

- fail `recent_too_many`: 13 "What changed recently" bullets older than a day (limit 12).

## claude-archive

- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".

## filearchives

- fail `recent_too_old`: 3 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-04); roll them into docs/history/LOG.md.
- fail `recent_too_many`: 15 "What changed recently" bullets older than a day (limit 12).

## krish-clone

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 32).
