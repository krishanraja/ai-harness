#!/usr/bin/env python3
"""Append one observed result to references/evidence-log.jsonl.

The log is append-only. To withdraw a wrong row, append a retraction:

  python scripts/record_result.py --record retention.gone-after-day-one --product mm-ctrl \
      --level 1 --design rct --metric "day-two return" --result supported \
      --summary "Visible unfinished progress lifted day-two return; no guardrail moved." \
      --source-ref "experiment dashboard export 2026-10-12" --observed-at 2026-10-12

  python scripts/record_result.py --retracts ev-2026-10-12-01 --summary "Wrong cohort window." \
      --source-ref "analysis rerun 2026-10-14"

Use --dry-run to print the row without writing it.
"""
import argparse
import datetime
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import catalog as C  # noqa: E402
import validate as V  # noqa: E402


def next_id(rows, day):
    prefix = f'ev-{day}-'
    taken = [int(r['id'][len(prefix):]) for r in rows if str(r.get('id', '')).startswith(prefix) and r['id'][len(prefix):].isdigit()]
    return f'{prefix}{max(taken, default=0) + 1:02d}'


def build_row(args, rows, today):
    recorded_at = today.isoformat()
    if args.retracts:
        target = next((r for r in rows if r.get('id') == args.retracts), None)
        if not target:
            raise SystemExit(f'no evidence row {args.retracts} to retract')
        row = {k: target[k] for k in ('record_id', 'product', 'evidence_level', 'design', 'primary_metric')}
        row.update(observed_at=recorded_at, result='retracted', retracts=args.retracts)
    else:
        missing = [flag for flag, value in (('--record', args.record), ('--product', args.product), ('--level', args.level),
                                            ('--design', args.design), ('--metric', args.metric), ('--result', args.result))
                   if value in (None, '')]
        if missing:
            raise SystemExit(f'missing {", ".join(missing)}')
        row = {'record_id': args.record, 'product': args.product, 'evidence_level': args.level, 'design': args.design,
               'primary_metric': args.metric, 'result': args.result, 'observed_at': args.observed_at or recorded_at}
        if args.effect:
            row['effect'] = args.effect
        if args.guardrail_breach:
            row['guardrail_breaches'] = args.guardrail_breach
        if args.decision_ledger_id:
            row['decision_ledger_id'] = args.decision_ledger_id
    row.update(recorded_at=recorded_at, recorded_by=args.recorded_by, summary=args.summary, source_ref=args.source_ref)
    ordered = {'id': next_id(rows, recorded_at)}
    for key in C.EVIDENCE_REQUIRED + C.EVIDENCE_OPTIONAL:
        if key in row:
            ordered[key] = row[key]
    return ordered


def main(argv=None, today=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--record', help='catalog record id')
    parser.add_argument('--product', help='lowercase product code, never a client or person name')
    parser.add_argument('--level', type=int, choices=[1, 2, 3, 4], help='evidence ladder level (1 strongest)')
    parser.add_argument('--design', choices=sorted(C.DESIGNS))
    parser.add_argument('--metric', help='primary metric the result is about')
    parser.add_argument('--result', choices=sorted(C.RESULTS - {'retracted'}))
    parser.add_argument('--summary', required=True)
    parser.add_argument('--source-ref', required=True, help='where the underlying evidence lives')
    parser.add_argument('--observed-at', help='YYYY-MM-DD the result was observed (default today)')
    parser.add_argument('--effect', help='effect size and interval as reported, if any')
    parser.add_argument('--guardrail-breach', action='append', help='name of a breached guardrail; repeatable')
    parser.add_argument('--decision-ledger-id')
    parser.add_argument('--retracts', help='evidence id to withdraw')
    parser.add_argument('--recorded-by', default='Krish Raja')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args(argv)

    rows, errors = C.load_evidence()
    if errors:
        raise SystemExit('evidence log is unreadable; fix it first:\n' + '\n'.join(errors))
    row = build_row(args, rows, today or datetime.date.today())

    problems = []
    record_ids = {r['id'] for r in C.load_catalog()['records']}
    V.check_evidence(rows + [row], record_ids, problems)
    if problems:
        print('REFUSED: the row would fail validation', file=sys.stderr)
        print('\n'.join(f'- {p}' for p in problems), file=sys.stderr)
        return 1

    line = json.dumps(row, ensure_ascii=False, separators=(', ', ': '))
    if args.dry_run:
        print(line)
        return 0
    with C.EVIDENCE_PATH.open('a', encoding='utf-8', newline='\n') as handle:
        handle.write(line + '\n')
    grouped = C.evidence_by_record(rows + [row])
    print(f'appended {row["id"]}; {row["record_id"]} is now {C.status_for(grouped.get(row["record_id"], []))}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
