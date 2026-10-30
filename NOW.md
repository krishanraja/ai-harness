---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-10-30
head: 374cb01
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

## Where it is right now (as of 2026-10-30)

<!-- north-star-state {"week_of": "2026-10-26", "week_target": null, "current": null, "current_as_of": null, "current_source": null, "urgency": 4, "urgency_reason": "not measured yet"} --> **North Star number: U4, far behind.** Corrections Krish had to give twice in a week, across the fleet: not measured yet. A bold swing every day; work that does not move the number waits.

- Taste by venture and Krish's approved taste rules for krish-voice and krish-design landed on main together (PR 174, PR 179, 2026-10-30): sessions pass their repository, and the venture, to `get_approved_taste` and `report_to_taste_engine`. The canon block is synced to v2026.10.29.3; the skills follow at the next skill release. `brain/rules.yaml` records the new text.
- Growth engines have one doctrine: the Engines section of `contract/north-star-metric.md`, with Control Center as line manager. Four engines joined `state/fleet.yaml` and stay out of the repository administration publisher until Krish accepts them. Open for Krish: the canon asks a check_in at least every other day, while growth-legibility and growth-makeyourmindup say at least twice a week; neither side was changed. Detail: LOG 2026-10-30.
- claude.ai accounts hold no skill copies and no recurring job. The Instructions field holds a fixed pointer (`adapters/cloud/account-instructions.md`) that loads the routing live through Control Center's `get_skill`; `adapters/cloud/account-setup.md` is a one-time supervised setup per account. Both claude.ai surfaces stay recorded as stale until a read-back. tool-router is production skill 30 and places 21st Dev's prepaid credits on interface work only.
- The harness's own pull requests merge themselves when green, closeout notes fold into NOW.md on main, and NOW.md is audited nightly against `config/now-audit.json` (PR 175, Rulings, Krish, 2026-10-28). Steward fallbacks get a pull request and renamed repositories find their fleet entry (PR 178).
- **Release and surfaces.** Read the latest approved release from `state/skill-registry.yaml` and the surface table from `CURRENT.md`, not from this line. The two supervised Claude accounts need the one-time setup, Codex Cloud an environment refresh, and `claude-secondary-cloud` is unknown. A hash match proves installed bytes only. `cursor-primary` has no headless canary.
- **LORIMER's sync.** `state/heartbeats.json` showed `harness-sync-lorimer` `blocked` with reason `release-assets` on 2026-10-28, and a sync of v2026.10.29.1 was recorded on 2026-10-29 (#184). Read the file, not this line, before trusting either.
- **Skill review dates.** As of the registry on 2026-10-19, 13 of 29 skills were past their freshness SLA, led by `krish-design` and `krish-content-marketer`. Not recomputed since. Candidates outside packaging: `consumer-app-outcomes` and `tool-economics` (staged, inactive); see `state/candidates/`.
- **Credential exposure** opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`). Session closeout, one fleet list (`state/fleet.yaml`) and the North Star (`docs/NORTH_STAR.md`) are in force.

## What changed recently

- 2026-10-30 **Taste by venture and the approved taste rules reached main together (PR 174, PR 179).** Nine other branches were left as they are: four already on main, five superseded by later work on main.
- 2026-10-29 **The canon reaches all five growth engines.** The next canon sync renders the block, with its new pointer to the Engines section, into each engine's AGENTS.md; nothing was synced from this session.
- 2026-10-29 **Krish's working-style instructions live in the harness, and the personal-email rule is gone everywhere.** Ruling (Krish, 2026-10-29): remove the rule that his personal email never appears on client-facing work and only hello@krishraja.com is used. Ruling (Krish, 2026-10-29): his instructions for how any AI works with him belong in the harness, served to every surface.
- 2026-10-29 **The accounts need one supervised setup each and nothing after it; the routing is served live, not pasted.** `scripts/Test-Harness.ps1` now requires the served routing to name every production skill and the pointer to load it.
- 2026-10-29 **The account routine proves it is in the right account and the right page before it deletes anything.** The wrong-account case is real: Anthropic does not document whether the desktop app's built-in browser keeps one sign-in across accounts.
- 2026-10-29 **A routine in each claude.ai account keeps it on main; the accounts hold no skill copies.** Ruling (Krish, 2026-10-29): a Claude routine in each account keeps it in sync, opening its own Claude browser if needed. Ruling (Krish, 2026-10-29): the routine may delete, from both accounts, uploaded skills whose names are exactly the harness production names, and nothing else.
- 2026-10-29 **Skills follow main on every surface without uploads: loaders in claude.ai, bodies served live by Control Center, tool-router admitted.** `scripts/build-cloud-loaders.mjs` writes `adapters/cloud/loaders/` (30) and fails the steward check when a loader disagrees with `skills/`; the account instructions say every installed skill is a loader; `.claude/settings.json` allows Control Center's read tools without a prompt. Ruling (Krish, 2026-10-29): skills stay current on every surface with zero intervention, following main. Ruling (Krish, 2026-10-29): tool-router is included everywhere.
- 2026-10-29 **Steward fallbacks and renamed repositories stop failing silently.** content-engine's steward cut its NOW.md from 139,056 characters to 95 lines but pushed to steward/2026-10-29 with no pull request, the eighth such branch; mm-ctrl's steward could not find its own fleet entry since the repository was renamed. `scripts/merge-bot-prs.mjs` (orphanPlan) and the steward validator's alias lookup fix both.
- 2026-10-28 **Pull requests stopped piling up: the harness's own merge themselves, and NOW.md can no longer conflict.** Ten canon-sync pull requests had sat open in the fleet for up to eleven days because nothing but Krish merged them, so fractionl-circle, full-time and mm-ctrl still ran the 10-15 and 10-17 canon without the North Star or taste rulings; every release opened another round, because the release id was inside the hashed block, and #173 changed only that number. Pull requests here conflicted within a day because every session edited NOW.md and main rewrote it daily. Bot change requests failed closeout by construction and expired unseen. Ruling (Krish, 2026-10-28): canon-sync and PC-evidence pull requests merge themselves when green and replaced ones close. Ruling (Krish, 2026-10-28): closeout writes a note folded into NOW.md on merge, with regular objective audits of the NOW files. `docs/proposals/2026-10-28-prs-merge-themselves.md`.
- 2026-10-27 **A Drive file now has a registered home, because the Drive create and copy tools default to the top of his Drive when no parent is named.** `tools-access` rule 11 requires an explicit `parentId` inside CURRENT, ARCHIVE or Ventures, `CURRENT/00_INBOX` when the home is unknown, and a read-back of the file's parent; one behaviour case and one trigger case cover it (PR 141). Ruling (Krish, 2026-10-18): every Drive file has a registered home, always; no session saves a file loose at the top of his Drive.
- 2026-10-27 **LORIMER's sync stopped needing hands: PR 170 merged.** The sync had stopped on 2026-10-27 over Claude's own `.trash`, an unregistered `tool-router` and a `__pycache__` that `locked-revision`'s scripts left in an installed skill on 2026-10-22; the hash algorithm was left alone because ignoring `__pycache__` would let a planted `.pyc`, which Python can load in place of verified source, go unmeasured. Registered as v2026.10.27.1, then v2026.10.27.2 after Heartside's context routing moved to its current docs (PR 172, a manifest change only).
- 2026-10-26 **Epidemic Sound joins the tool map for Heartside, Full Time and makeyourmindup creative, on his own channels only.** Until now the map's only music route was Runway's `generate_music`, on Heartside and Full Time credits. It gives agents a licensed library with stems and edit-to-length. Its stock voiceover is never presented as Krish. Control Center's catalog carries the placement (krishanraja/control-center#565). Ruling (Krish, 2026-10-26): Epidemic Sound is a tool for his ventures, for Full Time and Heartside creatives and makeyourmindup content. Ruling (Krish, 2026-10-26): Heartside and Full Time creatives go on his own channels, not paid ads.

## What is next and what is waiting on Krish

- Next (2026-10-30): register the next release so the venture-scoped taste line reaches every surface and every repository's canon block.
- Waiting on Krish: replace the invalid `ANTHROPIC_API_KEY` secret (judge reported unmeasured at the PR 124 merge, 2026-10-14, carried forward and not rechecked 2026-10-29) and add `CONTENT_ENGINE_KEY` so the digest reaches the Control Center queue; add `CLAUDE_CODE_OAUTH_TOKEN` to Heartside, Legibility and growth-heartside for the nightly steward.
- Waiting on Krish: rule on `docs/harness/VPS-ROLE-2026-10-03.md` (carried forward from 2026-10-03, not rechecked 2026-10-29; the Lozatron sandbox container was stopped then), and on founder visibility (commit `88a059d`).
- Waiting on Krish: whether `tool-router` goes back on Codex from the current `candidates/tool-router`, and admission decisions for `tool-router`, `tool-economics` and `consumer-app-outcomes` (`docs/proposals/2026-10-19-tool-router.md`, `docs/proposals/2026-10-19-tool-economics.md`, `docs/proposals/2026-09-25-consumer-app-outcomes.md`); the 13 expired skill reviews; the manual cloud uploads; closing the credential-exposure lifecycle.
- North Star check (2026-10-30): holds.

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
