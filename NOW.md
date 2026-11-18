---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-11-18
head: 4e71e38
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

## Where it is right now (as of 2026-11-18)

<!-- north-star-state {"week_of":"2026-11-09","week_target":18,"current":21,"current_as_of":"2026-11-16","current_source":"state/observations: taste ledger repeats + harness correction clusters","urgency":4,"urgency_reason":"not measured: taste ledger not yet read for this week"} --> **North Star number: U4.** Corrections Krish had to give twice in a week, across the fleet: 21 in the week of 2026-11-09 (21 from the taste ledger, 0 from the harness's own corrections), measured 2026-11-16.

- Every session pull request in ai-harness now merges itself once closeout, the validation build and the judge panel are green, through scripts/merge-bot-prs.mjs, run when those checks finish and hourly; change requests on harness/ branches still wait for Krish. (2026-11-18)
- Batch 2 of the Make Your Mind Up growth push findings is proposed as skill changes: contact routes confirmed from the live page (evidence-research), the channel decides the register and a route change means a rewrite, plus "humour engine not run" (krish-voice), sub-sessions, fan-out sizing, resume and shared-machine hygiene (krish-build long-running run safety), and a browser fallback rule (tool-router public read routes). Proposal: docs/proposals/2026-11-18-growth-push-batch-2.md. (2026-11-18)
- The operating contract now records that every ai-harness pull request auto-merges once its checks, the judge panel included, pass. Krish no longer merges harness changes by hand. Batch 1 of the growth push skill changes is merged (#286). (2026-11-18)
- Batch 1 of the Make Your Mind Up growth push findings is proposed as skill changes, waiting on Krish's merge: public read routes for engagement (tool-router reference), multi-author attribution (evidence-research), live-copy and stranger-view checks (verification-loop), a cold pitch to a named writer (krish-voice outbound reference), and the handover rule that keeps next-session texts where the next session runs (operating contract). (2026-11-18)
- `skills/mindmake/references/brand-profile.md` is proposed in PR #285 and waits on Krish: the judge panel held it because a blanket merge instruction is not his approval of this content. It carries the one sentence he chose that day (option A), the four lanes, the need-to-offer table, proof in order and the open decisions. `commercial-canon.md` points to it. The working pack with every proposal and decision is krishanraja/mindmake `project-documentation/krishs-mission/`. (2026-11-18)
- divergent-thinker is in the canon and the skill layer: one Divergence sentence in the canon block, and one line each in strategy-brief, krish-principles, build-apps-with-krish, krish-design and tool-router, with their entries in brain/rules.yaml. (2026-11-18)
- codex_thread no longer fails silently on Windows (it runs the native codex.exe, and every spawn failure or early exit is a non-zero exit with a one-line reason), and `send` to a thread Codex Desktop holds is queued with `codex queue` and runs there as the next turn, with `--wait` to get Codex's reply; proven on a throwaway thread on Krish's PC and held by `scripts/test-codex-thread.mjs` in the steward. (2026-11-17)
- Skills 31 to 33 (`council`, `ad-copywriter`, `ugc-avatar`) are admitted as production skills on Krish's rulings of 2026-11-15; the registry says 33 and is the source. `ugc-avatar` holds every AI person to Krish's two yeses, recorded each time, with no AI label anywhere. The Claude and Codex division is in force (#263): Claude owns strategy, orchestration, verification and the only writes to ai-harness and Google Drive; Codex does art direction, visual builds and browser legwork. The Perplexity account text changed, so one paste is owed there. (2026-11-15)
- Claude starts Codex only through `scripts/codex_thread.mjs` (canonical here), from a session on Krish's computer when he must see or share it; a start failure is reported in one line, never worked around by editing MCP or Claude settings. Content production runs as Codex cards from the cloud and is never shown in Codex Desktop; social media legwork runs from a Claude session on his computer, visible there (Ruling, Krish, 2026-11-15). `scripts/codex-thread-copies.mjs` reads every fleet copy. (2026-11-15)
- Branch rule in the canon block: one worktree and one branch per pull request, and a branch with no pull request after a day gets one or is removed. The weekly sweep (`.github/workflows/branch-sweep.yml`, Sunday 03:17 UTC) deletes branches whose work is already on main and lists the rest; a hand run takes an approved `branch@sha` list. The weekly digest lists every kept branch (`scripts/kept-branches.mjs`); a read-only run on 2026-11-15 found 122 kept branches in 11 of 16 swept repositories, 86 needing Krish. (2026-11-15)
- The closeout fold takes an optional `--now-cap <bytes>` and `--history <file>` (default `docs/history/LOG.md`): it moves the oldest dated status lines under "Where it is right now" to the history file until NOW.md fits; with no flag it behaves as before. (2026-11-15)
- The OpenClaw fleet runs on the worker server (Hetzner, Helsinki) since 20:08 UTC on 14 Nov; the old box was deleted that night on Krish's ruling, with a Hetzner snapshot as the only rollback, and 12 jobs were retired by name. The T0 report is in `state/vps/MIGRATION-2026-11-14.md`. (2026-11-14)
- **Release, surfaces and credentials.** Read the latest approved release from `state/skill-registry.yaml` and the surface table from `CURRENT.md`, not from this line; read `state/heartbeats.json` before trusting a sync. The two supervised Claude accounts need the one-time setup, Codex Cloud an environment refresh, and `claude-secondary-cloud` is unknown. The credential exposure opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`). (2026-11-15)
- <!-- skill-review-state {"as_of":"2026-11-18","overdue":11,"total":33,"oldest":[{"name":"apify","days":37},{"name":"evidence-research","days":37},{"name":"n8n-operator","days":37},{"name":"decision-ledger","days":36}]} --> **Skill review dates.** Written by `scripts/skill-reviews.mjs` from `state/skill-registry.yaml` on 2026-11-18: 11 of 33 skills are past their freshness SLA, led by `apify` (37 days), `evidence-research` (37 days), `n8n-operator` (37 days), `decision-ledger` (36 days). A date moves only when a change to the skill carries Krish's ruling.
- Proposed, waiting on Krish: the canon's engine-instruction paragraph (I-13, `docs/proposals/2026-11-14-engine-instructions.md`); the krish and jonny voices' pin on krish-raja's retired names (I-08); File routing naming only folders that exist (I-15, `docs/proposals/2026-11-14-drive-truth.md`); no cold outbound routed to Instantly (#233); the canon preamble's start-marker wording. (2026-11-14)

## What changed recently

- 2026-11-18 Krish ruled on 18 November 2026 that ai-harness pull requests always auto-merge; until then a session's pull request waited for his merge as the release approval.
- 2026-11-18 Krish chose the pitch sentence on 18 Nov 2026 ("A is good") after rejecting "an AI that runs on their own judgement" and "argues back".
- 2026-11-18 Krish admitted docs/proposals/2026-11-18-divergent-thinker.md as written, so every repository learns when to consult the engine at the next render.
- 2026-11-17 Ruling (Krish, 2026-11-17): Claude keeps two-way access to every Codex thread it opens while Krish uses it in Desktop; fix codex_thread so this can never recur.
- 2026-11-17 The NOW.md audit failed again on size and bullet count (17,070 characters against 16,000, 22 bullets in "Where it is right now" against 8) two days after the last trim, because each session adds a bullet and none retires one; 22 bullets became 8 and the superseded ones rolled into the LOG. "Where it is right now" says where things are, so a bullet that a later bullet replaces (the staged `council` candidate, the proposal that became the ruling) goes at the next closeout.
- 2026-11-16 The canon block in AGENTS.md was synced to v2026.11.15.2 (#276), carrying "33 curated skills" after ad-copywriter and ugc-avatar were admitted as skills 32 and 33 on 2026-11-15; NOW.md still said 30, a count two admissions out of date (the registry is the source). Also folded this week: the branch sweep, the Claude and Codex division, and the codex_thread rule.

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

- Next (2026-11-18): Krish says whether "100%" also covers the harness/ change requests and learning reviews.
- Waiting on Krish: add `CONTENT_ENGINE_KEY` so the harness can confirm the digest reached the Control Center queue (not rechecked 2026-11-12; `ANTHROPIC_API_KEY` works, the judge measured pull request 209 on 2026-11-09); add `CLAUDE_CODE_OAUTH_TOKEN` to Heartside and Legibility for the nightly steward.
- Waiting on Krish: rule on `docs/harness/VPS-ROLE-2026-10-03.md` (carried forward from 2026-10-03, still open per the last record on 2026-11-13, not rechecked since 2026-10-29; the Lozatron sandbox container was stopped then), and on founder visibility (commit `88a059d`).
- Waiting on Krish (still open 2026-11-03, not rechecked): whether `tool-router` goes back on Codex from the current `candidates/tool-router`, and admission decisions for `tool-router`, `tool-economics` and `consumer-app-outcomes` (`docs/proposals/2026-10-19-tool-router.md`, `docs/proposals/2026-10-19-tool-economics.md`, `docs/proposals/2026-09-25-consumer-app-outcomes.md`); the 26 expired skill reviews; the manual cloud uploads; closing the credential-exposure lifecycle.
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
