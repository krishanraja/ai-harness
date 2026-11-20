---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-11-20
head: fbf24ad
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

The harness is Krish's canonical cross-client AI operating layer, published in a public repository: one operating contract, one skill-routing contract, 33 curated production skills, deterministic release packaging, per-surface deployment evidence, behavioral canaries and a controlled learning path, delivered the same way to Claude, Codex and Cursor so a rule written once is enforced everywhere instead of copied by hand and left to drift.

## Who it is for and why it matters for Mindmake

This repository is not sold and carries no product name of its own; it is the infrastructure every other Mindmake surface runs on. It is the evidence behind the sales claim the rest of the fleet makes to a buyer: that AI agents can carry consistent judgment, bounded authority and verified execution across tools and sessions, not just inside one chat window. The harness proves that claim on Krish's own agents first, including its own governance of itself (it was added to the fleet the docs steward maintains on 2026-09-08 specifically so the canon repository is not exempt from the discipline it imposes on every other repo).

## Where it is right now (as of 2026-11-20)

<!-- north-star-state {"week_of":"2026-11-09","week_target":18,"current":21,"current_as_of":"2026-11-16","current_source":"state/observations: taste ledger repeats + harness correction clusters","urgency":4,"urgency_reason":"not measured: taste ledger not yet read for this week"} --> **North Star number: U4.** Corrections Krish had to give twice in a week, across the fleet: 21 in the week of 2026-11-09 (21 from the taste ledger, 0 from the harness's own corrections), measured 2026-11-16.

- Make Your Mind Up growth push: batches 1 to 3 of the skill changes are merged (#286, #288, #292): public read routes, multi-author attribution, live-copy and stranger-view checks, cold-pitch and outbound rules, dead contact routes, connector write limits, a browser fallback and long-running run safety. content-corpus's editorial channels reference says no piece makes a dated or scored prediction or carries a confidence number (Rulings, Krish, 2026-11-17 and 2026-11-18, #293). (2026-11-19)
- The canon says a product's prospecting and growth live in its growth engine (growth-mindmake, growth-makeyourmindup), carries one Divergence sentence for divergent-thinker, and carries Krish's 2026-11-16 ruling that Claude names every session it starts or spawns; the sync renders these into each fleet repository's canon block at the next release. The brand profile `skills/mindmake/references/brand-profile.md` is merged (#285). (2026-11-18)
- Every ai-harness pull request merges itself once closeout, the validation build and the judge panel are green, through `scripts/merge-bot-prs.mjs`, run when those checks finish and hourly. That includes change requests on harness/ branches; capture still never merges its own change. (2026-11-18)
- Skills 31 to 33 (`council`, `ad-copywriter`, `ugc-avatar`) are production skills; the registry says 33 and is the source. Claude owns strategy, orchestration, verification and the only writes to ai-harness and Google Drive; Codex does art direction, visual builds and browser legwork. Claude starts Codex only through `scripts/codex_thread.mjs`, which fails loudly on Windows and queues a send to a thread Codex Desktop holds (held by `scripts/test-codex-thread.mjs`). The Perplexity account text changed, so one paste is owed there. (2026-11-18)
- Branch rule in the canon block: one worktree and one branch per pull request, and a branch with no pull request after a day gets one or is removed. The weekly sweep (`.github/workflows/branch-sweep.yml`, Sunday 03:17 UTC) deletes branches whose work is already on main and lists the rest. The closeout fold takes `--now-cap <bytes>` and `--history <file>`. (2026-11-15)
- **Release, surfaces and credentials.** Read the latest approved release from `state/skill-registry.yaml` and the surface table from `CURRENT.md`, not from this line; read `state/heartbeats.json` before trusting a sync. The two supervised Claude accounts need the one-time setup, Codex Cloud an environment refresh, and `claude-secondary-cloud` is unknown. The credential exposure opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`). (2026-11-15)
- <!-- skill-review-state {"as_of":"2026-11-19","overdue":8,"total":33,"oldest":[{"name":"apify","days":38},{"name":"n8n-operator","days":38},{"name":"decision-ledger","days":37},{"name":"design-intelligence-search","days":37}]} --> **Skill review dates.** Written by `scripts/skill-reviews.mjs` from `state/skill-registry.yaml` on 2026-11-19: 8 of 33 skills are past their freshness SLA, led by `apify` (38 days), `n8n-operator` (38 days), `decision-ledger` (37 days), `design-intelligence-search` (37 days). A date moves only when a change to the skill carries Krish's ruling.
- Proposed, waiting on Krish: the canon's engine-instruction paragraph (I-13, `docs/proposals/2026-11-14-engine-instructions.md`); the krish and jonny voices' pin on krish-raja's retired names (I-08); File routing naming only folders that exist (I-15, `docs/proposals/2026-11-14-drive-truth.md`); no cold outbound routed to Instantly (#233); the canon preamble's start-marker wording. (2026-11-14)

## What changed recently

- 2026-11-20 The NOW.md audit failed again (17,151 characters against 16,000, 20 recent bullets against 12, 19 "right now" bullets against 8) because sessions add bullets and none retires one; the growth push batches were also still described as proposed after #286, #288 and #292 merged, and #285 after it merged. Both corrected, and 9 older bullets rolled into the LOG. The 2026-11-18 closeout note (name every session) was not folded because its North Star line carries text after "holds."; the fold regex allows nothing there.
- 2026-11-18 Ruling (Krish, 2026-11-18): growth-mindmake takes care of all prospecting and growth for Mindmake, which is now just the product repository; the same for growth-makeyourmindup. Ruling (Krish, 2026-11-18): all Podchaser attention goes to growth-mindmake and growth-makeyourmindup, after Pulse spent 82% of November's Podchaser points.
- 2026-11-18 Krish extended the 18 November auto-merge ruling to harness/ change requests the same day.
- 2026-11-18 Krish ruled on 18 November 2026 that ai-harness pull requests always auto-merge; until then a session's pull request waited for his merge as the release approval.
- 2026-11-18 Krish chose the pitch sentence on 18 Nov 2026 ("A is good") after rejecting "an AI that runs on their own judgement" and "argues back".
- 2026-11-18 Krish admitted docs/proposals/2026-11-18-divergent-thinker.md as written, so every repository learns when to consult the engine at the next render.
- 2026-11-17 Ruling (Krish, 2026-11-17): Claude keeps two-way access to every Codex thread it opens while Krish uses it in Desktop; fix codex_thread so this can never recur.
- 2026-11-17 The NOW.md audit failed again on size and bullet count (17,070 characters against 16,000, 22 bullets in "Where it is right now" against 8) two days after the last trim, because each session adds a bullet and none retires one; 22 bullets became 8 and the superseded ones rolled into the LOG. "Where it is right now" says where things are, so a bullet that a later bullet replaces (the staged `council` candidate, the proposal that became the ruling) goes at the next closeout.
- 2026-11-16 The canon block in AGENTS.md was synced to v2026.11.15.2 (#276), carrying "33 curated skills" after ad-copywriter and ugc-avatar were admitted as skills 32 and 33 on 2026-11-15; NOW.md still said 30, a count two admissions out of date (the registry is the source). Also folded this week: the branch sweep, the Claude and Codex division, and the codex_thread rule.

- 2026-11-15 NOW.md's "Where it is right now" had grown to 39 bullets and 24,702 characters against limits of 8 and 16,000; 37 bullets rolled into the LOG, the rest condensed.
- 2026-11-14 The CLAUDE_CODE_OAUTH_TOKEN ask no longer names growth-heartside: the fleet integration audit (2026-11-14) read growth-heartside's docs-steward run 43538433695, where "Require the subscription token" succeeded and Claude ran. The steward cannot drop a done ask by itself; audit-now.mjs only warns when an ask is older than 14 days.
- 2026-11-14 The steward measured at 01:00 UTC, before the taste ledger sent its 18 repeats at 05:47, and nothing told "0 repeats" from "not read yet" (fleet integration audit, harness-1, 2026-11-14).

## What is next and what is waiting on Krish

- Next (2026-11-18): control-center records the ruling under ## 0a of docs/MINDMAKE_OS_ARCHITECTURE.md, closing the 0a.1 prediction clause (a brief to Krish, since sessions outside control-center pass briefs rather than edit it); content-engine drops the format in its own pull request.
- Waiting on Krish: add `CONTENT_ENGINE_KEY` so the harness can confirm the digest reached the Control Center queue (not rechecked 2026-11-12; `ANTHROPIC_API_KEY` works, the judge measured pull request 209 on 2026-11-09); add `CLAUDE_CODE_OAUTH_TOKEN` to Heartside and Legibility for the nightly steward.
- Waiting on Krish: rule on `docs/harness/VPS-ROLE-2026-10-03.md` (carried forward from 2026-10-03, still open per the last record on 2026-11-13, not rechecked since 2026-10-29; the Lozatron sandbox container was stopped then), and on founder visibility (commit `88a059d`).
- Waiting on Krish (open as of the 2026-11-20 steward read; the underlying records are dated 2026-11-03 and not rechecked): whether `tool-router` goes back on Codex from the current `candidates/tool-router`, and admission decisions for `tool-router`, `tool-economics` and `consumer-app-outcomes` (`docs/proposals/2026-10-19-tool-router.md`, `docs/proposals/2026-10-19-tool-economics.md`, `docs/proposals/2026-09-25-consumer-app-outcomes.md`); the 8 overdue skill reviews (see above); the manual cloud uploads; closing the credential-exposure lifecycle.
- North Star check (2026-11-18): holds.

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
