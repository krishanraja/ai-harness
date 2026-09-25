#!/usr/bin/env python3
"""Validate the catalog, its source ledger and the append-only evidence log.

Every count and invariant here is derived from the data rather than hard-coded,
so adding a record or a stack is a data change, not a validator change.

  python scripts/validate.py                 structural checks only
  python scripts/validate.py --base auto     also prove the evidence log is append-only against git
  python scripts/validate.py --base <ref>    ...against an explicit ref
"""
import argparse
import datetime
import json
import pathlib
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import catalog as C  # noqa: E402

MIN_RECORDS_PER_STACK = 3
MIN_GUARDRAILS = 2


def check_catalog(cat, ledger, errors):
    raw = C.CATALOG_PATH.read_text(encoding='utf-8')
    if raw != C.format_catalog(cat):
        errors.append('outcome-catalog.json is not canonically formatted; run scripts/catalog.py format')

    stack_names = C.stacks(cat)
    if len(stack_names) != len(set(stack_names)):
        errors.append('duplicate stack in stack_outcomes')
    outcome_by_stack = {s['stack']: s['outcome'] for s in cat['stack_outcomes']}

    problem_sources = {row['id']: row for row in ledger['records'] if row.get('kind') == 'problem'}
    seen_ids, seen_sources, per_stack = set(), set(), {}
    for r in cat['records']:
        rid = r.get('id', '<missing id>')
        keys = set(r)
        if keys != set(C.RECORD_KEYS):
            errors.append(f'{rid}: fields must be exactly {C.RECORD_KEYS}; got extra {sorted(keys - set(C.RECORD_KEYS))} missing {sorted(set(C.RECORD_KEYS) - keys)}')
            continue
        for key in C.RECORD_KEYS:
            if not r[key]:
                errors.append(f'{rid}: empty {key}')
        if rid in seen_ids:
            errors.append(f'{rid}: duplicate id')
        seen_ids.add(rid)
        if r['stack'] not in outcome_by_stack:
            errors.append(f'{rid}: unknown stack {r["stack"]}')
            continue
        per_stack[r['stack']] = per_stack.get(r['stack'], 0) + 1
        if r['target_outcome'] != outcome_by_stack[r['stack']]:
            errors.append(f'{rid}: target_outcome differs from its stack outcome')
        if not rid.startswith(f'{r["stack"]}.') or not C.PRODUCT_CODE.match(rid.split('.', 1)[1]):
            errors.append(f'{rid}: id must be <stack>.<lowercase-slug>')
        if r['evidence_level'] != C.BASE_EVIDENCE_LEVEL:
            errors.append(f'{rid}: catalog evidence_level must stay {C.BASE_EVIDENCE_LEVEL}; stronger evidence belongs in evidence-log.jsonl')
        if len(r['guardrails']) < MIN_GUARDRAILS:
            errors.append(f'{rid}: needs at least {MIN_GUARDRAILS} guardrails')
        source = problem_sources.get(r['source_id'])
        if not source:
            errors.append(f'{rid}: source_id {r["source_id"]} is not a problem page in source-ledger.json')
            continue
        if r['source_id'] in seen_sources:
            errors.append(f'{rid}: source_id {r["source_id"]} is cited by more than one record')
        seen_sources.add(r['source_id'])
        if source['url'] != r['source_url']:
            errors.append(f'{rid}: source_url does not match the ledger URL for {r["source_id"]}')
        if source.get('stack') != r['stack']:
            errors.append(f'{rid}: ledger places {r["source_id"]} in stack {source.get("stack")}')

    for stack in stack_names:
        if per_stack.get(stack, 0) < MIN_RECORDS_PER_STACK:
            errors.append(f'stack {stack} has {per_stack.get(stack, 0)} records; minimum is {MIN_RECORDS_PER_STACK}')
    for orphan in sorted(set(problem_sources) - seen_sources):
        errors.append(f'source-ledger problem page {orphan} is cited by no record')
    return seen_ids


def check_ledger(cat, ledger, errors):
    root = ledger.get('source_root', '')
    ids = [row.get('id') for row in ledger['records']]
    if len(ids) != len(set(ids)):
        errors.append('source-ledger.json has duplicate ids')
    kinds = {}
    for row in ledger['records']:
        kinds.setdefault(row.get('kind'), []).append(row)
        if not str(row.get('url', '')).startswith(root) or not root:
            errors.append(f'{row.get("id")}: URL outside the source root')
        if row.get('http_status') != 200:
            errors.append(f'{row.get("id")}: last readback was not HTTP 200')
        if not row.get('title') or not C.DATE.match(str(row.get('checked_at', ''))):
            errors.append(f'{row.get("id")}: missing title or checked_at')
    if len(kinds.get('index', [])) != 1:
        errors.append('source-ledger.json needs exactly one index page')
    stack_rows = {row.get('stack') for row in kinds.get('stack', [])}
    for stack in C.stacks(cat):
        if stack not in stack_rows:
            errors.append(f'source-ledger.json has no stack page for {stack}')


def check_evidence(rows, record_ids, errors):
    seen = {}
    for position, row in enumerate(rows):
        eid = row.get('id', f'<row {position + 1}>')
        missing = [key for key in C.EVIDENCE_REQUIRED if key not in row or row[key] in ('', None)]
        unknown = sorted(set(row) - set(C.EVIDENCE_REQUIRED) - set(C.EVIDENCE_OPTIONAL))
        if missing or unknown:
            errors.append(f'{eid}: missing {missing} unknown {unknown}')
            continue
        if eid in seen:
            errors.append(f'{eid}: duplicate evidence id')
        if row['record_id'] not in record_ids:
            errors.append(f'{eid}: record_id {row["record_id"]} is not in the catalog')
        for key in ('observed_at', 'recorded_at'):
            if not C.DATE.match(str(row[key])):
                errors.append(f'{eid}: {key} must be YYYY-MM-DD')
        if C.DATE.match(str(row['observed_at'])) and C.DATE.match(str(row['recorded_at'])):
            if row['observed_at'] > row['recorded_at']:
                errors.append(f'{eid}: observed after it was recorded')
            if row['recorded_at'] > datetime.date.today().isoformat():
                errors.append(f'{eid}: recorded_at is in the future')
        if row['evidence_level'] not in (1, 2, 3, 4):
            errors.append(f'{eid}: evidence_level must be 1-4; level 5 is what the catalog already is')
        if row['design'] not in C.DESIGNS:
            errors.append(f'{eid}: design must be one of {sorted(C.DESIGNS)}')
        if row['result'] not in C.RESULTS:
            errors.append(f'{eid}: result must be one of {sorted(C.RESULTS)}')
        if not C.PRODUCT_CODE.match(str(row['product'])):
            errors.append(f'{eid}: product must be a lowercase product code, not a name')
        if any(C.IDENTIFYING.search(str(row.get(key, ''))) for key in C.FREE_TEXT):
            errors.append(f'{eid}: contains an email address or phone number; the log ships inside the skill package')
        breaches = row.get('guardrail_breaches', [])
        if not isinstance(breaches, list) or not all(isinstance(b, str) and b for b in breaches):
            errors.append(f'{eid}: guardrail_breaches must be a list of names')
        if row['result'] == 'harmful' and not breaches:
            errors.append(f'{eid}: a harmful result must name the guardrail it breached')
        if row['result'] == 'retracted':
            target = seen.get(row.get('retracts'))
            if not target:
                errors.append(f'{eid}: retracts must name an earlier evidence id')
            elif target['result'] == 'retracted':
                errors.append(f'{eid}: cannot retract a retraction')
            elif target['record_id'] != row['record_id']:
                errors.append(f'{eid}: retraction and retracted row name different records')
        elif 'retracts' in row:
            errors.append(f'{eid}: only a retracted row may carry retracts')
        seen[eid] = row


def resolve_base(base):
    def git(*args):
        return subprocess.run(['git', '-C', str(C.ROOT), *args], capture_output=True, text=True)

    if base != 'auto':
        return base
    head = git('rev-parse', 'HEAD').stdout.strip()
    merge_base = git('merge-base', 'HEAD', 'origin/main')
    if merge_base.returncode == 0 and merge_base.stdout.strip() and merge_base.stdout.strip() != head:
        return merge_base.stdout.strip()
    parent = git('rev-parse', 'HEAD~1')
    return parent.stdout.strip() if parent.returncode == 0 else None


def check_append_only(base, errors, notes):
    ref = resolve_base(base)
    if not ref:
        notes.append('append-only check skipped: no git base available')
        return
    top = subprocess.run(['git', '-C', str(C.ROOT), 'rev-parse', '--show-toplevel'], capture_output=True, text=True).stdout.strip()
    relative = C.EVIDENCE_PATH.resolve().relative_to(pathlib.Path(top).resolve()).as_posix()
    shown = subprocess.run(['git', '-C', top, 'show', f'{ref}:{relative}'], capture_output=True, text=True, encoding='utf-8')
    if shown.returncode != 0:
        notes.append(f'append-only check: evidence log absent at {ref[:12]}, nothing to compare')
        return
    current = C.EVIDENCE_PATH.read_text(encoding='utf-8') if C.EVIDENCE_PATH.exists() else ''
    if not current.startswith(shown.stdout):
        errors.append(f'evidence-log.jsonl was edited or truncated since {ref[:12]}; rows are append-only (retract with a new row instead)')
    else:
        notes.append(f'append-only check passed against {ref[:12]}')


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', help="git ref the evidence log must extend, or 'auto'")
    args = parser.parse_args(argv)

    errors, notes = [], []
    try:
        cat, ledger = C.load_catalog(), C.load_ledger()
    except (OSError, json.JSONDecodeError) as exc:
        print(f'CONSUMER APP OUTCOME VALIDATION FAILED\n- cannot load references: {exc}', file=sys.stderr)
        return 1
    rows, parse_errors = C.load_evidence()
    errors.extend(parse_errors)
    check_ledger(cat, ledger, errors)
    record_ids = check_catalog(cat, ledger, errors)
    check_evidence(rows, record_ids, errors)
    if args.base:
        check_append_only(args.base, errors, notes)

    if errors:
        print('CONSUMER APP OUTCOME VALIDATION FAILED', file=sys.stderr)
        print('\n'.join(f'- {e}' for e in errors), file=sys.stderr)
        return 1
    grouped = C.evidence_by_record(rows)
    statuses = {}
    for rid in record_ids:
        status = C.status_for(grouped.get(rid, []))
        statuses[status] = statuses.get(status, 0) + 1
    summary = ', '.join(f'{statuses[s]} {s}' for s in C.STATUS_ORDER if s in statuses)
    print(f'CONSUMER APP OUTCOME VALIDATION PASSED: {len(record_ids)} records, {len(C.stacks(cat))} stacks, '
          f'{len(ledger["records"])} source pages, {len(rows)} evidence rows ({summary})')
    for note in notes:
        print(note)
    return 0


if __name__ == '__main__':
    sys.exit(main())
