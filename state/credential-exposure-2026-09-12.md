# Credential exposure lifecycle, 2026-09-12

## Scope

A legacy inactive n8n skill copy contained a plaintext credential. Exact-value scans
also found authorised local session-history and backup copies of the n8n and Skyvern
credentials. No credential value is recorded in this repository.

## Containment

- The inactive legacy n8n copy was redacted before it was moved to quarantine.
- Active client configuration now uses symbolic user-environment references rather
  than inline values.
- The quarantined catalogue is outside client auto-discovery.

Redaction and symbolic references are containment only. They do not revoke provider
access and are not evidence that the incident is closed.

## Required closure proof

Status: open, approved remediation in progress.

Provider-action owner: Krish. Execution and evidence owner: harness-maintainer.
Deadline: before merge or release of the approved gap-closure batch. Recheck on
every active remediation turn until closed; do not let a scheduled audit substitute
for the provider-side failure proofs.

Closure requires all of the following evidence without recording secret values:

1. Replacement n8n access succeeds against the intended tenant.
2. The superseded n8n credential fails.
3. Skyvern consumers use approved OAuth or replacement access and succeed.
4. The superseded Skyvern credential fails.
5. Exact-value scans of authorised histories and backups return zero residual copies,
   or name any technically inaccessible residual and its containment.

Local containment evidence: on 2026-09-12, exact-value text scans returned zero
residual copies after 31 unique files were scrubbed across the approved Codex,
Claude, Cursor, inactive-agent-catalogue, and historical Downloads harness roots.
Provider rotation and superseded-access failure proofs remain outstanding.

Authority: `state/approvals/2026-09-12-harness-gap-closure.md`.
