# Canon sync stops writing to the repositories Krish took off the map, 2026-11-24

Status: admitted under Krish's rulings of 2026-11-24, already on main in ai-harness#305: OLD-ctrl-mindmake, contentarchives and the others are excluded from the map, and fractionl-circle is dormant.

## Why

Three canon surfaces in `state/fleet.yaml` still pointed at repositories Krish took off the map, so the nightly canon sync kept writing to them:

- `mm-ctrl` (alias `mindmake-ctrl`) is GitHub repository 1090040458, now named OLD-ctrl-mindmake, excluded. Its last canon sync landed at 05:00 on 2026-11-24 (OLD-ctrl-mindmake#435). The live CTRL repository is `ctrl-mindmake` (1418954003), admitted in its own change.
- `contentarchives` is Krish's personal photos and videos, excluded.
- `fractionl-circle` is dormant.

## What changes

| File | Change |
|---|---|
| `state/fleet.yaml` | Each of the three carries `canon_sync: false` with the ruling as its reason, as `mindmake` has since 2026-10-06. The reconciler, the seeder and the publisher already skip such a repository. They stay in the list for parity with the docs steward's `fleet.json` and so observations that name them stay readable. |
| `scripts/steward/run-central.mjs`, `central-draft.mjs`, `config/docs-steward-rollout.json` | The central docs steward no longer enrols them. |
| `scripts/render-capabilities.mjs` | A retired surface (`canon_sync: false`) for an excluded or dormant repository no longer warns; a live one still does. |
| `scripts/test-canon-sync.mjs` | The excluded set is exactly Krish's four, each citing his ruling. |

## What stays, and why

They stay targets of the repository administration publisher, with their profiles, because `brain/knowledge.jsonl` holds 52 learning-loop records scoped to them (51 for contentarchives, one for fractionl-circle, all candidate or observed, none accepted). The knowledge validator refuses a record whose repository is not a target, and those lines are checked against rebuilt evidence, so editing them belongs in its own change. The publisher already treats a `canon_sync: false` repository as excluded, so nothing is written to them.
