# The canary contract

A canary is a message sent to a real client on a real surface, in a fresh task,
to see what actually happens.

That is the whole instrument. It replaced the trigger eval harness on 2026-09-08
because the harness was measured against itself twice and failed both times,
while canaries found four real defects in a day that no cloud check found at all.

## Why the harness was retired

`scripts/eval.mjs` sent every skill's name and description to the API and asked a
model which should load. It produced precision and recall per skill, and those
numbers were reported as describing the skills. They did not.

Two controls, same 120 cases, two models:

| Control | Router prompt | Recall, Haiku 4.5 | Recall, Sonnet 5 | Delta |
|---|---|---|---|---|
| 2026-09-08 first | with three injected routing rules | 0.597 | 0.347 | 0.250 |
| 2026-09-08 second | rules removed | 0.611 | 0.486 | 0.125 |

A stronger model scoring lower is a property of the prompt, not of the subject.
Removing rules the harness was injecting above the descriptions halved the gap
and did not close it. Precision stayed at 1.000 for every skill under both
models while recall sat near half, which is the signature of a router that will
not fire rather than descriptions that are unclear.

The apparatus was a larger variable than the thing it measured, through two
rounds of fixing it. `state/evals/` keeps both controls as the evidence for
retiring it.

## What the machines did instead

On 2026-09-08, four canaries on two Windows hosts found, in about an hour:

- `mindmake-os` instructing a self-executing deletion.
- A direct push to another repository's `main`.
- An embedded cron schedule in canon that claimed it could not go stale.
- `video-engine` installed with byte-perfect parity and **unable to launch at
  all**, because `allow_implicit_invocation: false` removes a skill from the
  Codex catalog rather than narrowing its trigger.

613 automated cases over two days found none of them.

## The rule that decides everything here

**A positive canary is the only load-bearing one.**

On SURFACE, the two negative canaries for `video-engine` passed while the
positive failed. They passed because the skill could not fire at all, and a
skill that cannot fire also cannot fire wrongly. Every negative result on that
surface was vacuous and read as health.

So:

1. Every canary set must contain at least one positive.
2. **Negative results are void on a surface where no positive passed.** They are
   recorded and explicitly not counted. This is arithmetic, not judgement:
   `scripts/canaries.mjs --verify` refuses a report that claims negative passes
   with no positive pass beside them.
3. A skill whose only evidence is negative is `unmeasured`, not `passing`.

A headless runner must also declare capabilities it cannot exercise. An explicit
UI-only invocation that the runner cannot send is `manual-required`, not a failed
trigger. Likewise, a negative case may name an external owner such as a task system;
the canary can prove only that the forbidden skill stayed out unless that owner is an
observable canonical skill. Capability gaps and downstream route gaps are recorded as
partial evidence and never promoted to passes.

Semantic routing is sampled, not deterministic. Run every case once, then repeat only
an apparent mismatch twice in fresh tasks. The recorded outcome follows the two-of-three
majority and retains all three attempts. A first-pass success is not repeated, which
keeps the routine bounded; a repeated mismatch is stronger evidence than one stochastic
model choice. On Codex, reading an exclusion guard and then loading the declared expected
owner is recorded as the expected owner route with `target_guard_read: true`. A target
read without the expected owner remains a failure.

## What counts as a canary result

Four outcomes, and nothing else:

| Outcome | Meaning |
|---|---|
| `fired` | The skill loaded and ran |
| `not-fired` | Nothing loaded |
| `wrong-skill` | A different skill loaded; name it |
| `unreachable` | The skill is absent from the client's catalog, or the client refused |

`unreachable` is separate from `not-fired` on purpose. They look identical from
the outside and mean opposite things: one is a trigger declining correctly, the
other is a skill that cannot be reached at all. Collapsing them is how the
`video-engine` defect survived three canaries.

## Coverage is sparse and says so

A canary costs a human or an agent a minute of real interaction on a real
machine, so this instrument will never cover 29 skills every release. It is not
supposed to. It covers what matters, admits what it has not covered, and never
reports absence as health.

The selection is deterministic, so a release always produces the same sheet and
a submitted report can be checked against it:

- **Tier 1, every release, every surface.** The skills whose failure is
  expensive or whose trigger is narrow: the four core skills, plus
  `video-engine`, `design-intelligence-search` and `mindmake-os`.
- **Tier 2, on change.** Any skill whose bytes changed in this release.
- **Tier 3, rotation.** A few more each release, by round robin on the release
  ordinal, so nothing waits forever and staleness is bounded rather than open.

`node scripts/audit-harness.mjs` reports which skills have never been canaried
on any surface, and which results have gone stale. That number is expected to be
large at first. A large honest number beats a small invented one, which is the
entire reason the harness it replaced is gone.

## Where the cases come from

`evals/*-trigger-cases.jsonl` holds 613 hand-written trigger cases. They were
written for the retired harness and they are not wasted: they are a careful
written record of what should and should not fire, and they are now the corpus
canaries are selected from.

The 767 behaviour cases in `evals/*-behavior-cases.jsonl` have never been run by
anything. They need a judge pass that does not exist. They are kept and marked
as what they are rather than counted as coverage.
