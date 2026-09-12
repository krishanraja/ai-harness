# Provider contract review, 2026-09-12

This record supports the 2026-09-12 freshness dates. It records retrieval and
verification separately from the durable provider instructions.

## Apify

Retrieved the official API v2 reference and linked operation pages on 2026-09-12.
Confirmed Bearer authentication, asynchronous Actor run creation, synchronous
dataset-item execution, the 300-second synchronous wait limit, ambiguous HTTP 408
handling, `maxItems`, `maxTotalChargeUsd`, dataset pagination headers, and the
2026-10-01 rental-model retirement schedule.

Sources:

- https://docs.apify.com/api/v2
- https://docs.apify.com/api/v2/actor-run-sync-get-dataset-items-post
- https://docs.apify.com/actors/running/actors-in-store
- https://docs.apify.com/api/v2/dataset-items-get

Verification: eight local Apify contract tests passed on 2026-09-12. No paid run or
provider mutation was performed.

## n8n

Retrieved the official public API, execution, security-audit, and source-control
documentation on 2026-09-12. Confirmed that saved and published workflow states are
distinct, source control pushes the saved version, execution history supports
status-bounded diagnosis, and current tenant and node schemas must be resolved live.

Sources:

- https://docs.n8n.io/api/
- https://docs.n8n.io/workflows/executions/all-executions/
- https://docs.n8n.io/hosting/securing/security-audit/
- https://docs.n8n.io/source-control-environments/create-environments/

Verification: the intended n8n Cloud tenant returned HTTP 200 to a least-privilege
workflow-list read on 2026-09-12. No workflow mutation was performed during review.

## Instantly

Retrieved the official API v2 reference and lead endpoints on 2026-09-12. Confirmed
Bearer authentication, POST `/api/v2/leads/list`, forward cursor pagination through
`next_starting_after`, the documented lead-read scopes, and the mutually exclusive
campaign/list target with a maximum 1,000 leads on the bulk-add endpoint.

Sources:

- https://developer.instantly.ai/api-reference
- https://developer.instantly.ai/api-reference/lead/list-leads
- https://developer.instantly.ai/api-reference/lead/add-leads-in-bulk-to-a-campaign-or-list

No send, activation, lead mutation, or campaign mutation was performed.

## Design intelligence

The pinned vendor directory retained its recorded aggregate. Five adapter tests and
36 vendor tests passed. Upstream head and latest tag observations are recorded in
`skills/design-intelligence-search/references/upstream-provenance.json`; upstream
drift was observed but not promoted.
