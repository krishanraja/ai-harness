# NOW.md audit 2026-10-29

Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository's findings on its next run.

| Repository | Verdict | Failing since | Rules |
|---|---|---|---|
| control-center | fail | 2026-10-28 | where_too_many |
| mm-ctrl | fail | 2026-10-28 | where_too_many |
| mindmake | pass |  | none |
| fractionl-circle | pass |  | none |
| fractionl-pulse | pass |  | none |
| full-time | pass |  | none |
| content-engine | pass |  | none |
| contentarchives | pass |  | none |
| ai-harness | fail | 2026-10-28 | too_long, recent_too_many, where_too_many |
| AEO-Engine | pass |  | none |
| makeyourmindup | fail | 2026-10-28 | too_long, old_dated_claims |
| heartside | fail | 2026-10-28 | too_long |
| legibility | fail | 2026-10-28 | too_long, where_too_many, next_step |
| growth-heartside | fail | 2026-10-29 | too_long, recent_too_many, where_too_many |
| growth-makeyourmindup | fail | 2026-10-29 | north_star_check, too_long |
| growth-mindmake | fail | 2026-10-29 | recent_too_many, next_step |
| growth-fulltime | fail | 2026-10-29 | next_step |
| growth-legibility | fail | 2026-10-29 | north_star_check, recent_too_many, next_step |

## control-center

- fail `where_too_many`: 17 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## mm-ctrl

- fail `where_too_many`: 9 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## ai-harness

- fail `too_long`: 23237 characters (limit 16000); line 29 is 1655 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 19 "What changed recently" bullets (limit 12).
- fail `where_too_many`: 17 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## makeyourmindup

- fail `too_long`: 215 lines (limit 200). Roll history into docs/history/LOG.md and keep what is current.
- warning `old_dated_claims`: 1 line(s) speak of something open or pending with no date newer than 14 days (lines 52).

## heartside

- fail `too_long`: 16733 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.

## legibility

- fail `too_long`: 17465 characters (limit 16000); line 65 is 1894 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.
- fail `where_too_many`: 11 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".

## growth-heartside

- fail `too_long`: 17574 characters (limit 16000). Roll history into docs/history/LOG.md and keep what is current.
- fail `recent_too_many`: 18 "What changed recently" bullets (limit 12).
- fail `where_too_many`: 10 bullets in "Where it is right now" (limit 8); it says where things are, not how they got there.

## growth-makeyourmindup

- fail `north_star_check`: No North Star check line under "What is next and what is waiting on Krish".
- fail `too_long`: line 69 is 1986 characters (limit 1500). Roll history into docs/history/LOG.md and keep what is current.

## growth-mindmake

- fail `recent_too_many`: 20 "What changed recently" bullets (limit 12).
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".

## growth-fulltime

- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".

## growth-legibility

- fail `north_star_check`: 2 North Star check lines; keep exactly one.
- fail `recent_too_many`: 14 "What changed recently" bullets (limit 12).
- fail `next_step`: No "- Next" line under "What is next and what is waiting on Krish".
