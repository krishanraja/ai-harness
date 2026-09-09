---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-09-09
head: f5b6d3d
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

- **A gate that always said yes now says no.** Every judge run in this system's history reported success regardless of its own verdict, including three panel objections merged over within a minute each. The exit code that carried that lie is fixed as of 2026-09-09, and it went red on its own first change.
- **The canon reached the work only on 2026-09-08.** For months the governance was excellent and had never left the repository: no renderer existed, and the eight product repositories referenced the canon zero times. The gap between "we have standards" and "the standards are in the room where the work happens" is the whole story, and it is the same gap in most organisations.
- **Absolute paths were the tell.** 26 files carried one Windows machine's paths, including shipped canon, which meant the contract was only literally correct on one laptop. Named roots fixed it. A rule that only works in one place is not a rule, it is a habit.
- **A machine nobody had named turned out to hold the only spend cap in the fleet.** A read-only audit of the OpenClaw VPS, opened to disprove the premise that it barely did anything, found 31 cron entries, 33 gateway jobs and the live governor capping n8n execution spend. It is now a declared, heartbeated surface instead of an invisible one.
- **The measurements exist and the register does not carry them.** 19 per-skill evaluation result files sit in `state/` as loose markdown from 5 August; only two skills, `n8n-operator` and `instantly-operator`, have their numbers folded into the registry. 23 of 29 skills, including all three always-on core skills, have never had a positive canary fire on any surface. That is written down rather than smoothed over, which is the point.

Objection it answers: "AI agents drift, and nobody notices until something expensive happens." Here is the drift being measured, and now the gate that can refuse it.

## Where it is right now (as of 2026-09-09)

- **Live** as the canon for 29 curated skills, release `v2026.09.08.2` (`c5141ef`), unchanged since 2026-09-08. SURFACE (`codex-surface-07a67cda9f99`) is verified against it: 29 of 29 per-skill hashes, the 139-file aggregate, and both `video-engine` canaries fire. LORIMER's three surfaces (`cursor-primary`, `claude-code-user`, `codex-current`) remain one release behind on `.1` because `harness-sync-lorimer`, the Windows Scheduled Task that would move them, has never run once.
- **Machine reconciliation is automated end to end** (`scripts/Invoke-HarnessSync.ps1`): download, verify, plan, apply only a clean plan, canary what a client exposes headlessly, open a pull request, send a heartbeat. It found and fixed its own defects twice this week, most recently a PowerShell 5.1/7 interpolation bug LORIMER's own run exposed.
- **The judge gate can now fail a build.** Every prior run reported success regardless of its panel's verdict; the exit-code fix landed 2026-09-09 and went red on its own change first, catching a real contradiction and a missing provenance note before merge. Branch protection, the half that actually disables the merge button, is a repository setting the container cannot reach; the exact `curl` and the browser path are recorded in `docs/harness/OPEN-ON-KRISH.md`.
- **Every rule in both contracts and every skill chapter carries a provenance record**, `brain/rules.yaml`: 89 contract rules, 225 skill chapters, all `founding` because neither contract has ever carried a single `Ruling (Krish` line. `brain/proposals.jsonl` tracks whether an accepted proposal was actually applied; the first backfilled entry shows one, from 2026-08, that was merged and never applied.
- **The OpenClaw VPS is a permanently declared surface, not a retirement candidate** (Krish's ruling, 2026-09-09): 31 root cron entries, 33 gateway jobs, 196 days uptime, and the live n8n spend governor that was the reason retirement was stopped before it started. Its hourly heartbeat is installed; the first run exposed a pipeline defect that rejected its own clock, since fixed.
- **Three skills that had no named route are routed**: `harness-maintainer`, `tools-access`, `apify`, added to `contract/skill-routing-contract.md` by ruling on 2026-09-09. This closes the first case this system has measured end to end: a finding, a proposal that merged without being applied, a fresh audit that caught the gap, and an actual fix.
- **Seven skills remain past their freshness SLA**, five to seven days as of today: `evidence-research`, `decision-ledger`, `tools-access`, `apify`, `n8n-operator`, `instantly-operator`, `design-intelligence-search`. `node scripts/audit-harness.mjs` names each with its due date; expiry opens a finding and never silently rewrites a skill.
- **`docs/proposals/2026-09-09.md` is open**: repoint `decision-ledger` at `brain/decisions.jsonl`, because the Supabase `decisions` table it names has never existed (checked live against project `gojpffsrxybbpbdzzrvs`: no such table among roughly 190). `brain/stores.yaml` keeps that store's disposition at `migrate`, not `canon`, until the proposal is accepted.
- **Four credentials Krish believed rotated still authenticate with full access as of 2026-09-09**: GitHub PAT, Supabase management token, Vercel token, n8n API key, each tested live and returning 200. Plus a VPS host key needing a check on the box itself, and a plaintext Supabase service-role JWT that was in two VPS scripts and is now read at runtime rather than hardcoded, but not yet rotated. Rotation links and exact commands are in `docs/harness/OPEN-ON-KRISH.md`; no value appears in this repository.
- **Cloud upload is a supervised local action, by ruling 2026-09-09**: no phone, no hosted browser, no approval page. Krish opens his own signed-in Chrome on LORIMER and `scripts/cloud-upload.mjs` borrows the tab. `--check` has never been run against the real pages, so `verified` is null for both `claude-cloud` and `perplexity-cloud` and the upload gate stays closed until it is.

## What changed recently

- 2026-09-09 **The judge gate can finally fail a build.** Every run in its history reported success regardless of its panel's verdict, including three objections merged over within a minute each on pull requests 26, 27 and 28. The exit-0 step stays, because a step that dies takes the posting step with it, but the verdict now also fails a new final step after the review posts. Krish ruled it blocking, with his override recorded as a `Ruling (Krish, DATE):` line rather than a silent bypass (#32).
- 2026-09-09 **Three unrouted skills close a loop that had never closed before.** A 2026-08 proposal named `harness-maintainer`, `tools-access` and `apify` as unrouted, merged, and changed only itself. The 2026-09-09 audit caught that nothing was fixed; Krish ruled to route all three, drafted from each skill's own stated scope. Findings drop from 33 to 29 (#32).
- 2026-09-09 **The OpenClaw VPS stops being invisible.** A read-only audit meant to support retiring it found the opposite: 31 root cron entries, 33 gateway jobs, 196 days uptime, and a live spend governor that caps n8n execution. Krish ruled it a permanent surface. Its heartbeat is now installed, and the first run proved the receiving pipeline rejected the clock it was built to accept, fixed the same day (#29, #30, #31).
- 2026-09-09 **Every rule in the canon now says when it arrived.** `brain/rules.yaml` gives 89 contract rules and 225 skill chapters a stable id, a text hash and a source; every entry reads `founding` because neither contract has ever carried a "who decided this" line. Building it found three defects that would have made the checker lie quietly: a `git log --reverse --max-count` ordering bug that made 90 of 314 rules look untraceable, a multi-line rule matched by its first line only, and an all-digit hex hash YAML silently turned into a number. Mutation-tested: five deliberate breakages, five red runs (#25).
- 2026-09-09 **The decision ledger's store exists for the first time.** `decision-ledger` has named a Supabase `decisions` table as canonical since it was created; the table has never existed, so the skill has returned `STORE_UNAVAILABLE` for every decision Krish has ever asked it to keep. `brain/decisions.jsonl` now holds fifteen real rulings. The judge panel blocked the change as standing ahead of its own authorising proposal, correctly; `docs/proposals/2026-09-09.md` is that proposal and is still open (#29).
- 2026-09-09 **A review that got cut off used to just vanish.** Two live panel reviews were discarded outright by a truncation defect; fixed, alongside an append-only violation the panel itself caught twice (#28).
- 2026-09-08 **Loose files at a skills root are recorded, not refused.** The installer's drift guard threw on any file beside a managed skill directory, and LORIMER has 62 beside `.claude\skills` and 11 beside `.cursor\skills`, so the sync threw before measuring a single surface and the whole host stayed dark. The guard was protecting nothing, since the installer only ever replaces directories; an unknown directory still refuses. Every parity record now carries the count instead.
- 2026-09-08 **SURFACE installed `v2026.09.08.2`, and the manual procedure became a machine job.** 60 assets, 29 skills, 139 files, all 29 per-skill hashes and the aggregate verified. `scripts/Invoke-HarnessSync.ps1` now performs governed plan, apply, parity, canary, evidence pull request and heartbeat work. The first full Codex canary report is retained as a recorded failure, not smoothed to expectation.
- 2026-09-08 **Canaries replace the trigger eval harness, by ruling.** The harness was measured against itself twice and failed both times: recall moved 0.250 then 0.125 between two models on the same 120 cases, the stronger model scoring lower each time. On the same day four canaries on two Windows hosts found a self-executing deletion instruction, a direct push to another repository's main, a cron schedule embedded in canon claiming it could not go stale, and a launcher that could not launch, none of which 613 automated cases caught over two days. `scripts/eval.mjs` is deleted.
- 2026-09-08 **A launcher that could not launch.** `v2026.09.08.1` installed with perfect byte parity on four surfaces while `video-engine` carried `allow_implicit_invocation: false`, which does not narrow the trigger, it removes the skill from the discoverable catalog entirely. Two negative canaries passed for the wrong reason: a skill that cannot fire also cannot fire wrongly. Fixed in `.2`.
- 2026-09-08 **The eval numbers were invalid and were reported as real.** Accuracy of 0.67 to 0.83 was reported as describing the skills; a control proved it described the harness instead. Both the finding and the fix are recorded, and the audit now refuses the numbers rather than trusting the fix.
- 2026-09-08 **The docs steward had been failing on every push since it shipped**, because `anthropics/claude-code-action@v1` refuses the `push` event outright. A push now runs the digest and the strict validator only, fatal there, so a broken `NOW.md` is caught at the merge instead of eight hours later.
- 2026-09-08 **The reconciler and the harness audit went live**, both nightly and neither able to overwrite an edit made inside the canon markers; an edit becomes a proposal instead, proven live against `contentarchives` (issue #3).
- 2026-08-29 **Release `v2026.08.29.3` deployed** to every reachable local and cloud surface, hash-verified, 29 skills (`state/release-v2026.08.29.3-deployment-2026-08-29.md`).
- 2026-08-20 **`harness-maintainer` reviewed** and the release-candidate reconciliation path proven (`state/release-candidate-333f735-reconciliation-2026-08-20.md`).

## What is next and what is waiting on Krish

Waiting on Krish, in order of how much it blocks:

1. **Apply branch protection to `main`.** The judge gate now computes a real verdict and fails its own step on it, but nothing stops a merge yet: the container's proxy refuses write access to the branch-protection API. The exact `curl` and the browser path (Settings, Branches, require `judge` and `surfaces`) are in `docs/harness/OPEN-ON-KRISH.md`. `enforce_admins` should stay `false`, so an override remains possible and is recorded as a `Ruling (Krish, DATE):` line rather than silent.
2. **Rotate what is still live despite being reported rotated.** Four credentials tested 2026-09-09 and all returned full access: GitHub PAT, Supabase management token, Vercel token, n8n API key. Plus the VPS host key (check `authorized_keys` on the box) and the production credential still in `mm-ctrl` git history at commit `8174677`. `FLEET_TOKEN` on this repository was minted separately and is unaffected.
3. **Accept or reject `docs/proposals/2026-09-09.md`**, repointing `decision-ledger` at `brain/decisions.jsonl` now that the Supabase store it has always named turns out never to have existed.
4. **Run `scripts/Invoke-HarnessSync.ps1` once on LORIMER.** It has never run there; that is why `harness-sync-lorimer` reads as a never-started clock and why three surfaces sit one release behind. Under 14 days of being declared this reads as a pending install; past 14 days it escalates to an unmade decision.
5. **Decide `session-feed`**: create the Routine that would collect Claude Code session metadata, or remove it from the expected clocks with a recorded reason. Three weekly Routines were already disabled in September for failing silently, so standing a new one up is deliberately not automated.
6. **Run `scripts/cloud-upload.mjs --check`** against both cloud surfaces from a supervised LORIMER session before the first real `--upload`; the page selectors have never been run against the live pages, so `verified` is null for both and the gate stays shut.
7. **Triage the 122 active rows in `standards_registry`** against the 314 entries in `brain/rules.yaml`. Untouched since 31 May, supersedes never used once, 6 of 169 rows ever hit, zero efficacy checks. `node scripts/audit-harness.mjs` names this the highest-value item in the file, unprompted. The em dash rule is the known twin and the first one worth resolving in one direction.
8. **Three more stores `brain/stores.yaml` says belong in the brain and have not moved**: `canon_documents.krish-canon` (a second canon covering identity, positioning and a decision log), the Assumption Ledger the canon instructs agents to maintain and no store currently holds, and the migration risk list from the VPS audit itself.
9. **Three design rulings the judge panel keeps raising, correctly, and nothing in code can settle**: whether the personal bench binding every canon change to one venture's revenue line is right (`venture-isolation`); whether two bench criteria restating live canon rules is acceptable now that they name what they mirror (`context-pollution`); whether ten bench criteria may keep resting on a document whose own header calls it historical (`stale-with-confidence`, `ghost-facts`).
10. **Whether the judge panel posting a review breaches the approval wall.** The panel raises this against itself, blocking, because it posts autonomously on every canon-touching change. The counter-argument is that the steward already opens pull requests and issues the same way. Not decided; the posting has not been disabled.
11. **Whether the brain itself needed asking before it was built.** The panel's `building-unasked` finding has no code fix: its only named asker is the ruling of 2026-09-09 that authorised it, and the panel is designed to dissent by default on a subsystem this new.
12. **Where the personal source snapshot may live.** `brain/benches/sources/master-ikigai-v4-2026-09-05.txt` is a verbatim capture of a private sheet, committed so a bench criterion can quote something versioned. No ruling covers this yet.
13. **Twenty-one unapplied corrections in the operating-system Supabase**, read live on 2026-09-09: eleven `silent_failure_pattern` rows and ten `pattern_recall` rows, all carrying a written `proposed_brief_edit` and all still awaiting approval. Four named workflows have produced silent failures continuously since 30 August. This is operational breakage in the OS, not harness work, and remains the single most actionable item outside this repository.
14. **Seven freshness reviews**, listed above, plus the four description-budget skills (`krish-design`, `build-apps-with-krish`, `ctrl-intake`, `krish-voice`) whose negative trigger conditions sit at the end of a description a truncating client cuts first.

Ruled and closed this session: loose files at a skills root are recorded, not refused (2026-09-08); the three unrouted skills are routed (2026-09-09); `standards_registry`'s zero-em-dash rule question is unchanged and still open, listed at item 7. Ruled and closed 2026-08-08: `C:\Users\krish\.agents\skills` holds 63 entries, zero canonical, nothing reads it, stays a third-party catalog.

Next without Krish: keep recording canary and heartbeat evidence as it arrives, and let the audit age the machine clocks. Do not revive the retired trigger evaluator as authority.

## Read next

1. `contract/krish-operating-contract.md`: authority, verification, truth and freshness, secrets, file routing. When anything here disagrees with it on cross-cutting doctrine, it wins.
2. `contract/skill-routing-contract.md`: which skill runs, in what order, and which apparent matches to ignore.
3. `contract/active-skill-quality-standard.md`: the ten gates a skill passes before it is production.
4. `state/skill-registry.yaml`: the live register of skills, releases and surfaces. Machine-owned; read it, do not write it.
5. `state/fleet.yaml` and `contract/paths.yaml`: every surface the canon reaches, including the OpenClaw VPS, and the only place a machine path lives.
6. `brain/README.md`: the provenance and decision layers, what is curated versus raw, and the rules that keep them append-only.
7. `docs/harness/OPEN-ON-KRISH.md`: the exact commands for what only Krish can do from outside the container, ordered by what breaks if they are not done.
8. `docs/harness/MACHINE-JOB.md`: the authoritative machine procedure, including the automated sync and the supervised cloud-upload path.
9. `AGENTS.md`: the entry file, carrying the canon block that every other repository also carries.
10. `node scripts/audit-harness.mjs`: what is wrong with the harness today, measured rather than asserted.

## Do not trust

- Any `reviewed` date in `state/skill-registry.yaml` older than its `freshness_sla_days`. Seven are expired today; they are findings, not facts.
- The absence of an `evaluation_evidence` row read as "not measured". For 19 skills it means measured on 5 August and never filed.
- `brain/stores.yaml`'s `decision-ledger-store` entry reading `migrate`: the store now exists at `brain/decisions.jsonl` and is populated, but the disposition stays `migrate` rather than `canon` until `docs/proposals/2026-09-09.md` is accepted.
- `surface_deployments` for `cursor-primary`, `claude-code-user` and `codex-current` in `state/skill-registry.yaml`: still `v2026.09.08.1` and will read stale until `harness-sync-lorimer` runs once.
- `mm-ctrl/skills/README.md`: its claim to be "the canonical, versioned home" of the CTRL skills is contested by this repository and unresolved.
- Any individual PowerShell script as the whole maintenance procedure. `docs/harness/MACHINE-JOB.md` is the authority.
