# UGC avatar candidate, 2026-11-15

Status: ruled on by Krish on 2026-11-15. His words: "happy to use everywhere with my explicit approval before deciding to use it, and then my explicit approval before it goes out to ensure 10/10 quality. No need for AI labels anywhere, at any point." Recorded as `Ruling (Krish, 2026-11-15): AI people may be used anywhere, with his explicit yes before one is used and again on the finished asset before it goes out; no AI labels anywhere.` The draft disclosure and consent rule is replaced by the approved approval and consent rule, and the venture gate is gone. Admission follows in its own change.

## Finding and correct layer

Short videos in which an ordinary-looking person talks to a phone camera are a common way to sell on social platforms, and the tools to generate such a person, their voice and their lip sync now exist and are paid for. Without a written rule, a session asked for one decides on its own how old the person may look, whether they may pose as a customer, whether Krish sees it before it is made and before it goes out, and whether a quote needs his yes before credits go. Each of those is a correction Krish would have to give, possibly more than once and possibly after something went public.

The first draft held the skill outside admission until a venture's own rules allowed AI people, and asked every AI person to carry an AI label. Krish ruled both out on 2026-11-15: any venture may use one, each use takes his two yeses, and no AI label goes anywhere.

So the correct layer is one narrow planner and gate: the rules exist and are approved before the first request, rather than invented during it. It is a planner and a gate, never a generator.

This moves the first part of the North Star: the two yeses, the age floor, the never-a-customer rule and the yes-before-spend are each learned once, in one place, before anyone has had to correct them.

## What the candidate is

- `SKILL.md`: the role, when it runs, the routes it hands to, and the stop conditions.
- `references/approval-and-consent.md`: the approved rule. Krish's two yeses, each with his words: before an AI person is used in a named piece, and on the finished file before it goes out, to his 10/10 bar. No AI label anywhere, at any point. What stays, each with its reason: never a customer, buyer, reviewer or testimonial (US rules ban fake reviews and testimonials, AI-generated ones included); never a real person's likeness without their recorded consent; adults only, 18 or over; no generation without a credit reservation and his yes on the quote; and no AI person playing a credentialed expert giving advice.
- `references/pipeline.md`: the talking pipeline as written steps only. Krish's first yes and the approved rule first; one designed voice per persona; one look per persona; the script through `check_voice` and the venture's claims gate; a still before any video; every paid step quoted, reserved and approved by Krish on its exact quote before it runs; an independent judge on contact sheets (passes for a real person on a phone, mouth in sync, nothing that makes the person a customer or an expert), bound to the file's SHA-256; Krish's second yes on that file; then the venture's own go-live.
- `references/looks.json`: the pools the roller draws from, with an 18 floor and the words it refuses (children, customers, credentials).
- `scripts/avatar.py`:
  - `roll`: picks a look from the script, keeps each persona's look across pieces, never repeats an earlier look, and writes the history only into the venture's workspace, refusing a workspace git would commit. It refuses a roll without Krish's first yes for that venture's named piece, an age bound under 18 (never quietly raising it), words that describe a child, a customer, buyer, reviewer or testimonial, a credentialed expert, a real person's likeness without a consent id, and an AI label.
  - `gate`: says whether one paid step may run. It needs the approved rule, the first yes, an adult age, no label, a credit reservation for that exact quote covering its credits, and Krish's yes, in his words, on that exact quote. It runs nothing either way.
  - `release`: says whether the finished file may go to the venture's go-live. It reads the file's SHA-256 itself and needs the first yes, the independent judge's pass on that file from someone other than its maker, and Krish's second yes, in his words, on that file. Any edit after his yes needs a new one. It posts nothing.
  - `digest`: the quote digest his yes and the reservation must both name.
- `scripts/validate.py` and `scripts/tests/`: the skill's own gate. Beyond the usual checks it holds the 18 floor in the pools and an approved rule that cites Krish's ruling.

## Missing-skill test

1. Does the need recur or carry consequence? It will recur now any venture may use one, and it is high consequence the first time. A wrong age, a fake testimonial or an AI person Krish never saw is public and hard to take back.
2. Is the trigger distinct? Yes: an AI person on camera for a venture. AI dogs, Krish's own likeness and real creators all route elsewhere.
3. Is there a repeatable workflow? Yes: the twelve steps in `references/pipeline.md`.
4. Is there an owned standard for good output? Yes: the approved rule, the judge's three checks and Krish's 10/10 bar on the finished file.
5. Can success be verified independently? Partly. The roller and both gates are deterministic and tested. Whether a video passes for real is the independent judge's call on contact sheets, never the maker's, and whether it goes out is Krish's.
6. Can its authority be bounded? Yes. It generates nothing, posts nothing and spends nothing; every paid step needs a reservation and Krish's yes on its exact quote, and every release needs his yes on the exact file.
7. Would a chapter in an existing skill be materially worse? Yes. No production skill owns generated people. Putting this in `krish-design` or `tool-router` would make an always-loaded or broad skill carry rules that apply to few requests.

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

## Proposed route row

Apply only in an admission change.

| Request | Context | Primary producer | Verification |
|---|---|---|---|
| An AI person on camera in a named piece for any venture, with Krish's yes before it is used and his yes on the finished file before it goes out | the venture's claims gate; `references/approval-and-consent.md` | the venture's production route, with `ugc-avatar` as planner and gate | `scripts/avatar.py gate` READY before each paid step; the independent judge on contact sheets; `scripts/avatar.py release` READY before the file goes out |

Collision rule to add with it: `ugc-avatar` plans and gates AI people only. A venture's AI animals stay with that venture's roller; Krish's own likeness stays with the krish-clone repository; the words stay with the venture's writer and `check_voice`; posting stays with the venture's go-live. It never generates, posts or spends, and it adds no AI label anywhere.

Registry, at admission: add `{name: ugc-avatar, role: generated-person-gate, owner: Krish Raja, reviewed: <admission date>, freshness_sla_days: 30}` (short, because provider tools and platform rules move fast), raise `expected_skill_count` by one, move the two suites to `evals/`, and add two routing cases (an AI presenter request to `ugc-avatar`, a dog still to the venture's roller).

## Context budget

Admission adds the description, 872 characters, to every session's catalogue, 23 fewer than the first draft's 895.

Growth justified: the 872 characters are Krish's two yeses, the no-label rule, the age floor, the never-a-customer rule and the yes-before-spend stated where every session sees them, which is the cheapest place to stop a public mistake now that any venture may use an AI person.

## Krish's decisions

1. **The rule.** Decided 2026-11-15: two yeses, no AI label anywhere, every venture. The draft disclosure and consent rule and its label options A to C are retired unused.
2. **Admission.** Follows from the ruling, now that no venture gate holds it back.
