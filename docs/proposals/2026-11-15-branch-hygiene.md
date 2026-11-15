# Proposal: one branch per pull request, and a weekly sweep in every repository

Status: approved by Krish on 2026-11-15 (his words: "yes to the branch hygiene proposal"). The canon sentence below
is now in `contract/templates/canon-block.md`, recorded as
`Ruling (Krish, 2026-11-15): every session works in its own worktree, one branch per pull request, a branch with no pull request after a day gets one or is removed, and every repository runs the weekly branch sweep.`
The sweep itself was approved earlier the same day and landed with this proposal.
Source: Krish's approval of 2026-11-15 in a claude.ai/code session ("yes to both": delete every remote branch whose
work is already on main, now and weekly, never a branch with unmerged work or an open pull request), recorded as
`Ruling (Krish, 2026-11-15): branches whose work is already on main are deleted now and weekly; branches with unmerged work or open pull requests are kept and listed.`
in the commit of each repository that took the sweep.

## What was wrong

A dry run across the sixteen fleet repositories on 2026-11-15 found 599 remote branches besides the default ones:
483 whose work was already on main (419 the head of a merged pull request, 64 contained in main), 114 with work not
on main, and 2 with an open pull request. Sessions start a branch, merge it through a squash pull request and leave
it behind; others start a branch and never open a pull request at all. The pile hides the branches that still
matter, and a session cannot tell an abandoned branch from one another session is still working on.

## What is built (approved, lands now)

`.github/scripts/branch_sweep.py` and `.github/workflows/branch-sweep.yml`, canonical here and copied byte for byte
into every fleet repository. Each Sunday at 03:17 UTC, and by hand (a hand run defaults to a dry run), it deletes a
branch only when its head is contained in the default branch or is exactly the head of a merged pull request from
that branch, and never the default branch, a protected branch, `gh-pages`, `floor/rejections`, `inspo/new-drops`,
or a branch that is the head or base of an open pull request. It runs on the repository's own `GITHUB_TOKEN`
(contents write, pull requests read) and prints every deletion and every kept branch with its reason to the job log.
A change to it is made here first, then copied unchanged to every repository.

## The change to the canon (approved 2026-11-15)

**The canon block, after "Close out." (one sentence):**

> **Branches:** each session works in its own worktree on its own branch, one branch per pull request; a branch
> with no pull request after a day gets one or is removed, and every repository carries the weekly branch sweep
> (`.github/workflows/branch-sweep.yml`, canonical in ai-harness), which deletes branches whose work is already on
> main and lists the rest (Ruling, Krish, 2026-11-15).

## What it does not do

It never deletes unmerged work: the 114 branches with work not on main stay and are listed in each run's log for a
session to give a pull request or for Krish to drop. It changes no branch protection and no repository setting.
