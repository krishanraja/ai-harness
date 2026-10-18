# Capture proposals, 2026-09-08

Source: `brief.md` (window 2026-09-01 to 2026-09-08, 54 observations, 41 clusters, 7 over the bar). Shape follows `skills/ctrl-capture/SKILL.md` stage 9, using the five fields `brief.md` itself specifies: EVIDENCE, ALTERNATIVE EXPLANATIONS, IF WRONG, VALIDATION, PRIOR KNOWN-GOOD + ROLLBACK. This file is the only change in this run; no skill, registry, contract, or eval case is edited here. A named human accepts or rejects each block below.

Per block, the layer decision uses the six classes `brief.md` lists: (1) canon rule, (2) skill chapter/reference, (3) routing fix, (4) new skill, (5) merge, (6) retirement/quarantine, or **nothing changes**.

---

## Block 1: cross-surface version drift, 7 occurrences

**Layer decision: nothing changes.** `state/skill-registry.yaml` shows `latest_approved_release` is `v2026.09.08.1`, `approved_by: Krish Raja`, `approved_at: 2026-09-08` — approved today, the same day this audit ran — while `deployed_release` is still `v2026.08.29.3`. Every surface named except `codex-surface-07a67cda9f99` is behind only because the same-day rollout has not happened yet, which is the approval-gated `harness-maintainer` deployment workflow's job (Gate 9: "Each active surface records release, hash or upload record, enabled state, and verification time... Rollback restores the prior known-good release"), not a gap in any skill, canon rule, or routing entry. None of the six proposal classes describes "perform the deployment."

**EVIDENCE**
> codex-surface-07a67cda9f99: Installed v2026.08.29.1 while the approved release is v2026.08.29.3, last deployed 2026-08-29, 10 days ago.

> codex-surface-07a67cda9f99: Installed v2026.08.29.1 while the approved release is v2026.09.08.1, last deployed 2026-08-29, 10 days ago.

> cursor-primary: Installed v2026.08.29.3 while the approved release is v2026.09.08.1, last deployed 2026-08-29, 10 days ago.

> claude-code-user: Installed v2026.08.29.3 while the approved release is v2026.09.08.1, last deployed 2026-08-29, 10 days ago.

> codex-current: Installed v2026.08.29.3 while the approved release is v2026.09.08.1, last deployed 2026-08-29, 10 days ago.

> claude-cloud: Installed v2026.08.29.3 while the approved release is v2026.09.08.1, last deployed 2026-08-29, 10 days ago.

> perplexity-cloud: Installed v2026.08.29.3 while the approved release is v2026.09.08.1, last deployed 2026-08-29, 10 days ago.

(`state/skill-registry.yaml`: `latest_approved_release.release_id: v2026.09.08.1`, `approved_at: 2026-09-08`; `deployed_release.release_id: v2026.08.29.3`, `deployed_at: 2026-08-29`. `AGENTS.md` canon block already reads `release=v2026.09.08.1 ... rendered=2026-09-08`.)

**ALTERNATIVE EXPLANATIONS**
- `codex-surface-07a67cda9f99` is a distinct, standing case from the other five: `state/fleet.yaml` already documents it as a "Known gap" on a machine "this repository cannot see," stuck at `v2026.08.29.1` since before `.3` even shipped. That note is worded against the now-superseded `v2026.08.29.3` baseline and could read as stale phrasing needing a refresh — but refreshing prose in `state/fleet.yaml` is an edit to tracked operational state, not to a skill, canon rule, or routing entry, and is out of this run's scope regardless.
- The two `codex-surface-07a67cda9f99` rows for two different "approved release" values could be misread as duplicate/inflated evidence. They are not: `scripts/observe.mjs` ids a row on `[source, repo, evidence, class, quote]`, so the approved-release value changing between the pre- and post-`v2026.09.08.1` observation windows correctly produces two distinct, non-duplicate rows for the same surface.
- If deployment does not happen within a reasonable window, seven-surface staleness would stop being "pending rollout" and become a genuine freshness/regression signal under Gate 8/Gate 9 — but one same-day observation right after approval does not meet that bar yet.

**IF WRONG**
If this is actually stalled rather than pending (e.g., the deployment step is blocked or forgotten, not just not-yet-run), the same seven rows recur in next week's audit with a longer lag, and Gate 9's per-surface parity record makes that visible rather than hidden. `harness-maintainer`, which owns the release/rollback route, or Krish reviewing `NOW.md`'s "known gap" line, notices first. Treating this as "nothing changes" costs nothing today since no proposal-layer change was withheld; the risk is only in not re-flagging if it recurs.

**VALIDATION**
Deterministic check: re-run `scripts/audit-harness.mjs` after `harness-maintainer` completes the approval-gated deployment of `v2026.09.08.1` and confirms `surface_deployments` in `state/skill-registry.yaml` for `cursor-primary`, `claude-code-user`, `codex-current`, `claude-cloud`, and `perplexity-cloud` all read `v2026.09.08.1`. `codex-surface-07a67cda9f99` is expected to remain a separately tracked, already-documented exception. No regression case is added here since no rule changes.

**PRIOR KNOWN-GOOD + ROLLBACK**
`state/skill-registry.yaml`'s `superseded_approved_release` already names the rollback target explicitly: `v2026.08.29.3`, `source_commit d631f868be5f9896e283d662a0b49c46aa58f522`, "Retained as the prior known-good release and the rollback target." No edit is proposed here, so there is nothing of this run's to roll back.

---

## Block 2: overdue freshness review — `evidence-research`, `decision-ledger`, `apify`

**Layer decision: nothing changes.** This is Gate 8 doing its job ("Review-date expiry opens a finding; it does not silently rewrite a skill"), not evidence that any of the six layers is wrong. The corrective action is a human-performed review that then legitimately updates `reviewed:` in `state/skill-registry.yaml` — Capture, and this proposer, are barred from moving a reviewed date without a review, and none of the six classes describes "perform the review for the owner."

**EVIDENCE**
> evidence-research: Reviewed 2026-08-05 with a 30 day SLA, so it was due 2026-09-04, 4 days ago.

> decision-ledger: Reviewed 2026-08-05 with a 30 day SLA, so it was due 2026-09-04, 4 days ago.

> apify: Reviewed 2026-08-05 with a 30 day SLA, so it was due 2026-09-04, 4 days ago.

(`state/skill-registry.yaml` confirms all three carry `reviewed: 2026-08-05, freshness_sla_days: 30`.)

**ALTERNATIVE EXPLANATIONS**
- The 30-day SLA itself may be miscalibrated for these three (too tight for how rarely their domains move), which would make this a genuine reference-layer edit — but that judgment requires an actual review of each skill's drift, not an inference from lateness alone. Proposing an SLA change from lateness alone would be manufacturing a change to justify the block.
- The audit's date arithmetic could be off by a day or a timezone; nothing in the evidence rules this out from here.
- This may simply be the SLA firing exactly as designed: a true positive with no defect anywhere, just an unfinished chore now four days late.

**IF WRONG**
If the SLA is actually too aggressive and "nothing changes" is the wrong call, these three (and anything else on a 30-day cadence) keep re-tripping this finding every cycle; Gate 8 reopens rather than hides it, so the recurrence itself is the correction signal, and whoever triages the weekly audit notices. If the audit's date math is wrong instead, it produces persistent false-lateness noise that risks desensitizing review of genuine staleness over time.

**VALIDATION**
Deterministic check: re-run `scripts/audit-harness.mjs` against `state/skill-registry.yaml` after the owner performs and records each review, and confirm all three names drop out of the overdue set. No regression case is added by this proposal since no rule changes; a future proposal that changes the SLA value must add its own regression case.

**PRIOR KNOWN-GOOD + ROLLBACK**
`state/skill-registry.yaml`, current `reviewed: 2026-08-05` for all three names, is unedited by this proposal. No rollback needed.

---

## Block 3: overdue freshness review — `tools-access`, `n8n-operator`, `instantly-operator`

**Layer decision: nothing changes**, for the same reason as Block 2.

**EVIDENCE**
> tools-access: Reviewed 2026-08-05 with a 30 day SLA, so it was due 2026-09-04, 4 days ago.

> n8n-operator: Reviewed 2026-08-06 with a 30 day SLA, so it was due 2026-09-05, 3 days ago.

> instantly-operator: Reviewed 2026-08-06 with a 30 day SLA, so it was due 2026-09-05, 3 days ago.

(`state/skill-registry.yaml` confirms `tools-access: reviewed 2026-08-05`; `n8n-operator` and `instantly-operator: reviewed 2026-08-06`; all three `freshness_sla_days: 30`.)

**ALTERNATIVE EXPLANATIONS**
Same three readings as Block 2: SLA miscalibration (unverifiable without an actual review), an audit date-arithmetic defect, or a true positive doing exactly what Gate 8 intends. One reading specific to this trio: `n8n-operator` and `instantly-operator` are approval-gated provider operators, and `state/skill-registry.yaml`'s `n8n-operator`/`instantly-operator` `full_suite`/`closing_regression(s)` evaluation evidence is itself dated around 2026-08-06 — the underlying capability evidence is nearly as fresh as the SLA window, which weakens (but does not resolve) the case for urgency on those two.

**IF WRONG**
Same failure mode as Block 2: if the SLA is wrong, the finding recurs and the recurrence is the self-correcting signal on the next audit cycle. Of the three, `tools-access` carries the highest blast radius if actually stale — it is the registry's `secure-authentication-contract` skill, and Gate 5 treats credential/authority handling as a hard-safety category — so a real review lapse there is the one case in this trio worth prioritizing for the owner, though the evidence given here is only lateness, not a located defect.

**VALIDATION**
Same as Block 2: re-run `scripts/audit-harness.mjs` after genuine reviews are recorded for all three names.

**PRIOR KNOWN-GOOD + ROLLBACK**
`state/skill-registry.yaml`, current `reviewed:` dates for these three names, is unedited. No rollback needed.

---

## Block 4: registry/routing mismatch — `harness-maintainer`, `tools-access`, `apify`

**Layer decision: class 3, routing fix.** Independently confirmed this run by grep: none of `harness-maintainer`, `tools-access`, or `apify` appear anywhere in `contract/skill-routing-contract.md`, while all three are listed in `production_active` in `state/skill-registry.yaml`. This is exactly the gap Gate 1 names ("The skill occupies a named route in `skill-routing-contract.md`") and the routing contract's own closing principle ("Generic marketplace skills never become always-on merely because they are installed. They must occupy a named route here first."). A routing-contract edit is the cheapest sufficient layer — no skill content, canon rule, or eval case needs to change to close this gap.

**EVIDENCE**
> harness-maintainer: harness-maintainer is in the registry but never named in contract/skill-routing-contract.md.

> tools-access: tools-access is in the registry but never named in contract/skill-routing-contract.md.

> apify: apify is in the registry but never named in contract/skill-routing-contract.md.

Independently re-verified this run via `grep -n "harness-maintainer\|tools-access\|apify" contract/skill-routing-contract.md`: zero matches.

**ALTERNATIVE EXPLANATIONS**
- These three may be intentionally cross-referenced rather than routed: `skills/ctrl-capture/SKILL.md` itself names `harness-maintainer` directly for stage 9's release handoff ("Do not use for ... installation/release (`harness-maintainer`)"), and Gate 4 allows "every required chain member is independently discoverable from its own metadata; a cross-skill name is a semantic handoff, not the only loading mechanism" — so the omission could be a deliberate design choice rather than an oversight.
- `tools-access` and `apify` may belong more naturally in the "Global chain" section (alongside `krish-principles`) than in the "Core routes" table: `tools-access` is registered as a cross-cutting `secure-authentication-contract`, not a domain-routed producer, and `apify` is an `approval-gated-web-data-operator` that other rows (e.g. the Instantly and n8n rows) may already be expected to invoke as a tool rather than route to directly. If so, the gap is real but a naive new "Core routes" row would misplace it.
- The existing "Harness/configuration audit" row ("mindmake-os when OS-related | No prose producer | Deterministic harness audit") may have been intended to cover `harness-maintainer`'s territory without naming it, which would make this an incomplete row rather than a missing one.

**IF WRONG**
If these omissions are deliberate (semantic-handoff-only by design), adding explicit rows is redundant but not harmful beyond routing-contract context budget, which Gate 3 and `ctrl-capture`'s own size/context-delta discipline explicitly protect against padding. The routing-contract owner reviewing the proposal at accept-time notices this first. If the fix is rejected as redundant without recording why, the same gap re-trips the next audit cycle, since nothing in the contract currently records a deliberate-omission rationale for these three names.

**VALIDATION**
Deterministic check: every name in `production_active` (`state/skill-registry.yaml`) must appear as a literal string somewhere in `contract/skill-routing-contract.md`. This is exactly the check that surfaced this block; recommend the owner add it as a permanent regression case in `scripts/audit-harness.mjs` (or the routing eval suite, `evals/skill-routing-cases.jsonl`) so a newly admitted production skill cannot silently ship without a route again.

**PRIOR KNOWN-GOOD + ROLLBACK**
Current `contract/skill-routing-contract.md`, unedited by this proposal, is the prior known-good text. If an accepted fix later needs reverting, restore this file's current text; no other file is touched by the proposed change, so rollback is a single-file revert.

---

## Block 5: control-center ruling (backfill) — github-sync author filter, `37af6d3`

**Layer decision: nothing changes.** Per the brief's backfill instruction, the live question is only whether the ruling is now written down somewhere durable, not whether to redo the change. The evidence states its own durability mechanism directly: a code-level guard in control-center's own repository, not an ai-harness skill, canon rule, or routing entry.

**EVIDENCE**
> fix the github-sync author filter too so the scorecard counts every commit. A dry run showed most session commits carry the coding agent's noreply address (36 of 38 in one repo, 18 of 34 here), so the Rule 6 tripwire was reading roughly half the truth. Every repo in GITHUB_REPOS is his, so every commit in it is his build. GITHUB_AUTHOR is no longer read anywhere; the guard fails if either reader brings it back. No history to correct: the first Saturday run is 12 September.
> ([source](https://github.com/krishanraja/control-center/commit/37af6d3cda7bbb5ea943438820575ad152e666d7))

**ALTERNATIVE EXPLANATIONS**
This commit fixes a scoring/attribution bug in a sibling repository's own tooling. On its face it makes no claim about any ai-harness skill, canon rule, or routing contract, so the correct reading may be that it carries zero implication for this repository, rather than being an under-documented ruling in need of a home here.

**IF WRONG**
If other fleet repositories share the same author-filter assumption and the same latent bug, the failure resurfaces as the same misattributed-commit pattern in that repository's own Rule 6 tripwire; whoever runs that repository's next scorecard audit notices first, not ai-harness's own audit. Separately, `state/decision-ledger-config.yaml` records the decision-ledger's canonical Supabase store as not yet applied, so even if this ruling belonged in a cross-repo decision record, there is currently nowhere live to file it — a proposal to do so now would be unactionable.

**VALIDATION**
None proposed; no ai-harness file is touched. The evidence names control-center's own regression protection ("the guard fails if either reader brings it back"), which is out of this run's authority to inspect or extend.

**PRIOR KNOWN-GOOD + ROLLBACK**
Not applicable to ai-harness; no file here is affected. Control-center's own prior known-good is commit `37af6d3` itself, which already carries its own regression guard.

---

## Block 6: control-center ruling (backfill) — single-copy doc pointer, `31fc316`

**Layer decision: nothing changes**, for the same backfill reason as Block 5.

**EVIDENCE**
> have every other document just point to the GitHub file so only that one has to be kept up to date. README, docs/README and docs/ARCHITECTURE now name docs/MINDMAKE_OS_ARCHITECTURE.md on main as the only copy instead of a VPS workspace root or a Drive folder. Five stale MINDMAKER_ path references in comments repointed. The crontab mirror notes that sync-to-drive.py no longer carries the doc. The Agatha task gains the VPS pointer sweep: workspace symlinks and the wake protocol point at the checkout or the raw URL, never a copy.
> ([source](https://github.com/krishanraja/control-center/commit/31fc31622e5a77cf5fca3769c3093bd3b8c555e0))

**ALTERNATIVE EXPLANATIONS**
The evidence states its own durability mechanism explicitly: README, `docs/README`, and `docs/ARCHITECTURE` in control-center now name the single canonical file, and a follow-up task exists for Agatha to sweep remaining pointers. This reads as a self-documenting change in a repository ai-harness does not own, not an ai-harness gap.

**IF WRONG**
If this single-source-of-truth pattern is meant to generalize across the fleet — ai-harness's own `state/skill-registry.yaml` `canonical` block already names a similar canonical-repo-plus-mirrored-surfaces structure — a missed generalization would surface as duplicate or diverging doc copies inside ai-harness itself; whoever reconciles `NOW.md` against `docs/history/LOG.md` notices first, since that is exactly the drift that process is built to catch. This is a plausible future canon candidate, but one backfilled observation from a different repository does not meet the recurrence bar `ctrl-capture` requires before proposing a rule ("One low-severity occurrence normally remains an observation").

**VALIDATION**
None proposed; no ai-harness file is touched.

**PRIOR KNOWN-GOOD + ROLLBACK**
Not applicable to ai-harness. Control-center's prior known-good is commit `31fc316` itself.

---

## Block 7: control-center ruling (backfill) — VPS/Drive copies deleted, `ec7f05e`

**Layer decision: nothing changes.** Of the three backfill blocks this has the clearest self-evidenced answer to the brief's actual question ("is it written down somewhere durable"): the evidence says the ruling is recorded in the architecture document's own section 0c, plus a filed follow-up task.

**EVIDENCE**
> the VPS and Google Drive copies of docs/MINDMAKE_OS_ARCHITECTURE.md are deleted for good, too fragile to keep in step and read by nothing. GitHub main is the only surface. The header, section 19 and section 21 now say so; the six-surface inventory, the sync procedure and the byte-identical rule are gone. Section 0c records the ruling with the exact VPS steps, which are also filed as a task for Agatha. The Drive file is in the trash.
> ([source](https://github.com/krishanraja/control-center/commit/ec7f05e7757c28a8f0d4b0ec52b7b7cefe445383))

**ALTERNATIVE EXPLANATIONS**
No materially different reading from Blocks 5-6: this is a sibling repository's internal documentation-consolidation decision, explicitly self-recorded (section 0c, header, sections 19 and 21) inside the document it concerns, plus a filed follow-up task. There is no reading of this evidence that leaves the ruling undocumented.

**IF WRONG**
If section 0c is later found missing or reverted (the self-report was inaccurate), the risk is someone recreating a VPS or Drive copy believing none exists; whoever next runs the Agatha VPS-pointer-sweep task notices first, since that task is the designated check for stray copies. This is control-center's own verification surface, not ai-harness's.

**VALIDATION**
None proposed; no ai-harness file is touched.

**PRIOR KNOWN-GOOD + ROLLBACK**
Not applicable to ai-harness. Control-center's prior known-good is commit `ec7f05e` itself, with the Drive file already in the trash per the evidence.

---

## Below the bar

The twenty `waiting` single-observation items in `brief.md` are, by the brief's own framing, not yet a pattern and are correctly recorded rather than proposed. No proposal is written for them in this run.
