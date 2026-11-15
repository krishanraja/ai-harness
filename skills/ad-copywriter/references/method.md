# The method

Four steps, in this order, every time. Skipping one is a failed set, however good the words look.

## 1. Evidence first: the swipe file

Before writing, look at what has already worked for someone paying to show it.

- **What counts.** An ad that has run for a long time. An ad that keeps running is one somebody keeps paying for, which is the best public sign that it earns its money. Count 30 days or more as long-running. When the page does not say how long, write the days as unknown and give the entry less weight.
- **How it is gathered.** Pasted in by Krish or by the session from something he shared, or read by hand from at most about ten public ad library pages in one sitting. Never signed in to any account, never through a scraper, never through a paid run. A bigger gather is a different job with its own approval.
- **Where it lives.** One file in the venture engine's own ignored folder, never in this skill, a pull request, a drafts file, a doc or a chat summary. `references/swipe-file.md` gives the place for each venture and the shape of an entry.
- **What is taken from it.** A pattern, never a sentence: the angle, how the first line opens, who it talks to, how long it runs, and how the words work with the first seconds of the picture. Sharing an eight-word run with any entry fails the lint.
- **How it is named.** Only by the entry's own id, such as `SW-004`. The advertiser's name never leaves the local file: not in this skill, not in a variation, not in a note to Krish.

## 2. A short creative read

Look at the asset the words go with, then write one line each for what the viewer sees at second 0, second 1, second 2 and second 3. For a still, second 0 is the whole picture and the next lines say where the eye goes.

Then decide two things before writing a word:

- what the first line of the caption adds that the picture cannot say (it never repeats words already on screen);
- the one thing the viewer should feel or do by second 3.

The read goes on the set as `creative_read`, so a reviewer can see what the words were written against.

## 3. Three variations

Write three. Each one differs from the other two on all four of these:

| What differs | What it means |
|---|---|
| Angle | The reason to care. For example: the gift that wins the room, the dog's own side of the story, the buyer's relief at finding one. |
| Hook | The first line and the way it opens. Two variations that start with the same three words count as one hook. |
| Length | Each is at least a quarter longer or shorter than each other one, so the set tests short against long rather than three of a kind. |
| Reader | Who it is written for. For example: someone buying a gift, an owner who will tag a friend, someone who already follows the account. |

Each variation also carries:

- `borrowed`: the id of the swipe entry whose pattern it used;
- `took`: one line saying what it took, such as "opens on what the old way costs before naming the product".

Write in the venture's own voice and under its own rules. The method never overrides them: where the venture forbids a move, the move is out, whatever the swipe file shows.

## 4. Lint, then hand over

1. The venture's own lint first. It holds the venture's claims rules and, for Heartside, the overlap and sameness checks too (`references/fields.md`).
2. This skill's lint where the venture's lint does not hold those checks: `python scripts/adcopy.py lint <set file> --swipe <swipe file>`. Without a swipe file it still runs, says the overlap and id checks were skipped, and checks everything else.
3. Hand the passing set to the venture's review route, with the lint output beside it. Krish picks one, changes one or says no. A no, and his words for it, go where that venture records its rejections, so the next set reads them.

## Paid tests

Only when Krish opens a paid test does this skill write ad fields beyond the caption. Their names, lengths and rules are read live from the platform on the day and from the venture's own paid-test doc; none is kept here, because they change. Until he opens one, a boost carries the post exactly as it went live, caption included.
