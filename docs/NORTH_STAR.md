# North Star

Status: Current
Owner: Krish Raja
Last verified: 2026-10-18

> By 30 November 2026, no AI working for Krish, in any client or repository, needs the same correction twice: every ruling is learned once, shipped everywhere and proven by a canary.
>
> By 30 November 2026, the harness also lets a fleet of agents run Mindmake's daily operations to his standard, so his hours go only to taste, rooms and decisions.
>
> By January 2027, it is the public reference for how one operator runs a company on AI agents: copied, cited, and the clearest proof of Mindmake's method.

Set by Krish on 18 October 2026. It is not reached yet. It is what every session in this repository works toward.

## The number

**Corrections Krish had to give twice in a week, across the fleet**: 0 by 30 November 2026, on a countdown weekly ladder. The first honest reading becomes week one, and the ladder is drawn from it.

```yaml north-star-metric
metric: "Corrections Krish had to give twice in a week, across the fleet"
unit: count
direction: down
target: 0
deadline: 2026-11-30
ladder_shape: countdown
source: "Ruling lines in commit bodies and harness observations, grouped by meaning"
status: active
ladder: pending-baseline
```

Urgency (U1 to U5) is worked out every week from where the number stands against that week's target, by [the harness contract](https://github.com/krishanraja/ai-harness/blob/main/contract/north-star-metric.md). Set by Krish on 23 October 2026.

## How to use it

- Read it before any work, every session.
- Before you start, say which part of it the task moves. If the task moves nothing toward it, say so first and let Krish decide.
- Prefer the work that moves it furthest, and close each session by noting what moved.
- Only Krish changes this file. Record his ruling in the commit body as `Ruling (Krish, YYYY-MM-DD): ...`.
- When it is reached, say so and ask Krish for the next one.
