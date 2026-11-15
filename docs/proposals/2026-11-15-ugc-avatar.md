# UGC avatar candidate, 2026-11-15

## Finding and correct layer

Short videos in which an ordinary-looking person talks to a phone camera are a common way to sell on social platforms, and the tools to generate such a person, their voice and their lip sync now exist and are paid for. Sooner or later a session will be asked for one. Without a written rule, that session decides on its own how old the person may look, whether they may pose as a customer, whether the video says it is AI, and whether a quote needs Krish's yes before credits go. Each of those is a correction Krish would have to give, possibly more than once and possibly after something went public.

Today no venture's rules allow an AI person:

- Heartside: growth-heartside `AGENTS.md`, rule 4, lets AI make dogs and rooms but never AI customers holding or reviewing the product.
- Full Time: growth-fulltime `HANDOVER-2026-10-27-CREATIVES.md` records the pundit video rejected for artificial faces, lip sync and excessive smiles.
- Make Your Mind Up, Mindmake and Legibility: no rule allows one.

So the correct layer is a candidate that is written, tested and kept out of admission: the rules exist and are approved before the first request, rather than invented during it. It is staged under `candidates/ugc-avatar/`, outside the release builder, and its record says `outside_admission: true`. It is a planner and a gate, never a generator.

This moves the first part of the North Star: the age floor, the never-a-customer rule, the disclosure and the yes-before-spend are each learned once, in one place, before anyone has had to correct them.

## What the candidate is

- `SKILL.md`: the role, when it runs (only for a venture whose rules allow AI people), the routes it hands to, and the stop conditions.
- `references/pipeline.md`: the talking pipeline as written steps only. The venture's rule and the consent rule first; one designed voice per persona; one look per persona; the script through `check_voice` and the venture's claims gate; a still before any video; every paid step quoted, reserved and approved by Krish on its exact quote before it runs; an independent judge on contact sheets (passes for a real person on a phone, mouth in sync, disclosure present), bound to the file's SHA-256; then the venture's own review and go-live.
- `references/disclosure-and-consent.md`: the disclosure and consent rule, `Status: draft`, for Krish to approve before first use.
- `references/looks.json`: the pools the roller draws from, with an 18 floor and the words it refuses (children, customers, credentials).
- `references/venture-rules.json`: each venture's rule on AI people and where it lives. Only Krish changes an entry, and an entry that allows one must cite his ruling.
- `scripts/avatar.py`:
  - `roll`: picks a look from the script (setting and clothes by the script's scene and register, age inside the script's bounds), keeps each persona's look, never repeats an earlier look, and writes the history only into the venture's workspace, refusing a workspace git would commit. It refuses an age bound under 18 (never quietly raising it), words that describe a child, a customer, buyer, reviewer or testimonial, a credentialed expert, a real person's likeness, a missing or vague disclosure, and any venture whose rules do not allow AI people.
  - `gate`: says whether one paid step may run. It needs the venture's rule, the approved consent rule, a disclosure that says AI, an adult age, a credit reservation for that exact quote covering its credits, and Krish's yes, in his words, on that exact quote. It runs nothing either way.
  - `digest`: the quote digest his yes and the reservation must both name.
- `scripts/validate.py` and `scripts/tests/`: the gate the harness runner calls. Beyond the usual checks it holds the 18 floor in the pools, the ruling an allowing venture must cite, the consent rule's status line, and `outside_admission: true` while no venture allows AI people.

## Missing-skill test

1. Does the need recur or carry consequence? Not yet recurring; high consequence the first time. A wrong age, a fake testimonial or an unlabelled AI person is public and hard to take back.
2. Is the trigger distinct? Yes: an AI person on camera for a venture. AI dogs, Krish's own likeness and real creators all route elsewhere.
3. Is there a repeatable workflow? Yes: the twelve steps in `references/pipeline.md`.
4. Is there an owned standard for good output? Yes: the consent rule once approved, and the judge's three checks.
5. Can success be verified independently? Partly. The roller and the gate are deterministic and tested. Whether a video passes for real is the independent judge's call on contact sheets, never the maker's.
6. Can its authority be bounded? Yes. It generates nothing, posts nothing and spends nothing; every paid step needs a reservation and Krish's yes on its exact quote.
7. Would a chapter in an existing skill be materially worse? Yes. No production skill owns generated people. Putting this in `krish-design` or `tool-router` would make an always-loaded or broad skill carry rules that apply to almost no request.

## Overlap review

| Neighbour | What it owns | Where this skill stops |
|---|---|---|
| a venture's own dog roller (Heartside's `growth.py still`) | AI dogs and their floor | people only; never a dog |
| the krish-clone repository | Krish's own voice clone and likeness | never Krish; never any real person without consent |
| `krish-voice`, `check_voice`, the venture's writer | the script's words | checks the script passed; never writes it |
| `krish-design` | frames, captions on screen, covers | none of the design |
| `tool-router`, `tools-access` | choosing and reaching the provider | never calls a provider |
| Control Center's credit tools | balances, reservations, settlement | reads that a reservation exists; never reserves or spends |
| the venture's go-live | posting and boosting | never posts |
| `verification-loop` | final proof | the independent judge's verdict is its evidence |

Functional overlap with any production skill is well under the standard's 20 percent: none of them handles a generated person.

## Proposed route row, not applied

Apply only in an admission change, and only after a venture's rule allows AI people.

| Request | Context | Primary producer | Verification |
|---|---|---|---|
| An AI person on camera for a venture whose own rules allow one | the venture's rule and its claims gate; `references/disclosure-and-consent.md`, approved | the venture's production route, with `ugc-avatar` as planner and gate | `scripts/avatar.py gate` READY before each paid step; the independent judge on contact sheets |

Collision rule to add with it: `ugc-avatar` plans and gates AI people only. A venture's AI animals stay with that venture's roller; Krish's own likeness stays with the krish-clone repository; the words stay with the venture's writer and `check_voice`; posting stays with the venture's go-live. It never generates, posts or spends.

Registry, at admission: add `{name: ugc-avatar, role: generated-person-gate, owner: Krish Raja, reviewed: <admission date>, freshness_sla_days: 30}` (short, because provider tools and platform labelling rules move fast), raise `expected_skill_count` by one, move the two suites to `evals/`, and add two routing cases (an AI presenter request to `ugc-avatar`, a dog still to the venture's roller).

## Context budget

Staging adds nothing to the always-on surface. Admission would add the description, 895 characters, to every session's catalogue.

Growth justified: the 895 characters are the age floor, the never-a-customer rule and the yes-before-spend stated where every session sees them, which is the cheapest place to stop a public mistake; admission waits until a venture actually allows AI people, so the cost is not paid before there is a use.

## The decisions for Krish

1. **The disclosure and consent rule.** Approve `references/disclosure-and-consent.md` as drafted, change it, or reject it. Its label words are "This person is AI-generated." Where the label shows: A, the platform's AI label and the first caption line only; B, as A plus on screen for the first three seconds the person is shown; or C, as B but on screen the whole time. Recommended: B.
2. **Admission.** Keep it outside admission (recommended until a venture's rule allows AI people), or reject it. Admitting it now would put a skill in every catalogue that refuses every request.

## Status

Staged inactive and outside admission: `activation: false`, `release_eligible: false`, `outside_admission: true`, no requested surface. Gates still open: a venture rule that allows AI people, Krish's approval of the disclosure and consent rule, full harness validation on Windows, held-out trigger and behaviour runs, an independent overlap review, Krish's admission and a governed release.
