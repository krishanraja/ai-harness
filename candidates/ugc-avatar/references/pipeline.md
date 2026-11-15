# The talking pipeline

Written steps, run in this order by a session that has checked each one. No step is automated here: `scripts/avatar.py` only picks a look and says whether one generation is ready. Every generation is its own step, with its own quote, reservation and yes.

## Before anything

1. **The venture allows it.** Read the venture's rule live, from the source `references/venture-rules.json` names. If the venture does not allow AI people, stop. Only Krish changes that rule, and the change cites his ruling.
2. **The disclosure and consent rule is approved.** `references/disclosure-and-consent.md` must say `Status: approved`. While it says draft, stop.

## The persona

3. **One persona, one designed voice.** A persona is one recurring AI person. Give it one voice, designed from a written description, never cloned from a recording of a real person. Record the persona and its voice id in the venture's workspace, beside the roll history. Never share a voice between two personas, and never give one persona two voices.
4. **One look per persona.** Roll it with `python scripts/avatar.py roll <script> --workspace <workspace>`. The same persona gets the same look on every later script, so a returning viewer sees the same person. A new look for a persona needs `--new` and a reason.

## The words

5. **The script passes two checks before any voice is made.** Control Center's one voice check (`check_voice`), and the venture's own claims gate (for Heartside, `python3 growth.py check`). A script that makes the person a customer, a reviewer or an expert is rewritten, never voiced.

## Each paid step

Every step below spends credits, so each one goes through the same three conditions, and `python scripts/avatar.py gate` must say READY before it runs:

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
   - the disclosure is present wherever the person is shown, in the words the approved rule gives.

   The verdict is bound to the file's SHA-256, so a later edit needs a new verdict. A fail is held with its reason.

## Hand over

10. **The venture's review route.** The video goes to wherever that venture shows Krish its work. He picks, changes or says no. His no, in his words, goes where that venture records its rejections.
11. **Go-live is the venture's.** Posting, scheduling and boosting follow the venture's own go-live and Krish's approval. This skill never touches them.
12. **Record what was made.** Each generation is recorded with its venture, its outcome and the asset, through the venture's own record.
