# Growth push findings, batch 3, 2026-11-18

Status: proposed. It takes effect when the pull request that carries it merges.

Source: the third batch of findings from the Make Your Mind Up growth push session, 18 November 2026, sent to the skill curator session Krish asked for that day. Two sources: an adversarial review of twelve cold collaboration pitches (three fact verifiers, a voice reviewer, two recipient sceptics, a divergent-thinker challenge, three writers in three registers each, a judge), and a brand sync across a Claude Design System artifact, a Drive brand folder and Canva. It builds on batch 1 (#286) and batch 2 (#288) and repeats none of them. Recipient names, addresses and pitch wording stay out of this file and the skills.

Asker: Krish, 18 November 2026, for the growth push ("spin off a sub session that is constantly turning your findings, learnings and workflow experiments in to skills"). Value test: the next pitch batch and the next brand sync make none of these mistakes again; a repeat is a correction given twice and counts against the North Star.

## What changes, and where

| Finding | Owner | Change |
|---|---|---|
| P1. Two of ten "forms" were not forms: one dead, one an email address | `evidence-research`, contact route | Batch 2 already confirms the route's kind from the live page, and the register by channel. The one gap was a dead route; the edge case now says a route can be dead and is recorded so. |
| P2. A sincere, mission-pointed opener with no joke survives any route change and any stricter row | `krish-voice`, `references/humour.md`, first impression | Used only while the route or the row is unsettled. It keeps his energy, so it does not break the rule that a flat, careful note is the failure. Once settled, the first impression row applies in full. |
| P3. A verbatim quote can hit the kill list, and a quote cannot be respelled | `krish-voice`, `references/outbound-email-voice.md`, pitch section | Pick another line of theirs or put the point in Krish's words. Never alter a quote. |
| P4. A shared boilerplate intro is the flattest line, and repeated sentences show across a batch | same file, new "A batch of pitches" section | Each pitch gets its own mission line; no sentence repeats word for word across a batch. |
| P5. Independent writers converged on one opening construction four times and one ask verb six times | same section | Audit structure across the batch, not only within each pitch. |
| P6. Strongest openers: a true, public, self-deprecating fact, or a one-jump twist on their own line aimed at the topic; size jokes depend on the reader | `humour.md`, first impression | Recorded as review evidence, not measured replies. |
| P7. A counter-position that restates their own prediction earns "agreed" | pitch section | A counter-position meets a specific claim they made. |
| P8. A link preview puts the landing page's meta description inside the message | pitch section | Check the linked page's live title and description against current rulings before approval. The live-page check itself stays in `verification-loop`. |
| P9. Give-first beats a conditional swap | pitch section | Written as a promise unless done; never stated as done early; Krish told that approving the text approves the public recommendation. |
| P10. Divergence scoring against a list of obvious openers is free and confirms distance from cliché | "A batch of pitches" | Use `divergent_score` with an explicit obvious list; it cannot judge kindness, truth or voice fit. |
| P11. Claims about the sender must be live | pitch section | Check cadence, teaching and shipped work against the live record on the day. |
| B1. A ruling that retired copy survived in generators, publish checks, house rules and templates | `verification-loop`, code and repositories | A ruling is applied only after the whole tree, generators included, is searched and changed. |
| B2. Plan, then apply, with a verifiable tree, re-reading the live index before publishing | `verification-loop`, files and documents | Edited tree beside an untouched original with hash lists, independent checks, one publish, and a re-read of the live version and hash first. |
| B3. Claude Design System artifact mechanics | `tool-router`, new `references/connector-write-limits.md` | `.d.ts` as `text/plain`, retire by a one-call move, assets first and the index last with stored sizes. |
| B4. The Drive connector cannot rewrite contents | same reference | Dated replacement, "Superseded on" description, no renames or moves of depended-on paths, file references for `create_file`. Placement stays `tools-access` rule 11. |
| B6. Canva brand kit, font and page deletions cannot go through the connector | same reference | A stand-alone Cowork prompt with the ground rules, and the session's exact name given to Krish (canon). |

## Refused or narrowed, and why

- **B5, "Codex may not write to Google Drive".** Already canon (Ruling, Krish, 2026-11-15: Claude is the only writer to ai-harness and Google Drive). The new reference points to the canon in one line instead of restating it.
- **P1's route-kind and register rules.** Batch 2 already holds them (`evidence-research` contact route, `humour.md` channel rule). Only the dead-route gap was added.
- **P6 as a rule.** It is one review round's reading, not replies. It is recorded as review evidence beside the first impression rules, not as a ruling, and the size-joke caution is the only instruction drawn from it.
- **The landing page fix itself (P8).** Changing a homepage is the venture's work, not the harness's. The skill only makes the check part of approving a pitch.
- **A behaviour case for `tool-router`.** That file records observed runs and none has been run, as in batches 1 and 2.

## Evidence held

Seven new behaviour cases: `voice-behavior-045` (quote and kill list), `voice-behavior-046` (batch audit), `voice-behavior-047` (live sender claims), `voice-behavior-048` (sincere opener while unsettled), `research-behavior-026` (dead route), `verification-behavior-040` (ruling sweep reaches generators) and `verification-behavior-041` (re-read the live index before one publish).

## Provenance of reference-file changes

`brain/rules.yaml` tracks contract rules and skill chapters only. This proposal is the source of every reference-file change in the batch: `skills/krish-voice/references/outbound-email-voice.md`, `skills/krish-voice/references/humour.md` and the new `skills/tool-router/references/connector-write-limits.md`. Each is routed from a ledger-tracked chapter that takes this proposal as its source: `krish-voice.reference-routing` and `tool-router.match-value-to-the`. The chapter edits in `evidence-research` and `verification-loop` take it as their source too.
