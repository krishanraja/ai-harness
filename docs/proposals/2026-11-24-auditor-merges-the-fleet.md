# internal-auditor merges the fleet's pull requests, 2026-11-24

Status: admitted. Krish ruled it on 2026-11-24.

## The rulings

- Krish, 2026-11-24: "why does the internal auditor not take care of all of this? ... All repos should also be auto merge".
- Asked how, he chose "Auditor merges centrally": one merger in internal-auditor, run hourly on Control Center's clock, over every fleet repository, rather than a workflow file copied into each one.
- Asked whether the auditor may also close superseded bot pull requests and file a fix issue for a red one, he chose "Yes, all of it".

## Why

On 2026-11-24 the fleet held 20 open pull requests, most of them green. 15 of the 25 repositories the fix queue can fix have no auto-merge, and the five that do each run their own copy, keyed to the name of their own CI workflow, so no single file can be copied byte for byte. A green pull request in such a repository waits for Krish forever, which is the opposite of what he asked.

## What it allows, and its bounds

- Only pull requests in fleet repositories other than ai-harness, which keeps its own merge bot and judge panel.
- Only one Krish or one of his bots opened (`krishanraja`, `github-actions[bot]`, `claude[bot]`, `codex` and the like), never a fork or a stranger's.
- Only when it is not a draft, has no conflict, and every check on its head is green with none still running. A repository whose checks run no tests is merged all the same, and its `ci-thin` finding says a green check there proves little.
- A red pull request is never merged: it gets a `from-audit` fix issue with its cause, for the fix queue.
- A bot pull request that a newer one of the same kind from the same bot supersedes (a later `steward/<date>`, a later canon sync) is closed with a comment. Its branch is kept; the 7-day sweep retires it under its own bounds.
- A merge starts only what that repository already runs when its default branch moves. The merger writes no file into any repository.
- Nothing here widens what any repository may send, post, spend or delete.

## What changes

| File | Change |
|---|---|
| `contract/krish-operating-contract.md`, Authority | One sentence after the auditor-fix exception names this class of merge and points here. |
| krishanraja/internal-auditor | `src/prTriage.ts` and `pr-triage.yml` carry the rules; their tests hold them. |
| krishanraja/control-center | Its engines' clock knocks `pr-triage.yml` hourly. |
