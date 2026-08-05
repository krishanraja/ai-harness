# App runtime verification patterns

Use this reference only for the matching implementation boundary. Resolve the current provider, repository instructions, target environment, auth posture, and supported tooling before applying a pattern. Do not copy project IDs, endpoints, credentials, or permissions from historical playbooks.

## Pattern selector

| Boundary | Use this pattern | Required proof |
|---|---|---|
| Remote schema or data mutation | Apply, independent readback, bounded cleanup | Catalog/data query against the named target |
| Presentational component range | Synthetic fixture-render harness | Current render at intended widths plus deterministic overflow checks |
| User-authenticated runtime | Designated test account in the approved browser surface | Authenticated DOM/behavior, persisted state, and pixels when visual |
| Edge or serverless function | Type/static check, explicit auth posture, deployed invocation | Response contract and downstream effect readback |
| SPA shell or build-time flag | Origin-cache and build artifact verification | Live headers, deployed revision, and actual gated behavior |

## Shared invariants

1. Name the exact target and environment before mutation.
2. Define the pass signal, rollback, and authoritative readback before execution.
3. Keep authentication in the approved secret/runtime layer. Never place a value in a command transcript, fixture, report, skill, or committed file.
4. Prefer a preview, emulator, transaction, dry run, or rows created specifically for the test. Never use arbitrary production user data as a fixture.
5. Treat an accepted command, HTTP success, green deployment, advancing UI, or screenshot as partial evidence only.
6. After a located failure, correct the smallest root cause within authority, then rerun the failed check and adjacent checks.
7. Separate confirmed, inferred, deferred, and blocked results.

## Remote database mutation

Use the provider's current official connector or CLI when repository migration history and target identity are trustworthy. Use a management API fallback only when the provider documents it and the current tool path has been reviewed.

1. Put non-trivial SQL in a real temporary `.sql` file so quoting and procedural delimiters do not cross shell interpolation layers.
2. Encode the request body from that file with a structured serializer; do not assemble JSON with string concatenation.
3. Make repeatable DDL idempotent where supported. Query catalog state before objects that lack safe conditional creation.
4. Apply to the named project and environment.
5. Run a second, independent query against catalog or application data. For DDL, inspect columns, indexes, policies, functions, or constraints. For a data effect, count affected rows and read a bounded sample.
6. If an end-to-end proof needs test rows, create only designated synthetic rows, assert the effect, restore or remove them, then read back zero residue. Production seeding or broad mutation still requires exact approval.
7. Remove temporary payloads after verification without touching unrelated files.

The mutation is not confirmed until readback proves the intended state in the intended target.

## Component fixture-render harness

Keep data-loading containers separate from pure presentational components. Feed the presentational layer synthetic fixtures that cover its content contract:

- minimum and maximum values;
- every enum or material state;
- empty, quiet, loading, error, stale, and partial states;
- longest realistic text and one unbroken token;
- narrow and wide intended containers;
- motion disabled at final visual state where animation would make capture nondeterministic.

Expose the harness locally or on an access-controlled preview by default. If a deployed unlinked route is genuinely required, use synthetic data, exclude it from navigation and search indexing, and obtain the repository's normal release authority. "Unlinked" alone is not an access control.

Verify with both deterministic layout signals and rendered evidence. Confirm the render artifact is new before judging it. Read high-resolution crops at actual component widths; a downscaled whole-page image can hide cramping. If content exists in the DOM but the capture is blank, inspect animation/visibility before changing layout. Fix repeated failures in the component, token, content contract, or shared system, not only in the example fixture.

## Authenticated runtime path

Use a designated test account and the browser surface authorized for the task. Keep credentials in its supported login or secret flow.

1. Verify the authenticated state through a known user-only signal, not merely a successful login request.
2. Execute the primary user task at the target deployment and viewport.
3. Assert the behavior that matters, including disabled/error/recovery paths where applicable.
4. Read back authoritative persisted state after save, navigation, refresh, or return.
5. Capture high-resolution pixels when visual fidelity is part of the claim.
6. Redact or recapture if evidence contains private user or customer data.

If no safe account or data exists, verify the ungated mechanics and report the gated outcome as unverified. Do not substitute a privileged service token for a user-session path.

## Edge or serverless function

1. Run the repository's current type, static, unit, and contract checks. Classify unrelated pre-existing failures instead of silently treating them as caused by the change.
2. Choose authentication deliberately. User endpoints retain user verification. Machine endpoints require a reviewed service-auth boundary; disabling platform JWT verification is not itself authentication.
3. Deploy only to the named project/environment under the request's authority.
4. Invoke the deployed function with the intended auth class and assert response status, media type, schema, and bounded body content.
5. Read back the downstream effect independently when the function writes state.
6. For a user-session wrapper that cannot be invoked safely, extract new pure logic for local testing and mark the live wrapper unverified until an authenticated runtime check is available.

## SPA cache and build-time environment flags

First distinguish among a browser cache, a stale CDN/app shell, the wrong deployment, a disabled flag, and a surface that was never changed.

- Serve the HTML shell with revalidation or `no-store` when freshness is required.
- Serve content-hashed static assets with long-lived immutable caching.
- Treat frontend build-time variables as baked artifacts; changing the environment without a rebuild cannot alter the deployed bundle.
- Verify the live shell headers, the deployed revision/artifact, and the feature behavior itself.
- Do not deflect a user's report onto their browser. Inspect the named production surface and origin evidence first.

## Minimum evidence record

```text
TARGET: [environment, project, revision]
AUTHORITY: [allowed mutations and remaining gates]
PASS SIGNALS: [defined before execution]
EXECUTION: [what ran]
READBACK: [independent authoritative evidence]
VISUAL: [viewport and current artifact, if applicable]
CLEANUP/ROLLBACK: [result or readiness]
STATUS: [confirmed | inferred | deferred | blocked]
```
