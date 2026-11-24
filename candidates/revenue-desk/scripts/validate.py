#!/usr/bin/env python3
"""The revenue desk's deterministic gate. It reads and reports; it writes nothing.

  python scripts/validate.py
  python scripts/validate.py --base auto      (the harness runner's form; accepted and unused)

It checks that:
  - every reference SKILL.md names exists, and the schema is draft 2020-12 with $id revenue-sheet/1
    and the same top-level fields as scripts/validate_sheet.py;
  - references/rules.md holds 12 to 20 rules with unique ids, and the loop in SKILL.md has ten steps;
  - the sample sheet in scripts/tests/fixtures passes scripts/validate_sheet.py;
  - no file in the skill, its candidate record, its evals, its proposal or its now-note carries an
    em dash, an exclamation mark in prose, or an outside repository, author, product or framework
    name (Ruling, Krish, 2026-11-15 and 2026-11-24). The names are held only as truncated SHA-256
    digests, so this file never names them either;
  - the eval suites meet their minimums and are held out: no case shares an eight-word run with
    any file in the skill.
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys

sys.dont_write_bytecode = True
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import validate_sheet as S  # noqa: E402

SKILL = HERE.parent
NAME = SKILL.name
TRIGGER_MINIMUMS = {'positive': 8, 'negative': 8, 'adversarial_collision': 5}
BEHAVIOR_MINIMUMS = {'nominal': 6, 'failure_edge': 8, 'authority_security': 5, 'handoff_collision': 4}
TEXT_SUFFIXES = {'.md', '.json', '.jsonl', '.yaml', '.yml', '.py', '.txt'}
WINDOW = 8
EM_DASH = chr(0x2014)
# The first 16 hex characters of the SHA-256 of each outside name that must never appear.
OUTSIDE_NAMES = frozenset({
    'bd757be52002ad57',
    '898051d76560d922',
    '2f55e450c3db2882',
    '847d096fe4e8d9d4',
    '80eeafab460f2b4c',
    'ef791d035f11d7f9',
    '6aea3e546b81b119',
    'a71a75d1419ba60e',
    'b2cae5f6808b51a4',
    'a820d884d80cb4f4',
    '8781a524abce1bcb',
    '6ab7c9d3b20e34dd',
    'a6eaf022f457f325',
    '286a3c612017ad1d',
    '52e5ae426f878a34',
    'd296d7b0c63e96a1',
    'a44aead8e6ded9df',
    '90274faa8f5f1452',
    '65beb7f1a75d2bdc',
    'a9d3a5c1806554aa',
})
TOKEN_RE = re.compile(r'[a-z0-9]+(?:[-_][a-z0-9]+)*')


def repo_root():
    for parent in SKILL.parents:
        if (parent / 'contract').is_dir() and (parent / 'skills').is_dir():
            return parent
    return None


def digest(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()[:16]


def outside_names_in(text):
    hits = set()
    for token in TOKEN_RE.findall(text.lower()):
        for part in {token, *re.split(r'[-_]', token)}:
            if digest(part) in OUTSIDE_NAMES:
                hits.add(part)
    return hits


def words(text):
    return re.findall(r"[a-z0-9']+", text.lower())


def runs(text):
    w = words(text)
    return {' '.join(w[i:i + WINDOW]) for i in range(len(w) - WINDOW + 1)}


def read_jsonl(path, errors):
    records = []
    if not path.is_file():
        errors.append(f'{path.name} is missing')
        return records
    for n, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if not line.strip():
            continue
        try:
            records.append(json.loads(line))
        except ValueError:
            errors.append(f'{path.name}:{n} is not JSON')
    return records


def check_minimums(records, minimums, label, errors):
    counts, seen = {}, set()
    for record in records:
        counts[record.get('category')] = counts.get(record.get('category'), 0) + 1
        if record.get('held_out') is not True:
            errors.append(f'{label} case {record.get("id")} is not marked held_out')
        if record.get('id') in seen:
            errors.append(f'{label} case id {record.get("id")} repeats')
        seen.add(record.get('id'))
    for category, minimum in minimums.items():
        if counts.get(category, 0) < minimum:
            errors.append(f'{label}: {category} has {counts.get(category, 0)}, needs {minimum}')


def staged_paragraph(root):
    contract = (root / 'contract' / 'skill-routing-contract.md').read_text(encoding='utf-8')
    match = re.search(r'(?ms)^### Staged 2026-11-24; valid until admission or withdrawal\n(.*?)(?=^#{2,3} )', contract)
    return match.group(1) if match else None


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default=None)
    parser.parse_args(argv)
    errors, notes = [], []

    manifest = (SKILL / 'SKILL.md').read_text(encoding='utf-8')
    for ref in sorted(set(re.findall(r'`((?:references|scripts)/[^`\s]+)`', manifest))):
        if not (SKILL / ref).is_file():
            errors.append(f'SKILL.md names {ref}, which does not exist')
    loop = re.search(r'(?ms)^## The loop\n(.*?)^## ', manifest)
    steps = re.findall(r'(?m)^(\d+)\. \*\*', loop.group(1)) if loop else []
    if steps != [str(n) for n in range(1, 11)]:
        errors.append(f'the loop in SKILL.md has steps {steps}, needs 1 to 10 in order')

    schema = json.loads((SKILL / 'references' / 'revenue-sheet.schema.json').read_text(encoding='utf-8'))
    if schema.get('$schema') != 'https://json-schema.org/draft/2020-12/schema':
        errors.append('the schema is not draft 2020-12')
    if schema.get('$id') != S.SCHEMA_ID:
        errors.append(f'the schema $id is not {S.SCHEMA_ID}')
    if tuple(schema.get('required', ())) != S.TOP_KEYS:
        errors.append('the schema and validate_sheet.py disagree on the top-level fields')

    rules = re.findall(r'(?m)^### `(R\d\d)`', (SKILL / 'references' / 'rules.md').read_text(encoding='utf-8'))
    if not 12 <= len(rules) <= 20:
        errors.append(f'rules.md has {len(rules)} rules, needs 12 to 20')
    if len(rules) != len(set(rules)):
        errors.append('rule ids repeat in rules.md')
    checker = (HERE / 'validate_sheet.py').read_text(encoding='utf-8')
    for rule in rules:
        text = (SKILL / 'references' / 'rules.md').read_text(encoding='utf-8')
        block = text.split(f'### `{rule}`', 1)[1].split('### ', 1)[0]
        if 'Check: sheet' in block and f'({rule}' not in checker and f', {rule})' not in checker:
            errors.append(f'{rule} says the sheet check enforces it, but validate_sheet.py never cites it')

    sample = HERE / 'tests' / 'fixtures' / 'sample-sheet.json'
    errors += [f'sample sheet: {e}' for e in S.validate(json.loads(sample.read_text(encoding='utf-8')))]

    root = repo_root()
    others = []
    if root:
        state = root / 'state' / 'candidates' / f'{NAME}.yaml'
        if state.is_file():
            others.append(state)
            if not re.search(r'(?m)^activation:\s*false\s*$', state.read_text(encoding='utf-8')):
                errors.append(f'state/candidates/{NAME}.yaml does not say activation: false')
        else:
            errors.append(f'state/candidates/{NAME}.yaml not found')
        proposals = sorted((root / 'docs' / 'proposals').glob(f'*-{NAME}.md'))
        if proposals:
            others += proposals
        else:
            errors.append(f'no docs/proposals/*-{NAME}.md found; the candidate needs its proposal')
        others += sorted((root / 'now-notes').glob(f'*-{NAME}.md'))
        evals = root / 'evals' / 'candidates'
        others += [p for p in (evals / f'{NAME}-trigger-cases.jsonl', evals / f'{NAME}-behavior-cases.jsonl') if p.is_file()]
        paragraph = staged_paragraph(root)
        if paragraph is None:
            errors.append('contract/skill-routing-contract.md has no staged paragraph for the candidate')
        elif outside_names_in(paragraph):
            errors.append('the staged routing paragraph names an outside source')
    skill_files = [p for p in SKILL.rglob('*') if p.is_file() and p.suffix in TEXT_SUFFIXES]
    for path in skill_files + others:
        text = path.read_text(encoding='utf-8')
        if EM_DASH in text:
            errors.append(f'{path.name}: carries an em dash')
        if path.suffix in {'.md', '.jsonl', '.yaml'} and re.search(r'[A-Za-z]!(?:\s|$)', text):
            errors.append(f'{path.name}: carries an exclamation mark')
        if outside_names_in(text):
            errors.append(f'{path.name}: names an outside repository, author, product or framework')

    if root:
        evals = root / 'evals' / 'candidates'
        trigger = read_jsonl(evals / f'{NAME}-trigger-cases.jsonl', errors)
        behavior = read_jsonl(evals / f'{NAME}-behavior-cases.jsonl', errors)
        check_minimums(trigger, TRIGGER_MINIMUMS, 'trigger suite', errors)
        check_minimums(behavior, BEHAVIOR_MINIMUMS, 'behavior suite', errors)
        skill_runs = set()
        for path in skill_files:
            if path.suffix in {'.md', '.json'}:
                skill_runs |= runs(path.read_text(encoding='utf-8'))
        for record in trigger + behavior:
            text = ' '.join(str(record.get(k, '')) for k in ('prompt', 'scenario'))
            text += ' ' + ' '.join(map(str, record.get('must', []) + record.get('must_not', [])))
            if runs(text) & skill_runs:
                errors.append(f'case {record.get("id")} shares an eight-word run with the skill; it is not held out')
    else:
        notes.append('repository root not found; eval and record checks skipped')

    for note in notes:
        print(f'note  {note}')
    if errors:
        for error in errors:
            print(f'FAIL  {error}')
        return 1
    print(f'REVENUE DESK VALID: {len(rules)} rules, ten-step loop, sample sheet valid, no outside names')
    return 0


if __name__ == '__main__':
    sys.exit(main())
