# North Star number and urgency

Every repository Krish owns chases one number toward its North Star, on a weekly ladder, and carries an urgency rating that sets how hard its agents push (Ruling, Krish, 2026-10-23). This file is the one definition. Repositories follow it, sessions act on it, and Control Center reads it.

## Where it lives

Two parts, in two files, with two owners.

1. **The number** (Krish's, changes only with his ruling): a section `## The number` in the repository's North Star file, the file named in its `north-star` block. It holds one fenced block with the info string `yaml north-star-metric`:

   ```yaml north-star-metric
   metric: "Production agents making trusted reads this week"
   unit: agents          # USD, %, count, score
   direction: up         # up | down | milestone
   target: 1000
   deadline: 2027-03-29  # the Monday of the deadline week
   ladder_shape: front-loaded   # front-loaded | linear | countdown | milestone
   source: "Supabase legibility: usage_events by api key, trusted reads only"
   status: active        # active | paused
   ladder:               # one row per week, Monday dates, the target for that week
     - [2026-10-26, 1]
     - [2026-11-02, 3]
   ```

   A ladder that cannot be drawn until the first reading carries `ladder: pending-baseline`; the first honest reading becomes week one and Control Center draws the rest with the stated shape.

2. **Where it stands** (agents', updated whenever the number can be measured): one line, placed directly under the `## Where it is right now` heading of `NOW.md`. It opens with an HTML comment carrying the state as JSON, which machines read, followed by one sentence people read:

   ```markdown
   <!-- north-star-state {"week_of":"2026-10-26","week_target":1,"current":null,"current_as_of":null,"current_source":null,"urgency":4,"urgency_reason":"not measured yet"} --> **North Star number: U4, far behind.** Production agents making trusted reads: not measured yet, against 1 this week, on the way to 1,000 by 29 March 2027. Measuring it comes first.
   ```

   One line keeps every `NOW.md` inside the steward's 200-line limit. A repository with no `NOW.md` and a rule against new root files keeps this line at the end of its North Star file instead.

A number that must not be public (revenue in `krishanraja/mindmake`, client contract values, personal money) stays out of the repository: the blocks state the metric and the urgency, write `target: private` and percentages of the week's target, and the absolute figures live with the private owner named in the block.

## Ladder shapes

- **front-loaded** (the default): value(week i of n) = seed x (target / seed) ^ ((i / (n - 1)) ^ 0.6). Fastest growth now, from the small base, easing to about +20% a week near the deadline.
- **linear**: for percentages, scores and small counts.
- **countdown**: down to zero, for things that should stop happening.
- **milestone**: one dated yes or no; urgency comes from the weeks left.

## Urgency

Computed each week from the current value against this week's ladder target.

| Level | When | What every session and agent in the repository does |
|---|---|---|
| U1, on pace | at or above this week's target | Steady. One proposal a week that would raise the ceiling. |
| U2, behind | 75% or more of this week's target | The North Star number leads every session's agenda. |
| U3, well behind | 40% to 75% | Two experiments a week. The growth engine doubles its draft output. Control Center keeps the repository in the top three of the daily move. |
| U4, far behind | under 40%, or not measured, or the reading is more than 7 days old | A bold swing proposed every day. Work that does not move the number is dropped or deferred. If the number is not measured, measuring it is the first job. |
| U5, stalled | under 40% two weeks running, or no movement for 14 days, or past the deadline off target | Everything else in the repository pauses unless it moves the number. Control Center pushes Krish once a day. The strategist brings three unconventional recovery plays within 24 hours. Once a week Krish is asked to change the plan or change the target. |

Milestones: U2 with more than 8 weeks left, U3 with 4 to 8, U4 with 1 to 4, U5 inside the final week or overdue. A countdown is on target only at or below the ladder value.

`status: paused` (a dormant or retired product) means no urgency and no pushes until Krish revives it.

## What urgency never changes

Urgency raises intensity, never authority. Nothing sends, posts, publishes, spends, deletes, rotates a credential or changes a permission without Krish's explicit yes, at any level. A higher level means more and bolder prepared moves arriving for that yes, sooner.

## Who updates what

- Krish sets the number and the ladder; a session proposes a change in `NOW.md` with a North Star check line and never edits the number block without his ruling.
- Any session that can measure the number updates the state line, with the source and the date, and recomputes urgency by this file.
- Control Center reads the number and the state line from every repository, refreshes current values from live sources where it has a reader, writes the state line back when the reading or the urgency changes, ranks the fleet by urgency inside the priority ladder, and carries each repository's week target and urgency into the strategist, the daily move and the growth engines' directives.
