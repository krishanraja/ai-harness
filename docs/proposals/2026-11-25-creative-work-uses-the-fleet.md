# Creative work in a cloud session uses the whole fleet, 2026-11-25

Status: proposed. Krish asked for this pull request on 2026-11-25.

## What happened

Krish, 2026-11-25: "I am brainstorming at the moment and it had no idea there was a council, judges, divergence engine, humour engine, taste engine or any preferences stored anywhere. There is a strategist, and loads of other things that might be useful when being asked to do a creative task like rebrand makeyourmindup."

A claude.ai session knows only what the account routing (`adapters/cloud/account-routing.md`, served by `get_skill` name `account` file `routing`) tells it. That routing names the producer skills for visuals and prose, but not the divergence engine, the humour engine, the taste engine, the strategist or the neighbours table, and it names the council only when Krish asks for it. The Neighbours and Taste rules live in the canon block inside each repository's AGENTS.md, which a brainstorm with no repository never loads, and the pointer to `references/capabilities.md` sits deep in krish-principles, which routing applies to "substantive work" that a brainstorm can read as not yet started.

## Which part of the North Star it moves

ai-harness's number is the corrections Krish has to give twice in a week. "You did not know the engine existed" is one of them, and it is the correction the 2026-11-24 neighbours table was built to stop; this carries that table into the one surface it did not reach.

## What changes

| File | Change |
|---|---|
| `adapters/cloud/account-routing.md` | One paragraph before the owner list: creative, brand, naming, positioning or brainstorming work reads the neighbours table and approved taste before the first idea, scores an obvious answer with divergent_score, offers divergent_run, the council and the strategist, and routes public copy through the humour engine. |
| `scripts/test-account-sync.mjs` | A test that the paragraph names each route and keeps paid calls under the spend rule. |

## The walls

It widens nothing. divergent_run and the humour route are paid and stay under the routing's own spend line and Control Center's caps; the council and strategist are offered, not convened; taste reports stay exempt from the approval wall as before.
