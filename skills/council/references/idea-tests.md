# The eight idea tests

Drawn by `python scripts/council.py render` from `idea-tests.json`. The text is the same text control-center scores an idea with (`api/_councilRead.ts`, `IDEA_TESTS`), and `scripts/validate.py` holds the two together. Never reword a test here: a change starts in control-center and is copied back.

Score every test before any seat speaks. A result is pass, mixed, fail, unknown or n/a, and each carries its evidence and the kind of evidence it is (`references/protocol.md`).

## 1. How much and how often it hurts (`pain_frequency`)

Rate how much the problem hurts from 1 (a small irritation nobody would pay to fix) to 5 (they already pay for a poor fix, or someone takes the blame when it goes wrong), and how often it happens from 1 (a few times a year) to 5 (every day). Their product out of 25: 15 or more passes, 8 to 14 is mixed, 7 or less fails. A rare disaster is an event, not a habit, and habits are what people pay for again.

## 2. Money already moves (`money_moves`)

Does the buyer already spend money on this job today, with a person or a tool? Can anyone tell whether the job was done right? Both yes passes, one yes is mixed, neither fails. "They would pay if it existed" is a guess; only money moving today counts.

## 3. Hard to copy (`hard_to_copy`)

Could one skilled builder make a working copy of this within a few days, using the AI tools available now? If so, what does Krish hold that they cannot copy: an audience, a place in the buyer's daily routine, data only he gathers, a community, a network that grows with use, or the hard-won know-how of doing the work by hand? It passes when it cannot be copied quickly or he holds one of these with evidence, is mixed when one is planned but not real yet, and fails when it is copyable with nothing held or planned.

## 4. Better models help it (`better_models`)

If a much better AI model arrives next month, does this get stronger or weaker? It passes when it gets stronger because its advantage sits elsewhere (relationships, data, trust, know-how, reach), is mixed when it is unclear or helps every rival as much, and fails when the next model would simply do it.

## 5. Fits an agent (`agent_fit`)

Only when AI does part of the work; otherwise n/a. Five checks: a trigger that repeats, inputs of the same kind each time, clear tools to work in, a finish line you can measure, and a judgment call in the middle that plain automation cannot make. All five pass, three or four are mixed, two or fewer fail.

## 6. Heard from real people (`heard_it`)

Has Krish heard this problem from real people in their own words, or is it on file? Three or more people passes, one or two is mixed. No search runs here, so with nothing in his words or on file it is unknown; never fill the gap with invented people or posts.

## 7. Work done by hand (`by_hand`)

In this job, what gets copied between tools, typed again, or kept in a spreadsheet by hand, and how often? It passes when he can name it and it happens weekly or more, is mixed when it happens rarely, and fails when the work already flows cleanly.

## 8. Why now (`why_now`)

Why is this the moment? Name the recent shift that opened the door: a stronger model or tool, a new law, a channel that opened or shut, costs falling, or buyers working differently. A shift with a date passes, a vague trend is mixed, and no shift at all fails.
