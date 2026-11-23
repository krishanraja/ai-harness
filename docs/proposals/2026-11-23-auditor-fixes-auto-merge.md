# internal-auditor's fixes merge themselves, 2026-11-23

Status: admitted. Krish ruled it on 2026-11-23. internal-auditor #10 was built to that ruling and merged before this contract change, so for a time the auditor merged under a ruling the contract did not yet carry. This change closes that gap: the contract is the authority, and if it does not merge, the auditor's merge step is switched off rather than the contract read loosely.

## The rulings

- `Ruling (Krish, 2026-11-23): all auditor fixes auto merge.`
- `Ruling (Krish, 2026-11-23): merge and deploy.` Asked whether an auditor fix that merges itself also approves the deploy its repository runs from main, Krish answered "merge and deploy everything when done".

## Why

The operating contract's Authority section said pull requests in any other repository wait for Krish's merge, apart from bot pull requests that already merge themselves. 15 of the 25 repositories the fix queue can fix have no auto-merge, so the queue's fixes would sit open, the opposite of what the auditor exists to stop.

## What it allows, and its bounds

- Only internal-auditor's own fix pull requests, branch `auditor/fix-<n>`, opened by its fix queue (`.github/workflows/fix-queue.yml`, `src/fixMerge.ts`).
- The queue merges one only when every check on it is green at the exact head it checked. A red, conflicted or unchecked fix is labelled `needs-krish` and stays open for him.
- A fix never touches `.github`, a NORTH_STAR file, a secret or a deleting migration; the finish step refuses such a change before it is pushed. So a merge can start only what that repository already runs when its default branch moves, deploys included, and Krish approved that in advance.
- ai-harness is excluded.
- Nothing here widens what any repository may send, post, spend or delete.

## The two features the queue now runs, named for the record

- **The Systems feed** (Control Center protocol 1.48.0, `systems_alerts`): each fix-queue run turns items on OS > Systems that a code change could close into `from-systems` issues, at most three a run, one per stable key, never in a public repository. Anything routed to Krish stays on Systems, and an issue whose item has cleared is closed.
- **The night audit that follows Krish**: the daily audit has no fixed UTC time. The fix queue starts it between 02:00 and 04:00 in Krish's current time zone, read from Control Center, and catches up after a missed night.

## Open risk, not settled here

The gate is only as good as each repository's checks. The audit of 2026-11-23 found thin pull request checks in heartside, full-time, fractionl-pulse and sendlinks, so a green fix there is weaker evidence than one in a repository with a full suite, and it can reach production. Nothing in this change verifies those checks. The owner is internal-auditor: today its CI check flags only a repository with no pull request checks at all, so its next change adds a finding for checks that run no tests, and its fix queue can then take that finding like any other. A fix the queue holds as `needs-krish` stays an open, labelled pull request in its repository until Krish acts; it is never merged around him. Until a repository's checks are raised, a merged fix there is not proof that it works.

## What changes

| File | Change |
|---|---|
| `contract/krish-operating-contract.md`, Authority | The sentence on other repositories' pull requests names the class of merge Krish approved and points here; the branch name, label and checks stay in this proposal and in internal-auditor, their one home. |
| `docs/proposals/2026-11-18-harness-change-requests-auto-merge.md` | Its "Unchanged" line on other repositories is marked superseded in part, pointing here. |
