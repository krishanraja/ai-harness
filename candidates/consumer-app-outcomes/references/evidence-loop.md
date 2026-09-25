# Evidence loop

The catalog's 60 records are source-derived hypotheses. They stay at the public-practitioner level for good. What changes is the evidence recorded against them. Every intervention shipped from a brief records its result in `evidence-log.jsonl`, whether it worked or not. Over time a record stops saying "a practitioner site suggests this" and says "tested in these products, with these results". Nobody else holds that part.

## Rules

- **Append-only.** Rows are never edited or deleted. A wrong row is withdrawn with a later `retracted` row that names it. `scripts/validate.py --base auto` fails any change that rewrites or truncates earlier rows.
- **Strength lives in the log.** The catalog's `evidence_level` never changes. A record is only as strong as the rows recorded against it.
- **Every result is recorded.** Null, contrary, and harmful results matter more than wins, because they stop the next brief repeating a mistake.
- **No identities.** The log ships inside the skill package. `product` is a short lowercase code such as `mm-ctrl` or `client-07`, never a client or person's name. Free text must not contain email addresses or phone numbers. The mapping from code to client stays in the private Mindmake record.

## Row fields

Required: `id`, `record_id`, `observed_at`, `recorded_at`, `recorded_by`, `product`, `evidence_level` (1 to 4, as on the ladder in `evidence-and-ethics.md`), `design` (`rct`, `quasi-experiment`, `cohort`, `funnel`, `qualitative`, `usability`, `case-study`, `platform-guidance`), `primary_metric`, `result` (`supported`, `null`, `contrary`, `harmful`, `retracted`), `summary`, `source_ref`.

Optional: `effect` (the effect size and interval as reported), `guardrail_breaches` (required for `harmful`), `decision_ledger_id` (link to the consequential decision in `decision-ledger`, once that store is live), `retracts` (only on `retracted` rows).

## Computed status

Retracted rows and the rows they withdraw are ignored.

| Status | Condition |
|---|---|
| `candidate` | No rows. |
| `tested` | At least one row, and none of the conditions below. |
| `supported` | At least two `supported` rows at level 1 or 2, and no `contrary` row. |
| `contested` | At least one `supported` row and at least one `contrary` row. |
| `retired` | Any `harmful` row. Hidden from retrieval unless `--include-retired` is passed. |

`retired` overrides every other status. A harmful result means the mechanism hurt users or breached a guardrail. It needs a new record with a different mechanism, not another attempt at the same one.

## Recording

```bash
python scripts/record_result.py --record <record id> --product <code> --level <1-4> \
  --design <design> --metric "<primary metric>" --result <result> \
  --summary "<one line: what happened, including guardrails>" \
  --source-ref "<where the analysis lives>" --observed-at <YYYY-MM-DD>
```

The script validates the row before writing, refuses anything that would fail, and prints the record's new status. Use `--dry-run` to preview, and `--retracts <evidence id>` to withdraw a row.
