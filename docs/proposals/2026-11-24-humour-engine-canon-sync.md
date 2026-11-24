# humour-engine joins the canon sync, 2026-11-24

Status: ruled by Krish on 2026-11-24 (his words: "Ruling (Krish, 2026-11-24): humour-engine joins the canon sync. sort out the rest"). He asked for it first as step 15 of the fleet architecture plan ("humour-engine fully in the fleet"), then "set the humour-engine North Star as drafted" and "sort out the remainder" the same day.

## Finding and correct layer

humour-engine is already a registry specialist in `state/fleet.yaml` (scope `in`, layer `specialist`): the fleet's one definition of humour, called by content-engine and growth-makeyourmindup before a funny line goes out. It is not a new agent and adds no capability. What it lacked was the canon sync: humour-engine#1 adds the canon block, auto-merge, the closeout fold and the North Star Krish set, but `render.mjs` refuses a repository that is not under `repos`, so the block would go stale with the next canon release.

The correct layer is the one fleet list, `state/fleet.yaml` `repos`, with the two lists `validate-surfaces` holds to it: the docs steward fleet (`docs/steward/fleet.json`) and the repository administration publisher (`contract/repository-administration.json`), where humour-engine is **excluded**, like the other specialists (internal-auditor, strategist), so the publisher administers nothing there until Krish accepts it by name.

## Which part of the North Star it moves

ai-harness's number is the corrections Krish has to give twice in a week. A repository whose canon block drifts is a correction he gives again by hand; this keeps humour-engine's block current from the next release.

## What changes

| File | Change |
|---|---|
| `state/fleet.yaml` | humour-engine under `repos`, canon target `AGENTS.md`. |
| `docs/steward/fleet.json` | Its steward row, as for strategist. |
| `contract/repository-administration.json` | humour-engine in `excluded`: the publisher does not administer it. |
| `contract/skill-routing-contract.md` | The collision rule above. |

## Which skill owns what

humour-engine judges whether a line lands as humour and why; it never writes, rewrites or approves copy. `krish-voice` owns final prose and its kill-list in Krish's name, and `ad-copywriter` a venture's own voice. A humour-engine verdict is evidence for them, never an override. `contract/skill-routing-contract.md` carries this as a collision rule.

## The walls

Nothing widens. Excluded from the administration publisher means no administration writes there. The canon sync opens pull requests in humour-engine through the same route as every other fleet repository.

## Rollback

Revert the three lines; humour-engine keeps the block it has until the next release, which then reports it stale.
