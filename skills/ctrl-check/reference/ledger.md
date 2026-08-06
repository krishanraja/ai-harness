# Observation ledger contract

The default is a visible proposed entry in the review output. Never append silently. A ledger path's existence, a prior convention, or an old instruction does not grant write authority.

## Write authority

Before mutation, require and read back:

```text
TARGET: [exact authorised store/path and owner]
SCHEMA VERSION: [review / method correction / trigger event]
WRITE AUTHORITY: [who approved this append]
PURPOSE + READERS: [why and who can access]
PRIVACY: [allowed fields, pseudonymisation, excerpt rule]
RETENTION / DELETION: [duration and withdrawal path]
SOURCE: [artifact id/version/hash; standard version/hash; criterion id]
```

If any field is missing, return `LEDGER PROPOSAL` only. If authorised, append atomically to the exact target, do not edit prior rows, and read back the new row/id/hash plus store version. Report the write visibly.

## Privacy-minimised review row

```json
{
  "schema_version": 1,
  "observed_at": "2026-08-05T00:00:00Z",
  "artifact_id": "a123",
  "artifact_version": "v4",
  "artifact_sha256": "...",
  "surface": "proposal",
  "standard_version": "v2",
  "criterion_id": "C3",
  "verdict": "breaks",
  "locator": "paragraph 2, opening sentence",
  "safe_excerpt": "optional short redacted excerpt",
  "human_disposition": "unknown",
  "reviewer_version": "ctrl-check-v2"
}
```

Use a stable non-personal artifact id. Do not record who authored the submission. Omit or pseudonymise confidential names, client text, third-party details, and unnecessary personal data. Prefer a locator/hash to a quote; include a short excerpt only when authorised and non-sensitive.

`human_disposition` is `accepted`, `rejected`, or `unknown`. Never infer agreement from silence or from the artifact later changing.

## Other row types

- **Uncovered observation:** same review schema with `criterion_id: uncovered`, a bounded observation, and no invented score.
- **Method correction:** artifact/version, correction class, exact correction, scope, provenance, and human disposition. Route to `ctrl-capture`.
- **Trigger event:** skill/version, fired state, kept state, exact under-trigger phrasing when authorised, and no unrelated conversation content.

Keep schemas separate rather than forcing different evidence into one six-field line.

## Separation and use

The raw ledger is not an input to the current review and never enters the runtime personal skill. `ctrl-capture` reads authorised, privacy-bounded rows on its cadence and proposes changes; it does not treat recurrence as automatic truth.

Writing a row does not update the standard. The accepted path is Capture proposal → owner decision → Compile → Build → independent Check → controlled release.
