# NOW.md audit 2026-10-30

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | pass |  | none |
| mm-ctrl | fail | 2026-10-28 | where_too_many |
| mindmake | pass |  | none |
| fractionl-circle | pass |  | none |
| fractionl-pulse | pass |  | none |
| full-time | pass |  | none |
| content-engine | pass |  | none |
| contentarchives | pass |  | none |
| ai-harness | pass |  | none |
| AEO-Engine | pass |  | none |
| makeyourmindup | fail | 2026-10-28 | too_long, old_dated_claims |
| heartside | pass |  | none |
| legibility | pass |  | none |
| growth-heartside | pass |  | none |
| growth-makeyourmindup | fail | 2026-10-29 | north_star_check |
| growth-mindmake | fail | 2026-10-29 | next_step |
| growth-fulltime | fail | 2026-10-29 | next_step, unreconciled |
| growth-legibility | fail | 2026-10-29 | north_star_check, next_step |

## mm-ctrl

- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## makeyourmindup

- fail `too_long`: 215 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## growth-makeyourmindup

- fail `north_star_check`: No North Star check line under "What is next and what is waiting on Krish".

## growth-mindmake

- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".

## growth-fulltime

- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
- fail `unreconciled`: A product commit from 2026-10-27 landed after the last NOW.md update and NOW.md still does not reflect it.

## growth-legibility

- fail `north_star_check`: 2 North Star check lines; keep exactly one.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
