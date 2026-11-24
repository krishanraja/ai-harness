# The loop, step by step

Each step names what it reads, what it writes on the sheet and where it stops. The deterministic steps run in strategist `src/revenue.ts`; the steps that need judgement are written by the session and checked by `scripts/validate_sheet.py`.

## 1. Read

- Read the venture's adapter, `config/revenue-desk.json`, from its own repository at the current commit.
- Read the North Star state line in that repository's `NOW.md`, and each step's count from the source the adapter names (the engine's own files, or `get_venture_state`).
- Write each step as a reading: its id, the value, the source, the date it was read, which way is better, and whether it is a count or money.
- Never copy a count from another venture, an older sheet, memory or a chat.

## 2. Blind veto

- A reading is blind when it is missing, never measured, undated or older than 7 days (`blindOf`). Write `sight: "blind"`, the reason, and a null value. Zero is a reading; blind is the absence of one, and the two are never swapped.
- A venture with any blind step reads `blind`. It can never read on track or clear.
- The fix for a blind step goes to the repository that owns the reading: the engine itself, or a reader brief for Control Center. It is not a new ask on Krish's list.
- A step the adapter declares blind by design keeps its declared reason.

## 3. Stage check

- `references/stage-check.md` decides whether anything past this step may run.
- With no buyer seen and no fresh counted step, the verdict is `measure-first`: the sheet names the reading plan and stops. No constraint, reach check or test card is written.

## 4. Money path and constraint

- Walk the steps in the adapter's order and find the first one where the count collapses against the one before it.
- Slice that step by the slices the adapter lists (source, offer, cohort, week, box, lane) before averaging. One bad slice hidden inside a fair average is the usual finding.
- Name the constraint step and the slice that carries the drop. The constraint must be a fresh reading: a blind step is a reading problem, not a constraint.
- Before any other constraint, check that the work the path assumes is being done at all: compare the work actually done (drafts sent, posts live) with the throughput the engine's own strategy assumes. If the work is not happening, that is the constraint.

## 5. Reach check

- Work volume times each step's rate, against this week's rung on the ladder (`reachCheck`).
- Write floor, expected and stretch, and the verdict: `reachable` when expected meets the rung, `gap` when only stretch does, `cannot-be-true` when even stretch misses.
- The assumption block is required: where the rates came from and over what dates, the window, the sample size, and the trust band as a share either side of expected. With any part missing, there is no reach check.
- `cannot-be-true` becomes a recalibration proposal for Krish. The desk never edits a target.

## 6. Stage rules

Only the rules the stage check allows for that business shape (`references/stage-check.md`, "What runs at each stage").

## 7. One test

- For each alarmed venture, one test card (`references/test-card.md`): one variable, a primary and a guardrail metric, a predicted floor, expected and stretch, a stop rule, a kill rule and a review date.
- If the stall is the idea itself, the test is an `insight-desk` run; the desk names it and hands over.
- A test that touches a price, a discount or a code is checked against the adapter's offer terms before it is written, and the day's dissent is required.

## 8. Validate

- `python scripts/validate_sheet.py <sheet.json>`. Exit 0 is pass, 1 is held with each reason printed, 2 is unavailable (unreadable or not a sheet).
- Exit 2 is never a pass. A held sheet is fixed or dropped; it is never proposed with its holds unread.

## 9. Propose

- On Sunday, the sheet is folded into the strategist's board memo.
- Midweek, a venture raises an ask only when it newly goes blind or newly breaches.
- At most one ask per venture a week, at most three across the fleet, and none from a venture while one of its asks is still open (`capAsks`).
- An ask goes as stage `plan` behind `strategy`. A held engine raises none.

## 10. Score at day 14

- On the review date, read the actual from the same source as the prediction, and write it beside floor, expected and stretch with its date.
- The signed bias is actual minus expected. The hit rate per venture is how often the actual landed between floor and stretch.
- A cause seen five times becomes a proposed gate. Krish's declines, in his own words, go through the existing capture paths; a defect goes to `record_harness_observation`.
- Predictions and actuals are kept as decision-ledger entries, with kill criteria and the dissent word for word. There is no second decision store.
