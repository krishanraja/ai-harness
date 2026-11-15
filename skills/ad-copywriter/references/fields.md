# The fields and where each venture keeps its rules

This file keeps no lengths and no platform rules of its own. Lengths change, and each venture's lint already holds the ones it enforces. Read a limit from the venture's lint, or from the platform on the day of writing.

## The fields of an organic post

| Field | What it does | Notes |
|---|---|---|
| First line of the caption | The only words most people read before the platform folds the rest away. It carries the hook. | Works with seconds 0 to 3 of the picture; never repeats words already on screen. |
| Rest of the caption | Gives the reason to act and the one ask. | One call to action, to the place the venture's link rules name. |
| Cover line or first-frame text | The words on the picture itself at second 0. | Made in the venture's production route, not here. This skill only checks the caption does not repeat it. |
| Call-to-action line | The one thing to do next. | One ask per post. A shop line only where the venture's rules allow one. |
| Hashtags | Help the right people find the post. | As many as the venture's rules allow, specific rather than broad. |
| Pin title and description, short-video title | The same jobs on the platforms that have them. | Only where the venture posts there. |

Ad fields beyond these are written only after Krish opens a paid test (`references/method.md`, "Paid tests").

## Heartside

- **Voice and claims.** growth-heartside's `AGENTS.md`, rules 3 to 5: facts only from the live store and heartside's canon, the real product on screen, heartside's words and banned lines. Every piece anchors to its humour profile, `docs/HUMOUR.md`.
- **What a caption may claim.** The claims table: `python3 growth.py claims`. A caption may be boosted later as it stands, so every caption is held to that table.
- **The lint.** `python3 growth.py check <drafts file>`. It holds the claims rules, the eight-word overlap with the swipe file and the sameness check across a variation set, so this skill's own lint is not needed there.
- **Links.** Every link to the store is tracked: `python3 growth.py link <url> <creative id>`.
- **Where Krish picks.** The review board (`docs/REVIEW-BOARD.md`). His no, in his words, goes to `factory/floor.json`.

## Make Your Mind Up (the publication account)

- **Voice.** growth-makeyourmindup's `docs/ACCOUNT-VOICE.md`, publication editorial. A post on one of Krish's personal accounts is his own voice and goes to `krish-voice`.
- **The lint.** content-engine's copy lint, and Control Center's one voice check (`check_voice`), which every caption written for the publication passes before it is handed over.
- **This skill's lint.** Run `python scripts/adcopy.py lint` as well, because the copy lint does not hold the overlap and sameness checks.
- **Where Krish picks.** The engine's own approval route for the week's concepts.

## A venture not listed here

Stop and ask which rules and which lint apply. Never borrow another venture's rules to fill the gap.
