# The eval cases, and what became of the thing that ran them

**The trigger eval harness was retired on 2026-09-08 by Krish's ruling. Canaries
are the instrument now.** See `contract/canary-contract.md`.

These files are kept. They were not the problem.

## What is here

| | Files | Cases | Status |
|---|---|---|---|
| `*-trigger-cases.jsonl` | 27 | 613 | **Live.** The corpus canaries are selected from. |
| `*-behavior-cases.jsonl` | 35 | 767 | **Never run by anything.** No judge pass exists. |

The 613 trigger cases are a careful written record of what should and should not
fire, including the exclusions that caught real defects: `Video engine!`, the
dollar form, a quoted mention, the same words on a later turn. Those exclusions
are why `video-engine`'s narrowing could be tested at all.
`scripts/canaries.mjs` selects from them. They have more use now than they did
when a runner was consuming all 613 at once.

The 767 behaviour cases assert what a skill should DO once loaded, which needs a
judge and a rubric. That was designed and never built. They are marked as what
they are rather than counted as coverage, because 1,380 cases sitting in a
directory looks like assurance and is not.

## Why the runner went

`scripts/eval.mjs` sent every skill's name and description to the API and asked a
model which should load, then reported precision and recall per skill. Those
numbers were reported as describing the skills. They described the runner.

Two controls over the same 120 cases, recorded in `state/evals/`:

| Control | Router prompt | Recall, Haiku 4.5 | Recall, Sonnet 5 | Delta |
|---|---|---|---|---|
| first | with three routing rules the harness injected | 0.597 | 0.347 | 0.250 |
| second | rules removed | 0.611 | 0.486 | 0.125 |

A stronger model scoring lower is a property of the prompt. Removing rules no
client sends halved the gap and did not close it, and precision stayed at 1.000
for every skill under both models while recall sat near half, which is a router
that will not fire rather than descriptions that are unclear.

Meanwhile, on the same day, four canaries on two Windows hosts found: a skill
instructing a self-executing deletion, a direct push to another repository's
`main`, an embedded cron schedule in canon claiming it could not go stale, and
`video-engine` installed with byte-perfect parity and **unable to launch at all**.

613 automated cases over two days found none of them.

## The one thing the runner did do well

Prompt caching. 99.6 percent of input served from cache across 240 calls, 1.54M
cache reads against 6,138 uncached input tokens. The caching half worked
perfectly and the measuring half never did, which is a tidy summary of the whole
exercise.
