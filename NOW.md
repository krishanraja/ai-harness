---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-09-08
head: f98ef85
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
- **Cloud governance does not depend on a machine being awake.** Rendering, validation, audit and reconciliation stay on Linux in GitHub Actions. A small Windows task now owns only machine deployment and live-client canaries, and its cloud heartbeat makes a stopped machine clock visible.
- **The measurements exist and the register does not carry them.** 19 per-skill evaluation result files sit in `state/` as loose markdown from 5 August; only two skills, `n8n-operator` and `instantly-operator`, have their numbers folded into the registry. So the file a reader consults to ask "is this skill any good" answers for two of twenty-nine. 1,374 eval cases across 59 files still run only by hand, on Windows. Seven skills are past their freshness SLA today. That is written down rather than smoothed over, which is the point.

Objection it answers: "AI agents drift, and nobody notices until something expensive happens." Here is the drift being measured.

## Where it is right now (as of 2026-09-08)

- **Live** as the canon for 29 curated skills. SURFACE's `codex-surface-07a67cda9f99` installed and byte-verified `v2026.09.08.2` on 2026-09-08. The recorded LORIMER surfaces remain on `v2026.09.08.1` until the same machine job runs there.
- **`v2026.09.08.2` is published and installed on SURFACE**, tag `harness-v2026.09.08.2` on `c5141ef`, 60 assets, 2026-09-08. Its 29 skills and 139 files match every per-skill manifest hash and the release tree aggregate `9D3F2E69...`. The verified manifest SHA-256 is `B6780D886B5B1A0688A1D7DDA29B25ED6F50B718156AEF2006632BA940F1952E`. It carries the `video-engine` launcher fix, and `v2026.09.08.1` remains the rollback target.
- **Rendered.** `scripts/render.mjs` writes the three client adapters and the canon block into all ten fleet repositories' `AGENTS.md`. Two renders from one commit are byte-identical, proven in CI. Content outside the markers is never read or written.
- **Portable.** `contract/paths.yaml` is the only file allowed to carry an absolute path. `validate-surfaces.mjs` fails if one creeps back into the canon.
- **Canaries are the instrument, as of Krish's ruling on 2026-09-08.** The trigger eval harness is deleted: `scripts/eval.mjs`, its shared router prompt, and the weekly CI job. It was measured against itself twice and failed both times, while four canaries on two Windows hosts found four real defects in an hour that 613 automated cases missed over two days. `scripts/canaries.mjs` renders a deterministic sheet per release, verifies a submitted report, and enforces the rule the failure taught: **a negative canary is void on a surface where no positive passed**, because a skill that cannot fire also cannot fire wrongly. Doctrine in `contract/canary-contract.md`. The 613 trigger cases are kept and are now the corpus canaries are selected from; the 767 behaviour cases have never been run by anything and are marked as such rather than counted.
- **The first full `v2026.09.08.2` SURFACE canary report is a recorded failure.** The live Codex client fired positives for six of seven selected skills. `design-intelligence-search` fired neither positive and is unmeasured on that surface. `take-the-brief`, `video-engine`, `mindmake-os` and `mindmake` also produced containment failures. The report is preserved in `state/canaries/`; no expected result was substituted for an observed one.
- **Machine reconciliation is automated.** `scripts/Invoke-HarnessSync.ps1` identifies the host, verifies release assets, passes the previous deployment record, plans before applying, checks parity directly, runs supported headless canaries, opens an evidence pull request and sends a heartbeat. A Windows Scheduled Task owns the local clock. Cursor canary execution remains manual because no supported headless Cursor client exposes skill invocation evidence.
- **Seven skills are past their freshness SLA**: `evidence-research`, `decision-ledger`, `tools-access`, `apify` (due 2026-09-04), `n8n-operator`, `instantly-operator` (2026-09-05), `design-intelligence-search` (2026-09-06). Expiry opens a finding; it never silently rewrites a skill.
- **Three skills have no named route**: `harness-maintainer`, `tools-access`, `apify`.
- **Two cloud surfaces are two releases behind**: `claude-cloud` and `perplexity-cloud`, both on `v2026.08.29.3`. Uploading to those is a browser action and is the one manual step in the system.
- **Two host gaps, neither ours.** Codex reports shortening skill descriptions to fit its context budget, and every trigger contract here lives in description text. The Video Engine launches under Codex on LORIMER and then cannot run, because the engine contract pins Node 24 and the host has another.

## What changed recently

- 2026-09-08 **SURFACE installed `v2026.09.08.2`, and the manual procedure became a machine job.** The release verified at 60 assets, 29 skills, 139 files, all 29 per-skill hashes and aggregate `9D3F2E69...`. `scripts/Invoke-HarnessSync.ps1` now performs governed plan, apply, parity, canary, evidence pull request and heartbeat work for the declared surfaces. The first full Codex canary report is retained as a failure, including a positive `video-engine` launch and the containment defects it exposed.

- 2026-09-08 **Canaries replace the trigger eval harness, by ruling.** Why: the harness was measured against itself twice and failed both times. Two controls over the same 120 cases moved recall 0.250 and then 0.125 between two models, with the stronger model scoring lower each time, which is a property of the prompt rather than of the skills. On the same day four canaries on two Windows hosts found a skill instructing a self-executing deletion, a direct push to another repository's main, an embedded cron schedule in canon claiming it could not go stale, and a launcher installed with byte-perfect parity that could not launch. 613 automated cases over two days found none of them. `scripts/eval.mjs` is deleted; `scripts/canaries.mjs` and `contract/canary-contract.md` take its place, and the audit now reports canary coverage instead of accuracy. The honest first number is that 28 of 29 skills have never had a positive canary fire anywhere, which is a large true number replacing a small invented one.
- 2026-09-08 **A release can no longer be approved and then unpublishable.** Why: `release.yml` fired only on a tag push, and a cloud session cannot push a tag, so `v2026.09.08.2` was approved with the launcher fix in it and could reach no machine. It now also accepts `workflow_dispatch` and creates the tag itself, with the name validation, the twice-built manifest comparison, the installer self-test and the never-overwrite rule all unchanged.

- 2026-09-08 **A launcher that could not launch, and three canaries that passed for the wrong reason.** `v2026.09.08.1` installed with perfect byte parity on four surfaces carrying `allow_implicit_invocation: false` on `video-engine`. That flag does not narrow which message starts the engine, it stops any message starting it, and on Codex it removes the skill from the discoverable catalog. SURFACE sent the exact phrase in a fresh task and nothing happened, twice, while both negative canaries passed because a skill that cannot fire also cannot fire wrongly. No cloud check found it. `audit-harness.mjs` now has an `unreachable-trigger` class, and `docs/harness/MACHINE-JOB.md` requires at least one positive canary per release.
- 2026-09-08 **The aggregate mismatch was the cloud's, not the machines'.** Two Windows hosts disagreed with `reconcile-surface.mjs` and I recorded it as the two sides walking different roots. Four independent computations agreed and the cloud was the outlier: the Node reimplementation used raw digest bytes instead of uppercase hex and no separator between records, having been written from the name of the algorithm rather than from `Get-DirectoryArtifactSha256`. It produced a stable, plausible, entirely different number, which is the worst kind of wrong. Fixed, and `scripts/check-aggregate.mjs` holds the two implementations together on every push with a differential test per axis. That test then found a third axis I had claimed was load-bearing and is not.
- 2026-09-08 **The eval numbers were invalid and were reported as real.** Accuracy of 0.67 to 0.83 was reported as describing the skills. A control proved it described the harness. Both the finding and the fix are in, and the audit now refuses the numbers rather than trusting the fix.

- 2026-09-08 **The docs steward had been failing on every push since it shipped.** `anthropics/claude-code-action@v1` accepts `schedule`, `workflow_dispatch` and the pull-request family, and refuses `push` with "Unsupported event type". Nobody read the log because the load-bearing path was fine: the nightly run reconciled `fractionl-pulse` cleanly at 22:52 UTC on 7 September. So the push trigger produced one failed run per merge and no work, which is the worst of both, noise that trains you to ignore the light. A push now runs the digest and the strict validator only, and the validator is fatal there, so a merge that breaks `NOW.md` is caught at the merge instead of eight hours later.
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

Waiting on Krish, in order of how much it blocks:

1. **Review and merge the machine automation pull request.** Until the heartbeat workflow reaches `main`, local dispatches are accepted by GitHub but cannot update the cloud clock. Run the same setup on LORIMER after merge.
2. **Rule on the recorded canary failures.** The installed bytes are correct. The live client evidence says several trigger boundaries are not, and a new release is the governed correction path.
3. **Rotate three access tokens** exposed in a chat transcript on 2026-09-08 (Supabase, Vercel, GitHub personal), and the production credential still in `mm-ctrl` git history at commit `8174677`. `FLEET_TOKEN` on this repository was minted separately and is not affected.
4. **A ruling on loose files inside two managed roots**: 62 beside `C:\Users\krish\.claude\skills` (53 third-party marketing `.md`, 9 `.skill` archives) and 11 beside `C:\Users\krish\.cursor\skills`. The installer walks directories and has never seen them, so they cannot be reported as drift.
5. **A ruling on `mm-ctrl/skills/`**, whose README still claims to be the canonical home of the five CTRL skills.
6. **Three design rulings the judge panel raised and I will not decide for you.** The panel requested changes on its own pull request and, after three real defects were fixed, three findings remain that are judgement rather than defect. Each names its clause.
   - `venture-isolation`: the personal bench binds every change in the shared canon to one venture's five jobs and revenue line. That may be exactly right, since the standard is yours and not the venture's, but nothing says so.
   - `context-pollution`: two bench criteria restate live canon rules. They now name what they mirror, which makes the duplication deliberate and visible; it does not remove it.
   - `stale-with-confidence` and `ghost-facts`: ten criteria are built on a document whose own header says it is historical and not current guidance. It is the best doctrine available and it has not been re-verified by anyone.
7. **Where the personal source snapshot may live.** `brain/benches/sources/master-ikigai-v4-2026-09-05.txt` is a verbatim capture of the Ikigai sheet, committed so a bench criterion can quote something versioned. It carries personal material. The repository is private and it is yours, and no ruling covers this.
8. **Twenty-one unapplied corrections in the operating-system Supabase**, read live on 2026-09-09. Eleven `silent_failure_pattern` rows dated 23 August to 6 September and ten `pattern_recall` rows from 24 August, all carrying a written `proposed_brief_edit` and all still awaiting approval. Four named workflows have produced silent failures continuously since 30 August, among them `System | Mindmaker OS | Silent Success Detector` and `Vera | Mindmaker OS | Feedback Aggregation`. The detector that is supposed to catch silent failure is one of the things failing silently, and the aggregation failure is the likeliest reason `feedback_queue` has been dead since July. This is operational breakage in the OS, not harness work, and it is the single most actionable thing on this list.
9. **Seven freshness reviews and three routing decisions**, listed above.

Ruled and closed on 2026-09-08: `C:\Users\krish\.agents\skills` holds 63 entries, zero canonical, nine that the routing contract forbids, and **nothing reads it**. No client config points there and no instruction file names it. The forbidden skills are inert. It stays a third-party catalog.

Next without Krish: keep recording the canary failures and let the audit age the machine clocks. Do not revive the retired trigger evaluator as authority.

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
- `surface_deployments.codex-surface-07a67cda9f99`: stale until the machine deployment evidence for `v2026.09.08.2` is folded back into the registry.
- `mm-ctrl/skills/README.md`: its claim to be "the canonical, versioned home" of the CTRL skills is contested by this repository and unresolved.
- Any individual PowerShell script as the whole maintenance procedure. `docs/harness/MACHINE-JOB.md` is the authority, and the scheduled machine path begins at `scripts/Invoke-HarnessSync.ps1`.
