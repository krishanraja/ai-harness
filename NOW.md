---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-09-08
head: ad65407
lifecycle: live
production_url: none
state_doc: state/skill-registry.yaml
history_log: docs/history/LOG.md
truth_files: [state/skill-registry.yaml, state/fleet.yaml, contract/paths.yaml]
authority_order: [state/skill-registry.yaml, contract/krish-operating-contract.md, contract/skill-routing-contract.md, contract/active-skill-quality-standard.md, README.md]
steward: https://github.com/krishanraja/control-center/blob/main/docs/steward/RUNBOOK.md
never_publish: [any machine name or surface id, any absolute path from a personal machine, the contents of any eval case, any credential name]
---
# The harness: where it is right now

## What it is

The harness is the single canon every AI agent Krish uses reads from, whichever machine, client or cloud it runs in. It holds one operating contract (authority, verification, truth and freshness, secrets), one routing contract that decides which of the 29 curated skills runs and which apparent matches to ignore, one quality standard that is the admission bar for the curated set, and the skills themselves. Everything else is rendered from it: the Claude, Codex and Cursor adapters, and the canon block that now sits inside every fleet repository's `AGENTS.md`. It is not a prompt library. It is the governed layer that stops nine repositories and four clients each inventing their own idea of what Krish wants.

## Who it is for and why it matters for Mindmake

The harness is not sold and never will be. It is the reason the rest can be. The room_face buyer (`control-center/docs/ICP.md`: a senior leader at a PE or VC backed media, adtech, publishing or data business, quietly behind on what is coming and unable to say so inside their organisation) is being asked to believe that one person can run a portfolio on AI agents without losing control of them. Control Center is the dashboard that proves the agents are quiet. This repository is the answer to the harder question underneath: what stops them drifting.

Angles a writer can use without asking Krish:

- **The instructions are versioned like code, not typed into a chat.** Every skill has an owner, a reviewed date, a freshness SLA, a named route and a status. Nothing is always-on because it claims to be; it is always-on because the router says so.
- **The canon reached the work only on 2026-09-08.** For months the governance was excellent and had never left the repository: no renderer existed, and the eight product repositories referenced the canon zero times. The gap between "we have standards" and "the standards are in the room where the work happens" is the whole story, and it is the same gap in most organisations.
- **Absolute paths were the tell.** 26 files carried one Windows machine's paths, including shipped canon, which meant the contract was only literally correct on one laptop. Named roots fixed it. A rule that only works in one place is not a rule, it is a habit.
- **Nothing here trusts a machine being awake.** Every scheduled job runs in the cloud on Linux with no browser and no local dependency. Machines pull releases and report parity back; they are never pushed to.
- **The measurements exist and the register does not carry them.** 19 per-skill evaluation result files sit in `state/` as loose markdown from 5 August; only two skills, `n8n-operator` and `instantly-operator`, have their numbers folded into the registry. So the file a reader consults to ask "is this skill any good" answers for two of twenty-nine. 1,374 eval cases across 59 files still run only by hand, on Windows. Seven skills are past their freshness SLA today. That is written down rather than smoothed over, which is the point.

Objection it answers: "AI agents drift, and nobody notices until something expensive happens." Here is the drift being measured.

## Where it is right now (as of 2026-09-08)

- **Live** as the canon for 29 curated skills at release `v2026.08.29.3`, with deterministic packaging (`sha256-path-nul-file-sha256-ordinal-v1`) and CI on every push (`.github/workflows/validate.yml`, `release.yml`, both `windows-latest`).
- **Rendered, since 2026-09-08.** `scripts/render.mjs` writes the three client adapters from `contract/templates/`, and the canon block into all nine fleet repositories' `AGENTS.md`. Two renders from one commit are byte-identical, proven in `harness-steward.yml`. Content outside the markers is never read or written.
- **Portable, since 2026-09-08.** `contract/paths.yaml` is the only file allowed to carry an absolute path, with three surfaces defined: `windows-primary`, `windows-codex`, `cloud-linux`. `validate-surfaces.mjs` fails if one creeps back into the canon.
- **In the docs steward fleet, since 2026-09-08.** This file and `docs/history/LOG.md` are maintained the same way the other eight repositories are. The registry is a truth file: the steward reads it and never writes it.
- **Waiting on evidence, not code**: 27 of 29 skills have no `evaluation_evidence` row in the registry, though 19 have result files in `state/` that were never folded in. The 1,374 eval cases in `evals/` run only by hand, on Windows, against `claude.exe`.
- **Seven skills are past their freshness SLA** as of today: `evidence-research`, `decision-ledger`, `tools-access`, `apify` (all due 2026-09-04), `n8n-operator`, `instantly-operator` (2026-09-05) and `design-intelligence-search` (2026-09-06). Expiry opens a finding; it never silently rewrites a skill.
- **A known surface gap**: `codex-surface-07a67cda9f99` sits on `v2026.08.29.1` while the fleet is on `v2026.08.29.3`. It is recorded rather than silently reconciled, because it is a machine this repository cannot see.
- **Two ungoverned runtime skills** (`gladstone-ledger-update`, `import-memory`) appear in no registry section, and the five CTRL skills exist both here and in `mm-ctrl/skills/`, whose README still claims to be the canonical home. Both are queued for the reconciler.

## What changed recently

- 2026-09-08 **The reconciler: changes flow both ways.** `scripts/reconcile.mjs` reads every fleet repository's block nightly and classifies it as `exact`, `canon-moved`, `inbound-edit`, `both-moved` or `missing`, arithmetically, because the marker carries the sha256 of the body it introduces. Canon movement opens one pull request per repository. An edit made inside the markers is never overwritten: it becomes a proposal on this repository carrying the diff, deduped by target so a nightly run does not file the same thing thirty times. Proven live: a block edited in `contentarchives`, the reconciler run against it, the edit still on `main` afterwards, the proposal filed as issue #3, a second run correctly filing nothing.
- 2026-09-08 **The harness audits itself.** `scripts/audit-harness.mjs` measures the canon against its own quality standard nightly and writes findings, never edits. First run found twelve: seven skills past their freshness SLA, three registry skills with no named route (`harness-maintainer`, `tools-access`, `apify`), one Codex surface two releases behind, and evaluation evidence in the registry for two skills of twenty-nine.
- 2026-09-08 **Two machine paths found in skills, not just in the canon.** `mindmake-os` line 38 and `video-engine` line 21 still carried one Windows machine's absolute paths after Part A cleaned the contract. Both now resolve a named root, and the audit checks every skill for it.
- 2026-09-08 **A correction to this file.** It claimed trigger accuracy read `unmeasured` for all 29 skills. That was inherited from a plan document rather than read from the registry. The truth is worse and more specific: 19 per-skill evaluation result files were written on 5 August and never folded into the registry, so the register a reader consults answers for two skills of twenty-nine.
- 2026-09-08 **One canon, every surface** (`ad65407`). Why: the canon had never reached a product repository. There was no renderer, the three adapters were hand-maintained near-duplicates guarded only by five substring checks, and 26 files carried one machine's absolute paths. The adapters now render byte-identically to what they replace, plus one new rule: record a Krish ruling in the commit body, because those lines are the corpus the harness learns from.
- 2026-09-08 **The canon block reached all nine repositories.** Marker-delimited, stamped with the sha256 of its own body, so an in-place edit is arithmetic to detect and becomes a proposal rather than an overwrite. Seven repositories had no agent entry file at all before this.
- 2026-09-08 **Two stewards, disjoint territory.** The docs steward's validator now fails if anything edits between the `krish-canon` markers, and the harness validator warns when it finds one. Neither can quietly write in the other's file.
- 2026-08-29 **Release `v2026.08.29.3` deployed** to every reachable local and cloud surface, hash-verified, 29 skills (`state/release-v2026.08.29.3-deployment-2026-08-29.md`).
- 2026-08-29 **Codex surface reconciled** at `v2026.08.29.1` and canaried (`state/reconciliation-codex-surface-07a67cda9f99-2026-08-29.md`). It has not moved since, which is the gap named above.
- 2026-08-20 **`harness-maintainer` reviewed** and the release-candidate reconciliation path proven (`state/release-candidate-333f735-reconciliation-2026-08-20.md`).

## What is next and what is waiting on Krish

- Next: the observer, which collates `Ruling (Krish, YYYY-MM-DD):` lines from commit bodies across the fleet, session metadata, inbound edits and machine reports into an append-only ledger, and turns recurring evidence into one proposal a week.
- Waiting on Krish: `CLAUDE_CODE_OAUTH_TOKEN` on this repository and on `AEO-Engine`, and `FLEET_TOKEN` here (a fine-grained PAT with contents and pull-requests write on the ten fleet repositories) so the reconciler can run unattended. Then: seven skills need a review pass to clear their freshness SLA; three skills need a route or retirement; `mm-ctrl/skills/` needs a ruling on whether it becomes a pointer or keeps a genuine fork.

## Read next

1. `contract/krish-operating-contract.md`: authority, verification, truth and freshness, secrets, file routing. When anything here disagrees with it on cross-cutting doctrine, it wins.
2. `contract/skill-routing-contract.md`: which skill runs, in what order, and which apparent matches to ignore.
3. `contract/active-skill-quality-standard.md`: the ten gates a skill passes before it is production.
4. `state/skill-registry.yaml`: the live register of skills, releases and surfaces. Machine-owned; read it, do not write it.
5. `state/fleet.yaml` and `contract/paths.yaml`: every surface the canon reaches, and the only place a machine path lives.
6. `AGENTS.md`: the entry file, carrying the canon block that every other repository also carries.
7. `README.md`: what the repository is, how a release is built and installed.
8. `node scripts/audit-harness.mjs`: what is wrong with the harness today, measured rather than asserted.

## Do not trust

- Any `reviewed` date in `state/skill-registry.yaml` older than its `freshness_sla_days`. Seven are expired today; they are findings, not facts.
- The absence of an `evaluation_evidence` row read as "not measured". For 19 skills it means measured on 5 August and never filed. `node scripts/audit-harness.mjs` names which is which.
- `surface_deployments.codex-surface-07a67cda9f99`: correct as of 2026-08-29 and two releases behind since.
- `mm-ctrl/skills/README.md`: its claim to be "the canonical, versioned home" of the CTRL skills is contested by this repository and unresolved.
- The seven PowerShell scripts in `scripts/` as a description of how the harness is maintained. They still build, test and install releases on Windows, but nothing scheduled depends on them any more.
