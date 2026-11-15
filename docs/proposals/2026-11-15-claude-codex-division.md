# Proposal: the canon names who does what between Claude and Codex, and every engine closes a weekly loop

Status: accepted, amended the same evening (see "Amended 2026-11-15" at the end). Ruling (Krish, 2026-11-15): "yes to #263". In force in the canon block, `contract/channel-tasks.md` and `contract/north-star-metric.md` (Engines rule 7). The conflict below was settled before the Yes: since content-engine PR #714 cards run under the Codex home his Desktop app reads, and since #727 and #728 they start Windows Codex from WSL.
Source: Krish's instruction of 2026-11-15 (typed in a claude.ai/code session), recorded as
`Ruling (Krish, 2026-11-15): Codex does a minimum of every video session and the social legwork, visible in Codex Desktop; Claude owns strategy, orchestration, verification and learnings; Codex never updates ai-harness or Google Drive.`
in the commits of content-engine, growth-heartside and growth-makeyourmindup that put it into those repositories' own
rules the same day.

His words, in full:

> "I want you to ensure that video production has a minimum amount of work being done by Codex per session - Claude
> is in charge of strategy, planning, orchestration and verification and reingestion of learnings in to the system.
> Codex has a lot of token avails, better art direction capability and better browser access. Codex is not to be in
> charge of updating AI harness or Google Drive ever, even though these things always need to be done. Codex needs
> to be used so I can actually see the session in my Codex Desktop app, because I will invariably need to connect
> browser access to my social platforms for certain sessions. Codex should also do the leg work for social media
> asset scheduling, posting, verifying posts went live properly with the right thumbnails and captions and CTAs, and
> also the measurement reports are ingested, and we understand whats working well and what isn't, and use that to
> optimise future assets. This is relevant in any scenario, right now for Heartside and MakeYourMindUp, but this full
> closed loop autonomous system must exist where I am shown every week what's working and what's not, but the system
> automatically incorporates what analyzes why things are working better than others."

He says it holds "in any scenario", so it is fleet doctrine, not one repository's rule. The repositories already
carry it (below); this proposal puts the cross-cutting part in the canon so every repository and client reads it once.

## The change, in three places

**1. The canon block, after "Route." (one sentence):**

> **Claude and Codex:** Claude owns strategy, planning, orchestration, verification and writing learnings back, and is
> the only writer to ai-harness and Google Drive; Codex does art direction, visual builds and browser legwork (in a
> session Krish can watch in his Codex Desktop app), a defined minimum of every video session, and hands what it made
> or read to the Claude session that checks and records it; Codex's own report is never proof, and no rule here widens
> what either may post, send or spend (Ruling, Krish, 2026-11-15).

**2. `contract/channel-tasks.md`, a new paragraph on the social legwork:**

> Scheduling, posting and the go-live check are Codex's legwork, inside each repository's own approval wall (an
> approved Sheet row, an approved edition): after each post Codex reads it back live and records whether its cover or
> thumbnail, caption and call to action match what was approved, then reads its numbers at the channel's judge windows
> and every paid boost's results in the ads manager. Claude checks the readings, records them and writes any Sheet or
> Drive file. Reading an ads manager is reading; changing a boost needs Krish's Yes on that boost.

**3. `contract/north-star-metric.md`, Engines, a seventh rule:**

> 7. **Close the loop every week.** Once a week each engine shows Krish what worked and what did not, with why, as a
> `check_in` ("On track?"): the posts or actions that earned the most and least genuine interest, like with like, and
> paid results split from organic and judged by the number, never by reach. What the engine's own rules already allow
> it to change (a mix weight inside its bounds, a concept's rank) changes automatically from that read; anything wider
> is a proposal.

## How it sits with the rules beside it

- **Authority:** unchanged. Codex gains no post, send, spend or permission it did not have; Heartside's
  `approved = yes`, Make Your Mind Up's publishing authority and every boost Yes stand.
- **One home per fact and the research route:** the analysis each engine writes lives in that engine's repository,
  where its strategy lives. Nothing here copies a venture's state into ai-harness.
- **Zero Claude routines:** the weekly loop runs inside each engine's existing Sunday job and GitHub Actions, never a
  claude.ai schedule.

## A conflict for Krish to settle

content-engine dispatches Codex cards in WSL under the Studio's own Codex home (Krish, 2026-10-30: "do the separate
settings folder fix"), so those sessions do not appear in his Codex Desktop app. His new instruction asks to see
every Codex session there. content-engine now records, on each Codex receipt, whether the session is visible in
Desktop, and changes nothing else. He chooses: point the Desktop app at the Studio's Codex home, or run cards in the
Desktop app under the same tool profile.

## Where it is already in force

- content-engine: `config/codex-minimum.json`, `scripts/velib/codex_minimum.py` (`ve status` and `ve file` hold a cut
  with no verified Codex receipt from 16 Nov 2026), `docs/ve/ENGINE.md` "Who does what, and the Codex minimum".
- growth-heartside: `AGENTS.md` "Claude and Codex: who does what", `engine/social.py` (`post_check` and `boost`
  records), `jobs/report.md` step 4b, `docs/audits/2026-11-15-interest-vs-paid.md`.
- growth-makeyourmindup: `AGENTS.md` "Claude and Codex: who does what", `jobs/report.md` step 4b,
  `jobs/measurement.md` (`paid_boost` readings), `docs/reviews/2026-11-15-interest-vs-paid.md`.

## Amended 2026-11-15, the same evening: content production stays in the cloud

Ruling (Krish, 2026-11-15): content production runs on Codex cards from the cloud and is never shown in Codex Desktop; social media legwork runs from a Claude session on his own computer, visible there.

What happened: running every card under the Codex home his Desktop app reads (content-engine PR #714 and its follow-ups) made every Codex card queued from a cloud session fail on his PC from 16:24 UTC, and the fixes that evening bent the video lane to fit a route meant for social legwork. His words, in full:

> In actual fact we should have kept video production rooted in the cloud and not accessible in the Codex desktop app, which is fine. All social media management tasks would be started on a local machine Claude session and go through the newly built route, which would enable me to see the session in the Codex desktop app.

> Maybe just have all content production running on the cloud Codex cards. Make sure the content watcher and music watcher always go to the VPS worker and make sure that any social media tasks run through the local session, build through to Codex desktop.

So the "visible in Codex Desktop" part of this proposal now holds for social media legwork only, started from a Claude session on his own computer through codex_thread. This changes where sessions run, never what they may do: no rule here widens what Claude or Codex may post, send or spend, and every post, send and spend keeps its own approval (`authority.never-publish-post-send`). Content production (video, stills, every Codex card queued from a cloud session) is built by his PC's lane under the Studio's own Codex home, as before 15 Nov, never shown in Desktop, and still counts towards the Codex minimum. The status line's "since content-engine PR #714 cards run under the Codex home his Desktop app reads" is superseded: content-engine PR #731 restored the split in code. The rest of this proposal (who owns what, the weekly loop) stands unchanged. The canon sentence now reads: "Codex does art direction, visual builds and browser legwork, a defined minimum of every video session (content production runs on Codex cards from the cloud and is never shown in his Codex Desktop app; social media legwork runs from a Claude session on his computer, in a session he can watch there; Ruling, Krish, 2026-11-15), ...".
