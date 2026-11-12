# Harness audit 2026-11-12

Release `v2026.11.11.1`, 30 skills, 55 findings.

Nothing in this report was fixed automatically. A finding is a decision for a person; a skill that rewrites the rule it is judged by is the failure this audit exists to prevent.

| Class | Count |
|---|---:|
| freshness | 26 |
| surface-parity | 8 |
| description-budget | 6 |
| store-unmigrated | 4 |
| surface-contract | 4 |
| heartbeat | 2 |
| uncanaried | 1 |
| store-dead | 1 |
| surface-claim | 1 |
| dead-zone | 1 |
| em-dash | 1 |

## freshness

**harness-maintainer.** Reviewed 2026-08-20 with a 30 day SLA, so it was due 2026-09-19, 54 days ago.

> Review it and move the date. Never move the date without reviewing it.

**video-engine.** Reviewed 2026-08-29 with a 30 day SLA, so it was due 2026-09-28, 45 days ago.

> Review it and move the date. Never move the date without reviewing it.

**krish-design.** Reviewed 2026-08-05 with a 60 day SLA, so it was due 2026-10-04, 39 days ago.

> Review it and move the date. Never move the date without reviewing it.

**krish-content-marketer.** Reviewed 2026-08-05 with a 60 day SLA, so it was due 2026-10-04, 39 days ago.

> Review it and move the date. Never move the date without reviewing it.

**evidence-research.** Reviewed 2026-09-12 with a 30 day SLA, so it was due 2026-10-12, 31 days ago.

> Review it and move the date. Never move the date without reviewing it.

**tools-access.** Reviewed 2026-09-12 with a 30 day SLA, so it was due 2026-10-12, 31 days ago.

> Review it and move the date. Never move the date without reviewing it.

**apify.** Reviewed 2026-09-12 with a 30 day SLA, so it was due 2026-10-12, 31 days ago.

> Review it and move the date. Never move the date without reviewing it.

**n8n-operator.** Reviewed 2026-09-12 with a 30 day SLA, so it was due 2026-10-12, 31 days ago.

> Review it and move the date. Never move the date without reviewing it.

**instantly-operator.** Reviewed 2026-09-12 with a 30 day SLA, so it was due 2026-10-12, 31 days ago.

> Review it and move the date. Never move the date without reviewing it.

**mindmake-os.** Reviewed 2026-09-13 with a 30 day SLA, so it was due 2026-10-13, 30 days ago.

> Review it and move the date. Never move the date without reviewing it.

**mindmake.** Reviewed 2026-08-29 with a 45 day SLA, so it was due 2026-10-13, 30 days ago.

> Review it and move the date. Never move the date without reviewing it.

**decision-ledger.** Reviewed 2026-09-13 with a 30 day SLA, so it was due 2026-10-13, 30 days ago.

> Review it and move the date. Never move the date without reviewing it.

**design-intelligence-search.** Reviewed 2026-09-13 with a 30 day SLA, so it was due 2026-10-13, 30 days ago.

> Review it and move the date. Never move the date without reviewing it.

**krish-voice.** Reviewed 2026-08-20 with a 60 day SLA, so it was due 2026-10-19, 24 days ago.

> Review it and move the date. Never move the date without reviewing it.

**content-corpus.** Reviewed 2026-09-13 with a 45 day SLA, so it was due 2026-10-28, 15 days ago.

> Review it and move the date. Never move the date without reviewing it.

**krish-principles.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**take-the-brief.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**strategy-brief.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**verification-loop.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**build-apps-with-krish.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**ux-testing-agent.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**ctrl-compile.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**ctrl-build.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**ctrl-check.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**ctrl-capture.** Reviewed 2026-08-05 with a 90 day SLA, so it was due 2026-11-03, 9 days ago.

> Review it and move the date. Never move the date without reviewing it.

**ctrl-intake.** Reviewed 2026-08-06 with a 90 day SLA, so it was due 2026-11-04, 8 days ago.

> Review it and move the date. Never move the date without reviewing it.

## description-budget

**verification-loop.** Its description is 1004 characters and carries negative trigger conditions, on a client that reports shortening descriptions to fit a context budget. Exclusions sit at the end of a description and are what a truncation removes first.

> Shorten it, or move the exclusions ahead of the elaboration so a cut removes detail rather than the contract. A trigger that only holds while the text survives intact is not enforced.

**build-apps-with-krish.** Its description is 989 characters and carries negative trigger conditions, on a client that reports shortening descriptions to fit a context budget. Exclusions sit at the end of a description and are what a truncation removes first.

> Shorten it, or move the exclusions ahead of the elaboration so a cut removes detail rather than the contract. A trigger that only holds while the text survives intact is not enforced.

**ux-testing-agent.** Its description is 981 characters and carries negative trigger conditions, on a client that reports shortening descriptions to fit a context budget. Exclusions sit at the end of a description and are what a truncation removes first.

> Shorten it, or move the exclusions ahead of the elaboration so a cut removes detail rather than the contract. A trigger that only holds while the text survives intact is not enforced.

**ctrl-intake.** Its description is 941 characters and carries negative trigger conditions, on a client that reports shortening descriptions to fit a context budget. Exclusions sit at the end of a description and are what a truncation removes first.

> Shorten it, or move the exclusions ahead of the elaboration so a cut removes detail rather than the contract. A trigger that only holds while the text survives intact is not enforced.

**krish-build.** Its description is 940 characters and carries negative trigger conditions, on a client that reports shortening descriptions to fit a context budget. Exclusions sit at the end of a description and are what a truncation removes first.

> Shorten it, or move the exclusions ahead of the elaboration so a cut removes detail rather than the contract. A trigger that only holds while the text survives intact is not enforced.

**krish-voice.** Its description is 939 characters and carries negative trigger conditions, on a client that reports shortening descriptions to fit a context budget. Exclusions sit at the end of a description and are what a truncation removes first.

> Shorten it, or move the exclusions ahead of the elaboration so a cut removes detail rather than the contract. A trigger that only holds while the text survives intact is not enforced.

## surface-parity

**codex-surface-07a67cda9f99.** Installed v2026.10.06.3 while the approved release is v2026.11.11.1, last deployed 2026-10-06, 37 days ago.

> This surface pulls its own release. Until it reports back, the gap is evidence, not a broken pipeline.

**cursor-primary.** Installed v2026.11.08.1 while the approved release is v2026.11.11.1, last deployed 2026-11-08, 4 days ago.

> This surface pulls its own release. Until it reports back, the gap is evidence, not a broken pipeline.

**claude-code-user.** Installed v2026.11.08.1 while the approved release is v2026.11.11.1, last deployed 2026-11-08, 4 days ago.

> This surface pulls its own release. Until it reports back, the gap is evidence, not a broken pipeline.

**codex-current.** Installed v2026.11.08.1 while the approved release is v2026.11.11.1, last deployed 2026-11-08, 4 days ago.

> This surface pulls its own release. Until it reports back, the gap is evidence, not a broken pipeline.

**claude-cloud.** Installed v2026.10.06.3 while the approved release is v2026.11.11.1, last deployed 2026-10-07, 36 days ago.

> This surface pulls its own release. Until it reports back, the gap is evidence, not a broken pipeline.

**claude-secondary-cloud.** No release has ever been recorded for this surface; the approved release is v2026.11.11.1.

> Read the surface back and commit what it holds before treating it as current or stale.

**perplexity-cloud.** Installed v2026.10.06.3 while the approved release is v2026.11.11.1, last deployed 2026-10-07, 36 days ago.

> This surface pulls its own release. Until it reports back, the gap is evidence, not a broken pipeline.

**codex-cloud.** Installed v2026.10.06.3 while the approved release is v2026.11.11.1, last deployed 2026-10-07, 36 days ago.

> This surface pulls its own release. Until it reports back, the gap is evidence, not a broken pipeline.

## uncanaried

**coverage.** 1 of 30 skills have never had a positive canary fire on any surface.

> Run `node scripts/canaries.mjs --sheet` and work the sheet on a machine, then `--record` the report. Coverage is expected to be partial; it is reported as a number rather than left as an impression, and absence is never read as health.

## heartbeat

**harness-sync-surface.** harness-sync-surface last ran 2026-10-06T21:55:19.166Z, 878 hours ago, past the 48 hour limit.

> Check the workflow. A silent clock is the failure mode this watchdog exists for, so treat a stale heartbeat as an outage rather than as noise.

**session-miner-lorimer.** session-miner-lorimer last reported a blocked machine run at 2026-11-09T08:47:12.521Z.

> Read the machine evidence pull request. A current clock proves the task ran; it does not turn a refused install or failed canary into health.

## store-unmigrated

**standards_registry.** standards_registry holds 122 of 169 rows still marked active that brain/stores.yaml says belongs in the brain, and it has not been moved.

> Triage the 122 active rows against the 314 entries in brain/rules.yaml. Each is one of three things: already said by the canon, worth adding to the canon, or genuinely dead. This is a reading job for Krish and it is the highest value item in this file, because until it is done two live rule sets contradict each other in silence. The em dash rule is a known twin of the canon's own and is the first one to resolve, in one direction or the other, rather than leaving it live on both sides.

**canon_documents.krish-canon.** canon_documents.krish-canon holds 1 row(s) that brain/stores.yaml says belongs in the brain, and it has not been moved.

> A second canon covering identity, positioning and a decision log. It belongs in the brain with history.

**assumption-ledger.** assumption-ledger holds content that brain/stores.yaml says belongs in the brain, and it has not been moved.

> The canon instructs agents to maintain an Assumption Ledger and no store exists. Section 9 of the Ikigai sheet already keeps one, with flip rules.

**decision-ledger-store.** decision-ledger-store holds content that brain/stores.yaml says belongs in the brain, and it has not been moved.

> The decision-ledger skill names Supabase as its canonical store and there is no decisions table. The skill also says never to create an ad hoc permanent file, so repointing it is a skill rewrite through the proposal path, not a config change.

## store-dead

**corrections.** corrections is declared an input the brain feeds on and has not been written since 2026-09-06, 67 days ago.

> Either the thing that writes it is broken, or it is not really an input. Both are worth knowing; a silent input is indistinguishable from a healthy one.

## surface-contract

**claude-ai-chat.** claude-ai-chat reads from the brain and writes nothing back.

> The biggest reader in the fleet, covering claude.ai and Claude Desktop. Its write path is one custom connector to the hosted observation endpoint plus one account-instruction line (docs/harness/capture-connectors.md). It needs a connector-compatible endpoint first, then Krish adds the connector.

**chatgpt-chat.** chatgpt-chat reads from the brain and writes nothing back.

> Its custom connectors are in beta, may be limited by plan, and ask for confirmation on every write, so capture there cannot be silent. Best effort through the same hosted endpoint; codex work is mined separately.

**n8n-agents.** n8n-agents reads from the brain and writes nothing back.

> Fourteen agents reading a fourth copy of doctrine. They write corrections, which nothing here reads yet, and learning_events, which is dead.

**routines.** routines reads from the brain and writes nothing back.

> Two live scheduled Routines with no path back into the ledger.

## surface-claim

**cursor-lorimer.** cursor-lorimer claims to send hosted observations, but the ledger has none since 2026-09-12, 61 days ago labelled cursor.

> Either the client stopped calling the tool, or the claim is wrong. Fix the client or correct its writes entry in state/fleet.yaml.

## dead-zone

**137 live rules.** 137 of 371 live rules have never been cited by an independent judge or retrieved in a passing synthetic canary: who-krish-is.before-proposing-material-work, who-krish-is.mindmake-the-mission-and, who-krish-is.the-ikigai-s-twelve, who-krish-is.founder-visibility-is-an, who-krish-is.read-the-venture-list, north-star.read-it-before-any, north-star.before-starting-say-which, north-star.prefer-the-work-that, and more.

> Read a sample before acting. A rule can be uncited because nothing exercises it, because no canary covers its skill, or because it is dead. Only the third is a reason to retire it, and retiring it is a proposal, not an edit.

## em-dash

**1 lines in 1 files.** The canon carries 1 em dashes outside the files the validator refuses on: docs/proposals/2026-09-13.md.

> Replace each with the punctuation the sentence actually needs, one at a time, rather than a blanket substitution. This is content, so it belongs in its own change and not folded into an unrelated one.

## Measured, no finding

- 30 skill directories, 30 registry rows.
- 0 skill pairs over the 20 percent overlap threshold, measured on word 5-grams.
- 0 paragraphs of 120 characters or more appear in more than one skill.
- Skill descriptions total 23,336 characters across 30 skills, longest 1004. Codex reports shortening these to fit its context budget, so the total is the exposure.
- video-engine was unreachable on codex-surface-07a67cda9f99 at v2026.09.08.1, then a positive canary on the same surface proved it reachable at the same or a later evidence revision.
- design-intelligence-search was unreachable on codex-surface-07a67cda9f99 at v2026.09.08.2, then a positive canary on the same surface proved it reachable at the same or a later evidence revision.
- design-intelligence-search was unreachable on codex-current at v2026.09.12.3, then a positive canary on the same surface proved it reachable at the same or a later evidence revision.
- design-intelligence-search was unreachable on codex-current at v2026.09.12.4, then a positive canary on the same surface proved it reachable at the same or a later evidence revision.
- design-intelligence-search was unreachable on codex-current at v2026.09.12.5, then a positive canary on the same surface proved it reachable at the same or a later evidence revision.
- strategy-brief was unreachable on codex-current at v2026.09.13.2, then a positive canary on the same surface proved it reachable at the same or a later evidence revision.
- krish-principles was unreachable on codex-current at v2026.09.13.2, then a positive canary on the same surface proved it reachable at the same or a later evidence revision.
- 29 of 30 skills have a positive canary that fired on at least one surface, across 57 report(s) in state/canaries/.
- harness-sync-lorimer heartbeat is 3 hours old.
- observer heartbeat is 35 hours old.
- openclaw-vps is retiring since 2026-09-20 and has been quiet 1299 hours, which is the expected reading.
- session-miner-lorimer heartbeat is 75 hours old.
- brain/stores.yaml classifies 18 stores: 2 canon, 2 feed, 4 migrate, 5 retire, 5 reference.
- 11 surfaces declare what they read and write.
- bench source memory-doctrine matches its manifest hash, and is marked historical by its own header.
- bench source personal-standard matches its manifest hash.
- proposal docs/proposals/2026-09-08.md closed its unrouted findings.
- 5 merged proposal(s) in brain/proposals.jsonl, 1 acted-on cluster(s) checked for recurrence.
- 234 of 371 live rules carry at least one recorded citation in brain/usage.jsonl; canary citations are synthetic evaluation evidence, not real-world usage.
- provenance of 375 rules: 270 founding, 62 proposal, 43 ruling. 270 carry no recorded reason, only a first-seen commit.

