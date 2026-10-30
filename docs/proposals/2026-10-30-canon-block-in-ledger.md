# The canon block joins the rules ledger

`contract/templates/canon-block.md` is rendered into the `AGENTS.md` or `CLAUDE.md` of every repository in the fleet,
but until this change it was outside `brain/rules.yaml`. Its clauses had no hash and no source, so an edit to one
passed every check. On pull request 189 that let the taste clause be rewritten in place with nothing recording which
wording was current; the judge panel found it (ghost-facts, write-gating).

## What changes

`scripts/brain-rules.mjs` reads the canon block as a contract: each bold-labelled clause (`**Authority.**`,
`**Taste:**`) is one rule, from its label to the next label or blank line, with the id `canon.<label>`. An unlabelled
opening paragraph takes its id from its first words, and template placeholders (`{{who_krish}}`) are not rules. From
here on, an in-place edit to any clause fails `validate-surfaces` and `brain-rules.mjs --check` until the ledger records
a new source for it, which is the same gate every contract rule and skill chapter already has.

## Where each entry comes from

These clauses existed before the ledger tracked them. Each entry's `first_seen` is the date of the commit that first
introduced its label (found with `git log -S` on the label), and its `text_sha` is the clause's text on main at
3bf0692, the head this change started from. The text of some clauses changed after they were introduced; the ledger
holds no history for those earlier wordings, because none was recorded at the time.

| Clause | First introduced |
|---|---|
| `canon.precedence`, `canon.authority`, `canon.verification`, `canon.truth-and-freshness`, `canon.secrets`, `canon.corrections-are-the-training`, `canon.route`, `canon.where-the-rest-lives`, `canon.this-repository-s-own` | 8d6a8cb (2026-09-08, pull request 2, "One canon, every surface: renderer, portable paths, canon block") |
| `canon.north-star` | b37a7d0 (2026-10-18, "add the North Star and anchor every session to it") |
| `canon.close-out`, `canon.one-home-per-fact` | cc6ffee (2026-10-22, pull request 152, "Session closeout, one system and one fleet list") |
| `canon.rendered-from-krishanraja-ai` | 2e92b86 (2026-10-28, pull request 175) |

`canon.taste` is sourced to `docs/proposals/2026-10-30-taste-by-venture.md` instead, with its pre-2026-10-30 wording
kept in its history under `docs/proposals/2026-10-26-two-way-taste.md`.

These entries record when each clause appeared, not why. They change no clause's text.

## Not covered

The cross-contract overlap warning in `validate-surfaces` leaves the canon block out: it is the contracts' own summary
for other repositories, so it repeats them by design, and reporting each repetition would bury real duplicates.
