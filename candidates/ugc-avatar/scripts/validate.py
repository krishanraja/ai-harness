#!/usr/bin/env python3
"""ugc-avatar's deterministic gate. It reads and reports; it writes nothing.

  python scripts/validate.py
  python scripts/validate.py --base auto      (the harness runner's form; see below)

It checks that:
  - SKILL.md has only a name and a description, names only files that exist, and stays short;
  - agents/openai.yaml carries the metadata the harness runner reads, and its prompt calls the skill;
  - no file in the skill, its candidate record, its evals or its proposal names an outside source or
    carries an em dash, and no file in the skill links out;
  - the look pools can draw no age under 18 and no word that describes a child;
  - every venture rule names its source, and one that allows AI people cites Krish's ruling;
  - the disclosure and consent rule says whether Krish has approved it;
  - no roll history sits in the skill: history lives only in a venture engine's ignored workspace;
  - the set of denied names matches the council candidate's, when that candidate is present;
  - the candidate record says activation false, release_eligible false, asks for no surface, and stays
    outside admission while no venture allows AI people;
  - the eval suites meet their minimums and are held out: no case shares an eight-word run with any
    file in the skill.

`--base` is accepted because the harness runner passes it to every candidate gate. This skill keeps
no append-only data, so there is nothing to compare against a base.
"""
import argparse
import json
import pathlib
import re
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import avatar as A  # noqa: E402

NAME = 'ugc-avatar'
TRIGGER_MINIMUMS = {'positive': 8, 'negative': 8, 'adversarial_collision': 5}
BEHAVIOR_MINIMUMS = {'nominal': 6, 'failure_edge': 8, 'authority_security': 5, 'handoff_collision': 4}
TEXT_SUFFIXES = {'.md', '.json', '.jsonl', '.yaml', '.yml', '.py', '.txt'}
HISTORY_DATA = re.compile(r'(?i)history[^/\\]*\.(?:jsonl|json|csv)$')
MAX_SKILL_LINES = 500
COUNCIL_GATES = ('candidates/council/scripts/council.py', 'skills/council/scripts/council.py')


def skill_files(skill):
    return sorted(p for p in skill.rglob('*') if p.is_file() and '__pycache__' not in p.parts)


def companion_files(skill, repo):
    found = []
    for pattern in (f'state/candidates/{NAME}.yaml', f'state/candidates/{NAME}.yml',
                    f'evals/candidates/{NAME}-*.jsonl', f'evals/{NAME}-*.jsonl', f'docs/proposals/*-{NAME}.md'):
        found += sorted(repo.glob(pattern))
    return [p for p in found if p.is_file() and skill not in p.parents]


def check_text(path, in_skill, errors):
    if path.suffix.lower() not in TEXT_SUFFIXES:
        errors.append(f'{path.name}: unexpected file type {path.suffix or "(none)"}')
        return ''
    text = path.read_text(encoding='utf-8')
    if A.EM_DASH in text:
        errors.append(f'{path.name}: contains an em dash')
    hits = A.denied_runs(text)
    if hits:
        errors.append(f'{path.name}: names an outside source ({len(hits)} match{"es" if len(hits) > 1 else ""})')
    if in_skill and re.search(r'(?i)\bhttps?://', text):
        errors.append(f'{path.name}: links out; the skill cites nothing outside the OS')
    return text


def check_manifest(skill, errors):
    raw = (skill / 'SKILL.md').read_text(encoding='utf-8')
    if len(raw.splitlines()) > MAX_SKILL_LINES:
        errors.append(f'SKILL.md is over {MAX_SKILL_LINES} lines')
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
    if not description or not 0 < len(description.group(1).strip().strip('"')) <= 1024:
        errors.append('SKILL.md description must be 1 to 1024 characters')
    for ref in re.findall(r'`((?:references|scripts)/[^`#\s]+)`', raw):
        if not (skill / ref).is_file():
            errors.append(f'SKILL.md names {ref}, which does not exist')


def check_openai(skill, errors):
    path = skill / 'agents' / 'openai.yaml'
    if not path.is_file():
        errors.append('agents/openai.yaml is missing')
        return
    raw = path.read_text(encoding='utf-8')
    if not re.search(r'(?m)^\s*display_name:\s*"[^"]+"\s*$', raw):
        errors.append('agents/openai.yaml needs a display_name')
    if not re.search(r'(?m)^\s*short_description:\s*"[^"]{25,64}"\s*$', raw):
        errors.append('agents/openai.yaml needs a short_description of 25 to 64 characters')
    if not re.search(r'(?m)^\s*default_prompt:\s*"[^"\n]*\$' + re.escape(skill.name) + r'\b[^"\n]*"\s*$', raw):
        errors.append(f'agents/openai.yaml default_prompt must call ${skill.name}')


def check_no_history(skill, companions, errors):
    for path in skill_files(skill) + companions:
        if HISTORY_DATA.search(path.name):
            errors.append(f'{path.name}: roll history is never kept here; it lives in a venture engine\'s ignored workspace')


def check_looks(skill, errors):
    try:
        looks = json.loads((skill / 'references' / 'looks.json').read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f'cannot read references/looks.json: {exc}')
        return
    if looks.get('minimum_age') != 18:
        errors.append('looks.json minimum_age must be 18')
    low, high = (looks.get('default_age') or [0, 0])[:2]
    if not (isinstance(low, int) and isinstance(high, int) and 18 <= low <= high):
        errors.append('looks.json default_age must be two ages, 18 or over, low first')
    youth = looks.get('youth_words') or []
    if not youth:
        errors.append('looks.json needs its youth_words')
    for key in ('customer_words', 'credential_words'):
        if not looks.get(key):
            errors.append(f'looks.json needs its {key}')
    pools = looks.get('pools') or {}
    for name in ('presentation', 'hair', 'skin', 'wardrobe', 'setting', 'framing', 'light'):
        values = pools.get(name)
        flat = [v for group in values.values() for v in group] if isinstance(values, dict) else values
        if not flat:
            errors.append(f'looks.json pool {name} is empty')
            continue
        for value in flat:
            hits = A.has_phrase(value, youth)
            if hits:
                errors.append(f'looks.json pool {name} holds {value!r}, which describes a child')


def check_rules(skill, errors):
    try:
        rules = json.loads((skill / 'references' / 'venture-rules.json').read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f'cannot read references/venture-rules.json: {exc}')
        return None
    ventures = rules.get('ventures')
    if not isinstance(ventures, dict) or not ventures:
        errors.append('venture-rules.json lists no ventures')
        return None
    for name, entry in ventures.items():
        if not isinstance(entry, dict) or not isinstance(entry.get('allows_ai_people'), bool):
            errors.append(f'venture-rules.json {name}: allows_ai_people must be true or false')
            continue
        if not isinstance(entry.get('source'), str) or not entry['source'].strip():
            errors.append(f'venture-rules.json {name}: needs the source of its rule')
        if entry['allows_ai_people'] and not re.search(r'Ruling \(Krish, \d{4}-\d{2}-\d{2}\)', str(entry.get('ruling', ''))):
            errors.append(f'venture-rules.json {name}: allowing AI people needs Krish\'s ruling, cited as Ruling (Krish, YYYY-MM-DD)')
    return ventures


def check_consent(skill, errors, notes):
    status = A.consent_status(skill / 'references' / 'disclosure-and-consent.md')
    if status not in ('draft', 'approved'):
        errors.append('references/disclosure-and-consent.md needs a Status line: draft or approved')
    else:
        notes.append(f'disclosure and consent rule: {status}')


def council_digests(repo):
    for relative in COUNCIL_GATES:
        path = repo / relative
        if path.is_file():
            text = path.read_text(encoding='utf-8')
            block = re.search(r'DENIED_DIGESTS = frozenset\(\{(.*?)\}\)', text, re.S)
            if block:
                return relative, frozenset(re.findall(r"'([0-9a-f]{64})'", block.group(1)))
            return relative, None
    return None, None


def check_denied_set(repo, errors, notes):
    where, theirs = council_digests(repo)
    if where is None:
        notes.append('council candidate not present: the denied-name set was not compared')
    elif theirs is None:
        errors.append(f'{where} has no DENIED_DIGESTS set to compare with')
    elif theirs != A.DENIED_DIGESTS:
        errors.append(f'the denied-name set differs from {where} '
                      f'({len(theirs - A.DENIED_DIGESTS)} missing here, {len(A.DENIED_DIGESTS - theirs)} extra here)')
    else:
        notes.append(f'denied-name set matches {where} ({len(theirs)} digests)')


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
        paths = [p for p in (repo / 'evals' / 'candidates' / f'{NAME}-{kind}-cases.jsonl',
                             repo / 'evals' / f'{NAME}-{kind}-cases.jsonl') if p.is_file()]
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
        if not all(r.get('held_out') is True for r in records):
            errors.append(f'{paths[0].name}: every case must be marked held_out')
        if kind == 'trigger' and not all(isinstance(r.get('should_trigger'), bool) for r in records):
            errors.append(f'{paths[0].name}: every case needs should_trigger true or false')
    skill_grams = A.grams(skill_text)
    leaked = [r.get('id', '<no id>') for records in suites.values() for r in records
              if A.grams(' '.join(str(r.get(k, '')) for k in ('prompt', 'scenario'))) & skill_grams]
    if leaked:
        errors.append(f'cases not held out (they share eight words with the skill): {", ".join(leaked)}')
    elif suites:
        notes.append(f'held out: {sum(len(r) for r in suites.values())} cases share no eight-word run with the skill')


def check_record(repo, ventures, errors):
    path = repo / 'state' / 'candidates' / f'{NAME}.yaml'
    if not path.is_file():
        return
    text = path.read_text(encoding='utf-8')
    allowed = sorted(name for name, entry in (ventures or {}).items() if isinstance(entry, dict) and entry.get('allows_ai_people') is True)
    if not allowed and not re.search(r'(?m)^outside_admission:\s*true\s*$', text):
        errors.append(f'state/candidates/{NAME}.yaml must say outside_admission: true while no venture allows AI people')
    for line in ('activation: false', 'release_eligible: false'):
        if not re.search(r'(?m)^' + re.escape(line) + r'\s*$', text):
            errors.append(f'state/candidates/{NAME}.yaml must say {line}')
    if re.search(r'(?m)^requested_surfaces:', text):
        errors.append(f'state/candidates/{NAME}.yaml must request no surface')


def run(skill=A.SKILL, repo=A.REPO):
    errors, notes = [], []
    if not (skill / 'SKILL.md').is_file():
        return ['SKILL.md is missing'], notes
    check_manifest(skill, errors)
    check_openai(skill, errors)
    skill_text = '\n'.join(check_text(p, True, errors) for p in skill_files(skill))
    companions = companion_files(skill, repo)
    for path in companions:
        check_text(path, False, errors)
    check_no_history(skill, companions, errors)
    check_looks(skill, errors)
    ventures = check_rules(skill, errors)
    check_consent(skill, errors, notes)
    check_denied_set(repo, errors, notes)
    check_record(repo, ventures, errors)
    check_evals(repo, skill_text, errors, notes)
    notes.append(f'scanned {len(skill_files(skill))} skill files and {len(companions)} companion files')
    return errors, notes


def main(cli_args=None):
    cli = argparse.ArgumentParser(description='The ugc-avatar gate. It reads and reports; it writes nothing.')
    cli.add_argument('--base', help='accepted for the harness runner; this skill has no append-only data')
    args = cli.parse_args(cli_args)
    errors, notes = run()
    if args.base:
        notes.append('--base: this skill keeps no append-only data, so there is nothing to compare')
    if errors:
        print('UGC-AVATAR VALIDATION FAILED', file=sys.stderr)
        print('\n'.join(f'- {e}' for e in errors), file=sys.stderr)
        return 1
    print('UGC-AVATAR VALIDATION PASSED')
    for note in notes:
        print(note)
    return 0


if __name__ == '__main__':
    sys.exit(main())
