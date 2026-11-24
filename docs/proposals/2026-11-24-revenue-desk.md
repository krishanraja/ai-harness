# Revenue desk candidate, 2026-11-24

Status: staged as an inactive candidate under `candidates/revenue-desk/`, with `state/candidates/revenue-desk.yaml` at `activation: false` and `release_eligible: false`. Not a production route and not served by `get_skill` until Krish admits it.

Ruling (Krish, 2026-11-24): build the revenue desk as recommended: name revenue-desk, method as an ai-harness candidate with the code in strategist, Mindmake first, at most one ask per venture a week and three across the fleet, thresholds from each engine's own history binding only after his yes.

## Finding and correct layer

Every growth engine reports a North Star number, and the strategist turns those numbers into prose: "this ladder cannot be true", "the barrier is Pull". Nothing turns them into counted, dated, assumption-labelled sheets, so the same correction recurs: a stale reading is treated as a real one, an unmeasured number is argued about, a target nobody can reach is pushed harder. Strategist's own rule (`src/northstar.ts`, any reading older than 7 days is U4) already says most of today's state lines are stale: the growth engines' readings, read 2026-11-24 from each repository's `NOW.md`, are dated 2026-11-08 (growth-mindmake), 2026-11-12 (growth-heartside), 2026-11-14 (growth-legibility) and 2026-11-15 (growth-makeyourmindup), and growth-fulltime has never been measured.

The correct layer is the one the insight desk used: one method in ai-harness, read live; the deterministic code in the repository that already runs the daily and weekly jobs (strategist `src/revenue.ts`); a thin, figure-free adapter in each growth engine (`config/revenue-desk.json`). A separate repository would hold either prose with nothing to run, or code with no job to run it.

## What the candidate is

- `SKILL.md`: the trigger, exclusions, where the code lives and the names it uses, the adapters, the ten-step loop, the output, the approval walls, the graduation trigger and provenance.
- `references/loop.md`, `references/stage-check.md`, `references/test-card.md`: each step, the stage check that can say "measure first", and the test card.
- `references/rules.md`: fifteen checkable rules, each naming the check that enforces it.
- `references/revenue-sheet.schema.json`: `revenue-sheet/1`, JSON Schema draft 2020-12.
- `scripts/validate_sheet.py`: a standard-library check of one sheet; exit 0 pass, 1 held, 2 unavailable and never a pass.
- `scripts/validate.py` and `scripts/tests/`: the candidate gate, which also refuses any outside repository, author, product or framework name in the candidate's files (held as truncated digests, so the gate names none either).

## Missing-skill test

1. Recurs with consequence: yes, every U5 watch and every Sunday board, behind every venture's number.
2. Distinct trigger: yes, the strategist's jobs, an engine's adapter, or Krish asking where money is stuck or whether a number can be hit. Strategy calls, copy, ideas, research and decision records each route elsewhere.
3. Repeatable workflow: yes, the ten steps.
4. Owned standard: yes, `references/rules.md` and the sheet schema.
5. Independently verifiable: mostly. The sheet is checked deterministically and its arithmetic is recomputed; whether a test was the right one is judged on its day-14 actual.
6. Bounded authority: yes. It reads, computes and proposes, and never sends, posts or spends.
7. A chapter elsewhere would be worse: yes. In strategist alone the method could not be read by a growth engine's own session; in each engine it would be written five times.

## Overlap review

| Neighbour | What it owns | Where the desk stops |
|---|---|---|
| strategist (repository) and `council` | which venture and which play to back; the board | the desk turns readings into sheets the board reads; it judges nothing and adds no seat |
| `insight-desk` | which idea to make | the desk says where money is stuck; when the stall is the idea, its test is an insight desk run |
| `krish-content-marketer`, `krish-voice`, `ad-copywriter` | every word of an offer, email or caption | the desk hands every word to them |
| `evidence-research` | outside research | the desk reads only the venture's own counts |
| `decision-ledger` | Krish's finalised decisions | predictions and actuals go there; the desk keeps no second store |
| `strategy-brief` | the route and checks for the week's work | the desk runs inside the strategist's jobs, after the plan |

The overlap judgement is the reviewer's, from this table, not a measurement.

## Venture isolation

Each engine's adapter names only its own steps and sources, and holds no figures. Sheets live in each engine's ignored local path (`runtime/revenue/` in growth-mindmake, `local/revenue-desk/` in growth-heartside), are never committed, and no engine reads another's. A figure its own repository keeps private (strategist `src/scope.ts`) is written as the word private with its share only; `scripts/validate_sheet.py` holds a sheet that writes one out.

## Evidence path without Krish on every step

The deterministic gates run with no model and no Krish: today's five state lines come back blind or unmeasured with Mindmake ranked first (strategist tests), a planted ungrounded figure is held, a private figure written out is held, an offer test without a passing offer-terms check or the day's dissent is held, and the sample sheet passes (`scripts/tests/`). The outcome measure rides on work Krish already does: the plays he takes from the board, scored on their day-14 actuals. That is strategist's own North Star, which the desk makes measurable.

Failure signal: if after two weeks the only alarm ever raised is "restore the reading", the plumbing is the work, and the desk is not grown.

## Admission ask

1. Admit `revenue-desk` as a production skill, keep it as a candidate, or reject it.

Admission waits on the held-out suites passing and one full day-14 cycle scored. At admission: move `candidates/revenue-desk/` to `skills/revenue-desk/`, move the two suites to `evals/`, close `state/candidates/revenue-desk.yaml` with a `valid_until` date, add the registry entry, replace the staged routing paragraph with a route row and collision rule, raise `expected_skill_count`, name it in both cloud routing texts, and keep its tests running in `scripts/Test-Harness.ps1`.

## Graduation trigger

It stays a skill until a growth engine must run it with no strategist job. Only the deterministic checks would then move to a served engine.

## Revisions

- 2026-11-24: staged.
