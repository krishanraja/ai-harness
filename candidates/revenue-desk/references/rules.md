# The rules

Fifteen rules, each one checkable. "Sheet" means `scripts/validate_sheet.py`; "code" means strategist `src/revenue.ts`. A rule a script cannot check says who reads it.

### `R01` Blind is never zero

A reading that is missing, never measured, undated or older than 7 days is blind, with its reason and a null value. Check: sheet (a blind reading with a number, or a fresh one older than 7 days, is held); code `blindOf`.

### `R02` A blind venture never reads on track

With any blind step, the standing is blind. Check: sheet; code `fixFirst`.

### `R03` The blind fix goes to the reading's owner

A blind step names the repository that owns the reading, and is never the constraint or a test card's step: restoring it is that owner's job, not a test. Check: sheet.

### `R04` Measure first stops the loop

A `measure-first` sheet carries no constraint, no reach check and no test card; a sheet with no fresh counted step must be `measure-first`. Check: sheet.

### `R05` Every figure is grounded

Every number carries a source and the date it was read; a number in prose must match a figure on the sheet. Check: sheet; code `grounded`.

### `R06` Private money stays private

A money figure from a repository that keeps its figures private is written as the word private with its share of the week's target. Check: sheet; code `grounded`.

### `R07` The constraint is a fresh step

The constraint names a step that was read inside 7 days, and the slice that carries the drop. Check: sheet.

### `R08` No reach check without its assumptions

The reach check carries where the rates came from, the window, the sample size and a trust band between 0 and 1. Check: sheet; code `reachCheck`.

### `R09` The reach verdict follows the arithmetic

Expected is volume times each step's rate; floor and stretch are expected less and plus the trust band; the verdict is reachable, gap or cannot-be-true by where the rung falls. Check: sheet (recomputed); code `reachCheck`.

### `R10` Cannot-be-true is a proposal, never an edit

A cannot-be-true verdict carries a recalibration proposal for Krish and changes no target. Check: sheet.

### `R11` One test, one variable, a stop and a kill

A test card has one variable, a primary and a guardrail metric, a prediction running floor, expected, stretch, a stop rule, a kill rule and a review date 1 to 14 days out. Check: sheet; code `ledgerErrors`.

### `R12` An offer test passes the offer terms and carries dissent

A card that touches a price, discount or code needs the offer-terms check to pass (unavailable is not a pass) and the day's dissent word for word. Check: sheet.

### `R13` The ask caps hold

At most one ask per venture a week, three across the fleet, none while one is open, and a midweek ask only on newly blind or newly breached. Check: sheet; code `capAsks`.

### `R14` No scores reach Krish

The sheet carries readings, verdicts and reasons; no score, rating or points in its keys or its words. The order of the queue is the order. Check: sheet.

### `R15` Day 14 is scored against the prediction

On or after the review date, the actual is written with its source and date beside the prediction, with the signed bias recomputed. Check: sheet; the hit rate and the cause count are read by the strategist's board.
