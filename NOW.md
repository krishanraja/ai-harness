---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-09-25
head: 1137278
lifecycle: live
production_url: none
state_doc: state/skill-registry.yaml
history_log: docs/history/LOG.md
truth_files: [state/skill-registry.yaml, state/fleet.yaml, contract/paths.yaml]
authority_order: [live target readback for volatile external state, state/skill-registry.yaml, state/heartbeats.json, contract/krish-operating-contract.md, contract/skill-routing-contract.md, contract/active-skill-quality-standard.md, CURRENT.md, README.md]
steward: https://github.com/krishanraja/control-center/blob/main/docs/steward/RUNBOOK.md
---
# The harness: where it is right now

## What it is

The harness is Krish's canonical, private cross-client AI operating layer: one operating contract, one skill-routing contract, 29 curated production skills, deterministic release packaging, per-surface deployment evidence, behavioral canaries and a controlled learning path, delivered the same way to Claude, Codex and Cursor so a rule written once is enforced everywhere instead of copied by hand and left to drift.

## Who it is for and why it matters for Mindmake

This repository is not sold and carries no product name of its own; it is the infrastructure every other Mindmake surface runs on. It is the evidence behind the sales claim the rest of the fleet makes to a buyer: that AI agents can carry consistent judgment, bounded authority and verified execution across tools and sessions, not just inside one chat window. The harness proves that claim on Krish's own agents first, including its own governance of itself (it was added to the fleet the docs steward maintains on 2026-09-08 specifically so the canon repository is not exempt from the discipline it imposes on every other repo).

## Where it is right now (as of 2026-09-25)

Latest approved release is **v2026.09.24.3** (source commit `3278b02`), immutable and published 2026-09-24T21:38:30Z. It is installed and hash-verified (29/29 exact) on every tracked surface; behavioral canary evidence is mixed rather than uniformly green, and `CURRENT.md` is the only place that mixed state should be read, never copied here. As of this reconciliation the known open items are: `claude-code-user`'s canary failed one stochastic route (`strategy-trigger-001`, expected `strategy-brief` to fire, observed the wrong skill); `codex-current` is partial with no blocking failures; `cursor-primary` has no supported headless canary and needs a manual run; the credential-exposure lifecycle opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`); and the `harness-maintainer` skill's review is 36 days old against its own 30-day freshness SLA (reviewed 2026-08-20, `state/skill-registry.yaml`). A 30th skill is under evaluation rather than admitted: `consumer-app-outcomes` lives in `candidates/`, is validated on every harness run, and is excluded from release packaging until admission (`state/candidates/consumer-app-outcomes.yaml`). Full detail, exact surface table and machine clocks: `CURRENT.md`.

## What changed recently

- 2026-09-25 **A consumer-app lifecycle skill was built as a candidate, then repaired after its own evidence failed a live check.** `consumer-app-outcomes` turns 73 live-read pages of the public Consumer App Studio taxonomy into 60 practitioner-hypothesis records with an append-only evidence log. Committed once under `skills/`, the release builder would have packaged it as a 30th skill on the next build; it moved to `candidates/` because that directory is evaluated but never packaged. A live readback then found all 15 onboarding, retention and trust-building records citing pages that do not exist, so those were rebuilt from the real pages and all 73 sources now sit in a checked source ledger. `Test-Harness.ps1` now validates every candidate package the same way it validates an admitted skill, including the append-only proof on the evidence log, without packaging it. Commits `519c7a2`, `6ff5514`, `59ff88b`, `d8bbcd4`, `02f29f3`, `4e32beb`.
- 2026-09-25 **The two supervised cloud accounts gained a routing floor after a claude.ai listing was found silently truncating skill descriptions.** On 2026-09-25 that catalog listed its last seven skills, including `strategy-brief`, `verification-loop` and `video-engine`, with no description at all, even though every `SKILL.md` and its description are valid and under the documented length limits. `adapters/cloud/account-instructions.md` is now a 1,884-character paste-in that forces the three always-on gates and names every production skill and its trigger directly, so cloud routing no longer depends on a description the catalog may not render. Commit `7d51b0b`.
- 2026-09-25 **A canary-audit attribution bug overstated how many skills had never fired.** `audit-harness.mjs` credited every core-trigger case to a skill literally called "core", which does not exist, so it reported `krish-principles`, `strategy-brief` and `verification-loop` as uncanaried. The true count of skills with no positive canary on any surface is 2 of 29 (`apify`, `ctrl-build`), not 5; `canaries.mjs` now keeps every unproven skill on every sheet until it fires, and the sheet says so. Commit `abc2952`.
- 2026-09-25 **The SURFACE machine identity resolver stopped exiting before it could record evidence.** Unrelated Claude and Cursor skill directories appeared on a Codex-only managed host, and identity resolution had been coupled to the absence of those unowned roots, so the run exited before writing anything. The resolver now binds SURFACE to its machine name and managed Codex root, records other roots without managing them, and carries a regression fixture proving they cannot make the host ambiguous. Commits `f8bcd22`, `b643a9a`.
- 2026-09-24 **The experience-quality system became durable instead of session-local, on Krish's own ruling.** Ruling (Krish, 2026-09-24): "harden the quality system, make it durable across future work, finish the build-apps safeguards, and keep the fleet as autonomous as possible." Three changes landed together: a material review firewall makes it mechanically impossible inside the governed workflow to present an unverified candidate (Ruling, same day: "Future app and website work must make it mechanically impossible within the governed workflow to present an unverified material candidate"); scroll-build interactions now require causal evidence that progress follows user scroll and that a locked region only releases after its sequence completes (Ruling, same day: "fix the two sections to build with scroll lock until complete, then harden the underlying system for future use"); and project delivery is fail-closed when a repository has no real test, build or QA command, so a placeholder script can no longer manufacture readiness. Commits `06447cd`, `bcc8bdd`, `6ce37fa`.
- 2026-09-24 **Release v2026.09.24.3 was registered and rolled out across every available local and cloud surface.** Ruling (Krish, 2026-09-24): "publish and roll out the hardened harness release across available local and cloud surfaces." The rollout sync was taught to consume already-approved reconciliations rather than re-litigate them, and to stop treating a provider-managed cloud cache as canonical drift when classifying what changed (Ruling, same day: "finish the governed rollout across available local clients without treating provider-managed cloud caches as canonical drift"). Commits `baf69e0`, `10d494d`, `b1ff8d1`, `f11caf9`.
- 2026-09-24 **The canon block was synced two releases late.** PR #74 rendered the krish-canon markers in `AGENTS.md` up through v2026.09.13.8 and then v2026.09.15.2 in the same pass, having missed both releases when they shipped. The block is detected-and-proposed by design, never silently overwritten, which is exactly why the backlog was visible instead of silently lost.
- 2026-09-20 **A wrong operating claim about the VPS fleet was found and corrected in the same session that made it.** The retirement map had the gateway job count wrong by sixteen jobs and mischaracterized the Telegram exposure; both were corrected the same day after independent verification against the live host (git clean, live n8n not clean), rather than left standing. Nine of eleven previously "unknown" jobs were settled to retire, and Krish's override keeping `loz-api-monitor` running against the general retirement instruction was written in as a named exception, not left implicit. Commits `71dc30c`, `d62858f`, `c4c9c65`, `9bec007`.
- 2026-09-19 **The content-format canon moved from two channels to three, and the mandate authority moved out of the canon text into a database table.** `venture_formats.mandate` in Mindmaker OS is now the single source of format mandate truth for `split.the.bill`, `mind.the.gap` and `lift.the.lid`; the OpenClaw VPS was independently audited from the host the same day and the operator handoff was corrected against two verifiers after the first draft stated things to still go and check that had, in fact, already been checked twenty minutes earlier. Commit `748a1ce`.

## What is next and what is waiting on Krish

- `harness-maintainer`'s review-date SLA has expired (36 days against a 30-day freshness SLA). Per this repo's own rule, an expired review date opens a finding and is never silently bumped; it needs Krish's review, not a stamp update.
- `claude-code-user`'s stochastic canary failure on `strategy-trigger-001` (expected `strategy-brief`, observed a different skill) is unresolved; `codex-current` remains partial and `cursor-primary` still has no supported headless canary, so its status is manual-required by construction, not by neglect.
- The credential-exposure lifecycle opened 2026-09-12 remains open with approved remediation in progress; containment is not the same as provider-side revocation, and closure is Krish's call.
- `consumer-app-outcomes` is a validated candidate, not an admitted skill. It needs independent execution of its held-out trigger and behaviour suites, review against `krish-design`, `build-apps-with-krish`, `ux-foundations`, `evidence-research` and `ux-testing-agent` for overlap, and Krish's admit/revise/reject decision before the staged routing change in `docs/proposals/2026-09-25-consumer-app-outcomes.md` can be applied.

## Read next

1. `CURRENT.md`: generated current release, surface and canary state.
2. `state/skill-registry.yaml`: machine-owned release and deployment register.
3. `contract/krish-operating-contract.md`: authority, verification, truth, freshness, secrets and observation capture.
4. `contract/skill-routing-contract.md`: which skill owns which request.
5. `contract/active-skill-quality-standard.md`: the admission standard for a production skill.
6. `contract/experience-quality-contract.md`: durable product-experience gates.
7. `docs/history/LOG.md`: append-only chronology.

## Do not trust

Nothing at the moment. No document in this repository currently claims to be authoritative on a fact that `CURRENT.md`, `state/skill-registry.yaml` or a canonical contract already settles differently. Dated material under `docs/proposals/`, `state/` and `docs/harness/` is historical evidence of what happened and what was decided at the time; it is not a second current-state surface and does not compete with `CURRENT.md`.
