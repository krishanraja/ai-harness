# How a council read runs

The council has five seats and a chair. Each seat is a lane of judgment, never a person: Offer, Attention, Experience, Scale and Distribution, in the order `references/seats.md` lists them. The chair is Marcus, Krish's chief of staff. He sits in no lane. He weighs what the seats say and makes the call, and the call is advice to Krish, who decides.

## Ground rules for every read

- Every point carries the kind of evidence behind it: Krish's own first-hand words, a fact on record (a file, a figure or a result someone can point to), or an assumption.
- Quote only numbers Krish or the record gave. Never invent a figure, a person, a customer, a post or a result. When a number is missing, say it is missing.
- A seat argues from its own lane and nowhere else. It talks about the options, never about Krish's state of mind.
- Plain words a twelve year old can follow. No praise, no hedging, no exclamation marks, no em dashes.
- The read judges and stops there. It writes no file or record, sends nothing, schedules nothing and spends nothing.

## Today's dissenter

One seat each day is the named dissenter, and it stays the same seat all day. Pick it the way Control Center does, so both places name the same seat: count the whole days from 1 January 1970 to today (UTC), divide by five and keep the remainder. A remainder of 0 is Offer, 1 is Attention, 2 is Experience, 3 is Scale and 4 is Distribution. `python scripts/council.py dissenter YYYY-MM-DD` does the sum.

## Reading a decision

1. **Frame it.** Write the question, the options (two or three, each with a short name) and the evidence on hand with its kind. The leading option is the one Krish leans to, or the first listed when he leans to none. When only one option is given, the second is not doing it now; say so. When the options are unclear, ask Krish for them once.
2. **Each seat speaks once, from its lane.** It gives:
   - its strongest point, in one or two sentences;
   - the option it prefers, with one sentence of why;
   - a score from 1 to 10 for the leading option;
   - whether that score rests on a fact or on an assumption.

   A score above 6 needs a fact behind it. When the only support is an assumption, the score is held at 6, whatever the seat would like to give.
3. **The dissenter argues against the leading option** from its lane, even when it would back it. Its job is the strongest honest case against, not a show of doubt.
4. **The chair weighs each point on its facts.** He never counts how many seats back an option, never averages the scores and never takes a vote. One point resting on a fact can outweigh four resting on assumptions.
5. **The chair writes the best honest case for the option he decided against**, then makes the call alone, naming the one or two facts it turns on.

## Reading an idea

1. **Score the eight tests first** (`references/idea-tests.md`), before any seat speaks. Each test gets a result (pass, mixed, fail, unknown, or n/a where the test allows it), its evidence and the evidence's kind. A test passes only on Krish's own first-hand words or a fact on record. An assumption never passes; at best it is unknown. A test nobody can answer is unknown. Never add the results into one total.
2. **List what has to be true.** Up to five unproven things the idea depends on, riskiest first. Risk is high when the idea fails or must change shape if it is wrong and little supports it; medium when being wrong costs time or money, or some evidence supports it; low when it is cheap to fix or already well supported. For each, say how we would know: something we could see in the real world, and the bar it must clear.
3. **Check Krish's eight decision rules.** Read them live from the `krish-principles` skill (its who-krish-is reference, section 3; Control Center `get_skill` where the skill is not installed). Name a rule only when his words or the record show the idea trips it, with one sentence of why. Never copy the rules into this skill. When the rules cannot be read, say the check did not run.
4. **Then the seats**, each from its lane: go, test it first, or stop; a score from 1 to 10 under the same hold at 6 for an assumption alone; and the smallest real test its lane would run. The day's dissenter makes the strongest honest case against going.
5. **The chair's call**: go, test it first, or stop, weighed on the facts as for a decision, with the best honest case for the way he decided against. Unless the call is stop, he names one test for this week: what to do, the signal to watch and the bar that counts as a pass.

## The shape of the answer

For a decision:

```text
Question:
Options: (the leading option first)
Evidence on hand: (each item with its kind)
Today's dissenter:

Seats
- <Seat> [dissenter]: <strongest point>. Prefers <option>: <why>. Score <n>/10 (<fact | assumption>).

Chair
- Best case for <the option not chosen>:
- Call: <option>, turning on <the fact or facts>.
- Unknown: (what nobody could answer)
```

For an idea:

```text
The idea, in Krish's words:
Tests
- <Test>: <pass | mixed | fail | unknown | n/a> (<his words | on record | assumption>): <evidence>
What has to be true
- <risk>: <the thing>. We would know when <signal> clears <bar>.
Decision rules tripped: (none, or each with why; or "not checked" and why)
Today's dissenter:

Seats
- <Seat> [dissenter]: <go | test it first | stop>. <point>. Score <n>/10 (<fact | assumption>). Smallest test: <test>.

Chair
- Best case for <the way not chosen>:
- Call: <go | test it first | stop>.
- This week's test: <what to do>, watching <signal>, passing at <bar>.
```
