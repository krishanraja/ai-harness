---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-11-24
head: 770cc3d
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

## Where it is right now (as of 2026-11-24)

<!-- north-star-state {"week_of":"2026-11-16","week_target":18,"current":28,"current_as_of":"2026-11-24","current_source":"state/observations: taste ledger repeats + harness correction clusters","urgency":4,"urgency_reason":"not measured: taste ledger not yet read for this week"} --> **North Star number: U4.** Corrections Krish had to give twice in a week, across the fleet: 28 in the week of 2026-11-16 (28 from the taste ledger, 0 from the harness's own corrections), measured 2026-11-24.

- canon sync, the seeder, the publisher and the central docs steward no longer write to OLD-ctrl-mindmake (the mm-ctrl entry), contentarchives or the dormant fractionl-circle: each carries canon_sync false with Krish's ruling, and stays listed for parity and readable history. (2026-11-24)
- brain-rules.mjs --revise no longer drops source digests: every sha256 already in the ledger is kept on its row, history rows included, and a new proposal source is pinned to its document as it stands (uppercase SHA-256, the ledger's form since 2026-11-18). Three judge findings on ai-harness#305 came from this. (2026-11-24)
- state/fleet.yaml carries a registry of every repository Krish owns (scope, layer, role, venture, and what each in-scope one can do, how to call it and when); its rendering, krish-principles references/capabilities.md, is the neighbours table every canon block now tells sessions to read before building or deciding. (2026-11-24)
- the contract lets internal-auditor merge every fleet repository's green pull request by Krish or his bots, close superseded bot pull requests and file a fix issue for a red one. (2026-11-24)
- A merged change to the canon block now releases itself, as skill changes already did; the folder-report rule (sessions report folder changes in Krish's Drive or dev folders to filearchives, with his words) was released by hand as v2026.11.24.1. (2026-11-24)
- The operating contract says internal-auditor's own fix pull requests merge themselves once every check is green at the head the fix queue checked, with a red, conflicted or unchecked fix labelled needs-krish; the canon sends his preferences to the taste engine and defects to record_harness_observation. ai-harness keeps its own judged merge bot. (2026-11-23)
- krishanraja/internal-auditor and krishanraja/strategist joined the fleet (state/fleet.yaml, docs/steward/fleet.json), excluded from the repository administration publisher until Krish accepts them there. The contracts carry the auditor's standing exception (close pull requests and delete branches idle 7 days or more, recording each head sha first, never the default, a protected or a kept branch) and the strategist convening the council as the weekly board. Proposal: docs/proposals/2026-11-23-auditor-and-strategist.md. (2026-11-23)
- Every ai-harness pull request, change requests on harness/ branches included, merges itself once closeout, the validation build and the judge panel are green (`scripts/merge-bot-prs.mjs`); capture never merges its own change. The Claude and Codex division is in force: Claude owns strategy, verification and the only writes to ai-harness and Google Drive, and starts Codex only through `scripts/codex_thread.mjs`. (2026-11-18)
- Branch rule in the canon block: one worktree and one branch per pull request; the weekly sweep (`.github/workflows/branch-sweep.yml`, Sunday 03:17 UTC) deletes branches whose work is already on main and lists the rest. Skills 31 to 33 (`council`, `ad-copywriter`, `ugc-avatar`) are production skills; the registry says 33. (2026-11-15)
- **Release, surfaces and credentials.** Read the latest approved release from `state/skill-registry.yaml` and the surface table from `CURRENT.md`, not from this line; read `state/heartbeats.json` before trusting a sync. The two supervised Claude accounts need the one-time setup, Codex Cloud an environment refresh, and `claude-secondary-cloud` is unknown. The credential exposure opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`). (2026-11-15)
- <!-- skill-review-state {"as_of":"2026-11-24","overdue":8,"total":33,"oldest":[{"name":"apify","days":43},{"name":"n8n-operator","days":43},{"name":"decision-ledger","days":42},{"name":"design-intelligence-search","days":42}]} --> **Skill review dates.** Written by `scripts/skill-reviews.mjs` from `state/skill-registry.yaml` on 2026-11-24: 8 of 33 skills are past their freshness SLA, led by `apify` (43 days), `n8n-operator` (43 days), `decision-ledger` (42 days), `design-intelligence-search` (42 days). A date moves only when a change to the skill carries Krish's ruling.
- Proposed, waiting on Krish: the canon's engine-instruction paragraph (I-13, `docs/proposals/2026-11-14-engine-instructions.md`); the krish and jonny voices' pin on krish-raja's retired names (I-08); File routing naming only folders that exist (I-15, `docs/proposals/2026-11-14-drive-truth.md`); no cold outbound routed to Instantly (#233); the canon preamble's start-marker wording. (2026-11-14)

## What changed recently

- 2026-11-24 Ruling (Krish, 2026-11-24): every repository knows what the others can do, so collaboration is proactive at all times.
- 2026-11-24 Ruling (Krish, 2026-11-24): all repos should also be auto merge; the auditor merges centrally.
- 2026-11-24 Krish ruled that everything should happen automatically.
- 2026-11-24 Krish asked that every repository report folder changes to filearchives.
- 2026-11-23 Ruling (Krish, 2026-11-23): all auditor fixes auto merge. Ruling (Krish, 2026-11-23): merge and deploy.
- 2026-11-23 Krish ruled that the taste system holds only preference and inspiration.
- 2026-11-23 Ruling (Krish, 2026-11-16): whenever Claude starts or spawns a session Krish can open, it tells him that session's exact name in the same message. A session Krish cannot find is work he cannot steer, so this removes a repeat correction.
- 2026-11-23 Ruling (Krish, 2026-11-23): internal-auditor may close pull requests and delete branches idle 7 days or more, recording each head sha in its restore ledger first.

## What is next and what is waiting on Krish

- Next (2026-11-24): admit ctrl-mindmake, the live CTRL repository, as a canon surface, after reading its own entry and rules files.
- Waiting on Krish: add `CONTENT_ENGINE_KEY` so the harness can confirm the digest reached the Control Center queue (not rechecked 2026-11-12; `ANTHROPIC_API_KEY` works, the judge measured pull request 209 on 2026-11-09); add `CLAUDE_CODE_OAUTH_TOKEN` to Heartside and Legibility for the nightly steward.
- Waiting on Krish: rule on `docs/harness/VPS-ROLE-2026-10-03.md` (carried forward from 2026-10-03, still open per the last record on 2026-11-13, not rechecked since 2026-10-29; the Lozatron sandbox container was stopped then), and on founder visibility (commit `88a059d`).
- Waiting on Krish (carried forward from 2026-11-03, unverified since; reviewed for this page 2026-11-24): whether `tool-router` goes back on Codex from the current `candidates/tool-router`, and admission decisions for `tool-router`, `tool-economics` and `consumer-app-outcomes` (`docs/proposals/2026-10-19-tool-router.md`, `docs/proposals/2026-10-19-tool-economics.md`, `docs/proposals/2026-09-25-consumer-app-outcomes.md`); the expired skill reviews (8 of 33, per the Skill review dates line above); the manual cloud uploads; closing the credential-exposure lifecycle.
- North Star check (2026-11-24): holds.

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
