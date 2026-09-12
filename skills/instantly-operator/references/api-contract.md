# Instantly API contract and freshness

Last evidence review: 2026-09-12. Recheck the exact official endpoint page before any external mutation.

## Primary sources

- Documentation index: https://developer.instantly.ai/llms.txt
- API reference: https://developer.instantly.ai/api-reference
- List campaigns: https://developer.instantly.ai/api-reference/campaign/list-campaign
- List leads: https://developer.instantly.ai/api-reference/lead/list-leads
- Add leads in bulk: https://developer.instantly.ai/api-reference/lead/add-leads-in-bulk-to-a-campaign-or-list
- Campaign analytics: https://developer.instantly.ai/api-reference/campaign/get-campaigns-analytics
- Background jobs and other resources: discover from the current documentation index rather than guessing a path.

## Verified orientation, not a substitute for live docs

At the review date, the official examples use `https://api.instantly.ai/api/v2/` with Bearer authentication. Campaign listing and analytics are GET routes. Lead listing is a POST route because filters live in the request body. Bulk lead addition uses a dedicated POST route, accepts up to the provider-documented maximum, and requires a campaign or list target according to the live schema.

These facts can change. Before acting, confirm:

- current base URL and version;
- verb and exact path;
- required and mutually exclusive fields;
- required OAuth/API-key scope;
- pagination cursor location and terminal signal;
- rate limits and retry guidance;
- synchronous response versus background job;
- documented status/filter enum values;
- workspace, plan, and feature constraints.

Never copy a credential value, endpoint payload containing personal data, or live provider identifiers into this package or an evaluation fixture.

## Error handling

Interpret errors from current official documentation and value-minimised response metadata. Distinguish authentication, insufficient scope, wrong workspace/resource, invalid schema, method/path mismatch, rate limit, billing/plan restriction, transient provider failure, and unsafe imported instructions. Do not solve an authentication failure by trying broader or leaked credentials.
