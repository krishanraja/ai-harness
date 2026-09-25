#!/usr/bin/env python3
"""Shared loading, formatting and evidence logic for the outcome catalog.

The catalog holds source-derived hypotheses and never changes strength on its
own. Strength comes only from rows in the append-only evidence log, and every
status is computed from those rows at read time, never stored.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
REFS = ROOT / 'references'
CATALOG_PATH = REFS / 'outcome-catalog.json'
LEDGER_PATH = REFS / 'source-ledger.json'
EVIDENCE_PATH = REFS / 'evidence-log.jsonl'

BASE_EVIDENCE_LEVEL = 'public-practitioner-hypothesis'

# Mirrors the ladder in references/evidence-and-ethics.md. Lower is stronger.
EVIDENCE_LEVELS = {
    1: 'production-experiment',
    2: 'product-specific-observational',
    3: 'primary-research-or-platform-guidance',
    4: 'documented-case-study',
    5: 'public-practitioner-pattern',
}
DESIGNS = {'rct', 'quasi-experiment', 'cohort', 'funnel', 'qualitative', 'usability', 'case-study', 'platform-guidance'}
RESULTS = {'supported', 'null', 'contrary', 'harmful', 'retracted'}
STATUS_ORDER = ['supported', 'contested', 'tested', 'candidate', 'retired']

RECORD_KEYS = ['id', 'stack', 'problem', 'source_signal', 'target_outcome', 'hypothesis',
               'primary_metrics', 'guardrails', 'evidence_level', 'source_url', 'source_id']
EVIDENCE_REQUIRED = ['id', 'record_id', 'observed_at', 'recorded_at', 'recorded_by', 'product',
                     'evidence_level', 'design', 'primary_metric', 'result', 'summary', 'source_ref']
EVIDENCE_OPTIONAL = ['effect', 'guardrail_breaches', 'decision_ledger_id', 'retracts']

DATE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
PRODUCT_CODE = re.compile(r'^[a-z0-9][a-z0-9-]{1,39}$')
# The log ships inside the skill package, so it must never carry a person's or
# client's contact details. Product codes stand in for client identities.
IDENTIFYING = re.compile(
    r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'  # email
    r'|\+\d[\d ()-]{7,}\d'  # international phone
    r'|(?<![\d-])\(?\d{2,4}\)?[ ]\d{3,4}[ ]\d{3,4}(?![\d-])'  # spaced local phone
)
FREE_TEXT = ('product', 'summary', 'source_ref', 'effect', 'primary_metric', 'recorded_by')


def load_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def load_catalog():
    return load_json(CATALOG_PATH)


def load_ledger():
    return load_json(LEDGER_PATH)


def parse_evidence(text):
    rows, errors = [], []
    for number, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            errors.append(f'evidence-log line {number}: blank line')
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError as exc:
            errors.append(f'evidence-log line {number}: invalid JSON ({exc.msg})')
    return rows, errors


def load_evidence(path=None):
    path = path or EVIDENCE_PATH
    if not path.exists():
        return [], []
    return parse_evidence(path.read_text(encoding='utf-8'))


def stacks(catalog):
    return [entry['stack'] for entry in catalog['stack_outcomes']]


def format_catalog(catalog):
    """One object per line, so every future edit is a reviewable one-line diff."""
    def line(obj):
        return json.dumps(obj, ensure_ascii=False, separators=(', ', ': '))

    order = {name: i for i, name in enumerate(stacks(catalog))}
    records = sorted(catalog['records'], key=lambda r: (order.get(r['stack'], len(order)), r['id']))
    records = [{key: r[key] for key in RECORD_KEYS if key in r} for r in records]
    parts = ['{',
             f'  "schema_version": {json.dumps(catalog["schema_version"])},',
             f'  "generated_at": {json.dumps(catalog["generated_at"])},',
             '  "stack_outcomes": [',
             ',\n'.join('    ' + line(s) for s in catalog['stack_outcomes']),
             '  ],',
             '  "records": [',
             ',\n'.join('    ' + line(r) for r in records),
             '  ]',
             '}']
    return '\n'.join(parts) + '\n'


def effective_rows(rows):
    """Rows still in force: a retraction row withdraws the row it names."""
    retracted = {row.get('retracts') for row in rows if row.get('result') == 'retracted'}
    return [row for row in rows if row.get('result') != 'retracted' and row.get('id') not in retracted]


def evidence_by_record(rows):
    grouped = {}
    for row in effective_rows(rows):
        grouped.setdefault(row.get('record_id'), []).append(row)
    return grouped


def status_for(rows):
    if not rows:
        return 'candidate'
    results = [row['result'] for row in rows]
    if 'harmful' in results:
        return 'retired'
    supported = [row for row in rows if row['result'] == 'supported']
    if supported and 'contrary' in results:
        return 'contested'
    if len([row for row in supported if row['evidence_level'] <= 2]) >= 2 and 'contrary' not in results:
        return 'supported'
    return 'tested'


def strongest_support(rows):
    levels = [row['evidence_level'] for row in rows if row['result'] == 'supported']
    return min(levels) if levels else 5


def annotate(record, rows):
    """A record as retrieval should show it: the computed status and every result, contrary included."""
    rows = sorted(rows, key=lambda row: (row['observed_at'], row['id']))
    return {
        **record,
        'status': status_for(rows),
        'strongest_supporting_level': strongest_support(rows),
        'evidence': {
            'supported': [row['id'] for row in rows if row['result'] == 'supported'],
            'null': [row['id'] for row in rows if row['result'] == 'null'],
            'contrary': [row for row in rows if row['result'] in ('contrary', 'harmful')],
        },
    }


def _main(argv):
    if len(argv) < 2 or argv[1] != 'format':
        print('usage: catalog.py format [--check]', file=sys.stderr)
        return 2
    current = CATALOG_PATH.read_text(encoding='utf-8')
    formatted = format_catalog(json.loads(current))
    if '--check' in argv:
        if current != formatted:
            print('outcome-catalog.json is not in canonical format; run: python scripts/catalog.py format', file=sys.stderr)
            return 1
        print('outcome-catalog.json is canonically formatted')
        return 0
    CATALOG_PATH.write_text(formatted, encoding='utf-8', newline='\n')
    print('formatted outcome-catalog.json')
    return 0


if __name__ == '__main__':
    sys.exit(_main(sys.argv))
