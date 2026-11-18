# Growth push findings, batch 1, 2026-11-18

Status: proposed. Krish merges changes to his skills; this takes effect only when he merges the pull request that carries it.

Source: the first batch of findings from the Make Your Mind Up growth push session, 18 November 2026, sent to the skill curator session Krish asked for that day ("spin off a sub session that is constantly turning your findings, learnings and workflow experiments in to skills that enable future work to be best in class and progress everything forward consistently and with fewer issues"). Recipient names, addresses and pitch wording stay out of this file and the skills.

## What changes, and where

| Finding | Owner | Change |
|---|---|---|
| Engagement on posted comments can be read from public endpoints, with no signed-in browser | `tool-router` | One line in the skill and a new reference, `references/public-read-routes.md`, with the routes last seen working, what still needs a signed-in browser, and how to record a read. |
| A multi-author page put each name after its entry, and an extractor credited a quote to the wrong person | `evidence-research` | A "Multi-author page" edge case: confirm authorship from raw page order and quote from raw text before attributing. |
| A phrase removed from the repository still lived on the hosted newsletter in three places | `verification-loop` | A copy change is checked on the live hosted pages too, including data in the raw HTML. |
| A public render check must not use the signed-in browser | `verification-loop` and the new `tool-router` reference | A stranger's view uses a throwaway profile; the reference gives a Chrome command for machines without Playwright. |
| The next session could not read the last session's drafts, so Krish pasted them by hand | operating contract, Session closeout | Whatever the next session needs is saved where it will run, private words in an ignored folder there, and the closeout note names the path; failing that, the closing message carries the full texts. |
| The cold pitch shape that passed review in round 1, and a `check_voice` gotcha | `krish-voice`, `references/outbound-email-voice.md`, routed from the skill | A new section for a cold pitch to a named writer or creator. |
| Offer design for a co-hosted live session | same section | Only the general parts: never promise what a platform's help pages do not say plainly, check what the offer needs from the other side first, and flag any position Krish would argue for his approval. |

## Refused, and why

- **The `ugrep` regex limit on one machine.** A tool quirk on one machine, not a fleet rule. It belongs in that machine's notes.
- **The engagement result from 16 November** (comments under big media accounts, read at about 47 hours). One trial in one venture. Under the experimental-learning rule it is evidence for that setting, not a fleet prohibition, so it belongs in the venture's own lessons.
- **Co-hosting specifics** (account needed, publishers per live). Venture-specific, so they belong in the venture's own lessons.
- **Removing dated-and-scored calls (Ruling, Krish, 2026-11-17).** A search of this repository for the phrases named found nothing concerning Make Your Mind Up, so there is nothing to remove here.

## Evidence held

Three new behaviour cases: `research-behavior-024`, `voice-behavior-041` and `verification-behavior-039`. No `tool-router` case was added, because that file records observed runs and none has been run.

## Judge panel fixes, 2026-11-18

- **Humour scope.** The pitch section had widened the 10 November ruling from outbound email to every outbound. It now applies the ruling to email pitches only, and asks Krish before humour in a message or form pitch.
- **Provenance.** The ledger rewrite had dropped the sha256 pin on the stage conveyor proposal for `verification-loop.select-checks-by-artifact`. The pin is restored in that history row, and every entry this proposal now sources carries its sha256.
- **One home.** The stranger-view rule lives only in `verification-loop`; the routes reference keeps just the Chrome command and points there.
- **Stall risk.** The routes reference no longer writes a manual Instagram step on Krish's computer. A count with no public route is recorded as unknown.
