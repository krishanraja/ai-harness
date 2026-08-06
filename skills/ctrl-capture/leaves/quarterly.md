# Scheduled freshness and regression pass

Run on the owner-configured cadence. The purpose is to distinguish source change, evaluator change, deployment drift, changing work mix, and real standard drift—not to manufacture quarterly movement.

## Establish version and exposure

Record:

- accepted source standard version/hash;
- built package/release hash;
- deployed revision and observed runtime per surface;
- prior known-good and rollback state;
- review count by applicable surface/criterion;
- human dispositions and opportunity denominators;
- evaluation-set identity and first-open history.

Do not compare metrics until source/build/deploy/runtime identity and exposure are known. A stale surface can look like a bad criterion.

## Holdout versus regression

A sealed holdout is opened once to estimate a frozen package. After first open, label it a disclosed regression set. It may compare versions for regression, but its repeated score is not a new unbiased baseline and it must never train revisions.

For a new unbiased estimate, reserve a new untouched set before analysis. Record ids/hash, selection, class balance, first-open time, and separation from training and runtime exemplars.

## Metrics

When ground truth and gate outputs exist, report raw confusion counts and denominators before rates:

```text
TP = owner rejects; gate breaks
FP = owner accepts; gate breaks
FN = owner rejects; gate holds
TN = owner accepts; gate holds
```

Then, only with non-zero denominators:

```text
precision = TP / (TP + FP)
recall = TP / (TP + FN)
TNR = TN / (TN + FP)
```

If a denominator is zero, report `undefined`, not 0 or 1. Include sample/class counts, missing/unknown dispositions, standard/reviewer versions, and whether results are fresh holdout, disclosed regression, or live monitoring. Do not collapse to one agreement number or promise a target unsupported by this subject/surface.

## Diagnose change

Compare frozen and candidate versions on the disclosed regression set, then seek independent fresh evidence. Improvement requires better agreement with owner judgments under comparable exposure, not merely agreement with the prior gate.

Track false positives, false negatives, uncovered observations, routing misses, and repeat method corrections. Separate changed work mix and reviewer implementation from changed owner standard.

## Freshness and retirement

For a non-firing criterion, report applicable opportunity count, last meaningful exposure, last human confirmation, consequence if removed, dependencies, and any evidence that it is preventative. With zero/unknown opportunities, make no retirement inference.

Ask the owner `retain / revise / gather evidence / retire`; do not retire automatically. An accepted retirement still goes through versioned Compile/Build/fresh Check/release and rollback gates.

## Post-release effectiveness

Verify the intended release is actually active on each measured surface. Compare pre/post recurrence and false positives using opportunity denominators and a declared window. Mark:

- `effective`: target recurrence declined without unacceptable new failures;
- `ineffective`: target persists or worsens under adequate exposure;
- `uncertain`: exposure, parity, disposition, or time is insufficient.

Preserve the original proposal and decision. An ineffective change produces an owner rollback/new-diagnosis proposal, not a silent rewrite.
