# Council discipline, 2026-11-24

Status: proposed; live once it merges through the judge panel, which is when the two `brain/rules.yaml` rows take effect. Asked by Krish: step 17 of the fleet architecture plan he approved on 2026-11-24, and "sort out the remainder" (Krish, 2026-11-24) when the session reported back. It changes only `skills/council`, its behavior suite and the two council rows in `brain/rules.yaml`. It merges through the judge panel like any session pull request. No ruling is claimed here.

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
| `evals/council-behavior-cases.jsonl` | New held-out behavior cases, one per rule. The held-out suite is kept from the judge panel by design, so they are named here only by file. |

## How often it hands back to Krish

Two rules can return a read to Krish: a question two rounds cannot settle (rule 6), and a settled decision due for review (rule 4). Both already happen today by hand, when Krish corrects a read that went round in circles or reopened something he had decided; the rules make that one explicit line instead of a long read. The rate is not measured yet; the strategist's weekly board is the council's most frequent caller, so the first month of board reads is the measurement. If it fires more than twice in a week, that is the signal to revisit rule 6.

## The walls

Nothing widens. The ledger rule reads `decision-ledger` live; the council still writes no file or record, sends nothing and spends nothing. Seats and idea tests are untouched, so `references/seats.json`, `references/idea-tests.json` and control-center's copies stay byte-identical and `scripts/validate.py` still holds them together.

## Rollback

Revert this pull request.
