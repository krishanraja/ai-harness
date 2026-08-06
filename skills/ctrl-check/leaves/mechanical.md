# Reproducible checks

Call a check `MECHANICAL` only when a tool or exact rule can reproduce it against the frozen artifact bytes. Semantic judgments, including clarity, originality, specificity, voice, evidence quality, and whether a sentence is filler, belong in the criterion or house-advisory pass.

## Check record

For every run, record:

```text
ARTIFACT: [id/version/SHA-256]
TOOL OR RULE: [name/version or exact configured pattern]
SCOPE: [files/fields/lines]
RESULT: [pass/fail/error/not-run]
FINDINGS: [exact locator and observed value]
LIMITATION: [false-positive, encoding, unsupported target, or applicability note]
```

Never hide a validator error as a pass. Preserve raw non-sensitive output or its hash so another reviewer can reproduce the finding.

## Valid mechanical classes

- artifact identity, size, byte hash, encoding, and newline policy;
- JSON/YAML/schema parsing and required-field/enumeration checks;
- duplicate ids, missing files, dead links, required direct-reference depth, and referential integrity;
- manifest allowlists, source/runtime/evaluation inventories, and forbidden holdout/runtime intersections;
- exact configured regex/literal checks, with pattern/version and safe excerpt;
- exact counts and length limits supplied by a pinned target contract;
- deterministic scripts, tests, linters, official skill validators, and target-specific current validators;
- high-confidence secret-pattern scans, reported without repeating a secret value.

A regex hit is evidence of a string match, not proof of intent or harm. Report false-positive possibilities and let the applicable policy/criterion determine consequence.

## Text and style

Do not maintain a universal banned-word or machine-writing list here. If the accepted subject standard contains an exact kill list, run its literal members mechanically and cite the criterion. If a separate organisation policy contains a configured list, label it as organisation/house policy, not the person's preference.

Sentence rhythm, paragraph usefulness, genericness, verbosity, claim support, and voice are semantic. Route them to `leaves/judgement.md`, even if a rough counter helps surface candidates.

## Personal skill/package conformance

Use the exact Build manifest and current validators. Check:

- canonical runtime bytes and source lineage;
- portable frontmatter/name/folder rules through the official validator;
- client-specific discovery/metadata only through the pinned target validator;
- direct required references and exact dead/nested-link diagnostics;
- rule-pointer syntax and allowed-id existence (meaning/situation is provenance judgment);
- AWAITING/untested/deleted/withdrawn exclusion inventory;
- runtime exemplar versus sealed evaluation/holdout disjointness;
- secret/privacy patterns and deterministic rebuild hashes.

Do not hardcode an 80-line router, a universal 1024-character description, a push-language requirement, exactly three prompts, or a provider-wide skill-count ceiling. Enforce only the active repository quality contract and pinned current target rules.

## What this pass cannot claim

Mechanical checks can be incomplete, misconfigured, stale, or inapplicable. They prove only what their exact implementation observed on the named bytes. Report `not-run` or `error` honestly, keep semantic findings out, and never call the layer right every time.
