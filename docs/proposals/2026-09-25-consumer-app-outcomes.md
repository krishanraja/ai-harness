# Consumer app outcomes candidate

## Proposal

Add `consumer-app-outcomes` as an inactive candidate skill. It turns the public Consumer App Studio stack taxonomy into an original, structured decision layer for lifecycle diagnosis, measurement, ethical guardrails, and handoff to existing design, build, research, standards, and QA owners.

## Evidence

- 73 public pages inventoried: index, 12 stack pages, and 60 problem pages. Each was read back live on 2026-09-25 with HTTP 200 and is recorded in `references/source-ledger.json`.
- 60 candidate records cover all 12 stacks. The 15 onboarding, retention and trust-building records originally cited pages that do not exist; they were rebuilt from the real pages (see the research record's provenance correction).
- Every record carries source provenance and stays at practitioner-hypothesis level in the catalog. Stronger evidence can only be attached as append-only rows in `references/evidence-log.jsonl`, and status is computed from those rows.
- Trigger (8 positive, 8 negative, 5 collision) and behaviour (6/8/5/4) fixtures under `evals/candidates/` cover collisions, missing evidence, manipulation, privacy, accessibility, authority, evidence-log integrity, and implementation handoff.
- `scripts/Test-Harness.ps1` runs the package checks, the fixture minimums, 29 offline tests, and the append-only proof on every validation run.

## Boundary

The candidate is not production-active. It must not enter release artifacts, installations, enablement, or cloud catalogues until held-out evaluation, overlap review, explicit admission, release construction, and installation approvals pass. It lives in `candidates/consumer-app-outcomes/` because the release builder packages every directory in `skills/`.

## Admission gates

1. Full repository validation.
2. Independent execution of held-out trigger and behaviour suites.
3. Review against `krish-design`, `build-apps-with-krish`, `ux-foundations`, `evidence-research`, and `ux-testing-agent`.
4. Human decision to admit, revise, or reject.
5. Separate approval for release and each deployment surface.

## Staged routing change

Apply this only in the admission commit that moves the package into `skills/`. The routing contract is live doctrine on every client, so a route to an uninstalled skill would misroute real requests.

Core routes, a new row:

| Request | Context | Primary producer | Verification |
|---|---|---|---|
| Consumer-app lifecycle leak: onboarding, activation, retention, monetisation, engagement, habit, growth, conversion, trust, experience refinement, intent shaping, or premium positioning, when the ask is diagnosis or an intervention brief | `mindmake` for Mindmake's own products | `consumer-app-outcomes` produces the diagnosis and measurement brief; `krish-design`, `krish-build` or `build-apps-with-krish` produce the change | Brief traces to catalog record IDs with computed status; `verification-loop`; the result is recorded with `scripts/record_result.py` at the decision date |

The "Product or interface design" and "New app" rows add `consumer-app-outcomes` to their Context column, and only when the request names a lifecycle outcome.

Collision rule:

- `consumer-app-outcomes` owns lifecycle diagnosis, the outcome, metrics, guardrails and the experiment contract. `krish-design` owns visual taste. `krish-content-marketer` owns paywall, landing and upgrade copy and angles, then `krish-voice` owns the final prose. `ux-foundations` owns accessibility and generic UX standards, and the data-retention sense of "retention". `evidence-research` owns external benchmarks. It never produces UI, copy or code.

Registry: add `{name: consumer-app-outcomes, role: lifecycle-outcome-context-and-evidence-loop, owner: Krish Raja, reviewed: <admission date>, freshness_sla_days: 90}` to `production` and the name to `production_active`, and raise `expected_skill_count` to 30 in the same commit. Move the trigger and behaviour suites from `evals/candidates/` to `evals/`, add a `narrowOperatorSpecs`-style minimums entry in `Test-Harness.ps1`, and add two cases to `evals/skill-routing-cases.jsonl`.
