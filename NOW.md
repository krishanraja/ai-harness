---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-11-26
head: a2ed707
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

The harness is Krish's canonical cross-client AI operating layer, published in a public repository: one operating contract, one skill-routing contract, 35 curated production skills, deterministic release packaging, per-surface deployment evidence, behavioral canaries and a controlled learning path, delivered the same way to Claude, Codex and Cursor so a rule written once is enforced everywhere instead of copied by hand and left to drift.

## Who it is for and why it matters for Mindmake

This repository is not sold and carries no product name of its own; it is the infrastructure every other Mindmake surface runs on. It is the evidence behind the sales claim the rest of the fleet makes to a buyer: that AI agents can carry consistent judgment, bounded authority and verified execution across tools and sessions, not just inside one chat window. The harness proves that claim on Krish's own agents first, including its own governance of itself (it was added to the fleet the docs steward maintains on 2026-09-08 specifically so the canon repository is not exempt from the discipline it imposes on every other repo).

## Where it is right now (as of 2026-11-26)

<!-- north-star-state {"week_of":"2026-11-16","week_target":18,"current":29,"current_as_of":"2026-11-26","current_source":"state/observations: taste ledger repeats + harness correction clusters","urgency":4,"urgency_reason":"not measured: taste ledger not yet read for this week"} --> **North Star number: U4.** Corrections Krish had to give twice in a week, across the fleet: 29 in the week of 2026-11-16 (29 from the taste ledger, 0 from the harness's own corrections), measured 2026-11-26.

- content-engine makes every Make Your Mind Up asset (carousels, memes, Notes and captions included) and growth-makeyourmindup only grows the channel, in state/fleet.yaml, the neighbours table and content-corpus's collision rules, per Krish's ruling of 2026-11-26 (docs/proposals/2026-11-26-one-engine.md). (2026-11-26)
- The mm-ctrl entry reads docs/NORTH_STAR.md, with dated change rows recording that it supersedes the retired AGENT_BRIEFING.md pointer. (2026-11-26)
- the root of state/ holds only the truth files and the open credential exposure record; 50 dated one-off reports from August and September 2026 live in state/history/, every citing path is rewritten, and state/README.md maps truth files, evidence folders and history. (2026-11-26)
- apple-design is admitted as production skill 35, a contrarian second voice beside krish-design; krish-design's trigger now leads with ordinary review and redesign words, which took blind routing precision from 0.90 to 0.947 with recall 1.00, and canary round 3 passed 4 of 4. The Perplexity account text changed, so one paste is owed there. (2026-11-25)
- the cloud account routing names every neighbour in the capabilities table at the moment it should be called, and sends creative, brand and brainstorming work to approved taste, divergence, the council, the strategist and the humour engine before the first idea; software-qa's route is in the registry. (2026-11-25)
- state/fleet.yaml carries a registry of every repository Krish owns (scope, layer, role, venture, what each can do and when), rendered as krish-principles references/capabilities.md and state/ventures.json; the registry, steward manifest and canon carry Krish's approved names, each old name kept as an alias. (2026-11-24)
- internal-auditor merges every fleet repository's green pull request by Krish or his bots and its own green fixes, and may close and delete branches idle 7 days or more with each head sha recorded first; the council protocol carries seven discipline rules; insight-desk is production skill 34 and revenue-desk is a staged candidate. (2026-11-23 to 2026-11-24)
- **Release, surfaces and credentials.** Read the latest approved release from `state/skill-registry.yaml` and the surface table from `CURRENT.md`, not from this line; read `state/heartbeats.json` before trusting a sync. The two supervised Claude accounts need the one-time setup, Codex Cloud an environment refresh, and `claude-secondary-cloud` is unknown. The credential exposure opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`). (2026-11-15)
- <!-- skill-review-state {"as_of":"2026-11-26","overdue":8,"total":35,"oldest":[{"name":"apify","days":45},{"name":"n8n-operator","days":45},{"name":"decision-ledger","days":44},{"name":"design-intelligence-search","days":44}]} --> **Skill review dates.** Written by `scripts/skill-reviews.mjs` from `state/skill-registry.yaml` on 2026-11-26: 8 of 35 skills are past their freshness SLA, led by `apify` (45 days), `n8n-operator` (45 days), `decision-ledger` (44 days), `design-intelligence-search` (44 days). A date moves only when a change to the skill carries Krish's ruling.
- Proposed, waiting on Krish: the canon's engine-instruction paragraph (I-13, `docs/proposals/2026-11-14-engine-instructions.md`); the krish and jonny voices' pin on krish-raja's retired names (I-08); File routing naming only folders that exist (I-15, `docs/proposals/2026-11-14-drive-truth.md`); no cold outbound routed to Instantly (#233); the canon preamble's start-marker wording. (2026-11-14)

## What changed recently

- 2026-11-26 two repositories made assets, so carousels, memes, Notes, covers and captions had two routes, two looks and two sets of checks, and nobody could tell which was current; Krish: "I want everything to be one harmonious engine."
- 2026-11-25 apple-design was staged, tested on held-out cases (trigger failed, behaviour passed), repaired and admitted in one day: the first routing run missed because krish-design's description crowded out the second voice, so the fix was to the other skill's trigger, not apple-design's.
- 2026-11-26 state/ split into truth files, evidence folders and history, so a stranger can tell what the harness reads from what it keeps as evidence; the README design list now names brain/, config/, docs/ and now-notes/. This moves the public-reference part of the North Star, not the corrections number.
- 2026-11-24 the council protocol gained seven discipline rules (steel-man first, evidence rule, earned severity, ledger of settled decisions, anonymous drafts, two-round cap, grounded winning claim), each backed by a held-out behavior case (`docs/proposals/2026-11-24-council-discipline.md`).
- 2026-11-24 two copies of a privacy rule had to be changed in the same week by hand; now a registry row is the only place to change it.
- 2026-11-24 music-watcher is in scope as a service (trackcard, the Music Brains and the production engine), by Krish's choice, knowing the Ikigai's rule 8 protects music.
- 2026-11-24 Ruling (Krish, 2026-11-24): every repository knows what the others can do, so collaboration is proactive at all times.
- 2026-11-24 Ruling (Krish, 2026-11-24): all repos should also be auto merge; the auditor merges centrally.
- 2026-11-24 Krish ruled that everything should happen automatically.
- 2026-11-24 Krish asked that every repository report folder changes to filearchives.

## What is next and what is waiting on Krish

- Next (2026-11-26): control-center regenerates src/lib/fleetRegistry.ts from the registry once this merges.
- Waiting on a person: seven now-notes of 2026-11-25 on apple-design have a heading line the fold cannot place, so they stay in now-notes/ unfolded; their content is in the apple-design bullet above.
- Waiting on Krish: add `CONTENT_ENGINE_KEY` so the harness can confirm the digest reached the Control Center queue (not rechecked 2026-11-12; `ANTHROPIC_API_KEY` works, the judge measured pull request 209 on 2026-11-09); add `CLAUDE_CODE_OAUTH_TOKEN` to Heartside and Legibility for the nightly steward.
- Waiting on Krish: rule on `docs/harness/VPS-ROLE-2026-10-03.md` (carried forward from 2026-10-03, still open per the last record on 2026-11-13, not rechecked since 2026-10-29; the Lozatron sandbox container was stopped then), and on founder visibility (commit `88a059d`).
- Waiting on Krish (carried forward from 2026-11-03, unverified since; reviewed for this page 2026-11-24): whether `tool-router` goes back on Codex from the current `candidates/tool-router`, and admission decisions for `tool-router`, `tool-economics` and `consumer-app-outcomes` (`docs/proposals/2026-10-19-tool-router.md`, `docs/proposals/2026-10-19-tool-economics.md`, `docs/proposals/2026-09-25-consumer-app-outcomes.md`); the expired skill reviews (8 of 35, per the Skill review dates line above); the manual cloud uploads; closing the credential-exposure lifecycle.
- North Star check (2026-11-26): holds.

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
