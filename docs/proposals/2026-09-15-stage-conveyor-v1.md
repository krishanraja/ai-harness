# Stage conveyor v1

PROPOSAL ID / VERSION / STATUS: `stage-conveyor-v1` / 1 / accepted by Krish on 2026-09-15 for implementation, governed release, propagation, and merge to `main`.

OWNER + DECISION RIGHTS: Krish owns the build-method standard. The implementation agent may make repository changes, run checks, create the pull request, merge the accepted change, publish the immutable harness release, and run the approved propagation chain. Destructive cleanup, credential actions, and unrequested changes to source repositories remain outside scope.

NAMED ASKER + 90-DAY VALUE TEST: Krish Raja, the repository owner, asked in this task to aggregate the recent build learnings, replace monolithic Markdown machinery with a modular conveyor, apply it to the Video Engine route, propagate it, and merge it to `main`. This is founder-directed operating leverage rather than speculative product work. Keep it only if the next three qualifying builds or the next ninety days show faster root-cause location, a prevented handoff defect, or safer recovery; otherwise simplify or retire the machinery through the governed proposal lane.

CLASS + SURFACE + SITUATION: Build-method correction. Applies to repeatable multi-stage repositories with derived artifacts, resumability, metered or long-running execution, independent gates, or several specialised responsibilities. It does not apply automatically to simple applications or one-step builds.

CURRENT SOURCE VERSION / HASH / EXACT CLAUSE: Baseline source is `main` at `5befe4c` and approved harness release `v2026.09.13.8`. The exact owning clause is `skills/krish-build/SKILL.md`, section 1, before this proposal. It covers determinism and source-of-truth but has no repository topology or stage-ownership protocol.

EVIDENCE: Four privacy-minimised repository reviews from 2026-09-01 through 2026-09-15; three independent owner signals across two sessions and two repositories; one applied stage-conveyor result; one production ruling against an accumulating Markdown station; and nine recurring defect classes. Opportunity denominator is unknown because the reviewed repositories were selected by material recent build activity, not sampled from every build.

ALTERNATIVE EXPLANATIONS: Individual defects could be ordinary implementation mistakes; iteration volume could reflect deliberate adversarial hardening; large immutable artifacts could be justified evidence. These explain some occurrences but not the repeated shared shape: missing joins, duplicated contract owners, stale parallel state, absence coerced into verdicts, and recovery paths that exist without operational reachability.

PROPOSED CHANGE: Add one conditional stage-conveyor clause to `krish-build`; add focused stage architecture and long-running safety references; add a portable manifest contract, topology checker, valid fixture, and fifteen negative regression cases; add one orchestration handoff to `build-apps-with-krish`; add derived-output verification rules to `verification-loop`; and reconcile the Video Engine's canonical repository identity from its redirected former name to `krishanraja/content-engine`. Do not create a new skill or embed source-repository evidence in general-purpose runtime packages.

EXPECTED EFFECT + MEASUREMENT WINDOW: Over the next three qualifying repository changes, agents should identify a single responsible stage before editing, keep stage executors stable while versioning evidence, and verify the final consumed outcome. Measure conformance-check adoption, repeated downstream patches for one upstream defect, bypassed-guard incidents, false completion, and recovery-path failures. Classify effectiveness after three qualifying builds or thirty days, whichever is later.

IF WRONG: Stage declarations could add ceremony, duplicate the repository's existing architecture, or make small builds slower. The qualifying gate and direct-path exception contain that risk. A repository can decline the manifest when the direct flow is clearer, while retaining the general verification rules.

VALIDATION: Run the portable checker against the valid fixture; prove fifteen broken topology variants fail for the intended reason; cover semantic and operational failure classes in behavior evaluations; re-read the complete `krish-build` doctrine against the additions; run the complete harness validation, reference integrity, expanded executable secret scan, deterministic repeat-build, and installer self-test; obtain an isolated package review; and prove the documented `Ruling (Krish, DATE):` judge override actually changes the gate while preserving the findings. Then run fresh local discovery/routing/behavior canaries for changed skills. Cloud surfaces remain manual-required until authenticated inventory, upload, and readback complete.

SIZE / CONTEXT DELTA: `krish-build/SKILL.md` gains one short doctrine clause and one routing clause. `build-apps-with-krish` gains one handoff paragraph. `verification-loop` gains two pipeline checks. Conditional detail stays in two one-level references and an executable helper that need not be loaded for simple builds. No unrelated doctrine is removed.

PRIVACY / AUDIENCE / RETENTION: Canonical harness repository. Runtime skill files and this proposal contain only sanitised failure classes and aggregate counts. No prompts, transcripts, client identities, credentials, absolute machine paths, private data, or copied proprietary implementation enter the package. Raw evidence remains in its authorised source repositories and session stores.

DEPENDENCIES + OWNER HANDOFF: `skill-creator` owns instruction architecture; `harness-maintainer` owns registry, checks, packaging, release, installation, parity, and rollback; `verification-loop` owns the final outcome verdict. Krish has supplied the required owner acceptance.

PRIOR KNOWN-GOOD + ROLLBACK: `v2026.09.13.8` is the exact prior byte baseline and immutable rollback artifact. Its local bytes have parity evidence, but its overall behavioural run is blocked; it is not described as fully known-good. Roll back only the changed skill directories from that immutable release if new routing or behavior regresses, while preserving the failed historical canary record.

POST-RELEASE MEASUREMENT: Record source commit, package hashes, installed hashes, canary outcomes, manual-required surfaces, and any recurrence. Byte parity and behavioral success remain separate. No observed improvement authorises the harness to rewrite this method automatically.
