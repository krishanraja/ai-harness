# One registry of every repository, and a neighbours table every session reads, 2026-11-24

Status: admitted. Krish ruled it on 2026-11-24.

## The rulings

- Krish, 2026-11-24: "ikigai is the layer above the north stars, and then let me know what all the layers of hierarchy are from there down ... I want everything to play a part and be called upon where needed like humour-engine, divergence-engine, and anything else."
- Krish, 2026-11-24: "every single repo must be able to understand what other repos (capabilities) exist around it so collaboration is proactive at all times".
- Krish, 2026-11-24, on scope: OLD-ctrl-mindmake, conclusiv, merciless, kimon, dipti-health, lozatron, legacy-ascend, fractionl-homepage and getaround.london are excluded from the map; fractionl-circle is dormant; "content-archives is specifically for my personal photos and videos, so we should exclude it from this map"; personal projects are told apart from the OS.
- Krish, 2026-11-24, renames approved: growth-fulltime to growth-full-time, AEO-Engine to answers-engine, inspirationhouse to taste-engine, ctrl-mindmake to ctrl, krish-raja to krishraja-site, and the divergent-thinker name to divergence-engine.

## Why

The fleet list named only canon surfaces, held no scope, layer, role or venture, and said nothing about what each repository can do for the others. So nothing called humour-engine or divergence-engine unless a session already knew to, four repositories kept their own copy of which repository serves which venture, and the list's `mm-ctrl` entry resolves to GitHub id 1090040458, which is OLD-ctrl-mindmake, the repository Krish excluded, while the live CTRL repository (ctrl-mindmake) had no entry at all.

## Which part of the North Star it moves

ai-harness's number is the corrections Krish has to give twice in a week. One of the most repeated is a session doing a job another repository already owns (writing its own humour, its own divergence, its own strategy) or not knowing a capability exists. The neighbours table puts every capability in front of every session before it builds, so that correction is not needed a second time. Its proof is the map's calls and called edges in internal-auditor, which count real calls.

## The walls

A call through the table goes through the called repository's own walls. The table widens nothing any session may post, send or spend; a paid route (divergent_run) keeps its caps and spend rules, and a growth engine's route is its own dispatch, never a send.

## What changes

| File | Change |
|---|---|
| `state/fleet.yaml` | A `registry` section: every repository Krish owns, with its scope (in, personal, unplaced, dormant, excluded), layer, role, venture, and for each in-scope one what it can do, how to call it and when. Approved renames are recorded as `rename`, applied later one pull request at a time. `repos` stays the list of canon surfaces. |
| `scripts/render-capabilities.mjs` | Renders the in-scope rows into `skills/krish-principles/references/capabilities.md`, and checks the registry against the canon surfaces. |
| `scripts/validate-surfaces.mjs` | Fails on a canon surface with no registry row, an in-scope row missing what it can do, how to call it or when, or a neighbours table that differs from the registry. Warns on a canon surface that is excluded or dormant. |
| `contract/templates/canon-block.md` | One sentence, **Neighbours:** every session reads the table before building or deciding and calls the repository whose trigger fits. |
| `skills/krish-principles/SKILL.md` | Names the new reference. |

## Not in this change

Retiring the excluded and dormant canon surfaces (mm-ctrl, which is OLD-ctrl-mindmake, contentarchives, fractionl-circle) and admitting ctrl-mindmake touch the docs steward's fleet, the central steward's options and the repository administration publisher, so they are their own change. The validator warns on each until then. Personal and unplaced rows marked `confirm: true` wait for Krish.
