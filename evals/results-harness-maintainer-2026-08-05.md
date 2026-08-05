# Harness Maintainer held-out evaluation - 2026-08-05

## Method

Three independent fresh-context reviewers were used:

1. A trigger classifier received only the skill name/description and projected `id`/`prompt` fields. It did not receive categories or expected labels.
2. A baseline behavior reviewer received only projected `id`/`scenario` fields. It did not read the harness skill, governing contracts, or `must`/`must_not` fields.
3. A skill-enabled behavior reviewer read the skill and required governing files, then received only projected `id`/`scenario` fields. It did not receive the answer key.

After the first skill-enabled run exposed release-evidence and handoff omissions, the candidate gained a conditional reconciliation/release reference. A different reviewer that had not seen the behavior cases ran the revised skill. This is a valid regression-oriented rerun, but not a complete production admission because the revised run still used the same held-out scenarios and its concise answers omitted some non-safety evidence fields.

## Trigger result

- Positives: 8/8 correct.
- Negatives: 8/8 correct.
- Adversarial/collision: 5/5 correct.
- Precision: 100%.
- Recall: 100%.
- High-consequence false positives: 0.

The description correctly selected cross-client audit, parity, packaging, admission, overlap, missing-skill, unsafe-import, activation, and retirement work. It correctly excluded content production, app building, visual design, app UX audit, live fleet status, general decision logging, vendor research, and normal Apify execution.

## Behavior result

The baseline reviewer was generally safe and competent, but often omitted harness-specific invariants: provider-cache exclusions, junction classification, exact release evidence, prior known-good rollback artifacts, and the `skill-creator`/`skill-installer` ownership split.

The initial skill-enabled run improved canonical ownership, approval boundaries, freshness reasoning, controlled learning, and production-gate discipline. It still under-specified the complete surface schema, baseline-comparison evidence, canary rollback record, provider-install handoff, and app-corpus routing.

The revised run produced the correct action direction on all 23 cases and violated none of the `must_not` or hard authority/security requirements. Material improvements included:

- exact local/cloud artifact classification and exclusions;
- clean-commit admission evidence and baseline comparison;
- complete canary/rollback fields and `production_active` boundary;
- one exact next surface mutation rather than bulk rollout;
- raw-corpus suppression with doctrine/reference/regression routing;
- provider duplicate suppression and incomplete-draft handling;
- `skill-creator` and `skill-installer` handoffs;
- live Mindmaker OS routing and `ctrl-capture` ownership of personal-standard changes.

Residual finding: several concise responses did not restate every non-safety evidence field demanded by the full rubric, especially freshness review provenance/regression, affected-consumer recording, and named canary detail. The candidate therefore receives **limited executed evidence**, not a full behavior-gate pass.

## Changes caused by the evaluation

- Added `skills/harness-maintainer/references/reconciliation-and-release-evidence.md`.
- Added explicit clean-tree, no-averaging, full release-evidence, rollback, `production_active`, readiness-versus-authority, `skill-creator`, and `skill-installer` rules.
- Added freshness review and operational-monolith rollback records.

## Admission status

`candidate` / `limited executed evidence`.

Before canary admission:

1. Run a new behavior suite with fresh scenarios against the revised skill and score every rubric field.
2. Run deterministic repeat packaging from a clean commit.
3. Preserve a prior known-good artifact and smoke-test one explicitly approved local canary.
4. Record installed parity, routing behavior, rollback, and verification time.
