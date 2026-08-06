# Apify API contract

Primary-source facts last verified: 2026-08-05. Recheck the linked current official documentation before consequential execution.

## Authentication and identity

- API base: `https://api.apify.com/v2`.
- Apify recommends `Authorization: Bearer <token>`; URL query tokens are less secure because URLs can enter history and logs.
- A named Actor path identifier uses `username~actor-name`. Official clients accept `username/actor-name`.
- Source: [Apify API v2](https://docs.apify.com/api/v2).

## Run modes

- Async start: `POST /v2/actors/{actorId}/runs`, then poll `GET /v2/actor-runs/{runId}` and retrieve the documented output via returned storage IDs.
- Sync dataset items: `POST /v2/actors/{actorId}/run-sync-get-dataset-items`.
- Sync requests wait at most 300 seconds. A 408 is an HTTP timeout; the documentation warns that a broken connection leaves the caller without run information. It must not be treated as proof the underlying run stopped.
- Source: [Run Actor synchronously and get dataset items](https://docs.apify.com/api/v2/actor-run-sync-get-dataset-items-post).

## Cost controls

- `maxItems` specifies the maximum dataset items charged for pay-per-result Actors. It does not guarantee the Actor returns only that number and applies only to pay-per-result charging.
- `maxTotalChargeUsd` specifies the maximum total run charge and is the cross-pricing-model dollar ceiling exposed by the REST run endpoints.
- Pay-per-event Actors can charge different named events; an event need not equal one result row. Platform usage may or may not be included. Inspect the current Actor pricing surface.
- Apify is sunsetting the rental model during 2026, with remaining rental Actors scheduled to migrate to pay-per-usage on 2026-10-01. Never preserve rental break-even advice as durable canon.
- Sources: [sync run parameters](https://docs.apify.com/api/v2/actor-run-sync-get-dataset-items-post), [Actors in Store](https://docs.apify.com/actors/running/actors-in-store).

## Input and build

- The official Python Actor client exposes `validate_input` and run methods supporting a build selector, `max_items`, and `max_total_charge_usd`.
- Validate against the actual build's input schema. Examples and READMEs can drift.
- Sources: [Python ActorClient](https://docs.apify.com/api/client/python/reference/class/ActorClient), [Get Actor](https://docs.apify.com/api/v2/act-get).

## Dataset pagination

- Dataset item responses expose `X-Apify-Pagination-Offset`, `X-Apify-Pagination-Limit`, `X-Apify-Pagination-Count`, and `X-Apify-Pagination-Total` headers.
- `clean=true` skips hidden and empty items. The official docs warn that a cleaned response can contain fewer records than `limit`; short length alone is therefore not a safe completion signal.
- Official clients provide `iterate_items` to paginate automatically.
- Sources: [Get dataset items](https://docs.apify.com/api/v2/dataset-items-get), [Python pagination](https://docs.apify.com/api/client/python/docs/concepts/pagination).

## Status, storage, and cost evidence

- A run object exposes terminal status and default dataset, key-value-store, and request-queue IDs. Actors may put material output outside the default dataset; follow the Actor's documented contract and logs.
- `usageTotalUsd` represents what the run owner actually pays when available. Apify states completed-run aggregate usage/cost fields are eventually consistent and recommends waiting about ten seconds and refetching when finalized totals matter.
- Source: [Manage Actor runs](https://docs.apify.com/api/v2/actor-runs).

## Safe retry classification

- Poll and dataset GET requests are idempotent reads and may use a bounded retry budget for 429/transient 5xx responses.
- Creating a run is a consequential POST. A lost response can be ambiguous; automatic POST retry can create a duplicate paid run. Reconcile the original run first, then require new approval if another run is needed.
- Aborting, resurrecting, rebooting, deleting, or metamorphosing a run are separate mutations and are not implied by authority to start or read one.
