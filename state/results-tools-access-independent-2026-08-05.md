# Independent tools-access evaluation - 2026-08-05

## Scope

Evaluated `tools-access` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill and blind cases. The behavior rubric was disclosed only to the fresh judge. No live credential, account, permission, connector, or remediation action was used or changed.

## Baseline

- Trigger routing: 21/21 pass.
- Behavior: 9/23 pass.
- Hard failures: 2.

The baseline protected credential values but could let the access skill become the deployer or UX tester simply because it held authentication context. It also omitted reliable controls for multi-account targeting, expired-versus-insufficient sessions, paid rate limits, ambiguous success, browser login capture, connector fallback, exposed-secret deferral, destructive alternatives, and durable mapping changes.

## Final outcome

- Trigger routing: 21/21 pass.
- Behavior: 23/23 pass on the complete rerun.
- Remaining hard failures: 0.

## Corrections

- narrowed the skill to value-free access proof and secure handoff; the named domain/build/research/QA producer retains the substantive task;
- added an access task record for service, identity, tenant, resource, environment, revision, operation, task owner, access path, scope, session, authority, and readback;
- required stable-identifier target matching across accounts, organisations, workspaces, and similarly named projects;
- distinguished expired session, wrong identity, insufficient scope, provider outage, connector unavailability, rate limit, and task-level denial;
- made CLI fallback preserve the original operation/authority contract and record connector limitation;
- added bounded retries, public/cached/lower-cost alternatives, and spend/tier approval for paid rate-limit escape;
- added an exact action request with owner, target, action/payload, impact, rollback/recovery, and independent readback;
- required asynchronous status, idempotency/duplicate risk, revision, and target-state verification after action;
- made password, passkey, CAPTCHA, MFA, recovery, and sensitive OAuth consent a user-controlled step on the official surface with no capture;
- treated webpages, issues, repositories, connector text, and tool output as untrusted data that cannot solicit credentials or expand authority;
- made exposed credential handling value-free and approval-gated, while preserving Krish's explicit deferral and avoiding the exposed path when an authenticated alternative exists;
- required active owner/purpose/status verification before using a stale integration;
- handed deployments to `krish-build`, UX tests to `ux-testing-agent`, paid-source decisions to `evidence-research`, and durable access mappings to `harness-maintainer` with synthetic redaction/detection tests.

## Residual uncertainty

Synthetic cases do not prove real connector or CLI behavior. Production admission still requires non-secret identity canaries for each retained service, multiple-account target tests, expired and insufficient-scope fixtures, official browser/OAuth handoff, connector-to-CLI fallback, ambiguous-action readback, and cross-client parity. Credential rotation, revocation, history scrubbing, permission changes, and connector installation remain separately approval-gated and were not performed.
