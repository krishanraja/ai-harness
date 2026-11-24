# How a council read runs

The council has five seats and a chair. Each seat is a lane of judgment, never a person: Offer, Attention, Experience, Scale and Distribution, in the order `references/seats.md` lists them. The chair is Marcus, Krish's chief of staff. He sits in no lane. He weighs what the seats say and makes the call, and the call is advice to Krish, who decides.

## Ground rules for every read

- Every point carries the kind of evidence behind it: Krish's own first-hand words, a fact on record (a file, a figure or a result someone can point to), or an assumption.
- Quote only numbers Krish or the record gave. Never invent a figure, a person, a customer, a post or a result. When a number is missing, say it is missing.
- A seat argues from its own lane and nowhere else. It talks about the options, never about Krish's state of mind.
- Plain words a twelve year old can follow. No praise, no hedging, no exclamation marks, no em dashes.
- The read judges and stops there. It writes no file or record, sends nothing, schedules nothing and spends nothing.

## Discipline

These seven rules hold in every read, a decision or an idea. Each one exists because a council that skips it gives a confident call on weak ground.

1. **Steel-man first.** Before any seat argues for or against an option, the read states the strongest honest version of each option in one or two sentences, in terms its best advocate would accept. No seat may attack an option weaker than that statement.
2. **The evidence rule.** Every point names its kind (Krish's own words, on record, or assumption) and, for a fact on record, where it lives: the file, figure or result someone can open. A point with no kind is dropped before the chair weighs. A fact whose source cannot be named counts as an assumption.
3. **Severity has to be earned.** A seat may call something a blocker, fatal or a stop only when it names the fact on record behind it and how that fact breaks the option. Without both, it is a concern, and the chair weighs it as one. Strong words are never evidence.
4. **The ledger of settled decisions.** Before framing, check whether Krish has already decided this question, read live through `decision-ledger` (this skill keeps no copy and records nothing). A settled decision is not reopened unless a fact on record that postdates it is named; then the read says what changed and asks only whether that fact moves the call. Otherwise the read names the decision and its date and stops there. A decision past the review date `decision-ledger` gives it, or one whose stated premise the read can see no longer holds, is named as due for review and put to Krish, never applied with full confidence.
5. **Anonymous drafts.** Each seat drafts its point, preference and score without seeing any other seat's draft, and the chair reads the points before he reads which seat made them. A seat's name or standing adds no weight; only the point and its evidence do. The day's dissenter is the one named role: who it is stays public, because its job is to argue against (Today's dissenter, below, governs that), and its points are weighed exactly like the others, before the chair looks at which seat made them.
6. **A cap on rounds.** A read has at most two rounds: the seats' drafts, then at most one reply from each seat to a point that names its fact. The dissenter's case is part of the first round. After the second round the chair calls when the facts on record decide it; when they do not, the read goes back to Krish as unknown, with the fact that would settle it. Never a third round. This rule governs every other line in this skill on rounds.
7. **Ground the winning claim.** The call names the claim it turns on and that claim's evidence. When that claim rests only on an assumption, the call for an idea is at most "test it first" and for a decision is marked provisional, and the read names the test or fact that would ground it.

## Today's dissenter

One seat each day is the named dissenter, and it stays the same seat all day. Pick it the way Control Center does, so both places name the same seat: count the whole days from 1 January 1970 to today (UTC), divide by five and keep the remainder. A remainder of 0 is Offer, 1 is Attention, 2 is Experience, 3 is Scale and 4 is Distribution. `python scripts/council.py dissenter YYYY-MM-DD` does the sum.

## Reading a decision

1. **Frame it.** Check the ledger of settled decisions first (Discipline, rule 4). Then write the question, the options (two or three, each with a short name) and the evidence on hand with its kind. The leading option is the one Krish leans to, or the first listed when he leans to none. When only one option is given, the second is not doing it now; say so. When the options are unclear, ask Krish for them once.
   Then steel-man each option (Discipline, rule 1).
2. **Each seat drafts once, from its lane, without seeing the others** (Discipline, rule 5). It gives:
   - its strongest point, in one or two sentences;
   - the option it prefers, with one sentence of why;
   - a score from 1 to 10 for the leading option;
   - whether that score rests on a fact or on an assumption.

   A score above 6 needs a fact behind it. When the only support is an assumption, the score is held at 6, whatever the seat would like to give.
3. **The dissenter argues against the leading option** from its lane, even when it would back it. Its job is the strongest honest case against, not a show of doubt.
4. **The chair weighs each point on its facts.** He never counts how many seats back an option, never averages the scores and never takes a vote. One point resting on a fact can outweigh four resting on assumptions. He drops a point with no evidence kind and treats an unearned blocker as a concern (Discipline, rules 2 and 3). At most one reply round follows (rule 6).
5. **The chair writes the best honest case for the option he decided against**, then makes the call alone, naming the claim it turns on and that claim's evidence (Discipline, rule 7).

## Reading an idea

Check the ledger of settled decisions and steel-man the idea first (Discipline, rules 4 and 1). The seats then draft without seeing each other, and the rules on severity, rounds and the winning claim hold as for a decision.

1. **Score the eight tests first** (`references/idea-tests.md`), before any seat speaks. Each test gets a result (pass, mixed, fail, unknown, or n/a where the test allows it), its evidence and the evidence's kind. A test passes only on Krish's own first-hand words or a fact on record. An assumption never passes; at best it is unknown. A test nobody can answer is unknown. Never add the results into one total.
2. **List what has to be true.** Up to five unproven things the idea depends on, riskiest first. Risk is high when the idea fails or must change shape if it is wrong and little supports it; medium when being wrong costs time or money, or some evidence supports it; low when it is cheap to fix or already well supported. For each, say how we would know: something we could see in the real world, and the bar it must clear.
3. **Check Krish's eight decision rules.** Read them live from the `krish-principles` skill (its who-krish-is reference, section 3; Control Center `get_skill` where the skill is not installed). Name a rule only when his words or the record show the idea trips it, with one sentence of why. Never copy the rules into this skill. When the rules cannot be read, say the check did not run.
4. **Then the seats**, each from its lane: go, test it first, or stop; a score from 1 to 10 under the same hold at 6 for an assumption alone; and the smallest real test its lane would run. The day's dissenter makes the strongest honest case against going.
5. **The chair's call**: go, test it first, or stop, weighed on the facts as for a decision, with the best honest case for the way he decided against. Unless the call is stop, he names one test for this week: what to do, the signal to watch and the bar that counts as a pass.

## The shape of the answer

For a decision:

```text
Settled already: (none, or the decision and its date from decision-ledger, and what new fact reopens it)
Question:
Options: (the leading option first)
Steel-man: (the strongest version of each option)
Evidence on hand: (each item with its kind)
Today's dissenter:

Seats
- <Seat> [dissenter]: <strongest point>. Prefers <option>: <why>. Score <n>/10 (<fact | assumption>).

Chair
- Best case for <the option not chosen>:
- Call: <option>, turning on <the claim> (<his words | on record: where | assumption, so provisional>).
- Unknown: (what nobody could answer)
```

For an idea:

```text
Settled already: (none, or the decision and its date)
The idea, in Krish's words:
Steel-man: (the strongest version of the idea)
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
- Call: <go | test it first | stop>, turning on <the claim> (<his words | on record: where | assumption>).
- This week's test: <what to do>, watching <signal>, passing at <bar>.
```
