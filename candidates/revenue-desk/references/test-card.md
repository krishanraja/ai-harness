# The test card

One card per alarmed venture per week. It is written before the test runs, so the result cannot be argued into a win afterwards.

## Fields

| Field | What it holds |
|---|---|
| `step` | the constraint step the test acts on; it must be a fresh reading |
| `hypothesis` | one sentence: changing this one thing moves that step, because of this |
| `variable` | the one thing that changes; one, never a list |
| `primary_metric` | the count that decides the test, read from the adapter's named source |
| `guardrail_metric` | the count that must not get worse while the primary moves |
| `prediction` | floor, expected and stretch for the primary metric, with floor at or below expected at or below stretch |
| `stop_rule` | the observation that ends the test early, such as the guardrail falling past its band |
| `kill_rule` | the result on the review date that archives the idea for good and stops it coming back |
| `review_date` | 1 to 14 days after the sheet is made |
| `touches_offer` | true when the test changes a price, a discount or a code |
| `owner` | who carries out each act it needs; any send, post or spend stays Krish's or the engine's go-live step |

## Outcomes on the review date

- **Ship**: the primary landed at or above expected and the guardrail held. The change is proposed as the new default, as its own plan.
- **Iterate**: the primary landed between floor and expected. One more card, with one variable changed, inside the ask caps.
- **Archive**: the primary landed below floor, or the kill rule fired. The idea is recorded with its kill reason and is not proposed again unless the evidence changes.

## When the test touches the offer

- The adapter's offer terms are checked first: codes, public prices, private prices, who a code is for. A violation holds the card. Some classes are never overridden: a price that disagrees with its source, a stale catalogue, a code outside its registered family, a private price written out.
- The day's dissent is required on the sheet, word for word.
- A discount is traded for something (a second item, a longer term, a referral). A discount given for nothing is not a test.

## What a card is not

- Not approval. A yes on a card approves a plan; anything the test produces keeps its own go-live.
- Not copy. The words of any message the test needs come from their owners.
- Not two tests. A card with two variables cannot say which one worked.
