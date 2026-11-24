#!/usr/bin/env python3
"""Check one insight sheet (insight-sheet/1). It reads and reports; it writes nothing.

  python scripts/validate_sheet.py <sheet.json>
  python scripts/validate_sheet.py <sheet.json> --print-sha    print the sheet_sha256 the sheet should carry

Standard library only, so any engine can copy the rules or call it. It checks every rule in
references/insight-sheet.schema.json by hand, then the rules a schema cannot hold:

  - the stall is the idea or measurement (otherwise the desk stops and makes no sheet);
  - at U4 with no current reading, every idea is a measurement idea;
  - chosen_insight points at an insight, and every idea's method is in references/methods-by-category.md;
  - methods_used names three to five methods from at least three categories, and holds every idea's method;
  - idea ids are unique, and no idea restates or closely paraphrases a discarded obvious idea;
  - a passing analogue was read on the day the sheet was made;
  - a lead exists only when both blind passes pick it, the two orders are shuffled, and every
    one of the lead's tests passed, with its analogue linked and read;
  - no test, consult or key carries a numeric score, and no text carries one in words (9/10, scored 8,
    ranked first, 40 points);
  - no blind reader is named as the writer of the ideas;
  - sheet_sha256 is the SHA-256 of the canonical sheet without that field.

Exit 0 means valid, 1 means invalid (each reason printed), 2 means the file could not be read.
"""
import argparse
import datetime
import difflib
import hashlib
import json
import pathlib
import re
import sys

sys.dont_write_bytecode = True

SKILL = pathlib.Path(__file__).resolve().parent.parent
METHODS_FILE = SKILL / 'references' / 'methods-by-category.md'

TOP_KEYS = ('schema', 'venture', 'repo', 'harness_skill_sha', 'made_at', 'north_star', 'stall_check',
            'insights', 'chosen_insight', 'discarded_obvious', 'methods_used', 'ideas', 'consults', 'lead',
            'blind_passes', 'sheet_sha256')
DIAGNOSES = ('idea', 'distribution', 'offer', 'attribution', 'measurement')
LEVELS = ('execution', 'campaign', 'platform', 'business', 'measurement')
TEST_KEYS = ('specificity', 'share', 'analogue', 'floor', 'kill_the_favourite')
RESULTS = ('pass', 'fail', 'unavailable')
CONSULT_RESULTS = ('pass', 'flagged', 'unavailable')
ENGINES = ('divergent-thinker', 'humour-engine')
IDEA_KEYS = ('id', 'claim', 'mechanic', 'idea_level', 'method', 'channel_role', 'conversion_path',
             'kill_condition', 'tests')
ID_RE = re.compile(r'^[a-z0-9][a-z0-9-]{0,39}$')
REPO_RE = re.compile(r'^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')
SHA1_RE = re.compile(r'^[0-9a-f]{40}$')
SHA256_RE = re.compile(r'^[0-9a-f]{64}$')
EM_DASH = chr(0x2014)
SCORE_KEY = re.compile(r'(?i)^(score|scores|rating|points|weight|weighted_total|total)$')
SCORE_TEXT = (
    re.compile(r'(?i)\b\d+(?:\.\d+)?\s*(?:/|out of)\s*\d+\b'),
    re.compile(r'(?i)\b(?:scored?|scores|scoring|rated|rating|graded?)\b[^.;]*?\d'),
    re.compile(r'(?i)\branked\s+(?:#?\d+|first|second|third|top|last|highest|lowest)\b'),
    re.compile(r'(?i)\b\d+(?:\.\d+)?\s*(?:points|pts|stars)\b'),
)
WRITER_RE = re.compile(r'(?i)\b(?:writer|author|wrote|written|self|myself|same)\b')
WORD_RE = re.compile(r'[a-z0-9]+')
STOP_WORDS = frozenset('a an the and or of to for in on at by with from is are be it its this that'.split())
NEAR_RATIO = 0.8
NEAR_OVERLAP = 0.7


def method_categories():
    """Map each method id in references/methods-by-category.md to its category heading."""
    found, category = {}, None
    for line in METHODS_FILE.read_text(encoding='utf-8').splitlines():
        if line.startswith('## '):
            category = line[3:].strip()
        match = re.match(r'^### `([a-z0-9-]+)`', line)
        if match and category:
            found[match.group(1)] = category
    return found


def known_methods():
    return set(method_categories())


def plain_words(text):
    return [w for w in WORD_RE.findall(str(text).lower()) if w not in STOP_WORDS]


def near_match(claim, obvious):
    """True when a claim restates an obvious idea, word for word or as a close paraphrase."""
    a, b = plain_words(claim), plain_words(obvious)
    if not a or not b:
        return False
    if ' '.join(a) == ' '.join(b):
        return True
    if difflib.SequenceMatcher(None, ' '.join(a), ' '.join(b)).ratio() >= NEAR_RATIO:
        return True
    small, large = (set(a), set(b)) if len(set(a)) <= len(set(b)) else (set(b), set(a))
    return len(small) >= 3 and len(small & large) / len(small) >= NEAR_OVERLAP and len(large) <= 2 * len(small)


def canonical(sheet):
    body = {k: v for k, v in sheet.items() if k != 'sheet_sha256'}
    return json.dumps(body, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')


def sheet_sha(sheet):
    return hashlib.sha256(canonical(sheet)).hexdigest()


def filled(value):
    return isinstance(value, str) and value.strip() != ''


def is_date(value):
    if not isinstance(value, str):
        return False
    try:
        datetime.date.fromisoformat(value)
        return True
    except ValueError:
        return False


def is_datetime(value):
    if not isinstance(value, str) or 'T' not in value:
        return False
    try:
        datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
        return True
    except ValueError:
        return False


def walk_for_scores(node, where, errors):
    if isinstance(node, dict):
        for key, value in node.items():
            if SCORE_KEY.match(str(key)):
                errors.append(f'{where}.{key}: no scores; the sheet carries results and reasons only')
            walk_for_scores(value, f'{where}.{key}', errors)
    elif isinstance(node, list):
        for i, value in enumerate(node):
            walk_for_scores(value, f'{where}[{i}]', errors)
    elif isinstance(node, str):
        if EM_DASH in node:
            errors.append(f'{where}: carries an em dash')
        if not where.endswith(('.url', '.read_at', '.as_of', '.made_at', '.link', '.ref')):
            for pattern in SCORE_TEXT:
                hit = pattern.search(node)
                if hit:
                    errors.append(f'{where}: no scores; {hit.group(0)!r} reads as a score or ranking')
                    break


def check_test(label, test, errors, analogue=False, made_on=None):
    if not isinstance(test, dict):
        errors.append(f'{label}: missing')
        return
    allowed = {'result', 'reason'} | ({'url', 'read_at'} if analogue else set())
    extra = set(test) - allowed
    if extra:
        errors.append(f'{label}: unexpected fields {", ".join(sorted(extra))}')
    if test.get('result') not in RESULTS:
        errors.append(f'{label}: result must be pass, fail or unavailable (got {test.get("result")!r})')
    if not filled(test.get('reason')):
        errors.append(f'{label}: needs a reason')
    if analogue:
        for key in ('url', 'read_at'):
            if key not in test:
                errors.append(f'{label}: needs {key} (null when none was found)')
        if test.get('result') == 'pass':
            if not filled(test.get('url')):
                errors.append(f'{label}: a passing analogue is linked')
            if not is_date(test.get('read_at')):
                errors.append(f'{label}: a passing analogue records the date it was read')
            elif made_on and test.get('read_at') != made_on:
                errors.append(f'{label}: a passing analogue is read the day the sheet is made ({made_on}), '
                              f'not {test.get("read_at")}')


def check_idea(i, idea, methods, errors, made_on=None):
    label = f'ideas[{i}]'
    if not isinstance(idea, dict):
        errors.append(f'{label}: not an object')
        return
    missing = [k for k in IDEA_KEYS if k not in idea]
    if missing:
        errors.append(f'{label}: missing {", ".join(missing)}')
    extra = set(idea) - set(IDEA_KEYS)
    if extra:
        errors.append(f'{label}: unexpected fields {", ".join(sorted(extra))}')
    if not (isinstance(idea.get('id'), str) and ID_RE.match(idea['id'])):
        errors.append(f'{label}: id must be lower-case letters, digits and hyphens')
    for key in ('claim', 'mechanic', 'channel_role', 'kill_condition'):
        if key in idea and not filled(idea[key]):
            errors.append(f'{label}: {key} is empty')
    if idea.get('idea_level') not in LEVELS:
        errors.append(f'{label}: idea_level must be one of {", ".join(LEVELS)}')
    if idea.get('method') not in methods:
        errors.append(f'{label}: method {idea.get("method")!r} is not in references/methods-by-category.md')
    path = idea.get('conversion_path')
    if not isinstance(path, dict) or not all(filled(path.get(k)) for k in ('offer', 'link', 'why_act')):
        errors.append(f'{label}: an idea with no full conversion path (offer, link, why_act) is held off the sheet')
    elif set(path) - {'offer', 'link', 'why_act'}:
        errors.append(f'{label}: conversion_path has unexpected fields')
    tests = idea.get('tests')
    if not isinstance(tests, dict):
        errors.append(f'{label}: tests missing')
        return
    extra = set(tests) - set(TEST_KEYS)
    if extra:
        errors.append(f'{label}: unexpected tests {", ".join(sorted(extra))}')
    for key in TEST_KEYS:
        check_test(f'{label}.tests.{key}', tests.get(key), errors, analogue=(key == 'analogue'), made_on=made_on)


def check_insight(i, insight, errors):
    label = f'insights[{i}]'
    if not isinstance(insight, dict):
        errors.append(f'{label}: not an object')
        return
    for key in ('audience', 'wants', 'but', 'because'):
        if not filled(insight.get(key)):
            errors.append(f'{label}: {key} is empty')
    extra = set(insight) - {'audience', 'wants', 'but', 'because', 'source', 'read_at', 'assumption'}
    if extra:
        errors.append(f'{label}: unexpected fields {", ".join(sorted(extra))}')
    sourced = 'source' in insight or 'read_at' in insight
    assumed = 'assumption' in insight
    if sourced and assumed:
        errors.append(f'{label}: either a source and read_at, or assumption: true, never both')
    elif assumed:
        if insight['assumption'] is not True:
            errors.append(f'{label}: assumption must be true when present')
    elif not (filled(insight.get('source')) and is_date(insight.get('read_at'))):
        errors.append(f'{label}: needs a source and the date it was read, or assumption: true')


def validate(sheet):
    errors = []
    if not isinstance(sheet, dict):
        return ['the sheet is not a JSON object']
    missing = [k for k in TOP_KEYS if k not in sheet]
    if missing:
        errors.append(f'missing {", ".join(missing)}')
    extra = set(sheet) - set(TOP_KEYS)
    if extra:
        errors.append(f'unexpected fields {", ".join(sorted(extra))}')
    if sheet.get('schema') != 'insight-sheet/1':
        errors.append('schema must be insight-sheet/1')
    if not filled(sheet.get('venture')):
        errors.append('venture is empty')
    if not (isinstance(sheet.get('repo'), str) and REPO_RE.match(sheet['repo'])):
        errors.append('repo must be owner/name')
    if not (isinstance(sheet.get('harness_skill_sha'), str) and SHA1_RE.match(sheet['harness_skill_sha'])):
        errors.append('harness_skill_sha must be the 40-character commit the skill was read at')
    made_on = None
    if not is_datetime(sheet.get('made_at')):
        errors.append('made_at must be an ISO date-time')
    else:
        made_on = sheet['made_at'][:10]

    ns = sheet.get('north_star')
    urgency, current = None, None
    if not isinstance(ns, dict) or set(ns) != {'metric', 'urgency', 'current', 'as_of'}:
        errors.append('north_star needs exactly metric, urgency, current and as_of')
    else:
        urgency, current = ns.get('urgency'), ns.get('current')
        if not filled(ns.get('metric')):
            errors.append('north_star.metric is empty')
        if not (isinstance(urgency, int) and not isinstance(urgency, bool) and 1 <= urgency <= 5):
            errors.append('north_star.urgency must be 1 to 5')
        if current is not None and (isinstance(current, bool) or not isinstance(current, (int, float))):
            errors.append('north_star.current must be a number or null')
        if ns.get('as_of') is not None and not is_date(ns.get('as_of')):
            errors.append('north_star.as_of must be a date or null')

    stall = sheet.get('stall_check')
    diagnosis = None
    if not isinstance(stall, dict) or set(stall) != {'diagnosis', 'evidence'}:
        errors.append('stall_check needs exactly diagnosis and evidence')
    else:
        diagnosis = stall.get('diagnosis')
        if diagnosis not in DIAGNOSES:
            errors.append(f'stall_check.diagnosis must be one of {", ".join(DIAGNOSES)}')
        elif diagnosis not in ('idea', 'measurement'):
            errors.append(f'the stall is {diagnosis}, not the idea; the desk stops and makes no sheet')
        if not filled(stall.get('evidence')):
            errors.append('stall_check.evidence is empty')

    insights = sheet.get('insights')
    if not isinstance(insights, list) or not 1 <= len(insights) <= 3:
        errors.append('insights must hold one to three lines')
        insights = insights if isinstance(insights, list) else []
    for i, insight in enumerate(insights):
        check_insight(i, insight, errors)
    chosen = sheet.get('chosen_insight')
    if not (isinstance(chosen, int) and not isinstance(chosen, bool) and 0 <= chosen < len(insights)):
        errors.append('chosen_insight must point at one of the insights')

    obvious = sheet.get('discarded_obvious')
    if not (isinstance(obvious, list) and len(obvious) == 3 and all(filled(o) for o in obvious)):
        errors.append('discarded_obvious must hold exactly three ideas')
        obvious = []

    categories = method_categories()
    methods = set(categories)
    used = sheet.get('methods_used')
    if not (isinstance(used, list) and 3 <= len(used) <= 5 and all(isinstance(m, str) for m in used)
            and len(set(used)) == len(used)):
        errors.append('methods_used must name three to five different methods')
        used = used if isinstance(used, list) else []
    unknown = [m for m in used if m not in methods]
    if unknown:
        errors.append(f'methods_used: {", ".join(map(str, unknown))} not in references/methods-by-category.md')
    if len({categories[m] for m in used if m in categories}) < 3:
        errors.append('methods_used: the methods come from at least three different categories')
    ideas = sheet.get('ideas')
    if not isinstance(ideas, list) or not 1 <= len(ideas) <= 3:
        errors.append('ideas must hold one to three ideas')
        ideas = ideas if isinstance(ideas, list) else []
    for i, idea in enumerate(ideas):
        check_idea(i, idea, methods, errors, made_on)
        if isinstance(idea, dict) and idea.get('method') in methods and idea.get('method') not in used:
            errors.append(f'ideas[{i}]: method {idea.get("method")} is not in methods_used')
    by_id = {idea.get('id'): idea for idea in ideas if isinstance(idea, dict)}
    if len(by_id) != len(ideas):
        errors.append('idea ids must be unique')
    for idea in by_id.values():
        for o in obvious:
            if near_match(idea.get('claim', ''), o):
                errors.append(f'idea {idea.get("id")}: restates a discarded obvious idea ({o!r})')
                break

    if diagnosis == 'measurement' or (urgency == 4 and current is None):
        for idea in by_id.values():
            if idea.get('idea_level') != 'measurement':
                errors.append(f'idea {idea.get("id")}: nothing is measured, so every idea is a measurement idea')

    consults = sheet.get('consults')
    if not isinstance(consults, list):
        errors.append('consults must be a list (empty when no engine was called)')
        consults = []
    for i, consult in enumerate(consults):
        if not isinstance(consult, dict) or set(consult) != {'engine', 'op', 'result', 'ref'}:
            errors.append(f'consults[{i}]: needs exactly engine, op, result and ref')
            continue
        if consult['engine'] not in ENGINES:
            errors.append(f'consults[{i}]: engine must be one of {", ".join(ENGINES)}')
        if consult['result'] not in CONSULT_RESULTS:
            errors.append(f'consults[{i}]: result must be pass, flagged or unavailable; exit 2 is unavailable, never pass')
        if not filled(consult['op']) or not filled(consult['ref']):
            errors.append(f'consults[{i}]: op and ref are filled')

    passes = sheet.get('blind_passes')
    if not isinstance(passes, list) or len(passes) != 2:
        errors.append('blind_passes must hold exactly two passes')
        passes = []
    ids = sorted(by_id)
    for i, blind in enumerate(passes):
        if not isinstance(blind, dict) or set(blind) != {'reader', 'order', 'lead'}:
            errors.append(f'blind_passes[{i}]: needs exactly reader, order and lead')
            continue
        if not filled(blind['reader']):
            errors.append(f'blind_passes[{i}]: name the reader')
        if not isinstance(blind['order'], list) or sorted(blind['order']) != ids:
            errors.append(f'blind_passes[{i}]: order must list every idea id once')
        if blind['lead'] is not None and blind['lead'] not in by_id:
            errors.append(f'blind_passes[{i}]: lead is not an idea on the sheet')
    if len(passes) == 2 and all(isinstance(p, dict) for p in passes):
        if len(ids) > 1 and passes[0].get('order') == passes[1].get('order'):
            errors.append('blind_passes: the two orders must be shuffled differently')
        for i, blind in enumerate(passes):
            if isinstance(blind.get('reader'), str) and WRITER_RE.search(blind['reader']):
                errors.append(f'blind_passes[{i}]: the reader is never the writer of the ideas '
                              f'(got {blind["reader"]!r}); name a reader that did not write them')

    lead = sheet.get('lead')
    if lead is not None:
        if lead not in by_id:
            errors.append('lead is not an idea on the sheet')
        else:
            if not passes or any(isinstance(p, dict) and p.get('lead') != lead for p in passes):
                errors.append('lead: both blind passes must pick the same lead; otherwise lead is null')
            tests = by_id[lead].get('tests') or {}
            for key in TEST_KEYS:
                result = (tests.get(key) or {}).get('result')
                if result != 'pass':
                    errors.append(f'lead {lead}: {key} is {result}; an idea leads only when every test passed')

    walk_for_scores(sheet, 'sheet', errors)

    claimed = sheet.get('sheet_sha256')
    if not (isinstance(claimed, str) and SHA256_RE.match(claimed)):
        errors.append('sheet_sha256 must be 64 lower-case hex characters')
    elif claimed != sheet_sha(sheet):
        errors.append('sheet_sha256 does not match the sheet; recompute it with --print-sha')
    return errors


def main(argv=None):
    parser = argparse.ArgumentParser(description='Check an insight sheet (insight-sheet/1).')
    parser.add_argument('sheet')
    parser.add_argument('--print-sha', action='store_true')
    args = parser.parse_args(argv)
    try:
        sheet = json.loads(pathlib.Path(args.sheet).read_text(encoding='utf-8'))
    except (OSError, ValueError) as error:
        print(f'cannot read the sheet: {error}', file=sys.stderr)
        return 2
    if args.print_sha:
        print(sheet_sha(sheet) if isinstance(sheet, dict) else '')
        return 0
    errors = validate(sheet)
    if errors:
        for error in errors:
            print(f'INVALID  {error}')
        return 1
    print(f'VALID insight-sheet/1: {len(sheet["ideas"])} idea(s), lead {sheet["lead"] or "none"}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
