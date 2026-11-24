# Insight desk candidate, 2026-11-24

Status: admitted by Krish on 2026-11-24 (his words, confirmed by him that day: "1. yes. 2. no."), recorded as `Ruling (Krish, 2026-11-24): insight-desk is admitted.` and `Ruling (Krish, 2026-11-24): insight-desk names no outside source.` The skill is now `skills/insight-desk`, its two suites are in `evals/`, the route row and collision rule are in `contract/skill-routing-contract.md`, and `state/candidates/insight-desk.yaml` is closed (`valid_until: 2026-11-24`) and kept as the record of the candidate period. Where this file says the candidate is inactive, staged, outside every route or waiting on admission, that no longer governs.

Ruling (Krish, 2026-11-24): the creative director is the ai-harness insight-desk skill with a thin adapter in each growth engine, all five wired now; no separate repo until the graduation trigger fires.

## Finding and correct layer

Each growth engine turns its number into ideas differently, and none has an insight-first step before the words: Heartside's joke lab starts at jokes, makeyourmindup binds approval to a concept it never makes, Full Time and Mindmake start from copy doctrine, and Legibility has three fixed angles. Four of the five numbers sit at U5 with a reading of 0 and the fifth is at U4 because nothing measures it. Source: each engine's `north-star-state` line in its own NOW.md, read 2026-11-24 (growth-heartside as of 2026-11-12, growth-legibility 2026-11-14, growth-makeyourmindup 2026-11-15, growth-mindmake 2026-11-08; growth-fulltime unmeasured). Those readings are the instruments the desk is judged against; the desk does not wait for them, but at U4 with nothing measured its only allowed idea is a measurement idea, so the fix never runs ahead of the measurement it needs. The same correction ("this is not an idea, it is a template") would otherwise be given in five places, which is what this repository's North Star counts.

The correct layer is one skill in ai-harness, read live, with a thin adapter in each engine. A separate repository would either hold taste, which breaks the 2026-10-28 ruling that the taste ledger is keyed by venture, or hold prose with nothing to run, which is a skill.

## What the candidate is

- `SKILL.md`: the trigger, exclusions, the eleven-step pipeline, the output, approval walls, the graduation trigger and provenance.
- `references/insight-format.md`: the insight line, the four points to read and the stall diagnosis.
- `references/methods-by-category.md`: five categories, nineteen methods, in this harness's own words.
- `references/tests.md`: the screen, pass or fail with evidence, and no numeric scores.
- `references/engines.md`: humour engine and divergent-thinker rules.
- `references/insight-sheet.schema.json`: `insight-sheet/1`, JSON Schema draft 2020-12.
- `scripts/validate_sheet.py`: a standard-library check of one sheet, including the rules a schema cannot hold.
- `scripts/validate.py` and `scripts/tests/`: the gate the harness runner calls for any candidate that carries them.

## Missing-skill test

1. Recurs with consequence: yes, every engine's idea step, weekly, behind every North Star number.
2. Distinct trigger: yes, an engine's adapter or an ask for new ideas behind a number. Words, channel fit, production, portfolio plays and humour judgement each route elsewhere.
3. Repeatable workflow: yes, the eleven steps.
4. Owned standard: yes, the screen in `references/tests.md` and the sheet schema.
5. Independently verifiable: partly. The sheet is checked deterministically; idea quality is judged by blind readers and, in the end, Krish's verdicts and the engines' numbers.
6. Bounded authority: yes. It writes ideas into a private sheet and never posts, sends or spends.
7. A chapter elsewhere would be worse: yes. In `strategy-brief` it would load on every task; in a venture's repository it would be built five times.

## Overlap review

| Neighbour | What it owns | Where the desk stops |
|---|---|---|
| `strategy-brief` | route, authority and checks for material work | the desk runs after it and writes ideas, not plans |
| `krish-voice`, `ad-copywriter`, `krish-content-marketer` | words, captions, sequence logic, CTA copy | the desk hands every word to them |
| `content-corpus` | channel and format fit | the desk names a channel role only |
| `council` | judging a decision or idea on an explicit ask | the desk generates and screens; the council judges if Krish asks |
| strategist (repository) | recovery plays across ventures | the desk reads its diagnosis and stops when the stall is not the idea |

Functional overlap with any one neighbour is small: this is the reviewer's judgement from the table above, not a measurement.

## Route, applied at admission on 2026-11-24

The staged paragraph under "Inactive idea-producer candidate" is gone from `contract/skill-routing-contract.md`; the route row and the `insight-desk` collision rule there replace it. They are stated there once and not repeated here.

## Provenance

Ruling (Krish, 2026-11-24): insight-desk names no outside source; the methods stay in this harness's own words and no committed file credits anyone else.

## Get_skill and the adapters

Control Center's `get_skill` reads `skills/<name>/` on main, so once this admission merges it serves `insight-desk` from `skills/insight-desk/SKILL.md`. Before admission the candidate under `candidates/` was not served, and the five engines' adapters read it from a local ai-harness checkout or recorded `unavailable`.

## Venture isolation

Sheets are scoped per venture. Each engine writes its own sheets to its own private path (`local/` or `runtime/`, never committed), reads only its own, and names its own namespace for divergent-thinker (`growth-<venture>:ideas`). The skill holds no sheet, no verdict and no taste; taste stays in the venture-keyed ledger (Ruling, Krish, 2026-10-28). No engine reads another engine's sheet.

## Evidence path without Krish on every step

Admission and the provenance ruling were his, both given on 2026-11-24. The blind verdicts are not extra work: each engine already brings ideas to him through its existing review path, and the A/B (set 1 plain, set 2 from a sheet) rides on that path. The strategist's weekly board reads the yes rate and live results by `harness_skill_sha`, and the internal auditor watches use across the fleet.

## Admission ask

1. Admit `insight-desk` as a production skill, keep it as a candidate, or reject it.
2. Rule on provenance: keep the methods with no credit, add a credit, or replace the methods.

Answered 2026-11-24: 1, admit; 2, no credit ("Provenance" above).

At admission: move `candidates/insight-desk/` to `skills/insight-desk/`, move the two suites to `evals/`, close `state/candidates/insight-desk.yaml` with a `valid_until` date and keep it as the record of the candidate period, add the registry entry (role `idea-producer`, freshness 60 days) and the route row and collision rule, raise `expected_skill_count`, add routing cases, name it in both cloud routing texts, record the chapters in `brain/rules.yaml`, and keep its tests running in `scripts/Test-Harness.ps1`.

## Graduation trigger

It stays a skill until all three hold: it beats the plain baseline on Krish's blind verdicts in two or more ventures over four or more weeks; three or more repositories need it in scheduled runs with no Claude session; its deterministic checks exist in both Python and Node. Only the taste-free checks would move.

## Revisions

- 2026-11-24 (#309): withdrawn, not reworded, and removed from the body above in that same pull request: the claim that overlap with any one neighbour is "well under 20 percent" (it was never measured), and the route paragraph that repeated the routing contract. The contract paragraph is the route's only home.
- 2026-11-24 (#311): the contract paragraph now also states the U4 measurement-idea rule. Not new behaviour: it is step 2 of `candidates/insight-desk/SKILL.md` since #308 and applies `contract/north-star-metric.md` ("Lead with the gap"). The skill step governs; the contract line summarises it and is corrected to match if they ever differ.
- 2026-11-24 (admission): Krish admitted the skill and ruled that it names no outside source. The open provenance finding is replaced by the one-line ruling under "Provenance", the staged route paragraph by the route row and collision rule, and the Status line now records the admission.
