# NOW.md audit 2026-11-14

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | pass |  | none |
| mm-ctrl | fail | 2026-10-28 | as_of_stale, north_star_check, where_too_many |
| mindmake | pass |  | north_star_check |
| fractionl-circle | pass |  | north_star_check |
| fractionl-pulse | pass |  | north_star_check |
| full-time | pass |  | none |
| content-engine | pass |  | none |
| contentarchives | fail | 2026-11-14 | north_star_check, too_long |
| ai-harness | pass |  | none |
| AEO-Engine | pass |  | none |
| makeyourmindup | fail | 2026-10-28 | where_too_many, old_dated_claims |
| heartside | pass |  | none |
| legibility | pass |  | north_star_check |
| growth-heartside | pass |  | none |
| growth-makeyourmindup | pass |  | old_dated_claims |
| growth-mindmake | pass |  | none |
| growth-fulltime | pass |  | none |
| growth-legibility | fail | 2026-11-14 | recent_too_many |
| claude-archive | fail | 2026-11-14 | next_step |
| content-watcher | fail | 2026-11-14 | where_too_many |
| filearchives | fail | 2026-11-14 | recent_too_old, recent_too_many |
| inspirationhouse | pass |  | none |
| krish-clone | pass |  | none |
| krish-raja | pass |  | none |
| music-watcher | fail | 2026-11-14 | north_star_check, next_step |
| sendlinks | pass |  | none |

## mm-ctrl

- fail `as_of_stale`: as_of is 2026-10-23, 22 days old (limit 7).
- warning `north_star_check`: The North Star check is dated 2026-10-23, 22 days ago (limit 7); the next session re-dates it.
- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## mindmake

- warning `north_star_check`: The North Star check is dated 2026-10-28, 17 days ago (limit 7); the next session re-dates it.

## fractionl-circle

- warning `north_star_check`: The North Star check is dated 2026-10-23, 22 days ago (limit 7); the next session re-dates it.

## fractionl-pulse

- warning `north_star_check`: The North Star check is dated 2026-10-23, 22 days ago (limit 7); the next session re-dates it.

## contentarchives

- warning `north_star_check`: The North Star check is dated 2026-10-27, 18 days ago (limit 7); the next session re-dates it.
- fail `too_long`: 16002 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.

## makeyourmindup

- fail `where_too_many`: 10 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## legibility

- warning `north_star_check`: The North Star check is dated 2026-10-28, 17 days ago (limit 7); the next session re-dates it.

## growth-makeyourmindup

- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 64).

## growth-legibility

- fail `recent_too_many`: 13 "What changed recently" bullets older than a day (limit 12).

## claude-archive

- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".

## content-watcher

- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## filearchives

- fail `recent_too_old`: 2 "What changed recently" bullet(s) older than 30 days (oldest 2026-10-04); roll them into docs/history/LOG.md.
- fail `recent_too_many`: 15 "What changed recently" bullets older than a day (limit 12).

## music-watcher

- fail `north_star_check`: No North Star check line under "What is next and what is waiting on Krish".
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
