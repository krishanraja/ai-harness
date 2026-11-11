---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-11-11
head: 96c8c08
lifecycle: live
production_url: none
state_doc: state/skill-registry.yaml
history_log: docs/history/LOG.md
truth_files: [state/skill-registry.yaml, state/fleet.yaml, contract/paths.yaml]
authority_order: [live target readback for volatile external state, state/skill-registry.yaml, state/heartbeats.json, contract/krish-operating-contract.md, contract/skill-routing-contract.md, contract/active-skill-quality-standard.md, CURRENT.md, README.md]
steward: https://github.com/krishanraja/ai-harness/blob/main/docs/steward/RUNBOOK.md
---
# The harness: where it is right now

## What it is

The harness is Krish's canonical cross-client AI operating layer, published in a public repository: one operating contract, one skill-routing contract, 29 curated production skills, deterministic release packaging, per-surface deployment evidence, behavioral canaries and a controlled learning path, delivered the same way to Claude, Codex and Cursor so a rule written once is enforced everywhere instead of copied by hand and left to drift.

## Who it is for and why it matters for Mindmake

This repository is not sold and carries no product name of its own; it is the infrastructure every other Mindmake surface runs on. It is the evidence behind the sales claim the rest of the fleet makes to a buyer: that AI agents can carry consistent judgment, bounded authority and verified execution across tools and sessions, not just inside one chat window. The harness proves that claim on Krish's own agents first, including its own governance of itself (it was added to the fleet the docs steward maintains on 2026-09-08 specifically so the canon repository is not exempt from the discipline it imposes on every other repo).

## Where it is right now (as of 2026-11-11)

<!-- north-star-state {"week_of": "2026-10-26", "week_target": null, "current": null, "current_as_of": null, "current_source": null, "urgency": 4, "urgency_reason": "not measured yet"} --> **North Star number: U4, far behind.** Corrections Krish had to give twice in a week, across the fleet: not measured yet. A bold swing every day; work that does not move the number waits.

- krish-voice has comment-evidence.md (Krish's own Heartside, Make Your Mind Up and X comment lines beside the drafts he replaced), and humour.md has comment rules: choose the job first (warmth is valid), name puns allowed in comments, never at a person, and X replies follow them. (2026-11-11)
- krish-voice humour.md lets Krish's personal LinkedIn use humour selectively: at most one light line a post, led by self-deprecation and dry irony, with no cruelty or escalation, and never in a post that sells Mindmake. (2026-11-10)
- krish-voice has references/humour.md, which sets where each of six humour traits may be used: never in Mindmake or any outbound email, integrated under the house register in Make Your Mind Up, in full for Heartside and Full Time; krish-principles has "Humour with Krish" for joking with him directly. (2026-11-10)
- krish-voice's kill list names a voice for every channel and covers every surface: Krish's email and socials, Jonny's emails, DMs, comments and forms, and the publication's scripts, articles, captions, carousels and Substack, which also take Make Your Mind Up's own canon by hash. (2026-11-09)
- krish-voice has a machine-readable kill list (references/kill-list.json, checked against the doctrine by evals/voice/test-kill-list.mjs in Test-Harness), the inspiration writers' moves (inspiration-writers.md: Alex Lieberman, Tyler Denk, Jerry Ralhan provisional) and the LinkedIn and email evidence (linkedin-evidence.md); British spelling holds on every channel by Krish's 7 Nov ruling. (2026-11-07)
- Growth engines have one doctrine: the Engines section of `contract/north-star-metric.md`, with Control Center as line manager. Four engines joined `state/fleet.yaml` and stay out of the repository administration publisher until Krish accepts them. Open for Krish: the canon asks a check_in at least every other day, while growth-legibility and growth-makeyourmindup say at least twice a week; neither side was changed. Detail: LOG 2026-10-30.
- claude.ai accounts hold no skill copies and no recurring job. The Instructions field holds a fixed pointer (`adapters/cloud/account-instructions.md`) that loads the routing live through Control Center's `get_skill`; `adapters/cloud/account-setup.md` is a one-time supervised setup per account. Both claude.ai surfaces stay recorded as stale until a read-back. tool-router is production skill 30 and places 21st Dev's prepaid credits on interface work only.
- The harness's own pull requests merge themselves when green, closeout notes fold into NOW.md on main, and NOW.md is audited nightly against `config/now-audit.json` (PR 175, Rulings, Krish, 2026-10-28). Steward fallbacks get a pull request and renamed repositories find their fleet entry (PR 178).
- **Release and surfaces.** Read the latest approved release from `state/skill-registry.yaml` and the surface table from `CURRENT.md`, not from this line. The two supervised Claude accounts need the one-time setup, Codex Cloud an environment refresh, and `claude-secondary-cloud` is unknown. A hash match proves installed bytes only. `cursor-primary` has no headless canary. LORIMER's sync of v2026.11.09.1 was recorded on 2026-11-10 (#211); read `state/heartbeats.json`, not this line, before trusting it.
- **Skill review dates.** As of the registry on 2026-10-19, 13 of 29 skills were past their freshness SLA, led by `krish-design` and `krish-content-marketer`. Not recomputed since. Candidates outside packaging: `consumer-app-outcomes` and `tool-economics` (staged, inactive); see `state/candidates/`.
- **Credential exposure** opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`). Session closeout, one fleet list (`state/fleet.yaml`) and the North Star (`docs/NORTH_STAR.md`) are in force.

## What changed recently

- 2026-11-10 Krish ruled on the humour profile on 10 Nov; it went to the harness, not the taste ledger, because the ledger would file a model's reading of him as an uncounted observation.
- 2026-11-09 Krish, 2026-11-09: "we need to make sure everything goes through the same voice system. Absolutely everything."
- 2026-11-08 release v2026.11.08.1 was registered and LORIMER's sync of it recorded (#208); the krish-voice references answered the judge panel (PR 207).
- 2026-11-07 Krish asked for one voice, amplified by writers he admires, enforced on everything sent or posted in his name.
- 2026-10-31 scripts were hard to follow and their closes bossy; the profile now carries both rulings.
- 2026-10-31 Krish ruled Jonny's Mindmake emails mimic his email style; the profile, the email doctrine and a behaviour case now say so.
- 2026-10-31 the kill list names the two LinkedIn exceptions Krish ruled; a stale date in the measurements test fixture no longer fails CI.
- 2026-10-30 **The audit stops failing repositories for bullets folded the same day, and the merger stops reopening old steward fallbacks.** Bullets dated today or yesterday count toward no size limit; only the newest fallback branch of all can get a pull request, judged against commits that touched NOW.md; and the steward's own reason travels into that pull request.
- 2026-10-30 **Taste by venture and the approved taste rules reached main together (PR 174, PR 179).** Nine other branches were left as they are: four already on main, five superseded by later work on main.
- 2026-10-29 **The canon reaches all five growth engines.** The next canon sync renders the block, with its new pointer to the Engines section, into each engine's AGENTS.md; nothing was synced from this session.
- 2026-10-29 **Krish's working-style instructions live in the harness, and the personal-email rule is gone everywhere.** Ruling (Krish, 2026-10-29): remove the rule that his personal email never appears on client-facing work and only hello@krishraja.com is used. Ruling (Krish, 2026-10-29): his instructions for how any AI works with him belong in the harness, served to every surface.
- 2026-10-29 **Skills follow main on every surface without uploads: loaders in claude.ai, bodies served live by Control Center, tool-router admitted.** `scripts/build-cloud-loaders.mjs` writes `adapters/cloud/loaders/` (30) and fails the steward check when a loader disagrees with `skills/`; the account instructions say every installed skill is a loader; `.claude/settings.json` allows Control Center's read tools without a prompt. Ruling (Krish, 2026-10-29): skills stay current on every surface with zero intervention, following main. Ruling (Krish, 2026-10-29): tool-router is included everywhere.

## What is next and what is waiting on Krish

- Next (2026-11-11): growth-heartside retires its docs/HUMOUR.md copy and stops its judge requiring a cruel payoff when a comment's job is not a joke.
- Waiting on Krish: replace the invalid `ANTHROPIC_API_KEY` secret (judge reported unmeasured at the PR 124 merge, 2026-10-14, carried forward and not rechecked 2026-10-29) and add `CONTENT_ENGINE_KEY` so the digest reaches the Control Center queue; add `CLAUDE_CODE_OAUTH_TOKEN` to Heartside, Legibility and growth-heartside for the nightly steward.
- Waiting on Krish: rule on `docs/harness/VPS-ROLE-2026-10-03.md` (carried forward from 2026-10-03, not rechecked 2026-10-29; the Lozatron sandbox container was stopped then), and on founder visibility (commit `88a059d`).
- Waiting on Krish (still open 2026-11-03, not rechecked): whether `tool-router` goes back on Codex from the current `candidates/tool-router`, and admission decisions for `tool-router`, `tool-economics` and `consumer-app-outcomes` (`docs/proposals/2026-10-19-tool-router.md`, `docs/proposals/2026-10-19-tool-economics.md`, `docs/proposals/2026-09-25-consumer-app-outcomes.md`); the 13 expired skill reviews; the manual cloud uploads; closing the credential-exposure lifecycle.
- North Star check (2026-11-11): holds.

## Read next

1. `docs/NORTH_STAR.md`: the ambition every session works toward; only Krish changes it.

2. `CURRENT.md`: generated current release, surface and canary state.
3. `state/skill-registry.yaml`: machine-owned release and deployment register.
4. `contract/krish-operating-contract.md`: authority, verification, truth, freshness, secrets and observation capture.
5. `contract/skill-routing-contract.md`: which skill owns which request.
6. `contract/active-skill-quality-standard.md`: the admission standard for a production skill.
7. `contract/experience-quality-contract.md`: durable product-experience gates.
8. `docs/history/LOG.md`: append-only chronology.

## Do not trust

Nothing at the moment. No document in this repository currently claims to be authoritative on a fact that `CURRENT.md`, `state/skill-registry.yaml` or a canonical contract already settles differently. Dated material under `docs/proposals/`, `state/` and `docs/harness/` is historical evidence of what happened and what was decided at the time; it is not a second current-state surface and does not compete with `CURRENT.md`.
