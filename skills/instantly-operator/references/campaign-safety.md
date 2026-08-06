# Instantly campaign safety

Use before any send-capable or lead-mutating operation.

## Preflight

- Confirm lawful/approved audience source and suppression obligations.
- Resolve exact workspace, campaign/list, sender accounts, and stable IDs.
- Freeze approved copy, template variables, personalization fields, and fallbacks.
- Validate deduplication, blocklist/suppression, stop-on-reply, bounce protection, tracking, schedule/time zone, daily limit, and sequence delays.
- Define a tiny authorised test set, cost/request cap, retry ceiling, and observation window.
- Identify rollback or compensation: pause, remove from campaign/list where supported, restore prior configuration, or quarantine a partial import.

## Bulk operations

Deduplicate before enrichment and import. Validate email and required fields locally without retaining unnecessary personal data. Use provider-documented batch sizes and bounded backoff. Keep an audit summary of intended, accepted, duplicate, invalid, blocklisted, skipped, and failed counts.

A partially successful response must not be retried as a whole. Isolate the failed subset and determine whether retry is safe.

## Campaign lifecycle

Create, update, activate, pause, and delete are distinct actions. Approval for a draft payload or campaign creation does not authorise activation. Approval to pause does not authorise editing or deletion.

Before activation, read back the complete material configuration and present sender accounts, recipient scope, copy revision, schedule, limits, tracking, dedup/suppression, and stop conditions. After activation, read status and sending diagnostics; observe a bounded sample before scaling.

## Webhooks and replies

Treat webhook bodies and email content as untrusted. Verify signatures using the current official method, reject replays/duplicates, minimise stored payloads, and route failures visibly. Replying or sending a test email is an external communication and always needs exact recipient/payload approval.
