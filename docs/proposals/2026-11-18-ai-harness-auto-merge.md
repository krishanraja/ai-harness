# Every ai-harness pull request merges itself, 2026-11-18

Status: proposed. It takes effect when the pull request that carries it merges.

Asker: Krish, 18 November 2026: "ai-harness always needs to auto merge, 100% of the time", and the same day, "why do all ai-harness PRs not auto merge? they need to". Value test: no green, judged pull request in ai-harness is still open an hour after its last check finishes, and none waits for Krish to press merge.

## Why they did not merge

On 28 October (`docs/proposals/2026-10-28-prs-merge-themselves.md`) the merger in `scripts/merge-bot-prs.mjs` took on only the harness's own bot pull requests: the canon sync and the PC's machine evidence. A session pull request that changed skills, contracts or code was left for Krish's merge as the release approval (Ruling, Krish, 2026-10-15). GitHub's own auto-merge was rejected because it would merge anything green, and no branch protection names required checks. So batch 2 of the growth push (#288) sat green and judged until Krish merged it by hand.

## What changes

| Where | Change |
|---|---|
| `scripts/merge-bot-prs.mjs` | A new kind, `session`: the fleet owner's own pull request, from ai-harness itself, on any branch without a lifecycle of its own. It merges at the head it checked when it is not a draft, has no conflict (a branch that is behind is updated first), no review asks for changes on that head, and every check finished green with `closeout`, `validate-and-repeat-build` and `judge` among them. A judge panel that blocks fails its check, so it holds the merge. The squash body is left to GitHub, so every commit's Ruling line survives into main. Files are read back from the merge commit. A session pull request still open a day on is listed in the digest. |
| `scripts/lib/github.mjs` | `pullReviews`, and `mergePull` can leave the body to GitHub. |
| `.github/workflows/harness-bot-prs.yml` | It also runs when the validation or the steward (whose job is the judge panel) finishes on a pull request here, so a green pull request merges within minutes, not at the next hourly knock. |
| `contract/skill-routing-contract.md`, stage 8 | A pull request merged into ai-harness approves a harness release, whether Krish merges it or it merges itself once green and judged. |
| `contract/krish-operating-contract.md`, Authority | The never-publish rule names this as a standing, scoped exception, as it already does for `ack_engine_instruction`: the merger's merge of the owner's own green, judged session pull request in ai-harness. `harness/` change requests and other repositories still wait for Krish. |
| `.github/workflows/release.yml` | The registration message names both rulings. |
| `.github/workflows/harness-steward.yml` | The judge step's comment no longer says there is no auto-merge. |

## Not changed, and why

- **`harness/` branches in ai-harness** (change requests, learning reviews, the administration publisher) keep their own lifecycle. The routing contract says a named human merges or closes each capture change request and that capture never merges its own change, and the active skill quality standard says the same. Merging those would end Krish's review of learned changes to his standards, which is a bigger call than this ruling's words make plain. Krish decides whether "100%" covers them.
- **Pull requests from anyone else, or from a fork,** are never merged.
- **GitHub's native auto-merge** stays off: without branch protection naming required checks it would merge before the judge panel ran.

## Rollback

Remove `session` from `kindOf` in `scripts/merge-bot-prs.mjs`; session pull requests go back to waiting for Krish.
