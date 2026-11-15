#!/usr/bin/env python3
"""The council's deterministic gate. It reads and reports; it writes nothing.

  python scripts/validate.py
  python scripts/validate.py --base auto                 (the harness runner's form; see below)
  python scripts/validate.py --control-center <path>     compare with a control-center checkout
  python scripts/validate.py --control-center none       skip that comparison

It checks that:
  - the five seats and the eight idea tests exist, in order, with every field filled;
  - the JSON is canonically written and both Markdown files are exactly what the JSON draws;
  - when control-center's two source files are present at the given path, every copied
    field matches them byte for byte (the path defaults to COUNCIL_CONTROL_CENTER, else a
    control-center folder beside this repository);
  - no file in the skill, its candidate record, its evals or its proposal names an outside
    source or carries an em dash, and no file in the skill links out;
  - the eval suites meet their minimums and are held out: no case shares an eight-word
    run with any file in the skill.

`--base` is accepted because the harness runner passes it to every candidate gate. The
council keeps no append-only data, so there is nothing to compare against a base.
"""
import argparse
import json
import os
import pathlib
import re
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import council as C  # noqa: E402

TRIGGER_MINIMUMS = {'positive': 8, 'negative': 8, 'adversarial_collision': 5}
BEHAVIOR_MINIMUMS = {'nominal': 6, 'failure_edge': 8, 'authority_security': 5, 'handoff_collision': 4}
TEXT_SUFFIXES = {'.md', '.json', '.jsonl', '.yaml', '.yml', '.py', '.txt'}


def first_difference(a, b):
    for i, (x, y) in enumerate(zip(a, b)):
        if x != y:
            return i
    return min(len(a), len(b))


def check_seats(doc, errors):
    seats = doc.get('seats')
    if not isinstance(seats, list):
        errors.append('seats.json has no seats list')
        return
    names = tuple(s.get('name') for s in seats if isinstance(s, dict))
    keys = tuple(s.get('key') for s in seats if isinstance(s, dict))
    if names != C.SEAT_NAMES or keys != C.SEAT_KEYS:
        errors.append(f'the seats must be {", ".join(C.SEAT_NAMES)}, in that order; found {", ".join(map(str, names))}')
    for seat in seats:
        label = seat.get('key', '<no key>') if isinstance(seat, dict) else '<not an object>'
        if not isinstance(seat, dict) or set(seat) != set(C.SEAT_FIELDS):
            errors.append(f'seat {label}: fields must be exactly {", ".join(C.SEAT_FIELDS)}')
            continue
        for field in C.SEAT_FIELDS:
            value = seat[field]
            if field in C.SEAT_LISTS:
                if not isinstance(value, list) or not value or not all(isinstance(v, str) and v.strip() for v in value):
                    errors.append(f'seat {label}: {field} must be a list of filled strings')
            elif not isinstance(value, str) or not value.strip():
                errors.append(f'seat {label}: {field} is empty')


def check_tests(doc, errors):
    tests = doc.get('tests')
    if not isinstance(tests, list):
        errors.append('idea-tests.json has no tests list')
        return
    ids = tuple(t.get('id') for t in tests if isinstance(t, dict))
    if ids != C.TEST_IDS:
        errors.append(f'the idea tests must be {", ".join(C.TEST_IDS)}, in that order; found {", ".join(map(str, ids))}')
    for test in tests:
        label = test.get('id', '<no id>') if isinstance(test, dict) else '<not an object>'
        if not isinstance(test, dict) or set(test) != set(C.TEST_FIELDS):
            errors.append(f'idea test {label}: fields must be exactly {", ".join(C.TEST_FIELDS)}')
            continue
        for field in C.TEST_FIELDS:
            if not isinstance(test[field], str) or not test[field].strip():
                errors.append(f'idea test {label}: {field} is empty')


def check_home(doc, home, errors):
    want = {'repository': C.HOME_REPOSITORY, 'path': home[0], 'export': home[1]}
    if doc.get('home') != want:
        errors.append(f'{home[1]} copy must name its home as {want}')


def compare_with_home(control_center, seats_doc, tests_doc, errors, notes):
    if control_center is None:
        notes.append('control-center comparison: switched off')
        return
    pairs = (
        (C.SEATS_HOME, seats_doc.get('seats') or [], C.SEAT_FIELDS, 'key', 'seat'),
        (C.TESTS_HOME, tests_doc.get('tests') or [], C.TEST_FIELDS, 'id', 'idea test'),
    )
    for (path, export), copy, fields, ident, kind in pairs:
        source_path = control_center / path
        if not source_path.is_file():
            notes.append(f'control-center comparison: {path} not present at {control_center}, skipped')
            continue
        try:
            home = C.read_export(source_path.read_text(encoding='utf-8'), export)
        except (C.SourceError, OSError, ValueError) as exc:
            errors.append(f'cannot read {export} from {source_path}: {exc}')
            continue
        if not isinstance(home, list) or not all(isinstance(item, dict) for item in home):
            errors.append(f'{export} in {source_path} is not a list of objects')
            continue
        if len(home) != len(copy):
            errors.append(f'{export} has {len(home)} entries in control-center and {len(copy)} here')
            continue
        before = len(errors)
        for theirs, ours in zip(home, copy):
            name = ours.get(ident, '<unknown>')
            for field in fields:
                if field not in theirs:
                    errors.append(f'{kind} {name}: control-center has no {field}')
                elif theirs[field] != ours.get(field):
                    a, b = json.dumps(theirs[field], ensure_ascii=False), json.dumps(ours.get(field), ensure_ascii=False)
                    errors.append(f'{kind} {name}: {field} differs from control-center {path} '
                                  f'(first difference at character {first_difference(a, b)} of the JSON form)')
        if len(errors) == before:
            notes.append(f'control-center comparison: {export} matches {source_path} byte for byte')


def skill_files(skill):
    return sorted(p for p in skill.rglob('*') if p.is_file() and '__pycache__' not in p.parts)


def companion_files(skill, repo):
    found = []
    for pattern in ('state/candidates/council.yaml', 'state/candidates/council.yml',
                    'evals/candidates/council-*.jsonl', 'evals/council-*.jsonl', 'docs/proposals/*-council.md'):
        found += sorted(repo.glob(pattern))
    return [p for p in found if p.is_file() and skill not in p.parents]


def check_text(path, in_skill, errors):
    if path.suffix.lower() not in TEXT_SUFFIXES:
        errors.append(f'{path.name}: unexpected file type {path.suffix or "(none)"}')
        return ''
    text = path.read_text(encoding='utf-8')
    if C.EM_DASH in text:
        errors.append(f'{path.name}: contains an em dash')
    hits = C.denied_runs(text)
    if hits:
        errors.append(f'{path.name}: names an outside source ({len(hits)} match{"es" if len(hits) > 1 else ""})')
    if in_skill and re.search(r'(?i)\bhttps?://', text):
        errors.append(f'{path.name}: links out; the council cites nothing outside the OS')
    return text


def read_jsonl(path, errors):
    records = []
    for number, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if not line.strip():
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            errors.append(f'{path.name} line {number}: not valid JSON')
    return records


def check_evals(repo, skill_text, errors, notes):
    suites = {}
    for kind, minimums in (('trigger', TRIGGER_MINIMUMS), ('behavior', BEHAVIOR_MINIMUMS)):
        paths = [p for p in (repo / 'evals' / 'candidates' / f'council-{kind}-cases.jsonl',
                             repo / 'evals' / f'council-{kind}-cases.jsonl') if p.is_file()]
        if not paths:
            notes.append(f'{kind} suite not found; its minimums and held-out check did not run')
            continue
        records = read_jsonl(paths[0], errors)
        suites[kind] = records
        ids = [r.get('id') for r in records]
        if any(not i for i in ids) or len(ids) != len(set(ids)):
            errors.append(f'{paths[0].name}: every case needs a unique id')
        for category, minimum in minimums.items():
            count = sum(1 for r in records if r.get('category') == category)
            if count < minimum:
                errors.append(f'{paths[0].name}: needs at least {minimum} {category} cases; found {count}')
        if kind == 'trigger' and not all(isinstance(r.get('should_trigger'), bool) for r in records):
            errors.append(f'{paths[0].name}: every case needs should_trigger true or false')
    skill_grams = C.grams(skill_text)
    leaked = []
    for kind, records in suites.items():
        for r in records:
            case_text = ' '.join(str(r.get(k, '')) for k in ('prompt', 'scenario'))
            if C.grams(case_text) & skill_grams:
                leaked.append(r.get('id', '<no id>'))
    if leaked:
        errors.append(f'cases not held out (they share eight words with the skill): {", ".join(leaked)}')
    elif suites:
        notes.append(f'held out: {sum(len(r) for r in suites.values())} cases share no eight-word run with the skill')


def check_record(repo, errors):
    path = repo / 'state' / 'candidates' / 'council.yaml'
    if not path.is_file():
        return
    text = path.read_text(encoding='utf-8')
    for line in ('activation: false', 'release_eligible: false'):
        if not re.search(r'(?m)^' + re.escape(line) + r'\s*$', text):
            errors.append(f'state/candidates/council.yaml must say {line}')
    if re.search(r'(?m)^requested_surfaces:', text):
        errors.append('state/candidates/council.yaml must request no surface')


def check_manifest(skill, errors):
    raw = (skill / 'SKILL.md').read_text(encoding='utf-8')
    match = re.match(r'---\n(.*?)\n---\n', raw, re.S)
    if not match:
        errors.append('SKILL.md has no frontmatter')
        return
    keys = re.findall(r'(?m)^([A-Za-z0-9_-]+):', match.group(1))
    if sorted(keys) != ['description', 'name']:
        errors.append('SKILL.md frontmatter must hold only name and description')
    name = re.search(r'(?m)^name:\s*(.*)$', match.group(1))
    description = re.search(r'(?m)^description:\s*(.*)$', match.group(1))
    if not name or name.group(1).strip() != skill.name:
        errors.append(f'SKILL.md name must be {skill.name}')
    if not description or not 0 < len(description.group(1).strip()) <= 1024:
        errors.append('SKILL.md description must be 1 to 1024 characters')
    for ref in re.findall(r'`(references/[^`#\s]+)`', raw):
        if not (skill / ref).is_file():
            errors.append(f'SKILL.md names {ref}, which does not exist')


def run(skill=C.SKILL, repo=C.REPO, control_center=None):
    errors, notes = [], []
    try:
        seats_doc, tests_doc = C.load(skill / 'references' / 'seats.json'), C.load(skill / 'references' / 'idea-tests.json')
    except (OSError, json.JSONDecodeError) as exc:
        return [f'cannot load the seats or the idea tests: {exc}'], notes
    check_seats(seats_doc, errors)
    check_tests(tests_doc, errors)
    check_home(seats_doc, C.SEATS_HOME, errors)
    check_home(tests_doc, C.TESTS_HOME, errors)
    refs = skill / 'references'
    for path, doc in ((refs / 'seats.json', seats_doc), (refs / 'idea-tests.json', tests_doc)):
        if path.read_text(encoding='utf-8') != C.canonical(doc):
            errors.append(f'{path.name} is not canonically written (two-space JSON, one trailing newline)')
    if not errors:
        for path, drawn in ((refs / 'seats.md', C.render_seats(seats_doc)), (refs / 'idea-tests.md', C.render_tests(tests_doc))):
            if not path.is_file() or path.read_text(encoding='utf-8') != drawn:
                errors.append(f'{path.name} is not what the JSON draws; run python scripts/council.py render')
    check_manifest(skill, errors)
    compare_with_home(control_center, seats_doc, tests_doc, errors, notes)
    skill_text = '\n'.join(check_text(p, True, errors) for p in skill_files(skill))
    companions = companion_files(skill, repo)
    for path in companions:
        check_text(path, False, errors)
    check_record(repo, errors)
    check_evals(repo, skill_text, errors, notes)
    notes.append(f'scanned {len(skill_files(skill))} skill files and {len(companions)} companion files')
    return errors, notes


def control_center_path(value):
    if value is None:
        value = os.environ.get('COUNCIL_CONTROL_CENTER') or str(C.REPO.parent / 'control-center')
    return None if value.strip().lower() in ('', 'none', 'off') else pathlib.Path(value)


def main(cli_args=None):
    cli = argparse.ArgumentParser(description='The council gate. It reads and reports; it writes nothing.')
    cli.add_argument('--base', help='accepted for the harness runner; the council has no append-only data')
    cli.add_argument('--control-center', dest='control_center', help="a control-center checkout, or 'none'")
    args = cli.parse_args(cli_args)
    errors, notes = run(control_center=control_center_path(args.control_center))
    if args.base:
        notes.append('--base: the council keeps no append-only data, so there is nothing to compare')
    if errors:
        print('COUNCIL VALIDATION FAILED', file=sys.stderr)
        print('\n'.join(f'- {e}' for e in errors), file=sys.stderr)
        return 1
    print(f'COUNCIL VALIDATION PASSED: {len(C.SEAT_NAMES)} seats, {len(C.TEST_IDS)} idea tests')
    for note in notes:
        print(note)
    return 0


if __name__ == '__main__':
    sys.exit(main())
