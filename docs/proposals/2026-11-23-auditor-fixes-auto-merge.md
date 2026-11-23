# internal-auditor's fixes merge themselves, 2026-11-23

Status: admitted. Krish ruled it on 2026-11-23, and internal-auditor #10 already carries it. This brings the operating contract into line so the two cannot disagree.

## The ruling

- `Ruling (Krish, 2026-11-23): all auditor fixes auto merge.`

## Why

The operating contract's Authority section said pull requests in any other repository wait for Krish's merge, apart from bot pull requests that already merge themselves. 15 of the 25 repositories the fix queue can fix have no auto-merge, so the queue's fixes would sit open, the opposite of what the auditor exists to stop. Krish ruled that every auditor fix merges itself.

## What it allows, and its bounds

- Only internal-auditor's own fix pull requests, branch `auditor/fix-<n>`, opened by its fix queue (`.github/workflows/fix-queue.yml`, `src/fixMerge.ts`).
- The queue merges one only when every check on it is green at the exact head it checked. A red, conflicted or unchecked fix is labelled `needs-krish` and stays open for him.
- The fix itself never touches `.github`, a NORTH_STAR file, a secret or a deleting migration; the finish step refuses such a change before it is pushed.
- ai-harness is excluded: its own judged merge bot (`scripts/merge-bot-prs.mjs`) stays the only merger there.
- Nothing here widens what any repository may send, post, spend or delete.

## The two features the queue now runs, named for the record

- **The Systems feed** (Control Center protocol 1.48.0, `systems_alerts`): each fix-queue run turns items on OS > Systems that a code change could close into `from-systems` issues, at most three a run, one per stable key, never in a public repository. Anything routed to Krish stays on Systems, and an issue whose item has cleared is closed.
- **The night audit that follows Krish**: the daily audit has no fixed UTC time. The fix queue starts it between 02:00 and 04:00 in Krish's current time zone, read from Control Center, and catches up after a missed night.

## Known weakness

Some repositories have thin pull request checks (heartside, full-time, fractionl-pulse, sendlinks), so a green fix there rests on weak evidence. The auditor's scorecard already flags thin CI; raising it is that repository's own work.

## What changes

| File | Change |
|---|---|
| `contract/krish-operating-contract.md`, Authority | The sentence on other repositories' pull requests adds internal-auditor's own fix pull requests and their bounds. |
