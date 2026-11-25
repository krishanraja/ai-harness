# Name every neighbour in the cloud routing, 2026-11-25

Status: proposed. Krish asked for it on 2026-11-25.

## The ruling

Krish, 2026-11-25: "do you think the entirety of the intelligence and all the various bits of machinery in my fleet is now able to be used in the right moments? everything? And what does the auditor need to be aware of here?", then "yes build both and merge when green".

## What changed and why

internal-auditor's new neighbours check (krishanraja/internal-auditor#39), run against main after the creative-work paragraph landed, found seven capabilities no router names: answers-engine, software-qa, sendlinks, content-watcher, krish-clone, claude-archive and music-watcher. A session reached them only if it happened to open the neighbours table. One line in `adapters/cloud/account-routing.md` now names each at the moment it should be called, with the research library first before paid research. `scripts/test-account-sync.mjs` holds the names.

## Why no eval case

The plan was an eval case for the creative routing. `evals/README.md` says the behaviour cases are run by nothing, and canaries measure only whether a skill fires; a taste read or a divergence score is a tool call, which no canary records. A case written there would look like proof and be none. The behavioural proof is internal-auditor's use measurement instead: calls per capability and surface from Control Center's `neighbour_use` block, not_checked until Control Center serves it.

## Not in this change

software-qa's route is still unrecorded in `state/fleet.yaml`; it needs its own README read, so it stays an auditor finding until then.

## Which part of the North Star it moves

The corrections Krish gives twice in a week: "you did not know that existed" is one, and this removes the last places the cloud routing left it possible.
