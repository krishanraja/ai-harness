# Ad copywriter candidate, 2026-11-15

Status: admitted by Krish on 2026-11-15 (his words: "Admit it and hand over captions"), recorded as
`Ruling (Krish, 2026-11-15): admit ad-copywriter, and krish-content-marketer hands venture-account captions to it.`
The skill is now `skills/ad-copywriter`, its two suites are in `evals/`, the route row and collision rule below are in
`contract/skill-routing-contract.md`, krish-content-marketer's description is narrowed to the wording below, and
`state/candidates/ad-copywriter.yaml` is retired. Where this file says the candidate is inactive, outside every route or
waiting on admission, that no longer governs.

## Finding and correct layer

Heartside and the Make Your Mind Up publication account post every day, and a post's caption is the copy any boost later promotes: growth-heartside's `docs/PAID-BOOSTS.md` boosts the live post unchanged, and Krish's rule of 10 November allows a boost of up to $20 a day once organic reach shows a post deserves one. Today each engine writes its captions with its own rules and no shared method. Nothing asks what has already earned money for someone paying to show it, nothing reads the first seconds of the picture before the words are written, three "variations" are often one caption written three times, and nothing stops a caption from carrying another advertiser's sentence.

The neighbours do not fit. `krish-content-marketer` owns conversion strategy, including campaign and ad angles, but it is shaped around a buyer's decision on a Mindmake asset, not a dog or a publication speaking on its own account. `krish-voice` owns the final words in Krish's name, and a caption spoken by Heartside's dog is not in his name. Sending venture captions to either one is the wrong writer, and Krish would correct the same drift in two places.

The correct layer is a narrow producer with a lint that stacks after it, staged inactive under `candidates/ad-copywriter/`, outside the release builder. Where a venture already has a lint, its checks belong there: the paired change on growth-heartside (branch `wip/gh-lint`) adds the overlap, sameness and claims-table checks to `growth.py check`, so Heartside's own gate holds them whether or not this skill is ever admitted.

This moves two parts of the North Star. A caption method written once, with the venture's own lint holding it, is a correction learned once. And caption sets that arrive already linted, as three real choices, take drafting off Krish's hours and leave him only the pick.

## What the candidate is

- `SKILL.md`: the role, when it runs, the routes it hands to, its inputs and its stop conditions.
- `references/method.md`: the method in four steps. Evidence first, from a swipe file of long-running ads gathered by paste or at most about ten public ad library pages read signed out. A short creative read of seconds 0 to 3. Three variations that differ on angle, hook, length and reader, each naming the swipe entry whose pattern it used, by id. Then the venture's lint, this skill's lint, and the venture's review route.
- `references/fields.md`: the fields of an organic post, and where each venture keeps its voice, claims and lint. It holds no lengths: they change, and the venture's lint holds the ones it enforces.
- `references/swipe-file.md`: where the swipe file lives for each venture (always a folder git ignores), how entries are gathered and numbered, and the shape of one entry. The advertiser is not a field.
- `scripts/adcopy.py`: the lint for a set of variations (at least three; angle, hook, reader and opening line all different; each at least a quarter longer or shorter than the others; no eight-word run shared between two variations or with any swipe entry; every `borrowed` an id such as `SW-004`, present in the swipe file when one is read). A missing swipe file is skipped and said, never a pass. It refuses a swipe file git tracks or does not ignore.
- `scripts/validate.py` and `scripts/tests/`: the gate the harness runner already calls for any candidate that carries them. It refuses em dashes, links out and the outside names Krish ruled out of the OS on 15 November, and keeps its list of those names identical to the council candidate's.

## Missing-skill test

1. Does the need recur or carry consequence? Yes. Both accounts post daily, and any caption can carry paid money once Krish approves a boost.
2. Is the trigger distinct? Yes: captions and the other short fields on a venture's own accounts. Words in Krish's name stay with `krish-voice`; Mindmake's conversion argument stays with `krish-content-marketer`.
3. Is there a repeatable workflow? Yes: swipe file, creative read, three variations, lint, review route.
4. Is there an owned standard for good output? Yes: the four differences, the eight-word rule, and each venture's own claims and voice rules, which the skill reads and never restates.
5. Can success be verified independently? Mostly. The lint and the venture's lint are deterministic. Whether a caption is funny or lands is Krish's pick, recorded where the venture keeps its rejections. The behaviour suite waits for a judge, as every behaviour suite here does (`evals/README.md`).
6. Can its authority be bounded? Yes. It drafts and lints. It never posts, boosts, schedules, spends, signs in, or changes a post or account setting.
7. Would a chapter in an existing skill be materially worse? Yes. Inside `krish-content-marketer` it would fire on every Mindmake conversion task and carry venture voice rules into a skill built for one buyer's decision. Inside `krish-voice` it would put dog and publication voices under the skill whose whole job is Krish's own voice.

## Overlap review

| Neighbour | What it owns | Where this skill stops |
|---|---|---|
| `krish-voice` | final words in Krish's name, his personal accounts, his email | never writes in his name; may lint his caption afterwards as a validator only |
| `krish-content-marketer` | conversion strategy and argument, including ad angles and hooks for Mindmake and Krish's own assets | venture account captions only; a Mindmake asset goes there |
| `content-corpus` | what a named channel is for and which form fits it | reads the channel's mandate, never sets it |
| `evidence-research` | outside facts and figures | quotes nothing it was not given; an unsourced claim comes out |
| `krish-design` | the picture, the cover and the layout | reads the picture for its creative read; never changes it |
| `apify` | any scraper or paid run | never gathers by scraper; a gather beyond about ten pages goes there with spend approval |
| `strategy-brief`, `verification-loop` | the route and the final proof | receives the route; hands its lint result to verification |
| `mindmake` | the Mindmake commercial brand | not in scope; Mindmake is not a venture-voiced account here |

The closest neighbour is `krish-content-marketer`, whose description names campaign and ad angles and hooks. The functional overlap is the angle-and-hook step of a caption, about one step in four of this method, under the standard's 20 percent once the producer split below is applied. That split is the condition for admission.

## Route row, applied at admission on 2026-11-15 (the contract carries it in shorter words)

Apply only in the admission change that moves the candidate into `skills/`, because the routing contract is live on every client.

| Request | Context | Primary producer | Verification |
|---|---|---|---|
| Captions and other short fields for a venture's own social accounts (today Heartside and the Make Your Mind Up publication account), and separate ad fields once Krish opens a paid test | the venture's own rules (`references/fields.md`), and `content-corpus` for a named channel | `ad-copywriter` | the venture's lint (Heartside `growth.py check`; Make Your Mind Up content-engine's copy lint and `check_voice`), then `scripts/adcopy.py lint` where the venture's lint lacks overlap and sameness |

Collision rule to add with it, under the existing `krish-voice` and `krish-content-marketer` rules:

- `krish-voice` stays the writer for anything in Krish's own name: his personal accounts, his email, his LinkedIn, and any caption in his first person. `ad-copywriter` writes only in a venture's own account voice, and may stack after `krish-voice` as a lint, never as a second writer.
- `krish-content-marketer` keeps conversion strategy for Mindmake and Krish's own assets. `ad-copywriter` owns the short fields on a venture's own accounts and takes its angle rules from that venture's own doctrine. A request that needs both a buyer argument and a venture caption is planned first by `strategy-brief`, with one writer per artifact.

Description change, applied at admission on 2026-11-15: narrow `krish-content-marketer`'s description so it no longer claims caption and ad fields on a venture's own social accounts. Proposed text, replacing its first sentence: "Conversion-strategy producer for assets whose job is to change reader behaviour: landing and sales pages, campaign angles, launch emails, cold sequences, hooks, headlines, positioning rewrites, and conversion diagnosis, for Mindmake and Krish's own assets; captions and ad fields on a venture's own social accounts belong to ad-copywriter." Its review date moves only with Krish's ruling in that change.

Registry, at admission: add `{name: ad-copywriter, role: venture-copy-producer, owner: Krish Raja, reviewed: <admission date>, freshness_sla_days: 60}` to `production` and the name to `production_active`, raise `expected_skill_count` by one, move the two suites from `evals/candidates/` to `evals/`, and add two cases to `evals/skill-routing-cases.jsonl` (a Heartside caption to `ad-copywriter`, a caption on Krish's personal account to `krish-voice`).

## Context budget

Staging adds nothing to the always-on surface: candidates are not in the catalogue, and `contract/context-budget.yaml` counts `skills/*/SKILL.md` only. Admission would add the description, 756 characters, to every session's catalogue.

Growth justified: at admission the 756-character description buys a narrow trigger that keeps venture captions away from the two skills that would otherwise both claim them, and the narrowing of `krish-content-marketer`'s description in the same change pays part of it back.

## Admission ask

This is Krish's decision, not this change's. The questions for him:

1. Admit `ad-copywriter` as a production skill, keep it as a candidate, or reject it.
2. On admission, approve the narrowing of `krish-content-marketer`'s description above.

## Status

Admitted 2026-11-15 as production skill 32: in `production_active`, routed in the contract and in both cloud routing
texts, served by Control Center's `get_skill` from `skills/ad-copywriter` on main once this change merges. The
narrowing of `krish-content-marketer`'s description is applied in the same change, with route cases that prove the split
(a Heartside caption to `ad-copywriter`, a caption on Krish's own account to `krish-voice`, a Mindmake page's angle to
`krish-content-marketer`). Still open, as post-admission checks: full harness validation on Windows, held-out trigger and
behaviour runs, an independent overlap review, and the next governed release and install.

Before admission it was staged inactive: `activation: false`, `release_eligible: false`, no requested surface.
