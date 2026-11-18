# Change requests in ai-harness merge themselves too, 2026-11-18

Status: proposed. It takes effect when the pull request that carries it merges.

Asker: Krish, 18 November 2026, answering whether "100%" covers change requests: "yes, harness/ change requests auto merge too". It extends `docs/proposals/2026-11-18-ai-harness-auto-merge.md` (#290), which left them out because the contracts named a human as their merger. Value test: no change request in ai-harness that is ready, green and judged waits for Krish to press merge.

## What changes

| Where | Change |
|---|---|
| `scripts/merge-bot-prs.mjs` | In ai-harness every pull request of the fleet owner's except the canon sync, machine evidence and steward fallbacks is a `session` pull request, so change requests and other `harness/` branches merge under the same gates: not a draft, no conflict, no review asking for changes on the head, and closeout, the validation build and the judge panel green. A change request opens as a draft (`scripts/open-changes.mjs`), and nightly housekeeping marks it ready only once every check passed and the judge measured it. `harness/` branches in other repositories keep their own lifecycle. |
| `contract/skill-routing-contract.md`, stage 9 and the closing line | In ai-harness a change request merges itself once ready, green and judged; elsewhere a named human merges or closes it. Capture still never merges its own change; the merger's gated merge is not capture's. |
| `contract/active-skill-quality-standard.md` | A change is accepted when its change request merges, rejected when it closes; in ai-harness the merge is the gated auto-merge, and Krish can still close or overrule it. |
| `contract/krish-operating-contract.md`, Authority | The standing exception covers change requests on `harness/` branches in ai-harness. |
| `contract/templates/canon-block.md`, Authority | The one-line exception names change requests. |
| `skills/ctrl-capture`, `skills/harness-maintainer` | Acceptance is the merge, gated as above, never capture's own. |
| Evals | `capture-behavior-024`, `harness-behavior-023` and `route-013` follow; capture auto-merging its own change is still a failure. |

## Unchanged

Capture never merges, releases or writes a Ruling line. The judge panel still holds any change request it blocks, and a blocking finding is overruled only by Krish's own Ruling line. Pull requests in other repositories still wait for Krish, apart from the bot pull requests that already merge themselves.

## Rollback

In `kindOf`, put the `harness/` check back above the ai-harness `session` line.
