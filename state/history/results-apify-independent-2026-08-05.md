# Independent Apify evaluation - 2026-08-05

## Scope

Evaluated `apify` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill package and blind cases. The behavior rubric was disclosed only to the fresh judge. The 21-trigger/23-behavior suite was added to repository enforcement before the skill was changed. Current API facts were checked against official Apify documentation on 2026-08-05.

## Baseline

- Trigger routing: 21/21 pass.
- Behavior: 1/23 pass across three disjoint unchanged batches.
- Hard failures: 6.

The legacy skill treated stored Actor routes and prices as current, used universal recency/success and rental break-even rules, inferred small-run authority from access/free credit, relied on `maxItems` as a universal cost cap, risked duplicate paid runs after 408/ambiguous starts, stopped cleaned pagination on short pages, guessed around schema conflicts, and crossed into destination writes, research synthesis, workflow deployment, and personal-data collection.

## Final outcome

- Trigger routing: 21/21 pass in one complete final-version routing run.
- Behavior: 23/23 pass across three disjoint final-version batches (8/8, 8/8, 7/7).
- Remaining hard failures: 0.
- Offline helper regression: 8/8 pass with no network or paid run.

The identical cases and expectations were partitioned into fresh executor/judge batches to avoid cross-case response compression; the suite was not weakened. Iterative full-batch failures concerned omitted but present recovery/security clauses. Those safety-critical clauses became mandatory retry, hostile-content, and credential-exposure response envelopes before the complete exact-final-version evidence was recorded.

## Corrections

- replaced the stale preferred-Actor and price catalogue with a live Store/API selection record;
- required target, fields, scope, freshness, destination, data boundary, success, and stop rules before selection;
- required live Actor identity, owner, status, permission, build, schema, storage contract, pricing/events, platform-usage inclusion, and representative-test evidence;
- separated pay-per-result `maxItems` semantics from cross-pricing-model `maxTotalChargeUsd` protection;
- required exact account/Actor/build/input-hash/charge-cap approval for every run, including free-credit tests;
- made run-creation POST non-idempotence, 408 continuation risk, ambiguous-start reconciliation, and new-run approval explicit;
- corrected cleaned-dataset pagination to use official iteration or `X-Apify-Pagination-*` metadata;
- preserved empty success, partial failed-run output, item errors, alternate storage, finalized cost, and schema-drift evidence;
- moved credentials to approved runtime injection under `tools-access`, with no token echo/log/query-string behaviour;
- added hostile-content, session-cookie, private-message, personal-data, retention, suppression, and deletion boundaries;
- restored exclusive downstream ownership for `mindmaker-os`, `krish-build`, `evidence-research`, destination operators, and commercial send owners;
- replaced the dependency-missing helper with a standard-library guarded operator requiring approval and a positive dollar cap;
- added eight offline tests for identity normalization, authority gates, Bearer auth, dual caps, ambiguous starts, bounded GET retry, cleaned pagination, and empty-success preservation.

## Residual uncertainty

No live Actor, Store candidate, account, pricing tier, input schema, run, dataset, key-value store, proxy, cost, or destination was tested. Actor facts remain intentionally dynamic and must be retrieved at task time. Production admission requires a clean deterministic package, one separately approved low-cap non-production canary, exact account/build/input provenance, actual billing and dataset readback, failure/empty/timeout canaries where safe, and active-surface parity. No Apify run, charge, credential, workflow, database, cloud skill, or local client skill was changed.
