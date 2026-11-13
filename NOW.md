---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-11-13
head: c9c23cb
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

## Where it is right now (as of 2026-11-13)

<!-- north-star-state {"week_of": "2026-10-26", "week_target": null, "current": null, "current_as_of": null, "current_source": null, "urgency": 4, "urgency_reason": "not measured yet"} --> **North Star number: U4, far behind.** Corrections Krish had to give twice in a week, across the fleet: not measured yet. A bold swing every day; work that does not move the number waits.

- content-engine's listed rule files name docs/CAROUSEL-STANDARD.md instead of the retired carousel engine's state document, so the canon block and the repository context stop pointing sessions at a retired route. (2026-11-13)
- Krish's 13 November ruling that cold outbound is in scope for Mindmake (email, LinkedIn and calls, every send still his, the law held) and the 22 October clone ruling are carried into who-krish-is.md, the krish-principles skill, the operating contract's founder-visibility line and the mindmake skill's commercial canon; Rule 2 stays verbatim and reads against the ruling, as Rules 7 and 8 read against the portfolio ruling. brain/rules.yaml revised for the two changed texts. (2026-11-13)
- The North Star number is measured every night, for the first time; it is rising (9 on w/c 12 Oct to 18 on w/c 2 Nov in the taste ledger). `scripts/north-star.mjs`, which runs in the steward's observe job, counts corrections Krish had to give twice in the last whole week and writes the result into the north-star-state line above. It adds two counts. The first is the taste ledger's repeats: inspirationhouse sends each correction slug Krish gave in two or more pieces of evidence that week as one explicit_correction envelope naming the skill that owns it. The second is this ledger's own correction clusters seen on two days. Before this, the ledger never saw most of his corrections, and the scoreboard rate read 0.3%. The 18 repeats the taste ledger found for w/c 2 Nov passed this repository's intake in a dry run, and with them the number reads 18. The ladder and urgency stay Krish's: U4, ladder pending. (2026-11-13)
- full-time's administration pull request #103 has waited since 28 Oct on one failed check, `typecheck` (full-time's verify job), which fails on full-time's main too: its production dependency audit finds four moderate advisories (seroval below 1.6.11 through @tanstack/react-router, qs at 6.16.0, minimatch 9 and 10 through workflow); typecheck, 609 tests and the persona check pass. The publisher now brings a held pull request that is behind main up to date, once per main revision, so a check that failed against an older main runs again against today's; nothing merges until every check passes. (2026-11-13)
- The harness watchdog reads every central job from its own evidence. A weekly job (central-proposals, central-repository-proposals) that a failed daily run skipped by its own condition is failed only when it was due in that run, so the 12 Nov surfaces and administer failures no longer mark the 9 Nov weekly passes as failed. A pull request job on a rare branch family (central-fresh-context) is read from its own latest family pull request, found by name, when the bounded history no longer holds it, and central-native-title-replay is proved by its own step's conclusion in the jobs API instead of reading unverified by design. The repository administration reader fetches every file AGENTS.md or CLAUDE.md tells an agent to read, so growth-heartside's later `codex/INDEX.md` read (blocked since 10 Nov) is current, and a pull request awaiting checks now names the checks it waits on. central-docs failed at 01:29 UTC on 13 Nov with every fleet docs steward (00:57 to 01:32, Claude returned an instant error); a dispatched run at 10:28 ran Claude and passed, so its next scheduled run clears it. (2026-11-13)
- The two claude-cloud-account reader slots are optional: config/harness-jobs.json keeps both listed and enabled with `required: false`, the watchdog only requires that they exist, and an optional slot no reader can reach shows as inaccessible without making the watchdog unhealthy, which settles the 2026-11-12 bullet's choice. Cloud sessions are covered by live capture through the Control Center connector (`record_harness_observation`); the cloud session miner is retired, and its weekly task "Session miner: weekly cloud sessions" in Krish's main account was switched off on 2026-11-13. (2026-11-13)
- The harness watchdog judges a pull request job that runs on one family of branches only by that family's runs (head_branch_prefix in config/harness-jobs.json), so central-fresh-context and central-native-title-replay no longer read "failed" from another branch's red pull request in which they were skipped by their own condition. The watchdog stays red for three reasons it reports honestly: the 01:59 to 02:54 UTC scheduled runs of 12 Nov failed before #220 and #219 fixed their causes, so their next scheduled runs clear them; the two required claude-cloud accounts have no verified identity or source access, which is Krish's to grant; and no harness/brain-repository-administration pull request has run fresh-context recently. (2026-11-12)
- Growth engines have one doctrine: the Engines section of `contract/north-star-metric.md`, with Control Center as line manager. Four engines joined `state/fleet.yaml` and stay out of the repository administration publisher until Krish accepts them. Open for Krish: the canon asks a check_in at least every other day, while growth-legibility and growth-makeyourmindup say at least twice a week; neither side was changed. Detail: LOG 2026-10-30.
- claude.ai accounts hold no skill copies and no recurring sync job (the scheduled tasks one account holds are listed under `routines` in `state/fleet.yaml`). The Instructions field holds a fixed pointer (`adapters/cloud/account-instructions.md`) that loads the routing live through Control Center's `get_skill`; `adapters/cloud/account-setup.md` is a one-time supervised setup per account. Both claude.ai surfaces stay recorded as stale until a read-back. tool-router is production skill 30 and places 21st Dev's prepaid credits on interface work only.
- The harness's own pull requests merge themselves when green, closeout notes fold into NOW.md on main, and NOW.md is audited nightly against `config/now-audit.json` (PR 175, Rulings, Krish, 2026-10-28). Steward fallbacks get a pull request and renamed repositories find their fleet entry (PR 178).
- **Release and surfaces.** Read the latest approved release from `state/skill-registry.yaml` and the surface table from `CURRENT.md`, not from this line. The two supervised Claude accounts need the one-time setup, Codex Cloud an environment refresh, and `claude-secondary-cloud` is unknown. A hash match proves installed bytes only. `cursor-primary` has no headless canary. LORIMER's sync of v2026.11.10.2 was recorded on 2026-11-12 (#215) and its sync of v2026.11.11.1 waits in #217; read `state/heartbeats.json`, not this line, before trusting it.
- **Skill review dates.** As of the registry on 2026-10-19, 13 of 29 skills were past their freshness SLA, led by `krish-design` and `krish-content-marketer`. Not recomputed since. Candidates outside packaging: `consumer-app-outcomes` and `tool-economics` (staged, inactive); see `state/candidates/`.
- **Credential exposure** opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`). Session closeout, one fleet list (`state/fleet.yaml`) and the North Star (`docs/NORTH_STAR.md`) are in force.

## What changed recently

- 2026-11-13 Krish asked to measure the number the North Star names and to merge it (Ruling, Krish, 2026-11-13: do it all and merge to main).
- 2026-11-13 Krish, 2026-11-13, asked whether to set up a weekly Claude scheduled task in each of his two accounts or rule them not required: "readers not required". It keeps his 2026-10-29 ruling of zero Claude routines.
- 2026-11-12 Krish, 2026-11-12: "make sure everything's a cohesive system and that the project documentation is 100% up to date with absolutely nothing old or misleading left in there".
- 2026-11-12 scripts/harness-watchdog.mjs, config/harness-jobs.json, scripts/test-harness-watchdog.mjs.
- 2026-11-12 Every steward run that folded closeout notes was reported failed after its commit landed (control-center's 2026-11-12 run: 17 "was deleted" failures, nothing else); the validator now passes that run. The knowledge history check's 1 MiB buffer (ENOBUFS once brain/knowledge.jsonl passed 1 MiB) was fixed on main first by #220, so this change keeps main's fix.
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

- Next (2026-11-13): Let the canon sync carry the new rule file into content-engine's AGENTS.md and HARNESS_CONTEXT.md.
- Waiting on Krish: add `CONTENT_ENGINE_KEY` so the harness can confirm the digest reached the Control Center queue (not rechecked 2026-11-12; `ANTHROPIC_API_KEY` works, the judge measured pull request 209 on 2026-11-09); add `CLAUDE_CODE_OAUTH_TOKEN` to Heartside, Legibility and growth-heartside for the nightly steward.
- Waiting on Krish: rule on `docs/harness/VPS-ROLE-2026-10-03.md` (carried forward from 2026-10-03, still open per the last record on 2026-11-13, not rechecked since 2026-10-29; the Lozatron sandbox container was stopped then), and on founder visibility (commit `88a059d`).
- Waiting on Krish (still open 2026-11-03, not rechecked): whether `tool-router` goes back on Codex from the current `candidates/tool-router`, and admission decisions for `tool-router`, `tool-economics` and `consumer-app-outcomes` (`docs/proposals/2026-10-19-tool-router.md`, `docs/proposals/2026-10-19-tool-economics.md`, `docs/proposals/2026-09-25-consumer-app-outcomes.md`); the 13 expired skill reviews; the manual cloud uploads; closing the credential-exposure lifecycle.
- North Star check (2026-11-13): holds.

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
