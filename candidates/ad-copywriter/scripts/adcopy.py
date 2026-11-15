#!/usr/bin/env python3
"""ad-copywriter's shared code: the swipe file, the variation lint, and the words the gate refuses.

  python scripts/adcopy.py lint SET.json [--swipe PATH]

`lint` checks one set of caption variations against the method (`references/method.md`) and, when the
venture's swipe file is given and present, against it. It reads and reports. It never writes the swipe
file, and never posts, boosts, schedules or spends.

A set file is one JSON object:

  {"set": "<name>", "venture": "<venture>",
   "creative_read": {"0": "...", "1": "...", "2": "...", "3": "..."},
   "variations": [{"id": "A", "text": "...", "angle": "...", "hook": "...", "reader": "...",
                   "borrowed": "SW-004", "took": "<one line: the pattern taken>"}, ...]}

A swipe file is JSON Lines, one entry a line, kept in the venture engine's ignored folder
(`references/swipe-file.md`).
"""
import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys

sys.dont_write_bytecode = True

SCRIPTS = pathlib.Path(__file__).resolve().parent
SKILL = SCRIPTS.parent
REPO = SKILL.parent.parent

EM_DASH = '\u2014'
RUN = 8                  # an eight-word run shared with a swipe entry is copied words, not a borrowed pattern
LENGTH_STEP = 1.25       # each variation at least a quarter longer or shorter than each other one
VARIATIONS = 3
SECONDS = ('0', '1', '2', '3')
SWIPE_ID = re.compile(r'^SW-\d{3,}$')
VARIATION_FIELDS = ('id', 'text', 'angle', 'hook', 'reader', 'borrowed', 'took')
DATE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
SOURCE = re.compile(r'^(?:paste|https:/{2}\S+)$')

# Names and credit phrases Krish ruled out of the OS on 2026-11-15, kept only as SHA-256 digests of the
# phrase lowercased with everything but letters and digits removed, so this file names nothing it guards
# against. The council candidate holds the first copy (candidates/council/scripts/council.py); the gate
# fails when the two sets differ, so they stay one list.
WINDOW = 5
DENIED_DIGESTS = frozenset({
    '9b6e83594613cf9d47fd5bc3445ca5290f778ccb8ea7c6f0f38ff6bf8b026e41',
    '48da3f3b2315292f1f7d1e9efd6afa189c65027c1bb8a8dd301e88af17dfa6d5',
    '12217cbbcf47937981047f88ee5d49a033e9a5ac7d7b2fa7db37d03c937d21c1',
    'b79cecf51da5a2f2dedb509a2648c660663bbd0b86112e40681b22a3182ca701',
    '9391c346ab00531d2471dba8b74a43be5d5c9cc099ef0a070cc7f295733302a8',
    '254b6b11ed72c966b776f2ea142b157152cafa9837948619fb6f638f97bc2ffa',
    'c546b02ff7bd600aaaa4593114afc33b0a5b438924a8a49be6354ff61c9cef25',
    'bbbf7a6412d6d3e8244ac1fda5e35a20037acee661288cb95b7b18cf469980aa',
    '75e18b82feb151243ec83d744d3c75ea1db40a8e527df20d49a96daec7cbe460',
    '92031939e472080381e4cf855eaf1356590ac80ccd1dee6eff4dcf8d6f95abad',
    'f275bd78de35dc72080498f3138cf8503f06734ad8ad61f51105150ccf544943',
    '705f6783ae7662cc73010d2e5089cc8bafa19209195631d8c335be5cc7541e64',
    '1395c6b72ec82140d56b22074c96b66efe8602ddee7890658c23c03fa155bcb2',
    '21dfc18dd04cd6a356e2f1e36e8285bc060a5d589d3ac707e56ac9654903b589',
    'c3ed699683e7e7043cebc5f665f1c4ff6a87df4ee1e21ec52e94c68bf4f6789b',
    '933fd3153f8efe53f4982ca23f4a660336b2a8f8127b0203a84991730e37750a',
    '2d6c1f3fa3c69d96c4b1ce5dbccaf4456ad87bf9462fa774763d1a6fc8fd6304',
    '6dcbac4eaa4198c57e121bf2eca0224a3ecae781430075262a098d5b4bf0e1ef',
    '18379790e161d3e51b837cbaa1d96bf8686eca64d40b9270809a976dec2f93b6',
    'c97708b4e7f8ee1daa26c486ba8d001d8942949309ebc96b1ceb1d75e93ad323',
    '326f5b47c73922d70eb358f519468e1f70a3c0ebfd41e469b5291ac59d9bbb99',
    'a09f4aa06a1e87e1b0e1e04eaad896152f052eee60b60ad95531c8c032df1eec',
    '4862f447f2c7f272fa2f4aaf89dadb3b1ac09105bd5864f8d1a0c9452bb0a226',
    '96d815328a42cb4ef89d5e0b7a1df6be43b484832c83a7b4596d8402c7c0b12b',
    'c1ca06d960d41cd51115898cbefd244c6962562876c2ef09cd8ab6131814cf8c',
    '77c7c1e28410482d448a752d4db26087fe39fae864814bd45ef4b3f946f5acd9',
    '1ad5295183fbcf12851e51bc33ec7bbf229119f38727a4fc09c4d21b9356d643',
    'a44fe9e581135fcf3de452d5526cbf788d93a606329de04ebe2427adcdb32a18',
    'f76e7ae59560f98c234d2326e0c6906374e314a1a993d347543fd6ad03ab5e8c',
})


# ---------------------------------------------------------------- words


def words(text):
    return re.findall(r'[0-9a-z]+', str(text).lower())


def grams(text, n=RUN):
    tokens = words(text)
    return {tuple(tokens[start:start + n]) for start in range(len(tokens) - n + 1)}


def norm(text):
    return ' '.join(words(text))


def denied_runs(text, denied=None):
    """Every run of one to WINDOW words in text whose digest is denied."""
    denied = DENIED_DIGESTS if denied is None else denied
    tokens = words(text)
    found = []
    for start in range(len(tokens)):
        for size in range(1, WINDOW + 1):
            run = tokens[start:start + size]
            if len(run) < size:
                break
            if hashlib.sha256(''.join(run).encode('utf-8')).hexdigest() in denied:
                found.append(' '.join(run))
    return found


def first_line(text):
    for line in str(text).splitlines():
        if line.strip():
            return line
    return ''


# ---------------------------------------------------------------- the swipe file


def git(args, cwd):
    try:
        return subprocess.run(['git', *args], cwd=cwd, capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.SubprocessError):
        return None


def where_problems(path):
    """A swipe file must sit where git ignores it: never committed. Returns (errors, notes)."""
    folder = path.parent if path.parent.is_dir() else pathlib.Path.cwd()
    inside = git(['rev-parse', '--is-inside-work-tree'], folder)
    if inside is None:
        return [], ['git is not available here, so whether the swipe file is ignored was not checked']
    if inside.returncode != 0:
        return [], []
    tracked = git(['ls-files', '--error-unmatch', str(path)], folder)
    if tracked is not None and tracked.returncode == 0:
        return [f'the swipe file {path} is committed; it lives only in the engine\'s ignored folder'], []
    ignored = git(['check-ignore', '-q', str(path)], folder)
    if ignored is not None and ignored.returncode != 0:
        return [f'the swipe file {path} is not ignored by git, so it could be committed; move it to the engine\'s ignored folder'], []
    return [], []


def entry_problems(entry, line):
    out = []
    if not isinstance(entry, dict):
        return [f'swipe line {line}: not an object']
    ident = entry.get('id')
    label = ident if isinstance(ident, str) else f'line {line}'
    if not isinstance(ident, str) or not SWIPE_ID.match(ident):
        out.append(f'swipe {label}: id must look like SW-001 (an id, never a name)')
    if not isinstance(entry.get('copy'), str) or not entry['copy'].strip():
        out.append(f'swipe {label}: copy is empty')
    if not isinstance(entry.get('captured'), str) or not DATE.match(entry['captured']):
        out.append(f'swipe {label}: captured must be YYYY-MM-DD')
    if not isinstance(entry.get('source'), str) or not SOURCE.match(entry['source']):
        out.append(f'swipe {label}: source must be paste or the public page it was read on')
    days = entry.get('running_days')
    if days is not None and (isinstance(days, bool) or not isinstance(days, int) or days < 0):
        out.append(f'swipe {label}: running_days must be a whole number of days, or null when the page does not say')
    return out


def load_swipe(path):
    """(entries, errors, notes). A missing file is skipped and said, never an error."""
    if path is None:
        return None, [], ['no swipe file was named, so the overlap check and the borrowed-id check were skipped']
    path = pathlib.Path(path)
    if not path.is_file():
        return None, [], [f'no swipe file at {path}, so the overlap check and the borrowed-id check were skipped']
    errors, notes = where_problems(path)
    entries, seen = [], set()
    for number, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if not line.strip():
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            errors.append(f'swipe line {number}: not valid JSON')
            continue
        problems = entry_problems(entry, number)
        errors += problems
        if not problems:
            if entry['id'] in seen:
                errors.append(f'swipe {entry["id"]}: the id is used twice')
            seen.add(entry['id'])
            entries.append(entry)
    notes.append(f'swipe file: {len(entries)} entries read from {path}')
    return entries, errors, notes


def overlap(text, entries):
    """The ids of the swipe entries that share an eight-word run with text."""
    mine = grams(text)
    return [e['id'] for e in entries if mine & grams(e['copy'])]


# ---------------------------------------------------------------- the lint


def lint(doc, entries=None):
    """Every way one set of variations breaks the method. entries is None when no swipe file was read."""
    errors = []
    if not isinstance(doc, dict):
        return ['the set must be a JSON object']
    for field in ('set', 'venture'):
        if not isinstance(doc.get(field), str) or not doc[field].strip():
            errors.append(f'the set needs {field}')
    read = doc.get('creative_read')
    if not isinstance(read, dict) or any(not isinstance(read.get(s), str) or not read[s].strip() for s in SECONDS):
        errors.append('the creative read must say what seconds 0, 1, 2 and 3 show, one line each')
    found = doc.get('variations')
    if not isinstance(found, list):
        return errors + ['the set needs a variations list']
    if len(found) < VARIATIONS:
        errors.append(f'a set holds {VARIATIONS} variations; found {len(found)}')
    good = []
    for number, v in enumerate(found, 1):
        label = v.get('id') if isinstance(v, dict) and isinstance(v.get('id'), str) else f'#{number}'
        if not isinstance(v, dict):
            errors.append(f'variation {label}: not an object')
            continue
        empty = [f for f in VARIATION_FIELDS if not isinstance(v.get(f), str) or not v[f].strip()]
        if empty:
            errors.append(f'variation {label}: needs {", ".join(empty)}')
            continue
        if not SWIPE_ID.match(v['borrowed']):
            errors.append(f'variation {label}: borrowed must be a swipe entry id like SW-004, never a name')
        elif entries is not None and v['borrowed'] not in {e['id'] for e in entries}:
            errors.append(f'variation {label}: borrowed {v["borrowed"]} is not in the swipe file')
        if EM_DASH in v['text']:
            errors.append(f'variation {label}: has an em dash')
        if entries is not None:
            for ident in overlap(v['text'], entries):
                errors.append(f'variation {label}: shares an eight-word run with {ident}; borrow its pattern, never its words')
        good.append(v)
    ids = [v['id'] for v in good]
    if len(ids) != len(set(ids)):
        errors.append('every variation needs its own id')
    for i, a in enumerate(good):
        for b in good[i + 1:]:
            pair = f'variations {a["id"]} and {b["id"]}'
            for field in ('angle', 'hook', 'reader'):
                if norm(a[field]) == norm(b[field]):
                    errors.append(f'{pair} have the same {field}')
            la, lb = words(first_line(a['text'])), words(first_line(b['text']))
            if la == lb or la[:3] == lb[:3]:
                errors.append(f'{pair} open the same way; each hook needs its own first line')
            na, nb = len(words(a['text'])), len(words(b['text']))
            if min(na, nb) == 0 or max(na, nb) < LENGTH_STEP * min(na, nb):
                errors.append(f'{pair} are about the same length ({na} and {nb} words); '
                              'make each at least a quarter longer or shorter')
            if grams(a['text']) & grams(b['text']):
                errors.append(f'{pair} share an eight-word run; they are one variation written twice')
    return errors


def main(cli_args=None):
    cli = argparse.ArgumentParser(description='Lint one set of caption variations. It reads and reports; it writes nothing.')
    sub = cli.add_subparsers(dest='cmd', required=True)
    one = sub.add_parser('lint')
    one.add_argument('file')
    one.add_argument('--swipe', help='the venture engine\'s swipe file, in its ignored folder')
    args = cli.parse_args(cli_args)
    try:
        doc = json.loads(pathlib.Path(args.file).read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as exc:
        print(f'AD COPY LINT FAILED\n- cannot read {args.file}: {exc}', file=sys.stderr)
        return 1
    entries, errors, notes = load_swipe(args.swipe)
    errors += lint(doc, entries)
    if errors:
        print('AD COPY LINT FAILED', file=sys.stderr)
        print('\n'.join(f'- {e}' for e in errors), file=sys.stderr)
        for note in notes:
            print(note, file=sys.stderr)
        return 1
    print(f'AD COPY LINT PASSED: {doc.get("set")}, {len(doc.get("variations") or [])} variations')
    for note in notes:
        print(note)
    return 0


if __name__ == '__main__':
    sys.exit(main())
