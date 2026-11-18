# divergent-thinker in the skill layer, 2026-11-18

Status: admitted (Ruling, Krish, 2026-11-18: "I approve all of those"). The five skill edits and the canon sentence below are applied as written, with three narrowing clarifications the judge panel asked for: the canon sentence keeps each repository in its own namespace and says recording is never a send, and the build-apps line is a judge-side check only, so generator blindness in krish-design is unchanged.

## Finding and correct layer

krishanraja/divergent-thinker is the fleet's divergent thinking engine (Rulings, Krish, 2026-11-18). It maps what everyone else would say, generates away from it through twelve thinking lenses, attacks the survivors, judges them blind and returns a few scored ideas that are far from the middle and from each other. It also scores any output for how close it sits to the consensus or to what a namespace already shipped.

Evidence so far:

- **Benchmark.** Live, 18 November: it beat a prompt-matched single call on 3 of 3 problems on distance from the consensus, with judged usefulness held. Blind originality was mixed: one tie, one small loss, one clear win. Source: krishanraja/divergent-thinker `docs/benchmarks/2026-11-18-three-arm.json`, reproduced by `npm run bench`.
- **Phase 0.** Krish approved both of its first two plays, Heartside's realtor closing gifts and Mindmake's dated miss report.
- **Hosting.** Control Center hosts it (control-center#963) behind the connector tools `divergent_score`, `divergent_record` and `divergent_run`, with the engine route and daily caps.

The correct layer is **not a new skill**. The engine is a capability that several existing skills already call for in their own words. A skill of its own would fail the missing-skill test at question 7: a chapter in the skills that already own those moments is better. So this proposes three things:

- a tool catalog entry, already in control-center#963;
- one clause in `tool-router`'s description, so it is discoverable;
- one line in each of four production skills, at the step that already asks for divergence.

This moves the harness North Star: a correction learned once. The engine turns "the obvious answer was not good enough" into a measured check instead of a repeated note from Krish.

## The edits proposed

| Skill | Step | Line to add |
|---|---|---|
| `strategy-brief` | 6, Alternatives (material work only) | "For material work, `divergent_run` op `map` shows the consensus to diverge from; `challenge` on the selected route names its conventional twin and fatal flaw. Never for micro or standard briefs." |
| `krish-principles` | 5.4, The standard close, "The sharper alternative" | "The call comes first. Then, for a material recommendation, `divergent_run` op `challenge` on the call may supply the sharper alternative; it never replaces the call." |
| `build-apps-with-krish` | the reset trace after two rejected same-spine mocks | "`divergent_score` with the rejected history as `obvious` supplies the pairwise-distance evidence and `disguised_repetition` at zero model cost. Supplemental: it does not certify the load-bearing diversity axes." |
| `krish-design` | fresh divergence, at least three independent concept spines | "divergent-thinker may be one arm, fed only the sanitized brief. Never every arm; the fresh-context judges stay." |
| `tool-router` | description | add "and ideas measurably outside the consensus, or a score of any output against it (divergent-thinker)" to what it selects for |

## One canon sentence, so every repository knows

The four skill lines reach sessions that load those skills. The canon block (`contract/templates/canon-block.md`) is rendered into every repository's AGENTS.md, so one sentence there is the only way every repository learns when to reach for the engine without each one being edited. Proposed, after the **Research** sentence:

As landed (superseding the first draft of this sentence, which had no namespace, spend or record clauses):

> **Divergence:** when the obvious answer is not good enough (a number at U4 or U5 with nothing proposed, ideas returning the same, an angle about to be committed, a draft that feels familiar), consult divergent-thinker through Control Center, in the repository's own namespace only (never another venture's), cheapest move first (`score` and `record` spend nothing; `map`, `provoke`, `challenge` and `diverge` are paid model calls that follow this contract's spend rules, and Control Center also refuses them past the per-caller daily caps in krishanraja/divergent-thinker `docs/WHEN-TO-USE.md`, never routed around): the engine route, the repository's own `divergent` command, or the connector tools `divergent_score`, `divergent_record` and `divergent_run`, as krishanraja/divergent-thinker `docs/WHEN-TO-USE.md` says. Never for facts, exact words or Krish's taste. Its sparks are proposals: checked against the repository's own walls, reduced to one, labelled `divergent-thinker spark <id>, run <run>`, and sent through the normal approval flow; `divergent_record` writes only to that namespace's memory and is never a send, post or publish to anyone (Ruling, Krish, 2026-11-18; docs/proposals/2026-11-18-divergent-thinker.md).

It widens no authority: the engine proposes, and every send, post and spend keeps its own approval.

## Missing-skill test, for a skill of its own

1. Does the need recur or carry consequence? Yes: the growth engines' U5 recovery plays, the content wildcard, design divergence.
2. Is the trigger distinct? Only partly. "Diverge" moments live inside skills that already own them.
3. Is there a repeatable workflow? Yes, but the engine runs it, not a skill.
4. Is there an owned standard? Yes, and it lives in the engine's own repository (its calibration, benchmark and guide).
5. Can success be verified independently? Yes. Its North Star is counted by Control Center: proposals Krish approves whose evidence carries the label `divergent-thinker spark`.
6. Can its authority be bounded? Yes. It proposes; it never sends, posts or spends beyond its capped calls.
7. Would a chapter in an existing skill be materially worse? **No.** The four lines above are better than a fifth skill competing to fire on the same moments. That is why this proposes no skill.

## Overlap review

| Neighbour | What it owns | Where divergent-thinker stops |
|---|---|---|
| `council` | judging a decision or idea through five seats | divergent-thinker generates options and measures distance; it never judges for Krish |
| `krish-principles` | the call | the call comes first, and the engine never defers it |
| `decision-ledger` | recording a decision | never wired: it excludes brainstorming and abandoned options |
| `evidence-research` | outside facts | the engine has no sources; never used for a fact |
| `krish-voice` | final words in his name | the engine's sparks are ideas, never final copy |
| `verification-loop`, `take-the-brief`, `tools-access` | their own jobs | never wired |

## Output rule

Whatever comes back, the consuming skill reduces it to one recommendation ("not a menu"). Before any spark reaches Krish, it is checked against the venture's own walls: on its first live runs the engine proposed one play that broke consent and one that would have misled a community, and both read well.

## What Krish decides

Admit the five skill edits and the canon sentence as written, change them, or decline any of them. On admission, the edits land in one change with `Ruling (Krish, 2026-11-18 or the day he rules): ...` in the commit body.
