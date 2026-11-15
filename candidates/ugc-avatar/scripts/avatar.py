#!/usr/bin/env python3
"""ugc-avatar's roller and gates. Nothing here generates, uploads, posts or spends.

  python scripts/avatar.py roll SCRIPT.json --workspace DIR --approval USE.json [--new] [--seed N]
      Pick an AI person's look from the script and keep it in the workspace's history. Needs Krish's
      first yes: an AI person in this named piece.
  python scripts/avatar.py digest QUOTE.json
      The SHA-256 of a quote, the value Krish's yes and the credit reservation must both name.
  python scripts/avatar.py gate LOOK.json QUOTE.json --use USE.json [--reservation R.json] [--approval A.json]
      Is one paid step ready to run? Exit 0 only when every condition holds. It still runs nothing.
  python scripts/avatar.py release FILE --use USE.json --verdict VERDICT.json --approval RELEASE.json
      May the finished file go to the venture's go-live? Needs the judge's pass and Krish's second yes,
      both on this exact file. It still posts nothing.

Krish ruled on 2026-11-15 that AI people may be used anywhere, with his explicit yes before one is used
and again on the finished file before it goes out, and with no AI label anywhere
(references/approval-and-consent.md).

A script file is one JSON object:

  {"venture": "<venture>", "piece": "<piece id>", "script_id": "<id>", "persona": "<persona id>",
   "speaker": {"role": "<what they do in the video>", "age_min": 25, "age_max": 40,
               "setting": "home|outdoor|work", "register": "casual|work|outdoor",
               "presentation": "woman|man|person (optional)",
               "likeness_of": "(only with consent_id)", "consent_id": "(their recorded consent)"},
   "lines": ["<what they say>", ...]}

A yes from Krish is one JSON object:

  first yes:   {"by": "Krish", "stage": "use", "venture": "<venture>", "piece": "<piece id>", "words": "<his words>"}
  on a quote:  {"by": "Krish", "quote_sha256": "<digest>", "words": "<his words>"}
  second yes:  {"by": "Krish", "stage": "release", "piece": "<piece id>", "asset_sha256": "<file sha256>",
                "words": "<his words>"}

The judge's verdict: {"asset_sha256": "<file sha256>", "passed": true, "reviewer": "<who>", "maker": "<who made it>"}.

The roller refuses a roll with no first yes for the piece, a minimum or maximum age under 18, words that
describe a child, a role or line that makes the person a customer, buyer, reviewer or testimonial, a
credential such as a vet, a real person's likeness without their recorded consent, an AI label, and a
workspace git would commit.
"""
import argparse
import datetime
import hashlib
import json
import pathlib
import random
import re
import subprocess
import sys

sys.dont_write_bytecode = True

SCRIPTS = pathlib.Path(__file__).resolve().parent
SKILL = SCRIPTS.parent
REPO = SKILL.parent.parent
REFS = SKILL / 'references'
LOOKS = REFS / 'looks.json'
RULE = REFS / 'approval-and-consent.md'
HISTORY = pathlib.Path('ugc-avatar') / 'history.jsonl'
EM_DASH = chr(0x2014)
ATTRIBUTES = ('presentation', 'hair', 'skin', 'wardrobe', 'setting', 'framing', 'light')
LABEL_FIELDS = ('disclosure', 'label', 'ai_label')
NO_LABEL = 'Krish ruled no AI label anywhere, at any point (Ruling, Krish, 2026-11-15)'
TRIES = 500

# Names and credit phrases Krish ruled out of the OS on 2026-11-15, kept only as SHA-256 digests of the
# phrase lowercased with everything but letters and digits removed, so this file names nothing it guards
# against. The council holds the first copy (skills/council/scripts/council.py); the gate fails when the
# two sets differ, so they stay one list.
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


class Refused(ValueError):
    """A request the roller or a gate will not carry out, with every reason."""

    def __init__(self, reasons):
        self.reasons = list(reasons)
        super().__init__('; '.join(self.reasons))


# ---------------------------------------------------------------- words


def words(text):
    return re.findall(r'[0-9a-z]+', str(text).lower())


def grams(text, n=8):
    tokens = words(text)
    return {tuple(tokens[start:start + n]) for start in range(len(tokens) - n + 1)}


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


def has_phrase(text, phrases):
    """The phrases (each one or more words) that appear in text as whole words."""
    tokens = ' ' + ' '.join(words(text)) + ' '
    return [p for p in phrases if ' ' + ' '.join(words(p)) + ' ' in tokens]


# ---------------------------------------------------------------- data


def load(path):
    return json.loads(pathlib.Path(path).read_text(encoding='utf-8'))


def canonical(obj):
    return json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def digest(quote):
    return hashlib.sha256(canonical(quote).encode('utf-8')).hexdigest()


def file_digest(path):
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()


def rule_status(path=RULE):
    """The first Status line of the approval and consent rule: 'approved', 'draft' or 'missing'."""
    if not pathlib.Path(path).is_file():
        return 'missing'
    match = re.search(r'(?m)^Status:\s*(\w+)', pathlib.Path(path).read_text(encoding='utf-8'))
    return match.group(1).lower() if match else 'missing'


def has_words(approval):
    return isinstance(approval.get('words'), str) and bool(approval['words'].strip())


def use_problems(use, venture, piece):
    """Every reason Krish's first yes does not cover an AI person in this venture's named piece."""
    if not isinstance(use, dict):
        return ['no first yes from Krish: ask him before an AI person is used in this piece, and record his words']
    reasons = []
    if use.get('by') != 'Krish':
        reasons.append('the first yes is not Krish\'s')
    if use.get('stage') != 'use':
        reasons.append('the first yes must be his yes to using an AI person (stage "use")')
    if not isinstance(piece, str) or not piece.strip():
        reasons.append('the work names no piece, so no yes can cover it')
    elif use.get('piece') != piece:
        reasons.append(f'Krish\'s first yes is for another piece ({use.get("piece")!r}, not {piece!r}); a yes covers one piece')
    if use.get('venture') != venture:
        reasons.append(f'Krish\'s first yes is for another venture ({use.get("venture")!r}, not {venture!r})')
    if not has_words(use):
        reasons.append('the first yes needs Krish\'s own words')
    return reasons


def label_problem(script):
    """An AI label anywhere in the script, which Krish ruled out."""
    speaker = script.get('speaker') if isinstance(script.get('speaker'), dict) else {}
    for where in (script, speaker):
        for field in LABEL_FIELDS:
            if where.get(field):
                return f'{NO_LABEL}; take {field} out of the script'
    return ''


def age_bounds(speaker, looks):
    """(low, high), both 18 or over. A bound under 18 is refused, never raised quietly."""
    floor = looks['minimum_age']
    low = speaker.get('age_min', looks['default_age'][0])
    high = speaker.get('age_max', looks['default_age'][1])
    reasons = []
    for name, value in (('age_min', low), ('age_max', high)):
        if isinstance(value, bool) or not isinstance(value, int):
            reasons.append(f'{name} must be a whole number of years')
        elif value < floor:
            reasons.append(f'{name} {value} is under {floor}: every AI person is an adult')
    if not reasons and high < low:
        reasons.append(f'age_max {high} is below age_min {low}')
    if reasons:
        raise Refused(reasons)
    return low, high


# ---------------------------------------------------------------- the workspace


def git(args, cwd):
    try:
        return subprocess.run(['git', *args], cwd=cwd, capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.SubprocessError):
        return None


def workspace_problem(workspace):
    """History stays in the workspace and never reaches a commit: refuse a path git would track."""
    workspace = pathlib.Path(workspace)
    if not workspace.is_dir():
        return f'the workspace {workspace} does not exist'
    inside = git(['rev-parse', '--is-inside-work-tree'], workspace)
    if inside is None or inside.returncode != 0:
        return ''
    ignored = git(['check-ignore', '-q', str(workspace / HISTORY)], workspace)
    if ignored is not None and ignored.returncode != 0:
        return f'{workspace / HISTORY} is not ignored by git, so the history could be committed; use the engine\'s ignored folder'
    return ''


def read_history(workspace):
    path = pathlib.Path(workspace) / HISTORY
    if not path.is_file():
        return []
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


def append_history(workspace, record):
    path = pathlib.Path(workspace) / HISTORY
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('a', encoding='utf-8', newline='\n') as out:
        out.write(json.dumps(record, sort_keys=True) + '\n')


# ---------------------------------------------------------------- the roller


def script_refusals(script, looks, use=None):
    reasons = []
    if not isinstance(script, dict):
        return ['the script must be a JSON object']
    for field in ('venture', 'piece', 'script_id', 'persona'):
        if not isinstance(script.get(field), str) or not script[field].strip():
            reasons.append(f'the script needs {field}')
    speaker = script.get('speaker')
    if not isinstance(speaker, dict):
        return reasons + ['the script needs a speaker']
    reasons += use_problems(use, script.get('venture'), script.get('piece'))
    why = label_problem(script)
    if why:
        reasons.append(why)
    if speaker.get('likeness_of') and not (isinstance(speaker.get('consent_id'), str) and speaker['consent_id'].strip()):
        reasons.append('a real person\'s likeness needs their recorded consent: give its id as consent_id')
    described = ' '.join(str(speaker.get(k, '')) for k in ('role', 'presentation', 'look')) + ' ' + ' '.join(
        str(line) for line in script.get('lines') or [])
    youth = has_phrase(described, looks['youth_words'])
    if youth:
        reasons.append(f'the script describes a child or a young-looking person ({", ".join(youth)}); describe an adult')
    customer = has_phrase(described, looks['customer_words'])
    if customer:
        reasons.append(f'an AI person is never a customer, buyer, reviewer or testimonial ({", ".join(customer)})')
    credential = has_phrase(described, looks['credential_words'])
    if credential:
        reasons.append(f'an AI person never plays a credentialed expert giving advice ({", ".join(credential)})')
    pools = looks['pools']
    for key in ('setting', 'register'):
        pool = 'setting' if key == 'setting' else 'wardrobe'
        if speaker.get(key) not in pools[pool]:
            reasons.append(f'speaker {key} must be one of {", ".join(pools[pool])}')
    if 'presentation' in speaker and speaker['presentation'] not in pools['presentation']:
        reasons.append(f'speaker presentation must be one of {", ".join(pools["presentation"])}')
    try:
        age_bounds(speaker, looks)
    except Refused as exc:
        reasons += exc.reasons
    return reasons


def combination(attributes):
    return tuple(attributes[k] for k in ('presentation', 'hair', 'skin', 'wardrobe', 'setting'))


def roll(script, workspace, use=None, looks=None, new=False, seed=None, today=None):
    """Pick a look for the script's speaker, keep it in the workspace history, and return it."""
    looks = load(LOOKS) if looks is None else looks
    reasons = script_refusals(script, looks, use)
    where = workspace_problem(workspace)
    if where:
        reasons.append(where)
    if reasons:
        raise Refused(reasons)
    history = [h for h in read_history(workspace) if h.get('venture') == script['venture']]
    if not new:
        for earlier in reversed(history):
            if earlier.get('persona') == script['persona']:
                return dict(earlier, reused=True, script_id=script['script_id'], piece=script['piece'])
    speaker, pools = script['speaker'], looks['pools']
    low, high = age_bounds(speaker, looks)
    used = {combination(h['attributes']) for h in history if isinstance(h.get('attributes'), dict)}
    if seed is None:
        seed = int(hashlib.sha256(f'{script["venture"]}|{script["persona"]}|{script["script_id"]}|{len(history)}'.encode()).hexdigest()[:12], 16)
    rng = random.Random(seed)
    for _ in range(TRIES):
        attributes = {
            'presentation': speaker.get('presentation') or rng.choice(pools['presentation']),
            'hair': rng.choice(pools['hair']),
            'skin': rng.choice(pools['skin']),
            'wardrobe': rng.choice(pools['wardrobe'][speaker['register']]),
            'setting': rng.choice(pools['setting'][speaker['setting']]),
            'framing': rng.choice(pools['framing']),
            'light': rng.choice(pools['light']),
        }
        if combination(attributes) not in used:
            break
    else:
        raise Refused(['every look the pools allow for this speaker is already in the history; widen the pools by pull request'])
    age = rng.randint(low, high)
    prompt = (f'An adult {attributes["presentation"]} aged {age}, with {attributes["hair"]} and {attributes["skin"]}, '
              f'wearing {attributes["wardrobe"]}, in {attributes["setting"]}, filmed on {attributes["framing"]} '
              f'in {attributes["light"]}. An ordinary person on an ordinary day: uneven skin, real hair, no model looks.')
    record = {
        'look_id': hashlib.sha256(canonical({'venture': script['venture'], 'persona': script['persona'],
                                             'age': age, 'attributes': attributes}).encode()).hexdigest()[:16],
        'venture': script['venture'], 'piece': script['piece'], 'persona': script['persona'],
        'script_id': script['script_id'], 'rolled_on': (today or datetime.date.today()).isoformat(), 'age': age,
        'attributes': attributes, 'prompt': prompt, 'reused': False,
    }
    if speaker.get('likeness_of'):
        record['likeness_of'] = speaker['likeness_of']
        record['consent_id'] = speaker['consent_id']
    append_history(workspace, record)
    return record


# ---------------------------------------------------------------- the paid-step gate


def gate(look, quote, use=None, reservation=None, approval=None, rule=None):
    """Every reason one paid step may not run. An empty list means ready; this function still runs nothing."""
    rule = rule_status() if rule is None else rule
    reasons = []
    if not isinstance(look, dict) or not isinstance(quote, dict):
        return ['the look and the quote must be JSON objects']
    if rule != 'approved':
        reasons.append(f'the approval and consent rule is {rule}, not approved by Krish')
    reasons += use_problems(use, look.get('venture'), look.get('piece'))
    if any(look.get(field) for field in LABEL_FIELDS):
        reasons.append(f'{NO_LABEL}; roll the look again without one')
    age = look.get('age')
    if isinstance(age, bool) or not isinstance(age, int) or age < 18:
        reasons.append('the look has no adult age; roll it again')
    credits = quote.get('credits')
    if not isinstance(quote.get('provider'), str) or not isinstance(quote.get('item'), str) \
            or isinstance(credits, bool) or not isinstance(credits, (int, float)) or credits <= 0:
        reasons.append('the quote needs a provider, an item and a credit amount above zero')
    want = digest(quote)
    if not isinstance(reservation, dict):
        reasons.append('no credit reservation: reserve the quoted credits first')
    else:
        held = reservation.get('credits')
        if not reservation.get('id'):
            reasons.append('the reservation has no id')
        if reservation.get('quote_sha256') != want:
            reasons.append('the reservation is for a different quote')
        if isinstance(held, bool) or not isinstance(held, (int, float)) or not isinstance(credits, (int, float)) or held < credits:
            reasons.append('the reservation holds fewer credits than the quote')
    if not isinstance(approval, dict):
        reasons.append('no yes from Krish on this quote')
    else:
        if approval.get('by') != 'Krish':
            reasons.append('the approval is not Krish\'s')
        if approval.get('quote_sha256') != want:
            reasons.append('Krish\'s yes is on a different quote')
        if not has_words(approval):
            reasons.append('the approval needs Krish\'s own words')
    return reasons


# ---------------------------------------------------------------- the release gate


def release(asset_sha256, piece, venture, use=None, verdict=None, approval=None, rule=None):
    """Every reason the finished file may not go out. An empty list means ready; this function posts nothing."""
    rule = rule_status() if rule is None else rule
    reasons = []
    if rule != 'approved':
        reasons.append(f'the approval and consent rule is {rule}, not approved by Krish')
    reasons += use_problems(use, venture, piece)
    if not isinstance(verdict, dict):
        reasons.append('no verdict from the independent judge on this file')
    else:
        if verdict.get('passed') is not True:
            reasons.append('the independent judge did not pass this file; it is held with the judge\'s reason')
        if verdict.get('asset_sha256') != asset_sha256:
            reasons.append('the judge\'s verdict is on a different file')
        reviewer, maker = verdict.get('reviewer'), verdict.get('maker')
        if not isinstance(reviewer, str) or not reviewer.strip() or not isinstance(maker, str) or not maker.strip():
            reasons.append('the verdict must name its reviewer and the file\'s maker')
        elif reviewer.strip() == maker.strip():
            reasons.append('the judge must be someone other than the file\'s maker')
    if not isinstance(approval, dict):
        reasons.append('no second yes from Krish: he says yes to the finished file, to his 10/10 bar, before it goes out')
    else:
        if approval.get('by') != 'Krish':
            reasons.append('the second yes is not Krish\'s')
        if approval.get('stage') != 'release':
            reasons.append('the second yes must be his yes to the finished file (stage "release")')
        if approval.get('piece') != piece:
            reasons.append('Krish\'s second yes is for another piece')
        if approval.get('asset_sha256') != asset_sha256:
            reasons.append('Krish\'s second yes is on a different file; an edited file needs a new yes')
        if not has_words(approval):
            reasons.append('the second yes needs Krish\'s own words')
    return reasons


def main(cli_args=None):
    cli = argparse.ArgumentParser(description='ugc-avatar: roll a look, or check a paid step or a release is ready. It generates and posts nothing.')
    sub = cli.add_subparsers(dest='cmd', required=True)
    r = sub.add_parser('roll')
    r.add_argument('script')
    r.add_argument('--workspace', required=True)
    r.add_argument('--approval', help='Krish\'s first yes for this piece')
    r.add_argument('--new', action='store_true', help='a new look even when the persona has one')
    r.add_argument('--seed', type=int)
    d = sub.add_parser('digest')
    d.add_argument('quote')
    g = sub.add_parser('gate')
    g.add_argument('look')
    g.add_argument('quote')
    g.add_argument('--use', help='Krish\'s first yes for this piece')
    g.add_argument('--reservation')
    g.add_argument('--approval', help='Krish\'s yes on this exact quote')
    o = sub.add_parser('release')
    o.add_argument('file')
    o.add_argument('--use', help='Krish\'s first yes for this piece')
    o.add_argument('--verdict', help='the independent judge\'s verdict on this file')
    o.add_argument('--approval', help='Krish\'s second yes, on this exact file')
    args = cli.parse_args(cli_args)
    try:
        if args.cmd == 'roll':
            use = load(args.approval) if args.approval else None
            print(json.dumps(roll(load(args.script), args.workspace, use=use, new=args.new, seed=args.seed), indent=2))
            return 0
        if args.cmd == 'digest':
            print(digest(load(args.quote)))
            return 0
        use = load(args.use) if args.use else None
        if args.cmd == 'gate':
            reasons = gate(load(args.look), load(args.quote), use,
                           load(args.reservation) if args.reservation else None,
                           load(args.approval) if args.approval else None)
            ready = 'READY: every condition holds. This check runs nothing; the generation is a separate, approved step.'
        else:
            second = load(args.approval) if args.approval else None
            named = use if isinstance(use, dict) else second if isinstance(second, dict) else {}
            reasons = release(file_digest(args.file), named.get('piece'), named.get('venture'), use,
                              load(args.verdict) if args.verdict else None, second)
            ready = 'READY: both of Krish\'s yeses and the judge\'s pass are on this file. Going live is the venture\'s own step.'
    except Refused as exc:
        print('REFUSED', file=sys.stderr)
        print('\n'.join(f'- {reason}' for reason in exc.reasons), file=sys.stderr)
        return 1
    except (OSError, json.JSONDecodeError) as exc:
        print(f'REFUSED\n- cannot read an input: {exc}', file=sys.stderr)
        return 1
    if reasons:
        print('NOT READY: nothing may run or go out', file=sys.stderr)
        print('\n'.join(f'- {reason}' for reason in reasons), file=sys.stderr)
        return 1
    print(ready)
    return 0


if __name__ == '__main__':
    sys.exit(main())
