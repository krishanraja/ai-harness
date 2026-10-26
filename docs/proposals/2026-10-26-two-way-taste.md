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

## Which part of the North Star it moves

The first goal and its number: "no AI working for Krish ... needs the same correction twice", counted as corrections he had to give twice in a week. Today a voice or design correction he types in one repository is lost to every other session. With this change it is reported once, in his exact words, to his taste ledger; once he approves the rule it comes from, every session reads it before writing or designing, so the same correction is not needed again elsewhere. The number is still unmeasured (U4); this builds the path a correction takes, not the count.

## Why it is safe

The rulings it rests on: his exact typed words are his (Krish, 2026-10-24: "exact typed quotes count as my opinions on
what I think you should do with that content"); everything else a session reports is an observation, context only,
never counted toward a rule; only he answers a card or approves a rule. The tools enforce all three (control-center
`api/harness/_taste-mcp.ts`, content-engine `taste_reports`, inspirationhouse `src/collect/sessionReports.ts`).
Judges and scorers never read taste; the read tool says so.

## The approval wall

The judge panel on #165 found the report instruction read against the canon's approval wall, with neither side named.
Krish ruled on 2026-10-26, in his words: "reports to my taste ledger are exempt from the approval wall". The canon line
now names the exemption with his ruling, so the two never read as current against each other. A report writes only to
his own taste ledger; it is never a send, post or publish to anyone.
