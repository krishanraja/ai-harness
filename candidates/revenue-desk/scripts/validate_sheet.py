#!/usr/bin/env python3
"""Check one revenue sheet (revenue-sheet/1). It reads and reports; it writes nothing.

  python scripts/validate_sheet.py <sheet.json>
  python scripts/validate_sheet.py <sheet.json> --print-sha    print the sheet_sha256 the sheet should carry
  python scripts/validate_sheet.py <sheet.json> --registry <ai-harness>/state/fleet.yaml   outside this checkout

Standard library only, so any engine can call it or copy its rules. It checks the shape in
references/revenue-sheet.schema.json by hand, then the rules in references/rules.md that a schema
cannot hold: blind is never zero, a blind venture never reads on track, measure first stops the
loop, every figure is grounded, private money stays private, the reach check carries its
assumptions and its arithmetic, one test with a stop and a kill rule, offer tests pass the offer
terms and carry dissent, the ask caps, no scores, the day-14 bias, and the hash.

Exit 0 means pass. Exit 1 means held, each reason printed. Exit 2 means unavailable: the file
could not be read or is not a sheet. Exit 2 is never a pass.
"""
import argparse
import datetime
import hashlib
import json
import pathlib
import re
import sys

sys.dont_write_bytecode = True

SCHEMA_ID = 'revenue-sheet/1'
TOP_KEYS = ('schema', 'venture', 'repo', 'harness_skill_sha', 'made_on', 'adapter', 'stage', 'readings',
            'standing', 'constraint', 'reach', 'recalibration', 'test_card', 'offer_terms', 'dissent',
            'ask', 'outcome', 'figures', 'sheet_sha256')
STALE_AFTER_DAYS = 7
STANDINGS = ('blind', 'behind', 'on track', 'clear')
VERDICTS = ('measure-first', 'run')
UNITS = ('count', 'usd', 'rate')
BETTER = ('up', 'down')
SIGHTS = ('fresh', 'blind')
REACH_VERDICTS = ('reachable', 'gap', 'cannot-be-true')
OFFER_RESULTS = ('pass', 'held', 'unavailable', 'not-applicable')
TRIGGERS = ('none', 'sunday-board', 'newly-blind', 'newly-breached')
ASKS_PER_VENTURE_A_WEEK = 1
ASKS_ACROSS_THE_FLEET_A_WEEK = 3
REVIEW_DAYS = (1, 14)
# Repositories whose money never appears outside their owner: the rows of state/fleet.yaml's
# registry marked `figures: private`, the one home of that list (the strategist reads the same
# rows). Read from this checkout, or from --registry; never a copy kept here.
REGISTRY = pathlib.Path(__file__).resolve().parents[3] / 'state' / 'fleet.yaml'
CARD_TEXT = ('step', 'hypothesis', 'variable', 'primary_metric', 'guardrail_metric', 'stop_rule',
             'kill_rule', 'review_date', 'owner')
PROSE = (('stage', 'reason'), ('constraint', 'reason'), ('constraint', 'slice'), ('recalibration', 'reason'),
         ('test_card', 'hypothesis'), ('test_card', 'stop_rule'), ('test_card', 'kill_rule'),
         ('offer_terms', 'reason'), ('dissent', 'words'), ('ask', 'why'))
SHA1_RE = re.compile(r'^[0-9a-f]{40}$')
SHA256_RE = re.compile(r'^[0-9a-f]{64}$')
REPO_RE = re.compile(r'^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')
ID_RE = re.compile(r'^[a-z0-9][a-z0-9_-]{0,39}$')
EM_DASH = chr(0x2014)
SCORE_KEY = re.compile(r'(?i)^(score|scores|rating|ratings|points|weight|weighted_total|rank)$')
SCORE_TEXT = (
    re.compile(r'(?i)\b\d+(?:\.\d+)?\s*(?:/|out of)\s*\d+\b'),
    re.compile(r'(?i)\b(?:scored?|scores|scoring|rated|rating|graded?)\b[^.;]*?\d'),
    re.compile(r'(?i)\b\d+(?:\.\d+)?\s*(?:points|pts|stars)\b'),
)
DATE_IN_TEXT = re.compile(r'\b\d{4}-\d{2}-\d{2}\b')
DURATION_AFTER = re.compile(r'^\s*-?\s*(?:day|days|week|weeks|hour|hours|month|months)\b', re.I)


def canonical(sheet):
    body = {k: v for k, v in sheet.items() if k != 'sheet_sha256'}
    return json.dumps(body, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')


def sheet_sha(sheet):
    return hashlib.sha256(canonical(sheet)).hexdigest()


def filled(value):
    return isinstance(value, str) and value.strip() != ''


def number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def as_date(value):
    if not isinstance(value, str):
        return None
    try:
        return datetime.date.fromisoformat(value[:10])
    except ValueError:
        return None


def private_figures(text):
    """The registry names (and aliases) marked `figures: private`. Standard library only, so it reads
    the registry's own two-space row layout; an empty answer is an error, never an empty list."""
    names, inside, row = set(), False, None
    for line in text.splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        if not line.startswith(' '):
            inside = line.rstrip() == 'registry:'
            row = None
            continue
        if not inside:
            continue
        m = re.match(r'^  - name: (\S+)\s*$', line)
        if m:
            row = {'names': [m.group(1)], 'private': False}
            continue
        if row is None:
            continue
        m = re.match(r'^    aliases: \[(.*)\]\s*$', line)
        if m:
            row['names'] += [a.strip() for a in m.group(1).split(',') if a.strip()]
        if re.match(r'^    figures: private\s*$', line):
            row['private'] = True
        if row['private']:
            names.update(n.lower() for n in row['names'])
    if not names:
        raise ValueError('state/fleet.yaml marks no registry row figures: private')
    return frozenset(names)


PRIVATE_FIGURES = None


def load_private(path=None):
    global PRIVATE_FIGURES
    PRIVATE_FIGURES = private_figures(pathlib.Path(path or REGISTRY).read_text(encoding='utf-8'))
    return PRIVATE_FIGURES


def repo_private(repo):
    if PRIVATE_FIGURES is None:
        load_private()
    name = str(repo).split('/')[-1].lower()
    return name in PRIVATE_FIGURES


def walk_for_scores(node, where, errors):
    if isinstance(node, dict):
        for key, value in node.items():
            if SCORE_KEY.match(str(key)):
                errors.append(f'{where}.{key}: no scores; the sheet carries readings, verdicts and reasons only')
            walk_for_scores(value, f'{where}.{key}', errors)
    elif isinstance(node, list):
        for n, value in enumerate(node):
            walk_for_scores(value, f'{where}[{n}]', errors)


def known_numbers(sheet):
    """Every figure the sheet itself grounds, so a number in prose can be matched against it."""
    found = set()

    def add(value):
        if number(value):
            found.add(round(float(value), 2))

    for r in sheet.get('readings') or []:
        if isinstance(r, dict):
            add(r.get('value'))
            if number(r.get('share')):
                add(r['share'])
                add(r['share'] * 100)
            if r.get('unit') == 'rate' and number(r.get('value')):
                add(r['value'] * 100)
    for f in sheet.get('figures') or []:
        if isinstance(f, dict):
            add(f.get('value'))
    reach = sheet.get('reach')
    if isinstance(reach, dict):
        for k in ('volume', 'target', 'floor', 'expected', 'stretch'):
            add(reach.get(k))
        for s in reach.get('steps') or []:
            if isinstance(s, dict) and number(s.get('rate')):
                add(s['rate'])
                add(s['rate'] * 100)
        a = reach.get('assumptions')
        if isinstance(a, dict):
            add(a.get('sample'))
            if number(a.get('trust_band')):
                add(a['trust_band'])
                add(a['trust_band'] * 100)
    card = sheet.get('test_card')
    if isinstance(card, dict) and isinstance(card.get('prediction'), dict):
        for k in ('floor', 'expected', 'stretch'):
            add(card['prediction'].get(k))
    return found


def ungrounded_in(text, grounded):
    """Numbers in prose that the sheet does not ground. Dates and durations ("7 days") are not figures."""
    stripped = DATE_IN_TEXT.sub(' ', text)
    out = []
    for match in re.finditer(r'\$?(\d[\d,]*(?:\.\d+)?)(%?)', stripped):
        start = match.start()
        if start > 0 and (stripped[start - 1].isalnum() or stripped[start - 1] in '.-'):
            continue
        if DURATION_AFTER.match(stripped[match.end():]):
            continue
        try:
            value = round(float(match.group(1).replace(',', '')), 2)
        except ValueError:
            continue
        if value not in grounded:
            out.append(match.group(0))
    return out


def check_shape(sheet, errors):
    if not isinstance(sheet, dict):
        errors.append('the sheet is not an object')
        return False
    missing = [k for k in TOP_KEYS if k not in sheet]
    extra = [k for k in sheet if k not in TOP_KEYS]
    if missing:
        errors.append(f'missing fields: {", ".join(missing)}')
    if extra:
        errors.append(f'fields the schema does not allow: {", ".join(extra)}')
    if sheet.get('schema') != SCHEMA_ID:
        errors.append(f'schema is not {SCHEMA_ID}')
    if not filled(sheet.get('venture')):
        errors.append('venture is empty')
    if not (isinstance(sheet.get('repo'), str) and REPO_RE.match(sheet['repo'])):
        errors.append('repo is not owner/name')
    if not (isinstance(sheet.get('harness_skill_sha'), str) and SHA1_RE.match(sheet['harness_skill_sha'])):
        errors.append('harness_skill_sha is not a 40-character commit sha')
    if as_date(sheet.get('made_on')) is None:
        errors.append('made_on is not a date')
    return not missing


def check_readings(sheet, made_on, private, errors):
    readings = sheet.get('readings')
    if not isinstance(readings, list) or not readings:
        errors.append('readings: at least one step must be listed, blind or not')
        return {}
    by_id = {}
    for n, r in enumerate(readings):
        where = f'readings[{n}]'
        if not isinstance(r, dict):
            errors.append(f'{where} is not an object')
            continue
        rid = r.get('id')
        if not (isinstance(rid, str) and ID_RE.match(rid)):
            errors.append(f'{where}.id is not a step id')
            continue
        if rid in by_id:
            errors.append(f'{where}.id {rid} repeats')
        by_id[rid] = r
        if r.get('unit') not in UNITS:
            errors.append(f'{where}.unit is not one of {", ".join(UNITS)}')
        if r.get('better') not in BETTER:
            errors.append(f'{where}.better is not up or down')
        if not filled(r.get('owner')):
            errors.append(f'{where}.owner: name the repository that owns this reading')
        sight = r.get('sight')
        value = r.get('value')
        if sight not in SIGHTS:
            errors.append(f'{where}.sight is not fresh or blind')
        elif sight == 'blind':
            if value is not None:
                errors.append(f'{where}: a blind reading carries no value; blind is never zero (R01)')
            if not filled(r.get('blind_reason')):
                errors.append(f'{where}: a blind reading needs its reason (R01)')
        else:
            if not filled(r.get('source')):
                errors.append(f'{where}: a fresh reading with no source is ungrounded (R05)')
            read_on = as_date(r.get('as_of'))
            if read_on is None:
                errors.append(f'{where}: a fresh reading with no date is ungrounded (R05)')
            elif made_on:
                age = (made_on - read_on).days
                if age < 0:
                    errors.append(f'{where}: read after the sheet was made')
                elif age > STALE_AFTER_DAYS:
                    errors.append(f'{where}: read {age} days before the sheet, so it is blind, not fresh (R01)')
            if value == 'private':
                if not number(r.get('share')):
                    errors.append(f'{where}: a private figure carries its share of the week\'s target (R06)')
            elif not number(value):
                errors.append(f'{where}: a fresh reading needs a number, or the word private')
            if private and r.get('unit') == 'usd' and number(value):
                errors.append(f'{where}: {sheet.get("repo")} keeps its money private; write private and its share (R06)')
    return by_id


def check_reach(sheet, private, errors):
    reach = sheet.get('reach')
    if reach is None:
        return
    if not isinstance(reach, dict):
        errors.append('reach is not an object')
        return
    a = reach.get('assumptions')
    if not isinstance(a, dict):
        errors.append('reach: no assumption block, so no reach check (R08)')
        return
    if not filled(a.get('rates_source')):
        errors.append('reach.assumptions: rates_source is missing (R08)')
    if not filled(a.get('window')):
        errors.append('reach.assumptions: window is missing (R08)')
    if not (number(a.get('sample')) and a['sample'] > 0):
        errors.append('reach.assumptions: sample size is missing (R08)')
    band = a.get('trust_band')
    if not (number(band) and 0 <= band < 1):
        errors.append('reach.assumptions: trust_band must be between 0 and 1 (R08)')
        band = None
    if private and reach.get('unit') == 'usd':
        errors.append(f'reach: {sheet.get("repo")} keeps its money private; run the reach check in counts (R06)')
    if reach.get('unit') not in UNITS:
        errors.append('reach.unit is not one of count, usd, rate')
    steps = reach.get('steps')
    volume, target = reach.get('volume'), reach.get('target')
    if not (number(volume) and volume >= 0):
        errors.append('reach.volume is not a count')
        return
    if not (number(target) and target > 0):
        errors.append('reach.target is not a positive number')
        return
    if not isinstance(steps, list) or not steps:
        errors.append('reach.steps: the path has no steps')
        return
    expected = float(volume)
    for s in steps:
        rate = s.get('rate') if isinstance(s, dict) else None
        if not (number(rate) and 0 <= rate <= 1):
            errors.append('reach.steps: every rate is between 0 and 1')
            return
        expected *= rate
    if band is None:
        return
    want = {'floor': expected * (1 - band), 'expected': expected, 'stretch': expected * (1 + band)}
    for key, value in want.items():
        if not number(reach.get(key)) or abs(reach[key] - value) > 0.011:
            errors.append(f'reach.{key} is not volume times the rates with the trust band (R09); expected {round(value, 2)}')
    verdict = 'reachable' if expected >= target else 'gap' if want['stretch'] >= target else 'cannot-be-true'
    if reach.get('verdict') != verdict:
        errors.append(f'reach.verdict says {reach.get("verdict")}, the arithmetic says {verdict} (R09)')
    if verdict == 'cannot-be-true':
        rec = sheet.get('recalibration')
        if not (isinstance(rec, dict) and rec.get('proposed_to') == 'Krish' and filled(rec.get('reason'))):
            errors.append('cannot-be-true needs a recalibration proposal to Krish; the desk never edits a target (R10)')


def check_card(sheet, by_id, made_on, private, errors):
    card = sheet.get('test_card')
    if card is None:
        return None
    if not isinstance(card, dict):
        errors.append('test_card is not an object')
        return None
    for key in CARD_TEXT:
        if not filled(card.get(key)):
            errors.append(f'test_card.{key} is missing (R11)')
    variable = card.get('variable')
    if isinstance(variable, list) or (isinstance(variable, str) and re.search(r'(?i)\band\b|;|,', variable)):
        errors.append('test_card.variable: one variable, never a list (R11)')
    step = by_id.get(card.get('step'))
    if card.get('step') and step is None:
        errors.append('test_card.step is not one of the readings')
    elif step is not None and step.get('sight') == 'blind':
        errors.append('test_card.step is blind; restoring it is its owner\'s job, not a test (R03)')
    pred = card.get('prediction')
    if not isinstance(pred, dict) or not all(number(pred.get(k)) for k in ('floor', 'expected', 'stretch')):
        errors.append('test_card.prediction needs floor, expected and stretch (R11)')
    elif not pred['floor'] <= pred['expected'] <= pred['stretch']:
        errors.append('test_card.prediction must run floor <= expected <= stretch (R11)')
    if private and card.get('unit') == 'usd':
        errors.append(f'test_card: {sheet.get("repo")} keeps its money private; predict in counts (R06)')
    if card.get('unit') not in UNITS:
        errors.append('test_card.unit is not one of count, usd, rate')
    review = as_date(card.get('review_date'))
    if review and made_on:
        days = (review - made_on).days
        if not REVIEW_DAYS[0] <= days <= REVIEW_DAYS[1]:
            errors.append(f'test_card.review_date is {days} days out, not 1 to 14 (R11)')
    elif card.get('review_date'):
        errors.append('test_card.review_date is not a date')
    if not isinstance(card.get('touches_offer'), bool):
        errors.append('test_card.touches_offer must say true or false')
    needs_dissent = card.get('touches_offer') is True or card.get('council_unanimous') is True
    if card.get('touches_offer') is True:
        terms = sheet.get('offer_terms') or {}
        if terms.get('result') != 'pass':
            errors.append(f'the test touches the offer and the offer-terms check is {terms.get("result")}, not pass (R12)')
    if needs_dissent:
        dissent = sheet.get('dissent')
        if not (isinstance(dissent, dict) and filled(dissent.get('seat')) and filled(dissent.get('words'))):
            errors.append('this test needs the day\'s dissent, word for word, with its seat (R12)')
    return review


def check_ask(sheet, errors):
    ask = sheet.get('ask')
    if not isinstance(ask, dict):
        errors.append('ask is not an object')
        return
    if not isinstance(ask.get('raise'), bool):
        errors.append('ask.raise must say true or false')
        return
    if ask.get('trigger') not in TRIGGERS:
        errors.append(f'ask.trigger is not one of {", ".join(TRIGGERS)}')
    if not ask['raise']:
        return
    if ask.get('trigger') == 'none':
        errors.append('a raised ask names its trigger: the Sunday board, newly blind or newly breached (R13)')
    if (sheet.get('adapter') or {}).get('held') is True:
        errors.append('the engine is held: its sheet stays local and raises no ask')
    if ask.get('open_ask') is not False:
        errors.append('an ask from this venture is still open, so no new one (R13)')
    venture_n, fleet_n = ask.get('venture_asks_this_week'), ask.get('fleet_asks_this_week')
    if not (isinstance(venture_n, int) and isinstance(fleet_n, int)):
        errors.append('ask: count this week\'s asks before raising one (R13)')
    else:
        if venture_n >= ASKS_PER_VENTURE_A_WEEK:
            errors.append('this venture has had its one ask this week (R13)')
        if fleet_n >= ASKS_ACROSS_THE_FLEET_A_WEEK:
            errors.append('the fleet has had its three asks this week (R13)')
    if ask.get('stage') != 'plan' or ask.get('wall') != 'strategy':
        errors.append('an ask goes as stage plan behind strategy')
    if not filled(ask.get('why')):
        errors.append('ask.why is missing')


def check_outcome(sheet, review, private, errors):
    outcome = sheet.get('outcome')
    if outcome is None:
        return
    card = sheet.get('test_card')
    if not isinstance(card, dict) or not isinstance(outcome, dict):
        errors.append('an outcome needs the test card it scores (R15)')
        return
    if not filled(outcome.get('source')):
        errors.append('outcome.source is missing (R15)')
    read_on = as_date(outcome.get('as_of'))
    if read_on is None:
        errors.append('outcome.as_of is not a date (R15)')
    elif review and read_on < review:
        errors.append('the outcome is read before its review date (R15)')
    actual = outcome.get('actual')
    if actual == 'private':
        return
    if private and card.get('unit') == 'usd':
        errors.append('outcome: private money is written as private (R06)')
    pred = card.get('prediction') or {}
    if not (number(actual) and all(number(pred.get(k)) for k in ('floor', 'expected', 'stretch'))):
        errors.append('outcome.actual is not a number (R15)')
        return
    bias = actual - pred['expected']
    if not number(outcome.get('bias')) or abs(outcome['bias'] - bias) > 0.011:
        errors.append(f'outcome.bias is actual minus expected, {round(bias, 2)} (R15)')
    landed = 'below-floor' if actual < pred['floor'] else 'above-stretch' if actual > pred['stretch'] else 'between'
    if outcome.get('landed') != landed:
        errors.append(f'outcome.landed should be {landed} (R15)')


def validate(sheet):
    errors = []
    if not check_shape(sheet, errors):
        return errors
    made_on = as_date(sheet.get('made_on'))
    private = repo_private(sheet.get('repo'))
    adapter = sheet.get('adapter')
    if not isinstance(adapter, dict) or not filled(adapter.get('path')) or not isinstance(adapter.get('read'), bool):
        errors.append('adapter: name its path and whether it was read')
        adapter = {}
    by_id = check_readings(sheet, made_on, private, errors)
    if adapter.get('read') is False and any(r.get('sight') == 'fresh' for r in by_id.values()):
        errors.append('the adapter was not read, so every step is blind')

    blind = [rid for rid, r in by_id.items() if r.get('sight') == 'blind']
    fresh_counts = [rid for rid, r in by_id.items() if r.get('sight') == 'fresh']
    standing = sheet.get('standing')
    if standing not in STANDINGS:
        errors.append(f'standing is not one of {", ".join(STANDINGS)}')
    elif blind and standing != 'blind':
        errors.append(f'{", ".join(blind)} is blind, so the venture reads blind, never {standing} (R02)')
    elif not blind and standing == 'blind':
        errors.append('standing says blind but no step is blind')

    stage = sheet.get('stage')
    if not isinstance(stage, dict) or stage.get('verdict') not in VERDICTS:
        errors.append('stage.verdict is not measure-first or run')
        stage = {}
    if not isinstance(stage.get('buyer_seen'), bool):
        errors.append('stage.buyer_seen must say true or false')
    must_measure = not fresh_counts or stage.get('buyer_seen') is False
    if stage.get('verdict') == 'run' and must_measure:
        errors.append('no fresh counted step or no buyer seen, so the stage is measure-first (R04)')
    if stage.get('verdict') == 'measure-first':
        for key in ('constraint', 'reach', 'test_card'):
            if sheet.get(key) is not None:
                errors.append(f'a measure-first sheet carries no {key}; the loop stops at the stage check (R04)')
        plan = stage.get('reading_plan')
        if not (isinstance(plan, list) and plan and all(filled(p) for p in plan)):
            errors.append('a measure-first sheet names its reading plan (R04)')

    constraint = sheet.get('constraint')
    if constraint is not None:
        if not isinstance(constraint, dict):
            errors.append('constraint is not an object')
        else:
            step = by_id.get(constraint.get('step'))
            if step is None:
                errors.append('constraint.step is not one of the readings')
            elif step.get('sight') == 'blind':
                errors.append('constraint.step is blind; a blind step is a reading problem, not a constraint (R03, R07)')
            if not filled(constraint.get('slice')):
                errors.append('constraint.slice: name the slice that carries the drop (R07)')

    check_reach(sheet, private, errors)
    review = check_card(sheet, by_id, made_on, private, errors)
    if standing == 'behind' and stage.get('verdict') == 'run' and sheet.get('test_card') is None:
        errors.append('an alarmed venture gets one test card')

    terms = sheet.get('offer_terms')
    if not isinstance(terms, dict) or terms.get('result') not in OFFER_RESULTS:
        errors.append(f'offer_terms.result is not one of {", ".join(OFFER_RESULTS)}')
    check_ask(sheet, errors)
    check_outcome(sheet, review, private, errors)

    figures = sheet.get('figures')
    if not isinstance(figures, list):
        errors.append('figures is not a list')
    else:
        for n, f in enumerate(figures):
            if not isinstance(f, dict) or not number(f.get('value')) and f.get('value') != 'private':
                errors.append(f'figures[{n}] has no value')
                continue
            if not filled(f.get('source')):
                errors.append(f'figures[{n}] {f.get("label")}: no source, so it is held (R05)')
            if as_date(f.get('as_of')) is None:
                errors.append(f'figures[{n}] {f.get("label")}: no date, so it is held (R05)')
            if private and f.get('unit') == 'usd' and number(f.get('value')):
                errors.append(f'figures[{n}] {f.get("label")}: private money is written as private (R06)')

    grounded = known_numbers(sheet)
    for block, key in PROSE:
        node = sheet.get(block)
        text = node.get(key) if isinstance(node, dict) else None
        if not isinstance(text, str):
            continue
        for found in ungrounded_in(text, grounded):
            errors.append(f'{block}.{key}: {found} is not a figure on the sheet; ground it or drop it (R05)')
        for pattern in SCORE_TEXT:
            if pattern.search(text):
                errors.append(f'{block}.{key}: no scores in words (R14)')
                break
        if EM_DASH in text or '!' in text:
            errors.append(f'{block}.{key}: no em dashes or exclamation marks')
    walk_for_scores(sheet, 'sheet', errors)

    sha = sheet.get('sheet_sha256')
    if not (isinstance(sha, str) and SHA256_RE.match(sha)):
        errors.append('sheet_sha256 is not a sha256')
    elif sha != sheet_sha(sheet):
        errors.append('sheet_sha256 does not match the sheet')
    return errors


def main(argv=None):
    parser = argparse.ArgumentParser(description='Check a revenue sheet (revenue-sheet/1).')
    parser.add_argument('sheet')
    parser.add_argument('--print-sha', action='store_true')
    parser.add_argument('--registry', help="ai-harness state/fleet.yaml, when the script runs outside this checkout")
    args = parser.parse_args(argv)
    try:
        load_private(args.registry)
    except (OSError, ValueError) as error:
        print(f'UNAVAILABLE  cannot read which repositories keep their figures private: {error}', file=sys.stderr)
        return 2
    try:
        sheet = json.loads(pathlib.Path(args.sheet).read_text(encoding='utf-8'))
    except (OSError, ValueError) as error:
        print(f'UNAVAILABLE  cannot read the sheet: {error}', file=sys.stderr)
        return 2
    if not isinstance(sheet, dict) or sheet.get('schema') != SCHEMA_ID:
        print(f'UNAVAILABLE  not a {SCHEMA_ID} sheet', file=sys.stderr)
        return 2
    if args.print_sha:
        print(sheet_sha(sheet))
        return 0
    errors = validate(sheet)
    if errors:
        for error in errors:
            print(f'HELD  {error}')
        return 1
    print(f'PASS {SCHEMA_ID}: {sheet["venture"]}, standing {sheet["standing"]}, stage {sheet["stage"]["verdict"]}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
