# Locked revision protocol

Use this protocol when a project needs durable non-regression controls rather than a one-off careful edit.

## State model

```text
immutable baseline
        |
approved declarative delta
        |
candidate generated from baseline
        |
full allowed-diff verification
        |
incremental rebuild
        |
format-specific QC and release manifest
```

The baseline, delta, candidate, validation report, and release manifest are separate artifacts. A workbook, rendered video, exported PDF, or compiled binary is a delivery artifact, not an editable source of truth.

## Delta structure

The bundled JSON scripts accept a revision specification shaped like this:

```json
{
  "schema_version": 1,
  "revision": "v11",
  "baseline": {
    "path": "releases/v10/source.json",
    "sha256": "EXPECTED_BASELINE_HASH"
  },
  "candidate": {
    "path": "releases/v11/source.json"
  },
  "operations": [
    {
      "id": "change-approved-copy",
      "target": {
        "collection": "shots",
        "key": "shot_id",
        "value": "F07B"
      },
      "before": {
        "on_screen_text": "Old approved text"
      },
      "after": {
        "on_screen_text": "New approved text"
      }
    }
  ],
  "file_invariants": [
    {
      "baseline": "work/v10/unchanged.bin",
      "candidate": "work/v11/unchanged.bin"
    }
  ],
  "required_files": ["releases/v11/source.json"],
  "report": "releases/v11/nonregression.json",
  "build_scope": ["affected-component"]
}
```

Use `{"root": true}` as the target for top-level fields. Otherwise the target selects exactly one object from a top-level collection. Every field present in `after` must also be present in `before`; this makes stale assumptions fail before mutation.

Paths resolve relative to the revision-specification file. Store project specifications where those relative paths stay stable.

## Validation gates

Always require:

- the expected baseline hash;
- exact baseline-plus-delta equality;
- existence and parseability of referenced sources;
- preservation of the previous release;
- a new release manifest.

Add format-specific gates where relevant:

- Video: integer frame continuity, fixed downstream boundaries, audio hashes, crop/orientation contact sheets, duplicate and near-duplicate audit, and stream probes.
- Documents: semantic text diff, style/layout render comparison, link and field validation.
- Spreadsheets: formula/value/style diff by stable cell address or table key, recalculation, and error-cell audit.
- Code: AST or source diff, tests, build, lint, and dependency-lock comparison.
- Images/designs: dimensions, color/profile metadata, focal-point crops, perceptual hashes, and visual contact sheets.

## Incremental builds

Map canonical sources to their downstream artifacts. Rebuild only nodes reachable from a changed source. Preserve unaffected cached artifacts byte-for-byte. For media pipelines, prefer independently encoded closed segments at each delivery resolution so unchanged sections can be concatenated without a full encode.

## Release gate

A release may be marked current only when:

1. the semantic diff contains exactly the approved changes;
2. all required files exist;
3. every declared invariant passes;
4. format-specific QC passes;
5. the release manifest verifies against disk.

If a gate fails, keep the previous release current and report the evidence. Do not widen the allowlist merely to make the candidate pass.
