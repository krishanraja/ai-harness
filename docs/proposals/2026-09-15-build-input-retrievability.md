# Build-input retrievability

PROPOSAL ID / VERSION / STATUS: `build-input-retrievability` / 1 / accepted by Krish on 2026-09-15 as part of the requested aggregate build-learning upgrade, repository remediation, governed propagation, and merge to `main`.

OWNER + DECISION RIGHTS: Krish owns the build-method standard. The implementation agent may record the observed failure class, change the canonical build instruction and its evaluation, run harness checks, create and merge the pull request, publish the approved immutable harness release, and run the already authorised propagation chain. The rule does not grant standing authority to mirror, upload, publish, use credentials, change a dependency, or mutate another repository; each remains gated by that repository's task authority.

NAMED ASKER + 90-DAY VALUE TEST: Krish Raja asked in this task to aggregate recent build defects into reusable machinery, apply the learning to the Video Engine, propagate it to his environments, and merge it to `main`. Retain this clause if, during the next three qualifying builds or ninety days, it prevents false reproducibility claims or catches an unavailable build input before merge. Otherwise simplify or retire it through the governed proposal lane.

CLASS + SURFACE + SITUATION: Build-method correction for repositories that fetch build-critical external artifacts in CI. It applies when a digest or version pin exists but does not replace the repository's dependency policy, supply-chain review, or authority gates.

CURRENT SOURCE VERSION / HASH / EXACT CLAUSE: Baseline source is `main` at `c421202`. The owning clause is `skills/krish-build/references/stage-conveyor.md`, `Handoff rules`. Existing determinism doctrine requires pins and repeatable builds but does not explicitly separate byte integrity from successful retrieval.

EVIDENCE: On 2026-09-15, both Ubuntu and Windows verification jobs for `krishanraja/content-engine` PR 70 returned HTTP 404 while fetching a build-critical FFmpeg archive even though exact SHA-256 values were present. After the repository owner-authorised task replaced that source with a repository-controlled release and preserved digest verification, both platforms passed in GitHub Actions runs `35019599447` and `35019602888`. Evidence links: `https://github.com/krishanraja/content-engine/pull/70`, `https://github.com/krishanraja/content-engine/releases/tag/toolchain-ffmpeg-n8.1.2-53-g1005b294ff`.

ALTERNATIVE EXPLANATIONS: The initial failure could have been a transient GitHub outage, a malformed URL, or missing authentication rather than deletion. Those causes do not change the reusable boundary: a stored digest cannot prove that the current build can retrieve the artifact. The rule therefore requires observed retrieval and digest proof, not a claim about any provider's retention policy.

PROPOSED CHANGE: Add one handoff rule requiring build-critical external artifacts to prove both retrieval and digest verification on every supported CI platform. On failure, stop and select an authorised durable source. State explicitly that any mirror, upload, publish, credential use, or dependency change remains separately gated. Add one held-out failure evaluation. Do not add a new skill, artifact service, scheduled maintenance system, or standing external-mutation authority.

EXPECTED EFFECT + MEASUREMENT WINDOW: Builds should fail at the supply boundary instead of being described as reproducible from a digest alone. Measure unavailable-input incidents, platform asymmetry, and whether remediation preserves digest verification. Review after three qualifying builds or ninety days, whichever comes first.

IF WRONG: The rule may duplicate ordinary CI expectations or add unnecessary platform checks. Its scope is limited to build-critical external artifacts and supported build platforms. Retire it if it produces ceremony without catching a real availability gap.

VALIDATION: Run full harness validation, deterministic repeat-build, reference and secret checks, the GitHub judge, and the held-out behavior suite. The originating repository has already proved the concrete remediation on both supported CI platforms.

SIZE / CONTEXT DELTA: One rule line, one regression-class bullet, one behavior case, and this proposal. No new runtime component or skill is added.

PRIVACY / AUDIENCE / RETENTION: Canonical harness repository. The proposal contains public repository, pull request, release, and CI run references only. It contains no credential, private payload, machine path, or user session material.

DEPENDENCIES + OWNER HANDOFF: `krish-build` owns the decision rule; each repository owns its dependency source and CI implementation; `tools-access` owns authentication boundaries; `harness-maintainer` owns release and propagation; `verification-loop` owns the final build outcome. Krish supplied the owner request in this task.

PRIOR KNOWN-GOOD + ROLLBACK: `harness-v2026.09.15.1` is the immutable prior release. Roll back the changed `krish-build` package to that release if the new rule causes routing or behavior regressions.

POST-RELEASE MEASUREMENT: Record the source commit, package hashes, installed hashes, canary result, and any recurrence. A successful download proves that run only; it does not rewrite this method automatically.
