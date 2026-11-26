# One engine makes every Make Your Mind Up asset, 2026-11-26

Status: ruled by Krish on 2026-11-26, recorded as `Ruling (Krish, 2026-11-26)` lines in the commits that apply it. This pull request changes two registry rows, the neighbours table generated from them and one collision rule in `content-corpus`. It widens nothing any repository may post, send or spend.

## The ruling

Krish, 2026-11-26, verbatim:

> "I believe that growth should move all asset production to Content Engine. I see no point in having a separate repository produce specific assets. How can you accomplish this and ensure that this is updated absolutely everywhere and that there can be no confusion moving forward? This would leave growth in charge of simply growing the channel."

> "I want everything to be one harmonious engine."

He ruled the grey areas the same day:

- Captions are written in content-engine at make time, not by Growth at post time.
- The weekly edition's Substack step stays with Growth.
- Canva is retired as an asset route.
- `mix.json` (the channel mix) stays with Growth.

## Why

Two repositories made assets. content-engine made the hero pieces, cuts, covers and thumbnails; growth-makeyourmindup made carousels, memes, Substack Notes and their captions. So the same kinds of asset had two routes, two looks and two sets of checks, and nobody could tell which version was current. One maker removes the second route; Growth keeps the one job only it does, growing the channel.

## What it supersedes

The registry rows in `state/fleet.yaml` read, until 2026-11-26 (`valid_until: 2026-11-26`):

- content-engine, role: "Make Your Mind Up's hero assets, the video engine, the research library." capability: "Makes finished articles, cuts, thumbnails and covers, and finds or files research."
- growth-makeyourmindup, capability: "Posting, carousels, memes, Notes and subscriber growth for Make Your Mind Up."

From 2026-11-26 (`first_seen: 2026-11-26`) content-engine makes every Make Your Mind Up asset (articles, cuts, carousels, memes, Notes, captions, covers and thumbnails) and growth-makeyourmindup posts, schedules, distributes and measures them and grows subscribers, making none. The old rows are closed by this record, not just overwritten: a reader holding an artifact built on them should treat the asset split as ended on this date. The production capability growth-makeyourmindup gave up was load bearing until today; it moved, it was not found unused.

## What it does not change

- **Skill ownership.** This is a fleet decision about which repository makes an asset, not about which skill decides its content. Under `collision-rules.krish-content-marketer-owns`, `krish-content-marketer` still owns strategy and angle; `krish-voice` owns final prose in Krish's name; a venture's brand-account words follow that venture's voice canon through `ad-copywriter`; `content-corpus` owns channel fit. Those skills now run inside content-engine's make step, never in Growth. `content-corpus.collision-and-handoff-rules` names this boundary.
- **Approval walls.** Who makes an asset moved; no approval was added or removed. Every post still goes through growth-makeyourmindup's existing walls and Krish's yes wherever those walls already require it.
- **The handoff.** content-engine hands each finished asset to Growth with its captions in the piece manifest, and Growth reports performance back. That mechanic lives here and in the two repositories' own docs, not in the always-loaded neighbours table, so other ventures do not carry Make Your Mind Up's workflow.

## Evidence it reflects live state

Read 2026-11-26: growth-makeyourmindup [PR 145](https://github.com/krishanraja/growth-makeyourmindup/pull/145) ("Growth grows the channel ... all asset production moved to content-engine") is merged; content-engine carries the matching work on branch `story/engine-v5` (head `51a9ed8`). Control Center regenerates `src/lib/fleetRegistry.ts` from this registry after merge.

## Which part of the North Star it moves

The corrections Krish gives twice: one fact, one home. Two makers for the same asset was a second home for the same fact.
