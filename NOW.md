---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-11-15
head: 5a34255
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

The harness is Krish's canonical cross-client AI operating layer, published in a public repository: one operating contract, one skill-routing contract, 30 curated production skills, deterministic release packaging, per-surface deployment evidence, behavioral canaries and a controlled learning path, delivered the same way to Claude, Codex and Cursor so a rule written once is enforced everywhere instead of copied by hand and left to drift.

## Who it is for and why it matters for Mindmake

This repository is not sold and carries no product name of its own; it is the infrastructure every other Mindmake surface runs on. It is the evidence behind the sales claim the rest of the fleet makes to a buyer: that AI agents can carry consistent judgment, bounded authority and verified execution across tools and sessions, not just inside one chat window. The harness proves that claim on Krish's own agents first, including its own governance of itself (it was added to the fleet the docs steward maintains on 2026-09-08 specifically so the canon repository is not exempt from the discipline it imposes on every other repo).

## Where it is right now (as of 2026-11-15)

<!-- north-star-state {"week_of":"2026-11-02","week_target":18,"current":18,"current_as_of":"2026-11-14","current_source":"state/observations: taste ledger repeats + harness correction clusters","urgency":1,"urgency_reason":"at the week's countdown target (18 of 18)"} --> **North Star number: U1, on the ladder.** Corrections Krish had to give twice in a week, across the fleet: 18 in the week of 2026-11-02 (18 from the taste ledger, 0 from the harness's own corrections), against a target of 18, measured 2026-11-14. The ladder (Krish, 2026-11-14) asks 8 for the week of 9 Nov, 3 for 16 Nov, then 0 on 23 and 30 Nov.

- Proposed, for Krish's Yes: the canon names who does what between Claude and Codex (Codex never writes ai-harness or Google Drive; Codex does art direction, visual builds and browser legwork, visible in Codex Desktop), channel-tasks gains the social go-live check, and the Engines section gains a weekly what-worked loop (docs/proposals/2026-11-15-claude-codex-division.md). Nothing in the canon or contracts changed. (2026-11-15)
- `ad-copywriter` and `ugc-avatar` are admitted as production skills 32 and 33 (Ruling, Krish, 2026-11-15: admit ad-copywriter, and krish-content-marketer hands venture-account captions to it; Ruling, Krish, 2026-11-15: AI people may be used anywhere, with his explicit yes before one is used and again on the finished asset before it goes out; no AI labels anywhere). `ad-copywriter` writes and lints the captions on a venture's own posts, and `krish-content-marketer`'s description now hands those captions to it, with route cases proving the split. `ugc-avatar` holds every AI person to Krish's two yeses, his words recorded each time: before the person is used in a named piece, and on the finished file, by its SHA-256, before it goes out, to his 10/10 bar. No AI label goes anywhere, the venture gate is gone, and it keeps the never-a-customer rule, recorded consent for any real likeness, the 18 floor and the yes on every quote. Both moved to `skills/`, their suites to `evals/`, both records are retired, the registry says 33, the routing contract, both cloud routing texts and `brain/rules.yaml` carry them, and `scripts/Test-Harness.ps1` keeps running their tests and validators. The Perplexity account text changed (1,499 characters), so one paste is owed there. (2026-11-15)
- the canon block carries the Codex rule (Claude starts Codex only through the repository's codex_thread tool, from a session on Krish's computer when he must see or share it; a start failure is reported in one line, never worked around by editing MCP or Claude settings); docs/proposals/2026-11-15-visible-codex-sessions.md is approved, brain/rules.yaml records canon.codex, and scripts/codex_thread.mjs is canonical here, with scripts/codex-thread-copies.mjs reading every fleet copy and scripts/test-codex-thread-copies.mjs proving the check on every push. (2026-11-15)
- `council` is admitted as production skill 31 (Ruling, Krish, 2026-11-15: admit the council as a production skill; his words: "Merge and admit"). It moved from `candidates/council/` to `skills/council/` byte for byte, its two suites moved to `evals/`, `state/candidates/council.yaml` is retired, the registry lists it in `production` and `production_active` with `expected_skill_count` 31 (the source the canon render reads, so the sync carries "31 curated skills" to every repository), the routing contract carries its route row and collision rule, both cloud routing texts name it, `brain/rules.yaml` records its six chapters and the rule, and `scripts/Test-Harness.ps1` keeps running its tests and validator now it is no longer a candidate. The control-center byte match is closed: control-center main carries the `hard_to_copy` sentence and the gate matched both source files. The Perplexity account text changed, so one paste is owed there. (2026-11-15)
- proposal written for Krish: Claude starts Codex only through codex_thread, from a session on his computer when he must see or share it, with the tool canonical here and copied to growth-mindmake and growth-legibility (docs/proposals/2026-11-15-visible-codex-sessions.md). No canon or contract changed. (2026-11-15)
- the branch sweep takes an approved list (branch@sha) on a hand run and deletes each named branch only at that exact commit, skipping and logging anything else; the weekly run is unchanged. This is the canonical copy; the other fifteen repositories carry it byte for byte. (2026-11-15)
- `council` is staged as an inactive candidate (`candidates/council/`): a read-only validator any session can use to put a decision or an idea to the same five seats and eight idea tests Control Center's council uses, with the chair's call as advice to Krish. Its gate holds the copied words to control-center byte for byte and refuses outside names, em dashes and outside links; one sentence of the `hard_to_copy` brief is new and waits for control-center to adopt it (`docs/proposals/2026-11-15-council.md`). (2026-11-15)
- The weekly digest now lists every branch the weekly sweep keeps, per repository, oldest first, with its reason, last commit date and pull request (`scripts/kept-branches.mjs`, read-only on FLEET_TOKEN, by the sweep's own rules). A branch with work not on main and no open pull request for over a day is a digest decision, "needs a pull request or your yes to remove" (Ruling, Krish, 2026-11-15). A read-only run on 2026-11-15 found 122 kept branches in 11 of the 16 swept repositories, 86 of them needing him. (2026-11-15)
- the canon block carries the branch rule (one worktree and one branch per pull request, a branch with no pull request after a day gets one or is removed, every repository runs the weekly branch sweep); docs/proposals/2026-11-15-branch-hygiene.md is approved and brain/rules.yaml records canon.branches. (2026-11-15)
- A weekly branch sweep (`.github/workflows/branch-sweep.yml`, Sunday 03:17 UTC, and by hand) deletes every remote branch whose work is already on main and lists each branch it keeps with why: unmerged work, an open pull request, protected (Ruling, Krish, 2026-11-15). The script is `.github/scripts/branch_sweep.py`, copied unchanged from ai-harness, which holds the canonical copy. (2026-11-15)
- the canon-sync merger requires operating-context only where a repository's base runs the context workflow; in a repository the publisher does not administer it merges on that repository's own green checks once the pull request has been open ten minutes, so the first canon blocks into claude-archive, content-watcher, filearchives, music-watcher and sendlinks no longer wait on a check none of them runs. (2026-11-15)
- The OpenClaw fleet runs on the worker server (Hetzner, Helsinki) since 20:08 UTC on 14 Nov; the old box was deleted that night on Krish's ruling, with a Hetzner snapshot as the only rollback, and 12 jobs were retired by name. The harness's records, SENTINEL and the superseded-banner prompts say so; the T0 report is in `state/vps/MIGRATION-2026-11-14.md`. (2026-11-14)
- Proposed, waiting on Krish: the canon's engine-instruction paragraph (I-13, `docs/proposals/2026-11-14-engine-instructions.md`); the krish and jonny voices' pin on krish-raja's retired names (I-08); File routing naming only folders that exist (I-15, `docs/proposals/2026-11-14-drive-truth.md`); no cold outbound routed to Instantly (#233); the canon preamble's start-marker wording. (2026-11-14)
- The canon's Route paragraph names the research library as a research document's home, cited by id (I-30; it reaches the fleet's blocks with the next release). The North Star number has its weekly countdown ladder, set by Krish on 14 Nov: 18 (w/c 2 Nov), 8 (9 Nov), 3 (16 Nov), 0 (23 Nov), 0 (30 Nov). The 14 Nov reading was 18 of 18. (2026-11-14)
- Repository administration covers 18 targets (7 excluded) under plan:fleet-kit-v1; the docs steward's paid run is split in two, Claude writing with a read-only token and a model-free job publishing (AUTO-6); no database address or key is in this public repository, and CI fails on one (`scripts/check-public-leaks.mjs`). (2026-11-14)
- The nightly jobs now measure more: the North Star reads "not measured, U4" instead of a false 0 (`scripts/north-star.mjs`), `state/pins.yaml` and `scripts/reconcile-pins.mjs` report what each repository copies, and `scripts/skill-reviews.mjs` writes the review count below. (2026-11-14)
- **Release and surfaces.** Read the latest approved release from `state/skill-registry.yaml` and the surface table from `CURRENT.md`, not from this line. The two supervised Claude accounts need the one-time setup, Codex Cloud an environment refresh, and `claude-secondary-cloud` is unknown. Read `state/heartbeats.json`, not this line, before trusting a sync. (2026-11-15)
- <!-- skill-review-state {"as_of":"2026-11-15","overdue":11,"total":30,"oldest":[{"name":"krish-content-marketer","days":42},{"name":"apify","days":34},{"name":"evidence-research","days":34},{"name":"n8n-operator","days":34}]} --> **Skill review dates.** Written by `scripts/skill-reviews.mjs` from `state/skill-registry.yaml` on 2026-11-15: 11 of 30 skills are past their freshness SLA, led by `krish-content-marketer` (42 days), `apify` (34 days), `evidence-research` (34 days), `n8n-operator` (34 days). A date moves only when a change to the skill carries Krish's ruling.
- **Credential exposure** opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`). Session closeout, one fleet list (`state/fleet.yaml`) and the North Star (`docs/NORTH_STAR.md`) are in force.

## What changed recently

- 2026-11-15 NOW.md's "Where it is right now" had grown to 39 bullets and 24,702 characters against limits of 8 and 16,000; 37 bullets rolled into the LOG, the rest condensed.
- 2026-11-14 The CLAUDE_CODE_OAUTH_TOKEN ask no longer names growth-heartside: the fleet integration audit (2026-11-14) read growth-heartside's docs-steward run 43538433695, where "Require the subscription token" succeeded and Claude ran. The steward cannot drop a done ask by itself; audit-now.mjs only warns when an ask is older than 14 days.
- 2026-11-14 The steward measured at 01:00 UTC, before the taste ledger sent its 18 repeats at 05:47, and nothing told "0 repeats" from "not read yet" (fleet integration audit, harness-1, 2026-11-14).
- 2026-11-13 Krish asked to measure the number the North Star names and to merge it (Ruling, Krish, 2026-11-13: do it all and merge to main).
- 2026-11-13 Krish, 2026-11-13, asked whether to set up a weekly Claude scheduled task in each of his two accounts or rule them not required: "readers not required". It keeps his 2026-10-29 ruling of zero Claude routines.
- 2026-11-12 Krish, 2026-11-12: "make sure everything's a cohesive system and that the project documentation is 100% up to date with absolutely nothing old or misleading left in there".
- 2026-11-12 scripts/harness-watchdog.mjs, config/harness-jobs.json, scripts/test-harness-watchdog.mjs.
- 2026-11-12 Every steward run that folded closeout notes was reported failed after its commit landed (control-center's 2026-11-12 run: 17 "was deleted" failures, nothing else); the validator now passes that run. The knowledge history check's 1 MiB buffer (ENOBUFS once brain/knowledge.jsonl passed 1 MiB) was fixed on main first by #220, so this change keeps main's fix.
- 2026-11-10 Krish ruled on the humour profile on 10 Nov; it went to the harness, not the taste ledger, because the ledger would file a model's reading of him as an uncounted observation.
- 2026-11-09 Krish, 2026-11-09: "we need to make sure everything goes through the same voice system. Absolutely everything."
- 2026-11-08 release v2026.11.08.1 was registered and LORIMER's sync of it recorded (#208); the krish-voice references answered the judge panel (PR 207).
- 2026-11-07 Krish asked for one voice, amplified by writers he admires, enforced on everything sent or posted in his name.

## What is next and what is waiting on Krish

- Next (2026-11-15): Krish says Yes or No to the proposal, and settles whether content-engine's Codex cards run where his Codex Desktop app can show them.
- Waiting on Krish: add `CONTENT_ENGINE_KEY` so the harness can confirm the digest reached the Control Center queue (not rechecked 2026-11-12; `ANTHROPIC_API_KEY` works, the judge measured pull request 209 on 2026-11-09); add `CLAUDE_CODE_OAUTH_TOKEN` to Heartside and Legibility for the nightly steward.
- Waiting on Krish: rule on `docs/harness/VPS-ROLE-2026-10-03.md` (carried forward from 2026-10-03, still open per the last record on 2026-11-13, not rechecked since 2026-10-29; the Lozatron sandbox container was stopped then), and on founder visibility (commit `88a059d`).
- Waiting on Krish (still open 2026-11-03, not rechecked): whether `tool-router` goes back on Codex from the current `candidates/tool-router`, and admission decisions for `tool-router`, `tool-economics` and `consumer-app-outcomes` (`docs/proposals/2026-10-19-tool-router.md`, `docs/proposals/2026-10-19-tool-economics.md`, `docs/proposals/2026-09-25-consumer-app-outcomes.md`); the 26 expired skill reviews; the manual cloud uploads; closing the credential-exposure lifecycle.
- North Star check (2026-11-15): holds.

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
