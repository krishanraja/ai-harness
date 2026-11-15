# The swipe file

A private list of long-running ads, kept by one venture's engine for one reason: to borrow patterns that have earned their money, never their words.

## Where it lives

| Venture | Path, inside that engine's repository | Why it is safe |
|---|---|---|
| Heartside | `local/swipe/swipe.jsonl` in growth-heartside | `local/` is ignored by git there |
| Make Your Mind Up | `.growth/swipe/swipe.jsonl` in growth-makeyourmindup | `.growth/` is ignored by git there |

Before writing to it, run `git check-ignore -q <path>` from that repository. If git does not ignore the path, do not write the file. The lint refuses a swipe file git tracks or does not ignore, and this skill's gate refuses one inside the harness.

It is never pasted into a drafts file, a pull request, an issue, a doc, a commit message or a note to Krish. A variation names an entry by its id and nothing else.

## How entries get there

- Pasted in, from something Krish shared or asked for.
- Read by hand from at most about ten public ad library pages in one sitting, never signed in.
- Nothing scraped, nothing bought, no paid run.

Give each new entry the next free id in order: `SW-001`, `SW-002`, and so on. Never reuse or renumber an id, because variations already point at it.

## One entry

One JSON object on one line.

| Field | Required | What it holds |
|---|---|---|
| `id` | yes | `SW-` and at least three digits. Never a name. |
| `captured` | yes | The date it was read, `YYYY-MM-DD`. |
| `source` | yes | `paste`, or the address of the public page it was read on. |
| `copy` | yes | The ad's words exactly as shown. The lint compares against these. |
| `running_days` | no | Whole days the page says it has run, or `null` when it does not say. |
| `platform` | no | Where it ran. |
| `first_seconds` | no | What seconds 0, 1, 2 and 3 show, as four short lines keyed `"0"` to `"3"`. |
| `pattern` | no | The session's own one-line read of its `angle`, `hook` and `reader`. |

The advertiser is not a field. If a session needs to remember whose ad it was, the source page says so, and it stays in this file.

## Keeping it honest

- An entry whose days are unknown counts for less than one that has plainly run for months.
- An entry that stops running is left in place with a note; its id stays valid.
- Removing an entry that a live variation points at breaks that variation's lint. Retire the variation first.
