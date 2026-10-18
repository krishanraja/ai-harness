# Historical branch reconciliation, 18 October 2026

This record preserves the source work from thirteen remote branches during the
owner-authorized GitHub merge cleanup. It is historical evidence, not a current
runtime inventory or approval to apply a proposal. `CURRENT.md`, the registry,
live provider readback and the operating contract keep their existing authority.

Four missing dated proposal reports were merged unchanged. The other source
heads were joined by a separate history-only merge whose Git tree is identical
to its first parent's tree. No old skill, contract, synchronization code,
release registry, heartbeat, current-state narrative or immutable operational
record was restored. Every original source head remains reachable from main
after the PR is merged.

## Evidence kept separately

- The [September 8 proposal variant](branch-snapshots/2026-09-08-proposal-variant-a5dbd655.md)
  has a different observation count from the existing same-date report. Both
  are retained; neither is a new acceptance decision.
- The [earlier September 25 machine run](branch-snapshots/2026-09-25-surface-run-abf67f2.json)
  shares release and manifest identity with the later run already merged in
  PR #96, but differs in run identity, timing, status and surface measurements.
  The current machine-run file is unchanged.
- The [Telegram branch attestation](branch-snapshots/2026-09-20-telegram-note-ed1545ec.md)
  says one gateway job was disabled, while the existing dated note says it
  remained enabled. This is an unresolved historical discrepancy. No command
  in either note was executed, no live job was inspected or changed, and no
  current-state conclusion is inferred from the branch name or commit date.
- Original [September 9](branch-snapshots/2026-09-09-steward-log.patch.json) and
  [September 21](branch-snapshots/2026-09-21-steward-log.patch.json) chronology edits
  are kept as inert patches without rewriting the existing history ledger.

## Per-branch disposition

| Branch | Original head | Disposition and evidence |
| --- | --- | --- |
| `codex/harness-sync-automation-20260908` | `e45f5677c385307ea211b445d09d874389d012d0` | Governed reconciliation was merged in #24 (cb3a029) and subsequently repaired. Current Invoke-HarnessSync retains the PowerShell 7 guard, per-surface no-op measurement catch and nonterminating error output; the three historical deployment/canary/run blobs are already byte-identical on main. Keep later reason-word and identity fixes. |
| `harness/proposals-2026-09-08` | `a5dbd6556611771249832890d0dc97b3242a9ad7` | The existing same-date report on main represents a different evidence count/disposition. Preserve the source variant separately, without replacing either report or promoting an unaccepted proposal. |
| `harness/proposals-2026-09-13` | `155ac2304bd5523a1379b1af8249969be199386f` | Missing dated report: merge its original file unchanged as historical proposal evidence, with no canonical acceptance implied. |
| `harness/proposals-2026-09-28` | `4b689495870cecf94ff0f869feebe1a8609a3582` | Missing dated report: merge its original file unchanged as historical proposal evidence, with no canonical acceptance implied. |
| `harness/proposals-2026-10-05` | `f34c89b99dbbd0859d282d0c30cd21227ab66a5e` | Missing dated report: merge its final revised file unchanged; preserve both original commits without resetting current policy. |
| `harness/proposals-2026-10-12` | `d46f21c030e4267e893d1a4c76188b2f3f28e2b0` | Missing dated report: merge the awaiting-owner evidence unchanged; approval to preserve this report does not approve its conditional rule proposal. |
| `machine-sync/surface/v2026.09.24.3-20260925T042353Z` | `abf67f2ab8035e79ff8b267d3e646fff55d44c53` | A later run of the same release was merged in #96 (32092f6/c96cc2b). Shared release/manifest fields match, but run IDs, timestamps, status and surface measurements differ. Preserve the early run separately; never overwrite the later immutable run record. |
| `steward/2026-09-09` | `27e8455c3e5e5aabed5f3bd742d62a5b4b08b902` | NOW.md has since been reconciled through October 16 and newer releases. Preserve this original chronology patch separately while retaining the current NOW narrative and history ledger. |
| `steward/2026-09-20` | `2453ea38b0e6cf73d2471fd0f6ff9f35b2a1c208` | This changes only NOW.md stamps around the September state. Main NOW records later source/release evidence, so retain its current state and preserve the old commit as history. |
| `steward/2026-09-21` | `8f6985d47b8059ad980c60e692de7d196f26efec` | October 16 recomputed the stale-review count from registry evidence; do not restore this earlier freshness/status snapshot. Preserve its distinct chronology patch separately. |
| `steward/2026-09-22` | `ecde26379065f8c0757d5c86be326398f9b4ab87` | This changes only NOW.md stamps and pre-October release narrative. Current NOW/CURRENT/registry are newer authority; original commit retained in ancestry. |
| `steward/2026-09-23` | `94f4c190bf0204d7227dc007c7c54c1e214e0978` | The later NOW reconciliation already records the still-open freshness backlog with corrected counts. Preserve old stamps in history rather than replacing current evidence. |
| `vps/telegram-off-2026-09-20` | `7444d8d199afec2963ee6ebf5973142032394afd` | Four later quality-system commits are exact patch equivalents and their canary/deployment blobs match main. The earlier Telegram attestation disagrees with the existing note about one job enabled flag: preserve it separately as unresolved historical evidence; do not change current/runtime state. |

## Preservation checks

- Baseline main: `1eca2fdcdff2251acf5ffcb73eb68d0540890eed`.
- History-only merge: `55bae53dcd682d15551e07d5abc95d3c9ac7c4b2`.
- Tree before and after that merge: `1dad4ec7a50e182f46ea734378e4450e1d3da3ac`.
- Original proposal files and the three separate snapshots retain their source bytes.
- Source head ancestry, protected current-state file equality, structural/security gates and GitHub checks are verified before cleanup.
