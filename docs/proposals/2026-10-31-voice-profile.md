# A voice profile for krish-voice: how Krish actually writes and talks, measured

Krish, 2026-10-31, in his words: "I want one clear voice profile that I can use as an anchor and add to over time", then
"go ahead and build v1 of the voice profile".

## What changes

- **New reference** `skills/krish-voice/references/voice-profile.md`. It describes his voice measured from his own
  published words (295 LinkedIn posts, 26 long-form pieces, one live interview), with a quoted line and its source for
  every claim, numbers for each register, how the voice has moved since 2020, and five places where the evidence and
  `voice-doctrine.md` disagree. It is marked a draft until Krish approves it, and where it disagrees with the doctrine
  the doctrine wins until he rules.
- **One routing line** in `krish-voice` > Reference routing: read the matching register of the profile for a draft in
  his name or a voice check.
- **A measuring tool** `evals/voice/fingerprint.mjs` and its output `evals/voice/fingerprint.json`: numbers only, no
  corpus text. It scores a draft's distance from his typical piece on eight habits drawn from the doctrine (short
  sentences, uneven rhythm, contractions, talking to the reader, spaced hyphens, brackets, no formal connectives, no
  model phrasing).
- **One behaviour case**, `voice-behavior-028`.

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
