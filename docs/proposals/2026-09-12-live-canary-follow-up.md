# Live canary follow-up proposal, 2026-09-12

Status: approved by Krish Raja on 2026-09-13 for merge of public PR 45, publication of `harness-v2026.09.12.5`, and governed rollout. Credential rotation remains outside this approval.

Prompted by: Krish Raja's instruction to close the audited gaps and the failed approved rollout. That earlier broad instruction authorises this proposal and its verification, but is not treated as action-time approval to merge this later semantic change.

Action-time approval: "yes, merge all to main and close this out" in the interactive session on 2026-09-13, given after the exact PR, release identifier, change scope, green judge result, repeat-build proof, installer proof, and rollback target were shown.

## Evidence

The immutable `v2026.09.12.4` release installed with exact aggregate and per-skill parity on Claude Code, Cursor, and Codex on LORIMER. Its governed live run is recorded in `state/machine-runs/v2026.09.12.4-lorimer.json` with a blocked verdict. Claude recorded four failures and Codex nine. Cursor remains manual-required.

The failures separate into four classes:

1. Claude selected `design-intelligence-search` once for a direct generic design request and missed its headless pseudo-explicit case. A separate fresh diagnostic routed the same generic request correctly to `build-apps-with-krish`, proving the single sample is not deterministic.
2. Claude selected `content-corpus` for a strategic-overlay conversion request, while Codex correctly kept that request outside the corpus skill.
3. Codex selected commercial `mindmake` for one live internal OS request despite the body rule, while the other OS collision routed correctly.
4. Codex read the `video-engine` guard on two invalid launcher phrases. A fresh diagnostic showed the guard rejected the Video Engine launch and did not access `krishanraja/mindmake-video-studio`; the old canary incorrectly equated reading the guard with launching the engine.

Codex also missed unchanged `ctrl-compile` and one unchanged `ux-foundations` positive. Those remain evidence and are not rewritten as a release-caused defect without repeat evidence.

## Decision

- Lead the `design-intelligence-search`, `content-corpus`, and `mindmake` descriptions with their exclusion gates before broad topical trigger language.
- For Video Engine only, distinguish semantic retrieval of the exact-match guard from activation of the production engine. The forbidden event is accessing or running the named authority after an invalid phrase. The exact positive must still retrieve the launcher skill.
- When a manual-only skill is absent from a client's implicit catalog on a negative case with an expected neighboring route, record containment as observed and the neighbor as unmeasured. Do not call it a route pass and do not fail it as target over-triggering.
- Put `asked_by` directly on machine runs, canary reports, and derived citation rows. Refuse a canon-bound citation that lacks it.

## Validation

- Existing harness, canary, usage-ledger, audit, deterministic-build, and installer tests.
- New regression cases for required asker provenance and manual-only negative route gaps.
- Fresh authenticated Claude and Codex canaries after immutable release publication.
- Retain every failed report. A later pass supersedes reachability status but never erases the historical run.

## Prior known-good and rollback

`harness-v2026.09.12.4` is the immediate byte-exact rollback target. It remains installed while this candidate is reviewed because its failures are routing overreach and measurement defects, not corruption, unknown drift, or destructive behavior. Credential rotation stays paused.

## Scope boundary

This proposal does not add a new agent, product, store, daemon, or local-machine script. It modifies the existing centralized harness, its three routing descriptions, the Video Engine guard contract, and the existing canary/evidence recorder only.
