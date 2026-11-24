# Council discipline, 2026-11-24

Status: proposed, step 17 of the fleet architecture plan Krish approved for this session. It changes only `skills/council` and its behavior suite, and merges through the judge panel like any session pull request. No ruling is claimed here.

## Finding and correct layer

The council already scores on evidence (a score above 6 needs a fact) and bars vote counting, but a read could still go wrong in seven known ways: a seat attacks a weak version of an option; a figure is called a fact with no source anyone can open; a seat calls something fatal with nothing behind it and the word carries the room; a question Krish already settled is argued again; seats anchor on each other's drafts or on which seat spoke; a read runs round after round without a call; and the call turns on a claim nobody grounded. Each one is a correction Krish would otherwise give by hand.

The correct layer is the council's own protocol, `skills/council/references/protocol.md`, read live by every caller (an explicit ask, and the strategist's weekly board and U5 reads). A rule in the strategist would leave the explicit-ask path without it; a rule in `krish-principles` would load on every "should I".

## Which part of the North Star it moves

ai-harness's number is the corrections Krish has to give twice in a week. The seven rules turn seven repeatable council failures into protocol, so the correction is given once, here, for every caller.

## What changes

| File | Change |
|---|---|
| `skills/council/references/protocol.md` | A "Discipline" section with seven rules (steel-man first; the evidence rule; severity has to be earned; the ledger of settled decisions; anonymous drafts; a cap of two rounds; ground the winning claim), wired into the decision and idea steps and into both answer shapes (a "Settled already" line, a "Steel-man" line, and a call that names its claim and that claim's evidence). |
| `skills/council/SKILL.md` | Step 1 names the seven rules; two new stops: a settled question with no newer fact, and a third round. |
| `evals/council-behavior-cases.jsonl` | Seven held-out cases, 027 to 033, one per rule, each failing a read that skips it. |

## The walls

Nothing widens. The ledger rule reads `decision-ledger` live; the council still writes no file or record, sends nothing and spends nothing. Seats and idea tests are untouched, so `references/seats.json`, `references/idea-tests.json` and control-center's copies stay byte-identical and `scripts/validate.py` still holds them together.

## Rollback

Revert this pull request.
