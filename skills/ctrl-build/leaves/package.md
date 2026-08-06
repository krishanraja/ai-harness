# Package architecture

## Candidate layout

```text
candidate/<version>/
  runtime/
    <skill-name>/
      SKILL.md
      agents/openai.yaml          optional; only for a validated target
      references/
        core.md
        <surface>.md
        exemplars.md              only authorised runtime examples
      scripts/                    only deterministic, tested helpers
      assets/                     only output resources, never hidden tests
  evaluation/
    trigger-cases.jsonl
    behavior-cases.jsonl
    fixtures/                     redacted/synthetic or separately authorised
    reports/
  adapters/
    <target>/                     only when target syntax/discovery differs
  build-manifest.json
```

The runtime directory is the only installable payload. Evaluation expectations remain a sibling so an executing agent cannot read the answers. Do not ship process notes, changelogs, install guides, raw intake, Compile dispositions, sealed holdouts, or reports inside the skill.

## Progressive disclosure

Keep `SKILL.md` to the essential workflow, selection rules, safeguards, and direct routes. Move detailed surface rubrics and examples into focused references only when they earn their context cost.

- Every required reference is linked directly from `SKILL.md` with when-to-read guidance.
- Do not make a reference depend on another reference for required behavior.
- Provide a conservative fallback in the router: applicable core only, no invented surface rule, explicit AWAITING/clarification or owner route.
- Avoid duplicated rules. One canonical statement and direct references reduce drift.
- Measure the package against the binding target context limit; do not rely on a universal line-count claim.

If supported content exceeds the target budget, keep the accepted core, select only the relevant surface at runtime, split passes when needed, and record material left advisory. Never silently truncate or change evidence disposition.

## Portable frontmatter

The canonical `SKILL.md` uses only:

```yaml
---
name: writing-board-updates
description: "What it does; positive use contexts; important exclusions and guard triggers."
---
```

Follow the current official name rules: lowercase letters, digits, and single hyphens; under 64 characters; starts with a letter; folder exactly matches name. Prefer a short verb-led task name. Validate rather than assuming every client accepts extra fields.

Build status, provenance, baseline, license, compatibility, and release state live in `build-manifest.json` unless a pinned target contract explicitly supports them. This prevents portable frontmatter from carrying unsupported or stale claims.

## Build manifest

Record at least:

- manifest schema/version and deterministic generation method;
- subject-owner decision and Compile source versions/hashes;
- canonical runtime file inventory, byte hashes, encoding, and aggregate hash;
- kept-rule allowlist and AWAITING/untested/deleted/withdrawn exclusions;
- purpose, surfaces, audience, retention, and exemplar authorization;
- compile/baseline/build/review/release statuses as separate fields;
- sealed holdout identity/hash and evaluator-only path, or null;
- target contract versions, adapters, validators, compatibility findings;
- trigger/behavior suite hashes, before/after reports, and residual failures;
- no-deploy status, next owner, expected effect, and rollback requirements.

The build must reproduce the same runtime bytes from the same accepted inputs and plan. Normalize encoding/newlines through the deterministic packager and verify a second build hash before release review.

## Client variants

Maintain one canonical personal-content source. A client adapter may express only current discovery, routing, metadata, or path syntax. It references or is generated from the canonical package, records the source runtime hash and generated field map, and is compared with the canonical semantic manifest on every build. Fail and report any personal-content divergence.

Validate every named target independently. A matching name, date, file count, or semantically similar copy does not prove byte parity, discovery, routing, or behavior. Never infer that one client's canary proves another.

If a target cannot express a canonical behavior without rewriting the personal rules, record incompatibility and stop that variant. Do not create a permanently divergent fork.

## Resource admission

- `references/`: detailed instructions/evidence necessary at runtime and linked directly from the router.
- `scripts/`: repeated deterministic operations; execute representative tests and document inputs/outputs in the manifest.
- `assets/`: output templates/resources, not instructions or evaluation answers.
- `agents/openai.yaml`: generate and validate only for the applicable target, and keep it aligned with `SKILL.md`.
- exemplars: minimal authorised excerpts or redacted derivatives with authorship, situation, audience, provenance id, and retention.

Anything not necessary to execute the skill stays outside runtime.

## Validation stack

1. Portable skill validator for frontmatter/name/folder and package shape.
2. Static checks for links, one-hop references, pointers, duplicate ids, source allowlist, secrets, private fields, forbidden holdout ids, and context size.
3. Deterministic repeat-build and full-directory hash comparison.
4. Target-specific current validators/adapters for each named client.
5. Fresh-context trigger suite against neighboring descriptions.
6. Fresh-context behavior/security/handoff suite with expected answers hidden.
7. Independent `ctrl-check` or harness evaluation of exact frozen bytes.

Failure at any layer keeps release status `candidate`; it never authorises a quick install for testing on live surfaces.
