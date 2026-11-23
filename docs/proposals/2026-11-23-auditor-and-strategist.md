# internal-auditor and strategist join the fleet, 2026-11-23

Status: admitted. Krish answered the four questions below on 2026-11-23, and each answer is recorded as a Ruling line in the commit that applies this change. Nothing here widens what any repository may send, post or spend.

## The two repositories

**krishanraja/internal-auditor** is a standing auditor. Each week it scans every repository in `state/fleet.yaml` and holds each one to a ten-out-of-ten bar: clean architecture, current docs, no critical concerns, no open or unmerged pull requests left lying, branches merged, and additions that compound the engine (code, tests, guards, learned data) rather than sprawl (more instructions). It turns "not measured" and "stale" North Star readings into findings with a fix. It runs in GitHub Actions on `anthropics/claude-code-action@v1` with the subscription token, borrowing gh-aw's patterns without gh-aw itself, which takes only an API key or Copilot billing.

**krishanraja/strategist** is a blunt outside consultant for the portfolio. It turns ideas into reality without a business plan per idea, keeps each growth engine aligned with its product, and brings the recovery plays the U5 row of `contract/north-star-metric.md` already asks "the strategist" for. It uses divergent-thinker through Control Center's engine route (`map` to see the consensus on a portfolio call, `challenge` on the lead recovery play) and convenes the council as Krish's weekly board.

Both register in Control Center as specialist engines (`growth_engines.role = 'specialist'`, the AEO-Engine pattern). They report through the one engine protocol, and their asks land on Control Center's one list. Neither gets a surface of its own: Control Center's own strategist stays the one place Krish reads moves (control-center ADR-026, never a second coach).

## Why

Evidence, read on 2026-11-23:

- Control Center's fleet read (`get_venture_state`, 2026-11-23T12:12Z): ten repositories sat at U4 only because their reading was more than 7 days old (makeyourmindup, mindmake, growth-makeyourmindup, growth-mindmake, growth-heartside, heartside, growth-fulltime, full-time, growth-legibility, legibility), and three sat at U5 (content-engine, by its own `NOW.md` line, krish-raja and claude-archive).
- internal-auditor's first dry run (its scorecard is filed under krishanraja/internal-auditor `docs/scorecards` once that repository's first run lands): filearchives has no docs steward and its North Star reading is 14 days old; divergence-engine has no workflows and is missing from `state/fleet.yaml`.

No repository brings U5 recovery plays today, although the contract names "the strategist" as the one that should, and the council has run only on Krish's explicit ask since its admission on 2026-11-15. This moves the harness North Star (a correction given once, not twice): stale numbers and lingering branches become findings the auditor raises, so Krish stops repeating them.

## The rulings

- `Ruling (Krish, 2026-11-23): internal-auditor may close pull requests and delete branches idle 7 days or more, recording each head sha in its restore ledger first.`
- `Ruling (Krish, 2026-11-23): the strategist convenes the council as Krish's weekly board, and at once on any U5.`
- `Ruling (Krish, 2026-11-23): the strategist named in the U5 rule is krishanraja/strategist.`
- Recorded in the plan, not amended here: the auditor runs on `anthropics/claude-code-action@v1` with `CLAUDE_CODE_OAUTH_TOKEN`, and the consulting methods the strategist uses are rewritten in its own words and credited.

## What each amendment changes

| File | Change |
|---|---|
| `state/fleet.yaml`, `docs/steward/fleet.json` | Both repositories join the fleet, equal in both lists (`scripts/validate-surfaces.mjs` checks parity). They get the canon block, the weekly branch sweep and the docs steward. `bootstrap_head` is left out because neither repository had a commit when this was written; the steward's first reconciliation records the head in `NOW.md`. |
| `contract/repository-administration.json` | Both are excluded from the repository administration publisher by name, on the same terms as filearchives and music-watcher, until Krish accepts them there. So no `brain/repositories` profile is added. |
| `contract/krish-operating-contract.md`, Authority | A second standing exception beside the branch sweep, stated as Krish's own decision made in advance: internal-auditor may close pull requests and delete branches idle 7 days or more, Krish's own included, after appending each head sha to its restore ledger, within the bounds below. Any other close or deletion of unmerged work stays Krish's decision. |
| `contract/templates/canon-block.md`, Branches | One short pointer: deleting other unmerged branches is Krish's decision, and his standing one lets internal-auditor retire idle work within the bounds in the operating contract's Authority section. The bounds live in that one place only, so the two texts cannot drift. The template carries no version of its own: the release that next renders it stamps it, as with the divergence sentence on 2026-11-18. |
| `contract/skill-routing-contract.md` | The council's route row and collision rule add the convened read: `krishanraja/strategist` as Krish's weekly board, and at once on any U5. |
| `skills/council/SKILL.md` | The description and "When it runs" add the same trigger. The read itself is unchanged: it stays advice, approves nothing, sends nothing and records nothing, and the strategist's own plays go to Control Center's one list. |
| `contract/north-star-metric.md`, U5 row | "The strategist" is named as `krishanraja/strategist`, which also convenes the council at once. Control Center's strategist still carries the U5 plays into the daily move ("Who updates what"); it shows what the strategist brings, it does not replace it. |
| `adapters/cloud/account-routing.md` | The council line adds the convened read, so cloud sessions route it the same way. |
| `evals/council-trigger-cases.jsonl`, `evals/skill-routing-cases.jsonl` | Two positive cases (the scheduled board, a U5), one collision case (a strategist run that only reads numbers), and one routing case for the convened board. |
| `brain/rules.yaml` | The four changed rules are revised with this proposal as their source. |

## Bounds

- The auditor's close and delete exception covers Krish's own idle pull requests and branches too. He chose "close PRs and delete branches older than 7 days with no activity" over leaving his own alone, so a pull request he opened and left for 7 days is closed like any other.
- Idle means no commit, comment, review or label change for 7 days. Before each delete the auditor appends one JSON line to `state/restore-ledger.jsonl` in krishanraja/internal-auditor, `{repo, branch, sha, pr, closed_at, restore}` (`LedgerEntry` and `executeSweep` in its `src/sweep.ts`), and the weekly run commits `state/` to that repository. `restore` is the one command `git push origin <sha>:refs/heads/<branch>`; a restore is expected to work within 90 days, while GitHub still keeps the unreachable commit.
- It never closes or deletes the default branch, a protected branch, a branch in the sweep's keep list (`KEEP_NAMES`: `gh-pages`, `floor/rejections`, `inspo/new-drops`, the same in `.github/scripts/branch_sweep.py`, which the sweep runs, and `scripts/kept-branches.mjs`, held equal by `scripts/test-kept-branches.mjs`), a branch or pull request labelled `keep`, the base of an open pull request, or anything with checks running. It deletes nothing else and merges nothing.
- A convened council read is advice. "Go" approves nothing; Krish decides, and recording his decision stays with `decision-ledger`.
- Both repositories propose through Control Center. Every send, post and spend keeps its own approval.

## How each one reaches a person

- A convened council read is delivered as a proposal on Krish's one list in Control Center, through the strategist's engine report, so it reaches him rather than ending in a repository.
- The auditor's success is measured by findings closed, not by a green run: it reports each finding opened and closed to Control Center.

Growth justified: the always-on surface grows by a few hundred characters across the two contracts and the canon block, because a standing exception to the deletion wall and a new council trigger have to be visible in every session, or a session would refuse the auditor's close or would not route a convened board.
