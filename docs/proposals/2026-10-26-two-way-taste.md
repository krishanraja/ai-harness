# Two-way taste: every session reads his approved taste and reports back

Krish, 2026-10-26: "start the two-way build in a fresh session", then "Just build everything". The brief is
krishanraja/inspirationhouse `docs/TWO_WAY.md` (step 4): his voice and design corrections reach the taste engine
through Control Center's report tool, and one canon line tells every session to use the two tools.

## What changes

- **The canon** (`contract/templates/canon-block.md`), one sentence after "One home per fact": before writing or
  designing for Krish, read his approved rules with Control Center's `get_approved_taste`; when he corrects voice,
  design, a piece or an idea, send his exact typed words to `report_to_taste_engine` with where and when he typed them;
  anything else only as an observation; never answer a card or approve a rule for him.
- **krish-voice** (Workflow, 2a): reads the live rules through `get_approved_taste` (lane voice) when the connector is
  present, `references/approved-taste.md` otherwise; reports each correction's exact typed words as `krish_words`,
  anything inferred as an `observation`.
- **krish-design** (design task contract; interaction as sequencing): the same read (lane production), and his exact
  first reaction to a rejected mock goes to the report tool too.

## Why it is safe

The rulings it rests on: his exact typed words are his (Krish, 2026-10-24: "exact typed quotes count as my opinions on
what I think you should do with that content"); everything else a session reports is an observation, context only,
never counted toward a rule; only he answers a card or approves a rule. The tools enforce all three (control-center
`api/harness/_taste-mcp.ts`, content-engine `taste_reports`, inspirationhouse `src/collect/sessionReports.ts`).
Judges and scorers never read taste; the read tool says so.
