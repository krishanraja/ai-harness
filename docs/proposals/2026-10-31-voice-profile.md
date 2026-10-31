# A voice profile for krish-voice: how Krish actually writes and talks, measured

Krish, 2026-10-31, in his words: "I want one clear voice profile that I can use as an anchor and add to over time", then
"go ahead and build v1 of the voice profile".

## What changes

- **New reference** `skills/krish-voice/references/voice-profile.md`. It describes his voice measured from his own
  published words (295 LinkedIn posts, 26 long-form pieces, one live interview), with a quoted line and its source for
  every claim, numbers for each register, how the voice has moved since 2020, and five places where the evidence and
  `voice-doctrine.md` disagree. Krish ruled on all five the same day (below) and asked for it to be merged.
- **One routing line** in `krish-voice` > Reference routing: read the matching register of the profile for a draft in
  his name or a voice check.
- **A measuring tool**, added in this same pull request (commits a448541 and 1e5f8d8): `evals/voice/fingerprint.mjs` and its output `evals/voice/fingerprint.json`: numbers only, no
  corpus text. It scores a draft's distance from his typical piece on eight habits drawn from the doctrine (short
  sentences, uneven rhythm, contractions, talking to the reader, spaced hyphens, brackets, no formal connectives, no
  model phrasing).
- **One behaviour case**, `voice-behavior-028` in `evals/krish-voice-behavior-cases.jsonl`, also in this pull request.
- **Two kill-list lines** in `krish-voice` now name the LinkedIn exceptions Krish ruled (rulings 1 and 3), so the
  doctrine and the profile no longer disagree.

## Rulings (Krish, 2026-10-31, answered one by one in the session that built this)

1. Rhetorical questions: "LinkedIn only".
2. Calls to action: "Humble, sincere, curious and observational".
3. Formatting: "One feeling emoji, LinkedIn".
4. Energy: "Exuberant on camera too".
5. Voice by channel: "linkedin needs to remain first person and sincere, fun, insightful, humble, curious and
   observational. makeyourmindup more like a professional media channel".

The measuring tool was built because his ask was for an anchor he can "add to over time": the tool is how a later
addition is checked against the anchor. It reads no private data and sends nothing.

## Which job it serves

Selling and the publication: outreach emails, LinkedIn posts and makeyourmindup articles drafted in his name get an
evidence-backed register instead of judgement alone.

## Why

The doctrine says how to write as him, from judgement. Nothing showed how he actually writes, so a drafter had rules
and no evidence, and nobody could measure whether a draft sounded like him. The profile and the tool add the evidence
and a measure without changing a rule.

## Evidence and its limits

- Corpus: public posts and articles plus his own interview; no private messages, no other people's words. The text stays
  in his Drive, not here.
- Test (31 Oct 2026): on 10 held-out pieces, his original scored closer to him than a generic rewrite 9 times out of
  10. The first scoring method failed at 5 of 10 on a different set; the method was changed and then judged only on a
  fresh set. The rewrites were written by the same model that built the test.
- The October 2026 makeyourmindup articles were drafted by the content engine in the "we" voice and are marked as house
  style, not his own voice.

## If wrong

A drafter could copy his tics as a costume. The profile says to treat quotes as patterns, the behaviour case forbids
copying them, and the doctrine still wins on every listed disagreement.

## Rollback

Revert the pull request. Nothing else reads the profile or the tool yet.

## Addendum, same day: Jonny's emails (profile v1.2)

Krish, 2026-10-31: "jonny just needs to mimic my email style". The profile's Jonny branch, open in v1.1, closes on
that ruling. The rule itself is one new row in `krish-voice` > Mandatory scenario safeguards ("Draft goes out under a
sender other than Krish"): Krish's shared email voice, written as the sender, Krish in the third person, the sender's
own sign-off, and never Krish's voice under another sender's name. It supersedes asking for a separate Jonny voice; any
other sender with no ruling still needs their own posture. The profile and `outbound-email-voice.md` point to the row
rather than restating it. Behaviour case `voice-behavior-029` holds it.

## Addendum, same day: the script close and what a listener can hold (profile v1.5)

Krish, 2026-10-31, after reading his voiceover scripts aloud: "I still feel like all my video scripts are a little
bit hard to follow" and "the last paragraph of all my scripts still sounds a bit bossy and preachy". An audit of the
scripts of 12 to 30 October (content-engine `docs/plans/2026-10-31-script-clarity-audit.md`) found sentences short
enough to pass the reading gate but up to 24 figures and 27 names to hold, and closes of up to 11 sentences of orders
after "Here's what I'd do with this info if I were you". Asked in the session, he answered "Yes, replace it" to a close
of one short beat saying the one thing he would do, in his first person, and "Yes, a hard rule" to limits on what a
listener holds.

- Ruling 7 (the close) and Ruling 8 (a slow listener) are recorded in the profile as his words and a pointer. What the
  close is and the limits live only in content-engine's `SCRIPT_CLOSE` and `LISTENING` house rules
  (`apps/control-plane/api/_houseRules.ts`, krishanraja/content-engine#307), the one home for video-script production
  rules.
- The kill list gains one line, scoped to video scripts: no close that is a list of orders for the viewer, and never
  the retired line. It applies Ruling 2 to a script's close; it does not replace Ruling 2 for any other channel.
- Behaviour case `voice-behavior-032` holds it.

If wrong: the limits are tuned in content-engine's `LISTENING` block without touching this profile. Rollback: revert
the kill-list line and rulings 7 and 8; content-engine's rules stand on their own.
