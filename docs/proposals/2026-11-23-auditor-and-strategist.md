# internal-auditor and strategist join the fleet, 2026-11-23

Status: admitted. Krish answered the four questions below on 2026-11-23, and each answer is recorded as a Ruling line in the commit that applies this change. Nothing here widens what any repository may send, post or spend.

## The two repositories

**krishanraja/internal-auditor** is a standing auditor. Each week it scans every repository in `state/fleet.yaml` and holds each one to a ten-out-of-ten bar: clean architecture, current docs, no critical concerns, no open or unmerged pull requests left lying, branches merged, and additions that compound the engine (code, tests, guards, learned data) rather than sprawl (more instructions). It turns "not measured" and "stale" North Star readings into findings with a fix. It runs in GitHub Actions on `anthropics/claude-code-action@v1` with the subscription token, borrowing gh-aw's patterns without gh-aw itself, which takes only an API key or Copilot billing.

**krishanraja/strategist** is a blunt outside consultant for the portfolio. It turns ideas into reality without a business plan per idea, keeps each growth engine aligned with its product, and brings the recovery plays the U5 row of `contract/north-star-metric.md` already asks "the strategist" for. It uses divergent-thinker through Control Center's engine route (`map` to see the consensus on a portfolio call, `challenge` on the lead recovery play) and convenes the council as Krish's weekly board.

Both register in Control Center as specialist engines (`growth_engines.role = 'specialist'`, the AEO-Engine pattern). They report through the one engine protocol, and their asks land on Control Center's one list. Neither gets a surface of its own: Control Center's own strategist stays the one place Krish reads moves (control-center ADR-026, never a second coach).

## Why

On 2026-11-23 nine ventures sat at U4 only because their reading was more than 7 days old, and five repositories were under 40 percent of target. No repository brings U5 recovery plays today, although the contract names "the strategist" as the one that should, and the council has run only on Krish's explicit ask since its admission on 2026-11-15. This moves the harness North Star (a correction given once, not twice): stale numbers and lingering branches become findings the auditor raises, so Krish stops repeating them.

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
| `contract/krish-operating-contract.md`, Authority | A second standing exception beside the branch sweep: internal-auditor may close pull requests and delete branches idle 7 days or more, after recording each head sha in its restore ledger. Any other close or deletion of unmerged work stays Krish's decision. |
| `contract/templates/canon-block.md`, Branches | One clause naming the same exception, so every repository knows a 7-day idle pull request or branch can be closed by the auditor. The template carries no version of its own: the release that next renders it stamps it, as with the divergence sentence on 2026-11-18. |
| `contract/skill-routing-contract.md` | The council's route row and collision rule add the convened read: `krishanraja/strategist` as Krish's weekly board, and at once on any U5. |
| `skills/council/SKILL.md` | The description and "When it runs" add the same trigger. The read itself is unchanged: it stays advice, approves nothing, sends nothing and records nothing, and the strategist's own plays go to Control Center's one list. |
| `contract/north-star-metric.md`, U5 row | "The strategist" is named as `krishanraja/strategist`, which also convenes the council at once. Control Center's strategist still carries the U5 plays into the daily move ("Who updates what"); it shows what the strategist brings, it does not replace it. |
| `adapters/cloud/account-routing.md` | The council line adds the convened read, so cloud sessions route it the same way. |
| `evals/council-trigger-cases.jsonl`, `evals/skill-routing-cases.jsonl` | Two positive cases (the scheduled board, a U5), one collision case (a strategist run that only reads numbers), and one routing case for the convened board. |
| `brain/rules.yaml` | The four changed rules are revised with this proposal as their source. |

## Bounds

- The auditor's close and delete exception is narrow: idle 7 days or more, the head sha recorded first, and restorable from that ledger. It deletes nothing else and merges nothing.
- A convened council read is advice. "Go" approves nothing; Krish decides, and recording his decision stays with `decision-ledger`.
- Both repositories propose through Control Center. Every send, post and spend keeps its own approval.

Growth justified: the always-on surface grows by a few hundred characters across the two contracts and the canon block, because a standing exception to the deletion wall and a new council trigger have to be visible in every session, or a session would refuse the auditor's close or would not route a convened board.
