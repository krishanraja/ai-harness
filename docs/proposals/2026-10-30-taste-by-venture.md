# Taste by venture: each venture reads and reports only its own taste

Krish, 2026-10-28, in his words: "each repository builds its own taste ledger and reads from its own taste ledger, and
not the central makeyourmindup one", and "The ledger is keyed by venture not repository. Makeyourmindup as a separate
venture to mindmake". Both are quoted in krishanraja/inspirationhouse `README.md` ("Each venture reads only its own
taste") and recorded as `Ruling (Krish, 2026-10-28)` in commit 09a3800 (pull request 174), which landed through pull
request 189.

Krish confirmed it on 2026-10-30, after the judge found this proposal was written once the change had landed: "yes
taste rules are kept separate per venture", then "but able to be cross analyzed in the future".

This proposal is written after the change landed. The judge panel on pull request 189 found the canon edit had no
proposal and no ledger row, and that the ruling was cited only as a paraphrase. It records the decision, the reasons and
the fallback here, and is the source `brain/rules.yaml` gives for `canon.taste`. The two skill sections keep the ruling
commit 09a3800 as their source.

## What changes

- **The canon** (`contract/templates/canon-block.md`, clause `canon.taste`): a session gives `get_approved_taste` and
  `report_to_taste_engine` the repository it is in (owner/name), and the venture the work is for when that repository
  serves several. The read returns only that venture's rules.
- **krish-voice** (Workflow) and **krish-design** (Design task contract): the same read parameters, in the skill's own
  words for its lane.
- **The fallback files** (`skills/krish-voice/references/approved-taste.md`, `skills/krish-design/references/approved-taste.md`):
  rendered by inspirationhouse (`src/publish/harness.ts`) with one section per venture, headed by the repositories that
  venture's taste is for. A session applies only its own venture's section.

## Why

Until 2026-10-28 there was one ledger, the one his words call "the central makeyourmindup one". A rule approved there would have been served to a session drafting for Mindmake or another venture, and applied as if
it were Krish's taste for that venture. That does not remove a repeated correction, it creates a new wrong one. Keying
by venture is what lets a correction made once for one venture stay with that venture.

Which part of the North Star it moves: the first goal, "no AI working for Krish ... needs the same correction twice". It
keeps the corrections that path carries from leaking into the wrong venture. The number is still unmeasured.

## What the fallback does

- The connector's read and the fallback file both return one venture's rules, never another's, and there is no shared
  tier: a venture with no approved rule reads none, never Make Your Mind Up's.
- "Before a material design, read his approved rules" and "a repository not listed reads none of these" do not
  conflict. The session reads, and for an unlisted repository the read is empty, which the skills already say means no
  rule is approved yet. It never invents one.
- A report with no venture is held by inspirationhouse and counted as `reports_unassigned`, never filed under a guess
  (krishanraja/inspirationhouse `README.md`, "Each venture reads only its own taste", and `AGENTS.md` rule 10, at c7e4733).

## Separate, and still comparable

Separate means what a session applies: it reads and reports only its own venture's rules. It does not mean separate
stores. Every venture's evidence, claims and rules stay in one ledger, each row carrying the venture it was filed under
(krishanraja/inspirationhouse `AGENTS.md` rule 10), so they can be analysed across ventures later, as Krish asked on
2026-10-30. No such analysis exists yet. A change that splits the ledger into per-venture stores, or drops the venture
column, would break this and needs his ruling first.

## Where each fact lives

The canon clause `canon.taste` is the home of the rule that the read and the report are scoped to a venture. The two
skills restate only the parameters their own call takes. The fallback files' headers are rendered, not written by hand:
their text comes from inspirationhouse, so a change to it is made there and arrives by the taste-sync pull request.

## How approval of each rule is recorded

Unchanged by this proposal, and restated because the judge found the fallback headers had lost it: the taste engine
proposes claims built from his own words and answers (card answers on the Inspiration page, his verdicts, session
reports of his exact typed words). Only Krish approves, rejects or rewords a claim, on the board or in Control Center
(inspirationhouse `AGENTS.md`, rule 5), and an approved rule reaches a skill file only through a pull request he merges.
