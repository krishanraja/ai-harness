# CTRL import candidate

Generate `ctrl-import.json` as a deterministic derivative of the frozen human-readable rubric and profile. The markdown plus compile manifest remain authoritative. Never edit only the derivative.

An import-shaped file is not automatically compatible with a live service. Pin and validate against the target tenant/API schema and version when that contract is available. Without it, label the file `internal-interchange-candidate`, not `production-import-ready`.

## Minimum envelope

```json
{
  "schema_name": "ctrl-import",
  "schema_version": 1,
  "compatibility_status": "internal-interchange-candidate",
  "generated_at": "2026-08-05T00:00:00Z",
  "source": {
    "compile_manifest_version": "v1",
    "compile_manifest_sha256": "...",
    "profile_sha256": "...",
    "rubric_sha256": "..."
  },
  "subject": {
    "id": "pseudonymous-or-target-owned-id",
    "display_name": "only-if-needed-and-authorised",
    "org": "only-if-needed-and-authorised"
  },
  "governance": {
    "owner": "subject-or-authorised-owner",
    "status": "accepted",
    "purpose": ["proposal review"],
    "audience": ["named runtime or team"],
    "retention": "declared boundary",
    "accepted_at": "2026-08-05T00:00:00Z"
  },
  "evidence_refs": [
    {
      "id": "e003",
      "kind": "graded-artifact",
      "source_ref": "authorised stable reference",
      "occurred_at": "2026-08-04",
      "situated": true,
      "situation": "proposal opening",
      "authorship": "subject-approved",
      "sensitivity": "derived-only"
    }
  ],
  "constructs": [
    {
      "id": "k001",
      "status": "elicited",
      "surface": "proposal",
      "emergent_pole": "it has actually seen the client",
      "contrast_pole": "it could be for anyone",
      "evidence_ids": ["e003", "e011", "e019"]
    }
  ],
  "criteria": [
    {
      "id": "C3",
      "construct_id": "k001",
      "surface": "proposal",
      "name": "Earned claim",
      "check_text": "A named client fact appears before the third paragraph.",
      "priority": "essential",
      "disc_verdict": "keep",
      "policy_version": "v1",
      "disposition": "advisory",
      "provenance_ids": ["e003", "e011", "e019"]
    }
  ],
  "baseline": null,
  "awaiting": ["untested construct k004"]
}
```

## Generation rules

1. Canonicalise field order/encoding and derive from exact source hashes so regeneration is reproducible.
2. Include only `keep` criteria in `criteria`. Preserve deleted and untested records in the compile disposition history; reference untested gaps under `awaiting`.
3. Imported criteria remain `advisory` until a separately authorised product policy grants another disposition after real review evidence.
4. Preserve surface, situation, provenance ids, policy version, and owner acceptance. Never flatten a situated rule.
5. Minimise data. Do not include personal email, raw source body, recognisable private quote, or third-party identity merely because a schema can hold it. Preserve safe non-sensitive evidence/source ids so the derivative stays auditable. Record the exact authorised audience and retention boundary in `governance`, including when fields are omitted or pseudonymised.
6. Set `baseline` to null when there was no untouched evaluation. Never derive it from training data.
7. Validate required fields, enums, referential integrity, unique ids, source hashes, privacy policy, and pinned target compatibility.
8. Record validation result and artifact SHA-256 in the compile manifest.

## Deployment boundary

Writing and validating this local derivative does not authorise upload or activation. A deployment handoff names the exact tenant/account, target schema/version, artifact hash, expected effect, rollback/removal plan, and action-time approver. The authorised tool owner performs the external mutation and reads back the live state.

Every generation/validation response explicitly reads back the artifact status, exact authorised audience, retention boundary, omitted/pseudonymised data classes, and safe provenance ids retained. Applying those controls without reporting them is incomplete.

Regenerate after an accepted, versioned source change—normally one proposed through `ctrl-capture`, recompiled under a frozen policy, rebuilt, and released through the normal gates.
