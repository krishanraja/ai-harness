# Pull requests that merge themselves, and NOW.md that cannot conflict, 2026-10-28

## Rulings (Krish, 2026-10-28)

- Ruling (Krish, 2026-10-28): canon-sync and PC-evidence pull requests merge themselves when green, under the publisher's guards, and bot pull requests that a newer one replaces close themselves.
- Ruling (Krish, 2026-10-28): closeout writes a note that is folded into NOW.md on merge, instead of every session editing NOW.md; and there must be regular objective audits of the NOW files so they never fill with outdated content.
- Ruling (Krish, 2026-10-28): clear today's backlog: fix #171's conflict, merge #173 and the fleet's canon-sync pull requests.

## What this moves

The North Star's first part: "every ruling is learned once, shipped everywhere". A ruling reaches a repository only when that repository's canon-sync pull request merges, and nothing merged them but Krish. It also moves the second part, a fleet that runs without his hours, because he was the merge queue for pull requests nobody needed to read.

## What was found

Read live on 2026-10-28.

- **Pull requests out of this repository did not merge.** The canon sync (`scripts/reconcile.mjs`) opened `harness/canon-sync` in every fleet repository and waited. Ten were open, some for eleven days: fractionl-circle and full-time still carried the v2026.10.17.1 canon and mm-ctrl the v2026.10.15.2 one, without the North Star or taste lines. Only the repository administration publisher merged its own pull requests (2026-10-17 approval).
- **Every release opened a new round of them.** The release id sat inside the hashed body of the canon block, and a release is cut automatically after any skill change, so each release rewrote the block in about twelve repositories. #173 here changed exactly two lines, both the release number.
- **Pull requests into this repository conflicted within a day.** The closeout check made every session pull request edit NOW.md, and main rewrote NOW.md daily (the steward's re-stamp and every merge). #171's only conflict was NOW.md. Merging main into an open pull request also moved the check's date floor to the base tip, forcing a new North Star check date on every update.
- **Bot change requests and learning reviews failed closeout by construction.** Their commit subjects matched no automation pattern and carried no closeout line, so `closeout` went red, housekeeping never marked them ready, and they expired after 14 days unseen.
- **Nothing told Krish what was waiting.** The digest listed only ready change requests.
- **NOW.md had grown past use.** This repository's ran to 44,878 characters, one line over 5,000, with 38 "What changed recently" bullets and three "Next" lines, and still said PR 170 was open after it merged.

## What was built

1. **No release-only churn.** The canon block's body no longer names the release (the start marker does), and an unchanged body keeps its whole stamp (`scripts/render.mjs` `blockFor`). A release that leaves the canon's wording alone changes no byte anywhere. `scripts/test-canon-sync.mjs` proves it.
2. **Bot pull requests merge themselves** (`scripts/merge-bot-prs.mjs`, workflow `harness-bot-prs.yml` hourly at :41, on machine-evidence pull requests, and inline after the nightly reconcile).
   - Canon sync: opened by the fleet owner from the same repository, exactly one file changed (the canon target), that file on the head equal to what the current canon renders onto the current base, every check green with `operating-context` among them.
   - Machine evidence (here only): only `state/deployments/`, `state/canaries/`, `state/machine-runs/` and `brain/usage.jsonl`, every check green with `closeout` among them.
   - The merge names the checked head; the files are read back from the base afterwards. A red check holds and lists it; nothing is merged past a failure.
   - Replaced ones close: a canon sync whose base already carries the block, a conflicting machine-evidence pull request with a newer one from the same machine, a docs steward fallback after a later steward run.
   - The canon-sync branch is rebuilt as one commit on the current base (`Gh.rebuildBranch`), so it is never behind and never conflicts. A branch someone added other files to is held, never rebuilt.
3. **Closeout notes** (`scripts/closeout/check.mjs`). A session writes `now-notes/YYYY-MM-DD-<slug>.md` with `Status:`, optional `Changed:`, `Next:` and the North Star check line. The delivered check workflow gains a `fold` job: on every push to main it folds the notes into NOW.md (status on top of "Where it is right now", the change on top of "What changed recently", one folded next step and the one check line under "What is next", `as_of` forward), deletes them, and commits `docs(closeout)`, folding afresh from the newest main on each attempt. Editing NOW.md directly still passes. The check's date floor is now the work's first commit. The publisher delivers the new hook and workflow bytes, bound in `contract/repository-administration.json` (byte change dated 2026-10-28).
4. **The NOW.md audit** (`scripts/steward/audit-now.mjs`, limits in `config/now-audit.json`). Eleven fixed rules, each a count, a date or a lookup: staleness of `as_of` and the North Star check, size and line length, old or surplus bullets, one next step, unfolded notes, product commits NOW.md has not caught up with, and sentences that call a merged or closed pull request open. It runs in every nightly docs steward run before the steward writes (runbook Step 4b: fix every finding) and across the fleet at 19:47 UTC (`harness-now-audit.yml`), committing rules and counts only to `state/now-audit/`, never a quoted line, because some NOW.md files are private.
5. **What waits on Krish reaches him.** Nightly housekeeping adds two digest lines: open pull requests across the fleet that only he can move, with age and state, and NOW.md files still failing the audit after three days.
6. **Proposal pull requests pass closeout.** Change requests and learning reviews carry `Closeout: not needed, ...`.

## Material alternative, rejected

GitHub's own auto-merge with branch protection in every repository. It needs a required-checks rule configured per repository (thirteen settings changes), cannot express "only the canon block changed", and would merge anything green, a person's pull request included. The guarded merger keeps the rule in one reviewed file.

For NOW.md, a union merge driver: GitHub's server-side merge does not apply custom `.gitattributes` drivers, and a union of two prose edits leaves duplicated or contradictory lines.

## Rollback

Disable `harness-bot-prs.yml` and remove the merge step from the reconcile job: pull requests go back to waiting for a person. Notes need no rollback; deleting the fold job leaves notes in `now-notes/` for the steward to fold, and direct NOW.md edits still pass. The audit only reports.

## What Krish still decides

- Merging this pull request, which approves the new hook and check bytes and releases the canon change; the publisher and the canon sync then deliver them to the fleet, and the first canon sync after it is the first to merge itself.
- Session pull requests that change skills, contracts or code: his merge is still the release approval (Ruling, Krish, 2026-10-15). The digest now lists them.
- `config/now-audit.json`'s limits, which change only in a reviewed commit.
