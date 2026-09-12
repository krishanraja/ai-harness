# Live Actor selection record

Last reviewed: 2026-09-12. This file intentionally contains no preferred Actor catalogue or price table. Store identity, ownership, availability, schemas, permissions, performance, and pricing are runtime facts.

## Official surfaces

- Store and Actor documentation: `https://apify.com/store`
- Get Actor: `GET https://api.apify.com/v2/actors/{actorId}`
- Validate Actor input: `POST https://api.apify.com/v2/actors/{actorId}/validate-input`
- REST reference: `https://docs.apify.com/api/v2`

For REST named IDs, use `username~actor-name`; official clients accept the human `username/actor-name` form.

## Selection record

Create one record per candidate at task time:

```text
JOB CONTRACT: [purpose, target, required fields, volume, freshness, destination]
ACTOR: [Store URL, owner/name, API ID]
MAINTAINER/OWNER: [current identity and maintained-by class]
STATUS: [available/deprecated/replacement; retrieved_at]
PERMISSION: [limited/full and implications]
BUILD: [default build, candidate pinned build, finished_at]
INPUT: [schema/build, validated exact input, input SHA-256]
OUTPUT: [dataset/KV/other, schema, documented errors]
PRICING: [model, every event/unit, discount tier, platform usage included?]
HEALTH EVIDENCE: [modified_at, current stats/reviews/issues/test result with scope]
DATA RISK: [auth/cookies, proxy, target terms, personal data]
TEST: [representative scope, maxTotalChargeUsd, maxItems applicability]
EXPECTED VALUE: [usable evidence and total/failure cost]
GAPS: [unverified or conflicting facts]
```

No single recency, review, success-rate, run-count, or price threshold works for every job. Weight evidence by target stability, failure cost, data quality, output completeness, maintainer trust, permissions, and the actual representative test.

## Comparison and approval

Compare candidates on the same job contract. Lead with the recommended reversible test and why its expected usable evidence per total dollar dominates—not just its displayed price.

Do not run during selection. The chosen Actor still needs an approval packet naming the exact account, Actor/build, input hash, targets, data boundary, pricing retrieval time, `maxTotalChargeUsd`, applicable `maxItems`, and readback plan.

If the Actor is missing, renamed, deprecated, transferred, permission-elevated, repriced, or schema-changed, invalidate the stored route. A replacement is a new consequential choice and needs a new comparison and approval.
