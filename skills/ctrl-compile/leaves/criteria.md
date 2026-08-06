# Constructs to criteria

Use the frozen compile policy and training ids only. Do not open, summarise, search, or preview the holdout until the human-readable standard has been accepted and hashed.

## A. Prepare the analysis table

For each construct, retain stable construct/item ids, both verbatim poles, rationale, proposed scope/surface, source/date/situation, authorship or speaker class, and every accepted/rejected/skip/not-applicable grade. Check denominators independently; missing values are not failures.

If a construct has no inspectable artifact feature, keep it as `AWAITING observable`. Do not translate a value such as "thoughtful" into a check without subject-owned evidence of what someone can point to.

## B. Cluster grade behavior, not labels

Two constructs may be redundant when their grades move together across enough shared training items. Declare the agreement/distance method and minimum overlap before calculating it. Roughly `0.8` observed agreement can be an initial review flag; it is not an automatic merge and can be misleading with sparse or imbalanced grades.

- Similar wording with different grade patterns stays separate.
- Different wording with matching patterns becomes a merge candidate, not a forced merge.
- Before merging, inspect provenance, situations, missingness, and whether one confound explains both.
- Preserve parent construct ids and both sets of poles in the merged record.

## C. Write a checkable candidate

```markdown
### C3. Earned claim
- Status: keep / delete / untested
- Scope / surface: person / proposal
- Emergent pole (verbatim): "it has actually seen the client"
- Contrast pole (verbatim): "it could be for anyone"
- Rationale (verbatim): "if they can tell we wrote it before we met them, the rest of it doesn't matter"
- Observable: a named client fact appears before the third paragraph
- Decision rule: holds / breaks / not-applicable; ambiguity is recorded, not forced
- Priority: essential
- Training result: rejected 7/9 fail; accepted 1/11 fail; gap 0.69; KEEP under policy v1
- Provenance: intake v3, construct k001, items s003/s011/s019, 2026-08-04, situated to proposals
```

The short title may be cleaned for usability; the poles and rationale may not. The decision rule must define edge cases and not-applicable handling well enough that an independent reviewer can reproduce it.

Priority is ordinal behavior (`essential`, `pitfall`, `important`, `optional`), not fake arithmetic. Put essential and pitfall checks where they are least likely to be dropped, and test the packaged ordering later.

## D. Run the discrimination test

Against training items only:

```text
reject_fail_rate = rejected items failing / applicable rejected items
accept_fail_rate = accepted items failing / applicable accepted items
gap = reject_fail_rate - accept_fail_rate
```

Starting policy when no calibrated policy exists:

| Condition | Disposition |
|---|---|
| Fewer than 4 applicable rejected or 4 applicable accepted | `untested` |
| Gap below 0.30 | `delete` |
| Gap at least 0.30 and reject fail rate at least 0.50 | `keep` |
| Otherwise | `untested` |

Record these as defaults, the policy version, and all raw counts. Calibrate future thresholds only from separate versioned evidence; never tune a criterion-specific threshold or inspect the holdout to decide.

`untested` means unresolved, not false. Keep it in dispositions and the profile's AWAITING section with the exact evidence needed to resolve it (for example, one additional applicable accepted and rejected item for the named surface); exclude it from active rubric and import criteria. `delete` also remains in the disposition history so the same weak rule is not repeatedly rediscovered.

## E. Audit the set

- **Everything kept:** using training evidence only, look for generic format descriptions, class imbalance, circular coding, and insufficiently varied rejects.
- **Most candidates deleted:** without opening the holdout, inspect pair isolation, confounds, sparse categories, wrong construct attribution, and whether the declared default policy needs future calibration.
- **One criterion explains everything:** without opening the holdout, look for a shared confound such as length, formality, source, or author identity.
- **Contradictory criteria:** scope by surface/situation only when evidence supports it; otherwise leave both visible and unresolved.
- **Too many supported criteria:** apply the declared context budget by splitting surfaces/passes or making lower-priority checks advisory. Do not falsify dispositions.

Every audit conclusion cites the counts and items that support it and identifies any route back to `ctrl-intake`. Always emit the complete disposition ledger plus `deleted / candidates in` as the kill rate, even when the distribution itself is the warning.
