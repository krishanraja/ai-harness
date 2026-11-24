#!/usr/bin/env python3
"""The insight desk's deterministic gate. It reads and reports; it writes nothing.

  python scripts/validate.py
  python scripts/validate.py --base auto      (the harness runner's form; accepted and unused)

It checks that:
  - every reference SKILL.md names exists, and the schema is draft 2020-12 with $id insight-sheet/1;
  - methods-by-category.md has at least four categories, each with three to five methods,
    and method ids are unique;
  - the sample sheet in scripts/tests/fixtures passes scripts/validate_sheet.py;
  - no file in the skill, the closed record of its candidate period, its evals or its proposal
    carries an em dash;
  - the eval suites meet their minimums and are held out: no case shares an eight-word run with
    any file in the skill.
"""
import argparse
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


def repo_root():
    for parent in SKILL.parents:
        if (parent / 'contract').is_dir() and (parent / 'skills').is_dir():
            return parent
    return None


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
    counts = {}
    for record in records:
        counts[record.get('category')] = counts.get(record.get('category'), 0) + 1
        if record.get('held_out') is not True:
            errors.append(f'{label} case {record.get("id")} is not marked held_out')
    for category, minimum in minimums.items():
        if counts.get(category, 0) < minimum:
            errors.append(f'{label}: {category} has {counts.get(category, 0)}, needs {minimum}')


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default=None)
    parser.parse_args(argv)
    errors, notes = [], []

    manifest = (SKILL / 'SKILL.md').read_text(encoding='utf-8')
    for ref in sorted(set(re.findall(r'`((?:references|scripts)/[^`\s]+)`', manifest))):
        if not (SKILL / ref).is_file():
            errors.append(f'SKILL.md names {ref}, which does not exist')

    schema = json.loads((SKILL / 'references' / 'insight-sheet.schema.json').read_text(encoding='utf-8'))
    if schema.get('$schema') != 'https://json-schema.org/draft/2020-12/schema':
        errors.append('the schema is not draft 2020-12')
    if schema.get('$id') != 'insight-sheet/1':
        errors.append('the schema $id is not insight-sheet/1')
    if tuple(schema.get('required', ())) != S.TOP_KEYS:
        errors.append('the schema and validate_sheet.py disagree on the top-level fields')

    methods_text = S.METHODS_FILE.read_text(encoding='utf-8')
    categories = re.split(r'(?m)^## ', methods_text)[1:]
    if len(categories) < 4:
        errors.append(f'methods-by-category.md has {len(categories)} categories, needs at least 4')
    all_ids = []
    for block in categories:
        ids = re.findall(r'(?m)^### `([a-z0-9-]+)`', block)
        all_ids += ids
        if not 3 <= len(ids) <= 5:
            errors.append(f'category {block.splitlines()[0]!r} has {len(ids)} methods, needs 3 to 5')
    if len(all_ids) != len(set(all_ids)):
        errors.append('method ids repeat across categories')

    sample = SKILL / 'scripts' / 'tests' / 'fixtures' / 'sample-sheet.json'
    sheet_errors = S.validate(json.loads(sample.read_text(encoding='utf-8')))
    errors += [f'sample sheet: {e}' for e in sheet_errors]

    root = repo_root()
    others = []
    if root:
        state = root / 'state' / 'candidates' / f'{NAME}.yaml'
        if state.is_file():
            others.append(state)
        else:
            errors.append(f'state/candidates/{NAME}.yaml not found')
        proposals = sorted((root / 'docs' / 'proposals').glob(f'*-{NAME}.md'))
        if proposals:
            others += proposals
        else:
            errors.append(f'no docs/proposals/*-{NAME}.md found; the skill needs its proposal')
    skill_files = [p for p in SKILL.rglob('*') if p.is_file() and p.suffix in TEXT_SUFFIXES]
    for path in skill_files + others:
        if EM_DASH in path.read_text(encoding='utf-8'):
            errors.append(f'{path.name}: carries an em dash')

    if root:
        evals = root / 'evals'
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
        for path in (evals / f'{NAME}-trigger-cases.jsonl', evals / f'{NAME}-behavior-cases.jsonl'):
            if path.is_file() and EM_DASH in path.read_text(encoding='utf-8'):
                errors.append(f'{path.name}: carries an em dash')
    else:
        notes.append('repository root not found; eval checks skipped')

    for note in notes:
        print(f'note  {note}')
    if errors:
        for error in errors:
            print(f'FAIL  {error}')
        return 1
    print(f'INSIGHT DESK VALID: {len(all_ids)} methods in {len(categories)} categories, sample sheet valid')
    return 0


if __name__ == '__main__':
    sys.exit(main())
