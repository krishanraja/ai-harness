# The talking pipeline

Written steps, run in this order by a session that has checked each one. No step is automated here: `scripts/avatar.py` only picks a look and says whether one step may run. Every generation is its own step, with its own quote, reservation and yes.

## Before anything

1. **Krish's first yes.** Ask Krish, on the venture's review route, whether an AI person may be used in this named piece. Record his yes, with his exact words, in the venture's ignored workspace, in the shape `scripts/avatar.py` names. No yes, no roll. A yes covers one piece only.
2. **The rule.** `references/approval-and-consent.md` must say `Status: approved`. Only Krish changes it, and the change cites his ruling.

## The persona

3. **One persona, one designed voice.** A persona is one recurring AI person. Give it one voice, designed from a written description, never cloned from a recording of a real person without their recorded consent. Record the persona and its voice id in the venture's workspace, beside the roll history. Never share a voice between two personas, and never give one persona two voices.
4. **One look per persona.** Roll it with `python scripts/avatar.py roll <script> --workspace <workspace> --approval <first yes>`. The same persona gets the same look on every later script, so a returning viewer sees the same person. A new look for a persona needs `--new` and a reason.

## The words

5. **The script passes two checks before any voice is made.** Control Center's one voice check (`check_voice`), and the venture's own claims gate (for Heartside, `python3 growth.py check`). A script that makes the person a customer, a reviewer or an expert is rewritten, never voiced. A script that asks for an AI label is rewritten without it.

## Each paid step

Every step below spends credits, so each one goes through the same conditions, and `python scripts/avatar.py gate` must say READY before it runs:

- Krish's first yes for this piece;
- a quote from the provider for exactly that step;
- the credits reserved against that quote (Control Center's `reserve_credit_spend`, settled afterwards with `settle_credit_spend`);
- Krish's yes on that exact quote, with his words, matched by the quote's digest (`python scripts/avatar.py digest <quote>`).

6. **A still of the look first.** Stills before video: one image of the person, checked before anything moves.
7. **The voice lines.** The persona's one voice reads the approved script.
8. **The lip-sync render.** Quoted and approved before any spend, like every other step. It is the most expensive step, so it never runs on a look or a script that has not passed its checks.

## The independent judge

9. **A separate reviewer, never the session that made it,** reads contact sheets of the finished video (frames at even steps across its length, at full size) and passes it only when all three hold:
   - it passes for a real person filmed on a phone, with no tell that gives it away;
   - the mouth moves in sync with the words, line by line;
   - nothing in it makes the person a customer, buyer, reviewer or testimonial, or an expert giving advice.

   The verdict names the reviewer and the maker and is bound to the file's SHA-256, so a later edit needs a new verdict. A fail is held with its reason and never shown to fill a slot.

## Krish's second yes

10. **The finished file goes to Krish** on the venture's review route, only after the judge passes it. He says yes only when it meets his 10/10 bar. Record his yes, with his words, against the file's SHA-256; his no, in his words, goes where that venture records its rejections. Then run `python scripts/avatar.py release <file> --use <first yes> --verdict <verdict> --approval <second yes>`. Only READY lets the file leave.

## Hand over

11. **Go-live is the venture's.** Posting, scheduling and boosting follow the venture's own go-live. No AI label goes on screen, in the caption or in the platform's settings. This skill never touches any of them.
12. **Record what was made.** Each generation is recorded with its venture, its outcome and the asset, through the venture's own record.
